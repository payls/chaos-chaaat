const h = require('../helpers');

module.exports.makeController = (models) => {
  const { automation_category: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const { title, description, agency_fk, platform } = record;
    const automation_category_id = h.general.generateId();
    await model.create(
      {
        automation_category_id,
        agency_fk,
        title,
        description,
        platform,
      },
      { transaction },
    );
    return automation_category_id;
  };

  ctr.update = async (automation_category_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      automation_category_id,
      record,
    });
    const { contact_fk, payload, platform } = record;
    await model.update(
      {
        contact_fk,
        payload,
        platform,
      },
      { where: { automation_category_id }, transaction },
    );
    return automation_category_id;
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
