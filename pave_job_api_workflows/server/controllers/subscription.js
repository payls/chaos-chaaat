const h = require('../helpers');

module.exports.makeSubscriptionController = (models) => {
  const { subscription: subscriptionModel } = models;
  const subscriptionController = {};

  /**
   * Create subscription record
   * @param {{
   * 	subscription_id: Integer,
   * 	subscription_max_users?: Integer,
   * 	subscription_name?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<>}
   */
  subscriptionController.create = async (record, { transaction } = {}) => {
    const funcName = 'subscriptionController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      subscription_id,
      subscription_max_users,
      subscription_name,
      created_by,
    } = record;
    // const subscription_id = h.general.generateId();
    await subscriptionModel.create(
      {
        subscription_id,
        subscription_max_users,
        subscription_name,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return subscription_id;
  };

  /**
   * Update subscription record
   * @param {Integer} subscription_id
   * @param {{
   * 	subscription_id: Integer,
   * 	subscription_max_users?: Integer,
   * 	subscription_name?: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<>}
   */
  subscriptionController.update = async (
    subscription_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'subscriptionController.update';
    h.validation.requiredParams(funcName, { subscription_id, record });
    const { subscription_max_users, subscription_name, updated_by } = record;
    await subscriptionModel.update(
      {
        subscription_id,
        subscription_max_users,
        subscription_name,
        updated_by,
      },
      { where: { subscription_id }, transaction },
    );
    return subscription_id;
  };

  /**
   * Find all subscription records
   * @param {{
   * 	subscription_id?: Integer,
   * 	subscription_max_users?: Integer,
   * 	subscription_name?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  subscriptionController.findAll = async (where, { transaction } = {}) => {
    const funcName = 'subscriptionController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await subscriptionModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one subscription record
   * @param {{
   * 	subscription_id?: Integer,
   * 	subscription_max_users?: Integer,
   * 	subscription_name?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  subscriptionController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'subscriptionController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await subscriptionModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete task record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  subscriptionController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'subscriptionController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await subscriptionModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return subscriptionController;
};
