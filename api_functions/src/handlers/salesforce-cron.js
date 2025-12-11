const models = require('../models');
const moment = require('moment-timezone');
const constant = require('../constants/constant.json');
const config = require('../configs/config')(
  process.env.NODE_ENV || 'development',
);
const Promise = require('bluebird');
const RabbitMQ = require('../helpers/rabbitmq');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const triggerCron = async (event = {}) => {
  const functionName = 'SF_CRON_TRIGGER';
  try {
    console.info(functionName + '_START', event);
    console.info(JSON.stringify(event));
    const rabbitmq = new RabbitMQ({ config });
    await rabbitmq.init();

    const oneMinuteAgo = moment().subtract(2, 'minute');
    const twoMinutesAgo = moment().subtract(2, 'minute');

    const agencies = await models.agency.findAll({
      where: {},
      include: [
        {
          model: models.agency_oauth,
          where: {
            status: 'active',
            source: 'SALESFORCE',
          },
          required: true,
        },
      ],
    });

    console.info(JSON.stringify(agencies));

    for (const a of agencies) {
      console.info('=====================');
      console.info(a.agency_id);
      console.info('=====================');
    }
    await Promise.mapSeries(agencies, async (agency) => {
      agency = agency && agency.toJSON ? agency.toJSON() : agency;
      const agency_id = agency.agency_id;

      const payload = {
        consumerType: constant.AMQ.CONSUMER_TYPES.SF_CRON_PROCESSOR,
        data: {
          cronOneMinuteAgo: oneMinuteAgo.toISOString(),
          cronTwoMinutesAgo: twoMinutesAgo.toISOString(),
          agency_id,
        },
      };

      await rabbitmq.pubSfCronTrigger(payload);
    });

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

exports.triggerCron = Sentry.AWSLambda.wrapHandler(triggerCron);
