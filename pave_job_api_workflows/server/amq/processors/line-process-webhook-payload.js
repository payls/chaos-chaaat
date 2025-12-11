const Sentry = require('@sentry/node');
const c = require('../../controllers');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const axios = require('axios');
const { performance } = require('perf_hooks');

function getMessageType(part) {
  const { contentType, data /* originalEvent */ } = part;
  if (contentType === 'status') {
    return data;
  }
  return contentType;
}

module.exports = async ({ data, models, channel, config, pubChannel, log, additionalConfig }) => {
  const payload = JSON.parse(data.content.toString());
  console.log(payload);
  const body = payload.data;
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  console.log('amq controller called');
  const transaction = await models.sequelize.transaction();
  try {
    const startTime = performance.now();
    log.info({
      data: 'LINE WEBHOOK PAYLOAD DATA',
      integration: 'DIRECT',
      payload: payload,
      body: body,
    });
    const agency_channel = body.agencyChannelConfig;
    if (body && !h.isEmpty(body.destination) && !h.isEmpty(body.events)) {
      console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
      console.log('CHANNEL', agency_channel);
      const events = body.events;
      events.forEach(async (event) => {
        console.log(event);
        const agency_id = agency_channel.agency_fk;
        const agency_channel_config_id =
          agency_channel.agency_channel_config_id;
        const api_token = agency_channel.uib_api_token;
        const api_secret = agency_channel.uib_api_secret;
        const agent_line_id = agency_channel.channel_id;
        const contact_line_id = event.source.userId;
        const agent_line_url = `line://${agency_channel.channel_id}@`;
        const contact_line_url = `line://${event.source.userId}@line.com`;
        const type = event.type;
        const payloadTimestamp = event.timestamp;
        const timestamp = Math.round(payloadTimestamp / 1000);
        const event_id = event.webhookEventId;
        console.log(type);
        if (h.cmpStr(type, 'follow')) {
          log.info({
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: 'follow',
            event_id: event_id,
            timestamp,
          });

          await c.lineDirectFollow.processContactFollow(
            {
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: 'follow',
              event_id: event_id,
              timestamp,
            },
            log,
            { transaction },
          );
          console.log('closing transaction for direct line follow');
          const amq_progress_tracker_id = data.fields.consumerTag;
          await amqProgressTrackerController.addSuccess(
            amq_progress_tracker_id,
            1,
            {
              transaction,
            },
          );

          await transaction.commit();
          if (channel && channel.ack) {
            log.info('Channel for acknowledgment');
            await channel.ack(data);
          } else {
            log.error('Channel not available for acknowledgment');
            throw new Error('AMQ channel not available');
          }
        } else if (h.cmpStr(type, 'unfollow')) {
          log.info({
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: 'unfollow',
            event_id: event_id,
            timestamp,
          });

          await c.lineDirectUnfollow.processContactUnfollow(
            {
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: 'unfollow',
              event_id: event_id,
              timestamp,
            },
            log,
            { transaction },
          );
          console.log('closing transaction for direct line unfollow');
          const amq_progress_tracker_id = data.fields.consumerTag;
          await amqProgressTrackerController.addSuccess(
            amq_progress_tracker_id,
            1,
            {
              transaction,
            },
          );

          await transaction.commit();
          if (channel && channel.ack) {
            log.info('Channel for acknowledgment');
            await channel.ack(data);
          } else {
            log.error('Channel not available for acknowledgment');
            throw new Error('AMQ channel not available');
          }
        } else if (h.cmpStr(type, 'message')) {
          const replyToken = event.replyToken;
          const quoteToken = event.message.quoteToken;
          const quotedMsgId = event.message.quotedMessageId;
          let replyToContent = null;
          let replyToMsgType = null;
          let replyToContact = null;
          if (!h.isEmpty(quotedMsgId)) {
            const quotedMsg = await c.lineChat.findOne({
              msg_id: quotedMsgId,
            });
            if (!h.isEmpty(quotedMsg)) {
              console.log(quotedMsg.dataValues);
              replyToContent = quotedMsg.dataValues.msg_body;
              replyToMsgType = quotedMsg.dataValues.msg_type;
              if (replyToMsgType.includes('frompave')) {
                const replyToChatAgentRecord = await c.agencyUser.findOne(
                  { agency_user_id: quotedMsg.dataValues?.agency_user_fk },
                  {
                    include: {
                      model: models.user,
                      required: true,
                    },
                    transaction,
                  },
                );
                replyToContact = replyToChatAgentRecord.user.first_name;
              } else {
                const replyToChatContactRecord = await c.contact.findOne(
                  {
                    contact_id: quotedMsg.dataValues?.contact_fk,
                  },
                  { transaction },
                );
                replyToContact =
                  replyToChatContactRecord?.first_name +
                  ' ' +
                  replyToChatContactRecord?.last_name;
              }
            } else {
              log.info({
                what: 'QUOTED MESSAGE ID NOT FOUND',
                data: quotedMsgId,
              });
            }
          }

          const msgType = event.message.type;
          const msgID = event.message.id;
          if (h.cmpStr(msgType, 'text')) {
            const content = event.message.text;
            log.info({
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: msgType,
              content,
              event_id: event_id,
              msg_id: msgID,
              reply_token: replyToken,
              quote_token: quoteToken,
              reply_to_msg_id: quotedMsgId,
              reply_to_content: replyToContent,
              reply_to_msg_type: replyToMsgType,
              reply_to_contact_id: replyToContact,
              timestamp,
            });

            const process = await c.lineDirectText.processTextMessage(
              {
                agency_id,
                agency_channel_config_id,
                api_token,
                api_secret,
                agent_line_id,
                agent_line_url,
                contact_line_id,
                contact_line_url,
                msg_type: msgType,
                content,
                event_id: event_id,
                msg_id: msgID,
                reply_token: replyToken,
                quote_token: quoteToken,
                reply_to_msg_id: quotedMsgId,
                reply_to_content: replyToContent,
                reply_to_msg_type: replyToMsgType,
                reply_to_contact_id: replyToContact,
                timestamp,
                agency_channel,
                is_opt_in_message: false,
                additionalConfig
              },
              log,
              { transaction },
            );

            if (process.success) {
              console.log('closing transaction for direct line text');
              const amq_progress_tracker_id = data.fields.consumerTag;
              await amqProgressTrackerController.addSuccess(
                amq_progress_tracker_id,
                1,
                {
                  transaction,
                },
              );

              await transaction.commit();
              if (channel && channel.ack) {
                log.info('Channel for acknowledgment');
                await channel.ack(data);
              } else {
                log.error('Channel not available for acknowledgment');
                throw new Error('AMQ channel not available');
              }
            } else {
              // console.log(process.data);
              // throw new Error(process.error);
              console.log(
                '================================= TEXT NACK ERROR LOG =================================',
              );
              console.log(process.error);
              console.log(process.data);
              console.log(
                '================================= TEXT NACK ERROR LOG =================================',
              );
              await transaction.rollback();
              await channel.nack(data, false, false);
            }
          } else if (h.cmpStr(msgType, 'image')) {
            const content = event.message.id;
            log.info({
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: msgType,
              content: content,
              event_id: event_id,
              msg_id: msgID,
              reply_token: replyToken,
              quote_token: quoteToken,
              reply_to_msg_id: quotedMsgId,
              reply_to_content: replyToContent,
              reply_to_msg_type: replyToMsgType,
              reply_to_contact_id: replyToContact,
              timestamp,
            });
            const process = await c.lineDirectImage.processImageMessage(
              {
                agency_id,
                agency_channel_config_id,
                api_token,
                api_secret,
                agent_line_id,
                agent_line_url,
                contact_line_id,
                contact_line_url,
                msg_type: msgType,
                content: content,
                event_id: event_id,
                msg_id: msgID,
                reply_token: replyToken,
                quote_token: quoteToken,
                reply_to_msg_id: quotedMsgId,
                reply_to_content: replyToContent,
                reply_to_msg_type: replyToMsgType,
                reply_to_contact_id: replyToContact,
                timestamp,
                agency_channel,
                additionalConfig
              },
              log,
              { transaction },
            );
            if (process.success) {
              console.log('closing transaction for direct line image');
              const amq_progress_tracker_id = data.fields.consumerTag;
              await amqProgressTrackerController.addSuccess(
                amq_progress_tracker_id,
                1,
                {
                  transaction,
                },
              );

              await transaction.commit();
              if (channel && channel.ack) {
                log.info('Channel for acknowledgment');
                await channel.ack(data);
              } else {
                log.error('Channel not available for acknowledgment');
                throw new Error('AMQ channel not available');
              }
            } else {
              // console.log(process.data);
              // throw new Error(process.error);
              console.log(
                '================================= IMAGE NACK ERROR LOG =================================',
              );
              console.log(process.error);
              console.log(process.data);
              console.log(
                '================================= IMAGE NACK ERROR LOG =================================',
              );
              await transaction.rollback();
              await channel.nack(data, false, false);
            }
          } else if (h.cmpStr(msgType, 'video')) {
            const content = event.message.id;
            log.info({
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: msgType,
              content: content,
              event_id: event_id,
              msg_id: msgID,
              reply_token: replyToken,
              quote_token: quoteToken,
              reply_to_msg_id: quotedMsgId,
              reply_to_content: replyToContent,
              reply_to_msg_type: replyToMsgType,
              reply_to_contact_id: replyToContact,
              timestamp,
              additionalConfig
            });
            const process = await c.lineDirectVideo.processVideoMessage(
              {
                agency_id,
                agency_channel_config_id,
                api_token,
                api_secret,
                agent_line_id,
                agent_line_url,
                contact_line_id,
                contact_line_url,
                msg_type: msgType,
                content: content,
                event_id: event_id,
                msg_id: msgID,
                reply_token: replyToken,
                quote_token: quoteToken,
                reply_to_msg_id: quotedMsgId,
                reply_to_content: replyToContent,
                reply_to_msg_type: replyToMsgType,
                reply_to_contact_id: replyToContact,
                timestamp,
                agency_channel,
                additionalConfig
              },
              log,
              { transaction },
            );
            if (process.success) {
              console.log('closing transaction for direct line video');
              const amq_progress_tracker_id = data.fields.consumerTag;
              await amqProgressTrackerController.addSuccess(
                amq_progress_tracker_id,
                1,
                {
                  transaction,
                },
              );

              await transaction.commit();
              if (channel && channel.ack) {
                log.info('Channel for acknowledgment');
                await channel.ack(data);
              } else {
                log.error('Channel not available for acknowledgment');
                throw new Error('AMQ channel not available');
              }
            } else {
              // console.log(process.data);
              // throw new Error(process.error);
              console.log(
                '================================= VIDEO NACK ERROR LOG =================================',
              );
              console.log(process.error);
              console.log(process.data);
              console.log(
                '================================= VIDEO NACK ERROR LOG =================================',
              );
              await transaction.rollback();
              await channel.nack(data, false, false);
            }
          }
        } else if (h.cmpStr(type, 'postback')) {
          const replyToken = event.replyToken;
          const quoteToken = null;
          const quotedMsgId = null;
          const replyToContent = null;
          const replyToMsgType = null;
          const replyToContact = null;
          const msgID = event.webhookEventId;
          const msgType = 'text';
          const postback = event.postback.data;
          const postBackParams = new URLSearchParams(postback);
          const content = postBackParams.get('label');
          const action = postBackParams.get('action');

          log.info({
            agency_id,
            agency_channel_config_id,
            api_token,
            api_secret,
            agent_line_id,
            agent_line_url,
            contact_line_id,
            contact_line_url,
            msg_type: msgType,
            content: content,
            event_id: event_id,
            msg_id: msgID,
            reply_token: replyToken,
            quote_token: quoteToken,
            reply_to_msg_id: quotedMsgId,
            reply_to_content: replyToContent,
            reply_to_msg_type: replyToMsgType,
            reply_to_contact_id: replyToContact,
            timestamp,
          });

          const lineTextContactID = await c.lineDirectText.processTextMessage(
            {
              agency_id,
              agency_channel_config_id,
              api_token,
              api_secret,
              agent_line_id,
              agent_line_url,
              contact_line_id,
              contact_line_url,
              msg_type: msgType,
              content,
              event_id: event_id,
              msg_id: msgID,
              reply_token: replyToken,
              quote_token: quoteToken,
              reply_to_msg_id: quotedMsgId,
              reply_to_content: replyToContent,
              reply_to_msg_type: replyToMsgType,
              reply_to_contact_id: replyToContact,
              timestamp,
              agency_channel,
              is_opt_in_message: true,
              opt_in_message: agency_channel.opt_in_message,
              opt_in_message_sent_date: agency_channel.opt_in_message_sent_date,
              additionalConfig
            },
            log,
            { transaction },
          );

          if (
            !h.isEmpty(lineTextContactID) &&
            h.cmpBool(lineTextContactID.success, true)
          ) {
            const contactList = await c.contactList.findOne({
              agency_fk: agency_channel.agency_fk,
              source_type: 'LINE',
              source_value: agency_channel_config_id,
              list_name: agency_channel.channel_name,
            });

            const rejectedContactList = await c.contactList.findOne({
              agency_fk: agency_channel.agency_fk,
              source_type: 'LINE',
              source_value: agency_channel_config_id,
              list_name: `${agency_channel.channel_name} Rejected`,
            });

            console.log('LISSSSSSST', contactList);

            if (
              !h.isEmpty(lineTextContactID) &&
              h.cmpBool(lineTextContactID.success, true)
            ) {
              let contact_list_id;
              let rejected_contact_list_id;
              let user_count = 1;
              let rejected_user_count = 1;

              if (h.cmpStr(action, 'allow')) {
                if (h.isEmpty(contactList)) {
                  contact_list_id = await c.contactList.create(
                    {
                      agency_fk: agency_channel.agency_fk,
                      list_name: agency_channel.channel_name,
                      source_type: 'LINE',
                      source_value: agency_channel_config_id,
                      user_count: user_count,
                      status: 'published',
                    },
                    { transaction: transaction },
                  );
                } else {
                  contact_list_id = contactList?.contact_list_id;
                  user_count = contactList?.user_count + 1;
                }
                const contactListUser = await c.contactListUser.findOne({
                  contact_list_id: contact_list_id,
                  contact_id: lineTextContactID.data,
                  import_type: 'LINE',
                });

                if (h.isEmpty(contactListUser)) {
                  const contact_list_user_id = h.general.generateId();
                  await c.contactListUser.create(
                    {
                      contact_list_user_id: contact_list_user_id,
                      contact_list_id: contact_list_id,
                      contact_id: lineTextContactID.data,
                      import_type: 'LINE',
                    },
                    { transaction: transaction },
                  );

                  if (!h.isEmpty(contactList)) {
                    await c.contactList.update(
                      contact_list_id,
                      {
                        user_count: user_count,
                      },
                      null,
                      { transaction: transaction },
                    );
                  }
                }
              }

              if (h.cmpStr(action, 'reject')) {
                if (h.isEmpty(rejectedContactList)) {
                  rejected_contact_list_id = await c.contactList.create(
                    {
                      agency_fk: agency_channel.agency_fk,
                      list_name: `${agency_channel.channel_name} Rejected`,
                      source_type: 'LINE',
                      source_value: agency_channel_config_id,
                      user_count: rejected_user_count,
                      status: 'published',
                    },
                    { transaction: transaction },
                  );
                } else {
                  rejected_contact_list_id =
                    rejectedContactList?.contact_list_id;
                  rejected_user_count = rejectedContactList?.user_count + 1;
                }
                const contactListUser = await c.contactListUser.findOne({
                  contact_list_id: rejected_contact_list_id,
                  contact_id: lineTextContactID.data,
                  import_type: 'LINE',
                });

                if (h.isEmpty(contactListUser)) {
                  const contact_list_user_id = h.general.generateId();
                  await c.contactListUser.create(
                    {
                      contact_list_user_id: contact_list_user_id,
                      contact_list_id: rejected_contact_list_id,
                      contact_id: lineTextContactID.data,
                      import_type: 'LINE',
                    },
                    { transaction: transaction },
                  );

                  if (!h.isEmpty(rejectedContactList)) {
                    await c.contactList.update(
                      rejected_contact_list_id,
                      {
                        user_count: rejected_user_count,
                      },
                      null,
                      { transaction: transaction },
                    );
                  }
                }
              }
            }

            console.log('closing transaction for direct line text for opt in');

            const amq_progress_tracker_id = data.fields.consumerTag;
            await amqProgressTrackerController.addSuccess(
              amq_progress_tracker_id,
              1,
              {
                transaction,
              },
            );

            await transaction.commit();
            if (channel && channel.ack) {
              log.info('Channel for acknowledgment');
              await channel.ack(data);
            } else {
              log.error('Channel not available for acknowledgment');
              throw new Error('AMQ channel not available');
            }
          } else {
            console.log(
              '================================= TEXT NACK ERROR LOG =================================',
            );
            console.log(process.error);
            console.log(process.data);
            console.log(
              '================================= TEXT NACK ERROR LOG =================================',
            );
            await transaction.rollback();
            await channel.nack(data, false, false);
          }
        }
      });
    } else {
      log.info({
        what: 'INVALID LINE DIRECT PAYLOAD DATA',
        data: payload,
      });
      throw new Error('INVALID LINE DIRECT PAYLOAD DATA');
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`API call took ${duration} milliseconds`);
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
