const constant = require('../constants/constant.json');
const h = require('../helpers');
const { Op } = require('sequelize');
const Axios = require('axios');

module.exports.makeUserController = (models) => {
  const { user: userModel } = models;
  const userSocialAuthController =
    require('./userSocialAuth').makeUserSocialAuthController(models);
  const userController = {};

  /**
   * Create user
   * @param {{
   * 	password?: string,
   * 	password_salt?: string,
   * 	first_name: string,
   *	middle_name?: string,
   *	last_name: string,
   *	email: string,
   *	mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  hubspot_bcc_id?: string,
   *	date_of_birth?: string,
   *	gender?: string,
   *	nationality?: string,
   *	ordinarily_resident_location?: string,
   *	permanent_resident?: string,
   *	auth0_id?: string,
   *	profile_picture_url?: string,
   *	buyer_type?: string,
   *  last_seen?: date,
   *	status?: string,
   *	created_by?: string
   * }} userData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userController.create = async (userData, { transaction } = {}) => {
    const funcName = 'userController.create';
    const {
      password,
      password_salt,
      first_name,
      middle_name,
      last_name,
      email,
      mobile_number,
      is_whatsapp,
      hubspot_bcc_id,
      date_of_birth,
      gender,
      nationality,
      ordinarily_resident_location,
      permanent_resident,
      profile_picture_url,
      buyer_type,
      last_seen,
      status = constant.USER.STATUS.ACTIVE,
      created_by,
    } = userData;
    h.validation.requiredParams(funcName, { first_name, last_name, email });
    await userController.validateEmailAvailability(funcName, email);
    const user_id = h.general.generateId();
    await userModel.create(
      {
        user_id,
        password,
        password_salt,
        first_name: first_name && first_name.trim(),
        middle_name: middle_name && middle_name.trim(),
        last_name: last_name && last_name.trim(),
        email,
        mobile_number,
        is_whatsapp,
        hubspot_bcc_id,
        date_of_birth,
        gender,
        nationality,
        ordinarily_resident_location,
        permanent_resident,
        profile_picture_url,
        buyer_type,
        last_seen,
        status,
        created_by: created_by || user_id,
        updated_by: created_by || user_id,
      },
      { transaction },
    );
    return user_id;
  };

  /**
   * Update user
   * @param {string} user_id
   * @param {{
   * 	password?: string,
   * 	password_salt?: string,
   * 	first_name?: string,
   *	middle_name?: string,
   *	last_name?: string,
   *	email?: string,
   *	mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  hubspot_bcc_id?: string,
   *	date_of_birth?: string,
   *	gender?: string,
   *	nationality?: string,
   *	ordinarily_resident_location?: string,
   *	permanent_resident?: string,
   *	profile_picture_url?: string,
   *	buyer_type?: string,
   *  last_seen?: date,
   *	status?: string,
   *	updated_by?: string
   * }} userData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userController.update = async (user_id, userData, { transaction } = {}) => {
    const funcName = 'userController.update';
    h.validation.requiredParams(funcName, { user_id, userData });
    const {
      password,
      password_salt,
      first_name,
      middle_name,
      last_name,
      email,
      mobile_number,
      is_whatsapp,
      hubspot_bcc_id,
      date_of_birth,
      gender,
      nationality,
      ordinarily_resident_location,
      permanent_resident,
      profile_picture_url,
      buyer_type,
      last_seen,
      status,
      updated_by,
    } = userData;
    await userModel.update(
      {
        password,
        password_salt,
        first_name: first_name && first_name.trim(),
        middle_name: middle_name && middle_name.trim(),
        last_name: last_name && last_name.trim(),
        email,
        mobile_number,
        is_whatsapp,
        hubspot_bcc_id,
        date_of_birth,
        gender,
        nationality,
        ordinarily_resident_location,
        permanent_resident,
        profile_picture_url,
        buyer_type,
        last_seen,
        status,
        updated_by,
      },
      {
        where: { user_id },
        transaction,
      },
    );
    return user_id;
  };

  /**
   * Update password
   * @param {string} user_id
   * @param {string} new_password
   * @param {string} [old_password]
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userController.updatePassword = async (
    user_id,
    new_password,
    old_password,
    { transaction } = {},
  ) => {
    const funcName = 'userController.updatePassword';
    h.validation.requiredParams(funcName, { user_id, new_password });
    const user = await userModel.findOne({ where: { user_id } });
    if (h.isEmpty(user)) throw new Error(`${funcName}: user does not exist`);
    // if ((h.notEmpty(user.password) || h.notEmpty(user.password_salt)) && h.isEmpty(old_password)) throw new Error(`${funcName}: missing param old_password for user with existing password`);
    // Existing user - password change
    if (
      h.notEmpty(user.password) &&
      h.notEmpty(user.password_salt) &&
      h.notEmpty(old_password)
    ) {
      const hashed_old_password = h.user.hashPasswordWithSalt(
        old_password,
        user.password_salt,
      );
      const hashed_db_password = h.user.hashPasswordWithSalt(
        user.password,
        user.password_salt,
      );
      if (!h.cmpStr(hashed_old_password, hashed_db_password))
        throw new Error(`${funcName}: old password does not match`);
    }
    const { hashed_password, password_salt } =
      h.user.hashPassword(new_password);
    await userController.update(
      user_id,
      { password: hashed_password, password_salt },
      { transaction },
    );
  };

  /**
   * Verify user entered password if it matches with the email and the one stored in database
   * @param {string} email
   * @param {string} password
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userController.verifyUserPassword = async (
    email,
    password,
    { transaction } = {},
  ) => {
    const funcName = 'userController.verifyUserPassword';
    h.validation.requiredParams(funcName, { email, password });
    const user = await userModel.findOne({ where: { email }, transaction });
    const { hashed_password } = h.user.hashPasswordWithSalt(
      password,
      user.password_salt,
    );
    if (h.isEmpty(hashed_password) || h.isEmpty(user.password))
      throw new Error(`${funcName}: user account doesn't have password set`);
    if (!h.cmpStr(hashed_password, user.password))
      throw new Error(`${funcName}: user entered password doesn't match`);
  };

  /**
   * Get users
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object|Array>}
   */
  userController.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const users = await userModel.findAll({
      attributes: {
        exclude: ['password', 'password_salt'],
      },
      where: { ...where, status: { [Op.ne]: constant.USER.STATUS.DELETED } },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
    });
    return h.database.formatData(users);
  };

  /**
   * Update or create a record for user
   * @param where
   * @param defaults
   * @param transaction
   * @returns {Promise<{created: *, record: (Object|Array)}>}
   */
  userController.upsert = async (where, defaults, { transaction } = {}) => {
    // TODO: upsert can be implemented from findOrCreate and update or the way below. Neither are working currently

    // default sequelize upsert implementation(not working)
    const [record, created] = await userModel.upsert(where, defaults, {
      transaction,
    });
    return { record: h.database.formatData(record), created: created };
  };

  /**
   * Find or create a user
   * @param where
   * @param defaults
   * @param transaction
   * @returns {Promise<{created: *, record: (Object|Array)}>}
   */
  userController.findOrCreate = async (
    where,
    defaults,
    { transaction } = {},
  ) => {
    const funcName = 'userController.findOrCreate';

    /* Implementation using the findOrCreate from sequelize */
    h.validation.requiredParams(funcName, { where, defaults });

    const {
      password,
      password_salt,
      first_name,
      middle_name,
      last_name,
      email,
      mobile_number,
      is_whatsapp,
      hubspot_bcc_id,
      date_of_birth,
      gender,
      nationality,
      ordinarily_resident_location,
      permanent_resident,
      profile_picture_url,
      buyer_type,
      last_seen,
      status,
      created_by,
    } = defaults;

    h.validation.requiredParams(funcName, { first_name, last_name, email });

    const user_id = h.general.generateId();

    const [record, created] = await userModel.findOrCreate({
      where: { ...where },
      defaults: {
        user_id,
        password,
        password_salt,
        first_name: first_name && first_name.trim(),
        middle_name: middle_name && middle_name.trim(),
        last_name: last_name && last_name.trim(),
        email,
        mobile_number,
        is_whatsapp,
        hubspot_bcc_id,
        date_of_birth,
        gender,
        nationality,
        ordinarily_resident_location,
        permanent_resident,
        profile_picture_url,
        buyer_type,
        last_seen,
        status: constant.USER.STATUS.ACTIVE || status,
        created_by: created_by || user_id,
        updated_by: created_by || user_id,
      },
      transaction,
    });

    return { record: h.database.formatData(record), created: created };
  };

  /**
   * Find one user record
   * @param {{
   *  user_id?: string,
   *  password?: string,
   * 	password_salt?: string,
   * 	first_name?: string,
   *	middle_name?: string,
   *	last_name?: string,
   *	email?: string,
   *	mobile_number?: string,
   *  is_whatsapp?: boolean,
   *  hubspot_bcc_id?: string,
   *	date_of_birth?: string,
   *	gender?: string,
   *	nationality?: string,
   *	ordinarily_resident_location?: string,
   *	permanent_resident?: string,
   *	profile_picture_url?: string,
   *	status?: string,
   *  last_seen?: date,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<object>}
   */
  userController.findOne = async (where, { transaction, include } = {}) => {
    const funcName = 'userController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const user = await userModel.findOne({
      attributes: {
        exclude: ['password', 'password_salt'],
      },
      where: {
        ...where,
        status: { [Op.ne]: constant.USER.STATUS.DELETED },
      },
      include,
      transaction,
    });
    return h.database.formatData(user);
  };

  /**
   * Checks if user account with email address exists
   * @param {string} email
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<boolean>}
   */
  userController.isEmailAvailable = async (email, { transaction } = {}) => {
    const funcName = 'userController.isEmailAvailable';
    h.validation.requiredParams(funcName, { email });
    const user = await userController.findOne({ email }, { transaction });
    return h.isEmpty(user);
  };

  /**
   * Validate whether email is available for use (will throw error if email is not available
   * @param {string} funcName
   * @param {string} email
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userController.validateEmailAvailability = async (
    funcName = 'userController.validateEmailAvailability',
    email,
    { transaction } = {},
  ) => {
    if (!(await userController.isEmailAvailable(email, { transaction })))
      throw new Error(
        `${funcName}: user with same email address already exist. ${email}`,
      );
  };

  /**
   * Check if user is active
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<boolean>}
   */
  userController.isUserActive = async (user_id, { transaction } = {}) => {
    const funcName = 'userController.isUserActive';
    h.validation.requiredParams(funcName, { user_id });
    let user = await userController.findOne({ user_id }, { transaction });
    user = h.database.formatData(user);
    if (h.isEmpty(user)) return false;
    if (!h.cmpStr(user.status, constant.USER.STATUS.ACTIVE)) return false;
    return true;
  };

  /**
   * Soft delete user record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userController.delete = async (where, { transaction } = {}) => {
    const funcName = 'userController.delete';
    h.validation.requiredParams(funcName, { where });
    const { user_id } = await userController.findOne(where, { transaction });
    await userController.update(
      user_id,
      { status: constant.USER.STATUS.DELETED },
      { transaction },
    );
  };

  /**
   * Hard delete user record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'userController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await userModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Get user auth type
   * @param {string} user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userController.getUserAuthType = async (user_id, { transaction } = {}) => {
    const funcName = 'userController.getUserAuthType';
    h.validation.requiredParams(funcName, { user_id });
    const userSocialAuth = await userSocialAuthController.findOne(
      { user_fk: user_id },
      { transaction },
    );
    const authType =
      h.notEmpty(userSocialAuth) && userSocialAuth.auth_type
        ? userSocialAuth.auth_type
        : constant.USER.AUTH_TYPE.EMAIL;
    return authType;
  };

  /**
   * Count user record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userController.count = async (where, { include, transaction } = {}) => {
    const funcName = 'userController.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await userModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return userController;
};
