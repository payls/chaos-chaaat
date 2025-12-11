const Sentry = require('@sentry/node');
const { DateTime } = require('luxon');
const OutlookCalendarHelper = require('../../../helpers/outlookcalendar');
const calendarUtils = require('./calendarUtils');

const crypto = require('crypto');

const decryptRequest = (body, encryptionKeys, log) => {
  const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;
  const { PRIVATE_KEY_PEM, PRIVATE_KEY_PASSPHRASE } = encryptionKeys

  const privateKey = createPrivateKey(PRIVATE_KEY_PEM, PRIVATE_KEY_PASSPHRASE);
  const decryptedAesKey = decryptAesKey(encrypted_aes_key, privateKey, log);

  return decryptFlowData(encrypted_flow_data, initial_vector, decryptedAesKey);
};

/**
 * Creates a private key from a base64-encoded key string and passphrase.
 * @param {string} encodedKey - The base64-encoded private key.
 * @param {string} passphrase - The passphrase for the private key.
 * @returns {crypto.KeyObject} - The generated private key.
 */
const createPrivateKey = (encodedKey, passphrase) => {
  const decodedKey = Buffer.from(encodedKey, 'base64').toString('utf-8');
  return crypto.createPrivateKey({ key: decodedKey, passphrase });
};

/**
 * Decrypts an AES key using the provided private key.
 * @param {string} encryptedKey - The AES key encrypted in base64 format.
 * @param {crypto.KeyObject} privateKey - The private key for decryption.
 * @param {object} log server log
 * @returns {Buffer} - The decrypted AES key.
 * @throws {calendarUtils.FlowEndpointException} - If decryption fails.
 */
const decryptAesKey = (encryptedKey, privateKey, log) => {
  try {
    return crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedKey, 'base64')
    );
  } catch (error) {
    log.error({
      function: "decryptAesKey",
      message: "AES key decryption error",
      err: error
    });
    throw new calendarUtils.FlowEndpointException(
      421,
      'Failed to decrypt the request. Please verify your private key.'
    );
  }  
};

/**
 * Decrypts the flow data using the provided AES key and initial vector.
 * @param {string} encryptedData - The encrypted flow data in base64 format.
 * @param {string} initialVector - The initial vector for AES decryption in base64 format.
 * @param {Buffer} aesKey - The decrypted AES key.
 * @returns {object} - The decrypted JSON body content, AES key buffer, and initial vector buffer.
 */
const decryptFlowData = (encryptedData, initialVector, aesKey) => {
  const flowDataBuffer = Buffer.from(encryptedData, 'base64');
  const initialVectorBuffer = Buffer.from(initialVector, 'base64');

  const TAG_LENGTH = 16;
  const encryptedBody = flowDataBuffer.subarray(0, -TAG_LENGTH);
  const authTag = flowDataBuffer.subarray(-TAG_LENGTH);

  const decipher = crypto.createDecipheriv('aes-128-gcm', aesKey, initialVectorBuffer);
  decipher.setAuthTag(authTag);

  const decryptedJSONString = Buffer.concat([decipher.update(encryptedBody), decipher.final()]).toString('utf-8');

  return {
    decryptedBody: JSON.parse(decryptedJSONString),
    aesKeyBuffer: aesKey,
    initialVectorBuffer,
  };
};

/**
 * Encrypts the server's response to the client with AES encryption, using a modified initialization vector.
 * @param {object} response - The response data to encrypt.
 * @param {Buffer} aesKeyBuffer - Buffer of the AES key for encryption.
 * @param {Buffer} initialVectorBuffer - Initial vector buffer for encryption.
 * @returns {string} - Base64 encoded encrypted response.
 */
