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
  fastify.route({
    method: 'GET',
    url: '/services/email-notification-setting/can-send',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          agency_user_id: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
    preValidation: (req, rep, next) => {
      userMiddleware.isAuthorizedComponent(req, rep, next);
    },
    handler: async (req, res) => {
      const { agency_user_id, type } = req.query;

      try {
        const email_notification_settings =
          await c.emailNotificationSetting.ifCanSendEmail(agency_user_id, type);

        return { email_notification_settings, status: 'ok' };
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        return { err };
      }
    },
  });

  next();
};
