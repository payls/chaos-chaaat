const { v4: uuidv4 } = require('uuid');
const jsforce = require('jsforce');

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: sendNoteData } = JSON.parse(data.content.toString());

  const process_id = uuidv4();
  const processor_name = 'sf-send-contact-notes';

  log.info({
    process_id,
    data: sendNoteData,
    processor: processor_name,
  });

  try {
    const { agency_id, payload } = sendNoteData;
    // check agency oath

    let agencyOauth = await models.agency_oauth.findOne({
      where: {
        agency_fk: agency_id,
        status: 'active',
        source: 'SALESFORCE',
      },
    });

    if (!agencyOauth) {
      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }

    agencyOauth =
      agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

    const { access_token, refresh_token, instance_url } = JSON.parse(
      agencyOauth.access_info,
    );

    const oauthParams = {
      clientId: config.directIntegrations.salesforce.clientId,
      clientSecret: config.directIntegrations.salesforce.clientSecret,
      redirectUri: config.directIntegrations.salesforce.redirectUri,
    };

    if (instance_url.includes('sandbox')) {
      oauthParams.loginUrl = 'https://test.salesforce.com';
    }

    const oauth2 = new jsforce.OAuth2(oauthParams);

    const connParams = {
      oauth2,
      instanceUrl: instance_url,
      accessToken: access_token,
      refreshToken: refresh_token,
    };

    if (instance_url.includes('sandbox')) {
      connParams.loginUrl = 'https://test.salesforce.com';
    }

    const conn = new jsforce.Connection(connParams);

    await new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    await new Promise((resolve, reject) => {
      conn.sobject('Note').create(payload, function (err, noteCreated) {
        if (err) {
          return reject(err);
        }
        resolve(noteCreated);
      });
    });

    log.info({
      process_id,
      success: true,
      processor: processor_name,
    });

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
