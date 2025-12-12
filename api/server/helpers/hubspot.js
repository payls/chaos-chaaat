const axios = require('axios');
const Sentry = require('@sentry/node');
const constant = require('../constants/constant.json');
const { Client } = require('@hubspot/api-client');
const config = require('../configs/config')(process.env.NODE_ENV);
const general = require('./general');

async function sendHubspotContactNote(req, agency_id, payload) {
  /*
  sample payload
  {
      ParentId: Id,
      Title: 'Pave - Contact updated',
      Body: 'Contact Successfully updated on Pave',
    }
  */
  const result = await req.rabbitmq.pubHsAdhocProcess({
    data: {
      agency_id,
      payload,
    },
    consumerType: constant.AMQ.CONSUMER_TYPES.HS_SEND_CONTACT_NOTE,
  });

  req.log.info({
    message: 'Queuing hubspot contact note',
    data: {
      agency_id,
      notes: payload,
    },
    success: result,
  });
}

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
async function generateRefreshedAccessToken({
  refresh_token,
  client_id,
  client_secret,
  log,
}) {
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
        Sentry.captureException(error);
        return error;
      });
    oauthRefreshResponse.success = true;
    return oauthRefreshResponse;
  } catch (err) {
    Sentry.captureException(err);
    if (err)
      log.error(`failed to generate refreshed hubspot token`, {
        refresh_token,
        client_id,
        client_secret,
        err,
      });

    return { success: false, err: err };
  }
}

/**
 * Description
 * Function to connect to agency hubspot client
 * @async
 * @function
 * @name hubspotConnect
 * @kind function
 * @param {{ agencyOauth: any log: any }} { agencyOauth, log }
 * @returns {Promise<{ oauthRefreshResponse: any; hubspotClient: Client; }>}
 */
async function hubspotConnect({ agencyOauth, log }) {
  const agencyOauthData =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  const { refresh_token } = JSON.parse(agencyOauthData.access_info);

  // start establishing hubspot client connection
  const hubspotClient = new Client({
    clientId: config.directIntegrations.hubspot.clientId,
    clientSecret: config.directIntegrations.hubspot.clientSecret,
  });

  // get new access token using agency hubspot refresh token
  const oauthRefreshResponse = await generateRefreshedAccessToken({
    refresh_token: refresh_token,
    client_id: config.directIntegrations.hubspot.clientId,
    client_secret: config.directIntegrations.hubspot.clientSecret,
    log,
  });

  // set retrieved access token
  if (oauthRefreshResponse.success === true) {
    hubspotClient.setAccessToken(oauthRefreshResponse.access_token);
  }

  return { oauthRefreshResponse, hubspotClient };
}

/**
 * Description
 * Function to get all members under a specific list
 * @async
 * @function
 * @name getAllListMemberships
 * @kind function
 * @param {any} hubspotClient
 * @param {any} listId
 * @param {number} limit?
 * @returns {Promise<any[]>}
 */
async function getAllListMemberships(hubspotClient, listId, limit = 10, log) {
  let memberships = [];
  let after;

  try {
    // Loop until there's no `paging.next` in the response
    while (true) {
      const apiResponse = await hubspotClient.crm.lists.membershipsApi.getPage(
        listId,
        after,
        undefined,
        limit,
      );
      memberships = memberships.concat(apiResponse.results); // Add current page results to memberships

      if (apiResponse.paging && apiResponse.paging.next) {
        after = apiResponse.paging.next.after; // Set the `after` cursor for the next page
      } else {
        break; // Exit loop if there are no more pages
      }
    }
  } catch (error) {
    log.error('Error fetching memberships:', error);
    throw new Error(error);
  }

  return memberships;
}

/**
 * Description
 * Function to retrieve hubspot contact based in text and date filters
 * @async
 * @function
 * @name retrieveContact
 * @kind function
 * @param {any} hubspotClient
 * @param {any} data
 * @returns {Promise<{ response: any; contacts: any[]; }>}
 */
async function retrieveContact(hubspotClient, data, log) {
  let response = null;
  let contacts = [];
  const after = data?.filter?.skip;

  const PublicObjectSearchRequest = {
    limit: data?.filter?.count,
    after: after,
    sorts: [],
    properties: [
      'firstname',
      'lastname',
      'email',
      'hubspot_owner_id',
      'contact_lead',
      'mobilephone',
      'phone',
    ],
    filterGroups: [
      {
        filters: [
          {
            highValue: data?.filter?.endDate,
            propertyName: 'createdate',
            value: data?.filter?.startDate,
            operator: 'BETWEEN',
          },
        ],
      },
    ],
  };

  if (general.notEmpty(data?.filter?.query)) {
    PublicObjectSearchRequest.query = data?.filter?.query;
  }

  try {
    const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(
      PublicObjectSearchRequest,
    );

    contacts = contacts.concat(apiResponse.results); // Add current page results to memberships
    response = apiResponse;
  } catch (error) {
    log.error('Error fetching contacts:', error);
    throw new Error(error);
  }

  return { response, contacts };
}

/**
 * Description
 * Function to get hubspot contact details
 * @async
 * @constant
 * @name getActiveContactDetails
 * @param {object} hubspotClient current hubspot account client connection data
 * @param {string} contactHubSpotID hubspot contact id
 * @param {string} properties hubspot contact prperties
 * @param {object} log server log
 * @returns {Promise} contact data or null
 */
