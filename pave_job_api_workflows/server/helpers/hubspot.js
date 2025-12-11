const axios = require('axios');
const moment = require('moment');
const generalHelper = require('./general');
const testHelper = require('./test');
const validationHelper = require('./validation');
const emailHelper = require('./email');
const { Client } = require('@hubspot/api-client');
const config = require('../configs/config')(process.env.NODE_ENV);
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
 * @param {string} refresh_token hubspot refresh token for current agency
 * @param {string} clientId hubspot application client id
 * @param {string} clientSecret hubspot application secret key
 * @param {object} log server log function
 * @returns {Promise<any>} return boolean result for refresh status
 */
hubspotHelper.generateRefreshedAccessToken = async ({
  refresh_token,
  client_id,
  client_secret,
  log,
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
      log.error(`${funcName}: failed to generate refreshed hubspot token`, {
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
 * Function to send contact notes to hubspot associated to contact
 * @async
 * @constant
 * @name processContactNotes
 * @type {typeof module.exports}
 * @param {object} payload notes object to be sent
 * @param {object} hubspotClient current hubspot client session object
 * @param {object} log server log function
 */
hubspotHelper.processContactNotes = async (
  { payload, hubspotClient },
  { log },
) => {
  const { source_contact_id: contactId, timestamp, body } = payload;

  const associationTypes =
    await hubspotClient.crm.associations.schema.typesApi.getAll(
      'Notes',
      'Contacts',
    );
  log.info(associationTypes);
  const associationTypeID = associationTypes.results.reduce((pv, cv) => {
    if (pv) return pv;
    if (cv.name === 'note_to_contact') pv = cv.id;
    return pv;
  }, null);
  const simplePublicObjectInputForCreate = {
    associations: [
      {
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: parseInt(associationTypeID) || 0,
          },
        ],
        to: { id: contactId },
      },
    ],
    properties: {
      hs_timestamp: timestamp,
      hs_note_body: body,
    },
  };

  await hubspotClient.crm.objects.basicApi.create(
    'notes',
    simplePublicObjectInputForCreate,
  );
};

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
hubspotHelper.processContactOwner = async (
  { contact, agency, hubspotClient },
  { models, log },
) => {
  let owner = null;
  // if there is no owner id assigned from hubspot
  if (
    h.isEmpty(contact.properties.hubspot_owner_id) &&
    h.isEmpty(contact.properties.contact_lead)
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
  if (h.notEmpty(contact.properties.contact_lead)) {
    owner = {
      email: contact.properties.contact_lead,
    };
  }

  // if the contact got a hubspot owner
  if (h.notEmpty(contact.properties.hubspot_owner_id)) {
    owner = await hubspotHelper.getActiveOwnerData(
      hubspotClient,
      contact.properties.hubspot_owner_id,
      log,
    );
  }

  if (h.notEmpty(contact.properties.hubspot_owner_id) && h.isEmpty(owner)) {
    owner = await hubspotHelper.getArchivedOwnerData(
      hubspotClient,
      contact.properties.hubspot_owner_id,
      log,
    );
  }

  return owner;
};

/**
 * Description
 * Function to process received form submissions and trigger necessary
 * automation for create webhook
 * @async
 * @constant
 * @name hubspotProcessFormSubmissionForCreateWebhook
 * @type {typeof module.exports}
 * @param {object} contact current contact object session
 * @param {object} config current workflow processor data
 * @param {object} agency current agency object session
 * @param {string} contact_id contact id
 * @param {object} hubspotClient current client hubspot session object
 * @param {object} models database tables models
 * @param {object} log server log function
 * @returns {Promise} returns hubspot form id
 */
hubspotHelper.hubspotProcessFormSubmissionForCreateWebhook = async (
  { contact, agency, contact_id, hubspotClient, models, config },
  { log },
) => {
  let hubspot_form_id = null;
  if (!h.isEmpty(contact.properties.hs_calculated_form_submissions)) {
    log.info({
      type: 'CREATE',
      hubspot_form_id: hubspot_form_id,
      payload: contact.properties.hs_calculated_form_submissions,
    });

    // get the latest form submission
    const submissions =
      contact.properties.hs_calculated_form_submissions.split(';');
    const latest_submission = submissions[submissions.length - 1];
    const form_id = latest_submission.split(':')[0];

    const agencyForm = await models.hubspot_form.findOne({
      where: {
        form_id: form_id,
        agency_fk: agency.agency_id,
      },
    });

    if (agencyForm) {
      hubspot_form_id = agencyForm.hubspot_form_id;
    } else {
      const form = await hubspotClient.apiRequest({
        method: 'get',
        path: `/forms/v2/forms/${form_id}`,
      });
      hubspot_form_id = generalHelper.generateId();
      await models.hubspot_form.create({
        hubspot_form_id: hubspot_form_id,
        agency_fk: agency.agency_id,
        form_id: form.guid,
        form_name: form.name,
      });
    }

    const hasExistingSubmission =
      await models.hubspot_form_submission_payload.findOne({
        where: {
          contact_fk: contact_id,
          hubspot_form_fk: hubspot_form_id,
        },
        order: [['created_date', 'DESC']],
      });

    const hubspot_form_submission_payload_id = generalHelper.generateId();
    await models.hubspot_form_submission_payload.create({
      hubspot_form_submission_payload_id: hubspot_form_submission_payload_id,
      agency_fk: agency.agency_id,
      contact_fk: contact_id,
      hubspot_form_fk: hubspot_form_id,
      payload: JSON.stringify(contact.properties),
      status: 'create',
    });

    if (hasExistingSubmission) {
      const latestSubmissionDate = moment(hasExistingSubmission?.created_date);
      const currentDate = moment();
      const hoursDifference = currentDate.diff(latestSubmissionDate, 'hours');

      // Check if the difference is greater than 24 hours
      if (hoursDifference > 24) {
        // trigger run automation
        log.info({
          message: 'Trigger message automation from hubspot create consumer',
        });
        await hubspotHelper.callAPIForRunningImmediateAutomation(
          { hubspot_form_id, contact_id, config },
          { log },
        );
      } else {
        log.info(
          'Within 24 hour submission already exists. Skipping message sending.',
        );
      }
    } else {
      // trigger run automation
      log.info({
        message: 'Trigger message automation from hubspot create consumer',
      });
      await hubspotHelper.callAPIForRunningImmediateAutomation(
        { hubspot_form_id, contact_id, config },
        { log },
      );
    }
  }
  return hubspot_form_id;
};

/**
 * Description
 * Function to process received form submissions and trigger necessary
 * automation for update webhook
 * @async
 * @constant
 * @name hubspotProcessFormSubmissionForUpdateWebhook
 * @type {typeof module.exports}
 * @param {object} contact current contact object session
 * @param {object} config current workflow processor data
 * @param {object} agency current agency object session
 * @param {string} contact_id contact id
 * @param {object} hubspotClient current client hubspot session object
 * @param {object} models database tables models
 * @param {object} log server log function
 * @returns {Promise} returns hubspot form ID
 */
hubspotHelper.hubspotProcessFormSubmissionForUpdateWebhook = async (
  { contact, agency, contact_id, body, hubspotClient, models, config },
  { log },
) => {
  let hubspot_form_id = null;
  let formSubmissionString;

  if (body.propertyName === 'hs_calculated_form_submissions') {
    formSubmissionString = body.propertyValue;
  }
  if (h.notEmpty(formSubmissionString)) {
    log.info({
      type: 'UPDATE',
      hubspot_form_id: hubspot_form_id,
      payload: formSubmissionString,
    });

    // get the latest form submission
    const submissions = formSubmissionString.split(';');
    const latest_submission = submissions[submissions.length - 1];
    const form_id = latest_submission.split(':')[0];

    const agencyForm = await models.hubspot_form.findOne({
      where: {
        form_id: form_id,
        agency_fk: agency.agency_id,
      },
    });

    if (agencyForm) {
      hubspot_form_id = agencyForm.hubspot_form_id;
    } else {
      const form = await hubspotClient.apiRequest({
        method: 'get',
        path: `/forms/v2/forms/${form_id}`,
      });
      hubspot_form_id = generalHelper.generateId();
      await models.hubspot_form.create({
        hubspot_form_id: hubspot_form_id,
        agency_fk: agency.agency_id,
        form_id: form.guid,
        form_name: form.name,
      });
    }

    const hasExistingSubmission =
      await models.hubspot_form_submission_payload.findOne({
        where: {
          contact_fk: contact_id,
          hubspot_form_fk: hubspot_form_id,
        },
        order: [['created_date', 'DESC']],
      });

    const hubspot_form_submission_payload_id = generalHelper.generateId();
    await models.hubspot_form_submission_payload.create({
      hubspot_form_submission_payload_id: hubspot_form_submission_payload_id,
      agency_fk: agency.agency_id,
      contact_fk: contact_id,
      hubspot_form_fk: hubspot_form_id,
      payload: JSON.stringify(contact.properties),
      status: 'update',
    });

    if (hasExistingSubmission) {
      const latestSubmissionDate = moment(hasExistingSubmission?.created_date);
      const currentDate = moment();
      const hoursDifference = currentDate.diff(latestSubmissionDate, 'hours');

      // Check if the difference is greater than 24 hours
      if (hoursDifference > 24) {
        // trigger run automation
        log.info({
          message: 'Trigger message automation from hubspot update consumer',
        });
        await hubspotHelper.callAPIForRunningImmediateAutomation(
          { hubspot_form_id, contact_id, config },
          { log },
        );
      } else {
        log.info(
          'Within 24 hour submission already exists. Skipping message sending.',
        );
      }
    } else {
      // trigger run automation
      log.info({
        message: 'Trigger message automation from hubspot update consumer',
      });
      await hubspotHelper.callAPIForRunningImmediateAutomation(
        { hubspot_form_id, contact_id, config },
        { log },
      );
    }
  }
  return hubspot_form_id;
};

/**
 * Description
 * Function to trigger necessary automation when a form is submitted by a
 * contact
 * @async
 * @constant
 * @name callAPIForRunningImmediateAutomation
 * @type {typeof module.exports}
 * @param {string} hubspot_form_id form id where action is made
 * @param {string} contact_id contact id
 * @param {object} config current workflow processor data
 * @param {object} log server log function
 */
hubspotHelper.callAPIForRunningImmediateAutomation = async (
  { hubspot_form_id, contact_id, config },
  { log },
) => {
  const trigger_config = {
    method: 'post',
    url: `${config.apiUrl}/v1/staff/automation/run/immediate`,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://staff.chaaat.io',
    },
    data: JSON.stringify({
      contact_id: contact_id,
      form_id: hubspot_form_id,
      trigger_id: 'da7875aa-7e42-4260-8941-02ba9b90e0d1',
    }),
  };

  await axios(trigger_config)
    // eslint-disable-next-line promise/always-return
    .then(function (response) {
      log.info(JSON.stringify(response.data));
    })
    .catch(function (error) {
      log.error(error);
    });
};

/**
 * Description
 * Function to pull hubspot contact data
 * @async
 * @constant
 * @name pullHubSpotContactData
 * @type {typeof module.exports}
 * @param {object} hubspotClient current hubspot client session object
 * @param {string} process_id current process identifier
 * @param {string} processor_name current process name
 * @param {object} body payload data for getting contact data
 * @param {object} log server log function
 * @returns {Promise} returns contact data
 */
hubspotHelper.pullHubSpotContactData = async ({
  hubspotClient,
  body,
  process_id,
  processor_name,
  log,
}) => {
  const properties = [
    'hubspot_owner_id',
    'contact_lead',
    'firstname',
    'lastname',
    'email',
    'mobilephone',
    'phone',
    'hs_calculated_form_submissions',
  ];
  const contactHubSpotID = body.objectId;
  const contact = await hubspotHelper.getActiveContactDetails(
    hubspotClient,
    contactHubSpotID,
    properties,
    log,
  );

  if (h.isEmpty(contact)) {
    log.warn({
      process_id,
      success: false,
      processor: processor_name,
      err: 'No contact found',
    });
    return false;
  }

  return contact;
};

/**
 * Description
 * For processing phone data to be saved in the contact details
 * @constant
 * @name processContactPhone
 * @param {string} agency_id to check agency provided or phone handling
 * @param {string} phone phone data from hubspot
 * @param {string} mobilephone mobile data from hubspot
 * @type {typeof module.exports}
 * @returns {Promise} returns formatted phone data
 */
hubspotHelper.processContactPhone = ({ agency_id, phone, mobilephone }) => {
  let contact_phone = null;
  if (h.cmpStr(agency_id, '5e1d426f-9658-4ee7-afe2-0dfa332c511b')) {
    contact_phone = !h.isEmpty(phone) ? phone : mobilephone;
  } else {
    contact_phone = !h.isEmpty(mobilephone) ? mobilephone : phone;
  }

  if (!h.isEmpty(contact_phone)) {
    contact_phone = contact_phone.replaceAll('+', '');
    contact_phone = contact_phone.replaceAll(' ', '');
    contact_phone = contact_phone.replaceAll('(', '');
    contact_phone = contact_phone.replaceAll(')', '');
    contact_phone = contact_phone.replaceAll('-', '');
    contact_phone = contact_phone.replaceAll('.', '');
  }

  return contact_phone;
};

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
hubspotHelper.getActiveOwnerData = async (
  hubspotClient,
  hubspot_owner_id,
  log,
) => {
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
};

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
hubspotHelper.getArchivedOwnerData = async (
  hubspotClient,
  hubspot_owner_id,
  log,
) => {
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
};

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
hubspotHelper.getActiveContactDetails = async (
  hubspotClient,
  contactHubSpotID,
  properties,
  log,
) => {
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
};

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
hubspotHelper.hubspotConnect = async ({ agencyOauth, log }) => {
  const agencyOauthData =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  const { refresh_token } = JSON.parse(agencyOauthData.access_info);

  // start establishing hubspot client connection
  const hubspotClient = new Client({
    clientId: config.directIntegrations.hubspot.clientId,
    clientSecret: config.directIntegrations.hubspot.clientSecret,
  });

  // get new access token using agency hubspot refresh token
  const oauthRefreshResponse = await hubspotHelper.generateRefreshedAccessToken(
    {
      refresh_token: refresh_token,
      client_id: config.directIntegrations.hubspot.clientId,
      client_secret: config.directIntegrations.hubspot.clientSecret,
      log,
    },
  );

  // set retrieved access token
  if (oauthRefreshResponse.success === true) {
    hubspotClient.setAccessToken(oauthRefreshResponse.access_token);
  }

  return { oauthRefreshResponse, hubspotClient };
};

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
hubspotHelper.getArchivedContactDetails = async (
  hubspotClient,
  contactHubSpotID,
  properties,
  log,
) => {
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
};
