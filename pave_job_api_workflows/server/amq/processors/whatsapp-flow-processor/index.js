const Sentry = require('@sentry/node');
const processGoogleAppointment = require('./process-google-appointment');
const processOutlookAppointment = require('./process-outlook-appointment');
const whatsappFlowUtils = require('./whatsapp-flow-processor-utils');
const processAppointmentReminder = require('./process-appointment-reminder');
/*
payload sample
{
  screen_1_TextInput_firstname: 'John',
  screen_1_TextInput_lastname: 'Avila',
  screen_1_TextInput_email: 'john+test@chaaat.io',
  screen_0_Dropdown_duration: '60 mins',
  screen_0_DatePicker_date: '1715529600000',
  screen_0_Dropdown_time: '11:30',
  flow_token: 'whatsapp_flow_id:47a7c678-05a2-4bd7-b064-db4e3a14548c|calendar_appointment_id:u5t36sv27apo76sm2im9a3vcg8'
}
*/

/**
 * getAppointmentType - returns appointment type based on the crm_settings and calendar_appointment_id
 * @param {{
 *  calendar_appointment_id: string,
 *  crm_settings: object,
 *  log: FastifyLogFn
 * }} param0
 * @returns {string}
 */
function getAppointmentType({ calendar_appointment_id, crm_settings, log }) {
  if (crm_settings.crm_type === 'GCALENDAR' && calendar_appointment_id) {
    log.info({ appointmentType: 'GCALENDAR_UPDATE' });
    return 'GCALENDAR_UPDATE';
  }

  if (crm_settings.crm_type === 'GCALENDAR') {
    log.info({ appointmentType: 'GCALENDAR_CREATE' });
    return 'GCALENDAR_CREATE';
  }

  if (crm_settings.crm_type === 'OUTLOOKCALENDAR' && calendar_appointment_id) {
    log.info({ appointmentType: 'OUTLOOKCALENDAR_UPDATE' });
    return 'OUTLOOKCALENDAR_UPDATE';
  }

  if (crm_settings.crm_type === 'OUTLOOKCALENDAR') {
    log.info({ appointmentType: 'OUTLOOKCALENDAR_CREATE' });
    return 'OUTLOOKCALENDAR_CREATE';
  }
  log.warn({ appointmentType: 'NOT_FOUND' });

  return 'NOT_FOUND';
}

/**
 * runWorkflow - processed the whatsapp flow messge to create a calendar event to the target CRM
 * @param {{
 *  eventName: string,
 *  appointmentType: string,
 *  models: SequelizeObject,
 *  encryptionKeys: object,
 *  whatsappFlow: object,
 *  crmSetting: object,
 *  contactBookingDetails: object,
 *  contactNumber: object,
 *  calendar_appointment_id: string,
 *  whatsappMessageTracker: object,
 *  latestChat: object
 *  log: object
 * }} param0
 * @returns {Promise<{
 *  contact_id: string,
 *  contactBookingDetails: object,
 *  appointment_booking_id: string,
 * }>}
 */
async function runWorkflow({
  eventName,
  appointmentType,
  models,
  encryptionKeys,
  whatsappFlow,
  crmSetting,
  contactBookingDetails,
  contactNumber,
  calendar_appointment_id,
  wabaNumber,
  agencyBufferedCredentials,
  contactRecord,
  whatsappMessageTracker,
  latestChat,
  log,
}) {
  let func;
  switch (appointmentType) {
    case 'GCALENDAR_CREATE':
      func = processGoogleAppointment.createAppointment;
      break;
    case 'GCALENDAR_UPDATE':
      func = processGoogleAppointment.updateAppointment;
      break;
    case 'OUTLOOKCALENDAR_CREATE':
      func = processOutlookAppointment.createAppointment;
      break;
    case 'OUTLOOKCALENDAR_UPDATE':
      func = processOutlookAppointment.updateAppointment;
      break;
    default:
      log.info({
        message: 'No appointment type processor',
      });
  }

  if (!func) return;

  return await func({
    models,
    encryptionKeys,
    log: log.child({
      appointment_processor: appointmentType,
    }),
    eventName,
    whatsappFlow,
    crmSetting,
    contactBookingDetails,
    contactNumber,
    calendar_appointment_id,
    wabaNumber,
    agencyBufferedCredentials,
    contactRecord,
    whatsappMessageTracker,
    latestChat,
  });
}

/**
 * _checkWhatsappFlow - helper function to fetch whatsappFlow and associated crmSetting
 * @param {{
 *  models: object,
 *  whatsapp_flow_id: string,
 *  log: FastifyLogFn
 * }} param0
 * @returns {{
 *  whatsappFlow,
 *  crmSetting
 * }}
 */
async function _checkWhatsappFlow({ models, whatsapp_flow_id, log }) {
  const whatsappFlowCtl =
    require('../../../controllers/whatsappFlow').makeController(models);
  const crmSettingCtl =
    require('../../../controllers/crmSetting').makeController(models);
  const whatsappFlow = await whatsappFlowCtl.findOne({ whatsapp_flow_id });

  if (!whatsappFlow) {
    throw new Error(
      `Whatsapp Flow cannot be found with ID: ${whatsapp_flow_id}`,
    );
  }

  const crmSetting = await crmSettingCtl.findOne({
    crm_settings_id: whatsappFlow.crm_settings_fk,
  });

  // if no flow record or crm settingreturn ack
  log.info({
    whatsappFlow,
    crmSetting,
  });

  return {
    whatsappFlow,
    crmSetting,
  };
}

/**
 * _validatePartNotEmptyData - validate if there is a valid Part in the message
 * Part is a whatapp message field that contains the whatsapp flow message info
 * @param {Array<any>} parts
 * @returns {boolean}
 */
