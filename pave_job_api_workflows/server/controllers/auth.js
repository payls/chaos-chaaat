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
   * @param {{ send_email?: boolean , buyer_type?:string, invitee?: string, transaction?:object }} [options]
   * @returns {Promise<{record: (Object|Array), created: boolean}>}
   */
  authController.registerUserByEmail = async (
    first_name,
    last_name,
    email,
    { send_email = true, buyer_type = '', invitee = '', transaction } = {},
  ) => {
    const funcName = 'authController.registerUserByEmail';
    h.validation.requiredParams(funcName, { first_name, last_name, email });

    // create or update the user record.
    const { record, created } = await userController.findOrCreate(
      { email },
      {
        first_name,
        last_name,
        email,
        buyer_type,
        status: h.notEmpty(invitee) ? constant.USER.STATUS.ACTIVE : null,
      },
      { transaction },
    );

    if (!created) {
      // if block: active/inactive user already exists but isn't invited.

      // if a user is invited, no email should be fired.
      if (h.isEmpty(invitee)) {
        await userEmailVerificationController.sendUserExistsEmail(
          record.user_id,
          { transaction },
        );
      } else {
        // update the status to active for invited user.
        // use new transaction for update.
        await h.database.transaction(async (transaction) => {
          return await userController.update(
            record.user_id,
            { status: constant.USER.STATUS.ACTIVE },
            { transaction },
          );
        });
      }
    } else {
      // else block: if it's a new user
      if (send_email) {
        // if a user is invited, we don't wanna send the verification email but the invite email
        await userEmailVerificationController.create(
          record.user_id,
          record.user_id,
          {
            transaction,
          },
        );
        await userEmailVerificationController.sendEmailVerification(
          record.user_id,
          { transaction },
        );
      }
    }

    return { record: h.database.formatData(record), created: created };
  };

  /**
   * Register user by Google signin
   * @param {string} first_name
   * @param {string} last_name
   * @param {string} email
   * @param {object} social_payload
   * @param {{ buyer_type?:string, invitee?: string, transaction?:object }} [options]
   * @returns {Promise<{access_token: string, created: boolean}>}
   */
  authController.registerUserByGoogle = async (
    first_name,
    last_name,
    email,
    social_payload,
    { buyer_type = '', invitee = '', transaction } = {},
  ) => {
    const funcName = 'authController.registerUserByGoogle';
    h.validation.requiredParams(funcName, {
      first_name,
      last_name,
      email,
      social_payload,
    });

    // gets the latest profile picture.
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

    // Create or update an existing user
    // even if the user is invited or already in the system, doesn't affect the logic.
    const { record, created } = await userController.findOrCreate(
      { email },
      {
        first_name,
        last_name,
        email,
        profile_picture_url,
        buyer_type,
        status: constant.USER.STATUS.ACTIVE,
      },
      { transaction },
    );
    if (!created) {
      // user already exists in db, make user active
      // use new transaction for update
      await h.database.transaction(async (transaction) => {
        return await userController.update(
          record.user_id,
          { status: constant.USER.STATUS.ACTIVE },
          { transaction },
        );
      });
    }

    // find or create an existing userSocialAuth Record.
    // even if the user is already in the system with email or other social oAuth, doesn't make a difference.
    await userSocialAuthController.findOrCreate(
      {
        user_fk: record.user_id,
        auth_type: constant.USER.AUTH_TYPE.GOOGLE,
      },
      {
        user_fk: record.user_id,
        auth_type: constant.USER.AUTH_TYPE.GOOGLE,
        auth_data: social_payload,
        created_by: record.user_id,
      },
      { transaction },
    );

    // Login user using Google signin payload
    const { access_token } = await authController.loginUserByGoogle(
      social_payload,
      { transaction },
    );
    return { access_token, created };
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
    { buyer_type = '', invitee = '', transaction } = {},
  ) => {
    const funcName = 'authController.registerUserByFacebook';
    h.validation.requiredParams(funcName, {
      first_name,
      last_name,
      email,
      social_payload,
    });
    const email_available = await userController.isEmailAvailable(email, {
      transaction,
    });
    if (email_available) {
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
        {
          first_name,
          last_name,
          email,
          profile_picture_url,
          buyer_type,
        },
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
    }
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
      {
        user_fk: user.user_id,
        auth_type: constant.USER.AUTH_TYPE.GOOGLE,
      },
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
    return !h.isEmpty(userRoleRecord);
  };

  /**
   * Check whether user has admin access to Staff Portal
   * @param {string} user_id
   * @returns {Promise<boolean>}
   */
  authController.hasAdminAccessToStaffPortal = async (user_id) => {
    const funcName = 'authController.hasAdminAccessToStaffPortal';
    h.validation.requiredParams(funcName, { user_id });
    const userRoleRecord = await userRoleController.findOne({
      [Op.or]: [
        { user_fk: user_id, user_role: constant.USER.ROLE.STAFF_ADMIN },
        { user_fk: user_id, user_role: constant.USER.ROLE.AGENCY_ADMIN },
      ],
    });
    return !h.isEmpty(userRoleRecord);
  };

  /**
   * Check whether a user satisfies at least one of the given level of permissions
   * @param {string} user_id
   * @param {permissions} permissions list of permissions to check
   * @returns {Promise<boolean>}
   */
  authController.hasPermissionLevel = async (user_id, permissions) => {
    const funcName = 'authController.hasPermissionLevel';
    h.validation.requiredParams(funcName, { user_id });
    const permission_query = [];
    permissions.forEach((permission) =>
      permission_query.push({ user_fk: user_id, user_role: permission }),
    );
    const userRoleRecord = await userRoleController.findOne({
      [Op.or]: permission_query,
    });
    return !h.isEmpty(userRoleRecord);
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
        'Chaaat Team <registrations@chaaat.io>',
        user.email,
        null,
        h.getMessageByCode('template-resetPassword-subject-1613818392997'),
        h.getMessageByCode('template-resetPassword-body-1613818392997', {
          FIRST_NAME: user.first_name,
          LOGIN_URL: `${config.webAdminUrl}/login`,
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
