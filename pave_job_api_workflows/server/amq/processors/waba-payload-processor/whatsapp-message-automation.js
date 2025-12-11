const Sentry = require('@sentry/node');
const c = require('../../../controllers');
const models = require('../../../models');
const h = require('../../../helpers');
const constant = require('../../../constants/constant.json');
const { Op } = require('sequelize');
const whatsAppCommonFunctions = require('./whatsapp-common-functions-handler');
const messageDBHandler = require('./db/message');
const contactDBHandler = require('./db/contact');
const notificationHandler = require('./whatsapp-notification-handler');
const moment = require('moment');
const {
  createReminderFromTrigger,
  createReminderFromSucceedingMessage,
} = require('../whatsapp-flow-processor/process-appointment-reminder');
const { processCancelOrder } = require('../wix-payload');

const {
  agency: agencyModel,
  agency_config: agencyConfigModel,
  whatsapp_chat: whatsappChatModel,
  whatsapp_message_tracker: whatsappMessageTrackerModel,
  contact_salesforce_data: contactSalesforDataModel,
  live_chat_settings: liveChatSettingsModel,
} = models;

/**
 * Description
 * Function to receive automation request
 * @async
 * @function
 * @name processAutomation
 * @kind function
 * @param {object} params breakdown below
 * @param {string} rule_id rule id
 * @param {string} agency_id agency id
 * @param {object} waba waba details
 * @param {object} automation_template template for automation workflow
 * @param {string} msg_type message type
 * @param {string} original_event_id message event id
 * @param {string} msgData message
 * @param {string} media_url media url
 * @param {string} media_msg_id media id
 * @param {string} msg_id message id
 * @param {string} content_type content type of media
 * @param {string} file_name media file name
 * @param {string} caption message caption
 * @param {timestamp} msg_timestamp timestamp
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} sender_url waba number url
 * @param {string} receiver_url contact number url
 * @param {string} reply_to_original_event_id reply to event id
 * @param {string} reply_to_content reply to content
 * @param {string} reply_to_msg_type reply to message type
 * @param {string} reply_to_file_name reply to file name
 * @param {string} reply_to_contact_id reply to contact
 * @param {boolean} is_new_contact check if new contact
 * @param {object} contact contact data
 * @param {boolean} is_new_workflow_message check if new message
 * @param {is_broadcast_campaign} is_broadcast_campaign boolean. true for broadcast automation
 * @param {object} log server log
 * @param {object} additionalConfig cnsumer additional config
 */
async function processAutomation(params, log, additionalConfig) {
  try {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processAutomation',
      message: 'preparing automation process',
      is_new_contact: params.is_new_contact,
    });

    const automation_flow = JSON.parse(
      params.automation_template.message_flow_data,
    );
    const agencyWhatsAppCredentials =
      params.waba?.agency_whatsapp_api_token +
      ':' +
      params.waba?.agency_whatsapp_api_secret;
    const agencyBufferedCredentials = Buffer.from(
      agencyWhatsAppCredentials,
      'utf8',
    ).toString('base64');

    const { whatsapp_config } = await agencyConfigModel.findOne({
      where: { agency_fk: params.agency_id },
    });
    const config = JSON.parse(whatsapp_config);
    const environment = config.environment;

    const liveChatSettings = await liveChatSettingsModel.findOne({
      where: {
        agency_fk: params.agency_id,
      },
      order: [['created_date', 'DESC']],
    });

    let field_configurations = null;
    if (
      h.notEmpty(liveChatSettings) &&
      h.notEmpty(liveChatSettings?.field_configuration)
    ) {
      field_configurations = JSON.parse(liveChatSettings.field_configuration);
    }

    const {
      contact_id,
      contactFirstName,
      contactLastName,
      agency_user_id,
      agent_first_name,
      agent_last_name,
      agent_email,
    } = await contactDataProcessing(
      {
        is_new_contact: params.is_new_contact,
        waba: params.waba,
        receiver_number: params.receiver_number,
        receiver_url: params.receiver_url,
        agency_id: params.agency_id,
        contact: params.contact,
      },
      log,
    );

    log.info('📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️');
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processAutomation',
      message: `************ contact_id ******** ${contact_id}`,
    });
    log.info('📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️📞☎️');

    // will only create contact salesforce record if no existing yet
    // and live chat settings for salesforce and whatsapp is configured
    if (
      h.cmpBool(liveChatSettings?.whatsapp_salesforce_enabled, true) &&
      h.notEmpty(liveChatSettings?.salesforce_transmission_type) &&
      h.notEmpty(field_configurations)
    ) {
      const contact_salesforce_data_record =
        whatsAppCommonFunctions.processNewContactSalesforceData(
          {
            sender_number: params.sender_number,
            receiver_number: params.receiver_number,
            agency_id: params.agency_id,
            contact_id,
            contactFirstName,
            contactLastName,
            field_configurations,
          },
          log,
        );
      await contactDBHandler.saveInitialContactSalesforceRecord({
        contact_id,
        contact_salesforce_data_record,
        log,
      });
    }

    const automationData = {
      ...params,
      automation_flow,
      contact_id,
      contactFirstName,
      contactLastName,
      agent_first_name,
      agent_last_name,
      agent_email,
      agency_user_id,
      broadcast_date: new Date(),
    };
    await runAutomation(automationData, additionalConfig, log);
  } catch (error) {
    Sentry.captureException(error);
    log.error({ error });
  }
}

/**
 * Description
 * Function to process determining contact to be used for automation
 * This will also create a new contact if needed
 * @async
 * @function
 * @name contactDataProcessing
 * @kind function
 * @param {object} params breakdown below
 * @param {boolean} is_new_contact checks if new contact
 * @param {object} addContactResponse object to check if contact has
 * been linked to waba
 * @param {object} waba waba details
 * @param {string} receiver_number contact number
 * @param {string} receiver_url contact whatsapp number url
 * @param {string} agency_id agency id
 * @param {object} contact contact details
 * @param {object} log server log
 * @returns {Promise} returns contact and agent details
 */
async function contactDataProcessing(params, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'contactDataProcessing',
    message: 'preparing contact data for automation',
    is_new_contact: params.is_new_contact,
  });
  let contact_id = null;
  const contact = params.contact;
  if (h.cmpBool(params.is_new_contact, true)) {
    const { contactFirstName, contactLastName, contactStatus } =
      await contactIdentityProcessing({
        waba: params.waba,
        receiver_number: params.receiver_number,
        receiver_url: params.receiver_url,
        log,
      });

    const { agency_user_id, agent_first_name, agent_last_name, agent_email } =
      await whatsAppCommonFunctions.getGetNewContactOwner(params.agency_id);

    contact_id = await contactDBHandler.processSaveContactRecord({
      contactData: {
        agency_id: params.agency_id,
        contactFirstName,
        contactLastName,
        receiver_number: params.receiver_number,
        contactStatus,
        agency_user_id,
        is_whatsapp: 1,
      },
      contactSourceData: {
        source_type: 'WHATSAPP',
        source_contact_id: params.receiver_number,
      },
      log,
    });
    return {
      contact_id,
      contactFirstName,
      contactLastName,
      agency_user_id,
      agent_first_name,
      agent_last_name,
      agent_email,
    };
  } else {
    contact_id = contact?.contact_id;
    const agency_user_id = contact?.agency_user_fk;
    const { agent_first_name, agent_last_name, agent_email } =
      await whatsAppCommonFunctions.getContactOwnerDetails(agency_user_id);
    const contactFirstName = contact?.first_name;
    const contactLastName = contact?.last_name;
    return {
      contact_id,
      contactFirstName,
      contactLastName,
      agency_user_id,
      agent_first_name,
      agent_last_name,
      agent_email,
    };
  }
}

/**
 * Description
 * Function to retrieve contact details based on given payload data
 * @async
 * @function
 * @name contactIdentityProcessing
 * @kind function
 * @param {object} waba waba details
 * @param {string} receiver_number contact number
 * @param {string} receiver_url contact whatsapp number url
 * @param {object} log server log
 * @returns {Promise} returns contact details based on payload data
 */
async function contactIdentityProcessing({
  waba,
  receiver_number,
  receiver_url,
  log,
}) {
  let contactFirstName = null;
  let contactLastName = null;
  let contactNameRetrieved = false;
  let contactStatus = 'active';
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'contactIdentityProcessing',
    message: 'getting contact name when new contact using UIB',
  });
  const waUserProfile = await h.general.getUIBChannelUserProfile({
    user_profile_id: receiver_number,
    api_token: waba?.agency_whatsapp_api_token,
    api_secret: waba?.agency_whatsapp_api_secret,
  });
  if (!h.isEmpty(waUserProfile.displayName)) {
    const lineProfileName = waUserProfile.displayName;
    const firstSpaceIndex = lineProfileName.indexOf(' ');
    contactFirstName = lineProfileName.slice(0, firstSpaceIndex);
    contactLastName = lineProfileName.slice(firstSpaceIndex + 1);
    contactNameRetrieved = true;
  }

  // name retrieval
  if (h.cmpBool(contactNameRetrieved, false)) {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'contactIdentityProcessing',
      message: 'getting contact name when new contact using receiver URL',
    });
    const whatsAppReceiverURL = new URL(receiver_url);
    const searchParams = new URLSearchParams(whatsAppReceiverURL.search);
    const whatsAppName = searchParams.get('name');

    if (!h.isEmpty(whatsAppName)) {
      const firstSpaceIndex = whatsAppName.indexOf(' ');
      if (!h.cmpInt(firstSpaceIndex, -1)) {
        contactFirstName = whatsAppName.slice(0, firstSpaceIndex);
        contactLastName = whatsAppName.slice(firstSpaceIndex + 1);
      } else {
        contactFirstName = whatsAppName;
        contactLastName = null;
      }
    } else {
      let colorRandomKey, objectRandomKey;
      const colors = constant.RANDOM_NAME.COLOR;
      const colorEntries = Object.entries(colors);
      const colorRandomIndex = Math.floor(Math.random() * colorEntries.length);
      [colorRandomKey, contactFirstName] = colorEntries[colorRandomIndex];
      const objects = constant.RANDOM_NAME.OBJECT;
      const objectEntries = Object.entries(objects);
      const objectRandomIndex = Math.floor(
        Math.random() * objectEntries.length,
      );
      [objectRandomKey, contactLastName] = objectEntries[objectRandomIndex];
      contactStatus = 'outsider';
    }
  }

  return { contactFirstName, contactLastName, contactStatus };
}

