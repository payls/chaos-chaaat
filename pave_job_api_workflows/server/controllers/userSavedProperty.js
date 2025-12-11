const h = require('../helpers');

module.exports.makeUserSavedPropertyController = (models) => {
  const { user_saved_property: userSavedPropertyModel } = models;
  const userSavedPropertyController = {};

  /**
   * Create saved user property record
   * @param {{
   * 	property_fk: string,
   *	user_fk: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userSavedPropertyController.create = async (record, { transaction } = {}) => {
    const funcName = 'userSavedPropertyController.create';
    h.validation.requiredParams(funcName, { record });
    const { property_fk, user_fk, created_by } = record;
    const user_saved_property_id = h.general.generateId();
    await userSavedPropertyModel.create(
      {
        user_saved_property_id,
        property_fk,
        user_fk,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return user_saved_property_id;
  };

  /**
   * Update user_saved_property record
   * @param {string} user_saved_property_id
   * @param {{
   * 	property_fk: string,
   *	user_fk: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  userSavedPropertyController.update = async (
    user_saved_property_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'userSavedPropertyController.update';
    h.validation.requiredParams(funcName, { user_saved_property_id, record });
    const { property_fk, user_fk, updated_by } = record;
    await userSavedPropertyModel.update(
      {
        property_fk,
        user_fk,
        updated_by,
      },
      { where: { user_saved_property_id }, transaction },
    );
    return user_saved_property_id;
  };

  /**
   * Find all saved properties of a user
   * @param {{
   *  user_saved_property_id?: string,
   * 	property_fk?: string,
   *	user_fk?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  userSavedPropertyController.findAll = async (where, { transaction } = {}) => {
    const funcName = 'userSavedPropertyController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await userSavedPropertyModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one saved property of a user
   * @param {{
   *  user_saved_property_id?: string,
   * 	property_fk?: string,
   *	user_fk?: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  userSavedPropertyController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'userSavedPropertyController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await userSavedPropertyModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete user_saved_property record
   * @param {
   *  property_fk: string,
   *	user_fk: string,
   * } where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  userSavedPropertyController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'userSavedPropertyController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await userSavedPropertyModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return userSavedPropertyController;
};
