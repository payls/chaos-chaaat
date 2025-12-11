const h = require('../helpers');

/**
 * _create controller HOF
 * @param {*} models
 * @returns Promise
 */
function _create(models) {
  const { whatsapp_flow: whatsappFlowModel } = models;
  /**
   * Create whatsapp flow
   * @param {{
   * 	waba_template_fk: string,
   *  crm_settings_fk: string,
   * 	flow_id?: string,
   * 	flow_name?: string,
   * 	flow_categories?: string,
   * 	flow_payload?: string,
   * 	message?: string,
   *   button_text?: string,
   *   status?: string,
   *   preview_link?: string
   *   created_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (record, { transaction } = {}) => {
    const funcName = 'whatsappFlowCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      waba_template_fk,
      crm_settings_fk,
      flow_id,
      flow_name,
      flow_categories,
      flow_payload,
      message,
      button_text,
      status,
      preview_link,
      created_by,
    } = record;

    const whatsapp_flow_id = h.general.generateId();
    await whatsappFlowModel.create(
      {
        whatsapp_flow_id,
        waba_template_fk,
        crm_settings_fk,
        flow_id,
        flow_name,
        flow_categories,
        flow_payload,
        message,
        button_text,
        status,
        preview_link,
        created_by,
      },
      {
        transaction,
      },
    );

    return whatsapp_flow_id;
  };
}

/**
 * _update controller HOF
 * @param {*} models
 * @returns Promise
 */
function _update(models) {
  const { whatsapp_flow: whatsappFlowModel } = models;
  /**
   * Update whatsapp flow
   * @param {string} whatsapp_flow_id
   * @param {{
   * 	waba_template_fk: string,
   *  crm_settings_fk: string,
   * 	flow_id?: string,
   * 	flow_name?: string,
   * 	flow_categories?: string,
   * 	flow_payload?: string,
   * 	message?: string,
   *   button_text?: string,
   *   status?: string,
   *   preview_link?: string
   *   created_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (whatsapp_flow_id, record, { transaction } = {}) => {
    const funcName = 'whatsappFlowCtl.update';
    h.validation.requiredParams(funcName, { whatsapp_flow_id, record });
    const {
      waba_template_fk,
      crm_settings_fk,
      flow_id,
      flow_name,
      flow_categories,
      flow_payload,
      message,
      button_text,
      status,
      preview_link,
      created_by,
    } = record;
    await whatsappFlowModel.update(
      {
        waba_template_fk,
        crm_settings_fk,
        flow_id,
        flow_name,
        flow_categories,
        flow_payload,
        message,
        button_text,
        status,
        preview_link,
        created_by,
      },
      {
        where: { whatsapp_flow_id },
        transaction,
      },
    );

    return whatsapp_flow_id;
  };
}

/**
 * _findAll controller HOF
 * @param {*} models
 * @returns Promise
 */
function _findAll(models) {
  const { whatsapp_flow: whatsappFlowModel } = models;
  /**
   * Find all whatsapp flow records
   * @param {{
   *   whatsapp_flow_id: string,
   * 	waba_template_fk: string,
   *  crm_settings_fk: string,
   * 	flow_id?: string,
   * 	flow_name?: string,
   * 	flow_categories?: string,
   * 	flow_payload?: string,
   * 	message?: string,
   *   button_text?: string,
   *   status?: string,
   *   preview_link?: string
   *   created_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'whatsappFlowCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await whatsappFlowModel.findAll({
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
  const { whatsapp_flow: whatsappFlowModel } = models;
  /**
   * Find one whatsapp flow record
   * @param {{
   *   whatsapp_flow_id: string,
   * 	waba_template_fk: string,
   *  crm_settings_fk: string,
   * 	flow_id?: string,
   * 	flow_name?: string,
   * 	flow_categories?: string,
   * 	flow_payload?: string,
   * 	message?: string,
   *   button_text?: string,
   *   status?: string,
   *   preview_link?: string
   *   created_by?: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  return async (where, { include, transaction } = {}) => {
    const funcName = 'whatsappFlowCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await whatsappFlowModel.findOne({
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
  const { whatsapp_flow: whatsappFlowModel } = models;
  /**
   * Hard delete whatsapp flow record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'whatsappFlowCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await whatsappFlowModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };
}

module.exports.makeController = (models) => {
  const whatsappFlowCtl = {};

  whatsappFlowCtl.create = _create(models);

  whatsappFlowCtl.update = _update(models);

  whatsappFlowCtl.findAll = _findAll(models);

  whatsappFlowCtl.findOne = _findOne(models);

  whatsappFlowCtl.destroy = _destroy(models);

  return whatsappFlowCtl;
};
