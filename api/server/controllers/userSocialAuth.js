const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeUserSocialAuthController = (models) => {
  const { user_social_auth: userSocialAuthModel } = models;
  const userSocialAuthController = {};

  /**
   * Create user_social_auth record
   * @param {{
   *	user_fk:string,
   *	auth_type:string,
   *	auth_data:object,
   *	created_by?:string
   * }} userSocialAuthData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userSocialAuthController.create = async (
    userSocialAuthData,
    { transaction } = {},
  ) => {
    const funcName = 'userSocialAuthController.create';
    const { user_fk, auth_type, auth_data, created_by } = userSocialAuthData;
    h.validation.requiredParams(funcName, {
      userSocialAuthData,
      user_fk,
      auth_type,
      auth_data,
    });
    h.validation.validateConstantValue(
      funcName,
      { auth_type: constant.USER.AUTH_TYPE },
      { auth_type },
    );
    h.validation.isObjectOrArray(funcName, { auth_data });
    const user_social_auth_id = h.general.generateId();
    await userSocialAuthModel.create(
      {
        user_social_auth_id,
        user_fk,
        auth_type,
        auth_data: JSON.stringify(auth_data),
        created_by: created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return user_social_auth_id;
  };

  /**
   * Update user_social_auth record
   * @param {string} user_social_auth_id
   * @param {{
   *  user_fk:string,
   *	auth_type:string,
   *	auth_data:object,
   *	updated_by?:string
   * }} userSocialAuthData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userSocialAuthController.update = async (
    user_social_auth_id,
    userSocialAuthData,
    { transaction } = {},
  ) => {
    const funcName = 'userSocialAuthController.update';
    const { user_fk, auth_type, auth_data, updated_by } = userSocialAuthData;
    h.validation.requiredParams(funcName, {
      userSocialAuthData,
      user_fk,
      auth_type,
      auth_data,
    });
    h.validation.validateConstantValue(
      funcName,
      { auth_type: constant.USER.AUTH_TYPE },
      { auth_type },
    );
    h.validation.isObjectOrArray(funcName, { auth_data });
    await userSocialAuthModel.update(
      {
        user_fk,
        auth_type,
        auth_data: JSON.stringify(auth_data),
        updated_by,
      },
      {
        where: { user_social_auth_id },
        transaction,
      },
    );
    return user_social_auth_id;
  };

  /**
   * find or create a record in userSocialAuthModel
   * @param where
   * @param userSocialAuthData
   * @param transaction
   * @returns {Promise<{created: *, record: (Object|Array)}>}
   */
  userSocialAuthController.findOrCreate = async (
    where,
    userSocialAuthData,
    { transaction } = {},
  ) => {
    const funcName = 'userSocialAuthController.findOrCreate';
    const { user_fk, auth_type, auth_data, created_by } = userSocialAuthData;
    h.validation.requiredParams(funcName, {
      where,
      userSocialAuthData,
      user_fk,
      auth_type,
      auth_data,
    });
    h.validation.isObjectOrArray(funcName, { auth_data });
    const user_social_auth_id = h.general.generateId();
    const [record, created] = await userSocialAuthModel.findOrCreate({
      where: { ...where },
      defaults: {
        user_social_auth_id,
        user_fk,
        auth_type,
        auth_data: JSON.stringify(auth_data),
        created_by: created_by || user_fk,
      },
      transaction,
    });
    return { record: h.database.formatData(record), created: created };
  };

  /**
   * Find user_social_auth record by user id
   * @param {{
   * 	user_social_auth_id?:string,
   *  user_fk?:string,
   *	auth_type?:string,
   *	auth_data?:object,
   *	created_by?:string,
   *	updated_by?:string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<object>}
   */
  userSocialAuthController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'userSocialAuthController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const userSocialAuth = await userSocialAuthModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(userSocialAuth);
  };

  /**
   * Hard delete user_social_auth record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userSocialAuthController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'userSocialAuthController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await userSocialAuthModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return userSocialAuthController;
};
