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
const fs = require('fs');
const { promisify } = require('util');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/line-message-tracker-aggregated',
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
        const {
          agency_id,
          tracker_ref_name,
          from,
          to,
          includeHiddenCampaigns,
        } = req.query;
        console.log(includeHiddenCampaigns);
        const where = {};
        if (agency_id) where.agency_fk = agency_id;
        if (tracker_ref_name) where.tracker_ref_name = tracker_ref_name;
        if (from && to) {
          const startDate = new Date(from);
          const endDate = new Date(to);
          where.broadcast_date = { [Op.between]: [startDate, endDate] };
        }
        where.tracker_type = 'main';
        if (h.cmpStr(includeHiddenCampaigns, 'false')) {
          where.visible = 1;
        }
        const results = await c.lineMessageTracker.getAggregatedRecords(where, {
          order: [['created_date', 'DESC']],
        });
        const preview = results.reduce(
          (pv, cv) => {
            pv.pending += Number(cv.total_pending) || 0;
            pv.sent += Number(cv.total_sent) || 0;
            pv.delivered +=
              Number(cv.total_sent) - Number(cv.total_failed) || 0;
            pv.read += Number(cv.total_read) || 0;
            pv.replied += Number(cv.total_replied) || 0;
            pv.failed += Number(cv.total_failed) || 0;
            return pv;
          },
          {
            pending: 0,
            sent: 0,
            delivered: 0,
            failed: 0,
            read: 0,
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
          url: '/v1/staff/line-message-tracker-aggregated',
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622176015', {
          portal,
        });
      }
    },
  });

  /** Get Line campaign tracker recipients */
  fastify.route({
    method: 'GET',
    url: '/staff/line-message-tracker/recipients/:agency_id/:tracker_ref_name',
    schema: {
      params: {
        agency_id: { type: 'string' },
        tracker_ref_name: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const { agency_id, tracker_ref_name } = request.params;
      const {
        search,
        searchStatus,
        from,
        to,
        pageIndex,
        pageSize,
        sortColumn,
        sortOrder,
        totalCount,
      } = request.query;
      const limit = pageSize ? parseInt(pageSize) : undefined;
      const offset = pageIndex * limit;
      try {
        const order = [['created_date', 'DESC']];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        const recipients = await c.lineMessageTracker.getCampaignLineRecipients(
          agency_id,
          tracker_ref_name,
          limit,
          offset,
          order,
          search,
          searchStatus,
          from,
          to,
          totalCount,
        );
        const list = recipients.records;
        const totalTrackerCount = recipients.totalTrackerCount;

        const metadata = {
          pageCount: pageSize
            ? Math.ceil(totalTrackerCount / limit)
            : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: totalTrackerCount,
        };

        h.api.createResponse(
          request,
          reply,
          200,
          { list, metadata },
          'automation-history-recipients-1689818819-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'automation-history-recipients-1689818819-failed',
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/line-message-tracker/hide-campaign
   * @apiName HideCampaign
   * @apiVersion 1.0.0
   * @apiGroup LineMessageTracker
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} [tracker_ref_name] Tracker Ref Name
   */

  fastify.route({
    method: 'POST',
    url: '/staff/line-message-tracker/hide-campaign',
    schema: {
      body: {
        type: 'object',
        required: ['tracker_ref_name'],
        properties: {
          tracker_ref_name: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        // tracker ref name
        const { tracker_ref_name } = request.body;

        // hide campaign by tracker ref name
        await models.line_message_tracker.update(
          {
            visible: 0,
          },
          {
            where: {
              tracker_ref_name: tracker_ref_name,
            },
          },
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-hide-campaign-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to hide selected campaign`, err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-hide-campaign-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
