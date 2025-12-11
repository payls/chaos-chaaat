const Sentry = require('@sentry/node');
const h = require('../../helpers');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/check-email Check email for google address
   * @apiName GeneralCheckEmailGet
   * @apiVersion 1.0.0
   * @apiGroup CheckEmail
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/check-email',
    schema: {
      query: {
        email: { type: 'string' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            is_google_email: { type: 'boolean' },
          },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const email = req.query && req.query.email ? req.query.email : '';
        const is_google_email = await h.email.isGoogleEmailAddress(email);
        h.api.createResponse(
          req,
          res,
          200,
          { is_google_email },
          '1-generic-1618368927',
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-generic-1618368937');
      }
    },
  });

  next();
};
