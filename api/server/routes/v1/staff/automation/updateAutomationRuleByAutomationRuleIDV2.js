const Sentry = require('@sentry/node');
const sequelize = require('sequelize');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Description
 * Function to update status of custom template which is created in automation workflow
 * @async
 * @function
 * @name updateAutomationCustomTemplateStatus
 * @kind function
 * @param {string} temaplate_id template ID
 * @param {string} status updated status
 */
async function updateAutomationCustomTemplateStatus(template_id, status, log) {
  try {
    // Step 1: Fetch the workflow path
    const results = await models.sequelize.query(
      `SELECT JSON_UNQUOTE(
         JSON_SEARCH(message_flow_data, 'one', '${template_id}', NULL, '$.nodes[*].data.flowData.template_id')
       ) AS path
       FROM automation_rule_template
       WHERE JSON_CONTAINS(
         JSON_EXTRACT(message_flow_data, '$.nodes[*].data.flowData.template_id'),
         '"${template_id}"'
       );`,
      {
        type: sequelize.QueryTypes.SELECT,
      },
    );

    // Step 2: If a path is found, extract the index and run the update
    if (h.notEmpty(results) && h.notEmpty(results[0].path)) {
      const path = results[0].path;
      const indexMatch = path.match(/nodes\[(\d+)\]/);

      if (indexMatch) {
        const index = indexMatch[1];
        // Step 3: Update the JSON field with the correct index
        await models.sequelize.query(
          `UPDATE automation_rule_template
           SET message_flow_data = JSON_SET(
             message_flow_data,
             '$.nodes[${index}].data.flowData.status', 
             '${status}'
           )
           WHERE JSON_CONTAINS(
             JSON_EXTRACT(message_flow_data, '$.nodes[*].data.flowData.template_id'),
             '"${template_id}"'
           );`,
          {
            type: sequelize.QueryTypes.UPDATE,
          },
        );
        log.info('CUSTOM TEMPLATE STATUS UPDATED SUCCESSFULLY');
      }
    }
    return;
  } catch (error) {
    log.error({
      function: 'updateAutomationCustomTemplateStatus',
      error,
    });
    throw new Error('updateAutomationCustomTemplateStatus');
  }
}

/**
 * Description
 * Function to update status of templates with in the workflow
 * @async
 * @function
 * @name syncWorklowTemplates
 * @kind function
 * @param {object} business_account
 * @param {object} message_flow_data flow json
 */
async function syncWorklowTemplates({
  business_account,
  message_flow_data,
  log,
}) {
  const waba = await c.agencyWhatsAppConfig.findOne({
    agency_whatsapp_config_id: business_account.value.agency_whatsapp_config_id,
  });
  const waba_id = waba?.agency_waba_id;
  const credentials = h.notEmpty(waba?.agency_waba_id)
    ? waba?.agency_waba_template_token + ':' + waba?.agency_waba_template_secret
    : null;
  const bufferedCredentials = Buffer.from(credentials, 'utf8').toString(
    'base64',
  );

  const workflowTemplates = message_flow_data?.nodes.filter(
    (node) =>
      h.cmpStr(node.type, 'message') &&
      h.cmpStr(node.data?.flowData?.method, 'custom') &&
      h.notEmpty(node.data?.flowData?.template_id) &&
      node.data?.flowData?.status !== 'APPROVED',
  );

  let templateList = [];
  if (h.notEmpty(workflowTemplates)) {
    const templateListRes = await h.whatsapp.retrieveTemplates({
      waba_id,
      credentials: bufferedCredentials,
      log: null,
    });
    templateList = templateListRes?.templates || [];
  }

  for (const customTemplate of workflowTemplates) {
    const template = templateList.find(
      (ele) => ele.id === customTemplate.data.flowData.template_id,
    );
    const templateStatus = template?.status || 'PENDING';
    // This will update status in waba_template table
    await models.waba_template.update(
      {
        status: templateStatus,
      },
      {
        where: {
          template_id: customTemplate.data.flowData.template_id,
        },
      },
    );
    // This will update status in workflow json in automation_rule_template
    await updateAutomationCustomTemplateStatus(
      customTemplate.data.flowData.template_id,
      templateStatus,
      log,
    );
  }
}

