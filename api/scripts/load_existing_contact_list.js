const { Client } = require('@hubspot/api-client');
const fs = require('fs');
const { promisify } = require('util');
const models = require('../server/models');
const h = require('../server/helpers');
const config = require('../server/configs/config')(process.env.NODE_ENV);

// always check value
const agency_id = '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47';
const pave_agency_user_id = '85a7c3e2-2c45-4d1d-8cce-170bcaaf53c4';
const pave_user_id = '2e48a4ca-87c4-4482-b138-9c96f1a3189b';
const default_agency_user_owner_id = '9c7ff039-d292-4900-9dc4-afc35cceb598';
const default_agency_user_owner_id_name = 'Brooke Smith';
const file_name = 'lucid_vue_may25.csv';
const property_name = 'pave_campaign';
const property_value = 'lucid vue may 25';
const country = 'AU';

let contact_property_definition_id;

async function mobileNumberCheckerAU(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 11 &&
    adjusted_mobile_number.startsWith('61') &&
    adjusted_mobile_number.substring(0, 2) === '61'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length >= 9) {
    if (
      adjusted_mobile_number.length === 10 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '61' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('61') &&
      adjusted_mobile_number.substring(0, 2) === '61'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 9) {
      return '61' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

async function mobileNumberCheckerSG(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 10 &&
    adjusted_mobile_number.startsWith('65') &&
    adjusted_mobile_number.substring(0, 2) === '65'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length > 8) {
    if (
      adjusted_mobile_number.length === 9 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '65' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 10 &&
      adjusted_mobile_number.startsWith('65') &&
      adjusted_mobile_number.substring(0, 2) === '65'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 8) {
      return '65' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

async function mobileNumberCheckerHK(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 11 &&
    adjusted_mobile_number.startsWith('852') &&
    adjusted_mobile_number.substring(0, 3) === '852'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length >= 8) {
    if (
      adjusted_mobile_number.length === 9 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '852' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('852') &&
      adjusted_mobile_number.substring(0, 3) === '852'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 8) {
      return '852' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

async function mobileNumberCheckerMY(mobile_number = '') {
  let adjusted_mobile_number = mobile_number.replaceAll('+', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
  adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
  if (
    adjusted_mobile_number.length === 11 &&
    adjusted_mobile_number.startsWith('60') &&
    adjusted_mobile_number.substring(0, 2) === '60'
  ) {
    return adjusted_mobile_number;
  } else if (
    adjusted_mobile_number.length === 12 &&
    adjusted_mobile_number.startsWith('60') &&
    adjusted_mobile_number.substring(0, 2) === '60'
  ) {
    return adjusted_mobile_number;
  } else if (adjusted_mobile_number.length >= 10) {
    if (
      adjusted_mobile_number.length === 10 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '60' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('0') &&
      adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '60' + adjusted_mobile_number.slice(1);
    } else if (
      adjusted_mobile_number.length === 11 &&
      adjusted_mobile_number.startsWith('60') &&
      adjusted_mobile_number.substring(0, 2) === '60'
    ) {
      return adjusted_mobile_number;
    } else if (adjusted_mobile_number.length === 9) {
      return '60' + adjusted_mobile_number;
    } else if (
      adjusted_mobile_number.length === 10 &&
      !adjusted_mobile_number.startsWith('0') &&
      !adjusted_mobile_number.substring(0, 1) === '0'
    ) {
      return '60' + adjusted_mobile_number;
    } else {
      return adjusted_mobile_number;
    }
  } else {
    return adjusted_mobile_number;
  }
}

async function getContactsByProperties() {
  const data = [];
  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id,
      status: 'active',
      source: 'HUBSPOT',
    },
  });

  try {
    const hubspotClient = new Client({
      clientId: config.directIntegrations.hubspot.clientId,
      clientSecret: config.directIntegrations.hubspot.clientSecret,
    });

    agencyOauth =
      agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

    const { refresh_token } = JSON.parse(agencyOauth.access_info);

    const tokenResponse = await hubspotClient.oauth.tokensApi.create(
      'refresh_token',
      null,
      config.directIntegrations.hubspot.redirectUri,
      config.directIntegrations.hubspot.clientId,
      config.directIntegrations.hubspot.clientSecret,
      refresh_token
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

    const limit = 100;
    let after = null;
    let response;
    const allContacts = [];
    do {
      response = await hubspotClient.crm.contacts.searchApi.doSearch({
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
        after,
        sorts: [
          {
            propertyName: 'createdate',
            direction: 'DESCENDING',
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
      });
      allContacts.push(...response.results);
      if (response.paging !== undefined) {
        console.log(response.paging);
        after = response.paging.next.after;
      }
    } while (response.paging !== undefined);

    console.log('looping through found contacts');
    for (const contact of allContacts) {
      const ownerId = contact?.properties?.hubspot_owner_id;

      let owner_user;
      let ownerName = '';

      if (ownerId) {
        const ownerDetails = allOwners[ownerId];
        if (ownerDetails) {
          ownerName = `${ownerDetails.firstName} ${ownerDetails.lastName}`;

          owner_user = await models.user.findOne({
            where: {
              first_name: ownerDetails.firstName,
              last_name: ownerDetails.lastName,
            },
            include: [
              {
                model: models.agency_user,
                where: {
                  agency_fk: agency_id,
                },
                include: [
                  {
                    model: models.agency,
                  },
                ],
              },
            ],
          });
        }
      }

      const contactRecord = await models.contact_source.findOne({
        where: {
          source_contact_id: contact.properties.hs_object_id,
        },
        include: [
          {
            model: models.contact,
            where: { agency_fk: agency_id },
            required: true,
          },
        ],
      });

      let mobile_number = h.notEmpty(contact?.properties?.mobilephone)
        ? contact?.properties?.mobilephone.replace(/[^0-9]/g, '')
        : null;

      if (!h.isEmpty(mobile_number)) {
        if (h.cmpStr(country, 'SG')) {
          mobile_number = await mobileNumberCheckerSG(mobile_number);
        }
        if (h.cmpStr(country, 'HK')) {
          mobile_number = await mobileNumberCheckerHK(mobile_number);
        }
        if (h.cmpStr(country, 'MY')) {
          mobile_number = await mobileNumberCheckerMY(mobile_number);
        }
        if (h.cmpStr(country, 'AU')) {
          mobile_number = await mobileNumberCheckerAU(mobile_number);
        }
      }

      const contact_owner_id = owner_user?.agency_user?.agency_user_id
        ? owner_user?.agency_user?.agency_user_id
        : default_agency_user_owner_id;

      const contact_owner_name = ownerName || default_agency_user_owner_id_name;

      if (!contactRecord) {
        const contact_id = h.general.generateId();
        await models.contact.create({
          contact_id,
          first_name: contact?.properties?.firstname,
          last_name: contact?.properties?.lastname,
          email: contact?.properties?.email,
          mobile_number: mobile_number,
          is_whatsapp: 0,
          agency_fk: agency_id,
          agency_user_fk: contact_owner_id,
          from_export: true,
          status: 'active',
          manual_label: property_value,
        });

        const contact_source_id = h.general.generateId();
        await models.contact_source.create({
          contact_source_id,
          contact_fk: contact_id,
          source_contact_id: contact?.properties?.hs_object_id,
          source_type: 'HUBSPOT',
        });

        const contact_property_value_id = h.general.generateId();
        await models.contact_property_values.create({
          contact_property_value_id,
          contact_fk: contact_id,
          contact_property_definition_fk: contact_property_definition_id,
          attribute_value_string: property_value,
          created_by: pave_agency_user_id,
        });

        const newRow = [
          contact_id,
          contact?.properties?.hs_object_id,
          contact?.properties?.firstname,
          contact?.properties?.lastname,
          contact?.properties?.email,
          mobile_number,
          '',
          contact_owner_id,
          contact_owner_name,
          true,
        ];
        // console.log(newRow);
        data.push(newRow);
      } else {
        const contact_id = contactRecord?.contact?.contact_id;
        const updateBody = {
          first_name: contact?.properties?.firstname,
          last_name: contact?.properties?.lastname,
          email: contact?.properties?.email,
          mobile_number: mobile_number,
          manual_label: property_value,
        };
        if (ownerId) {
          updateBody.agency_user_fk = owner_user?.agency_user?.agency_user_id;
        }
        await models.contact.update(updateBody, { where: { contact_id } });

        const contactPropertyValue =
          await models.contact_property_values.findOne({
            where: {
              contact_fk: contact_id,
              contact_property_definition_fk: contact_property_definition_id,
              attribute_value_string: property_value,
            },
          });

        if (!contactPropertyValue) {
          const contact_property_value_id = h.general.generateId();
          await models.contact_property_values.create({
            contact_property_value_id,
            contact_fk: contact_id,
            contact_property_definition_fk: contact_property_definition_id,
            attribute_value_string: property_value,
            created_by: pave_agency_user_id,
          });
        }
        if (
          h.cmpBool(contactRecord?.contact?.opt_out_whatsapp, false) &&
          mobile_number
        ) {
          const newRow = [
            contact_id,
            contact?.properties?.hs_object_id,
            contact?.properties?.firstname,
            contact?.properties?.lastname,
            contact?.properties?.email,
            mobile_number,
            contactRecord?.contact?.agency_user_fk,
            owner_user?.agency_user?.agency_user_id,
            ownerName,
            false,
          ];
          // console.log(newRow);
          data.push(newRow);
        }
      }
    }

    console.log('generating csv file');
    // generate csv file
    const headers = [
      'Contact ID',
      'HubSpot ID',
      'First Nam',
      'Last Name',
      'Email',
      'Phone',
      'Old Pave Contact Owner ID',
      'New Pave Contact Owner ID',
      'HB Contact Owner',
      'New Record',
    ];

    const writeFileAsync = promisify(fs.writeFile);

    const reportData = [headers.join(',')]
      .concat(data.map((contact) => contact.join(',')))
      .join('\n');

    await writeFileAsync(file_name, reportData);
  } catch (err) {
    console.error(err);
  }
}

getContactsByProperties();
