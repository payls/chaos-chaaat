const Sentry = require('@sentry/node');
const OutlookCalendarHelper = require('../../../helpers/outlookCalendar');
const mobileCountryCode = require('../../../helpers/mobile');
const whatsappFlowProcessorUtils = require('./whatsapp-flow-processor-utils');
const h = require('../../../helpers');
const c = require('../../../controllers');

/**
 * processMessageBack
 * @param {{
 *  contactBookingDetails: object,
 *  outlookEvent: object,
 *  agency: object,
 *  isForUpdate: boolean,
 *  models: object,
 *  contactNumber: string,
 *  wabaNumber: string,
 *  agencyBufferedCredentials: string,
 *  latestChat: object,
 *  whatsappMessageTracker: object,
 *  contactRecord: object,
 * }}
 */

async function processMessageBack ({
  contactBookingDetails,
  outlookEvent,
  agency,
  isForUpdate,
  models,
  contactNumber,
  wabaNumber,
  agencyBufferedCredentials,
  latestChat,
  whatsappMessageTracker,
  contactRecord,
  log
}) {
  const date = new Date(Number(contactBookingDetails.date));
  date.setDate(date.getDate() + 1); // Add one day
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);

  let meetingLink =
    outlookEvent?.onlineMeeting?.joinUrl || outlookEvent.webLink;

  const responseBody = `
  ${isForUpdate ? 'Update Appointment' : 'Appointment'} Booking:
    Meeting Link: ${meetingLink}
    Date: ${formattedDate}
    Time: ${contactBookingDetails.select_time}
  `;

  const { whatsapp_config } = await models.agency_config.findOne({
    where: { agency_fk: agency.agency_id },
  });
  const config = JSON.parse(whatsapp_config);
  const parts = [{
    id: '1',
    contentType: 'text/plain',
    data: `${responseBody}`,
    size: 1000,
    type: 'body',
    sort: 0,
  }];
  const receivers = [{
    name: 'name',
    address: `${contactNumber}`,
    Connector: `${contactNumber}`,
    type: 'individual',
  }];
  const mobile_number = wabaNumber;
  const environment = config.environment; 
  await h.whatsapp.sendAutoResponseMessage({
    mobile_number,
    parts,
    receivers,
    api_credentials: agencyBufferedCredentials,
    environment,
    log,
  });

  const created_date = new Date();
  const msg_timestamp = Math.floor(created_date.getTime() / 1000);
  const whatsappCreateObj = {
    agency_fk: whatsappMessageTracker?.agency_fk,
    contact_fk: whatsappMessageTracker?.contact_fk,
    agency_user_fk: whatsappMessageTracker?.agency_user_fk,
    campaign_name: whatsappMessageTracker?.campaign_name,
    msg_body: `${responseBody}`,
    msg_type: "frompave",
    msg_category: "SERVICE",
    msg_origin: "automation",
    msg_info: latestChat?.msg_info,
    msg_timestamp: msg_timestamp,
    sender_number: wabaNumber,
    sender_url: `${environment}://${wabaNumber}@`,
    receiver_number: `${contactNumber}`,
    receiver_url: `${environment}://${contactNumber}@whatsapp.com?name=name`
  };

  await c.whatsappChat.create(whatsappCreateObj);
}

/**
 * processMeetingSchedule - calculates start and end date based on date time and duration
 * @param {{
 *  duration: integer,
 *  date: DateTime,
 *  time: integer
 * }} param0 
 * @returns {{
 *  startDate: DateTime,
 *  endDate: DateTime
 * }}
 */
