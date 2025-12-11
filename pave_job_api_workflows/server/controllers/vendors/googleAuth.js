const config = require('../../configs/config')(process.env.NODE_ENV);
const h = require('../../helpers');
const { OAuth2Client } = require('google-auth-library');

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
    const { token_id, email: original_email } =
      h.user.parseGoogleSigninPayload(social_payload);
    const client = new OAuth2Client(config.googleAuth.client_id);
    const ticket = await client.verifyIdToken({
      idToken: token_id,
      audience: config.googleAuth.client_id,
    });
    const payload = ticket.getPayload();
    const google_verified_email = payload.email;
    if (
      h.isEmpty(original_email) ||
      h.isEmpty(google_verified_email) ||
      !h.cmpStr(original_email, google_verified_email)
    )
      throw new Error(
        `${funcName}: original email '${original_email}' doesn't match google verified email '${google_verified_email}'`,
      );
  };

  return googleAuthController;
};
