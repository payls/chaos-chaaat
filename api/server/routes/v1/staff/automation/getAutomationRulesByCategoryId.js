const Sentry = require('@sentry/node');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves automation rules based on category ID, and optional query parameters for rule trigger, business account, and status.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.params - The parameters from the URL path.
 * @param {string} request.params.category_id - The category ID for filtering automation rules.
 * @param {Object} request.query - The query parameters from the request.
 * @param {string} [request.query.rule_trigger_fk] - The rule trigger filter (optional).
 * @param {string} [request.query.business_account] - The business account filter for rule templates (optional).
 * @param {string} [request.query.status] - The status filter for automation rules (optional).
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */
async function handler(request, reply) {
  const { category_id } = request.params;
  const { rule_trigger_fk, business_account, status } = request.query;

  const optionalWhereClause = {};

  if (h.notEmpty(rule_trigger_fk)) {
    optionalWhereClause.rule_trigger_fk = rule_trigger_fk;
  }

  if (h.notEmpty(status)) {
    optionalWhereClause.status = status;
  }

  const rules = await c.automationRule.findAll(
    {
      automation_category_fk: category_id,
      ...optionalWhereClause,
    },
    {
      include: [
        {
          model: models.automation_rule_template,
          ...(business_account && { where: { business_account } }), // Conditionally add where clause
          required: true,
        },
        {
          model: models.automation_rule_form,
        },
        {
          model: models.automation_rule_packages,
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
        rules,
      },
      'automation-rules-1689818819-retrieved-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: '/staff/automation/rules/:category_id',
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
