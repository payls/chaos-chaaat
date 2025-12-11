const Promise = require('bluebird');
const Sentry = require('@sentry/node');
const { Op } = require('sequelize');

const constant = require('../../constants/constant.json');
const c = require('../../controllers');
const models = require('../../models');
const ContactService = require('../../services/staff/contact');
const contactService = new ContactService();
const h = require('../../helpers');

/**
 * Description
 * Consumer for handling campaign message sending for each recipient
 *
 * @param {object} data holds campaign creation data for specific contact
 * @param {object} models existing database table models
 * @param {object} channel rabbit mq channel used
 * @param {object} config rabbitmq/amq configuration
 * @param pubChannel
 * @param {object} log server log functions
 */
module.exports = async ({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) => {
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  const { data: proposalData } = JSON.parse(data.content.toString());
  const {
    campaign_name,
    campaign_label,
    user_id,
    contact_id,
    agency_user_id,
    amq_progress_tracker_id,
    agency_id,
    total,
    broadcast_date,
    tracker_ref_name,
    templates,
    selected_waba_credentials_id,
    permalink_template,
    is_confirmation,
    automations,
  } = proposalData;
  try {
    // processing contact owner
    const {
      agency_name,
      agency_subdomain,
      has_contact_owner,
      current_agency_user_id,
      agent_first_name,
      contact,
    } = await processContactOwner({
      agency_id,
      contact_id,
      agency_user_id,
    });

    const campaignType = h.notEmpty(automations) ? 'automation' : 'template';

    let automationData = null;
    // prepare automation data
    if (campaignType === 'automation') {
      if (h.isEmpty(automations)) {
        log.error({
          consumer: 'PAVE_CREATE_PROPOSAL',
          message: 'No automation rule found for campaignType automation',
          data: {
            agency_id,
            tracker_ref_name,
          },
        });
        await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
        return await channel.nack(data, false, false);
      }
      automationData = await processAutomationData({
        contact_id,
        agency_user_id,
        automations,
        log,
      });
      log.info({
        function: 'paveCreateProposal',
        message: 'automationData',
        data: automationData,
      });
    }

    // prepare template parts and body data
    const { template_count, partsData, bodyData } =
      await processMessageTemplate({
        templates:
          campaignType === 'automation' ? automationData.templates : templates,
        agency_id,
        agency_name,
        agency_subdomain,
        agent_first_name,
        contact_id,
        contact,
        log,
        config,
      });

    // if campaignType is automation and first node is booking
    if (
      h.cmpStr(campaignType, 'automation') &&
      h.isEmpty(bodyData) &&
      h.notEmpty(automationData) &&
      h.cmpStr(automationData.nodeType, 'booking')
    ) {
      bodyData.push({
        node_id: automationData?.nodeId, // it will be present if campaignType is "automation". Otherwise it will be undefined
        msg_id: automationData?.automation_rule_id, // it will be present if campaignType is "automation". Otherwise it will be undefined
        message: '',
        msg_template_id: null,
        msg_category: null,
      });
    }

    // if campaignType is automation and first node is simpletext
    if (
      h.cmpStr(campaignType, 'automation') &&
      h.isEmpty(bodyData) &&
      h.notEmpty(automationData) &&
      h.cmpStr(automationData.nodeType, 'message') &&
      h.cmpBool(automationData?.isSimpleTextMsg, true)
    ) {
      bodyData.push({
        node_id: automationData.nodeId,
        msg_id: automationData.automation_rule_id,
        message: automationData.message_content,
        msg_template_id: null,
        msg_category: null,
      });
      const simplTextPartsData = processSimpleTextMessage({
        message_content: automationData.message_content,
        receiver_number: contact?.mobile_number,
      });
      partsData.push(simplTextPartsData.partsData);
    }

    const { wabaOwner, agencyBufferedCredentials } = await processWABADetails(
      selected_waba_credentials_id,
    );

    const whatsapp_engagement_status = contact?.whatsapp_engagement;
    const whatsapp_engagement_enabled =
      h.cmpStr(whatsapp_engagement_status, 'all') ||
      whatsapp_engagement_status.includes('campaign');

    // const canContinueMessageSending =
    //   await c.messageInventory.checkIfCanSendMessage(agency_id, log);
    const canContinueMessageSending = {
      can_continue: true,
    };

    // if no contact owner or if contact already opt out
    if (
      h.cmpBool(has_contact_owner, false) ||
      h.cmpBool(whatsapp_engagement_enabled, false) ||
      h.cmpBool(contact?.opt_out_whatsapp, true) ||
      h.cmpStr(contact?.status, 'inactive') ||
      h.cmpStr(contact?.status, 'archived') ||
      h.cmpBool(wabaOwner?.is_active, false) // ||
      // h.cmpBool(canContinueMessageSending.can_continue, false)
    ) {
      await processFailedContactRecipient({
        has_contact_owner,
        canContinueMessageSending,
        whatsapp_engagement_enabled,
        contact_id,
        proposalData,
        bodyData,
        broadcast_date,
        campaign_name,
        campaign_label,
        tracker_ref_name,
        agency_id,
        contact,
        wabaOwner,
        current_agency_user_id,
        template_count,
        total,
        user_id,
        log,
      });
      if (h.cmpBool(contact?.opt_out_whatsapp, true)) {
        await handleOptOutContact({ contact, agency_id });
      }
      await c.messageInventory.substractVirtualCount(agency_id);
      await amqProgressTrackerController.addSuccess(amq_progress_tracker_id, 1);
      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }
    await processCampaignMessageSending({
      user_id,
      agency_id,
      contact_id,
      broadcast_date,
      campaign_name,
      campaign_label,
      tracker_ref_name,
      wabaOwner,
      current_agency_user_id,
      partsData,
      bodyData,
      contact,
      total,
      agencyBufferedCredentials,
      additionalConfig,
      campaignType, // "automation" || "template"
      nodeType: automationData?.nodeType || null, // "message" || "booking"
      automationData,
      log,
    });
    await amqProgressTrackerController.addSuccess(amq_progress_tracker_id, 1);
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (mainErr) {
    Sentry.captureException(mainErr);
    log.error({
      err: mainErr,
      stringifiedErr: JSON.stringify(mainErr),
      consumer: 'PAVE_CREATE_PROPOSAL',
    });
    await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
    return await channel.nack(data, false, false);
  }
};

/**
 * Description
 * Function to process selected waba number
 * @async
 * @function
 * @name processWABADetails
 * @kind function
 * @param {string} selected_waba_credentials_id WABA ID
 * @returns {Promise} return sa waba details and processed credentials
 */
async function processWABADetails(selected_waba_credentials_id) {
  const wabaOwner = await c.agencyWhatsappConfig.findOne({
    agency_whatsapp_config_id: selected_waba_credentials_id,
  });

  const agencyWhatsAppCredentials =
    wabaOwner?.agency_whatsapp_api_token +
    ':' +
    wabaOwner?.agency_whatsapp_api_secret;
  const agencyBufferedCredentials = Buffer.from(
    agencyWhatsAppCredentials,
    'utf8',
  ).toString('base64');

  return { wabaOwner, agencyBufferedCredentials };
}

/**
 * Description
 * Function to process failed contact recipient due to certain conditions
 * @async
 * @function
 * @name processFailedContactRecipient
 * @kind function
 * @param {boolean} has_contact_owner check if with owner
 * @param {object} canContinueMessageSending for subscription checking
 * @param {boolean} whatsapp_engagement_enabled check if whatsapp is enabled
 * @param {string} contact_id contact id
 * @param {object} proposalData campaign data
 * @param {object} bodyData message body data
 * @param {date} broadcast_date campaign date
 * @param {string} campaign_name campaign name
 * @param {string} campaign_label label
 * @param {string} tracker_ref_name reference number for tracker
 * @param {string} agency_id agency
 * @param {object} contact contact data
 * @param {object} wabaOwner waba details
 * @param {string} current_agency_user_id current agent
 * @param {number} template_count template count
 * @param {number} total total recipients
 * @param {string} user_id user id
 * @param {object} log server log
 */
async function processFailedContactRecipient({
  has_contact_owner,
  canContinueMessageSending,
  whatsapp_engagement_enabled,
  contact_id,
  proposalData,
  bodyData,
  broadcast_date,
  campaign_name,
  campaign_label,
  tracker_ref_name,
  agency_id,
  contact,
  wabaOwner,
  current_agency_user_id,
  template_count,
  total,
  user_id,
  log,
}) {
  let reason = null;
  if (h.cmpBool(canContinueMessageSending.can_continue, false)) {
    reason = h.general.getMessageByCode(canContinueMessageSending.reason);
  }

  if (h.cmpBool(wabaOwner?.is_active, false)) {
    reason = 'Inactive WABA Number Used';
  }

  if (h.isEmpty(reason)) {
    reason = h.cmpBool(has_contact_owner, false)
      ? 'No contact owner'
      : h.cmpBool(whatsapp_engagement_enabled, false)
      ? 'WhatsApp engagement disabled'
      : h.cmpStr(contact?.status, 'inactive')
      ? 'Inactive contact'
      : h.cmpStr(contact?.status, 'archived')
      ? 'Archived Contact'
      : 'Contact opted out';
  }
  log.info({
    message: `Skipping contact: ${contact_id} to receive campaign message`,
    reason: reason,
    data: proposalData,
    consumerType: 'PAVE_CREATE_PROPOSAL',
  });
  const sendWhatsAppTemplateMessageResponse = { original_event_id: null };
  let index = 0;
  await Promise.mapSeries(bodyData, async (body) => {
    const messageData = {
      broadcast_date,
      campaign_name,
      campaign_label,
      tracker_ref_name,
      agency_id,
      contact_id,
      contact,
      wabaOwner,
      current_agency_user_id,
      sendWhatsAppTemplateMessageResponse,
      failed_reason: JSON.stringify([{ code: 100000, title: reason }]),
      msg_body: body.message,
      msg_template_id: body.msg_template_id,
      msg_category: body.msg_category,
      template_count,
      template_index: index,
      total,
      user_id,
      log,
    };
    const { whatsapp_message_tracker_id } = await processSavingMessageData(
      messageData,
    );
    await processUnifiedInboxSaving({
      ...messageData,
      whatsapp_message_tracker_id,
    });
    await sendAppsyncNotificationMessage({
      broadcast_date,
      sendWhatsAppTemplateMessageResponse,
      campaign_name,
      agency_id,
      contact_id,
      current_agency_user_id,
      msg_body: body,
      contact,
      wabaOwner,
      log,
    });
    index++;
  });
}

/**
 * Description
 * Function to handle opt out contact records
 * @async
 * @function
 * @name handleOptOutContact
 * @kind function
 * @param {object} contact contact record
 * @param {string} agency_id agency id
 */
async function handleOptOutContact({ contact, agency_id }) {
  const optedOutRecord = await c.contact.findOne({
    mobile_number: contact?.mobile_number,
    agency_fk: agency_id,
    opt_out_whatsapp: true,
  });

  await models.contact.update(
    {
      opt_out_whatsapp: true,
      opt_out_whatsapp_date: optedOutRecord?.opt_out_whatsapp_date,
    },
    {
      where: {
        mobile_number: contact?.mobile_number,
        agency_fk: agency_id,
      },
    },
  );
}

/**
 * Description
 * Function to process contact owner details
 * @async
 * @function
 * @name processContactOwner
 * @kind function
 * @param {object} data data needed for processing
 * @returns {Promise} returns contact owner after processing
 */
async function processContactOwner(data) {
  // get default agency user and contact record
  const [
    { agency_name, agency_subdomain, default_outsider_contact_owner },
    contactRecord,
  ] = await Promise.all([
    c.agency.findOne({ agency_id: data.agency_id }),
    c.contact.findOne({ contact_id: data.contact_id }),
  ]);

  let has_contact_owner = false;
  let current_agency_user_id = null;

  const assigned_contact_owner = isValidContactOwnerID(
    contactRecord?.dataValues?.agency_user_fk,
  )
    ? contactRecord?.dataValues?.agency_user_fk
    : null;

  if (h.notEmpty(assigned_contact_owner)) {
    current_agency_user_id = assigned_contact_owner;
    has_contact_owner = true;
  }

  const agency_default_contact_owner = await validateDefaultContactOwner(
    default_outsider_contact_owner,
  );

  // if no owner and with default owner
  if (
    h.cmpBool(has_contact_owner, false) &&
    h.isEmpty(current_agency_user_id) &&
    h.notEmpty(agency_default_contact_owner)
  ) {
    current_agency_user_id = agency_default_contact_owner;
    has_contact_owner = true;
  }

  let agent_first_name = null;
  let agent_last_name = null;
  let agent_email = null;
  if (h.cmpBool(has_contact_owner, true)) {
    /**
     * update contact agency_user_fk using the agency's
     * default_outsider_contact_owner value
     */
    await c.contact.update(data.contact_id, {
      agency_user_fk: current_agency_user_id,
    });
    const {
      user: { first_name, last_name, email },
    } = await models.agency_user.findOne({
      where: {
        agency_user_id: current_agency_user_id,
      },
      include: [{ model: models.user, required: true }],
    });
    agent_first_name = first_name;
    agent_last_name = last_name;
    agent_email = email;
  }

  const newContactRecord = await c.contact.findOne({
    contact_id: data.contact_id,
  });
  const contact = newContactRecord?.dataValues;
  return {
    agency_name,
    agency_subdomain,
    has_contact_owner,
    current_agency_user_id,
    agent_first_name,
    agent_last_name,
    agent_email,
    contact,
  };
}

/**
 * Description
 * Process message template parts and saving body
 * @async
 * @function
 * @name processMessageTemplate
 * @kind function
 * @param {object} templates templates to be used
 * @param {string} agency_id agency id
 * @param {string} agency_name agency name
 * @param {string} agency_subdomain subdomain
 * @param {string} agent_first_name agent first name
 * @param {string} contact_id contact id
 * @param {object} contact contact data
 * @param {object} log server log
 * @param {object} config initial config data
 * @returns {Promise} returns template count and body data for sending and saving
 */
async function processMessageTemplate({
  templates,
  agency_id,
  agency_name,
  agency_subdomain,
  agent_first_name,
  contact_id,
  contact,
  log,
  config,
}) {
  const { sendPermalink, permalink_url } = await getContactPermalink({
    contact_id,
    contact,
    agency_name,
    agency_subdomain,
    config,
  });
  const template_count = templates.reduce((pv, cv) => {
    if (h.cmpBool(cv.selected, true)) pv += 1;
    return pv;
  }, 0);
  log.info(`template count ${template_count}`);
  const partsData = [];
  const bodyData = [];
  for (const i in templates) {
    const template = templates[i];
    if (h.cmpBool(template.selected, true)) {
      const { waba_template_id } = await c.wabaTemplate.findOne({
        agency_fk: agency_id,
        template_id: template?.id,
      });
      const { sendMessagePartsData } = await h.whatsapp.getProposalTemplateBody(
        agency_id,
        agency_name,
        h.general.prettifyConstant(agent_first_name),
        h.general.prettifyConstant(contact?.first_name),
        contact.mobile_number, // To buyer whatsapp number
        contact.email,
        sendPermalink,
        template,
      );
      partsData.push(sendMessagePartsData);

      const msg_body = await prepareMessageBodyForSaving({
        template,
        agency_name,
        agent_first_name,
        permalink_url,
        contact,
      });
      bodyData.push({
        message: msg_body,
        msg_template_id: waba_template_id,
        msg_category: template?.category,
        node_id: template?.nodeId, // it will be present if campaignType is "automation". Otherwise it will be undefined
        msg_id: template?.automation_rule_id,
      });
    }
  }

  return {
    template_count,
    partsData,
    bodyData,
  };
}

/**
 * Description
 * Process template body
 * @async
 * @function
 * @name formatTemplateBody
 * @kind function
 * @param {object} flowData single object.
 * @returns {string} returns formatted template_body
 */
function formatTemplateBody(flowData, contact_name, agent_name) {
  let { template_body, body_variables, body_variables_type } = flowData;

  // Loop through each variable in body_variables and replace it in the template_body
  let variable_index = 0;
  for (const variable in body_variables) {
    const value = h.cmpStr(body_variables_type[variable_index], 'contact')
      ? contact_name
      : agent_name;
    template_body = template_body.replace(variable, value);
    variable_index++;
  }

  return template_body;
}

/**
 * Description
 * Process first automation node to send
 * @async
 * @function
 * @name processAutomationData
 * @kind function
 * @param {string} contact_id contact ID
 * @param {string} agency_user_id agency user ID
 * @param {object} automations array of single object. have category and automation_rule_id as object
 * @param {object} log server log
 * @returns {Promise} returns template data or booking node data or message body for simpletext node
 */

async function processAutomationData({
  contact_id,
  agency_user_id,
  automations,
  log,
}) {
  log.info({
    function: 'paveCreateProposal -> processAutomationData',
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

  if (h.cmpStr(nodeType, 'message')) {
    const template_id = firstNodeData.data.flowData.template_id;
    const isSimpleTextMsg = !!h.isEmpty(template_id);
    if (h.cmpBool(isSimpleTextMsg, true)) {
      return {
        templates: [],
        selected: false,
        nodeId: parentNodeId,
        original_name: '',
        automation_rule_id,
        message_content: firstNodeData.data.flowData.template_body,
        isSimpleTextMsg: true,
        nodeType: 'message',
      };
    } else {
      const dbTemplate = await models.waba_template.findOne({
        where: {
          template_id,
        },
      });
      const templateContent = JSON.parse(dbTemplate.content);
      let bodyComponent = [];
      if (dbTemplate?.variable_identifier) {
        bodyComponent = dbTemplate.variable_identifier.split(',');
      }
      const headerImage = dbTemplate.header_image;
      return {
        templates: [
          {
            ...templateContent,
            selected: true,
            nodeId: parentNodeId,
            original_name: templateContent?.name || '',
            automation_rule_id,
            body_component: bodyComponent,
            header_image: headerImage,
          },
        ],
        nodeType: 'message',
      };
    }
  }

  if (h.cmpStr(nodeType, 'booking')) {
    const flow_id = firstNodeData.data.flowData.waba_flow_id;
    const dbFlow = await models.whatsapp_flow.findOne({
      where: {
        flow_id,
      },
    });
    const { contact_name, agent_name } = await getTemplateVariableValues(
      contact_id,
      agency_user_id,
    );
    const flow = {
      flow_initial_cta_button: firstNodeData.data.flowData.initial_cta_button,
      flow_body: formatTemplateBody(
        firstNodeData.data.flowData,
        contact_name,
        agent_name,
      ),
      flow_payload: {
        screen: dbFlow.dataValues?.flow_payload?.screens?.[0]?.id || 'STEP_one',
      },
      whatsapp_flow_id: dbFlow.dataValues.whatsapp_flow_id,
      flow_status: dbFlow.dataValues.status,
    };
    return {
      templates: [],
      flowId: flow_id,
      nodeId: parentNodeId,
      flow,
      nodeType: 'booking',
      automation_rule_id,
    };
  }
}

/**
 * Description
 * Function to get contact and agent name for template variables
 * @async
 * @function
 * @name getTemplateVariableValues
 * @kind function
 * @param {any} contact_id
 * @param {any} agency_user_id
 * @returns {globalThis.Promise<{ contact_name: any; agent_name: any; }>}
 */
async function getTemplateVariableValues(contact_id, agency_user_id) {
  const contact = await c.contact.findOne({ contact_id });
  const user = await c.user.findOne(
    {},
    {
      include: [
        {
          model: models.agency_user,
          where: {
            agency_fk: contact?.agency_fk,
            agency_user_id,
          },
        },
      ],
    },
  );
  const agency = await c.agency.findOne({ agency_id: contact?.agency_fk });

  const contact_name = h.notEmpty(contact?.first_name)
    ? contact?.first_name
    : h.notEmpty(contact?.last_name)
    ? contact?.last_name
    : contact?.mobile_number;
  const agent_name = h.notEmpty(user?.first_name)
    ? user?.first_name
    : h.notEmpty(user?.last_name)
    ? user?.last_name
    : h.notEmpty(user?.email)
    ? user?.email
    : agency?.agency_name;

  return { contact_name, agent_name };
}

/**
 * Description
 * Process simple text message and
 * @async
 * @function
 * @name processSimpleTextMessage
 * @kind function
 * @param {string} message_content simple text message
 * @param {string} receiver_number receiver_number
 * @returns {object} return parts data to send this message using whatsapp api
 */

function processSimpleTextMessage({ message_content, receiver_number }) {
  const msgParts = [];

  const newMsgReply = message_content;

  msgParts.push({
    id: '1',
    contentType: 'text/html',
    data: newMsgReply,
    size: newMsgReply.length,
    type: 'body',
    sort: 0,
  });

  const sendMessagePartsData = {
    message: {
      receivers: [
        {
          name: 'name',
          address: `${receiver_number}`,
          Connector: `${receiver_number}`,
          type: 'individual',
        },
      ],
      parts: msgParts,
    },
  };
  return {
    partsData: sendMessagePartsData,
  };
}
/**
 * Description
 * Function for creating permalink
 * @async
 * @function
 * @name getContactPermalink
 * @kind function
 * @param {string} agency_subdomain subdomain
 * @param {string} agent_first_name agent first name
 * @param {string} contact_id contact id
 * @param {object} contact contact data
 * @param {object} config initial config data
 * @returns {Promise} returns the processed permalink data
 */
async function getContactPermalink({
  contact_id,
  contact,
  agency_name,
  agency_subdomain,
  config,
}) {
  let permalink = contact?.permalink;
  if (h.isEmpty(contact?.permalink)) {
    permalink = await contactService.checkIfPermalinkIsUnique(
      h.general.generateRandomAlpanumeric(5),
    );
  }

  await c.contact.update(contact_id, {
    permalink: permalink,
  });

  const sendPermalink = h.route.createPermalink(
    agency_subdomain,
    config.webUrl,
    agency_name,
    contact,
    permalink,
  );

  const permalink_url = h.cmpStr(process.env.NODE_ENV, 'development')
    ? 'https://samplerealestateagency.yourpave.com/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
    : sendPermalink;

  return { sendPermalink, permalink_url };
}

/**
 * Description
 * Function to build the message body needed in saving record
 * @async
 * @function
 * @name prepareMessageBodyForSaving
 * @kind function
 * @param {object} template selected template
 * @param {string} agency_name agency name
 * @param {string} agent_first_name agent name
 * @param {string} permalink_url permalink
 * @param {object} contact contact data
 * @returns {Promise<string>} returns the message body for saving
 */
async function prepareMessageBodyForSaving({
  template,
  agency_name,
  agent_first_name,
  permalink_url,
  contact,
}) {
  let msg_body = '';
  for (const component of template.components) {
    if (h.cmpStr(component.type, 'BODY')) {
      msg_body += prepareHeaderImage(template);
      msg_body += component.text;
      msg_body = processBodyDynamicParts({
        template,
        component,
        agency_name,
        agent_first_name,
        permalink_url,
        contact,
        msg_body,
      });
    }
    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.text}</button>`;
      });
    }
  }
  return msg_body;
}

/**
 * Description
 * Function to prepare header image for the message
 * @function
 * @name prepareHeaderImage
 * @kind function
 * @param {object} template selected template
 * @returns {string} returns the message body with header image
 */
function prepareHeaderImage(template) {
  let msg_body = '';
  if (
    template.header_image &&
    !h.cmpStr(
      template.header_image,
      'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
    )
  ) {
    template.components.forEach((component) => {
      if (h.cmpStr(component.type, 'HEADER')) {
        if (['IMAGE'].includes(component.format)) {
          msg_body += `<img src="${template.header_image}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px;">`;
        }
        if (['VIDEO'].includes(component.format)) {
          msg_body += `<video class="campaign_header_image" style="width: 100%; margin-bottom: 20px;" controls src="${template.header_image}"></video>`;
        }
      }
    });
  }
  return msg_body;
}

/**
 * Description
 * Function to handle dynamic variables
 * @function
 * @name processBodyDynamicParts
 * @kind function
 * @param {object} template selected template
 * @param {object} component variable components
 * @param {string} agency_name agency
 * @param {string} agent_first_name agent name
 * @param {string} permalink_url permalink
 * @param {object} contact contact data
 * @param {string} msg_body message body
 * @returns {any}
 */
function processBodyDynamicParts({
  template,
  component,
  agency_name,
  agent_first_name,
  permalink_url,
  contact,
  msg_body,
}) {
  let msg_body_clone = msg_body;
  if (
    typeof component.example !== 'undefined' &&
    component.example.body_text.length > 0
  ) {
    const examples = component.example.body_text[0];
    msg_body_clone = processComponentValue({
      examples,
      contact,
      template,
      agency_name,
      agent_first_name,
      permalink_url,
      msg_body,
    });
  }
  return msg_body_clone;
}

/**
 * Description
 * Function to process variable component types
 * @function
 * @name processComponentValue
 * @kind function
 * @param {object} examples data for variables
 * @param {object} contact contact data
 * @param {object} template template data
 * @param {string} agency_name agency
 * @param {string} agent_first_name agent name
 * @param {string} permalink_url permalink
 * @param {string} msg_body message
 * @returns {string} returns the processed message body
 */
function processComponentValue({
  examples,
  contact,
  template,
  agency_name,
  agent_first_name,
  permalink_url,
  msg_body,
}) {
  let msg_body_clone = msg_body;
  examples.forEach((ex, index) => {
    let component_value = contact?.first_name || contact?.mobile_number;
    if (template.body_component.length <= 0) {
      msg_body_clone = msg_body_clone.replace(
        `{{${index + 1}}}`,
        contact?.first_name || contact?.mobile_number,
      );
      return msg_body_clone;
    }
    component_value = contact?.first_name || contact?.mobile_number;
    if (template.body_component[index] === 'agency') {
      component_value = h.general.prettifyConstant(agency_name);
    }
    if (template.body_component[index] === 'agent') {
      component_value = h.general.prettifyConstant(agent_first_name);
    }
    if (template.body_component[index] === 'link') {
      component_value = permalink_url;
    }
    msg_body_clone = msg_body_clone.replace(
      `{{${index + 1}}}`,
      component_value,
    );
  });
  return msg_body_clone;
}

/**
 * Description
 * Function to send whatsapp campaign message
 * @async
 * @function
 * @name processCampaignMessageSending
 * @kind function
 * @param {string} user_id user id
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {date} broadcast_date campaign date
 * @param {string} campaign_name  campaign name
 * @param {string} campaign_label label
 * @param {string} tracker_ref_name campaign ref number
 * @param {object} wabaOwner waba
 * @param {string} current_agency_user_id current owner
 * @param {object} partsData message to send
 * @param {object} bodyData message to save
 * @param {object} contact contact data
 * @param {number} total total recipients
 * @param {string} campaignType campaign type "automation" or "template"
 * @param {string} nodeType either "message" or "booking" for campaignType automation
 * @param {string} agencyBufferedCredentials sending credentials
 * @param {object} additionalConfig addtional consumer config
 * @param {object} log server log
 */
async function processCampaignMessageSending({
  user_id,
  agency_id,
  contact_id,
  broadcast_date,
  campaign_name,
  campaign_label,
  tracker_ref_name,
  wabaOwner,
  current_agency_user_id,
  partsData,
  bodyData,
  contact,
  total,
  campaignType,
  nodeType,
  automationData,
  agencyBufferedCredentials,
  additionalConfig,
  log,
}) {
  log.info({
    action: 'WHATSAPP TEMPLATE MESSAGE SENDING',
    message: 'Attempting to send message',
    campaign: campaign_name,
    tracker_ref_name: tracker_ref_name,
    contact_id: contact_id,
    sender_number: wabaOwner?.waba_number,
    receiver_number: contact?.mobile_number,
  });
  const { whatsapp_config } = await models.agency_config.findOne({
    where: { agency_fk: agency_id },
  });
  const agencyUser = await models.agency_user.findOne({
    where: {
      user_fk: user_id,
    },
    include: [
      {
        model: models.user,
        required: true,
      },
      { model: models.agency, required: true },
    ],
  });

  // check if there is already a message draft
  const existingMessageDraft = await c.whatsappMessageTracker.findOne(
    {
      contact_fk: contact_id,
      agency_fk: agency_id,
      tracker_ref_name: tracker_ref_name,
      [Op.or]: [
        { original_event_id: 1 },
        {
          original_event_id: {
            [Op.not]: null,
          },
        },
        {
          original_event_id: {
            [Op.not]: '',
          },
        },
      ],
      sender_number: wabaOwner?.waba_number,
      receiver_number: contact?.mobile_number,
    },
    {
      order: [['created_date', 'DESC']],
    },
  );

  // if draft with same parameters exists, end process on this part
  if (h.notEmpty(existingMessageDraft)) {
    log.info({
      action: 'WHATSAPP TEMPLATE MESSAGE SENDING',
      message: 'Tracker record already exists, stopping attempt to send',
      campaign: campaign_name,
      tracker_ref_name: tracker_ref_name,
      contact_id: contact_id,
      sender_number: wabaOwner?.waba_number,
      receiver_number: contact?.mobile_number,
    });
    return true;
  }
  // creating pending message for campaign
  log.info({
    action: 'WHATSAPP TEMPLATE MESSAGE SENDING',
    message: 'Creating draft message records for campaign',
    campaign: campaign_name,
    tracker_ref_name: tracker_ref_name,
    contact_id: contact_id,
    sender_number: wabaOwner?.waba_number,
    receiver_number: contact?.mobile_number,
    bodyData,
  });

  const messageIDs = await Promise.mapSeries(bodyData, async (body, index) => {
    const sendWhatsAppTemplateMessageResponse = { original_event_id: 1 };
    const messageData = {
      broadcast_date,
      campaign_name,
      campaign_label,
      tracker_ref_name,
      agency_id,
      contact_id,
      contact,
      wabaOwner,
      current_agency_user_id,
      sendWhatsAppTemplateMessageResponse,
      failed_reason: null,
      msg_body: body.message,
      msg_template_id: body.msg_template_id,
      msg_category: body.msg_category,
      template_count: partsData.length,
      template_index: index,
      total,
      user_id,
      msg_id: body?.msg_id || null,
      node_id: body?.node_id || null, // it will be present if campaignType is "automation". Otherwise it will be undefined
      log,
    };
    // creating whatsapp_message_tracker and whatsapp_chat records
    const { whatsapp_message_tracker_id, whatsapp_chat_id } =
      await processSavingMessageData(messageData);

    // creating/updating unified_inbox record
    const unified_inbox_id = await processUnifiedInboxSaving({
      ...messageData,
      whatsapp_message_tracker_id,
    });

    await sendAppsyncNotificationMessage({
      broadcast_date,
      sendWhatsAppTemplateMessageResponse,
      campaign_name,
      agency_id,
      contact_id,
      current_agency_user_id,
      msg_body: body,
      contact,
      wabaOwner,
      log,
    });

    log.info({
      action: 'WHATSAPP MESSAGE RECORD IDS',
      index: index,
      message: 'Record IDs for this batch',
      whatsapp_message_tracker_id: `${whatsapp_message_tracker_id}`,
      whatsapp_chat_id: `${whatsapp_chat_id}`,
      unified_inbox_id: `${unified_inbox_id}`,
    });

    return {
      whatsapp_message_tracker_id,
      whatsapp_chat_id,
      unified_inbox_id,
    };
  });

  // do process actual sending via whatsapp api
  const config = JSON.parse(whatsapp_config);
  const environment = config.environment;
  let sendResponse = [];
  if (h.cmpStr(campaignType, 'template')) {
    sendResponse = await Promise.mapSeries(partsData, async (parts, index) => {
      const sendWhatsAppTemplateMessageResponse =
        await h.whatsapp.sendWhatsAppTemplateMessage(
          contact?.mobile_number,
          contact?.is_whatsapp,
          null,
          parts,
          agencyBufferedCredentials,
          environment,
          'create',
          log,
        );
      return sendWhatsAppTemplateMessageResponse;
    });
  }
  if (h.cmpStr(campaignType, 'automation')) {
    if (h.cmpStr(nodeType, 'message')) {
      sendResponse = await Promise.mapSeries(
        partsData,
        async (parts, index) => {
          const sendWhatsAppTemplateMessageResponse =
            await h.whatsapp.sendWhatsAppTemplateMessage(
              contact?.mobile_number,
              contact?.is_whatsapp,
              null,
              parts,
              agencyBufferedCredentials,
              environment,
              'create',
              log,
            );
          return sendWhatsAppTemplateMessageResponse;
        },
      );
    } else if (h.cmpStr(nodeType, 'booking')) {
      const sendWhatsAppTemplateMessageResponse = await processSendBookingFlow(
        {
          agency_id,
          flow_id: automationData.flowId,
          flow: automationData.flow,
          node_id: automationData.nodeId,
          rule_id: automationData.automation_rule_id,
          receiver_number: contact?.mobile_number,
          agencyBufferedCredentials,
        },
        log,
      );
      sendResponse = [sendWhatsAppTemplateMessageResponse];
    }
  }

  // update the created messages after sending process
  await Promise.mapSeries(bodyData, async (body, messageIndex) => {
    const sendWhatsAppTemplateMessageResponse = sendResponse[messageIndex];
    const { whatsapp_message_tracker_id, whatsapp_chat_id, unified_inbox_id } =
      messageIDs[messageIndex];

    log.info({
      message: 'Record IDs to process for update after sending',
      data: {
        messageIndex: messageIndex,
        whatsapp_message_tracker_id: `${whatsapp_message_tracker_id}`,
        whatsapp_chat_id: `${whatsapp_chat_id}`,
        unified_inbox_id: `${unified_inbox_id}`,
        sendWhatsAppTemplateMessageResponse,
      },
      consumerType: 'PAVE_CREATE_PROPOSAL',
    });

    await processUpdateMessageAfterSending({
      whatsapp_message_tracker_id,
      whatsapp_chat_id,
      sendWhatsAppTemplateMessageResponse,
      user_id,
      log,
    });

    if (
      h.isEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id) &&
      !h.cmpStr(contact?.status, 'archived')
    ) {
      await setContactAsInactiveDueToFailedMessage(
        agency_id,
        contact_id,
        contact?.mobile_number,
        log,
      );
    }

    await updateUnifiedInboxDraft({
      whatsapp_message_tracker_id,
      unified_inbox_id,
      sendWhatsAppTemplateMessageResponse,
      user_id,
      log,
    });
    // add message inventory count
    if (h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)) {
      await c.messageInventory.addMessageCount(agency_id);
      await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
    } else {
      // subtract from virtual count but not on message count
      await c.messageInventory.substractVirtualCount(agency_id);
    }

    await transmitToSalesforce({
      sendWhatsAppTemplateMessageResponse,
      contact_id,
      agency_id,
      contact,
      agencyUser,
      msg_body: body.message,
      additionalConfig,
      log,
    });
  });
  log.info({
    action: 'WHATSAPP TEMPLATE MESSAGE SENDING',
    message: 'Attempt to send message completed',
    campaign: campaign_name,
    tracker_ref_name: tracker_ref_name,
    contact_id: contact_id,
    sender_number: wabaOwner?.waba_number,
    receiver_number: contact?.mobile_number,
  });
  return true;
}

/**
 * Description
 * Function to save message data to database
 * @async
 * @function
 * @name processSavingMessageData
 * @kind function
 * @param {date} broadcast_date campaign date
 * @param {string} campaign_name campaign name
 * @param {string} campaign_label label
 * @param {string} tracker_ref_name campaign tracker number
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {object} contact contact data
 * @param {object} wabaOwnerwaba data
 * @param {string} current_agency_user_id current contact owner
 * @param {object} sendWhatsAppTemplateMessageResponse send response
 * @param {object} failed_reason failed reason
 * @param {string} msg_body message
 * @param {string} msg_template_id message template id
 * @param {string} msg_category message template category
 * @param {number} template_count template count
 * @param {number} template_index index of selected template
 * @param {number} total total recipient
 * @param {string} user_id user id
 * @param {string} msg_id automation_rule_id in case of campaignType "automation"
 * @param {string} node_id first node id of automation workflow
 * @param {object} log server log
 * @returns {Promise} returns the tracker, chat, and unified inbox id
 */
async function processSavingMessageData({
  broadcast_date,
  campaign_name,
  campaign_label,
  tracker_ref_name,
  agency_id,
  contact_id,
  contact,
  wabaOwner,
  current_agency_user_id,
  sendWhatsAppTemplateMessageResponse,
  failed_reason,
  msg_body,
  msg_template_id,
  msg_category,
  template_count,
  template_index,
  total,
  user_id,
  node_id,
  msg_id,
  log,
}) {
  log.info({
    message: 'Saving data to message tables',
    data: {
      broadcast_date,
      campaign_name,
      campaign_label,
      tracker_ref_name,
      agency_id,
      contact_id,
      contact,
      wabaOwner,
      current_agency_user_id,
      sendWhatsAppTemplateMessageResponse,
      failed_reason,
      msg_body,
      msg_template_id,
      msg_category,
      template_count,
      template_index,
      total,
      user_id,
      msg_id,
      log,
    },
    consumerType: 'PAVE_CREATE_PROPOSAL',
  });
  // broadcast date
  let whatsapp_message_tracker_id = null;
  let whatsapp_chat_id = null;
  const campaign_broadcast_date = new Date(broadcast_date);
  const msg_timestamp = Math.floor(campaign_broadcast_date.getTime() / 1000);
  const whatsapp_template_message_sending_transaction =
    await models.sequelize.transaction();
  try {
    const sanitizedUnescapedValue =
      h.general.sanitizeMaliciousAttributes(msg_body);
    log.info({
      message: 'tracker data creation',
      data: {
        campaign_name: campaign_name,
        campaign_name_label: campaign_label,
        tracker_ref_name,
        agency_fk: agency_id,
        contact_fk: contact_id,
        receiver_number: contact?.mobile_number,
        sender_number: wabaOwner?.waba_number,
        agency_user_fk: current_agency_user_id,
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        msg_body: msg_body,
        sanitized_body: sanitizedUnescapedValue,
        pending:
          h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id) &&
          h.cmpInt(sendWhatsAppTemplateMessageResponse.original_event_id, 1)
            ? 1
            : 0,
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
        failed_reason: failed_reason,
        batch_count: total,
        created_by: user_id,
        broadcast_date: new Date(broadcast_date),
        template_count: template_count,
        tracker_type: h.cmpInt(template_index, 0) ? 'main' : 'sub',
      },
    });
    whatsapp_message_tracker_id = await c.whatsappMessageTracker.create(
      {
        campaign_name: campaign_name,
        campaign_name_label: campaign_label,
        tracker_ref_name,
        agency_fk: agency_id,
        contact_fk: contact_id,
        receiver_number: contact?.mobile_number,
        sender_number: wabaOwner?.waba_number,
        agency_user_fk: current_agency_user_id,
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        msg_id: msg_id,
        msg_body: sanitizedUnescapedValue,
        msg_origin: 'campaign',
        pending:
          h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id) &&
          h.cmpInt(sendWhatsAppTemplateMessageResponse.original_event_id, 1)
            ? 1
            : 0,
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
        failed_reason: failed_reason,
        batch_count: total,
        created_by: user_id,
        broadcast_date: new Date(broadcast_date),
        template_count: template_count,
        tracker_type: h.cmpInt(template_index, 0) ? 'main' : 'sub',
      },
      {
        transaction: whatsapp_template_message_sending_transaction,
      },
    );

    log.info({
      message: 'whatsapp chat data creation',
      data: {
        campaign_name: campaign_name,
        msg_id: null,
        msg_timestamp,
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_user_fk: current_agency_user_id,
        receiver_number: contact?.mobile_number,
        sender_number: wabaOwner?.waba_number,
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
        failed_reason: failed_reason,
        msg_type: 'frompave',
        msg_template_id,
        msg_category,
        node_id,
        msg_body: msg_body,
        sanitized_body: sanitizedUnescapedValue,
        created_by: user_id,
        created_date: new Date(broadcast_date),
      },
    });
    whatsapp_chat_id = await c.whatsappChat.create(
      {
        campaign_name: campaign_name,
        msg_id: null,
        msg_timestamp,
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_user_fk: current_agency_user_id,
        receiver_number: contact?.mobile_number,
        sender_number: wabaOwner?.waba_number,
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
        failed_reason: failed_reason,
        msg_type: 'frompave',
        msg_template_id,
        msg_category,
        msg_origin: 'campaign',
        msg_info: node_id || null,
        msg_body: sanitizedUnescapedValue,
        created_by: user_id,
        created_date: new Date(broadcast_date),
      },
      {
        transaction: whatsapp_template_message_sending_transaction,
      },
    );
    await whatsapp_template_message_sending_transaction.commit();

    log.info({
      consumerType: 'PAVE_CREATE_PROPOSAL',
      saved_ids: {
        whatsapp_message_tracker_id: `${whatsapp_message_tracker_id}`,
        whatsapp_chat_id: `${whatsapp_chat_id}`,
      },
    });

    return { whatsapp_message_tracker_id, whatsapp_chat_id };
  } catch (triggerTemplateMessageErr) {
    Sentry.captureException(triggerTemplateMessageErr);
    log.error({
      action: 'WHATSAPP TEMPLATE MESSAGE SENDING ERROR',
      response: triggerTemplateMessageErr,
      stringifiedErr: JSON.stringify(triggerTemplateMessageErr),
    });
    await whatsapp_template_message_sending_transaction.rollback();
    throw new Error('WHATSAPP TEMPLATE MESSAGE SENDING ERROR');
  }
}

/**
 * Description
 * Function to send message to appsync
 * @async
 * @function
 * @name sendAppsyncNotificationMessage
 * @kind function
 * @param {date} broadcast_date campaign date
 * @param {string} campaign_name campaign name
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {object} contact contact data
 * @param {object} wabaOwnerwaba data
 * @param {string} current_agency_user_id current contact owner
 * @param {object} sendWhatsAppTemplateMessageResponse send response
 * @param {string} msg_body message
 * @param {object} log server log
 */
async function sendAppsyncNotificationMessage({
  broadcast_date,
  sendWhatsAppTemplateMessageResponse,
  campaign_name,
  agency_id,
  contact_id,
  current_agency_user_id,
  msg_body,
  contact,
  wabaOwner,
  log,
}) {
  log.info({
    message: 'Trigger appsync create message notification',
    data: {
      broadcast_date,
      sendWhatsAppTemplateMessageResponse,
      campaign_name,
      agency_id,
      contact_id,
      current_agency_user_id,
      msg_body,
      contact,
      wabaOwner,
    },
    consumerType: 'PAVE_CREATE_PROPOSAL',
  });
  const created_date = new Date(broadcast_date);
  const msg_timestamp = Math.floor(created_date.getTime() / 1000);

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const date = new Date(created_date);
  const formattedDate = date.toLocaleDateString('en-US', options);

  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  const appsync = await c.appSyncCredentials.findOne({
    status: 'active',
  });
  const { api_key } = appsync;

  await h.appsync.sendGraphQLNotification(api_key, {
    position: 1,
    platform: 'whatsapp',
    failed: h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
    campaign_name: campaign_name,
    agency_fk: agency_id,
    contact_fk: contact_id,
    agency_user_fk: current_agency_user_id,
    original_event_id: !h.isEmpty(
      sendWhatsAppTemplateMessageResponse.original_event_id,
    )
      ? sendWhatsAppTemplateMessageResponse.original_event_id
      : null,
    msg_id: null,
    msg_body: msg_body,
    msg_type: 'frompave',
    msg_timestamp,
    receiver_number: contact?.mobile_number,
    sender_number: wabaOwner?.waba_number,
    sender_url: null,
    receiver_url: null,
    reply_to_event_id: null,
    reply_to_content: null,
    reply_to_msg_type: null,
    reply_to_file_name: null,
    reply_to_contact_id: null,
    created_date_raw: new Date(),
    created_date: `${formattedDate} ${formattedTime}`,
  });
}

/**
 * Description
 * Function to transmit to salesforce when sending is successful
 * @async
 * @function
 * @name transmitToSalesforce
 * @kind function
 * @param {object} sendWhatsAppTemplateMessageResponse sending response
 * @param {string} contact_id contact id
 * @param {string} agency_id agency id
 * @param {object} contact contact data
 * @param {object} agencyUser agency user data
 * @param {string} msg_body message
 * @param {object} additionalConfig additional configuration
 * @param {object} log server logs
 */
async function transmitToSalesforce({
  sendWhatsAppTemplateMessageResponse,
  contact_id,
  agency_id,
  contact,
  agencyUser,
  msg_body,
  additionalConfig,
  log,
}) {
  if (!h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)) {
    await c.contact.update(contact_id, {
      is_whatsapp: true,
    });

    const contact_source = await models.contact_source.findOne({
      where: {
        contact_fk: contact_id,
        source_type: 'SALESFORCE',
      },
    });
    if (!h.isEmpty(contact_source)) {
      const liveChatSettings = await models.live_chat_settings.findOne({
        where: {
          agency_fk: agency_id,
        },
      });
      const agencyOauth = await models.agency_oauth.findOne({
        where: {
          agency_fk: agency_id,
          status: 'active',
          source: 'SALESFORCE',
        },
      });
      const contactSalesforceRecord = await c.contactSalesforceData.findOne(
        {
          agency_fk: agency_id,
          contact_fk: contact_id,
        },
        {
          order: [['created_date', 'DESC']],
        },
      );
      await h.salesforce.transmitMessage({
        liveChatSettings,
        contactSalesforceData: contactSalesforceRecord,
        oauth: agencyOauth,
        contact: contact,
        contact_source,
        currentAgencyUser: agencyUser,
        full_message_body: msg_body,
        messageType: 'template',
        platform: 'whatsapp',
        log,
        encryptionKeys: additionalConfig.ek,
      });
    }
  }
}

/**
 * Description
 * Function to update contact status after sending process
 * @async
 * @function
 * @name processUpdateContactStatus
 * @kind function
 * @param {boolean} is_confirmation check if campaign is for confirmation
 * @param {string} contact_id contact id
 * @param {string} user_id user id
 * @param {string} permalink_template permalink type
 * @param {object} log server log
 */
async function processUpdateContactStatus({
  is_confirmation,
  contact_id,
  user_id,
  permalink_template,
  log,
}) {
  // contact update transaction
  const contact_transaction = await models.sequelize.transaction();
  try {
    if (!is_confirmation) {
      await c.contact.update(
        contact_id,
        {
          updated_by: user_id,
          lead_status: constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT,
          permalink_sent_date: h.date.getSqlCurrentDate(),
          lead_score: 0,
          buy_status: null,
          last_24_hour_lead_score: 0,
          last_48_hour_lead_score: 0,
          last_24_hour_lead_score_diff: 0,
          permalink_last_opened: null,
          has_appointment: false,
          appointment_date: null,
          lead_status_last_update: null,
          is_general_enquiry: false,
          permalink_template,
        },
        { transaction: contact_transaction },
      );
    }
    await contact_transaction.commit();
  } catch (contactUpdateErr) {
    Sentry.captureException(contactUpdateErr);
    log.error({
      action: 'CONTACT TRANSACTION ERROR',
      response: contactUpdateErr,
      stringifiedErr: JSON.stringify(contactUpdateErr),
    });
    await contact_transaction.rollback();
    throw new Error('CONTACT TRANSACTION ERROR');
  }
}

/**
 * Description
 * Function to update the message records after the actual message sending
 * @async
 * @function
 * @name processUpdateMessageAfterSending
 * @kind function
 * @param {string} whatsapp_message_tracker_id id of previously created tracker
 * @param {string} whatsapp_chat_id id of previously created message
 * @param {string} sendWhatsAppTemplateMessageResponse send response
 * @param {string} user_id user id
 * @param {object} log server log
 */
async function processUpdateMessageAfterSending({
  whatsapp_message_tracker_id,
  whatsapp_chat_id,
  sendWhatsAppTemplateMessageResponse,
  user_id,
  log,
}) {
  log.info({
    message: 'Updating data to message tables',
    data: {
      whatsapp_message_tracker_id: `${whatsapp_message_tracker_id}`,
      whatsapp_chat_id: `${whatsapp_chat_id}`,
      sendWhatsAppTemplateMessageResponse,
    },
    consumerType: 'PAVE_CREATE_PROPOSAL',
  });
  const whatsapp_message_update_transaction =
    await models.sequelize.transaction();
  try {
    log.info({
      message: 'tracker update data',
      data: {
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        pending: 0,
        sent: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
      },
    });
    await c.whatsappMessageTracker.update(
      whatsapp_message_tracker_id,
      {
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        pending: 0,
        sent: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
      },
      user_id,
      {
        transaction: whatsapp_message_update_transaction,
      },
    );
    log.info({
      message: 'chat update data',
      data: {
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        sent: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
      },
    });
    await c.whatsappChat.update(
      whatsapp_chat_id,
      {
        original_event_id: h.notEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        sent: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
      },
      user_id,
      {
        transaction: whatsapp_message_update_transaction,
      },
    );
    await whatsapp_message_update_transaction.commit();
  } catch (triggerTemplateMessageErr) {
    Sentry.captureException(triggerTemplateMessageErr);
    log.error({
      action: 'WHATSAPP MESSAGE UPDATE ERROR',
      response: triggerTemplateMessageErr,
      stringifiedErr: JSON.stringify(triggerTemplateMessageErr),
    });
    await whatsapp_message_update_transaction.rollback();
    throw new Error('WHATSAPP MESSAGE UPDATE ERROR');
  }
}

/**
 * Description
 * Function to save message data to unified inbox table
 * @async
 * @function
 * @name processUnifiedInboxSaving
 * @kind function
 * @param {date} broadcast_date campaign date
 * @param {string} campaign_name campaign name
 * @param {string} campaign_label label
 * @param {string} tracker_ref_name campaign tracker number
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {object} contact contact data
 * @param {object} wabaOwnerwaba data
 * @param {string} current_agency_user_id current contact owner
 * @param {object} sendWhatsAppTemplateMessageResponse send response
 * @param {object} failed_reason failed reason
 * @param {string} msg_body message
 * @param {number} template_count template count
 * @param {number} template_index index of selected template
 * @param {number} total total recipient
 * @param {string} user_id user id
 * @param {string} whatsapp_message_tracker_id tracker id to link in unified
 * inbox
 * @param {object} log server log
 * @returns {Promise} returns the tracker, chat, and unified inbox id
 */
async function processUnifiedInboxSaving({
  broadcast_date,
  campaign_name,
  tracker_ref_name,
  agency_id,
  contact_id,
  contact,
  wabaOwner,
  current_agency_user_id,
  sendWhatsAppTemplateMessageResponse,
  msg_body,
  template_count,
  total,
  user_id,
  whatsapp_message_tracker_id,
  log,
}) {
  const hasUnifiedEntry = await c.unifiedInbox.findOne({
    agency_fk: agency_id,
    contact_fk: contact_id,
    receiver: contact?.mobile_number,
    msg_platform: 'whatsapp',
    tracker_type: 'main',
  });

  log.info({
    message: 'Checking if with unified inbox entry record',
    hasUnifiedEntry: hasUnifiedEntry,
    hasUnifiedEntryID: hasUnifiedEntry?.unified_inbox_id,
  });

  // initialize null unified_inbox_id
  let unified_inbox_id = null;
  try {
    // prepare the create/update data for unified inbox
    const sanitizedUnescapedValue =
      h.general.sanitizeMaliciousAttributes(msg_body);

    const unifiedData = {
      tracker_id: whatsapp_message_tracker_id,
      campaign_name: campaign_name,
      tracker_ref_name,
      agency_fk: agency_id,
      contact_fk: contact_id,
      agency_user_fk: current_agency_user_id,
      receiver: contact?.mobile_number,
      sender: wabaOwner?.waba_number,
      event_id: h.notEmpty(
        sendWhatsAppTemplateMessageResponse.original_event_id,
      )
        ? sendWhatsAppTemplateMessageResponse.original_event_id
        : null,
      msg_body: sanitizedUnescapedValue,
      msg_type: 'frompave',
      msg_platform: 'whatsapp',
      pending: 0,
      failed: h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
      batch_count: total,
      created_by: user_id,
      broadcast_date: new Date(broadcast_date),
      last_msg_date: new Date(broadcast_date),
      template_count: template_count,
      tracker_type: 'main',
    };

    if (
      h.notEmpty(hasUnifiedEntry) &&
      h.notEmpty(hasUnifiedEntry?.unified_inbox_id)
    ) {
      // updating an existing unified inbox for the contact
      unified_inbox_id = hasUnifiedEntry.unified_inbox_id;
      log.info({
        action: 'update existing unified inbox record',
        message: 'unified inbox data',
        unified_inbox_id: `${unified_inbox_id}`,
        user_id,
        data: unifiedData,
      });
      unified_inbox_id = await c.unifiedInbox.update(
        unified_inbox_id,
        unifiedData,
        user_id,
      );
    } else {
      // if unified inbox entry for contact does not exist
      log.info({
        action: 'creating new unified inbox record',
        message: 'unified inbox data',
        unified_inbox_id: 'to be created',
        user_id,
        data: unifiedData,
      });
      unified_inbox_id = await c.unifiedInbox.create(unifiedData);
    }
    return unified_inbox_id;
  } catch (unifiedInboxErr) {
    log.error({
      action: 'UNIFIED INBOX UPDATE ERROR',
      response: unifiedInboxErr,
      stringifiedErr: JSON.stringify(unifiedInboxErr),
    });
    Sentry.captureException(unifiedInboxErr);
    throw new Error('UNIFIED INBOX UPDATE ERROR');
  }
}

/**
 * Description
 * Function to update the message records in unified inbox after actual sending
 * @async
 * @function
 * @name updateUnifiedInboxDraft
 * @kind function
 * @param {string} whatsapp_message_tracker_id id of previously created tracker
 * @param {string} unified_inbox_id id of previously created unified inbox
 * @param {string} sendWhatsAppTemplateMessageResponse send response
 * @param {string} user_id user id
 * @param {object} log server log
 */
async function updateUnifiedInboxDraft({
  whatsapp_message_tracker_id,
  unified_inbox_id,
  sendWhatsAppTemplateMessageResponse,
  user_id,
  log,
}) {
  log.info({
    message: 'Updating data to unified inbox table',
    data: {
      whatsapp_message_tracker_id: `${whatsapp_message_tracker_id}`,
      unified_inbox_id: `${unified_inbox_id}`,
      sendWhatsAppTemplateMessageResponse,
    },
    consumerType: 'PAVE_CREATE_PROPOSAL',
  });
  const unifiedUpdateData = {
    tracker_id: whatsapp_message_tracker_id,
    event_id: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)
      ? sendWhatsAppTemplateMessageResponse.original_event_id
      : null,
    pending: 0,
    sent: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
    failed: h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
    updated_by: user_id,
  };
  try {
    log.info({
      message: 'unified inbox update data',
      unified_inbox_id: `${unified_inbox_id}`,
      data: unifiedUpdateData,
    });
    await models.unified_inbox.update(unifiedUpdateData, {
      where: { unified_inbox_id },
    });
  } catch (unifiedInboxUpdateErr) {
    Sentry.captureException(unifiedInboxUpdateErr);
    log.error({
      action: 'UNIFIED INBOX LAST UPDATE ERROR',
      response: unifiedInboxUpdateErr,
      stringifiedErr: JSON.stringify(unifiedInboxUpdateErr),
    });
    throw new Error('UNIFIED INBOX LAST UPDATE ERROR');
  }
}

/**
 * Description
 * Function to set contact status to active when a campaign message failed
 * @async
 * @function
 * @name setContactAsInactiveDueToFailedMessage
 * @kind function
 * @param {string} agency_id agency ID
 * @param {string} contact_id contact ID
 * @param {string} mobile_number contact mobile number
 * @param {object} log server log
 */
async function setContactAsInactiveDueToFailedMessage(
  agency_id,
  contact_id,
  mobile_number,
  log,
) {
  log.info({
    message: 'Setting contact status to inactive due to failed message sending',
    data: {
      agency_id,
      contact_id,
      mobile_number,
    },
    consumerType: 'PAVE_CREATE_PROPOSAL',
  });
  const contact_tx = await models.sequelize.transaction();
  try {
    await models.contact.update(
      {
        status: 'inactive',
      },
      {
        where: {
          [Op.or]: [{ contact_id }, { agency_fk: agency_id, mobile_number }],
        },
        transaction: contact_tx,
      },
    );
    await contact_tx.commit();
  } catch (contactErr) {
    await contact_tx.rollback();
    Sentry.captureException(contactErr);
    log.error({
      action: 'FAILED MESSAGE CONTACT SET INACTIVE ERROR',
      response: contactErr,
      stringifiedErr: JSON.stringify(contactErr),
    });
    throw new Error('FAILED MESSAGE CONTACT SET INACTIVE ERROR');
  }
}

/**
 * Description
 * Validate if the given owner ID is a UUID
 * @function
 * @name isValidContactOwnerID
 * @kind function
 * @param {string} contact_owner_id
 * @returns {boolean} returs boolean
 */
function isValidContactOwnerID(contact_owner_id) {
  if (h.isEmpty(contact_owner_id)) {
    return false;
  }
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(contact_owner_id);

  return isValid;
}

/**
 * Description
 * Validates if the default contact owner still exists
 * @async
 * @function
 * @name validateDefaultContactOwner
 * @kind function
 * @param {string} agency_user_id
 * @returns {Promise} returns back the agency user id or null
 */
async function validateDefaultContactOwner(agency_user_id) {
  // check agency user record
  const agencyUser = await c.agencyUser.findOne({
    agency_user_id: agency_user_id,
  });
  if (h.isEmpty(agencyUser)) {
    return null;
  }

  // check user record
  const agencyUserRecord = await c.user.findOne({
    user_id: agencyUser?.user_fk,
  });
  if (h.isEmpty(agencyUserRecord)) {
    return null;
  }

  return agency_user_id;
}

/**
 * Description
 * Function to send flow message
 * @async
 * @function
 * @name processSendBookingFlow
 * @kind function
 * @param {object} params breakdown below
 * @param {string} agency_id agency id
 * @param {string} flow_id whatsapp flow id
 * @param {string} node_id node id
 * @param {object} flow flow id
 * @param {string} rule_id automation rule id
 * @param {string} receiver_number contact number
 * @param {string} agencyBufferedCredentials waba credentials
 * @param {object} log server log
 * @returns {Promise} returns sending status
 */
async function processSendBookingFlow(params, log) {
  const { whatsapp_config } = await models.agency_config.findOne({
    where: { agency_fk: params.agency_id },
  });
  const config = JSON.parse(whatsapp_config);
  const environment = config.environment;

  const messageParts = [];

  const body = {
    id: '1',
    contentType: 'text/plain',
    size: 1000,
    type: 'body',
    data: params.flow.flow_body,
    sort: 0,
  };
  messageParts.push(body);

  const flowData = {
    token: `whatsapp_flow_id:${params.flow.whatsapp_flow_id}|node_id:${params.node_id}|automation_rule_id:${params.rule_id}`,
    id: params.flow_id,
    title: params.flow.flow_initial_cta_button,
    payload: params.flow.flow_payload,
    mode: params.flow.flow_status,
  };

  const flow = {
    id: '2',
    contentType: 'text/plain',
    data: JSON.stringify(flowData),
    size: 1000,
    type: 'flow',
    sort: 1,
  };
  messageParts.push(flow);

  const sendMessagePartsData = {
    message: {
      receivers: [
        {
          name: 'Me',
          address: `${params.receiver_number}`,
          Connector: `${params.receiver_number}`,
        },
      ],
      parts: messageParts,
    },
  };
  log.info({
    function: 'processSendBookingFlow',
    message: '******* sendMessagePartsData ******',
    data: sendMessagePartsData,
  });
  const sendWhatsAppFlowMessageResponse =
    await h.whatsapp.sendWhatsAppTemplateMessage(
      params.receiver_number,
      true,
      null,
      sendMessagePartsData,
      params.agencyBufferedCredentials,
      environment,
      'create',
      log,
    );
  return {
    success: h.notEmpty(sendWhatsAppFlowMessageResponse?.original_event_id),
    original_event_id: h.notEmpty(
      sendWhatsAppFlowMessageResponse?.original_event_id,
    )
      ? sendWhatsAppFlowMessageResponse.original_event_id
      : null,
    msg_body: null,
  };
}
