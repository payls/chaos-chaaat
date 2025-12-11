const Sentry = require('@sentry/node');

const h = require('../../../helpers');
const c = require('../../../controllers');
const models = require('../../../models');
const constant = require('../../../constants/constant.json');
// util files
const whatsAppCommonFunctions = require('./whatsapp-common-functions-handler');
const notificationHandler = require('./whatsapp-notification-handler');
const messageDBHandler = require('./db/message');
const firstTimeAutomation = require('./whatsapp-first-time-contact-message-automation');
const { processAutomation } = require('./whatsapp-message-automation');

const whatspapFlowProcessor = require('../whatsapp-flow-processor');

const amqProgressTrackerController =
  require('../../../controllers/amqProgressTracker').makeController(models);

const whatsappFlowUtils = require('../whatsapp-flow-processor/whatsapp-flow-processor-utils');

function getFlowToken(data) {
  try {
    const payload = JSON.parse(data.content.toString());
    const body = payload.data;
    const parts = body?.data?.parts;
    const contactResponseData = whatsappFlowUtils.parseJson(parts[0].data);
    return contactResponseData?.flow_token || '';
  } catch (err) {
    // ignore error
    return '';
  }
}

/**
 * Description
 * Consumer for handling whatsapp webhook payload
 *
 * @param {object} data holds whatsapp webhook payload data
 * @param {object} models existing database table models
 * @param {object} channel rabbit mq channel used
 * @param {object} config rabbitmq/amq configuration
 * @param pubChannel
 * @param {object} log server log functions
 */
