const Sentry = require('@sentry/node');

const c = require('../../../../controllers');
const models = require('../../../../models');
const h = require('../../../../helpers');

/**
 * Description
 * Function to update database record for message status in both tracker and
 * whatsapp chat tables
 * @async
 * @function
 * @name updateMessageStatus
 * @kind function
 * @param {object} whatsAppMsgTracker tracker data
 * @param {object} trackerUpdate update data for the tracker
 * @param {boolean} has_tracker_update if has tracker update
 * @param {object} whatsAppChat chat data
 * @param {object} chatUpdate update data for the chat
 * @param {boolean} has_chat_update if has chat update
 * @param {object} log server log
 */
async function updateMessageStatus({
  whatsAppMsgTracker,
  trackerUpdate,
  has_tracker_update,
  whatsAppChat,
  chatUpdate,
  has_chat_update,
  log,
}) {
  log.info({
    message: 'updateMessageStatus data',
    whatsAppMsgTracker,
    trackerUpdate,
    has_tracker_update,
    whatsAppChat,
    chatUpdate,
    has_chat_update,
  });
  const agency_fk = whatsAppMsgTracker?.agency_fk
    ? whatsAppMsgTracker?.agency_fk
    : whatsAppChat?.agency_fk;
  const agency_user_fk = whatsAppMsgTracker?.agency_user_fk
    ? whatsAppMsgTracker?.agency_user_fk
    : whatsAppChat?.agency_user_fk;
  const contact_fk = whatsAppMsgTracker?.contact_fk
    ? whatsAppMsgTracker?.contact_fk
    : whatsAppChat?.contact_fk;
  const sender_url = whatsAppMsgTracker?.sender_url
    ? whatsAppMsgTracker?.sender_url
    : whatsAppChat?.sender_url;
  const sender = whatsAppMsgTracker?.sender_number
    ? whatsAppMsgTracker?.sender_number
    : whatsAppChat?.sender_number;
  const receiver = whatsAppMsgTracker?.receiver_number
    ? whatsAppMsgTracker?.receiver_number
    : whatsAppChat?.receiver_number;
  const receiver_url = whatsAppMsgTracker?.receiver_url
    ? whatsAppMsgTracker?.receiver_url
    : whatsAppChat?.receiver_url;
  const msg_id = whatsAppMsgTracker?.whatsapp_chat_id
    ? whatsAppMsgTracker?.whatsapp_chat_id
    : null;
  const tracker_id = whatsAppMsgTracker?.whatsapp_message_tracker_id
    ? whatsAppMsgTracker?.whatsapp_message_tracker_id
    : null;
  const unified_inbox_update_data = {
    pending: 0,
    agency_fk,
    agency_user_fk,
    contact_fk,
    sender,
    sender_url,
    receiver,
    receiver_url,
    tracker_type: 'main',
  };
  if (h.notEmpty(msg_id)) {
    unified_inbox_update_data.msg_id = msg_id;
  }
  if (h.notEmpty(tracker_id)) {
    unified_inbox_update_data.tracker_id = tracker_id;
  }
  const whatsapp_status_update_tx = await models.sequelize.transaction();
  try {
    if (h.cmpBool(has_tracker_update, true)) {
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'updateMessageStatus',
        action: 'updating tracker status data',
        trackerUpdate,
        tracker_id: whatsAppMsgTracker?.whatsapp_message_tracker_id,
      });
      await c.whatsappMessageTracker.update(
        whatsAppMsgTracker?.whatsapp_message_tracker_id,
        trackerUpdate,
        null,
        {
          transaction: whatsapp_status_update_tx,
        },
      );
    }
    if (h.cmpBool(has_chat_update, true)) {
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'updateMessageStatus',
        action: 'updating whatsapp chat status data',
        chatUpdate,
        chat_id: whatsAppChat?.whatsapp_chat_id,
      });
      await c.whatsappChat.update(
        whatsAppChat?.whatsapp_chat_id,
        chatUpdate,
        null,
        {
          transaction: whatsapp_status_update_tx,
        },
      );
    }

    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'updateMessageStatus',
      action: 'updating unified inbox data',
      unified_inbox_update_data,
      agency_fk,
      receiver,
      msg_platform: 'whatsapp',
    });
    // update unified inbox for the specific contact in an agency
    await models.unified_inbox.update(unified_inbox_update_data, {
      where: {
        agency_fk: agency_fk,
        receiver: receiver,
        contact_fk: contact_fk,
        msg_platform: 'whatsapp',
      },
      transaction: whatsapp_status_update_tx,
    });
    await whatsapp_status_update_tx.commit();
  } catch (processMessageStatusUpdateErr) {
    Sentry.captureException(processMessageStatusUpdateErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'updateMessageStatus',
      response: processMessageStatusUpdateErr,
      stringifiedErr: JSON.stringify(processMessageStatusUpdateErr),
    });
    await whatsapp_status_update_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Description
 * Function for saving contact message
 * @async
 * @function
 * @name processSaveContactMessage
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} agency_user_id contact owner id
 * @param {string} contact_id contact id
 * @param {string} tracker_ref_name reference name for message threading
 * @param {string} campaign_name name identifier for tracking
 * @param {string} original_event_id message event id
 * @param {string} message contact message
 * @param {string} message_media_url media url if media message is received
 * @param {string} media_message_id media ID
 * @param {string} msg_id message id
 * @param {string} msg_origin message origin
 * @param {string} msg_info message information - usually for automation
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
 * @param {data} broadcast_date message date
 * @param {object} log server log
 */
