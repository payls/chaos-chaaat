const Sentry = require("@sentry/node");
const { v4: uuidv4 } = require("uuid");
const { AppStrategy, createClient } = require("@wix/sdk");
const { orders } = require("@wix/pricing-plans");
const { contacts } = require("@wix/crm");
const c = require("../../controllers");
const h = require("../../helpers");
const contactDBHandler = require("../../amq/processors/waba-payload-processor/db/contact");

const models = require("../../models");
const wixHelper = require("../../helpers/wix");

const actionTypes = {
  wix_webhook_receive: "wix_webhook_receive",
  chaaat_unsubscribe: "chaaat_unsubscribe",
  chaaat_contact_update: "chaaat_contact_update",
};

/**
 * Description
 * Consumer for handling wix payload
 *
 * @param {object} data holds wix payload data
 * @param {object} models existing database table models
 * @param {object} channel rabbit mq channel used
 * @param {object} config rabbitmq/amq configuration
 * @param pubChannel
 * @param {object} log server log functions
 */
async function receiveWixPayload({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
}) {
  try {
    const { data: payload } = JSON.parse(data.content.toString());

    const actionType = payload.action;

    switch (actionType) {
      case actionTypes.wix_webhook_receive:
        await processWixWebhook({ config, payload, log });
        break;
      case actionTypes.chaaat_unsubscribe:
        await processCancelOrder({ contactId: payload.contactId, log });
        break;
      case actionTypes.chaaat_contact_update:
        await processUpdateContactIntoWix({
          contactId: payload.contactId,
          log,
        });
        break;
      default:
        break;
    }
    log.info({
      consumer: "WIX_PAYLOAD_PROCESSOR",
      function: "receiveWixPayload",
      message: "PROCESS COMPLETE",
    });
    if (channel && channel.ack) {
      log.info("Channel for acknowledgment");
      return await channel.ack(data);
    } else {
      log.error("Channel not available for acknowledgment");
      throw new Error("AMQ channel not available");
    }
  } catch (error) {
    Sentry.captureException(error);
    log.error({
      err: error,
      stringifiedErr: JSON.stringify(error),
      consumer: "WIX_PAYLOAD_PROCESSOR",
      function: "receiveWixPayload",
    });
    return await channel.nack(data, false, false);
  }
}

/**
 * Processes the Wix webhook payload.
 *
 * @param {object} config Configuration object containing Wix credentials.
 * @param {object} payload Webhook payload containing event data.
 * @param {object} log Logging utility for capturing logs.
 */
const processWixWebhook = async ({ config, payload, log }) => {
  try {
    const client = getWixClient(config);
    const parsedResponse = await client.webhooks.process(payload.body);
    const eventType = parsedResponse.eventType.split(".").pop();

    log.info({ body: parsedResponse, function: "processWixWebhook" });

    switch (eventType) {
      case "order_created":
        await processOrderCreatedEvent(parsedResponse, log);
        break;
      case "order_canceled":
        await processOrderCanceledEvent(parsedResponse, log);
        break;
      case "contact_updated":
        await processUpdateContactIntoDB(parsedResponse.payload, log);
        break;
      default:
        break;
    }
  } catch (error) {
    Sentry.captureException(error);
    log.error({
      err: error,
      stringifiedErr: JSON.stringify(error),
      consumer: "WIX_WEBHOOK_PROCESSOR",
      function: "processWixWebhook",
    });
  }
};

/**
 * Creates and returns a Wix client instance.
 *
 * @param {object} config Configuration object containing Wix credentials.
 * @returns {object} Wix client instance.
 */
const getWixClient = (config) => {
  const APP_ID = config.wix.appId;
  const PUBLIC_KEY = config.wix.publicKey;

  const client = createClient({
    auth: AppStrategy({
      appId: APP_ID,
      publicKey: PUBLIC_KEY,
    }),
    modules: { orders, contacts },
  });

  return client;
};

/**
 * Handles the "order_created" event from the Wix webhook.
 *
 * @param {object} payload Event payload data.
 * @param {object} log Logging utility for capturing logs.
 */
