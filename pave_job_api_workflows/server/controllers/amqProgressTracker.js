const h = require('../helpers');
module.exports.makeController = (models) => {
  const { amq_progress_tracker: amqProgressTrackerModel } = models;

  const amqProgressTrackerController = {};

  /**
   * Create amq_progress_tracker record
   * @param {{
   * 	agency_fk: string,
   * 	type: string,
   * 	success?: number,
   * 	error?: number,
   *  total?: number,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  amqProgressTrackerController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'amqProgressTrackerController.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, type, success, error, total, created_by } = record;
    const amq_progress_tracker_id = h.general.generateId();
    await amqProgressTrackerModel.create(
      {
        amq_progress_tracker_id,
        agency_fk,
        type,
        success,
        error,
        total,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return amq_progress_tracker_id;
  };

  /**
   * Update amq_progress_tracker record
   * @param {string} amq_progress_tracker_id
   * @param {{
   * 	agency_fk: string,
   * 	type: string,
   * 	success?: number,
   * 	error?: number,
   *  total?: number,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  amqProgressTrackerController.update = async (
    amq_progress_tracker_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'amqProgressTrackerController.update';
    h.validation.requiredParams(funcName, { amq_progress_tracker_id, record });
    const { agency_fk, type, success, error, total, updated_by } = record;
    await amqProgressTrackerModel.update(
      {
        agency_fk,
        type,
        success,
        error,
        total,
        updated_by,
      },
      { where: { amq_progress_tracker_id }, transaction },
    );
    return amq_progress_tracker_id;
  };

  /**
   * Find all amq_progress_tracker records
   * @param {{
   *  amq_progress_tracker_id?: string,
   * 	agency_fk: string,
   * 	type: string,
   * 	success?: number,
   * 	error?: number,
   *  total?: number,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  amqProgressTrackerController.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'amqProgressTrackerController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await amqProgressTrackerModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one amq_progress_tracker record
   * @param {{
   *  amq_progress_tracker_id?: string,
   * 	agency_fk: string,
   * 	type: string,
   * 	success?: number,
   * 	error?: number,
   *  total?: number,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  amqProgressTrackerController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'amqProgressTrackerController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await amqProgressTrackerModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete amq_progress_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  amqProgressTrackerController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'amqProgressTrackerController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await amqProgressTrackerModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  amqProgressTrackerController.addSuccess = async (
    amq_progress_tracker_id,
    amount,
    { transaction } = {},
  ) => {
    await amqProgressTrackerModel.increment(
      {
        success: amount,
      },
      { where: { amq_progress_tracker_id }, transaction },
    );
  };

  amqProgressTrackerController.addError = async (
    amq_progress_tracker_id,
    amount,
    { transaction } = {},
  ) => {
    await amqProgressTrackerModel.increment(
      {
        error: amount,
      },
      { where: { amq_progress_tracker_id }, transaction },
    );
  };

  return amqProgressTrackerController;
};
