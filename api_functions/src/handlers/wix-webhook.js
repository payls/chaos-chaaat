const Sentry = require('@sentry/serverless');
const constant = require('../constants/constant.json');
const config = require('../configs/config')(
  process.env.NODE_ENV || 'development',
);
const RabbitMQ = require('../helpers/rabbitmq');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

/**
 * Description
 * Function for receiving event payload for wix
 * @async
 * @property
 * @name receivePayload
 * @param {object} event api request data
 * @returns {Promise<{ statusCode: number; body: string; }>}
 *  returns status 200 when success, including info message
 */
exports.receivePayload = async (webhookEvent = {}) => {
  const functionName = 'RECEIVE WIX PAYLOAD';
  try {
    const rabbitmq = new RabbitMQ({ config });
    await rabbitmq.init();

    const body = {
      action: 'wix_webhook_receive',
      body: webhookEvent.body,
    };

    await rabbitmq.wixWebhookPayloadProcess({
      data: body,
      consumerType: constant.AMQ.CONSUMER_TYPES.WIX_PROCESS_WEBHOOK_PAYLOAD,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 200, info: 'OK' }),
    };
  } catch (err) {
    Sentry.captureException(err);
    console.log(JSON.stringify(err));
    console.error({
      function: functionName,
      err,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 500, info: err }),
    };
  }
};
