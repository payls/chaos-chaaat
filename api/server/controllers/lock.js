const h = require('../helpers');

module.exports.makeController = (models) => {
  const { lock: lockModel } = models;
  const lockController = {};

  /**
   * Create lock record
   * @param {{
   *  process_name: string,
   *  entity_id: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lockController.create = async (record, { transaction } = {}) => {
    const funcName = 'lockController.create';
    h.validation.requiredParams(funcName, { record });
    const { process_name, entity_id } = record;

    const lock_id = h.general.generateId();
    await lockModel.create(
      {
        lock_id,
        process_name,
        entity_id,
      },
      { transaction },
    );
    return lock_id;
  };

  /**
   * Update lock record
   * @param {string} lock_id
   * @param {{
   *  process_name: string,
   *  entity_id: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lockController.update = async (lock_id, record, { transaction } = {}) => {
    const funcName = 'lockController.update';
    h.validation.requiredParams(funcName, { lock_id, record });
    const { process_name, entity_id } = record;
    await lockModel.update(
      {
        process_name,
        entity_id,
      },
      { where: { lock_id }, transaction },
    );
    return lock_id;
  };

  /**
   * Find all lock records
   * @param {{
   *  lock_id: string,
   *  process_name: string,
   *  entity_id: string,
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  lockController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'lockController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lockModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single lock record
   * @param {{
   *  lock_id: string,
   *  process_name: string,
   *  entity_id: string,
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  lockController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'lockController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lockModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete lock record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  lockController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'lockController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await lockModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return lockController;
};
