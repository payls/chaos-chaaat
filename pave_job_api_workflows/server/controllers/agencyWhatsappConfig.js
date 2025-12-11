const h = require('../helpers');

module.exports.makeController = (models) => {
  const { agency_whatsapp_config: agencyWhatsAppConfigModel } = models;

  const agencyWhatsappConfigCtl = {};

  /**
   * Find all agency whatsapp config records
   * @param {{
   *  agency_whatsapp_config_id: string,
   *  agency_fk: string,
   *  waba_name: string,
   *  waba_number: string,
   *  agency_whatsapp_api_token: string,
   *  agency_whatsapp_api_secret: string,
   *  agency_waba_id: string,
   *  agency_waba_template_token: string,
   *  agency_waba_template_secret: string,
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
   *  waba_name: string,
   *  agency_whatsapp_api_token: string,
   *  agency_whatsapp_api_secret: string,
   *  agency_waba_id: string,
   *  agency_waba_template_token: string,
   *  agency_waba_template_secret: string,
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
      order,
      transaction,
    });
    return h.database.formatData(record);
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
