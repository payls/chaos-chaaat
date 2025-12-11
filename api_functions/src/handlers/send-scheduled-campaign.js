const models = require('../models');
const moment = require('moment-timezone');
// const amqlib = require('amqp-connection-manager');
const config = require('../configs/config')(
  process.env.NODE_ENV || 'development',
);
const general = require('../helpers/general');
const axios = require('axios');
// const chalk = require('chalk');

//from campaign sender
// const conn = config.amq.connection;
// const connectionURI =
//   conn.uri ||
//   `amqp://${conn.username}:${conn.password}@${conn.host}:${conn.port}`;

// from sf-cron
const RabbitMQ = require('../helpers/rabbitmq');
const Promise = require('bluebird');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const sendCampaign = async (event = {}) => {
  const functionName = 'SEND_SCHEDULED_CAMPAIGN';
  try {
    console.info('START SEND_SCHEDULED_CAMPAIGN', event);
    console.info(JSON.stringify(event));

    console.info('ENV: ', process.env.NODE_ENV);

    const currentDateTime = moment.utc();

    const schedules = await models.campaign_schedule.findAll({
      where: {
        platform: 'whatsapp',
        status: 1,
        triggered: 0,
      },
    });

    await Promise.mapSeries(schedules, async (schedule) => {
      schedule = schedule && schedule.toJSON ? schedule.toJSON() : schedule;

      const payload = schedule.campaign_source;

      const outputFormat = 'YYYY-MM-DD HH:mm';
      const timeZoneTime = moment
        .tz(currentDateTime, schedule.time_zone)
        .format(outputFormat);
      const scheduledTime = moment(schedule.send_date).format(
        'YYYY-MM-DD HH:mm',
      );

      console.info(
        'Checking scheduled date and current date',
        scheduledTime,
        timeZoneTime,
      );

      if (general.cmpStr(timeZoneTime, scheduledTime)) {
        const rabbitmq = new RabbitMQ({ config });
        await rabbitmq.init();

        // const queue = config.amq.keys.paveBulkCreatePropoposalQueue;
        // const routingKey = 'BATCH';

        try {
          let triggered = false;
          const event_type = schedule.slack_notification;
          const agency = await models.agency.findOne({
            where: {
              agency_id: schedule.agency_fk,
            },
          });
          if (general.cmpStr(event_type, 'campaign')) {
            const env_type = process.env.NODE_ENV;
            const env_details = !general.cmpStr(
              process.env.NODE_ENV,
              'production',
            )
              ? `[${env_type.toUpperCase()}] `
              : '';
            const data = JSON.stringify({
              text: `${env_details}<!here> Automated WhatsApp campaign for ${schedule.campaign_name} with ${schedule.recipient_count} recipient(s) for ${agency.agency_name} will start now. Thank you.`,
            });

            const config = {
              method: 'post',
              url: 'https://hooks.slack.com/services/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',
              headers: {
                'Content-Type': 'application/json',
              },
              data: data,
            };

            await axios(config)
              // eslint-disable-next-line promise/always-return
              .then(function (response) {
                console.info(JSON.stringify(response.data));
              })
              .catch(function (error) {
                Sentry.captureException(error);
                console.info(error);
              });

            triggered = await rabbitmq.pubSendCampaign(payload);
          }
          if (triggered) {
            await models.campaign_schedule.update(
              {
                triggered: 1,
              },
              {
                where: {
                  campaign_schedule_id: schedule.campaign_schedule_id,
                },
              },
            );
          }
        } catch (err) {
          Sentry.captureException(err);
          console.info('Error:', err);
        }
      }
    });

    console.info('END SEND_SCHEDULED_CAMPAIGN', event);
    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.error({
      function: functionName,
      err,
    });
    return { success: false, function: functionName, error: err };
  }
};

exports.sendCampaign = Sentry.AWSLambda.wrapHandler(sendCampaign);