async function processSaveContactMessage(params, log) {
  const current_message_info = h.notEmpty(params?.msg_info)
    ? params.msg_info
    : null;
  let whatsapp_message_tracker_id = null;
  let whatsapp_chat_id = null;
  let unified_inbox_id = null;
  const date = new Date(params.msg_timestamp * 1000);
  const msg_received_date = date.toISOString();
  const hasUnifiedEntry = await c.unifiedInbox.findOne({
    agency_fk: params.agency_id,
    contact_fk: params.contact_id,
    receiver: params.receiver_number,
    msg_platform: 'whatsapp',
    tracker_type: 'main',
  });
  const whatsAppMessageTracker = await c.whatsappMessageTracker.findOne(
    {
      sender_number: params.sender_number,
      receiver_number: params.receiver_number,
      agency_fk: params.agency_id,
    },
    {
      order: [['created_date', 'DESC']],
    },
  );
  const contact_message_tx = await models.sequelize.transaction();
  try {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processSaveContactMessage',
      action: 'creating new chat record',
    });
    const sanitizedUnescapedValue = h.general.sanitizeMaliciousAttributes(
      params.message,
    );
    whatsapp_chat_id = await c.whatsappChat.create(
      {
        campaign_name: params.campaign_name,
        agency_fk: params.agency_id,
        contact_fk: params.contact_id,
        agency_user_fk: params.agency_user_id,
        original_event_id: params.original_event_id,
        msg_id: params.msg_id,
        msg_body: sanitizedUnescapedValue,
        msg_origin: params.msg_origin,
        msg_info: current_message_info,
        media_url: params.message_media_url,
        media_msg_id: params.media_message_id,
        content_type: params.content_type,
        file_name: params.file_name,
        caption: params.caption,
        msg_type: params.msg_type,
        msg_timestamp: params.msg_timestamp,
        sender_number: params.sender_number,
        sender_url: params.sender_url,
        receiver_number: params.receiver_number,
        receiver_url: params.receiver_url,
        sent: 1,
        delivered: 1,
        read: 1,
        reply_to_event_id: params.reply_to_original_event_id,
        reply_to_content: params.reply_to_content,
        reply_to_msg_type: params.reply_to_msg_type,
        reply_to_file_name: params.reply_to_file_name,
        reply_to_contact_id: params.reply_to_contact_id,
        created_date: new Date(msg_received_date),
      },
      { transaction: contact_message_tx },
    );
    if (h.cmpBool(params.new_record, true)) {
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'processSaveContactMessage',
        action: 'creating new tracker record',
      });
      whatsapp_message_tracker_id = await c.whatsappMessageTracker.create(
        {
          campaign_name: params.campaign_name,
          campaign_name_label: params.campaign_name,
          tracker_ref_name: params.tracker_ref_name,
          agency_fk: params.agency_id,
          contact_fk: params.contact_id,
          agency_user_fk: params.agency_user_id,
          original_event_id: params.original_event_id,
          tracker_type: 'main',
          msg_id: params.msg_id,
          msg_body: sanitizedUnescapedValue,
          msg_origin: params.msg_origin,
          pending: false,
          sent: 1,
          delivered: 1,
          read: 1,
          replied: 1,
          batch_count: 1,
          sender_number: params.sender_number,
          receiver_number: params.receiver_number,
          sender_url: params.sender_url,
          receiver_url: params.receiver_url,
          visible: 0,
          created_by: null,
          broadcast_date: new Date(msg_received_date),
        },
        {
          transaction: contact_message_tx,
        },
      );
    } else {
      whatsapp_message_tracker_id =
        whatsAppMessageTracker?.whatsapp_message_tracker_id;
    }

    const unifiedInboxData = {
      tracker_id: whatsapp_message_tracker_id,
      tracker_ref_name: params.tracker_ref_name,
      campaign_name: params.campaign_name,
      agency_fk: params.agency_id,
      agency_user_fk: params.agency_user_id,
      contact_fk: params.contact_id,
      event_id: params.original_event_id,
      msg_id: whatsapp_chat_id,
      msg_body: sanitizedUnescapedValue,
      msg_type: params.msg_type,
      msg_platform: 'whatsapp',
      tracker_type: 'main',
      pending: false,
      failed: 0,
      sent: 1,
      delivered: 1,
      read: 1,
      replied: 1,
      batch_count: 1,
      sender: params.sender_number,
      receiver: params.receiver_number,
      sender_url: params.sender_url,
      receiver_url: params.receiver_url,
      visible: 1,
      created_by: null,
      broadcast_date: new Date(msg_received_date),
      last_msg_date: new Date(msg_received_date),
    };
    if (h.notEmpty(hasUnifiedEntry)) {
      unified_inbox_id = hasUnifiedEntry.unified_inbox_id;
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'processSaveContactMessage',
        action: 'update existing unified inbox record',
        message: 'unified inbox data',
        unified_inbox_id: `${unified_inbox_id}`,
        data: unifiedInboxData,
      });
      await c.unifiedInbox.update(unified_inbox_id, unifiedInboxData, null, {
        transaction: contact_message_tx,
      });
    } else {
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'processSaveContactMessage',
        action: 'creating new unified inbox record',
        message: 'unified inbox data',
        unified_inbox_id: 'to be created',
        data: unifiedInboxData,
      });
      unified_inbox_id = await c.unifiedInbox.create(unifiedInboxData, {
        transaction: contact_message_tx,
      });
    }

    await contact_message_tx.commit();

    return { whatsapp_message_tracker_id, whatsapp_chat_id, unified_inbox_id };
  } catch (contactMessageErr) {
    Sentry.captureException(contactMessageErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processSaveContactMessage',
      response: contactMessageErr,
      stringifiedErr: JSON.stringify(contactMessageErr),
    });
    await contact_message_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Description
 * Function to complete final response in a campaign message
 * @async
 * @function
 * @name completeFinalResponse
 * @kind function
 * @param {object} latestPaveMessage patest message in whatsapp_chat for contact
 * @param {object} log
 */
