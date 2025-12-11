async function getAgencyOauth({ models, agency_id, source, log }) {
  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id,
      status: 'active',
      source: source,
    },
  });

  if (!agencyOauth) {
    log.warn({
      message: 'No Agency Oauth found'
    })
    throw new Error('No Agency Oauth Error');
  }

  agencyOauth =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  return agencyOauth;
}

async function processAttendees({ models, agency, contactBookingDetails }) {
  const attendees = [];

  if (contactBookingDetails.email) {
    attendees.push({
      email: contactBookingDetails.email
    });
  }

  return attendees;
}

async function processOutlookAtendees({ models, agency, contactBookingDetails }) {
  const attendees = [];

  if (contactBookingDetails.email) {
    attendees.push({
      emailAddress: {
          address: contactBookingDetails.email
      },
      type: "required"
    });
  }

  return attendees;
}

/**
 * parseJson - converts a string to json object but returns null if invalid
 * @param {string} jsonString 
 * @returns {object | null}
 */
function parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    // ignore error
    return null;
  }
}

/**
 * parseFlowToken - from flowToken, it converts the items to object
 * notation: fieldA:valueA|fieldB:valueB -> {"fieldA": "valueA", "fieldB": "valueB"}
 * @param {{
 *  flowToken: string,
 *  opts: object
 * }} bookingData 
 * @returns {object}
 */
function parseFlowToken(flowToken, { log }) {
  try {
    const fieldValues = flowToken.split('|');
    return fieldValues.reduce((pv, cv) => {
      const [field, value] = cv.split(':');
      if (field.trim() !== '' && value.trim() !== '') pv[field] = value;

      return pv;
    }, {});
  } catch (err) {
    if (log) log.warn({
      err,
      error_string: String(err)
    });

    return null;
  }
}

/**
 * parseBookingDetails - returns booking details from the whatsapp flow message.
 * ex: screen_1_TextInput_lastname -> lastname's field and value
 * @param {object} bookingData 
 * @returns {object}
 */
function parseBookingDetails(bookingData) {
  const fields = Object.keys(bookingData)
    .filter(key => key.indexOf('screen') > -1)
    .reduce((pv, cv) => {
      const fieldNameArr = cv.split('_');
      pv[fieldNameArr[fieldNameArr.length - 1]] = bookingData[cv];
      return pv;
    }, {});

  return fields;
}

module.exports.getAgencyOauth = getAgencyOauth;
module.exports.processAttendees = processAttendees;
module.exports.processOutlookAtendees = processOutlookAtendees;
module.exports.parseBookingDetails = parseBookingDetails;
module.exports.parseJson = parseJson;
module.exports.parseFlowToken = parseFlowToken;
