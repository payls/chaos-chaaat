const config = require("../configs/config")(process.env.NODE_ENV);
const axios = require("axios");

const wixHelper = {};

/**
 * Fetches an access token from the Wix API using client credentials.
 *
 * @param {object} params Parameters for the function.
 * @param {string} params.instanceId instance id.
 * @param {object} log Logging utility for capturing logs.
 * @returns {object} An object containing a success flag and the access token (if successful).
 */
wixHelper.getWixAccessToken = async ({ instanceId, log }) => {
  try {
    const url = "https://www.wixapis.com/oauth2/token";
    const data = {
      grant_type: "client_credentials",
      client_id: config.wix.appId,
      client_secret: config.wix.clientSecret,
      instance_id: instanceId,
    };

    const response = await axios.post(url, data);
    if (response && response.status === 200) {
      return { success: true, access_token: response.data.access_token };
    }
    return { success: false };
  } catch (error) {
    log.error({
      message: "FAILED TO GET WIX ACCESS TOKEN",
      function: "getWixAccessToken",
      stringifiedErr: JSON.stringify(error),
      errorMessage: error?.response?.data,
    });
    return { success: false };
  }
};

/**
 * Retrieves contact information from the Wix API.
 *
 * @param {object} params Parameters for the function.
 * @param {string} params.contactId ID of the contact to fetch (wix contact id).
 * @param {string} params.accessToken Access token for authentication with the Wix API.
 * @param {object} log Logging utility for capturing logs.
 * @returns {object} An object containing a success flag and the contact data (if successful).
 */
wixHelper.getWixContact = async ({ contactId, accessToken, log }) => {
  try {
    const url = `https://www.wixapis.com/contacts/v4/contacts/${contactId}`;
    const headers = {
      Authorization: accessToken,
    };

    const response = await axios.get(url, { headers });
    if (response && response.status === 200) {
      return { success: true, contact: response.data.contact };
    }
    return { success: false };
  } catch (error) {
    log.error({
      message: "FAILED TO GET WIX CONTACT INFO",
      function: "getWixContact",
      stringifiedErr: JSON.stringify(error),
      errorMessage: error?.response?.data,
    });
    return { success: false };
  }
};

/**
 * Cancels an order in Wix through the Wix API.
 *
 * @param {object} params Parameters for the function.
 * @param {string} params.accessToken Access token for authentication with the Wix API.
 * @param {string} params.orderId ID of the order to cancel.
 * @param {object} log Logging utility for capturing logs.
 * @returns {object} An object containing a success flag indicating if the cancellation was successful.
 */
wixHelper.cancelWixOrder = async ({ accessToken, orderId, log }) => {
  try {
    const url = `https://www.wixapis.com/pricing-plans/v2/orders/${orderId}/cancel`;

    const headers = {
      Authorization: accessToken,
    };

    const body = {
      effectiveAt: "IMMEDIATELY",
    };

    const response = await axios.post(url, body, { headers });
    if (response && response.status === 200) {
      log.info({ message: "ORDER CANCEL SUCCESSFULLY" });
      return { success: true };
    }
    throw Error("FAILED TO CANCEL WIX ORDER");
  } catch (error) {
    log.error({
      message: "FAILED TO CANCEL WIX ORDER",
      function: "cacelWixOrder",
      stringifiedErr: JSON.stringify(error),
      errorMessage: error?.response?.data,
    });
    return { success: false };
  }
};

/**
 * Update contact in Wix through the Wix API.
 *
 * @param {object} contactId id of the contact to update.
 * @param {string} body contact data.
 * @param {string} accessToken Access token for authentication with the Wix API.
 * @param {object} log Logging utility for capturing logs.
 * @returns {object} An object containing a success flag indicating if the updation was successful.
 */
wixHelper.updateWixContact = async ({ contactId, body, accessToken, log }) => {
  try {
    log.info({ body, function: "updateWixContact" });

    const url = `https://www.wixapis.com/contacts/v4/contacts/${contactId}`;

    const headers = {
      Authorization: accessToken,
    };

    const response = await axios.patch(url, body, { headers });
    if (response && response.status === 200) {
      log.info({ message: "UPDATE CONTACT INTO WIX SUCCESSFULLY" });
      return { success: true };
    }
    throw Error("FAILED TO UPDATE CONTACT INTO WIX");
  } catch (error) {
    log.error({
      message: "FAILED TO UPDATE WIX CONTACT",
      function: "updateWixContact",
      stringifiedErr: JSON.stringify(error),
      errorMessage: error?.response?.data,
    });
    return { success: false };
  }
};

/**
 * Update member in Wix through the Wix API.
 *
 * @param {object} contactId id of the member to update.
 * @param {string} body member data.
 * @param {string} accessToken Access token for authentication with the Wix API.
 * @param {object} log Logging utility for capturing logs.
 * @returns {object} An object containing a success flag indicating if the updation was successful.
 */
wixHelper.updateWixMember = async ({ memberId, body, accessToken, log }) => {
  try {
    log.info({ body, function: "updateWixMember" });

    const url = `https://www.wixapis.com/members/v1/members/${memberId}`;

    const headers = {
      Authorization: accessToken,
    };

    const response = await axios.patch(url, body, { headers });
    if (response && response.status === 200) {
      log.info({ message: "UPDATE MEMBER INTO WIX SUCCESSFULLY" });
      return { success: true };
    }
    throw Error("FAILED TO UPDATE CONTACT INTO WIX");
  } catch (error) {
    log.error({
      message: "FAILED TO UPDATE WIX MEMBER",
      function: "updateWixMember",
      stringifiedErr: JSON.stringify(error),
      errorMessage: error?.response?.data,
    });
    return { success: false };
  }
};

module.exports = wixHelper;
