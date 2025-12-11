const config = require('../../configs/config')(process.env.NODE_ENV);
const h = require('../../helpers');
const axios = require('axios');

module.exports.makeFacebookAuthController = () => {
  const facebookAuthController = {};

  /**
   * Generate facebook app access token using app ID and app secret
   * @returns {Promise<string>}
   */
  facebookAuthController.generateAppAccessToken = async () => {
    const axiosConfig = {
      method: 'get',
      url: `${config.facebookAuth.api.generateAccessToken}?client_id=${config.facebookAuth.appId}&client_secret=${config.facebookAuth.appSecret}&grant_type=client_credentials`,
    };
    const response = await axios(axiosConfig);
    return response.data.access_token;
  };

  /**
   * Verify facebook signin payload with Facebook's API
   * @param {object} social_payload
   * @returns {Promise<void>}
   */
  facebookAuthController.verifyPayload = async (social_payload) => {
    const funcName = 'facebookAuthController.verifyPayload';
    h.validation.requiredParams(funcName, { social_payload });
    h.validation.isObjectOrArray(funcName, { social_payload });
    const { access_token, facebook_id } =
      h.user.parseFacebookSigninPayload(social_payload);
    const app_access_token =
      await facebookAuthController.generateAppAccessToken();
    const axiosConfig = {
      method: 'get',
      url: `${config.facebookAuth.api.inspectAccessToken}?input_token=${access_token}&access_token=${app_access_token}`,
    };
    const response = await axios(axiosConfig);
    const { app_id = '', is_valid = false, user_id = '' } = response.data.data;
    if (
      h.isEmpty(app_id) ||
      h.cmpBool(is_valid, false) ||
      h.isEmpty(user_id) ||
      !h.cmpStr(app_id, config.facebookAuth.appId) ||
      !h.cmpStr(facebook_id, user_id)
    ) {
      throw new Error(
        `${funcName}: original facebook user_id '${facebook_id}' doesn't match facebook verified user_id '${user_id}'`,
      );
    }
  };

  return facebookAuthController;
};
