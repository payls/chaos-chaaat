const c = require('../../../controllers');
const models = require('../../../models');
const h = require('../../../helpers');
const constant = require('../../../constants/constant.json');
const axios = require('axios');
const he = require('he');
const { Op } = require('sequelize');
const messageDBHandler = require('./db/message');
const contactDBHandler = require('./db/contact');
const notificationHandler = require('./whatsapp-notification-handler');

/**
 * Description
 * Initial validation of payload data
 * @async
 * @function
 * @name validatePayloadData
 * @kind function
 * @param {object} payload whatsapp payload
 * @param {object} log server log
 * @returns {Promise<boolean>} returns boolean
 */
async function validatePayloadData({ payload, log }) {
  const body = payload.data;
  if (h.isEmpty(body) || h.isEmpty(body?.data) || h.isEmpty(body?.data?.uri)) {
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      message: 'INVALID PAYLOAD DATA',
      data: payload,
    });
    return false;
  }

  const connectionURI = body?.data?.uri;
  const connectionType = connectionURI.includes('whatsapp') ? 'whatsapp' : null;

  if (h.isEmpty(connectionType)) {
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'validatePayloadData',
      message: 'INVALID PAYLOAD DATA CONNECTION TYPE',
      data: payload,
    });
    return false;
  }

  const parts = body?.data?.parts || [];
  const part = parts[0];
  if (h.isEmpty[parts] && h.isEmpty(part)) {
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'validatePayloadData',
      message: 'MISSING PAYLOAD BODY PARTS',
      data: payload,
    });
    return false;
  }

  return true;
}

/**
 * Description
 * Function to check what type of data the payload is
 * @function
 * @name getMessageType
 * @kind function
 * @param {object} part message part data
 * @returns {string} content type
 */
function getMessageType(part) {
  const { contentType, data /* originalEvent */ } = part;

  if (contentType === 'status') {
    return data;
  }

  return contentType;
}

/**
 * Description
 * Function to get current message status set
 * @function
 * @name getMessageStatusUpdate
 * @kind function
 * @param {string} msg_status received message status
 * @returns {object} current status set based on received status
 */
function getMessageStatusUpdate(msg_status) {
  const messageStatus = {
    pending: 0,
  };
  switch (msg_status) {
    case 'failed':
      messageStatus.failed = 1;
      break;
    case 'sent':
      messageStatus.sent = 1;
      break;
    case 'delivered':
      messageStatus.delivered = 1;
      break;
    case 'read':
      messageStatus.read = 1;
      break;
    default:
      messageStatus.read = 1;
      messageStatus.sent = 1;
      messageStatus.delivered = 1;
      messageStatus.replied = 1;
      messageStatus.failed = 0;
      break;
  }

  return messageStatus;
}

/**
 * Description
 * Preparing initial whatsapp data
 * @function
 * @name prepareWhatsAppData
 * @kind function
 * @param {object} payload whatsapp payload
 * @param {object} log server log
 * @returns {object} returns initial processed data
 */
async function prepareWhatsAppData({ payload, log }) {
  const body = payload?.data?.data;
  const parts = body?.parts;
  const part = parts[0];

  const text_attachment =
    body?.attachment && body?.attachment?.key
      ? `<span class="text_attachment">${body?.attachment?.key}</span>`
      : null;
  const caption = h.notEmpty(body?.attachment?.key)
    ? body?.attachment?.key
    : null;

  let { data: message, originalEvent } = part;
  const parsedOriginalEvent = JSON.parse(originalEvent);
  const is_connected = h.notEmpty(body?.connectionname);
  const uri = body?.uri;
  const msg_type = getMessageType(part);
  const msg_id = uri?.split('/').reverse()[0];
  const original_event_id = parsedOriginalEvent.id;
  const reply_to_original_event_id = h.notEmpty(parsedOriginalEvent?.context)
    ? parsedOriginalEvent?.context?.id
    : null;
  // handling reply to details
  const {
    reply_to_content,
    reply_to_msg_type,
    reply_to_file_name,
    reply_to_contact_id,
  } = await handleReplyToDetails(reply_to_original_event_id);

  const failed_reason = !h.isEmpty(parsedOriginalEvent?.errors)
    ? JSON.stringify(parsedOriginalEvent?.errors)
    : null;
  const receiver_number = body?.receiveraddress;
  const sender_number = body?.senderaddress;
  const receiver_url = body?.receiver;
  const sender_url = body?.sender;
  const msg_timestamp = parsedOriginalEvent.timestamp;

  // processing document type
  const filename = h.cmpStr(msg_type, 'document')
    ? parsedOriginalEvent.document.filename
    : '';
  const mime_type = h.cmpStr(msg_type, 'document')
    ? parsedOriginalEvent.document.mime_type
    : '';
  if (h.cmpStr(msg_type, 'document')) {
    message = message + '|' + filename + '|' + mime_type;
  }
  if (h.notEmpty(text_attachment)) {
    message = message + '|' + text_attachment;
  }
  const file_name = h.notEmpty(filename) ? filename : null;
  const content_type = h.notEmpty(mime_type) ? mime_type : null;

  return {
    is_connected,
    msg_id,
    msg_type,
    message,
    msg_timestamp,
    original_event_id,
    receiver_number,
    sender_number,
    receiver_url,
    sender_url,
    reply_to_original_event_id,
    reply_to_content,
    reply_to_msg_type,
    reply_to_file_name,
    reply_to_contact_id,
    failed_reason,
    caption,
    file_name,
    content_type,
    data: payload?.data,
  };
}

/**
 * Description
 * Handle linking to a connected message
 * @async
 * @function
 * @name handleReplyToDetails
 * @kind function
 * @param {string} reply_to_original_event_id connected message event id
 * @returns {Promise} connected message data
 */
async function handleReplyToDetails(reply_to_original_event_id) {
  let reply_to_content = null;
  let reply_to_msg_type = null;
  let reply_to_file_name = null;
  let reply_to_contact_id = null;
  if (h.notEmpty(reply_to_original_event_id)) {
    const replyToChat = await c.whatsappChat.findOne({
      original_event_id: reply_to_original_event_id,
    });

    if (h.notEmpty(replyToChat)) {
      reply_to_content = replyToChat?.msg_body;
      reply_to_msg_type = replyToChat?.msg_type;
      reply_to_file_name = replyToChat?.file_name;
      const agency_msg_types = [
        'frompave',
        'img_frompave',
        'video_frompave',
        'file_frompave',
      ];
      const contact_msg_types = [
        'image',
        'video',
        'file',
        'button',
        'text',
        'interactive',
      ];
      if (agency_msg_types.includes(replyToChat?.msg_type)) {
        const replyToChatAgentRecord = await c.agencyUser.findOne(
          { agency_user_id: replyToChat?.agency_user_fk },
          {
            include: {
              model: models.user,
              required: true,
            },
          },
        );
        reply_to_contact_id = replyToChatAgentRecord.user.first_name;
      }
      if (contact_msg_types.includes(replyToChat?.msg_type)) {
        const replyToChatContactRecord = await c.contact.findOne({
          contact_id: replyToChat?.contact_fk,
          agency_fk: replyToChat?.agency_fk,
        });
        reply_to_contact_id = replyToChatContactRecord?.first_name;
      }
    }
  }

  return {
    reply_to_content,
    reply_to_msg_type,
    reply_to_file_name,
    reply_to_contact_id,
  };
}

/**
 * Description
 * Function to check correct agency and waba details for the message
 * @async
 * @function
 * @name routeCheck
 * @kind function
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} message contact message
 * @param {string} msg_type contact message type
 * @param {string} reply_to_original_event_id event ID the message is replied to
 * @param {object} log
 * @returns {Promise} the agency id and the waba details
 */
async function routeCheck({
  sender_number,
  receiver_number,
  message,
  msg_type,
  reply_to_original_event_id,
  log,
}) {
  const where = {
    waba_number: sender_number,
    is_active: 1,
  };

  const trial_agency = await c.agency.findOne({
    trial_code: message.trim(),
  });

  // limit searching of WABA to specific agency only if found as trial and message received is the trial code
  if (h.notEmpty(trial_agency)) {
    log.info({
      message: 'message for initializing new conversation to a trial number',
    });
    where.agency_fk = trial_agency?.agency_id;
    where.trial_code = message.trim();
    const wabaOwner = await c.agencyWhatsappConfig.findOne(where);
    return { agency_id: wabaOwner?.agency_fk, wabaOwner };
  }

  // if trial code does not matched the message received, check for the latest message chat for the waba and contact
  const chatWhere = {
    sender_number,
    receiver_number,
  };
  if (h.notEmpty(reply_to_original_event_id)) {
    chatWhere.original_event_id = reply_to_original_event_id;
  }
  const latestChat = await c.whatsappChat.findOne(chatWhere, {
    order: [['created_date', 'DESC']],
  });

  // if there is a record already, use the agency id to limit the WABA search to the agency
  if (h.notEmpty(latestChat)) {
    log.info({
      message: 'message for waba with record already',
    });
    where.agency_fk = latestChat?.agency_fk;
    const wabaOwner = await c.agencyWhatsappConfig.findOne(where);
    return { agency_id: wabaOwner?.agency_fk, wabaOwner };
  }

  // message is for a waba number not for trial and not the chaaat trial numbers
  where.trial_number = false;
  where.trial_number_to_use = false;
  let wabaOwner = await c.agencyWhatsappConfig.findOne(where);
  if (h.notEmpty(wabaOwner)) {
    log.info({
      message: 'message for initializing a convo in waba with record already',
    });
    return { agency_id: wabaOwner?.agency_fk, wabaOwner };
  }

  where.trial_number = true;
  wabaOwner = await c.agencyWhatsappConfig.findOne(where);
  // directly sending the message to Chaaat using the trial number
  if (h.notEmpty(wabaOwner)) {
    log.info({
      message:
        'message for initializing new conversation to a trial number directly under Chaaat',
    });
    return { agency_id: wabaOwner?.agency_fk, wabaOwner };
  }
}

/**
 * Description
 * Function to handle data to be saved for message status update
 * There are cases that this will need to provide as well other chat details
 * other than status
 * @async
 * @function
 * @name handleMessageStatus
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency
 * @param {string} original_event_id event id for the message
 * that will receive the status
 * @param {string} msg_id message id
 * @param {timestamp} msg_timestamp message timestamp
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} sender_url waba number url
 * @param {string} receiver_url contact number url
 * @param {string} msg_type message type
 * @param {object} failed_reason failed status reason
 
 * @param {object} log server log
 * @returns {Promise} processed data needed for status update
 */