/**
 * Handles the updation of automation rule and automation rule template along with its associated templates, packages, and forms.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 *
 * @returns {Promise<void>}
 */
async function handler(request, reply) {
  const { automation_rule_id } = request.params;
  const {
    name,
    description,
    exclude_package,
    packages = [],
    rule_trigger_setting,
    rule_trigger_setting_count,
    rule,
    is_workflow,
    message_flow_data,
    business_account,
    messaging_channel,
    workflow_timeout_type,
    workflow_timeout_count,
    quick_reply_settings = [],
    forms = [],
    templates = [],
    is_new_hubspot_form,
    new_hubspot_form,
  } = request.body;

  const transaction = await models.sequelize.transaction();

  try {
    const ruleObj = await c.automationRule.findOne(
      {
        automation_rule_id,
      },
      {
        include: [
          {
            model: models.automation_rule_template,
          },
          {
            model: models.automation_rule_packages,
          },
        ],
      },
    );

    if (!ruleObj) {
      // create
      return h.api.createResponse(
        request,
        reply,
        400,
        {
          message: `Invalid Automation Rule`,
        },
        'automation-rules-1689818819-update-failed',
      );
    }

    const automationRuleTemplate =
      ruleObj.automation_rule_templates &&
      ruleObj.automation_rule_templates.length > 0
        ? ruleObj.automation_rule_templates[0]
        : null;

    // update
    await updateRule(transaction, automation_rule_id, {
      name,
      description,
      exclude_package,
      packages,
      rule_trigger_setting,
      rule_trigger_setting_count,
      rule,
      workflow_timeout_type,
      workflow_timeout_count,
    });

    await handleTemplates(transaction, automation_rule_id, {
      templates,
      quick_reply_settings,
      messaging_channel,
      business_account,
      is_workflow,
      message_flow_data,
    });

    await handlePackages(transaction, automation_rule_id, packages);

    await handleForms(
      transaction,
      automation_rule_id,
      forms,
      is_new_hubspot_form,
      new_hubspot_form,
    );

    await transaction.commit();

    const category = await c.automationCategory.findOne({
      automation_category_id: ruleObj.automation_category_fk,
    });

    if (
      h.cmpStr(messaging_channel, 'whatsapp') &&
      h.notEmpty(business_account?.value?.agency_whatsapp_config_id) &&
      h.notEmpty(message_flow_data) &&
      h.notEmpty(automationRuleTemplate) &&
      h.cmpStr(category?.platform, 'CHAAATBUILDER')
    ) {
      request.log.info('START WORKFLOW TEMPLATE SYNC');
      await syncWorklowTemplates({
        business_account,
        message_flow_data,
        log: request.log,
      });
    }

    h.api.createResponse(
      request,
      reply,
      200,
      {
        ruleObj,
      },
      'automation-rules-1689818819-update-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    await transaction.rollback();
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: '/staff/automation/rule/:automation_rule_id/v2',
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-rules-1689818819-update-failed',
    );
  }
}

/**
 * Description
 * Function to handle manual form linking to an existing automation
 * @async
 * @function
 * @name handleAutomationFormUpdateUsingManualForm
 * @kind function
 * @param {string} automation_rule_id automation ID
 * @param {object} new_hubspot_form manual form details
 * @param {object} transaction transaction
 * @returns {Promise<void>}
 */
async function handleAutomationFormUpdateUsingManualForm(
  automation_rule_id,
  new_hubspot_form,
  transaction,
) {
  // get automation ule details based on rule id
  const rule = await c.automationRule.findOne({
    automation_rule_id,
  });

  // get category based in the category linked to the automation rule
  const category = await c.automationCategory.findOne({
    automation_category_id: rule?.automation_category_fk,
  });

  // if category is found, continue process
  if (h.notEmpty(category)) {
    const agency_id = category?.agency_fk;
    const hubspot_form = await c.hubSpotFormCtlr.findOne({
      agency_fk: agency_id,
      form_id: new_hubspot_form?.form_id,
    });
    let hubspot_form_id;
    if (h.isEmpty(hubspot_form)) {
      // create new hubspot form in the database
      hubspot_form_id = await c.hubSpotFormCtlr.create({
        agency_id,
        form_id: new_hubspot_form?.form_id,
        form_name: new_hubspot_form?.form_name,
        type: 'MANUAL',
      });
    } else {
      // update existing hubspot form with same form id
      hubspot_form_id = await c.hubSpotFormCtlr.update(
        hubspot_form?.hubspot_form_id,
        {
          form_name: new_hubspot_form?.form_name,
        },
      );
    }

    if (h.notEmpty(hubspot_form_id)) {
      // Delete rule forms - a new one will be linked
      await c.automationRuleFormCtlr.destroyAll(
        {
          automation_rule_fk: automation_rule_id,
        },
        { transaction },
      );
      // update new rule form by creating the manual form
      await c.automationRuleFormCtlr.create(
        {
          automation_rule_fk: automation_rule_id,
          form_fk: hubspot_form_id,
        },
        { transaction },
      );
    }
  } else {
    throw new Error('No category found when updating the automation');
  }
}