/**
 * Description
 * Function to run the automation process
 * @async
 * @function
 * @name runAutomation
 * @kind function
 * @param {object} params breakdown below
 * @param {string} rule_id
 * @param {boolean} is_new_workflow_message
 * @param {object} automation_flow
 * @param {object} waba
 * @param {string} agency_id
 * @param {string} contact_id
 * @param {string} contactFirstName
 * @param {string} contactLastName
 * @param {string} agent_first_name
 * @param {string} agent_last_name
 * @param {string} agent_email
 * @param {string} agency_user_id
 * @param {string} original_event_id
 * @param {string} message
 * @param {string} message_media_url
 * @param {string} media_message_id
 * @param {string} msg_id
 * @param {timestamp} msg_timestamp
 * @param {string} sender_number
 * @param {string} receiver_number
 * @param {string} sender_url
 * @param {string} receiver_url
 * @param {string} msg_type
 * @param {string} reply_to_original_event_id
 * @param {string} reply_to_content
 * @param {string} reply_to_msg_type
 * @param {string} reply_to_file_name
 * @param {string} reply_to_contact_id
 * @param {string} caption
 * @param {boolean} is_broadcast_campaign
 * @param {string} file_name
 * @param {string} content_type
 * @param {date} broadcast_date
 * @param {object} additionalConfig
 * @param {object} log
 */
async function runAutomation(params, additionalConfig, log) {
  const {
    wabaOwner,
    agency,
    tracker_ref_name,
    campaign_name,
    msg_origin,
    msg_info,
    contactAgencyUser,
    agencyBufferedCredentials,
    new_record,
  } = await prepareTrackerAutomationData(params, log);

  const contactMessageParams = params;
  contactMessageParams.msg_id = params.rule_id;
  contactMessageParams.msg_origin = msg_origin;
  contactMessageParams.msg_info = msg_info;
  contactMessageParams.wabaOwner = wabaOwner;
  contactMessageParams.new_record = new_record;
  contactMessageParams.tracker_ref_name = tracker_ref_name;
  contactMessageParams.campaign_name = campaign_name;
  contactMessageParams.broadcast_date = params.broadcast_date;
  const { whatsapp_chat_id } = await messageDBHandler.processSaveContactMessage(
    contactMessageParams,
    log,
  );

  await messageDBHandler.updateLatestMessageTrackerForContactAsRead({
    agency_id: params.agency_id,
    sender_number: params.sender_number,
    receiver_number: params.receiver_number,
    log,
  });

  const appSyncParams = params;
  appSyncParams.position = 'runAutomation';
  appSyncParams.platform = 'whatsapp';
  appSyncParams.campaign_name = campaign_name;
  appSyncParams.agency_fk = params.agency_id;
  appSyncParams.contact_fk = params.contact_id;
  appSyncParams.agency_user_fk = params.agency_user_id;
  appSyncParams.msg_body = params.message;
  appSyncParams.media_url = params.message_media_url;
  appSyncParams.media_msg_id = params.media_message_id;
  appSyncParams.reply_to_event_id = params.reply_to_original_event_id;
  appSyncParams.sent = 1;
  appSyncParams.delivered = 1;
  appSyncParams.read = 1;
  notificationHandler.sendAppsyncContactNotificationMessage(appSyncParams, log);

  // Don't send notification for broadcast automation if it is disabled from settings.
  let sendEmailNotification = true;
  if (
    h.cmpBool(params?.is_broadcast_campaign, true) &&
    h.cmpBool(agency?.campaign_notification_disable, true)
  ) {
    sendEmailNotification = false;
  }

  log.info({
    sendEmailNotification,
    is_broadcast_campaign: params?.is_broadcast_campaign,
    campaign_notification_disable: agency?.campaign_notification_disable,
  });

  const message_content = params.message;

  const whatsappMsgTrackerForReplyUpdate =
    await c.whatsappMessageTracker.findOne({
      receiver_number: params.receiver_number,
      agency_fk: params.agency_id,
    });

  // check if message is an unsubscribe trigger message
  const newOptOutStatus = await whatsAppCommonFunctions.handleOptOutStatus({
    replyMsg: message_content,
    opt_out: false,
    whatsappMsgTrackerForReplyUpdate,
    log,
  });

  // if message is an unsubscribe trigger mark contact as optout
  if (
    h.cmpStr(message_content.toLowerCase(), 'unsubscribe') ||
    h.cmpBool(newOptOutStatus, true)
  ) {
    await contactDBHandler.handleOptOutInAutoResponse({
      whatsappMsgTrackerForReplyUpdate,
      receiver_number: params.receiver_number,
      models,
      log,
    });

    // cancel wix subscription if contact unsubscribes
    if (h.cmpStr(params.agency_id, process.env.DEALZ_AGENCY_ID)) {
      await processCancelOrder({ contactId: params.contact_id, log });
    }
  }

  const updatedContact = await c.contact.findOne({
    agency_fk: params.agency_id,
    mobile_number: params.receiver_number,
  });

  if (
    h.cmpBool(updatedContact?.opt_out_whatsapp, false) &&
    ['active', 'outsider'].includes(updatedContact?.status)
  ) {
    const triggerData = params;
    triggerData.wabaOwner = wabaOwner;
    triggerData.agency = agency;
    triggerData.contactAgencyUser = contactAgencyUser;
    triggerData.agencyBufferedCredentials = agencyBufferedCredentials;
    await processTriggerAutomationMessage(triggerData, additionalConfig, log);
  }

  // send email notification for the contact message
  if (h.cmpBool(sendEmailNotification, true)) {
    h.whatsapp.notifyUserMessageInteraction({
      agency_id: params.agency_id,
      agent_name: contactAgencyUser.user.first_name,
      agent_email: contactAgencyUser.user.email,
      additional_emails: agency?.agency_campaign_additional_recipient,
      chat_id: whatsapp_chat_id,
      contact_name: `${params.contactFirstName} ${params.contactLastName}`,
      replyMsg: params.message,
      msgType: params.msg_type,
      newMsg: params.is_new_workflow_message,
      log,
    });
  }
}

/**
 * Description
 * Process triggering automation message if contact is not opt out
 * and to check if respective node will trigger a response
 * @async
 * @function
 * @name processTriggerAutomationMessage
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} rule_id automation rule id
 * @param {boolean} is_new_workflow_message check if new message for automation
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {string} msg_type message type
 * @param {string} message message content
 * @param {string} agency_user_id contact owner id
 * @param {object} automation_flow automation flow nodes
 * @param {object} agency agency data
 * @param {object} contactAgencyUser agency user data
 * @param {string} contactFirstName contact first name
 * @param {string} contactLastName contact last name
 * @param {string} agent_first_name agent first name
 * @param {string} agent_last_name agent last name
 * @param {string} agent_email agent email
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} reply_to_original_event_id reply to event id
 * @param {string} agencyBufferedCredentials waba credentials
 * @param {string} is_broadcast_campaign boolean. True if campaignType is automation
 * @param {object} additionalConfig consumer additional config
 * @param {object} log server log
 */