async function handleMessageStatus(params, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'processMessageStatus',
    data: params,
  });
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'processMessageStatus',
    received_status: params.msg_type,
    original_event_id: params.original_event_id,
  });
  const messageStatusUpdate = getMessageStatusUpdate(params.msg_type);

  let whatsAppMsgTracker = await c.whatsappMessageTracker.findOne(
    {
      original_event_id: params.original_event_id,
      agency_fk: params.agency_id,
    },
    {
      order: [['created_date', 'DESC']],
    },
  );

  const whatsAppChat = await c.whatsappChat.findOne(
    {
      original_event_id: params.original_event_id,
      agency_fk: params.agency_id,
    },
    {
      order: [['created_date', 'DESC']],
    },
  );

  let trackerUpdate = {};
  let has_tracker_update = false;
  let chatUpdate = {};
  let has_chat_update = false;
  if (h.notEmpty(whatsAppMsgTracker)) {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processMessageStatus',
      action: 'original event id for status has tracker entry',
    });

    trackerUpdate = {
      agency_fk: whatsAppMsgTracker?.agency_fk,
      agency_user_fk: whatsAppMsgTracker?.agency_user_fk,
      contact_fk: whatsAppMsgTracker?.contact_fk,
      ...messageStatusUpdate,
      sender_number: params.sender_number,
      sender_url: params.sender_url,
      receiver_number: params.receiver_number,
      receiver_url: params.receiver_url,
    };

    if (!h.isEmpty(params.failed_reason)) {
      trackerUpdate.failed_reason = params.failed_reason;
    }
    has_tracker_update = true;
  }

  if (h.notEmpty(whatsAppChat)) {
    delete messageStatusUpdate.pending;
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processMessageStatus',
      action: 'original event id for status has whatsapp chat entry',
    });

    chatUpdate = {
      agency_fk: whatsAppChat?.agency_fk,
      contact_fk: whatsAppChat?.contact_fk,
      agency_user_fk: whatsAppChat?.agency_user_fk,
      msg_id: whatsAppChat?.msg_id,
      ...messageStatusUpdate,
      sender_number: whatsAppChat?.sender_number,
      sender_url: whatsAppChat?.sender_url,
      receiver_number: whatsAppChat?.receiver_number,
      receiver_url: whatsAppChat?.receiver_url,
      original_event_id: params.original_event_id,
      failed_reason: params.failed_reason,
    };

    has_chat_update = true;
  }

  // if is a tracker message with no thread message
  if (
    h.notEmpty(whatsAppMsgTracker) &&
    h.cmpStr(whatsAppMsgTracker?.msg_type, 'frompave') &&
    h.isEmpty(whatsAppChat)
  ) {
    delete messageStatusUpdate.pending;
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processMessageStatus',
      action: 'original event id for status has no chat entry for tracker',
    });
    chatUpdate = {
      agency_fk: whatsAppMsgTracker?.agency_fk,
      agency_user_fk: whatsAppMsgTracker?.agency_user_fk,
      contact_fk: whatsAppMsgTracker?.contact_fk,
      ...messageStatusUpdate,
      sender_number: params.sender_number,
      sender_url: params.sender_url,
      receiver_number: params.receiver_number,
      receiver_url: params.receiver_url,
    };

    has_chat_update = true;
  }

  // if tracker record is empty when search is using only event id
  // do another search to get latest tracker record for sender nad receiver
  // under the agency
  if (h.isEmpty(whatsAppMsgTracker)) {
    whatsAppMsgTracker = await c.whatsappMessageTracker.findOne(
      {
        sender_number: params.sender_number,
        receiver_number: params.receiver_number,
        agency_fk: params.agency_id,
      },
      {
        order: [['created_date', 'DESC']],
      },
    );
  }

  return {
    whatsAppMsgTracker,
    trackerUpdate,
    has_tracker_update,
    whatsAppChat,
    chatUpdate,
    has_chat_update,
  };
}

/**
 * Description
 * Function to get all the active automation rules
 * @async
 * @function
 * @name getActiveChaaatBuilderAutomationRules
 * @kind function
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @returns {Promise<{ trigger: boolean;
 *  contactMessageWABAForFirstTimeRule: any;
 *  incomingMessageReceivedRule: any;
 *  brodcastAutomationRule: any;
 *  }>} returns object used for determining message
 * handling process
 */
async function getActiveChaaatBuilderAutomationRules({ wabaOwner, agency_id }) {
  const [
    contactMessageWABAForFirstTimeRule,
    incomingMessageReceivedRule,
    brodcastAutomationRule,
  ] = await Promise.all([
    c.automationRule.findOne(
      {
        status: 'active',
        rule_trigger_fk: 'eb7875aa-7e42-4260-8941-02ba9b91b1b0',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
            where: {
              message_channel: 'whatsapp',
              business_account: wabaOwner?.agency_whatsapp_config_id,
            },
            required: true,
          },
          {
            model: models.automation_category,
            where: {
              agency_fk: agency_id,
              platform: 'CHAAATBUILDER',
            },
            require: true,
          },
        ],
      },
    ),
    c.automationRule.findOne(
      {
        status: 'active',
        rule_trigger_fk: 'eb7875aa-7e42-4260-8941-02ba9b91b123',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
            where: {
              message_channel: 'whatsapp',
              business_account: wabaOwner?.agency_whatsapp_config_id,
            },
            required: true,
          },
          {
            model: models.automation_category,
            where: {
              agency_fk: agency_id,
              platform: 'CHAAATBUILDER',
            },
            require: true,
          },
        ],
      },
    ),
    c.automationRule.findOne(
      {
        status: 'active',
        rule_trigger_fk: 'eb7875aa-7e42-4260-8941-02ba9b91b124',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
            where: {
              message_channel: 'whatsapp',
              business_account: wabaOwner?.agency_whatsapp_config_id,
            },
            required: true,
          },
          {
            model: models.automation_category,
            where: {
              agency_fk: agency_id,
              platform: 'CHAAATBUILDER',
            },
            require: true,
          },
        ],
      },
    ),
  ]);

  return {
    contactMessageWABAForFirstTimeRule,
    incomingMessageReceivedRule,
    brodcastAutomationRule,
  };
}

/**
 * Description
 * Function to check automation needs to be trigger or not or which automation needs to be trigger
 * @async
 * @function
 * @name checkAutomationTrigger
 * @kind function
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {object} contactMessageWABAForFirstTimeRule automation rule
 * @param {object} incomingMessageReceivedRule automation rule
 * @returns {Promise<{ trigger: boolean;
 *  triggerContactMsgWABAForFirstTimeAutomation: any;
 *  latestWhatsappTrackerRecord: any;
 *  brodcastAutomationRule: any;
 *  contactMessageCount: void; }>} returns object used for determining message
 * handling process
 */

async function checkAutomationTrigger({
  agency_id,
  sender_number,
  receiver_number,
  contactMessageWABAForFirstTimeRule,
  incomingMessageReceivedRule,
  brodcastAutomationRule,
}) {
  const [
    contact,
    latestWhatsappTrackerRecord,
    contactMessageCount,
    latestContactWhatsAppChatRecord,
  ] = await Promise.all([
    c.contact.findOne({
      mobile_number: receiver_number,
      agency_fk: agency_id,
    }),
    c.whatsappMessageTracker.findOne(
      {
        receiver_number: receiver_number,
        sender_number: sender_number,
        agency_fk: agency_id,
      },
      {
        order: [['created_date', 'DESC']],
      },
    ),
    c.whatsappChat.count(
      {
        receiver_number: receiver_number,
        sender_number: sender_number,
        agency_fk: agency_id,
        msg_type: {
          [Op.in]: [
            'text',
            'image',
            'video',
            'file',
            'document',
            'button',
            'audio',
            'audio_file',
          ],
        },
      },
      {
        order: [['created_date', 'DESC']],
      },
    ),
    c.whatsappChat.findOne(
      {
        receiver_number: receiver_number,
        sender_number: sender_number,
        agency_fk: agency_id,
        msg_type: {
          [Op.in]: [
            'text',
            'image',
            'video',
            'file',
            'document',
            'button',
            'audio',
            'audio_file',
          ],
        },
      },
      {
        order: [['created_date', 'DESC']],
      },
    ),
  ]);

  const triggerAutomationInfo = {
    triggerContactMsgWABAForFirstTimeAutomation: true,
    triggerIncomingMsgReceivedAutomation: false,
    triggerBroadcastAutomation: false,
    latestWhatsappTrackerRecord,
    contactMessageCount,
  };
  let isIncomingMsgAutomationCompleted = null;
  if (h.notEmpty(incomingMessageReceivedRule)) {
    isIncomingMsgAutomationCompleted = await c.whatsappMessageTracker.findOne({
      receiver_number: receiver_number,
      sender_number: sender_number,
      agency_fk: agency_id,
      msg_id: incomingMessageReceivedRule.dataValues.automation_rule_id,
      msg_origin: 'user',
      completed: true,
      tracker_ref_name: {
        [Op.like]: `%_automation_workflow_incoming_message_received_%`,
      },
    });
  }

  if (
    h.isEmpty(contactMessageWABAForFirstTimeRule) ||
    (h.notEmpty(contact) &&
      h.notEmpty(latestContactWhatsAppChatRecord) &&
      h.notEmpty(latestWhatsappTrackerRecord) &&
      !latestWhatsappTrackerRecord?.tracker_ref_name.includes(
        '_automation_workflow_contact_message_first_time_to_waba_',
      )) ||
    (h.notEmpty(latestWhatsappTrackerRecord) &&
      latestWhatsappTrackerRecord?.tracker_ref_name.includes(
        '_automation_workflow_contact_message_first_time_to_waba_',
      ) &&
      latestWhatsappTrackerRecord.completed) ||
    h.cmpBool(contact?.paused_automation, true) ||
    isAutomationLapsedV2({
      latestContactWhatsAppChatRecord,
      automationRule: contactMessageWABAForFirstTimeRule,
    })
  ) {
    triggerAutomationInfo.triggerContactMsgWABAForFirstTimeAutomation = false;
  }

  if (
    h.cmpBool(
      triggerAutomationInfo.triggerContactMsgWABAForFirstTimeAutomation,
      false,
    ) &&
    h.cmpBool(contact?.paused_automation || false, false) &&
    h.notEmpty(incomingMessageReceivedRule) &&
    !isAutomationLapsedV2({
      latestContactWhatsAppChatRecord,
      automationRule: incomingMessageReceivedRule,
    }) &&
    h.isEmpty(isIncomingMsgAutomationCompleted)
  ) {
    triggerAutomationInfo.triggerIncomingMsgReceivedAutomation = true;
  }

  /* 
    if brodcast automation rule active
    if automation is not timedout
    if latestWhatsappTrackerRecord is exit and msg_origin is campaign
    check latestWhatsappTrackerRecord msg_id with active brodcast automation ruleId
  */

  if (
    h.cmpBool(
      triggerAutomationInfo.triggerContactMsgWABAForFirstTimeAutomation,
      false,
    ) &&
    h.cmpBool(
      triggerAutomationInfo.triggerIncomingMsgReceivedAutomation,
      false,
    ) &&
    h.notEmpty(brodcastAutomationRule) &&
    h.notEmpty(latestWhatsappTrackerRecord) &&
    !isAutomationLapsedV2({
      latestContactWhatsAppChatRecord,
      automationRule: brodcastAutomationRule,
    }) &&
    h.cmpStr(latestWhatsappTrackerRecord?.msg_origin, 'campaign') &&
    h.cmpStr(
      latestWhatsappTrackerRecord?.msg_id,
      brodcastAutomationRule?.automation_rule_id,
    )
  ) {
    triggerAutomationInfo.triggerBroadcastAutomation = true;
  }
  return triggerAutomationInfo;
}

