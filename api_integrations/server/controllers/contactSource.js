const h = require('../helpers');

module.exports.makeContactSourceController = (models) => {
  const { contact_source: contactSourceModel } = models;
  const contactSourceController = {};

  /**
   * Create contact record
   * @param {{
   *  contact_source_id: string,
   *  contact_fk: string,
   *  source_contact_id: string,
   *  source_type: string,
   *  source_meta?: string,
   *  source_original_payload?: string,
   *  created_by: string,
   *  updated_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSourceController.create = async (record, { transaction } = {}) => {
    const funcName = 'contactSourceController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      contact_fk,
      created_by,
      source_type,
      source_meta,
      source_original_payload,
      source_contact_id,
    } = record;
    const contact_source_id = h.general.generateId();
    await contactSourceModel.create(
      {
        contact_source_id,
        contact_fk,
        source_contact_id,
        source_type,
        source_meta,
        source_original_payload,
        created_by,
      },
      { transaction },
    );
    return contact_source_id;
  };

  /**
   * Create contact source record
   * @param {{
   *  first_name?: string,
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSourceController.findAll = async (where, { include } = {}) => {
    const contact_sources = await contactSourceModel.findAll({
      where: {
        ...where,
      },
      include,
    });
    return contact_sources;
  };

  /**
   * Find contact source record
   * @param {{
   *  first_name?: string,
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSourceController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const contact_source = await contactSourceModel.findOne({
      where: {
        ...where,
      },
      include,
      transaction,
    });
    return contact_source;
  };

  /**
   * Find contact source record
   * @param {{
   *  first_name?: string,
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSourceController.update = async (
    where,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactSourceController.update';
    h.validation.requiredParams(funcName, { where, record });
    await contactSourceModel.update(
      {
        ...record,
      },
      { where: { ...where }, transaction },
    );
    return where.contact_fk;
  };

  /**
   * Find contact source record
   * @param {{
   * first_name?: string,
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSourceController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactSourceController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactSourceController.findOne(where);
    if (record) await record.destroy({ transaction });
    return record;
  };

  return contactSourceController;
};
