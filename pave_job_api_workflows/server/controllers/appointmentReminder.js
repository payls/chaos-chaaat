const h = require('../helpers');

/**
 * _create controller HOF
 * @param {*} models
 * @returns Promise
 */
function _create(models) {
  const { appointment_reminder: appointmentReminder } = models;
  /**
   * Create appointment booking
   * @param {{
   *  automation_rule_template_fk: string,
   *  reminder_type: string,
   *  time_unit?: string,
   *  time_unit_number_val?: string,
   *  status?: string,
   *  agency_user_fk?: string,
   *  appointment_booking_fk?: string,
   *  reminder_time?: string,
   *  node_id: string,
   *  whatsapp_flow_fk: string,
   *  contact_fk: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (record, { transaction } = {}) => {
    const funcName = 'appointmentReminderCtl.create';
    h.validation.requiredParams(funcName, { record });
    let {
      appointment_reminder_id,
      automation_rule_template_fk,
      reminder_type,
      time_unit,
      time_unit_number_val,
      status,
      agency_user_fk,
      appointment_booking_fk,
      reminder_time,
      node_id,
      whatsapp_flow_fk,
      contact_fk,
    } = record;

    if (!appointment_reminder_id) appointment_reminder_id = h.general.generateId();
    await appointmentReminder.create(
      {
        appointment_reminder_id,
        automation_rule_template_fk,
        reminder_type,
        time_unit,
        time_unit_number_val,
        status,
        agency_user_fk,
        appointment_booking_fk,
        reminder_time,
        node_id,
        whatsapp_flow_fk,
        contact_fk,
      },
      {
        transaction,
      },
    );

    return appointment_reminder_id;
  };
}

/**
 * _update controller HOF
 * @param {*} models
 * @returns Promise
 */
function _update(models) {
  const { appointment_reminder: appointmentReminder } = models;
  /**
   * Update appointment booking
   * @param {string} appointment_reminder_id
   * @param {{
   *  automation_rule_template_fk: string,
   *  reminder_type: string,
   *  time_unit?: string,
   *  time_unit_number_val?: string,
   *  status?: string,
   *  agency_user_fk?: string,
   *  appointment_booking_fk?: string,
   *  reminder_time?: string,
   *  node_id: string,
   *  whatsapp_flow_fk: string,
   *  contact_fk: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (appointment_reminder_id, record, { transaction }) => {
    const funcName = 'appointmentReminderCtl.update';
    h.validation.requiredParams(funcName, { appointment_reminder_id, record });
    const {
      automation_rule_template_fk,
      reminder_type,
      time_unit,
      time_unit_number_val,
      status,
      agency_user_fk,
      appointment_booking_fk,
      reminder_time,
      node_id,
      whatsapp_flow_fk,
      contact_fk,
    } = record;
    await appointmentReminder.update(
      {
        automation_rule_template_fk,
        reminder_type,
        time_unit,
        time_unit_number_val,
        status,
        agency_user_fk,
        appointment_booking_fk,
        reminder_time,
        node_id,
        whatsapp_flow_fk,
        contact_fk,
      },
      {
        where: { appointment_reminder_id },
        transaction,
      },
    );

    return appointment_reminder_id;
  };
}

/**
 * _findAll controller HOF
 * @param {*} models
 * @returns Promise
 */
function _findAll(models) {
  const { appointment_reminder: appointmentReminder } = models;
  /**
   * Find all appointment booking records
   * @param {{
   *  appointment_reminder_id: string,
   *  automation_rule_template_fk: string,
   *  reminder_type: string,
   *  time_unit?: string,
   *  time_unit_number_val?: string,
   *  status?: string,
   *  agency_user_fk?: string,
   *  appointment_booking_fk?: string,
   *  reminder_time?: string,
   *  whatsapp_flow_fk: string,
   *  contact_fk: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'appointmentReminderCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await appointmentReminder.findAll({
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
  const { appointment_reminder: appointmentReminder } = models;
  /**
   * Find one appointment booking record
   * @param {{
   *  appointment_reminder_id: string,
   *  automation_rule_template_fk: string,
   *  reminder_type: string,
   *  time_unit?: string,
   *  time_unit_number_val?: string,
   *  status?: string,
   *  agency_user_fk?: string,
   *  appointment_booking_fk?: string,
   *  reminder_time?: string,
   *  whatsapp_flow_fk: string,
   *  contact_fk: string,
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  return async (where, { include, transaction } = {}) => {
    const funcName = 'appointmentReminderCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await appointmentReminder.findOne({
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
  const { appointment_reminder: appointmentReminder } = models;
  /**
   * Hard delete appointment booking record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'appointmentReminderCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await appointmentReminder.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };
}

module.exports.makeController = (models) => {
  const appointmentReminderCtl = {};

  appointmentReminderCtl.create = _create(models);

  appointmentReminderCtl.update = _update(models);

  appointmentReminderCtl.findAll = _findAll(models);

  appointmentReminderCtl.findOne = _findOne(models);

  appointmentReminderCtl.destroy = _destroy(models);

  return appointmentReminderCtl;
};
