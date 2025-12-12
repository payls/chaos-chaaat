const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../helpers');
const c = require('../../controllers');
const models = require('../../models');
const { Op } = require('sequelize');
const { request } = require('../../helpers');
const shortlistedProjectController =
  require('../../controllers/shortlistedProject').makeShortListedProjectController(
    models,
  );
const config = require('../../configs/config')(process.env.NODE_ENV);
const crypto = require('crypto');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/line/message/webhook',
    handler: async (request, response) => {
      try {
        console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
        request.log.info({
          url: '/v1/line/message/webhook',
          payload: request,
        });
        console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');

        const webhook_url = 'https://' + request.headers.host + request.url;
        const xLineSignature = request.headers['x-line-signature'];
        const lineWebhookURL = new URL(webhook_url);
        const searchParams = new URLSearchParams(lineWebhookURL.search);
        const agent_line_id = searchParams.get('channel_id');

        if (!h.isEmpty(agent_line_id)) {
          const agencyChannelConfig = await c.agencyChannelConfig.findOne({
            channel_id: agent_line_id,
            channel_type: 'line',
          });
          console.log(agencyChannelConfig);

          if (!h.isEmpty(agencyChannelConfig)) {
            const channelSecret = agencyChannelConfig.uib_api_secret; // Channel secret string
            const body = JSON.stringify(request.body); // Request body string
            const signature = await crypto
              .createHmac('SHA256', channelSecret)
              .update(body)
              .digest('base64');

            request.log.info({
              signature: signature,
              xLineSignature,
            });

            if (h.cmpStr(signature, xLineSignature)) {
              request.body.agencyChannelConfig = agencyChannelConfig;
              const result =
                await request.rabbitmq.pubLineWebhookPayloadProcess({
                  data: request.body,
                  consumerType:
                    constant.AMQ.CONSUMER_TYPES.LINE_PROCESS_WEBHOOK_PAYLOAD,
                });
            } else {
              console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
              request.log.info({
                result: 'Signature mismatch',
                webhook_url: request.url,
                channel_id: agent_line_id,
                signature,
                xLineSignature,
                payload: request.body,
              });
              console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
            }
          } else {
            console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
            request.log.info({
              result: 'Unknown/invalid channel for this payload data',
              webhook_url: request.url,
              channel_id: agent_line_id,
              payload: request.body,
            });
            console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
          }
        } else {
          console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
          request.log.info({
            result: 'No channel id found in webhook url',
            webhook_url: request.url,
            channel_id: agent_line_id,
            payload: request.body,
          });
          console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
        }
        return { status: 200, info: 'OK' };
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: '/v1/line/message/webhook',
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-line-message-webhook-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });
  next();
};
