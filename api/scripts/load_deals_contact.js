const { Client } = require('@hubspot/api-client');
const fs = require('fs');
const { promisify } = require('util');
const models = require('../server/models');
const h = require('../server/helpers');
const config = require('../server/configs/config')(process.env.NODE_ENV);

const agency_id = '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47';
const pave_agency_user_id = '53cede2c-1eb4-4729-82b1-01cb3cc2e2fb';
const pave_user_id = '53cede2c-1eb4-4729-82b1-01cb3cc2e2fb';
const default_agency_user_owner_id = '53cede2c-1eb4-4729-82b1-01cb3cc2e2fb';
const default_agency_user_owner_id_name = 'Rienier Patron';
const file_name = 'lucid_vue_may25.csv';
const property_name = 'dealstage';
const property_value = '294229227';
const country = 'UK';

let contact_property_definition_id;

async function getDealContacts() {
  const data = [];
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

    const contactPropertyDefinition =
      await models.contact_property_definitions.findOne({
        where: {
          agency_fk: agency_id,
          attribute_name: property_name,
          attribute_source: 'HUBSPOT',
        },
      });

    if (!contactPropertyDefinition) {
      contact_property_definition_id = h.general.generateId();
      await models.contact_property_definitions.create({
        contact_property_definition_id,
        agency_user_fk: pave_agency_user_id,
        agency_fk: agency_id,
        attribute_name: property_name,
        attribute_type: 'string',
        attribute_source: 'HUBSPOT',
        status: 'active',
      });
    } else {
      contact_property_definition_id =
        contactPropertyDefinition?.contact_property_definition_id;
    }

    const allOwners = {};
    let ownerResponse;
    let ownerAfter;
    const email = undefined;
    const archived = false;
    do {
      ownerResponse = await hubspotClient.crm.owners.ownersApi.getPage(
        email,
        ownerAfter,
        10,
        archived,
      );

      for (const owner of ownerResponse.results) {
        const ownerID = owner.id;
        allOwners[ownerID] = {
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
        };

        const user = await models.user.findOne({
          where: {
            email: owner.email,
          },
        });

        if (!user) {
          const user_id = h.general.generateId();
          await models.user.create({
            user_id,
            first_name: owner.firstName,
            last_name: owner.lastName,
            email: owner.email,
            status: 'inactive',
            created_by: pave_user_id,
          });

          const user_role_id = h.general.generateId();
          await models.user_role.create({
            user_role_id,
            user_fk: user_id,
            user_role: 'agency_sales',
            created_by: pave_user_id,
          });

          const agency_user_id = h.general.generateId();
          await models.agency_user.create({
            agency_user_id,
            agency_fk: agency_id,
            user_fk: user_id,
            created_by: pave_agency_user_id,
          });
        }
      }
      if (ownerResponse.paging !== undefined) {
        ownerAfter = ownerResponse.paging.next.after;
      }
    } while (ownerResponse.paging !== undefined);

    // try {
    //   const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(
    //     PublicObjectSearchRequest,
    //   );
    //   console.log(JSON.stringify(apiResponse, null, 2));
    // } catch (e) {
    //   e.message === 'HTTP request failed'
    //     ? console.error(JSON.stringify(e.response, null, 2))
    //     : console.error(e);
    // }

    const limit = 50;
    const after = null;
    let response;
    let deal_response, contact_response;
    const allContacts = [];
    const allDeals = [];

    do {
      deal_response = await hubspotClient.crm.deals.searchApi.doSearch({
        properties: [],
        filterGroups: [
          {
            filters: [
              {
                propertyName: property_name,
                operator: 'EQ',
                value: property_value,
              },
            ],
          },
        ],
        limit: limit,
      });
      const deals = deal_response.results;
      for (let index = 0; index < deals.length; index++) {
        const dealContactCriteria = {
          limit: 100,
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'associations.deal',
                  operator: 'EQ',
                  value: deals[index].id,
                },
              ],
            },
          ],
          properties: [
            'hs_object_id',
            'email',
            'firstname',
            'lastname',
            'mobilephone',
            'hubspot_owner_id',
            'owner',
          ],
          deduplicate: true,
        };

        do {
          contact_response =
            await hubspotClient.crm.contacts.searchApi.doSearch(
              dealContactCriteria,
            );
          const contacts = contact_response.results;
          for (let cIndex = 0; cIndex < contacts.length; cIndex++) {
            console.log('DEAL', deals[index].properties.dealname);
            console.log('CONTACT', contacts[cIndex]);
          }
        } while (contact_response.paging !== undefined);
      }
    } while (deal_response.paging !== undefined);
  } catch (err) {
    console.error(err);
  }
}

getDealContacts();
