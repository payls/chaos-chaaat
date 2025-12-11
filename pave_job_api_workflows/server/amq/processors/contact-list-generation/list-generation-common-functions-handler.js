const sequelize = require('sequelize');
const { Op } = sequelize;
const c = require('../../../controllers');
const models = require('../../../models');
const h = require('../../../helpers');

/**
 * Description
 * Function to get contact record based on given mobile number
 * @async
 * @function
 * @name getContactDetailsBasedOnMobileNumber
 * @kind function
 * @param {object} params breakdown below
 * @param {string} agency_id agency ID
 * @param {string} mobile_number contact mobile number
 * @param {object} misc miscellaneous data and functions
 * @returns {Promise<{ contact_exists: boolean; contact_record: any; }>}
 */
async function getContactDetailsBasedOnMobileNumber(params, misc) {
  const { processor_name, consumer, log } = misc;
  log.info({
    processor_name,
    consumer,
    function: 'getContactDetailsBasedOnMobileNumber',
    action: 'Get contact details using mobile number in the agency',
  });

  if (h.isEmpty(params.mobile_number)) {
    return {
      contact_exists: false,
      contact_record: null,
    };
  }

  const contact_record = await models.contact.findOne({
    where: {
      [Op.and]: [
        sequelize.literal("REPLACE(mobile_number, ' ', '')"),
        sequelize.literal("REPLACE(mobile_number, '-', '')"),
        sequelize.literal("REPLACE(mobile_number, '+', '')"),
        sequelize.literal("REPLACE(mobile_number, '(', '')"),
        sequelize.literal("REPLACE(mobile_number, ')', '')"),
        sequelize.literal("REPLACE(mobile_number, '.', '')"),
      ],
      mobile_number: params.mobile_number,
      agency_fk: params.agency_id,
    },
  });

  return {
    contact_exists: h.notEmpty(contact_record),
    contact_record,
  };
}

/**
 * Description
 * Validate if the given owner ID is a UUID
 * @function
 * @name isValidContactOwnerID
 * @kind function
 * @param {string} contact_owner_id
 * @returns {boolean} returs boolean
 */
function isValidContactOwnerID(contact_owner_id) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(contact_owner_id);
}

/**
 * Description
 * Validates if the default contact owner still exists
 * @async
 * @function
 * @name validateDefaultContactOwner
 * @kind function
 * @param {string} agency_user_id
 * @returns {Promise} returns back the agency user id or null
 */
async function validateDefaultContactOwner(agency_user_id) {
  // check agency user record
  const agencyUser = await c.agencyUser.findOne({
    agency_user_id: agency_user_id,
  });
  if (h.isEmpty(agencyUser)) {
    return null;
  }

  // check user record
  const agencyUserRecord = await c.user.findOne({
    user_id: agencyUser?.user_fk,
  });
  if (h.isEmpty(agencyUserRecord)) {
    return null;
  }

  return agency_user_id;
}

/**
 * Description
 * Sanitize mobile number
 * @function
 * @name sanitizeMobileNumber
 * @kind function
 * @param {string} mobile
 * @returns {boolean} returs boolean
 */
function sanitizeMobileNumber(mobile) {
  const sanitizedNumber = h.notEmpty(mobile)
    ? mobile.replace(/\D/g, '')
    : mobile;
  return sanitizedNumber;
}

module.exports = {
  getContactDetailsBasedOnMobileNumber: getContactDetailsBasedOnMobileNumber,
  isValidContactOwnerID: isValidContactOwnerID,
  validateDefaultContactOwner: validateDefaultContactOwner,
  santizeMobileNumber: sanitizeMobileNumber,
};
