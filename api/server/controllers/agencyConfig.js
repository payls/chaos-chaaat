const h = require('../helpers');

module.exports.makeController = (models) => {
  const { agency_config: agencyConfigModel } = models;
  const agencyConfigCtl = {};

  /**
   * Create agency record
   * @param {{
   * 	agency_fk: string,
   *  hubspot_config: string,
   *  salesforce_config: string,
   *  pave_config: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyConfigCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyConfigCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      hubspot_config,
      salesforce_config,
      pave_config,
      whatsapp_config,
      sms_config,
      line_config,
      created_by,
    } = record;
    const agency_config_id = h.general.generateId();
    await agencyConfigModel.create(
      {
        agency_config_id,
        agency_fk,
        hubspot_config,
        salesforce_config,
        pave_config,
        whatsapp_config,
        sms_config,
        line_config,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return agency_config_id;
  };
  /**
   * Update agency record
   * @param {string} agency_config_id
   * @param {{
   *  hubspot_config: string,
   *  salesforce_config: string,
   *  pave_config: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyConfigCtl.update = async (
    agency_config_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyConfigCtl.update';
    h.validation.requiredParams(funcName, { agency_config_id, record });
    const {
      hubspot_config,
      salesforce_config,
      pave_config,
      whatsapp_config,
      sms_config,
      line_config,
      updated_by,
    } = record;
    await agencyConfigModel.update(
      {
        hubspot_config,
        salesforce_config,
        pave_config,
        whatsapp_config,
        sms_config,
        line_config,
        updated_by,
      },
      { where: { agency_config_id }, transaction },
    );
    return agency_config_id;
  };
  /**
   * Find all agency records
   * @param {{
   *  agency_config_id?: string,
   *  hubspot_config: string,
   *  salesforce_config: string,
   *  pave_config: string,
   *  created_by: string,
   *	updated_by: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyConfigCtl.findAll = async (where, { transaction } = {}) => {
    const funcName = 'agencyConfigCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyConfigModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one agency record
   * @param {{
   *  agency_config_id?: string,
   *  hubspot_config: string,
   *  salesforce_config: string,
   *  pave_config: string,
   *  created_by: string,
   *	updated_by: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  agencyConfigCtl.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'agencyConfigCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyConfigModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  return agencyConfigCtl;
};