const encryptResponse = (
  response,
  aesKeyBuffer,
  initialVectorBuffer
) => {
  // flip initial vector
  const flipped_iv = [];
  for (const pair of initialVectorBuffer.entries()) {
    flipped_iv.push(~pair[1]);
  }

  // encrypt response data
  const cipher = crypto.createCipheriv(
    "aes-128-gcm",
    aesKeyBuffer,
    Buffer.from(flipped_iv)
  );
  return Buffer.concat([
    cipher.update(JSON.stringify(response), "utf-8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]).toString("base64");
};

/**
 * Constructs user details from the given data.
 * @param {object} data - Data containing user information such as 
 * full_name, company_name, number, country_code, phone, email, notes
 * @returns {string} - Formatted string of user details.
 */
function getUserDetails (data) {
  let msg = '';
  if (data.full_name) {
    msg += `Name: ${data.full_name}\n`
  }
  if (data.company_name) {
    msg += `Company name: ${data.company_name}\n`
  }
  if (data.number) {
    msg += `Your guess: ${data.number}\n`
  }
  if (data.phone) {
    msg += data?.country_code
      ? `Phone: ${data.country_code}${data.phone}\n`
      : `Phone: ${data.phone}\n`;
  }
  if (data.email) {
    msg += `Email: ${data.email}\n`
  }
  if (data.notes) {
    msg += `Notes: ${data.notes}\n`
  }
  return msg;
}

/**
 * Constructs summary details for the given data.
 * @param {object} data - Data containing date, select_time and duration information.
 * @returns {string} - Formatted string of summary details.
 */
function getSummaryDetails (data) {
  let msg = '';
  if (data.date) {
    const date = new Date(parseInt(data.date));
    msg += `Date: ${date.toString()}\n`
  }

  if (data.select_time) {
    msg +=  `Time: ${data.select_time}\n`
  }
  return msg;
}

/**
 * getAvailableTimeSlots - handler main function get's crm config for outlook to
 * identify the availability settings then call to outlook calendar api to check busy slots
 * using those information, creates a list of slots based on duration in minutes
 * @param {{
 *  dayInMilliseconds: number,
 *  durationInMinutes: number,
 *  timeZone: string,
 *  outlookCalendar: OutlookCalendarHelper,
 *  start_time: boolean,
 *  crmSetting: object,
 *  log: FastifyLog,
 * }} param0 
 * @returns {
 *  Array<{start: string, end: string}> | Array<string>
 * }
 */
async function getAvailableTimeSlots({ dayInMilliseconds, durationInMinutes, timeZone: tz, outlookCalendar, start_time, crmSetting, log }) {
  const crmTimeslotSettings = calendarUtils.getCrmSettingTimeslotSettings(crmSetting);
  const date = new Date(dayInMilliseconds);
  const timeZone = crmTimeslotSettings?.timeZone?.value || tz;

  const now = DateTime.fromJSDate(date).setZone(timeZone);
  const startOfDay = now.startOf('day').toISO();
  const endOfDay = now.endOf('day').toISO();
  const dayOfWeek = now.toFormat('ccc').toUpperCase();

  const data = await outlookCalendar.freeBusy({
    startOfDay,
    endOfDay,
    timeZone,
  });

  log.info({ 'Freebusy result:': data });

  const outlookBusyTimes = data.value[0].scheduleItems;
  const busyTimes = outlookBusyTimes.map(busyTime => {
    const start = DateTime.fromISO(busyTime.start.dateTime);
    const end = DateTime.fromISO(busyTime.end.dateTime);
    return {
      start: start.setZone(timeZone).toISO(),
      end: end.setZone(timeZone).toISO()
    }
  })

  let availableSlots = calendarUtils.getAvailableTimeSlotsPerDay({
    timeSlots: crmTimeslotSettings?.timeSlots,
    dayOfWeek
  });
  availableSlots = availableSlots.map((slot) => {
    const startTime = now.set({ hour: Math.floor(slot.startTime / 60), minute: 540 % 60 }); // Set time based on minutes
    const endTime = now.set({ hour: Math.floor(slot.endTime / 60), minute: 1020 % 60 });
    return { startTime, endTime };
  });

  const availableTimeSlots = calendarUtils.getAvailableTimes({
    busyTimes,
    availableSlots,
  });

  // Check for available slot after the last busy period
  let chunkedSlots = calendarUtils.splitTimeSlotsIntoChunks(availableTimeSlots, durationInMinutes, timeZone);

  if (start_time) {
    chunkedSlots = chunkedSlots.map(slot => slot.start);
  }

  return chunkedSlots;
}

/**
 * _handleErrorResponse
 * @param {{
*  req: FastifyRequest,
*  res: FastifyResponse,
*  err: object
* }} param0 
* @returns 
*/
function _handleErrorResponse({ req, res, err }) {
  req.log.error({
    error: err,
    error_string: String(err)
  });
  Sentry.captureException(err);
  return res.status(500).send({
    message: 'An error occured. Please try again'
  });
}

/**
 * Processes a "ping" action to verify the status of the WhatsApp flow.
 * @param {FastifyRequest} req - Fastify request object.
 * @param {FastifyResponse} res - Fastify response object.
 * @param {object} decryptedRequest - Decrypted request object containing AES key and initialization vector.
 * @returns
 */
async function processPing(req, res, decryptedRequest) {
  try {
    const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
    const { screen, data, version, action, flow_token } = decryptedBody;

    const apiRes = {
      version,
      data: {
        status: 'active',
      },
    };

    return res.status(200)
      .type('text/plain')
      .send(encryptResponse(apiRes, aesKeyBuffer, initialVectorBuffer));
  } catch (err) {
    _handleErrorResponse({ req, res, err });
  }
}

/**
 * Processes the data exchange request in the WhatsApp flow, retrieving calendar details and availability.
 * @param {FastifyRequest} req - Fastify request object.
 * @param {FastifyResponse} res - Fastify response object.
 * @param {object} decryptedRequest - Decrypted request object containing AES key and initialization vector.
 * @returns
 */
async function processDataExchange (req, res, decryptedRequest) {
  const { ek: encryptionKeys } = req.ek;
  const agency_id = req.params.agency_id;
  const crm_settings_id = req.params.crm_settings_id;
  const {
    dateofday_ms,
    timezone,
    duration_in_minutes,
    start_time
  } = req.query;
  const {
    encryption_iv,
    encryption_key,
  } = encryptionKeys;
  let { agencyOauth, crmSetting } = await calendarUtils.getAgencyCalendarDetails({
    agency_id,
    crm_settings_id,
    source: 'OUTLOOKCALENDAR',
  });
  if (!agencyOauth) {
    req.log.warn({
      message: 'No Agency Oauth found'
    });
    res.status = 401;
    return {
      message: 'Invalid Agency ID'
    }
  }

  const outlookCalendar = new OutlookCalendarHelper({
    encryption_iv,
    encryption_key,
    agencyOauth,
    secrets: encryptionKeys
  });

  try {
    const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
    const { screen, data, version, action, flow_token } = decryptedBody;
    
    const dataDuration = [
      {
        id: "30",
        title: "30 Minutes"
      },
      {
        id: "60",
        title: "60 Minutes"
      }
    ];

    let apiRes = { ...decryptedBody };

    if (data.trigger === 'duration_selected' || data.trigger === 'select_time_selected') {
      const dayInMilliseconds = parseInt(data.dateofday); //1723996800000
      const durationInMinutes = parseInt(data.duration);
      let slots = await getAvailableTimeSlots({
        dayInMilliseconds,
        durationInMinutes,
        timeZone: timezone,
        outlookCalendar,
        start_time: false,
        log: req.log.child({ sub_process: 'get_available_time_slots' }),
        crmSetting,
      });

      apiRes = {
        ...decryptedBody,
        data: {
          ...data,
          duration: dataDuration,
          select_time: slots.map((s) => ({ id: `${s.start} - ${s.end}`, title: `${s.start} - ${s.end}` })),
        }
      }
    } else {
      switch (screen) {
        case 'STEP_one':
          const dayInMilliseconds = parseInt(dateofday_ms);
          const durationInMinutes = parseInt(duration_in_minutes) || 30;
          let slots = await getAvailableTimeSlots({
            dayInMilliseconds,
            durationInMinutes,
            timeZone: timezone,
            outlookCalendar,
            start_time: false,
            log: req.log.child({ sub_process: 'get_available_time_slots' }),
            crmSetting,
          });
          apiRes = {
            ...decryptedBody,
            screen: 'STEP_two',
            data: {
              ...data,
              duration: dataDuration,
              select_time: slots.map((s) => ({ id: `${s.start} - ${s.end}`, title: `${s.start} - ${s.end}` })),
            }
          };
          break;
        case 'STEP_two':
          apiRes = {
            ...decryptedBody,
            screen: 'STEP_three',
            data: {
              ...data,
            }
          }
          break;
        case 'STEP_three':
          apiRes = {
            ...decryptedBody,
            screen: 'STEP_four',
            data: {
              ...data,
            }
          }
          break;
        default:
      }
    }

    // adding summary info
    const summary_details = getSummaryDetails(data);
    const user_details = getUserDetails(data);
    apiRes = {
      ...apiRes,
      data: {
        ...apiRes.data,
        summary_details,
        user_details,
      }
    }
    
    res.status(200)
      .type('text/plain')
      .send(encryptResponse(apiRes, aesKeyBuffer, initialVectorBuffer))
  } catch (err) {
    _handleErrorResponse({ req, res, err });
  }
}

/**
 * GET /calendar/outlookcalendar/:agency_id/:crm_settings_id/available-timeslot handler
 * response back the list of available slots based on a given dateo
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function handler(req, res) {
  const { ek: encryptionKeys } = req.ek;
  const decryptedRequest = decryptRequest(req.body, encryptionKeys, req.log);
  const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
  const { screen, data, version, action, flow_token } = decryptedBody;

  if (action === 'ping') {
    return processPing(req, res, decryptedRequest);
  }

  if (action === 'data_exchange') {
    return processDataExchange(req, res, decryptedRequest);
  }
}

const schema = {
  params: {
    agency_id: { type: 'string', format: 'uuid' }
  },
  query: {
    dateofday_ms: { type: 'string' },
    dateofday: { type: 'string' },
    timezone: { type: 'string', default: 'Asia/Hong_Kong' },
    duration_in_minutes: { type: 'string', default: '30' },
    start_time: { type: 'boolean' }
  }
};
module.exports.handler = handler;
module.exports.schema = schema;
