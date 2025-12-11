const whatsappMessageWebhook = require('./whatsappMessageWebhook');
const whatsappOnboardingWebhook = require('./whatsappOnboardingWebhook');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/whatsapp/message/webhook',
    handler: whatsappMessageWebhook.handler,
  });

  fastify.route({
    method: 'POST',
    url: '/whatsapp/onboarding/webhook',
    handler: whatsappOnboardingWebhook.handler,
  })
  next();
};
