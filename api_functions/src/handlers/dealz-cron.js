const Sentry = require('@sentry/serverless');
const h = require('../helpers');
if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const DealzController = require('../controllers/dealz');
const StripeController = require('../controllers/stripe');

/**
 * Description
 * Lambda function to update dealz weight
 * @async
 * @function
 * @name updateWeight
 * @kind variable
 * @param {object} event?
 * @returns {Promise<{ success: boolean; function: string; error?: undefined; } | { success: boolean; function: string; error: any; }>}
 */
const updateWeight = async (event = {}) => {
  const funcName = 'AUTOMATE_DEALZ_WEIGHT_UPDATE';
  try {
    console.info(`START ${funcName}`, event);
    console.info(JSON.stringify(event));

    const dealz = new DealzController();
    await dealz.processDealzWeightUpdate();

    console.info(`END ${funcName}`, event);
    return { success: true, function: funcName };
  } catch (error) {
    Sentry.captureException(error);
    console.error(`Error in ${funcName}:`, error);
    return { success: false, function: funcName, error };
  }
};

/**
 * Description
 * Lambda function for handling Dealz stripe webhook payload
 * @async
 * @function
 * @name handleDealzStripeWebhook
 * @kind variable
 * @param {object} webhookEvent?
 * @returns {Promise<{ statusCode: number; body: string; success?: undefined; function?: undefined; error?: undefined; } | { success: boolean; function: string; error: any; statusCode?: undefined; body?: undefined; }>}
 */
const handleDealzStripeWebhook = async (webhookEvent = {}) => {
  const funcName = 'HANDLE_DEALZ_STRIPE_WEBHOOK';

  try {
    const parsedBody = JSON.parse(webhookEvent.body);
    webhookEvent.body = parsedBody;
    const event = h.data.sanitizeRequest(webhookEvent);
    const body = event.body;
    console.info(`START ${funcName}`);
    console.info('ENV: ', process.env.NODE_ENV);

    // start the handling process
    const dealzStripe = new StripeController();
    await dealzStripe.processWebhookPayload({ type: body.type, event: body });

    console.info(`END ${funcName}`, event);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 200, info: 'OK' }),
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error(`Error in ${funcName}:`, error);
    return { success: false, function: funcName, error };
  }
};

exports.updateWeight = Sentry.AWSLambda.wrapHandler(updateWeight);
exports.handleDealzStripeWebhook = Sentry.AWSLambda.wrapHandler(
  handleDealzStripeWebhook,
);
