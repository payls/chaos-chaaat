const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { whatsapp_message_tracker: whatsappMessageTrackerModel } = models;

  const whatsappMessageTrackerCtl = {};

  /**
   * Create whatsapp_message_tracker record
   * @param {{
   *  campaign_name?: string,
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_body: string,
   *  pending: boolean,
   *  batch_count: number,
   *  sent: number,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
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
  whatsappMessageTrackerCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'whatsappMessageTrackerCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      campaign_name,
      campaign_name_label,
      tracker_ref_name,
      agency_fk,
      contact_fk,
      agency_user_fk,
      original_event_id,
      msg_id,
      msg_body,
      msg_origin,
      pending,
      completed,
      batch_count,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      sent,
      delivered,
      failed,
      failed_reason,
      read,
      replied,
      broadcast_date,
      visible,
      addtl_1_done,
      addtl_2_done,
      addtl_3_done,
      template_count,
      tracker_type,
      created_by,
    } = record;
    const whatsapp_message_tracker_id = h.general.generateId();
    await whatsappMessageTrackerModel.create(
      {
        whatsapp_message_tracker_id,
        campaign_name,
        campaign_name_label,
        tracker_ref_name,
        agency_fk,
        contact_fk,
        agency_user_fk,
        original_event_id,
        msg_id,
        msg_body,
        msg_origin,
        pending,
        completed,
        batch_count,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url,
        sent,
        delivered,
        failed,
        failed_reason,
        read,
        replied,
        broadcast_date,
        visible,
        addtl_1_done,
        addtl_2_done,
        addtl_3_done,
        template_count,
        tracker_type,
        created_by,
      },
      { transaction },
    );

    return whatsapp_message_tracker_id;
  };

  /**
   * Update whatsapp_message_tracker record
   * @param {string} whatsapp_message_tracker_id
   * @param {{
   *  campaign_name?: string,
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_body: string,
   *  pending: boolean,
   *  batch_count: number,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  sent: number,
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
  whatsappMessageTrackerCtl.update = async (
    whatsapp_message_tracker_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'whatsappMessageTrackerCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      campaign_name,
      campaign_name_label,
      tracker_ref_name,
      agency_fk,
      contact_fk,
      agency_user_fk,
      original_event_id,
      msg_id,
      msg_body,
      pending,
      completed,
      batch_count,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      sent,
      delivered,
      failed,
      failed_reason,
      read,
      replied,
      broadcast_date,
      visible,
      addtl_1_done,
      addtl_2_done,
      addtl_3_done,
    } = record;

    await whatsappMessageTrackerModel.update(
      {
        campaign_name,
        campaign_name_label,
        tracker_ref_name,
        agency_fk,
        contact_fk,
        agency_user_fk,
        original_event_id,
        msg_id,
        msg_body,
        pending,
        completed,
        batch_count,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url,
        sent,
        delivered,
        failed,
        failed_reason,
        read,
        replied,
        updated_by,
        broadcast_date,
        visible,
        addtl_1_done,
        addtl_2_done,
        addtl_3_done,
      },
      {
        where: { whatsapp_message_tracker_id },
        transaction,
      },
    );

    return whatsapp_message_tracker_id;
  };

  /**
   * Find all whatsapp_message_tracker records
   * @param {{
   *  whatsapp_message_tracker_id?: string,
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  agency_user_fk: string,
   *  contact_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_body: string,
   *  pending: boolean,
   *  batch_count: number,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  sent: number,
   *  delivered: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string
   *  broadcast_date: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  whatsappMessageTrackerCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'whatsappMessageTrackerCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await whatsappMessageTrackerModel.findAll({
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

  whatsappMessageTrackerCtl.getAggregatedRecords = async (
    where,
    { transaction, offset, limit },
  ) => {
    const funcName = 'whatsappMessageTrackerCtl.getAggregatedRecords';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });

    const records = await whatsappMessageTrackerModel.findAll({
      where: { ...where },
      attributes: [
        'agency_fk',
        'tracker_ref_name',
        'batch_count',
        [sequelize.fn('sum', sequelize.col('pending')), 'total_pending'],
        [sequelize.fn('sum', sequelize.col('sent')), 'total_sent'],
        [sequelize.fn('sum', sequelize.col('delivered')), 'total_sent'],
        [sequelize.fn('sum', sequelize.col('failed')), 'total_failed'],
        [sequelize.fn('sum', sequelize.col('read')), 'total_read'],
        [sequelize.fn('sum', sequelize.col('replied')), 'total_replied'],
        'broadcast_date',
      ],
      group: ['tracker_ref_name'],
      raw: true,
      offset,
      limit,
      transaction,
    });

    return records;
  };

  /**
   * Find one whatsapp_message_tracker record
   * @param {{
   *  whatsapp_message_tracker_id?: string,
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_body: string,
   *  pending: boolean,
   *  batch_count: number,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  sent: number,
   *  delivered: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  whatsappMessageTrackerCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'whatsappMessageTrackerCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await whatsappMessageTrackerModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete whatsapp_message_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  whatsappMessageTrackerCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'whatsappMessageTrackerCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await whatsappMessageTrackerModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count whatsapp_message_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  whatsappMessageTrackerCtl.count = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'whatsappMessageTrackerCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await whatsappMessageTrackerModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return whatsappMessageTrackerCtl;
};
