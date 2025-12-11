const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const Sentry = require('@sentry/node');

const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const whatsappFlowUtils = require('./whatsappFlowUtils');

/**
 * preValidation handler - validates if the user is loggedIn and is a staff / admin
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function preValidation (req, res) {
  await userMiddleware.isLoggedIn(req, res);
  await userMiddleware.hasAccessToStaffPortal(req, res);
}

async function handler (req, res) {
  const { waba_id } = req.body;

  try {
    const creds = await whatsappFlowUtils.getWabaBufferedCredentials(waba_id);
    const {
      agency_id,
      waba_number,
      access_token,
      agencyBufferedTemplateCredentials,
    } = creds;


    // check if key exists
    const getKeyRequest = await axios.get('https://template.unificationengine.com/flow/get/key', {
      params: {
        access_token,
        phone_number: waba_number,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${agencyBufferedTemplateCredentials}`,
      }
    });

    const responseData = getKeyRequest.data?.info?.data || [];
    if (
      getKeyRequest.status === 200 &&
      responseData.length > 0 &&
      responseData[0]?.business_public_key_signature_status === 'VALID'
    ) {
      return h.api.createResponse(
        req,
        res,
        200,
        {
          phone_number: {
            phone_number: waba_number,
          },
        },
        '1-flow-creation-1620396460',
        portal,
      );
    }

    const publicKeyPath = path.join(__dirname, '../../../..', 'files', 'wa-flow', 'chaaat-public.pem');
    const form = new FormData();
    form.append('key', fs.createReadStream(publicKeyPath));
    form.append('phone_number', waba_number);
    form.append('access_token', access_token);
  
    const axiosRequest = {
      method: 'post',
      url: 'https://template.unificationengine.com/flow/set/key'
    };

    const response = await axios.post(axiosRequest.url, form, {
      headers: {
        Authorization: `Basic ${agencyBufferedTemplateCredentials}`,
        ...form.getHeaders(),
      },
    });

    if (response.status !== 200) {
      return h.api.createResponse(
        req,
        res,
        400,
        {
          message: 'Invalid WABA ID'
        },
        '1-flow-creation-1620396460',
        portal,
      );
    }

    return h.api.createResponse(
      req,
      res,
      200,
      { ...response.data },
      '1-flow-creation-1620396460',
      portal,
    );
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({
      error: err,
      url: '/staff/whatsapp-flows/register-key',
    });
    return h.api.createResponse(
      req,
      res,
      500,
      {
        message: 'An error occured while saving whatsapp flow public key'
      },
      '1-flow-creation-1620396460',
      portal,
    );
  }
}

const schema = {
  body: {
    type: 'object',
    required: ['waba_id'],
    properties: {
      waba_id: { type: 'string' },
    }
  }
};

module.exports.handler = handler;
module.exports.preValidation = preValidation;
module.exports.schema = schema;
