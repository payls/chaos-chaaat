const h = require('../helpers');

/**
 * _create controller HOF
 * @param {*} models
 * @returns Promise
 */
function _create(models) {
  const { client_detail: clientDetailModel } = models;
  /**
   * Create client detail
   * @param {{
   * 	crm_settings_fk: string,
   * 	contact_fk?: string,
   * 	appointment_id?: string,
   * 	client_id?: string,
   * 	email?: string,
   * 	mobile_number? :string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (record, { transaction } = {}) => {
    const funcName = 'clientDetailCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      crm_settings_fk,
      contact_fk,
      appointment_id,
      client_id,
      email,
      mobile_number,
    } = record;

    const client_detail_id = h.general.generateId();
    await clientDetailModel.create(
      {
        client_detail_id,
        crm_settings_fk,
        contact_fk,
        appointment_id,
        client_id,
        email,
        mobile_number,
      },
      {
        transaction,
      },
    );

    return client_detail_id;
  };
}

/**
 * _update controller HOF
 * @param {*} models
 * @returns Promise
 */
function _update(models) {
  const { client_detail: clientDetailModel } = models;
  /**
   * Update client detail
   * @param {string} client_detail_id
   * @param {{
   * 	crm_settings_fk: string,
   * 	contact_fk?: string,
   * 	appointment_id?: string,
   * 	client_id?: string,
   * 	email?: string,
   * 	mobile_number? :string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (client_detail_id, record, { transaction }) => {
    const funcName = 'clientDetailCtl.update';
    h.validation.requiredParams(funcName, { client_detail_id, record });
    const {
      crm_settings_fk,
      contact_fk,
      appointment_id,
      client_id,
      email,
      mobile_number,
    } = record;
    await clientDetailModel.update(
      {
        crm_settings_fk,
        contact_fk,
        appointment_id,
        client_id,
        email,
        mobile_number,
      },
      {
        where: { client_detail_id },
        transaction,
      },
    );

    return client_detail_id;
  };
}

/**
 * _findAll controller HOF
 * @param {*} models
 * @returns Promise
 */
function _findAll(models) {
  const { client_detail: clientDetailModel } = models;
  /**
   * Find all client detail records
   * @param {{
   *  client_detail_id?: string,
   *  crm_settings_fk: string,
   *  contact_fk?: string,
   *  appointment_id?: string,
   *  client_id?: string,
   *  email?: string,
   *  mobile_number? :string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'clientDetailCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await clientDetailModel.findAll({
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
  const { client_detail: clientDetailModel } = models;
  /**
   * Find one client detail record
   * @param {{
   *  client_detail_id?: string,
   *  crm_settings_fk: string,
   *  contact_fk?: string,
   *  appointment_id?: string,
   *  client_id?: string,
   *  email?: string,
   *  mobile_number? :string,
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  return async (where, { include, transaction } = {}) => {
    const funcName = 'clientDetailCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await clientDetailModel.findOne({
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
  const { client_detail: clientDetailModel } = models;
  /**
   * Hard delete task record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'clientDetailCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await clientDetailModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };
}

module.exports.makeController = (models) => {
  const clientDetailCtl = {};

  clientDetailCtl.create = _create(models);

  clientDetailCtl.update = _update(models);

  clientDetailCtl.findAll = _findAll(models);

  clientDetailCtl.findOne = _findOne(models);

  clientDetailCtl.destroy = _destroy(models);

  return clientDetailCtl;
};
