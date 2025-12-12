const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/user-saved-property Staff to create user_saved_property record on behalf of user
   * @apiName StaffSavedPropertyCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Property
   * @apiUse ServerError
   *
   * @apiParam {string} property_fk Project ID
   * @apiParam {string} user_fk User ID of user accessed by staff
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} user_saved_property_id User saved property id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "user_saved_property_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/user-saved-property',
    schema: {
      body: {
        type: 'object',
        required: ['property_fk', 'user_fk'],
        properties: {
          property_fk: { type: 'string' },
          user_fk: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            user_saved_property_id: { type: 'string' },
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
        // Get property's id and user id of client user
        const { property_fk, user_fk } = req.body;
        // Get staff's user id
        const { user_id } = h.user.getCurrentUser(req);
        const { user_saved_property_id } = h.database.transaction(
          async (transaction) => {
            const user_saved_property_id = await c.userSavedProperty.create(
              {
                property_fk,
                user_fk,
                created_by: user_id,
              },
              { transaction },
            );
            return { user_saved_property_id };
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { user_saved_property_id },
          '1-user-saved-property-1617786003',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to save property`, { err });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-user-saved-property-1617786084',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/user-saved-property Staff to delete user_saved_property record on behalf of user
   * @apiName StaffSavedPropertyDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Property
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} property_fk Project ID
   * @apiParam {string} user_fk User ID of user accessed by staff
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/user-saved-property',
    schema: {
      querystring: {
        property_fk: { type: 'string' },
        user_fk: { type: 'string' },
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
      try {
        const { property_fk, user_fk } = req.query;
        await h.database.transaction(async (transaction) => {
          await c.userSavedProperty.destroy(
            { property_fk, user_fk },
            { transaction },
          );
        });
        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-user-saved-property-1617786876',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to un-save property`, { err });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-user-saved-property-1617786928',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/user-saved-property Staff to get list of all users' saved properties
   * @apiName StaffSavedPropertyGet
   * @apiVersion 1.0.0
   * @apiGroup Staff Property
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} user_saved_properties List saved properties and their users
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "user_saved_properties": []
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/user-saved-property',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            user_saved_properties: { type: 'array' },
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
        const user_saved_properties = await c.userSavedProperty.findAll({});
        h.api.createResponse(
          req,
          res,
          200,
          { user_saved_properties },
          '1-user-saved-property-1617982186',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-user-saved-property-1617982207',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
