const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');
const models = require('../../../../models');

const schema = {
  body: {
    type: 'object',
    required: ['name', 'templates', 'category_id'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      exclude_package: { type: 'boolean' },
      packages: { type: 'array' },
      forms: { type: 'array' },
      rule_trigger_setting: { type: 'string' },
      rule_trigger_setting_count: { type: 'integer' },
      templates: { type: 'array' },
      category_id: { type: 'string' },
      quick_reply_settings: { type: 'array' },
      is_workflow: { type: 'boolean' },
      workflow_timeout_type: { type: 'string' },
      workflow_timeout_count: { type: 'integer' },
      message_flow_data: { type: 'object' },
      business_account: { type: 'object' },
      message_channel: { type: 'string' },
      is_new_hubspot_form: { type: 'boolean' },
      new_hubspot_form: { type: 'object' },
    },
  },
};

/**
 * Handles the creation of a new automation rule and automation rule template along with its associated templates, packages, and forms.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 *
 * @returns {Promise<void>}
 */

async function handler(request, reply) {
  const {
    name,
    description,
    exclude_package,
    packages,
    forms,
    rule_trigger_setting,
    rule_trigger_setting_count,
    rule,
    templates,
    category_id,
    quick_reply_settings,
    is_workflow,
    message_flow_data,
    business_account,
    messaging_channel,
    workflow_timeout_type,
    workflow_timeout_count,
    is_new_hubspot_form,
    new_hubspot_form,
  } = request.body;

  const transaction = await models.sequelize.transaction();
  try {
    /** Save Rule */
    const ruleId = await createRule(transaction, {
      name,
      description,
      exclude_package,
      rule_trigger_setting,
      rule_trigger_setting_count,
      rule,
      category_id,
      workflow_timeout_type,
      workflow_timeout_count,
    });

    await handleTemplates(transaction, ruleId, {
      templates,
      quick_reply_settings,
      messaging_channel,
      business_account,
      is_workflow,
      message_flow_data,
    });

    await handlePackages(transaction, ruleId, packages);

    await handleForms(
      transaction,
      ruleId,
      forms,
      is_new_hubspot_form,
      new_hubspot_form,
      category_id,
    );

    await transaction.commit();

    const ruleObj = await c.automationRule.findOne({
      automation_rule_id: ruleId,
    });

    h.api.createResponse(
      request,
      reply,
      200,
      { ruleObj },
      'automation-rule-1689818819-save-success',
    );
  } catch (err) {
    await transaction.rollback();
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: '/staff/automation/rules',
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-rule-1689818819-save-failed',
    );
  }
}

/**
 * Description
 * Function to handle form when created manually
 * @async
 * @function
 * @name handleManualHubSpotForm
 * @kind function
 * @param {string} category_id automation category id
 * @param {object} new_hubspot_form new form details
 * @param {string} ruleId automation id
 * @param {any} transaction transaction
 * @returns {Promise<void>}
 */
async function handleManualHubSpotForm(
  category_id,
  new_hubspot_form,
  ruleId,
  transaction,
) {
  // check category for automation
  const category = await c.automationCategory.findOne({
    automation_category_id: category_id,
  });

  // if selected category is found, continue process
  if (h.notEmpty(category)) {
    const agency_id = category?.agency_fk;
    const hubspot_form = await c.hubSpotFormCtlr.findOne({
      agency_fk: agency_id,
      form_id: new_hubspot_form?.form_id,
    });
    let hubspot_form_id;
    if (h.isEmpty(hubspot_form)) {
      // create new hubspot form record in database
      hubspot_form_id = await c.hubSpotFormCtlr.create({
        agency_id,
        form_id: new_hubspot_form?.form_id,
        form_name: new_hubspot_form?.form_name,
        type: 'MANUAL',
      });
    } else {
      // update existing hubspot form with same form id in the database
      hubspot_form_id = await c.hubSpotFormCtlr.update(
        hubspot_form?.hubspot_form_id,
        {
          form_name: new_hubspot_form?.form_name,
        },
      );
    }

    if (h.notEmpty(hubspot_form_id)) {
      // create new rule form
      await c.automationRuleFormCtlr.create(
        {
          automation_rule_fk: ruleId,
          form_fk: hubspot_form_id,
        },
        { transaction },
      );
    }
  } else {
    throw new Error('No category found when creating the automation');
  }
}

/**
 * Creates a new automation rule.
 * @async
 * @function
 * @name createRule
 * @param {any} transaction - The transaction object for database operations.
 * @param {object} ruleData - Contains details of the rule, such as name, description, exclude_package, rule_trigger_setting, rule_trigger_setting_count, rule, category_id, workflow_timeout_type, workflow_timeout_count.
 * @returns {Promise<string>} - The ID of the newly created rule.
 */
async function createRule(transaction, ruleData) {
  const {
    name,
    description,
    exclude_package,
    rule_trigger_setting,
    rule_trigger_setting_count,
    rule,
    category_id,
    workflow_timeout_type,
    workflow_timeout_count,
  } = ruleData;

  return await c.automationRule.create(
    {
      name,
      description,
      exclude_package,
      rule_trigger_setting,
      rule_trigger_setting_count,
      rule_trigger_fk: rule,
      automation_category_fk: category_id,
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
  // set initial template settings
  let templateSettings = initializeTemplateSettings();

  if (h.notEmpty(templates)) {
    // if there are quick reply settings, process adding config
    if (h.notEmpty(quick_reply_settings)) {
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
}

/**
 * Handles form data linked to the rule, including HubSpot forms.
 * @async
 * @function
 * @name handleForms
 * @param {any} transaction - The transaction object for database operations.
 * @param {string} ruleId - The ID of the rule.
 * @param {array} forms - Array of form IDs to be linked to the rule.
 * @param {boolean} is_new_hubspot_form - Flag for new HubSpot form status.
 * @param {object} new_hubspot_form - Details of the new HubSpot form.
 * @param {string} category_id - The category ID for the rule.
 * @returns {Promise<void>}
 */
async function handleForms(
  transaction,
  ruleId,
  forms,
  is_new_hubspot_form,
  new_hubspot_form,
  category_id,
) {
  if (h.cmpBool(is_new_hubspot_form, false) && h.notEmpty(forms)) {
    for (const form of forms) {
      await c.automationRuleFormCtlr.create(
        {
          automation_rule_fk: ruleId,
          form_fk: form,
        },
        { transaction },
      );
    }
  } else if (
    h.cmpBool(is_new_hubspot_form, true) &&
    h.notEmpty(new_hubspot_form)
  ) {
    await handleManualHubSpotForm(
      category_id,
      new_hubspot_form,
      ruleId,
      transaction,
    );
  }
}

module.exports.schema = schema;
module.exports.handler = handler;
