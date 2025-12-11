const Sentry = require('@sentry/node');
const { Client } = require('@hubspot/api-client');
const c = require('../../controllers');
const h = require('../../helpers');
const { v4: uuidv4 } = require('uuid');

/**
 * Description
 * Consumer for handling webhook payloads coming from contact create action in
 * hubspot
 * This will include receiving of webhook payload data coming from hubspot when
 * a new contact has been created
 *
 * @param {object} data holds hubspot webhook payload for create contact action
 * @param {object} models existing database table models
 * @param {object} channel rabbit mq channel used
 * @param {object} config rabbitmq/amq configuration
 * @param pubChannel
 * @param {object} log server log functions
 */
module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: updateContactInfo } = JSON.parse(data.content.toString());
  const { contact: body, agencies = [] } = updateContactInfo;
  const process_id = uuidv4();
  const processor_name = 'hs-create-contact';

  log.info({
    process_id,
    message: 'starting process',
    processor: processor_name,
  });
  try {
    for (const agency of agencies) {
      await handleContactCreateWebhookPayloadFromHubSpot(
        { agency, config, process_id, processor_name, body, models },
        { log },
      );
    }
    log.info({
      process_id,
      success: true,
      message: 'process complete',
      processor: processor_name,
    });
    await c.lock.destroy({
      process_name: 'hs-process-contacts',
      entity_id: body?.objectId,
    });
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    await channel.nack(data, false, false);
  }
};

/**
 * Description
 * Function to handle every create webhook payload received by system from
 * hubspot
 * @async
 * @function
 * @name handleContactCreateWebhookPayloadFromHubSpot
 * @kind function
 * @param {object} agency current client object session
 * @param {object} config current workflow processor data
 * @param {string} process_id current process identifier
 * @param {string} processor_name current process name
 * @param {object} body payload data for checking create action
 * @param {object} models database tables models
 * @param {object} log server log function
 */
async function handleContactCreateWebhookPayloadFromHubSpot(
  { agency, config, process_id, processor_name, body, models },
  { log },
) {
  try {
    const { clientId, clientSecret } = config.directIntegrations.hubspot;
    const hubspotClient = new Client({
      clientId,
      clientSecret,
    });

    const refreshTokenResponse = await processRefreshAccessToken({
      hubspotClient,
      agency,
      clientId,
      clientSecret,
      log,
    });

    if (h.cmpBool(refreshTokenResponse.success, false)) {
      log.error({
        process_id,
        success: true,
        processor: processor_name,
        err: refreshTokenResponse.err,
      });
      return false;
    } else {
      const contact = await h.hubspot.pullHubSpotContactData({
        hubspotClient,
        body,
        process_id,
        processor_name,
        log,
      });

      if (h.isEmpty(contact) || h.cmpBool(contact, false)) {
        return false;
      } else {
        const owner = await h.hubspot.processContactOwner(
          { contact, agency, hubspotClient },
          { models, log },
        );

        const hs_object_id = body.objectId;
        const contact_owner = owner;
        const agency_user = { agency_fk: agency.agency_id };

        // check if can create new contact
        const contactInventory = await c.contact.checkIfCanAddNewContact(
          agency.agency_id,
        );

        if (h.cmpBool(contactInventory.can_continue, false)) {
          log.warn({
            message: h.general.getMessageByCode(contactInventory.reason),
            details: contact.properties,
          });
          // to add email notification for contact iventory fail
        } else {
          const contact_id = await c.hubspot.addContactToPave(
            {
              contact: {
                properties: {
                  agency_id: agency.agency_id,
                  hs_object_id,
                  ...contact.properties,
                },
              },
              contact_owner,
              agency_user,
            },
            log,
          );

          if (h.notEmpty(contact_id)) {
            await h.hubspot.hubspotProcessFormSubmissionForCreateWebhook(
              { contact, agency, contact_id, hubspotClient, models, config },
              { log },
            );
            await c.agencyNotification.checkContactCapacityAfterUpdate(
              agency?.agency_id,
            );
          }
        }
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    throw new Error(err);
  }
}

/**
 * Description
 * Function to process refreshing of access token for an agency account when
 * requesting hubspot contact create and form submission handling
 * @async
 * @function
 * @name processRefreshAccessToken
 * @kind function
 * @param {object} hubspotClient current client session for hubspot
 * @param {object} agency current client object session
 * @param {string} clientId hubspot application client id
 * @param {string} clientSecret hubspot application secret key
 * @param {object} log server log function
 * @returns {Promise} return success boolean for refreshing status
 */
async function processRefreshAccessToken({
  hubspotClient,
  agency,
  clientId,
  clientSecret,
  log,
}) {
  const agencyOauth = agency.agency_oauth;
  const tokens = JSON.parse(agencyOauth.access_info);

  const oauthRefreshResponse = await h.hubspot.generateRefreshedAccessToken({
    refresh_token: tokens.refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
    log,
  });

  if (h.cmpBool(oauthRefreshResponse, false)) {
    return { success: false, err: oauthRefreshResponse.err };
  } else {
    log.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️', oauthRefreshResponse);
    hubspotClient.setAccessToken(oauthRefreshResponse.access_token);

    return { success: true };
  }
}