async function processTriggerAutomationMessage(params, additionalConfig, log) {
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let node_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let flow_id = null;
  let flow = null;
  let is_end = false;
  let jump_to = null;
  let sf_id = null;
  let nodeFound = false;
  let is_reminder = false;
  const automation_flow = params.automation_flow;

  try {
    const latestWorkflowTracker = await whatsappMessageTrackerModel.findOne({
      where: {
        receiver_number: params.receiver_number,
        sender_number: params.sender_number,
        agency_fk: params.agency_id,
        msg_id: params.rule_id,
        msg_origin: params?.is_broadcast_campaign ? 'campaign' : 'user',
        tracker_ref_name: {
          [Op.like]: params?.is_broadcast_campaign
            ? `%${params.tracker_name}%`
            : `%_${params.tracker_name}_%`,
        },
      },
      order: [['created_date', 'DESC']],
    });

    const nodeArr = automation_flow.nodes;
    const edgeArr = automation_flow.edges;

    // first automation message preparation
    if (h.cmpBool(params.is_new_workflow_message, true)) {
      log.info('**********************************');
      log.info('*****SENDING FIRST AUTOMATION MSG****');
      log.info('**********************************');

      const { contact_name, agent_name } = await getFlowBodyVariableValues(
        params?.contact_id,
        params?.agency_user_id,
      );
      const parentMessage = await handleInitialNodeMessage(
        automation_flow,
        contact_name,
        agent_name,
        log,
      );
      node_id = parentMessage.node_id;
      message_content = parentMessage.message_content;
      header_image = parentMessage.header_image;
      template_id = parentMessage.template_id;
      variable_arr = parentMessage.variable_arr;
      template = parentMessage.template;
      template_name = parentMessage.template_name;
      language = parentMessage.language;
      flow_id = parentMessage.flow_id;
      flow = parentMessage.flow;
      is_end = parentMessage.is_end;
      jump_to = parentMessage.jump_to;
      nodeFound = parentMessage.nodeFound;
    } else {
      log.info('**********************************');
      log.info('*****SUCCEEDING AUTOMATION MSG PREPARATION****');
      log.info('**********************************');
      // succeeding automation message preparation
      const lastWorkflowMessage = await whatsappChatModel.findOne({
        where: {
          receiver_number: params.receiver_number,
          sender_number: params.sender_number,
          agency_fk: params.agency_id,
          campaign_name: latestWorkflowTracker.campaign_name,
          msg_origin: 'automation',
        },
        order: [['created_date', 'DESC']],
      });

      const { source_contact_id } = await getSalesforceData(params.contact_id);
      sf_id = source_contact_id;

      let currentMsgInfo = lastWorkflowMessage.msg_info;
      log.info({ message: 'lastWorkflowMessage', data: lastWorkflowMessage });
      let isReplyNode = false;

      const notMesageNode = h.automation.getNextNode(
        currentMsgInfo,
        nodeArr,
        edgeArr,
        false,
      );
      const isNotMessageNode =
        !notMesageNode || notMesageNode?.type !== 'reminder';
      if (
        h.notEmpty(params?.reply_to_original_event_id) &&
        params.msg_type !== 'flow' &&
        isNotMessageNode
      ) {
        const replyToChat = await whatsappChatModel.findOne({
          where: {
            original_event_id: params.reply_to_original_event_id,
          },
        });
        log.info({ message: 'replyToChat', data: replyToChat });
        if (h.notEmpty(replyToChat)) {
          isReplyNode = true;
          currentMsgInfo = h.automation.getNextImmediateNodeAfterReply(
            lastWorkflowMessage.msg_info,
            lastWorkflowMessage.msg_body,
            nodeArr,
          );
        }
      }

      log.info({
        message: '****** Latest sent node Id ****',
        data: currentMsgInfo,
      });

      const lastAutomatedMessageNode = h.automation.getNodeById(
        currentMsgInfo,
        nodeArr,
      );

      // get current live chat settings for agency
      const liveChatSettings = await liveChatSettingsModel.findOne({
        where: {
          agency_fk: params.agency_id,
        },
        order: [['created_date', 'DESC']],
      });
      /**
       * if whatsapp salesforce integration is enabled and transmission type is
       * set but no salesforce ID yet, process gathering of required field values
       */
      if (
        h.cmpBool(liveChatSettings?.whatsapp_salesforce_enabled, true) &&
        h.notEmpty(liveChatSettings?.salesforce_transmission_type) &&
        h.isEmpty(sf_id)
      ) {
        await processContactDataSourceForSalesforce({
          agency_id: params.agency_id,
          contact_id: params.contact_id,
          receiver_number: params.receiver_number,
          message: params.message,
          lastAutomatedMessageNode,
          additionalConfig,
          log,
        });
      }

      /**
       * if there is an existing salesforce ID for the current whatsapp contact
       * proceed with the salesforce message transmission process
       */
      if (h.notEmpty(sf_id)) {
        await processMessageTransmission({
          agency_id: params.agency_id,
          contact_id: params.contact_id,
          message: params.message,
          mesageType: 'text',
          additionalConfig,
          log,
        });
      }

      const nextNode = h.automation.getNextNode(
        currentMsgInfo,
        nodeArr,
        edgeArr,
        isReplyNode,
      );

      log.info({ message: '*** Node to send ***', data: nextNode });

      const succeedingMessage = await handleSucceedingAutomationNodeMessage({
        contact_id: params?.contact_id,
        agency_user_id: params?.agency_user_id,
        nextNodes: [nextNode],
        nodeArr,
        msg_type: params.msg_type,
        message: params.message,
        edgeArr,
        log,
      });

      log.info({
        message: '**** succeedingMessage (this will be sent) *** ',
        data: succeedingMessage,
      });

      node_id = succeedingMessage.node_id;
      message_content = succeedingMessage.message_content;
      header_image = succeedingMessage.header_image;
      template_id = succeedingMessage.template_id;
      variable_arr = succeedingMessage.variable_arr;
      template = succeedingMessage.template;
      template_name = succeedingMessage.template_name;
      language = succeedingMessage.language;
      flow_id = succeedingMessage.flow_id;
      flow = succeedingMessage.flow;
      is_end =
        !nextNode || nextNode?.type === 'end'
          ? true
          : nextNode?.type === 'waitThenCheck'
          ? succeedingMessage.is_end
          : false;
      jump_to = succeedingMessage.jump_to;
      nodeFound = succeedingMessage.nodeFound;
      is_reminder = succeedingMessage.is_reminder;
    }

    log.info('*******************************************');
    log.info('*****START SENDING AUTOMATION MSG**********');
    log.info('*******************************************');
    // sending automated response from workflow
    await sendAutomatedWorkflowResponse(
      {
        nodeFound,
        node_id,
        template_id,
        template,
        template_name,
        header_image,
        language,
        variable_arr,
        message_content,
        flow_id,
        flow,
        rule_id: params.rule_id,
        wabaOwner: params.wabaOwner,
        agency: params.agency,
        agency_id: params.agency_id,
        agency_user_id: params.agency_user_id,
        contact_id: params.contact_id,
        contactAgencyUser: params.contactAgencyUser,
        contactFirstName: params.contactFirstName,
        sender_number: params.sender_number,
        receiver_number: params.receiver_number,
        latestWorkflowTracker,
        agencyBufferedCredentials: params.agencyBufferedCredentials,
      },
      additionalConfig,
      log,
    );

    log.info('**********************************************');
    log.info('*****AUTOMATION MSG SENT SUCCESSFULLY**********');
    log.info('**********************************************');
    // trigger jump to feature
    await handleJumpToProcess(
      {
        jump_to,
        nodeArr,
        is_end,
        agency: params.agency,
        agency_id: params.agency_id,
        contactAgencyUser: params.contactAgencyUser,
        contactFirstName: params.contactFirstName,
        wabaOwner: params.wabaOwner,
        agency_user_id: params.agency_user_id,
        contact_id: params.contact_id,
        latestWorkflowTracker,
        sender_number: params.sender_number,
        receiver_number: params.receiver_number,
        agencyBufferedCredentials: params.agencyBufferedCredentials,
      },
      additionalConfig,
      log,
    );

    if (h.cmpBool(params.is_new_workflow_message, true)) {
      // Reminder creation from Trigger
      await createReminderFromTrigger({
        params,
        log: log.child({
          function: 'createReminderFromTrigger',
        }),
      });
    }

    if (
      !h.cmpBool(params.is_new_workflow_message, true) &&
      h.cmpBool(is_reminder, true) &&
      params.msg_type !== 'flow'
    ) {
      await createReminderFromSucceedingMessage({
        params,
        node_id,
        log: log.child({
          function: 'createReminderFromSucceedingMessage',
        }),
      });
    }

    log.info({ message: '******* is_end *****', data: is_end });
    log.info({ message: '******* jump_to *****', data: jump_to });

    // handling end of automation
    if (h.cmpBool(is_end, true) && h.isEmpty(jump_to)) {
      messageDBHandler.endAutomation({
        agency: params.agency,
        agency_id: params.agency_id,
        agency_user_id: params.agency_user_id,
        sender_number: params.sender_number,
        receiver_number: params.receiver_number,
        contact_id: params.contact_id,
        latestWorkflowTracker,
        log,
      });
      log.info('**********************************');
      log.info('*******AUTOMATION COMPLETED*******');
      log.info('**********************************');
    }
  } catch (error) {
    Sentry.captureException(error);
    log.error({ error });
  }
}

/**
 * Description
 * Function to send template message
 * @async
 * @function
 * @name processSendAutomationMessage
 * @kind function
 * @param {object} params breakdown below
 * @param {string} agency_id agency id
 * @param {object} template template data
 * @param {string} template_name template name
 * @param {string} header_image header image
 * @param {string} language template language
 * @param {array} variable_arr variable data
 * @param {object} agency agency data
 * @param {object} contactAgencyUser contact owner
 * @param {string} contactFirstName contact first name
 * @param {string} receiver_number contact mobile number
 * @param {string} agencyBufferedCredentials waba credentials
 * @param {object} log server log
 * @returns {Promise} returns sending status
 */
async function processSendAutomationMessage(params, log) {
  const {
    template,
    header_image = '',
    variable_arr,
    agency,
    contactAgencyUser,
  } = params;
  const { whatsapp_config } = await models.agency_config.findOne({
    where: { agency_fk: params.agency_id },
  });
  let msg_body = '';

  const messageParts = [];
  const messageTemplate = {
    id: '1',
    contentType: 'text/html',
    data: '',
    header: [],
    body: [],
    button: [],
    size: 1000,
    type: 'template',
    sort: 0,
  };

  template.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      if (['IMAGE', 'VIDEO'].includes(component.format)) {
        const filename =
          header_image &&
          header_image.substring(header_image.lastIndexOf('/') + 1);
        if (['IMAGE'].includes(component.format)) {
          messageTemplate.header.push({
            type: 'image',
            image: { link: header_image, filename: filename },
          });
        }
        if (['VIDEO'].includes(component.format)) {
          messageTemplate.header.push({
            type: 'video',
            video: { link: header_image, filename: filename },
          });
        }
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      if (
        header_image &&
        !h.cmpStr(
          header_image,
          'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
        )
      ) {
        template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'HEADER')) {
            if (['IMAGE'].includes(component.format)) {
              msg_body += `<img src="${header_image}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px;">`;
            }
            if (['VIDEO'].includes(component.format)) {
              msg_body += `<video class="campaign_header_image" style="width: 100%; margin-bottom: 20px;" controls src="${header_image}"></video>`;
            }
          }
        });
      }

      msg_body += component.text;
      if (typeof component.example !== 'undefined') {
        const examples =
          component.example.body_text.length > 0
            ? component.example.body_text[0]
            : [];
        examples.forEach((ex, index) => {
          let component_value = null;
          if (variable_arr.length > 0) {
            if (variable_arr[index] === 'agency') {
              component_value = h.general.prettifyConstant(agency?.agency_name);
            } else if (variable_arr[index] === 'agent') {
              component_value = h.general.prettifyConstant(
                contactAgencyUser.user.first_name,
              );
            } else {
              component_value =
                params.contactFirstName || params.receiver_number;
            }
            messageTemplate.body.push({
              type: 'text',
              text: `${component_value}`,
            });
            msg_body = msg_body.replace(`{{${index + 1}}}`, component_value);
          } else {
            msg_body = msg_body.replace(
              `{{${index + 1}}}`,
              params.contactFirstName || params.receiver_number,
            );
          }
        });
      }
    }
    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        msg_body += `<button type="button" style="display:block; margin-top:
        10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; 
        border-radius: 10px; background-color: #ffffff; color: #313131;" 
        class="header-none-btn " disabled>${btn.text}</button>`;
      });
    }
  });

  const body = messageTemplate.body;
  const header = messageTemplate.header;
  const button = messageTemplate.button;

  messageTemplate.data = JSON.stringify({
    element_name: params.template_name,
    language: params.language,
    header: header,
    body: body,
    button: button,
  });
  delete messageTemplate.body;
  delete messageTemplate.header;
  delete messageTemplate.button;
  messageParts.push(messageTemplate);

  const config = JSON.parse(whatsapp_config);
  const environment = config.environment;

  const sendMessagePartsData = {
    message: {
      receivers: [
        {
          name: 'name',
          address: `${params.receiver_number}`,
          Connector: `${params.receiver_number}`,
          type: 'individual',
        },
      ],
      parts: messageParts,
    },
  };

  const sendWhatsAppTemplateMessageResponse =
    await h.whatsapp.sendWhatsAppTemplateMessage(
      params.receiver_number,
      true,
      null,
      sendMessagePartsData,
      params.agencyBufferedCredentials,
      environment,
      'v2_automation',
      log,
    );
  return {
    success: h.notEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id),
    original_event_id: h.notEmpty(
      sendWhatsAppTemplateMessageResponse?.original_event_id,
    )
      ? sendWhatsAppTemplateMessageResponse.original_event_id
      : null,
    msg_body: msg_body,
  };
}