async function receiveMessagePayload({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) {
  // the code executing inside the transaction will be wrapped in a span and profiled
  const amq_progress_tracker_id = data.fields.consumerTag;
  const payload = JSON.parse(data.content.toString());
  const body = payload.data;
  const whatsapp_message_types = constant.WHATSAPP.MSG_TYPE;

  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    data: 'WEBHOOK PAYLOAD DATA',
    payload: body,
  });

  try {
    // do initial payload validation
    const is_valid_payload = await whatsAppCommonFunctions.validatePayloadData({
      payload,
      log,
    });

    if (h.cmpBool(is_valid_payload, false)) {
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.nack(data, false, false);
    }

    // preparing message data
    const whatsAppData = await whatsAppCommonFunctions.prepareWhatsAppData({
      payload,
      log,
    });

    /**
     * if no data about the contact number or the waba number in the payload
     * fail the process
     */
    if (
      h.isEmpty(whatsAppData?.sender_number) ||
      h.isEmpty(whatsAppData?.receiver_number)
    ) {
      log.error({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'NO CONTACT OR WABA NUMBER IN PAYLOAD',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.nack(data, false, false);
    }

    /**
     * handling bot message with content WEBHOOK_MESSAGE
     * Will be ack automatically as there is nothing to do here
     */
    if (
      h.cmpStr(whatsAppData?.sender_number, 'BOT_NUMBER') &&
      h.cmpStr(whatsAppData?.receiver_number, 'RECEIVER_ADDRESS') &&
      h.cmpStr(whatsAppData?.message, 'WEBHOOK_MESSAGE')
    ) {
      log.error({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'BOT MESSAGE WITH WEBHOOK_MESSAGE_CONTENT',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }

    // getting the waba and agency
    const { agency_id, wabaOwner } = await whatsAppCommonFunctions.routeCheck({
      sender_number: whatsAppData.sender_number,
      receiver_number: whatsAppData.receiver_number,
      message: whatsAppData.message,
      msg_type: whatsAppData.msg_type,
      reply_to_original_event_id: whatsAppData.reply_to_original_event_id,
      log,
    });

    if (h.isEmpty(agency_id)) {
      log.error({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'MESSAGE IS NOT FOR ANY ACTIVE WABA NUMBER - IGNORING MESSAGE',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.ack(data, false, false);
    }

    // check if there is already connection between WABA and the contact number
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'receiveMessagePayload',
      message: `CHECK CONNECTION BETWEEN ${wabaOwner?.waba_number} AND
        ${whatsAppData.receiver_number}`,
      is_connected: whatsAppData.is_connected,
    });

    if (h.cmpBool(whatsAppData.is_connected, false)) {
      // add contact number as waba connection
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: `CREATING CONNECTION BETWEEN ${wabaOwner?.waba_number} AND
          ${whatsAppData.receiver_number}`,
      });
      whatsAppCommonFunctions.addContactAsWABAConnection({
        wabaOwner,
        receiver_number: whatsAppData.receiver_number,
        log,
      });
    }

    // not a valid message type
    if (!whatsapp_message_types.includes(whatsAppData.msg_type)) {
      log.error({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'INVALID MESSAGE TYPE',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.nack(data, false, false);
    }

    // type is for handling contact message
    if (whatsapp_message_types.includes(whatsAppData.msg_type)) {
      if (h.cmpStr(whatsAppData.msg_type, 'reaction')) {
        whatsAppData.msg_type = 'text';
      }
      const contactMessageExists =
        await whatsAppCommonFunctions.checkIfContactMessageExists(
          whatsAppData,
          log,
        );

      if (h.cmpBool(contactMessageExists, true)) {
        log.error({
          consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
          function: 'receiveMessagePayload',
          message: 'CONTACT MESSAGE OF SAME EVENT ID EXISTS',
          data: payload,
        });
        await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
        log.info({
          consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
          function: 'receiveMessagePayload',
          message: 'PROCESS COMPLETE',
        });
        return await channel.nack(data, false, false);
      }

      const {
        contactMessageWABAForFirstTimeRule,
        incomingMessageReceivedRule,
        brodcastAutomationRule,
      } = await whatsAppCommonFunctions.getActiveChaaatBuilderAutomationRules({
        wabaOwner,
        agency_id,
      });

      const {
        triggerContactMsgWABAForFirstTimeAutomation,
        triggerIncomingMsgReceivedAutomation,
        triggerBroadcastAutomation,
        latestWhatsappTrackerRecord,
        contactMessageCount,
      } = await whatsAppCommonFunctions.checkAutomationTrigger({
        agency_id,
        sender_number: whatsAppData.sender_number,
        receiver_number: whatsAppData.receiver_number,
        contactMessageWABAForFirstTimeRule,
        incomingMessageReceivedRule,
        brodcastAutomationRule,
      });

      const {
        trigger: legacyTrigger,
        contactMessageWABAForFirstTimeRule:
          legacyContactMessageWABAForFirstTimeRule,
        latestWhatsappTrackerRecord: legacyLatestWhatsappTrackerRecord,
        contactMessageCount: legacyContactMessageCount,
      } = await whatsAppCommonFunctions.checkContactMessageWABAForFirstTime({
        wabaOwner,
        agency_id,
        sender_number: whatsAppData.sender_number,
        receiver_number: whatsAppData.receiver_number,
      });

      log.info({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'TRIGGER AUTOMATION INFO',
        data: {
          triggerContactMsgWABAForFirstTimeAutomation,
          triggerIncomingMsgReceivedAutomation,
          triggerBroadcastAutomation,
          legacyTrigger,
        },
      });

      let handleWhatsAppContactMessagesRes = null;
      if (
        h.cmpBool(triggerContactMsgWABAForFirstTimeAutomation, false) &&
        h.cmpBool(triggerIncomingMsgReceivedAutomation, false) &&
        h.cmpBool(triggerBroadcastAutomation, false) &&
        h.cmpBool(legacyTrigger, false)
      ) {
        const contactMessageData = whatsAppData;
        contactMessageData.wabaOwner = wabaOwner;
        contactMessageData.agency_id = agency_id;
        handleWhatsAppContactMessagesRes = await handleWhatsAppContactMessages(
          contactMessageData,
          additionalConfig,
          log,
        );
      } else {
        // trigger chaaat builder automation
        if (
          h.cmpBool(triggerContactMsgWABAForFirstTimeAutomation, true) ||
          h.cmpBool(triggerIncomingMsgReceivedAutomation, true) ||
          h.cmpBool(triggerBroadcastAutomation, true)
        ) {
          await processChaaatBuilderAutomation({
            data,
            agency_id,
            triggerContactMsgWABAForFirstTimeAutomation,
            triggerIncomingMsgReceivedAutomation,
            triggerBroadcastAutomation,
            latestWhatsappTrackerRecord,
            contactMessageCount,
            contactMessageWABAForFirstTimeRule,
            incomingMessageReceivedRule,
            brodcastAutomationRule,
            config,
            wabaOwner,
            whatsAppData,
            handleWhatsAppContactMessagesRes,
            additionalConfig,
            log,
            channel,
            pubChannel,
          });
        }
        // trigger legacy automation
        if (h.cmpBool(legacyTrigger, true)) {
          await processLegacyAutomation({
            whatsAppData,
            agency_id,
            contactMessageCount: legacyContactMessageCount,
            contactMessageWABAForFirstTimeRule:
              legacyContactMessageWABAForFirstTimeRule,
            latestWhatsappTrackerRecord: legacyLatestWhatsappTrackerRecord,
            wabaOwner,
            additionalConfig,
            log,
          });
        }
      }
    }

    await amqProgressTrackerController.addSuccess(amq_progress_tracker_id, 1);
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'receiveMessagePayload',
      message: 'PROCESS COMPLETE',
    });
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
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'receiveMessagePayload',
    });
    await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'receiveMessagePayload',
      message: 'PROCESS COMPLETE',
    });
    return await channel.nack(data, false, false);
  }
}

