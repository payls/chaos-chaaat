const Sentry = require('@sentry/node');

const c = require('../../controllers');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const axios = require('axios');

module.exports = async ({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) => {
  const payload = JSON.parse(data.content.toString());
  const body = payload.data;
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  const transaction = await models.sequelize.transaction();
  try {
    log.info({
      data: 'WEBHOOK PAYLOAD DATA',
      payload: body,
    });
    if (
      !h.isEmpty(body) &&
      !h.isEmpty(body?.session_id) &&
      !h.isEmpty(body?.data) &&
      !h.isEmpty(body?.data?.msg_type)
    ) {
      const session_id = body?.session_id;
      const bodyData = body.data;
      const msg_type = bodyData.msg_type;
      if (['text', 'image', 'video', 'file'].includes(msg_type)) {
        const receiveMessageBody = {
          ...bodyData,
          encryptionKeys: additionalConfig.ek,
        };
        await c.liveChat.receiveMessage(session_id, receiveMessageBody, log, {
          transaction,
        });
      } else if (h.cmpStr(msg_type, 'read')) {
        await c.liveChat.setStatus(session_id, bodyData, log, {
          transaction: null,
        });
      } else {
        throw new Error(
          JSON.stringify({
            message: 'invalid message type',
            payload: bodyData,
          }),
        );
      }
    } else {
      log.info({
        what: 'INVALID PAYLOAD DATA',
        data: payload,
      });
    }
    log.info({ action: 'closing transaction' });
    const amq_progress_tracker_id = data.fields.consumerTag;
    await amqProgressTrackerController.addSuccess(amq_progress_tracker_id, 1);

    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    Sentry.captureException(err);
    log.info({
      message:
        '================================= NACK ERROR LOG =================================',
    });
    console.log(
      '================================= NACK ERROR LOG =================================',
    );
    log.error({ err });
    log.info({
      message:
        '================================= NACK ERROR LOG =================================',
    });
    console.log(
      '================================= NACK ERROR LOG =================================',
    );
    await transaction.rollback();
    await channel.nack(data, false, false);
  }
};
