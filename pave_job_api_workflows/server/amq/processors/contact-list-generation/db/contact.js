const Sentry = require('@sentry/node');
const c = require('../../../../controllers');
const models = require('../../../../models');
const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const commonFunctions = require('../list-generation-common-functions-handler');

/**
 * Description
 * Function to generate contact record and add to the contact list
 * @async
 * @function
 * @name generateAndAddContactToList
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
async function generateAndAddContactToList(params, misc) {
  const {
    contact,
    mobile_number,
    agency_id,
    contact_list_id,
    user_id,
    contact_list_add_type,
    contact_source_type,
  } = params;
  const { processor_name, consumer, log } = misc;
  log.info({
    processor_name,
    consumer,
    function: 'generateAndAddContactToList',
    action: 'Generate contact record and add to list',
  });
  const contact_tx = await models.sequelize.transaction();
  try {
    const agency = await c.agency.findOne(
      {
        agency_id,
      },
      { transaction: contact_tx },
    );

    const contact_owner_id = commonFunctions.isValidContactOwnerID(
      contact.contact_owner,
    )
      ? contact.contact_owner
      : null;

    const default_contact_owner =
      await commonFunctions.validateDefaultContactOwner(
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

    // Create contact list record
    await c.contactListUser.create(
      {
        contact_list_id,
        contact_id: contact_id,
        import_type: contact_list_add_type,
        created_by: user_id,
      },
      { transaction: contact_tx },
    );
    await contact_tx.commit();
    return contact_id;
  } catch (contactCreationErr) {
    console.log(contactCreationErr);
    Sentry.captureException(contactCreationErr);
    log.error({
      processor_name,
      consumer,
      function: 'generateAndAddContactToList',
      response: contactCreationErr,
      stringifiedErr: JSON.stringify(contactCreationErr),
    });
    await contact_tx.rollback();
    throw new Error(consumer);
  }
}

/**
 * Description
 * Function to update existing contact record and add to contact list
 * @async
 * @function
 * @name updateAndAddExistingContactToList
 * @kind function
 * @param {object} params breakdown below
 * @param {object} contact_record contact data from database
 * @param {object} contact contact data from the csv file
 * @param {string} mobile_number contact mobile number
 * @param {string} agency_id agency ID
 * @param {string} contact_list_id the list where contact is to be added
 * @param {string} user_id User who initiated the upload
 * @param {array} processedContactIds processed contacts included in the list
 * @param {object} misc miscellaneous data and functions
 * @returns {Promise} returns the contact ID
 */
async function updateAndAddExistingContactToList(params, misc) {
  const {
    contact_record,
    contact,
    mobile_number,
    agency_id,
    contact_list_id,
    user_id,
    processedContactIds,
    contact_list_add_type,
    contact_source_type,
  } = params;
  const { contact_id } = contact_record;
  const { processor_name, consumer, log } = misc;

  log.info({
    processor_name,
    consumer,
    function: 'updateAndAddExistingContactToList',
    action: 'Update contact record and add to list',
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
    const contact_owner_id = commonFunctions.isValidContactOwnerID(
      contact.contact_owner,
    )
      ? contact.contact_owner
      : null;

    const default_contact_owner =
      await commonFunctions.validateDefaultContactOwner(
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

    // check if contact is already in the list
    const contactListUserRecord = await c.contactListUser.findOne(
      {
        contact_list_id,
        contact_id,
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

    if (
      h.isEmpty(contactListUserRecord) &&
      !processedContactIds.includes(contact_id)
    ) {
      await c.contactListUser.create(
        {
          contact_list_id,
          contact_id,
          import_type: contact_list_add_type,
          created_by: user_id,
        },
        { transaction: contact_tx },
      );
    }
    await contact_tx.commit();
    return contact_id;
  } catch (contactupdateErr) {
    console.log(contactupdateErr);
    Sentry.captureException(contactupdateErr);
    log.error({
      processor_name,
      consumer,
      function: 'updateAndAddExistingContactToList',
      response: contactupdateErr,
      stringifiedErr: JSON.stringify(contactupdateErr),
    });
    await contact_tx.rollback();
    throw new Error(consumer);
  }
}

/**
 * Description
 * Function to update the contact list entry count
 * @async
 * @function
 * @name updateContactListCount
 * @kind function
 * @param {string} contact_list_id contact list to update count
 * @param {object} misc miscellaneous data and functions
 */
async function updateContactListCount(contact_list_id, misc) {
  const { processor_name, consumer, log } = misc;
  const where = {
    contact_list_id: contact_list_id,
  };
  const contactListUserCount = await c.contactListUser.count(where);
  try {
    await models.contact_list.update(
      {
        user_count: contactListUserCount,
        status: constant.CONTACT_LIST.STATUS.PUBLISHED,
      },
      {
        where,
      },
    );

    return true;
  } catch (contactListErr) {
    log.error({
      processor_name,
      consumer,
      function: 'updateContactListCount',
      response: contactListErr,
      stringifiedErr: JSON.stringify(contactListErr),
    });
  }
}

module.exports = {
  generateAndAddContactToList: generateAndAddContactToList,
  updateAndAddExistingContactToList: updateAndAddExistingContactToList,
  updateContactListCount: updateContactListCount,
};
