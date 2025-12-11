const { Client } = require('@hubspot/api-client');
const { Op } = require('sequelize');
const models = require('../models');
const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);
const Sentry = require('@sentry/serverless');
const Promise = require('bluebird');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

/**
 * Description
 * Function to pull all available forms from agency hubspot accounts
 * @async
 * @property
 * @name syncForms
 * @kind function
 * @type {function}
 * @param {object} event object to provide the event triggered when calling
 * the cron job function
 * @returns {Promise} returns an object with success boolean
 */
const syncForms = async (event = {}) => {
  const functionName = 'HUBSPOT_FORM_SYNC';
  try {
    console.info('START HUBSPOT_FORM_SYNC', event);
    console.info(JSON.stringify(event));

    console.info(
      'ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ Getting agencies with active hubspot oauth',
    );
    const agencyOauth = await models.agency_oauth.findAll({
      where: {
        status: 'active',
        source: 'HUBSPOT',
        created_date: { [Op.gte]: '2023-09-29 13:00:00' },
      },
    });
    console.info('RUNNING AGENCY COUNT: ', agencyOauth.length);

    for (const oauth of agencyOauth) {
      await processAgencyFormPulling({ oauth });
    }

    console.info('ENV: ', process.env.NODE_ENV);
    console.info('END HUBSPOT_FORM_SYNC', event);
    return { success: true, function: functionName };
  } catch (err) {
    Sentry.captureException(err);
    console.info({
      function: functionName,
      err,
    });
    return { success: false, function: functionName, error: err };
  }
};

/**
 * Description
 * Function to process hubspot form pulling per agency
 * @async
 * @property
 * @name processAgencyFormPulling
 * @kind function
 * @type {function}
 * @param {object} oauth oauth data for hubspot
 * @returns {Promise<{ success: boolean; function: string; error?: undefined; }
 * | { success: boolean; function: string; error: any; }>}
 */
async function processAgencyFormPulling({ oauth }) {
  try {
    const agencyHubspot = oauth.dataValues;
    console.info(
      'ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ current agency hubspot oauth',
      agencyHubspot,
    );
    const { refresh_token } = JSON.parse(agencyHubspot.access_info);

    const hubspotClient = new Client({
      clientId: config.directIntegrations.hubspot.clientId,
      clientSecret: config.directIntegrations.hubspot.clientSecret,
    });

    const oauthRefreshResponse = await refreshAccessToken({
      refresh_token,
      hubspotClient,
    });

    if (h.cmpBool(oauthRefreshResponse, true)) {
      const forms = await h.hubspot.getAgencyForms({ hubspotClient });
      const formData = forms;

      await processAgencyHubSpotForms({
        formData,
        agencyHubspot,
      });
    }
  } catch (err) {
    Sentry.captureException(err);
    console.info('An error occured while getting forms', err);
  }
}

/**
 * Description
 * Function to refresh token before doing the hubspot form sync
 * @async
 * @function
 * @name refreshAccessToken
 * @kind function
 * @param {string} refresh_token refresh token for hubspot
 * @param {object} hubspotClient current session for hubspot instance
 * @returns {Promise<boolean>}
 */
async function refreshAccessToken({ refresh_token, hubspotClient }) {
  const oauthRefreshResponse = await h.hubspot.generateRefreshedAccessToken({
    refresh_token: refresh_token,
    client_id: config.directIntegrations.hubspot.clientId,
    client_secret: config.directIntegrations.hubspot.clientSecret,
  });

  console.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️', oauthRefreshResponse);
  if (h.cmpBool(oauthRefreshResponse.success, false)) {
    return false;
  }
  hubspotClient.setAccessToken(oauthRefreshResponse.access_token);
  return true;
}

/**
 * Description
 * Function for saving hubspot forms
 * @async
 * @function
 * @name processAgencyHubSpotForms
 * @kind function
 * @param {object} hubspotData data for saving hubspot forms
 * @returns {Promise<void>}
 */
async function processAgencyHubSpotForms(hubspotData) {
  const { formData, agencyHubspot } = hubspotData;
  const agency_available_forms = [];
  await Promise.mapSeries(formData, async (form) => {
    console.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ Validating form', form);
    agency_available_forms.push(form.id);
    const agencyForm = await models.hubspot_form.findOne({
      where: {
        form_id: form.id,
        agency_fk: agencyHubspot.agency_fk,
      },
    });
    const form_tx = await models.sequelize.transaction();
    try {
      if (h.isEmpty(agencyForm)) {
        console.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ Saving form', form);
        const hubspot_form_id = h.general.generateId();
        await models.hubspot_form.create(
          {
            hubspot_form_id: hubspot_form_id,
            agency_fk: agencyHubspot.agency_fk,
            form_id: form.id,
            form_name: form.name,
          },
          { transaction: form_tx },
        );
      } else {
        console.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ Updating form status', form);
        await models.hubspot_form.update(
          {
            form_name: form.name,
            archived: false,
          },
          {
            where: {
              hubspot_form_id: agencyForm.hubspot_form_id,
            },
            transaction: form_tx,
          },
        );
      }
      await form_tx.commit();
    } catch (hbFormErr) {
      await form_tx.rollback();
      Sentry.captureException(hbFormErr);
      console.info('An error occured while saving forms', hbFormErr);
      throw new Error('HUBSPOT FORM SAVING');
    }
  });
}

exports.syncForms = Sentry.AWSLambda.wrapHandler(syncForms);
