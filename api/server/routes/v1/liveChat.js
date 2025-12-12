const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const portal = constant.PORTAL.LIVE_CHAT;
const h = require('../../helpers');
const c = require('../../controllers');
const models = require('../../models');
const { Op } = require('sequelize');
const { request } = require('../../helpers');
const config = require('../../configs/config')(process.env.NODE_ENV);

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/live-chat/start-session',
    schema: {
      body: {
        type: 'object',
        required: ['first_name', 'email_address', 'agency_id'],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email_address: { type: 'string' },
          phone: { type: 'string' },
          product: { type: 'string' },
          city: { type: 'string' },
          language: { type: 'string' },
          marketing: { type: 'boolean' },
          agency_id: { type: 'string' },
        },
      },
    },
    handler: async (request, response) => {
      const transaction = await models.sequelize.transaction();
      const {
        first_name,
        last_name,
        email_address,
        phone,
        product,
        city,
        language,
        marketing,
        agency_id,
      } = request.body;
      try {
        request.log.info({
          url: '/v1/live-chat/start-session',
          payload: request.body,
        });

        const { ek: encryptionKeys } = request.ek;

        console.log({
          first_name,
          last_name,
          email_address,
          phone,
          product,
          city,
          language,
          marketing,
          agency_id,
        });

        const { live_chat_session_id, contact } =
          await c.liveChat.start_session(
            first_name,
            last_name,
            email_address,
            phone,
            product,
            city,
            marketing,
            language,
            agency_id,
            encryptionKeys,
            { transaction },
          );

        console.log('here it is', live_chat_session_id, contact);
        await transaction.commit();
        h.api.createResponse(
          request,
          response,
          200,
          { live_chat_session_id, contact },
          '1-live-chat-session-start-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        await transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          { err },
          '2-live-chat-session-start-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/live-chat/:session_id/end-session',
    schema: {
      params: {
        type: 'object',
        required: ['session_id'],
        properties: {
          session_id: { type: 'string' },
        },
      },
    },
    handler: async (request, response) => {
      const transaction = await models.sequelize.transaction();
      const { session_id } = request.params;
      try {
        request.log.info({
          url: '/v1/live-chat/:session_id/end-session',
          payload: request.params,
        });

        const liveSession = await models.live_chat_session.findOne({
          where: {
            live_chat_session_id: session_id,
            status: 'active',
          },
        });

        if (!h.isEmpty(liveSession)) {
          await c.liveChat.end_session(session_id, { transaction });
        } else {
          await transaction.rollback();
          h.api.createResponse(
            request,
            response,
            500,
            {},
            '3-live-chat-session-1663834299369',
            {
              portal,
            },
          );
        }

        await transaction.commit();
        h.api.createResponse(
          request,
          response,
          200,
          { live_chat_session_id: session_id },
          '1-live-chat-session-end-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        await transaction.rollback();
        request.log.error({
          err,
          url: '/v1/live-chat/:session_id/end-session',
        });
        h.api.createResponse(
          request,
          response,
          500,
          { err },
          '2-live-chat-session-end-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/live-chat/message/webhook',
    handler: async (request, response) => {
      try {
        request.log.info({
          url: '/v1/live-chat/message/webhook',
          payload: request.body,
        });
        // publish message
        const result = await request.rabbitmq.pubLiveChatWebhookPayloadProcess({
          data: request.body,
          consumerType:
            constant.AMQ.CONSUMER_TYPES.LIVE_CHAT_PROCESS_WEBHOOK_PAYLOAD,
        });

        return { status: 200, info: 'OK' };
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: '/v1/live-chat/message/webhook',
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-livechat-message-webhook-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/live-chat-settings/:agency_fk',
    handler: async (request, response) => {
      const { agency_fk } = request.params;
      try {
        request.log.info({
          url: '/v1/live-chat-settings/:agency_fk',
          payload: request.body,
        });

        const liveChatSettings = await c.liveChatSettings.getPublicData({
          agency_fk,
        });

        h.api.createResponse(
          request,
          response,
          200,
          { liveChatSettings },
          'live-chat-settings-1692757100-retrieve-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: '/v1/live-chat-settings/:agency_fk',
        });
        h.api.createResponse(
          request,
          response,
          500,
          { err },
          'live-chat-settings-1692757100-retrieve-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/live-chat',
    schema: {
      query: {
        contact_id: { type: 'string' },
        session_id: { type: 'string' },
      },
    },
    handler: async (request, response) => {
      const { contact_id, session_id } = request.query;

      // const currentAgencyUser = await c.agencyUser.findOne({
      //   user_fk: user_id,
      // });

      // check if read by current agency user
      const liveChatCtlAppWhere = {
        contact_fk: contact_id,
        // agency_fk: currentAgencyUser?.agency_fk,
      };

      const latestLiveChat = await c.liveChat.findOne(liveChatCtlAppWhere, {
        order: [['created_date', 'DESC']],
      });

      await models.unified_inbox.update(
        {
          msg_id: latestLiveChat?.live_chat_id,
          msg_type: latestLiveChat?.msg_type,
          msg_body: latestLiveChat?.msg_body,
          created_date: latestLiveChat?.created_date,
          updated_date: latestLiveChat?.created_date,
          last_msg_date: latestLiveChat?.created_date,
        },
        {
          where: {
            msg_platform: 'livechat',
            contact_fk: contact_id,
            // agency_fk: currentAgencyUser?.agency_fk,
          },
        },
      );

      let where = {};

      where = {
        contact_fk: contact_id,
        // agency_fk: currentAgencyUser?.agency_fk,
      };

      if (!h.isEmpty(session_id)) {
        where.session_id = session_id;
      }

      const include = [];
      const order = [['msg_timestamp', 'DESC']];
      let live_chats = [];
      try {
        if (!h.general.isEmpty(contact_id)) {
          live_chats = await c.liveChat.findAll(where, {
            order,
            include,
          });
        }

        h.api.createResponse(
          request,
          response,
          200,
          { live_chats },
          '1-livechat-messages-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: '/v1/live-chat',
        });

        h.api.createResponse(
          request,
          response,
          500,
          { err },
          '2-livechat-messages-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/live-chat/cities/:agency_fk/:language',
    handler: async (request, response) => {
      const { agency_fk, language } = request.params;
      try {
        request.log.info({
          url: '/v1/live-chat/cities/:agency_fk/:language',
          payload: request.body,
        });

        console.log({ agency_fk, language });

        const cities = await models.agency_salesforce_city.findAll({
          where: {
            agency_fk: agency_fk,
            language: language,
          },
          order: [['name', 'ASC']],
        });

        h.api.createResponse(
          request,
          response,
          200,
          { cities },
          'live-chat-cities-1692757100-retrieve-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: '/v1/live-chat/cities/:agency_fk/:language',
        });
        h.api.createResponse(
          request,
          response,
          500,
          { err },
          'live-chat-cities-1692757100-retrieve-failed',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
