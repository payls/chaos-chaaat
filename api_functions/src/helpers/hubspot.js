const axios = require('axios');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const Promise = require('bluebird');
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  test: {
    isTest: testHelper.isTest,
  },
  validation: {
    requiredParams: validationHelper.requiredParams,
  },
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
  email: {
    sendEmail: emailHelper.sendEmail,
  },
  log: generalHelper.log,
};
const hubspotHelper = module.exports;

/**
 * Description
 * Function used to refresh hubspot access token using hubapi endpoint
 * @async
 * @function
 * @name generateRefreshedAccessToken
 * @kind function
 * @param {{ refresh_token: any client_id: any client_secret: any log: any }} { refresh_token, client_id, client_secret, log, }
 * @returns {Promise<any>}
 */
hubspotHelper.generateRefreshedAccessToken = async ({
  refresh_token,
  client_id,
  client_secret,
}) => {
  const funcName = 'hubspotHelper.generateRefreshedAccessToken';
  try {
    const data = {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
      client_id: client_id,
      client_secret: client_secret,
    };

    const urlEncodedData = new URLSearchParams(data);

    const oauthRefreshConfig = {
      method: 'post',
      url: 'https://api.hubapi.com/oauth/v1/token',
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: urlEncodedData.toString(),
    };

    const oauthRefreshResponse = await axios(oauthRefreshConfig)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
    oauthRefreshResponse.success = true;
    return oauthRefreshResponse;
  } catch (err) {
    if (err)
      console.error(`${funcName}: failed to generate refreshed hubspot token`, {
        funcName,
        refresh_token,
        client_id,
        client_secret,
        err,
      });

    return { success: false, err: err };
  }
};

/**
 * Description
 * Get forms form a client using hubspotClient package
 * @async
 * @constant
 * @name getAgencyForms
 * @type {typeof module.exports}
 */
hubspotHelper.getAgencyForms = async ({ hubspotClient }) => {
  const forms = [];
  let after = undefined;
  const limit = 100; // max limit per page
  const archived = false;
  const formTypes = undefined; // specify types if needed, or leave as an empty array for all types

  do {
    const response = await hubspotClient.marketing.forms.formsApi.getPage(
      after,
      limit,
      archived,
      formTypes,
    );
    forms.push(...response.results);
    after = null;
    if (h.notEmpty(response.paging) && h.notEmpty(response.paging.next)) {
      after = response.paging.next.after; // Set the `after` cursor for the next page
    } else {
      break; // Exit loop if there are no more pages
    }
  } while (after);

  return forms;
};

/**
 * Description
 * Function to save/update hubspot forms for a client
 * @async
 * @constant
 * @name processAgencyHubSpotForms
 * @type {typeof module.exports}
 */
hubspotHelper.processAgencyHubSpotForms = async (
  { formData, agencyHubspot },
  { models },
) => {
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
    if (h.isEmpty(agencyForm)) {
      console.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ Saving form', form);
      const hubspot_form_id = generalHelper.generateId();
      await models.hubspot_form.create({
        hubspot_form_id: hubspot_form_id,
        agency_fk: agencyHubspot.agency_fk,
        form_id: form.id,
        form_name: form.name,
      });
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
        },
      );
    }
  });
};