async function completeFinalResponse(latestPaveMessage, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'completeFinalResponse',
    message: `ending final response for whatsapp_chat_id ${latestPaveMessage.dataValues.whatsapp_chat_id}`,
  });
  const complete_final_response_tx = await models.sequelize.transaction();
  try {
    await models.whatsapp_chat.update(
      {
        msg_id: `completed_${latestPaveMessage.dataValues.msg_id}`,
      },
      {
        where: {
          whatsapp_chat_id: latestPaveMessage.dataValues.whatsapp_chat_id,
        },
        transaction: complete_final_response_tx,
      },
    );
    await complete_final_response_tx.commit();
  } catch (completeFinalErr) {
    Sentry.captureException(completeFinalErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'endAutomation',
      response: completeFinalErr,
      stringifiedErr: JSON.stringify(completeFinalErr),
    });
    await complete_final_response_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Description
 * Function for saving agency/business message
 * @async
 * @function
 * @name processSaveAgencyMessage
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} agency_user_id contact owner id
 * @param {string} contact_id contact id
 * @param {string} tracker_ref_name reference name for message threading
 * @param {string} campaign_name name identifier for tracking
 * @param {string} original_event_id message event id
 * @param {string} message contact message
 * @param {string} message_media_url media url if media message is received
 * @param {string} media_message_id media ID
 * @param {string} msg_id message id
 * @param {string} msg_origin message origin
 * @param {string} msg_info message information - usually for automation
 * @param {timestamp} msg_timestamp message timestamp
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} sender_url waba number url
 * @param {string} receiver_url contact number url
 * @param {string} msg_type message type
 * @param {string} msg_template_id message template id
 * @param {string} msg_category message template category
 * @param {string} reply_to_original_event_id reply to event id
 * @param {string} reply_to_content reply to message
 * @param {string} reply_to_msg_type reply to message type
 * @param {string} reply_to_file_name reply to filename
 * @param {string} reply_to_contact_id contact identification
 * @param {string} caption caption
 * @param {string} file_name message file name
 * @param {string} content_type message content type
 * @param {data} broadcast_date message date
 * @param {boolean} sent message statuts
 * @param {boolean} failed message statuts
 * @param {string} failed_reason
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log
 */
