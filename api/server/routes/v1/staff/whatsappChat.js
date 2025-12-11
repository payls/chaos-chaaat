const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const models = require('../../../models');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const agencyMiddleware = require('../../../middlewares/agency');
const ContactService = require('../../../services/staff/contact');
const contactService = new ContactService();
const jsforce = require('jsforce');
const paveconfig = require('../../../configs/config')(process.env.NODE_ENV);
const BPromise = require('bluebird');
const moment = require('moment');
const cheerio = require('cheerio');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-chat',
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

      const log = req.log.child({
        processor: 'get-whatsapp-chat',
      });
      try {
        // getting current agency user
        const currentAgencyUser = await c.agencyUser.findOne(
          {
            user_fk: user_id,
          },
          {
            attributes: ['agency_fk', 'agency_user_id'],
          },
        );

        log.info({
          message: 'agency user id fetched',
          user_id,
        });

        // where clause for fetching whatsapp chat thread
        const whatsAppWhere = {
          contact_fk: contact_id,
          agency_fk: currentAgencyUser?.agency_fk,
        };

        // get the latest whatsapp chat and tracker record for the contact
        const [latestWhatsAppChat, messageTracker] = await Promise.all([
          c.whatsappChat.findOne(whatsAppWhere, {
            order: [['created_date', 'DESC']],
            attributes: [
              'whatsapp_chat_id',
              'msg_type',
              'msg_body',
              'sender_number',
              'receiver_number',
              'created_date',
            ],
          }),
          c.whatsappMessageTracker.findOne(
            {
              tracker_type: 'main',
              contact_fk: contact_id,
              agency_fk: currentAgencyUser?.agency_fk,
              ...(tracker_ref_name && { tracker_ref_name }),
            },
            {
              attributes: ['tracker_ref_name', 'campaign_name_label'],
              order: [['created_date', 'DESC']],
            },
          ),
        ]);

        log.info({
          message: 'latest-whatsapp-chat',
          latestWhatsAppChat,
        });

        // fail if no latest chat record for the contact in the agency
        if (!latestWhatsAppChat) {
          return h.api.createResponse(
            req,
            res,
            204,
            {
              whatsapp_chats: null,
              tracker_ref_name: null,
              campaign_name: null,
              is_business_campaign: null,
            },
            '1-whatsapp-messages-1663834299369',
            {
              portal,
            },
          );
        }

        // updating the unified inbox for the latest message
        await models.unified_inbox.update(
          {
            msg_id: latestWhatsAppChat?.whatsapp_chat_id,
            msg_type: latestWhatsAppChat?.msg_type,
            msg_body: latestWhatsAppChat?.msg_body,
            sender: latestWhatsAppChat?.sender_number,
            receiver: latestWhatsAppChat?.receiver_number,
            created_date: latestWhatsAppChat?.created_date,
            updated_date: latestWhatsAppChat?.created_date,
            last_msg_date: latestWhatsAppChat?.created_date,
          },
          {
            where: {
              msg_platform: 'whatsapp',
              contact_fk: contact_id,
              agency_fk: currentAgencyUser?.agency_fk,
            },
          },
        );

        // getting the read count
        const readCount = await models.agency_user_chat_read_status.count({
          where: {
            chat_id: latestWhatsAppChat?.whatsapp_chat_id,
            chat_type: 'whatsapp',
            agency_user_fk: currentAgencyUser?.agency_user_id,
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        });

        log.info({
          message: 'unified-update',
          readCount,
          messageTracker,
        });

        // if read count is 0, create a read status record for agency user
        if (readCount === 0) {
          const agency_user_chat_read_status_id = h.general.generateId();
          models.agency_user_chat_read_status.create({
            agency_user_chat_read_status_id: agency_user_chat_read_status_id,
            chat_id: latestWhatsAppChat?.whatsapp_chat_id,
            chat_type: 'whatsapp',
            agency_user_fk: currentAgencyUser?.agency_user_id,
          });

          log.info({
            message: 'read-status-created',
          });
        }

        const include = [];
        const order = [['msg_timestamp', 'DESC']];
        let whatsapp_chats = [];
        if (contact_id) {
          // get the chat thread if contact ID is found
          whatsapp_chats = await c.whatsappChat.findAll(whatsAppWhere, {
            order,
            include,
            // group: [
            //   'whatsapp_chat.whatsapp_chat_id',
            //   'whatsapp_chat.original_event_id',
            // ],
          });
        }

        const tracker_name = messageTracker?.dataValues?.tracker_ref_name;
        const is_latest_business_campaign =
          tracker_name && !tracker_name.includes('_user_message_');

        log.info({
          message: 'fetched-whatsapp-chat',
          whatsapp_chats,
        });

        return h.api.createResponse(
          req,
          res,
          200,
          {
            whatsapp_chats,
            tracker_ref_name: tracker_name,
            campaign_name: messageTracker?.dataValues?.campaign_name_label,
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
          url: '/v1/staff/whatsapp-chat',
        });
        return h.api.createResponse(
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
    method: 'GET',
    url: '/staff/whatsapp-chat/:agency_id/:message_id/:media_id/retrieve-image',
    schema: {
      params: {
        agency_id: { type: 'string' },
        message_id: { type: 'string' },
        media_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, message_id, media_id } = req.params;
      try {
        const agency = await c.agency.findOne({ agency_id: agency_id });
        const { agency_whatsapp_api_token, agency_whatsapp_api_secret } =
          agency;

        const chat = await c.whatsappChat.findOne({
          msg_id: message_id,
          msg_body: media_id,
        });

        const receiver_number = chat.dataValues.receiver_number;
        const agencyWhatsAppCredentials =
          agency_whatsapp_api_token + ':' + agency_whatsapp_api_secret;
        const agencyBufferedCredentials = Buffer.from(
          agencyWhatsAppCredentials,
          'utf8',
        ).toString('base64');

        const image_content = await h.whatsapp.retrieveImage({
          mobile_number: receiver_number,
          message_id,
          media_id,
          api_credentials: agencyBufferedCredentials,
          log: req.log,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { image_content },
          '1-contact-1620396460',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-chat',
        });
        h.api.createResponse(req, res, 500, {}, '2-contact-1620396470', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-chat/:agency_id/:tracker_ref_name/quick-replies',
    schema: {
      params: {
        agency_id: { type: 'string' },
        tracker_ref_name: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, tracker_ref_name } = req.params;
      try {
        const config = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });

        const whatsapp_config = config?.whatsapp_config;

        let quick_replies = [];

        if (h.general.isEmpty(whatsapp_config)) {
          quick_replies = [
            {
              type: 'default',
              name: "I'm interested",
              value: "i'm interested",
            },
            { type: 'default', name: 'Not looking', value: 'not looking' },
            { type: 'default', name: 'Opt me out', value: 'opt me out' },
            {
              type: 'default',
              name: 'Replied with Text',
              value: 'manual_reply',
            },
          ];
        } else {
          const config = JSON.parse(whatsapp_config);
          const cta = await models.campaign_cta.findOne({
            where: { campaign_tracker_ref_name: tracker_ref_name },
          });

          if (h.isEmpty(cta)) {
            quick_replies = config.quick_replies;
          } else {
            const campaign_cta = [cta.cta_1, cta.cta_2, cta.cta_3];
            for (const index in config.quick_replies) {
              if (
                h.cmpStr(config.quick_replies[index].value, 'manual_reply') ||
                (h.cmpStr(config.quick_replies[index].type, 'template') &&
                  campaign_cta.includes(config.quick_replies[index].name))
              ) {
                quick_replies.push(config.quick_replies[index]);
              }
            }
          }
        }

        h.api.createResponse(
          req,
          res,
          200,
          { quick_replies },
          '1-quick-reply-1620396460',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-chat',
        });
        h.api.createResponse(req, res, 500, {}, '2-quick-reply-1620396470', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-chat/:agency_id/:sender_number/waba-sender-credentials',
    schema: {
      params: {
        agency_id: { type: 'string' },
        sender_number: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, sender_number } = req.params;
      try {
        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: sender_number,
          },
        });

        h.api.createResponse(req, res, 200, { waba }, null, {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-chat/:agency_id/:sender_number/waba-credentials',
        });
        h.api.createResponse(req, res, 500, {}, null, {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-chat-media',
    schema: {},
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const transaction = await models.sequelize.transaction();
      try {
        const { user_id } = h.user.getCurrentUser(req);

        const currentAgencyUser = await c.agencyUser.findOne({
          user_fk: user_id,
        });

        const records = await models.whatsapp_chat.findAll({
          where: {
            agency_fk: currentAgencyUser?.agency_fk,
            msg_type: {
              [Op.in]: ['image', 'video', 'document'],
            },
            [Op.and]: Sequelize.literal('media_url IS NULL'),
          },
          order: [['created_date', 'DESC']],
        });

        for (const record of records) {
          const whatsapp_chat_id = record.whatsapp_chat_id;
          const agency_id = record?.agency_fk;
          const sender_number = record.sender_number;
          const receiver_number = record.receiver_number;
          const msg_body = record?.msg_body;
          const msg_type = record?.msg_type;
          const wabaOwner = await c.agencyWhatsAppConfig.findOne({
            waba_number: sender_number,
          });
          const whatsAppToken = await h.whatsapp.getWhatsAppToken(wabaOwner);
          const media = await h.whatsapp.getMediaURL(
            {
              msg_type: msg_type,
              receiver_number,
              msg_details: msg_body,
              token: whatsAppToken,
            },
            null,
          );
          if (h.cmpBool(media.success, true)) {
            await models.whatsapp_chat.update(
              {
                msg_body: media.file_url,
                media_url: media.file_url,
                media_msg_id: media.media_msg_id,
                content_type: media.content_type,
                file_name: media.file_name,
                caption: media.caption,
              },
              {
                where: {
                  whatsapp_chat_id: whatsapp_chat_id,
                  agency_fk: agency_id,
                },
                transaction,
              },
            );
          }
        }

        transaction.commit();

        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-whatsapp-messages-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        transaction.rollback();
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-chat-media',
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
    url: '/staff/whatsapp-chat',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'mobile_number', 'message_parts', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          original_message: { type: 'string' },
          message_parts: { type: 'array' },
          mobile_number: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await agencyMiddleware.canSendWhatsAppMessage('inbox', req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        original_message,
        message_parts: parts,
        mobile_number,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;

      try {
        const { user_id } = h.user.getCurrentUser(req);
        // Get required data before sending message
        const {
          agency,
          chat,
          contactTracker,
          contact,
          appsync,
          messageTracker,
          user,
        } = await getMessageSendingRequiredDetails(
          agency_id,
          mobile_number,
          tracker_ref_name,
          contact_id,
          user_id,
        );

        // check if with pre sending errors
        const { has_error, error_status_code, message, error_code } =
          await checkIfWithPreSendingError(
            contact,
            mobile_number,
            contactTracker,
          );
        if (h.cmpBool(has_error, true)) {
          req.log.warn({
            message,
            method: 'POST',
            url: '/v1/staff/whatsapp-chat',
          });
          return h.api.createResponse(
            req,
            res,
            error_status_code,
            {
              message,
            },
            error_code,
            {
              portal,
            },
          );
        }

        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: chat?.dataValues?.sender_number,
          },
        });

        // Create token
        const api_credentials = Buffer.from(
          `${waba?.dataValues?.agency_whatsapp_api_token}:${waba?.dataValues?.agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        const receivers = [
          {
            name: 'name',
            address: `${mobile_number}`,
            Connector: `${mobile_number}`,
            type: 'individual',
          },
        ];

        let returnPath = null;

        if (!h.isEmpty(to_reply_msg)) {
          returnPath = {
            id: to_reply_msg?.original_event_id,
          };
        }

        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });
        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;

        // inserting sender details
        const { first_name } = user;
        const agent_name = first_name;
        const updatedParts = parts;
        updatedParts[0].data =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
          agent_name +
          '</strong></div>\n' +
          parts[0].data;
        updatedParts[0].size = updatedParts[0].data.length;
        const partsToSend = h.whatsapp.unescapeData(updatedParts);
        const result = await h.whatsapp.sendMessage({
          environment,
          mobile_number,
          parts: partsToSend,
          receivers,
          returnPath,
          api_credentials,
          log: req.log,
        });

        if (!result.success) {
          req.log.error({
            err: {
              message: `an error occured while sending whatsapp message. ${result.error}`,
            },
            method: 'POST',
            url: '/v1/staff/whatsapp-chat',
          });
          h.api.createResponse(
            req,
            res,
            500,
            {},
            '2-whatsapp-message-failed-1663834299369',
            {
              portal,
            },
          );
        }

        let full_message_body = updatedParts.reduce((pv, cv) => {
          return (pv += cv.data + '\n');
        }, '');

        full_message_body =
          h.whatsapp.sanitizeMaliciousAttributes(full_message_body);

        const created_date = new Date();

        await saveMessageData({
          result,
          full_message_body,
          template_id: null,
          template_category: 'SERVICE',
          messageTracker,
          tracker_ref_name,
          agency_id,
          agent_id,
          contact,
          contact_id,
          msg_type: 'frompave',
          msg_text: null,
          chat,
          to_reply_msg,
          created_date,
        });

        await sendAppSyncNotification({
          appsync,
          created_date,
          agency_id,
          agent_id,
          contact_id,
          contact,
          messageTracker,
          result,
          full_message_body,
          chat,
          to_reply_msg,
          msg_text: null,
          msg_type: 'frompave',
        });

        if (!h.isEmpty(result.original_event_id)) {
          await c.messageInventory.addMessageCount(agency_id);
          await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
          await transmitSalesforceMessage({
            contact_id,
            contact,
            agency_id,
            user_id,
            full_message_body,
            msg_type: 'text_frompave',
            encryptionKeys,
          });
        }

        const newMsg = await c.whatsappChat.findOne({
          original_event_id: result.original_event_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/whatsapp-chat',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-chat/img',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'mobile_number', 'message_parts', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          original_message: { type: 'string' },
          message_parts: { type: 'array' },
          mobile_number: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await agencyMiddleware.canSendWhatsAppMessage('inbox', req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        original_message,
        message_parts: parts,
        mobile_number,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;

      try {
        const { user_id } = h.user.getCurrentUser(req);
        // Get required data before sending message
        const {
          agency,
          chat,
          contactTracker,
          contact,
          appsync,
          messageTracker,
          user,
        } = await getMessageSendingRequiredDetails(
          agency_id,
          mobile_number,
          tracker_ref_name,
          contact_id,
          user_id,
        );

        // check if with pre sending errors
        const { has_error, error_status_code, message, error_code } =
          await checkIfWithPreSendingError(
            contact,
            mobile_number,
            contactTracker,
          );
        if (h.cmpBool(has_error, true)) {
          req.log.warn({
            message,
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/img',
          });
          return h.api.createResponse(
            req,
            res,
            error_status_code,
            {
              message,
            },
            error_code,
            {
              portal,
            },
          );
        }

        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: chat?.dataValues?.sender_number,
          },
        });

        // Create token
        const api_credentials = Buffer.from(
          `${waba?.dataValues?.agency_whatsapp_api_token}:${waba?.dataValues?.agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        const receivers = [
          {
            name: 'name',
            address: `${mobile_number}`,
            Connector: `${mobile_number}`,
            type: 'individual',
          },
        ];

        let returnPath = null;

        if (!h.isEmpty(to_reply_msg)) {
          returnPath = {
            id: to_reply_msg?.original_event_id,
          };
        }

        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });
        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;

        // inserting sender details
        const { first_name } = user;
        const agent_name = first_name;
        const updatedParts = parts;
        updatedParts[1].data =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
          agent_name +
          '</strong></div>\n' +
          parts[1].data;
        updatedParts[1].size = updatedParts[1].data.length;
        const partsToSend = h.whatsapp.unescapeData(updatedParts);
        const result = await h.whatsapp.sendMessage({
          environment,
          mobile_number,
          parts: partsToSend,
          receivers,
          returnPath,
          api_credentials,
          log: req.log,
        });

        if (!result.success) {
          req.log.error({
            err: {
              message: `an error occured while sending whatsapp message. ${result.error}`,
            },
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/img',
          });
          h.api.createResponse(
            req,
            res,
            500,
            {},
            '2-whatsapp-message-failed-1663834299369',
            {
              portal,
            },
          );
        }

        let full_message_body = updatedParts.reduce((pv, cv) => {
          return (pv += cv.data + '\n');
        }, '');

        full_message_body =
          h.whatsapp.sanitizeMaliciousAttributes(full_message_body);

        const created_date = new Date();

        await saveMessageData({
          result,
          full_message_body,
          template_id: null,
          template_category: 'SERVICE',
          messageTracker,
          tracker_ref_name,
          agency_id,
          agent_id,
          contact,
          contact_id,
          msg_type: 'img_frompave',
          msg_text: 'Photo',
          chat,
          to_reply_msg,
          created_date,
        });

        await sendAppSyncNotification({
          appsync,
          created_date,
          agency_id,
          agent_id,
          contact_id,
          contact,
          messageTracker,
          result,
          full_message_body,
          chat,
          to_reply_msg,
          msg_text: 'Photo',
          msg_type: 'img_frompave',
        });

        if (!h.isEmpty(result.original_event_id)) {
          await c.messageInventory.addMessageCount(agency_id);
          await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
          await transmitSalesforceMessage({
            contact_id,
            contact,
            agency_id,
            user_id,
            full_message_body,
            msg_type: 'image_frompave',
            encryptionKeys,
          });
        }

        const newMsg = await c.whatsappChat.findOne({
          original_event_id: result.original_event_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/whatsapp-chat/img',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-chat/video',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'mobile_number', 'message_parts', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          original_message: { type: 'string' },
          message_parts: { type: 'array' },
          mobile_number: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await agencyMiddleware.canSendWhatsAppMessage('inbox', req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        original_message,
        message_parts: parts,
        mobile_number,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;

      try {
        const { user_id } = h.user.getCurrentUser(req);
        // Get required data before sending message
        const {
          agency,
          chat,
          contactTracker,
          contact,
          appsync,
          messageTracker,
          user,
        } = await getMessageSendingRequiredDetails(
          agency_id,
          mobile_number,
          tracker_ref_name,
          contact_id,
          user_id,
        );

        // check if with pre sending errors
        const { has_error, error_status_code, message, error_code } =
          await checkIfWithPreSendingError(
            contact,
            mobile_number,
            contactTracker,
          );
        if (h.cmpBool(has_error, true)) {
          req.log.warn({
            message,
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/video',
          });
          return h.api.createResponse(
            req,
            res,
            error_status_code,
            {
              message,
            },
            error_code,
            {
              portal,
            },
          );
        }

        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: chat?.dataValues?.sender_number,
          },
        });

        // Create token
        const api_credentials = Buffer.from(
          `${waba?.dataValues?.agency_whatsapp_api_token}:${waba?.dataValues?.agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        const receivers = [
          {
            name: 'name',
            address: `${mobile_number}`,
            Connector: `${mobile_number}`,
            type: 'individual',
          },
        ];

        let returnPath = null;

        if (!h.isEmpty(to_reply_msg)) {
          returnPath = {
            id: to_reply_msg?.original_event_id,
          };
        }

        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });
        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;

        // inserting sender details
        const { first_name } = user;
        const agent_name = first_name;
        const updatedParts = parts;
        updatedParts[1].data =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
          agent_name +
          '</strong></div>\n' +
          parts[1].data;
        updatedParts[1].size = updatedParts[1].data.length;
        const partsToSend = h.whatsapp.unescapeData(updatedParts);
        const result = await h.whatsapp.sendMessage({
          environment,
          mobile_number,
          parts: partsToSend,
          receivers,
          returnPath,
          api_credentials,
          log: req.log,
        });

        if (!result.success) {
          req.log.error({
            err: {
              message: `an error occured while sending whatsapp message. ${result.error}`,
            },
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/video',
          });
          h.api.createResponse(
            req,
            res,
            500,
            {},
            '2-whatsapp-message-failed-1663834299369',
            {
              portal,
            },
          );
        }

        let full_message_body = updatedParts.reduce((pv, cv) => {
          return (pv += cv.data + '\n');
        }, '');

        full_message_body =
          h.whatsapp.sanitizeMaliciousAttributes(full_message_body);

        const created_date = new Date();

        await saveMessageData({
          result,
          full_message_body,
          template_id: null,
          template_category: 'SERVICE',
          messageTracker,
          tracker_ref_name,
          agency_id,
          agent_id,
          contact,
          contact_id,
          msg_type: 'video_frompave',
          msg_text: 'Video',
          chat,
          to_reply_msg,
          created_date,
        });

        await sendAppSyncNotification({
          appsync,
          created_date,
          agency_id,
          agent_id,
          contact_id,
          contact,
          messageTracker,
          result,
          full_message_body,
          chat,
          to_reply_msg,
          msg_text: 'Video',
          msg_type: 'video_frompave',
        });

        if (!h.isEmpty(result.original_event_id)) {
          await c.messageInventory.addMessageCount(agency_id);
          await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
          await transmitSalesforceMessage({
            contact_id,
            contact,
            agency_id,
            user_id,
            full_message_body,
            msg_type: 'video_frompave',
            encryptionKeys,
          });
        }

        const newMsg = await c.whatsappChat.findOne({
          original_event_id: result.original_event_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/whatsapp-chat/video',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-chat/file',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'mobile_number', 'message_parts', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          original_message: { type: 'string' },
          message_parts: { type: 'array' },
          mobile_number: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
          file_name: { type: 'string' },
          content_type: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await agencyMiddleware.canSendWhatsAppMessage('inbox', req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        original_message,
        message_parts: parts,
        mobile_number,
        contact_id,
        tracker_ref_name,
        file_name,
        content_type,
        to_reply_msg,
      } = req.body;

      try {
        const { user_id } = h.user.getCurrentUser(req);
        // Get required data before sending message
        const {
          agency,
          chat,
          contactTracker,
          contact,
          appsync,
          messageTracker,
          user,
        } = await getMessageSendingRequiredDetails(
          agency_id,
          mobile_number,
          tracker_ref_name,
          contact_id,
          user_id,
        );

        // check if with pre sending errors
        const { has_error, error_status_code, message, error_code } =
          await checkIfWithPreSendingError(
            contact,
            mobile_number,
            contactTracker,
          );
        if (h.cmpBool(has_error, true)) {
          req.log.warn({
            message,
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/file',
          });
          return h.api.createResponse(
            req,
            res,
            error_status_code,
            {
              message,
            },
            error_code,
            {
              portal,
            },
          );
        }

        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: chat?.dataValues?.sender_number,
          },
        });

        // Create token
        const api_credentials = Buffer.from(
          `${waba?.dataValues?.agency_whatsapp_api_token}:${waba?.dataValues?.agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        const receivers = [
          {
            name: 'name',
            address: `${mobile_number}`,
            Connector: `${mobile_number}`,
            type: 'individual',
          },
        ];

        let returnPath = null;

        if (!h.isEmpty(to_reply_msg)) {
          returnPath = {
            id: to_reply_msg?.original_event_id,
          };
        }

        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });
        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;

        // inserting sender details
        const { first_name } = user;
        const agent_name = first_name;
        const updatedParts = parts;
        updatedParts[1].data =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
          agent_name +
          '</strong></div>\n' +
          parts[1].data;
        updatedParts[1].size = updatedParts[1].data.length;

        // check if with caption
        if (h.notEmpty(parts[2])) {
          updatedParts[2].data = `<div className="msg-caption">${parts[2].data}</div>`;
          updatedParts[2].size = updatedParts[2].data.length;
        }
        const partsToSend = h.whatsapp.unescapeData(updatedParts);
        if (h.notEmpty(parts[2])) {
          const $ = cheerio.load(partsToSend[2].data);
          const updatedContent = $('div[className="msg-caption"]')
            .html()
            .trim();
          partsToSend[2].data = updatedContent;
          partsToSend[2].size = partsToSend[2].data.length;
        }
        const result = await h.whatsapp.sendMessage({
          environment,
          mobile_number,
          parts: partsToSend,
          receivers,
          returnPath,
          api_credentials,
          log: req.log,
        });

        if (!result.success) {
          req.log.error({
            err: {
              message: `an error occured while sending whatsapp message. ${result.error}`,
            },
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/file',
          });
          h.api.createResponse(
            req,
            res,
            500,
            {},
            '2-whatsapp-message-failed-1663834299369',
            {
              portal,
            },
          );
        }

        let full_message_body = updatedParts.reduce((pv, cv) => {
          return (pv += cv.data + '\n');
        }, '');

        full_message_body =
          h.whatsapp.sanitizeMaliciousAttributes(full_message_body);

        const created_date = new Date();

        await saveMessageData({
          result,
          full_message_body:
            full_message_body +
            // `<a href=${parts[0].data} title="${parts[0].data}" download="${file_name}" class="file_link">${file_name}</a>`,
            `<span className="inbox-item-big-msg">` +
            `<div className="inbox-item-user d-flex flex-row justify-content-between">` +
            `<div className="inbox-item-name">` +
            `<a href="${updatedParts[0].data}" title="${updatedParts[0].data}" style="font-family: PoppinsSemiBold;">${file_name}</a>` +
            `</div>` +
            `</div>` +
            `<sup className="inbox-item-sm-msg">${content_type}</sup>` +
            `</span>`,
          template_id: null,
          template_category: 'SERVICE',
          messageTracker,
          tracker_ref_name,
          agency_id,
          agent_id,
          contact,
          contact_id,
          msg_type: 'file_frompave',
          msg_text: 'Document',
          chat,
          to_reply_msg,
          created_date,
        });

        await sendAppSyncNotification({
          appsync,
          created_date,
          agency_id,
          agent_id,
          contact_id,
          contact,
          messageTracker,
          result,
          full_message_body:
            full_message_body +
            // `<a href=${parts[0].data} title="${parts[0].data}" download="${file_name}" class="file_link">${file_name}</a>`,
            `<span className="inbox-item-big-msg">` +
            `<div className="inbox-item-user d-flex flex-row justify-content-between">` +
            `<div className="inbox-item-name">` +
            `<a href="${updatedParts[0].data}" title="${updatedParts[0].data}" style="font-family: PoppinsSemiBold;">${file_name}</a>` +
            `</div>` +
            `</div>` +
            `<sup className="inbox-item-sm-msg">${content_type}</sup>` +
            `</span>`,
          chat,
          to_reply_msg,
          msg_text: 'Document',
          msg_type: 'file_frompave',
        });

        if (!h.isEmpty(result.original_event_id)) {
          await c.messageInventory.addMessageCount(agency_id);
          await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
          await transmitSalesforceMessage({
            contact_id,
            contact,
            agency_id,
            user_id,
            full_message_body,
            msg_type: 'file_frompave',
            encryptionKeys,
          });
        }

        const newMsg = await c.whatsappChat.findOne({
          original_event_id: result.original_event_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/whatsapp-chat/file',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-chat/audio',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'mobile_number', 'message_parts', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          original_message: { type: 'string' },
          message_parts: { type: 'array' },
          mobile_number: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await agencyMiddleware.canSendWhatsAppMessage('inbox', req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        agent_id,
        original_message,
        message_parts: parts,
        mobile_number,
        contact_id,
        tracker_ref_name,
        to_reply_msg,
      } = req.body;

      try {
        const { user_id } = h.user.getCurrentUser(req);
        // Get required data before sending message
        const {
          agency,
          chat,
          contactTracker,
          contact,
          appsync,
          messageTracker,
          user,
        } = await getMessageSendingRequiredDetails(
          agency_id,
          mobile_number,
          tracker_ref_name,
          contact_id,
          user_id,
        );

        // check if with pre sending errors
        const { has_error, error_status_code, message, error_code } =
          await checkIfWithPreSendingError(
            contact,
            mobile_number,
            contactTracker,
          );
        if (h.cmpBool(has_error, true)) {
          req.log.warn({
            message,
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/audio',
          });
          return h.api.createResponse(
            req,
            res,
            error_status_code,
            {
              message,
            },
            error_code,
            {
              portal,
            },
          );
        }

        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: chat?.dataValues?.sender_number,
          },
        });

        // Create token
        const api_credentials = Buffer.from(
          `${waba?.dataValues?.agency_whatsapp_api_token}:${waba?.dataValues?.agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        const receivers = [
          {
            name: 'name',
            address: `${mobile_number}`,
            Connector: `${mobile_number}`,
            type: 'individual',
          },
        ];

        let returnPath = null;

        if (!h.isEmpty(to_reply_msg)) {
          returnPath = {
            id: to_reply_msg?.original_event_id,
          };
        }

        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });
        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;

        // inserting sender details
        const { first_name } = user;
        const agent_name = first_name;
        const updatedParts = parts;
        updatedParts[1].data =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
          agent_name +
          '</strong></div>\n' +
          parts[1].data;
        updatedParts[1].size = updatedParts[1].data.length;
        const partsToSend = h.whatsapp.unescapeData(updatedParts);
        const result = await h.whatsapp.sendMessage({
          environment,
          mobile_number,
          parts: partsToSend,
          receivers,
          returnPath,
          api_credentials,
          log: req.log,
        });

        if (!result.success) {
          req.log.error({
            err: {
              message: `an error occured while sending whatsapp message. ${result.error}`,
            },
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/audio',
          });
          h.api.createResponse(
            req,
            res,
            500,
            {},
            '2-whatsapp-message-failed-1663834299369',
            {
              portal,
            },
          );
        }

        let full_message_body = updatedParts.reduce((pv, cv) => {
          return (pv += cv.data + '\n');
        }, '');

        full_message_body =
          h.whatsapp.sanitizeMaliciousAttributes(full_message_body);

        const created_date = new Date();

        await saveMessageData({
          result,
          full_message_body,
          template_id: null,
          template_category: 'SERVICE',
          messageTracker,
          tracker_ref_name,
          agency_id,
          agent_id,
          contact,
          contact_id,
          msg_type: 'audio_frompave',
          msg_text: 'Audio',
          chat,
          to_reply_msg,
          created_date,
        });

        await sendAppSyncNotification({
          appsync,
          created_date,
          agency_id,
          agent_id,
          contact_id,
          contact,
          messageTracker,
          result,
          full_message_body,
          chat,
          to_reply_msg,
          msg_text: 'Audio',
          msg_type: 'audio_frompave',
        });

        if (!h.isEmpty(result.original_event_id)) {
          await c.messageInventory.addMessageCount(agency_id);
          await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
          await transmitSalesforceMessage({
            contact_id,
            contact,
            agency_id,
            user_id,
            full_message_body,
            msg_type: 'audio_frompave',
            encryptionKeys,
          });
        }

        const newMsg = await c.whatsappChat.findOne({
          original_event_id: result.original_event_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/whatsapp-chat/audio',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-chat/template',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'mobile_number', 'message_parts', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          message_parts: { type: 'array' },
          mobile_number: { type: 'string' },
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
          quick_reply_responses: { type: 'array' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await agencyMiddleware.canSendWhatsAppMessage('inbox', req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        agency_id,
        message_parts: template,
        mobile_number,
        contact_id,
        tracker_ref_name,
        quick_reply_responses,
        to_reply_msg,
      } = req.body;
      try {
        const { user_id } = h.user.getCurrentUser(req);
        // Get required data before sending message
        const {
          agency,
          chat,
          contactTracker,
          contact,
          appsync,
          messageTracker,
          user,
        } = await getMessageSendingRequiredDetails(
          agency_id,
          mobile_number,
          tracker_ref_name,
          contact_id,
          user_id,
        );

        // check if with pre sending errors
        const { has_error, error_status_code, message, error_code } =
          await checkIfWithPreSendingError(
            contact,
            mobile_number,
            contactTracker,
          );
        if (h.cmpBool(has_error, true)) {
          req.log.warn({
            message,
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/template',
          });
          return h.api.createResponse(
            req,
            res,
            error_status_code,
            {
              message,
            },
            error_code,
            {
              portal,
            },
          );
        }

        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: chat?.dataValues?.sender_number,
          },
        });

        // Create token
        const api_credentials = Buffer.from(
          `${waba?.dataValues?.agency_whatsapp_api_token}:${waba?.dataValues?.agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        const receivers = [
          {
            name: 'name',
            address: `${mobile_number}`,
            Connector: `${mobile_number}`,
            type: 'individual',
          },
        ];

        let returnPath = null;

        if (!h.isEmpty(to_reply_msg)) {
          returnPath = {
            id: to_reply_msg?.original_event_id,
          };
        }

        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });

        const currentAgencyUser = await models.agency_user.findOne({
          where: {
            user_fk: user_id,
          },
          include: [{ model: models.user, required: true }],
        });

        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;
        const buyerFirstName = contact.first_name;
        let permalink = contact.permalink;
        if (h.isEmpty(contact.permalink)) {
          permalink = await contactService.checkIfPermalinkIsUnique(
            h.general.generateRandomAlpanumeric(5),
          );
        }

        const sendPermalink = h.route.createPermalink(
          agency?.agency_subdomain,
          config.webUrl,
          agency?.agency_name,
          contact,
          permalink,
        );

        const { sendMessagePartsData, msg_body } =
          await h.whatsapp.getTemplateMsgBody(
            agency?.agency_id,
            agency?.agency_name,
            h.general.prettifyConstant(currentAgencyUser.user.first_name),
            buyerFirstName,
            mobile_number,
            contact.email,
            sendPermalink,
            template,
          );

        const result = await h.whatsapp.sendWhatsAppTemplateMessage(
          mobile_number,
          0,
          null,
          sendMessagePartsData,
          api_credentials,
          environment,
          null,
        );

        const full_message_body = msg_body;

        const created_date = new Date();

        await saveMessageData({
          result,
          full_message_body,
          template_id: template[0].waba_template_id,
          template_category: template[0].category,
          messageTracker,
          tracker_ref_name,
          agency_id,
          agent_id: currentAgencyUser?.agency_user_id,
          contact,
          contact_id,
          msg_type: 'frompave',
          msg_text: null,
          chat,
          to_reply_msg,
          created_date,
        });

        await sendAppSyncNotification({
          appsync,
          created_date,
          agency_id,
          agent_id: currentAgencyUser?.agency_user_id,
          contact_id,
          contact,
          messageTracker,
          result,
          full_message_body,
          chat,
          to_reply_msg,
          msg_text: null,
          msg_type: 'frompave',
        });

        if (!h.isEmpty(result.original_event_id)) {
          await c.messageInventory.addMessageCount(agency_id);
          await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
          await transmitSalesforceMessage({
            contact_id,
            contact,
            agency_id,
            user_id,
            full_message_body,
            msg_type: 'template',
            encryptionKeys,
          });
        }

        if (h.isEmpty(result.original_event_id)) {
          await models.contact.update(
            {
              status: 'inactive',
            },
            {
              where: {
                [Op.or]: [
                  { contact_id },
                  { agency_fk: agency_id, mobile_number },
                ],
              },
            },
          );
          req.log.error({
            err: {
              message: 'an error occured while sending whatsapp message.',
            },
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/template',
          });
          return h.api.createResponse(
            req,
            res,
            500,
            { position: 3, result },
            '2-whatsapp-message-failed-1663834299369',
            {
              portal,
            },
          );
        }

        const newMsg = await c.whatsappChat.findOne({
          original_event_id: result.original_event_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/whatsapp-chat/template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-chat/init-template',
    schema: {
      body: {
        type: 'object',
        required: ['message_parts', 'contact_id'],
        properties: {
          contact_id: { type: 'string' },
          message_parts: { type: 'array' },
          quick_reply_responses: { type: 'array' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await agencyMiddleware.canSendWhatsAppMessage('inbox', req, res);
    },
    handler: async (req, res) => {
      const { ek: encryptionKeys } = req.ek;
      const {
        contact_id,
        message_parts: template,
        quick_reply_responses,
      } = req.body;
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const { contact, currentAgencyUser, contactTracker, appsync } =
          await getInitMessageSendingRequiredDetails({
            contact_id,
            user_id,
          });
        const { agency_fk: agency_id, mobile_number } = contact;
        const agency = await c.agency.findOne({ agency_id: agency_id });
        // check if with pre sending errors
        const { has_error, error_status_code, message, error_code } =
          await checkIfWithPreSendingError(
            contact,
            mobile_number,
            contactTracker,
            true,
          );
        if (h.cmpBool(has_error, true)) {
          req.log.warn({
            message,
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/init-template',
          });
          return h.api.createResponse(
            req,
            res,
            error_status_code,
            {
              message,
            },
            error_code,
            {
              portal,
            },
          );
        }

        // Find WhatsApp message tracker
        const tracker_ref_name = `${agency_id}_${Date.now()}_user_message_${agency?.agency_name
          .replaceAll(' ', '_')
          .toLowerCase()}`;
        const campaign_name = `${agency_id}_${Date.now()}_user_message_${agency?.agency_name
          .replaceAll(' ', '_')
          .toLowerCase()}`;

        // Get agency WhatsApp config
        const waba = await models.agency_whatsapp_config.findOne({
          where: {
            agency_fk: agency_id,
            waba_number: template[0].value.waba_number,
          },
        });

        // Create token
        const api_credentials = Buffer.from(
          `${waba?.dataValues?.agency_whatsapp_api_token}:${waba?.dataValues?.agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });
        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;
        const buyerFirstName = contact.first_name;
        let permalink = contact.permalink;
        if (h.isEmpty(contact.permalink)) {
          permalink = await contactService.checkIfPermalinkIsUnique(
            h.general.generateRandomAlpanumeric(5),
          );
        }

        const sendPermalink = h.route.createPermalink(
          agency?.agency_subdomain,
          config.webUrl,
          agency?.agency_name,
          contact,
          permalink,
        );

        const { sendMessagePartsData, msg_body } =
          await h.whatsapp.getInitialTemplateMsgBody(
            agency?.agency_id,
            agency?.agency_name,
            h.general.prettifyConstant(currentAgencyUser.user.first_name),
            buyerFirstName,
            mobile_number,
            contact.email,
            sendPermalink,
            template,
          );

        const sendWhatsAppTemplateMessageResponse =
          await h.whatsapp.sendWhatsAppTemplateMessage(
            mobile_number,
            0,
            null,
            sendMessagePartsData,
            api_credentials,
            environment,
            null,
          );

        const created_date = new Date();
        await saveInitTemplateMessage({
          agency_id,
          contact_id,
          mobile_number,
          campaign_name,
          tracker_ref_name,
          currentAgencyUser,
          sendWhatsAppTemplateMessageResponse,
          template_id: template[0].value.waba_template_id,
          template_category: template[0].value.category,
          user_id,
          template,
          msg_body,
          created_date,
        });

        const chat = await models.whatsapp_chat.findOne({
          where: {
            agency_fk: agency_id,
            receiver_number: mobile_number,
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        });
        const messageTracker = c.whatsappMessageTracker.findOne(
          {
            tracker_ref_name,
            tracker_type: 'main',
            contact_fk: contact_id,
          },
          { order: [['created_date', 'DESC']] },
        );

        await sendAppSyncNotification({
          appsync,
          created_date,
          agency_id,
          agent_id: currentAgencyUser?.agency_user_id,
          contact_id,
          contact,
          messageTracker,
          result: sendWhatsAppTemplateMessageResponse,
          full_message_body: msg_body,
          chat,
          to_reply_msg: null,
          msg_text: null,
          msg_type: 'frompave',
        });

        if (!h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)) {
          await c.messageInventory.addMessageCount(agency_id);
          await c.agencyNotification.checkMessageCapacityAfterUpdate(agency_id);
          await transmitSalesforceMessage({
            contact_id,
            contact,
            agency_id,
            user_id,
            full_message_body: msg_body,
            msg_type: 'template',
            encryptionKeys,
          });
        }

        if (h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)) {
          await models.contact.update(
            {
              status: 'inactive',
            },
            {
              where: {
                [Op.or]: [
                  { contact_id },
                  { agency_fk: agency_id, mobile_number },
                ],
              },
            },
          );
          req.log.error({
            err: {
              message: 'an error occured while sending whatsapp message.',
            },
            method: 'POST',
            url: '/v1/staff/whatsapp-chat/init-template',
          });
          return h.api.createResponse(
            req,
            res,
            500,
            { position: 3, sendWhatsAppTemplateMessageResponse },
            '2-whatsapp-message-failed-1663834299369',
            {
              portal,
            },
          );
        }

        const newMsg = await c.whatsappChat.findOne({
          original_event_id:
            sendWhatsAppTemplateMessageResponse.original_event_id,
        });

        return h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/whatsapp-chat/init-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-chat/:agency_id/message-stat',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id } = req.params;
      const { user_id } = h.user.getCurrentUser(req);
      const startOfMonth = moment()
        .startOf('month')
        .format('YYYY-MM-DD HH:mm:ss');
      const endOfMonth = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');

      try {
        const [userRoleRecord, currentAgencyUser] = await Promise.all([
          c.userRole.findOne({
            user_fk: user_id,
          }),
          c.agencyUser.findOne({
            user_fk: user_id,
          }),
        ]);

        const isAgencySalesUser =
          userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES;

        const where = {
          agency_fk: agency_id,
          msg_origin: 'campaign',
          created_date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        };

        const contactWhere = {
          agency_fk: agency_id,
        };
        if (isAgencySalesUser) {
          contactWhere.agency_user_fk = currentAgencyUser.agency_user_id;
        }

        const include = [
          { model: models.agency_user, include: models.user },
          {
            model: models.contact,
            where: contactWhere,
          },
        ];
        const sent_count = await c.whatsappMessageTracker.count(
          {
            ...where,
          },
          {
            include,
          },
        );
        const delivered_count = await c.whatsappMessageTracker.count(
          {
            ...where,
            sent: 1,
            failed: 0,
            delivered: 1,
          },
          {
            include,
          },
        );
        const failed_count = await c.whatsappMessageTracker.count(
          {
            ...where,
            failed: 1,
          },
          {
            include,
          },
        );

        const read_count = await c.whatsappMessageTracker.count(
          {
            ...where,
            read: 1,
          },
          {
            include,
          },
        );

        const channel_count = await c.agencyWhatsAppConfig.count({
          agency_fk: agency_id,
          trial_number_to_use: false,
          is_active: true,
        });

        h.api.createResponse(
          req,
          res,
          200,
          {
            data: {
              sent_count,
              delivered_count,
              failed_count,
              read_count,
              channel_count,
            },
          },
          '1-contact-1620396460',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/whatsapp-chat',
        });
        h.api.createResponse(req, res, 500, {}, '2-contact-1620396470', {
          portal,
        });
      }
    },
  });

  next();
};

/**
 * Endpoint related functions
 */

/**
 * Description
 * Function to get all needed data before sending a message
 * @async
 * @function
 * @name getContactMessageDetails
 * @kind function
 * @param {string} agency_id
 * @param {string} mobile_number
 * @param {string} tracker_ref_name
 * @param {string} contact_id
 * @param {string} user_id
 * @returns {Promise} returns all needed data for initiating message sending
 */
async function getMessageSendingRequiredDetails(
  agency_id,
  mobile_number,
  tracker_ref_name,
  contact_id,
  user_id,
) {
  const [agency, chat, contactTracker, contact, appsync, messageTracker, user] =
    await Promise.all([
      c.agency.findOne({ agency_id }),
      models.whatsapp_chat.findOne({
        where: {
          agency_fk: agency_id,
          receiver_number: mobile_number,
        },
        order: [['created_date', 'DESC']],
        limit: 1,
      }),
      models.whatsapp_message_tracker.findOne({
        where: {
          agency_fk: agency_id,
          tracker_ref_name: tracker_ref_name,
          contact_fk: contact_id,
          tracker_type: 'main',
        },
        order: [['created_date', 'DESC']],
        limit: 1,
      }),
      models.contact.findOne({
        where: {
          agency_fk: agency_id,
          contact_id: contact_id,
        },
      }),
      c.appSyncCredentials.findOne({
        status: 'active',
      }),
      c.whatsappMessageTracker.findOne(
        {
          tracker_ref_name,
          tracker_type: 'main',
          contact_fk: contact_id,
        },
        { order: [['created_date', 'DESC']] },
      ),
      models.user.findOne({
        where: {
          user_id: user_id,
        },
      }),
    ]);

  return {
    agency,
    chat,
    contactTracker,
    contact,
    appsync,
    messageTracker,
    user,
  };
}

/**
 * Description
 * Check if contact data is not allowed to send message
 * @function
 * @name checkIfWithPreSendingError
 * @kind function
 * @param {object} contact
 * @param {string} mobile_number
 * @param {object} contactTracker contact latest message tracker data
 * @param {boolean} initial check if initial template message
 * @returns {{ has_error: boolean;
 * error_status_code: number | null;
 * message: string | null;
 * error_code: string | null; }}
 */
function checkIfWithPreSendingError(
  contact,
  mobile_number,
  contactTracker,
  initial = false,
) {
  let message = null;
  let has_error = false;
  let error_status_code = null;
  let error_code = null;
  // cannot send to inactive contact
  if (h.cmpStr(contact.status, 'inactive')) {
    message = 'Sending message to an inactive contact is not allowed.';
    has_error = true;
    error_status_code = 400;
    error_code = '2-whatsapp-message-failed-inactive-contact-1663834299369';
  }

  // has different contact number
  if (
    h.cmpBool(initial, false) &&
    h.cmpBool(has_error, false) &&
    !h.cmpStr(mobile_number, contactTracker?.dataValues?.receiver_number)
  ) {
    message = h.getMessageByCode(
      '2-whatsapp-message-failed-different-mobile-number-1663834299369',
      {
        CONTACT_NUMBER: mobile_number,
        THREAD_NUMBER: contactTracker?.dataValues?.receiver_number,
      },
    );
    has_error = true;
    error_status_code = 500;
    error_code =
      '2-whatsapp-message-failed-different-mobile-number-1663834299369';
  }

  // contact opted out
  if (
    h.cmpBool(has_error, false) &&
    h.cmpBool(contact.dataValues.opt_out_whatsapp, true)
  ) {
    message = 'Contact has opted out to receive WhatsApp messages.';
    has_error = true;
    error_status_code = 500;
    error_code = '2-whatsapp-message-failed-1663834299369';
  }

  return { has_error, error_status_code, message, error_code };
}

/**
 * Description
 * Function to save outgoing inbox message
 * @name saveMessageData
 * @kind function
 * @param {any} messageData
 * @returns {Promise<void>}
 */
async function saveMessageData(messageData) {
  const {
    result,
    full_message_body,
    template_id,
    template_category,
    messageTracker,
    tracker_ref_name,
    agency_id,
    agent_id,
    contact_id,
    contact,
    msg_type,
    chat,
    to_reply_msg,
    created_date,
    msg_text,
  } = messageData;
  const unifiedInboxEntry = await c.unifiedInbox.findOne({
    agency_fk: agency_id,
    contact_fk: contact_id,
    receiver: messageTracker?.dataValues?.receiver_number,
    msg_platform: 'whatsapp',
    tracker_type: 'main',
  });

  const failed_reason = h.notEmpty(result.error)
    ? JSON.stringify([{ code: 100000, title: result.error }])
    : null;

  const whatsapp_chat_tx = await models.sequelize.transaction();
  try {
    const whatsapp_chat_id = await c.whatsappChat.create(
      {
        campaign_name: messageTracker?.dataValues?.campaign_name,
        agency_fk: agency_id,
        agency_user_fk: agent_id,
        contact_fk: contact_id,
        original_event_id: result.original_event_id,
        sent: h.notEmpty(result.original_event_id),
        failed: h.isEmpty(result.original_event_id),
        failed_reason,
        msg_type: msg_type,
        msg_template_id: template_id,
        msg_category: template_category,
        msg_body: full_message_body,
        sender_number: chat?.dataValues?.sender_number,
        receiver_number: messageTracker?.dataValues?.receiver_number,
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
      },
      { transaction: whatsapp_chat_tx },
    );

    await c.unifiedInbox.update(
      unifiedInboxEntry.unified_inbox_id,
      {
        tracker_ref_name,
        campaign_name: messageTracker?.dataValues?.campaign_name,
        agency_fk: agency_id,
        contact_fk: contact_id,
        event_id: result.original_event_id,
        msg_id: whatsapp_chat_id,
        msg_body: msg_text || full_message_body,
        msg_type: msg_type,
        msg_platform: 'whatsapp',
        broadcast_date: new Date(),
        last_msg_date: new Date(),
        tracker_type: 'main',
      },
      null,
      { transaction: whatsapp_chat_tx },
    );
    await whatsapp_chat_tx.commit();
  } catch (err) {
    await whatsapp_chat_tx.rollback();
    Sentry.captureException(err);
    throw new Error('WHATSAPP MESSAGE SENDING FAILED');
  }
}

/**
 * Description
 * Function to trigger appsync create notification
 * @async
 * @function
 * @name sendAppSyncNotification
 * @kind function
 * @param {object} appsyncData data to trigger appsync
 * @returns {Promise<boolean>}
 */
async function sendAppSyncNotification(appsyncData) {
  const {
    appsync,
    created_date,
    agency_id,
    agent_id,
    contact_id,
    contact,
    messageTracker,
    result,
    full_message_body,
    chat,
    to_reply_msg,
    msg_text,
    msg_type,
  } = appsyncData;
  const { api_key } = appsync;
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
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  await h.appsync.sendGraphQLNotification(api_key, {
    platform: 'whatsapp',
    campaign_name: messageTracker?.dataValues?.campaign_name,
    agency_fk: agency_id,
    agency_user_fk: agent_id,
    contact_fk: contact_id,
    original_event_id: result.original_event_id,
    msg_type,
    msg_body: full_message_body,
    sender_number: chat?.dataValues?.sender_number,
    receiver_number: messageTracker?.dataValues?.receiver_number,
    reply_to_event_id: !h.isEmpty(to_reply_msg)
      ? to_reply_msg?.original_event_id
      : null,
    reply_to_content: !h.isEmpty(to_reply_msg) ? to_reply_msg?.msg_body : null,
    reply_to_msg_type: !h.isEmpty(to_reply_msg) ? to_reply_msg?.msg_type : null,
    reply_to_file_name: !h.isEmpty(to_reply_msg)
      ? to_reply_msg?.file_name
      : null,
    reply_to_contact_id: !h.isEmpty(to_reply_msg)
      ? contact?.dataValues?.first_name
      : null,
    sent: h.notEmpty(result.original_event_id),
    failed: h.isEmpty(result.original_event_id),
    delivered: 0,
    read: 0,
    broadcast_date: new Date(),
    last_msg_date: new Date(),
    created_date_raw: created_date,
    created_date: `${formattedDate} ${formattedTime}`,
  });

  return true;
}

/**
 * Description
 * Function to transmit salesforce message in salesforce if contact is an SF
 * contact
 * @async
 * @function
 * @name transmitSalesforceMessage
 * @kind function
 * @param {object} transmitData data to use for message transmission to SF
 */
async function transmitSalesforceMessage(transmitData) {
  const {
    contact_id,
    contact,
    agency_id,
    user_id,
    full_message_body,
    msg_type,
    encryptionKeys,
  } = transmitData;
  const contact_source = await models.contact_source.findOne({
    where: {
      contact_fk: contact_id,
      source_type: 'SALESFORCE',
    },
  });

  if (!h.isEmpty(contact_source)) {
    const liveChatSettings = await models.live_chat_settings.findOne({
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
    const currentAgencyUser = await models.agency_user.findOne({
      where: {
        user_fk: user_id,
      },
      include: [
        { model: models.user, required: true },
        { model: models.agency, required: true },
      ],
    });
    const contactSalesforceData = await c.contactSalesforceData.findOne(
      {
        agency_fk: agency_id,
        contact_fk: contact_id,
      },
      {
        order: [['created_date', 'DESC']],
      },
    );
    try {
      await h.salesforce.transmitMessage({
        liveChatSettings,
        contactSalesforceData,
        agencyOauth,
        contact,
        contact_source,
        currentAgencyUser,
        full_message_body,
        messageType: msg_type,
        platform: 'whatsapp',
        encryptionKeys,
      });
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
    }
  }
}

/**
 * Description
 * Function to get inital data needed for preparation in initial template sending
 * @async
 * @function
 * @name getInitMessageSendingRequiredDetails
 * @kind function
 * @param {any} prepData
 * @returns {Promise<{ contact: any; contactTracker: any; currentAgencyUser: any; }>}
 */
async function getInitMessageSendingRequiredDetails(prepData) {
  const { contact_id, user_id } = prepData;
  const contact = await await c.contact.findOne({ contact_id });

  const currentAgencyUser = await models.agency_user.findOne({
    where: {
      user_fk: user_id,
    },
    include: [{ model: models.user, required: true }],
  });

  const contactTracker = await models.whatsapp_message_tracker.findOne({
    where: {
      contact_fk: contact_id,
      tracker_type: 'main',
    },
    order: [['created_date', 'DESC']],
    limit: 1,
  });

  const appsync = await c.appSyncCredentials.findOne({
    status: 'active',
  });

  return { contact, contactTracker, currentAgencyUser, appsync };
}

/**
 * Description
 * Function to save outgoing initial inbox template message
 * @name saveInitTemplateMessage
 * @kind function
 * @param {any} messageData
 * @returns {Promise<void>}
 */
async function saveInitTemplateMessage(messageData) {
  const {
    agency_id,
    contact_id,
    mobile_number,
    campaign_name,
    tracker_ref_name,
    currentAgencyUser,
    sendWhatsAppTemplateMessageResponse,
    template_id,
    template_category,
    user_id,
    template,
    msg_body,
    created_date,
  } = messageData;
  const failed_reason = h.notEmpty(sendWhatsAppTemplateMessageResponse.error)
    ? JSON.stringify([
        { code: 100000, title: sendWhatsAppTemplateMessageResponse.error },
      ])
    : null;
  const unifiedInboxEntry = await c.unifiedInbox.findOne({
    agency_fk: agency_id,
    contact_fk: contact_id,
    receiver: mobile_number,
    msg_platform: 'whatsapp',
    tracker_type: 'main',
  });

  const template_msg_tx = await models.sequelize.transaction();
  try {
    const tracker_id = await c.whatsappMessageTracker.create(
      {
        campaign_name: campaign_name,
        campaign_name_label: campaign_name,
        tracker_ref_name,
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_user_fk: currentAgencyUser?.agency_user_id,
        original_event_id: !h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        msg_body: msg_body,
        pending: 0,
        sent: !h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
        failed_reason,
        sender_number: template[0].value.waba_number,
        receiver_number: mobile_number,
        batch_count: 1,
        created_by: user_id,
        broadcast_date: new Date(),
        template_count: 1,
        tracker_type: 'main',
        visible: 0,
      },
      { transaction: template_msg_tx },
    );

    const whatsapp_chat_id = await c.whatsappChat.create(
      {
        campaign_name,
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_user_fk: currentAgencyUser?.agency_user_id,
        original_event_id: !h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        )
          ? sendWhatsAppTemplateMessageResponse.original_event_id
          : null,
        msg_id: null,
        msg_body: msg_body,
        msg_type: 'frompave',
        msg_template_id: template_id,
        msg_category: template_category,
        msg_timestamp: Math.floor(Date.now() / 1000),
        sender_number: template[0].value.waba_number,
        receiver_number: mobile_number,
        sent: !h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
        failed: h.isEmpty(
          sendWhatsAppTemplateMessageResponse.original_event_id,
        ),
        failed_reason,
        created_date: created_date,
      },
      { transaction: template_msg_tx },
    );

    if (h.isEmpty(unifiedInboxEntry)) {
      await c.unifiedInbox.create(
        {
          tracker_id: tracker_id,
          campaign_name: campaign_name,
          tracker_ref_name,
          agency_fk: agency_id,
          contact_fk: contact_id,
          agency_user_fk: currentAgencyUser?.agency_user_id,
          event_id: null,
          msg_body: msg_body,
          msg_type: 'frompave',
          msg_platform: 'whatsapp',
          pending: 0,
          sent: 1,
          batch_count: 1,
          created_by: user_id,
          broadcast_date: new Date(),
          last_msg_date: new Date(),
          template_count: 1,
          tracker_type: 'main',
          sender: template[0].value.waba_number,
          receiver: mobile_number,
        },
        { transaction: template_msg_tx },
      );
    } else {
      await c.unifiedInbox.update(
        unifiedInboxEntry.unified_inbox_id,
        {
          tracker_ref_name,
          campaign_name,
          agency_fk: agency_id,
          contact_fk: contact_id,
          event_id: sendWhatsAppTemplateMessageResponse.original_event_id,
          msg_id: whatsapp_chat_id,
          msg_body: msg_body,
          msg_type: 'frompave',
          msg_platform: 'whatsapp',
          broadcast_date: new Date(),
          last_msg_date: new Date(),
          tracker_type: 'main',
        },
        null,
        { transaction: template_msg_tx },
      );
    }
    await template_msg_tx.commit();
  } catch (err) {
    await template_msg_tx.rollback();
    Sentry.captureException(err);
    throw new Error('WHATSAPP MESSAGE SENDING FAILED');
  }
}
