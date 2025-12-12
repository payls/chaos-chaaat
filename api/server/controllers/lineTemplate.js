const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { line_template: lineTemplateModel } = models;

  const lineTemplate = {};

  /**
   * Create line_template record
   * @param {{
   *  agency_fk: string,
   *  template_name: string,
   *  template_type: string,
   *  line_channel: string,
   *  content: text,
   *  status: string,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lineTemplate.create = async (record, { transaction } = {}) => {
    const funcName = 'lineTemplate.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      template_name,
      template_type,
      line_channel,
      content,
      status,
      created_by,
    } = record;
    const line_template_id = h.general.generateId();
    await lineTemplateModel.create(
      {
        line_template_id,
        agency_fk,
        template_name,
        template_type,
        line_channel,
        content,
        status,
        created_by,
      },
      { transaction },
    );

    return line_template_id;
  };

  /**
   * Update line_template record
   * @param {string} line_template_id
   * @param {{
   *  agency_fk: string,
   *  template_name: string,
   *  template_type: string,
   *  line_channel: string,
   *  content: text,
   *  status: string,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lineTemplate.update = async (
    line_template_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'lineTemplate.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      template_name,
      template_type,
      line_channel,
      content,
      status,
    } = record;

    await lineTemplateModel.update(
      {
        agency_fk,
        template_name,
        template_type,
        line_channel,
        content,
        status,
        updated_by,
      },
      {
        where: { line_template_id },
        transaction,
      },
    );

    return line_template_id;
  };

  /**
   * Find all line_template records
   * @param {{
   *  line_template_id: string,
   *  agency_fk: string,
   *  template_name: string,
   *  template_type: string,
   *  line_channel: string,
   *  content: text,
   *  status: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  lineTemplate.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'lineTemplate.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lineTemplateModel.findAll({
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
   * Find one line_template record
   * @param {{
   *  line_template_id: string,
   *  agency_fk: string,
   *  template_name: string,
   *  template_type: string,
   *  line_channel: string,
   *  content: text,
   *  status: string,
   *  last_edit_date: date,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  lineTemplate.findOne = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'lineTemplate.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await lineTemplateModel.findOne({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete line_template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  lineTemplate.destroy = async (where, { transaction } = {}) => {
    const funcName = 'lineTemplate.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await lineTemplateModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return lineTemplate;
};
