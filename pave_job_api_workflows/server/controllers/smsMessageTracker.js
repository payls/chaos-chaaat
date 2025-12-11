const h = require('../helpers');
// const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { sms_message_tracker: smsMessageTrackerModel } = models;

  const smsMessageTrackerCtl = {};

  /**
   * Create sms_message_tracker record
   * @param {{
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  agency_user_fk: string,
   *  contact_fk: string,
   *  webhook_access_key: string,
   *  msg_id: string,
   *  msg_type: string,
   *  sms_msg_sid: string,
   *  msg_body: string,
   *  account_sid: string,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  delivered: number,
   *  failed: number,
   *  batch_count: number,
   *  msg_trigger: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  smsMessageTrackerCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'smsMessageTrackerCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      tracker_ref_name,
      agency_fk,
      agency_user_fk,
      contact_fk,
      webhook_access_key,
      msg_id,
      msg_type,
      sms_msg_sid,
      msg_body,
      account_sid,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      sent,
      delivered,
      failed,
      replied,
      batch_count,
      msg_trigger,
      created_by,
    } = record;
    const sms_message_tracker_id = h.general.generateId();
    await smsMessageTrackerModel.create(
      {
        sms_message_tracker_id,
        tracker_ref_name,
        agency_fk,
        agency_user_fk,
        contact_fk,
        webhook_access_key,
        msg_id,
        msg_type,
        sms_msg_sid,
        msg_body,
        account_sid,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url,
        sent,
        delivered,
        failed,
        replied,
        batch_count,
        msg_trigger,
        created_by,
      },
      { transaction },
    );

    return sms_message_tracker_id;
  };

  /**
   * Update sms_message_tracker record
   * @param {{
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  agency_user_fk: string,
   *  contact_fk: string,
   *  webhook_access_key: string,
   *  msg_id: string,
   *  msg_type: string,
   *  sms_msg_sid: string,
   *  msg_body: string,
   *  account_sid: string,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  delivered: number,
   *  failed: number,
   *  batch_count: number,
   *  msg_trigger: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  smsMessageTrackerCtl.update = async (
    sms_message_tracker_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'smsMessageTrackerCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      tracker_ref_name,
      agency_fk,
      agency_user_fk,
      contact_fk,
      webhook_access_key,
      msg_id,
      msg_type,
      sms_msg_sid,
      msg_body,
      account_sid,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      sent,
      delivered,
      failed,
      replied,
      batch_count,
      msg_trigger,
    } = record;

    await smsMessageTrackerModel.update(
      {
        sms_message_tracker_id,
        tracker_ref_name,
        agency_fk,
        agency_user_fk,
        contact_fk,
        webhook_access_key,
        msg_id,
        msg_type,
        sms_msg_sid,
        msg_body,
        account_sid,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url,
        sent,
        delivered,
        failed,
        replied,
        batch_count,
        msg_trigger,
        updated_by,
      },
      {
        where: { sms_message_tracker_id },
        transaction,
      },
    );

    return sms_message_tracker_id;
  };

  /**
   * Find one sms_message_tracker record
   * @param {{
   *  sms_message_tracker_id?: string,
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  agency_user_fk: string,
   *  contact_fk: string,
   *  webhook_access_key: string,
   *  msg_id: string,
   *  msg_type: string,
   *  sms_msg_sid: string,
   *  msg_body: string,
   *  account_sid: string,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  delivered: number,
   *  failed: number,
   *  batch_count: number,
   *  msg_trigger: string,
   *	created_by: string,
   *  updated_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  smsMessageTrackerCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'smsMessageTrackerCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await smsMessageTrackerModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete sms_message_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  smsMessageTrackerCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'whatsappMessageTrackerCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await smsMessageTrackerModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return smsMessageTrackerCtl;
};