/**
 * Description
 * Function to get contact chat count per message tracker
 * @async
 * @function
 * @name contactMessageCountPerMessageTracker
 * @kind function
 * @param {string} agency_id agency id
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} tracker_ref_name tracker_ref_name
 * @returns {Promise<number>} chat count per message tracker
 * handling process
 */

async function contactMessageCountPerMessageTracker({
  agency_id,
  sender_number,
  receiver_number,
  tracker_ref_name,
}) {
  return await c.whatsappChat.count(
    {
      receiver_number: receiver_number,
      sender_number: sender_number,
      agency_fk: agency_id,
      campaign_name: tracker_ref_name,
      msg_type: {
        [Op.in]: [
          'text',
          'image',
          'video',
          'file',
          'document',
          'button',
          'audio',
          'audio_file',
        ],
      },
    },
    {
      order: [['created_date', 'DESC']],
    },
  );
}

/**
 * Description
 * Function to check if needs to trigger first time waba interaction automation
 * @async
 * @function
 * @name checkContactMessageWABAForFirstTime
 * @kind function
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @returns {Promise<{ trigger: boolean;
 *  contactMessageWABAForFirstTimeRule: any;
 *  latestWhatsappTrackerRecord: any;
 *  contactMessageCount: void; }>} returns object used for determining message
 * handling process
 */
async function checkContactMessageWABAForFirstTime({
  wabaOwner,
  agency_id,
  sender_number,
  receiver_number,
}) {
  const [
    contactMessageWABAForFirstTimeRule,
    contact,
    latestWhatsappTrackerRecord,
    contactMessageCount,
    latestContactWhatsAppChatRecord,
  ] = await Promise.all([
    c.automationRule.findOne(
      {
        status: 'active',
        rule_trigger_fk: 'eb7875aa-7e42-4260-8941-02ba9b91b1b0',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
            where: {
              message_channel: 'whatsapp',
              business_account: wabaOwner?.agency_whatsapp_config_id,
            },
            required: true,
          },
          {
            model: models.automation_category,
            where: {
              agency_fk: agency_id,
              platform: 'OTHER',
            },
            require: true,
          },
        ],
      },
    ),
    c.contact.findOne({
      mobile_number: receiver_number,
      agency_fk: agency_id,
    }),
    c.whatsappMessageTracker.findOne(
      {
        receiver_number: receiver_number,
        sender_number: sender_number,
        agency_fk: agency_id,
      },
      {
        order: [['created_date', 'DESC']],
      },
    ),
    c.whatsappChat.count(
      {
        receiver_number: receiver_number,
        sender_number: sender_number,
        agency_fk: agency_id,
        msg_type: {
          [Op.in]: ['text', 'image', 'video', 'file', 'document', 'button'],
        },
      },
      {
        order: [['created_date', 'DESC']],
      },
    ),
    c.whatsappChat.findOne(
      {
        receiver_number: receiver_number,
        sender_number: sender_number,
        agency_fk: agency_id,
        msg_type: {
          [Op.in]: ['text', 'image', 'video', 'file', 'document', 'button'],
        },
      },
      {
        order: [['created_date', 'DESC']],
      },
    ),
  ]);

  // if no automation is active
  // if with contact already sends a message to WABA but not for the automation
  // if automation is paused or lapsed already
  if (
    h.isEmpty(contactMessageWABAForFirstTimeRule) ||
    (h.notEmpty(contact) &&
      h.notEmpty(latestContactWhatsAppChatRecord) &&
      h.notEmpty(latestWhatsappTrackerRecord) &&
      !latestWhatsappTrackerRecord?.tracker_ref_name.includes(
        '_automation_workflow_contact_message_first_time_to_waba_',
      )) ||
    h.cmpBool(contact?.paused_automation, true) ||
    isAutomationLapsed({
      latestContactWhatsAppChatRecord,
      contactMessageWABAForFirstTimeRule,
    })
  ) {
    return {
      trigger: false,
      contactMessageWABAForFirstTimeRule,
      latestWhatsappTrackerRecord,
      contactMessageCount,
    };
  }

  return {
    trigger: true,
    contactMessageWABAForFirstTimeRule,
    latestWhatsappTrackerRecord,
    contactMessageCount,
  };
}

/**
 * Description
 * Function to check if automation is already lapsed or currently paused
 * @function
 * @name isAutomationLapsed
 * @kind function
 * @param {object} latestContactWhatsAppChatRecord latest whatsapp message
 * by contact
 * @param {object} contactMessageWABAForFirstTimeRule automation rule
 * @returns {boolean}
 */
function isAutomationLapsed({
  latestContactWhatsAppChatRecord,
  contactMessageWABAForFirstTimeRule,
}) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (h.general.notEmpty(latestContactWhatsAppChatRecord)) {
    const currentDate = new Date();

    const currentUtcDateString = h.date.convertUTCDateToLocalDate(
      currentDate,
      timeZone,
    );

    const msgDate = h.date.convertUTCDateToLocalDate(
      latestContactWhatsAppChatRecord.dataValues.created_date_raw,
      timeZone,
    );

    const date1 = new Date(currentUtcDateString);
    const date2 = new Date(msgDate);

    const timeDifference = date1 - date2;
    let hoursDifference = timeDifference / (1000 * 60 * 60);
    hoursDifference = Math.round(hoursDifference);

    return (
      hoursDifference >=
      contactMessageWABAForFirstTimeRule.dataValues.workflow_timeout_count
    );
  }

  return false;
}

/**
 * Description
 * Function to check if automation is already lapsed or currently paused
 * @function
 * @name isAutomationLapsed
 * @kind function
 * @param {object} latestContactWhatsAppChatRecord latest whatsapp message
 * by contact
 * @param {object} automationRule automation rule
 * @returns {boolean}
 */
function isAutomationLapsedV2({
  latestContactWhatsAppChatRecord,
  automationRule,
}) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (h.general.notEmpty(latestContactWhatsAppChatRecord)) {
    const currentDate = new Date();

    const currentUtcDateString = h.date.convertUTCDateToLocalDate(
      currentDate,
      timeZone,
    );

    const msgDate = h.date.convertUTCDateToLocalDate(
      latestContactWhatsAppChatRecord.dataValues.created_date_raw,
      timeZone,
    );

    const date1 = new Date(currentUtcDateString);
    const date2 = new Date(msgDate);

    const timeDifference = date1 - date2;
    let hoursDifference = timeDifference / (1000 * 60 * 60);
    hoursDifference = Math.round(hoursDifference);

    return hoursDifference >= automationRule.dataValues.workflow_timeout_count;
  }

  return false;
}

/**
 * Description
 * Function to prepare initial data for message handling
 * @async
 * @function
 * @name prepareTrackerContactRecordForNewMessage
 * @kind function
 * @param {object} wabaOwner waba details
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} reply_to_original_event_id event id where reply is for
 * @returns {Promise<{ whatsappMessageTracker: any;
 *  contactRecord: any; }>} object data for message handling
 */
async function prepareTrackerContactRecordForNewMessage({
  wabaOwner,
  sender_number,
  receiver_number,
  reply_to_original_event_id,
}) {
  let whatsappMessageTracker = null;

  if (h.notEmpty(reply_to_original_event_id)) {
    const eventChat = await c.whatsappChat.findOne({
      original_event_id: reply_to_original_event_id,
    });

    if (h.notEmpty(eventChat)) {
      whatsappMessageTracker = await c.whatsappMessageTracker.findOne(
        {
          agency_fk: wabaOwner?.agency_fk,
          contact_fk: eventChat?.contact_fk,
          receiver_number,
          sender_number,
          tracker_type: 'main',
        },
        {
          order: [['created_date', 'DESC']],
        },
      );
    }
  }

  if (h.isEmpty(whatsappMessageTracker)) {
    whatsappMessageTracker = await c.whatsappMessageTracker.findOne(
      {
        agency_fk: wabaOwner?.agency_fk,
        receiver_number,
        sender_number,
        tracker_type: 'main',
      },
      {
        order: [['created_date', 'DESC']],
      },
    );
  }

  let contactRecord = null;

  if (h.notEmpty(whatsappMessageTracker)) {
    contactRecord = await c.contact.findOne({
      agency_fk: wabaOwner?.agency_fk,
      contact_id: whatsappMessageTracker?.contact_fk,
    });
  }

  return { whatsappMessageTracker, contactRecord };
}

/**
 * Description
 * Function to trigger when message came from a new contact with not records
 * @async
 * @function
 * @name handleNewMessageForNewContact
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} original_event_id message event id
 * @param {string} message contact message
 * @param {string} message_media_url media url if media message is received
 * @param {string} media_message_id media ID
 * @param {string} msg_id message id
 * @param {string} msg_origin message origin
 * @param {timestamp} msg_timestamp message timestamp
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} sender_url waba number url
 * @param {string} receiver_url contact number url
 * @param {string} msg_type message type
 * @param {string} reply_to_original_event_id reply to event id
 * @param {string} reply_to_content reply to message
 * @param {string} reply_to_msg_type reply to message type
 * @param {string} reply_to_file_name reply to filename
 * @param {string} reply_to_contact_id contact identification
 * @param {string} caption caption
 * @param {string} file_name message file name
 * @param {string} content_type message content type
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log
 */