/**
 * Description
 * Function to send text message
 * @async
 * @function
 * @name processSendTextMessage
 * @kind function
 * @param {string} message_content message to send
 * @param {string} agency_id agency id
 * @param {string} receiver_number contact number
 * @param {string} agencyBufferedCredentials waba credentials
 * @param {object} log server log
 * @returns {Promise} returns sending status
 */
async function processSendTextMessage(
  message_content,
  agency_id,
  receiver_number,
  agencyBufferedCredentials,
  log,
) {
  const { whatsapp_config } = await models.agency_config.findOne({
    where: { agency_fk: agency_id },
  });
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

  const config = JSON.parse(whatsapp_config);
  const environment = config.environment;

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

  const sendWhatsAppTemplateMessageResponse =
    await h.whatsapp.sendWhatsAppTemplateMessage(
      receiver_number,
      true,
      null,
      sendMessagePartsData,
      agencyBufferedCredentials,
      environment,
      'v2_automation',
      log,
    );
  return {
    success: h.notEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id),
    original_event_id: h.notEmpty(
      sendWhatsAppTemplateMessageResponse?.original_event_id,
    )
      ? sendWhatsAppTemplateMessageResponse.original_event_id
      : null,
    msg_body: message_content,
  };
}

/**
 * Description
 * Process flow body
 * @async
 * @function
 * @name formatFlowBody
 * @kind function
 * @param {object} flowData single object.
 * @param {object} contact_name contact name
 * @param {object} agent_name agent name
 * @returns {string} returns formatted template_body
 */
function formatFlowBody(flowData, contact_name, agent_name) {
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
      'v2_automation',
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
/**
 * Description
 * Function to handle all succeeding node message conditions
 * @function
 * @name handleSucceedingAutomationNodeMessage
 * @kind function
 * @param {string} contact_id
 * @param {string} agency_user_id
 * @param {object} nextNodes
 * @param {array} nodeArr
 * @param {array} edgeArr
 * @param {string} msg_type
 * @param {string} message
 * @param {object} log
 * @returns {object} node response details
 */
async function handleSucceedingAutomationNodeMessage({
  contact_id,
  agency_user_id,
  nextNodes,
  nodeArr,
  msg_type,
  message,
  edgeArr,
  log,
}) {
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let node_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let is_end = false;
  let jump_to = null;
  let nodeFound = false;
  let flow_id = null;
  let flow = null;
  let is_reminder = false;

  if (h.notEmpty(nextNodes)) {
    for (let nodeIndex = 0; nodeIndex < nextNodes.length; nodeIndex++) {
      // if node type is message
      if (
        h.cmpBool(nodeFound, false) &&
        h.notEmpty(nextNodes[nodeIndex]?.data?.flowData) &&
        h.notEmpty(nextNodes[nodeIndex]?.type) &&
        h.cmpStr(nextNodes[nodeIndex]?.type, 'message')
      ) {
        const templateMessage = await handleTemplateMessage(
          nextNodes,
          nodeIndex,
          nodeArr,
          edgeArr,
          log,
        );
        node_id = templateMessage.node_id;
        message_content = templateMessage.message_content;
        header_image = templateMessage.header_image;
        template_id = templateMessage.template_id;
        variable_arr = templateMessage.variable_arr;
        template = templateMessage.template;
        template_name = templateMessage.template_name;
        language = templateMessage.language;
        is_end = templateMessage.is_end;
        jump_to = templateMessage.jump_to;
        nodeFound = templateMessage.nodeFound;
      }

      // if node type is booking
      if (
        h.cmpBool(nodeFound, false) &&
        h.notEmpty(nextNodes[nodeIndex]?.data?.flowData) &&
        h.notEmpty(nextNodes[nodeIndex]?.type) &&
        h.cmpStr(nextNodes[nodeIndex]?.type, 'booking')
      ) {
        const flowMessage = await handleFlowMessage(
          contact_id,
          agency_user_id,
          nextNodes,
          nodeIndex,
          nodeArr,
          edgeArr,
          log,
        );
        node_id = flowMessage.node_id;
        flow_id = flowMessage.flow_id;
        flow = flowMessage.flow;
        is_end = flowMessage.is_end;
        jump_to = flowMessage.jump_to;
        nodeFound = flowMessage.nodeFound;
      }

      if (
        h.cmpBool(nodeFound, false) &&
        h.notEmpty(nextNodes[nodeIndex]?.data?.flowData) &&
        h.notEmpty(nextNodes[nodeIndex]?.type) &&
        h.cmpStr(nextNodes[nodeIndex]?.type, 'reminder')
      ) {
        const reminder = handleReminder(
          nextNodes,
          nodeIndex,
          nodeArr,
          edgeArr,
          log,
        );
        node_id = reminder.node_id;
        is_end = reminder.is_end;
        jump_to = reminder.jump_to;
        nodeFound = reminder.nodeFound;
        is_reminder = true;
      }

      // if it is conditonal node
      if (
        h.cmpBool(nodeFound, false) &&
        h.cmpStr(nextNodes[nodeIndex]?.type, 'waitThenCheck')
      ) {
        const conditionalData = await handleConditionalNodes({
          contact_id,
          agency_user_id,
          nextNode: nextNodes[nodeIndex],
          message,
          nodeArr,
          edgeArr,
          msgType: msg_type,
          log,
        });

        log.info({
          function: 'handleSucceedingAutomationNodeMessage',
          message: '*** Node to send After matching condition ***',
          data: conditionalData,
        });

        node_id = conditionalData.node_id;
        flow_id = conditionalData.flow_id;
        flow = conditionalData.flow;
        message_content = conditionalData.message_content;
        header_image = conditionalData.header_image;
        template_id = conditionalData.template_id;
        category = conditionalData.category;
        variable_arr = conditionalData.variable_arr;
        template = conditionalData.template;
        template_name = conditionalData.template_name;
        language = conditionalData.language;
        is_end = conditionalData.is_end;
        jump_to = conditionalData.jump_to;
        nodeFound = conditionalData.nodeFound;
      }
    }
  }

  return {
    node_id,
    message_content,
    header_image,
    template_id,
    variable_arr,
    template,
    template_name,
    language,
    flow_id,
    flow,
    is_end,
    jump_to,
    nodeFound,
    is_reminder,
  };
}

/**
 * Description
 * Handling conditional node message
 * @function
 * @name handleConditionalNodes
 * @kind function
 * @param {object} nextNode
 * @param {string} message
 * @param {array} nodeArr
 * @param {array} edgeArr
 * @param {string} msgType
 * @param {object} log
 * @returns {object} returns conditional node response
 */
async function handleConditionalNodes({
  contact_id,
  agency_user_id,
  nextNode,
  message,
  nodeArr,
  edgeArr,
  msgType,
  log,
}) {
  let node_id = null;
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let flow_id = null;
  let flow = null;
  let is_end = null;
  let jump_to = null;
  let nodeFound = false;

  const conditionalOptionNodes = h.automation.getConditionalNodes(
    nextNode.id,
    nodeArr,
  );

  log.info({
    function: 'handleConditionalNodes',
    message: 'conditionalOptionNodes',
    data: conditionalOptionNodes,
  });

  const conditionalOptionNodesResponse = getConditionalNode({
    conditionalOptionNodes,
    message,
    nodeArr,
    conditionalNode: nextNode,
    edgeArr,
    msgType,
    log,
  });

  log.info({
    function: 'handleConditionalNodes',
    message: 'conditionalOptionNodesResponse',
    data: conditionalOptionNodesResponse,
  });

  const conditionalOptionNodesResponseArray = [conditionalOptionNodesResponse];

  if (h.notEmpty(conditionalOptionNodesResponseArray)) {
    for (
      let nodeIndex = 0;
      nodeIndex < conditionalOptionNodesResponseArray.length;
      nodeIndex++
    ) {
      // if node type is message
      if (
        h.cmpBool(nodeFound, false) &&
        h.notEmpty(
          conditionalOptionNodesResponseArray[nodeIndex]?.data?.flowData,
        ) &&
        h.notEmpty(conditionalOptionNodesResponseArray[nodeIndex]?.type) &&
        h.cmpStr(
          conditionalOptionNodesResponseArray[nodeIndex]?.type,
          'message',
        )
      ) {
        const templateMessage = await handleTemplateMessage(
          conditionalOptionNodesResponseArray,
          nodeIndex,
          nodeArr,
          edgeArr,
          log,
        );
        node_id = templateMessage.node_id;
        message_content = templateMessage.message_content;
        header_image = templateMessage.header_image;
        template_id = templateMessage.template_id;
        variable_arr = templateMessage.variable_arr;
        template = templateMessage.template;
        template_name = templateMessage.template_name;
        language = templateMessage.language;
        nodeFound = templateMessage.nodeFound;
      }

      // if node type is booking
      if (
        h.cmpBool(nodeFound, false) &&
        h.notEmpty(
          conditionalOptionNodesResponseArray[nodeIndex]?.data?.flowData,
        ) &&
        h.notEmpty(conditionalOptionNodesResponseArray[nodeIndex]?.type) &&
        h.cmpStr(
          conditionalOptionNodesResponseArray[nodeIndex]?.type,
          'booking',
        )
      ) {
        const flowMessage = await handleFlowMessage(
          contact_id,
          agency_user_id,
          conditionalOptionNodesResponseArray,
          nodeIndex,
          nodeArr,
          edgeArr,
          log,
        );
        node_id = flowMessage.node_id;
        flow_id = flowMessage.flow_id;
        flow = flowMessage.flow;
        jump_to = flowMessage.jump_to;
        nodeFound = flowMessage.nodeFound;
      }
    }
  }
  is_end = conditionalOptionNodesResponse?.type === 'end';

  return {
    node_id,
    message_content,
    header_image,
    template_id,
    variable_arr,
    template,
    template_name,
    language,
    is_end,
    jump_to,
    flow_id,
    flow,
    nodeFound,
  };
}

/**
 * Description
 * Get record salesforce data
 * @async
 * @function
 * @name getSalesforceData
 * @kind function
 * @param {string} contact_id
 * @returns {Promise} salesforce data
 */
async function getSalesforceData(contact_id) {
  const contact_source_data = await c.contactSource.findOne({
    contact_fk: contact_id,
    source_type: 'SALESFORCE',
    [Op.or]: [
      {
        source_contact_id: {
          [Op.not]: null,
        },
      },
      {
        source_contact_id: {
          [Op.not]: '',
        },
      },
    ],
  });
  const source_contact_id = h.notEmpty(contact_source_data?.source_contact_id)
    ? contact_source_data?.source_contact_id
    : null;
  const sf_record = await c.contactSalesforceData.findOne({
    contact_fk: contact_id,
  });

  return { source_contact_id, sf_record };
}

/**
 * Description
 * Function for handling generation to contact for salesforce
 * @async
 * @function
 * @name processContactDataSourceForSalesforce
 * @kind function
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {string} receiver_number contact number
 * @param {string} message whatsapp message
 * @param {object} lastAutomatedMessageNode last node to complete generation
 * @param {object} additionalConfig consumer config
 * @param {object} log server log
 */
async function processContactDataSourceForSalesforce({
  agency_id,
  contact_id,
  receiver_number,
  message,
  lastAutomatedMessageNode,
  additionalConfig,
  log,
}) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'processContactDataSourceForSalesforce',
    message: 'generate salesforce record and transmit message thread up to now',
  });
  let sf_id;
  const tnCDate = new Date();
  const formattedTnCDate = tnCDate.toISOString().slice(0, 19).replace('T', ' ');
  const parsedDate = moment(formattedTnCDate, 'YYYY-MM-DD HH:mm:ss');
  const finalParsedDate = parsedDate.toDate();
  const liveChatSettings = await c.liveChatSettings.findOne({
    agency_fk: agency_id,
  });

  const agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id,
      status: 'active',
      source: 'SALESFORCE',
    },
  });

  const contact = await c.contact.findOne({
    contact_id,
  });

  const field_configurations = JSON.parse(liveChatSettings.field_configuration);
  const contact_phone_parts = h.mobile.getMobileParts(receiver_number);
  const formatted_contact_phone =
    contact_phone_parts.countryCode + ' ' + contact_phone_parts.restOfNumber;
  const salesforceRecord = await contactSalesforDataModel.findOne({
    where: {
      agency_fk: agency_id,
      contact_fk: contact_id,
      mobile: formatted_contact_phone,
    },
    order: [['created_date', 'DESC']],
  });

  const salesforce_field = lastAutomatedMessageNode?.data.to_salesforce?.value;
  const salesforce_data_fields = {
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    mobile_number: 'mobile',
    product: 'interested_product',
    city: 'interested_city',
    lead_source: 'lead_source',
    lead_channel: 'lead_source_lv1',
    origin: 'lead_source_lv2',
    language: 'language',
    marketing: 'enable_marketing',
  };

  const salesforce_mapping_fields = {
    first_name: 'first_name',
    last_name: 'last_name',
    email_address: 'email',
    phone: 'mobile',
    mobile_number: 'mobile',
    product: 'interested_product',
    city: 'interested_city',
    lead_source: 'lead_source',
    lead_channel: 'lead_source_lv1',
    origin: 'lead_source_lv2',
    language: 'language',
    marketing: 'enable_marketing',
  };

  const sf_required_fields = {};

  if (h.notEmpty(field_configurations)) {
    field_configurations.forEach((configuration) => {
      if (h.cmpBool(configuration.required, true)) {
        if (configuration.field in salesforce_mapping_fields) {
          sf_required_fields[salesforce_mapping_fields[configuration.field]] =
            salesforceRecord[salesforce_mapping_fields[configuration.field]];
        }
      }
    });
  }

  const updateData = {};
  log.info({ message: 'checking field', data: salesforce_field });
  await contactDBHandler.UpdateContactIfSFDC(
    salesforce_field,
    contact_id,
    message,
    log,
  );
  if (h.cmpStr(salesforce_field, 'marketing')) {
    updateData[salesforce_data_fields[salesforce_field]] = true;
    sf_required_fields[salesforce_mapping_fields[salesforce_field]] = true;
  } else {
    // this is to handle request by TEC the values to be submitted in their SF
    // should be the values in constant.AUTOMATION_PRODUCT_TYPES
    if (
      [
        'cf0c1702-23f7-4b0a-9e75-c87bc4c580bd',
        'fcb9edcc-20b3-4103-85e3-dbc50907ae5b',
      ].includes(agency_id) &&
      h.cmpStr(salesforce_field, 'product') &&
      h.notEmpty(constant?.AUTOMATION_PRODUCT_TYPES[message])
    ) {
      let product_value = message;
      // this is to check if the reply from contact is for a product data and
      // matches the index in constant.AUTOMATION_PRODUCT_TYPES
      product_value = constant.AUTOMATION_PRODUCT_TYPES[message];
      log.info({
        message: 'product value to be saved and transmitted',
        data: product_value,
      });
      updateData[salesforce_data_fields[salesforce_field]] = product_value;
      sf_required_fields[salesforce_data_fields[salesforce_field]] =
        product_value;
    } else {
      updateData[salesforce_data_fields[salesforce_field]] = message;
      sf_required_fields[salesforce_data_fields[salesforce_field]] = message;
    }
  }

  log.info({ message: 'sf_required_fields', data: sf_required_fields });
  if (h.automation.checkIfAllNotNull(sf_required_fields)) {
    updateData.tnc_agree = true;
    updateData.tnc_date = finalParsedDate;
    updateData.data_synced = true;
    sf_required_fields.tnc_date = finalParsedDate;
  }

  await contactDBHandler.updateContactSalesforceData(
    updateData,
    salesforceRecord.contact_salesforce_data_id,
    log,
  );

  if (h.automation.checkIfAllNotNull(sf_required_fields)) {
    log.info({
      message: 'the fields for sending record',
      data: sf_required_fields,
    });
    const thread = await whatsappChatModel.findAll({
      where: {
        contact_fk: contact_id,
      },
      include: [
        {
          model: models.contact,
          required: true,
        },
        {
          model: models.agency_user,
          required: true,
          include: [
            {
              model: models.user,
              required: true,
            },
          ],
        },
      ],
      order: [['created_date', 'ASC']],
    });
    if (
      h.notEmpty(liveChatSettings) &&
      h.notEmpty(liveChatSettings?.whatsapp_salesforce_enabled)
    ) {
      sf_id = await h.salesforce.generateSFRecord(
        liveChatSettings,
        sf_required_fields,
        agencyOauth,
        contact,
        thread,
        message,
        log,
        additionalConfig.ek,
      );

      await contactDBHandler.createContactSourceRecord(contact_id, sf_id, log);
    }

    await contactDBHandler.createContactNotes(
      sf_required_fields,
      formatted_contact_phone,
      finalParsedDate,
      contact_id,
    );
  }
}