function processMeetingSchedule({ duration, date, select_time }) {
  const startDate = new Date(parseInt(date));

  const time = select_time.split(' ')[0];

  // Parse the time string
  const [hours, minutes] = time.split(':').map(Number);
  startDate.setUTCHours(hours, minutes, 0, 0);

  // Add one day to the startDate
  startDate.setUTCDate(startDate.getUTCDate() + 1);

  // Parse the duration
  const [durationValue, durationUnit] = duration.split(' ');
  let durationMilliseconds = parseInt(durationValue) * 60000;
  if (durationUnit && durationUnit === 'mins') {
    durationMilliseconds = parseInt(durationValue) * 60000; // 1 minute = 60000 milliseconds
  }
  
  if (durationUnit && durationUnit === 'hours') {
    // Handle other units like hours, days, etc. if needed
    durationMilliseconds = parseInt(durationValue) * 3600000;
  }

  // Calculate end date by adding duration to start date
  const endDate = new Date(startDate.getTime() + durationMilliseconds);

  // Format dates in custom format (YYYY-MM-DDTHH:mm:ss±hh:mm)
  const formatDate = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    const offsetHours = pad(Math.floor(date.getTimezoneOffset() / 60));
    const offsetMinutes = pad(Math.abs(date.getTimezoneOffset() % 60));
    const offsetSign = date.getTimezoneOffset() > 0 ? '-' : '+';
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  return {
    startDate: startDateFormatted,
    endDate: endDateFormatted
  };
}

/**
 * mobileToTimeZone - get the timezone based on mobile number
 * @param {string} mobile_number 
 * @returns {string}
 */
function mobileToTimeZone(mobile_number) {
  let timezone = 'Asia/Manila';

  const mobileCC = mobileCountryCode.getMobileParts(mobile_number);

  if (mobileCC && mobileCC.country) {
    return mobileCC.country.timezones[0]
  }

  return timezone;
}

/**
 * createCalendarEvent - calls outlook calendar api to create
 * calendar event
 * @param {{
 *  models: object,
 *  agency: object,
 *  encryptionKeys: object,
 *  agencyOauth: object,
 *  contactBookingDetails: object,
 *  whatsappFlow: object,
 *  contactNumber: string,
 *  log: FastifyLogFn,
 *  eventName: string
 * }} param0 
 * @returns {Promise<{
 *  updatedCalendarEvent: object,
 *  startDateTime: DateTime,
 *  endDateTime: DateTime,
 *  timeZone: string
 * }>}
 */
async function createCalendarEvent({
  models,
  agency,
  encryptionKeys,
  agencyOauth,
  contactBookingDetails,
  whatsappFlow,
  contactNumber,
  eventName,
  log
}) {
  const outlookCalendar = new OutlookCalendarHelper({
    encryption_iv: encryptionKeys.encryption_iv,
    encryption_key: encryptionKeys.encryption_key,
    agencyOauth,
    secrets: encryptionKeys
  });
  const meetingSchedule = processMeetingSchedule(contactBookingDetails);

  log.info({ meetingSchedule });

  const summary = eventName ? eventName : "Meeting with Chaaat.io";
  let description = eventName ? eventName : "Meeting with Chaaat.io";
  if (contactBookingDetails?.email) {
    description = `${description} - ${contactBookingDetails.email}`;
  }
  const startDateTime = meetingSchedule.startDate;
  const endDateTime = meetingSchedule.endDate;
  const timeZone = mobileToTimeZone(contactNumber);
  const attendees = await whatsappFlowProcessorUtils.processOutlookAtendees({ models, agency, contactBookingDetails });
  const calendarDetails = {
    summary,
    description,
    startDateTime,
    endDateTime,
    timeZone,
    attendees,
  };
  log.info({ calendarDetails });
  const newOutlookEvent = await outlookCalendar.createCalendarEvent(calendarDetails);

  log.info({
    function: "createCalendarEvent",
    message: "PROCESS OUTLOOK APPOINTMENT",
    data: newOutlookEvent,
  });

  return {
    newOutlookEvent,
    startDateTime,
    endDateTime,
    timeZone,
  };
}

