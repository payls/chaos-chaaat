const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);

module.exports.makeUserEmailVerificationController = (models) => {
  const { user_email_verification: userEmailVerificationModel } = models;
  const userController = require('./user').makeUserController(models);
  const userEmailVerificationController = {};

  /**
   * Create user email verification record by id
   * @param {string} user_id
   * @param {string} [created_by]
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userEmailVerificationController.create = async (
    user_id,
    created_by,
    { transaction } = {},
  ) => {
    const funcName = 'userEmailVerificationController.create';
    h.validation.requiredParams(funcName, { user_id });
    const user_email_verification_id = h.general.generateId();
    await userEmailVerificationModel.create(
      {
        user_email_verification_id,
        user_fk: user_id,
        token: h.user.generatePasswordSalt(56),
        verified_date: null,
        created_by: created_by || user_id,
      },
      { transaction },
    );
    return user_email_verification_id;
  };

  /**
   * Update user email verification record by id
   * @param {string} user_email_verification_id
   * @param {{
   * 	user_fk?:string,
   * 	token?:string,
   *  verified_date?:string,
   *  updated_by?:string
   * }} userEmailVerificationData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userEmailVerificationController.update = async (
    user_email_verification_id,
    userEmailVerificationData,
    { transaction } = {},
  ) => {
    const funcName = 'userEmailVerificationController.update';
    const { user_fk, token, verified_date, updated_by } =
      userEmailVerificationData;
    h.validation.requiredParams(funcName, {
      user_email_verification_id,
      userEmailVerificationData,
    });
    await userEmailVerificationModel.update(
      {
        user_fk,
        token,
        verified_date,
        updated_by,
      },
      { where: { user_email_verification_id }, transaction },
    );
    return user_email_verification_id;
  };

  /**
   * Find one user email verification record
   * @param {{
   *  user_email_verification_id?:string,
   *  user_fk?:string,
   * 	token?:string,
   *  verified_date?:string,
   *  updated_by?:string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<object>}
   */
  userEmailVerificationController.findOne = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'userEmailVerificationController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const userEmailVerification = await userEmailVerificationModel.findOne({
      where: { ...where },
      transaction,
    });
    return userEmailVerification;
  };

  /**
   * Send email verification email to user by user id
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userEmailVerificationController.sendEmailVerification = async (
    user_id,
    { transaction } = {},
  ) => {
    const funcName = 'userEmailVerificationController.sendEmailVerification';
    h.validation.requiredParams(funcName, { user_id });
    const user = await userController.findOne({ user_id }, { transaction });
    const userEmailVerification = await userEmailVerificationController.findOne(
      { user_fk: user_id },
      { transaction },
    );
    const emailVerificationUrl = `${
      config.webAdminUrl
    }/auth/verify-email?email=${encodeURIComponent(user.email)}&token=${
      userEmailVerification.token
    }`;
    await h.email.sendEmail(
      `Chaaat Team <registrations@${config?.email?.domain || 'yourpave.com'}>`,
      user.email,
      h.getMessageByCode('template-emailVerification-subject-1601338955192'),
      h.getMessageByCode('template-emailVerification-body-1601338955192', {
        FIRST_NAME: user.first_name,
        EMAIL_VERIFICATION_URL: emailVerificationUrl,
      }),
    );
  };

  /**
   * Verify email verification token
   * @param {string} token
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<boolean>}
   */
  userEmailVerificationController.verify = async (
    token,
    { transaction } = {},
  ) => {
    const funcName = 'userEmailVerificationController.verify';
    h.validation.requiredParams(funcName, { token });
    const userEmailVerification = await userEmailVerificationController.findOne(
      { token },
      { transaction },
    );
    if (h.isEmpty(userEmailVerification))
      throw new Error(
        `${funcName}: user email verification record does not exist`,
      );
    if (h.isEmpty(userEmailVerification.verified_date)) {
      await userEmailVerificationController.update(
        userEmailVerification.user_email_verification_id,
        {
          verified_date: h.date.getSqlCurrentDate(),
          updated_by: userEmailVerification.user_fk,
        },
        { transaction },
      );
      return true;
    } else {
      return false;
    }
  };

  /**
   * Hard delete user_email_verification record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userEmailVerificationController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'userEmailVerificationController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await userEmailVerificationModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return userEmailVerificationController;
};
