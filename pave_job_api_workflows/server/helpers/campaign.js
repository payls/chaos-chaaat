const { Client } = require('@hubspot/api-client');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const generalHelper = require('./general');
const hubspotHelper = require('./hubspot');
const salesforceHelper = require('./salesforce');

const config = require('../configs/config')(process.env.NODE_ENV);

const campaignHelper = module.exports;

/**
 * Description
 * Function to send contact note to hubspot associated with a contact
 * @async
 * @constant
 * @name sendContactNote
 * @type {typeof module.exports}
 * @param {string} process_id action process id
 * @param {string} note the note to send
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {string} campaign_name campaign name related to notes
 * @param {object} models database table object data
 * @param {object} log server log function
 */
campaignHelper.sendContactNote = async ({
  process_id,
  log,
  note,
  contact_id,
  agency_id,
  campaign_name,
  models,
}) => {
  const funcName = 'campaignHelper.sendContactNote';
  if (!log) {
    log = {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }
  if (!process_id) process_id = uuidv4();
  log.info({
    process_id,
    params: {
      note,
      agency_id,
      contact_id,
      campaign_name,
    },
    funcName,
  });
  // start process for sending contact note
  await processSendContactNote({
    process_id,
    log,
    note,
    contact_id,
    agency_id,
    campaign_name,
    models,
    funcName,
  });
};

/**
 * Description
 * Function to process sending contact note to hubspot or salesforce
 * @async
 * @constant
 * @name processSendContactNote
 * @type {typeof module.exports}
 * @param {string} process_id action process id
 * @param {string} note the note to send
 * @param {string} agency_id agency id
 * @param {string} contact_id contact id
 * @param {string} campaign_name campaign name related to notes
 * @param {object} models database table object data
 * @param {string} funcName function name
 * @param {object} log server log function
 */
async function processSendContactNote({
  process_id,
  log,
  note,
  contact_id,
  agency_id,
  campaign_name,
  models,
  funcName,
}) {
  // check if contact has source
  const { contact_source, source_type } = await checkContactSource({
    contact_id,
    models,
  });

  if (source_type !== 'HUBSPOT' && source_type !== 'SALESFORCE') {
    log.warn({
      process_id,
      params: {
        note,
        agency_id,
        contact_id,
        campaign_name,
      },
      funcName,
      message: 'INVALID CONTACT SOURCE TYPE' + ': ' + source_type,
    });
    return false;
  }

  const agencyData = await processAgencyData({
    agency_id,
    process_id,
    note,
    contact_id,
    campaign_name,
    source_type,
    funcName,
    models,
    log,
  });

  if (!agencyData) return false;

  const { agency, agencyOauth } = agencyData;

  // send note tru direct integration
  if (source_type === 'HUBSPOT') {
    await processHubSpotContactNotes({
      process_id,
      note,
      agency_id,
      contact_id,
      campaign_name,
      source_type,
      agencyOauth,
      contact_source,
      funcName,
      log,
    });
  }

  if (source_type === 'SALESFORCE') {
    await processSalesforceContactNotes({
      process_id,
      note,
      agency_id,
      contact_id,
      campaign_name,
      source_type,
      agencyOauth,
      contact_source,
      funcName,
      log,
    });
  }
}

/**
 * Description
 * Function to check if contact has contact source and source id
 * @async
 * @function
 * @name checkContactSource
 * @kind function
 * @param {string} contact_id contact id
 * @param {object} models database table model object
 * @returns {Promise<false | { contact_source: any; source_type: any; }>}
 * returns either boolean false when failed and contact source data when process
 * is completed and successful
 */
async function checkContactSource({ contact_id, models }) {
  let contact_source = await models.contact_source.findOne({
    where: {
      contact_fk: contact_id,
      source_type: {
        [Op.in]: ['HUBSPOT', 'SALESFORCE'],
      },
    },
  });

  if (!contact_source) return false;
  contact_source = contact_source.toJSON
    ? contact_source.toJSON()
    : contact_source;
  // get the source (HUBSPOT, SALESFORCE)
  const source_type = contact_source.source_type;

  return { contact_source, source_type };
}

/**
 * Description
 * Initialize processing of contact note sending for hubspot
 * @async
 * @function
 * @name processHubSpotContactNotes
 * @kind function
 * @param {string} process_id action process id
 * @param {string} note the note to send
 * @param {string} agency_id
 * @param {string} contact_id
 * @param {string} campaign_name
 * @param {string} source_type if hubspot or salesforce
 * @param {object} agencyOauth oauth data
 * @param {string} contact_source contact record for source referencing
 * @param {string} funcName
 * @param {object} log server log function
 * @returns {Promise<boolean>} send boolean response when processing hubspot
 * notes
 */
async function processHubSpotContactNotes({
  process_id,
  note,
  agency_id,
  contact_id,
  campaign_name,
  source_type,
  agencyOauth,
  contact_source,
  funcName,
  log,
}) {
  log.info({
    process_id,
    params: {
      note,
      agency_id,
      contact_id,
      campaign_name,
    },
    funcName,
    message: 'Attempting to send Hubspot Direct',
    source_type,
  });
  const tokens = JSON.parse(agencyOauth.access_info);
  const { clientId, clientSecret } = config.directIntegrations.hubspot;
  const hubspotClient = new Client({
    clientId,
    clientSecret,
  });

  const oauthRefreshResponse = await hubspotHelper.generateRefreshedAccessToken(
    {
      refresh_token: tokens.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      log,
    },
  );

  log.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️', oauthRefreshResponse);

  if (generalHelper.cmpBool(oauthRefreshResponse.success, false)) {
    log.warn({
      process_id,
      params: {
        note,
        agency_id,
        contact_id,
        campaign_name,
      },
      funcName,
      err: oauthRefreshResponse.err,
    });
    return false;
  }
  hubspotClient.setAccessToken(oauthRefreshResponse.access_token);
  const payload = {
    source_contact_id: contact_source.source_contact_id,
    timestamp: new Date().getTime(),
    body: note,
  };

  try {
    await hubspotHelper.processContactNotes(
      { payload, hubspotClient },
      { log },
    );
    return true;
  } catch (err) {
    log.warn({
      process_id,
      params: {
        note,
        agency_id,
        contact_id,
        campaign_name,
      },
      funcName,
      err,
    });
    return false;
  }
}

/**
 * Description
 * Initialize processing of contact note sending for salesforce
 * @async
 * @function
 * @name processSalesforceContactNotes
 * @kind function
 * @param {string} process_id action process id
 * @param {string} note the note to send
 * @param {string} agency_id
 * @param {string} contact_id
 * @param {string} campaign_name
 * @param {string} source_type if hubspot or salesforce
 * @param {object} agencyOauth oauth data
 * @param {string} contact_source contact record for source referencing
 * @param {string} funcName
 * @param {object} log server log function
 * @returns {Promise<boolean>} return boolean response
 */
async function processSalesforceContactNotes({
  process_id,
  note,
  agency_id,
  contact_id,
  campaign_name,
  source_type,
  agencyOauth,
  contact_source,
  funcName,
  log,
}) {
  log.info({
    process_id,
    params: {
      note,
      agency_id,
      contact_id,
      campaign_name,
    },
    funcName,
    message: 'Attempting to send Salesforce Direct',
    source_type,
  });

  const { conn, refresh_token } = await salesforceHelper.connectToSalesforce({
    agencyOauth,
  });

  try {
    const payload = {
      Title: `Campaign Note by Pave - ${campaign_name}`,
      ParentId: contact_source.source_contact_id,
      Body: note,
    };
    await triggerSalesforceNoteSending({ conn, refresh_token, payload });

    return true;
  } catch (err) {
    log.warn({
      process_id,
      params: {
        note,
        agency_id,
        contact_id,
        campaign_name,
      },
      funcName,
      err,
    });
    return false;
  }
}

/**
 * Description
 * Function to prepare agency and oauth data needed for sending contact notes
 * @async
 * @function
 * @name processAgencyData
 * @kind function
 * @param {string} agency_id Agency ID
 * @param {string} process_id action process id
 * @param {string} note the note to send
 * @param {string} contact_id
 * @param {string} campaign_name
 * @param {string} source_type if hubspot or salesforce
 * @param {string} funcName
 * @param {object} models database table object
 * @param {object} log server log function
 * @returns {Promise<false | { agency: any; agencyOauth: any; }>} returns either
 * false when agency processing fails or agency and oauth object when success
 */
async function processAgencyData({
  agency_id,
  process_id,
  note,
  contact_id,
  campaign_name,
  source_type,
  funcName,
  models,
  log,
}) {
  let agency = await models.agency.findOne({
    where: {
      agency_id,
    },
  });

  if (!agency) {
    log.warn({
      process_id,
      params: {
        note,
        agency_id,
        contact_id,
        campaign_name,
      },
      funcName,
      message: 'INVALID AGENCY ID' + ': ' + agency_id,
    });

    return false;
  }
  agency = agency && agency.toJSON ? agency.toJSON() : agency;

  // check if has direct integration on the source
  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id,
      status: 'active',
      source: source_type,
    },
  });

  if (!agencyOauth) return false;

  agencyOauth =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  return { agency, agencyOauth };
}

/**
 * Description
 * Function to send contact note in salesforce
 * @async
 * @function
 * @name triggerSalesforceNoteSending
 * @kind function
 * @param {object} conn salesforce connection
 * @param {string} refresh_token refresh token for salesforce
 * @param {object} payload object data for the notes to be sent
 * @returns {Promise<boolean>} returns boolean true when note sending is success
 */
async function triggerSalesforceNoteSending({ conn, refresh_token, payload }) {
  await new Promise((resolve, reject) => {
    conn.oauth2.refreshToken(refresh_token, async (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

  await new Promise((resolve, reject) => {
    conn.sobject('Note').create(payload, function (err, noteCreated) {
      if (err) {
        return reject(err);
      }
      resolve(noteCreated);
    });
  });

  return true;
}
