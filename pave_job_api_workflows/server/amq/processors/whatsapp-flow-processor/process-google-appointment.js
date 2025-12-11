const Sentry = require('@sentry/node');
const GoogleCalendarHelper = require('../../../helpers/googlecalendar');
const mobileCountryCode = require('../../../helpers/mobile');
const whatsappFlowProcessorUtils = require('./whatsapp-flow-processor-utils');
const h = require('../../../helpers');
const c = require('../../../controllers');

/**
 * processMessageBack
 * @param {{
*  contactBookingDetails: object,
*  googleCalendarEvent: object,
*  agency: object,
*  isForUpdate: boolean,
*  models: object,
*  contactNumber: string,
*  wabaNumber: string,
*  agencyBufferedCredentials: string,
*  whatsappMessageTracker: object,
*  latestChat: object,
* }}
*/

async function processMessageBack ({
 contactBookingDetails,
 googleCalendarEvent,
 agency,
 isForUpdate,
 models,
 contactNumber,
 wabaNumber,
 agencyBufferedCredentials,
 whatsappMessageTracker,
 latestChat,
 log
}) {
 const date = new Date(Number(contactBookingDetails.date));
//  date.setDate(date.getDate() + 1); // Add one day
 const options = { year: 'numeric', month: 'long', day: 'numeric' };
 const formattedDate = date.toLocaleDateString('en-US', options);

 let meetingLink =
   googleCalendarEvent?.conferenceData?.entryPoints?.find(
     (entry) => entry.entryPointType === "video"
   )?.uri || googleCalendarEvent.htmlLink;

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
 
 log.info({
  function: "processMessageBack",
  message: 'SENDING CONFIRMATION BACK',
  data: { mobile_number, parts, receivers }
 })

 await h.whatsapp.sendAutoResponseMessage({
   mobile_number,
   parts,
   receivers,
   api_credentials: agencyBufferedCredentials,
   environment,
   log,
 });

 log.info({
  function: "processMessageBack",
  message: 'CONFIRMATION SENT SUCCESSFULLY',
 });

 const created_date = new Date();
 const msg_timestamp = Math.floor(created_date.getTime() / 1000);
 const whatsappCreateObj = {
   agency_fk: whatsappMessageTracker?.agency_fk,
   contact_fk: whatsappMessageTracker?.contact_fk,
   agency_user_fk: whatsappMessageTracker?.agency_user_fk,
   campaign_name: whatsappMessageTracker?.campaign_name,
   msg_body: `${responseBody}`,
   msg_type: 'frompave',
   msg_category: 'SERVICE',
   msg_origin: "automation",
   msg_info: latestChat?.msg_info,
   msg_timestamp: msg_timestamp,
   sender_number: wabaNumber,
   sender_url: `${environment}://${wabaNumber}@`,
   receiver_number: `${contactNumber}`,
   receiver_url: `${environment}://${contactNumber}@whatsapp.com?name=name`
 };

 log.info({
  function: "processMessageBack",
  message: 'STORE APPOINTMENT DETAILS MESSAGE',
  data: {
    whatsappCreateObj
  }
 });

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
  // startDate.setUTCDate(startDate.getUTCDate() + 1);

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
 * runNewGoogleAppointmentTransaction - runs all the DB create and
 * update commands related to appointment creation
 * @param {{
 *  models: object,
 *  contact_id: string,
 *  client_detail_id: string, 
 *  contactObj: object,
 *  crmSetting: object,
 *  newGoogleEvent: object,
 *  contactBookingDetails: object,
 *  contactNumber: string,
 *  log: FastifyLogFn
 * }} opts
 * @returns {Promise<{
 *  appointment_booking_id: string,
 * }>}
 */
async function runNewGoogleAppointmentTransaction (opts = {}) {
  const appointmentBookingCtl = require('../../../controllers/appointmentBooking').makeController(opts.models);
  const clientDetailCtl = require('../../../controllers/clientDetail').makeController(opts.models);
  const contactCtl = require('../../../controllers/contact').makeContactController(opts.models);
  let contact_id = opts.contact_id;
  let client_detail_id = opts.client_detail_id;

  const transaction = await opts.models.sequelize.transaction();
  if (contact_id && opts?.contactObj?.email) {
    await contactCtl.update(
      contact_id,
      { email: opts.contactObj.email },
      { transaction }
    );
  }
  try {
    const appointmentBookingObj = {
      crm_settings_fk: opts.crmSetting.crm_settings_id,
      appointment_id: opts.newGoogleEvent.id,
      appointment_type: 'GCALENDAR',
      appointment_link: opts.newGoogleEvent.htmlLink,
      // initial_booking_message: '',
      // initial_message_cta: '',
      start_time: opts.startDateTime,
      end_time: opts.endDateTime,
      timezone: opts.timeZone
    };
    const appointment_booking_id = await appointmentBookingCtl.create(appointmentBookingObj, { transaction });
    const clientDetailObj = {
      crm_settings_fk: opts.crmSetting.crm_settings_id,
      contact_fk: contact_id,
      appointment_id: opts.newGoogleEvent.id,
      // client_id: null, // how to get client_id for google
      email: opts.contactBookingDetails.email,
      mobile_number: opts.contactNumber
    };

    if (client_detail_id) {
      await clientDetailCtl.update(client_detail_id, clientDetailObj, { transaction });
    } else {
      client_detail_id = await clientDetailCtl.create(clientDetailObj, { transaction });
    }
    opts.log.info({
      message: 'Google Calendar Event Created.',
      data: { contact_id, appointment_booking_id, client_detail_id, appointment_id: opts.newGoogleEvent.id }
    });
    await transaction.commit();
    return {
      appointment_booking_id,
    }
  } catch (err) {
    await transaction.rollback();
    Sentry.captureException(err);
    throw err;
  }
}

/**
 * runUpdateGoogleAppointmentTransaction - Database update related to appointment booking
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
 *  log: FastifyLogFn
 * }} opts
 * @returns {Promise<void>}
 */
async function runUpdateGoogleAppointmentTransaction(opts = {}) {
  const appointmentBookingCtl = require('../../../controllers/appointmentBooking').makeController(opts.models);
  const clientDetailCtl = require('../../../controllers/clientDetail').makeController(opts.models);
  const contactCtl = require('../../../controllers/contact').makeContactController(opts.models);

  let contact_id = opts.contact_id, appointment_booking_id = opts.appointment_booking_id, client_detail_id = opts.client_detail_id;
  const transaction = await opts.models.sequelize.transaction();
  if (contact_id && opts?.contactObj?.email) {
    await contactCtl.update(
      contact_id,
      { email: opts.contactObj.email },
      { transaction }
    );
  }
  try {
    const appointmentBookingObj = {
      crm_settings_fk: opts.crmSetting.crm_settings_id,
      appointment_id: opts.calendar_appointment_id,
      appointment_type: 'GCALENDAR',
      appointment_link: opts.updatedCalendarEvent.htmlLink,
      start_time: opts.startDateTime,
      end_time: opts.endDateTime,
      timezone: opts.timeZone
    };
    if (appointment_booking_id) {
      await appointmentBookingCtl.update(appointment_booking_id, appointmentBookingObj, { transaction });
    } else {
      appointment_booking_id = await appointmentBookingCtl.create(appointmentBookingObj, { transaction });
    }
    const clientDetailObj = {
      crm_settings_fk: opts.crmSetting.crm_settings_id,
      contact_fk: contact_id,
      appointment_id: opts.calendar_appointment_id,
      // client_id: null, // how to get client_id for google
      email: opts.contactBookingDetails.email,
      mobile_number: opts.contactNumber
    };
    if (client_detail_id) {
      await clientDetailCtl.update(client_detail_id, clientDetailCtl, { transaction });
    } else {
      client_detail_id = await clientDetailCtl.create(clientDetailObj, { transaction });
    }
    opts.log.info({
      message: 'Google Calendar Event Updated.',
      data: { contact_id, appointment_booking_id, client_detail_id, appointment_id: opts.calendar_appointment_id }
    });
    await transaction.commit();
    return {
      appointment_booking_id
    }
  } catch (err) {
    Sentry.captureException(err);
    opts.log.error({ err, error_string: String(err) });
    await transaction.rollback();
    throw err;
  }
}

/**
 * createCalendarEvent - calls google calendar api to create
 * calendar event
 * @param {{
 *  models: object,
 *  agency: object,
 *  encryptionKeys: object,
 *  access_info: JsonString,
 *  contactBookingDetails: object,
 *  whatsappFlow: object,
 *  contactNumber: string,
 *  log: FastifyLogFn
 * }} opts 
 * @returns {Promise<{
 *  newGoogleEvent: object,
 *  startDateTime: DateTime,
 *  endDateTime: DateTime,
 *  timeZone: string
 * }>}
 */
async function createCalendarEvent(opts = {}) {
  const googleCalendar = new GoogleCalendarHelper({
    encryption_iv: opts.encryptionKeys.encryption_iv,
    encryption_key: opts.encryptionKeys.encryption_key,
    google_calendar_client_id: opts.encryptionKeys.GOOGLE_CALENDAR_CLIENT_ID,
    google_calendar_client_secret: opts.encryptionKeys.GOOGLE_CALENDAR_CLIENT_SECRET,
    access_info: opts.access_info,
  });

  const meetingSchedule = processMeetingSchedule(opts.contactBookingDetails);

  opts.log.info({ meetingSchedule });

  const summary = opts?.eventName ? opts.eventName: "Meeting with Chaaat.io";
  let description = opts?.eventName ? opts.eventName : "Meeting with Chaaat.io";
  if (opts.contactBookingDetails?.email) {
    description = `${description} - ${opts.contactBookingDetails?.email}`;
  }
  if (opts.contactBookingDetails.user_details) {
    description += '\n' + opts.contactBookingDetails.user_details;
  }
  const startDateTime = meetingSchedule.startDate;
  const endDateTime = meetingSchedule.endDate;
  const timeZone = mobileToTimeZone(opts.contactNumber);

  const attendees = await whatsappFlowProcessorUtils.processAttendees({
    models: opts.models,
    agency: opts.agency,
    contactBookingDetails: opts.contactBookingDetails,
  });
  const calendarDetails = {
    summary,
    description,
    startDateTime,
    endDateTime, 
    timeZone,
    attendees,
  };

  opts.log.info({ calendarDetails });

  const newGoogleEvent = await googleCalendar.createCalendarEvent(calendarDetails);

  opts.log.info({ newGoogleEvent });

  return {
    newGoogleEvent,
    startDateTime,
    endDateTime,
    timeZone,
  };
}

/**
 * updateCalendarEvent - calls crm api to update calendar event
 * @param {{
 *  models: object,
 *  agency: object,
 *  encryptionKeys: object,
 *  access_info: JsonString,
 *  calendar_appointment_id: string,
 *  whatsappFlow: object,
 *  contactBookingDetails: object,
 *  contactNumber: string,
 *  log: FastifyLogFn,
 *  eventName: string
 * }} opts 
 * @returns {Promise<{
 *  updatedCalendarEvent: object,
 *  startDateTime: DateTime,
 *  endDateTime: DateTime,
 *  timeZone: string
 * }>}
 */
async function updateCalendarEvent(opts = {}) {
  const googleCalendar = new GoogleCalendarHelper({
    encryption_iv: opts.encryptionKeys.encryption_iv,
    encryption_key: opts.encryptionKeys.encryption_key,
    google_calendar_client_id: opts.encryptionKeys.GOOGLE_CALENDAR_CLIENT_ID,
    google_calendar_client_secret: opts.encryptionKeys.GOOGLE_CALENDAR_CLIENT_SECRET,
    access_info: opts.access_info,
  });

  const meetingSchedule = processMeetingSchedule(opts.contactBookingDetails);

  opts.log.info({ meetingSchedule });

  const summary = opts?.eventName ? opts.eventName: "Meeting with Chaaat.io";
  let description = opts?.eventName ? opts.eventName : "Meeting with Chaaat.io";
  if (opts.contactBookingDetails?.email) {
    description = `${description} - ${opts.contactBookingDetails?.email}`;
  }
  if (opts.contactBookingDetails?.user_details) {
    description += '\n' + opts.contactBookingDetails.user_details;
  }

  const startDateTime = meetingSchedule.startDate;
  const endDateTime = meetingSchedule.endDate;
  const timeZone = mobileToTimeZone(opts.contactNumber);
  const attendees = await whatsappFlowProcessorUtils.processAttendees({
    models: opts.models,
    agency: opts.agency,
    contactBookingDetails: opts.contactBookingDetails,
  });

  const calendarDetails = {
    eventId: opts.calendar_appointment_id,
    summary,
    description,
    startDateTime,
    endDateTime,
    timeZone,
    attendees,
  };

  opts.log.info({ calendarDetails });

  const updatedCalendarEvent = await googleCalendar.updateCalendarEvent(calendarDetails);
  return {
    updatedCalendarEvent,
    startDateTime,
    endDateTime,
    timeZone,
  };
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
 *  eventName: string
 * }} opts 
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
  whatsappMessageTracker,
  latestChat,
  eventName
}) {
  const clientDetailCtl = require('../../../controllers/clientDetail').makeController(models);
  const agencyCtl = require('../../../controllers/agency').makeAgencyController(models);
  const contactCtl = require('../../../controllers/contact').makeContactController(models);
  const agency = await agencyCtl.findOne({ agency_id: crmSetting.agency_fk });

  try {
    if (!agency) {
      log.warn({ message: 'No Agency Found' });
      return;
    }
  
    const agencyOauth = await whatsappFlowProcessorUtils.getAgencyOauth({
      models,
      agency_id:
      agency.agency_id,
      source: 'GCALENDAR',
      log
    });
  
    const {
      newGoogleEvent,
      startDateTime,
      endDateTime,
      timeZone
    } = await createCalendarEvent({
      models,
      agency,
      encryptionKeys,
      access_info: agencyOauth.access_info,
      contactBookingDetails,
      whatsappFlow,
      contactNumber,
      eventName,
      log
    });
  
    const full_name = contactBookingDetails?.full_name || '';
  
    const [fname, lname] = full_name.split(' ');
  
    const contactObj = {
      status: 'active',
      first_name: fname,
      last_name: lname,
      email: contactBookingDetails.email,
      mobile_number: contactNumber,
      agency_fk: agency.agency_id,
      agency_user_fk: agency.default_outsider_contact_owner,
    }
    
    let contact_id;
    let client_detail_id;
    const contactQ = {
      mobile_number: contactObj.mobile_number,
      agency_fk: contactObj.agency_fk
    };
  
    // if (contactObj.email) contactQ.email = contactObj.email;
  
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
        appointment_id: newGoogleEvent.id
      });
      client_detail_id = hasClientDetail?.client_detail_id;
    }
  
    const createdAppoinment = await runNewGoogleAppointmentTransaction({
      models,
      contact_id,
      client_detail_id,
      contactObj,
      crmSetting,
      newGoogleEvent,
      startDateTime,
      endDateTime,
      timeZone,
      contactBookingDetails,
      contactNumber,
      log
    });
  
    await processMessageBack({
      contactBookingDetails,
      googleCalendarEvent: newGoogleEvent,
      agency,
      isForUpdate: false,
      models,
      contactNumber,
      wabaNumber,
      agencyBufferedCredentials,
      contact_id,
      whatsappMessageTracker,
      latestChat,
      log
    });
  
    return {
      contactBookingDetails,
      contact_id,
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
 *  calendar_appointment_id: string
 *  whatsappMessageTracker: object,
 *  latestChat: object,
 *  eventName: string,
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
  latestChat,
  whatsappMessageTracker,
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

    const agencyOauth = await whatsappFlowProcessorUtils.getAgencyOauth({ models, agency_id: agency.agency_id, source: 'GCALENDAR', log });
    const { updatedCalendarEvent, startDateTime, endDateTime, timeZone } = await updateCalendarEvent({
      models,
      eventName,
      agency,
      encryptionKeys,
      access_info: agencyOauth.access_info,
      calendar_appointment_id,
      whatsappFlow,
      contactBookingDetails,
      contactNumber,
      log
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
    const contactQ = { mobile_number: contactObj.mobile_number, agency_fk: contactObj.agency_fk };
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

    await runUpdateGoogleAppointmentTransaction({
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
      log
    });

    await processMessageBack({
      contactBookingDetails,
      googleCalendarEvent: updatedCalendarEvent,
      agency,
      isForUpdate: true,
      models,
      contactNumber,
      wabaNumber,
      agencyBufferedCredentials,
      contactRecord,
      whatsappMessageTracker,
      latestChat,
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
