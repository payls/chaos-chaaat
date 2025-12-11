const c = require('../../controllers');
const h = require('../../helpers');
const jsforce = require('jsforce');
const { v4: uuidv4 } = require('uuid');

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: createContactInfo } = JSON.parse(data.content.toString());
  const { agency_id, body } = createContactInfo;
  const process_id = uuidv4();
  log.info({
    process_id,
    data: createContactInfo,
    processor: 'sf-create-contact',
  });
  try {
    const agency = await models.agency.findOne({
      where: { agency_id },
      include: [
        {
          model: models.agency_oauth,
          where: {
            status: 'active',
            source: 'SALESFORCE',
          },
          required: true,
        },
      ],
    });

    const agencyOauth = agency.dataValues.agency_oauth;

    // console.log(agencyOauth.access_info);
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

    const { OwnerId, LastName, FirstName, Email, MobilePhone, Id } = body.New;

    const owner = await new Promise((resolve, reject) => {
      conn.sobject('User').retrieve(OwnerId, function (err, account) {
        if (err) {
          return reject(err);
        }
        resolve(account);
      });
    });

    // check for opportunity and check if it allows to add based on agency config
    let agency_config = await c.agencyConfig.findOne({
      agency_fk: agency_id,
    });

    agency_config =
      agency_config && agency_config.toJSON
        ? agency_config.toJSON()
        : agency_config;

    let { salesforce_config } = agency_config || {};

    try {
      salesforce_config = JSON.parse(salesforce_config);
    } catch (error) {
      log.warn({
        process_id,
        salesforce_config,
        processor: 'sf-create-contact',
        message: 'invalid JSON string',
        error,
      });
    }

    let toAddContact = true;

    console.log(agency_config);
    console.log(
      agency_config && salesforce_config?.add_contact_based_on_project,
    );

    log.info({
      process_id,
      salesforce_config,
      processor: 'sf-create-contact',
    });

    if (agency_config && salesforce_config?.add_contact_based_on_project) {
      const opportunityContactRole = await new Promise((resolve, reject) => {
        conn
          .sobject('OpportunityContactRole')
          .find({
            ContactId: Id,
          })
          .execute((err, contact) => {
            if (err) resolve(null);

            resolve(contact);
          });
      });

      const opportunity = await new Promise((resolve, reject) => {
        conn
          .sobject('Opportunity')
          .retrieve(opportunityContactRole?.OpportunityId, (err, ops) => {
            if (err) return resolve(null);
            resolve(ops);
          });
      });

      log.info({
        process_id,
        opportunity,
        processor: 'sf-create-contact',
      });

      const project_id_field =
        salesforce_config?.project_id_field || 'Project_ID__c';

      toAddContact = h.salesforce.addContactBasedOnProductId({
        projectId: opportunity && opportunity[project_id_field],
        agencyConfig: agency_config,
      });
    }

    if (!toAddContact) {
      log.warn({
        process_id,
        processor: 'sf-create-contact',
        message: 'Aborting adding contact',
        toAddContact,
        agency_config,
        payload: body,
        owner,
      });

      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }

    const salesforce_contact = {
      contact: {
        Email,
        FirstName,
        LastName,
        MobilePhone,
        Id,
      },
      contact_owner: {
        Email: owner.Email,
      },
      agency_user: {
        agency_fk: agency_id,
      },
    };

    log.info({
      process_id,
      salesforce_contact,
      processor: 'sf-create-contact',
    });

    await c.salesforce.addContactToPave(salesforce_contact);
    log.info({
      process_id,
      success: true,
      processor: 'sf-create-contact',
    });
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    log.info({
      process_id,
      err,
      processor: 'sf-create-contact',
    });
    await channel.nack(data, false, false);
  }
};
