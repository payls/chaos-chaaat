const Sentry = require('@sentry/node');
const { Op } = require('sequelize');
const constant = require('../../../constants/constant.json');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const models = require('../../../models');
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/sms-message-tracker-aggregated',
    schema: {
      qs: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.query;
        const queryFilters = req.query.allQueries
          ? JSON.parse(req.query.allQueries).setFilter
          : [];

        const where = {};
        let startDate = null;
        let endDate = null;

        where.msg_trigger = 'proposal';
        where.msg_type = 'frompave';
        if (agency_id) where.agency_fk = agency_id;
        if (queryFilters.from && queryFilters.to) {
          startDate = new Date(queryFilters.from);
          endDate = new Date(queryFilters.to);
        }

        const results = await c.smsMessageTracker.getAggregatedRecords(
          where,
          startDate,
          endDate,
          {},
        );
        const preview = results.reduce(
          (pv, cv) => {
            pv.sent += Number(cv.total_sent) || 0;
            pv.delivered += Number(cv.total_delivered) || 0;
            pv.failed += Number(cv.total_failed) || 0;
            pv.replied += Number(cv.total_replied) || 0;
            return pv;
          },
          {
            sent: 0,
            delivered: 0,
            failed: 0,
            replied: 0,
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { results: results || [], preview },
          '1-agency-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/sms-message-tracker-aggregated',
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622176015', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/sms-message-tracker',
    schema: {
      qs: {
        type: 'object',
        properties: {
          tracker_ref_name: { type: 'string' },
          only_with_response: { type: 'boolean' },
          agency_user_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { tracker_ref_name, only_with_response, agency_user_id } =
          req.query;
        const { user_id } = h.user.getCurrentUser(req);

        const userRoleRecord = await userRoleController.findOne({
          user_fk: user_id,
        });

        const isAgencySalesUser =
          userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES;

        const where = {};
        where.tracker_ref_name = tracker_ref_name;
        where.msg_trigger = 'proposal';
        where.msg_type = 'frompave';

        if (
          h.general.notEmpty(only_with_response) &&
          h.general.cmpBool(only_with_response, true)
        ) {
          where.replied = 1;
        }
        const results = await c.smsMessageTracker.getCampaignRecipientRecords(
          where,
          isAgencySalesUser,
          agency_user_id,
          {},
        );
        h.api.createResponse(
          req,
          res,
          200,
          { results: results },
          '1-agency-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/sms-message-tracker',
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622176015', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/sms-message-tracker/thread',
    schema: {},
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { tracker_ref_name, contact_fk } = req.query;

      const where = {
        tracker_ref_name,
        contact_fk,
      };
      const include = [{ model: models.agency }, { model: models.agency_user }];
      const order = [['created_date', 'DESC']];
      let sms_thread = [];
      try {
        if (!h.general.isEmpty(tracker_ref_name)) {
          sms_thread = await c.smsMessageTracker.findAll(where, {
            order,
            include,
          });
        }

        h.api.createResponse(
          req,
          res,
          200,
          { sms_thread },
          '1-whatsapp-messages-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/sms-message-tracker/thread',
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
  next();
};
