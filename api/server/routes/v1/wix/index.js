const wix = require('./wixWebhook');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/wix/webhook',
    handler: wix.handler,
  })
  next();
};
