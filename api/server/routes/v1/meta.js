const constant = require('../../constants/constant.json');
const models = require('../../models');
const { Op } = require('sequelize');
const { request } = require('../../helpers');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/meta/redirect',
    handler: async (request, response) => {
      return { status: 200, info: 'OK' };
    },
  });

  fastify.route({
    method: 'GET',
    url: '/messenger/webhook',
    handler: async (request, response) => {
      const mode = request.query['hub.mode'];
      const token = request.query['hub.verify_token'];
      const challenge = request.query['hub.challenge'];

      // Check if a token and mode is in the query string of the request
      if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === 'subscribe' && token === '315343961336992') {
          // Respond with the challenge token from the request
          console.log('WEBHOOK_VERIFIED');
          response.status(200).send(challenge);
        } else {
          // Respond with '403 Forbidden' if verify tokens do not match
          response.sendStatus(403);
        }
      }
      // return { status: 200, info: 'OK' };
    },
  });

  fastify.route({
    method: 'POST',
    url: '/messenger/webhook',
    handler: async (request, response) => {
      const body = request.body;

      console.log(`\u{1F7EA} Received webhook:`);
      console.dir(body, { depth: null });

      const result = await request.rabbitmq.pubFBMessengerWebhookPayloadProcess(
        {
          data: request.body,
          consumerType:
            constant.AMQ.CONSUMER_TYPES.FB_MESSENGER_PROCESS_WEBHOOK_PAYLOAD,
        },
      );

      return { status: 200, info: 'OK' };
    },
  });
  next();
};
