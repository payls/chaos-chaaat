const userMiddleware = require('../../../../middlewares/user');
const agencyMiddleware = require('../../../../middlewares/agency');
const c = require('../../../../controllers');
const models = require('../../../../models');
const constant = require('../../../../constants/constant.json');
const h = require('../../../../helpers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const sequelize = require('sequelize');
const { Op } = sequelize;
const Sentry = require('@sentry/node');

async function preValidation(req, res) {
  await Promise.all([
    userMiddleware.isLoggedIn(req, res),
    userMiddleware.hasAccessToStaffPortal(req, res),
    agencyMiddleware.canAddContactViaHubSpotPulling(req, res),
  ]);
}

async function handler(req, res) {
  try {
    const { agency_id } = req.params;
    const { contact_list } = req.body;
    const { user_id } = h.user.getCurrentUser(req);

    const agencyOauth = await models.agency_oauth.findOne({
      where: {
        agency_fk: agency_id.trim(),
        status: 'active',
        source: 'HUBSPOT',
      },
    });

    const { oauthRefreshResponse, hubspotClient } =
      await h.hubspot.hubspotConnect({
        agencyOauth,
        log: req.log,
      });

    // if failed to connect, return error
    if (h.cmpBool(oauthRefreshResponse.success, false)) {
      return h.api.createResponse(
        req,
        res,
        500,
        {},
        '2-hubspot-contact-list-oauth-1663834299369',
        {
          portal,
        },
      );
    }

    const results = await processImportHubSpotContacts({
      hubspotClient,
      agency_id,
      user_id,
      contact_list,
      log: req.log,
    });

    await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);

    const resBody = {
      results,
      message: 'Finished processing records',
    };

    return h.api.createResponse(
      req,
      res,
      200,
      resBody,
      '1-hubspot-contacts-1730254198',
      { portal },
    );
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({
      err,
      url: '/staff/hubspot/:agency_id/contacts',
    });

    return h.api.createResponse(
      req,
      res,
      500,
      '2-hubspot-contacts-1730254198',
      { portal },
    );
  }
}

/**
 * Description
 * Function to start processing the contact import request
 * @async
 * @function
 * @name processImportHubSpotContacts
 * @kind function
 * @param {{ hubspotClient: any agency_id: any user_id: any contact_list: any log: any }} { hubspotClient, agency_id, user_id, contact_list, log, }
 * @returns {Promise<void>}
 */
async function processImportHubSpotContacts({
  hubspotClient,
  agency_id,
  user_id,
  contact_list,
  log,
}) {
  const processedContacts = [];
  const agency = await c.agency.findOne({ agency_id });
  const properties = [
    'hubspot_owner_id',
    'contact_lead',
    'firstname',
    'lastname',
    'email',
    'mobilephone',
    'phone',
  ];

  for (const hb_contact_id of contact_list) {
    // get contact details from active set
    let contact = await h.hubspot.getActiveContactDetails(
      hubspotClient,
      hb_contact_id,
      properties,
      log,
    );

    // get contact details from archived set
    if (h.isEmpty(contact)) {
      contact = await h.hubspot.getArchivedContactDetails(
        hubspotClient,
        hb_contact_id,
        properties,
        log,
      );
    }

    // prepare mobile number and sanitize
    let mobile_number = h.notEmpty(contact?.properties?.mobilephone)
      ? contact?.properties?.mobilephone
      : contact?.properties?.phone;
    mobile_number = h.notEmpty(mobile_number)
      ? mobile_number.replace(/\D/g, '')
      : mobile_number;

    let contact_id = null;

    // get contact record based on formatted mobile number
    const { contact_exists, contact_record } =
      await getContactDetailsBasedOnMobileNumber(
        {
          agency_id,
          mobile_number,
        },
        {
          log,
        },
      );

    /**
     * Description
     * getting the contact owner based on the hubspot contact owner
     * if there is an owner and does not match any on the app record,
     * it will set to the default owner
     */
    const owner = await h.hubspot.processContactOwner(
      { contact, agency, hubspotClient },
      { models, log },
    );

    let contact_owner_id = null;

    // getting the agency user id of the found contact owner
    if (h.notEmpty(owner) && h.notEmpty(owner?.email)) {
      const contact_owner = c.user.findOne(
        {
          email: owner?.email,
        },
        {
          include: [
            {
              model: models.agency_user,
              where: {
                agency_fk: agency_id,
              },
            },
          ],
        },
      );
      contact_owner_id = contact_owner?.agency_user?.agency_user_id;
    }

    const contact_source_type = 'hubspot';

    // if no contact is still associated with the given number - create contact
    if (h.cmpBool(contact_exists, false)) {
      contact_id = await createNewHubSpotContact(
        {
          contact: {
            contact_owner: contact_owner_id,
            first_name: contact?.properties?.firstname,
            last_name: contact?.properties?.lastname,
            email: contact?.properties?.email,
          },
          mobile_number,
          agency_id,
          user_id,
          contact_source_type,
        },
        {
          log,
        },
      );
    } else {
      /**
       * If contact already exists - update the contact record
       */
      contact_id = await updateExistingHubSpotContact(
        {
          contact_record,
          contact: {
            contact_owner: contact_owner_id,
            first_name: contact?.properties?.firstname,
            last_name: contact?.properties?.lastname,
            email: contact?.properties?.email,
          },
          mobile_number,
          agency_id,
          user_id,
          contact_source_type,
        },
        {
          log,
        },
      );
    }

    processedContacts.push(contact_id);
  }

  return processedContacts;
}