/**
 * Description
 * Function to process message data transmission to connected salesforce account
 * for the current contact
 * @async
 * @function
 * @name processMessageTransmission
 * @kind function
 * @param {string} contact_id contact id
 * @param {string} agency_id agency
 * @param {string} message message to transmit
 * @param {string} mesageType transmission type
 * @param {object} additionalConfig consumer config
 * @param {object} log server log
 */
async function processMessageTransmission({
  contact_id,
  agency_id,
  message,
  mesageType,
  additionalConfig,
  log,
}) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'processMessageTransmission',
    message: 'transmit mesage to salesforce',
  });
  const contact = await c.contact.findOne({ contact_id });
  const contact_source = await models.contact_source.findOne({
    where: {
      contact_fk: contact_id,
      source_type: 'SALESFORCE',
    },
  });
  const agencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: contact?.agency_user_fk,
    },
    include: [
      {
        model: models.user,
        required: true,
      },
      { model: models.agency, required: true },
    ],
  });

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

  if (!h.isEmpty(contact_source)) {
    await h.salesforce.transmitMessage({
      liveChatSettings,
      contactSalesforceData: contactSalesforceRecord,
      oauth: agencyOauth,
      contact: contact,
      contact_source,
      currentAgencyUser: agencyUser,
      full_message_body: message,
      messageType: mesageType,
      platform: 'whatsapp',
      log,
      encryptionKeys: additionalConfig.ek,
    });
  }
}

/**
 * Description
 * Handling parent node message
 * @function
 * @name handleInitialNodeMessage
 * @kind function
 * @param {object} automation_flow automation nodes
 * @param {object} contact_first_name contact name
 * @param {object} agent_first_name agent name
 * @param {object} log server log
 * @returns {object} automated response details
 */
async function handleInitialNodeMessage(
  automation_flow,
  contact_name,
  agent_name,
  log,
) {
  let node_id = null;
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let flow_id = null;
  let flow = null;
  let language = null;
  const is_end = null;
  let jump_to = null;
  let nodeFound = false;

  const parentNodeId = h.automation.getParentNodeId(
    automation_flow.nodes,
    automation_flow.edges,
  );
  const parentNodeIndex = h.automation.getNodeIndexByIdV2(
    parentNodeId,
    automation_flow.nodes,
  );
  node_id = automation_flow.nodes[parentNodeIndex].id;
  if (h.cmpStr(automation_flow.nodes[parentNodeIndex].type, 'booking')) {
    flow_id = automation_flow.nodes[parentNodeIndex].data.flowData.waba_flow_id;
    const dbFlow = await models.whatsapp_flow.findOne({
      where: {
        flow_id,
      },
    });
    flow = {
      flow_initial_cta_button:
        automation_flow.nodes[parentNodeIndex].data.flowData.initial_cta_button,
      flow_body: formatFlowBody(
        automation_flow.nodes[parentNodeIndex].data.flowData,
        contact_name,
        agent_name,
      ),
      flow_payload: {
        screen: dbFlow.dataValues?.flow_payload?.screens?.[0]?.id || 'STEP_one',
      },
      whatsapp_flow_id: dbFlow.dataValues.whatsapp_flow_id,
      flow_status: dbFlow.dataValues.status,
    };
  }
  if (h.cmpStr(automation_flow.nodes[parentNodeIndex].type, 'message')) {
    template_id =
      automation_flow.nodes[parentNodeIndex].data.flowData.template_id;

    const isSimpleTextMsg = !!h.isEmpty(template_id);
    if (h.cmpBool(isSimpleTextMsg, true)) {
      // if custom text is selected in message node
      message_content =
        automation_flow.nodes[parentNodeIndex].data.flowData.template_body;
    } else {
      const dbTemplate = await models.waba_template.findOne({
        where: {
          template_id,
        },
      });
      const templateData = dbTemplate.dataValues;
      message_content = templateData.content;
      header_image = templateData.header_image;
      const variable = templateData.variable_identifier;
      variable_arr = h.isEmpty(variable) ? [] : variable.split(',');
      template = JSON.parse(message_content);
      template_name = templateData.template_name;
      language = templateData.language;
    }
  }

  // is_end = h.automation.islastNode(node_id, automation_flow.nodes, automation_flow.edges)
  const actionVal = automation_flow.nodes[parentNodeIndex].data.actionValue;
  jump_to = h.notEmpty(actionVal) ? actionVal.id : null;
  nodeFound = true;
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleInitialNodeMessage',
    message: 'first automation message data',
    data: automation_flow.nodes[parentNodeIndex],
  });

  return {
    node_id,
    message_content,
    header_image,
    template_id,
    variable_arr,
    template,
    template_name,
    language,
    is_end,
    jump_to,
    nodeFound,
    flow_id,
    flow,
  };
}