/**
 * updateCalendarEvent - calls outlook calendar api to update
 * existing calendar event
 * @param {{
 *  models: object,
 *  agency: object,
 *  encryptionKeys: object,
 *  agencyOauth: object,
 *  calendar_appointment_id: string,
 *  whatsappFlow: object,
 *  contactBookingDetails: object,
 *  contactNumber: string,
 *  log: FastifyLogFn,
 *  eventName: string
 * }} param0 
 * @returns {Promise<{
 *  updatedCalendarEvent: object,
 *  startDateTime: DateTime,
 *  endDateTime: DateTime,
 *  timeZone: string,
 * }>}
 */
async function updateCalendarEvent({
  models,
  agency,
  encryptionKeys,
  agencyOauth,
  calendar_appointment_id,
  whatsappFlow,
  contactBookingDetails,
  contactNumber,
  eventName,
  log
}) {
  const outlookCalendar = new OutlookCalendarHelper({
    encryption_iv: encryptionKeys.encryption_iv,
    encryption_key: encryptionKeys.encryption_key,
    agencyOauth,
    secrets: encryptionKeys,
  });

  const meetingSchedule = processMeetingSchedule(contactBookingDetails);

  log.info({ meetingSchedule });

  const summary = eventName ? eventName : "Meeting with Chaaat.io";
  let description = eventName ? eventName : "Meeting with Chaaat.io";
  if (contactBookingDetails?.email) {
    description = `${description} - ${contactBookingDetails.email}`;
  }
  const startDateTime = meetingSchedule.startDate;
  const endDateTime = meetingSchedule.endDate;
  const timeZone = mobileToTimeZone(contactNumber);
  const attendees = await whatsappFlowProcessorUtils.processOutlookAtendees({ models, agency, contactBookingDetails });

  const calendarDetails = {
    eventId: calendar_appointment_id,
    summary,
    description,
    startDateTime,
    endDateTime,
    timeZone,
    attendees,
  };

  log.info({ calendarDetails });

  const updatedCalendarEvent = await outlookCalendar.updateCalendarEvent(calendarDetails);

  log.info({
    function: "updateCalendarEvent",
    message: "PROCESS OUTLOOK APPOINTMENT",
    data: updatedCalendarEvent,
  });

  return {
    updatedCalendarEvent,
    startDateTime,
    endDateTime,
    timeZone,
  };
}

/**
 * runNewOutlookAppointmentTransaction - process all database write transaction
 * for new outlook calendar appointment
 * @param {{
 *  models: object,
 *  contact_id: string,
 *  client_detail_id: string,
 *  contactObj: object,
 *  crmSetting: object,
 *  newOutlookEvent: object,
 *  startDateTime: DateTime,
 *  endDateTime: DateTime,
 *  timeZone: string,
 *  contactBookingDetails: object,
 *  contactNumber: string,
 *  log: FastifyLogFn,
 * }} param0 
 * @returns {Promise<{
 *  appointment_booking_id: string,
 * }>}
 */
async function runNewOutlookAppointmentTransaction ({
  models,
  contact_id: contactId,
  client_detail_id: clientDetailId,
  contactObj,
  crmSetting,
  newOutlookEvent,
  startDateTime,
  endDateTime,
  timeZone,
  contactBookingDetails,
  contactNumber,
  log
}) {
  const appointmentBookingCtl = require('../../../controllers/appointmentBooking').makeController(models);
  const clientDetailCtl = require('../../../controllers/clientDetail').makeController(models);
  const contactCtl = require('../../../controllers/contact').makeContactController(models);
  let contact_id = contactId;
  let client_detail_id = clientDetailId;
  const transaction = await models.sequelize.transaction();
  try {
    if (contact_id && contactObj?.email) {
      await contactCtl.update(contact_id, { email: contactObj.email }, { transaction });
    }
    const appointmentBookingObj = {
      crm_settings_fk: crmSetting.crm_settings_id,
      appointment_id: newOutlookEvent.id,
      appointment_type: 'OUTLOOKCALENDAR',
      appointment_link: newOutlookEvent.webLink,
      // initial_booking_message: '',
      // initial_message_cta: '',
      start_time: startDateTime,
      end_time: endDateTime,
      timezone: timeZone
    };
    const appointment_booking_id = await appointmentBookingCtl.create(appointmentBookingObj, { transaction });
    const clientDetailObj = {
      crm_settings_fk: crmSetting.crm_settings_id,
      contact_fk: contact_id,
      appointment_id: newOutlookEvent.id,
      // client_id: null, // how to get client_id for outlook
      email: contactBookingDetails.email,
      mobile_number: contactNumber
    };

    if (client_detail_id) {
      await clientDetailCtl.update(client_detail_id, clientDetailCtl, { transaction });
    } else {
      client_detail_id = await clientDetailCtl.create(clientDetailObj, { transaction });
    }
    log.info({
      message: 'Outllok Calendar Event Created.',
      data: { contact_id, appointment_booking_id, client_detail_id, appointment_id: newOutlookEvent.id }
    });
    await transaction.commit();
    return {
      appointment_booking_id,
    }
  } catch (err) {
    log.error({ err, error_string: String(err) });
    Sentry.captureException(err);
    await transaction.rollback();
    throw err;
  }
}