/**
 * Description
 * Consumer for handling whatsapp status webhook payload
 *
 * @param {object} data holds whatsapp webhook payload data
 * @param {object} models existing database table models
 * @param {object} channel rabbit mq channel used
 * @param {object} config rabbitmq/amq configuration
 * @param pubChannel
 * @param {object} log server log functions
 */
async function receiveStatusPayload({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) {
  const amq_progress_tracker_id = data.fields.consumerTag;
  const payload = JSON.parse(data.content.toString());
  const body = payload.data;
  const whatsapp_message_status = constant.WHATSAPP.MSG_STATUS;

  log.info({
    consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
    data: 'WEBHOOK STATUS PAYLOAD DATA',
    payload: body,
  });

  try {
    // do initial payload validation
    const is_valid_payload = await whatsAppCommonFunctions.validatePayloadData({
      payload,
      log,
    });

    if (h.cmpBool(is_valid_payload, false)) {
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.nack(data, false, false);
    }

    // preparing message data
    const whatsAppData = await whatsAppCommonFunctions.prepareWhatsAppData({
      payload,
      log,
    });

    /**
     * if no data about the contact number or the waba number in the payload
     * fail the process
     */
    if (
      h.isEmpty(whatsAppData?.sender_number) ||
      h.isEmpty(whatsAppData?.receiver_number)
    ) {
      log.error({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'NO CONTACT OR WABA NUMBER IN PAYLOAD',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.nack(data, false, false);
    }

    /**
     * handling bot message with content WEBHOOK_MESSAGE
     * Will be ack automatically as there is nothing to do here
     */
    if (
      h.cmpStr(whatsAppData?.sender_number, 'BOT_NUMBER') &&
      h.cmpStr(whatsAppData?.receiver_number, 'RECEIVER_ADDRESS') &&
      h.cmpStr(whatsAppData?.message, 'WEBHOOK_MESSAGE')
    ) {
      log.error({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'BOT MESSAGE WITH WEBHOOK_MESSAGE_CONTENT',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveStatusPayload',
        message: 'PROCESS COMPLETE',
      });
      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }

    // getting the waba and agency
    const { agency_id, wabaOwner } = await whatsAppCommonFunctions.routeCheck({
      sender_number: whatsAppData.sender_number,
      receiver_number: whatsAppData.receiver_number,
      message: whatsAppData.message,
      msg_type: whatsAppData.msg_type,
      reply_to_original_event_id: whatsAppData.reply_to_original_event_id,
      log,
    });

    if (h.isEmpty(agency_id)) {
      log.error({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveStatusPayload',
        message: 'MESSAGE IS NOT FOR ANY ACTIVE WABA NUMBER - IGNORING MESSAGE',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveStatusPayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.ack(data, false, false);
    }

    // not a valid message status
    if (!whatsapp_message_status.includes(whatsAppData.msg_type)) {
      log.error({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveStatusPayload',
        message: 'INVALID MESSAGE STATUS TYPE',
        data: payload,
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      log.info({
        consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
        function: 'receiveMessagePayload',
        message: 'PROCESS COMPLETE',
      });
      return await channel.nack(data, false, false);
    }

    // type is for handling message status
    if (whatsapp_message_status.includes(whatsAppData.msg_type)) {
      const whatsAppMessageStatusData = whatsAppData;
      whatsAppMessageStatusData.wabaOwner = wabaOwner;
      whatsAppMessageStatusData.agency_id = agency_id;
      await handleWhatsAppMessageStatus(
        whatsAppMessageStatusData,
        additionalConfig,
        log,
      );
    }

    await amqProgressTrackerController.addSuccess(amq_progress_tracker_id, 1);
    log.info({
      consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
      function: 'receiveStatusPayload',
      message: 'PROCESS COMPLETE',
    });
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
      consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
      function: 'receiveStatusPayload',
    });
    await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
    log.info({
      consumer: 'WHATSAPP_STATUS_WEBHOOK_PROCESSOR',
      function: 'receiveStatusPayload',
      message: 'PROCESS COMPLETE',
    });
    return await channel.nack(data, false, false);
  }
}

/**
 * Description
 * Function to process chaaat buider automations
 * @async
 * @function
 * @name processChaaatBuilderAutomation
 * @kind function
 * @param {object} data holds whatsapp webhook payload data
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {boolean} triggerContactMsgWABAForFirstTimeAutomation
 * @param {boolean} triggerIncomingMsgReceivedAutomation message
 * @param {boolean} triggerBroadcastAutomation message id
 * @param {object} latestWhatsappTrackerRecord latest whatsapp tracker
 * @param {number} contactMessageCount total message sent count by contact
 * @param {object} contactMessageWABAForFirstTimeRule automation rule
 * @param {object} incomingMessageReceivedRule automation rule
 * @param {object} brodcastAutomationRule automation rule
 * @param {object} additionalConfig consumer additional config
 * @param {object} whatsAppData formated message data
 * @param {object} config rabbitmq/amq configuration
 * @param {object} log server log functions
 * @param channel
 * @param pubChannel
 * @param handleWhatsAppContactMessagesRes
 */
async function processChaaatBuilderAutomation({
  data,
  agency_id,
  triggerContactMsgWABAForFirstTimeAutomation,
  triggerIncomingMsgReceivedAutomation,
  triggerBroadcastAutomation,
  latestWhatsappTrackerRecord,
  contactMessageCount,
  contactMessageWABAForFirstTimeRule,
  incomingMessageReceivedRule,
  brodcastAutomationRule,
  config,
  wabaOwner,
  whatsAppData,
  handleWhatsAppContactMessagesRes,
  additionalConfig,
  log,
  channel,
  pubChannel,
}) {
  let contactMessageCountPerMessageTracker = 0;
  if (h.notEmpty(latestWhatsappTrackerRecord)) {
    contactMessageCountPerMessageTracker =
      await whatsAppCommonFunctions.contactMessageCountPerMessageTracker({
        agency_id,
        sender_number: whatsAppData.sender_number,
        receiver_number: whatsAppData.receiver_number,
        tracker_ref_name: latestWhatsappTrackerRecord.tracker_ref_name,
      });
  }

  if (whatsAppData.msg_type === 'flow') {
    whatsAppData.msg_info = getFlowToken(data);
  }

  let automationRule;
  if (triggerContactMsgWABAForFirstTimeAutomation) {
    automationRule = contactMessageWABAForFirstTimeRule;
  } else if (triggerIncomingMsgReceivedAutomation) {
    automationRule = incomingMessageReceivedRule;
  } else if (triggerBroadcastAutomation) {
    automationRule = brodcastAutomationRule;
  }
  const { message_data, message_media_url, media_message_id } =
    await whatsAppCommonFunctions.handleMediaMessageType({
      agency_id,
      wabaOwner,
      msg_type: whatsAppData.msg_type,
      receiver_number: whatsAppData.receiver_number,
      message: whatsAppData.message,
      log,
    });

  const contactRecord = await c.contact.findOne({
    agency_fk: agency_id,
    mobile_number: whatsAppData.receiver_number,
  });

  // contact message that will trigger message channel automation
  const automationData = whatsAppData;
  automationData.rule_id = automationRule.dataValues.automation_rule_id;
  automationData.agency_id = agency_id;
  automationData.waba = wabaOwner;
  automationData.automation_template =
    automationRule.dataValues.automation_rule_templates[0].dataValues;
  automationData.msgData = !h.isEmpty(message_media_url)
    ? message_media_url.fileURL
    : message_data;
  automationData.media_url = !h.isEmpty(message_media_url)
    ? message_media_url.fileURL
    : null;
  automationData.is_new_contact = h.isEmpty(contactRecord);
  automationData.contact = contactRecord;
  automationData.media_msg_id = media_message_id;
  automationData.message = message_data;
  automationData.message_media_url = message_media_url;
  automationData.media_message_id = media_message_id;

  switch (automationRule.dataValues.rule_trigger_fk) {
    case 'eb7875aa-7e42-4260-8941-02ba9b91b123': // Incoming message received
      automationData.is_new_workflow_message =
        h.isEmpty(latestWhatsappTrackerRecord) ||
        (h.notEmpty(latestWhatsappTrackerRecord) && // if there is already a contact message tracker record and record is for automation
          !latestWhatsappTrackerRecord?.tracker_ref_name.includes(
            '_automation_workflow_incoming_message_received_',
          ));
      automationData.tracker_name =
        'automation_workflow_incoming_message_received';
      break;
    case 'eb7875aa-7e42-4260-8941-02ba9b91b1b0': // Contact send msg for first time
      automationData.is_new_workflow_message =
        h.isEmpty(latestWhatsappTrackerRecord) ||
        (h.notEmpty(latestWhatsappTrackerRecord) && // if there is already a contact message tracker record and record is for automation
          h.cmpInt(contactMessageCount, 0));
      automationData.tracker_name =
        'automation_workflow_contact_message_first_time_to_waba';
      break;
    case 'eb7875aa-7e42-4260-8941-02ba9b91b124': // Broadcast automation
      automationData.is_new_workflow_message = false; // for Broadcast automation latestWhatsappTrackerRecord should always exist
      automationData.tracker_name =
        latestWhatsappTrackerRecord.tracker_ref_name;
      automationData.is_broadcast_campaign = true;
      automationData.msg_origin =
        contactMessageCountPerMessageTracker === 0 ? 'campaign' : 'automation';
      break;
    default:
      break;
  }

  let can_continue_automation = true;
  const contactInventory = await c.contact.checkIfCanAddNewContact(agency_id);
  if (
    h.isEmpty(contactRecord) &&
    h.cmpBool(contactInventory.can_continue, false)
  ) {
    can_continue_automation = false;
    log.warn({
      message: h.general.getMessageByCode(contactInventory.reason),
      details: automationData,
    });
    // to add email notification for contact iventory fail
  }

  if (h.cmpBool(can_continue_automation, true)) {
    await processAutomation(automationData, log, additionalConfig);
    await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);
  }

  if (whatsAppData.msg_type === 'flow') {
    const contactMessageData = whatsAppData;
    contactMessageData.wabaOwner = wabaOwner;
    contactMessageData.agency_id = agency_id;

    const { whatsappMessageTracker, contactRecord } =
      await whatsAppCommonFunctions.prepareTrackerContactRecordForNewMessage({
        wabaOwner: contactMessageData.wabaOwner,
        sender_number: contactMessageData.sender_number,
        receiver_number: contactMessageData.receiver_number,
        reply_to_original_event_id:
          contactMessageData.reply_to_original_event_id,
      });

    log.info({
      message: 'INITIATE whatspapFlowProcessor',
      data: {
        whatsappMessageTracker,
        contactRecord,
      },
    });

    return await whatspapFlowProcessor({
      data,
      automationRule: automationRule.dataValues,
      whatsappMessageTracker,
      contactRecord,
      models,
      channel,
      config,
      pubChannel,
      log: log.child({ sub_process: 'whatsapp-flow-processor' }),
      additionalConfig,
      contactRecord: handleWhatsAppContactMessagesRes?.contactRecord || {},
    });
  }
}

/**
 * Description
 * Function to process legacy automations
 * @async
 * @function
 * @name processLegacyAutomation
 * @param {string} agency_id agency id
 * @param {object} wabaOwner waba details
 * @param {object} whatsAppData formated message data
 * @param {object} contactMessageWABAForFirstTimeRule automation rule
 * @param {number} contactMessageCount total message sent count by contact
 * @param {object} additionalConfig consumer additional config
 * @param {object} log server log functions
 */
async function processLegacyAutomation({
  agency_id,
  wabaOwner,
  whatsAppData,
  contactMessageWABAForFirstTimeRule,
  latestWhatsappTrackerRecord,
  contactMessageCount,
  additionalConfig,
  log,
}) {
  const { message_data, message_media_url, media_message_id } =
    await whatsAppCommonFunctions.handleMediaMessageType({
      agency_id,
      wabaOwner,
      msg_type: whatsAppData.msg_type,
      receiver_number: whatsAppData.receiver_number,
      message: whatsAppData.message,
      log,
    });
  const contactRecord = await c.contact.findOne({
    agency_fk: agency_id,
    mobile_number: whatsAppData.receiver_number,
  });

  // contact message that will trigger message channel automation
  const automationData = whatsAppData;
  automationData.rule_id =
    contactMessageWABAForFirstTimeRule.dataValues.automation_rule_id;
  automationData.agency_id = agency_id;
  automationData.waba = wabaOwner;
  automationData.automation_template =
    contactMessageWABAForFirstTimeRule.dataValues.automation_rule_templates[0].dataValues;
  automationData.msgData = !h.isEmpty(message_media_url)
    ? message_media_url.fileURL
    : message_data;
  automationData.media_url = !h.isEmpty(message_media_url)
    ? message_media_url.fileURL
    : null;
  automationData.is_new_contact = h.isEmpty(contactRecord);
  automationData.is_new_workflow_message =
    h.isEmpty(latestWhatsappTrackerRecord) ||
    (h.notEmpty(latestWhatsappTrackerRecord) && // if there is already a contact message tracker record and record is for automation
      h.cmpInt(contactMessageCount, 0));
  automationData.contact = contactRecord;
  automationData.media_msg_id = media_message_id;

  let can_continue_automation = true;
  const contactInventory = await c.contact.checkIfCanAddNewContact(agency_id);
  if (
    h.isEmpty(contactRecord) &&
    h.cmpBool(contactInventory.can_continue, false)
  ) {
    can_continue_automation = false;
    log.warn({
      message: h.general.getMessageByCode(contactInventory.reason),
      details: automationData,
    });
    // to add email notification for contact iventory fail
  }

  if (h.cmpBool(can_continue_automation, true)) {
    await firstTimeAutomation.processAutomation(
      automationData,
      log,
      additionalConfig,
    );
    await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);
  }
}

/**
 * Description
 * Function to initialize handling status payloads
 * @async
 * @function
 * @name handleWhatsAppMessageStatus
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
 
 * @param {object} additionalConfig additional consumer config
 * @param {object} log server log
 * @returns {Promise} processed data needed for status update
 */
async function handleWhatsAppMessageStatus(params, additionalConfig, log) {
  const {
    whatsAppMsgTracker,
    trackerUpdate,
    has_tracker_update,
    whatsAppChat,
    chatUpdate,
    has_chat_update,
  } = await whatsAppCommonFunctions.handleMessageStatus(params, log);

  await messageDBHandler.updateMessageStatus({
    whatsAppMsgTracker,
    trackerUpdate,
    has_tracker_update,
    whatsAppChat,
    chatUpdate,
    has_chat_update,
    log,
  });

  // remove used message inventory count if sending failed
  if (h.cmpStr(params?.msg_type, 'failed')) {
    await c.messageInventory.substractMessageAndInventoryCount(
      params?.agency_id,
    );
  }
}

/**
 * Description
 * Function to initialize handling contact messages
 * @async
 * @function
 * @name handleWhatsAppContactMessages
 * @kind function
 * @param {object} params breakdown below
 * @param {object} wabaOwner waba details
 * @param {string} agency_id agency id
 * @param {string} original_event_id message event id
 * @param {string} message message
 * @param {string} msg_id message id
 * @param {timestamp} msg_timestamp message timestamp
 * @param {string} sender_number waba number
 * @param {string} receiver_number contact number
 * @param {string} sender_url waba number url
 * @param {string} receiver_url contact number url
 * @param {string} msg_type message type
 * @param {string} reply_to_original_event_id reply to message event id
 * @param {string} reply_to_content reply to message
 * @param {string} reply_to_msg_type reply to message type
 * @param {string} reply_to_file_name reply to file
 * @param {string} reply_to_contact_id reply to contact
 * @param {string} caption message caption
 * @param {string} file_name file
 * @param {string} content_type media content type

 * @param {object} additionalConfig consumer additional config
 * @param {object} log server log
 */
async function handleWhatsAppContactMessages(params, additionalConfig, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleWhatsAppContactMessages',
    message: 'HANDLING CONTACT MESSAGES',
  });

  const { whatsappMessageTracker, contactRecord } =
    await whatsAppCommonFunctions.prepareTrackerContactRecordForNewMessage({
      wabaOwner: params.wabaOwner,
      sender_number: params.sender_number,
      receiver_number: params.receiver_number,
      reply_to_original_event_id: params.reply_to_original_event_id,
    });

  const { message_data, message_media_url, media_message_id } =
    await whatsAppCommonFunctions.handleMediaMessageType({
      agency_id: params.agency_id,
      wabaOwner: params.wabaOwner,
      msg_type: params.msg_type,
      receiver_number: params.receiver_number,
      message: params.message,
      log,
    });

  // initial message data
  const messageData = params;
  messageData.message = message_data;
  messageData.message_media_url = message_media_url;
  messageData.media_message_id = media_message_id;

  let contact_message_processed = false;
  let handleMessageResponse = { sendNotification: false };

  // message coming from an existing contact that already with message record
  if (h.notEmpty(whatsappMessageTracker) && h.notEmpty(contactRecord)) {
    messageData.tracker_ref_name = whatsappMessageTracker?.tracker_ref_name;
    messageData.campaign_name = whatsappMessageTracker?.campaign_name;
    messageData.msg_origin = whatsappMessageTracker?.msg_origin;
    messageData.contact_id = contactRecord?.contact_id;
    messageData.contact_first_name = contactRecord?.first_name;
    messageData.contact_last_name = contactRecord?.last_name;
    messageData.agency_user_id = contactRecord?.agency_user_fk;
    handleMessageResponse =
      await whatsAppCommonFunctions.handleNewMessageForExistingContact(
        messageData,
        additionalConfig,
        log,
      );
    contact_message_processed = true;
  }

  // message from an existing contact with no message record
  if (h.isEmpty(whatsappMessageTracker) && h.notEmpty(contactRecord)) {
    messageData.msg_origin = 'user';
    messageData.contact_id = contactRecord?.contact_id;
    messageData.contact_first_name = contactRecord?.first_name;
    messageData.contact_last_name = contactRecord?.last_name;
    messageData.agency_user_id = contactRecord?.agency_user_fk;
    handleMessageResponse =
      await whatsAppCommonFunctions.handleNewConversationForExistingContact(
        messageData,
        additionalConfig,
        log,
      );
    contact_message_processed = true;
  }

  // message from a new contact
  if (h.isEmpty(whatsappMessageTracker) && h.isEmpty(contactRecord)) {
    messageData.msg_origin = 'user';

    // check if can create new contact
    const contactInventory = await c.contact.checkIfCanAddNewContact(
      params.agency_id,
    );

    if (h.cmpBool(contactInventory.can_continue, false)) {
      log.warn({
        message: h.general.getMessageByCode(contactInventory.reason),
        details: messageData,
      });
      // to add email notification for contact iventory fail
    } else {
      handleMessageResponse =
        await whatsAppCommonFunctions.handleNewMessageForNewContact(
          messageData,
          additionalConfig,
          log,
        );
      await c.agencyNotification.checkContactCapacityAfterUpdate(
        params.agency_id,
      );
      contact_message_processed = true;
    }
  }

  if (
    h.cmpBool(contact_message_processed, true) &&
    ['text', 'interactive', 'button'].includes(params.msg_type) &&
    ['active', 'outsider'].includes(contactRecord?.status) &&
    params.msg_type !== 'flow'
  ) {
    await whatsAppCommonFunctions.handleAutoResponse(
      {
        message: params.message,
        msg_timestamp: params.msg_timestamp,
        sender_number: params.sender_number,
        receiver_number: params.receiver_number,
        sender_url: params.sender_url,
        receiver_url: params.receiver_url,
        contact: contactRecord,
      },
      additionalConfig,
      log,
    );
  }

  // trigger contact message email notification for contact owner
  if (h.cmpBool(handleMessageResponse?.sendNotification, true)) {
    notificationHandler.sendContactMessageEmailNotification(
      {
        agency_id: params.agency_id,
        additional_recipients:
          handleMessageResponse?.agency_campaign_additional_recipient,
        chat_id: handleMessageResponse?.whatsapp_chat_id,
        contact_id: params.contact_id,
        contact_first_name: handleMessageResponse?.contact_first_name,
        contact_last_name: handleMessageResponse?.contact_last_name,
        agent_first_name: handleMessageResponse?.agent_first_name,
        agent_email: handleMessageResponse?.agent_email,
        message: params.message,
        msg_type: params.msg_type,
        new_msg: handleMessageResponse?.new_msg,
      },
      log,
    );
  }

  return {
    contactRecord,
  };
}

module.exports.receiveMessagePayload = receiveMessagePayload;
module.exports.receiveStatusPayload = receiveStatusPayload;
module.exports.handleWhatsAppMessageStatus = handleWhatsAppMessageStatus;
