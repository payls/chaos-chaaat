const Sentry = require('@sentry/node');
const { Client } = require('@hubspot/api-client');
const h = require('../../../../helpers');
const c = require('../../../../controllers');
const models = require('../../../../models');

const commonFunctions = require('../list-generation-common-functions-handler');
const contactDBHandler = require('../db/contact');

const processor_name = 'contact-list-generation';
const consumer = 'CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD';

async function generateList({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) {
  const { data: generateHubSpotContactListData } = JSON.parse(
    data.content.toString(),
  );

  log.info({
    consumer,
    processor_name,
    generateHubSpotContactListData,
  });

  const { contact_list_id, contact_list, user_id } =
    generateHubSpotContactListData;
  try {
    const agency_id = await processHubSpotListContactListData(
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

/**
 * Description
 * process hubspot contact list to save in database
 * @async
 * @function
 * @name processHubSpotListContactListData
 * @kind function
 * @param {string} contact_list_id contact list to update
 * @param {object} contact_list list to process
 * @param {string} user_id user who initiated the request
 * @param {object} log log
 * @returns {Promise<any>}
 */
async function processHubSpotListContactListData(
  contact_list_id,
  contact_list,
  user_id,
  log,
) {
  // get contact list record data
  const { agency_fk: agency_id } = await c.contactList.findOne({
    contact_list_id,
  });

  const agency = await c.agency.findOne({ agency_id });

  // start connecting to hubspot client
  const agencyOauth = await c.agencyOauth.findOne(
    {
      agency_fk: agency_id,
      source: 'HUBSPOT',
      status: 'active',
    },
    {
      order: [['created_date', 'DESC']],
    },
  );

  const { oauthRefreshResponse, hubspotClient } =
    await h.hubspot.hubspotConnect({
      agencyOauth,
      log: log,
    });

  const processedContactIds = [];
  const properties = [
    'hubspot_owner_id',
    'contact_lead',
    'firstname',
    'lastname',
    'email',
    'mobilephone',
    'phone',
  ];
  for (const contactData of contact_list) {
    const contactHubSpotID = contactData.recordId;

    let contact = await h.hubspot.getActiveContactDetails(
      hubspotClient,
      contactHubSpotID,
      properties,
      log,
    );

    if (h.isEmpty(contact)) {
      contact = await h.hubspot.getArchivedContactDetails(
        hubspotClient,
        contactHubSpotID,
        properties,
        log,
      );
    }

    let mobile_number = h.notEmpty(contact?.properties?.mobilephone)
      ? contact?.properties?.mobilephone
      : contact?.properties?.phone;
    mobile_number = commonFunctions.santizeMobileNumber(mobile_number);
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

    const owner = await h.hubspot.processContactOwner(
      { contact, agency, hubspotClient },
      { models, log },
    );

    let contact_owner_id = null;

    if (h.notEmpty(owner) && h.notEmpty(owner?.email)) {
      const contact_owner = await c.user.findOne(
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

    const contact_list_add_type = 'HUBSPOT LIST';
    const contact_source_type = 'hubspot';

    // if no contact is still associated with the given number - create contact
    if (h.cmpBool(contact_exists, false)) {
      contact_id = await contactDBHandler.generateAndAddContactToList(
        {
          contact: {
            contact_owner: contact_owner_id,
            first_name: contact?.properties?.firstname,
            last_name: contact?.properties?.lastname,
            email: contact?.properties?.email,
          },
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
          contact: {
            contact_owner: contact_owner_id,
            first_name: contact?.properties?.firstname,
            last_name: contact?.properties?.lastname,
            email: contact?.properties?.email,
          },
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