async function processSaveAgencyMessage(params, log) {
  const current_message_info = h.notEmpty(params?.msg_info)
    ? params.msg_info
    : null;
  let whatsapp_message_tracker_id = null;
  let whatsapp_chat_id = null;
  let unified_inbox_id = null;
  const hasUnifiedEntry = await c.unifiedInbox.findOne({
    agency_fk: params.agency_id,
    contact_fk: params.contact_id,
    receiver: params.receiver_number,
    msg_platform: 'whatsapp',
    tracker_type: 'main',
  });
  const whatsAppMessageTracker = await c.whatsappMessageTracker.findOne(
    {
      sender_number: params.sender_number,
      receiver_number: params.receiver_number,
      agency_fk: params.agency_id,
    },
    {
      order: [['created_date', 'DESC']],
    },
  );
  const client_message_tx = await models.sequelize.transaction();
  try {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processSaveAgencyMessage',
      action: 'creating new chat record',
    });
    const sanitizedUnescapedValue = h.general.sanitizeMaliciousAttributes(
      params.message,
    );
    whatsapp_chat_id = await c.whatsappChat.create(
      {
        campaign_name: params.campaign_name,
        agency_fk: params.agency_id,
        contact_fk: params.contact_id,
        agency_user_fk: params.agency_user_id,
        original_event_id: params.original_event_id,
        msg_body: sanitizedUnescapedValue,
        msg_origin: params.msg_origin,
        msg_info: current_message_info,
        msg_type: params.msg_type,
        msg_template_id: params.msg_template_id,
        msg_category: params.msg_category,
        msg_timestamp: params.msg_timestamp,
        sender_number: params.sender_number,
        receiver_number: params.receiver_number,
        sent: params.sent,
        failed: params.failed,
        failed_reason: params.failed_reason,
        created_date: new Date(params.broadcast_date),
      },
      { transaction: client_message_tx },
    );
    if (h.cmpBool(params.new_record, true)) {
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'processSaveAgencyMessage',
        action: 'creating new tracker record',
      });
      whatsapp_message_tracker_id = await c.whatsappMessageTracker.create(
        {
          campaign_name: params.campaign_name,
          campaign_name_label: params.campaign_name,
          tracker_ref_name: params.tracker_ref_name,
          agency_fk: params.agency_id,
          contact_fk: params.contact_id,
          agency_user_fk: params.agency_user_id,
          original_event_id: params.original_event_id,
          tracker_type: 'main',
          msg_body: sanitizedUnescapedValue,
          msg_origin: params.msg_origin,
          pending: false,
          sent: params.sent,
          failed: params.failed,
          failed_reason: params.failed_reason,
          batch_count: 1,
          sender_number: params.sender_number,
          receiver_number: params.receiver_number,
          visible: 0,
          created_by: null,
          broadcast_date: new Date(params.broadcast_date),
        },
        {
          transaction: client_message_tx,
        },
      );
    } else {
      whatsapp_message_tracker_id =
        whatsAppMessageTracker?.whatsapp_message_tracker_id;
    }

    const unifiedInboxData = {
      tracker_id: whatsapp_message_tracker_id,
      tracker_ref_name: params.tracker_ref_name,
      campaign_name: params.campaign_name,
      agency_fk: params.agency_id,
      agency_user_fk: params.agency_user_id,
      contact_fk: params.contact_id,
      event_id: params.original_event_id,
      msg_id: whatsapp_chat_id,
      msg_body: sanitizedUnescapedValue,
      msg_type: params.msg_type,
      msg_platform: 'whatsapp',
      tracker_type: 'main',
      pending: false,
      failed: params.failed,
      sent: params.sent,
      batch_count: 1,
      sender_number: params.sender_number,
      receiver_number: params.receiver_number,
      visible: 1,
      created_by: null,
      broadcast_date: new Date(params.broadcast_date),
      last_msg_date: new Date(params.broadcast_date),
    };
    if (h.notEmpty(hasUnifiedEntry)) {
      unified_inbox_id = hasUnifiedEntry.unified_inbox_id;
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'processSaveAgencyMessage',
        action: 'update existing unified inbox record',
        message: 'unified inbox data',
        unified_inbox_id: `${unified_inbox_id}`,
        data: unifiedInboxData,
      });
      await c.unifiedInbox.update(unified_inbox_id, unifiedInboxData, null, {
        transaction: client_message_tx,
      });
    } else {
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'processSaveAgencyMessage',
        action: 'creating new unified inbox record',
        message: 'unified inbox data',
        unified_inbox_id: 'to be created',
        data: unifiedInboxData,
      });
      unified_inbox_id = await c.unifiedInbox.create(unifiedInboxData, {
        transaction: client_message_tx,
      });
    }

    // add message inventory count
    if (h.notEmpty(params.original_event_id)) {
      await c.messageInventory.addMessageCount(params.agency_id);
      await c.agencyNotification.checkMessageCapacityAfterUpdate(
        params.agency_id,
      );
    }

    await client_message_tx.commit();

    return { whatsapp_message_tracker_id, whatsapp_chat_id, unified_inbox_id };
  } catch (clientMessageErr) {
    Sentry.captureException(clientMessageErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processSaveAgencyMessage',
      response: clientMessageErr,
      stringifiedErr: JSON.stringify(clientMessageErr),
    });
    await client_message_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Description
 * Function to update read status for all messages under a specific
 * tracker record
 * @async
 * @function
 * @name updateLatestMessageTrackerForContactAsRead
 * @kind function
 * @param {string} agency_id agency id
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {object} log server log
 */
