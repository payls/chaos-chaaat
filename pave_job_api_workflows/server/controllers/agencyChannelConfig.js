const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');
module.exports.makeController = (models) => {
  const { agency_channel_config: agencyChannelConfigModel } = models;
  const agencyChannelConfigCtl = {};

  /**
   * Create agency record
   * @param {{
   * 	agency_fk: string,
   *  channel_id: string,
   *  channel_name: string,
   *  bot_id: string,
   *  bot_id: string,
   *  channel_type: string,
   *  sent_opt_in_message: string,
   *  opt_in_message: string,
   *  uib_api_token: string,
   *  uib_api_secret: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyChannelConfigCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyChannelConfigCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      channel_id,
      channel_name,
      bot_id,
      channel_type,
      sent_opt_in_message,
      opt_in_message,
      uib_api_token,
      uib_api_secret,
      created_by,
    } = record;
    const agency_channel_config_id = h.general.generateId();
    await agencyChannelConfigModel.create(
      {
        agency_channel_config_id,
        agency_fk,
        channel_id,
        channel_name,
        bot_id,
        channel_type,
        sent_opt_in_message,
        opt_in_message,
        uib_api_token,
        uib_api_secret,
        created_by,
      },
      { transaction },
    );
    return agency_channel_config_id;
  };

  /**
   * Update agency record
   * @param {string} agency_channel_config_id
   * @param {{
   * 	agency_fk: string,
   *  channel_id: string,
   *  channel_name: string,
   *  bot_id: string,
   *  bot_id: string,
   *  channel_type: string,
   *  sent_opt_in_message: string,
   *  opt_in_message: string,
   *  uib_api_token: string,
   *  uib_api_secret: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyChannelConfigCtl.update = async (
    agency_channel_config_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyChannelConfigCtl.update';
    h.validation.requiredParams(funcName, { agency_channel_config_id, record });
    const {
      agency_fk,
      channel_id,
      channel_name,
      bot_id,
      channel_type,
      sent_opt_in_message,
      opt_in_message,
      uib_api_token,
      uib_api_secret,
      updated_by,
    } = record;
    await agencyChannelConfigModel.update(
      {
        agency_fk,
        channel_id,
        channel_name,
        bot_id,
        channel_type,
        sent_opt_in_message,
        opt_in_message,
        uib_api_token,
        uib_api_secret,
        updated_by,
      },
      { where: { agency_channel_config_id }, transaction },
    );
    return agency_channel_config_id;
  };
  /**
   * Find all agency channel config records
   * @param {{
   *  agency_channel_config_id: string,
   *  agency_fk: string,
   *  channel_id: string,
   *  channel_name: string,
   *  channel_type: string,
   *  uib_api_token: string,
   *  uib_api_secret: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyChannelConfigCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'agencyChannelConfigCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyChannelConfigModel.findAll({
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
   * Find one agency channel config records
   * @param {{
   *  agency_channel_config_id: string,
   *  agency_fk: string,
   *  channel_id: string,
   *  channel_name: string,
   *  channel_type: string,
   *  uib_api_token: string,
   *  uib_api_secret: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyChannelConfigCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'agencyChannelConfigCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyChannelConfigModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };
  return agencyChannelConfigCtl;
};
