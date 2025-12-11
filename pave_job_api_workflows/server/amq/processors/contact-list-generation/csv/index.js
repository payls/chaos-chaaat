const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

const commonFunctions = require('../list-generation-common-functions-handler');
const contactDBHandler = require('../db/contact');

const processor_name = 'contact-list-generation';
const consumer = 'CONTACT_LIST_FROM_CSV_UPLOAD';

async function generateList({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) {
  const { data: generateCSVContactListData } = JSON.parse(
    data.content.toString(),
  );

  log.info({
    consumer,
    processor_name,
    generateCSVContactListData,
  });

  const { contact_list_id, contact_list, user_id } = generateCSVContactListData;
  try {
    const agency_id = await processCSVContactListData(
      contact_list_id,
      contact_list,
      user_id,
      log,
    );
    await contactDBHandler.updateContactListCount(contact_list_id, {
      processor_name,
      consumer,
      log,
    });
    // check if contact capacity is now 80 90 or 100
    await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);
    log.info({
      consumer,
      processor_name,
      function: 'generateList',
      message: 'PROCESS COMPLETE',
    });
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (mainErr) {
    Sentry.captureException(mainErr);
    log.error({
      err: mainErr,
      stringifiedErr: JSON.stringify(mainErr),
      consumer,
      processor_name,
      function: 'generateList',
    });
    return await channel.nack(data, false, false);
  }
}

async function processCSVContactListData(
  contact_list_id,
  contact_list,
  user_id,
  log,
) {
  // get contact list record data
  const { agency_fk: agency_id } = await c.contactList.findOne({
    contact_list_id,
  });
  const processedContactIds = [];
  for (const contact of contact_list) {
    const mobile_number = commonFunctions.santizeMobileNumber(
      contact.phone_number,
    );
    let contact_id = null;

    // get contact record based on formatted mobile number
    const { contact_exists, contact_record } =
      await commonFunctions.getContactDetailsBasedOnMobileNumber(
        {
          agency_id,
          mobile_number,
        },
        {
          processor_name,
          consumer,
          log,
        },
      );

    // if no contact is still associated with the given number - create contact
    const contact_list_add_type = 'CSV';
    const contact_source_type = 'csv_webapp_admin';
    if (h.cmpBool(contact_exists, false)) {
      contact_id = await contactDBHandler.generateAndAddContactToList(
        {
          contact,
          mobile_number,
          agency_id,
          contact_list_id,
          user_id,
          contact_list_add_type,
          contact_source_type,
        },
        {
          processor_name,
          consumer,
          log,
        },
      );
      if (h.notEmpty(contact_id)) {
        processedContactIds.push(contact_id);
      }
    } else {
      /**
       * If contact already exists - update the contact record
       * If not yet added to list - add the contact
       */
      contact_id = await contactDBHandler.updateAndAddExistingContactToList(
        {
          contact_record,
          contact,
          mobile_number,
          agency_id,
          contact_list_id,
          user_id,
          processedContactIds,
          contact_list_add_type,
          contact_source_type,
        },
        {
          processor_name,
          consumer,
          log,
        },
      );

      if (h.notEmpty(contact_id) && !processedContactIds.includes(contact_id)) {
        processedContactIds.push(contact_id);
      }
    }
  }

  return agency_id;
}

module.exports = {
  generateList: generateList,
};