async function handleNewMessageForNewContact(params, additionalConfig, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleNewMessageForNewContact',
    message: 'HANDLING NEW MESSAGE FROM A NEW CONTACT',
  });
  const { contactFirstName, contactLastName, contactStatus } =
    h.whatsapp.prepareWhatsAppContactName({
      receiver_url: params.receiver_url,
      agency_id: params.agency_id,
    });
  const { agency_user_id, agent_first_name, agent_email } =
    await getGetNewContactOwner(params.agency_id);
  const agency = await c.agency.findOne({ agency_id: params.agency_id });
  // creating contact record for agency
  const contact_id = await contactDBHandler.processSaveContactRecord({
    contactData: {
      agency_id: params.agency_id,
      contactFirstName,
      contactLastName,
      receiver_number: params.receiver_number,
      contactStatus,
      agency_user_id,
    },
    contactSourceData: {
      source_type: 'WHATSAPP',
      source_contact_id: params.receiver_number,
    },
    log,
  });
  const tracker_ref_name = `${
    params.agency_id
  }_${Date.now()}_user_message_${agency?.agency_name
    .replaceAll(' ', '_')
    .toLowerCase()}`;
  const campaign_name = `${Date.now()} ${agency?.agency_name} ${contact_id}`;
  const broadcast_date = new Date();

  // creating records for contact message
  const contactMessageParams = params;
  contactMessageParams.new_record = true;
  contactMessageParams.contact_id = contact_id;
  contactMessageParams.tracker_ref_name = tracker_ref_name;
  contactMessageParams.campaign_name = campaign_name;
  contactMessageParams.broadcast_date = broadcast_date;
  const { whatsapp_chat_id } = await messageDBHandler.processSaveContactMessage(
    contactMessageParams,
    log,
  );
  const contact = await c.contact.findOne({
    contact_id: contact_id,
  });

  // trigger notification via appsync
  const appSyncParams = params;
  appSyncParams.position = 'handleNewMessageForNewContact';
  appSyncParams.platform = 'whatsapp';
  appSyncParams.sent = 1;
  appSyncParams.delivered = 1;
  appSyncParams.read = 1;
  appSyncParams.tracker_ref_name = tracker_ref_name;
  appSyncParams.campaign_name = campaign_name;
  appSyncParams.broadcast_date = broadcast_date;
  appSyncParams.media_url = h.isEmpty(appSyncParams.media_url)
    ? params.message_media_url
    : appSyncParams.media_url;
  notificationHandler.sendAppsyncContactNotificationMessage(appSyncParams, log);
  const agencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: agency_user_id,
    },
    include: [
      {
        model: models.user,
        required: true,
      },
      { model: models.agency, required: true },
    ],
  });

  // trigger message transmission via salesforce
  await notificationHandler.transmitToSalesforce(
    {
      sendWhatsAppTemplateMessageResponse: {
        original_event_id: params.original_event_id,
      },
      contact_id: contact_id,
      agency_id: params.agency_id,
      contact,
      agencyUser,
      msg_body: params.message,
      transmission_message_type: params.msg_type,
    },
    additionalConfig,
    log,
  );

  let sendNotification = true;
  if (
    h.cmpBool(agency?.campaign_notification_disable, true) &&
    h.cmpStr(params?.msg_origin, 'campaign')
  ) {
    sendNotification = false;
  }

  return {
    sendNotification,
    agency_campaign_additional_recipient:
      agency?.agency_campaign_additional_recipient,
    whatsapp_chat_id,
    agent_first_name,
    agent_email,
    contact_first_name: contactFirstName,
    contact_last_name: contactLastName,
    new_msg: true,
  };
}

/**
 * Description
 * Function to trigger when message came from an existing contact with no
 * message records
 * @async
 * @function
 * @name handleNewConversationForExistingContact
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {string} contact_first_name contact first name
 * @param {string} contact_last_name contact last name
 * @param {string} agency_user_id contact owner id
 * @param {string} original_event_id message event id
 * @param {string} message contact message
 * @param {string} message_media_url media url if media message is received
 * @param {string} media_message_id media ID
 * @param {string} msg_id message id
 * @param {string} msg_origin message origin
 * @param {timestamp} msg_timestamp message timestamp
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} sender_url waba number url
 * @param {string} receiver_url contact number url
 * @param {string} msg_type message type
 * @param {string} reply_to_original_event_id reply to event id
 * @param {string} reply_to_content reply to message
 * @param {string} reply_to_msg_type reply to message type
 * @param {string} reply_to_file_name reply to filename
 * @param {string} reply_to_contact_id contact identification
 * @param {string} caption caption
 * @param {string} file_name message file name
 * @param {string} content_type message content type
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log
 */
async function handleNewConversationForExistingContact(
  params,
  additionalConfig,
  log,
) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleNewConversationForExistingContact',
    message:
      'HANDLING NEW MESSAGE FROM A CONTACT WITHOUT EXISTING CONVERSATION',
  });
  let agency_user_id = params.agency_user_id;

  if (h.isEmpty(agency_user_id)) {
    const { default_outsider_contact_owner } = await c.agency.findOne({
      agency_id: params.agency_id,
    });
    await contactDBHandler.updateContactOwner({
      contact_id: params.contact_id,
      agency_user_id,
      log,
    });
    agency_user_id = default_outsider_contact_owner;
  }

  const { agent_first_name, agent_email } = await getAgentDetails({
    agency_user_id: agency_user_id,
    agency_id: params.agency_id,
  });
  const agency = await c.agency.findOne({ agency_id: params.agency_id });
  const broadcast_date = new Date();

  const tracker_ref_name = `${
    params.agency_id
  }_${Date.now()}_user_message_${agency?.agency_name
    .replaceAll(' ', '_')
    .toLowerCase()}`;
  const campaign_name = `${Date.now()} ${agency?.agency_name} ${
    params.contact_id
  }`;

  // creating records for contact message
  const contactMessageParams = params;
  contactMessageParams.new_record = true;
  contactMessageParams.tracker_ref_name = tracker_ref_name;
  contactMessageParams.campaign_name = campaign_name;
  contactMessageParams.broadcast_date = broadcast_date;
  const { whatsapp_chat_id } = await messageDBHandler.processSaveContactMessage(
    contactMessageParams,
    log,
  );

  const contact = await c.contact.findOne({
    contact_id: params.contact_id,
  });

  // trigger notification via appsync
  const appSyncParams = params;
  appSyncParams.position = 'handleNewConversationForExistingContact';
  appSyncParams.platform = 'whatsapp';
  appSyncParams.sent = 1;
  appSyncParams.delivered = 1;
  appSyncParams.read = 1;
  appSyncParams.tracker_ref_name = tracker_ref_name;
  appSyncParams.campaign_name = campaign_name;
  appSyncParams.broadcast_date = broadcast_date;
  appSyncParams.media_url = h.isEmpty(appSyncParams.media_url)
    ? params.message_media_url
    : appSyncParams.media_url;
  notificationHandler.sendAppsyncContactNotificationMessage(appSyncParams, log);

  const agencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: agency_user_id,
    },
    include: [
      {
        model: models.user,
        required: true,
      },
      { model: models.agency, required: true },
    ],
  });

  // trigger message transmission via salesforce
  await notificationHandler.transmitToSalesforce(
    {
      sendWhatsAppTemplateMessageResponse: {
        original_event_id: params.original_event_id,
      },
      contact_id: params.contact_id,
      agency_id: params.agency_id,
      contact,
      agencyUser,
      msg_body: params.message,
      transmission_message_type: params.msg_type,
    },
    additionalConfig,
    log,
  );

  let sendNotification = true;
  if (
    h.cmpBool(agency?.campaign_notification_disable, true) &&
    h.cmpStr(params?.msg_origin, 'campaign')
  ) {
    sendNotification = false;
  }

  return {
    sendNotification,
    agency_campaign_additional_recipient:
      agency?.agency_campaign_additional_recipient,
    whatsapp_chat_id,
    agent_first_name,
    agent_email,
    contact_first_name: params.contact_first_name,
    contact_last_name: params.contact_last_name,
    new_msg: true,
  };
}

/**
 * Description
 * Function to trigger when message came from an existing contact with records
 * already
 * @async
 * @function
 * @name handleNewMessageForExistingContact
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} tracker_ref_name message tracker reference name
 * @param {string} campaign_name campaign name identifier
 * @param {string} contact_id contact id
 * @param {string} contact_first_name contact first name
 * @param {string} contact_last_name contact last name
 * @param {string} agency_user_id contact owner id
 * @param {string} original_event_id message event id
 * @param {string} message contact message
 * @param {string} message_media_url media url if media message is received
 * @param {string} media_message_id media ID
 * @param {string} msg_id message id
 * @param {string} msg_origin message origin
 * @param {timestamp} msg_timestamp message timestamp
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} sender_url waba number url
 * @param {string} receiver_url contact number url
 * @param {string} msg_type message type
 * @param {string} reply_to_original_event_id reply to event id
 * @param {string} reply_to_content reply to message
 * @param {string} reply_to_msg_type reply to message type
 * @param {string} reply_to_file_name reply to filename
 * @param {string} reply_to_contact_id contact identification
 * @param {string} caption caption
 * @param {string} file_name message file name
 * @param {string} content_type message content type
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log
 */
async function handleNewMessageForExistingContact(
  params,
  additionalConfig,
  log,
) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleNewMessageForExistingContact',
    message: 'HANDLING NEW MESSAGE FROM A CONTACT WITH EXISTING CONVERSATION',
  });
  let agency_user_id = params.agency_user_id;

  if (h.isEmpty(agency_user_id)) {
    const { default_outsider_contact_owner } = await c.agency.findOne({
      agency_id: params.agency_id,
    });
    await contactDBHandler.updateContactOwner({
      contact_id: params.contact_id,
      agency_user_id,
      log,
    });
    agency_user_id = default_outsider_contact_owner;
  }
  const { agent_first_name, agent_email } = await getAgentDetails({
    agency_user_id: agency_user_id,
    agency_id: params.agency_id,
  });
  const agency = await c.agency.findOne({ agency_id: params.agency_id });
  const broadcast_date = new Date();

  // creating records for contact message
  const contactMessageParams = params;
  contactMessageParams.new_record = false;
  contactMessageParams.tracker_ref_name = params.tracker_ref_name;
  contactMessageParams.campaign_name = params.campaign_name;
  contactMessageParams.broadcast_date = broadcast_date;
  const { whatsapp_chat_id } = await messageDBHandler.processSaveContactMessage(
    contactMessageParams,
    log,
  );
  const contact = await c.contact.findOne({
    contact_id: params.contact_id,
  });

  await messageDBHandler.updateLatestMessageTrackerForContactAsRead({
    agency_id: params.agency_id,
    sender_number: params.sender_number,
    receiver_number: params.receiver_number,
    log,
  });

  // trigger notification via appsync
  const appSyncParams = params;
  appSyncParams.position = 'handleNewMessageForExistingContact';
  appSyncParams.platform = 'whatsapp';
  appSyncParams.sent = 1;
  appSyncParams.delivered = 1;
  appSyncParams.read = 1;
  appSyncParams.tracker_ref_name = params.tracker_ref_name;
  appSyncParams.campaign_name = params.campaign_name;
  appSyncParams.broadcast_date = broadcast_date;
  appSyncParams.media_url = h.isEmpty(appSyncParams.media_url)
    ? params.message_media_url
    : appSyncParams.media_url;
  notificationHandler.sendAppsyncContactNotificationMessage(appSyncParams, log);

  const agencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: agency_user_id,
    },
    include: [
      {
        model: models.user,
        required: true,
      },
      { model: models.agency, required: true },
    ],
  });

  // trigger message transmission via salesforce
  await notificationHandler.transmitToSalesforce(
    {
      sendWhatsAppTemplateMessageResponse: {
        original_event_id: params.original_event_id,
      },
      contact_id: params.contact_id,
      agency_id: params.agency_id,
      contact,
      agencyUser,
      msg_body: params.message,
      transmission_message_type: params.msg_type,
    },
    additionalConfig,
    log,
  );

  let sendNotification = true;
  if (
    h.cmpBool(agency?.campaign_notification_disable, true) &&
    h.cmpStr(params.msg_origin, 'campaign')
  ) {
    sendNotification = false;
  }

  return {
    sendNotification,
    agency_campaign_additional_recipient:
      agency?.agency_campaign_additional_recipient,
    whatsapp_chat_id,
    agent_first_name,
    agent_email,
    contact_first_name: params.contact_first_name,
    contact_last_name: params.contact_last_name,
    new_msg: false,
  };
}

