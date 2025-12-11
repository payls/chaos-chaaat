const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');

async function handler(request, response) {
  const log = request.log.child({
    url: '/v1/whatsapp/onboarding/webhook',
    method: 'POST'
  });

  const payload = request.body;

  log.info({ payload });

  try {
    const result = request.rabbitmq.pubWhatsappOnboardingWebhookPayload({
      data: payload,
      consumerType: constant.AMQ.CONSUMER_TYPES.WA_PROCESS_ONBOARDING_WEBHOOK_PAYLOAD
    });
  
    log.info({ rabbitmq_result: result });
  
    return { status: 200, info: 'OK' };
  } catch (err) {
    Sentry.captureException(err);
    log.error({
      err,
      error_string: String(err),
    });
    h.api.createResponse(
      request,
      response,
      500,
      {},
      '2-whatsapp-message-webhook-1663834299369',
      {
        portal,
      },
    );
  }
}

module.exports.handler = handler;