async function getActiveContactDetails(
  hubspotClient,
  contactHubSpotID,
  properties,
  log,
) {
  log.info({
    function: 'getActiveContactDetails',
    message: 'Attempt to get hubspot contact details',
  });
  try {
    const contact = await hubspotClient.crm.contacts.basicApi.getById(
      contactHubSpotID,
      properties,
      ['hs_calculated_form_submissions'],
      undefined,
    );
    log.info({
      function: 'getActiveContactDetails',
      message: 'Details retrieved',
      data: contact,
    });
    return contact;
  } catch (activeContactErr) {
    log.error({
      function: 'getActiveContactData',
      error: activeContactErr,
      message: 'Error getting hubspot contact data - probably archived',
    });
    return false;
  }
}

/**
 * Description
 * Function to get hubspot archived contact details
 * @async
 * @constant
 * @name getArchivedContactDetails
 * @param {object} hubspotClient current hubspot account client connection data
 * @param {string} contactHubSpotID hubspot contact id
 * @param {string} properties hubspot contact prperties
 * @param {object} log server log
 * @returns {Promise} contact data or null
 */
async function getArchivedContactDetails(
  hubspotClient,
  contactHubSpotID,
  properties,
  log,
) {
  log.info({
    function: 'getArchivedContactDetails',
    message: 'Attempt to get hubspot contact details',
  });
  try {
    const contact = await hubspotClient.crm.contacts.basicApi.getById(
      contactHubSpotID,
      properties,
      ['hs_calculated_form_submissions'],
      undefined,
      undefined,
      true,
    );
    log.info({
      function: 'getArchivedContactDetails',
      message: 'Details retrieved',
      data: contact,
    });
    return contact;
  } catch (ArchivedContactErr) {
    log.error({
      function: 'getArchivedContactData',
      error: ArchivedContactErr,
      message: 'Error getting hubspot contact data',
    });
    return false;
  }
}

/**
 * Description
 * Function to process contact owner to be assigned to contact coming from hubspot
 * @async
 * @constant
 * @name processContactOwner
 * @type {typeof module.exports}
 * @param {object} contact contact object for checking owner
 * @param {object} agency agency object for checking owner
 * @param {object} hubspotClient current hubspot client session object
 * @param {object} models database table object
 * @param {object} log server log
 * @returns {Promise} returns owner data
 */
async function processContactOwner(
  { contact, agency, hubspotClient },
  { models, log },
) {
  let owner = null;
  // if there is no owner id assigned from hubspot
  if (
    general.isEmpty(contact.properties.hubspot_owner_id) &&
    general.isEmpty(contact.properties.contact_lead)
  ) {
    const defaultAgent = await models.agency_user.findOne({
      where: {
        agency_user_id: agency?.default_outsider_contact_owner,
      },
      include: [
        {
          model: models.user,
          required: true,
        },
      ],
    });

    owner = {
      email: defaultAgent?.user?.dataValues?.email,
    };
  }

  // if contact lead is used
  if (general.notEmpty(contact.properties.contact_lead)) {
    owner = {
      email: contact.properties.contact_lead,
    };
  }

  // if the contact got a hubspot owner
  if (general.notEmpty(contact.properties.hubspot_owner_id)) {
    owner = await getActiveOwnerData(
      hubspotClient,
      contact.properties.hubspot_owner_id,
      log,
    );
  }

  if (
    general.notEmpty(contact.properties.hubspot_owner_id) &&
    general.isEmpty(owner)
  ) {
    owner = await getArchivedOwnerData(
      hubspotClient,
      contact.properties.hubspot_owner_id,
      log,
    );
  }

  return owner;
}

/**
 * Description
 * Function to get active hubspot owner data
 * @async
 * @constant
 * @name getActiveOwnerData
 * @param {object} hubspotClient current hubspot account client connection data
 * @param {string} hubspot_owner_id hubspot owner id
 * @param {object} log server log
 * @returns {Promise} owner data or null
 */
async function getActiveOwnerData(hubspotClient, hubspot_owner_id, log) {
  log.info({
    function: 'getOwnerData',
    message: 'Attempt to get hubspot contact owner details',
  });
  let owner = null;
  // check in active state owners
  try {
    owner = await hubspotClient.crm.owners.ownersApi.getById(hubspot_owner_id);
    log.info({
      function: 'getArchivedOwnerData',
      message: 'Details retrieved',
      data: owner,
    });
    return owner;
  } catch (ownerErr) {
    log.error({
      function: 'getOwnerData',
      error: ownerErr,
      message: 'Error getting hubspot contact owner data in active state',
    });
    return null;
  }
}

/**
 * Description
 * Function to get archived hubspot owner data
 * @async
 * @constant
 * @name getArchivedOwnerData
 * @param {object} hubspotClient current hubspot account client connection data
 * @param {string} hubspot_owner_id hubspot owner id
 * @param {object} log server log
 * @returns {Promise} owner data or null
 */
async function getArchivedOwnerData(hubspotClient, hubspot_owner_id, log) {
  log.info({
    function: 'getArchivedOwnerData',
    message: 'Attempt to get archived hubspot contact owner details',
  });
  let owner = null;
  try {
    owner = await hubspotClient.crm.owners.ownersApi.getById(
      hubspot_owner_id,
      'id',
      true,
    );
    log.info({
      function: 'getArchivedOwnerData',
      message: 'Details retrieved',
      data: owner,
    });
    return owner;
  } catch (archivedOwnerErr) {
    log.error({
      function: 'getArchivedOwnerData',
      error: archivedOwnerErr,
      message: 'Error getting hubspot contact owner data in archived state',
    });
    return null;
  }
}

module.exports = {
  sendHubspotContactNote,
  generateRefreshedAccessToken,
  hubspotConnect,
  getAllListMemberships,
  retrieveContact,
  getActiveContactDetails,
  getArchivedContactDetails,
  processContactOwner,
};
