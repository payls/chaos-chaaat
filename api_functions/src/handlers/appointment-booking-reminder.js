const models = require('../models');
const moment = require('moment-timezone');
// const amqlib = require('amqp-connection-manager');
const constant = require('../constants/constant.json');
const config = require('../configs/config')(
  process.env.NODE_ENV || 'development',
);

const { Op } = require('sequelize');

const RabbitMQ = require('../helpers/rabbitmq');
const Promise = require('bluebird');

const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

/**
 * Sends appointment booking reminders by querying the database for reminders
 * within the last 5 minutes and the next 5 minutes and then publishing them
 * to a RabbitMQ queue.
 *
 * @async
 * @function sendAppointmentBookingReminder
 * @param {Object} [event={}] - The event triggering the function, typically passed in AWS Lambda functions.
 * @returns {Promise<Object>} - A result object indicating the success or failure of the operation.
 * @property {boolean} success - True if reminders were successfully processed, otherwise false.
 * @property {string} function - The name of the function.
 * @property {Error} [error] - The error object in case of a failure.
 */
async function sendReminderForProcessing({ reminder, rabbitmq }) {
  try {
    const payload = {
      consumerType: constant.AMQ.CONSUMER_TYPES.APPOINTMENT_BOOKING_REMINDER,
      data: {
        reminder,
      },
    };
    await rabbitmq.pubAppointmentBookingReminder(payload);
  } catch (err) {
    // ignore error
    console.warn('SEND_APPOINTMENT_BOOKING_REMINDER_ERR', err);
  }
}

/**
 * Publishes a reminder for processing to the RabbitMQ queue.
 *
 * @async
 * @function sendReminderForProcessing
 * @param {Object} param - The parameters object.
 * @param {Object} param.reminder - The reminder data to be sent.
 * @param {RabbitMQ} param.rabbitmq - The RabbitMQ instance to use for publishing.
 * @returns {Promise<void>} - A promise that resolves when the reminder has been sent.
 */
const sendAppointmentBookingReminder = async (event = {}) => {
  const functionName = 'SEND_APPOINTMENT_BOOKING_REMINDER';
  try {
    const rabbitmq = new RabbitMQ({ config });
    await rabbitmq.init();
    console.info(functionName + '_START', event);
    const currentTime = moment();
    const fiveMinutesAgo = moment(currentTime).subtract(5, 'minutes').toDate();
    console.info(
      JSON.stringify({
        fiveMinutesAgo,
        currentTime,
      }),
    );
    const reminders = await models.appointment_reminder.findAll({
      where: {
        reminder_time: {
          [Op.between]: [fiveMinutesAgo, currentTime],
        },
        status: 'in-progress',
      },
      include: [
        {
          model: models.appointment_booking,
          required: false,
        },
        {
          model: models.agency_user,
          required: false,
        },
        {
          model: models.automation_rule_template,
          required: true,
        },
        {
          model: models.contact,
          required: true,
        },
      ],
    });

    console.info(
      JSON.stringify({
        function: functionName,
        reminders: reminders.map((r) => r.toJSON()),
      }),
    );

    const processReminders = reminders.map((r) =>
      sendReminderForProcessing({
        reminder: r.toJSON(),
        rabbitmq,
      }),
    );

    await Promise.all(processReminders);

    return { success: true, function: functionName };
  } catch (err) {
    console.error({
      function: functionName,
      err,
    });
    return { success: false, function: functionName, error: err };
  }
};

exports.sendAppointmentBookingReminder = Sentry.AWSLambda.wrapHandler(
  sendAppointmentBookingReminder,
);
