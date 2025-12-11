const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');

async function handler(request, response) {
  try {
    request.log.info({
      url: '/v1/whatsapp/message/webhook',
      payload: request.body,
    });

    const bodyData = request.body;
    const connectionURI = bodyData?.data?.uri;
    request.log.info({
      message: 'Connection URL',
      data: connectionURI,
    });

    // publish message
    if (
      connectionURI &&
      connectionURI.length > 0 &&
      connectionURI.includes('whatsapp')
    ) {
      const body = request.body;
      const contentType = body.data.parts[0].contentType;
      if (h.cmpStr(contentType, 'status')) {
        await request.rabbitmq.pubWhatsappStatusWebhookPayloadProcess({
          data: request.body,
          consumerType:
            constant.AMQ.CONSUMER_TYPES.WA_PROCESS_STATUS_WEBHOOK_PAYLOAD,
        });
      } else {
        await request.rabbitmq.pubWhatsappWebhookPayloadProcess({
          data: request.body,
          consumerType: constant.AMQ.CONSUMER_TYPES.WA_PROCESS_WEBHOOK_PAYLOAD,
        });
      }
    } else if (
      connectionURI &&
      connectionURI.length > 0 &&
      connectionURI.includes('line')
    ) {
      await request.rabbitmq.pubLineWebhookPayloadProcess({
        isDirect: false,
        data: request.body,
        consumerType: constant.AMQ.CONSUMER_TYPES.LINE_PROCESS_WEBHOOK_PAYLOAD,
      });
    } else {
      request.log.info({
        result: 'Unknown/invalid payload data',
        payload: request.body,
      });
    }

    return { status: 200, info: 'OK' };
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      err,
      url: '/v1/whatsapp/message/webhook',
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
