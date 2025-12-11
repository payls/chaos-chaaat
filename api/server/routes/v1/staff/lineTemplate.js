const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const models = require('../../../models');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const axios = require('axios');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /staff/line-template/list List Line templates
   * @apiName ListAgencyLineTemplates
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/line-template/list',
    schema: {
      query: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
          channel_id: { type: 'string' },
          template_name: { type: 'string' },
        },
        required: ['agency_id'],
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, channel_id, template_name, status = null } = req.query;

      try {
        const where = {
          agency_fk: agency_id,
        };
        if (!h.isEmpty(channel_id)) {
          where.line_channel = channel_id; // agency_channel_config_id
        }
        if (status) {
          where.status = status;
        }
        if (!h.isEmpty(template_name)) {
          where.template_name = { [Op.like]: `%${template_name.trim()}%` };
        }
        const agency_line_templates = await c.lineTemplate.findAll(where, {
          include: [
            {
              model: models.agency_channel_config,
              required: true,
              attributes: ['channel_name', 'uib_api_token', 'uib_api_secret'],
            },
            // {
            //   model: models.user,
            //   required: true,
            //   attributes: ['first_name', 'last_name'],
            // },
          ],
          order: [['template_name', 'ASC']],
        });

        h.api.createResponse(
          req,
          res,
          200,
          { agency_line_templates },
          '1-line-template-list-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/line-template/list',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/line-template/create Staff create Line template
   * @apiName StaffLineTemplateCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'POST',
    url: '/staff/line-template/create',
    schema: {
      body: {
        type: 'object',
        required: ['line_channel', 'template_name', 'template_type'],
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { line_channel, template_name, template_type, content, status } =
        request.body;
      const { user_id } = h.user.getCurrentUser(request);
      try {
        const currentAgencyUser = await c.agencyUser.findOne({
          user_fk: user_id,
        });

        const agency_id = currentAgencyUser?.agency_fk;

        const line_template_id = h.general.generateId();
        await models.line_template.create({
          line_template_id: line_template_id,
          agency_fk: agency_id,
          template_name: template_name,
          template_type: template_type,
          line_channel: line_channel,
          content: JSON.stringify(content),
          status: status,
          created_by: user_id,
        });

        h.api.createResponse(
          request,
          reply,
          200,
          {
            data: {
              line_template_id: line_template_id,
              agency_fk: agency_id,
              template_name: template_name,
              template_type: template_type,
              line_channel: line_channel,
              content: JSON.stringify(content),
              status: status,
            },
          },
          `1-line-template-${status}-creation-1663834299369`,
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: request.url,
        });
        h.api.createResponse(
          request,
          reply,
          500,
          { err },
          `2-line-template-${status}-creation-1620396470`,
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/line-template/:line_template_id',
    schema: {
      params: {
        line_template_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { line_template_id } = req.params;

      try {
        const line_template = await c.lineTemplate.findOne({
          line_template_id: line_template_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { line_template },
          '1-line-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/line-template/:line_template_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/line-template/update Staff update Line template
   * @apiName StaffLineTemplateUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/line-template/update',
    schema: {
      body: {
        type: 'object',
        required: [
          'line_template_id',
          'line_channel',
          'template_name',
          'template_type',
        ],
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const {
        line_template_id,
        line_channel,
        template_name,
        template_type,
        content,
        status,
      } = request.body;
      const { user_id } = h.user.getCurrentUser(request);
      try {
        const currentAgencyUser = await c.agencyUser.findOne({
          user_fk: user_id,
        });

        const agency_id = currentAgencyUser?.agency_fk;

        await models.line_template.update(
          {
            line_template_id: line_template_id,
            agency_fk: agency_id,
            template_name: template_name,
            template_type: template_type,
            line_channel: line_channel,
            content: JSON.stringify(content),
            status: status,
            created_by: user_id,
          },
          {
            where: {
              line_template_id: line_template_id,
            },
          },
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {
            data: {
              line_template_id: line_template_id,
              agency_fk: agency_id,
              template_name: template_name,
              template_type: template_type,
              line_channel: line_channel,
              content: JSON.stringify(content),
              status: status,
            },
          },
          `1-line-template-${status}-update-1663834299369`,
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: request.url,
        });
        h.api.createResponse(
          request,
          reply,
          500,
          { err },
          `2-line-template-${status}-update-1620396470`,
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/line-template/:agency_channel_config_id/published',
    schema: {
      params: {
        agency_channel_config_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_channel_config_id } = req.params;

      try {
        const line_templates = await c.lineTemplate.findAll({
          line_channel: agency_channel_config_id,
          status: 'published',
        });

        h.api.createResponse(
          req,
          res,
          200,
          { line_templates },
          '1-line-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/line-template/:line_template_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-line-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /staff/whatsapp-template/:waba_template_id Delete template
   * @apiName DeleteWABATemplate
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/line-template/:line_template_id',
    schema: {
      params: {
        line_template_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { line_template_id } = req.params;

      try {
        const line_template = await c.lineTemplate.findOne({
          line_template_id: line_template_id,
        });

        if (line_template) {
          await c.lineTemplate.destroy({
            line_template_id: line_template_id,
          });

          h.api.createResponse(
            req,
            res,
            200,
            { line_template },
            '1-delete-line-message-template-1663834299369',
            {
              portal,
            },
          );
        } else {
          throw new Error(`Template not found.`);
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/line-template',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-delete-line-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