const processOrderCreatedEvent = async (payload, log) => {
  try {
    const dealz_agency_id = process.env.DEALZ_AGENCY_ID;
    const { success, access_token } = await wixHelper.getWixAccessToken({
      instanceId: payload.instanceId,
      log,
    });
    if (!success || !access_token) {
      log.error({
        message: "FAILED TO PROCESS ORDER CREATED EVENT",
        function: "processOrderCreatedEvent",
      });
      return;
    }

    const contactInfo = await wixHelper.getWixContact({
      contactId: payload.payload.createdEvent.entity.buyer.contactId,
      accessToken: access_token,
      log,
    });

    if (!contactInfo.success) {
      log.error({
        message: "FAILED TO GET WIX CONTACT",
        function: "processOrderCreatedEvent",
      });
      return;
    }

    log.info({
      body: JSON.stringify(contactInfo),
      function: "processOrderCreatedEvent",
    });

    const contactId = await processContactCreate({
      contactData: contactInfo.contact,
      dealz_agency_id,
      webhookPayload: payload,
      log,
    });

    if (contactId) {
      await addContactToContactList({
        contactId,
        dealz_agency_id,
        contactPlanId: payload.payload.createdEvent.entity.planId,
        log,
      });
    }
    return;
  } catch (error) {
    log.error({
      message: "FAILED TO PROCESS ORDER CREATED EVENT",
      function: "processOrderCreatedEvent",
      stringifiedErr: JSON.stringify(error),
    });
    Sentry.captureException(error);
  }
};

/**
 * Handles the "order_canceled" event from the Wix webhook.
 *
 * @param {object} payload Event payload data.
 * @param {object} log Logging utility for capturing logs.
 */
const processOrderCanceledEvent = async (payload, log) => {
  try {
    const contactSource = await models.contact_source.findOne({
      where: {
        source_contact_id:
          payload.payload.actionEvent.body.order.buyer.contactId,
      },
    });
    if (contactSource && contactSource.contact_fk) {
      await models.contact.update(
        {
          opt_out_whatsapp: 1,
        },
        {
          where: {
            contact_id: contactSource.contact_fk,
          },
        }
      );
    }
    return;
  } catch (error) {
    log.error({
      message: "FAILED TO PROCESS ORDER CANCEL EVENT",
      function: "processOrderCanceledEvent",
      stringifiedErr: JSON.stringify(error),
    });
    Sentry.captureException(error);
  }
};

/**
 * Handles the "contact_updated" event from the Wix webhook.
 *
 * @param {object} payload - Event payload containing the updated contact data.
 * @param {object} log - Logging utility for capturing logs.
 */

const processUpdateContactIntoDB = async (payload, log) => {
  const contact_tx = await models.sequelize.transaction();
  try {
    const wixContactId = payload?.updatedEvent?.currentEntity?.id ?? "";

    const contactSource = await models.contact_source.findOne({
      where: {
        source_contact_id: wixContactId,
        source_type: "WIX",
      },
    });

    if (!contactSource) {
      log.error({
        wixContactId,
        message: "No contact found. Skip Update",
        function: "processUpdateContactIntoDB",
      });
      return;
    }

    const contactData = payload.updatedEvent.currentEntity;

    const contactId = contactSource.contact_fk;
    await c.contact.update(
      contactId,
      {
        first_name: contactData?.info?.name?.first,
        last_name: contactData?.info?.name?.last,
        email: contactData?.primaryEmail?.email,
        mobile_number: removePlusFromNumber(
          contactData?.primaryPhone?.e164Phone
        ),
      },
      { transaction: contact_tx }
    );
    await contact_tx.commit();
  } catch (error) {
    await contact_tx.rollback();
    log.error({
      message: "FAILED TO UPDATE CONTACT",
      function: "processUpdateContactIntoDB",
      stringifiedErr: JSON.stringify(error),
    });
    Sentry.captureException(error);
  }
};

