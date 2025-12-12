const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const models = require('../../../models');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/email-notification-setting get agent setting
   * @apiName GetEmailNotificationSetting
   * @apiVersion 1.0.0
   * @apiUse ServerError
   * @apiUse ServerSuccess
   */
  fastify.route({
    method: 'GET',
    url: '/staff/email-notification-setting',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          agency_user_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_user_id } = req.query;

      try {
        const emailNotificationSettings =
          await c.emailNotificationSetting.findAll({
            agency_user_fk: agency_user_id,
          });

        h.api.createResponse(
          req,
          res,
          200,
          { email_notification_settings: emailNotificationSettings },
          '1-save-success-email-notification-1685583754',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-save-error-email-notification-1685583754',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/email-notification-setting Create or update agent setting
   * @apiName SaveEmailNotificationSetting
   * @apiVersion 1.0.0
   * @apiUse ServerError
   * @apiUse ServerSuccess
   */
  fastify.route({
    method: 'POST',
    url: '/staff/email-notification-setting',
    schema: {
      body: {
        type: 'object',
        properties: {
          agency_user_id: { type: 'string' },
          settings: { type: 'array' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_user_id, settings } = req.body;

      try {
        if (h.notEmpty(settings)) {
          for (const setting of settings) {
            await h.database.transaction(async (transaction) => {
              const userSetting = await c.emailNotificationSetting.findOne(
                {
                  agency_user_fk: agency_user_id,
                  notification_type: setting.notification_type,
                },
                { transaction },
              );

              // Create setting if no setting found on agent user
              if (h.isEmpty(userSetting)) {
                await c.emailNotificationSetting.create(
                  {
                    agency_user_fk: agency_user_id,
                    notification_type: setting.notification_type,
                    status: setting.status,
                  },
                  { transaction },
                );
              }

              // Update setting if no setting found on agent user
              if (h.notEmpty(userSetting)) {
                await c.emailNotificationSetting.update(
                  {
                    agency_user_fk: agency_user_id,
                    notification_type: setting.notification_type,
                  },
                  {
                    status: setting.status,
                  },
                  { transaction },
                );
              }
            });
          }
        }

        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-save-success-email-notification-1685583754',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-save-error-email-notification-1685583754',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/email-notification-setting/:agency_user_id/can-send get agent setting
   * @apiName GetEmailNotificationSetting
   * @apiVersion 1.0.0
   * @apiUse ServerError
   * @apiUse ServerSuccess
   */
  fastify.route({
    method: 'GET',
    url: '/staff/email-notification-setting/can-send',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          agency_user_id: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      const { agency_user_id, type } = req.query;

      try {
        const emailNotificationSettings =
          await c.emailNotificationSetting.ifCanSendEmail(agency_user_id, type);

        h.api.createResponse(
          req,
          res,
          200,
          { email_notification_settings: emailNotificationSettings, type },
          '2-get-success-email-notification-1685583754',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          200,
          {},
          '2-get-error-email-notification-1685583754',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
