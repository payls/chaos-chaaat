const config = require('../../configs/config')(process.env.NODE_ENV);
const h = require('../../helpers');

module.exports.makeGoogleAuthController = () => {
  const googleAuthController = {};

  /**
   * Verify google signin payload with Google's API
   * @param {object} social_payload
   * @returns {Promise<void>}
   */
  googleAuthController.verifyPayload = async (social_payload) => {
    const funcName = 'googleAuthController.verifyPayload';
    h.validation.requiredParams(funcName, { social_payload });
    h.validation.isObjectOrArray(funcName, { social_payload });
    const {
      token_id,
      email: original_email,
      verified_email,
    } = h.user.parseGoogleSigninPayload(social_payload);
    if (h.isEmpty(original_email) || !h.cmpBool(verified_email, true))
      throw new Error(
        `${funcName}: original email '${original_email}' not verified'`,
      );
  };

  return googleAuthController;
};