/**
 * Handles the contact updation into wix. this is triggered when contact updated into chaaat system
 *
 * @param {object} contactId - contactId
 * @param {object} log - Logging utility for capturing logs.
 */

const processUpdateContactIntoWix = async ({ contactId, log }) => {
  try {
    const contactSource = await models.contact_source.findOne({
      where: {
        contact_fk: contactId,
        source_type: "WIX",
      },
    });

    if (!contactSource) {
      log.error({
        contactId: contactId,
        message: "No contact source found.",
        function: "processUpdateContactIntoWix",
      });
      return;
    }

    const dbContact = await models.contact.findOne({
      where: {
        contact_id: contactId,
      },
    });

    const originalPayload = JSON.parse(contactSource.source_original_payload);

    const { success, access_token } = await wixHelper.getWixAccessToken({
      instanceId: originalPayload.instanceId,
      log,
    });

    if (success) {
      const contactInfo = await wixHelper.getWixContact({
        contactId: contactSource.source_contact_id,
        accessToken: access_token,
        log,
      });

      contactInfo.contact?.info?.emails?.items.forEach((item) => {
        if (item.primary) {
          item.email = dbContact.email;
        }
      });

      const phone_parts = h.mobile.getMobileParts(dbContact.mobile_number);
      if (h.notEmpty(phone_parts)) {
        contactInfo.contact?.info?.phones?.items.forEach((item) => {
          if (item.primary) {
            item.phone = dbContact.mobile_number;
            item.countryCode = phone_parts?.country?.id;
          }
        });
      }

      const body = {
        revision: contactInfo?.contact?.revision,
        allowDuplicates: false,
        info: {
          name: {
            first: dbContact.first_name,
            last: dbContact.last_name,
          },
          phones: contactInfo.contact?.info?.phones,
        },
      };

      await wixHelper.updateWixContact({
        contactId: contactSource.source_contact_id,
        body,
        accessToken: access_token,
        log,
      });
    }
  } catch (error) {
    log.error({
      message: "FAILED TO UPDATE CONTACT",
      function: "processUpdateContactIntoWix",
      stringifiedErr: JSON.stringify(error),
    });
    Sentry.captureException(error);
  }
};

/**
 * Removes the "+" symbol from a phone number.
 *
 * @param {string} phoneNumber Phone number string.
 * @returns {string} Phone number without the "+" symbol.
 */
const removePlusFromNumber = (phoneNumber) => {
  if (phoneNumber) {
    return phoneNumber.startsWith("+") ? phoneNumber.slice(1) : phoneNumber;
  }
};

/**
 * Creates a contact record in the database.
 *
 * @param {object} contactData contact data from wix.
 * @param {string} dealz_agency_id dealz agency id of chaaat.io
 * @param {object} webhookPayload Original webhook payload.
 * @param {object} log Logging utility for capturing logs.
 * @returns {string|null} Contact ID of the created contact, or null on failure.
 */
const processContactCreate = async ({
  contactData,
  dealz_agency_id,
  webhookPayload,
  log,
}) => {
  try {
    const contactSource = await models.contact_source.findOne({
      where: {
        source_contact_id: contactData.id,
      },
    });

    if (contactSource) {
      await processWixNewPlanCreation({
        contactSourceId: contactSource.contact_source_id,
        contactId: contactSource.contact_fk,
        orderPayload: webhookPayload,
        log,
      });
      return contactSource.contact_fk;
    }

    const agency = await models.agency.findOne({
      where: {
        agency_id: dealz_agency_id,
      },
    });

    if (!agency) {
      log.error({
        message: "No agency found!",
        function: "processContactCreate",
      });
      return;
    }
    const contact_id = await contactDBHandler.processSaveContactRecord({
      contactData: {
        agency_id: agency.agency_id,
        contactFirstName: contactData?.info?.name?.first,
        contactLastName: contactData?.info?.name?.last,
        email: contactData?.primaryEmail?.email,
        receiver_number: removePlusFromNumber(
          contactData?.primaryPhone?.e164Phone
        ),
        contactStatus: "active",
        agency_user_id: agency.default_outsider_contact_owner,
        created_by: agency.default_outsider_contact_owner,
        is_whatsapp: 0,
      },
      contactSourceData: {
        source_contact_id: contactData.id,
        source_type: "WIX",
        source_meta: null,
        source_original_payload: JSON.stringify(webhookPayload),
      },
      log,
    });
    return contact_id;
  } catch (error) {
    log.error({
      message: "FAILED TO CREATE CONTACT",
      function: "processContactCreate",
      stringifiedErr: JSON.stringify(error),
    });
    Sentry.captureException(error);
  }
};

