const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const models = require('../../../models');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const ContactService = require('../../../services/staff/contact');
const contactService = new ContactService();
const jsforce = require('jsforce');
const config = require('../../../configs/config')(process.env.NODE_ENV);
const BPromise = require('bluebird');
const Axios = require('axios');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/messenger/generate/access-token',
    schema: {},
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, code } = req.query;
      const { user_id } = h.user.getCurrentUser(req);
      const transaction = await models.sequelize.transaction();
      try {
        const messengerConfig = {
          method: 'get',
          url: `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${config.messenger.client_id}&client_secret=${config.messenger.client_secret}&code=${code}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const response = await Axios(messengerConfig);
        console.log(response);
        if (response.status === 200) {
          console.log(response.data.access_token);
          const accountConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://graph.facebook.com/v19.0/me/accounts',
            headers: {
              Authorization: `Bearer ${response.data.access_token}`,
            },
          };

          const accoutResponse = await Axios(accountConfig);

          if (accoutResponse.status === 200) {
            const pageAccessDetails = accoutResponse.data.data;
            // add subscription to webhook
            for (let index = 0; index < pageAccessDetails.length; index++) {
              const page = pageAccessDetails[index];
              console.log(page);
              const agencyChannel = await c.agencyChannelConfig.findOne({
                agency_fk: agency_id,
                channel_id: page.id,
              });

              const subscribeConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://graph.facebook.com/v19.0/${page.id}/subscribed_apps?subscribed_fields=messages&access_token=${page.access_token}`,
                headers: {
                  'Content-Type': 'application/json',
                },
              };

              const subscribeStatus = await Axios(subscribeConfig)
                .then(function (apiResponse) {
                  console.log(apiResponse);
                  return apiResponse.status;
                })
                .catch(function (apiError) {
                  Sentry.captureException(apiError);
                  console.log(apiError.response);
                  return apiError.response.status;
                });

              if (h.isEmpty(agencyChannel)) {
                await c.agencyChannelConfig.create(
                  {
                    agency_fk: agency_id,
                    channel_id: page.id,
                    channel_name: page.name,
                    bot_id: null,
                    channel_type: 'fbmessenger',
                    uib_api_token: page.access_token,
                    uib_api_secret: subscribeStatus === 200 ? 1 : 0,
                    created_by: user_id,
                  },
                  { transaction },
                );
              } else {
                await c.agencyChannelConfig.update(
                  agencyChannel.agency_channel_config_id,
                  {
                    uib_api_token: page.access_token,
                    channel_name: page.name,
                    uib_api_secret: subscribeStatus === 200 ? 1 : 0,
                    updated_by: user_id,
                  },
                  { transaction },
                );
              }
            }
            // saving to database
            await transaction.commit();
            h.api.createResponse(
              req,
              res,
              200,
              {
                access_token: response.data,
                account: accoutResponse.data,
              },
              '1-messenger-access-token-1663834299369',
              {
                portal,
              },
            );
          } else {
            throw new Error('Failed to connect');
          }
        } else {
          throw new Error('Failed to connect');
        }
      } catch (err) {
        Sentry.captureException(err);
        await transaction.rollback();
        req.log.error({
          err,
          url: '/v1/staff/messenger/generate/access-token',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-messenger-access-token-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/messenger/subscribe-to-webhook',
    schema: {
      body: {
        type: 'object',
        required: ['agency_channel_config_id'],
        properties: {
          agency_channel_config_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_channel_config_id } = req.body;
      const { user_id } = h.user.getCurrentUser(req);
      try {
        const page = await c.agencyChannelConfig.findOne({
          agency_channel_config_id: agency_channel_config_id,
        });

        const subscribeConfig = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `https://graph.facebook.com/v19.0/${page.channel_id}/subscribed_apps?subscribed_fields=messages&access_token=${page.uib_api_token}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const subscribeStatus = await Axios(subscribeConfig)
          .then(function (apiResponse) {
            console.log(apiResponse);
            return apiResponse.status;
          })
          .catch(function (apiError) {
            Sentry.captureException(apiError);
            console.log(apiError.response);
            return apiError.response.status;
          });

        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-messenger-webhook-subscription-1663834299369',
          {
            portal,
          },
        );

        await c.agencyChannelConfig.update(page.agency_channel_config_id, {
          uib_api_secret: subscribeStatus === 200 ? 1 : 0,
          updated_by: user_id,
        });
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/messenger/subscribe-to-webhook',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-messenger-webhook-subscription-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });
  next();
};
