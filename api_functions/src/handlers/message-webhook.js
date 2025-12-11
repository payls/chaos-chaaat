const Sentry = require('@sentry/serverless');
const constant = require('../constants/constant.json');
const h = require('../helpers');
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
 * Function for receiving message payload for whatsapp
 * @async
 * @property
 * @name receivePayload
 * @param {object} event api request data
 * @returns {Promise<{ statusCode: number; body: string; }>}
 *  returns status 200 when success, including info message
 */
exports.receivePayload = async (webhookEvent = {}) => {
  const functionName = 'RECEIVE MESSAGE PAYLOAD';
  try {
    const parsedBody = JSON.parse(webhookEvent.body);
    webhookEvent.body = parsedBody;
    const event = h.data.sanitizeRequest(webhookEvent);
    console.info(`START ${functionName}`, event);
    console.info(JSON.stringify(event));
    console.info('ENV: ', process.env.NODE_ENV);

    console.log('SANITIZED', event);

    const headers = event.headers;
    const headerXComponentSecret = headers['x-component-secret']
      ? headers['x-component-secret']
      : headers['X-Component-Secret'];
    const headerOrigin = headers['origin']
      ? headers['origin']
      : headers['Origin'];
    console.info(headerOrigin, process.env.PARTNER_PORTAL_URL);
    console.info(
      headerXComponentSecret,
      process.env.WEBHOOK_X_COMPONENT_SECRET,
    );
    let body = event.body;
    if (
      !h.cmpStr(process.env.NODE_ENV, 'development') &&
      (h.isEmpty(headerOrigin) ||
        h.isEmpty(headerXComponentSecret) ||
        !h.cmpStr(headerOrigin, process.env.PARTNER_PORTAL_URL) ||
        !h.cmpStr(
          headerXComponentSecret,
          process.env.WEBHOOK_X_COMPONENT_SECRET,
        ))
    ) {
      console.error('REQUEST HEADER ERROR: ', event);
      throw new Error(
        JSON.stringify({ message: 'INVALID HEADER ERROR', data: event }),
      );
    }

    const rabbitmq = new RabbitMQ({ config });
    await rabbitmq.init();

    const contentType = body.data.parts[0].contentType;
    console.info({
      message: 'content type',
      data: body.data.parts[0].contentType,
    });

    // check if payload data is for status or message
    if (h.cmpStr(contentType, 'status')) {
      await rabbitmq.pubWhatsappStatusWebhookPayloadProcess({
        data: body,
        consumerType:
          constant.AMQ.CONSUMER_TYPES.WA_PROCESS_STATUS_WEBHOOK_PAYLOAD,
      });
    } else {
      await rabbitmq.pubWhatsappWebhookPayloadProcess({
        data: body,
        consumerType: constant.AMQ.CONSUMER_TYPES.WA_PROCESS_WEBHOOK_PAYLOAD,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 200, info: 'OK' }),
    };
  } catch (err) {
    Sentry.captureException(err);
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
