const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');

module.exports.makeUserResetPasswordController = (models) => {
  const { user_reset_password: userResetPasswordModel } = models;
  const userController = require('./user').makeUserController(models);
  const userResetPasswordController = {};

  /**
   * Create user reset password record by id
   * @param {string} user_id
   * @param {string} [created_by]
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userResetPasswordController.create = async (
    user_id,
    created_by,
    { transaction } = {},
  ) => {
    const funcName = 'userResetPasswordController.create';
    h.validation.requiredParams(funcName, { user_id });
    const user_reset_password_id = h.general.generateId();
    await userResetPasswordModel.create(
      {
        user_reset_password_id,
        user_fk: user_id,
        token: h.user.generatePasswordSalt(56),
        reset_date: null,
        status: constant.USER.RESET_PASSWORD.STATUS.ACTIVE,
        created_by: created_by || user_id,
      },
      { transaction },
    );
    return user_reset_password_id;
  };

  /**
   * Update user reset password record by id
   * @param {string} user_reset_password_id
   * @param {{
   * 	user_fk?:string,
   * 	token?:string,
   *  reset_date?:string,
   *  status?:string,
   *  updated_by?:string
   * }} userResetPasswordData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userResetPasswordController.update = async (
    user_reset_password_id,
    userResetPasswordData,
    { transaction } = {},
  ) => {
    const funcName = 'userResetPasswordController.update';
    const { user_fk, token, reset_date, status, updated_by } =
      userResetPasswordData;
    h.validation.requiredParams(funcName, {
      user_reset_password_id,
      userResetPasswordData,
    });
    h.validation.validateConstantValue(
      funcName,
      { status: constant.USER.RESET_PASSWORD.STATUS },
      { status },
    );
    await userResetPasswordModel.update(
      {
        user_fk,
        token,
        reset_date,
        status,
        updated_by,
      },
      { where: { user_reset_password_id }, transaction },
    );
    return user_reset_password_id;
  };

  /**
   * Find one user reset password record
   * @param {{
   *  user_reset_password_id?:string,
   *  user_fk?:string,
   * 	token?:string,
   *  reset_date?:string,
   *  status?:string,
   *  updated_by?:string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<object>}
   */
  userResetPasswordController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'userResetPasswordController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await userResetPasswordModel.findOne({
      where: { ...where },
      transaction,
    });
    return record;
  };

  /**
   * Get user reset password records
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object|Array>}
   */
  userResetPasswordController.findAll = async (where, { transaction } = {}) => {
    const users = await userResetPasswordModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(users);
  };

  /**
   * Send reset password email to user by user_id id
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userResetPasswordController.sendResetPasswordEmail = async (
    user_id,
    { transaction } = {},
  ) => {
    const funcName = 'userResetPasswordController.sendEmailVerification';
    h.validation.requiredParams(funcName, { user_id });
    const user = await userController.findOne({ user_id }, { transaction });
    const userResetPassword = await userResetPasswordController.findOne(
      {
        user_fk: user_id,
        status: constant.USER.RESET_PASSWORD.STATUS.ACTIVE,
      },
      { transaction },
    );
    const resetPasswordUrl = `${
      config.webUrl
    }/auth/reset-password?email=${encodeURIComponent(user.email)}&token=${
      userResetPassword.token
    }`;
    await h.email.sendEmail(
      'Chaaat Team <registrations@chaaat.io>',
      user.email,
      null,
      h.getMessageByCode('template-resetPassword-subject-1613806012993'),
      h.getMessageByCode('template-resetPassword-body-1613806012993', {
        FIRST_NAME: user.first_name,
        RESET_PASSWORD_URL: resetPasswordUrl,
      }),
    );
  };

  /**
   * Send password changed email to user by user_id
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userResetPasswordController.sendPasswordChangedEmail = async (
    user_id,
    { transaction } = {},
  ) => {
    const funcName = 'userResetPasswordController.sendPasswordChangedEmail';
    h.validation.requiredParams(funcName, { user_id });
    const user = await userController.findOne({ user_id }, { transaction });
    await h.email.sendEmail(
      'Chaaat Team <registrations@chaaat.io>',
      user.email,
      null,
      h.getMessageByCode('template-resetPassword-subject-1613806153934'),
      h.getMessageByCode('template-resetPassword-body-1613806153934', {
        FIRST_NAME: user.first_name,
      }),
    );
  };

  /**
   * Verify reset password token
   * @param {string} token
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<boolean>}
   */
  userResetPasswordController.verify = async (token, { transaction } = {}) => {
    const funcName = 'userResetPasswordController.verify';
    h.validation.requiredParams(funcName, { token });
    const userResetPassword = await userResetPasswordController.findOne(
      { token, status: constant.USER.RESET_PASSWORD.STATUS.ACTIVE },
      { transaction },
    );
    if (h.isEmpty(userResetPassword))
      throw new Error(`${funcName}: user reset password record does not exist`);
    if (h.isEmpty(userResetPassword.reset_date)) {
      await userResetPasswordController.update(
        userResetPassword.user_reset_password_id,
        {
          reset_date: h.date.getSqlCurrentDate(),
          status: constant.USER.RESET_PASSWORD.STATUS.UTILISED,
          updated_by: userResetPassword.user_fk,
        },
        { transaction },
      );
      return true;
    } else {
      return false;
    }
  };

  /**
   * Hard delete user_reset_password record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userResetPasswordController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'userResetPasswordController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await userResetPasswordModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return userResetPasswordController;
};
