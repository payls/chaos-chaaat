const models = require('../models');
const emailHelper = require('../helpers/email');
const constant = require('../constants/constant.json');
const moment = require('moment');
const { Op } = require('sequelize');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

function getUniqueEmailsToSend(quedEmailNotifs) {
  return quedEmailNotifs.reduce((prev, { dataValues }) => {
    let currentPayload = dataValues.payload;
    if (typeof currentPayload === 'string') {
      try {
        currentPayload = JSON.parse(currentPayload);
      } catch (e) {
        Sentry.captureException(e);
        // ignore error;
      }
    }
    const {
      agent_email,
      subject_message,
      body_message,
      contact_id,
      agency_user_id,
    } = currentPayload;

    if (!agent_email) return prev;

    // push if unique
    const hasDup = prev.find((emailQ) => {
      return (
        emailQ.contact_id === contact_id &&
        emailQ.agency_user_id === agency_user_id
      );
    });
    if (!hasDup)
      prev.push({
        agent_email,
        subject_message,
        body_message,
        contact_id,
        agency_user_id,
      });

    return prev;
  }, []);
}

async function getEmailQueues(date2MinsAgo) {
  const type = constant.CRON_JOB.TYPES.CONTACT_ASSIGNMENT_NOTIF;
  const quedEmailNotifs = await models.cron_job.findAll({
    where: {
      type,
      created_date: {
        [Op.lte]: date2MinsAgo,
      },
    },
  });

  return quedEmailNotifs;
}

async function deleteQueues(quedEmailNotifs) {
  for (const queue of quedEmailNotifs) {
    console.info('CRON_ID:', queue.cron_job_id);
    await models.cron_job.destroy({
      where: { cron_job_id: queue.cron_job_id },
    });
  }
}

async function sendEmails(emailQueue = []) {
  for (const email of emailQueue) {
    const { agent_email, subject_message, body_message } = email;
    await emailHelper.sendEmail(
      'Chaaat <no-reply@chaaat.io>',
      agent_email,
      subject_message,
      body_message,
    );
  }
}

const sendNotif = async (event = {}) => {
  const functionName = 'CONTACT_ASSIGNMENT_SEND_NOTIF';
  try {
    console.info('CONTACT_ASSIGNMENT_SEND_NOTIF_START', event);
    console.info(JSON.stringify(event));

    const date2MinsAgo = moment().subtract(2, 'minutes').toDate();
    const allEmailQueue = await getEmailQueues(date2MinsAgo);

    const emailQueue = getUniqueEmailsToSend(allEmailQueue);
    console.info(
      'CONTACT_ASSIGNMENT_SEND_NOTIF_SENDING_EMAILS',
      JSON.stringify(emailQueue),
    );
    await sendEmails(emailQueue);
    await deleteQueues(allEmailQueue);
    console.info('CONTACT_ASSIGNMENT_SEND_NOTIF_END', event);
    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.error({
      function: functionName,
      err,
    });
    return { success: false, function: functionName };
  }
};

exports.sendNotif = Sentry.AWSLambda.wrapHandler(sendNotif);
