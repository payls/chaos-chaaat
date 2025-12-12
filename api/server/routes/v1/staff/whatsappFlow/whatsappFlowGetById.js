const Sentry = require('@sentry/node');

const c = require('../../../../controllers');
const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;

/**
 * WhatsappFlowGetById handler - accepts whatsapp flow details in body
 * this will call UIB api to update a whatsapp_flow and saves the updated whatsapp_flow to db
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function handler (req, res) {
  const { whatsapp_flow_id } = req.params;

  try {
    const whatsappFlow = await c.whatsappFlow.findOne({
      whatsapp_flow_id
    });

    if (!whatsappFlow) {
      return res.status(400).send({
        message: 'Invalid Whatsapp Flow ID'
      });
    }

    h.api.createResponse(
      req,
      res,
      200,
      { whatsappFlow },
      '1-flow-get-by-id-1620396460',
      portal,
    );
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({
      error: err,
      url: '/staff/whatsapp-flows/:whatsapp_flow_id',
    });
    h.api.createResponse(
      req,
      res,
      500,
      { err },
      '2-flow-get-by-id-1620396460',
      {
        portal,
      },
    );
  }
}

module.exports.handler = handler;
