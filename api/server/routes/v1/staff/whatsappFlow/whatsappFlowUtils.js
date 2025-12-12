
const c = require('../../../../controllers');
const models = require('../../../../models');
const h = require('../../../../helpers');
const config = require('../../../../../server/configs/config')(process.env.NODE_ENV);

/**
 * getEndpointUrl
 * @param {{
 *  crm_type: string,
 *  agency_id: string,
 *  deateofday_ms: int,
 *  timezone: string,
 *  crm_settings_id: string
 * }} param0 
 * @returns {string}
 */
function getEndpointUrl({
  crm_type = 'GCALENDAR',
  agency_id,
  dateofday_ms,
  timezone = 'Asia/Manila',
  crm_settings_id
}) {
  const crmType = crm_type.toUpperCase();

  switch (crmType) {
    case 'OUTLOOKCALENDAR':
      return `${config.apiUrl}/v1/calendar/outlookcalendar/${agency_id}/${crm_settings_id}/available-timeslot?dateofday_ms=${dateofday_ms}&duration_in_minutes=30&start_time=true`
    case 'GCALENDAR':
    default:
      return `${config.apiUrl}/v1/calendar/googlecalendar/${agency_id}/${crm_settings_id}/available-timeslot?dateofday_ms=${dateofday_ms}&duration_in_minutes=30&start_time=true`
  }
}

/**
 * parseJson
 * @param {string} JsonVal 
 * @param {{
 *  info: Function,
 *  debug: Function,
 *  warn: Function,
 *  error: Function,
 * }} log 
 * @returns {object}
 */
function parseJson(JsonVal, log) {
  let json;
  try {
    if (typeof JsonVal === 'string') {
      json = JSON.parse(JsonVal);
      return json;
    }

    json = JsonVal;
  } catch (err) {
    log.warn({
      message: 'Invalid JSON String - skipping',
      error: err,
      errorString: String(err)
    });
    json = JsonVal;
  }

  return json;
}

/**
 * getWabaBufferedCredentials
 * @param {string} waba_id 
 * @returns {Promise<{
 *  agency_id: string,
 *  access_token: string,
 *  agencyBufferedTemplateCredentials: string
 * }>}
 */
async function getWabaBufferedCredentials(waba_id) {
  const waba = await c.agencyWhatsAppConfig.findOne({
    agency_whatsapp_config_id: waba_id
  });

  const agency_id = waba?.agency_fk;

  const credentials = h.notEmpty(waba?.agency_waba_id)
    ? waba?.agency_waba_template_token +
    ':' +
    waba?.agency_waba_template_secret
    : null;

  const access_token = waba?.agency_waba_id;

  if (!access_token || !credentials) {
    return null;
  }

  const agencyBufferedTemplateCredentials = Buffer.from(
    credentials,
    'utf8',
  ).toString('base64');

  const waba_number = waba?.waba_number;

  return {
    waba_number,
    agency_id,
    access_token,
    agencyBufferedTemplateCredentials,
  };
}

/**
 * 
 * @param {string} user_id 
 * @param {string} agency_id 
 * @returns {Promise<{
 *  agency_user_id: string,
 * 	agency_fk: string,
 * 	user_fk: string,
 *  title?: string
 * 	description?: string,
 *  year_started?: number,
 *  website?: string,
 *  instagram?: string,
 *  linkedin?: string,
 *  facebook?: string,
 *  youtube?: string,
 *	created_by: string
 * }>}
 */ 
async function getAgencyUser(user_id, agency_id) {
  return await c.agencyUser.findOne(
    { user_fk: user_id },
    {
      include: [
        {
          model: models.agency,
          where: {
            agency_id
          },
          required: true,
        },
      ],
    },
  );
}

module.exports.getEndpointUrl = getEndpointUrl;
module.exports.parseJson = parseJson;
module.exports.getWabaBufferedCredentials = getWabaBufferedCredentials;
module.exports.getAgencyUser = getAgencyUser;
