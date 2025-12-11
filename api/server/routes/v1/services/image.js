const h = require('../../../helpers');
const c = require('../../../controllers');
const fetch = require('node-fetch');

/**
 * @description
 * Routing for public images
 *
 * @routes `/services/trigger-image`
 * @param {fastify} Fastify framework
 * @param {opts}  Fastify options
 * @param {next} Fastify callback for handling next router
 */
module.exports = (fastify, opts, next) => {
  /**
   * Endpoint for getting live chat trigger image of the agency
   * @api {get} /services/trigger-image
   * @apiGroup Services
   * @apiUse ServerSuccess
   *
   * @apiParam {string} id Agency ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {imageBuffer} Image buffer.
   * @apiSuccessExample {imageBuffer} Success 200 Response:
   */
  fastify.route({
    method: 'GET',
    url: '/services/trigger-image',
    schema: {
      query: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.query;

      let logo = 'https://cdn.yourpave.com/pave-chat/chaaat-logo-1.png';

      let liveChatSettings;
      if (id) {
        liveChatSettings = await c.liveChatSettings.findOne({
          agency_fk: id,
        });
      }

      if (h.notEmpty(liveChatSettings?.styles)) {
        const s = JSON.parse(liveChatSettings?.styles);
        logo = h.notEmpty(s.triggerLogo) ? s.triggerLogo : logo;
      }

      const response = await fetch(logo);

      const imageBuffer = await response.buffer();

      // Get the content type
      const contentType = response.headers.get('content-type');

      // Set appropriate headers
      reply.header('Content-Type', contentType);
      reply.header('Content-Length', imageBuffer.length);

      // Send the image buffer
      return reply.send(imageBuffer);
    },
  });

  next();
};
