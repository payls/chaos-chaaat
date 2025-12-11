const { Op } = require('sequelize');
const constant = require('../constants/constant.json');
const config = require('../configs/config')(process.env.NODE_ENV);
const h = require('../helpers');

module.exports.makeAuthController = (models) => {
  const googleAuthController =
    require('./vendors/googleAuth').makeGoogleAuthController();
  const facebookAuthController =
    require('./vendors/facebookAuth').makeFacebookAuthController();
  const userController = require('./user').makeUserController(models);
  const userRoleController =
    require('./userRole').makeUserRoleController(models);
  const userSocialAuthController =
    require('./userSocialAuth').makeUserSocialAuthController(models);
  const userAccessTokenController =
    require('./userAccessToken').makeUserAccessTokenController(models);
  const userEmailVerificationController =
    require('./userEmailVerification').makeUserEmailVerificationController(
      models,
    );
  const userResetPasswordController =
    require('./userResetPassword').makeUserResetPasswordController(models);
  const authController = {};

  /**
   * Register user by email
   * @param {string} first_name
   * @param {string} last_name
   * @param {string} email
   * @param {{ buyer_type?:string, transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  authController.registerUserByEmail = async (
    first_name,
    last_name,
    email,
    { buyer_type = '', transaction } = {},
  ) => {
    const funcName = 'authController.registerUserByEmail';
    h.validation.requiredParams(funcName, { first_name, last_name, email });
    await userController.validateEmailAvailability(funcName, email, {
      transaction,
    });
    // Create user
    const userId = await userController.create(
      { first_name, last_name, email, buyer_type },
      { transaction },
    );
    // Create email verification record
    await userEmailVerificationController.create(userId, userId, {
      transaction,
    });
    // Send email verification to user
    await userEmailVerificationController.sendEmailVerification(userId, {
      transaction,
    });
    return userId;
  };

  /**
   * Register user by Google signin
   * @param {string} first_name
   * @param {string} last_name
   * @param {string} email
   * @param {object} social_payload
   * @param {{ buyer_type?:string, transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  authController.registerUserByGoogle = async (
    first_name,
    last_name,
    email,
    social_payload,
    { buyer_type = '', transaction } = {},
  ) => {
    const funcName = 'authController.registerUserByGoogle';
    h.validation.requiredParams(funcName, {
      first_name,
      last_name,
      email,
      social_payload,
    });
    await userController.validateEmailAvailability(funcName, email, {
      transaction,
    });
    const { profile_picture_url: google_profile_picture_url } =
      h.user.parseGoogleSigninPayload(social_payload);
    const profile_picture_url =
      h.file.getFilePath(constant.UPLOAD.TYPE.USER_PROFILE_IMAGE, {
        file_name: 'google_profile_picture.jpeg',
      }) || '';
    // Download google profile picture and upload to S3
    if (h.notEmpty(google_profile_picture_url))
      await h.file.downloadFileAndUploadToS3(
        google_profile_picture_url,
        profile_picture_url,
      );
    // Create user
    const user_id = await userController.create(
      { first_name, last_name, email, profile_picture_url, buyer_type },
      { transaction },
    );
    // Create user social auth record
    await userSocialAuthController.create(
      {
        user_fk: user_id,
        auth_type: constant.USER.AUTH_TYPE.GOOGLE,
        auth_data: social_payload,
        buyer_type,
      },
      { transaction },
    );
    // Login user using Google signin payload
    const { access_token } = await authController.loginUserByGoogle(
      social_payload,
      { transaction },
    );
    return access_token;
  };

  /**
   * Register user by Facebook signin
   * @param {string} first_name
   * @param {string} last_name
   * @param {string} email
   * @param {object} social_payload
   * @param {{ buyer_type?:string, transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  authController.registerUserByFacebook = async (
    first_name,
    last_name,
    email,
    social_payload,
    { buyer_type = '', transaction } = {},
  ) => {
    const funcName = 'authController.registerUserByFacebook';
    h.validation.requiredParams(funcName, {
      first_name,
      last_name,
      email,
      social_payload,
    });
    await userController.validateEmailAvailability(funcName, email, {
      transaction,
    });
    const { profile_picture_url: facebook_profile_picture_url } =
      h.user.parseFacebookSigninPayload(social_payload);
    const profile_picture_url =
      h.file.getFilePath(constant.UPLOAD.TYPE.USER_PROFILE_IMAGE, {
        file_name: 'facebook_profile_picture.jpeg',
      }) || '';
    // Download facebook profile picture and upload to S3
    if (h.notEmpty(facebook_profile_picture_url))
      await h.file.downloadFileAndUploadToS3(
        facebook_profile_picture_url,
        profile_picture_url,
      );
    // Create user
    const user_id = await userController.create(
      { first_name, last_name, email, profile_picture_url, buyer_type },
      { transaction },
    );
    // Create user social auth record
    await userSocialAuthController.create(
      {
        user_fk: user_id,
        auth_type: constant.USER.AUTH_TYPE.FACEBOOK,
        auth_data: social_payload,
        buyer_type,
      },
      { transaction },
    );
    // Login user using Facebook signin payload
    const { access_token } = await authController.loginUserByFacebook(
      social_payload,
      { transaction },
    );
    return access_token;
  };

  /**
   * Login user by email
   * @param email
   * @param password
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<{access_token: string, user_id: string}>}
   */
  authController.loginUserByEmail = async (
    email,
    password,
    { transaction } = {},
  ) => {
    const funcName = 'authController.loginUserByEmail';
    h.validation.requiredParams(funcName, { email, password });
    const user = await userController.findOne({ email }, { transaction });
    if (h.isEmpty(user))
      throw new Error(`${funcName}: user does not exist with email '${email}'`);
    // Verify if user entered password matches email and password stored in database
    await userController.verifyUserPassword(email, password, { transaction });
    const { access_token } = await loginUser(user.user_id, { transaction });
    return { user_id: user.user_id, access_token };
  };

  /**
   * Login user by Google signin
   * @param {object} social_payload
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<{access_token: string, user_id: string}>}
   */
  authController.loginUserByGoogle = async (
    social_payload,
    { transaction } = {},
  ) => {
    const funcName = 'authController.loginUserByGoogle';
    h.validation.requiredParams(funcName, { social_payload });
    h.validation.isObjectOrArray(funcName, { social_payload });
    const { email } = h.user.parseGoogleSigninPayload(social_payload);
    // Verify google signin payload to make sure that it hasn't been tampered
    await googleAuthController.verifyPayload(social_payload);
    const user = await userController.findOne({ email }, { transaction });
    if (h.isEmpty(user))
      throw new Error(`${funcName}: user does not exist with email '${email}'`);
    const user_social_auth = await userSocialAuthController.findOne(
      { user_fk: user.user_id, auth_type: constant.USER.AUTH_TYPE.GOOGLE },
      { transaction },
    );
    if (h.isEmpty(user_social_auth))
      throw new Error(
        `${funcName}: email '${email}' did not have an account with Pave via ${constant.USER.AUTH_TYPE.GOOGLE}`,
      );
    // Update user's profile picture with the latest from their Google profile
    // await userController.update(user.user_id, { profile_picture_url }, { transaction });
    const { access_token } = await loginUser(user.user_id, { transaction });
    return { user_id: user.user_id, access_token };
  };

  /**
   * Login user by Facebook signin
   * @param {object} social_payload
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<{access_token: string, user_id: string}>}
   */
  authController.loginUserByFacebook = async (
    social_payload,
    { transaction } = {},
  ) => {
    const funcName = 'authController.loginUserByFacebook';
    h.validation.requiredParams(funcName, { social_payload });
    h.validation.isObjectOrArray(funcName, { social_payload });
    const { email } = h.user.parseFacebookSigninPayload(social_payload);
    // Verify facebook signin payload to make sure that it hasn't been tampered
    await facebookAuthController.verifyPayload(social_payload);
    const user = await userController.findOne({ email }, { transaction });
    if (h.isEmpty(user))
      throw new Error(`${funcName}: user does not exist with email '${email}'`);
    const user_social_auth = await userSocialAuthController.findOne(
      { user_fk: user.user_id, auth_type: constant.USER.AUTH_TYPE.FACEBOOK },
      { transaction },
    );
    if (h.isEmpty(user_social_auth))
      throw new Error(
        `${funcName}: email '${email}' did not have an account with Pave via ${constant.USER.AUTH_TYPE.FACEBOOK}`,
      );
    // Update user's profile picture with the latest from their Google profile
    // await userController.update(user.user_id, { profile_picture_url }, { transaction });
    const { access_token } = await loginUser(user.user_id, { transaction });
    return { user_id: user.user_id, access_token };
  };

  /**
   * Login user by user ID
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<{access_token: string, user_id: string}>}
   */
  authController.loginUserByUserId = async (user_id, { transaction } = {}) => {
    const funcName = 'authController.loginUserByUserId';
    h.validation.requiredParams(funcName, { user_id });
    const { access_token } = await loginUser(user_id, { transaction });
    return { user_id, access_token };
  };

  /**
   * Signout user by updating status of user access token to "signout"
   * @param {string} access_token
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  authController.logout = async (access_token, { transaction } = {}) => {
    const funcName = 'authController.logout';
    h.validation.requiredParams(funcName, { access_token });
    const userAccessToken = await userAccessTokenController.findOne(
      {
        access_token,
        status: constant.USER.ACCESS_TOKEN.STATUS.ACTIVE,
        type: constant.USER.ACCESS_TOKEN.TYPE.SESSION,
      },
      { transaction },
    );
    if (h.isEmpty(userAccessToken))
      throw new Error(`${funcName}: access token not found`);
    const user_access_token_id = await userAccessTokenController.update(
      userAccessToken.user_access_token_id,
      {
        status: constant.USER.ACCESS_TOKEN.STATUS.SIGNOUT,
      },
      { transaction },
    );
    if (h.isEmpty(user_access_token_id))
      throw new Error(
        `${funcName}: failed to signout uesr access token by id '${userAccessToken.user_access_token_id}'`,
      );
  };

  /**
   * Check if session access token is still valid
   * @param {string} access_token
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  authController.verifySessionToken = async (
    access_token,
    { transaction } = {},
  ) => {
    const funcName = 'loginController.verifySessionToken';
    h.validation.requiredParams(funcName, { access_token });
    const userAccessToken = await userAccessTokenController.findOne(
      {
        access_token,
        status: constant.USER.ACCESS_TOKEN.STATUS.ACTIVE,
        type: constant.USER.ACCESS_TOKEN.TYPE.SESSION,
      },
      { transaction },
    );
    if (h.isEmpty(userAccessToken))
      throw new Error(`${funcName}: access token not found`);
    // Check if user is active
    if (
      !(await userController.isUserActive(userAccessToken.user_fk, {
        transaction,
      }))
    )
      throw new Error(
        `${funcName}: user '${userAccessToken.user_fk}' is not active`,
      );
    // Update current access token to refreshed
    await userAccessTokenController.update(
      userAccessToken.user_access_token_id,
      {
        status: constant.USER.ACCESS_TOKEN.STATUS.REFRESHED,
      },
      { transaction },
    );
    // Generate new access token for session
    const new_access_token =
      await userAccessTokenController.generateAccessToken(
        userAccessToken.user_fk,
        { transaction },
      );
    // Store access token in database
    await userAccessTokenController.create(
      {
        user_fk: userAccessToken.user_fk,
        access_token: new_access_token,
        type: constant.USER.ACCESS_TOKEN.TYPE.SESSION,
        status: constant.USER.ACCESS_TOKEN.STATUS.ACTIVE,
        created_by: userAccessToken.user_fk,
      },
      { transaction },
    );
    return new_access_token;
  };

  /**
   * Check whether user has access to Staff Portal
   * @param {string} user_id
   * @returns {Promise<boolean>}
   */
  authController.hasAccessToStaffPortal = async (user_id) => {
    const funcName = 'authController.hasAccessToStaffPortal';
    h.validation.requiredParams(funcName, { user_id });
    const userRoleRecord = await userRoleController.findOne({
      [Op.or]: [
        { user_fk: user_id, user_role: constant.USER.ROLE.STAFF_ADMIN },
        { user_fk: user_id, user_role: constant.USER.ROLE.STAFF_AGENT },
        { user_fk: user_id, user_role: constant.USER.ROLE.AGENCY_ADMIN },
        { user_fk: user_id, user_role: constant.USER.ROLE.AGENCY_MARKETING },
        { user_fk: user_id, user_role: constant.USER.ROLE.AGENCY_SALES },
      ],
    });
    if (h.isEmpty(userRoleRecord)) return false;
    else return true;
  };

  /**
   * User forgot password
   * @param {string} email
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  authController.forgotPassword = async (email, { transaction } = {}) => {
    const funcName = 'authController.forgotPassword';
    h.validation.requiredParams(funcName, { email });
    const user = await userController.findOne({ email }, { transaction });
    if (h.isEmpty(user))
      throw new Error(`${funcName}: user '${email}' does not exist`);
    const authType = await userController.getUserAuthType(user.user_id, {
      transaction,
    });
    // Email and password only user account
    if (h.cmpStr(authType, constant.USER.AUTH_TYPE.EMAIL)) {
      // Get all existing active reset password records for user and update status to expired
      const userResetPasswords = await userResetPasswordController.findAll(
        {
          user_fk: user.user_id,
          status: constant.USER.RESET_PASSWORD.STATUS.ACTIVE,
        },
        { transaction },
      );
      if (h.notEmpty(userResetPasswords) && userResetPasswords.length > 0) {
        for (let i = 0; i < userResetPasswords.length; i++) {
          const userResetPassword = userResetPasswords[i];
          await userResetPasswordController.update(
            userResetPassword.user_reset_password_id,
            { status: constant.USER.RESET_PASSWORD.STATUS.EXPIRED },
          );
        }
      }
      await userResetPasswordController.create(user.user_id, user.user_id, {
        transaction,
      });
      await userResetPasswordController.sendResetPasswordEmail(user.user_id, {
        transaction,
      });
    }
    // Non-email and password only user accounts
    else {
      await h.email.sendEmail(
        `Chaaat Team <registrations@${
          config?.email?.domain || 'yourpave.com'
        }>`,
        user.email,
        h.getMessageByCode('template-resetPassword-subject-1613818392997'),
        h.getMessageByCode('template-resetPassword-body-1613818392997', {
          FIRST_NAME: user.first_name,
          LOGIN_URL: `${config.webUrl}/login`,
        }),
      );
    }
  };

  /**
   * User reset password
   * @param {string} token
   * @param {string} new_password
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  authController.confirmForgotPassword = async (
    token,
    new_password,
    { transaction } = {},
  ) => {
    const funcName = 'authController.confirmForgotPassword';
    h.validation.requiredParams(funcName, { token, new_password });
    const userResetPassword = await userResetPasswordController.findOne(
      { token, status: constant.USER.RESET_PASSWORD.STATUS.ACTIVE },
      { transaction },
    );
    if (h.isEmpty(userResetPassword))
      throw new Error(
        `${funcName}: user account not found by reset password token '${token}'`,
      );
    await userResetPasswordController.verify(token, { transaction });
    await userController.updatePassword(
      userResetPassword.user_fk,
      new_password,
      undefined,
      { transaction },
    );
    await userResetPasswordController.sendPasswordChangedEmail(
      userResetPassword.user_fk,
      { transaction },
    );
  };

  /**
   * Generic function that handles user login
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<{access_token: string, user_access_token_id: string}>}
   */
  async function loginUser(user_id, { transaction } = {}) {
    const funcName = 'authController.loginUser';
    h.validation.requiredParams(funcName, { user_id });
    const user = await userController.findOne({ user_id }, { transaction });
    if (h.isEmpty(user))
      throw new Error(`${funcName}: user '${user_id}' does not exist`);
    const access_token = await userAccessTokenController.generateAccessToken(
      user_id,
      { transaction },
    );
    const user_access_token_id = await userAccessTokenController.create(
      {
        user_fk: user_id,
        access_token,
        status: constant.USER.ACCESS_TOKEN.STATUS.ACTIVE,
        type: constant.USER.ACCESS_TOKEN.TYPE.SESSION,
      },
      { transaction },
    );
    return { user_access_token_id, access_token };
  }

  return authController;
};
