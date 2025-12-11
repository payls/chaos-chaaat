const Sentry = require('@sentry/node');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

const schema = {
  params: {
    agency_id: { type: 'string' },
    automation_rule_id: { type: 'string' },
  },
};

/**
 * Handles the API request to retrieve WhatsApp message recipients for a specific automation rule.
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.params - The URL parameters for agency and automation rule IDs.
 * @param {string} request.params.agency_id - The unique identifier for the agency.
 * @param {string} request.params.automation_rule_id - The unique identifier for the automation rule.
 * @param {Object} request.query - Query parameters for filtering and pagination.
 * @param {string} [request.query.search] - Search term to filter by contact details (name, email, phone).
 * @param {string} [request.query.searchStatus] - Filter by message status (sent, delivered, etc.).
 * @param {string} [request.query.from] - Start date for filtering by creation date.
 * @param {string} [request.query.to] - End date for filtering by creation date.
 * @param {number} request.query.pageIndex - The page number for pagination.
 * @param {number} request.query.pageSize - The number of results per page for pagination.
 * @param {string} request.query.sortColumn - The column by which to sort the results.
 * @param {string} request.query.sortOrder - The direction to sort the results (ASC or DESC).
 * @param {number} request.query.totalCount - The total count of available records.
 * @param {FastifyReply} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */
async function handler (request, reply) {
  const { agency_id, automation_rule_id } = request.params;
  const {
    search,
    searchStatus,
    from,
    to,
    pageIndex,
    pageSize,
    sortColumn,
    sortOrder,
    totalCount,
  } = request.query;
  const limit = pageSize ? parseInt(pageSize) : undefined;
  const offset = pageIndex * limit;
  try {
    const order = [['created_date', 'DESC']];

    if (sortColumn && sortOrder) {
      const split = sortColumn.split('.');
      for (let i = 0; i < split.length; i++) {
        if (i !== split.length - 1) split[i] = models[split[i]];
      }
      order.unshift([...split, sortOrder]);
    }

    const recipients =
      await c.whatsappMessageTracker.getAutomationWhatsAppRecipients(
        agency_id,
        automation_rule_id,
        limit,
        offset,
        order,
        search,
        searchStatus,
        from,
        to,
        totalCount,
      );
    const list = recipients.records;
    const totalTrackerCount = recipients.totalTrackerCount;

    const metadata = {
      pageCount: pageSize
        ? Math.ceil(totalTrackerCount / limit)
        : undefined,
      pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
      totalCount: totalTrackerCount,
    };

    h.api.createResponse(
      request,
      reply,
      200,
      { list, metadata },
      'automation-history-recipients-1689818819-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/recipients/:agency_id/:automation_rule_id"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-history-recipients-1689818819-failed',
    );
  }
}

module.exports.schema = schema;
module.exports.handler = handler;
