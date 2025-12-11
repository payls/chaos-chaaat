const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const c = require('../../../controllers');
const h = require('../../../helpers');
const models = require('../../../models');
const userMiddleware = require('../../../middlewares/user');
const contactViewController =
  require('../../../controllers/contactView').makeContactViewController(models);
const contactViewPropertyController =
  require('../../../controllers/contactViewProperty').makeContactViewPropertyController(
    models,
  );

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/save-contact-view create or update a contact view for an agency
   * @apiName StaffSaveContactViews
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact View
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/save-contact-view',
    schema: {
      body: {
        type: 'object',
        required: ['contact_view_fields', 'agency_fk'],
        properties: {
          contact_view_id: { type: 'string' },
          agency_fk: { type: 'string' },
          agency_user_fk: { type: 'string' },
          contact_view_name: { type: 'string' },
          contact_view_fields: { type: 'string' },
          access_level: { type: 'integer' },
          is_pinned: { type: 'boolean' },
          contact_view_status: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contact_view_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      let statusCode = 200;
      let message_code = '1-save-view-success-1644979673273';
      const data = {};

      try {
        const {
          contact_view_id,
          agency_user_fk,
          agency_fk,
          contact_view_name,
          contact_view_fields,
          access_level,
          is_pinned,
          contact_view_status,
        } = req.body;

        const user = h.user.getCurrentUser(req);
        const agency_user = await c.agencyUser.findOne({
          user_fk: user.user_id,
        });

        const newContactViewId = await h.database.transaction(
          async (transaction) => {
            let contactViewId;
            if (h.isEmpty(contact_view_id)) {
              // new filter being created
              contactViewId = await contactViewController.create(
                {
                  agency_fk: agency_user.agency_fk,
                  agency_user_fk,
                  contact_view_name,
                  contact_view_fields,
                  access_level,
                  created_by: user.user_id,
                },
                { transaction },
              );
            } else {
              /* update the existing filters for the view */

              // check if the agency user is owner of contact view
              if (h.cmpStr(agency_user_fk, agency_user.agency_user_id)) {
                // unable ot edit the contact view
                contactViewId = await contactViewController.update(
                  contact_view_id,
                  {
                    contact_view_name,
                    contact_view_fields,
                    access_level,
                    updated_by: user.user_id,
                    contact_view_status,
                  },
                  { transaction },
                );
              } else {
                contactViewId = contact_view_id;
                statusCode = 500;
                message_code = '2-user-permission-denied-1644979848480';
              }
            }

            if (h.notEmpty(is_pinned)) {
              const contactViewProperty =
                await contactViewPropertyController.findOrCreate(
                  {
                    contact_view_fk: contactViewId,
                    agency_user_fk,
                  },
                  {
                    contact_view_fk: contactViewId,
                    agency_user_fk,
                    is_pinned,
                    created_by: user.user_id,
                  },
                  { transaction },
                );
              if (!contactViewProperty.created) {
                await contactViewPropertyController.update(
                  contactViewProperty.record.contact_view_property_id,
                  {
                    is_pinned: is_pinned,
                    updated_by: user.user_id,
                  },
                  { transaction },
                );
              }

              statusCode = 200;
              message_code = 'Saved view successfully';
            }

            return contactViewId;
          },
        );
        data.contact_view_id = newContactViewId;
      } catch (e) {
        Sentry.captureException(e);
        statusCode = 500;
        message_code = '2-save-view-failed-1644979675411';
        console.log(`error occurred when saving the view: ${e}`);
      } finally {
        h.api.createResponse(req, res, statusCode, data, message_code, {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/get-contact-views get list of all contact views for an agency
   * @apiName StaffGetContactViews
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact View
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} contactViews List of contactViews
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contactViews": []
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/get-contact-views',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contactViews: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      let statusCode = 200;
      let message_code = '1-get-all-contact-views-success-1644979676127';
      let data = {};
      try {
        const user = h.user.getCurrentUser(req);
        const agencyUser = await c.agencyUser.findOne({
          user_fk: user.user_id,
        });

        const contactViews = await contactViewController.findAll(
          {
            agency_fk: agencyUser.agency_fk,
          },
          {
            include: [{ model: models.contact_view_property, required: false }],
          },
        );

        data = { contactViews };
      } catch (err) {
        Sentry.captureException(err);
        statusCode = 500;
        message_code = '2-get-all-contact-views-failed-1644979676726';
        console.log(`error occurred when getting the views: ${err}`);
      } finally {
        h.api.createResponse(req, res, statusCode, data, message_code, {
          portal,
        });
      }
    },
  });

  /**
   * @api {delete} /v1/staff/delete-contact-view delete contact view by contact-view-id
   * @apiName StaffDeleteContactView
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact View
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   * }
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/delete-contact-view',
    schema: {
      querystring: {
        contact_view_id: { type: 'string' },
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
      let statusCode = 200;
      let message_code = '1-delete-contact-view-success-1644979677558';
      const data = {};
      try {
        const { contact_view_id } = req.query;
        await h.database.transaction(async (transaction) => {
          await contactViewController.update(
            contact_view_id,
            {
              status: constant.CONTACT_VIEW.STATUS.DELETED,
            },
            { transaction },
          );
        });
      } catch (err) {
        Sentry.captureException(err);
        statusCode = 500;
        message_code = '2-delete-contact-view-failed-1644979678952';
        console.log(`error occurred when deleting the view: ${err}`);
      } finally {
        h.api.createResponse(req, res, statusCode, data, message_code, {
          portal,
        });
      }
    },
  });
  next();
};
