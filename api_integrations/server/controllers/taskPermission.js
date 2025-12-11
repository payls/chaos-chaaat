const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeTaskPermissionController = (models) => {
  const { task_permission: taskPermissionModel } = models;
  const taskMessagePermissionController = {};

  /**
   * Create task permission record
   * @param {{
   * 	task_fk: string,
   *	owner_type: string,
   *	owner_fk: string,
   *	action: string,
   *	permission: number,
   *	created_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskMessagePermissionController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessagePermissionController.create';
    h.validation.requiredParams(funcName, { record });
    const { task_fk, owner_type, owner_fk, action, permission, created_by } =
      record;
    h.validation.requiredParams(funcName, {
      task_fk,
      owner_type,
      owner_fk,
      action,
      permission,
    });
    h.validation.validateConstantValue(
      funcName,
      { owner_type: constant.OWNER.TYPE, action: constant.PERMISSION.ACTION },
      { owner_type, action },
    );
    const task_permission_id = h.general.generateId();
    await taskPermissionModel.create(
      {
        task_permission_id,
        task_fk,
        owner_type,
        owner_fk,
        action,
        permission,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return task_permission_id;
  };

  /**
   * Update task permission record
   * @param {string} task_permission_id
   * @param {{
   * 	task_fk?: string,
   *	owner_type?: string,
   *	owner_fk?: string,
   *	action?: string,
   *	permission?: number,
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  taskMessagePermissionController.update = async (
    task_permission_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessagePermissionController.update';
    h.validation.requiredParams(funcName, { task_permission_id, record });
    const { task_fk, owner_type, owner_fk, action, permission, updated_by } =
      record;
    h.validation.validateConstantValue(
      funcName,
      { owner_type: constant.OWNER.TYPE, action: constant.PERMISSION.ACTION },
      { owner_type, action },
    );
    await taskPermissionModel.update(
      {
        task_fk,
        owner_type,
        owner_fk,
        action,
        permission,
        updated_by,
      },
      { where: { task_permission_id }, transaction },
    );
    return task_permission_id;
  };

  /**
   * Find task permission records
   * @param {{
   *  task_permission_id?:string,
   * 	owner_type?: string,
   *	owner_fk?: string,
   *	action?: string,
   *	permission?: number,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  taskMessagePermissionController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const records = await taskPermissionModel.findAll({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one task permission record
   * @param {{
   * 	task_permission_id?:string,
   * 	owner_type?: string,
   *	owner_fk?: string,
   *	action?: string,
   *	permission?: number,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  taskMessagePermissionController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'taskMessagePermissionController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await taskPermissionModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete task permission record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  taskMessagePermissionController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessagePermissionController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await taskPermissionModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Checks whether user has access to a particular task
   * @param {string} owner_type
   * @param {string} owner_fk
   * @param {string} task_fk
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Boolean>}
   */
  taskMessagePermissionController.canUserAccessTask = async (
    owner_type,
    owner_fk,
    task_fk,
    { transaction } = {},
  ) => {
    const funcName = 'taskMessagePermissionController.canUserAccessTask';
    h.validation.requiredParams(funcName, { owner_type, owner_fk, task_fk });
    h.validation.validateConstantValue(
      funcName,
      { owner_type: constant.OWNER.TYPE },
      { owner_type },
    );
    const record = await taskMessagePermissionController.findOne(
      { owner_type, owner_fk, task_fk },
      { transaction },
    );
    return h.notEmpty(record);
  };

  return taskMessagePermissionController;
};
