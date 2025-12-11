const Sentry = require('@sentry/node');

const c = require('../../../../controllers');
const models = require('../../../../models');
const h = require('../../../../helpers');

/**
 * Description
 * Function to create contact from whatsapp
 * @async
 * @function
 * @name processSaveContactRecord
 * @kind function
 * @param {object} contactData contact data
 * @param {object} contactSourceData contact source data
 * @param {object} log server log
 * @returns {Promise<string>} returns the contact id
 */
async function processSaveContactRecord({
  contactData,
  contactSourceData,
  log,
}) {
  const contact_tx = await models.sequelize.transaction();
  try {
    const {
      contactFirstName,
      contactLastName,
      receiver_number,
      email = null,
      is_whatsapp,
      agency_id,
      agency_user_id,
      from_export = false,
      contactStatus,
      created_by = null,
    } = contactData;

    const contact_id = await c.contact.create(
      {
        first_name: contactFirstName,
        last_name: contactLastName,
        email: email,
        mobile_number: receiver_number,
        is_whatsapp: is_whatsapp,
        agency_fk: agency_id,
        agency_user_fk: agency_user_id,
        from_export: from_export,
        status: contactStatus,
        created_by: created_by,
      },
      { transaction: contact_tx },
    );

    const {
      source_type,
      source_contact_id,
      source_original_payload = null,
      source_meta = null,
    } = contactSourceData;

    await c.contactSource.create(
      {
        contact_fk: contact_id,
        source_contact_id: source_contact_id,
        source_type: source_type,
        source_meta: source_meta,
        source_original_payload: source_original_payload,
        created_by: created_by,
      },
      { transaction: contact_tx },
    );

    await contact_tx.commit();

    return contact_id;
  } catch (contactCreationErr) {
    Sentry.captureException(contactCreationErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'processSaveContactRecord',
      response: contactCreationErr,
      stringifiedErr: JSON.stringify(contactCreationErr),
    });
    await contact_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Adds a contact to a specified contact list and increments the user count for the list.
 *
 * @param {string} contactId The ID of the contact to add to the list.
 * @param {string} contactListId The ID of the contact list where the contact will be added.
 * @param {string} importType The type of import (e.g., "WIX", "SALESFORCE").
 * @param {string} createdBy The identifier of the user or agency that created the record.
 * @param {object} transaction (Optional) Sequelize transaction object to ensure atomic operations.
 * @param {object} log Logging utility for capturing logs.
 * @returns {Promise<void>} A promise that resolves once the contact is added and the list is updated.
 */
async function addContactToContactList({
  contactId,
  contactListId,
  importType,
  createdBy,
  transaction,
  log,
}) {
  const contact_tx = transaction || (await models.sequelize.transaction());
  try {
    await c.contactListUser.create(
      {
        contact_list_id: contactListId,
        contact_id: contactId,
        import_type: importType,
        created_by: createdBy,
      },
      { transaction: contact_tx },
    );

    await c.contactList.increment(
      { contact_list_id: contactListId },
      'user_count',
      1,
      { transaction: contact_tx },
    );
  } catch (error) {
    Sentry.captureException(error);
    log.error({
      message: 'ADD CONTACT TO CONTACT LIST ERROR',
      function: 'addContactToContactList',
      response: error,
      stringifiedErr: JSON.stringify(error),
    });
    await contact_tx.rollback();
    throw new Error('ADD_CONTACT_TO_CONTACT_LIST_ERROR ERROR');
  }
}

/**
 * Removes a contact from a specified contact list and decrements the user count for the list.
 *
 * @param {string} contactId The ID of the contact to remove from the list.
 * @param {string} contactListId The ID of the contact list from which the contact will be removed.
 * @param {object} transaction (Optional) Sequelize transaction object to ensure atomic operations.
 * @param {object} log Logging utility for capturing logs.
 * @returns {Promise<void>} A promise that resolves once the contact is removed and the list is updated.
 * @throws {Error} Throws an error if removing the contact or decrementing the user count fails.
 */
async function removeContactFromContactList({
  contactId,
  contactListId,
  transaction,
  log,
}) {
  const contact_tx = transaction || (await models.sequelize.transaction());
  try {
    const existingContact = await c.contactListUser.findOne({
      contact_id: contactId,
      contact_list_id: contactListId,
    });

    if (existingContact) {
      await c.contactListUser.destroy(
        {
          contact_id: contactId,
          contact_list_id: contactListId,
        },
        { transaction: contact_tx },
      );
      await c.contactList.increment(
        { contact_list_id: contactListId },
        'user_count',
        -1,
        { transaction: contact_tx },
      );
      log.info({
        message: `Removed contact from list ${contactListId}`,
        function: 'removeContactFromContactList',
      });
    }
  } catch (error) {
    Sentry.captureException(error);
    log.error({
      message: 'REMOVE CONTACT FROM CONTACT LIST ERROR',
      function: 'removeContactFromContactList',
      response: error,
      stringifiedErr: JSON.stringify(error),
    });
    await contact_tx.rollback();
    throw new Error('REMOVE_CONTACT_FROM_CONTACT_LIST_ERROR ERROR');
  }
}

/**
 * Description
 * Function to handle marking opt out for contact
 * @async
 * @function
 * @name handleOptOutInAutoResponse
 * @kind function
 * @param {object} whatsappMsgTrackerForReplyUpdate current tracker record
 * @param {string} receiver_number contact number
 * @param {object} models database table object
 * @param {object} log server log function
 * @param {object} transaction db process transaction
 */
async function handleOptOutInAutoResponse({
  whatsappMsgTrackerForReplyUpdate,
  receiver_number,
  models,
  log,
}) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'handleOptOutInAutoResponse',
    action: 'opt out contact from whatsapp proposal messages',
    mobile_number: receiver_number,
  });
  const contact_opt_out_tx = await models.sequelize.transaction();
  try {
    await models.contact.update(
      {
        opt_out_whatsapp: 1,
        opt_out_whatsapp_date: h.date.getSqlCurrentDate(),
      },
      {
        where: {
          mobile_number: receiver_number,
          agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
        },
        transaction: contact_opt_out_tx,
      },
    );
    await contact_opt_out_tx.commit();
  } catch (optOutWhatsAppErr) {
    Sentry.captureException(optOutWhatsAppErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'handleOptOutInAutoResponse',
      action: 'WHATSAPP MESSAGE OPT OUT ERROR',
      response: optOutWhatsAppErr,
    });
    await contact_opt_out_tx.rollback();
    throw new Error('WHATSAPP MESSAGE OPT OUT ERROR');
  }
}

