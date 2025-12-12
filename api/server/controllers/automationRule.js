const h = require('../helpers');

module.exports.makeController = (models) => {
  const { automation_rule: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const {
      name,
      description,
      automation_category_fk,
      exclude_package,
      rule_trigger_fk,
      rule_trigger_setting,
      rule_trigger_setting_count,
      workflow_timeout_type,
      workflow_timeout_count,
      status = 'inactive',
    } = record;
    const automation_rule_id = h.general.generateId();
    await model.create(
      {
        automation_rule_id,
        name,
        description,
        automation_category_fk,
        exclude_package,
        rule_trigger_fk,
        rule_trigger_setting,
        rule_trigger_setting_count,
        status,
        workflow_timeout_type,
        workflow_timeout_count,
      },
      { transaction },
    );
    return automation_rule_id;
  };

  ctr.update = async (automation_rule_id, record, { transaction } = {}) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      automation_rule_id,
      record,
    });
    const {
      name,
      description,
      automation_category_fk,
      exclude_package,
      rule_trigger_fk,
      rule_trigger_setting,
      rule_trigger_setting_count,
      workflow_timeout_type,
      workflow_timeout_count,
      status,
    } = record;
    await model.update(
      {
        name,
        description,
        automation_category_fk,
        exclude_package,
        rule_trigger_fk,
        rule_trigger_setting,
        rule_trigger_setting_count,
        workflow_timeout_type,
        workflow_timeout_count,
        status,
      },
      { where: { automation_rule_id }, transaction },
    );
    return automation_rule_id;
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

  /**
   * Count automation rule record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.count = async (
    where,
    { include, transaction, subQuery, order, group } = {},
  ) => {
    const funcName = 'ctr.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.count({
      where: { ...where },
      subQuery,
      include,
      transaction,
      order,
      group,
      raw: true,
    });
    return h.database.formatData(records);
  };

  return ctr;
};
