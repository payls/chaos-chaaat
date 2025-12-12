const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const c = require('../../../controllers');
const userMiddleware = require('../../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * Staff user to create project feature
   * @api {post} /v1/staff/project/feature
   * @apiName StaffProjectFeatureCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Feature
   * @apiUse ServerError
   *
   * @apiParam {string} name Property feature name
   * @apiParam {string} type Property feature type
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} project_feature_id Project Feature ID.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "project_feature_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/project/feature',
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            project_feature_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { name, type } = req.body;
        const { user_id } = h.user.getCurrentUser(req);
        const { project_feature_id } = await h.database.transaction(
          async (transaction) => {
            const project_feature_id = await c.projectFeature.create(
              {
                name,
                type,
                created_by: user_id,
              },
              { transaction },
            );
            return { project_feature_id };
          },
        );
        h.api.createResponse(
          res,
          200,
          { project_feature_id },
          '1-project-feature-1625648492',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to create project property`, {
          err,
        });
        h.api.createResponse(res, 500, {}, '2-project-feature-1625648559', {
          portal,
        });
      }
    },
  });

  /**
   * Staff user to retrieve list of project features
   * @api {get} /v1/staff/project/feature
   * @apiName StaffAgencyUserGetAgencyUsers
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} project_features List of project features
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "project_features": [
   *          {
   *            "project_feature_id": "37372c3c248d-9a35e5fd-a2a9-4b54-8e8a",
   *            "name": "Indoor gym",
   *            "type": "fitness,
   *            "created_by": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *            "created_date": "15 Mar 2021 02:09 am",
   *            "updated_by": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *            "updated_date": "15 Mar 2021 02:09 am"
   *            }
   *          }
   *      ]
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/project/feature',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            project_features: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  project_feature_id: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  created_by: { type: 'string' },
                  created_date: { type: 'string' },
                  updated_by: { type: 'string' },
                  updated_date: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const project_features = await c.projectFeature.findAll({});
        h.api.createResponse(
          res,
          200,
          { project_features },
          '1-project-feature-1625648595',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(res, 500, {}, '2-project-feature-1625648615', {
          portal,
        });
      }
    },
  });

  next();
};
