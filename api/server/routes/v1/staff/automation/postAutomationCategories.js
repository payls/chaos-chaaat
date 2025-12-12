const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Creates a new automation category for the specified agency.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object, containing the details for the new automation category.
 * @param {FastifyReply} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>} - Returns a response with a status of 200 on success or 500 on failure.
 */

async function handler(request, reply) {
  const { title, description = '', agency_id, platform } = request.body;

  const automation_category_id = await h.database.transaction(
    async (transaction) => {
      const automation_category_id = await c.automationCategory.create(
        {
          title,
          description,
          agency_fk: agency_id,
          platform,
        },
        { transaction },
      );
      return automation_category_id;
    },
  );

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      { automation_category_id },
      'automation-category-1689818819-save-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: '/staff/automation/categories',
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-category-1689818819-save-failed',
    );
  }
}

module.exports.handler = handler;