/**
 * runUpdateOutlookAppointmentTransaction - process all database write transaction
 * for outlook calendar appointment update
 * @param {{
 *  models: object,
 *  contact_id: string,
 *  contactObj: object,
 *  crmSetting: object,
 *  updatedCalendarEvent: object,
 *  startDateTime: DateTime,
 *  endDateTime: DateTime,
 *  timeZone: string,
 *  appointment_booking_id: string,
 *  client_detail_id: string,
 *  calendar_appointment_id: string,
 *  contactBookingDetails: object,
 *  contactNumber: string,
 *  log: FastifyLogFn,
 * }} param0
 * @returns {Promise<{
 *  appointment_booking_id: string,
 * }>}
 */
async function runUpdateOutlookAppointmentTransaction ({
  models,
  contact_id: contactId,
  contactObj,
  crmSetting,
  updatedCalendarEvent,
  startDateTime,
  endDateTime,
  timeZone,
  appointment_booking_id: appointmentBookingId,
  client_detail_id: clientDetailId,
  calendar_appointment_id,
  contactBookingDetails,
  contactNumber,
  log
}) {
  const appointmentBookingCtl = require('../../../controllers/appointmentBooking').makeController(models);
  const clientDetailCtl = require('../../../controllers/clientDetail').makeController(models);
  const contactCtl = require('../../../controllers/contact').makeContactController(models);
  let contact_id = contactId, appointment_booking_id = appointmentBookingId, client_detail_id = clientDetailId;
  const transaction = await models.sequelize.transaction();
  try {
    if (contact_id && contactObj?.email) {
      await contactCtl.update(contact_id, { email: contactObj.email }, { transaction });
    }
    const appointmentBookingObj = {
      crm_settings_fk: crmSetting.crm_settings_id,
      appointment_id: calendar_appointment_id,
      appointment_type: 'OUTLOOKCALENDAR',
      appointment_link: updatedCalendarEvent.htmlLink,
      start_time: startDateTime,
      end_time: endDateTime,
      timezone: timeZone
    };
    if (appointment_booking_id) {
      await appointmentBookingCtl.update(appointment_booking_id, appointmentBookingObj, { transaction });
    } else {
      appointment_booking_id = await appointmentBookingCtl.create(appointmentBookingObj, { transaction });
    }
    const clientDetailObj = {
      crm_settings_fk: crmSetting.crm_settings_id,
      contact_fk: contact_id,
      appointment_id: calendar_appointment_id,
      email: contactBookingDetails.email,
      mobile_number: contactNumber
    };
    if (client_detail_id) {
      await clientDetailCtl.update(client_detail_id, clientDetailCtl, { transaction });
    } else {
      client_detail_id = await clientDetailCtl.create(clientDetailObj, { transaction });
    }
    log.info({
      message: 'Outlook Calendar Event Updated.',
      data: { contact_id, appointment_booking_id, client_detail_id, appointment_id: calendar_appointment_id }
    });
    await transaction.commit();
    return {
      appointment_booking_id,
    }
  } catch (err) {
    Sentry.captureException(err)
    log.error({ err, error_string: String(err) });
    await transaction.rollback();
    throw err;
  }
}