async function updateLatestMessageTrackerForContactAsRead({
  agency_id,
  sender_number,
  receiver_number,
  log,
}) {
  const latestWhatsAppMessageTracker = await c.whatsappMessageTracker.findOne(
    {
      sender_number,
      receiver_number,
      agency_fk: agency_id,
    },
    {
      order: [['created_date', 'DESC']],
    },
  );

  const read_status_tx = await models.sequelize.transaction();
  try {
    await c.whatsappMessageTracker.update(
      latestWhatsAppMessageTracker?.whatsapp_message_tracker_id,
      {
        read: 1,
        replied: 1,
      },
      null,
      {
        transaction: read_status_tx,
      },
    );
    await models.whatsapp_chat.update(
      {
        read: 1,
        replied: 1,
      },
      {
        where: {
          campaign_name: latestWhatsAppMessageTracker?.campaign_name,
          sender_number: sender_number,
          receiver_number: receiver_number,
        },
        transaction: read_status_tx,
      },
    );
    await read_status_tx.commit();
  } catch (readStatusErr) {
    Sentry.captureException(readStatusErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processSaveContactMessage',
      response: readStatusErr,
      stringifiedErr: JSON.stringify(readStatusErr),
    });
    await read_status_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Description
 * Function to save automatation response message
 * @async
 * @function
 * @name saveAutomationMessageResponse
 * @kind function
 * @param {object} whatsappMsgTrackerForReplyUpdate tracker object
 * @param {string} msg_id messeage data id
 * @param {object} agency agency data
 * @param {object} contact contact data
 * @param {object} contactRecord contact data
 * @param {string} sender_number waba number
 * @param {string} sender_url waba url
 * @param {string} receiver_number contact number
 * @param {string} receiver_url contact url
 * @param {timestamp} msg_timestamp mesage timestamp
 * @param {string} msg_body message content
 * @param {string} msg_type message type
 * @param {string} msg_template_id template message ID,
 * @param {string} msg_category message category
 * @param {object} result message sending result
 * @param {object} models database table objects
 * @param {object} log server log
 * @param {object} transaction current db transaction
 */
async function saveAutomationMessageResponse({
  whatsappMsgTrackerForReplyUpdate,
  agency,
  msg_id,
  msg_timestamp,
  msg_body,
  msg_type,
  msg_template_id,
  msg_category,
  sender_number,
  sender_url,
  receiver_number,
  receiver_url,
  contactRecord,
  contact,
  result,
  log,
}) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'saveAutomationMessageResponse',
    action: 'SAVE AUTO RESPONSE MESSAGE',
  });
  const save_auto_response_tx = await models.sequelize.transaction();
  try {
    const failed_reason = h.notEmpty(result?.failed_reason)
      ? result?.failed_reason
      : null;
    const agency_id = h.notEmpty(agency?.dataValues?.agency_id)
      ? agency?.dataValues?.agency_id
      : agency?.agency_id;
    const contact_id = h.notEmpty(contact.dataValues.contact_id)
      ? contact.dataValues.contact_id
      : h.notEmpty(contact?.contact_id)
      ? contact?.contact_id
      : contactRecord?.contact_id;
    const sanitizedUnescapedValue =
      h.general.sanitizeMaliciousAttributes(msg_body);
    const whatsapp_chat_id = await c.whatsappChat.create(
      {
        campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
        msg_id,
        msg_timestamp,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url: receiver_url.split('?')[0],
        agency_fk: agency_id,
        agency_user_fk: contactRecord?.agency_user_fk,
        contact_fk: contact_id,
        original_event_id: result?.original_event_id,
        failed: h.isEmpty(result?.original_event_id),
        failed_reason,
        sent: h.notEmpty(result?.original_event_id),
        msg_type,
        msg_template_id,
        msg_category,
        msg_body: sanitizedUnescapedValue,
        msg_origin: whatsappMsgTrackerForReplyUpdate?.msg_origin,
      },
      { transaction: save_auto_response_tx },
    );

    await models.unified_inbox.update(
      {
        tracker_ref_name: whatsappMsgTrackerForReplyUpdate?.tracker_ref_name,
        campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
        created_date: new Date(),
        updated_date: new Date(),
        last_msg_date: new Date(),
        msg_id: whatsapp_chat_id,
        msg_type,
        msg_body: sanitizedUnescapedValue,
        pending: 0,
      },
      {
        where: {
          contact_fk: contact_id,
          msg_platform: 'whatsapp',
        },
        transaction: save_auto_response_tx,
      },
    );

    // add message inventory count
    if (h.notEmpty(result?.original_event_id)) {
      await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
    } else {
      await c.messageInventory.substractMessageAndInventoryCount(agency_id);
    }

    await save_auto_response_tx.commit();
  } catch (saveAutomationMessageResponseErr) {
    Sentry.captureException(saveAutomationMessageResponseErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'saveAutomationMessageResponse',
      action: 'SAVE AUTO RESPONSE MESSAGE ERROR',
      response: saveAutomationMessageResponseErr,
    });
    await save_auto_response_tx.rollback();
    throw new Error('SAVE AUTO RESPONSE MESSAGE ERROR');
  }
}