/**
 * Description
 * Function to get contact owner for new contact
 * @async
 * @function
 * @name getGetNewContactOwner
 * @kind function
 * @param {string} agency_id agency id
 * @returns {Promise} returns the agency contact owner details
 */
async function getGetNewContactOwner(agency_id) {
  let current_agency_user_id = null;
  let agent_first_name = null;
  let agent_last_name = null;
  let agent_email = null;
  const { default_outsider_contact_owner } = await c.agency.findOne({
    agency_id: agency_id,
  });
  current_agency_user_id = await validateDefaultContactOwner(
    default_outsider_contact_owner,
  );

  if (h.notEmpty(current_agency_user_id)) {
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

  return {
    agency_user_id: current_agency_user_id,
    agent_first_name,
    agent_last_name,
    agent_email,
  };
}

/**
 * Description
 * Function to check and get media url for message
 * @async
 * @function
 * @name handleMediaMessageType
 * @kind function
 * @param {string} agency_id agency id
 * @param {object} wabaOwner waba object
 * @param {string} msg_type:  message type
 * @param {string} receiver_number contact number
 * @param {string} message contact message content
 * @param {object} log server log
 * @returns {Promise<{ success: boolean; fileURL?: undefined;
 * contentType?: undefined; } | { success: boolean; fileURL: string;
 * contentType: string | false; } | null>} returns null if message type is not
 * of media types, returns object data regarding the media url
 */
async function handleMediaMessageType({
  agency_id,
  wabaOwner,
  msg_type,
  receiver_number,
  message,
  log,
}) {
  const media_message_types = constant.WHATSAPP.MEDIA_MSG_TYPE;
  if (!media_message_types.includes(msg_type)) {
    return {
      message_data: message,
      message_media_url: null,
      media_message_id: null,
    };
  }

  const { whatsapp_config } = await models.agency_config.findOne({
    where: { agency_fk: agency_id },
  });

  const config = JSON.parse(whatsapp_config);
  const environment = config.environment;
  const whatsAppToken = await h.whatsapp.getWhatsAppToken(wabaOwner);
  const mediaURL = await h.whatsapp.getMediaURL(
    {
      msg_type: msg_type,
      receiver_number,
      msg_details: message,
      token: whatsAppToken,
      environment: environment,
    },
    log,
  );

  const message_data =
    h.notEmpty(mediaURL) && h.cmpBool(mediaURL.success, true)
      ? mediaURL.fileURL
      : message;
  const message_media_url =
    h.notEmpty(mediaURL) && h.cmpBool(mediaURL.success, true)
      ? mediaURL.fileURL
      : null;

  return { message_data, message_media_url, media_message_id: message };
}

/**
 * Description
 * Function to get agent details for specific agency user id of an agency
 * @async
 * @function
 * @name getAgentDetails
 * @kind function
 * @param {string} agency_user_id agency user id
 * @param {string} agency_id agency id
 * @returns {Promise} agent details
 */
async function getAgentDetails({ agency_user_id, agency_id }) {
  const agencyUser = await c.agencyUser.findOne({
    agency_user_id: agency_user_id,
    agency_fk: agency_id,
  });
  const { first_name, last_name, email } = await c.user.findOne({
    user_id: agencyUser.user_fk,
  });

  return {
    agent_first_name: first_name,
    agent_last_name: last_name,
    agent_email: email,
  };
}

/**
 * Description
 * Function to add contact as a WABA number connection
 * @async
 * @function
 * @name addContactAsWABAConnection
 * @kind function
 * @param {object} wabaOwner waba details
 * @param {string} receiver_number contact number
 */
async function addContactAsWABAConnection({ wabaOwner, receiver_number, log }) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'addContactAsWABAConnection',
    message: `ADDING ${receiver_number} AS CONNECTION OF ${wabaOwner?.waba_number}`,
  });
  const agencyWhatsAppCredentials = h.notEmpty(
    wabaOwner?.agency_whatsapp_api_token,
  )
    ? wabaOwner?.agency_whatsapp_api_token +
      ':' +
      wabaOwner?.agency_whatsapp_api_secret
    : null;
  if (!h.isEmpty(agencyWhatsAppCredentials)) {
    const { whatsapp_config } = await models.agency_config.findOne({
      where: { agency_fk: wabaOwner?.agency_fk },
    });
    const config = JSON.parse(whatsapp_config);
    const environment = config.environment;
    const agencyBufferedCredentials = h.notEmpty(agencyWhatsAppCredentials)
      ? Buffer.from(agencyWhatsAppCredentials, 'utf8').toString('base64')
      : null;

    const connectionData = JSON.stringify({
      uri: `${environment}://${receiver_number}@whatsapp.com`,
      name: `${receiver_number}`,
    });
    const connectionConfig = {
      method: 'post',
      url: 'https://apiv2.unificationengine.com/v2/connection/add',
      headers: {
        Authorization: `Basic ${agencyBufferedCredentials}`,
        'Content-Type': 'application/json',
      },
      data: connectionData,
    };

    await axios(connectionConfig)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  }
}

/**
 * Description
 * This function is used for handling and checking if a contact message using
 * buttons or text has an automated response set from the business message
 * source, either from campaign or automation
 * @async
 * @function
 * @name handleAutoResponse
 * @kind function
 * @param {string} replyMsg the contact message
 * @param {timestamp} msg_timestamp timestamp when the contact message is
 * received
 * @param {string} sender_number WABA number
 * @param {string} sender_url payload data in url format for waba number
 * @param {string} receiver_number contact number
 * @param {string} receiver_url payload data in url format for contact number
 * @param {object} log server log function
 * @param {object} additionalConfig any additional config added in the consumer
 */
async function handleAutoResponse(
  {
    message,
    msg_timestamp,
    sender_number,
    sender_url,
    receiver_number,
    receiver_url,
    contact,
  },
  additionalConfig,
  log,
) {
  const replyMsg = message;
  let opt_out = false;
  const parts = [];
  let response = '';
  const has_additional = false;
  let send_reply = false;

  // prepare initial data needed for auto response
  const {
    whatsappMsgTrackerForReplyUpdate,
    agency,
    api_credentials,
    receivers,
    whatsapp_config,
    campaign_cta,
  } = await handlePrepareAutoResponseRecords({
    contact_id: contact?.contact_id,
    sender_number,
    receiver_number,
  });
  // get contact record
  const contactRecord = contact;
  // if there is a cta record for campaign or automation, check if will
  // send text response
  let cta_number = 0;
  if (h.notEmpty(campaign_cta)) {
    let msg_response = '';
    const { index, currentTextMessageResponse, currentSendReplyStatus } =
      await checkCTATextResponse({
        replyMsg,
        campaign_cta,
        log,
      });

    cta_number = index;
    msg_response = currentTextMessageResponse;
    send_reply = currentSendReplyStatus;

    log.info({
      reply: replyMsg,
      response: msg_response,
      send_reply: send_reply,
      has_additional: has_additional,
    });

    response = msg_response;
    opt_out = false;
  }

  // check opt out conditions
  const newOptOutStatus = await handleOptOutStatus({
    replyMsg,
    opt_out,
    whatsappMsgTrackerForReplyUpdate,
    log,
  });

  opt_out = newOptOutStatus;
  if (h.cmpBool(opt_out, true)) {
    await contactDBHandler.handleOptOutInAutoResponse({
      whatsappMsgTrackerForReplyUpdate,
      receiver_number,
      models,
      log,
    });
  }

  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleAutoResponse',
    checking_response: 'checking text esponse',
    send_reply: send_reply,
    has_additional: has_additional,
    response: response,
  });

  // sending text auto response
  if (h.cmpBool(send_reply, true) && h.notEmpty(response)) {
    const agency_id = h.notEmpty(agency?.dataValues?.agency_id)
      ? agency?.dataValues?.agency_id
      : agency?.agency_id;
    await c.messageInventory.addMessageAndVirtualCount(agency_id);
    await sendTextAutoResponse(
      {
        cta_number,
        parts,
        response,
        msg_timestamp,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url,
        receivers,
        agency,
        contact,
        contactRecord,
        api_credentials,
        whatsapp_config,
        whatsappMsgTrackerForReplyUpdate,
      },
      additionalConfig,
      log,
    );
  }

  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleAutoResponse',
    checking_response: 'checking template response conditions',
    campaign_cta,
    send_reply: send_reply,
    has_additional: has_additional,
    response: response,
  });

  // if no simple auto response
  if (
    h.notEmpty(campaign_cta) &&
    h.cmpBool(send_reply, false) &&
    h.isEmpty(response)
  ) {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'handleAutoResponse',
      send_reply,
      response,
      receiver_number,
      replyMsg,
    });
    const agency_id = h.notEmpty(agency?.dataValues?.agency_id)
      ? agency?.dataValues?.agency_id
      : agency?.agency_id;
    await c.messageInventory.addMessageAndVirtualCount(agency_id);
    // handle template response sending
    await handleTemplateAutoResponse(
      {
        campaign_cta,
        replyMsg,
        agency,
        contact,
        msg_timestamp,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url,
        whatsapp_config,
        api_credentials,
        whatsappMsgTrackerForReplyUpdate,
      },
      additionalConfig,
      log,
    );
  }

  // check if final auto response is to be sent
  await handleFinalAutoResponseMessage(
    {
      whatsappMsgTrackerForReplyUpdate,
      agency,
      contact,
      contactRecord,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      campaign_cta,
      receivers,
      api_credentials,
      whatsapp_config,
      msg_timestamp,
    },
    additionalConfig,
    log,
  );
}

/**
 * Description
 * Function to prepare initial data needed for the auto response handler
 * @async
 * @function
 * @name handlePrepareAutoResponseRecords
 * @kind function
 * @param {string} contact_id contact ID
 * @param {string} sender_number WABA number
 * @param {string} receiver_number contact number
 * @returns {Promise} returns initial dataset needed for auto response
 */
async function handlePrepareAutoResponseRecords({
  contact_id,
  sender_number,
  receiver_number,
}) {
  const whatsappMsgTrackerForReplyUpdate =
    await c.whatsappMessageTracker.findOne(
      {
        contact_fk: contact_id,
        receiver_number,
        sender_number,
        tracker_type: 'main',
      },
      {
        order: [['created_date', 'DESC']],
      },
    );
  const [agency, agency_waba_config] = await Promise.all([
    c.agency.findOne({
      agency_id: whatsappMsgTrackerForReplyUpdate?.agency_fk,
    }),
    c.agencyWhatsappConfig.findOne({
      agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
      waba_number: sender_number,
    }),
  ]);

  const { agency_whatsapp_api_token, agency_whatsapp_api_secret } =
    agency_waba_config;

  const api_credentials = Buffer.from(
    `${agency_whatsapp_api_token}:${agency_whatsapp_api_secret}`,
    'utf8',
  ).toString('base64');

  const receivers = [
    {
      name: 'name',
      address: `${receiver_number}`,
      Connector: `${receiver_number}`,
      type: 'individual',
    },
  ];

  const { whatsapp_config } = await models.agency_config.findOne({
    where: { agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk },
  });

  const campaign_cta = await models.campaign_cta.findOne({
    where: {
      campaign_tracker_ref_name:
        whatsappMsgTrackerForReplyUpdate?.tracker_ref_name,
    },
  });

  return {
    whatsappMsgTrackerForReplyUpdate,
    agency,
    api_credentials,
    receivers,
    whatsapp_config,
    campaign_cta,
  };
}