/**
 * createAppointment - call crm calendar to create an appointment
 * @param {{
 *  models: object,
 *  encryptionKeys: object,
 *  log: FastifyLogFn,
 *  whatsappFlow: object,
 *  crmSetting: object,
 *  contactBookingDetails: object,
 *  contactNumber: string,
 *  latestChat: object,
 *  whatsappMessageTracker: object,
 *  eventName: string
 * }} param0 
 * @returns {Promise<{
 *  contactBookingDetails: object,
 *  appointment_booking_id: string,
 * }>}
 */
async function createAppointment ({
  models,
  encryptionKeys,
  log,
  whatsappFlow,
  crmSetting,
  contactBookingDetails,
  contactNumber,
  wabaNumber,
  agencyBufferedCredentials,
  latestChat,
  whatsappMessageTracker,
  contactRecord,
  eventName
}) {
  const clientDetailCtl = require('../../../controllers/clientDetail').makeController(models);
  const agencyCtl = require('../../../controllers/agency').makeAgencyController(models);
  const contactCtl = require('../../../controllers/contact').makeContactController(models);
  const agency = await agencyCtl.findOne({ agency_id: crmSetting.agency_fk });
  try {
    if (!agency) {
      log.warn({ message: 'No Agency Found' })
      return;
    }
    const agencyOauth = await whatsappFlowProcessorUtils.getAgencyOauth({ models, agency_id: agency.agency_id, source: 'OUTLOOKCALENDAR', log });
    const { newOutlookEvent, startDateTime, endDateTime, timeZone } = await createCalendarEvent({
      models, agency, encryptionKeys, agencyOauth, contactBookingDetails, whatsappFlow, contactNumber, log, eventName
    });
    // prepare data to save
    const contactObj = {
      status: 'active',
      first_name: contactBookingDetails.firstname,
      last_name: contactBookingDetails.lastname,
      email: contactBookingDetails.email,
      mobile_number: contactNumber,
      agency_fk: agency.agency_id,
      agency_user_fk: agency.default_outsider_contact_owner,
    }
    let contact_id, client_detail_id;
    const contactQ = {
      mobile_number: contactObj.mobile_number,
      agency_fk: contactObj.agency_fk
    };
    if (contactObj.email) contactQ.email = contactObj.email;
    const hasContact = await contactCtl.findOne(contactQ);
    contact_id = hasContact?.contact_id;
    
    // Replace email with existing. so it doesn't update into DB
    if (hasContact && hasContact?.email){
      contactObj.email = hasContact.email
    }
  
    if (contact_id) {
      const hasClientDetail = await clientDetailCtl.findOne({
        contact_fk: contact_id,
        crm_settings_fk: crmSetting.crm_settings_id,
        appointment_id: newOutlookEvent.id
      });
      client_detail_id = hasClientDetail?.client_detail_id;
    }
    const createdAppoinment = await runNewOutlookAppointmentTransaction({
      models,
      contact_id,
      client_detail_id,
      contactObj,
      crmSetting,
      newOutlookEvent,
      startDateTime,
      endDateTime,
      timeZone,
      contactBookingDetails,
      contactNumber,
      log
    });
  
    await processMessageBack({
      contactBookingDetails,
      outlookEvent: newOutlookEvent,
      agency,
      isForUpdate: false,
      models,
      contactNumber,
      wabaNumber,
      agencyBufferedCredentials,
      latestChat,
      whatsappMessageTracker,
      contactRecord,
      log
    });
  
    return {
      contact_id,
      contactBookingDetails,
      appointment_booking_id: createdAppoinment?.appointment_booking_id,
    };
  } catch (error) {
    Sentry.captureException(error);
    log.error({ error });
  }
}

