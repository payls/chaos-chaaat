const h = require('../helpers');

module.exports.makeController = (models) => {
  const { agency_oauth: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const {
      source = 'MINDBODY',
      status = 'inactive',
      agency_fk,
      created_by,
      access_info = {},
      webhook_info = null,
      crm_timeslot_settings,
    } = record;
    const agency_oauth_id = h.general.generateId();
    await model.create(
      {
        agency_oauth_id,
        source,
        status,
        agency_fk,
        created_by,
        access_info,
        webhook_info,
        crm_timeslot_settings,
      },
      { transaction },
    );
    return agency_oauth_id;
  };

  ctr.update = async (agency_oauth_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      agency_oauth_id,
      record,
    });
    const {
      source,
      status,
      agency_fk,
      created_by,
      access_info,
      webhook_info,
      crm_timeslot_settings,
    } = record;
    await model.update(
      {
        source,
        status,
        agency_fk,
        created_by,
        access_info,
        webhook_info,
        crm_timeslot_settings,
      },
      { where: { agency_oauth_id }, transaction },
    );
    return agency_oauth_id;
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

  ctr.findOne = async (where, { order, transaction, include } = {}) => {
    const funcName = 'ctr.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
      include,
      order,
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
