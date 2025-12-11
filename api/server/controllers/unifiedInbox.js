const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { unified_inbox: unifiedInboxModel } = models;

  const unifiedInboxCtl = {};

  /**
   * Create unified_inbox record
   * @param {{
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_body: string,
   *  msg_type: string,
   *  pending: boolean,
   *  batch_count: number,
   *  sent: number,
   *  sender: string,
   *  sender_url: string,
   *  receiver: string,
   *  receiver_url: string,
   *  delivered: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *  broadcast_date: Date,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  unifiedInboxCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'unifiedInboxCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      unified_inbox_id,
      tracker_id,
      tracker_ref_name,
      campaign_name,
      agency_fk,
      contact_fk,
      agency_user_fk,
      event_id,
      msg_platform,
      sender,
      sender_url,
      receiver,
      receiver_url,
      msg_id,
      msg_body,
      msg_type,
      batch_count,
      template_count,
      tracker_type,
      pending,
      sent,
      delivered,
      failed,
      read,
      replied,
      broadcast_date,
      last_msg_date,
      visible,
      created_by,
    } = record;
    const record_unified_inbox_id = unified_inbox_id || h.general.generateId();
    await unifiedInboxModel.create(
      {
        unified_inbox_id: record_unified_inbox_id,
        tracker_id,
        tracker_ref_name,
        campaign_name,
        agency_fk,
        contact_fk,
        agency_user_fk,
        event_id,
        msg_platform,
        sender,
        sender_url,
        receiver,
        receiver_url,
        msg_id,
        msg_body,
        msg_type,
        batch_count,
        template_count,
        tracker_type,
        pending,
        sent,
        delivered,
        failed,
        read,
        replied,
        broadcast_date,
        last_msg_date,
        visible,
        created_by,
      },
      { transaction },
    );

    return unified_inbox_id;
  };

  /**
   * Update whatsapp_message_tracker record
   * @param {string} whatsapp_message_tracker_id
   * @param {{
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_body: string,
   *  msg_type: string,
   *  pending: boolean,
   *  batch_count: number,
   *  sent: number,
   *  sender: string,
   *  sender_url: string,
   *  receiver: string,
   *  receiver_url: string,
   *  delivered: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *  broadcast_date: Date,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  unifiedInboxCtl.update = async (
    unified_inbox_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'unifiedInboxCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      tracker_id,
      tracker_ref_name,
      campaign_name,
      agency_fk,
      contact_fk,
      agency_user_fk,
      event_id,
      msg_platform,
      sender,
      sender_url,
      receiver,
      receiver_url,
      msg_id,
      msg_body,
      msg_type,
      batch_count,
      template_count,
      tracker_type,
      pending,
      sent,
      delivered,
      failed,
      read,
      replied,
      broadcast_date,
      last_msg_date,
      visible,
    } = record;

    await unifiedInboxModel.update(
      {
        tracker_id,
        tracker_ref_name,
        campaign_name,
        agency_fk,
        contact_fk,
        agency_user_fk,
        event_id,
        msg_platform,
        sender,
        sender_url,
        receiver,
        receiver_url,
        msg_id,
        msg_body,
        msg_type,
        batch_count,
        template_count,
        tracker_type,
        pending,
        sent,
        delivered,
        failed,
        read,
        replied,
        broadcast_date,
        last_msg_date,
        visible,
        updated_by,
      },
      {
        where: { unified_inbox_id },
        transaction,
      },
    );

    return unified_inbox_id;
  };

  /**
   * Find all unified_inbox records
   * @param {{
   *  tracker_id,
   *  tracker_ref_name,
   *  campaign_name,
   *  agency_fk,
   *  contact_fk,
   *  agency_user_fk,
   *  event_id,
   *  msg_platform,
   *  sender,
   *  sender_url,
   *  receiver,
   *  receiver_url,
   *  msg_body,
   *  msg_type,
   *  batch_count,
   *  template_count,
   *  tracker_type,
   *  pending,
   *  sent,
   *  delivered,
   *  failed,
   *  read,
   *  replied,
   *  broadcast_date,
   *  visible,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  unifiedInboxCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'unifiedInboxCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await unifiedInboxModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      group,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one unified_inbox records
   * @param {{
   *  tracker_id,
   *  tracker_ref_name,
   *  campaign_name,
   *  agency_fk,
   *  contact_fk,
   *  agency_user_fk,
   *  event_id,
   *  msg_platform,
   *  sender,
   *  sender_url,
   *  receiver,
   *  receiver_url,
   *  msg_body,
   *  msg_type,
   *  batch_count,
   *  template_count,
   *  tracker_type,
   *  pending,
   *  sent,
   *  delivered,
   *  failed,
   *  read,
   *  replied,
   *  broadcast_date,
   *  visible,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  unifiedInboxCtl.findOne = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'unifiedInboxCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await unifiedInboxModel.findOne({
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
   * Hard delete whatsapp_message_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  unifiedInboxCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'unifiedInboxCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await unifiedInboxModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  unifiedInboxCtl.count = async (
    where,
    { include, transaction, subQuery, order, group } = {},
  ) => {
    const funcName = 'unifiedInboxCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await unifiedInboxModel.count({
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

  return unifiedInboxCtl;
};
