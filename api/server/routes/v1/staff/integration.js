const Sentry = require('@sentry/node');
const models = require('../../../models');
const h = require('../../../helpers');
const c = require('../../../controllers');
const userMiddleware = require('../../../middlewares/user');
const MindBodyAPI = require('../../../services/mindBodyApi');

module.exports = (fastify, opts, next) => {
  /** INITIATE MINBODY INTEGRATION */
  fastify.route({
    method: 'POST',
    url: '/staff/integration/initiate/mindbody',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const {
        siteId,
        apiKey,
        staffUsername,
        staffPassword,
        agencyId,
        agencyUserId,
      } = request.body;
      console.log('💥💥💥💥💥💥💥START INTEGRATION LOG💥💥💥💥💥💥💥');

      try {
        await h.database.transaction(async (transaction) => {
          let agencyOauthId;
          const mindBodySetting = await c.agencyOauthCtlr.findOne({
            source: 'MINDBODY',
            agency_fk: agencyId,
          });
          if (h.isEmpty(mindBodySetting)) {
            agencyOauthId = await c.agencyOauthCtlr.create(
              {
                source: 'MINDBODY',
                status: 'inactive',
                agency_fk: agencyId,
                created_by: agencyUserId,
                access_info: JSON.stringify({
                  siteId,
                  apiKey,
                  staffUsername,
                  staffPassword,
                }),
              },
              { transaction },
            );
          } else {
            agencyOauthId = mindBodySetting.agency_oauth_id;
            await c.agencyOauthCtlr.update(
              agencyOauthId,
              {
                status: 'inactive',
                updated_by: agencyUserId,
                access_info: JSON.stringify({
                  siteId,
                  apiKey,
                  staffUsername,
                  staffPassword,
                }),
              },
              { transaction },
            );
          }

          const mindbodyApi = new MindBodyAPI(siteId, apiKey);

          const webhookResponse = await mindbodyApi.createMindBodyWebhook(
            agencyId,
          );

          if (
            h.notEmpty(webhookResponse) &&
            h.notEmpty(webhookResponse.subscriptionId)
          ) {
            await mindbodyApi.activateMinBodyWebhook(
              webhookResponse.subscriptionId,
            );

            await c.agencyOauthCtlr.update(
              agencyOauthId,
              {
                status: 'active',
                webhook_info: JSON.stringify({
                  url: webhookResponse.webhookUrl,
                  subscriptionId: webhookResponse.subscriptionId,
                }),
              },
              { transaction },
            );
          }

          console.log(webhookResponse);
        });

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          'agency-integration-setting-1689818819-create-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'agency-integration-setting-1689818819-create-failed',
        );
      }
    },
  });

  /** DEACTIVATE MINDBODY */
  fastify.route({
    method: 'POST',
    url: '/staff/integration/disconnect/mindbody',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { agencyId, agencyUserId } = request.body;
      console.log('💥💥💥💥💥💥💥START DISCONNECT LOG💥💥💥💥💥💥💥');

      try {
        await h.database.transaction(async (transaction) => {
          const mindBodySetting = await c.agencyOauthCtlr.findOne({
            source: 'MINDBODY',
            agency_fk: agencyId,
          });

          if (h.notEmpty(mindBodySetting)) {
            const { access_info, webhook_info, agency_oauth_id } =
              mindBodySetting;

            const accessInfo = JSON.parse(access_info);
            const webhookInfo = JSON.parse(webhook_info);

            if (accessInfo) {
              const { siteId, apiKey } = accessInfo;
              const { subscriptionId } = webhookInfo;
              const mindbodyApi = new MindBodyAPI(siteId, apiKey);
              const deactivateMinBodyWebhook =
                await mindbodyApi.deactivateMinBodyWebhook(subscriptionId);
              if (h.notEmpty(deactivateMinBodyWebhook)) {
                await c.agencyOauthCtlr.update(
                  agency_oauth_id,
                  {
                    status: 'inactive',
                    updated_by: agencyUserId,
                  },
                  { transaction },
                );
              }
            }
          }
        });

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          'agency-integration-setting-1689818819-create-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'agency-integration-setting-1689818819-create-failed',
        );
      }
    },
  });

  /** CHECK MINDBODY STATUS */
  fastify.route({
    method: 'GET',
    url: '/staff/integration/status/mindbody',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { agency_id } = request.query;

      try {
        const setting = await c.agencyOauthCtlr.findOne({
          agency_fk: agency_id,
          source: 'MINDBODY',
        });

        h.api.createResponse(
          request,
          reply,
          200,
          { setting_status: setting ? setting.status : 'inactive' },
          'agency-integration-setting-1689818819-retrieve-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'agency-integration-setting-1689818819-retrieve-failed',
        );
      }
    },
  });
  next();
};
