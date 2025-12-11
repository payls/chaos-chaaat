const h = require('../helpers');
const { Op } = require('sequelize');

module.exports.makeController = (models) => {
  const { line_follower: lineFollowerModel } = models;

  const lineFollowerCtl = {};

  /**
   * Create line_follower record
   * @param {{
   *  agency_fk: string,
   *  agency_channel_config_fk: string,
   *  contact_fk: string,
   *  line_user_fk: string,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lineFollowerCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'lineFollowerCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      agency_channel_config_fk,
      contact_fk,
      line_user_fk,
      created_by,
    } = record;
    const line_follower_id = h.general.generateId();
    await lineFollowerModel.create(
      {
        line_follower_id,
        agency_fk,
        agency_channel_config_fk,
        contact_fk,
        line_user_fk,
        created_by,
      },
      { transaction },
    );

    return line_follower_id;
  };

  /**
   * Update line_follower record
   * @param {string} line_follower_id
   * @param {{
   *  agency_fk: string,
   *  agency_channel_config_fk: string,
   *  contact_fk: string,
   *  line_user_fk: string,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lineFollowerCtl.update = async (
    line_follower_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'lineFollowerCtl.update';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, agency_channel_config_fk, contact_fk, line_user_fk } =
      record;

    await lineFollowerModel.update(
      {
        agency_fk,
        agency_channel_config_fk,
        contact_fk,
        line_user_fk,
        updated_by,
      },
      {
        where: { line_follower_id },
        transaction,
      },
    );

    return line_follower_id;
  };

  /**
   * Find all line_follower records
   * @param {{
   *  line_follower_id: string,
   *  agency_fk: string,
   *  agency_channel_config_fk: string,
   *  contact_fk: string,
   *  line_user_fk: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  lineFollowerCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'lineFollowerCtl.findAll';
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
   * Find one line_follower record
   * @param {{
   *  line_follower_id: string,
   *  agency_fk: string,
   *  agency_channel_config_fk: string,
   *  contact_fk: string,
   *  line_user_fk: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  lineFollowerCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'lineFollowerCtl.findOne';
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
   * Hard delete line_follower record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  lineFollowerCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'lineFollowerCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await lineFollowerModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return lineFollowerCtl;
};
