const c = require('../../controllers');
const jsforce = require('jsforce');
const constant = require('../../constants/constant.json');
const config = require('../../configs/config')(process.env.NODE_ENV);
const Promise = require('bluebird');

module.exports = async ({ data, models, channel, pubChannel, log }) => {
  const processorName = 'sf-cron-processor';
  const {
    sfCreateContactQueue,
    sfCreateContactRoutingKey,
    sfUpdateContactQueue,
    sfUpdateContactRoutingKey,
    sfAdhocQueue,
    sfAdhocRoutingKey,
  } = config.amq.keys;
  const {
    SF_CREATE_CONTACT,
    SF_UPDATE_CONTACT,
    SF_CREATE_CONTACT_OPPORTUNITY,
    // SF_UPDATE_OPPORTUNITY,
  } = constant.AMQ.CONSUMER_TYPES;
  const { data: cronInfo } = JSON.parse(data.content.toString());
  const { agency_id, cronOneMinuteAgo, cronTwoMinutesAgo } = cronInfo;

  try {
    let agencyOauth = await models.agency_oauth.findOne({
      where: {
        agency_fk: agency_id,
        status: 'active',
        source: 'SALESFORCE',
      },
    });

    agencyOauth =
      agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

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
    } catch (error) {}
    if (!agencyOauth) {
      // finish execution here
      log.warn({
        message: `No OAuth credentials`,
        processor: processorName,
        agency_id,
      });

      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }

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

    // get agency oath
    const creds = await new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) {
          log.warn({
            message: `Invalid credentials`,
            processor: processorName,
            agency_id,
          });

          return resolve(null);
        }
        // .select('*')
        // .where('Email = johnxero@domain.com')
        resolve(results);
      });
    });

    if (!creds) {
      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }
    // fetch created contacts 2 minutes earlier than crontime
    const newContacts = await new Promise((resolve, reject) => {
      conn
        .sobject('Contact')
        .find(
          // conditions in JSON object
          {
            CreatedDate: {
              $gte: jsforce.Date.toDateTimeLiteral(cronTwoMinutesAgo),
            },
          },
        )
        .sort({ CreatedDate: -1 })
        .execute((err, contact) => {
          if (err) {
            // log error
            log.warn({
              err,
              message: `Unable to fetch New Contact`,
              processor: processorName,
              agency_id,
            });
            resolve([]);
          }

          resolve(contact);
        });
    });

    // fetch updated contacts 1 minute earlier than crontime
    const updatedContacts = await new Promise((resolve, reject) => {
      conn
        .sobject('Contact')
        .find(
          // conditions in JSON object
          {
            LastModifiedDate: {
              $gte: jsforce.Date.toDateTimeLiteral(cronOneMinuteAgo),
            },
          },
        )
        .sort({ LastModifiedDate: -1 })
        .execute((err, contact) => {
          if (err) {
            // log error
            log.warn({
              err,
              message: `Unable to fetch Updated Contact`,
              processor: processorName,
              agency_id,
            });
            resolve([]);
          }

          resolve(contact);
        });
    });

    if (newContacts && newContacts.length > 0) {
      await Promise.mapSeries(newContacts, async (newContact) => {
        return channel.publish(
          sfCreateContactQueue,
          sfCreateContactRoutingKey,
          Buffer.from(
            JSON.stringify({
              consumerType: SF_CREATE_CONTACT,
              data: {
                agency_id,
                body: {
                  New: newContact,
                },
              },
            }),
          ),
        );
      });
    }

    if (updatedContacts && updatedContacts.length > 0) {
      await Promise.mapSeries(updatedContacts, async (updatedContact) => {
        await channel.publish(
          sfUpdateContactQueue,
          sfUpdateContactRoutingKey,
          Buffer.from(
            JSON.stringify({
              consumerType: SF_UPDATE_CONTACT,
              data: {
                agency_id,
                body: {
                  New: updatedContact,
                },
              },
            }),
          ),
        );
      });
    }

    if (agency_config && salesforce_config?.add_contact_based_on_project) {
      // fetch created contact opportunities 2 minutes earlier than crontime
      const contactOpportunities = await new Promise((resolve, reject) => {
        conn
          .sobject('OpportunityContactRole')
          .find(
            // conditions in JSON object
            {
              CreatedDate: {
                $gte: jsforce.Date.toDateTimeLiteral(cronTwoMinutesAgo),
              },
            },
            // fields in JSON object
            // { Id: 1, CreatedDate: 1 },
          )
          .sort({ CreatedDate: -1 })
          .execute((err, contact) => {
            if (err) {
              // log error
              log.warn({
                err,
                message: `Unable to fetch OpportunityContactRole`,
                processor: processorName,
                agency_id,
              });
              resolve([]);
            }
            resolve(contact);
          });
      });

      if (contactOpportunities && contactOpportunities.length > 0) {
        await Promise.mapSeries(
          contactOpportunities,
          async (contactOpportunity) => {
            await channel.publish(
              sfAdhocQueue,
              sfAdhocRoutingKey,
              Buffer.from(
                JSON.stringify({
                  consumerType: SF_CREATE_CONTACT_OPPORTUNITY,
                  data: {
                    agency_id,
                    body: {
                      New: contactOpportunity,
                    },
                  },
                }),
              ),
            );
          },
        );
      }
      // fetch updated opportunities 1 minute earlier than crontime (skipping for now, will handle in send email 2)
      // const updatedOpportunities = await new Promise((resolve, reject) => {
      //   conn
      //     .sobject('Opportunity')
      //     .find(
      //       // conditions in JSON object
      //       {
      //         LastModifiedDate: {
      //           $gte: jsforce.Date.toDateTimeLiteral(cronTwoMinutesAgo),
      //         },
      //       },
      //       // fields in JSON object
      //       // { Id: 1, CreatedDate: 1 },
      //     )
      //     .sort({ LastModifiedDate: -1 })
      //     .execute((err, contact) => {
      //       if (err) {
      //         // log error
      //         log.warn({
      //           err,
      //           message: `Unable to fetch Opportunity`,
      //           processor: processorName,
      //           agency_id,
      //         });
      //         resolve([]);
      //       }
      //       resolve(contact);
      //     });
      // });

      // if (updatedOpportunities && updatedOpportunities.length > 0) {
      //   for (const updatedOpportunity of updatedOpportunities) {
      //     await channel.publish(
      //       sfAdhocQueue,
      //       sfAdhocRoutingKey,
      //       Buffer.from(
      //         JSON.stringify({
      //           consumerType: SF_UPDATE_OPPORTUNITY,
      //           data: {
      //             agency_id,
      //             body: {
      //               New: updatedOpportunity,
      //             },
      //           },
      //         }),
      //       ),
      //     );
      //   }
      // }
    }

    log.info({
      success: true,
      processor: processorName,
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
      err,
      processor: processorName,
    });
    await channel.nack(data, false, false);
  }
};
