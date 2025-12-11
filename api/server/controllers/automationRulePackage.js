const h = require('../helpers');

module.exports.makeController = (models) => {
  const { automation_rule_packages: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const { automation_rule_fk, package_fk } = record;
    const automation_rule_packages_id = h.general.generateId();
    await model.create(
      {
        automation_rule_packages_id,
        automation_rule_fk,
        package_fk,
      },
      { transaction },
    );
    return automation_rule_packages_id;
  };

  ctr.update = async (
    automation_rule_packages_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      automation_rule_packages_id,
      record,
    });
    const { automation_rule_fk, package_fk } = record;
    await model.update(
      {
        automation_rule_fk,
        package_fk,
      },
      { where: { automation_rule_packages_id }, transaction },
    );
    return automation_rule_packages_id;
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