/**
 * Description
 * Function to check on the campaign cta record if a text message is to be sent
 * @async
 * @function
 * @name checkCTATextResponse
 * @kind function
 * @param {string} replyMsg the contact message
 * @param {object} campaign_cta the campaign cta data
 * @param {object} log server log function
 * @returns {Promise} returns data result if text message response is available
 */
async function checkCTATextResponse({ replyMsg, campaign_cta, log }) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'checkCTATextResponse',
    message: 'checking if reply has text autoresponse',
    reply: replyMsg,
  });
  let index = 1;
  let msg_response;
  let send_reply = false;
  for (index = 1; index <= 10; index++) {
    if (
      h.cmpStr(campaign_cta[`cta_${index}`], replyMsg.toLowerCase()) &&
      h.notEmpty(campaign_cta[`cta_${index}_response`])
    ) {
      msg_response = campaign_cta[`cta_${index}_response`];
      send_reply = true;
      break;
    }
  }

  return {
    index,
    currentTextMessageResponse: msg_response,
    currentSendReplyStatus: send_reply,
  };
}

/**
 * Description
 * Process handling of a message is to mark opt out for the contact
 * @async
 * @function
 * @name handleOptOutStatus
 * @kind function
 * @param {string} replyMsg the contact message
 * @param {boolean} opt_out status if optout is set
 * @param {object} whatsappMsgTrackerForReplyUpdate current tracker
 * @param {object} log server log function
 * @param transaction database transaction
 * @returns {Promise<any>} returns boolean opt out status
 */
async function handleOptOutStatus({
  replyMsg,
  opt_out,
  whatsappMsgTrackerForReplyUpdate,
  log,
}) {
  if (h.cmpStr(replyMsg.toLowerCase(), 'unsubscribe')) {
    opt_out = true;
  }

  const optOutTextRecords = await c.unsubscribeText.findAll({
    agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
  });

  const optOutTexts = optOutTextRecords.map((m) => {
    return m.content.toLowerCase();
  });

  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleOptOutStatus',
    message: 'OPT OUT TEXTS',
    optOutTexts,
  });
  log.info({
    message: '!!!!!!!!!!!!!!!!!!!!!!!!!!!!OPT OUT TEXTS',
    data: optOutTexts,
  });
  if (optOutTexts.includes(replyMsg.toLowerCase())) {
    opt_out = true;
  }

  return opt_out;
}

/**
 * Description
 * Function to send text auto response
 * @async
 * @function
 * @name sendTextAutoResponse
 * @kind function
 * @param {object} params breakdown below
 * @param {object} parts message object
 * @param {string} response the automated text response
 * @param {timestamp} msg_timestamp the timestamp of the contact message
 * @param {string} sender_number WABA number
 * @param {string} sender_url payload data in url format for waba number
 * @param {string} receiver_number contact number
 * @param {string} receiver_url payload data in url format for contact number
 * @param {object} receivers receiver object to be used for sending message
 * @param {object} agency agency data
 * @param {object} contact contact data
 * @param {object} contactRecord contact data in different format
 * @param {string} api_credentials the waba credentials
 * @param {object} whatsapp_config config data for agency whatsapp
 * @param {object} whatsappMsgTrackerForReplyUpdate current tracker of the
 *  thread
 * @param {object} log server log function
 * @param {object} additionalConfig any additional config added in the consumer
 */
async function sendTextAutoResponse(params, additionalConfig, log) {
  const parts = params.parts || [];
  const whatsappMsgTrackerForReplyUpdate =
    params.whatsappMsgTrackerForReplyUpdate;
  const contactRecord = params.contactRecord;
  const processedResponse = he.unescape(params.response);
  parts.push({
    id: '1',
    contentType: 'text/plain',
    data: `${processedResponse}`,
    size: 1000,
    type: 'body',
    sort: 0,
  });

  log.info({
    action: 'sending auto response',
    data: {
      mobile_number: params.receiver_number,
      parts,
      receivers: params.receivers,
      api_credentials: params.api_credentials,
    },
  });

  const config = JSON.parse(params.whatsapp_config);
  const environment = config.environment;

  const agency_id = h.notEmpty(params?.agency?.dataValues?.agency_id)
    ? params?.agency?.dataValues?.agency_id
    : params?.agency?.agency_id;
  const canContinueMessageSending =
    await c.messageInventory.checkIfCanSendMessage(agency_id, null, log);

  let result;
  if (h.cmpBool(canContinueMessageSending.can_continue, false)) {
    const reason = h.general.getMessageByCode(canContinueMessageSending.reason);
    const failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
    result = { original_event_id: null, failed_reason };
  } else {
    result = await h.whatsapp.sendAutoResponseMessage({
      mobile_number: params.receiver_number,
      parts,
      receivers: params.receivers,
      api_credentials: params.api_credentials,
      environment,
      log,
    });
  }

  await messageDBHandler.saveAutomationMessageResponse({
    whatsappMsgTrackerForReplyUpdate,
    agency: params.agency,
    msg_id: `followup ${params.cta_number}`,
    msg_body: `${params.response}`,
    msg_type: 'frompave',
    msg_template_id: null,
    msg_category: 'SERVICE',
    msg_timestamp: params.msg_timestamp,
    sender_number: params.sender_number,
    sender_url: params.sender_url,
    receiver_number: params.receiver_number,
    receiver_url: params.receiver_url,
    contactRecord,
    contact: params.contact,
    result,
    log,
  });

  await notificationHandler.triggerAppsyncNotificationForAutoResponseProcess(
    {
      position: 'sendTextAutoResponse',
      platform: 'whatsapp',
      campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
      agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
      contact_fk: contactRecord?.contact_id,
      contact_id: contactRecord?.contact_id,
      agency_user_fk: contactRecord?.agency_user_fk,
      original_event_id: result.original_event_id,
      msg_body: `${params.response}`,
      message: `${params.response}`,
      msgData: `${params.response}`,
      msg_type: 'frompave',
      msg_timestamp: params.msg_timestamp,
      sender_number: params.sender_number,
      sender_url: params.sender_url,
      receiver_number: params.receiver_url,
      failed: h.isEmpty(result?.original_event_id),
      sent: h.notEmpty(result?.original_event_id),
    },
    log,
  );

  const agencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: contactRecord?.agency_user_fk,
    },
    include: [
      {
        model: models.user,
        required: true,
      },
      { model: models.agency, required: true },
    ],
  });

  // trigger message transmission via salesforce
  await notificationHandler.transmitToSalesforce(
    {
      sendWhatsAppTemplateMessageResponse: {
        original_event_id: result?.original_event_id,
      },
      contact_id: contactRecord?.contact_id,
      agency_id: whatsappMsgTrackerForReplyUpdate?.agency_fk,
      contact: params.contact,
      agencyUser,
      msg_body: params.response,
      transmission_message_type: 'plain_frompave',
    },
    additionalConfig,
    log,
  );
}

/**
 * Description
 * Getting the template to be used for auto response
 * @async
 * @function
 * @name handleTemplateAutoResponse
 * @kind function
 * @param {object} params breakdown below
 * @param {object} campaign_cta cta options
 * @param {string} replyMsg contact message
 * @param {object} agency agency data
 * @param {object}contact contact data
 * @param {timestamp} msg_timestamp mesage timestamp
 * @param {string} sender_number waba number
 * @param {string} sender_url waba url
 * @param {string} receiver_number contact number
 * @param {string} receiver_url contact url
 * @param {object} whatsapp_config whatsapp configuration object
 * @param {string} api_credentials waba credentials
 * @param {object} whatsappMsgTrackerForReplyUpdate tracker object
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log
 */
async function handleTemplateAutoResponse(params, additionalConfig, log) {
  let send_trigger_response = false;
  let followup_template_id = null;
  let cta_number = '';
  const replyMsg = params.replyMsg;
  for (let i = 1; i <= 10; i++) {
    const cta = params.campaign_cta[`cta_${i}`];
    if (!h.isEmpty(cta)) {
      if (h.cmpStr(replyMsg.toLowerCase(), cta.toLowerCase())) {
        if (!h.isEmpty(params.campaign_cta[`trigger_cta_${i}_options`])) {
          followup_template_id =
            params.campaign_cta[`trigger_cta_${i}_options`];
          send_trigger_response = true;
          cta_number = i;
          break;
        }
      }
    }
  }

  log.info({
    checking_response: 'checking response',
    send_trigger_response: send_trigger_response,
    followup_template_id: followup_template_id,
    cta_number,
  });

  if (h.cmpBool(send_trigger_response, true)) {
    await sendTemplateAutoResponse(
      {
        followup_template_id,
        contact: params.contact,
        msg_timestamp: params.msg_timestamp,
        sender_number: params.sender_number,
        sender_url: params.sender_url,
        receiver_number: params.receiver_number,
        receiver_url: params.receiver_url,
        cta_number,
        agency: params.agency,
        whatsapp_config: params.whatsapp_config,
        whatsappMsgTrackerForReplyUpdate:
          params.whatsappMsgTrackerForReplyUpdate,
        api_credentials: params.api_credentials,
      },
      additionalConfig,
      log,
    );
  }
}

/**
 * Description
 * Process to send template auto response
 * @async
 * @function
 * @name sendTemplateAutoResponse
 * @kind function
 * @param {object} params breakdown below
 * @param {string} followup_template_id template id for followup message
 * @param {object} contact contact record
 * @param {timestamp} msg_timestamp message timestamp
 * @param {string} sender_number waba number
 * @param {string} sender_url waba url
 * @param {string} receiver_number contact number
 * @param {string} receiver_url contact url
 * @param {string} cta_number cta number index
 * @param {object} agency agency object
 * @param {object} whatsapp_config whatsapp config
 * @param {object} whatsappMsgTrackerForReplyUpdate current tracker record
 * @param {string} api_credentials waba credentials
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log function
 */
