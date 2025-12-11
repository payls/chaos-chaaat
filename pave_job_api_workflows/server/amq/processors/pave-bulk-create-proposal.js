const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const h = require('../../helpers');
const c = require('../../controllers');

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: bulkProposalData } = JSON.parse(data.content.toString());
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  const campaignCtaCtl =
    require('../../controllers/campaignCta').makeController(models);
  const transaction = await models.sequelize.transaction();
  try {
    const {
      contact_ids,
      assigned_tracker_ref_name,
      campaign_name,
      campaign_name_label,
      agency_id,
      user_id,
      whatsApp,
      trigger_quick_reply,
      templates,
      automations,
      is_template,
      selected_waba_credentials_id,
      cta_response,
      cta_settings,
    } = bulkProposalData;

    log.info({
      function: 'paveBulkProposalCreate',
      data: bulkProposalData,
    });

    const { paveCreateProposalQueue, paveCreateProposalRoutingKey } =
      config.amq.keys;
    const { PAVE_CREATE_PROPOSAL } = constant.AMQ.CONSUMER_TYPES;
    const amq_progress_tracker_id = await amqProgressTrackerController.create(
      {
        agency_fk: agency_id,
        type: PAVE_CREATE_PROPOSAL,
        total: contact_ids.length,
      },
      { transaction },
    );

    const campaign_label = !h.isEmpty(campaign_name_label)
      ? campaign_name_label
      : campaign_name;

    const [agency, agencyUser] = await Promise.all([
      models.agency.findOne({
        where: { agency_id },
      }),
      models.agency_user.findOne({
        where: {
          agency_fk: agency_id,
          user_fk: user_id,
        },
      }),
    ]);

    log.info(`Campaign sending data: ${bulkProposalData}`);
    log.info(`Contact IDs: ${contact_ids}`);

    if (Array.isArray(contact_ids)) {
      const broadcast_date = new Date();
      const tracker_ref_name =
        assigned_tracker_ref_name ||
        `${Date.now()}_bulkproposal_${
          agency?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
        }`;
      const cta = [];
      // when campaignType is template
      if (is_template) {
        for (const i in templates) {
          const template = templates[i];
          if (h.cmpBool(template.selected, true)) {
            template.components.forEach((component) => {
              if (h.cmpStr(component.type, 'BUTTONS')) {
                component.buttons.forEach((btn, index) => {
                  if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
                    cta.push(btn.text);
                  }
                });
              }
            });
          }
        }
      }
      // when campaignType is automation
      if (h.isEmpty(templates) && h.notEmpty(automations)) {
        const ctaButtons = await getCTAButtonForFirstAutomationNode({
          automations,
          models,
          log,
        });
        ctaButtons.forEach((item) => {
          cta.push(item);
        });
      }
      if (!h.isEmpty(cta)) {
        // handling settings options
        const template_settings = {};
        if (!h.isEmpty(cta_settings)) {
          for (let i = 0; i < 10; i++) {
            template_settings[`cta_${i + 1}_response`] =
              !h.isEmpty(cta_response[i]) &&
              !h.cmpBool(cta_response[i].enabled, true)
                ? cta_response[i]
                : null;

            template_settings[`trigger_cta_${i + 1}_options`] =
              !h.isEmpty(cta_settings[i]) &&
              h.cmpBool(cta_settings[i].enabled, true) &&
              !h.isEmpty(cta_settings[i].cta_template) &&
              !h.isEmpty(cta_settings[i].cta_template.label)
                ? cta_settings[i].cta_template.value.waba_template_id
                : null;

            template_settings[`cta_${i + 1}_final_response`] =
              !h.isEmpty(cta_settings[i]) &&
              h.cmpBool(cta_settings[i].enabled, true) &&
              !h.isEmpty(cta_settings[i].final_response)
                ? cta_settings[i].final_response
                : null;

            template_settings[`cta_${i + 1}_option_type`] = 0;
          }
        }

        // data to save in campaign_cta table
        const data_to_save = {
          campaign_tracker_ref_name: tracker_ref_name,
        };

        for (let i = 0; i < 10; i++) {
          data_to_save[`cta_${i + 1}`] = !h.isEmpty(cta[i]) ? cta[i] : null;
          data_to_save[`cta_${i + 1}_response`] =
            template_settings[`cta_${i + 1}_response`];
          data_to_save[`trigger_cta_${i + 1}_options`] =
            template_settings[`trigger_cta_${i + 1}_options`];
          data_to_save[`cta_${i + 1}_final_response`] =
            template_settings[`cta_${i + 1}_final_response`];
          data_to_save[`cta_${i + 1}_option_type`] =
            template_settings[`cta_${i + 1}_option_type`];
        }

        log.info(data_to_save);

        await campaignCtaCtl.create(data_to_save, { transaction });
      }

      const current_subscription_product =
        await c.agency.getCurrentSubscription(agency_id);

      for (const contact_id of contact_ids) {
        try {
          await channel.publish(
            paveCreateProposalQueue,
            paveCreateProposalRoutingKey,
            Buffer.from(
              JSON.stringify({
                consumerType: PAVE_CREATE_PROPOSAL,
                data: {
                  campaign_name,
                  campaign_label,
                  contact_id,
                  user_id,
                  agency_user_id: agencyUser.agency_user_id,
                  whatsApp,
                  amq_progress_tracker_id,
                  total: contact_ids.length,
                  agency_id,
                  broadcast_date,
                  tracker_ref_name,
                  trigger_quick_reply,
                  automations,
                  templates,
                  is_template,
                  selected_waba_credentials_id,
                  current_subscription_product,
                },
              }),
            ),
          );
          log.info({
            consumerType: PAVE_CREATE_PROPOSAL,
            data: {
              campaign_name,
              campaign_label,
              contact_id,
              user_id,
              agency_user_id: agencyUser.agency_user_id,
              whatsApp,
              amq_progress_tracker_id,
              total: contact_ids.length,
              agency_id,
              broadcast_date,
              tracker_ref_name,
              trigger_quick_reply,
              templates,
              is_template,
              automations,
              selected_waba_credentials_id,
            },
          });
          log.info(
            `Succeffully requested proposal creation for contact: ${contact_id}`,
          );
        } catch (err) {
          Sentry.captureException(err);
          log.warn(
            `An error requesting proposal creation for contact: ${contact_id}`,
          );
          log.error(
            `Error log for contact ${contact_id} bulk proposal sending: ${err}`,
          );
        }
      }
    }

    await transaction.commit();

    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    Sentry.captureException(err);
    log.error({
      err,
      channel,
    });
    await transaction.rollback();
    await channel.nack(data, false, false);
  }
};

