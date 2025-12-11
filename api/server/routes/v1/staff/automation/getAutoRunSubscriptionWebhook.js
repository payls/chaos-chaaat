const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');
const moment = require('moment');
const { Op, Sequelize } = require('sequelize');

/**
 * Handles the subscription status check and updates the payment status for agencies.
 * 
 * This function checks for active subscriptions for paid agencies, retrieves their Stripe subscription details,
 * and updates the payment status in the database if the subscription is canceled or expired. 
 * It processes each agency individually and ensures the correct status is set (paid or unpaid) based on 
 * the subscription state from Stripe.
 * 
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {FastifyReply} reply - The reply object used to send the response.
 * 
 * @returns {Promise<void>} - Returns a response with a status of 200 on success or 500 on failure.
 */

async function handler (request, reply) {
  try {
    // TEST;
    // const stripe = require('stripe')(
    //   'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
    // );

    // PROD
    const stripe = require('stripe')(
      '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',
    );

    const agencies = await c.agency.findAll({
      is_paid: 1,
      [Op.and]: [
        {
          agency_id: {
            [Op.notLike]: `%8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47%`,
          },
        },
        {
          agency_id: {
            [Op.notLike]: `%08012e63-a6ce-4cb1-abdf-89b592955729%`,
          },
        },
      ],
    });

    for (const agency of agencies) {
      const stripeTxn = await c.stripeCheckoutSession.findOne(
        {
          agency_fk: agency?.agency_id,
          paid: 1,
        },
        {
          order: [['created_date', 'DESC']],
        },
      );

      if (stripeTxn) {
        let isCanceled = false;
        const payload = JSON.parse(stripeTxn.payload);

        const stripeInvoice = await c.stripeInvoice.findOne(
          {
            payload: {
              [Op.like]: `%${payload.object.invoice}%`,
            },
            status: 'finalized',
          },
          {
            order: [['created_date', 'DESC']],
          },
        );
        const invoicePayload = JSON.parse(stripeInvoice.payload);

        const subscription = await stripe.subscriptions.retrieve(
          invoicePayload.object.subscription,
        );

        if (subscription?.status === 'canceled') {
          isCanceled = true;

          if (moment(subscription.trial_end).isBefore(moment())) {
            isCanceled = false;
          }
        }

        // Set to unpaid
        if (isCanceled) {
          await h.database.transaction(async (transaction) => {
            await c.agency.update(
              agency?.agency_id,
              {
                is_paid: 0, // Free plan
              },
              { transaction },
            );
          });
        }
      }
    }

    h.api.createResponse(
      request,
      reply,
      200,
      {},
      '1-subcription-webhook-1663834299369',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/run-subscription-webhook"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      '2-subcription-webhook-1663834299369',
    );
  }
}

module.exports.handler = handler;
