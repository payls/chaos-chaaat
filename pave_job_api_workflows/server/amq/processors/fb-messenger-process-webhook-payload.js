const Sentry = require('@sentry/node');
const c = require('../../controllers');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const axios = require('axios');

function getMessageType(part) {
  const { contentType, data /* originalEvent */ } = part;
  if (contentType === 'status') {
    return data;
  }
  return contentType;
}

module.exports = async ({ data, models, channel, config, pubChannel, log, additionalConfig }) => {
  const payload = JSON.parse(data.content.toString());
  const body = payload.data;
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  const transaction = await models.sequelize.transaction();
  try {
    log.info({
      data: 'MESSENGER WEBHOOK PAYLOAD DATA',
      payload: body,
    });

    console.log(body);

    if (body && body.object && h.cmpStr(body.object, 'page') && body.entry) {
      const bodyData = body.entry;
      for (let index = 0; index < bodyData.length; index++) {
        const page_id = bodyData[index].id;

        const agencyChannelConfig = await c.agencyChannelConfig.findOne({
          channel_id: page_id,
          channel_type: 'fbmessenger',
        });

        const agency_id = agencyChannelConfig.agency_fk;
        const agency_channel_config_id =
          agencyChannelConfig.agency_channel_config_id;
        const api_token = agencyChannelConfig.uib_api_token;
        const api_secret = agencyChannelConfig.uib_api_secret;

        if (bodyData[index].messaging) {
          const msgData = bodyData[index].messaging;
          for (let msgIndex = 0; msgIndex < msgData.length; msgIndex++) {
            const agent_messenger_id = msgData[msgIndex].recipient.id;
            const contact_messenger_id = msgData[msgIndex].sender.id;
            const timestamp = Math.round(msgData[msgIndex].timestamp / 1000);
            const event_id = msgData[msgIndex].message.mid;
            let message;
            let msg_type;
            let reply_to_event_id = null;
            let reply_to_content = null;
            let reply_to_msg_type = null;
            let reply_to_contact_id = null;

            if (h.notEmpty(msgData[msgIndex].message.reply_to)) {
              reply_to_event_id = msgData[msgIndex].message.reply_to.mid;
              const replyToChat = await c.messengerChat.findOne(
                {
                  messenger_webhook_event_fk: reply_to_event_id,
                },
                {
                  transaction,
                },
              );
              if (h.notEmpty(replyToChat)) {
                const agency_msg_types = [
                  'frompave',
                  'img_frompave',
                  'video_frompave',
                  'file_frompave',
                ];
                const contact_msg_types = [
                  'image',
                  'video',
                  'file',
                  'button',
                  'text',
                  'interactive',
                ];
                if (agency_msg_types.includes(replyToChat.msg_type)) {
                  const replyToChatAgentRecord = await c.agencyUser.findOne(
                    { agency_user_id: replyToChat.agency_user_fk },
                    {
                      include: {
                        model: models.user,
                        required: true,
                      },
                      transaction,
                    },
                  );
                  reply_to_contact_id = replyToChatAgentRecord.user.first_name;
                }
                if (contact_msg_types.includes(replyToChat.msg_type)) {
                  const replyToChatContactRecord = await c.contact.findOne(
                    {
                      contact_id: replyToChat.contact_fk,
                    },
                    { transaction },
                  );
                  reply_to_contact_id = replyToChatContactRecord?.first_name;
                }
                reply_to_content = replyToChat.msg_body;
                reply_to_msg_type = replyToChat.msg_type;
              }
            }

            if (h.notEmpty(msgData[msgIndex].message.text)) {
              msg_type = 'text';
              message = msgData[msgIndex].message.text;
              await c.messengerText.processTextMessage(
                {
                  agency_id,
                  agency_channel_config_id,
                  api_token,
                  api_secret,
                  agent_messenger_id,
                  agent_messenger_url: null,
                  contact_messenger_id,
                  contact_messenger_url: null,
                  msg_type: msg_type,
                  content: message,
                  event_id: event_id,
                  reply_to_event_id: reply_to_event_id,
                  reply_to_content: reply_to_content,
                  reply_to_msg_type: reply_to_msg_type,
                  reply_to_contact_id: reply_to_contact_id,
                  timestamp,
                  additionalConfig
                },
                log,
                {
                  transaction,
                },
              );
            } else {
              if (h.notEmpty(msgData[msgIndex].message.attachments)) {
                msg_type = msgData[msgIndex].message.attachments[0].type;
                message = msgData[msgIndex].message.attachments[0].payload.url;
                const mediaData = await fetch(message);
                const contentType = mediaData.headers.get('Content-Type');
                if (h.cmpStr(msg_type, 'image')) {
                  await c.messengerImage.processImageMessage(
                    {
                      agency_id,
                      agency_channel_config_id,
                      api_token,
                      api_secret,
                      agent_messenger_id,
                      agent_messenger_url: null,
                      contact_messenger_id,
                      contact_messenger_url: null,
                      msg_type: msg_type,
                      content: message,
                      content_type: contentType,
                      event_id: event_id,
                      reply_to_event_id: reply_to_event_id,
                      reply_to_content: reply_to_content,
                      reply_to_msg_type: reply_to_msg_type,
                      reply_to_contact_id: reply_to_contact_id,
                      timestamp,
                      additionalConfig
                    },
                    log,
                    {
                      transaction,
                    },
                  );
                } else if (h.cmpStr(msg_type, 'video')) {
                  await c.messengerVideo.processVideoMessage(
                    {
                      agency_id,
                      agency_channel_config_id,
                      api_token,
                      api_secret,
                      agent_messenger_id,
                      agent_messenger_url: null,
                      contact_messenger_id,
                      contact_messenger_url: null,
                      msg_type: msg_type,
                      content: message,
                      content_type: contentType,
                      event_id: event_id,
                      reply_to_event_id: reply_to_event_id,
                      reply_to_content: reply_to_content,
                      reply_to_msg_type: reply_to_msg_type,
                      reply_to_contact_id: reply_to_contact_id,
                      timestamp,
                      additionalConfig
                    },
                    log,
                    {
                      transaction,
                    },
                  );
                } else if (h.cmpStr(msg_type, 'file')) {
                  const urlObject = new URL(message);
                  const pathname = urlObject.pathname;
                  const filename = pathname.split('/').pop();
                  await c.messengerDocument.processDocumentMessage(
                    {
                      agency_id,
                      agency_channel_config_id,
                      api_token,
                      api_secret,
                      agent_messenger_id,
                      agent_messenger_url: null,
                      contact_messenger_id,
                      contact_messenger_url: null,
                      msg_type: msg_type,
                      content: message,
                      content_type: contentType,
                      filename,
                      event_id: event_id,
                      reply_to_event_id: reply_to_event_id,
                      reply_to_content: reply_to_content,
                      reply_to_msg_type: reply_to_msg_type,
                      reply_to_contact_id: reply_to_contact_id,
                      timestamp,
                    },
                    log,
                    {
                      transaction,
                    },
                  );
                }
              }
            }
          }
        }
      }
    } else {
      log.info({
        what: 'INVALID MESSENGER PAYLOAD DATA',
        data: payload,
      });
    }

    console.log('closing transaction');
    const amq_progress_tracker_id = data.fields.consumerTag;
    await amqProgressTrackerController.addSuccess(amq_progress_tracker_id, 1, {
      transaction,
    });

    await transaction.commit();
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    Sentry.captureException(err);
    console.log(
      '================================= NACK ERROR LOG =================================',
    );
    console.log(err);
    console.log(
      '================================= NACK ERROR LOG =================================',
    );
    await transaction.rollback();
    await channel.nack(data, false, false);
  }
};