/**
 * Description
 * Handling button message automation message
 * @function
 * @name handleButtonMessageAutomatedMessage
 * @kind function
 * @param {object} nextNodes succeeding node message
 * @param {number} nodeIndex index of which node to use
 * @param {object} log server log
 * @returns {object} button automated response details
 */
function handleButtonMessageAutomatedMessage(nextNodes, nodeIndex, log) {
  let node_id = null;
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let is_end = null;
  let jump_to = null;
  let nodeFound = false;
  node_id = nextNodes[nodeIndex].nodeId;
  // position: 1
  if (
    h.notEmpty(nextNodes[nodeIndex]?.data?.value) &&
    h.notEmpty(nextNodes[nodeIndex]?.data?.value?.value)
  ) {
    // if automation reply is a template
    message_content = nextNodes[nodeIndex].data.value.value.content;
    header_image = nextNodes[nodeIndex].data.value.value.header_image;
    template_id = nextNodes[nodeIndex].data.value.value.waba_template_id;
    const variable = nextNodes[nodeIndex].data.value.value.variable_identifier;
    variable_arr = h.isEmpty(variable) ? [] : variable.split(',');
    template = JSON.parse(message_content);
    template_name = nextNodes[nodeIndex].data.value.value.template_name;
    language = nextNodes[nodeIndex].data.value.value.language;
    is_end = nextNodes[nodeIndex].data.is_end;
    const actionVal = nextNodes[nodeIndex].data.actionValue;
    jump_to = h.notEmpty(actionVal) ? actionVal.value.nodeId : null;
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'handleButtonMessageAutomatedMessage',
      message: 'getting node message to send',
      position: 1,
      data: nextNodes[nodeIndex],
    });
    nodeFound = true;
  } else {
    // position: 2
    // automation reply is just a text
    message_content = nextNodes[nodeIndex].data.value;
    header_image = null;
    template_id = null;
    const variable = null;
    variable_arr = null;
    template = null;
    template_name = null;
    language = null;
    is_end = nextNodes[nodeIndex].data.is_end;
    const actionVal = nextNodes[nodeIndex].data.actionValue;
    jump_to = h.notEmpty(actionVal) ? actionVal.value.nodeId : null;
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'handleButtonMessageAutomatedMessage',
      message: 'getting node message to send',
      position: 2,
      data: nextNodes[nodeIndex],
    });
    nodeFound = true;
  }
  return {
    node_id,
    message_content,
    header_image,
    template_id,
    variable_arr,
    template,
    template_name,
    language,
    is_end,
    jump_to,
    nodeFound,
  };
}

/**
 * Description
 * Handle template automated response for template type contact message
 * @function
 * @name handleTemplateMessage
 * @kind function
 * @param {object} nextNodes succeeding node message
 * @param {number} nodeIndex index of which node to use
 * @param {array} nodes list of nodes
 * @param {array} edgeArr list of edges
 * @param {object} log server log
 * @returns {object} automated response details
 */
async function handleTemplateMessage(
  nextNodes,
  nodeIndex,
  nodes,
  edgeArr,
  log,
) {
  let node_id = null;
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  const is_end = null;
  let jump_to = null;
  let nodeFound = false;

  node_id = nextNodes[nodeIndex].id;
  template_id = nextNodes[nodeIndex].data.flowData.template_id;
  const isSimpleTextMsg = !!h.isEmpty(template_id);
  if (h.cmpBool(isSimpleTextMsg, true)) {
    message_content = nextNodes[nodeIndex].data.flowData.template_body;
  } else {
    const dbTemplate = await models.waba_template.findOne({
      where: {
        template_id,
      },
    });
    const templateData = dbTemplate.dataValues;
    message_content = templateData.content;
    header_image = templateData.header_image;

    const variable = templateData.variable_identifier;
    variable_arr = h.isEmpty(variable) ? [] : variable.split(',');
    template = JSON.parse(message_content);
    template_name = templateData.template_name;
    language = templateData.language;
    // is_end = h.automation.islastNode(node_id, nodes, edgeArr)
  }
  const actionVal = nextNodes[nodeIndex].data.actionValue;
  jump_to = h.notEmpty(actionVal) ? actionVal.id : null;
  nodeFound = true;
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleTemplateMessage',
    message: 'getting node message to send',
    data: nextNodes[nodeIndex],
  });

  return {
    node_id,
    message_content,
    header_image,
    template_id,
    variable_arr,
    template,
    template_name,
    language,
    is_end,
    jump_to,
    nodeFound,
  };
}

/**
 * Description
 * Handle template automated response for booking type contact message
 * @function
 * @name handleTemplateMessage
 * @kind function
 * @param {string} contact_id
 * @param {string} agency_user_id
 * @param {object} nextNodes succeeding node message
 * @param {number} nodeIndex index of which node to use
 * @param {array} nodes list of nodes
 * @param {array} edges list of edges
 * @param {object} log server log
 * @returns {object} automated response details
 */
async function handleFlowMessage(
  contact_id,
  agency_user_id,
  nextNodes,
  nodeIndex,
  nodes,
  edges,
  log,
) {
  let node_id = null;
  let flow_id = null;
  let flow = null;
  const is_end = null;
  let jump_to = null;
  let nodeFound = false;

  node_id = nextNodes[nodeIndex].id;
  flow_id = nextNodes[nodeIndex].data.flowData.waba_flow_id;
  const dbFlow = await models.whatsapp_flow.findOne({
    where: {
      flow_id,
    },
  });

  const { contact_name, agent_name } = await getFlowBodyVariableValues(
    contact_id,
    agency_user_id,
  );

  flow = {
    flow_initial_cta_button:
      nextNodes[nodeIndex].data.flowData.initial_cta_button,
    flow_body: formatFlowBody(
      nextNodes[nodeIndex].data.flowData,
      contact_name,
      agent_name,
    ),
    flow_payload: {
      screen: dbFlow.dataValues?.flow_payload?.screens?.[0]?.id || 'STEP_one',
    },
    whatsapp_flow_id: dbFlow.dataValues.whatsapp_flow_id,
    flow_status: dbFlow.dataValues.status,
  };
  // is_end = h.automation.islastNode(node_id, nodes, edges)
  const actionVal = nextNodes[nodeIndex].data.actionValue;
  jump_to = h.notEmpty(actionVal) ? actionVal.id : null;
  nodeFound = true;
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleFlowMessage',
    message: 'getting node message to send',
    data: nextNodes[nodeIndex],
  });

  return {
    node_id,
    flow_id,
    flow,
    is_end,
    jump_to,
    nodeFound,
  };
}

/**
 * Description
 * Get Flow Data contact and agent variable names
 * @async
 * @function
 * @name getFlowBodyVariableValues
 * @kind function
 * @param {any} contact_id
 * @param {any} agency_user_id
 * @returns {Promise<{ contact_name: any; agent_name: any; }>}
 */
async function getFlowBodyVariableValues(contact_id, agency_user_id) {
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
 * Handle reminder node
 * @function
 * @name handleReminder
 * @kind function
 * @param {object} nextNodes succeeding node message
 * @param {number} nodeIndex index of which node to use
 * @param {number} nodes list of nodes
 * @param {object} log server log
 * @returns {object} automated response details
 */
function handleReminder(nextNodes, nodeIndex, nodes, edges, log) {
  let node_id = null;
  let is_end = null;
  let jump_to = null;
  let nodeFound = false;

  node_id = nextNodes[nodeIndex].id;

  is_end = h.automation.islastNode(node_id, nodes, edges);
  const actionVal = nextNodes[nodeIndex].data.actionValue;
  jump_to = h.notEmpty(actionVal) ? actionVal.id : null;
  nodeFound = true;
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleReminder',
    message: 'getting node reminder to create',
    data: nextNodes[nodeIndex],
  });

  return {
    node_id,
    is_end,
    jump_to,
    nodeFound,
  };
}

/**
 * Description
 * Handle template automated response for text type contact message
 * @function
 * @name handleTextTypeTemplateMessage
 * @kind function
 * @param {object} nextNodes succeeding node message
 * @param {number} nodeIndex index of which node to use
 * @param {object} log server log
 * @returns {object} automated response details
 */
async function handleTextTypeTemplateMessage(nextNodes, nodeIndex, log) {
  let node_id = null;
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let is_end = null;
  let jump_to = null;
  let nodeFound = false;

  node_id = nextNodes[nodeIndex].id;
  template_id = nextNodes[nodeIndex].data.flowData.template_id;
  const dbTemplate = await models.waba_template.findOne({
    where: {
      template_id,
    },
  });
  const templateData = dbTemplate.dataValues;
  message_content = templateData.content;
  header_image = templateData.header_image;

  const variable = templateData.variable_identifier;
  variable_arr = h.isEmpty(variable) ? [] : variable.split(',');
  template = JSON.parse(message_content);
  template_name = templateData.template_name;
  language = templateData.language;
  is_end = nextNodes[nodeIndex].data.is_end;
  const actionVal = nextNodes[nodeIndex].data.actionValue;
  jump_to = h.notEmpty(actionVal) ? actionVal.id : null;
  nodeFound = true;
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleTextTypeTemplateMessage',
    message: 'getting node message to send',
    position: 3,
    data: nextNodes[nodeIndex],
  });

  return {
    node_id,
    message_content,
    header_image,
    template_id,
    variable_arr,
    template,
    template_name,
    language,
    is_end,
    jump_to,
    nodeFound,
  };
}

/**
 * Description
 * Handle text automated response for text type contact message
 * @function
 * @name handleTextTypeTextMessage
 * @kind function
 * @param {object} nextNodes succeeding node message
 * @param {number} nodeIndex index of which node to use
 * @param {object} log server log
 * @returns {object} automated response details
 */
