const Sentry = require('@sentry/node');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

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
async function handler (request, reply) {
  const { automation_rule_id } = request.params;
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
    status,
  } = request.body;

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

  await h.database.transaction(async (transaction) => {
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
        templates,
        category_id,
        status,
        workflow_timeout_type,
        workflow_timeout_count,
      },
      { transaction },
    );

    const template_settings = {
      cta_1_response: null,
      trigger_cta_1_options: null,
      cta_1_final_response: null,
      cta_1_option_type: 0,
      cta_2_response: null,
      trigger_cta_2_options: null,
      cta_2_final_response: null,
      cta_2_option_type: 0,
      cta_3_response: null,
      trigger_cta_3_options: null,
      cta_3_final_response: null,
      cta_3_option_type: 0,
      cta_4_response: null,
      trigger_cta_4_options: null,
      cta_4_final_response: null,
      cta_4_option_type: 0,
      cta_5_response: null,
      trigger_cta_5_options: null,
      cta_5_final_response: null,
      cta_5_option_type: 0,
      cta_6_response: null,
      trigger_cta_6_options: null,
      cta_6_final_response: null,
      cta_6_option_type: 0,
      cta_7_response: null,
      trigger_cta_7_options: null,
      cta_7_final_response: null,
      cta_7_option_type: 0,
      cta_8_response: null,
      trigger_cta_8_options: null,
      cta_8_final_response: null,
      cta_8_option_type: 0,
      cta_9_response: null,
      trigger_cta_9_options: null,
      cta_9_final_response: null,
      cta_9_option_type: 0,
      cta_10_response: null,
      trigger_cta_10_options: null,
      cta_10_final_response: null,
      cta_10_option_type: 0,
    };
    if (h.notEmpty(templates)) {
      // Delete rule templates
      await c.automationRuleTemplate.destroyAll(
        {
          automation_rule_fk: automation_rule_id,
        },
        { transaction },
      );
      /** Save new temaplates */
      for (const template of templates) {
        if (!h.isEmpty(quick_reply_settings)) {
          template_settings.cta_1_response =
            !h.isEmpty(quick_reply_settings[0]) &&
            !h.cmpBool(quick_reply_settings[0].enabled, true) &&
            !h.isEmpty(quick_reply_settings[0].cta_response)
              ? quick_reply_settings[0].cta_response
              : null;

          template_settings.trigger_cta_1_options =
            !h.isEmpty(quick_reply_settings[0]) &&
            h.cmpBool(quick_reply_settings[0].enabled, true) &&
            !h.isEmpty(quick_reply_settings[0].cta_template) &&
            !h.isEmpty(quick_reply_settings[0].cta_template.label)
              ? quick_reply_settings[0].cta_template.value.waba_template_id
              : null;

          template_settings.cta_1_final_response =
            !h.isEmpty(quick_reply_settings[0]) &&
            h.cmpBool(quick_reply_settings[0].enabled, true) &&
            !h.isEmpty(quick_reply_settings[0].final_response)
              ? quick_reply_settings[0].final_response
              : null;

          template_settings.cta_1_option_type = 0;

          template_settings.cta_2_response =
            !h.isEmpty(quick_reply_settings[1]) &&
            !h.cmpBool(quick_reply_settings[1].enabled, true) &&
            !h.isEmpty(quick_reply_settings[1].cta_response)
              ? quick_reply_settings[1].cta_response
              : null;

          template_settings.trigger_cta_2_options =
            !h.isEmpty(quick_reply_settings[1]) &&
            h.cmpBool(quick_reply_settings[1].enabled, true) &&
            !h.isEmpty(quick_reply_settings[1].cta_template) &&
            !h.isEmpty(quick_reply_settings[1].cta_template.label)
              ? quick_reply_settings[1].cta_template.value.waba_template_id
              : null;

          template_settings.cta_2_final_response =
            !h.isEmpty(quick_reply_settings[1]) &&
            h.cmpBool(quick_reply_settings[1].enabled, true) &&
            !h.isEmpty(quick_reply_settings[1].final_response)
              ? quick_reply_settings[1].final_response
              : null;

          template_settings.cta_2_option_type = 0;

          template_settings.cta_3_response =
            !h.isEmpty(quick_reply_settings[2]) &&
            !h.cmpBool(quick_reply_settings[2].enabled, true) &&
            !h.isEmpty(quick_reply_settings[2].cta_response)
              ? quick_reply_settings[2].cta_response
              : null;

          template_settings.trigger_cta_3_options =
            !h.isEmpty(quick_reply_settings[2]) &&
            h.cmpBool(quick_reply_settings[2].enabled, true) &&
            !h.isEmpty(quick_reply_settings[2].cta_template) &&
            !h.isEmpty(quick_reply_settings[2].cta_template.label)
              ? quick_reply_settings[2].cta_template.value.waba_template_id
              : null;

          template_settings.cta_3_final_response =
            !h.isEmpty(quick_reply_settings[2]) &&
            h.cmpBool(quick_reply_settings[2].enabled, true) &&
            !h.isEmpty(quick_reply_settings[2].final_response)
              ? quick_reply_settings[2].final_response
              : null;

          template_settings.cta_3_option_type = 0;

          template_settings.cta_4_response =
            !h.isEmpty(quick_reply_settings[3]) &&
            !h.cmpBool(quick_reply_settings[3].enabled, true) &&
            !h.isEmpty(quick_reply_settings[3].cta_response)
              ? quick_reply_settings[3].cta_response
              : null;

          template_settings.trigger_cta_4_options =
            !h.isEmpty(quick_reply_settings[3]) &&
            h.cmpBool(quick_reply_settings[3].enabled, true) &&
            !h.isEmpty(quick_reply_settings[3].cta_template) &&
            !h.isEmpty(quick_reply_settings[3].cta_template.label)
              ? quick_reply_settings[3].cta_template.value.waba_template_id
              : null;

          template_settings.cta_4_final_response =
            !h.isEmpty(quick_reply_settings[3]) &&
            h.cmpBool(quick_reply_settings[3].enabled, true) &&
            !h.isEmpty(quick_reply_settings[3].final_response)
              ? quick_reply_settings[3].final_response
              : null;

          template_settings.cta_4_option_type = 0;

          template_settings.cta_5_response =
            !h.isEmpty(quick_reply_settings[4]) &&
            !h.cmpBool(quick_reply_settings[4].enabled, true) &&
            !h.isEmpty(quick_reply_settings[4].cta_response)
              ? quick_reply_settings[4].cta_response
              : null;

          template_settings.trigger_cta_5_options =
            !h.isEmpty(quick_reply_settings[4]) &&
            h.cmpBool(quick_reply_settings[4].enabled, true) &&
            !h.isEmpty(quick_reply_settings[4].cta_template) &&
            !h.isEmpty(quick_reply_settings[4].cta_template.label)
              ? quick_reply_settings[4].cta_template.value.waba_template_id
              : null;

          template_settings.cta_5_final_response =
            !h.isEmpty(quick_reply_settings[4]) &&
            h.cmpBool(quick_reply_settings[4].enabled, true) &&
            !h.isEmpty(quick_reply_settings[4].final_response)
              ? quick_reply_settings[4].final_response
              : null;

          template_settings.cta_5_option_type = 0;

          template_settings.cta_6_response =
            !h.isEmpty(quick_reply_settings[5]) &&
            !h.cmpBool(quick_reply_settings[5].enabled, true) &&
            !h.isEmpty(quick_reply_settings[5].cta_response)
              ? quick_reply_settings[5].cta_response
              : null;

          template_settings.trigger_cta_6_options =
            !h.isEmpty(quick_reply_settings[5]) &&
            h.cmpBool(quick_reply_settings[5].enabled, true) &&
            !h.isEmpty(quick_reply_settings[5].cta_template) &&
            !h.isEmpty(quick_reply_settings[5].cta_template.label)
              ? quick_reply_settings[5].cta_template.value.waba_template_id
              : null;

          template_settings.cta_6_final_response =
            !h.isEmpty(quick_reply_settings[5]) &&
            h.cmpBool(quick_reply_settings[5].enabled, true) &&
            !h.isEmpty(quick_reply_settings[5].final_response)
              ? quick_reply_settings[5].final_response
              : null;

          template_settings.cta_6_option_type = 0;

          template_settings.cta_7_response =
            !h.isEmpty(quick_reply_settings[6]) &&
            !h.cmpBool(quick_reply_settings[6].enabled, true) &&
            !h.isEmpty(quick_reply_settings[6].cta_response)
              ? quick_reply_settings[6].cta_response
              : null;

          template_settings.trigger_cta_7_options =
            !h.isEmpty(quick_reply_settings[6]) &&
            h.cmpBool(quick_reply_settings[6].enabled, true) &&
            !h.isEmpty(quick_reply_settings[6].cta_template) &&
            !h.isEmpty(quick_reply_settings[6].cta_template.label)
              ? quick_reply_settings[6].cta_template.value.waba_template_id
              : null;

          template_settings.cta_7_final_response =
            !h.isEmpty(quick_reply_settings[6]) &&
            h.cmpBool(quick_reply_settings[6].enabled, true) &&
            !h.isEmpty(quick_reply_settings[6].final_response)
              ? quick_reply_settings[6].final_response
              : null;

          template_settings.cta_7_option_type = 0;

          template_settings.cta_8_response =
            !h.isEmpty(quick_reply_settings[7]) &&
            !h.cmpBool(quick_reply_settings[7].enabled, true) &&
            !h.isEmpty(quick_reply_settings[7].cta_response)
              ? quick_reply_settings[7].cta_response
              : null;

          template_settings.trigger_cta_8_options =
            !h.isEmpty(quick_reply_settings[7]) &&
            h.cmpBool(quick_reply_settings[7].enabled, true) &&
            !h.isEmpty(quick_reply_settings[7].cta_template) &&
            !h.isEmpty(quick_reply_settings[7].cta_template.label)
              ? quick_reply_settings[7].cta_template.value.waba_template_id
              : null;

          template_settings.cta_8_final_response =
            !h.isEmpty(quick_reply_settings[7]) &&
            h.cmpBool(quick_reply_settings[7].enabled, true) &&
            !h.isEmpty(quick_reply_settings[7].final_response)
              ? quick_reply_settings[7].final_response
              : null;

          template_settings.cta_8_option_type = 0;

          template_settings.cta_9_response =
            !h.isEmpty(quick_reply_settings[8]) &&
            !h.cmpBool(quick_reply_settings[8].enabled, true) &&
            !h.isEmpty(quick_reply_settings[8].cta_response)
              ? quick_reply_settings[8].cta_response
              : null;

          template_settings.trigger_cta_9_options =
            !h.isEmpty(quick_reply_settings[8]) &&
            h.cmpBool(quick_reply_settings[8].enabled, true) &&
            !h.isEmpty(quick_reply_settings[8].cta_template) &&
            !h.isEmpty(quick_reply_settings[8].cta_template.label)
              ? quick_reply_settings[8].cta_template.value.waba_template_id
              : null;

          template_settings.cta_9_final_response =
            !h.isEmpty(quick_reply_settings[8]) &&
            h.cmpBool(quick_reply_settings[8].enabled, true) &&
            !h.isEmpty(quick_reply_settings[8].final_response)
              ? quick_reply_settings[8].final_response
              : null;

          template_settings.cta_9_option_type = 0;

          template_settings.cta_10_response =
            !h.isEmpty(quick_reply_settings[9]) &&
            !h.cmpBool(quick_reply_settings[9].enabled, true) &&
            !h.isEmpty(quick_reply_settings[9].cta_response)
              ? quick_reply_settings[9].cta_response
              : null;

          template_settings.trigger_cta_10_options =
            !h.isEmpty(quick_reply_settings[9]) &&
            h.cmpBool(quick_reply_settings[9].enabled, true) &&
            !h.isEmpty(quick_reply_settings[9].cta_template) &&
            !h.isEmpty(quick_reply_settings[9].cta_template.label)
              ? quick_reply_settings[9].cta_template.value.waba_template_id
              : null;

          template_settings.cta_10_final_response =
            !h.isEmpty(quick_reply_settings[9]) &&
            h.cmpBool(quick_reply_settings[9].enabled, true) &&
            !h.isEmpty(quick_reply_settings[9].final_response)
              ? quick_reply_settings[9].final_response
              : null;

          template_settings.cta_10_option_type = 0;
        }
        await c.automationRuleTemplate.create(
          {
            automation_rule_fk: automation_rule_id,
            template_fk: template,
            cta_1_response: template_settings.cta_1_response,
            trigger_cta_1_options: template_settings.trigger_cta_1_options,
            cta_1_final_response: template_settings.cta_1_final_response,
            cta_1_option_type: template_settings.cta_1_option_type,
            cta_2_response: template_settings.cta_2_response,
            trigger_cta_2_options: template_settings.trigger_cta_2_options,
            cta_2_final_response: template_settings.cta_2_final_response,
            cta_2_option_type: template_settings.cta_2_option_type,
            cta_3_response: template_settings.cta_3_response,
            trigger_cta_3_options: template_settings.trigger_cta_3_options,
            cta_3_final_response: template_settings.cta_3_final_response,
            cta_3_option_type: template_settings.cta_3_option_type,
            cta_4_response: template_settings.cta_4_response,
            trigger_cta_4_options: template_settings.trigger_cta_4_options,
            cta_4_final_response: template_settings.cta_4_final_response,
            cta_4_option_type: template_settings.cta_4_option_type,
            cta_5_response: template_settings.cta_5_response,
            trigger_cta_5_options: template_settings.trigger_cta_5_options,
            cta_5_final_response: template_settings.cta_5_final_response,
            cta_5_option_type: template_settings.cta_5_option_type,
            cta_6_response: template_settings.cta_6_response,
            trigger_cta_6_options: template_settings.trigger_cta_6_options,
            cta_6_final_response: template_settings.cta_6_final_response,
            cta_6_option_type: template_settings.cta_6_option_type,
            cta_7_response: template_settings.cta_7_response,
            trigger_cta_7_options: template_settings.trigger_cta_7_options,
            cta_7_final_response: template_settings.cta_7_final_response,
            cta_7_option_type: template_settings.cta_7_option_type,
            cta_8_response: template_settings.cta_8_response,
            trigger_cta_8_options: template_settings.trigger_cta_8_options,
            cta_8_final_response: template_settings.cta_8_final_response,
            cta_8_option_type: template_settings.cta_8_option_type,
            cta_9_response: template_settings.cta_9_response,
            trigger_cta_9_options: template_settings.trigger_cta_9_options,
            cta_9_final_response: template_settings.cta_9_final_response,
            cta_9_option_type: template_settings.cta_9_option_type,
            cta_10_response: template_settings.cta_10_response,
            trigger_cta_10_options:
              template_settings.trigger_cta_10_options,
            cta_10_final_response: template_settings.cta_10_final_response,
            cta_10_option_type: template_settings.cta_10_option_type,
            message_channel: messaging_channel,
            business_account: !h.isEmpty(business_account)
              ? h.cmpStr(messaging_channel, 'whatsapp')
                ? business_account.value.agency_whatsapp_config_id
                : business_account.value.agency_channel_config_id
              : null,
            is_workflow,
            message_flow_data: null,
          },
          { transaction },
        );
      }
    } else {
      await c.automationRuleTemplate.destroyAll(
        {
          automation_rule_fk: automation_rule_id,
        },
        { transaction },
      );
      await c.automationRuleTemplate.create(
        {
          automation_rule_fk: automation_rule_id,
          template_fk: null,
          cta_1_response: template_settings.cta_1_response,
          trigger_cta_1_options: template_settings.trigger_cta_1_options,
          cta_1_final_response: template_settings.cta_1_final_response,
          cta_1_option_type: template_settings.cta_1_option_type,
          cta_2_response: template_settings.cta_2_response,
          trigger_cta_2_options: template_settings.trigger_cta_2_options,
          cta_2_final_response: template_settings.cta_2_final_response,
          cta_2_option_type: template_settings.cta_2_option_type,
          cta_3_response: template_settings.cta_3_response,
          trigger_cta_3_options: template_settings.trigger_cta_3_options,
          cta_3_final_response: template_settings.cta_3_final_response,
          cta_3_option_type: template_settings.cta_3_option_type,
          cta_4_response: template_settings.cta_4_response,
          trigger_cta_4_options: template_settings.trigger_cta_4_options,
          cta_4_final_response: template_settings.cta_4_final_response,
          cta_4_option_type: template_settings.cta_4_option_type,
          cta_5_response: template_settings.cta_5_response,
          trigger_cta_5_options: template_settings.trigger_cta_5_options,
          cta_5_final_response: template_settings.cta_5_final_response,
          cta_5_option_type: template_settings.cta_5_option_type,
          cta_6_response: template_settings.cta_6_response,
          trigger_cta_6_options: template_settings.trigger_cta_6_options,
          cta_6_final_response: template_settings.cta_6_final_response,
          cta_6_option_type: template_settings.cta_6_option_type,
          cta_7_response: template_settings.cta_7_response,
          trigger_cta_7_options: template_settings.trigger_cta_7_options,
          cta_7_final_response: template_settings.cta_7_final_response,
          cta_7_option_type: template_settings.cta_7_option_type,
          cta_8_response: template_settings.cta_8_response,
          trigger_cta_8_options: template_settings.trigger_cta_8_options,
          cta_8_final_response: template_settings.cta_8_final_response,
          cta_8_option_type: template_settings.cta_8_option_type,
          cta_9_response: template_settings.cta_9_response,
          trigger_cta_9_options: template_settings.trigger_cta_9_options,
          cta_9_final_response: template_settings.cta_9_final_response,
          cta_9_option_type: template_settings.cta_9_option_type,
          cta_10_response: template_settings.cta_10_response,
          trigger_cta_10_options: template_settings.trigger_cta_10_options,
          cta_10_final_response: template_settings.cta_10_final_response,
          cta_10_option_type: template_settings.cta_10_option_type,
          message_channel: messaging_channel,
          business_account: !h.isEmpty(business_account)
            ? h.cmpStr(messaging_channel, 'whatsapp')
              ? business_account.value.agency_whatsapp_config_id
              : business_account.value.agency_channel_config_id
            : null,
          is_workflow,
          message_flow_data: JSON.stringify(message_flow_data),
        },
        { transaction },
      );
    }
    if (h.notEmpty(packages)) {
      // Delete rule packages
      await c.automationRulePackage.destroyAll(
        {
          automation_rule_fk: automation_rule_id,
        },
        { transaction },
      );

      /** Save new Packages */
      for (const pckg of packages) {
        await c.automationRulePackage.create(
          {
            automation_rule_fk: automation_rule_id,
            package_fk: pckg,
          },
          { transaction },
        );
      }
    }

    if (h.notEmpty(forms)) {
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
  });

  try {
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
    request.log.error({
      error: err,
      url: "/staff/automation/rule/:automation_rule_id"
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

module.exports.handler = handler;
