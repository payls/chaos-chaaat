const c = require('../../../controllers');
const models = require('../../../models');
const h = require('../../../helpers');
const Sentry = require('@sentry/node');

/**
 * Description
 * Function to send message to appsync for agency messages
 * @async
 * @function
 * @name sendAppsyncFromAgencyNotificationMessage
 * @kind function
 * @param {object} params breakdown below
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
async function sendAppsyncFromAgencyNotificationMessage(params, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'sendAppsyncNotificationMessage',
    message: 'Trigger appsync create message notification',
    data: params,
  });
  const contact = params.contact;
  const wabaOwner = params.wabaOwner;
  const sendWhatsAppTemplateMessageResponse =
    params.sendWhatsAppTemplateMessageResponse;
  const created_date = new Date(params.broadcast_date);
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
    campaign_name: params.campaign_name,
    agency_fk: params.agency_id,
    contact_fk: params.contact_id,
    agency_user_fk: params.current_agency_user_id,
    original_event_id: !h.isEmpty(
      sendWhatsAppTemplateMessageResponse.original_event_id,
    )
      ? sendWhatsAppTemplateMessageResponse.original_event_id
      : null,
    msg_id: null,
    msg_body: params.msg_body,
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
 * Function to send message to appsync for contact messages
 * @async
 * @function
 * @name sendAppsyncContactNotificationMessage
 * @kind function
 * @param {object} param breakdwon below
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
async function sendAppsyncContactNotificationMessage(params, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'sendAppsyncNotificationMessage',
    message: 'Trigger appsync create message notification for contact messages',
  });
  const date = new Date(params.msg_timestamp * 1000);

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
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

  const appSyncData = params;
  appSyncData.created_date_raw = new Date();
  appSyncData.created_date = `${formattedDate} ${formattedTime}`;
  appSyncData.reply_to_event_id = h.notEmpty(appSyncData.reply_to_event_id)
    ? appSyncData.reply_to_event_id
    : appSyncData.reply_to_original_event_id;
  await h.appsync.sendGraphQLNotification(api_key, appSyncData);
}

/**
 * Description
 * Trigger sending to appsync
 * @async
 * @function
 * @name triggerAppsyncNotificationForAutoResponseProcess
 * @kind function
 * @param {object} params breakdown below
 * @param {number} position appsync trigger position
 * @param {string} platform messaging channel
 * @param {string} campaign_name campaign name
 * @param {string} agency_fk agency id
 * @param {string} contact_fk contact id
 * @param {string} agency_user_fk agency user id
 * @param {string} original_event_id event id of message
 * @param {string} msg_body message
 * @param {string} msg_type message type
 * @param {timestamp} msg_timestamp:mesage timestamp
 * @param {string} sender_number waba number
 * @param {string} sender_url waba url
 * @param {string} receiver_number contact number
 * @param {boolean} failed failed status
 * @param {boolean} sent sent status
 * @param {object} log server log function
 */
async function triggerAppsyncNotificationForAutoResponseProcess(params, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'sendAppsyncNotificationMessage',
    message:
      'Trigger appsync create message notification auto response messages',
  });
  const appsync = await c.appSyncCredentials.findOne({
    status: 'active',
  });
  const { api_key } = appsync;
  const created_date = new Date();
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const date = new Date(created_date);
  const formattedDate = date.toLocaleDateString('en-US', options);
  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  log.info({ message: 'with auto response' });

  const appSyncData = params;
  appSyncData.msg_id = null;
  appSyncData.media_url = null;
  appSyncData.media_msg_id = null;
  appSyncData.content_type = null;
  appSyncData.file_name = null;
  appSyncData.caption = null;
  appSyncData.delivered = 0;
  appSyncData.read = 0;
  appSyncData.created_date_raw = new Date();
  appSyncData.created_date = `${formattedDate} ${formattedTime}`;
  appSyncData.receiver_url = null;
  appSyncData.reply_to_event_id = null;
  appSyncData.reply_to_content = null;
  appSyncData.reply_to_msg_type = null;
  appSyncData.reply_to_file_name = null;
  appSyncData.reply_to_contact_id = null;

  await h.appsync.sendGraphQLNotification(api_key, appSyncData);
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
 * @param {string} transmission_message_type type of message to be transmitted
 * in salesforce
 * @param {object} additionalConfig additional configuration
 * @param {object} log server logs
 */
async function transmitToSalesforce(params, additionalConfig, log) {
  const { sendWhatsAppTemplateMessageResponse, contact, agencyUser } = params;
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'transmitToSalesforce',
    message: 'Trigger salesforce messa',
    data: params,
  });
  if (!h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)) {
    const contact_source = await models.contact_source.findOne({
      where: {
        contact_fk: params.contact_id,
        source_type: 'SALESFORCE',
      },
    });
    if (!h.isEmpty(contact_source)) {
      const liveChatSettings = await models.live_chat_settings.findOne({
        where: {
          agency_fk: params.agency_id,
        },
      });
      const agencyOauth = await models.agency_oauth.findOne({
        where: {
          agency_fk: params.agency_id,
          status: 'active',
          source: 'SALESFORCE',
        },
      });
      const contactSalesforceRecord = await c.contactSalesforceData.findOne(
        {
          agency_fk: params.agency_id,
          contact_fk: params.contact_id,
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
        full_message_body: params.msg_body,
        messageType: params.transmission_message_type,
        platform: 'whatsapp',
        log,
        encryptionKeys: additionalConfig.ek,
      });
    }
  }
}

/**
 * Description
 * Function for sending email notification to contact owner and other recipients
 * about the message
 * @async
 * @function
 * @name sendContactMessageEmailNotification
 * @kind function
 * @param {object} params breakdown below
 * @param {string} agency_id agency id
 * @param {array} additional_recipients list of other recipient emails
 * @param {string} chat_id generated whatsapp chat id
 * @param {string} contact_id contact id
 * @param {string} contact_first_name contact first name
 * @param {string} contact_last_name contact last name
 * @param {string} message contact message
 * @param {string} agent_first_name media url if media message is received
 * @param {string} agent_email media ID
 * @param {string} msg_type message type
 * @param {boolean} new_msg determines if for new message
 * @param {object} log server log
 */
async function sendContactMessageEmailNotification(params, log) {
  await h.whatsapp.notifyUserMessageInteraction({
    agency_id: params.agency_id,
    agent_name: params.agent_first_name,
    agent_email: params.agent_email,
    additional_emails: params.additional_recipients,
    chat_id: params.chat_id,
    contact_id: params.contact_id,
    contact_name: `${params.contact_first_name} ${params.contact_last_name}`,
    replyMsg: params.message,
    msgType: params.msg_type,
    newMsg: params.new_msg,
    log,
  });
}

module.exports = {
  sendAppsyncFromAgencyNotificationMessage:
    sendAppsyncFromAgencyNotificationMessage,
  sendAppsyncContactNotificationMessage: sendAppsyncContactNotificationMessage,
  triggerAppsyncNotificationForAutoResponseProcess:
    triggerAppsyncNotificationForAutoResponseProcess,
  transmitToSalesforce: transmitToSalesforce,
  sendContactMessageEmailNotification: sendContactMessageEmailNotification,
};
