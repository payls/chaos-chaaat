const { Client } = require('@hubspot/api-client');
const fs = require('fs');
const models = require('../server/models');
const h = require('../server/helpers');
const config = require('../server/configs/config')(process.env.NODE_ENV);

const agency_id = '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47';

async function getContactCustomProperties() {
  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id,
      status: 'active',
      source: 'HUBSPOT',
    },
  });

  agencyOauth =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  const { refresh_token } = JSON.parse(agencyOauth.access_info);

  try {
    const hubspotClient = new Client({
      clientId: config.directIntegrations.hubspot.clientId,
      clientSecret: config.directIntegrations.hubspot.clientSecret,
    });

    const tokenResponse = await hubspotClient.oauth.tokensApi.create(
      'refresh_token',
      null,
      config.directIntegrations.hubspot.redirectUri,
      config.directIntegrations.hubspot.clientId,
      config.directIntegrations.hubspot.clientSecret,
      refresh_token,
    );

    const newAccessToken = tokenResponse.accessToken;

    hubspotClient.setAccessToken(newAccessToken);

    const response = await hubspotClient.crm.properties.coreApi.getAll(
      'contacts',
    );

    for (const property of response.results) {
      if (property.hubspotDefined === undefined) {
        console.log(property);
      }
    }
    // const customProperties = response.body.results.filter(
    //   (property) => property.calculatedAt === null,
    // );
    // console.log(response.body.results);
  } catch (err) {
    console.error(err);
  }
}

getContactCustomProperties();
