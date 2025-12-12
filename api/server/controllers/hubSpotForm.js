const h = require('../helpers');

module.exports.makeController = (models) => {
  const { hubspot_form: model } = models;
  const ctr = {};

  /**
   * Create hubspot form record
   * @param {{
   *  agency_id: string,
   *  form_id: string,
   *  form_name: string,
   *  type: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_id, form_id, form_name, type } = record;

    try {
      const hubspot_form_id = h.general.generateId();
      await model.create(
        {
          hubspot_form_id,
          agency_fk: agency_id,
          form_id,
          form_name,
          type,
        },
        { transaction },
      );
      return hubspot_form_id;
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * Update hubspot form record
   * @param {string} hubspot_form_id
   * @param {{
   *  agency_id: string,
   *  form_id: string,
   *  form_name: string,
   *  type: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  ctr.update = async (hubspot_form_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, { hubspot_form_id, record });
    try {
      if (h.notEmpty(record.agency_id)) {
        record.agency_fk = record.agency_id;
        delete record.agency_id;
      }
      await model.update(record, { where: { hubspot_form_id }, transaction });
      return hubspot_form_id;
    } catch (error) {
      throw new Error(error);
    }
  };

  ctr.findAll = async (where, { order, include, transaction } = {}) => {
    const funcName = 'ctr.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.findAll({
      where: { ...where },
      transaction,
      include,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one landing page record
   * @param {{
   * 	agency_fk: string,
   * 	landing_page: string,
   *  landing_page_slug: string
   * 	status: string,
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
