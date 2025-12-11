const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const NonStaffShortlistedProjectService = require('../../services/shortlistedProject');
const NonStaffShortlistedProjectSettingService = require('../../services/shortlistedProjectSetting');
const { catchError } = require('../../helpers/error');
const shortListedProjectController =
  require('../../controllers/shortlistedProject').makeShortListedProjectController(
    models,
  );

module.exports = (fastify, opts, next) => {
  /**
   * @api {put} /v1/shortlisted-property Inverse shortlisted project's is_bookmarked state
   * @apiName ShortlistedProjectUpdateBookmark
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProject
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_id Shortlisted project ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   * @apiSuccess {boolean} is_bookmarked is_bookmarked state of shortlisted project.
   * @apiSuccess {date} bookmark_date is_bookmarked date of shortlisted project.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_project_id": "1234",
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/shortlisted-project/:shortlisted_project_id/bookmark',
    onRequest: fastify.csrfProtection,
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_id'],
        properties: {
          shortlisted_project_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_project_id: { type: 'string' },
            is_bookmarked: { type: 'boolean' },
            bookmark_date: { type: 'string' },
          },
        },
      },
    },
    handler: async (req, res) => {
      const nonStaffShortlistedProjectService =
        new NonStaffShortlistedProjectService();
      const [err, { shortlisted_project_id, is_bookmarked, bookmark_date }] =
        await catchError(
          nonStaffShortlistedProjectService.bookmarkProject(req),
        );
      if (err) {
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-1649653728340',
        );
      } else {
        return h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_project_id, is_bookmarked, bookmark_date },
          '1-shortlisted-project-1649653728340',
        );
      }
    },
  });

  /**
   * @api {put} /v1/shortlisted-property Inverse shortlisted project's is_enquired state
   * @apiName ShortlistedProjectUpdateEnquire
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProject
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_id Shortlisted project ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   * @apiSuccess {boolean} is_enquired is_enquired state of shortlisted project.
   * @apiSuccess {date} enquired_date is_enquired date of shortlisted project.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_project_id": "1234",
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/shortlisted-project/:shortlisted_project_id/enquire',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_id'],
        properties: {
          shortlisted_project_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_project_id: { type: 'string' },
            is_enquired: { type: 'boolean' },
            enquired_date: { type: 'string' },
          },
        },
      },
    },
    handler: async (req, res) => {
      const nonStaffShortlistedProjectService =
        new NonStaffShortlistedProjectService();
      const [err, { shortlisted_project_id, is_enquired, enquired_date }] =
        await catchError(nonStaffShortlistedProjectService.enquireProject(req));
      if (err) {
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-1649654526107',
        );
      } else {
        return h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_project_id, is_enquired, enquired_date },
          '1-shortlisted-project-1649654526107',
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/shortlisted-project/:shortlisted_project_id/setting',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_id'],
        properties: {
          shortlisted_project_id: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      const nonStaffShortlistedProjectSettingService =
        new NonStaffShortlistedProjectSettingService();
      const [err, shortListedProjectSetting] = await h.database.transaction(
        async (transaction) => {
          nonStaffShortlistedProjectSettingService.setDbTransaction(
            transaction,
          );
          return catchError(
            nonStaffShortlistedProjectSettingService.getShorlistedProjectSettings(
              req,
            ),
          );
        },
      );
      if (err) {
        req.log.error({
          url: req.url,
          error: err,
        });
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-setting-1653901822716',
        );
      } else {
        const message_code = '1-project-setting-1653901822716';
        const message = h.general.getMessageByCode(message_code);
        return res.code(200).send({
          status: 200,
          message,
          message_code,
          shortListedProjectSetting,
        });
      }
    },
  });

  /**
   * @api {put} /v1/shortlisted-project Update shortlisted_project's rating record
   * @apiName ShortlistedPropertyUpdateRating
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProperty
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_id Shortlisted project ID
   * @apiParam {number=0,1,2,3,4,5} [project_rating] Rating for shortlisted project
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_project_id": "1234",
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/shortlisted-project/:shortlisted_project_id/project-rating',
    onRequest: fastify.csrfProtection,
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_id'],
        properties: {
          shortlisted_project_id: { type: 'string' },
          _csrf: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['project_rating'],
        properties: {
          project_rating: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_project_id: { type: 'string' },
          },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const { shortlisted_project_id } = req.params;
        const { project_rating } = req.body;
        if (project_rating < 0 || project_rating > 5) {
          return h.api.createResponse(
            req,
            res,
            400,
            {},
            '2-shortlisted-project-1621756437079',
          );
        }
        const updatedRecordId = await h.database.transaction(
          async (transaction) => {
            const updatedShortListProjectId =
              await shortListedProjectController.update(
                shortlisted_project_id,
                {
                  project_rating,
                  project_rating_updated_date: h.date.getSqlCurrentDate(),
                },
                { transaction },
              );
            return updatedShortListProjectId;
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_project_id: updatedRecordId },
          '1-shortlisted-project-1621391826',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to rate shortlisted project`, {
          err,
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-1621391818',
        );
      }
    },
  });

  next();
};