/**
 * Determine the target contact lists based on the user's plan.
 *
 * @param {string} contactPlanId - The ID of the user's plan.
 * @returns {Array<string>} - List of target contact list IDs.
 */
const determineTargetContactLists = ({ contactPlanId }) => {
  const dealz_free_plan = process.env.DEALZ_FREE_PLAN_ID; // free plan ID of wix
  const masterContactListId = process.env.MASTER_CONTACT_LIST_ID;
  const weeklyContactListId = process.env.WEEKLY_CONTACT_LIST_ID;
  const dailyContactListId = process.env.DAILY_CONTACT_LIST_ID;

  const contactListIds = [];

  if (masterContactListId) {
    contactListIds.push(masterContactListId);
  }

  if (contactPlanId === dealz_free_plan) {
    contactListIds.push(weeklyContactListId);
  } else {
    contactListIds.push(dailyContactListId);
  }

  return contactListIds;
};

/**
 * Adds a contact to the appropriate contact list based on the plan.
 *
 * @param {string} contactId contact id.
 * @param {string} contactPlanId id of the plan for which contact subscribe to.
 * @param {string} dealz_agency_id dealz agency id of chaaat.io.
 * @param {object} log Logging utility for capturing logs.
 */
const addContactToContactList = async ({
  contactId,
  contactPlanId,
  dealz_agency_id,
  log,
}) => {
  const contact_tx = await models.sequelize.transaction();
  try {
    const weeklyContactListId = process.env.WEEKLY_CONTACT_LIST_ID;
    const dailyContactListId = process.env.DAILY_CONTACT_LIST_ID;

    const contactListIds = determineTargetContactLists({ contactPlanId });

    log.info({
      functionName: "addContactToContactList",
      message: "Contact will be added into these contact lists",
      contactListIds,
    });

    const agency = await models.agency.findOne({
      where: {
        agency_id: dealz_agency_id,
      },
    });

    await updateContactLists({
      contactId,
      targetContactListIds: contactListIds,
      allContactListIds: [weeklyContactListId, dailyContactListId],
      agency,
      transaction: contact_tx,
      log,
    });

    await contact_tx.commit();
  } catch (error) {
    await contact_tx.rollback();
    log.error({
      message: "FAILED TO ADD CONTACT TO CONTACT LIST",
      function: "addContactToContactList",
      stringifiedErr: JSON.stringify(error),
    });
  }
};

/**
 * Updates the contact lists for a given contact by adding or removing them
 * based on the target contact list IDs.
 *
 * @param {string} contactId The ID of the contact to be updated.
 * @param {string[]} targetContactListIds List of contact list IDs the contact should belong to.
 * @param {string[]} allContactListIds List of all available contact list IDs.
 * @param {object} agency Agency details.
 * @param {object} transaction Sequelize transaction object to ensure atomic operations.
 * @param {object} log Logging utility for capturing logs.
 * @returns {Promise<void>} A promise that resolves once the contact lists are updated.
 */
const updateContactLists = async ({
  contactId,
  targetContactListIds,
  allContactListIds,
  agency,
  transaction,
  log,
}) => {
  for (const listId of allContactListIds) {
    if (!targetContactListIds.includes(listId)) {
      await contactDBHandler.removeContactFromContactList({
        contactId,
        contactListId: listId,
        transaction,
        log,
      });
    }
  }

  for (const targetListId of targetContactListIds) {
    await addContactToList({
      contactId,
      listId: targetListId,
      agency,
      transaction,
      log,
    });
  }
};

