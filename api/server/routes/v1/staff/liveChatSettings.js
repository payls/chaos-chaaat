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
const { transaction } = require('../../../helpers/database');
const contactService = new ContactService();

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/live-chat-settings/:agencyId',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const { agencyId } = req.params;
      try {
        const liveChatSetting = await c.liveChatSettings.getSettingsData({
          agency_fk: agencyId,
        });

        if (h.isEmpty(liveChatSetting)) {
          return h.api.createResponse(
            req,
            res,
            200,
            { liveChatSetting: {} },
            'live-chat-settings-1692757100-retrieve-success',
            {
              portal,
            },
          );
        }

        const liveChatSettings = h.notEmpty(liveChatSetting?.dataValues)
          ? liveChatSetting?.dataValues
          : liveChatSetting;
        return h.api.createResponse(
          req,
          res,
          200,
          {
            liveChatSetting: {
              ...liveChatSettings,
            },
          },
          'live-chat-settings-1692757100-retrieve-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/live-chat-settings/:agencyId',
        });
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          'live-chat-settings-1692757100-retrieve-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/live-chat-settings/generate',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const submittedData = req.body;
      const {
        agency_id,
        agency_user_id,
        api_oauth_url,
        api_client_id,
        api_client_secret,
        api_url,
        api_token,
        api_update_url,
        api_update_token,
        api_message_url,
        api_message_token,
      } = req.body;
      const { user_id } = h.user.getCurrentUser(req);

      const currentAgencyUser = await c.agencyUser.findOne({
        user_fk: user_id,
      });

      const { ek } = req.ek;

      const createData = { ...submittedData };

      // check if there is agency_id in submission
      if (h.notEmpty(agency_id)) {
        delete createData.agency_id;
        createData.agency_fk = agency_id;
      }

      // check if there is agency_user_id in submission
      if (h.notEmpty(agency_user_id)) {
        delete createData.agency_user_id;
        createData.agency_user_fk = agency_user_id;
      }

      // only apply encryption when api_token data is submitted
      if (h.notEmpty(api_token)) {
        delete createData.api_token;
        const encrypted_api_token = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_token,
        );
        createData.api_token = encrypted_api_token;
      }
      if (api_url === '' || api_token === '') {
        return h.api.createResponse(
          req,
          res,
          500,
          { endpoint: 'create' },
          '2-live-chat-settings-1692757100-create-endpoint-incomplete',
          {
            portal,
          },
        );
      }

      // only apply encryption when api_update_token data is submitted
      if (h.notEmpty(api_update_token)) {
        delete createData.api_update_token;
        const encrypted_api_update_token = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_update_token,
        );
        createData.api_update_token = encrypted_api_update_token;
      }
      if (api_update_url === '' || api_update_token === '') {
        return h.api.createResponse(
          req,
          res,
          500,
          { endpoint: 'update' },
          '2-live-chat-settings-1692757100-update-endpoint-incomplete',
          {
            portal,
          },
        );
      }

      // only apply encryption when api_message_token data is submitted
      if (h.notEmpty(api_message_token)) {
        delete createData.api_message_token;
        const encrypted_api_message_token = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_message_token,
        );
        createData.api_message_token = encrypted_api_message_token;
      }

      // only apply encryption when api_client_id data is submitted
      if (h.notEmpty(api_client_id)) {
        delete createData.api_client_id;
        const encrypted_api_client_id = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_client_id,
        );
        createData.api_client_id = encrypted_api_client_id;
      }

      // only apply encryption when api_client_id data is submitted
      if (h.notEmpty(api_client_secret)) {
        delete createData.api_client_secret;
        const encrypted_api_client_secret = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_client_secret,
        );
        createData.api_client_secret = encrypted_api_client_secret;
      }
      if (
        api_oauth_url === '' ||
        api_client_id === '' ||
        api_client_secret === ''
      ) {
        return h.api.createResponse(
          req,
          res,
          500,
          { endpoint: 'oauth' },
          '2-live-chat-settings-1692757100-oauth-endpoint-incomplete',
          {
            portal,
          },
        );
      }

      createData.created_by = currentAgencyUser?.agency_user_id;

      try {
        await h.database.transaction(async (transaction) => {
          await c.liveChatSettings.create(createData, { transaction });
        });

        h.api.createResponse(
          req,
          res,
          200,
          {},
          'live-chat-settings-1692757100-generate-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/live-chat-settings/generate',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          'live-chat-settings-1692757100-generate-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/live-chat-settings/:live_chat_settings_id',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const { live_chat_settings_id } = req.params;
      const submittedData = req.body;
      const {
        agency_user_id,
        api_oauth_url,
        api_client_id,
        api_client_secret,
        api_url,
        api_token,
        api_update_url,
        api_update_token,
        api_message_url,
        api_message_token,
        api_data_pull_url,
      } = req.body;
      const { user_id } = h.user.getCurrentUser(req);

      const currentAgencyUser = await c.agencyUser.findOne({
        user_fk: user_id,
      });

      const liveChatSettings = await c.liveChatSettings.findOne({
        live_chat_settings_id: live_chat_settings_id,
      });

      const allowSavingCredentialValues =
        await c.liveChatSettings.validateUpdateCredentialValues({
          to_save: req.body,
          db_values: liveChatSettings,
          log: req.log,
        });

      if (h.cmpBool(allowSavingCredentialValues.allowed, false)) {
        return h.api.createResponse(
          req,
          res,
          500,
          { endpoint: allowSavingCredentialValues.endpoint },
          allowSavingCredentialValues.message,
          {
            portal,
          },
        );
      }

      const { ek } = req.ek;

      const updateData = { ...submittedData };

      // check if there is agency_user_id in submission
      if (h.notEmpty(agency_user_id)) {
        delete updateData.agency_user_id;
        updateData.agency_user_fk = agency_user_id;
      }

      // only apply encryption when api_token data is submitted
      if (api_token !== undefined && h.notEmpty(api_token.trim())) {
        delete updateData.api_token;
        const encrypted_api_token = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_token,
        );
        updateData.api_token = encrypted_api_token;
      }

      // only apply encryption when api_update_token data is submitted
      if (
        api_update_token !== undefined &&
        h.notEmpty(api_update_token.trim())
      ) {
        delete updateData.api_update_token;
        const encrypted_api_update_token = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_update_token,
        );
        updateData.api_update_token = encrypted_api_update_token;
      }

      // only apply encryption when api_message_token data is submitted
      if (h.notEmpty(api_message_token)) {
        delete updateData.api_message_token;
        const encrypted_api_message_token = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_message_token,
        );
        updateData.api_message_token = encrypted_api_message_token;
      }

      // only apply encryption when api_client_id data is submitted
      if (api_client_id !== undefined && h.notEmpty(api_client_id.trim())) {
        delete updateData.api_client_id;
        const encrypted_api_client_id = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_client_id,
        );
        updateData.api_client_id = encrypted_api_client_id;
      }

      // only apply encryption when api_client_id data is submitted
      if (
        api_client_secret !== undefined &&
        h.notEmpty(api_client_secret.trim())
      ) {
        delete updateData.api_client_secret;
        const encrypted_api_client_secret = h.crypto.encrypt(
          {
            encryptionKey: ek.encryption_key,
            encryptionIv: ek.encryption_iv,
          },
          api_client_secret,
        );
        updateData.api_client_secret = encrypted_api_client_secret;
      }

      // handling empty values for credentials
      if (api_url !== undefined && api_url.trim() === '') {
        updateData.api_url = null;
      }
      if (api_token !== undefined && api_token.trim() === '') {
        updateData.api_token = null;
      }

      if (api_update_url !== undefined && api_update_url.trim() === '') {
        updateData.api_update_url = null;
      }
      if (api_update_token !== undefined && api_update_token.trim() === '') {
        updateData.api_update_token = null;
      }

      if (api_oauth_url !== undefined && api_oauth_url.trim() === '') {
        updateData.api_oauth_url = null;
      }
      if (api_client_id !== undefined && api_client_id.trim() === '') {
        updateData.api_client_id = null;
      }
      if (api_client_secret !== undefined && api_client_secret.trim() === '') {
        updateData.api_client_secret = null;
      }

      if (api_data_pull_url !== undefined && api_data_pull_url.trim() === '') {
        updateData.api_data_pull_url = null;
      }

      updateData.updated_by = currentAgencyUser?.agency_user_id;

      try {
        await h.database.transaction(async (transaction) => {
          await c.liveChatSettings.update(live_chat_settings_id, updateData, {
            transaction,
          });
        });

        h.api.createResponse(
          req,
          res,
          200,
          {},
          'live-chat-settings-1692757100-update-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/staff/live-chat-settings/:live_chat_settings_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          'live-chat-settings-1692757100-update-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/salesforce/field-configuration/:live_chat_settings_id',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const { live_chat_settings_id } = req.params;
      const { field_configuration } = req.body;
      const { user_id } = h.user.getCurrentUser(req);

      const currentAgencyUser = await c.agencyUser.findOne({
        user_fk: user_id,
      });

      try {
        await h.database.transaction(async (transaction) => {
          await c.liveChatSettings.update(
            live_chat_settings_id,
            {
              field_configuration,
              updated_by: currentAgencyUser?.agency_user_id,
            },
            { transaction },
          );
        });

        h.api.createResponse(
          req,
          res,
          200,
          {},
          'live-chat-settings-1692757100-update-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/salesforce/field-configuration/:live_chat_settings_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          'live-chat-settings-1692757100-update-failed',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
