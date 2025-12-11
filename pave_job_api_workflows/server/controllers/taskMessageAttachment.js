const h = require('../helpers');

module.exports.makeTaskMessageAttachmentController = (models) => {
  const { task_message_attachment: taskMessageAttachmentModel } = models;
  const taskMessageAttachmentController = {};

  /**
   * Create task message attachment record
   * @param {{
   * 	task_message_fk: string,
   *	file_name: string,
   *	file_url: string,
   *	created_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskMessageAttachmentController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessageAttachmentController.create';
    h.validation.requiredParams(funcName, { record });
    const { task_message_fk, file_name, file_url, created_by } = record;
    h.validation.requiredParams(funcName, {
      task_message_fk,
      file_name,
      file_url,
    });
    const task_message_attachment_id = h.general.generateId();
    await taskMessageAttachmentModel.create(
      {
        task_message_attachment_id,
        task_message_fk,
        file_name,
        file_url,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return task_message_attachment_id;
  };

  /**
   * Update task message attachment record
   * @param {string} task_message_attachment_id
   * @param {{
   * 	task_message_fk?: string,
   *	file_name?: string,
   *	file_url?: string,
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskMessageAttachmentController.update = async (
    task_message_attachment_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessageAttachmentController.update';
    h.validation.requiredParams(funcName, {
      task_message_attachment_id,
      record,
    });
    const { task_message_fk, file_name, file_url, updated_by } = record;
    await taskMessageAttachmentModel.update(
      {
        task_message_fk,
        file_name,
        file_url,
        updated_by,
      },
      { where: { task_message_attachment_id }, transaction },
    );
    return task_message_attachment_id;
  };

  /**
   * Find task message attachment records
   * @param {{
   *  task_message_attachment_id?:string,
   * 	task_message_fk?: string,
   *	file_name?: string,
   *	file_url?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  taskMessageAttachmentController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const records = await taskMessageAttachmentModel.findAll({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one task message attachment record
   * @param {{
   * 	task_message_attachment_id?:string,
   * 	task_message_fk?: string,
   *	file_name?: string,
   *	file_url?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  taskMessageAttachmentController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'taskMessageAttachmentController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await taskMessageAttachmentModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete task message attachment record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  taskMessageAttachmentController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessageAttachmentController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await taskMessageAttachmentModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return taskMessageAttachmentController;
};
