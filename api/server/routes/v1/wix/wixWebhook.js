const constant = require('../../../constants/constant.json');

async function handler(request, response) {
  try {
    const body = {
      action: "wix_webhook_receive",
      body: request.body
    }
    await request.rabbitmq.wixWebhookPayloadProcess({
      data: body,
      consumerType:
        constant.AMQ.CONSUMER_TYPES.WIX_PROCESS_WEBHOOK_PAYLOAD,
    });
    return response.code(200).send({ success: true });
  } catch (err) {
    console.log(err);
  }
}

module.exports.handler = handler;