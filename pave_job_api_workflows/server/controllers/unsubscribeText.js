const h = require('../helpers');
const { Op } = require('sequelize');

module.exports.makeController = (models) => {
  const { unsubscribe_text: lineFollowerModel } = models;

  const unsubscribeTextCtl = {};

  /**
   * Create unsubscribe_text record
   * @param {{
   *  agency_fk: string,
   *  content: string,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  unsubscribeTextCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'unsubscribeTextCtl.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, content, created_by } = record;
    const unsubscribe_text_id = h.general.generateId();
    await lineFollowerModel.create(
      {
        unsubscribe_text_id,
        agency_fk,
        content,
        created_by,
      },
      { transaction },
    );

    return unsubscribe_text_id;
  };

  /**
   * Update unsubscribe_text record
   * @param {string} unsubscribe_text_id
   * @param {{
   *  agency_fk: string,
   *  content: string,,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  unsubscribeTextCtl.update = async (
    unsubscribe_text_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'unsubscribeTextCtl.update';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, content } = record;

    await lineFollowerModel.update(
      {
        agency_fk,
        content,
        updated_by,
      },
      {
        where: { unsubscribe_text_id },
        transaction,
      },
    );

    return unsubscribe_text_id;
  };

  /**
   * Find all unsubscribe_text records
   * @param {{
   *  unsubscribe_text_id: string,
   *  agency_fk: string,
   *  content: string,,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  unsubscribeTextCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'unsubscribeTextCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lineFollowerModel.findAll({
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
   * Find one unsubscribe_text record
   * @param {{
   *  unsubscribe_text_id: string,
   *  agency_fk: string,
   *  content: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  unsubscribeTextCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'unsubscribeTextCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await lineFollowerModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete unsubscribe_text record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  unsubscribeTextCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'unsubscribeTextCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await lineFollowerModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return unsubscribeTextCtl;
};