/**
 * updateAppointment - call crm calendar to update existing event
 * @param {{
 *  models: object,
 *  encryptionKeys: object,
 *  log: FastifyLogFn,
 *  whatsappFlow: object,
 *  crmSetting: object,
 *  contactBookingDetails: object,
 *  contactNumber: string,
 *  calendar_appointment_id: string,
 *  whatsappMessageTracker: object,
 *  latestChat: object,
 *  eventName: string
 * }} param0 
 * @returns {Promise<{
 *  contactBookingDetails: object,
 *  appointment_booking_id: string,
 * }>}
 */
async function updateAppointment ({
  models,
  encryptionKeys,
  log,
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
  eventName
}) {
  const appointmentBookingCtl = require('../../../controllers/appointmentBooking').makeController(models);
  const clientDetailCtl = require('../../../controllers/clientDetail').makeController(models);
  const agencyCtl = require('../../../controllers/agency').makeAgencyController(models);
  const contactCtl = require('../../../controllers/contact').makeContactController(models);
  try {
    const agency = await agencyCtl.findOne({ agency_id: crmSetting.agency_fk });
    if (!agency) {
      log.warn({ message: 'No Agency Found' });
      return;
    }
    const agencyOauth = await whatsappFlowProcessorUtils.getAgencyOauth({ models, agency_id: agency.agency_id, source: 'OUTLOOKCALENDAR', log });
    const { updatedCalendarEvent, startDateTime, endDateTime, timeZone } = await updateCalendarEvent({
      models, agency, encryptionKeys, agencyOauth, calendar_appointment_id, whatsappFlow, contactBookingDetails, contactNumber, log, eventName
    });
    const contactObj = {
      status: 'active',
      first_name: contactBookingDetails.firstname,
      last_name: contactBookingDetails.lastname,
      email: contactBookingDetails.email,
      mobile_number: contactNumber,
      agency_fk: agency.agency_id,
      agency_user_fk: agency.default_outsider_contact_owner,
    }
    let contact_id;
    let client_detail_id;
    let appointment_booking_id;
    const contactQ = {
      mobile_number: contactObj.mobile_number,
      agency_fk: contactObj.agency_fk
    };
    if (contactObj.email) contactQ.email = contactObj.email;
    const hasContact = await contactCtl.findOne(contactQ);
    contact_id = hasContact?.contact_id;
    
    // Replace email with existing. so it doesn't update into DB
    if (hasContact && hasContact?.email){
      contactObj.email = hasContact.email
    }

    if (contact_id) {
      const hasClientDetail = await clientDetailCtl.findOne({
        contact_fk: contact_id,
        crm_settings_fk: crmSetting.crm_settings_id,
        appointment_id: updatedCalendarEvent.id
      });
      const hasAppointment = await appointmentBookingCtl.findOne({
        crm_settings_fk: crmSetting.crm_settings_id,
        appointment_id: calendar_appointment_id
      });
      client_detail_id = hasClientDetail?.client_detail_id;
      appointment_booking_id = hasAppointment?.appointment_booking_id;
    }
    await runUpdateOutlookAppointmentTransaction({
      models,
      contact_id,
      contactObj,
      crmSetting,
      updatedCalendarEvent,
      startDateTime,
      endDateTime,
      timeZone,
      appointment_booking_id,
      client_detail_id,
      calendar_appointment_id,
      contactBookingDetails,
      contactNumber,
      log,
    });

    await processMessageBack({
      contactBookingDetails,
      outlookEvent: updatedCalendarEvent,
      agency,
      isForUpdate: true,
      models,
      contactNumber,
      wabaNumber,
      agencyBufferedCredentials,
      contactRecord,
      latestChat,
      whatsappMessageTracker,
      log
    });

    return {
      contact_id,
      appointment_booking_id,
      contactBookingDetails,
    }
  } catch (error) {
    Sentry.captureException(error);
    log.error({ error });
  }
}


module.exports.createAppointment = createAppointment;
module.exports.updateAppointment = updateAppointment;