function _validatePartNotEmptyData(parts) {
  return !parts && !Array.isArray(parts) && parts.length < 1;
}

/**
 * Rabbit MQ processor for whatsapp flow message related to appointments.
 * process all whatsappflow information and send / updates a calendar invite based on the info.
 * @param {{
 *  data: object,
 *  models: object,
 *  channel: RabbitMQChannel,
 *  log: FastifyLogFn,
 *  additionalConfig: object
 *  whatsappMessageTracker: object,
 *  automationRule: object,
 * }} param0
 * @returns {void}
 */
module.exports = async ({
  data,
  models,
  channel,
  log,
  additionalConfig,
  contactRecord,
  whatsappMessageTracker,
  automationRule,
}) => {
  const payload = JSON.parse(data.content.toString());
  const body = payload.data;
  const encryptionKeys = additionalConfig.ek || {};

  const whatsappConfigCtl =
    require('../../../controllers/agencyWhatsappConfig').makeController(models);
  const contactCtl =
    require('../../../controllers/contact').makeContactController(models);
  const agencyCtl = require('../../../controllers/agency').makeAgencyController(
    models,
  );

  log.info({ data: 'WEBHOOK PAYLOAD DATA', payload: body });

  const contactNumber = body?.data?.receiveraddress;
  const wabaNumber = body?.data?.senderaddress;
  const parts = body?.data?.parts;

  if (_validatePartNotEmptyData(parts)) {
    log.warn({
      message: 'Payload Parts is empty',
    });
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  }

  const contactResponseData = whatsappFlowUtils.parseJson(parts[0].data);
  const contactBookingDetails = contactResponseData; // whatsappFlowUtils.parseBookingDetails(contactResponseData)
  const flowToken = contactResponseData.flow_token;
  const parsedFlowToken = whatsappFlowUtils.parseFlowToken(flowToken, {
    log: log.child({ sub_function_name: 'parseFlowToken' }),
  });
  const { whatsapp_flow_id, calendar_appointment_id, node_id } =
    parsedFlowToken;

  const messageFlow = JSON.parse(
    automationRule.automation_rule_templates[0].message_flow_data,
  );
  const bookingNode = messageFlow.nodes.find((ele) => ele.id === node_id);

  const eventName = bookingNode?.data?.flowData?.booking_event_name;

  if (!whatsapp_flow_id) {
    log.warn({ message: 'whatsapp_flow_id not found' });
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  }

  const { whatsappFlow, crmSetting } = await _checkWhatsappFlow({
    models,
    whatsapp_flow_id,
    log,
  });
  const appointmentType = getAppointmentType({
    calendar_appointment_id,
    crm_settings: crmSetting,
    log,
  });

  const wabaConfiguration = await whatsappConfigCtl.findOne({
    agency_fk: crmSetting.agency_fk,
    waba_number: wabaNumber,
  });

  const agencyWhatsAppCredentials =
    wabaConfiguration?.agency_whatsapp_api_token +
    ':' +
    wabaConfiguration?.agency_whatsapp_api_secret;
  const agencyBufferedCredentials = Buffer.from(
    agencyWhatsAppCredentials,
    'utf8',
  ).toString('base64');

  const latestChat = await models.whatsapp_chat.findOne({
    where: {
      receiver_number: contactNumber,
      agency_fk: whatsappMessageTracker.agency_fk,
      campaign_name: whatsappMessageTracker.campaign_name,
      msg_origin: 'automation',
    },
    order: [['created_date', 'DESC']],
  });

  log.info({
    message: '*** contactBookingDetails ***',
    data: contactBookingDetails,
  });

  try {
    // create calendar event only if date and duration is selected
    if (contactBookingDetails?.select_time && contactBookingDetails?.duration) {
      const workflowRes = await runWorkflow({
        eventName,
        appointmentType,
        models,
        encryptionKeys,
        whatsappFlow,
        crmSetting,
        contactBookingDetails,
        contactNumber,
        calendar_appointment_id,
        wabaNumber,
        agencyBufferedCredentials,
        contactRecord,
        whatsappMessageTracker,
        latestChat,
        log,
      });
      await processAppointmentReminder.createReminders({
        whatsapp_flow_id,
        contact_id: workflowRes?.contact_id,
        crmSetting,
        appointment_booking_id: workflowRes?.appointment_booking_id,
        log: log.child({ sub_function_name: 'createReminders' }),
      });
    } else {
      log.info({
        message: '*** PROCEED WITHOUT CREATING CALENDAR EVENT ***',
      });
      const transaction = await models.sequelize.transaction();
      const agency = await agencyCtl.findOne({
        agency_id: crmSetting.agency_fk,
      });

      if (!agency) {
        log.warn({ message: 'No Agency Found' });
        return;
      }
      const contactQ = {
        mobile_number: contactNumber,
        agency_fk: agency.agency_id,
      };
      const hasContact = await contactCtl.findOne(contactQ);
      const contact_id = hasContact?.contact_id || '';
      const contactObj = {
        email: contactBookingDetails?.email || '',
      };

      // Replace email with existing. so it doesn't update into DB
      if (hasContact && hasContact?.email) {
        contactObj.email = hasContact.email;
      }

      log.info({
        data: {
          contactObj,
          contact_id,
        },
      });

      if (contact_id) {
        await contactCtl.update(
          contact_id,
          { email: contactObj.email },
          { transaction },
        );
      }
      await transaction.commit();
    }
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    if (err?.response?.data) {
      log.error({
        axios_error: err.response.data,
      });
    }
    log.error({
      err,
      error_string: String(err),
    });
    Sentry.captureException(err);
    return channel.nack(data, null, null);
  }
};
