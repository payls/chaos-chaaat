const crypto = require('crypto');
const Sentry = require('@sentry/node');
const h = require('../../helpers');

const PARTNER_ID_ENV = process.env.UIB_PARTNER_ID;
const parnerId =
  PARTNER_ID_ENV && PARTNER_ID_ENV.trim() !== ''
    ? PARTNER_ID_ENV
    : 'PID-63294842a3760900125c7e1c';

/**
 * decryptKey - decrypt encrypted keys based on UIB's specs
 * @param {string} encodedString
 * @returns {string} decodedString
 */
function decryptKey(value) {
  const algorithm = 'aes-256-cbc';
  const password = parnerId;
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(value, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * decryptKeys - decode each field in a json object
 * @param {object} jsonWithEncodedValues
 * @returns {object} jsonWithDecodedValues
 */
function decryptKeys(values) {
  return Object.keys(values).reduce((pv, cv) => {
    pv[cv] = decryptKey(values[cv]);

    return pv;
  }, {});
}

/**
 * getWhatsappOnboardingRecords - get the records to be updated
 * @param {{
 *  models: object,
 *  WABA_ACCOUNT_ID: string
 * }} param0
 * @returns {Promise<{
 *  whatsappConfig: object,
 *  whatsappOnboarding: object
 * }>}
 */
async function getWhatsappOnboardingRecords({
  models,
  WABA_ACCOUNT_ID,
  PHONE_NUMBER,
}) {
  const agencyWhatsappConfigCtl =
    require('../../controllers/agencyWhatsappConfig').makeController(models);
  const whatsappOnboardingCtl =
    require('../../controllers/whatsappOnboarding').makeController(models);

  let whatsappConfig;
  let whatsappOnboarding;
  const phoneNumber = PHONE_NUMBER;

  let cleanedNumber;

  if (phoneNumber) {
    cleanedNumber = phoneNumber.replace(/[\+\s]/g, '');
  }

  whatsappConfig = await agencyWhatsappConfigCtl.findOne({
    agency_waba_id: WABA_ACCOUNT_ID,
    waba_number: cleanedNumber,
    waba_status: null,
  });

  if (whatsappConfig && whatsappConfig.whatsapp_onboarding_fk) {
    whatsappOnboarding = await whatsappOnboardingCtl.findOne({
      whatsapp_onboarding_id: whatsappConfig.whatsapp_onboarding_fk,
    });
  }

  return {
    whatsappConfig,
    whatsappOnboarding,
  };
}

/**
 * updateWhatsappOnboardingRecords - updates records related to whatsapp onboarding
 * @param {{
 *  models: object,
 *  decodedPayload: object,
 *  whatsappConfig: object,
 *  whatsappOnboarding: object,
 *  log: FastifyLogFn,
 * }} param0
 * @returns {Promise<void>}
 */
async function updateWhatsappOnboardingRecords({
  models,
  decodedPayload,
  whatsappConfig,
  whatsappOnboarding,
  log,
}) {
  const agencyWhatsappConfigCtl =
    require('../../controllers/agencyWhatsappConfig').makeController(models);
  const whatsappOnboardingCtl =
    require('../../controllers/whatsappOnboarding').makeController(models);
  const {
    ACCESS_KEY,
    ACCESS_SECRET,
    TEMPLATE_ACCESS_KEY,
    TEMPLATE_ACCESS_SECRET,
  } = decodedPayload;
  const transaction = await models.sequelize.transaction();
  try {
    await agencyWhatsappConfigCtl.update(
      whatsappConfig.agency_whatsapp_config_id,
      {
        agency_whatsapp_api_token: ACCESS_KEY,
        agency_whatsapp_api_secret: ACCESS_SECRET,
        agency_waba_template_token: TEMPLATE_ACCESS_KEY,
        agency_waba_template_secret: TEMPLATE_ACCESS_SECRET,
        waba_status: 'CONNECTED',
      },
      null,
      { transaction },
    );

    if (whatsappOnboarding) {
      await whatsappOnboardingCtl.update(
        whatsappOnboarding.whatsapp_onboarding_id,
        {
          status: 'confirmed',
          confirmed_date: Date.now(),
        },
        null,
        { transaction },
      );
    }

    await transaction.commit();
  } catch (err) {
    log.error({
      error: err,
      error_string: String(err),
    });
    await transaction.rollback();
    throw err;
  }
}

/**
 * Description
 * Function to enable whatsapp config when a new waba is created for agency
 * @async
 * @function
 * @name enableAgencyConfigForWhatsApp
 * @kind function
 * @param {{
 *  models: any
 *  whatsappConfig: any
 *  log: any
 * }} { models, whatsappConfig, log }
 * @returns {Promise<void>}
 */
async function enableAgencyConfigForWhatsApp({ models, whatsappConfig, log }) {
  const agencyCtl = require('../../controllers/agency').makeAgencyController(
    models,
  );
  const agencyConfigCtl =
    require('../../controllers/agencyConfig').makeController(models);

  const agency_id = whatsappConfig.agency_fk;
  // check if agency whatsapp fields needs to be updated
  const agency = await agencyCtl.findOne({
    agency_id,
  });
  // check if agency has agency config record
  const agencyConfig = await agencyConfigCtl.findOne({
    agency_fk: agency_id,
  });
  // get whatsapp initial configuration
  const config_data = getWhatsAppConfigData();
  const transaction = await models.sequelize.transaction();
  try {
    if (
      h.isEmpty(agency?.agency_whatsapp_api_token) ||
      h.isEmpty(agency?.agency_whatsapp_api_secret) ||
      h.isEmpty(agency?.agency_waba_id) ||
      h.isEmpty(agency?.agency_waba_template_token) ||
      h.isEmpty(agency?.agency_waba_template_secret)
    ) {
      await models.agency.update(
        {
          agency_whatsapp_api_token: 1,
          agency_whatsapp_api_secret: 1,
          agency_waba_id: 1,
          agency_waba_template_token: 1,
          agency_waba_template_secret: 1,
        },
        { where: { agency_id }, transaction },
      );
    }
    if (h.isEmpty(agencyConfig)) {
      await models.agency_config.create(
        {
          agency_config_id: h.general.generateId(),
          agency_fk: agency_id,
          whatsapp_config: config_data,
        },
        { transaction },
      );
    } else {
      if (h.isEmpty(agencyConfig.whatsapp_config)) {
        await models.agency_config.update(
          {
            whatsapp_config: config_data,
          },
          {
            where: { agency_config_id: agencyConfig.agency_config_id },
            transaction,
          },
        );
      }
    }
    await transaction.commit();
  } catch (configErr) {
    log.error({
      error: configErr,
      error_string: String(configErr),
    });
    await transaction.rollback();
    throw configErr;
  }
}

/**
 * Description
 * Get JSON stringified whatsapp configuration
 * @function
 * @name getWhatsAppConfigData
 * @kind function
 * @returns {string} returns JSON stringified whatsapp configuration
 */
function getWhatsAppConfigData() {
  return JSON.stringify({
    is_enabled: true,
    environment: 'whatsappcloud',
    quick_replies: [
      {
        type: 'template',
        name: 'Interested',
        value: 'interested',
        response: "Great, we'll contact you for more details.",
        send_reply: true,
        opt_out: false,
        email: true,
        cta_reply: 1,
      },
      {
        type: 'template',
        name: 'Not Interested',
        value: 'not interested',
        response:
          'Understand, was there another better timing that may work better for you?',
        send_reply: true,
        opt_out: false,
        email: true,
        cta_reply: 2,
      },
      {
        type: 'template',
        name: 'Unsubscribe',
        value: 'unsubscribe',
        response:
          'Noted! We will not send marketing messages via Whatsapp going forward to you. Do let us know if you change your mind.',
        send_reply: true,
        opt_out: true,
        email: false,
        cta_reply: 3,
      },
      {
        type: 'default',
        name: 'Replied with Text',
        value: 'manual_reply',
        response: '',
        send_reply: false,
        opt_out: false,
        email: true,
        cta_reply: 0,
      },
    ],
  });
}

/**
 * wa-process-onboarding-webhook-payload - processes the onboarding webhook payload
 * @param {{
 *  data: object,
 *  models: object,
 *  channel: object,
 *  config: object,
 *  pubChannel: object,
 *  log: FastifyLogFn,
 *  additionalConfig: object,
 * }} param0
 * @returns {Promise<void>}
 */
module.exports = async ({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) => {
  const payload = JSON.parse(data.content.toString());
  const body = payload.data;
  log.info({
    message: 'WA ONBOARDING PAYLOAD DATA',
    payload: body,
  });

  const decodedPayload = decryptKeys(body);

  const { WABA_ACCOUNT_ID, PHONE_NUMBER } = decodedPayload;

  try {
    const { whatsappConfig, whatsappOnboarding } =
      await getWhatsappOnboardingRecords({
        models,
        WABA_ACCOUNT_ID,
        PHONE_NUMBER,
      });

    if (!whatsappConfig) {
      throw new Error(
        JSON.stringify({
          message: 'No Configuration found',
          payload: body,
        }),
      );
    }

    await updateWhatsappOnboardingRecords({
      models,
      decodedPayload,
      whatsappConfig,
      whatsappOnboarding,
    });

    await enableAgencyConfigForWhatsApp({ models, whatsappConfig, log });

    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    Sentry.captureException(err);
    log.error({
      error: err,
      error_string: String(err),
    });
    await channel.nack(data, false, false);
  }
};
