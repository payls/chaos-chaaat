const c = require('../../controllers');

/**
 * @description
 * Routing for Generate widget
 *
 * @routes `/services/trigger-image`
 * @param {fastify} Fastify framework
 * @param {opts}  Fastify options
 * @param {next} Fastify callback for handling next router
 */
module.exports = (fastify, opts, next) => {
  /**
   * Endpoint for saving user that generates widget in the landing page
   * @api {get} /generate-widget
   * @apiGroup Services
   * @apiUse ServerSuccess
   *
   * @apiParam {email} Generator's email
   * @apiParam {mobile} Generator's WhatsApp number
   * @apiParam {source} Lead source
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {object} Success JSON
   * @apiSuccessExample {object} Success 200 Response: { status: 200, info: 'OK' }
   *
   */

  fastify.route({
    method: 'POST',
    url: '/generate-widget',
    onRequest: fastify.csrfProtection,
    schema: {
      body: {
        type: 'object',
        required: ['email', 'mobile', '_csrf'],
        properties: {
          email: { type: 'string' },
          mobile: { type: 'string' },
          source: { type: 'string' },
          _csrf: { type: 'string' },
        },
      },
    },
    handler: async (request) => {
      try {
        const { email, mobile, source } = request.body;

        await c.lead.create({ email, mobile, source });

        return { status: 200, info: 'OK' };
      } catch (err) {
        return { status: 500, info: 'FAILED' };
      }
    },
  });
  next();
};
