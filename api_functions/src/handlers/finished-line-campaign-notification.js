const models = require('../models');
const axios = require('axios');

const Promise = require('bluebird');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const sendNotification = async (event = {}) => {
  const functionName = 'SEND_FINISHED_LINE_CAMPIGN_NOTIFICATION';
  try {
    console.info('START SEND_FINISHED_LINE_CAMPIGN_NOTIFICATION', event);
    console.info(JSON.stringify(event));

    console.info('ENV: ', process.env.NODE_ENV);

    const runningSchedules = await models.campaign_schedule.findAll({
      where: {
        slack_notification: 'campaign',
        status: 1,
        triggered: 1,
        platform: 'line',
      },
    });

    await Promise.mapSeries(runningSchedules, async (schedule) => {
      const agency = await models.agency.findOne({
        where: {
          agency_id: schedule.agency_fk,
        },
      });
      const processedMainTrackerCount = await models.line_message_tracker.count(
        {
          where: {
            tracker_ref_name: schedule.tracker_ref_name,
            tracker_type: 'main',
          },
        },
      );

      const processedSubTrackerCount = await models.line_message_tracker.count({
        where: {
          tracker_ref_name: schedule.tracker_ref_name,
          tracker_type: 'sub',
        },
      });

      if (
        processedMainTrackerCount >= schedule.recipient_count ||
        processedSubTrackerCount >= schedule.recipient_count
      ) {
        await models.campaign_schedule.update(
          {
            status: 4,
          },
          {
            where: {
              campaign_schedule_id: schedule.campaign_schedule_id,
            },
          },
        );

        const data = JSON.stringify({
          text: `<!here> ${schedule.campaign_name} sending with ${schedule.recipient_count} recipient(s) for ${agency.agency_name} is finished. Thank you.`,
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
      }
    });

    console.info('END SEND_FINISHED_LINE_CAMPIGN_NOTIFICATION', event);
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

exports.sendNotification = Sentry.AWSLambda.wrapHandler(sendNotification);