/**
 * Creates a new automation rule.
 * @async
 * @function
 * @name updateRule
 * @param {any} transaction - The transaction object for database operations.
 * @param {string} automation_rule_id - rule id
 * @param {object} ruleData - Contains details of the rule, such as name, description, exclude_package, rule_trigger_setting, rule_trigger_setting_count, rule, category_id, workflow_timeout_type, workflow_timeout_count.
 * @returns {Promise<string>} - The ID of the newly created rule.
 */
async function updateRule(transaction, automation_rule_id, ruleData) {
  const {
    name,
    description,
    exclude_package,
    packages,
    rule_trigger_setting,
    rule_trigger_setting_count,
    rule,
    workflow_timeout_type,
    workflow_timeout_count,
  } = ruleData;

  await c.automationRule.update(
    automation_rule_id,
    {
      name,
      description,
      exclude_package,
      packages,
      rule_trigger_setting,
      rule_trigger_setting_count,
      rule_trigger_fk: rule,
      workflow_timeout_type,
      workflow_timeout_count,
    },
    { transaction },
  );
}

/**
 * Initializes template settings with default values.
 * @function
 * @name initializeTemplateSettings
 * @returns {object} - An object with default template settings.
 */
function initializeTemplateSettings() {
  const templateSettings = {};
  for (let i = 1; i <= 10; i++) {
    templateSettings[`cta_${i}_response`] = null;
    templateSettings[`trigger_cta_${i}_options`] = null;
    templateSettings[`cta_${i}_final_response`] = null;
    templateSettings[`cta_${i}_option_type`] = 0;
  }
  return templateSettings;
}

/**
 * Applies quick reply settings to the template configuration.
 * @function
 * @name applyQuickReplySettings
 * @param {object} templateSettings - The template settings object.
 * @param {array} quick_reply_settings - Array of quick reply settings.
 * @returns {object} - An object with adjusted template settings.
 */
function applyQuickReplySettings(templateSettings, quick_reply_settings) {
  for (let i = 0; i < 10; i++) {
    const setting = quick_reply_settings[i];
    if (h.notEmpty(setting)) {
      templateSettings[`cta_${i + 1}_response`] = h.cmpBool(
        setting.enabled,
        true,
      )
        ? null
        : setting.cta_response || null;
      templateSettings[`trigger_cta_${i + 1}_options`] = h.cmpBool(
        setting.enabled,
        false,
      )
        ? null
        : setting.cta_template?.value.waba_template_id || null;
      templateSettings[`cta_${i + 1}_final_response`] =
        setting.final_response || null;
    }
  }

  return templateSettings;
}

/**
 * Generates automation template rule data for database insertion.
 * @function
 * @name createTemplateData
 * @param {string} ruleId - The ID of the rule.
 * @param {string|null} template - The template ID or null.
 * @param {string} messaging_channel - The channel used for messaging.
 * @param {object} business_account - The business account object.
 * @param {boolean} is_workflow - Workflow status.
 * @param {string|null} message_flow_data - JSON string for message flow data or null.
 * @param {object} templateSettings - Template settings object.
 * @returns {object} - Template data object for insertion.
 */
function getAutomationTemplateRuleData({
  ruleId,
  template,
  messaging_channel,
  business_account,
  is_workflow,
  message_flow_data,
  templateSettings,
}) {
  const businessAccountValue = business_account
    ? h.cmpStr(messaging_channel, 'whatsapp')
      ? business_account.value.agency_whatsapp_config_id
      : business_account.value.agency_channel_config_id
    : null;

  return {
    automation_rule_fk: ruleId,
    template_fk: template,
    message_channel: messaging_channel,
    business_account: businessAccountValue,
    is_workflow,
    message_flow_data,
    ...templateSettings,
  };
}