/**
 * Adds a contact to a specific contact list if it is not already present.
 *
 * @param {string} contactId The ID of the contact to add to the list.
 * @param {string} listId The ID of the contact list to add the contact to.
 * @param {object} agency Agency details.
 * @param {object} transaction Sequelize transaction object to ensure atomic operations.
 * @param {object} log Logging utility for capturing logs.
 * @returns {Promise<void>} A promise that resolves once the contact is added to the list.
 */
const addContactToList = async ({
  contactId,
  listId,
  agency,
  transaction,
  log,
}) => {
  const contactListUser = await models.contact_list_user.findOne({
    where: {
      contact_id: contactId,
      contact_list_id: listId,
    },
  });

  if (contactListUser) {
    log.info({
      message: `Contact already exists in list ${listId}. Skipping addition.`,
      function: "addContactToList",
    });
    return;
  }

  await contactDBHandler.addContactToContactList({
    contactId,
    contactListId: listId,
    importType: "WIX",
    createdBy: agency.default_outsider_contact_owner,
    transaction,
    log,
  });

  log.info({
    message: `Added contact to list ${listId}`,
    function: "addContactToList",
  });
};

/**
 * this function cancels subscription into wix if contact marked as optout whatsapp
 *
 * @param {object} contactId - contactId
 * @param {object} log - Logging utility for capturing logs.
 */

const processCancelOrder = async ({ contactId, log }) => {
  try {
    const contactSource = await models.contact_source.findOne({
      where: {
        contact_fk: contactId,
        source_type: "WIX",
      },
    });

    if (!contactSource?.source_original_payload) {
      log.error({
        message: "CONTACT SOURCE NOT FOUND",
        function: "processCancelOrder",
      });
      return;
    }

    const originalPayload = JSON.parse(contactSource.source_original_payload);
    const orderId = originalPayload.payload?.createdEvent?.entity?.id;
    if (!orderId) {
      log.error({
        message: "ORDER NOT FOUND",
        function: "processCancelOrder",
      });
    }
    const { success, access_token } = await wixHelper.getWixAccessToken({
      instanceId: originalPayload.instanceId,
      log,
    });
    if (success && access_token) {
      await wixHelper.cancelWixOrder({
        accessToken: access_token,
        orderId,
        log,
      });
    }
  } catch (error) {
    log.error({
      message: "PROCESS CANCEL ORDER FAILED",
      function: "processCancelOrder",
      stringifiedErr: JSON.stringify(error),
    });
    Sentry.captureException(error);
  }
};

/**
 * Processes the creation of a new Wix plan by updating the contact source
 * and contact details in the database.
 *
 * @param {string} contactSourceId The ID of the contact source to be updated.
 * @param {string} contactId The ID of the contact to be updated.
 * @param {object} orderPayload The webhook payload containing the order details for the Wix plan.
 * @param {object} log Logging utility for capturing logs.
 * @returns {Promise<void>} A promise that resolves once the Wix plan creation process is completed.
 */

const processWixNewPlanCreation = async ({
  contactSourceId,
  contactId,
  orderPayload,
  log,
}) => {
  const contact_tx = await models.sequelize.transaction();
  try {
    await c.contactSource.update(
      {
        contact_source_id: contactSourceId,
      },
      {
        source_original_payload: JSON.stringify(orderPayload),
      },
      { transaction: contact_tx }
    );
    await c.contact.update(
      contactId,
      {
        opt_out_whatsapp: false,
      },
      { transaction: contact_tx }
    );
    await contact_tx.commit();
  } catch (error) {
    await contact_tx.rollback();
    log.error({
      function: "processWixNewPlanCreation",
      stringifiedErr: JSON.stringify(error),
      error,
    });
    Sentry.captureException(error);
  }
};

module.exports.receiveWixPayload = receiveWixPayload;
module.exports.processCancelOrder = processCancelOrder;
