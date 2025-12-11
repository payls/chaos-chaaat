const axios = require('axios');
const config = require('../configs/config')(
  process.env.NODE_ENV || 'development',
);
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const runAutomationResponseCheck = async (event = {}) => {
  const functionName = 'HUBSPOT_RESPONSE_CHECK_RUN_AUTOMATION';
  try {
    console.info('START HUBSPOT_RESPONSE_CHECK_RUN_AUTOMATION', event);
    console.info(JSON.stringify(event));
    console.info('ENV: ', process.env.NODE_ENV);
    const trigger_config = {
      method: 'get',
      url: `${config.apiUrl}/v1/staff/automation/run-hubspot-response-checker`,
      headers: {
        'Content-Type': 'application/json',
        Origin: config.corsSettings.api.whitelistOrigins[2],
      },
    };

    await axios(trigger_config)
      // eslint-disable-next-line promise/always-return
      .then(function (response) {
        console.info(JSON.stringify(response.data));
      })
      .catch(function (error) {
        Sentry.captureException(error);
        console.info(error);
      });

    console.info('END HUBSPOT_RESPONSE_CHECK_RUN_AUTOMATION', event);
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

exports.runAutomationResponseCheck = Sentry.AWSLambda.wrapHandler(
  runAutomationResponseCheck,
);
