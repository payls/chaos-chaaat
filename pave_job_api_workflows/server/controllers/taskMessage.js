const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeTaskMessageController = (models) => {
  const { task_message: taskMessageModel } = models;
  const taskMessageController = {};

  /**
   * Create task message record
   * @param {{
   * 	task_fk: string,
   * 	user_fk: string,
   *	type: string,
   *	message?: string,
   *	created_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskMessageController.create = async (record, { transaction } = {}) => {
    const funcName = 'taskMessageController.create';
    h.validation.requiredParams(funcName, { record });
    const { task_fk, user_fk, type, message, created_by } = record;
    h.validation.requiredParams(funcName, { task_fk, user_fk, type, message });
    h.validation.validateConstantValue(
      funcName,
      { type: constant.TASK.MESSAGE.TYPE },
      { type },
    );
    const task_message_id = h.general.generateId();
    await taskMessageModel.create(
      {
        task_message_id,
        task_fk,
        user_fk,
        type,
        message,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return task_message_id;
  };

  /**
   * Update task message record
   * @param {string} task_message_id
   * @param {{
   * 	task_fk?: string,
   * 	user_fk?: string,
   *	type?: string,
   *	message?: string,
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskMessageController.update = async (
    task_message_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessageController.update';
    h.validation.requiredParams(funcName, { task_message_id, record });
    const { task_fk, user_fk, type, message, updated_by } = record;
    h.validation.validateConstantValue(
      funcName,
      { type: constant.TASK.MESSAGE.TYPE },
      { type },
    );
    await taskMessageModel.update(
      {
        task_fk,
        user_fk,
        type,
        message,
        updated_by,
      },
      { where: { task_message_id }, transaction },
    );
    return task_message_id;
  };

  /**
   * Find task message records
   * @param {{
   *  task_message_id?:string,
   * 	task_fk?: string,
   * 	user_fk?: string,
   *	type?: string,
   *	message?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  taskMessageController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const records = await taskMessageModel.findAll({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one task message record
   * @param {{
   * 	task_message_id?:string,
   * 	task_fk?: string,
   * 	user_fk?: string,
   *	type?: string,
   *	message?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  taskMessageController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'taskMessageController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await taskMessageModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete task message record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  taskMessageController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'taskMessageController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await taskMessageModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return taskMessageController;
};
