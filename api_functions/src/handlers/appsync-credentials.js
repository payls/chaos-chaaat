const axios = require('axios');
const Sentry = require('@sentry/serverless');

const config = require('../configs/config')(
  process.env.NODE_ENV || 'development',
);

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const updateCredentials = async (event = {}) => {
  const functionName = 'APPSYNCE CREDENTIALS GENERATION';
  try {
    console.info('START APPSYNC_CREDENTIALS_GENERATION', event);
    console.info(JSON.stringify(event));
    console.info('ENV: ', process.env.NODE_ENV);
    const trigger_config = {
      method: 'get',
      url: `${config.apiUrl}/v1/appsync/new-key`,
      headers: {
        'Content-Type': 'application/json',
        Origin: config.corsSettings.api.whitelistOrigins[2],
      },
      data: {},
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

    console.info('END APPSYNC_CREDENTIALS_GENERATION', event);
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

exports.updateCredentials = Sentry.AWSLambda.wrapHandler(updateCredentials);
