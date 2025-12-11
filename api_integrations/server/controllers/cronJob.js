const h = require('../helpers');

module.exports.makeCronJobController = (models) => {
  const { cron_job: cronJobModel } = models;

  const cronJobController = {};

  /**
   * Create cron_job record
   * @param {{
   *  type: string,
   *  payload: string|object,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  cronJobController.create = async (record, { transaction } = {}) => {
    let { type, payload, created_by } = record;
    const funcName = 'cronJobController.create';
    h.validation.requiredParams(funcName, record);
    if (typeof payload !== 'string') payload = JSON.stringify(payload);
    const cron_job_id = h.general.generateId();
    await cronJobModel.create(
      {
        cron_job_id,
        type,
        payload,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );

    return cron_job_id;
  };

  /**
   * Update  cron_job record
   * @param {string}  cron_job_id
   * @param {{
   *  type: string,
   *  payload: string|object,
   * 	created_by: string,
   * 	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  cronJobController.update = async (
    cron_job_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'cronJobController.update';
    h.validation.requiredParams(funcName, { cron_job_id, record });
    let { payload, num_try } = record;
    const body = {};
    if (payload) body.payload = payload;
    if (num_try) body.num_try = num_try;
    if (typeof payload !== 'string') {
      payload = JSON.stringify(payload);
    }
    await cronJobModel.update(body, { where: { cron_job_id }, transaction });

    return cron_job_id;
  };

  /**
   * Find all  cron_job records
   * @param {{
   *  cron_job_id?: string,
   *  type: string,
   *  created_date?: date,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  cronJobController.findAll = async (where, { transaction } = {}) => {
    const funcName = 'cronJobController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await cronJobModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one  cron_job record
   * @param {{
   *  cron_job_id?: string,
   *  type: string,
   *  payload: string|object,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  cronJobController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'cronJobController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await cronJobModel.findOne({
      where,
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Find or create a cron_job
   * @param where
   * @param defaults
   * @param transaction
   * @returns {Promise<{created: *, record: (Object|Array)}>}
   */
  cronJobController.findOrCreate = async (
    where,
    defaults,
    { transaction } = {},
  ) => {
    const funcName = 'cronJobController.findOrCreate';

    /* Implementation using the findOrCreate from sequelize */
    h.validation.requiredParams(funcName, { where, defaults });

    let { type, payload, num_try, created_by } = defaults;

    h.validation.requiredParams(funcName, { type, payload, num_try });
    if (typeof payload !== 'string') {
      payload = JSON.stringify(payload);
    }
    const cron_job_id = h.general.generateId();

    const [record, created] = await cronJobModel.findOrCreate({
      where: { ...where },
      defaults: {
        cron_job_id,
        type,
        payload,
        num_try,
        created_by,
        updated_by: created_by,
      },
      transaction,
    });
    return { record: h.database.formatData(record), created: created };
  };

  /**
   * Hard delete cron_job record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  cronJobController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'cronJobController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await cronJobModel.findOne({
      where,
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return cronJobController;
};
