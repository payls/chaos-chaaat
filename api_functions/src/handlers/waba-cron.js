const models = require('../models');
const general = require('../helpers/general');
const axios = require('axios');
const Promise = require('bluebird');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const getWABAQualityAndStatus = async (event = {}) => {
  const functionName = 'GET_WABA_QUALITY_AND_STATUS';
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    console.info('START GET_WABA_QUALITY_AND_STATUS', event);
    console.info(JSON.stringify(event));

    console.info('ENV: ', process.env.NODE_ENV);

    const waba_agencies = await models.agency_whatsapp_config.findAll();

    await Promise.mapSeries(waba_agencies, async (waba) => {
      console.info('WABA_DETAILS_SYNC_EXECUTE_WABA');
      console.info('Running WhatsApp Status Sync for', waba);
      const waba_config_id = waba.agency_whatsapp_config_id;
      const waba_id = waba.agency_waba_id;
      const api_key = waba.agency_waba_template_token;
      const api_secret = waba.agency_waba_template_secret;

      const credentials = api_key + ':' + api_secret;
      const agencyBufferedCredentials = Buffer.from(
        credentials,
        'utf8',
      ).toString('base64');

      const wabaStatusConfig = {
        method: 'get',
        url: `https://template.unificationengine.com/waba/details?access_token=${waba_id}`,
        headers: {
          Authorization: `Basic ${agencyBufferedCredentials}`,
          'Content-Type': 'application/json',
        },
      };
      console.info('Request Config:', wabaStatusConfig);
      const wabaStatusResponse = await axios(wabaStatusConfig)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          Sentry.captureException(error);
          console.error(
            'API Call Error:',
            error.response ? error.response.data : error.message,
          );
          throw error; // Rethrow to be caught by outer catch block
        });
      console.info('WABA Status Response:', wabaStatusResponse);
      if (
        general.cmpInt(wabaStatusResponse.status, 200) &&
        general.notEmpty(wabaStatusResponse.info)
      ) {
        await processWABADetailsUpdate(
          waba_id,
          waba_config_id,
          wabaStatusResponse,
        );
      }
      console.info('Will run next WAB after a minute');
      await delay(60000);
    });

    console.info('END GET_WABA_QUALITY_AND_STATUS', event);
    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.error({
      function: functionName,
      err: err.response ? err.response.data : err.message,
    });
    return { success: false, function: functionName, error: err };
  }
};

/**
 * Description
 * Function to update waba details and status based on UIB response
 * @async
 * @function
 * @name processWABADetailsUpdate
 * @kind function
 * @param {string} to_process_waba_id waba id of number to process
 * @param {string} waba_config_id waba config id in database
 * @param {object} wabaStatusResponse waba details api response
 */
async function processWABADetailsUpdate(
  to_process_waba_id,
  waba_config_id,
  wabaStatusResponse,
) {
  const wabaDetails = wabaStatusResponse.info;
  const agency_whatsapp_config = await models.agency_whatsapp_config.findOne({
    where: {
      agency_whatsapp_config_id: waba_config_id,
    },
  });
  for (let index = 0; index < wabaDetails.length; index++) {
    const waba_number = wabaStatusResponse.info[index].phone_number;
    const formatted_waba_number = waba_number.replace(/\D/g, '');
    const waba_rating = wabaStatusResponse.info[index].quality_rating;
    const waba_status = wabaStatusResponse.info[index].status;
    const waba_limit = wabaStatusResponse.info[index].messaging_limit;
    let daily_limit = null;
    if (general.notEmpty(waba_limit)) {
      const limitArr = waba_limit.split('_');
      console.info(limitArr);
      const tier = limitArr[1];
      if (tier.includes('K')) {
        daily_limit = tier.replace('K', '000');
      } else {
        daily_limit = tier;
      }
    }
    console.info(
      'CHECKING IF FOR SAME NUMBER',
      formatted_waba_number,
      agency_whatsapp_config.waba_number,
    );

    if (
      general.cmpStr(formatted_waba_number, agency_whatsapp_config.waba_number)
    ) {
      console.info({
        message: `Updating WABA Number ${formatted_waba_number} Status Details under record with WABA ID ${to_process_waba_id}`,
        to_process_waba_id,
        to_process_waba_number: agency_whatsapp_config.waba_number,
        waba_number: formatted_waba_number,
        waba_status: waba_status,
        waba_quality: waba_rating,
        daily_messaging_limit: daily_limit,
        agency_whatsapp_config_id: waba_config_id,
      });
      await processWABANumberStatusUpdate(
        waba_config_id,
        waba_status,
        waba_rating,
        daily_limit,
      );
    } else {
      console.info({
        message: `Skip process WABA Number ${formatted_waba_number}, same WABA ID but different number`,
        to_process_waba_id,
        to_process_waba_number: agency_whatsapp_config.waba_number,
        waba_number: formatted_waba_number,
        waba_status: waba_status,
        waba_quality: waba_rating,
        daily_messaging_limit: daily_limit,
        agency_whatsapp_config_id: waba_config_id,
      });
    }
  }
}

async function processWABANumberStatusUpdate(
  waba_config_id,
  waba_status,
  waba_rating,
  daily_limit,
) {
  const transaction = await models.sequelize.transaction();
  try {
    await models.agency_whatsapp_config.update(
      {
        waba_status: waba_status,
        waba_quality: waba_rating,
        daily_messaging_limit: daily_limit,
      },
      {
        where: {
          agency_whatsapp_config_id: waba_config_id,
        },
        transaction,
      },
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.error({
      err,
    });
    throw new Error(err);
  }
}

exports.getWABAQualityAndStatus = Sentry.AWSLambda.wrapHandler(
  getWABAQualityAndStatus,
);