async function sendTemplateAutoResponse(params, additionalConfig, log) {
  const config = JSON.parse(params.whatsapp_config);
  const environment = config.environment;
  const whatsappMsgTrackerForReplyUpdate =
    params.whatsappMsgTrackerForReplyUpdate;
  const contact = params.contact;

  const { sendMessagePartsData, msg_body, msg_category } =
    await prepareTemplateResponseMessage({
      followup_template_id: params.followup_template_id,
      agency: params.agency,
      contact,
      receiver_number: params.receiver_number,
    });

  log.info({ sendMessagePartsData });

  const agency_id = h.notEmpty(params?.agency?.dataValues?.agency_id)
    ? params?.agency?.dataValues?.agency_id
    : params?.agency?.agency_id;
  const canContinueMessageSending =
    await c.messageInventory.checkIfCanSendMessage(agency_id, null, log);

  let sendWhatsAppTemplateMessageResponse;
  if (h.cmpBool(canContinueMessageSending.can_continue, false)) {
    const reason = h.general.getMessageByCode(canContinueMessageSending.reason);
    const failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
    sendWhatsAppTemplateMessageResponse = {
      original_event_id: null,
      failed_reason,
    };
  } else {
    sendWhatsAppTemplateMessageResponse =
      await h.whatsapp.sendWhatsAppTemplateMessage(
        params.receiver_number,
        true,
        null,
        sendMessagePartsData,
        params.api_credentials,
        environment,
        'payload',
        log,
      );
  }

  await messageDBHandler.saveAutomationMessageResponse({
    whatsappMsgTrackerForReplyUpdate,
    agency: params.agency,
    msg_id: `followup ${params.cta_number}`,
    msg_body: `${msg_body}`,
    msg_type: 'frompave',
    msg_template_id: params.followup_template_id,
    msg_category: msg_category,
    msg_timestamp: params.msg_timestamp,
    sender_number: params.sender_number,
    sender_url: params.sender_url,
    receiver_number: params.receiver_number,
    receiver_url: params.receiver_url,
    contactRecord: contact,
    contact,
    result: sendWhatsAppTemplateMessageResponse,
    log,
  });

  await notificationHandler.triggerAppsyncNotificationForAutoResponseProcess(
    {
      position: 'sendTemplateAutoResponse',
      platform: 'whatsapp',
      campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
      agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
      contact_fk: contact?.contact_id,
      contact_id: contact?.contact_id,
      agency_user_fk: contact?.agency_user_fk,
      original_event_id: sendWhatsAppTemplateMessageResponse.original_event_id,
      msg_body: `${msg_body}`,
      message: `${msg_body}`,
      msgData: `${msg_body}`,
      msg_type: 'frompave',
      msg_timestamp: params.msg_timestamp,
      sender_number: params.sender_number,
      sender_url: params.sender_url,
      receiver_number: params.receiver_number,
      failed: h.isEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id),
      sent: h.notEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id),
    },
    log,
  );

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

  // trigger message transmission via salesforce
  await notificationHandler.transmitToSalesforce(
    {
      sendWhatsAppTemplateMessageResponse: {
        original_event_id:
          sendWhatsAppTemplateMessageResponse?.original_event_id,
      },
      contact_id: contact?.contact_id,
      agency_id: whatsappMsgTrackerForReplyUpdate?.agency_fk,
      contact,
      agencyUser,
      msg_body: msg_body,
      transmission_message_type: 'template',
    },
    additionalConfig,
    log,
  );
}

/**
 * Description
 * Function to build the template data to be sent
 * @async
 * @function
 * @name prepareTemplateResponseMessage
 * @kind function
 * @param {string} followup_template_id template ID for auto response
 * @param {object} agency agency object
 * @param {object} contact contact object
 * @param {string} receiver_number contact number
 * @returns {Promise<{ sendMessagePartsData, msg_body }>} returns the message
 * object and the message text for saving
 */
async function prepareTemplateResponseMessage({
  followup_template_id,
  agency,
  contact,
  receiver_number,
}) {
  const followup_template = await models.waba_template.findOne({
    where: {
      waba_template_id: followup_template_id,
    },
  });
  const msg_category = followup_template?.category;
  const variable = followup_template?.variable_identifier;
  const variable_arr = h.isEmpty(variable) ? [] : variable.split(',');
  const template = JSON.parse(followup_template?.content);
  const messageParts = [];

  const contactAgencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: contact?.agency_user_fk,
    },
    include: [{ model: models.user, required: true }],
  });

  const { messageTemplate, msg_body } = processFollowupMessageTemplateParts({
    template,
    followup_template,
    variable_arr,
    agency,
    contactAgencyUser,
    contact,
    receiver_number,
  });

  const body = messageTemplate.body;
  const header = messageTemplate.header;
  const button = messageTemplate.button;

  messageTemplate.data = JSON.stringify({
    element_name: followup_template.template_name,
    language: followup_template.language,
    header: header,
    body: body,
    button: button,
  });
  delete messageTemplate.body;
  delete messageTemplate.header;
  delete messageTemplate.button;
  messageParts.push(messageTemplate);

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
      parts: messageParts,
    },
  };

  return { sendMessagePartsData, msg_body, msg_category };
}

/**
 * Description
 * Function to handle if there is a need to send a final automation response
 * Response is always a text response
 * This is usually triggered in campaign, mindbody, and hubspot related messages
 * @async
 * @function
 * @name handleFinalAutoResponseMessage
 * @kind function
 * @param {object} params breakdown below
 * @param {object} whatsappMsgTrackerForReplyUpdate tracker object
 * @param {object} agency agency data
 * @param {object} contact contact data
 * @param {object} contactRecord contact data
 * @param {string} sender_number waba number
 * @param {string} sender_url waba url
 * @param {string} receiver_number contact number
 * @param {string} receiver_url contact url
 * @param {timestamp} msg_timestamp mesage timestamp
 * @param {object} campaign_cta cta object
 * @param {object} receivers receiver object for whatsapp sending
 * @param {object} whatsapp_config whatsapp configuration object
 * @param {string} api_credentials waba credentials
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log
 * @param {object} transaction current db transaction
 */
async function handleFinalAutoResponseMessage(params, additionalConfig, log) {
  const whatsappMsgTrackerForReplyUpdate =
    params.whatsappMsgTrackerForReplyUpdate;
  const campaign_cta = params.campaign_cta;
  const contactRecord = params.contactRecord;
  const contact = params.contact;
  const latestPaveMessage = await c.whatsappChat.findOne(
    {
      campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
      sender_number: params.sender_number,
      receiver_number: params.receiver_number,
      msg_id: {
        [Op.like]: 'followup%',
      },
    },
    {
      order: [['created_date', 'DESC']],
    },
  );

  const latestConversationMessage = await c.whatsappChat.findOne(
    {
      campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
      sender_number: params.sender_number,
      receiver_number: params.receiver_number,
    },
    {
      order: [['created_date', 'DESC']],
    },
  );

  const lastPaveMessageMsgID = latestPaveMessage?.dataValues?.msg_id;

  if (
    h.notEmpty(latestPaveMessage) &&
    h.notEmpty(lastPaveMessageMsgID) &&
    h.notEmpty(latestConversationMessage) &&
    !h.cmpStr(latestConversationMessage?.dataValues?.msg_type, 'frompave')
  ) {
    const followup_mark = latestPaveMessage?.dataValues?.msg_id;
    const response_mark = followup_mark.split(' ')[1];
    log.info({ message: 'response mark', response_mark });
    log.info({ campaign_cta });
    let send_final_response = false;
    let final_response = '';
    let previous_template_id = null;
    let previous_text_message = null;
    for (let i = 1; i <= 10; i++) {
      if (
        h.cmpInt(response_mark, i) &&
        !h.isEmpty(campaign_cta[`cta_${i}_final_response`])
      ) {
        final_response = campaign_cta[`cta_${i}_final_response`];
        previous_template_id = campaign_cta[`trigger_cta_${i}_options`];
        previous_text_message = campaign_cta[`cta_${i}_response`];
      }
    }

    if (h.notEmpty(previous_template_id) || h.notEmpty(previous_text_message)) {
      send_final_response = true;
    }

    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'handleFinalAutoResponseMessage',
      message: 'is final message to be sent',
      to_send:
        h.notEmpty(previous_template_id) || h.notEmpty(previous_text_message),
    });

    if (h.cmpBool(send_final_response, true)) {
      await c.messageInventory.addMessageAndVirtualCount(
        whatsappMsgTrackerForReplyUpdate?.agency_fk,
      );
      const processedFinalResponse = he.unescape(final_response);
      const parts = [];
      parts.push({
        id: '1',
        contentType: 'text/plain',
        data: `${processedFinalResponse}`,
        size: 1000,
        type: 'body',
        sort: 0,
      });

      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'handleFinalAutoResponseMessage',
        action: 'sending final response',
        data: {
          mobile_number: params.receiver_number,
          parts,
          receivers: params.receivers,
          api_credentials: params.api_credentials,
        },
      });

      const config = JSON.parse(params.whatsapp_config);
      const environment = config.environment;

      const agency_id = h.notEmpty(params?.agency?.dataValues?.agency_id)
        ? params?.agency?.dataValues?.agency_id
        : params?.agency?.agency_id;
      const canContinueMessageSending =
        await c.messageInventory.checkIfCanSendMessage(agency_id, null, log);

      let result;
      if (h.cmpBool(canContinueMessageSending.can_continue, false)) {
        const reason = h.general.getMessageByCode(
          canContinueMessageSending.reason,
        );
        const failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
        result = {
          original_event_id: null,
          failed_reason,
        };
      } else {
        result = await h.whatsapp.sendAutoResponseMessage({
          mobile_number: params.receiver_number,
          parts,
          receivers: params.receivers,
          api_credentials: params.api_credentials,
          environment,
          log,
        });
      }

      await messageDBHandler.saveAutomationMessageResponse({
        whatsappMsgTrackerForReplyUpdate,
        agency: params.agency,
        msg_id: whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
        msg_body: `${final_response}`,
        msg_type: 'frompave',
        msg_template_id: null,
        msg_category: 'SERVICE',
        msg_timestamp: params.msg_timestamp,
        sender_number: params.sender_number,
        sender_url: params.sender_url,
        receiver_number: params.receiver_number,
        receiver_url: params.receiver_url,
        contactRecord,
        contact,
        result,
        log,
      });

      await notificationHandler.triggerAppsyncNotificationForAutoResponseProcess(
        {
          position: 'handleFinalAutoResponseMessage',
          platform: 'whatsapp',
          campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
          agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
          contact_fk: contactRecord?.contact_id,
          contact_id: contactRecord?.contact_id,
          agency_user_fk: contactRecord?.agency_user_fk,
          original_event_id: result.original_event_id,
          msg_body: `${final_response}`,
          message: `${final_response}`,
          msgData: `${final_response}`,
          msg_type: 'frompave',
          msg_timestamp: params.msg_timestamp,
          sender_number: params.sender_number,
          sender_url: params.sender_url,
          receiver_number: params.receiver_number,
          failed: h.isEmpty(result?.original_event_id),
          sent: h.notEmpty(result?.original_event_id),
        },
        log,
      );

      if (!h.isEmpty(result.original_event_id)) {
        await messageDBHandler.completeFinalResponse(latestPaveMessage, log);
        const agencyUser = await models.agency_user.findOne({
          where: {
            agency_user_id: contactRecord?.agency_user_fk,
          },
          include: [
            {
              model: models.user,
              required: true,
            },
            { model: models.agency, required: true },
          ],
        });

        // trigger message transmission via salesforce
        await notificationHandler.transmitToSalesforce(
          {
            sendWhatsAppTemplateMessageResponse: {
              original_event_id: result?.original_event_id,
            },
            contact_id: contact?.contact_id,
            agency_id: whatsappMsgTrackerForReplyUpdate?.agency_fk,
            contact,
            agencyUser,
            msg_body: final_response,
            transmission_message_type: 'plain_frompave',
          },
          additionalConfig,
          log,
        );
      }
    }
  }
}

