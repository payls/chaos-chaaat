const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const StaffReportService = require('../../../services/staff/agencyReport');
const { catchError } = require('../../../helpers/error');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/report Retrieve list of reports
   * @apiName StaffReportGet
   * @apiVersion 1.0.0
   * @apiGroup Staff Report
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} reports Reports.
   */
  fastify.route({
    method: 'GET',
    url: '/staff/report',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const staffReportService = new StaffReportService();
      const [err, { reports }] = await catchError(
        staffReportService.findAllReports(req),
      );
      if (err) {
        Sentry.captureException(err);
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-report-1641516256194',
          { portal },
        );
      } else {
        return h.api.createResponse(
          req,
          res,
          200,
          { reports },
          '1-report-1641516256194',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/report Staff user create agency report
   * @apiName StaffReportCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Report
   * @apiUse ServerError
   *
   * @apiParam {string} project_id Project ID to create the report for
   * @apiParam {Date} from Report period from
   * @apiParam {Date} to Report period to
   * @apiParam {string} created_by Report created by
   * @apiParam {number} timezoneOffsetMinutes offset with client's local time
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} report_id Report ID.
   */
  fastify.route({
    method: 'POST',
    url: '/staff/report',
    schema: {
      body: {
        type: 'object',
        required: ['project_id', 'from', 'to'],
        properties: {
          project_id: { type: 'string' },
          from: { type: 'string' },
          to: { type: 'string' },
          timezoneOffsetMinutes: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            report_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const staffReportService = new StaffReportService();
      const [err, { agency_report_id }] = await catchError(
        staffReportService.createReport(req),
      );
      if (err) {
        Sentry.captureException(err);
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-report-1641514119152',
          { portal },
        );
      } else {
        return h.api.createResponse(
          req,
          res,
          200,
          { agency_report_id },
          '1-report-1641514119142',
          { portal },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/report Staff delete report
   * @apiName StaffReportDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Report
   * @apiUse ServerError
   *
   * @apiParam {string} report_id Report ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} report_id Report id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234"
   * }
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/report',
    schema: {
      query: {
        type: 'object',
        required: ['agency_report_id'],
        properties: {
          agency_report_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            report_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const staffReportService = new StaffReportService();
      const [err] = await h.database.transaction(async (transaction) => {
        staffReportService.setDbTransaction(transaction);
        return catchError(staffReportService.deleteReport(req));
      });
      if (err) {
        Sentry.captureException(err);
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-report-1641516256234',
          { portal },
        );
      } else {
        return h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-report-1641516256234',
          { portal },
        );
      }
    },
  });

  next();
};