/**
 * Description
 * Function to save initial contact salesforce record
 * @async
 * @function
 * @name saveInitialContactSalesforceRecord
 * @kind function
 * @param {string} contact_id contact id
 * @param {object} contact_salesforce_data_record initial salesforce data
 * @param {object} log server log
 */
async function saveInitialContactSalesforceRecord({
  contact_id,
  contact_salesforce_data_record,
  log,
}) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'saveInitialContactSalesforceRecord',
    action: 'CHECK IF CONTACT SALESFORCE RECORD EXISTS',
    contact_id,
  });
  const contactSalesforceRecord = await c.contactSalesforceData.findOne({
    contact_fk: contact_id,
  });

  if (h.isEmpty(contactSalesforceRecord)) {
    log.info({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'saveInitialContactSalesforceRecord',
      action: 'SAVE CONTACT SALESFORCE RECORD',
      data: contact_salesforce_data_record,
    });
    const save_salesforce_contact_tx = await models.sequelize.transaction();
    try {
      await c.contactSalesforceData.create(contact_salesforce_data_record, {
        transaction: save_salesforce_contact_tx,
      });
      await save_salesforce_contact_tx.commit();
    } catch (saveContactSalesforceRecordErr) {
      Sentry.captureException(saveContactSalesforceRecordErr);
      log.error({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'saveInitialContactSalesforceRecord',
        action: 'SAVE CONTACT SALESFORCE RECORD ERROR',
        response: saveContactSalesforceRecordErr,
      });
      await save_salesforce_contact_tx.rollback();
      throw new Error('SAVE CONTACT SALESFORCE RECORD ERROR');
    }
  }
}

/**
 * Description
 * Function to update common contact fields related to salesforce sync
 * If salesforce is not enabled or is not enabled for whatsapp - this function
 * will not be triggered
 * @async
 * @function
 * @name UpdateContactIfSFDC
 * @kind function
 * @param {string} salesforce_field the field to update
 * @param {string} contact_id contact od
 * @param {string} message field value
 * @param {object} log server log
 */
async function UpdateContactIfSFDC(salesforce_field, contact_id, message, log) {
  if (['first_name', 'last_name', 'email'].includes(salesforce_field)) {
    log.info({ message: 'updating contact record if name or email' });
    const updateContactData = {};
    updateContactData[salesforce_field] = message;
    const contact_tx = await models.sequelize.transaction();
    try {
      await c.contact.update(contact_id, updateContactData, {
        transaction: contact_tx,
      });
      await contact_tx.commit();
    } catch (contactErr) {
      Sentry.captureException(contactErr);
      log.error({
        consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
        function: 'UpdateContactIfSFDC',
        response: contactErr,
        stringifiedErr: JSON.stringify(contactErr),
      });
      await contact_tx.rollback();
      throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
    }
  }
}

/**
 * Description
 * Function to update contact salesforce record
 * @async
 * @function
 * @name updateContactSalesforceData
 * @kind function
 * @param {object} updateData update data
 * @param {string} contact_salesforce_data_id record id to update
 * @param {object} log server log
 */