function handleTextTypeTextMessage(nextNodes, nodeIndex, log) {
  let node_id = null;
  let message_content = null;
  let header_image = null;
  let template_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let is_end = null;
  let jump_to = null;
  let nodeFound = false;

  node_id = nextNodes[nodeIndex].nodeId;
  message_content = nextNodes[nodeIndex].data.value;
  header_image = null;
  template_id = null;
  const variable = null;
  variable_arr = null;
  template = null;
  template_name = null;
  language = null;
  is_end = nextNodes[nodeIndex].data.is_end;
  const actionVal = nextNodes[nodeIndex].data.actionValue;
  jump_to = h.notEmpty(actionVal) ? actionVal.value.nodeId : null;
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleTextTypeTextMessage',
    message: 'getting node message to send',
    position: 4,
    data: nextNodes[nodeIndex],
  });
  nodeFound = true;

  return {
    node_id,
    message_content,
    header_image,
    template_id,
    variable_arr,
    template,
    template_name,
    language,
    is_end,
    jump_to,
    nodeFound,
  };
}

/**
 * Description
 * Function to send automation workflow response per contact message
 * @async
 * @function
 * @name sendAutomatedWorkflowResponse
 * @kind function
 * @param {object} params breakdown below
 * @param {any} nodeFound if node is found for message
 * @param {any} node_id node id
 * @param {any} rule_id automation rule id
 * @param {any} flow_id whatsapp flow id
 * @param {any} flow flow object
 * @param {any} template_id template id
 * @param {any} template template object
 * @param {any} template_name template name
 * @param {any} header_image header image
 * @param {any} language template language
 * @param {any} variable_arr variable array data
 * @param {any} message_content message
 * @param {any} wabaOwner waba details
 * @param {any} agency agency details
 * @param {any} agency_id agency id
 * @param {any} agency_user_id contact owner id
 * @param {any} contact_id contact id
 * @param {any} contactAgencyUser contact owner data
 * @param {any} contactFirstName contact first name
 * @param {any} sender_number waba number
 * @param {any} receiver_number contact number
 * @param {any} latestWorkflowTracker latest tracker data
 * @param {any} agencyBufferedCredentials waba credentials
 * @param {any} additionalConfig consuemer additional config
 * @param {any} log server log
 */
async function sendAutomatedWorkflowResponse(params, additionalConfig, log) {
  let message_type = null;
  const latestWorkflowTracker = params.latestWorkflowTracker;
  /**
   * process sending if there is an automation workflow message to send
   * if no template or text message to send, do nothing
   */
  if (
    h.cmpBool(params.nodeFound, true) &&
    (h.notEmpty(params?.message_content) || h.notEmpty(params?.flow))
  ) {
    await c.messageInventory.addVirtualCount(params.agency_id);
    let sendWhatsAppTemplateMessageResponse = null;
    // send text mesage automation response
    if (
      h.isEmpty(params.template_id) &&
      h.notEmpty(params?.message_content) &&
      h.isEmpty(params?.flow_id)
    ) {
      sendWhatsAppTemplateMessageResponse = await processSendTextMessage(
        params.message_content,
        params.agency_id,
        params.receiver_number,
        params.agencyBufferedCredentials,
        log,
      );
      message_type = 'frompave';
    }
    // send template message automation response
    if (
      h.notEmpty(params?.template_id) &&
      h.notEmpty(params?.message_content) &&
      h.isEmpty(params?.flow_id)
    ) {
      console.log('******SENDING TEMPLATE MSG*********');
      sendWhatsAppTemplateMessageResponse = await processSendAutomationMessage(
        {
          agency_id: params.agency_id,
          template: params.template,
          template_name: params.template_name,
          header_image: params.header_image,
          language: params.language,
          variable_arr: params.variable_arr,
          agency: params.agency,
          contactAgencyUser: params.contactAgencyUser,
          contactFirstName: params.contactFirstName,
          receiver_number: params.receiver_number,
          agencyBufferedCredentials: params.agencyBufferedCredentials,
        },
        log,
      );
      message_type = 'frompave';
    }
    // send booking message automation response
    if (
      h.isEmpty(params?.template_id) &&
      h.notEmpty(params?.flow_id) &&
      h.notEmpty(params?.flow)
    ) {
      console.log('******SENDING BOOKING FLOW MSG*********');
      sendWhatsAppTemplateMessageResponse = await processSendBookingFlow(
        {
          agency_id: params.agency_id,
          flow_id: params.flow_id,
          flow: params.flow,
          node_id: params.node_id,
          rule_id: params.rule_id,
          agency: params.agency,
          contactAgencyUser: params.contactAgencyUser,
          contactFirstName: params.contactFirstName,
          receiver_number: params.receiver_number,
          agencyBufferedCredentials: params.agencyBufferedCredentials,
        },
        log,
      );
      if (h.notEmpty(sendWhatsAppTemplateMessageResponse)) {
        sendWhatsAppTemplateMessageResponse.msg_body = 'booking_frompave';
      }
      message_type = 'booking_frompave';
    }
    const broadcast_date = new Date();
    const msg_timestamp = Math.floor(broadcast_date.getTime() / 1000);
    await messageDBHandler.processSaveAgencyMessage(
      {
        wabaOwner: params.wabaOwner,
        agency_id: params.agency_id,
        agency_user_id: params.agency_user_id,
        contact_id: params.contact_id,
        tracker_ref_name: latestWorkflowTracker?.tracker_ref_name,
        campaign_name: latestWorkflowTracker?.campaign_name,
        original_event_id:
          sendWhatsAppTemplateMessageResponse.original_event_id,
        message: sendWhatsAppTemplateMessageResponse.msg_body,
        msg_origin: 'automation',
        msg_info: params.node_id,
        msg_timestamp,
        sender_number: params.sender_number,
        receiver_number: params.receiver_number,
        msg_type: message_type,
        broadcast_date,
        sent: sendWhatsAppTemplateMessageResponse.success,
        failed: !sendWhatsAppTemplateMessageResponse.success,
        new_record: false,
      },
      log,
    );

    await notificationHandler.triggerAppsyncNotificationForAutoResponseProcess(
      {
        position: 'sendAutomatedWorkflowResponse',
        platform: 'whatsapp',
        campaign_name: latestWorkflowTracker?.campaign_name,
        agency_fk: latestWorkflowTracker?.agency_fk,
        contact_fk: params.contact_id,
        agency_user_fk: params.agency_user_id,
        original_event_id:
          sendWhatsAppTemplateMessageResponse.original_event_id,
        msg_body: `${sendWhatsAppTemplateMessageResponse.msg_body}`,
        msg_type: 'frompave',
        msg_timestamp,
        sender_number: params.sender_number,
        sender_url: latestWorkflowTracker?.sender_url,
        receiver_number: params.receiver_number,
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse?.original_event_id,
        ),
        sent: h.notEmpty(
          sendWhatsAppTemplateMessageResponse?.original_event_id,
        ),
      },
      log,
    );

    /**
     * if automation response is sent successfully, transmit message
     * to salesforce only if configured
     */
    if (h.notEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id)) {
      await processMessageTransmission({
        contact_id: params.contact_id,
        agency_id: params.agency_id,
        message: sendWhatsAppTemplateMessageResponse.msg_body,
        mesageType: message_type,
        additionalConfig,
        log,
      });
    } else {
      await c.messageInventory.substractVirtualCount(params.agency_id);
    }
  }
}

/**
 * Description
 * Handle jump to process based on workflow configuration
 * @async
 * @function
 * @name handleJumpToProcess
 * @kind function
 * @param {object} params breakdown below
 * @param {any} jump_to jump to node
 * @param {any} nodeArr node data array
 * @param {any} is_end if is end
 * @param {any} agency agency data
 * @param {any} agency_id agency id
 * @param {any} contactAgencyUser contact owner data
 * @param {any} contactFirstName contact first name
 * @param {any} wabaOwner waba data
 * @param {any} agency_user_id contact owner id
 * @param {any} contact_id contact id
 * @param {any} latestWorkflowTracker latest tracker
 * @param {any} sender_number waba number
 * @param {any} receiver_number contact number
 * @param {any} agencyBufferedCredentials waba credentials
 * @param {any} additionalConfig consumer additional config
 * @param {any} log server log
 */
