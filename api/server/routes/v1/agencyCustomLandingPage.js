const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');

const agencyCustomeLandingPageController =
  require('../../controllers/agencyCustomLandingPage').makeController(models);
module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/custom-landing-page/slug/:slug get record for landing page
   * @apiName getCustomLandingPageBySlug
   * @apiVersion 1.0.0
   *
   * @apiParam {string} agency_fk agency id
   */
  fastify.route({
    method: 'GET',
    url: '/custom-landing-page/slug/:slug',
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
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(request, reply, 500, {}, '3-clp-1644979675411');
      }
    },
  });

  next();
};
