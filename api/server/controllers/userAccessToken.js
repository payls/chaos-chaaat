const constant = require('../constants/constant.json');
const jwt = require('jsonwebtoken');
const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);

module.exports.makeUserAccessTokenController = (models) => {
  const { user_access_token: userAccessTokenModel } = models;
  const userController = require('./user').makeUserController(models);
  const userAccessTokenController = {};

  /**
   * Create user_access_token record
   * @param {{
   * 	user_fk:string,
   *	access_token:string,
   *	type:string,
   *	status:string,
   *	created_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userAccessTokenController.create = async (record, { transaction } = {}) => {
    const funcName = 'userAccessTokenController.create';
    const { user_fk, access_token, type, status, created_by } = record;
    h.validation.requiredParams(funcName, {
      record,
      user_fk,
      access_token,
      type,
      status,
    });
    h.validation.validateConstantValue(
      funcName,
      { status: constant.USER.ACCESS_TOKEN.STATUS },
      { status },
    );
    const user_access_token_id = h.general.generateId();
    await userAccessTokenModel.create(
      {
        user_access_token_id,
        user_fk,
        access_token,
        type,
        status,
        created_by: created_by || user_fk,
      },
      { transaction },
    );
    return user_access_token_id;
  };

  /**
   * Update user_access_token record by user_access_token_id
   * @param {string} user_access_token_id
   * @param {{
   * 	user_fk?:string,
   *	access_token?:string,
   *	type?:string,
   *	status?:string,
   *	created_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userAccessTokenController.update = async (
    user_access_token_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'userAccessTokenController.update';
    const { user_fk, access_token, type, status, updated_by } = record;
    h.validation.requiredParams(funcName, { user_access_token_id, record });
    h.validation.validateConstantValue(
      funcName,
      { status: constant.USER.ACCESS_TOKEN.STATUS },
      { status },
    );
    await userAccessTokenModel.update(
      {
        user_fk,
        access_token,
        type,
        status,
        updated_by: updated_by || user_fk,
      },
      {
        where: { user_access_token_id },
        transaction,
      },
    );
    return user_access_token_id;
  };

  /**
   * Find one user_access_token record
   * @param {{
   *  user_access_token_id?:string,
   *  user_fk?:string,
   *	access_token?:string,
   *	type?:string,
   *	status?:string,
   *	created_by?:string,
   *	updated_by?:string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object|Array>}
   */
  userAccessTokenController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'userAccessTokenController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const userAccessToken = await userAccessTokenModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(userAccessToken);
  };

  /**
   * Generate access token for session
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userAccessTokenController.generateAccessToken = async (
    user_id,
    { transaction } = {},
  ) => {
    const funcName = 'userAccessTokenController.generateAccessToken';
    h.validation.requiredParams(funcName, { user_id });
    const userRecord = await userController.findOne(
      { user_id },
      { transaction },
    );
    if (h.isEmpty(userRecord))
      throw new Error(`${funcName}: user '${user_id}' does not not exists`);
    const access_token_data = {
      user_id: userRecord.user_id,
      first_name: userRecord.first_name,
      last_name: userRecord.last_name,
      email: userRecord.email,
      mobile_number: userRecord.mobile_number,
      profile_picture_url: userRecord.profile_picture_url,
      status: userRecord.status,
    };
    // Generate access token in jwt
    return jwt.sign(access_token_data, process.env.JWT_SECRET, {
      expiresIn: config.jwt.expirySecs,
    });
  };

  /**
   * Hard delete user_access_token record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userAccessTokenController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'userAccessTokenController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await userAccessTokenModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return userAccessTokenController;
};