/**
 * Handles template data creation for automation rules.
 * @async
 * @function
 * @name handleTemplates
 * @param {any} transaction - The transaction object for database operations.
 * @param {string} ruleId - The ID of the rule.
 * @param {object} params - Contains templates, quick_reply_settings, messaging_channel, business_account, is_workflow, message_flow_data.
 * @returns {Promise<void>}
 */
async function handleTemplates(
  transaction,
  ruleId,
  {
    templates,
    quick_reply_settings,
    messaging_channel,
    business_account,
    is_workflow,
    message_flow_data,
  },
) {
  // Delete rule templates
  await c.automationRuleTemplate.destroyAll(
    {
      automation_rule_fk: ruleId,
    },
    { transaction },
  );

  let templateSettings = initializeTemplateSettings();

  if (h.notEmpty(templates)) {
    if (!h.isEmpty(quick_reply_settings)) {
      templateSettings = applyQuickReplySettings(
        templateSettings,
        quick_reply_settings,
      );
    }
    for (const template of templates) {
      const data = getAutomationTemplateRuleData({
        ruleId,
        template,
        messaging_channel,
        business_account,
        is_workflow,
        message_flow_data: null,
        templateSettings,
      });
      await c.automationRuleTemplate.create(data, { transaction });
    }
  } else {
    const data = getAutomationTemplateRuleData({
      ruleId,
      template: null,
      messaging_channel,
      business_account,
      is_workflow,
      message_flow_data: JSON.stringify(message_flow_data),
      templateSettings,
    });
    await c.automationRuleTemplate.create(data, { transaction });
  }
}

/**
 * Handles the insertion of package data linked to the rule.
 * @async
 * @function
 * @name handlePackages
 * @param {any} transaction - The transaction object for database operations.
 * @param {string} ruleId - The ID of the rule.
 * @param {array} packages - Array of package IDs to be linked to the rule.
 * @returns {Promise<void>}
 */
async function handlePackages(transaction, ruleId, packages) {
  if (h.notEmpty(packages)) {
    // Delete rule packages
    await c.automationRulePackage.destroyAll(
      {
        automation_rule_fk: ruleId,
      },
      { transaction },
    );
    /** Save new Packages */
    for (const packageId of packages) {
      await c.automationRulePackage.create(
        {
          automation_rule_fk: ruleId,
          package_fk: packageId,
        },
        { transaction },
      );
    }
  }
  if (h.isEmpty(packages)) {
    await c.automationRulePackage.destroyAll(
      {
        automation_rule_fk: ruleId,
      },
      { transaction },
    );
  }
}

/**
 * Handles form data linked to the rule, including HubSpot forms.
 * @async
 * @function
 * @name handleForms
 * @param {any} transaction - The transaction object for database operations.
 * @param {string} automation_rule_id - The ID of the rule.
 * @param {array} forms - Array of form IDs to be linked to the rule.
 * @param {boolean} is_new_hubspot_form - Flag for new HubSpot form status.
 * @param {object} new_hubspot_form - Details of the new HubSpot form.
 * @returns {Promise<void>}
 */
async function handleForms(
  transaction,
  automation_rule_id,
  forms,
  is_new_hubspot_form,
  new_hubspot_form,
) {
  if (h.cmpBool(is_new_hubspot_form, false) && h.notEmpty(forms)) {
    // Delete rule forms
    await c.automationRuleFormCtlr.destroyAll(
      {
        automation_rule_fk: automation_rule_id,
      },
      { transaction },
    );

    /** Save new forms */
    for (const form of forms) {
      await c.automationRuleFormCtlr.create(
        {
          automation_rule_fk: automation_rule_id,
          form_fk: form,
        },
        { transaction },
      );
    }
  }

  // handling new hubspot form manually added
  if (h.cmpBool(is_new_hubspot_form, true) && h.notEmpty(new_hubspot_form)) {
    await handleAutomationFormUpdateUsingManualForm(
      automation_rule_id,
      new_hubspot_form,
      transaction,
    );
  }
}

module.exports.handler = handler;
