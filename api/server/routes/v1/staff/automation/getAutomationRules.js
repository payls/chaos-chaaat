const Sentry = require('@sentry/node');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves automation rules based on optional status and agency_id query parameters.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.query - The query parameters from the request.
 * @param {string} [request.query.status] - The status filter for automation rules (optional).
 * @param {string} [request.query.agency_id] - The agency ID filter for automation categories (optional).
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler(request, reply) {
  const requestQuery = request.query;

  const { user_id: current_user_id } = h.user.getCurrentUser(request);
  const { agency_fk: agency_id } = await c.agencyUser.findOne({
    user_fk: current_user_id,
  });

  const automationRuleWhere = {
    ...(h.notEmpty(requestQuery?.status)
      ? { status: requestQuery?.status }
      : {}),
    ...(h.notEmpty(requestQuery?.rule_trigger_id)
      ? { rule_trigger_fk: requestQuery?.rule_trigger_id }
      : {}),
  };

  const automationCategoryWhere = {
    ...(agency_id ? { agency_fk: agency_id } : {}),
  };

  const rules = await c.automationRule.findAll(automationRuleWhere, {
    include: [
      {
        model: models.automation_rule_template,
      },
      {
        model: models.automation_rule_form,
      },
      {
        model: models.automation_rule_packages,
      },
      {
        model: models.automation_category,
        where: automationCategoryWhere,
        required: !!agency_id,
      },
    ],
  });

  console.log(rules);
  try {
    h.api.createResponse(
      request,
      reply,
      200,
      {
        rules,
      },
      'automation-rules-1689818819-retrieve-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: '/staff/automation/rules',
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-rules-1689818819-retrieve-failed',
    );
  }
}

module.exports.handler = handler;
