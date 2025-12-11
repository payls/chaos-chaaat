const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const NonStaffShortlistedPropertyService = require('../../services/shortlistedProperty');
const { catchError } = require('../../helpers/error');
const shortListedPropertyController =
  require('../../controllers/shortListedProperty').makeShortListedPropertyController(
    models,
  );

module.exports = (fastify, opts, next) => {
  /**
   * @api {put} /v1/shortlisted-property Update shortlisted_property's rating record
   * @apiName ShortlistedPropertyUpdateRating
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProperty
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_id Shortlisted property ID
   * @apiParam {number=0,1,2,3,4,5} [property_rating] Rating for shortlisted property
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_property_id": "1234",
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/shortlisted-property/:shortlisted_property_id/property-rating',
    onRequest: fastify.csrfProtection,
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_id'],
        properties: {
          shortlisted_property_id: { type: 'string' },
          _csrf: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['property_rating'],
        properties: {
          property_rating: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_property_id: { type: 'string' },
          },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const { shortlisted_property_id } = req.params;
        const { property_rating } = req.body;
        if (property_rating < 0 || property_rating > 5) {
          return h.api.createResponse(
            req,
            res,
            400,
            {},
            '2-shortlisted-property-1621756437079',
          );
        }
        const updatedRecordId = await h.database.transaction(
          async (transaction) => {
            const updatedShortListPropertyId =
              await shortListedPropertyController.update(
                shortlisted_property_id,
                {
                  property_rating,
                  property_rating_updated_date: h.date.getSqlCurrentDate(),
                },
                { transaction },
              );
            return updatedShortListPropertyId;
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_property_id: updatedRecordId },
          '1-shortlisted-property-1621391826',
        );
      } catch (err) {
        console.log(`${req.url}: user failed to rate shortlisted property`, {
          err,
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-1621391818',
        );
      }
    },
  });

  /**
   * @api {put} /v1/shortlisted-property Inverse shortlisted property's is_bookmarked state
   * @apiName ShortlistedPropertyUpdateBookmark
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProperty
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_id Shortlisted property ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   * @apiSuccess {boolean} is_bookmarked is_bookmarked state of shortlisted property.
   * @apiSuccess {date} bookmark_date is_bookmarked date of shortlisted property.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_property_id": "1234",
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/shortlisted-property/:shortlisted_property_id/bookmark',
    onRequest: fastify.csrfProtection,
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_id'],
        properties: {
          shortlisted_property_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_property_id: { type: 'string' },
            is_bookmarked: { type: 'boolean' },
            bookmark_date: { type: 'string' },
            _csrf: { type: 'string' },
          },
        },
      },
    },
    handler: async (req, res) => {
      const nonStaffShortlistedPropertyService =
        new NonStaffShortlistedPropertyService();
      const [err, { shortlisted_property_id, is_bookmarked, bookmark_date }] =
        await catchError(
          nonStaffShortlistedPropertyService.bookmarkProperty(req),
        );
      if (err) {
        Sentry.captureException(err);
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-1643608849564',
        );
      } else {
        return h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_property_id, is_bookmarked, bookmark_date },
          '1-shortlisted-property-1643608849564',
        );
      }
    },
  });

  /**
   * @api {put} /v1/shortlisted-property/:shortlisted_property_id/reserve Request for shortlisted property reservation.
   * @apiName ShortlistedPropertyReserve
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProperty
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_id Shortlisted property ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   * @apiSuccess {boolean} is_requested_for_reservation is_requested_for_reservation state of shortlisted property.
   * @apiSuccess {date} reservation_date is_requested_for_reservation date of shortlisted property.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_property_id": "1234",
   *      "is_requested_for_reservation": true
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/shortlisted-property/:shortlisted_property_id/reserve',
    onRequest: fastify.csrfProtection,
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_id'],
        properties: {
          shortlisted_property_id: { type: 'string' },
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
            is_requested_for_reservation: { type: 'string' },
            reservation_date: { type: 'string' },
          },
        },
      },
    },
    handler: async (req, res) => {
      const nonStaffShortlistedPropertyService =
        new NonStaffShortlistedPropertyService();
      const [
        err,
        {
          shortlisted_property_id,
          is_requested_for_reservation,
          reservation_date,
        },
      ] = await catchError(
        nonStaffShortlistedPropertyService.requestReserve(req),
      );
      if (err) {
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-1651855722401',
        );
      } else {
        return h.api.createResponse(
          req,
          res,
          200,
          {
            shortlisted_property_id,
            is_requested_for_reservation,
            reservation_date,
          },
          '1-shortlisted-property-1651855722401',
        );
      }
    },
  });

  next();
};
