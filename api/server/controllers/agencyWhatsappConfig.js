const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { agency_whatsapp_config: agencyWhatsAppConfigModel } = models;

  const agencyWhatsappConfigCtl = {};

  /**
   * Create agency_whatsapp_config record
   * @param {{
   *  agency_fk: string,
   *  whatsapp_onboarding_fk: string,
   *  waba_name: { type: 'string' },
   *  waba_number: { type: 'string' },
   *  agency_whatsapp_api_token: { type: 'string' },
   *  agency_whatsapp_api_secret: { type: 'string' },
   *  agency_waba_template_token: { type: 'string' },
   *  agency_waba_template_secret: { type: 'string' },
   *  trial_number: { type: 'boolean' },
   *  trial_number_to_use: { type: 'boolean' },
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyWhatsappConfigCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyWhatsappConfigCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      whatsapp_onboarding_fk,
      waba_name,
      waba_number,
      agency_waba_id,
      agency_whatsapp_api_token,
      agency_whatsapp_api_secret,
      agency_waba_template_token,
      agency_waba_template_secret,
      trial_number,
      trial_number_to_use,
      trial_code,
      is_active,
      created_by,
    } = record;
    const agency_whatsapp_config_id = h.general.generateId();
    await agencyWhatsAppConfigModel.create(
      {
        agency_whatsapp_config_id,
        agency_fk,
        whatsapp_onboarding_fk,
        waba_name,
        waba_number,
        agency_waba_id,
        agency_whatsapp_api_token,
        agency_whatsapp_api_secret,
        agency_waba_template_token,
        agency_waba_template_secret,
        trial_number,
        trial_number_to_use,
        trial_code,
        is_active,
        created_by,
      },
      { transaction },
    );

    return agency_whatsapp_config_id;
  };

  /**
   * Update agency_whatsapp_config record
   * @param {string} agency_whatsapp_config_id
   * @param {{
   *  waba_name: { type: 'string' },
   *  waba_number: { type: 'string' },
   *  agency_waba_id: { type: 'string' },
   *  agency_whatsapp_api_token: { type: 'string' },
   *  agency_whatsapp_api_secret: { type: 'string' },
   *  agency_waba_template_token: { type: 'string' },
   *  agency_waba_template_secret: { type: 'string' },
   *  updated_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyWhatsappConfigCtl.update = async (
    agency_whatsapp_config_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'agencyWhatsappConfigCtl.update';
    h.validation.requiredParams(funcName, { record });
    record.updated_by = updated_by;
    await agencyWhatsAppConfigModel.update(record, {
      where: { agency_whatsapp_config_id },
      transaction,
    });

    return agency_whatsapp_config_id;
  };

  /**
   * Find all agency whatsapp config records
   * @param {{
   *  agency_whatsapp_config_id: string,
   *  agency_fk: string,
   *  whatsapp_onboarding_fk: string,
   *  waba_name: string,
   *  waba_number: string,
   *  agency_whatsapp_api_token: string,
   *  agency_whatsapp_api_secret: string,
   *  agency_waba_id: string,
   *  agency_waba_template_token: string,
   *  agency_waba_template_secret: string,
   *  waba_status: string,
   *  waba_quality: string,
   *  trial_number: { type: 'boolean' },
   *  trial_number_to_use: { type: 'boolean' },
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyWhatsappConfigCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'agencyWhatsappConfigCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyWhatsAppConfigModel.findAll({
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
   * Find one agency whatsapp config records
   * @param {{
   *  agency_whatsapp_config_id: string,
   *  agency_fk: string,
   *  whatsapp_onboarding_fk: string,
   *  waba_name: string,
   *  agency_whatsapp_api_token: string,
   *  agency_whatsapp_api_secret: string,
   *  agency_waba_id: string,
   *  agency_waba_template_token: string,
   *  agency_waba_template_secret: string,
   *  waba_status: string,
   *  waba_quality: string,
   *  trial_number: { type: 'boolean' },
   *  trial_number_to_use: { type: 'boolean' },
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyWhatsappConfigCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'agencyWhatsappConfigCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyWhatsAppConfigModel.findOne({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(record);
  };

  /**
   * Find all agency whatsapp config list
   *  agency_whatsapp_config_id: string,
   *  agency_fk: string,
   *  waba_name: string,
   *  waba_number: string,
   *  agency_waba_id: string,
   *  waba_status: string,
   *  waba_quality: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyWhatsappConfigCtl.getWABACredentialList = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'agencyWhatsappConfigCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyWhatsAppConfigModel.findAll({
      where: { ...where },
      attributes: [
        'agency_whatsapp_config_id',
        'agency_fk',
        'waba_name',
        'waba_number',
        'agency_waba_id',
        'waba_status',
        'waba_quality',
        'daily_messaging_limit',
      ],
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
   * Get selected agency whatsapp config records
   * @param {{
   *  agency_whatsapp_config_id: string,
   *  agency_fk: string,
   *  waba_name: string,
   *  agency_waba_id: string,
   *  waba_status: string,
   *  waba_quality: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyWhatsappConfigCtl.getSelectedWABACredential = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'agencyWhatsappConfigCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyWhatsAppConfigModel.findOne({
      where: { ...where },
      attributes: [
        'agency_whatsapp_config_id',
        'agency_fk',
        'waba_name',
        'waba_number',
        'agency_waba_id',
        'waba_status',
        'waba_quality',
        'daily_messaging_limit',
      ],
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Delete agency_whatsapp_config record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyWhatsappConfigCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'agencyWhatsappConfigCtl.delete';
    h.validation.requiredParams(funcName, { where });
    const record = await agencyWhatsAppConfigModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Description
   * Function to update waba details and status based on UIB response
   * @async
   * @function
   * @name processWABADetailsUpdate
   * @kind function
   * @param {string} to_process_waba_id waba id of the number to be processed
   * @param {string} waba_config_id waba config id in database
   * @param {object} wabaStatusResponse waba details api response
   */
  agencyWhatsappConfigCtl.processWABADetailsUpdate = async (
    to_process_waba_id,
    waba_config_id,
    wabaStatusResponse,
    log,
  ) => {
    const wabaDetails = wabaStatusResponse.info;
    const agency_whatsapp_config = await agencyWhatsappConfigCtl.findOne({
      agency_whatsapp_config_id: waba_config_id,
    });

    for (let index = 0; index < wabaDetails.length; index++) {
      const waba_number = wabaStatusResponse.info[index].phone_number;
      const formatted_waba_number = waba_number.replace(/\D/g, '');
      const waba_rating = wabaStatusResponse.info[index].quality_rating;
      const waba_status = wabaStatusResponse.info[index].status;
      const waba_limit = wabaStatusResponse.info[index].messaging_limit;
      let daily_limit = null;
      if (h.notEmpty(waba_limit)) {
        const limitArr = waba_limit.split('_');
        console.info(limitArr);
        const tier = limitArr[1];
        if (tier.includes('K')) {
          daily_limit = tier.replace('K', '000');
        } else {
          daily_limit = tier;
        }
      }

      log.info({
        message: 'CHECKING IF FOR SAME NUMBER',
        formatted_waba_number,
        db_number: agency_whatsapp_config.waba_number,
      });

      log.info({
        waba_status: waba_status,
        waba_quality: waba_rating,
        daily_messaging_limit: daily_limit,
        agency_whatsapp_config_id: waba_config_id,
      });
      if (h.cmpStr(formatted_waba_number, agency_whatsapp_config.waba_number)) {
        log.info({
          message: `Updating WABA Number ${formatted_waba_number} Status Details under record with WABA ID ${to_process_waba_id}`,
          to_process_waba_id,
          to_process_waba_number: agency_whatsapp_config.waba_number,
          waba_number: formatted_waba_number,
          waba_status: waba_status,
          waba_quality: waba_rating,
          daily_messaging_limit: daily_limit,
          agency_whatsapp_config_id: waba_config_id,
        });
        await agencyWhatsappConfigCtl.processWABANumberStatusUpdate(
          waba_config_id,
          waba_status,
          waba_rating,
          daily_limit,
        );
      } else {
        log.info({
          message: `Skip process WABA Number ${formatted_waba_number}, same WABA ID but different number`,
          to_process_waba_id,
          to_process_waba_number: agency_whatsapp_config.waba_number,
          waba_number: formatted_waba_number,
          waba_status: waba_status,
          waba_quality: waba_rating,
          daily_messaging_limit: daily_limit,
          agency_whatsapp_config_id: waba_config_id,
        });
      }
    }
  };

  /**
   * Description
   * Function to complete update of waba number status details
   * @async
   * @name processWABANumberStatusUpdate
   * @param {string} waba_config_id waba config id in database
   * @param {string} waba_status new status
   * @param {string} waba_rating new rating
   * @param {string} daily_limit new limit
   */
  agencyWhatsappConfigCtl.processWABANumberStatusUpdate = async (
    waba_config_id,
    waba_status,
    waba_rating,
    daily_limit,
  ) => {
    const transaction = await models.sequelize.transaction();
    try {
      await models.agency_whatsapp_config.update(
        {
          waba_status: waba_status,
          waba_quality: waba_rating,
          daily_messaging_limit: daily_limit,
          updated_date: new Date(),
        },
        {
          where: {
            agency_whatsapp_config_id: waba_config_id,
          },
          transaction,
        },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error({
        err,
      });
      throw new Error(err);
    }
  };

  /**
   * Count agency whatsapp config record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyWhatsappConfigCtl.count = async (
    where,
    { include, transaction, subQuery, order, group } = {},
  ) => {
    const funcName = 'agencyWhatsappConfigCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyWhatsAppConfigModel.count({
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

  return agencyWhatsappConfigCtl;
};
