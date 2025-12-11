const h = require('../helpers');

/**
 * Controller for Leads
 *
 * @var
 * @name module
 * @type {{ exports: typeof module.exports; }}
 */
module.exports.makeController = (models) => {
  const { leads: model } = models;
  const ctr = {};

  /**
   * Create record
   * @param record: {
   * 	email?: string,
   * 	mobile?: string,
   * 	source?: string,
   * }
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const { email, mobile, source } = record;
    const lead_id = h.general.generateId();
    await model.create(
      {
        lead_id,
        email,
        mobile,
        source,
      },
      { transaction },
    );
    return lead_id;
  };

  /**
   * Update record
   * @param {{
   * 	lead_id: string,
   * }} lead_id
   * @param {{
   * 	email?: string,
   * 	mobile?: string,
   * 	source?: string,
   * }}
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  ctr.update = async (lead_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      lead_id,
      record,
    });
    const { email, mobile, source } = record;
    await model.update(
      {
        email,
        mobile,
        source,
      },
      { where: { lead_id }, transaction },
    );
    return lead_id;
  };

  /**
   * Find all record
   * @param {{
   * 	lead_id: string,
   * 	email: string,
   *  mobile: string
   *  source: string
   * }} where
   * @param {{ order?:object, include?:object, transaction?:object, attributes?:object }} [options]
   * @returns {Promise<Object>}
   */
  ctr.findAll = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'ctr.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.findAll({
      where: { ...where },
      transaction,
      include,
      order,
      attributes,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one record
   * @param {{
   * 	lead_id: string,
   * 	email: string,
   *  mobile: string
   *  source: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  ctr.findOne = async (where, { transaction, include } = {}) => {
    const funcName = 'ctr.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroy = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Hard delete All
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroyAll = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findAll({
      where: { ...where },
      transaction,
    });
    if (record) await model.destroy({ where: { ...where } }, { transaction });
  };

  return ctr;
};