/**
 * Description
 * Check if contact with same mobile number already exists
 * @async
 * @function
 * @name getContactDetailsBasedOnMobileNumber
 * @kind function
 * @param {any} params
 * @param {any} misc
 * @returns {Promise<{ contact_exists: boolean; contact_record: any; }>}
 */
async function getContactDetailsBasedOnMobileNumber(params, misc) {
  const { log } = misc;
  log.info({
    function: 'getContactDetailsBasedOnMobileNumber',
    action: 'Get contact details using mobile number in the agency',
  });

  if (h.isEmpty(params.mobile_number)) {
    return {
      contact_exists: false,
      contact_record: null,
    };
  }

  const contact_record = await models.contact.findOne({
    where: {
      [Op.and]: [
        sequelize.literal("REPLACE(mobile_number, ' ', '')"),
        sequelize.literal("REPLACE(mobile_number, '-', '')"),
        sequelize.literal("REPLACE(mobile_number, '+', '')"),
        sequelize.literal("REPLACE(mobile_number, '(', '')"),
        sequelize.literal("REPLACE(mobile_number, ')', '')"),
        sequelize.literal("REPLACE(mobile_number, '.', '')"),
      ],
      mobile_number: params.mobile_number,
      agency_fk: params.agency_id,
    },
  });

  return {
    contact_exists: h.notEmpty(contact_record),
    contact_record,
  };
}

