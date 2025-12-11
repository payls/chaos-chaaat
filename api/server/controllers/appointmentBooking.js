const h = require('../helpers');

/**
 * _create controller HOF
 * @param {*} models
 * @returns Promise
 */
function _create(models) {
  const { appointment_booking: appointmentBookingModel } = models;
  /**
   * Create appointment booking
   * @param {{
   *  crm_settings_fk: string,
   *  appointment_id?: string,
   *  appointment_type?: string,
   *  appointment_link?: string,
   *  initial_booking_message?: string,
   *  initial_message_cta?: string,
   *  start_time?: string,
   *  end_time?: string,
   *  timezone?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (record, { transaction } = {}) => {
    const funcName = 'appointmentBookingCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      crm_settings_fk,
      appointment_id,
      appointment_type,
      appointment_link,
      initial_booking_message,
      initial_message_cta,
      start_time,
      end_time,
      timezone,
    } = record;

    const appointment_booking_id = h.general.generateId();
    await appointmentBookingModel.create(
      {
        appointment_booking_id,
        crm_settings_fk,
        appointment_id,
        appointment_type,
        appointment_link,
        initial_booking_message,
        initial_message_cta,
        start_time,
        end_time,
        timezone,
      },
      {
        transaction,
      },
    );

    return appointment_booking_id;
  };
}

/**
 * _update controller HOF
 * @param {*} models
 * @returns Promise
 */
function _update(models) {
  const { appointment_booking: appointmentBookingModel } = models;
  /**
   * Update appointment booking
   * @param {string} appointment_booking_id
   * @param {{
   * 	crm_settings_fk: string,
   * 	appointment_id?: string,
   * 	appointment_type?: string,
   * 	appointment_link?: string,
   * 	initial_booking_message?: string,
   * 	initial_message_cta?: string,
   *   start_time?: string,
   *   end_time?: string,
   *   timezone?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  return async (appointment_booking_id, record, { transaction }) => {
    const funcName = 'appointmentBookingCtl.update';
    h.validation.requiredParams(funcName, { appointment_booking_id, record });
    const {
      crm_settings_fk,
      appointment_id,
      appointment_type,
      appointment_link,
      initial_booking_message,
      initial_message_cta,
      start_time,
      end_time,
      timezone,
    } = record;
    await appointmentBookingModel.update(
      {
        crm_settings_fk,
        appointment_id,
        appointment_type,
        appointment_link,
        initial_booking_message,
        initial_message_cta,
        start_time,
        end_time,
        timezone,
      },
      {
        where: { appointment_booking_id },
        transaction,
      },
    );

    return appointment_booking_id;
  };
}

/**
 * _findAll controller HOF
 * @param {*} models
 * @returns Promise
 */
function _findAll(models) {
  const { appointment_booking: appointmentBookingModel } = models;
  /**
   * Find all appointment booking records
   * @param {{
   *   appointment_booking_id: string,
   * 	crm_settings_fk: string,
   * 	appointment_id?: string,
   * 	appointment_type?: string,
   * 	appointment_link?: string,
   * 	initial_booking_message?: string,
   * 	initial_message_cta?: string,
   *   start_time?: string,
   *   end_time?: string,
   *   timezone?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'appointmentBookingCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await appointmentBookingModel.findAll({
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
  const { appointment_booking: appointmentBookingModel } = models;
  /**
   * Find one appointment booking record
   * @param {{
   *   appointment_booking_id: string,
   * 	crm_settings_fk: string,
   * 	appointment_id?: string,
   * 	appointment_type?: string,
   * 	appointment_link?: string,
   * 	initial_booking_message?: string,
   * 	initial_message_cta?: string,
   *   start_time?: string,
   *   end_time?: string,
   *   timezone?: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  return async (where, { include, transaction } = {}) => {
    const funcName = 'appointmentBookingCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await appointmentBookingModel.findOne({
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
  const { appointment_booking: appointmentBookingModel } = models;
  /**
   * Hard delete appointment booking record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  return async (where, { transaction } = {}) => {
    const funcName = 'appointmentBookingCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await appointmentBookingModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };
}

module.exports.makeController = (models) => {
  const appointmentBookingCtl = {};

  appointmentBookingCtl.create = _create(models);

  appointmentBookingCtl.update = _update(models);

  appointmentBookingCtl.findAll = _findAll(models);

  appointmentBookingCtl.findOne = _findOne(models);

  appointmentBookingCtl.destroy = _destroy(models);

  return appointmentBookingCtl;
};