/**
 * Description
 * Function to end automation
 * @async
 * @function
 * @name endAutomation
 * @kind function
 * @param {object} agency agency data
 * @param {string} agency_id agency id
 * @param {string} agency_user_id contact owner id
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} contact_id contact id
 * @param {object} latestWorkflowTracker automation tracker
 * @param {object} log server logs
 */
async function endAutomation({
  agency,
  agency_id,
  agency_user_id,
  sender_number,
  receiver_number,
  contact_id,
  latestWorkflowTracker,
  log,
}) {
  const new_tracker_id = h.general.generateId();
  const tracker_ref_name = `${agency_id}_${Date.now()}_user_message_${agency?.agency_name
    .replaceAll(' ', '_')
    .toLowerCase()}`;
  const campaign_name = `${Date.now()} ${agency?.agency_name} ${contact_id}`;

  const broadcast_date = new Date();

  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'endAutomation',
    message: `ending tracker ${latestWorkflowTracker?.tracker_ref_name}`,
  });
  const end_automation_tx = await models.sequelize.transaction();
  try {
    // end the automation tracker
    await models.whatsapp_message_tracker.update(
      {
        completed: true,
      },
      {
        where: {
          tracker_ref_name: latestWorkflowTracker?.tracker_ref_name,
        },
      },
      { transaction: end_automation_tx },
    );

    // add a new record for normal tracker
    await models.whatsapp_message_tracker.create(
      {
        whatsapp_message_tracker_id: new_tracker_id,
        campaign_name: campaign_name,
        campaign_name_label: campaign_name,
        tracker_ref_name: tracker_ref_name,
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_user_fk: agency_user_id,
        original_event_id: null,
        tracker_type: 'main',
        msg_origin: 'user',
        msg_body: 'recent automation workflow ended',
        pending: false,
        sent: 1,
        delivered: 1,
        read: 1,
        replied: 0,
        batch_count: 1,
        sender_number: sender_number,
        receiver_number: receiver_number,
        sender_url: null,
        receiver_url: null,
        visible: 0,
        broadcast_date: new Date(broadcast_date),
      },
      { transaction: end_automation_tx },
    );
    await end_automation_tx.commit();
  } catch (endAutomationErr) {
    Sentry.captureException(endAutomationErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'endAutomation',
      response: endAutomationErr,
      stringifiedErr: JSON.stringify(endAutomationErr),
    });
    await end_automation_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

module.exports = {
  updateMessageStatus: updateMessageStatus,
  processSaveContactMessage: processSaveContactMessage,
  completeFinalResponse: completeFinalResponse,
  processSaveAgencyMessage: processSaveAgencyMessage,
  updateLatestMessageTrackerForContactAsRead:
    updateLatestMessageTrackerForContactAsRead,
  saveAutomationMessageResponse: saveAutomationMessageResponse,
  endAutomation: endAutomation,
};
