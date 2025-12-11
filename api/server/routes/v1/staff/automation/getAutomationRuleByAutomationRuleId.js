const Sentry = require('@sentry/node');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves a specific automation rule by its ID, including related entities.
 *
 * This API endpoint fetches an automation rule and its associated templates, categories,
 * packages, and forms. The ID of the automation rule is provided as a path parameter.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.params - The path parameters.
 * @param {string} request.params.automation_rule_id - The ID of the automation rule to retrieve.
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { automation_rule_id } = request.params;

  const rule = await c.automationRule.findOne(
    {
      automation_rule_id,
    },
    {
      include: [
        {
          model: models.automation_rule_template,
        },
        {
          model: models.automation_category,
        },
        {
          model: models.automation_rule_packages,
        },
        {
          model: models.automation_rule_form,
          include: [{ model: models.hubspot_form }],
        },
      ],
    },
  );

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      {
        rule,
      },
      'automation-rules-1689818819-retrieved-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/rule/:automation_rule_id"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-rules-1689818819-retrieved-failed',
    );
  }
}

module.exports.handler = handler;