const schema = {
  params: {
    agency_id: { type: 'string' },
  },
  query: {
    sfObject: { type: 'string' },
  },
  body: {
    type: 'object',
    required: ['contact_list'],
    properties: {
      sf_contact_ids: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
};

/**
 * Description
 * Function to generate contact record and add to the contact list
 * @async
 * @function
 * @name createNewHubSpotContact
 * @kind function
 * @param {object} params breakdown below
 * @param {object} contact contact data from the csv file
 * @param {string} mobile_number contact mobile number
 * @param {string} agency_id agency ID
 * @param {string} contact_list_id the list where contact is to be added
 * @param {string} user_id User who initiated the upload
 * @param {object} misc miscellaneous data and functions
 * @returns {Promise} returns the contact ID
 */
async function createNewHubSpotContact(params, misc) {
  const { contact, mobile_number, agency_id, user_id, contact_source_type } =
    params;
  const { log } = misc;
  log.info({
    function: 'createNewHubSpotContact',
    action: 'Generate contact record',
  });
  const contact_tx = await models.sequelize.transaction();
  try {
    const agency = await c.agency.findOne(
      {
        agency_id,
      },
      { transaction: contact_tx },
    );

    const contact_owner_id = isValidContactOwnerID(contact.contact_owner)
      ? contact.contact_owner
      : null;

    const default_contact_owner = await validateDefaultContactOwner(
      agency?.default_outsider_contact_owner,
    );

    const contact_owner = h.notEmpty(contact_owner_id)
      ? contact_owner_id
      : h.notEmpty(default_contact_owner)
      ? default_contact_owner
      : null;
    // create the main contact record
    const contact_id = await c.contact.create(
      {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email ? contact.email.trim() : contact.email,
        mobile_number: h.notEmpty(mobile_number) ? mobile_number.trim() : null,
        agency_fk: agency_id,
        agency_user_fk: contact_owner,
        from_export: true,
        status: 'active',
        created_by: user_id,
      },
      { transaction: contact_tx },
    );

    // create contact source record
    await c.contactSource.create(
      {
        contact_fk: contact_id,
        source_contact_id: contact_id,
        source_type: contact_source_type,
        source_meta: null,
        source_original_payload: null,
        created_by: user_id,
      },
      { transaction: contact_tx },
    );

    await contact_tx.commit();
    return contact_id;
  } catch (contactCreationErr) {
    log.error({
      function: 'createNewHubSpotContact',
      response: contactCreationErr,
      stringifiedErr: JSON.stringify(contactCreationErr),
    });
    await contact_tx.rollback();
    throw new Error(contactCreationErr);
  }
}

/**
 * Description
 * Function to update existing contact record
 * @async
 * @function
 * @name updateExistingHubSpotContact
 * @kind function
 * @param {object} params breakdown below
 * @param {object} contact_record contact data from database
 * @param {object} contact contact data from the csv file
 * @param {string} mobile_number contact mobile number
 * @param {string} agency_id agency ID
 * @param {string} user_id User who initiated the upload
 * @param {object} misc miscellaneous data and functions
 * @returns {Promise} returns the contact ID
 */
async function updateExistingHubSpotContact(params, misc) {
  const {
    contact_record,
    contact,
    mobile_number,
    agency_id,
    user_id,
    contact_source_type,
  } = params;
  const { contact_id } = contact_record;
  const { log } = misc;

  log.info({
    function: 'updateExistingHubSpotContact',
    action: 'Update contact record',
  });
  const contact_tx = await models.sequelize.transaction();

  try {
    // getting default contact owner of the agency
    const agency = await c.agency.findOne(
      {
        agency_id,
      },
      { transaction: contact_tx },
    );
    // check if the csv has valid contact owner UUID
    const contact_owner_id = isValidContactOwnerID(contact.contact_owner)
      ? contact.contact_owner
      : null;

    const default_contact_owner = await validateDefaultContactOwner(
      agency?.default_outsider_contact_owner,
    );

    const contact_owner = h.notEmpty(contact_owner_id)
      ? contact_owner_id
      : h.notEmpty(default_contact_owner)
      ? default_contact_owner
      : null;
    // get contact source record if exists
    const contact_source_record = await c.contactSource.findOne(
      {
        contact_fk: contact_id,
      },
      { transaction: contact_tx },
    );

    await c.contact.update(
      contact_id,
      {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email ? contact.email.trim() : contact.email,
        mobile_number: h.notEmpty(mobile_number) ? mobile_number.trim() : null,
        agency_fk: agency_id,
        agency_user_fk: contact_owner,
        updated_by: user_id,
      },
      { transaction: contact_tx },
    );

    if (h.isEmpty(contact_source_record)) {
      // create contact source record if the existing contact does not have yet
      await c.contactSource.create(
        {
          contact_fk: contact_id,
          source_contact_id: contact_id,
          source_type: contact_source_type,
          source_meta: null,
          source_original_payload: null,
          created_by: user_id,
        },
        { transaction: contact_tx },
      );
    }

    await contact_tx.commit();
    return contact_id;
  } catch (contactupdateErr) {
    Sentry.captureException(contactupdateErr);
    log.error({
      function: 'updateExistingHubSpotContact',
      response: contactupdateErr,
      stringifiedErr: JSON.stringify(contactupdateErr),
    });
    await contact_tx.rollback();
    throw new Error(contactupdateErr);
  }
}

/**
 * Description
 * Validate if the given owner ID is a UUID
 * @function
 * @name isValidContactOwnerID
 * @kind function
 * @param {string} contact_owner_id
 * @returns {boolean} returs boolean
 */
function isValidContactOwnerID(contact_owner_id) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(contact_owner_id);
}

/**
 * Description
 * Validates if the default contact owner still exists
 * @async
 * @function
 * @name validateDefaultContactOwner
 * @kind function
 * @param {string} agency_user_id
 * @returns {Promise} returns back the agency user id or null
 */
async function validateDefaultContactOwner(agency_user_id) {
  // check agency user record
  const agencyUser = await c.agencyUser.findOne({
    agency_user_id: agency_user_id,
  });
  if (h.isEmpty(agencyUser)) {
    return null;
  }

  // check user record
  const agencyUserRecord = await c.user.findOne({
    user_id: agencyUser?.user_fk,
  });
  if (h.isEmpty(agencyUserRecord)) {
    return null;
  }

  return agency_user_id;
}

module.exports.preValidation = preValidation;
module.exports.handler = handler;
module.exports.schema = schema;