/**
 * Description
 * Extract quick_replies if first node type is message or initial_cta button if node type is booking
 * @async
 * @function
 * @name getCTAButtonForFirstAutomationNode
 * @kind function
 * @param {object} automations array of single object. have category and automation_rule_id as object
 * @param {models} models database models
 * @param {object} log server log
 * @returns {Promise} returns cta buttons array
 */

async function getCTAButtonForFirstAutomationNode({
  automations,
  models,
  log,
}) {
  log.info({
    action: 'PAVE BULK CREATE PROPOSAL',
    function: 'getCTAButtonForFirstAutomationNode',
    data: automations,
  });
  const automation = automations[0];

  const automation_rule_id = automation.automation_rule_id.value;
  const automationTemplate = await c.automationRuleTemplate.findOne({
    automation_rule_fk: automation_rule_id,
  });
  const automation_flow = JSON.parse(automationTemplate.message_flow_data);

  log.info({ message: 'automation_flow', data: automation_flow });

  const parentNodeId = h.automation.getParentNodeId(
    automation_flow.nodes,
    automation_flow.edges,
  );

  log.info({ message: 'parentNodeId', data: parentNodeId });

  const parentNodeIndex = h.automation.getNodeIndexByIdV2(
    parentNodeId,
    automation_flow.nodes,
  );
  const firstNodeData = automation_flow.nodes[parentNodeIndex];

  log.info({ message: 'firstNodeData', data: firstNodeData });

  const nodeType = firstNodeData.type;

  const ctaButtons = [];

  if (h.cmpStr(nodeType, 'message')) {
    const template_id = firstNodeData.data.flowData.template_id;
    if (h.notEmpty(template_id)) {
      const dbTemplate = await models.waba_template.findOne({
        where: {
          template_id,
        },
      });
      const template = JSON.parse(dbTemplate.content);
      template.components.forEach((component) => {
        if (h.cmpStr(component.type, 'BUTTONS')) {
          component.buttons.forEach((btn, index) => {
            if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
              ctaButtons.push(btn.text);
            }
          });
        }
      });
    }
  }
  if (h.cmpStr(nodeType, 'booking')) {
    if (h.notEmpty(firstNodeData?.data?.flowData?.initial_cta_button)) {
      ctaButtons.push(firstNodeData.data.flowData.initial_cta_button);
    }
  }
  return ctaButtons;
}
