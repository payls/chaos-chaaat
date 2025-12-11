const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const models = require('../../../models');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const ContactService = require('../../../services/staff/contact');
const contactService = new ContactService();

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/line-chat',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const { contact_id, tracker_ref_name } = req.query;
      const { user_id } = h.user.getCurrentUser(req);

      const currentAgencyUser = await c.agencyUser.findOne({
        user_fk: user_id,
      });

      // check if read by current agency user
      const lineChatCtlAppWhere = {
        contact_fk: contact_id,
        agency_fk: currentAgencyUser?.agency_fk,
      };

      const latestLineChat = await c.lineChat.findOne(lineChatCtlAppWhere, {
        order: [['created_date', 'DESC']],
      });

      const [, readCount, messageTracker] = await Promise.all([
        models.unified_inbox.update(
          {
            msg_id: latestLineChat?.line_chat_id,
            msg_type: latestLineChat?.msg_type,
            msg_body: latestLineChat?.msg_body,
            created_date: latestLineChat?.created_date,
            updated_date: latestLineChat?.created_date,
            last_msg_date: latestLineChat?.created_date,
          },
          {
            where: {
              msg_platform: 'line',
              contact_fk: contact_id,
              agency_fk: currentAgencyUser?.agency_fk,
            },
          },
        ),
        models.agency_user_chat_read_status.count({
          where: {
            chat_id: latestLineChat?.line_chat_id,
            chat_type: 'line',
            agency_user_fk: currentAgencyUser?.agency_user_id,
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        }),
        models.line_message_tracker.findOne({
          where: {
            tracker_type: 'main',
            receiver: latestLineChat?.receiver,
            agency_fk: currentAgencyUser?.agency_fk,
            ...(tracker_ref_name && { tracker_ref_name }),
          },
          order: [['created_date', 'DESC']],
        }),
      ]);

      console.log(messageTracker);

      if (h.cmpInt(readCount, 0)) {
        const agency_user_chat_read_status_id = h.general.generateId();
        models.agency_user_chat_read_status.create({
          agency_user_chat_read_status_id: agency_user_chat_read_status_id,
          chat_id: latestLineChat?.line_chat_id,
          chat_type: 'line',
          agency_user_fk: currentAgencyUser?.agency_user_id,
        });
      }

      let where = {};

      where = {
        contact_fk: contact_id,
        agency_fk: currentAgencyUser?.agency_fk,
      };

      const include = [
        {
          model: models.agency_channel_config,
          required: true,
        },
      ];
      const order = [['msg_timestamp', 'DESC']];
      let line_chats = [];
      try {
        if (!h.general.isEmpty(contact_id)) {
          line_chats = await c.lineChat.findAll(where, {
            order,
            include,
          });
        }

        const tracker_name = messageTracker?.tracker_ref_name;
        const is_latest_business_campaign =
          !tracker_name.includes('_user_message_');

        h.api.createResponse(
          req,
          res,
          200,
          {
            line_chats,
            tracker_ref_name: tracker_name,
            campaign_name: messageTracker?.campaign_name_label,
            is_business_campaign: is_latest_business_campaign,
          },
          '1-whatsapp-messages-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/line-chat',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-messages-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/line-chat',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'contact_line_id', 'message', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          message: { type: 'string' },
          to_save_message: { type: 'string' },
          contact_line_id: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
          selected_line_channel: { type: 'string' },
          last_line_channel_used: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        message,
        to_save_message,
        contact_line_id,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
        selected_line_channel,
        last_line_channel_used,
      } = req.body;
      try {
        // Find WhatsApp message tracker
        const contact = await models.contact.findOne({
          where: {
            agency_fk: agency_id,
            contact_id: contact_id,
            line_user_id: contact_line_id,
          },
        });
        const currentAgencyUser = await models.agency_user.findOne({
          where: {
            user_fk: user_id,
          },
          include: [
            { model: models.user, required: true },
            { model: models.agency, required: true },
          ],
        });
        if (h.cmpBool(contact.dataValues.opt_out_line, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message: 'Contact has opted out to receive Line messages.',
            },
            '2-line-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency Line channel config
          let line_channel;
          if (!h.isEmpty(selected_line_channel)) {
            line_channel = await models.agency_channel_config.findOne({
              where: {
                agency_channel_config_id: selected_line_channel,
              },
            });
          } else {
            line_channel = await models.agency_channel_config.findOne({
              where: {
                agency_fk: agency_id,
                channel_type: 'line',
                channel_id: last_line_channel_used,
              },
            });
          }

          // Create token
          const api_credentials = line_channel?.dataValues?.uib_api_token;

          const message_config = {
            to: contact_line_id,
            messages: [
              {
                type: 'text',
                text: message,
                quoteToken: null,
                sender: {
                  name: currentAgencyUser.user.first_name,
                  iconUrl:
                    'https://cdn.yourpave.com/assets/contact_support.png',
                },
              },
            ],
          };

          let replyToContent = null;
          let replyToMsgType = null;
          let replyToContact = null;
          let replyToMsgId = null;
          if (!h.isEmpty(to_reply_msg)) {
            message_config.messages[0].quoteToken = to_reply_msg?.quote_token;
            replyToContent = to_reply_msg?.msg_body;
            replyToMsgType = to_reply_msg?.msg_type;
            replyToMsgId = to_reply_msg?.msg_id;
            if (replyToMsgType.includes('frompave')) {
              const replyToChatAgentRecord = await c.agencyUser.findOne(
                { agency_user_id: to_reply_msg?.agency_user_fk },
                {
                  include: {
                    model: models.user,
                    required: true,
                  },
                },
              );
              replyToContact = replyToChatAgentRecord.user.first_name;
            } else {
              const replyToChatContactRecord = await c.contact.findOne({
                contact_id: to_reply_msg?.contact_fk,
              });
              replyToContact =
                replyToChatContactRecord?.first_name +
                ' ' +
                replyToChatContactRecord?.last_name;
            }
          }

          const lineFollowed = await models.line_follower.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              agency_channel_config_fk:
                line_channel?.dataValues?.agency_channel_config_id,
              line_user_fk: contact_line_id,
              status: 'active',
            },
          });

          if (!h.isEmpty(lineFollowed)) {
            const result = await h.line.sendMessage({
              contact_line_id,
              message_config,
              api_credentials,
              log: req.log,
            });

            if (!result.success) {
              req.log.error({
                err: {
                  message: 'an error occured while sending line message.',
                  result: result,
                },
                method: 'POST',
                url: '/v1/staff/line-chat',
              });
              h.api.createResponse(
                req,
                res,
                500,
                { result },
                '2-line-message-failed-1663834299369',
                {
                  portal,
                },
              );
            } else {
              if (h.cmpBool(result.success, true)) {
                const full_message_body = to_save_message;

                const [appsync, messageTracker] = await Promise.all([
                  c.appSyncCredentials.findOne({
                    status: 'active',
                  }),
                  models.line_message_tracker.findOne(
                    {
                      where: {
                        tracker_type: 'main',
                        contact_fk: contact_id,
                      },
                    },
                    { order: [['created_date', 'DESC']] },
                  ),
                ]);

                const { api_key } = appsync;

                const created_date = new Date();

                const options = {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                };
                const date = new Date(created_date);
                const formattedDate = date.toLocaleDateString('en-US', options);

                const timeOptions = {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                };
                const formattedTime = date.toLocaleTimeString(
                  'en-US',
                  timeOptions,
                );

                const line_chat_id = h.general.generateId();
                await models.line_chat.create({
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: agent_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: created_date,
                });

                await h.appsync.sendGraphQLNotification(api_key, {
                  platform: 'line',
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: agent_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: `${formattedDate} ${formattedTime}`,
                  agency_channel_config: line_channel.dataValues,
                });

                const unifiedInboxEntry = await c.unifiedInbox.findOne({
                  agency_fk: agency_id,
                  contact_fk: contact_id,
                  msg_platform: 'line',
                  tracker_type: 'main',
                });

                await c.unifiedInbox.update(
                  unifiedInboxEntry.unified_inbox_id,
                  {
                    tracker_ref_name,
                    campaign_name: messageTracker?.dataValues?.campaign_name,
                    agency_fk: agency_id,
                    contact_fk: contact_id,
                    event_id: result.original_event_id,
                    msg_id: result.msg_id,
                    msg_body: full_message_body,
                    msg_type: 'frompave',
                    msg_platform: 'line',
                    broadcast_date: new Date(),
                    last_msg_date: new Date(),
                    tracker_type: 'main',
                    sender: line_channel?.dataValues?.channel_id,
                    sender_url: null,
                    receiver: contact_line_id,
                    receiver_url: null,
                  },
                );
                const contact_source = await models.contact_source.findOne({
                  where: {
                    contact_fk: contact_id,
                    source_type: 'SALESFORCE',
                  },
                });

                if (!h.isEmpty(contact_source)) {
                  const liveChatSettings =
                    await models.live_chat_settings.findOne({
                      where: {
                        agency_fk: agency_id,
                      },
                    });
                  const agencyOauth = await models.agency_oauth.findOne({
                    where: {
                      agency_fk: agency_id,
                      status: 'active',
                      source: 'SALESFORCE',
                    },
                  });
                  const contactSalesforceData =
                    await c.contactSalesforceData.findOne(
                      {
                        agency_fk: agency_id,
                        contact_fk: contact_id,
                      },
                      {
                        order: [['created_date', 'DESC']],
                      },
                    );
                  await h.salesforce.transmitMessage({
                    liveChatSettings,
                    contactSalesforceData,
                    agencyOauth,
                    contact,
                    contact_source,
                    currentAgencyUser,
                    full_message_body,
                    messageType: 'text_frompave',
                    platform: 'line',
                    encryptionKeys
                  });
                }
              }

              const newMsg = await models.line_chat.findOne({
                where: {
                  msg_id: result.msg_id,
                },
              });

              h.api.createResponse(
                req,
                res,
                200,
                { newMsg },
                '1-line-message-reply-1663834299369',
                { portal },
              );
            }
          } else {
            h.api.createResponse(
              req,
              res,
              500,
              {},
              '2-line-message-failed-unfollowed-1663834299369',
              {
                portal,
              },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/line-chat',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/line-chat/img',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'contact_line_id', 'message', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          message: { type: 'string' },
          to_save_message: { type: 'string' },
          contact_line_id: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
          selected_line_channel: { type: 'string' },
          last_line_channel_used: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        message,
        to_save_message,
        contact_line_id,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
        selected_line_channel,
        last_line_channel_used,
      } = req.body;

      try {
        // Find WhatsApp message tracker
        const contact = await models.contact.findOne({
          where: {
            agency_fk: agency_id,
            contact_id: contact_id,
            line_user_id: contact_line_id,
          },
        });
        const currentAgencyUser = await models.agency_user.findOne({
          where: {
            user_fk: user_id,
          },
          include: [
            { model: models.user, required: true },
            { model: models.agency, required: true },
          ],
        });
        if (h.cmpBool(contact.dataValues.opt_out_line, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message: 'Contact has opted out to receive Line messages.',
            },
            '2-line-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency Line channel config
          let line_channel;
          if (!h.isEmpty(selected_line_channel)) {
            line_channel = await models.agency_channel_config.findOne({
              where: {
                agency_channel_config_id: selected_line_channel,
              },
            });
          } else {
            line_channel = await models.agency_channel_config.findOne({
              where: {
                agency_fk: agency_id,
                channel_type: 'line',
                channel_id: last_line_channel_used,
              },
            });
          }

          // Create token
          const api_credentials = line_channel?.dataValues?.uib_api_token;

          const message_config = {
            to: contact_line_id,
            messages: [
              {
                type: 'image',
                originalContentUrl: message,
                previewImageUrl: message,
                quoteToken: null,
                sender: {
                  name: currentAgencyUser.user.first_name,
                  iconUrl:
                    'https://cdn.yourpave.com/assets/contact_support.png',
                },
              },
            ],
          };

          let replyToContent = null;
          let replyToMsgType = null;
          let replyToContact = null;
          let replyToMsgId = null;
          if (!h.isEmpty(to_reply_msg)) {
            message_config.messages[0].quoteToken = to_reply_msg?.quote_token;
            replyToContent = to_reply_msg?.msg_body;
            replyToMsgType = to_reply_msg?.msg_type;
            replyToMsgId = to_reply_msg?.msg_id;
            if (replyToMsgType.includes('frompave')) {
              const replyToChatAgentRecord = await c.agencyUser.findOne(
                { agency_user_id: to_reply_msg?.agency_user_fk },
                {
                  include: {
                    model: models.user,
                    required: true,
                  },
                },
              );
              replyToContact = replyToChatAgentRecord.user.first_name;
            } else {
              const replyToChatContactRecord = await c.contact.findOne({
                contact_id: to_reply_msg?.contact_fk,
              });
              replyToContact =
                replyToChatContactRecord?.first_name +
                ' ' +
                replyToChatContactRecord?.last_name;
            }
          }

          const lineFollowed = await models.line_follower.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              agency_channel_config_fk:
                line_channel?.dataValues?.agency_channel_config_id,
              line_user_fk: contact_line_id,
              status: 'active',
            },
          });

          if (!h.isEmpty(lineFollowed)) {
            const result = await h.line.sendMessage({
              contact_line_id,
              message_config,
              api_credentials,
              log: req.log,
            });

            if (!result.success) {
              req.log.error({
                result,
                err: {
                  message: 'an error occured while sending line message.',
                },
                method: 'POST',
                url: '/v1/staff/line-chat/img',
              });
              h.api.createResponse(
                req,
                res,
                500,
                {},
                '2-line-message-failed-1663834299369',
                {
                  portal,
                },
              );
            } else {
              if (h.cmpBool(result.success, true)) {
                const full_message_body = to_save_message;

                const [appsync, messageTracker] = await Promise.all([
                  c.appSyncCredentials.findOne({
                    status: 'active',
                  }),
                  models.line_message_tracker.findOne(
                    {
                      where: {
                        tracker_type: 'main',
                        contact_fk: contact_id,
                      },
                    },
                    { order: [['created_date', 'DESC']] },
                  ),
                ]);

                const { api_key } = appsync;

                const created_date = new Date();

                const options = {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                };
                const date = new Date(created_date);
                const formattedDate = date.toLocaleDateString('en-US', options);

                const timeOptions = {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                };
                const formattedTime = date.toLocaleTimeString(
                  'en-US',
                  timeOptions,
                );

                const line_chat_id = h.general.generateId();
                await models.line_chat.create({
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: agent_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'img_frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: created_date,
                });

                await h.appsync.sendGraphQLNotification(api_key, {
                  platform: 'line',
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: agent_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'img_frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: `${formattedDate} ${formattedTime}`,
                  agency_channel_config: line_channel.dataValues,
                });

                const unifiedInboxEntry = await c.unifiedInbox.findOne({
                  agency_fk: agency_id,
                  contact_fk: contact_id,
                  msg_platform: 'line',
                  tracker_type: 'main',
                });

                await c.unifiedInbox.update(
                  unifiedInboxEntry.unified_inbox_id,
                  {
                    tracker_ref_name,
                    campaign_name: messageTracker?.dataValues?.campaign_name,
                    agency_fk: agency_id,
                    contact_fk: contact_id,
                    event_id: result.original_event_id,
                    msg_id: result.msg_id,
                    msg_body: full_message_body,
                    msg_type: 'img_frompave',
                    msg_platform: 'line',
                    broadcast_date: new Date(),
                    last_msg_date: new Date(),
                    tracker_type: 'main',
                    sender: line_channel?.dataValues?.channel_id,
                    sender_url: null,
                    receiver: contact_line_id,
                    receiver_url: null,
                  },
                );
                const contact_source = await models.contact_source.findOne({
                  where: {
                    contact_fk: contact_id,
                    source_type: 'SALESFORCE',
                  },
                });

                if (!h.isEmpty(contact_source)) {
                  const liveChatSettings =
                    await models.live_chat_settings.findOne({
                      where: {
                        agency_fk: agency_id,
                      },
                    });
                  const agencyOauth = await models.agency_oauth.findOne({
                    where: {
                      agency_fk: agency_id,
                      status: 'active',
                      source: 'SALESFORCE',
                    },
                  });
                  const contactSalesforceData =
                    await c.contactSalesforceData.findOne(
                      {
                        agency_fk: agency_id,
                        contact_fk: contact_id,
                      },
                      {
                        order: [['created_date', 'DESC']],
                      },
                    );
                  await h.salesforce.transmitMessage({
                    liveChatSettings,
                    contactSalesforceData,
                    agencyOauth,
                    contact,
                    contact_source,
                    currentAgencyUser,
                    full_message_body,
                    messageType: 'image_frompave',
                    platform: 'line',
                    encryptionKeys
                  });
                }
              }

              const newMsg = await models.line_chat.findOne({
                where: {
                  msg_id: result.msg_id,
                },
              });

              h.api.createResponse(
                req,
                res,
                200,
                { newMsg },
                '1-line-message-reply-1663834299369',
                { portal },
              );
            }
          } else {
            h.api.createResponse(
              req,
              res,
              500,
              {},
              '2-line-message-failed-unfollowed-1663834299369',
              {
                portal,
              },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/line-chat/img',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/line-chat/video',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'contact_line_id', 'message', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          message: { type: 'string' },
          to_save_message: { type: 'string' },
          contact_line_id: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
          selected_line_channel: { type: 'string' },
          last_line_channel_used: { type: 'string' },
          preview_image: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        message,
        to_save_message,
        contact_line_id,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
        selected_line_channel,
        last_line_channel_used,
        preview_image,
      } = req.body;
      console.log(req.body);
      const { user_id } = h.user.getCurrentUser(req);
      try {
        // Find WhatsApp message tracker
        const contact = await models.contact.findOne({
          where: {
            agency_fk: agency_id,
            contact_id: contact_id,
            line_user_id: contact_line_id,
          },
        });
        const currentAgencyUser = await models.agency_user.findOne({
          where: {
            user_fk: user_id,
          },
          include: [
            { model: models.user, required: true },
            { model: models.agency, required: true },
          ],
        });
        if (h.cmpBool(contact.dataValues.opt_out_line, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message: 'Contact has opted out to receive Line messages.',
            },
            '2-line-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency Line channel config
          let line_channel;
          if (!h.isEmpty(selected_line_channel)) {
            line_channel = await models.agency_channel_config.findOne({
              where: {
                agency_channel_config_id: selected_line_channel,
              },
            });
          } else {
            line_channel = await models.agency_channel_config.findOne({
              where: {
                agency_fk: agency_id,
                channel_type: 'line',
                channel_id: last_line_channel_used,
              },
            });
          }

          // Create token
          const api_credentials = line_channel?.dataValues?.uib_api_token;

          const message_config = {
            to: contact_line_id,
            messages: [
              {
                type: 'video',
                originalContentUrl: message,
                previewImageUrl: preview_image,
                quoteToken: null,
                sender: {
                  name: currentAgencyUser.user.first_name,
                  iconUrl:
                    'https://cdn.yourpave.com/assets/contact_support.png',
                },
              },
            ],
          };

          let replyToContent = null;
          let replyToMsgType = null;
          let replyToContact = null;
          let replyToMsgId = null;
          if (!h.isEmpty(to_reply_msg)) {
            message_config.messages[0].quoteToken = to_reply_msg?.quote_token;
            replyToContent = to_reply_msg?.msg_body;
            replyToMsgType = to_reply_msg?.msg_type;
            replyToMsgId = to_reply_msg?.msg_id;
            if (replyToMsgType.includes('frompave')) {
              const replyToChatAgentRecord = await c.agencyUser.findOne(
                { agency_user_id: to_reply_msg?.agency_user_fk },
                {
                  include: {
                    model: models.user,
                    required: true,
                  },
                },
              );
              replyToContact = replyToChatAgentRecord.user.first_name;
            } else {
              const replyToChatContactRecord = await c.contact.findOne({
                contact_id: to_reply_msg?.contact_fk,
              });
              replyToContact =
                replyToChatContactRecord?.first_name +
                ' ' +
                replyToChatContactRecord?.last_name;
            }
          }

          const lineFollowed = await models.line_follower.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              agency_channel_config_fk:
                line_channel?.dataValues?.agency_channel_config_id,
              line_user_fk: contact_line_id,
              status: 'active',
            },
          });

          if (!h.isEmpty(lineFollowed)) {
            const result = await h.line.sendMessage({
              contact_line_id,
              message_config,
              api_credentials,
              log: req.log,
            });

            if (!result.success) {
              req.log.error({
                result,
                err: {
                  message: 'an error occured while sending line message.',
                },
                method: 'POST',
                url: '/v1/staff/line-chat/video',
              });
              h.api.createResponse(
                req,
                res,
                500,
                {},
                '2-line-message-failed-1663834299369',
                {
                  portal,
                },
              );
            } else {
              if (h.cmpBool(result.success, true)) {
                const full_message_body = to_save_message;

                const [appsync, messageTracker] = await Promise.all([
                  c.appSyncCredentials.findOne({
                    status: 'active',
                  }),
                  models.line_message_tracker.findOne(
                    {
                      where: {
                        tracker_type: 'main',
                        contact_fk: contact_id,
                      },
                    },
                    { order: [['created_date', 'DESC']] },
                  ),
                ]);

                const { api_key } = appsync;

                const created_date = new Date();

                const options = {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                };
                const date = new Date(created_date);
                const formattedDate = date.toLocaleDateString('en-US', options);

                const timeOptions = {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                };
                const formattedTime = date.toLocaleTimeString(
                  'en-US',
                  timeOptions,
                );

                const line_chat_id = h.general.generateId();
                await models.line_chat.create({
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: agent_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'video_frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: created_date,
                });

                await h.appsync.sendGraphQLNotification(api_key, {
                  platform: 'line',
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: agent_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'video_frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: `${formattedDate} ${formattedTime}`,
                  agency_channel_config: line_channel.dataValues,
                });

                const unifiedInboxEntry = await c.unifiedInbox.findOne({
                  agency_fk: agency_id,
                  contact_fk: contact_id,
                  msg_platform: 'line',
                  tracker_type: 'main',
                });

                await c.unifiedInbox.update(
                  unifiedInboxEntry.unified_inbox_id,
                  {
                    tracker_ref_name,
                    campaign_name: messageTracker?.dataValues?.campaign_name,
                    agency_fk: agency_id,
                    contact_fk: contact_id,
                    event_id: result.original_event_id,
                    msg_id: result.msg_id,
                    msg_body: full_message_body,
                    msg_type: 'video_frompave',
                    msg_platform: 'line',
                    broadcast_date: new Date(),
                    last_msg_date: new Date(),
                    tracker_type: 'main',
                    sender: line_channel?.dataValues?.channel_id,
                    sender_url: null,
                    receiver: contact_line_id,
                    receiver_url: null,
                  },
                );
                const contact_source = await models.contact_source.findOne({
                  where: {
                    contact_fk: contact_id,
                    source_type: 'SALESFORCE',
                  },
                });

                if (!h.isEmpty(contact_source)) {
                  const liveChatSettings =
                    await models.live_chat_settings.findOne({
                      where: {
                        agency_fk: agency_id,
                      },
                    });
                  const agencyOauth = await models.agency_oauth.findOne({
                    where: {
                      agency_fk: agency_id,
                      status: 'active',
                      source: 'SALESFORCE',
                    },
                  });
                  const contactSalesforceData =
                    await c.contactSalesforceData.findOne(
                      {
                        agency_fk: agency_id,
                        contact_fk: contact_id,
                      },
                      {
                        order: [['created_date', 'DESC']],
                      },
                    );
                  await h.salesforce.transmitMessage({
                    liveChatSettings,
                    contactSalesforceData,
                    agencyOauth,
                    contact,
                    contact_source,
                    currentAgencyUser,
                    full_message_body,
                    messageType: 'video_frompave',
                    platform: 'line',
                    encryptionKeys
                  });
                }
              }

              const newMsg = await models.line_chat.findOne({
                where: {
                  msg_id: result.msg_id,
                },
              });

              h.api.createResponse(
                req,
                res,
                200,
                { newMsg },
                '1-line-message-reply-1663834299369',
                { portal },
              );
            }
          } else {
            h.api.createResponse(
              req,
              res,
              500,
              {},
              '2-line-message-failed-unfollowed-1663834299369',
              {
                portal,
              },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/line-chat/video',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/line-chat/template',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'contact_line_id',
          'agency_channel_config_id',
          'template_type',
          'message',
          'contact_id',
        ],
        properties: {
          agency_id: { type: 'string' },
          contact_line_id: { type: 'string' },
          agency_channel_config_id: { type: 'string' },
          template_type: { type: 'string' },
          message: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        contact_line_id,
        agency_channel_config_id,
        template_type,
        message,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;
      let message_content = message;
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const currentAgencyUser = await models.agency_user.findOne({
          where: {
            user_fk: user_id,
          },
          include: [
            { model: models.user, required: true },
            { model: models.agency, required: true },
          ],
        });
        // Find WhatsApp message tracker
        const contact = await models.contact.findOne({
          where: {
            agency_fk: agency_id,
            contact_id: contact_id,
            line_user_id: contact_line_id,
          },
        });
        if (h.cmpBool(contact.dataValues.opt_out_line, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message: 'Contact has opted out to receive Line messages.',
            },
            '2-line-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency Line channel config
          const line_channel = await models.agency_channel_config.findOne({
            where: {
              agency_channel_config_id: agency_channel_config_id,
            },
          });

          // Create token
          const api_credentials = line_channel?.dataValues?.uib_api_token;

          // handle dynamic fields
          const agentName = currentAgencyUser.user.first_name;
          const contactFirstName = contact.first_name;
          const contactLastName = contact.last_name;
          const agencyName = currentAgencyUser.agency.agency_name;
          message_content = message.replace('{{firstname}}', contactFirstName);
          message_content = message_content.replace(
            '{{lastname}}',
            contactLastName,
          );
          message_content = message_content.replace('{{agentname}}', agentName);
          message_content = message_content.replace('{{agency}}', agencyName);
          const final_message_content = JSON.parse(message_content);
          final_message_content.sender = {
            name: currentAgencyUser.user.first_name,
            iconUrl: 'https://cdn.yourpave.com/assets/contact_support.png',
          };
          const message_config = {
            to: contact_line_id,
            messages:
              template_type === 'BASIC'
                ? final_message_content
                : [final_message_content],
          };

          let replyToContent = null;
          let replyToMsgType = null;
          let replyToContact = null;
          let replyToMsgId = null;
          if (!h.isEmpty(to_reply_msg)) {
            message_config.messages[0].quoteToken = to_reply_msg?.quote_token;
            replyToContent = to_reply_msg?.msg_body;
            replyToMsgType = to_reply_msg?.msg_type;
            replyToMsgId = to_reply_msg?.msg_id;
            if (replyToMsgType.includes('frompave')) {
              const replyToChatAgentRecord = await c.agencyUser.findOne(
                { agency_user_id: to_reply_msg?.agency_user_fk },
                {
                  include: {
                    model: models.user,
                    required: true,
                  },
                },
              );
              replyToContact = replyToChatAgentRecord.user.first_name;
            } else {
              const replyToChatContactRecord = await c.contact.findOne({
                contact_id: to_reply_msg?.contact_fk,
              });
              replyToContact =
                replyToChatContactRecord?.first_name +
                ' ' +
                replyToChatContactRecord?.last_name;
            }
          }

          const lineFollowed = await models.line_follower.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              agency_channel_config_fk:
                line_channel?.dataValues?.agency_channel_config_id,
              line_user_fk: contact_line_id,
              status: 'active',
            },
          });

          if (!h.isEmpty(lineFollowed)) {
            const result = await h.line.sendMessage({
              contact_line_id,
              message_config,
              api_credentials,
              log: req.log,
            });

            if (!result.success) {
              req.log.error({
                err: {
                  message: 'an error occured while sending line message.',
                  result: result,
                },
                method: 'POST',
                url: '/v1/staff/line-chat',
              });
              h.api.createResponse(
                req,
                res,
                500,
                { result },
                '2-line-message-failed-1663834299369',
                {
                  portal,
                },
              );
            } else {
              if (h.cmpBool(result.success, true)) {
                const full_message_body =
                  await h.line.formatTemplateMessageForSaving({
                    template_type,
                    message: JSON.parse(message_content),
                    agent: currentAgencyUser.user.first_name,
                    contact: contact.first_name,
                    with_image: true,
                  });

                const [appsync, messageTracker] = await Promise.all([
                  c.appSyncCredentials.findOne({
                    status: 'active',
                  }),
                  models.line_message_tracker.findOne(
                    {
                      where: {
                        tracker_type: 'main',
                        contact_fk: contact_id,
                      },
                    },
                    { order: [['created_date', 'DESC']] },
                  ),
                ]);

                const { api_key } = appsync;

                const created_date = new Date();

                const options = {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                };
                const date = new Date(created_date);
                const formattedDate = date.toLocaleDateString('en-US', options);

                const timeOptions = {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                };
                const formattedTime = date.toLocaleTimeString(
                  'en-US',
                  timeOptions,
                );

                const line_chat_id = h.general.generateId();
                await models.line_chat.create({
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: currentAgencyUser?.agency_user_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: created_date,
                });

                await h.appsync.sendGraphQLNotification(api_key, {
                  platform: 'line',
                  line_chat_id: line_chat_id,
                  campaign_name: messageTracker?.dataValues?.campaign_name,
                  agency_fk: agency_id,
                  agency_user_fk: currentAgencyUser?.agency_user_id,
                  contact_fk: contact_id,
                  line_webhook_event_fk: result.quoteToken,
                  msg_id: result.msg_id,
                  quote_token: result.quoteToken,
                  msg_type: 'frompave',
                  msg_timestamp: Math.floor(Date.now() / 1000),
                  msg_body: full_message_body,
                  msg_origin: messageTracker?.dataValues?.msg_origin,
                  sender: line_channel?.dataValues?.channel_id,
                  sender_url: null,
                  receiver: contact_line_id,
                  receiver_url: null,
                  sent: 1,
                  delivered: 1,
                  read: 0,
                  reply_to_content: replyToContent,
                  reply_to_msg_type: replyToMsgType,
                  reply_to_msg_id: replyToMsgId,
                  reply_to_contact_id: replyToContact,
                  created_date: `${formattedDate} ${formattedTime}`,
                  agency_channel_config: line_channel.dataValues,
                });

                const unifiedInboxEntry = await c.unifiedInbox.findOne({
                  agency_fk: agency_id,
                  contact_fk: contact_id,
                  msg_platform: 'line',
                  tracker_type: 'main',
                });

                await c.unifiedInbox.update(
                  unifiedInboxEntry.unified_inbox_id,
                  {
                    tracker_ref_name,
                    campaign_name: messageTracker?.dataValues?.campaign_name,
                    agency_fk: agency_id,
                    contact_fk: contact_id,
                    event_id: result.original_event_id,
                    msg_id: result.msg_id,
                    msg_body: full_message_body,
                    msg_type: 'frompave',
                    msg_platform: 'line',
                    broadcast_date: new Date(),
                    last_msg_date: new Date(),
                    tracker_type: 'main',
                    sender: line_channel?.dataValues?.channel_id,
                    sender_url: null,
                    receiver: contact_line_id,
                    receiver_url: null,
                  },
                );

                const contact_source = await models.contact_source.findOne({
                  where: {
                    contact_fk: contact_id,
                    source_type: 'SALESFORCE',
                  },
                });

                if (!h.isEmpty(contact_source)) {
                  const liveChatSettings =
                    await models.live_chat_settings.findOne({
                      where: {
                        agency_fk: agency_id,
                      },
                    });
                  const agencyOauth = await models.agency_oauth.findOne({
                    where: {
                      agency_fk: agency_id,
                      status: 'active',
                      source: 'SALESFORCE',
                    },
                  });
                  const contactSalesforceData =
                    await c.contactSalesforceData.findOne(
                      {
                        agency_fk: agency_id,
                        contact_fk: contact_id,
                      },
                      {
                        order: [['created_date', 'DESC']],
                      },
                    );
                  await h.salesforce.transmitMessage({
                    liveChatSettings,
                    contactSalesforceData,
                    agencyOauth,
                    contact,
                    contact_source,
                    currentAgencyUser,
                    full_message_body,
                    messageType: 'template',
                    platform: 'line',
                    encryptionKeys
                  });
                }
              }

              const newMsg = await models.line_chat.findOne({
                where: {
                  msg_id: result.msg_id,
                },
              });

              h.api.createResponse(
                req,
                res,
                200,
                { newMsg },
                '1-line-message-reply-1663834299369',
                { portal },
              );
            }
          } else {
            h.api.createResponse(
              req,
              res,
              500,
              {},
              '2-line-message-failed-unfollowed-1663834299369',
              {
                portal,
              },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/line-chat',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/line-chat/send-opt-in-message',
    schema: {
      body: {
        type: 'object',
        required: ['agency_channel_config_id'],
        properties: {
          agency_channel_config_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_channel_config_id } = req.body;

      try {
        const line_channel = await models.agency_channel_config.findOne({
          where: {
            agency_channel_config_id: agency_channel_config_id,
          },
        });
        // Create token
        const api_credentials = line_channel?.dataValues?.uib_api_token;
        const message = {
          type: 'template',
          altText: 'Line Message Opt In Request via Chaaat',
          template: {
            type: 'buttons',
            text: 'Hi!. We kindly request permission to send Line messages via the Chaaat platform. Kindly respond using the options below. Thank you.',
            imageAspectRatio: 'rectangle',
            imageSize: 'cover',
            imageBackgroundColor: '#FFFFFF',
            actions: [
              {
                type: 'postback',
                label: 'Allow Request',
                data: `label=Allow Request&action=allow&config_id=${agency_channel_config_id}`,
                displayText: 'Allow Request',
                option_type: {
                  value: {
                    TEXT: 'Text',
                  },
                  label: ['Allow Request'],
                },
              },
              {
                type: 'postback',
                label: 'Reject Request',
                data: `label=Reject Request&action=reject&config_id=${agency_channel_config_id}`,
                displayText: 'Reject Request',
                option_type: {
                  value: {
                    TEXT: 'Text',
                  },
                  label: ['Reject Request'],
                },
              },
            ],
            defaultAction: {
              type: 'uri',
              label: 'View details',
              uri: 'https://chaaat.io',
            },
          },
        };
        const message_config = {
          messages: [message],
        };

        const result = await h.line.sendOptInMessage({
          message_config,
          api_credentials,
          log: req.log,
        });

        if (!result.success) {
          req.log.error({
            err: {
              message: 'an error occured while sending line broadcast message.',
              result: result,
            },
            method: 'POST',
            url: '/v1/staff/line-chat/send-opt-in-message',
          });
          h.api.createResponse(
            req,
            res,
            500,
            { result },
            '2-line-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          const full_message_body = await h.line.formatTemplateMessageForSaving(
            {
              template_type: 'BUTTON',
              message: message,
              agent: null,
              contact: null,
              with_image: false,
            },
          );
          await c.agencyChannelConfig.update(agency_channel_config_id, {
            sent_opt_in_message: 1,
            opt_in_message: full_message_body,
            opt_in_message_sent_date: new Date(),
          });
          h.api.createResponse(
            req,
            res,
            200,
            {},
            '1-line-message-reply-1663834299369',
            { portal },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/line-chat/send-opt-in-message',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
