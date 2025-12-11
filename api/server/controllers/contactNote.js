const h = require('../helpers');
const MindBodyAPI = require('../services/mindBodyApi');

module.exports.makeController = (models) => {
  const { contact_note: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const { contact_fk, agency_user_fk, note } = record;
    const contact_note_id = h.general.generateId();
    await model.create(
      {
        contact_note_id,
        contact_fk,
        agency_user_fk,
        note,
      },
      { transaction },
    );
    return contact_note_id;
  };

  ctr.update = async (contact_note_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      contact_note_id,
      record,
    });
    const { contact_fk, agency_user_fk, note } = record;
    await model.update(
      {
        contact_fk,
        agency_user_fk,
        note,
      },
      { where: { contact_note_id }, transaction },
    );
    return contact_note_id;
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
