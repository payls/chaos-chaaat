const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { unsubscribe_text: unsubscribeTextModel } = models;

  const unsubscribeText = {};

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
  unsubscribeText.create = async (record, { transaction } = {}) => {
    const funcName = 'unsubscribeText.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, content, created_by } = record;
    const unsubscribe_text_id = h.general.generateId();
    await unsubscribeTextModel.create(
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
   *  content: string,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  unsubscribeText.update = async (
    unsubscribe_text_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'unsubscribeText.update';
    h.validation.requiredParams(funcName, { record });
    await unsubscribeTextModel.update(
      {
        ...record,
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
   *  content: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  unsubscribeText.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'unsubscribeText.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await unsubscribeTextModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      group,
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
  unsubscribeText.findOne = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'unsubscribeText.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await unsubscribeTextModel.findOne({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete unsubscribe_text record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  unsubscribeText.destroy = async (where, { transaction } = {}) => {
    const funcName = 'unsubscribeText.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await unsubscribeTextModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return unsubscribeText;
};
