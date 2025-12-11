const h = require('../helpers');

/**
 * _create controller HOF
 * @param {*} models
 * @returns Promise
 */
function _create(models) {
  const { crm_settings: crmSettingModel } = models;
  /**
   * Create crm setting
   * @param {{
   * 	agency_fk: string,
   * 	agency_oauth_fk?: string,
   * 	channel_type?: string,
   * 	crm_type?: string,
   *  crm_timeslot_settings?: string,
   * 	screens_data? :string,
   *  automation_rule_template_fk?: string,
   *   created_by?:string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (record, { transaction } = {}) => {
    const funcName = 'crmSettingCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      agency_oauth_fk,
      channel_type,
      crm_type,
      crm_timeslot_settings,
      screens_data,
      automation_rule_template_fk,
      created_by,
    } = record;

    const crm_settings_id = h.general.generateId();
    await crmSettingModel.create(
      {
        crm_settings_id,
        agency_fk,
        agency_oauth_fk,
        channel_type,
        crm_type,
        crm_timeslot_settings,
        screens_data,
        automation_rule_template_fk,
        created_by,
        updated_by: created_by,
      },
      {
        transaction,
      },
    );

    return crm_settings_id;
  };
}

/**
 * _update controller HOF
 * @param {*} models
 * @returns Promise
 */
function _update(models) {
  const { crm_settings: crmSettingModel } = models;
  /**
   * Update crm setting
   * @param {string} crm_settings_id
   * @param {{
   * 	agency_fk: string,
   * 	agency_oauth_fk?: string,
   * 	channel_type?: string,
   *  crm_timeslot_settings?: string,
   * 	crm_type?: string,
   * 	screens_data? :string,
   *  automation_rule_template_fk?: string,
   *   created_by?:string,
   *  updated_by?:string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (crm_settings_id, record, { transaction } = {}) => {
    const funcName = 'crmSettingCtl.update';
    h.validation.requiredParams(funcName, { crm_settings_id, record });
    const {
      agency_fk,
      agency_oauth_fk,
      channel_type,
      crm_type,
      crm_timeslot_settings,
      screens_data,
      automation_rule_template_fk,
      created_by,
      updated_by,
    } = record;
    await crmSettingModel.update(
      {
        agency_fk,
        agency_oauth_fk,
        channel_type,
        crm_type,
        crm_timeslot_settings,
        screens_data,
        automation_rule_template_fk,
        created_by,
        updated_by: updated_by || created_by,
      },
      {
        where: { crm_settings_id },
        transaction,
      },
    );

    return crm_settings_id;
  };
}

/**
 * _findAll controller HOF
 * @param {*} models
 * @returns Promise
 */
function _findAll(models) {
  const { crm_settings: crmSettingModel } = models;
  /**
   * Find all crm setting records
   * @param {{
   *   crm_settings_id: string,
   * 	agency_fk: string,
   * 	agency_oauth_fk?: string,
   * 	channel_type?: string,
   *  crm_timeslot_settings?: string,
   * 	crm_type?: string,
   * 	screens_data? :string,
   *  automation_rule_template_fk?: string,
   *   created_by?:string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'crmSettingCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await crmSettingModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };
}

/**
 * _findOne controller HOF
 * @param {*} models
 * @returns Promise
 */
function _findOne(models) {
  const { crm_settings: crmSettingModel } = models;
  /**
   * Find one crm setting record
   * @param {{
   *   crm_settings_id: string,
   * 	agency_fk: string,
   * 	agency_oauth_fk?: string,
   * 	channel_type?: string,
   *  crm_timeslot_settings?: string,
   * 	crm_type?: string,
   * 	screens_data? :string,
   *  automation_rule_template_fk?: string,
   *   created_by?:string,
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  return async (where, { include, transaction } = {}) => {
    const funcName = 'crmSettingCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await crmSettingModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };
}

/**
 * _destroy controller HOF
 * @param {*} models
 * @returns Promise
 */
function _destroy(models) {
  const { crm_settings: crmSettingModel } = models;
  /**
   * Hard delete crm setting record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'crmSettingCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await crmSettingModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };
}

module.exports.makeController = (models) => {
  const crmSettingCtl = {};

  crmSettingCtl.create = _create(models);

  crmSettingCtl.update = _update(models);

  crmSettingCtl.findAll = _findAll(models);

  crmSettingCtl.findOne = _findOne(models);

  crmSettingCtl.destroy = _destroy(models);

  return crmSettingCtl;
};
