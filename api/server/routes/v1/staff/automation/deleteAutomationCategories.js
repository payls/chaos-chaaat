const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Deletes an automation category by its ID.
 *
 * This API endpoint allows for the deletion of an automation category specified by
 * the ID provided in the request body.
 * @async
 * @function handler
 * @param {FastifyRequest} request
 * @param {Object} request.body - The body of the request.
 * @param {string} request.body.id - The ID of the automation category to delete.
 * @param {FastifyResponse} reply
 *
 * @returns {Promise<void>}
 */
async function handler (request, reply) {
  const { id } = request.body;

  await h.database.transaction(async (transaction) => {
    await c.automationCategory.destroy(
      {
        automation_category_id: id,
      },
      { transaction },
    );
  });

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      {},
      'automation-category-1689818819-delete-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      error_string: String(err),
      url: "/staff/automation/categories"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-category-1689818819-delete-failed',
    );
  }
}

module.exports.handler = handler;