async function handleJumpToProcess(params, additionalConfig, log) {
  let is_end;
  let jump_to;
  const latestWorkflowTracker = params.latestWorkflowTracker;
  if (h.notEmpty(params?.jump_to)) {
    const jumpToNode = h.automation.getNodeById(params.jump_to, params.nodeArr);
    log.info({ message: 'jumpToNode', data: jumpToNode });

    // jump to specific node
    let message_type = null;
    if (h.notEmpty(jumpToNode)) {
      let node_id = null;
      let message_content;
      let header_image;
      let template_id;
      let variable;
      let variable_arr = [];
      let template;
      let template_name;
      let language;
      node_id = jumpToNode.data.nodeId;
      if (
        h.notEmpty(jumpToNode?.data?.value) &&
        h.notEmpty(jumpToNode?.data?.value?.value)
      ) {
        // jump to a template node
        // position: 7
        message_content = jumpToNode.data.value.value.content;
        header_image = jumpToNode.data.value.value.header_image;
        template_id = jumpToNode.data.value.value.waba_template_id;
        variable = jumpToNode.data.value.value.variable_identifier;
        variable_arr = h.isEmpty(variable) ? [] : variable.split(',');
        template = JSON.parse(message_content);
        template_name = jumpToNode.data.value.value.template_name;
        language = jumpToNode.data.value.value.language;
        is_end = jumpToNode.data.is_end;
        const actionVal = jumpToNode.data.actionValue;
        jump_to = h.notEmpty(actionVal) ? actionVal.value.nodeId : null;
        log.info({
          consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
          function: 'handleJumpToProcess',
          message: 'getting node message to send',
          position: 7,
          data: jumpToNode,
        });
        message_type = 'template';
      } else {
        // jump to a text node
        // position: 8
        message_content = jumpToNode.data.value;
        header_image = null;
        template_id = null;
        variable = null;
        variable_arr = null;
        template = null;
        template_name = null;
        language = null;
        is_end = jumpToNode.data.is_end;
        const actionVal = jumpToNode.data.actionValue;
        jump_to = h.notEmpty(actionVal) ? actionVal.value.nodeId : null;
        log.info({
          consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
          function: 'handleJumpToProcess',
          message: 'getting node message to send',
          position: 8,
          data: jumpToNode,
        });
        message_type = 'plain_frompave';
      }

      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'handleJumpToProcess',
        message: 'Check jump message',
      });
      let sendWhatsAppTemplateMessageResponse;
      if (h.notEmpty(message_content)) {
        if (h.isEmpty(template_id)) {
          sendWhatsAppTemplateMessageResponse = await processSendTextMessage(
            message_content,
            params.agency_id,
            params.receiver_number,
            params.agencyBufferedCredentials,
            log,
          );
        } else {
          sendWhatsAppTemplateMessageResponse =
            await processSendAutomationMessage(
              {
                agency_id: params.agency_id,
                template,
                template_name,
                header_image,
                language,
                variable_arr,
                agency: params.agency,
                contactAgencyUser: params.contactAgencyUser,
                contactFirstName: params.contactFirstName,
                receiver_number: params.receiver_number,
                agencyBufferedCredentials: params.agencyBufferedCredentials,
              },
              log,
            );
        }
      }
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'handleJumpToProcess',
        action: 'processSendAutomationMessage',
        response: sendWhatsAppTemplateMessageResponse,
      });
      const broadcast_date = new Date();
      const msg_timestamp = Math.floor(broadcast_date.getTime() / 1000);
      await messageDBHandler.processSaveAgencyMessage(
        {
          wabaOwner: params.wabaOwner,
          agency_id: params.agency_id,
          agency_user_id: params.agency_user_id,
          contact_id: params.contact_id,
          tracker_ref_name: latestWorkflowTracker?.tracker_ref_name,
          campaign_name: latestWorkflowTracker?.campaign_name,
          original_event_id:
            sendWhatsAppTemplateMessageResponse.original_event_id,
          message: sendWhatsAppTemplateMessageResponse.msg_body,
          msg_origin: 'automation',
          msg_info: node_id,
          msg_timestamp,
          sender_number: params.sender_number,
          receiver_number: params.receiver_number,
          msg_type: 'frompave',
          broadcast_date,
          sent: sendWhatsAppTemplateMessageResponse.success,
          failed: !sendWhatsAppTemplateMessageResponse.success,
          new_record: false,
        },
        log,
      );

      await notificationHandler.triggerAppsyncNotificationForAutoResponseProcess(
        {
          position: 'handleJumpToProcess',
          platform: 'whatsapp',
          campaign_name: latestWorkflowTracker?.campaign_name,
          agency_fk: latestWorkflowTracker?.agency_fk,
          contact_fk: params.contact_id,
          agency_user_fk: params.agency_user_id,
          original_event_id:
            sendWhatsAppTemplateMessageResponse.original_event_id,
          msg_body: `${sendWhatsAppTemplateMessageResponse.msg_body}`,
          msg_type: 'frompave',
          msg_timestamp,
          sender_number: params.sender_number,
          sender_url: latestWorkflowTracker?.sender_url,
          receiver_number: params.receiver_number,
          failed: h.isEmpty(
            sendWhatsAppTemplateMessageResponse?.original_event_id,
          ),
          sent: h.notEmpty(
            sendWhatsAppTemplateMessageResponse?.original_event_id,
          ),
        },
        log,
      );

      if (h.notEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id)) {
        await processMessageTransmission({
          contact_id: params.contact_id,
          agency_id: params.agency_id,
          message: sendWhatsAppTemplateMessageResponse.msg_body,
          mesageType: message_type,
          additionalConfig,
          log,
        });
      }
    }
  }
}

/**
 * Description
 * Function to get conditional node
 * @function
 * @name getConditionalNode
 * @kind function
 * @param {object} conditionalOptionNodes conditional node options
 * @param {string} message contact message
 * @param {string} msgType
 * @param {object} nodeArr node array
 * @param {object} edgeArr node array
 * @returns {object} the conditional node to use
 */
function getConditionalNode({
  conditionalOptionNodes,
  message,
  nodeArr,
  edgeArr,
  conditionalNode,
  msgType,
  log,
}) {
  let conditionalOptionNodesResponse;
  log.info({
    function: 'getConditionalNode',
    message: 'Contact Message',
    data: message,
  });
  for (
    let cOptionNodeIndex = 0;
    cOptionNodeIndex < conditionalOptionNodes.length;
    cOptionNodeIndex++
  ) {
    const conditionIndex =
      conditionalOptionNodes[cOptionNodeIndex].data.conditionIndex - 1; // -1 because conditionIndex starts from 1
    const conditionObj = conditionalNode.data.flowData.conditonal_array.find(
      (ele) => ele.index === conditionIndex,
    );
    const condition = conditionObj.data.operator.value;
    const stringValue = conditionObj.data.value;

    let messageValue = message;
    if (h.cmpStr(msgType, 'flow')) {
      const parsedMessage = JSON.parse(message);
      log.info({
        function: 'getConditionalNode',
        message: 'parsedMessage',
        data: {
          parsedMessage,
          fieldType: conditionObj.data.variable.fieldType,
        },
      });
      messageValue = parsedMessage[conditionObj.data.variable.fieldType] ?? '';
      log.info({
        function: 'getConditionalNode',
        message: 'messageValue',
        data: messageValue,
      });
    }

    const contactMessageLowered = messageValue.toLowerCase();

    let stringValuesArray = [];
    if (h.cmpStr(condition, 'smart match')) {
      stringValuesArray = stringValue
        .split(',')
        .map((val) => val.trim().toLowerCase());
    }

    if (
      h.cmpStr(condition, 'equals to') &&
      h.cmpStr(stringValue.toLowerCase(), contactMessageLowered)
    ) {
      conditionalOptionNodesResponse = h.automation.getNextNode(
        conditionalOptionNodes[cOptionNodeIndex].id,
        nodeArr,
        edgeArr,
      );
      break;
    } else if (
      h.cmpStr(condition, 'contains') &&
      contactMessageLowered.includes(stringValue.toLowerCase())
    ) {
      conditionalOptionNodesResponse = h.automation.getNextNode(
        conditionalOptionNodes[cOptionNodeIndex].id,
        nodeArr,
        edgeArr,
      );
      break;
    } else if (
      h.cmpStr(condition, 'smart match') &&
      stringValuesArray.some((val) => contactMessageLowered.includes(val))
    ) {
      conditionalOptionNodesResponse = h.automation.getNextNode(
        conditionalOptionNodes[cOptionNodeIndex].id,
        nodeArr,
        edgeArr,
      );
      break;
    } else if (
      h.cmpStr(condition, 'regex') &&
      new RegExp(stringValue, 'i').test(contactMessageLowered)
    ) {
      conditionalOptionNodesResponse = h.automation.getNextNode(
        conditionalOptionNodes[cOptionNodeIndex].id,
        nodeArr,
        edgeArr,
      );
      break;
    } else if (
      h.cmpStr(condition, 'not equals') &&
      !h.cmpStr(stringValue.toLowerCase(), contactMessageLowered)
    ) {
      conditionalOptionNodesResponse = h.automation.getNextNode(
        conditionalOptionNodes[cOptionNodeIndex].id,
        nodeArr,
        edgeArr,
      );
      break;
    } else if (
      h.cmpStr(condition, 'does not contain') &&
      !contactMessageLowered.includes(stringValue.toLowerCase())
    ) {
      conditionalOptionNodesResponse = h.automation.getNextNode(
        conditionalOptionNodes[cOptionNodeIndex].id,
        nodeArr,
        edgeArr,
      );
      break;
    }
  }
  return conditionalOptionNodesResponse;
}

/**
 * Description
 * Function to generate additional automation data
 * @async
 * @function
 * @name prepareTrackerAutomationData
 * @kind function
 * @param {object} params object data needed to generated additional automation
 * data
 * @param {object} log server log
 * @returns {Promise} additional data needed for the automation
 */
async function prepareTrackerAutomationData(params, log) {
  const wabaOwner = params.waba;
  const agency = await agencyModel.findOne({
    where: {
      agency_id: params.agency_id,
    },
  });

  const contactAgencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: params.agency_user_id,
    },
    include: [{ model: models.user, required: true }],
  });

  const agencyWhatsAppCredentials =
    wabaOwner?.agency_whatsapp_api_token +
    ':' +
    wabaOwner?.agency_whatsapp_api_secret;
  const agencyBufferedCredentials = Buffer.from(
    agencyWhatsAppCredentials,
    'utf8',
  ).toString('base64');

  let tracker_ref_name = `${Date.now()}_${
    params.tracker_name
  }_${agency?.agency_name.replaceAll(' ', '_').toLowerCase()}`;
  let campaign_name = `Automated Workflow ${Date.now()} ${
    agency?.agency_name
  } ${params.contact_id}`;
  let msg_origin = 'user';
  let new_record = true;
  let msg_info = null;

  if (h.cmpBool(params.is_new_workflow_message, true)) {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'runAutomation',
      message: 'AUTOMATION WORKFLOW : Saving First Workflow Contact Message',
    });
  } else {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'runAutomation',
      message:
        'AUTOMATION WORKFLOW : Saving Succeeding Workflow Contact Message',
      rule_id: params.rule_id,
    });

    const [tracker, latestChat] = await Promise.all([
      models.whatsapp_message_tracker.findOne({
        where: {
          receiver_number: params.receiver_number,
          sender_number: params.sender_number,
          agency_fk: params.agency_id,
          msg_id: params.rule_id,
          msg_origin: params?.is_broadcast_campaign ? 'campaign' : 'user',
          tracker_ref_name: {
            [Op.like]: params?.is_broadcast_campaign
              ? `%${params.tracker_name}%` // for broadcast automation tracker_name is equal to latesWhatsappTracker's tracker_ref_name
              : `%_${params.tracker_name}_%`,
          },
        },
        order: [['created_date', 'DESC']],
      }),
      models.whatsapp_chat.findOne({
        where: {
          receiver_number: params.receiver_number,
          sender_number: params.sender_number,
          agency_fk: params.agency_id,
          msg_origin: params?.is_broadcast_campaign
            ? params.msg_origin
            : 'automation',
        },
        order: [['created_date', 'DESC']],
      }),
    ]);

    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'runAutomation',
      data: {
        tracker,
        latestChat,
      },
    });

    // To send automation msg for all quick replies btn
    // if(h.notEmpty(params?.reply_to_original_event_id)) {
    //   const replyToChat = await whatsappChatModel.findOne({
    //     where: {
    //       original_event_id: params.reply_to_original_event_id,
    //     },
    //   });
    //   msg_info = replyToChat?.msg_info
    // }

    tracker_ref_name = tracker?.tracker_ref_name;
    campaign_name = tracker?.campaign_name;
    msg_origin = 'automation';
    new_record = false;
    msg_info = latestChat?.msg_info;
  }

  return {
    wabaOwner,
    agency,
    tracker_ref_name,
    campaign_name,
    msg_origin,
    msg_info,
    contactAgencyUser,
    agencyBufferedCredentials,
    new_record,
  };
}

module.exports = {
  processAutomation: processAutomation,
  handleSucceedingAutomationNodeMessage,
  sendAutomatedWorkflowResponse,
  prepareTrackerAutomationData,
};
