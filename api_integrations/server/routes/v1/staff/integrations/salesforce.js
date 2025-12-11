const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const c = require('../../../../controllers');
const jsforce = require('jsforce');
const { SalesforceClient } = require('salesforce-webhooks');
const models = require('../../../../models');
const config = require('../../../../configs/config')(process.env.NODE_ENV);

async function deleteIntegration(activeIntegration) {
  const { clientId, clientSecret, redirectUri } =
    config.directIntegrations.salesforce;

  const { access_info, webhook_info } = activeIntegration;
  if (h.isEmpty(webhook_info)) return Promise.resolve();
  const { refresh_token, instance, instance_url } = JSON.parse(access_info);
  const [contactCreationWebhook, contactUpdateWebhook, opportunityContact] =
    JSON.parse(webhook_info);

  const oauthParams = {
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId,
    clientSecret,
    redirectUri,
  };

  if (instance_url.includes('sandbox')) {
    oauthParams.loginUrl = 'https://test.salesforce.com';
  }
  const oauth2 = new jsforce.OAuth2(oauthParams);

  const conn = new jsforce.Connection({ oauth2 });

  return new Promise((resolve, reject) => {
    conn.oauth2.refreshToken(refresh_token, async (err, results) => {
      if (err) return reject(err);
      const client = new SalesforceClient({
        authToken: results.access_token,
        instance,
        apiVersion: '50.0',
      });
      if (contactCreationWebhook) {
        await client.deleteWebhook(contactCreationWebhook);
      }

      if (contactUpdateWebhook) {
        await client.deleteWebhook(contactUpdateWebhook);
      }

      if (opportunityContact) {
        await client.deleteWebhook(opportunityContact);
      }

      resolve();
    });
  });
}

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/integrations/salesforce/get-salesforce-contacts contact Get SalesForce Contacts From Pave Database
   * @apiName StaffIntegrationsSalesForceContactsGetAllContacts
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsSalesForce
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/integrations/salesforce/get-salesforce-contacts',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                pageCount: { type: 'integer' },
                pageIndex: { type: 'integer' },
                totalCount: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { pageSize = 25, pageIndex = 0 } = request.query;

        const limit = pageSize ? parseInt(pageSize) : undefined;

        const { contacts: salesforce_contacts, totalCount } =
          await c.salesforce.getSalesForceContactsFromPaveV2(request);

        const metadata = {
          pageCount: pageSize ? Math.ceil(totalCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(0) : undefined,
          totalCount,
        };

        h.api.createResponse(
          response,
          200,
          { contacts: salesforce_contacts, metadata },
          '1-contact-1621773105',
          {
            portal,
          },
        );
      } catch (err) {
        console.log(`${request.url}: user failed to retrieve contacts list`, {
          err,
        });
        h.api.createResponse(response, 500, {}, '2-contact-1621773105', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/salesforce/call-salesforce-webhook-full-sync Trigger HubSpot Contacts Full Sync
   * @apiName StaffIntegrationsHubSpotCallHubSpotWebhookFullSync
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsHubSpot
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/salesforce/call-salesforce-webhook-full-sync',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { agencyUser } = req.body;
        const triggerSalesForceFullSync =
          await c.salesforce.triggerSalesForceFullSync(agencyUser);
        h.api.createResponse(
          res,
          200,
          { success: triggerSalesForceFullSync },
          '1-salesforce-contact-1636817693755',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '1-salesforce-contact-1636817693755',
          { portal },
        );
      }
    },
  });

  // Direct integration endpoints
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/salesforce/initiate-integration-request',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { clientId, clientSecret, scope, redirectUri } =
          config.directIntegrations.salesforce;
        const { agency_user, sandbox } = req.body;
        const connect = {
          // you can change loginUrl to connect to sandbox or prerelease env.
          // loginUrl : 'https://test.salesforce.com',
          clientId,
          clientSecret,
          redirectUri,
        };
        if (h.cmpBool(sandbox, true)) {
          connect.loginUrl = 'https://test.salesforce.com';
        }
        const oauth2 = new jsforce.OAuth2(connect);

        const { agencyUser } = agency_user;

        // get current active integration
        const activeIntegrations = await models.agency_oauth.findAll({
          where: {
            agency_fk: agencyUser.agency_fk,
            source: 'SALESFORCE',
            status: 'active',
          },
        });

        // delete old webhooks
        for (const activeIntegration of activeIntegrations) {
          await deleteIntegration(activeIntegration);
        }

        const url = await oauth2.getAuthorizationUrl({
          scope,
        });

        console.log(url);

        h.api.createResponse(
          res,
          200,
          { success: true, url },
          '1-salesforce-direct-integration-initialize-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesforce-direct-integration-initialize-1663065971',
          { portal },
        );
      }
    },
  });

  // Direct integration endpoints
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/salesforce/complete-integration-request',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);
      try {
        const { clientId, clientSecret, redirectUri, webhookToken } =
          config.directIntegrations.salesforce;
        const { agencyUser, code } = req.body;

        const oauth2 = new jsforce.OAuth2({
          // you can change loginUrl to connect to sandbox or prerelease env.
          // loginUrl : 'https://test.salesforce.com',
          clientId,
          clientSecret,
          redirectUri,
        });

        const conn = new jsforce.Connection({ oauth2 });

        const {
          access_token,
          refresh_token,
          instance_url,
          user_info,
          instance,
          salesforceWebhookInfo,
        } = await new Promise((resolve, reject) => {
          // create workflows
          const api_integration_base_url = config.apiIntegrationsUrl;

          conn.authorize(code, async (err, userInfo) => {
            if (err) {
              return reject(err);
            }
            // Now you can get the access token, refresh token, and instance URL information.
            // Save them to establish connection next time.
            // console.log(conn.accessToken);
            // console.log(conn.refreshToken);
            // console.log(conn.instanceUrl);
            // console.log('User ID: ' + userInfo.id);
            // console.log('Org ID: ' + userInfo.organizationId);
            // ...
            const instance = conn.instanceUrl
              .replace('.salesforce.com', '')
              .replace('https://', '');
            // also create workflows
            const client = new SalesforceClient({
              authToken: conn.accessToken,
              instance,
              apiVersion: '50.0',
            });

            const webhookOpts = {
              endpointUrl: `${api_integration_base_url}/v1/webhooks/salesforce/${agencyUser.agency_fk}`,
              sObjectType: 'Contact',
              secretToken: webhookToken,
              event: 'new',
            };
            const contactCreationWebhook = await client.createWebhook(
              webhookOpts,
            );

            const webhookOpts2 = {
              endpointUrl: `${api_integration_base_url}/v1/webhooks/salesforce/${agencyUser.agency_fk}`,
              sObjectType: 'Contact',
              secretToken: webhookToken,
              event: 'updated',
            };
            const contactUpdateWebhook = await client.createWebhook(
              webhookOpts2,
            );

            const webhookOpts3 = {
              endpointUrl: `${api_integration_base_url}/v1/webhooks/salesforce/${agencyUser.agency_fk}/contact-opportunity`,
              sObjectType: 'OpportunityContactRole',
              secretToken: webhookToken,
              event: 'new',
            };

            const opportunityContact = await client.createWebhook(webhookOpts3);

            // need to save webhook data for easy deletion in the future
            const salesforceWebhookInfo = [
              contactCreationWebhook,
              contactUpdateWebhook,
              opportunityContact,
            ];

            resolve({
              access_token: conn.accessToken,
              refresh_token: conn.refreshToken,
              instance_url: conn.instanceUrl,
              user_info: userInfo,
              instance,
              salesforceWebhookInfo,
            });
          });
        });

        const agency_oauth_id = h.general.generateId();

        await models.agency_oauth.update(
          {
            status: 'inactive',
            updated_by: user_id,
          },
          {
            where: {
              agency_fk: agencyUser.agency.agency_id,
              status: 'active',
              source: 'SALESFORCE',
            },
          },
        );

        await models.agency_oauth.create({
          agency_oauth_id,
          agency_fk: agencyUser.agency.agency_id,
          status: 'active',
          source: 'SALESFORCE',
          access_info: JSON.stringify({
            access_token,
            refresh_token,
            instance_url,
            user_info,
            instance,
          }),
          webhook_info: JSON.stringify(salesforceWebhookInfo),
          created_by: user_id,
        });

        // console.log({ access_token, refresh_token, instance_url, user_info });

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      }
    },
  });

  // Dividing integration to avoid timeouts step 1
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/salesforce/complete-integration-request/1',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);

      try {
        const { clientId, clientSecret, redirectUri, webhookToken } =
          config.directIntegrations.salesforce;
        const { agencyUser, sandbox, code } = req.body;

        const connect = {
          // you can change loginUrl to connect to sandbox or prerelease env.
          // loginUrl : 'https://test.salesforce.com',
          clientId,
          clientSecret,
          redirectUri,
        };
        if (h.cmpBool(sandbox, true)) {
          connect.loginUrl = 'https://test.salesforce.com';
        }

        const oauth2 = new jsforce.OAuth2(connect);

        const conn = new jsforce.Connection({ oauth2 });

        const {
          access_token,
          refresh_token,
          instance_url,
          user_info,
          instance,
        } = await new Promise((resolve, reject) => {
          // create workflows
          const api_integration_base_url = config.apiIntegrationsUrl;

          conn.authorize(code, async (err, userInfo) => {
            if (err) {
              return reject(err);
            }
            const instance = conn.instanceUrl
              .replace('.salesforce.com', '')
              .replace('https://', '');

            resolve({
              access_token: conn.accessToken,
              refresh_token: conn.refreshToken,
              instance_url: conn.instanceUrl,
              user_info: userInfo,
              instance,
            });
          });
        });

        const agency_oauth_id = h.general.generateId();

        await models.agency_oauth.update(
          {
            status: 'inactive',
            updated_by: user_id,
          },
          {
            where: {
              agency_fk: agencyUser.agency.agency_id,
              status: 'active',
              source: 'SALESFORCE',
            },
          },
        );

        await models.agency_oauth.create({
          agency_oauth_id,
          agency_fk: agencyUser.agency.agency_id,
          status: 'active',
          source: 'SALESFORCE',
          access_info: JSON.stringify({
            access_token,
            refresh_token,
            instance_url,
            user_info,
            instance,
          }),
          created_by: user_id,
        });

        // console.log({ access_token, refresh_token, instance_url, user_info });

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false, err },
          '2-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      }
    },
  });

  // Dividing integration to avoid timeouts step 1
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/salesforce/complete-integration-request/2',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);

      try {
        const { clientId, clientSecret, redirectUri, webhookToken } =
          config.directIntegrations.salesforce;
        const { agencyUser } = req.body;

        const agency_id = agencyUser.agency.agency_id;

        const agency = await models.agency.findOne({
          where: { agency_id },
          include: [
            {
              model: models.agency_oauth,
              where: {
                status: 'active',
                source: 'SALESFORCE',
              },
              require: true,
            },
          ],
        });

        const agencyOauth = agency.dataValues.agency_oauth;
        const access_info = JSON.parse(agencyOauth.access_info);
        const { access_token, refresh_token, instance_url, instance } =
          access_info;

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

        const webhook_info = await new Promise((resolve, reject) => {
          conn.oauth2.refreshToken(refresh_token, async (err, results) => {
            if (err) return reject(err);

            const api_integration_base_url = config.apiIntegrationsUrl;

            const client = new SalesforceClient({
              authToken: conn.accessToken,
              instance,
              apiVersion: '50.0',
            });

            const webhookOpts = {
              endpointUrl: `${api_integration_base_url}/v1/webhooks/salesforce/${agencyUser.agency_fk}`,
              sObjectType: 'Contact',
              secretToken: webhookToken,
              event: 'new',
            };
            const contactCreationWebhook = await client.createWebhook(
              webhookOpts,
            );

            const webhookOpts2 = {
              endpointUrl: `${api_integration_base_url}/v1/webhooks/salesforce/${agencyUser.agency_fk}`,
              sObjectType: 'Contact',
              secretToken: webhookToken,
              event: 'updated',
            };
            const contactUpdateWebhook = await client.createWebhook(
              webhookOpts2,
            );

            resolve([contactCreationWebhook, contactUpdateWebhook]);
          });
        });

        await models.agency_oauth.update(
          {
            webhook_info: JSON.stringify(webhook_info),
          },
          {
            where: {
              agency_oauth_id: agencyOauth.agency_oauth_id,
            },
          },
        );

        // console.log({ access_token, refresh_token, instance_url, user_info });

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      }
    },
  });

  // Dividing integration to avoid timeouts step 1
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/salesforce/complete-integration-request/3',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { clientId, clientSecret, redirectUri, webhookToken } =
          config.directIntegrations.salesforce;
        const { agencyUser } = req.body;

        const agency_id = agencyUser.agency.agency_id;

        const agency = await models.agency.findOne({
          where: { agency_id },
          include: [
            {
              model: models.agency_oauth,
              where: {
                status: 'active',
                source: 'SALESFORCE',
              },
              require: true,
            },
          ],
        });

        const agencyOauth = agency.dataValues.agency_oauth;
        const access_info = JSON.parse(agencyOauth.access_info);
        const original_webhook_info = agencyOauth.webhook_info;
        let webhook_info = JSON.parse(original_webhook_info);
        const { access_token, refresh_token, instance_url, instance } =
          access_info;

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

        const webhook_info_new = await new Promise((resolve, reject) => {
          conn.oauth2.refreshToken(refresh_token, async (err, results) => {
            if (err) return reject(err);

            const api_integration_base_url = config.apiIntegrationsUrl;

            const client = new SalesforceClient({
              authToken: conn.accessToken,
              instance,
              apiVersion: '50.0',
            });

            const webhookOpts3 = {
              endpointUrl: `${api_integration_base_url}/v1/webhooks/salesforce/${agencyUser.agency_fk}/contact-opportunity`,
              sObjectType: 'OpportunityContactRole',
              secretToken: webhookToken,
              event: 'new',
            };

            const opportunityContact = await client.createWebhook(webhookOpts3);
            resolve([opportunityContact]);
          });
        });

        webhook_info = [...webhook_info, ...webhook_info_new];

        await models.agency_oauth.update(
          {
            webhook_info: JSON.stringify(webhook_info),
          },
          {
            where: {
              agency_oauth_id: agencyOauth.agency_oauth_id,
            },
          },
        );

        // console.log({ access_token, refresh_token, instance_url, user_info });

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesforce-direct-integration-complete-1663065971',
          { portal },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/integrations/salesforce/active-integrations',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { agency_id } = req.query;
      try {
        const salesforceIntegration = await models.agency_oauth.findOne({
          where: {
            agency_fk: agency_id,
            source: 'SALESFORCE',
            status: 'active',
          },
        });

        const isActive = salesforceIntegration !== null;
        let agency_oauth = {};
        if (isActive) {
          agency_oauth = {
            agency_oauth_id: salesforceIntegration.agency_oauth_id,
            agency_fk: salesforceIntegration.agency_fk,
            source: salesforceIntegration.source,
            status: salesforceIntegration.status,
          };
        } else {
          agency_oauth = {
            status: 'inactive',
          };
        }

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true, agency_oauth, isActive },
          '1-salesforce-direct-integration-active-integrations-1663065971',
          { portal },
        );
      } catch (err) {
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesforce-direct-integration-active-integrations-1663065971',
          { portal },
        );
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/staff/integrations/salesforce/active-integrations/:agency_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { agency_id } = req.params;
      const transaction = await models.sequelize.transaction();
      try {
        // get current active integration
        const activeIntegrations = await models.agency_oauth.findAll({
          where: {
            agency_fk: agency_id,
            source: 'SALESFORCE',
            status: 'active',
          },
        });
        // delete webhooks
        for (const activeIntegration of activeIntegrations) {
          await deleteIntegration(activeIntegration);
        }

        // update
        await models.agency_oauth.update(
          {
            status: 'inactive',
          },
          {
            where: {
              agency_fk: agency_id,
              source: 'SALESFORCE',
              status: 'active',
            },
            transaction,
          },
        );

        await transaction.commit();
        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-salesforce-direct-integration-delete-active-integrations-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        await transaction.rollback();
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesfoce-direct-integration-delete-active-integrations-1663065971',
          { portal },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/webhooks/salesforce/:agency_id',
    handler: async (req, res) => {
      const { body, params } = req;
      req.log.info({
        url: '/v1/webhooks/salesforce/:agency_id/:adhoc_name',
        payload: {
          params: req.params,
          body: req.body,
        },
      });
      const forUpdate = body.Old;
      const { agency_id } = params;

      // prepare data

      // get agency to fetch the right salesforce oauth permission
      try {
        if (forUpdate) {
          await req.rabbitmq.pubSfUpdateContact({
            consumerType: constant.AMQ.CONSUMER_TYPES.SF_UPDATE_CONTACT,
            data: {
              agency_id,
              body,
            },
          });
        } else {
          await req.rabbitmq.pubSfCreateContact({
            consumerType: constant.AMQ.CONSUMER_TYPES.SF_CREATE_CONTACT,
            data: {
              agency_id,
              body,
            },
          });
        }

        // const notePayload = {
        //   ParentId: Id,
        //   Title: forUpdate
        //     ? 'Pave - Contact updated'
        //     : 'Pave - Contact Created',
        //   Body: forUpdate
        //     ? 'Contact Successfully saved on Pave'
        //     : 'Contact Successfully updated on Pave',
        // };

        // await new Promise((resolve, reject) => {
        //   conn.sobject('Note').create(notePayload, function (err, noteCreated) {
        //     if (err) {
        //       return reject(err);
        //     }
        //     resolve(noteCreated);
        //   });
        // });

        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-hubspot-contact-1634288136019',
          { portal },
        );
      } catch (err) {
        req.log.error({
          err,
          url: '/v1/webhooks/salesforce/:agency_id',
        });
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-hubspot-contact-1634288136019',
          { portal },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/webhooks/salesforce/:agency_id/:adhoc_name',
    handler: async (req, res) => {
      const { body, params } = req;
      const { agency_id, adhoc_name } = params;

      req.log.info({
        url: '/v1/webhooks/salesforce/:agency_id/:adhoc_name',
        payload: {
          params: req.params,
          body: req.body,
        },
      });

      switch (adhoc_name) {
        case 'contact-opportunity':
        default:
          await req.rabbitmq.pubSfAdhoc({
            consumerType:
              constant.AMQ.CONSUMER_TYPES.SF_CREATE_CONTACT_OPPORTUNITY,
            data: {
              agency_id,
              body,
            },
          });
      }

      h.api.createResponse(
        res,
        200,
        { success: true },
        '1-hubspot-contact-1634288136019',
        { portal },
      );
    },
  });

  next();
};

/**
 Sending note payload example from tray

 {
	"object": "Note",
	"fields": [
		{
			"key": "Body",
			"value": "Pave - Link Opened | Link - https://app.yourpave.com/preview?permalink=m4pq1ltp"
		},
		{
			"key": "ParentId",
			"value": "0030o00003n2guNAAQ"
		},
		{
			"key": "Title",
			"value": "Note by Pave"
		}
	]
}

*/
