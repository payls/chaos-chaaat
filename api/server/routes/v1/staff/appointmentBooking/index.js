const appointmentBookingReminderCreate = require('./appointmentBookingReminderCreate');

module.exports = (fastify, opts, next) => {

    /**
     * @api {post} /v1/staff/appointment-booking/reminder Staff create appointment reminder
     * @apiName StaffAppointmentBookingReminderCreate
     * @apiVersion 1.0.0
     * @apiGroup Staff Contact
     * @apiUse ServerError
     *
     * @apiDefine ServerSuccess
     * @apiSuccess {string} status Response status.
     * @apiSuccess {string} message Message to display to user.
     * @apiSuccess {string} message_code Message code of message for developer use.
     * @apiSuccessExample {json} Success 200 Response:
     */
    fastify.route({
      method: 'POST',
      url: '/staff/appointment-booking/reminder',
      // schema: appointmentBookingReminderCreate.schema,
      // preValidation: appointmentBookingReminderCreate.preValidation,
      handler: appointmentBookingReminderCreate.handler,
    });
  
    return next();
  };