const Sentry = require('@sentry/node');
const c = require('../../controllers');
const h = require('../../helpers');
const userMiddleware = require('../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/user-saved-property Create user_saved_property record
   * @apiName UserSavedPropertyCreate
   * @apiVersion 1.0.0
   * @apiGroup UserProperty
   * @apiUse ServerError
   *
   * @apiParam {string} property_fk Project ID
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
    url: '/user-saved-property',
    schema: {
      body: {
        type: 'object',
        required: ['property_fk'],
        properties: {
          property_fk: { type: 'string' },
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
    },
    handler: async (req, res) => {
      try {
        const { property_fk } = req.body;
        const { user_id } = h.user.getCurrentUser(req);
        // Check if user_saved_property record already exist
        const checkRecord = await c.userSavedProperty.findOne({
          property_fk,
          user_fk: user_id,
        });
        if (h.isEmpty(checkRecord)) {
          const { user_saved_property_id } = h.database.transaction(
            async (transaction) => {
              const user_saved_property_id = await c.userSavedProperty.create(
                {
                  property_fk,
                  user_fk: user_id,
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
          );
        } else {
          h.api.createResponse(
            req,
            res,
            500,
            {},
            '2-user-saved-property-1618908991',
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to save property`, { err });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-user-saved-property-1617786084',
        );
      }
    },
  });

  /**
   * @api {delete} /v1/user-saved-property/:property_fk Delete user_saved_property record
   * @apiName UserSavedPropertyDelete
   * @apiVersion 1.0.0
   * @apiGroup UserProperty
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} property_fk Project ID
   */
  fastify.route({
    method: 'DELETE',
    url: '/user-saved-property/:property_fk',
    schema: {
      params: {
        property_fk: { type: 'string' },
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
    },
    handler: async (req, res) => {
      try {
        const { property_fk } = req.params;
        const { user_id } = h.user.getCurrentUser(req);
        await h.database.transaction(async (transaction) => {
          await c.userSavedProperty.destroy(
            { property_fk, user_fk: user_id },
            { transaction },
          );
        });
        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-user-saved-property-1617786876',
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
        );
      }
    },
  });

  /**
   * @api {get} /v1/user-saved-property Get user's saved properties by user_fk
   * @apiName UserSavedPropertyGet
   * @apiVersion 1.0.0
   * @apiGroup UserProperty
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} user_saved_properties All of user's saved properties.
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
    url: '/user-saved-property',
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
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const user_saved_properties = await c.userSavedProperty.findAll({
          user_fk: user_id,
        });
        h.api.createResponse(
          req,
          res,
          200,
          { user_saved_properties },
          '1-user-saved-property-1617982186',
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-user-saved-property-1617982207',
        );
      }
    },
  });

  /**
   * @api {get} /v1/user-saved-property/:property_id Get user's saved properties by property_id
   * @apiName UserSavedPropertyByPropertyIdGet
   * @apiVersion 1.0.0
   * @apiGroup UserProperty
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/user-saved-property/:property_id',
    schema: {
      params: {
        property_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      try {
        const { property_id } = req.params;
        const user_saved_property = await c.userSavedProperty.findOne({
          property_fk: property_id,
        });
        h.api.createResponse(
          req,
          res,
          200,
          { user_saved_property },
          '1-user-saved-property-1618755411',
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-user-saved-property-1618755441',
        );
      }
    },
  });

  next();
};
