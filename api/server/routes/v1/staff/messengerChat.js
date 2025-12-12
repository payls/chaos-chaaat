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
    url: '/staff/messenger',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const { contact_id } = req.query;
      const { user_id } = h.user.getCurrentUser(req);

      const currentAgencyUser = await c.agencyUser.findOne({
        user_fk: user_id,
      });

      // check if read by current agency user
      const messengerChatCtlAppWhere = {
        contact_fk: contact_id,
        agency_fk: currentAgencyUser?.agency_fk,
      };

      const latestMessengerChat = await c.messengerChat.findOne(
        messengerChatCtlAppWhere,
        {
          order: [['created_date', 'DESC']],
        },
      );

      const [, readCount] = await Promise.all([
        models.unified_inbox.update(
          {
            msg_id: latestMessengerChat?.messenger_chat_id,
            msg_type: latestMessengerChat?.msg_type,
            msg_body: latestMessengerChat?.msg_body,
            created_date: latestMessengerChat?.created_date,
            updated_date: latestMessengerChat?.created_date,
            last_msg_date: latestMessengerChat?.created_date,
          },
          {
            where: {
              msg_platform: 'fbmessenger',
              contact_fk: contact_id,
              agency_fk: currentAgencyUser?.agency_fk,
            },
          },
        ),
        models.agency_user_chat_read_status.count({
          where: {
            chat_id: latestMessengerChat?.messenger_chat_id,
            chat_type: 'fbmessenger',
            agency_user_fk: currentAgencyUser?.agency_user_id,
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        }),
      ]);

      if (h.cmpInt(readCount, 0)) {
        const agency_user_chat_read_status_id = h.general.generateId();
        models.agency_user_chat_read_status.create({
          agency_user_chat_read_status_id: agency_user_chat_read_status_id,
          chat_id: latestMessengerChat?.messenger_chat_id,
          chat_type: 'fbmessenger',
          agency_user_fk: currentAgencyUser?.agency_user_id,
        });
      }

      let where = {};

      where = {
        contact_fk: contact_id,
        agency_fk: currentAgencyUser?.agency_fk,
      };

      const include = [];
      const order = [['msg_timestamp', 'DESC']];
      let messenger_chats = [];
      try {
        if (!h.general.isEmpty(contact_id)) {
          messenger_chats = await c.messengerChat.findAll(where, {
            order,
            include,
          });
        }

        h.api.createResponse(
          req,
          res,
          200,
          {
            messenger_chats,
          },
          '1-messenger-messages-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/messenger',
        });
        h.api.createResponse(
          req,
          res,
          500,
          { err },
          '2-messenger-messages-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/messenger',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'messenger_id', 'message', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          message_to_save: { type: 'string' },
          message: { type: 'string' },
          messenger_id: { type: 'string' },
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
      const {
        agency_id,
        agent_id,
        message_to_save,
        message,
        messenger_id,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;

      try {
        // Find Messenger message tracker
        const [tracker, contact] = await Promise.all([
          models.messenger_message_tracker.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              receiver: messenger_id,
              tracker_type: 'main',
            },
            order: [['created_date', 'DESC']],
          }),
          models.contact.findOne({
            where: {
              agency_fk: agency_id,
              contact_id: contact_id,
              messenger_id: messenger_id,
            },
          }),
        ]);
        if (h.cmpBool(contact.dataValues.opt_out_messenger, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message:
                'Contact has opted out to receive FB Messenger messages.',
            },
            '2-messenger-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency WhatsApp config
          const messenger_channel = await models.agency_channel_config.findOne({
            where: {
              agency_fk: agency_id,
              channel_type: 'fbmessenger',
              channel_id: tracker?.dataValues?.sender,
            },
          });

          const access_token = messenger_channel?.dataValues?.uib_api_token;

          const returnPath = null;

          const result = await h.fbmessenger.sendMessage({
            sender_id: messenger_channel?.dataValues?.channel_id,
            receiver_id: messenger_id,
            message,
            returnPath,
            access_token,
            type: 'text',
            log: req.log,
          });

          if (!result.success) {
            req.log.error({
              err: {
                message: 'an error occured while sending messenger message.',
              },
              method: 'POST',
              url: '/v1/staff/messenger',
            });
            h.api.createResponse(
              req,
              res,
              500,
              { result },
              '2-messenger-message-failed-1663834299369',
              {
                portal,
              },
            );
          } else {
            if (!h.isEmpty(result.original_event_id)) {
              const full_message_body = message_to_save;

              const [appsync, messageTracker, contact] = await Promise.all([
                c.appSyncCredentials.findOne({
                  status: 'active',
                }),
                models.messenger_message_tracker.findOne(
                  {
                    where: {
                      tracker_type: 'main',
                      contact_fk: contact_id,
                    },
                  },
                  { order: [['created_date', 'DESC']] },
                ),
                models.contact.findOne({
                  where: {
                    contact_id: contact_id,
                  },
                }),
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

              const messenger_chat_id = h.general.generateId();
              await models.messenger_chat.create({
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                messenger_webhook_event_fk: result.original_event_id,
                msg_type: 'frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body: full_message_body,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                sent: 1,
                delivered: 1,
                read: 0,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                created_date: created_date,
              });

              await h.appsync.sendGraphQLNotification(api_key, {
                platform: 'fbmessenger',
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                messenger_webhook_event_fk: result.original_event_id,
                msg_type: 'frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body: full_message_body,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                sent: 1,
                delivered: 1,
                read: 0,
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                created_date: `${formattedDate} ${formattedTime}`,
              });

              const unifiedInboxEntry = await c.unifiedInbox.findOne({
                agency_fk: agency_id,
                contact_fk: contact_id,
                msg_platform: 'fbmessenger',
                tracker_type: 'main',
              });

              await c.unifiedInbox.update(unifiedInboxEntry.unified_inbox_id, {
                tracker_ref_name,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                contact_fk: contact_id,
                event_id: result.original_event_id,
                msg_id: messenger_chat_id,
                msg_body: full_message_body,
                msg_type: 'frompave',
                msg_platform: 'fbmessenger',
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                tracker_type: 'main',
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
              });
            }

            const newMsg = await models.messenger_chat.findOne({
              where: {
                messenger_webhook_event_fk: result.original_event_id,
              },
            });

            h.api.createResponse(
              req,
              res,
              200,
              { newMsg },
              '1-messenger-message-reply-1663834299369',
              { portal },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/messenger',
        });
        h.api.createResponse(
          req,
          res,
          500,
          { err },
          '2-messenger-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/messenger/img',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'messenger_id',
          'message',
          'to_save_parts',
          'contact_id',
        ],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          message: { type: 'string' },
          to_save_parts: { type: 'array' },
          messenger_id: { type: 'string' },
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
      const {
        agency_id,
        agent_id,
        message,
        to_save_parts: save_parts,
        messenger_id,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;

      try {
        // Find Messenger message tracker
        const [tracker, contact] = await Promise.all([
          models.messenger_message_tracker.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              receiver: messenger_id,
              tracker_type: 'main',
            },
            order: [['created_date', 'DESC']],
          }),
          models.contact.findOne({
            where: {
              agency_fk: agency_id,
              contact_id: contact_id,
              messenger_id: messenger_id,
            },
          }),
        ]);
        if (h.cmpBool(contact.dataValues.opt_out_messenger, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message: 'Contact has opted out to receive Messenger messages.',
            },
            '2-messenger-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency messenger config
          const messenger_channel = await models.agency_channel_config.findOne({
            where: {
              agency_fk: agency_id,
              channel_type: 'fbmessenger',
              channel_id: tracker?.dataValues?.sender,
            },
          });

          // Create token
          const access_token = messenger_channel?.dataValues?.uib_api_token;

          const returnPath = null;

          const result = await h.fbmessenger.sendMessage({
            sender_id: messenger_channel?.dataValues?.channel_id,
            receiver_id: messenger_id,
            message,
            returnPath,
            access_token,
            type: 'image',
            log: req.log,
          });

          if (!result.success) {
            req.log.error({
              result,
              err: {
                message: 'an error occured while sending messenger message.',
              },
              method: 'POST',
              url: '/v1/staff/messenger/img',
            });
            h.api.createResponse(
              req,
              res,
              500,
              {},
              '2-messenger-message-failed-1663834299369',
              {
                portal,
              },
            );
          } else {
            if (!h.isEmpty(result.original_event_id)) {
              const full_message_body = save_parts.reduce((pv, cv) => {
                return (pv += cv.data + '\n');
              }, '');

              const [appsync, messageTracker, contact] = await Promise.all([
                c.appSyncCredentials.findOne({
                  status: 'active',
                }),
                models.messenger_message_tracker.findOne(
                  {
                    where: {
                      tracker_type: 'main',
                      contact_fk: contact_id,
                    },
                  },
                  { order: [['created_date', 'DESC']] },
                ),
                models.contact.findOne({
                  where: {
                    contact_id: contact_id,
                  },
                }),
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

              const messenger_chat_id = h.general.generateId();
              await models.messenger_chat.create({
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                messenger_webhook_event_fk: result.original_event_id,
                msg_type: 'img_frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body: full_message_body,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                sent: 1,
                delivered: 1,
                read: 0,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                created_date: created_date,
              });

              await h.appsync.sendGraphQLNotification(api_key, {
                platform: 'fbmessenger',
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                original_event_id: result.original_event_id,
                msg_type: 'img_frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body: full_message_body,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                sent: 1,
                delivered: 1,
                read: 0,
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                created_date: `${formattedDate} ${formattedTime}`,
              });

              const unifiedInboxEntry = await c.unifiedInbox.findOne({
                agency_fk: agency_id,
                contact_fk: contact_id,
                msg_platform: 'fbmessenger',
                tracker_type: 'main',
              });

              await c.unifiedInbox.update(unifiedInboxEntry.unified_inbox_id, {
                tracker_ref_name,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                contact_fk: contact_id,
                event_id: result.original_event_id,
                msg_id: messenger_chat_id,
                msg_body: 'Photo',
                msg_type: 'img_frompave',
                msg_platform: 'fbmessenger',
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                tracker_type: 'main',
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
              });
            }

            const newMsg = await models.messenger_chat.findOne({
              where: {
                messenger_webhook_event_fk: result.original_event_id,
              },
            });

            h.api.createResponse(
              req,
              res,
              200,
              { newMsg },
              '1-messenger-message-reply-1663834299369',
              { portal },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/messenger/img',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-messenger-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/messenger/video',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'messenger_id',
          'message',
          'to_save_parts',
          'contact_id',
        ],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          message: { type: 'string' },
          to_save_parts: { type: 'array' },
          messenger_id: { type: 'string' },
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
      const {
        agency_id,
        agent_id,
        message,
        to_save_parts: save_parts,
        messenger_id,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;

      try {
        // Find WhatsApp message tracker
        const [tracker, contact] = await Promise.all([
          models.messenger_message_tracker.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              receiver: messenger_id,
              tracker_type: 'main',
            },
            order: [['created_date', 'DESC']],
          }),
          models.contact.findOne({
            where: {
              agency_fk: agency_id,
              contact_id: contact_id,
              messenger_id: messenger_id,
            },
          }),
        ]);
        if (h.cmpBool(contact.dataValues.opt_out_messenger, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message: 'Contact has opted out to receive messenger messages.',
            },
            '2-messenger-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency WhatsApp config
          const messenger_channel = await models.agency_channel_config.findOne({
            where: {
              agency_fk: agency_id,
              channel_type: 'fbmessenger',
              channel_id: tracker?.dataValues?.sender,
            },
          });

          // Create token
          const access_token = messenger_channel?.dataValues?.uib_api_token;

          const returnPath = null;

          const result = await h.fbmessenger.sendMessage({
            sender_id: messenger_channel?.dataValues?.channel_id,
            receiver_id: messenger_id,
            message,
            returnPath,
            access_token,
            type: 'video',
            log: req.log,
          });

          if (!result.success) {
            req.log.error({
              result,
              err: {
                message: 'an error occured while sending messenger message.',
              },
              method: 'POST',
              url: '/v1/staff/messenger/video',
            });
            h.api.createResponse(
              req,
              res,
              500,
              {},
              '2-messenger-message-failed-1663834299369',
              {
                portal,
              },
            );
          } else {
            if (!h.isEmpty(result.original_event_id)) {
              const full_message_body = save_parts.reduce((pv, cv) => {
                return (pv += cv.data + '\n');
              }, '');

              const [appsync, messageTracker, contact] = await Promise.all([
                c.appSyncCredentials.findOne({
                  status: 'active',
                }),
                models.messenger_message_tracker.findOne(
                  {
                    where: {
                      tracker_type: 'main',
                      contact_fk: contact_id,
                    },
                  },
                  { order: [['created_date', 'DESC']] },
                ),
                models.contact.findOne({
                  where: {
                    contact_id: contact_id,
                  },
                }),
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

              const messenger_chat_id = h.general.generateId();
              await models.messenger_chat.create({
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                messenger_webhook_event_fk: result.original_event_id,
                msg_type: 'video_frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body: full_message_body,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                sent: 1,
                delivered: 1,
                read: 0,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                created_date: created_date,
              });

              await h.appsync.sendGraphQLNotification(api_key, {
                platform: 'fbmessenger',
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                original_event_id: result.original_event_id,
                msg_type: 'video_frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body: full_message_body,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                sent: 1,
                delivered: 1,
                read: 0,
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                created_date: `${formattedDate} ${formattedTime}`,
              });

              const unifiedInboxEntry = await c.unifiedInbox.findOne({
                agency_fk: agency_id,
                contact_fk: contact_id,
                msg_platform: 'fbmessenger',
                tracker_type: 'main',
              });

              await c.unifiedInbox.update(unifiedInboxEntry.unified_inbox_id, {
                tracker_ref_name,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                contact_fk: contact_id,
                event_id: result.original_event_id,
                msg_id: messenger_chat_id,
                msg_body: 'Video',
                msg_type: 'video_frompave',
                msg_platform: 'fbmessenger',
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                tracker_type: 'main',
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
              });
            }

            const newMsg = await models.messenger_chat.findOne({
              where: {
                messenger_webhook_event_fk: result.original_event_id,
              },
            });

            h.api.createResponse(
              req,
              res,
              200,
              { newMsg },
              '1-messenger-message-reply-1663834299369',
              { portal },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/messenger/video',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-messenger-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/messenger/file',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'messenger_id',
          'message',
          'to_save_parts',
          'contact_id',
        ],
        properties: {
          agency_id: { type: 'string' },
          contact_id: { type: 'string' },
          agent_id: { type: 'string' },
          messenger_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
          original_message: { type: 'string' },
          to_save_parts: { type: 'array' },
          message: { type: 'string' },
          file_name: { type: 'string' },
          content_type: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const {
        agency_id,
        contact_id,
        agent_id,
        messenger_id,
        tracker_ref_name,
        original_message,
        to_save_parts: save_parts,
        message,
        file_name,
        content_type,
        to_reply_msg,
      } = req.body;

      try {
        // Find WhatsApp message tracker
        const [tracker, contact] = await Promise.all([
          models.messenger_message_tracker.findOne({
            where: {
              agency_fk: agency_id,
              contact_fk: contact_id,
              receiver: messenger_id,
              tracker_type: 'main',
            },
            order: [['created_date', 'DESC']],
          }),
          models.contact.findOne({
            where: {
              agency_fk: agency_id,
              contact_id: contact_id,
              messenger_id: messenger_id,
            },
          }),
        ]);
        if (h.cmpBool(contact.dataValues.opt_out_messenger, true)) {
          h.api.createResponse(
            req,
            res,
            500,
            {
              message: 'Contact has opted out to receive messenger messages.',
            },
            '2-messenger-message-failed-1663834299369',
            {
              portal,
            },
          );
        } else {
          // Get agency WhatsApp config
          const messenger_channel = await models.agency_channel_config.findOne({
            where: {
              agency_fk: agency_id,
              channel_type: 'fbmessenger',
              channel_id: tracker?.dataValues?.sender,
            },
          });

          // Create token
          const access_token = messenger_channel?.dataValues?.uib_api_token;

          const returnPath = null;

          const result = await h.fbmessenger.sendMessage({
            sender_id: messenger_channel?.dataValues?.channel_id,
            receiver_id: messenger_id,
            message,
            returnPath,
            access_token,
            type: 'file',
            log: req.log,
          });

          if (!result.success) {
            req.log.error({
              result,
              err: {
                message: 'an error occured while sending messenger message.',
              },
              method: 'POST',
              url: '/v1/staff/messenger/file',
            });
            h.api.createResponse(
              req,
              res,
              500,
              {},
              '2-messenger-message-failed-1663834299369',
              {
                portal,
              },
            );
          } else {
            if (!h.isEmpty(result.original_event_id)) {
              const full_message_body = save_parts.reduce((pv, cv) => {
                return (pv += cv.data + '\n');
              }, '');

              const [appsync, messageTracker, contact] = await Promise.all([
                c.appSyncCredentials.findOne({
                  status: 'active',
                }),
                models.messenger_message_tracker.findOne(
                  {
                    where: {
                      tracker_type: 'main',
                      contact_fk: contact_id,
                    },
                  },
                  { order: [['created_date', 'DESC']] },
                ),
                models.contact.findOne({
                  where: {
                    contact_id: contact_id,
                  },
                }),
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

              const messenger_chat_id = h.general.generateId();
              await models.messenger_chat.create({
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                messenger_webhook_event_fk: result.original_event_id,
                msg_type: 'file_frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body:
                  full_message_body +
                  // `<a href=${parts[0].data} title="${parts[0].data}" download="${file_name}" class="file_link">${file_name}</a>`,
                  `<span className="inbox-item-big-msg">` +
                  `<div className="inbox-item-user d-flex flex-row justify-content-between">` +
                  `<div className="inbox-item-name">` +
                  `<a href="${message}" title="${file_name}" style="font-family: PoppinsSemiBold;">${message}</a>` +
                  `</div>` +
                  `</div>` +
                  `<sup className="inbox-item-sm-msg">${content_type}</sup>` +
                  `</span>`,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                sent: 1,
                delivered: 1,
                read: 0,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                created_date: created_date,
              });

              await h.appsync.sendGraphQLNotification(api_key, {
                platform: 'fbmessenger',
                messenger_chat_id: messenger_chat_id,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                agency_user_fk: agent_id,
                contact_fk: contact_id,
                original_event_id: result.original_event_id,
                msg_type: 'file_frompave',
                msg_timestamp: Math.floor(Date.now() / 1000),
                msg_body:
                  full_message_body +
                  // `<a href=${parts[0].data} title="${parts[0].data}" download="${file_name}" class="file_link">${file_name}</a>`,
                  `<span className="inbox-item-big-msg">` +
                  `<div className="inbox-item-user d-flex flex-row justify-content-between">` +
                  `<div className="inbox-item-name">` +
                  `<a href="${message}" title="${file_name}" style="font-family: PoppinsSemiBold;">${message}</a>` +
                  `</div>` +
                  `</div>` +
                  `<sup className="inbox-item-sm-msg">${content_type}</sup>` +
                  `</span>`,
                msg_origin: messageTracker?.dataValues?.msg_origin,
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
                reply_to_event_id: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.original_event_id
                  : null,
                reply_to_content: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_body
                  : null,
                reply_to_msg_type: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.msg_type
                  : null,
                reply_to_file_name: !h.isEmpty(to_reply_msg)
                  ? to_reply_msg?.file_name
                  : null,
                reply_to_contact_id: !h.isEmpty(to_reply_msg)
                  ? contact?.dataValues?.first_name
                  : null,
                sent: 1,
                delivered: 1,
                read: 0,
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                created_date: `${formattedDate} ${formattedTime}`,
              });

              const unifiedInboxEntry = await c.unifiedInbox.findOne({
                agency_fk: agency_id,
                contact_fk: contact_id,
                msg_platform: 'fbmessenger',
                tracker_type: 'main',
              });

              await c.unifiedInbox.update(unifiedInboxEntry.unified_inbox_id, {
                tracker_ref_name,
                campaign_name: messageTracker?.dataValues?.campaign_name,
                agency_fk: agency_id,
                contact_fk: contact_id,
                event_id: result.original_event_id,
                msg_id: messenger_chat_id,
                msg_body: 'Document',
                msg_type: 'file_frompave',
                msg_platform: 'fbmessenger',
                broadcast_date: new Date(),
                last_msg_date: new Date(),
                tracker_type: 'main',
                sender: messageTracker?.dataValues?.sender,
                sender_url: messageTracker?.dataValues?.sender_url,
                receiver: messageTracker?.dataValues?.receiver,
                receiver_url: messageTracker?.dataValues?.receiver_url,
              });
            }

            const newMsg = await models.messenger_chat.findOne({
              where: {
                messenger_webhook_event_fk: result.original_event_id,
              },
            });

            h.api.createResponse(
              req,
              res,
              200,
              { newMsg },
              '1-messenger-message-reply-1663834299369',
              { portal },
            );
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/messenger/file',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-messenger-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
