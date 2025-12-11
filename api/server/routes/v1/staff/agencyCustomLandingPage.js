const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const models = require('../../../models');
const agencyCustomeLandingPageController =
  require('../../../controllers/agencyCustomLandingPage').makeController(
    models,
  );
const landingPageInfoController =
  require('../../../controllers/landingPageInfo').makeController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/custom-landing-page create record for landing page
   * @apiName createCustomLandingPage
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   * @apiParam {string} landing_page landing page
   * @apiParam {string} landing_page_slug landing page slug link
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
    url: '/staff/custom-landing-page',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_fk',
          'landing_page',
          'landing_page_slug',
          'landing_page_name',
        ],
        properties: {
          agency_fk: { type: 'string' },
          landing_page: { type: 'string' },
          landing_page_slug: { type: 'string' },
          landing_page_name: { type: 'string' },
          landing_page_data: { type: 'string' },
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
    handler: async (request, reply) => {
      const {
        agency_fk,
        landing_page,
        landing_page_slug,
        landing_page_data = null,
        landing_page_html = null,
        landing_page_css = null,
        landing_page_name = null,
        meta_title = null,
        meta_description = null,
        meta_image = null,
      } = request.body;

      const id = await h.database.transaction(async (transaction) => {
        const createdId = await agencyCustomeLandingPageController.create(
          { agency_fk, landing_page, landing_page_name, landing_page_slug },
          { transaction },
        );
        if (landing_page.startsWith('custom-')) {
          await landingPageInfoController.create(
            {
              agency_custom_landing_page_fk: createdId,
              landing_page_data: landing_page_data
                ? JSON.stringify(landing_page_data)
                : null,
              landing_page_html,
              landing_page_css,
              meta_title,
              meta_description,
              meta_image,
            },
            { transaction },
          );
        }

        return createdId;
      });

      if (id) {
        h.api.createResponse(
          request,
          reply,
          200,
          { agency_custom_landing_page_id: id },
          '1-clp-1644979673273',
        );
      } else {
        h.api.createResponse(request, reply, 500, {}, '2-clp-1644979675411');
      }
    },
  });

  /**
   * @api {get} /v1/staff/custom-landing-page get record for landing page
   * @apiName createCustomLandingPage
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   */
  fastify.route({
    method: 'GET',
    url: '/staff/custom-landing-page/:agency_fk',
    schema: {
      params: {
        agency_fk: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const { agency_fk } = request.params;

      try {
        const landingPages = await agencyCustomeLandingPageController.findAll(
          {
            agency_fk,
          },
          {
            include: [
              {
                model: models.landing_page_info,
                required: false,
              },
            ],
          },
        );

        h.api.createResponse(
          request,
          reply,
          200,
          { custom_landing_pages: landingPages },
          '4-clp-1644979675411',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(request, reply, 500, {}, '3-clp-1644979675411', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/custom-landing-page get record by agency for landing page
   * @apiName createCustomLandingPage
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   */
  fastify.route({
    method: 'GET',
    url: '/staff/custom-landing-page/page/:agency_custom_landing_page_id',
    schema: {
      params: {
        agency_custom_landing_page_id: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const { agency_custom_landing_page_id } = request.params;

      try {
        const landingPages = await agencyCustomeLandingPageController.findOne(
          {
            agency_custom_landing_page_id,
          },
          {
            include: [
              {
                model: models.landing_page_info,
                required: false,
              },
            ],
          },
        );

        h.api.createResponse(
          request,
          reply,
          200,
          { custom_landing_pages: landingPages },
          '4-clp-1644979675411',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(request, reply, 500, {}, '3-clp-1644979675411', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/custom-landing-page/slug/:slug get record for landing page
   * @apiName getCustomLandingPageBySlug
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   */
  fastify.route({
    method: 'GET',
    url: '/staff/custom-landing-page/slug/:slug',
    schema: {
      params: {
        slug: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params;

      try {
        const landingPages = await agencyCustomeLandingPageController.findOne(
          {
            landing_page_slug: slug,
          },
          {
            include: [
              {
                model: models.landing_page_info,
                required: false,
              },
            ],
          },
        );

        h.api.createResponse(
          request,
          reply,
          200,
          { custom_landing_pages: landingPages },
          '4-clp-1644979675411',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(request, reply, 500, {}, '3-clp-1644979675411', {
          portal,
        });
      }
    },
  });

  /**
   * @api {POST} /v1/staff/custom-landing-page/:agency_custom_landing_page_id update record for landing page
   * @apiName updateCustomLandingPage
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   */
  fastify.route({
    method: 'POST',
    url: '/staff/custom-landing-page/:agency_custom_landing_page_id',
    schema: {
      params: {
        agency_custom_landing_page_id: { type: 'string' },
      },
      body: {
        type: 'object',
        required: ['landing_page_name'],
        properties: {
          landing_page_name: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const { landing_page_name } = req.body;
        const { agency_custom_landing_page_id } = req.params;

        await h.database.transaction(async (transaction) => {
          await agencyCustomeLandingPageController.update(
            agency_custom_landing_page_id,
            {
              landing_page_name,
            },
            {
              transaction,
            },
          );
        });

        h.api.createResponse(req, res, 200, {}, '5-clp-1644979675411', {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '6-clp-1644979675411', {
          portal,
        });
      }
    },
  });

  /**
   * @api {POST} /v1/staff/custom-landing-page/page/:agency_custom_landing_page_id update record for landing page
   * @apiName updateCustomLandingPage
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   */
  fastify.route({
    method: 'POST',
    url: '/staff/custom-landing-page/page/:agency_custom_landing_page_id',
    schema: {
      params: {
        agency_custom_landing_page_id: { type: 'string' },
      },
      body: {
        type: 'object',
        required: [
          'landing_page_data',
          'landing_page_html',
          'landing_page_css',
        ],
        properties: {
          landing_page_data: { type: 'string' },
          landing_page_html: { type: 'string' },
          landing_page_css: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const { landing_page_data, landing_page_html, landing_page_css } =
          req.body;
        const { agency_custom_landing_page_id } = req.params;

        const customLandingPage = await landingPageInfoController.findOne({
          agency_custom_landing_page_fk: agency_custom_landing_page_id,
        });

        if (customLandingPage) {
          await h.database.transaction(async (transaction) => {
            await landingPageInfoController.update(
              customLandingPage.landing_page_info_id,
              {
                landing_page_data,
                landing_page_html,
                landing_page_css,
              },
              {
                transaction,
              },
            );
          });

          h.api.createResponse(req, res, 200, {}, '5-clp-1644979675411', {
            portal,
          });
        } else {
          h.api.createResponse(req, res, 500, {}, '6-clp-1644979675411', {
            portal,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(req, res, 500, {}, '6-clp-1644979675411', {
          portal,
        });
      }
    },
  });

  /**
   * @api {POST} /v1/staff/custom-landing-page/settings/:agency_custom_landing_page_id update record for landing page
   * @apiName updateCustomLandingPage
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   */
  fastify.route({
    method: 'POST',
    url: '/staff/custom-landing-page/settings/:agency_custom_landing_page_id',
    schema: {
      params: {
        agency_custom_landing_page_id: { type: 'string' },
      },
      body: {
        type: 'object',
        required: ['landing_page_name', 'meta_title', 'meta_description'],
        properties: {
          landing_page_name: { type: 'string' },
          meta_title: { type: 'string' },
          meta_description: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const { landing_page_name, meta_title, meta_description } = req.body;
        const { agency_custom_landing_page_id } = req.params;

        const customLandingPage = await landingPageInfoController.findOne({
          agency_custom_landing_page_fk: agency_custom_landing_page_id,
        });

        if (customLandingPage) {
          await h.database.transaction(async (transaction) => {
            await agencyCustomeLandingPageController.update(
              agency_custom_landing_page_id,
              {
                landing_page_name,
              },
              {
                transaction,
              },
            );

            await landingPageInfoController.update(
              customLandingPage.landing_page_info_id,
              {
                meta_title,
                meta_description,
              },
              {
                transaction,
              },
            );
          });

          h.api.createResponse(req, res, 200, {}, '5-clp-1644979675411', {
            portal,
          });
        } else {
          h.api.createResponse(req, res, 500, {}, '6-clp-1644979675411', {
            portal,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(req, res, 500, {}, '6-clp-1644979675411', {
          portal,
        });
      }
    },
  });

  next();
};
