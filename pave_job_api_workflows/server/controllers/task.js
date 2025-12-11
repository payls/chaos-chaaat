const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeTaskController = (models) => {
  const { task: taskModel } = models;
  const taskController = {};

  /**
   * Create task record
   * @param {{
   * 	owner_type: string
   *	owner_fk: string
   *	subject?: string
   *	type?: string
   *	type_sub?: string
   *	status?: string
   *	created_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskController.create = async (record, { transaction } = {}) => {
    const funcName = 'taskController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      owner_type,
      owner_fk,
      subject,
      type,
      type_sub,
      status,
      created_by,
    } = record;
    h.validation.requiredParams(funcName, { owner_type, owner_fk });
    h.validation.validateConstantValue(
      funcName,
      {
        owner_type: constant.OWNER.TYPE,
        type: constant.TASK.TYPE,
        type_sub: constant.TASK.TYPE_SUB,
        status: constant.TASK.STATUS,
      },
      { owner_type, type, type_sub, status },
    );
    const task_id = h.general.generateId();
    await taskModel.create(
      {
        task_id,
        owner_type,
        owner_fk,
        subject,
        type,
        type_sub,
        status,
        status_updated_date: h.notEmpty(status)
          ? h.date.getSqlCurrentDate()
          : undefined,
        is_deleted: 0,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return task_id;
  };

  /**
   * Update task record
   * @param {string} task_id
   * @param {{
   * 	owner_type: string
   *	owner_fk: string
   *	subject?: string
   *	type?: string
   *	type_sub?: string
   *	status?: string
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskController.update = async (task_id, record, { transaction } = {}) => {
    const funcName = 'taskController.update';
    h.validation.requiredParams(funcName, { task_id, record });
    const {
      owner_type,
      owner_fk,
      subject,
      type,
      type_sub,
      status,
      updated_by,
    } = record;
    // h.validation.requiredParams(funcName, { owner_type, owner_fk });
    h.validation.validateConstantValue(
      funcName,
      {
        owner_type: constant.OWNER.TYPE,
        type: constant.TASK.TYPE,
        type_sub: constant.TASK.TYPE_SUB,
        status: constant.TASK.STATUS,
      },
      { owner_type, type, type_sub, status },
    );
    const task_record = await taskController.findOne(
      { task_id },
      { transaction },
    );
    await taskModel.update(
      {
        owner_type,
        owner_fk,
        subject,
        type,
        type_sub,
        status,
        status_updated_date: !h.cmpStr(status, task_record.status)
          ? h.date.getSqlCurrentDate()
          : undefined,
        updated_by,
      },
      { where: { task_id }, transaction },
    );
    return task_id;
  };

  /**
   * Bulk Update task records
   * @param {{
   * 	task_id?:string,
   * 	owner_type?: string,
   *	owner_fk?: string,
   *	subject?: string,
   *	type?: string,
   *	type_sub?: string,
   *	status?: string,
   *	updated_by?: string
   * }} where
   * @param {{
   * 	owner_type: string
   *	owner_fk: string
   *	subject?: string
   *	type?: string
   *	type_sub?: string
   *	status?: string
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<number>}
   */
  taskController.bulkUpdate = async (where, record, { transaction } = {}) => {
    const funcName = 'taskController.update';
    h.validation.requiredParams(funcName, { where, record });
    const {
      owner_type,
      owner_fk,
      subject,
      type,
      type_sub,
      status,
      updated_by,
    } = record;
    // h.validation.requiredParams(funcName, { owner_type, owner_fk });
    h.validation.validateConstantValue(
      funcName,
      {
        owner_type: constant.OWNER.TYPE,
        type: constant.TASK.TYPE,
        type_sub: constant.TASK.TYPE_SUB,
        status: constant.TASK.STATUS,
      },
      { owner_type, type, type_sub, status },
    );

    const count = await taskModel.update(
      {
        owner_type,
        owner_fk,
        subject,
        type,
        type_sub,
        status,
        status_updated_date: status ? h.date.getSqlCurrentDate() : null,
        updated_by,
      },
      { where: { ...where }, transaction },
    );
    return count;
  };

  /**
   * Find task records
   * @param {{
   *  task_id?:string,
   * 	owner_type?: string,
   *	owner_fk?: string,
   *	subject?: string,
   *	type?: string,
   *	type_sub?: string,
   *	status?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  taskController.findAll = async (where, { include, transaction } = {}) => {
    const records = await taskModel.findAll({
      where: { ...where, is_deleted: 0 },
      transaction,
      include,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one task record
   * @param {{
   * 	task_id?:string,
   * 	owner_type?: string,
   *	owner_fk?: string,
   *	subject?: string,
   *	type?: string,
   *	type_sub?: string,
   *	status?: string,
   *	updated_by?: string
   * }} where
   * @param {{ order?:Array, include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  taskController.findOne = async (
    where,
    { order, include, transaction } = {},
  ) => {
    const funcName = 'taskController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await taskModel.findOne({
      where: { ...where, is_deleted: 0 },
      transaction,
      include,
      order,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete task record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  taskController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'taskController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await taskModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return taskController;
};
