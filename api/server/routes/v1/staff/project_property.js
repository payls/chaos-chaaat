const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const h = require('../../../helpers');
const c = require('../../../controllers');
const { Op } = require('sequelize');
const userMiddleware = require('../../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * Staff user retrieve list of project properties by project ID tied to agency_fk
   * @api {get} /v1/staff/project/:project_id/property
   * @apiName StaffProjectGetProjectProperties
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Property
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} project_id Project ID
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/project/:project_id/property',
    schema: {
      params: {
        type: 'object',
        required: ['project_id'],
        properties: {
          project_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { project_id } = req.params;
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_fk } = await c.agencyUser.findOne({ user_fk: user_id });
        // Retrieve project property by agency_fk and project_id
        const project = await c.project.findOne({
          project_id: project_id,
          agency_fk: agency_fk,
        });
        // Retrieve all active properties of a project
        const projectPropertyList = await c.projectProperty.findAll(
          { project_fk: project.project_id, is_deleted: { [Op.eq]: 0 } },
          {
            include: [
              {
                model: models.project_property_media,
                required: false,
              },
            ],
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { projectPropertyList },
          '1-project-property-1624960955',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-property-1622569890',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Staff user to retrieve single project property
   * @api {get} /v1/staff/project/:project_id/property/:project_property_id
   * @apiName StaffProjectGetProjectProperty
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Property
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/project/:project_id/property/:project_property_id',
    schema: {
      params: {
        type: 'object',
        required: ['project_id', 'project_property_id'],
        properties: {
          project_id: { type: 'string' },
          project_property_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { project_id, project_property_id } = req.params;
        const project = await c.project.findOne({ project_id });
        const projectProperty = await c.projectProperty.findOne(
          {
            project_fk: project.project_id,
            project_property_id,
            is_deleted: { [Op.eq]: 0 },
          },
          {
            include: [
              {
                model: models.project_property_media,
                required: false,
              },
            ],
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { projectProperty },
          '1-project-property-1624940124',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to retrieve project property`, {
          err,
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-property-1624966512',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Staff user to create project property
   * @api {post} /v1/staff/project/:project_id/property
   * @apiName StaffProjectPropertyCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Property
   * @apiUse ServerError
   *
   * @apiParam {string} project_id Project ID
   *
   * @apiParam {string} unit_type Property unit type
   * @apiParam {string} unit_number Property unit number
   * @apiParam {string} floor Property floor
   * @apiParam {number} sqm Property square meters
   * @apiParam {number} number_of_bedroom Property no. of bed rooms
   * @apiParam {number} number_of_bathroom Property no. of bath rooms
   * @apiParam {string} number_of_parking_lots Property no. of parking lots
   * @apiParam {string} direction_facing Property direction facing
   * @apiParam {string} currency_code Property currency code
   * @apiParam {number} starting_price Property staring price amount
   * @apiParam {number} weekly_rent Property weeking rent amount
   * @apiParam {number} rental_yield Property rental yield percentage
   * @apiParam {string} status Property status
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} project_property_id Project Property ID.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "project_property_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/project/:project_id/property',
    schema: {
      params: {
        type: 'object',
        required: ['project_id'],
        properties: {
          project_id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          unit_type: { type: 'string' },
          unit_number: { type: 'string' },
          floor: { type: 'string' },
          sqm: { type: 'number' },
          number_of_bedroom: { type: 'number' },
          number_of_bathroom: { type: 'number' },
          number_of_parking_lots: { type: 'string' },
          direction_facing: { type: 'string' },
          currency_code: { type: 'string' },
          starting_price: { type: 'number' },
          weekly_rent: { type: 'number' },
          rental_yield: { type: 'number' },
          status: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            project_property_id: { type: 'string' },
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
        const {
          unit_type,
          unit_number,
          floor,
          sqm,
          number_of_bedroom,
          number_of_bathroom,
          number_of_parking_lots,
          direction_facing,
          currency_code,
          starting_price,
          weekly_rent,
          rental_yield,
          status,
        } = req.body;
        const { project_id } = req.params;
        const { user_id } = h.user.getCurrentUser(req);
        const { project_property_id } = await h.database.transaction(
          async (transaction) => {
            const project_property_id = await c.projectProperty.create(
              {
                project_fk: project_id,
                unit_type,
                unit_number,
                floor,
                sqm,
                number_of_bedroom,
                number_of_bathroom,
                number_of_parking_lots,
                direction_facing,
                currency_code,
                starting_price,
                weekly_rent,
                rental_yield,
                status,
                is_deleted: 0,
                created_by: user_id,
              },
              { transaction },
            );
            return { project_property_id };
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { project_property_id },
          '1-project-property-1624960986',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to create project property`, {
          err,
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-property-1624990763',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Staff user to update project property
   * @api {put} /v1/staff/project/:project_id/property/:project_property_id
   * @apiName StaffProjectProjectUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Project
   * @apiUse ServerError
   *
   * @apiParam {string} project_id Project ID
   *
   * @apiParam {string} unit_type Property unit type
   * @apiParam {string} unit_number Property unit number
   * @apiParam {string} floor Property floor
   * @apiParam {number} sqm Property square meters
   * @apiParam {number} number_of_bedroom Property no. of bed rooms
   * @apiParam {number} number_of_bathroom Property no. of bath rooms
   * @apiParam {string} number_of_parking_lots Property no. of parking lots
   * @apiParam {string} direction_facing Property direction facing
   * @apiParam {string} currency_code Property currency code
   * @apiParam {number} starting_price Property staring price amount
   * @apiParam {number} weekly_rent Property weeking rent amount
   * @apiParam {number} rental_yield Property rental yield percentage
   * @apiParam {string} status Property status
   * @apiParam {number} is_deleted Project deletion status
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} project_property_id Project Property ID.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "project_property_id": "1234",
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/project/:project_id/property/:project_property_id',
    schema: {
      params: {
        type: 'object',
        required: ['project_id', 'project_property_id'],
        properties: {
          project_id: { type: 'string' },
          project_property_id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          unit_type: { type: 'string' },
          unit_number: { type: 'string' },
          floor: { type: 'string' },
          sqm: { type: 'number' },
          number_of_bedroom: { type: 'number' },
          number_of_bathroom: { type: 'number' },
          number_of_parking_lots: { type: 'string' },
          direction_facing: { type: 'string' },
          currency_code: { type: 'string' },
          starting_price: { type: 'number' },
          weekly_rent: { type: 'number' },
          rental_yield: { type: 'number' },
          status: { type: 'string' },
          is_deleted: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            project_id: { type: 'string' },
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
        const {
          unit_type,
          unit_number,
          floor,
          sqm,
          number_of_bedroom,
          number_of_bathroom,
          number_of_parking_lots,
          direction_facing,
          currency_code,
          starting_price,
          weekly_rent,
          rental_yield,
          status,
          is_deleted,
        } = req.body;
        const { project_id, project_property_id } = req.params;
        const { user_id } = h.user.getCurrentUser(req);
        const updatedPropertyId = await h.database.transaction(
          async (transaction) => {
            const updatedProjectPropertyId = await c.projectProperty.update(
              project_property_id,
              {
                project_fk: project_id,
                unit_type,
                unit_number,
                floor,
                sqm,
                number_of_bedroom,
                number_of_bathroom,
                number_of_parking_lots,
                direction_facing,
                currency_code,
                starting_price,
                weekly_rent,
                rental_yield,
                status,
                is_deleted,
                updated_by: user_id,
              },
              { transaction },
            );
            return updatedProjectPropertyId;
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { project_property_id: updatedPropertyId },
          '1-project-property-1624942165',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to update project property`, {
          err,
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-property-1624941443',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Staff user to delete project property record
   * @api {delete} /v1/staff/project/:project_id/property/:project_property_id
   * @apiName StaffProjectProjectPropertyDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Property
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} project_id Project ID
   * @apiParam {string} project_property_id Project Property ID
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/project/:project_id/property/:project_property_id',
    schema: {
      params: {
        type: 'object',
        required: ['project_id', 'project_property_id'],
        properties: {
          project_id: { type: 'string' },
          project_property_id: { type: 'string' },
        },
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
        const { project_id, project_property_id } = req.params;
        await h.database.transaction(async (transaction) => {
          return await c.projectProperty.destroy(
            { project_fk: project_id, project_property_id },
            { transaction },
          );
        });
        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-project-property-1624942113',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: user failed to delete project property record`,
          { err },
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-property-1624940980',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
