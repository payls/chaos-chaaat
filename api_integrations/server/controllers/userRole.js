const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeUserRoleController = (models) => {
  const { user_role: userRoleModel } = models;
  const userRoleController = {};

  /**
   * Create user_role record
   * @param {{
   * 	user_fk:string,
   *	user_role:string,
   *	created_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userRoleController.create = async (record, { transaction } = {}) => {
    const funcName = 'userRoleController.create';
    const { user_fk, user_role, created_by } = record;
    h.validation.requiredParams(funcName, { record, user_fk, user_role });
    h.validation.validateConstantValue(
      funcName,
      { user_role: constant.USER.ROLE },
      { user_role },
    );
    const user_role_id = h.general.generateId();
    await userRoleModel.create(
      {
        user_role_id,
        user_fk,
        user_role,
        created_by: created_by || user_fk,
      },
      { transaction },
    );
    return user_role_id;
  };

  /**
   * Update user_role record by user_role_id
   * @param {string} user_role_id
   * @param {{
   * 	user_fk?:string,
   *	user_role?:string,
   *	created_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userRoleController.update = async (
    user_role_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'userRoleController.update';
    const { user_fk, user_role, updated_by } = record;
    h.validation.requiredParams(funcName, { user_role_id, record });
    h.validation.validateConstantValue(
      funcName,
      { user_role: constant.USER.ROLE },
      { user_role },
    );
    await userRoleModel.update(
      {
        user_fk,
        user_role,
        updated_by: updated_by || user_fk,
      },
      {
        where: { user_role_id },
        transaction,
      },
    );
    return user_role_id;
  };

  /**
   * Find one user_role record
   * @param {{
   *  user_role_id?:string,
   *  user_fk?:string,
   *	user_role?:string,
   *	created_by?:string,
   *	updated_by?:string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object|Array>}
   */
  userRoleController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'userRoleController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await userRoleModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete user_role record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userRoleController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'userRoleController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await userRoleModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return userRoleController;
};