async function updateContactSalesforceData(
  updateData,
  contact_salesforce_data_id,
  log,
) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'updateContactSalesforceData',
    data: updateData,
  });
  const salesforce_data_tx = await models.sequelize.transaction();
  try {
    await c.contactSalesforceData.update(
      contact_salesforce_data_id,
      updateData,
      null,
      {
        transaction: salesforce_data_tx,
      },
    );
    await salesforce_data_tx.commit();
  } catch (contactErr) {
    Sentry.captureException(contactErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'updateContactSalesforceData',
      response: contactErr,
      stringifiedErr: JSON.stringify(contactErr),
    });
    await salesforce_data_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Description
 * Function to create contact source record for sf contact
 * @async
 * @function
 * @name createContactSourceRecord
 * @kind function
 * @param {string} contact_id contact id
 * @param {string} sf_id salesforce id
 * @param {object} log server log
 */
async function createContactSourceRecord(contact_id, sf_id, log) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'createContactSourceRecord',
  });
  const contact_source_tx = await models.sequelize.transaction();
  try {
    await c.contactSource.create(
      {
        contact_fk: contact_id,
        source_contact_id: sf_id,
        source_type: 'SALESFORCE',
      },
      {
        transaction: contact_source_tx,
      },
    );
    await contact_source_tx.commit();
  } catch (contactErr) {
    Sentry.captureException(contactErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'createContactSourceRecord',
      response: contactErr,
      stringifiedErr: JSON.stringify(contactErr),
    });
    await contact_source_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

/**
 * Description
 * Function to create contact notes related to salesforce contact
 * @async
 * @function
 * @name createContactNotes
 * @kind function
 * @param {object} sf_required_fields sf contact data
 * @param {string} formatted_contact_phone contact formatted mobile number
 * @param {date} finalParsedDate final parsed data for contact
 * @param {string} contact_id contact id
 */
async function createContactNotes(
  sf_required_fields,
  formatted_contact_phone,
  finalParsedDate,
  contact_id,
) {
  const contact = await c.contact.findOne({ contact_id });
  const contact_note = `First Name: ${sf_required_fields.first_name}<br/>
            Last Name: ${sf_required_fields.last_name}<br/>
            Email: ${sf_required_fields.email}<br/>
            Mobile: ${formatted_contact_phone}<br/>
            Language: ${sf_required_fields.language}<br/>
            Interested Product: ${sf_required_fields.interested_product}<br/>
            Interested City: ${sf_required_fields.interested_city}<br/>
            Lead Source: ${sf_required_fields.lead_source}<br/>
            Lead Channel: ${sf_required_fields.lead_source_lv1}<br/>
            Origin: ${sf_required_fields.lead_source_lv2}<br/>
            Marketing Enabled: ${
              h.cmpBool(sf_required_fields.enable_marketing, true)
                ? 'Yes'
                : 'No'
            }<br/>
            TNC Agreed: ${finalParsedDate}`;
  const note_data = {
    contact_note_id: h.general.generateId(),
    contact_fk: contact_id,
    agency_user_fk: contact?.agency_user_fk,
    note: contact_note,
  };
  await models.contact_note.create(note_data);
}

/**
 * Description
 * Function to update owner of an existing contact with no assigned owner
 * @async
 * @function
 * @name updateContactOwner
 * @kind function
 * @param {string} contact_id contact ID
 * @param {string} agency_user_id contact owner ID
 * @param {object} log server log
 */
async function updateContactOwner({ contact_id, agency_user_id, log }) {
  log.info({
    consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
    function: 'updateContactOwner',
  });
  const contact_tx = await models.sequelize.transaction();
  try {
    await models.contact.update(
      {
        agency_user_fk: agency_user_id,
      },
      { where: { contact_id }, transaction: contact_tx },
    );
    await contact_tx.commit();
  } catch (contactErr) {
    Sentry.captureException(contactErr);
    log.error({
      consumer: 'WHATSAPP_WEBHOOK_PROCESSOR',
      function: 'updateContactOwner',
      response: contactErr,
      stringifiedErr: JSON.stringify(contactErr),
    });
    await contact_tx.rollback();
    throw new Error('WHATSAPP_WEBHOOK_PROCESSOR ERROR');
  }
}

module.exports = {
  processSaveContactRecord: processSaveContactRecord,
  handleOptOutInAutoResponse: handleOptOutInAutoResponse,
  saveInitialContactSalesforceRecord: saveInitialContactSalesforceRecord,
  UpdateContactIfSFDC: UpdateContactIfSFDC,
  updateContactSalesforceData: updateContactSalesforceData,
  createContactSourceRecord: createContactSourceRecord,
  createContactNotes: createContactNotes,
  updateContactOwner: updateContactOwner,
  addContactToContactList: addContactToContactList,
  removeContactFromContactList: removeContactFromContactList,
};
