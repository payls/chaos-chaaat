const { v4: uuidv4 } = require('uuid');
const { Client } = require('@hubspot/api-client');
const axios = require('axios');
const h = require('../../helpers');

/**
 * Description
 * Consumer for handling sending of contact note to hubspot
 * This will create a note for the message sent by a contact to hubspot
 *
 * @param {object} data holds hubspot webhook payload for contact note action
 * @param {object} models existing database table models
 * @param {object} channel rabbit mq channel used
 * @param {object} config rabbitmq/amq configuration
 * @param pubChannel
 * @param {object} log server log functions
 */
module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: sendNoteData } = JSON.parse(data.content.toString());

  const process_id = uuidv4();
  const processor_name = 'hs-send-contact-notes';

  log.info({
    process_id,
    data: sendNoteData,
    processor: processor_name,
  });

  try {
    await processContactNoteSending(
      {
        sendNoteData,
        models,
        channel,
        data,
        config,
        process_id,
        processor_name,
      },
      { log },
    );

    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    log.error({
      process_id,
      err,
      processor: processor_name,
    });
    await channel.nack(data, false, false);
  }
};

/**
 * Description
 * Function to process contact note sending to be transmited to hubspot
 * assocciated to a contact
 * @async
 * @function
 * @name processContactNoteSending
 * @kind function
 * @param {object} sendNoteData data containing the notes for a hubspot contact
 * @param {object} models existing database table models
 * @param {object} channel rabbit mq channel used
 * @param {object} config rabbitmq/amq configuration
 * @param {string} process_id current process id for this session
 * @param {string} processor_name name of the consumer
 * @param {object} data object for the queue data
 * @param {object} log server log function
 * @returns {Promise<any>}
 */
async function processContactNoteSending(
  { sendNoteData, models, channel, data, config, process_id, processor_name },
  { log },
) {
  const { clientId, clientSecret } = config.directIntegrations.hubspot;
  const { agency_id, payload } = sendNoteData;
  const hubspotClient = new Client({
    clientId,
    clientSecret,
  });

  const oauthRefreshResponse = await processRefreshAccessToken({
    hubspotClient,
    agency_id,
    clientId,
    clientSecret,
    models,
    log,
  });

  if (h.cmpBool(oauthRefreshResponse, false)) {
    log.warn({
      process_id,
      success: true,
      processor: processor_name,
      err: oauthRefreshResponse.err,
    });
  } else {
    await h.hubspot.processContactNotes({ payload, hubspotClient }, { log });
    log.info({
      process_id,
      success: true,
      processor: processor_name,
    });
  }
  return true;
}

async function processRefreshAccessToken({
  hubspotClient,
  agency_id,
  clientId,
  clientSecret,
  models,
  log,
}) {
  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id,
      status: 'active',
      source: 'HUBSPOT',
    },
  });

  if (!agencyOauth) {
    return false;
  }

  agencyOauth =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;
  const tokens = JSON.parse(agencyOauth.access_info);

  const oauthRefreshResponse = await h.hubspot.generateRefreshedAccessToken({
    refresh_token: tokens.refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
    log,
  });

  if (h.cmpBool(oauthRefreshResponse.success, false)) {
    return false;
  }
  log.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️', oauthRefreshResponse);
  hubspotClient.setAccessToken(oauthRefreshResponse.access_token);

  return true;
}
