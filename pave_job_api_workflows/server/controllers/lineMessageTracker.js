const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { line_message_tracker: lineMessageTrackerModel } = models;

  const lineMessageTrackerCtl = {};

  /**
   * Create line_message_tracker record
   * @param {{
   *  campaign_name?: string,
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  agency_user_fk: string,
   *  contact_fk: string,
   *  line_webhook_event_id: string,
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
  lineMessageTrackerCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'lineMessageTrackerCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      campaign_name,
      campaign_name_label,
      tracker_ref_name,
      agency_fk,
      agency_user_fk,
      contact_fk,
      line_webhook_event_id,
      msg_id,
      msg_type,
      msg_origin,
      msg_body,
      sender,
      sender_url,
      receiver,
      receiver_url,
      batch_count,
      template_count,
      tracker_type,
      pending,
      sent,
      delivered,
      failed,
      failed_reason,
      read,
      replied,
      msg_trigger,
      broadcast_date,
      visible,
      created_by,
    } = record;
    const line_message_tracker_id = h.general.generateId();
    await lineMessageTrackerModel.create(
      {
        line_message_tracker_id,
        campaign_name,
        campaign_name_label,
        tracker_ref_name,
        agency_fk,
        agency_user_fk,
        contact_fk,
        line_webhook_event_id,
        msg_id,
        msg_type,
        msg_origin,
        msg_body,
        sender,
        sender_url,
        receiver,
        receiver_url,
        batch_count,
        template_count,
        tracker_type,
        pending,
        sent,
        delivered,
        failed,
        failed_reason,
        read,
        replied,
        msg_trigger,
        broadcast_date,
        visible,
        created_by,
      },
      { transaction },
    );

    return line_message_tracker_id;
  };

  /**
   * Update line_message_tracker record
   * @param {string} line_message_tracker_id
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
  lineMessageTrackerCtl.update = async (
    line_message_tracker_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'lineMessageTrackerCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      campaign_name,
      campaign_name_label,
      tracker_ref_name,
      agency_fk,
      agency_user_fk,
      contact_fk,
      line_webhook_event_id,
      msg_id,
      msg_type,
      msg_origin,
      msg_body,
      sender,
      sender_url,
      receiver,
      receiver_url,
      batch_count,
      template_count,
      tracker_type,
      pending,
      sent,
      delivered,
      failed,
      failed_reason,
      read,
      replied,
      msg_trigger,
      broadcast_date,
      visible,
    } = record;

    await lineMessageTrackerModel.update(
      {
        campaign_name,
        campaign_name_label,
        tracker_ref_name,
        agency_fk,
        agency_user_fk,
        contact_fk,
        line_webhook_event_id,
        msg_id,
        msg_type,
        msg_origin,
        msg_body,
        sender,
        sender_url,
        receiver,
        receiver_url,
        batch_count,
        template_count,
        tracker_type,
        pending,
        sent,
        delivered,
        failed,
        failed_reason,
        read,
        replied,
        msg_trigger,
        broadcast_date,
        visible,
        updated_by,
      },
      {
        where: { line_message_tracker_id },
        transaction,
      },
    );

    return line_message_tracker_id;
  };

  /**
   * Find all line_message_tracker records
   * @param {{
   *  line_message_tracker_id?: string,
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
  lineMessageTrackerCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'lineMessageTrackerCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lineMessageTrackerModel.findAll({
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

  lineMessageTrackerCtl.getAggregatedRecords = async (
    where,
    { transaction, offset, limit },
  ) => {
    const funcName = 'lineMessageTrackerCtl.getAggregatedRecords';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });

    const records = await lineMessageTrackerModel.findAll({
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
   * Find one line_message_tracker record
   * @param {{
   *  line_message_tracker_id?: string,
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
  lineMessageTrackerCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'lineMessageTrackerCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await lineMessageTrackerModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete line_message_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  lineMessageTrackerCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'lineMessageTrackerCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await lineMessageTrackerModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count line_message_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  lineMessageTrackerCtl.count = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'lineMessageTrackerCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lineMessageTrackerModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return lineMessageTrackerCtl;
};
