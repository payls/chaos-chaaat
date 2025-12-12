const Sentry = require('@sentry/node');
const { v1: uuidv4 } = require('uuid');
const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const models = require('../../../../models');

/**
 * _handleResponse
 * @param {{
 *  req: object,
 *  res: object,
 *  whatsapp_flow_id: string
 * }} param0 
 */
function _handleResponse ({ req, res, appointment_booking_reminder}) {
  h.api.createResponse(
    req,
    res,
    200,
    { appointment_booking_reminder },
    '1-appointment-booking-reminder-1620396461',
    portal,
  );
}

/**
 * _handleErrorResponse
 * @param {{
 *  req: object,
 *  res: object,
 *  err: object,
 *  log: object
 * }} param0 
 */
function _handleErrorResponse ({ req, res, log, err }) {
  Sentry.captureException(err);
  log.error({
    error: err,
    errorString: String(err),
  });
  if (err.status) {
    return res.status(err.status).send({
      message: err?.message || 'Please check input and try again'
    });
  }

  h.api.createResponse(
    req,
    res,
    500,
    { err },
    '2-appointment-booking-reminder-1620396471',
    {
      portal,
    },
  );
}

/**
 * _calculateReminderTime
 * @param {{
 * reqBody: object,
 * startTime: time,
 * endTime: time
 * }} param0
*/
function _calculateReminderTime(reqBody, startTime, endTime) {
  startTime = new Date(startTime);
  endTime = new Date(endTime);
  let reminderTime;
  if (reqBody.reminder_type.toLowerCase() == 'before' && reqBody.time_unit.toLowerCase() == 'hour') {
    startTime.setUTCHours(startTime.getUTCHours() - Number(reqBody.time_unit_number_val));
    reminderTime = startTime.toISOString();
  }
  if (reqBody.reminder_type.toLowerCase() == 'before' && reqBody.time_unit.toLowerCase() == 'day') {
    const milliSecondOfDay = 86400000*Number(reqBody.time_unit_number_val);
    startTime.setTime(startTime.getTime() - milliSecondOfDay);
    reminderTime = startTime.toISOString();
  }
  if (reqBody.reminder_type.toLowerCase() == 'after' && reqBody.time_unit.toLowerCase() == 'hour') {
    endTime.setUTCHours(endTime.getUTCHours() + Number(reqBody.time_unit_number_val));
    reminderTime = endTime.toISOString();
  }
  if (reqBody.reminder_type.toLowerCase() == 'after' && reqBody.time_unit.toLowerCase() == 'day') {
    const milliSecondOfDay = 86400000*Number(reqBody.time_unit_number_val);
    endTime.setTime(endTime.getTime() + milliSecondOfDay);
    reminderTime = endTime.toISOString();
  }
  return reminderTime;
}

/**
 * appointmentBookingReminder handler - accepts appointment reminder details in body
 * this will call UIB api to create a appointment reminder and save details to the database
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function handler (req, res) {

  const log = req.log.child({
    route: '/v1/staff/appointment-booking/reminder',
    method: 'post',
    sub_id: uuidv4()
  });

  log.info({
    payload: req.body,
  });

  try {
    const appointmentBooking = await models.appointment_booking.findOne({
      where: {
        appointment_booking_id: req.body.appointment_booking_fk,
      }
    });
    if (appointmentBooking) {
      const reminderTime = _calculateReminderTime(req.body, appointmentBooking.start_time, appointmentBooking.end_time)
      const appointment_reminder_id = h.general.generateId();
      req.body['appointment_reminder_id'] = appointment_reminder_id;
      req.body['reminder_time'] = reminderTime;
      await models.appointment_reminder.create(req.body);
      _handleResponse({ req, res, appointment_reminder_id });
    } else {
      _handleErrorResponse({ req, res, err: "Appointment booking does not exist", log });
    }
  } catch (err) {
    _handleErrorResponse({ req, res, err, log });
  }
}

/**
 * preValidation handler - validates if the user is loggedIn and is a staff / admin
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function preValidation (req, res) {
  await userMiddleware.isLoggedIn(req, res);
  await userMiddleware.hasAccessToStaffPortal(req, res);
}

const schema = {
  body: {
    type: 'object',
    required: ['reminder_type', 'time_unit', 'time_unit_number_val', 'status', 'appointment_booking_fk', 'agency_user_fk'],
    properties: {
      reminder_type: { type: 'string' },
      time_unit: { type: 'string' },
      crm_type: { type: 'string' },
      time_unit_number_val: { type: 'string' },
      status: { type: 'string' },
      appointment_booking_fk: { type: 'string' },
      agency_user_fk: { type: 'string' }
    }
  }
};

module.exports.handler = handler;
module.exports.preValidation = preValidation;
module.exports.schema = schema;