/**
 * Description
 * This function is used for building the template parts for followup
 * sending and for saving in the database
 * @function
 * @name processFollowupMessageTemplateParts
 * @kind function
 * @param {object} template template data
 * @param {object} followup_template followup template data
 * @param {array} variable_arr sample variable data
 * @param {object} agency agency data
 * @param {object} contactAgencyUser contact owner data
 * @param {object} contact contact data
 * @param {string} receiver_number contact number
 * @returns {messageTemplate; msg_body: string; } returns the template parts
 */
function processFollowupMessageTemplateParts({
  template,
  followup_template,
  variable_arr,
  agency,
  contactAgencyUser,
  contact,
  receiver_number,
}) {
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
  let msg_body = '';
  template.components.forEach((component) => {
    if (h.cmpStr(component.type, 'HEADER')) {
      if (h.cmpStr(component.type, 'HEADER')) {
        if (['IMAGE', 'VIDEO'].includes(component.format)) {
          const filename = followup_template.header_image.substring(
            followup_template.header_image.lastIndexOf('/') + 1,
          );
          if (['IMAGE'].includes(component.format)) {
            messageTemplate.header.push({
              type: 'image',
              image: {
                link: followup_template.header_image,
                filename: filename,
              },
            });
          }
          if (['VIDEO'].includes(component.format)) {
            messageTemplate.header.push({
              type: 'video',
              video: {
                link: followup_template.header_image,
                filename: filename,
              },
            });
          }
        }
      }
    }
    if (h.cmpStr(component.type, 'BODY')) {
      if (
        followup_template.header_image &&
        !h.cmpStr(
          followup_template.header_image,
          'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
        )
      ) {
        template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'HEADER')) {
            if (['IMAGE'].includes(component.format)) {
              msg_body += `<img src="${followup_template.header_image}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px;">`;
            }
            if (['VIDEO'].includes(component.format)) {
              msg_body += `<video class="campaign_header_image" style="width: 100%; margin-bottom: 20px;" controls src="${followup_template.header_image}"></video>`;
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
              component_value = contact?.first_name || receiver_number;
            }
            messageTemplate.body.push({
              type: 'text',
              text: `${component_value}`,
            });
            msg_body = msg_body.replace(`{{${index + 1}}}`, component_value);
          } else {
            msg_body = msg_body.replace(
              `{{${index + 1}}}`,
              contact?.first_name || receiver_number,
            );
          }
        });
      }
    }

    const permalink_url = h.cmpStr(process.env.NODE_ENV, 'development')
      ? 'https://samplerealestateagency.yourpave.com/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
      : contact?.permalink;

    if (h.cmpStr(component.type, 'BUTTONS')) {
      component.buttons.forEach((btn, index) => {
        if (h.cmpStr(btn.type, 'URL') && btn.url.includes('{{1}}')) {
          let dynamic_url_params;
          const sample = btn.example[0];
          if (sample.includes('sample_email@domain.com')) {
            if (
              [
                '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
                '36f64032-bdf9-4cdc-b980-cdcdec944fb8',
              ].includes(followup_template?.agency_fk)
            ) {
              const dynamic_url_params = `?referred_by=${contact?.email}`;
              messageTemplate.button.push({
                sub_type: 'url',
                parameters: [{ type: 'text', text: dynamic_url_params }],
              });
            } else {
              const dynamic_url_params = contact?.email;
              messageTemplate.button.push({
                sub_type: 'url',
                parameters: [{ type: 'text', text: dynamic_url_params }],
              });
            }
          } else {
            dynamic_url_params = permalink_url.substring(
              permalink_url.lastIndexOf('/') + 1,
            );
            messageTemplate.button.push({
              sub_type: 'url',
              parameters: [{ type: 'text', text: dynamic_url_params }],
            });
          }
        }
        msg_body += `<button type="button" style="display:block; margin-top:
        10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; 
        border-radius: 10px; background-color: #ffffff; color: #313131;" 
        class="header-none-btn " disabled>${btn.text}</button>`;
      });
    }
  });

  return { messageTemplate, msg_body };
}

/**
 * Description
 * Function to get agent details
 * @async
 * @function
 * @name getContactOwnerDetails
 * @kind function
 * @param {string} agency_user_id agent id
 * @returns {Promise} returns agent details
 */
async function getContactOwnerDetails(agency_user_id) {
  const { user_fk } = await c.agencyUser.findOne({ agency_user_id });
  const { first_name, last_name, email } = await c.user.findOne({
    user_id: user_fk,
  });

  return {
    agent_first_name: first_name,
    agent_last_name: last_name,
    agent_email: email,
  };
}

/**
 * Description
 * Function to process new contact salesforce data
 * @function
 * @name processNewContactSalesforceData
 * @kind function
 * @param {object} params breakdown below
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {string} contactFirstName contact first name
 * @param {string} contactLastName contact last name
 * @param {object} field_configurations salesforce mapping
 * @param {object} log server log
 * @returns {object} contact salesforce data
 */
function processNewContactSalesforceData(params, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'processNewContactSalesforceData',
    message: 'preparing salesforce data for new contact',
  });
  const field_configurations = params.field_configurations;
  const contact_phone_parts = h.mobile.getMobileParts(params.receiver_number);
  const formatted_contact_phone =
    contact_phone_parts.countryCode + ' ' + contact_phone_parts.restOfNumber;

  const contact_salesforce_data_record = {
    agency_fk: params.agency_id,
    contact_fk: params.contact_id,
    first_name: h.notEmpty(params?.contactFirstName)
      ? params.contactFirstName
      : 'N/A',
    last_name: h.notEmpty(params?.contactLastName)
      ? params.contactLastName
      : 'N/A',
    language: 'English',
    mobile: formatted_contact_phone,
    enable_marketing: true,
    tnc_agree: true,
    data_synced: false,
  };

  let phone_city_code =
    constant.PHONE_CITY_CODE[contact_phone_parts.countryCode];
  const waba_phone_parts = h.mobile.getMobileParts(params.sender_number);
  phone_city_code = h.isEmpty(phone_city_code)
    ? constant.PHONE_CITY_CODE[waba_phone_parts.countryCode]
    : phone_city_code;
  contact_salesforce_data_record.interested_city = phone_city_code;

  if (h.notEmpty(field_configurations)) {
    field_configurations.forEach((configuration) => {
      if (h.notEmpty(configuration?.defaultValue)) {
        if (h.cmpStr(configuration.field, 'lead_source')) {
          contact_salesforce_data_record.lead_source =
            configuration.defaultValue;
        }
        if (h.cmpStr(configuration.field, 'lead_channel')) {
          contact_salesforce_data_record.lead_source_lv1 =
            configuration.defaultValue;
        }
        if (h.cmpStr(configuration.field, 'origin')) {
          contact_salesforce_data_record.lead_source_lv2 =
            configuration.defaultValue;
        }
      } else {
        if (h.cmpStr(configuration.field, 'lead_source')) {
          contact_salesforce_data_record.lead_source = 'Online';
        }
        if (h.cmpStr(configuration.field, 'lead_channel')) {
          contact_salesforce_data_record.lead_source_lv1 = 'WhatsApp';
        }
        if (h.cmpStr(configuration.field, 'origin')) {
          contact_salesforce_data_record.lead_source_lv2 = 'Chaaat';
        }
      }
    });
  }

  return contact_salesforce_data_record;
}

/**
 * Description
 * Function to check if connection between contact and business already exists
 * @async
 * @function
 * @name checkBusinessContactWABAConnection
 * @kind function
 * @param {object} wabaOwner waba details
 * @param {string} receiver_number contact number
 */
async function checkBusinessContactWABAConnection({
  wabaOwner,
  receiver_number,
  log,
}) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'checkBusinessContactWABAConnection',
    message: `CHECK IF ${receiver_number} IS A CONNECTION OF ${wabaOwner?.waba_number}`,
  });
  const agencyWhatsAppCredentials = h.notEmpty(
    wabaOwner?.agency_whatsapp_api_token,
  )
    ? wabaOwner?.agency_whatsapp_api_token +
      ':' +
      wabaOwner?.agency_whatsapp_api_secret
    : null;
  if (!h.isEmpty(agencyWhatsAppCredentials)) {
    const agencyBufferedCredentials = h.notEmpty(agencyWhatsAppCredentials)
      ? Buffer.from(agencyWhatsAppCredentials, 'utf8').toString('base64')
      : null;

    const connectionConfig = {
      method: 'get',
      url: 'https://apiv2.unificationengine.com/v2/connection/list',
      headers: {
        Authorization: `Basic ${agencyBufferedCredentials}`,
        'Content-Type': 'application/json',
      },
      data: {},
    };

    const connectionRes = await axios(connectionConfig)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });

    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'checkBusinessContactWABAConnection',
      message: `Checking response`,
      response: JSON.stringify(connectionRes),
    });

    if (
      !h.cmpInt(connectionRes.status, 200) ||
      h.isEmpty(connectionRes.connections)
    ) {
      return false;
    }

    const connectionExists = receiver_number in connectionRes.connections;

    return connectionExists;
  }
}

async function checkIfContactMessageExists(whatsAppData, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'checkIfContactMessageExists',
    message: 'Check if a message has already been processed before',
  });
  const messageRecord = await c.whatsappChat.findOne({
    original_event_id: whatsAppData.original_event_id,
    msg_timestamp: whatsAppData.msg_timestamp,
    msg_type: whatsAppData.msg_type,
  });

  if (h.notEmpty(messageRecord)) {
    return true;
  }

  return false;
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

module.exports = {
  validatePayloadData: validatePayloadData,
  prepareWhatsAppData: prepareWhatsAppData,
  handleMessageStatus: handleMessageStatus,
  routeCheck: routeCheck,
  checkContactMessageWABAForFirstTime: checkContactMessageWABAForFirstTime,
  prepareTrackerContactRecordForNewMessage:
    prepareTrackerContactRecordForNewMessage,
  handleNewMessageForNewContact: handleNewMessageForNewContact,
  handleNewMessageForExistingContact: handleNewMessageForExistingContact,
  handleNewConversationForExistingContact:
    handleNewConversationForExistingContact,
  handleMediaMessageType: handleMediaMessageType,
  addContactAsWABAConnection: addContactAsWABAConnection,
  handleAutoResponse: handleAutoResponse,
  getGetNewContactOwner: getGetNewContactOwner,
  getContactOwnerDetails: getContactOwnerDetails,
  processNewContactSalesforceData: processNewContactSalesforceData,
  checkBusinessContactWABAConnection: checkBusinessContactWABAConnection,
  handleOptOutStatus: handleOptOutStatus,
  checkIfContactMessageExists: checkIfContactMessageExists,
  getActiveChaaatBuilderAutomationRules: getActiveChaaatBuilderAutomationRules,
  checkAutomationTrigger: checkAutomationTrigger,
  contactMessageCountPerMessageTracker: contactMessageCountPerMessageTracker,
};
