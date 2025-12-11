const h = require('../helpers');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

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
   *  failed_reason: string,
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
   *  failed_reason: string,
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
        'campaign_name',
        'campaign_name_label',
        'batch_count',
        [sequelize.fn('max', sequelize.col('sender')), 'line_channel_name'],
        [sequelize.fn('sum', sequelize.col('pending')), 'total_pending'],
        [sequelize.fn('sum', sequelize.col('sent')), 'total_sent'],
        [sequelize.fn('sum', sequelize.col('delivered')), 'total_delivered'],
        [sequelize.fn('sum', sequelize.col('failed')), 'total_failed'],
        [sequelize.fn('sum', sequelize.col('read')), 'total_read'],
        [sequelize.fn('sum', sequelize.col('replied')), 'total_replied'],
        'broadcast_date',
        [
          sequelize.col('agency_channel_config.channel_name'),
          'line_channel_name',
        ],
      ],
      group: ['tracker_ref_name'],
      include: [
        {
          model: models.agency_channel_config,
          required: true,
          attributes: ['channel_name'],
        },
      ],
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

  lineMessageTrackerCtl.getCampaignLineRecipients = async (
    agency_id,
    tracker_ref_name,
    limit,
    offset,
    order,
    search,
    searchStatus,
    from,
    to,
    totalCount,
  ) => {
    const where = {
      msg_origin: 'campaign',
      agency_fk: agency_id,
      tracker_ref_name: tracker_ref_name,
      tracker_type: 'main',
    };
    if (!h.isEmpty(searchStatus)) {
      if (h.cmpStr(searchStatus, 'sent')) {
        where.sent = true;
      }
      if (h.cmpStr(searchStatus, 'delivered')) {
        where.delivered = true;
      }
      if (h.cmpStr(searchStatus, 'read')) {
        where.read = true;
      }
      if (h.cmpStr(searchStatus, 'replied')) {
        where.replied = true;
      }
      if (h.cmpStr(searchStatus, 'failed')) {
        where.failed = true;
      }
    }
    if (!h.isEmpty(from) && !h.isEmpty(to)) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      where.created_date = { [Op.between]: [startDate, endDate] };
    }
    const include = [
      {
        model: models.contact,
        required: true,
        attributes: ['first_name', 'last_name', 'email', 'mobile_number'],
        ...(!h.isEmpty(search)
          ? {
              where: {
                [Op.or]: [
                  sequelize.where(
                    sequelize.fn(
                      'CONCAT',
                      sequelize.col('first_name'),
                      ' ',
                      sequelize.col('last_name'),
                    ),
                    {
                      [sequelize.Op.like]: `%${search}%`,
                    },
                  ),
                  { mobile_number: { [Op.like]: `%${search}%` } },
                  { email: { [Op.like]: `%${search}%` } },
                ],
              },
            }
          : {}),
      },
    ];

    const [recipient_list, recipientCount] = await Promise.all([
      lineMessageTrackerModel.findAll({
        where,
        attributes: [
          [sequelize.col('line_message_tracker.agency_fk'), 'agency_id'],
          [sequelize.col('contact_fk'), 'contact_id'],
          [sequelize.col('receiver'), 'recipient_line_id'],
          'sent',
          'delivered',
          'failed',
          'failed_reason',
          'read',
          'replied',
          'created_date',
        ],
        include,
        order,
        limit,
        offset,
      }),
      lineMessageTrackerModel.count(
        {
          where: where,
        },
        {
          include,
          limit,
          offset,
        },
      ),
    ]);

    return {
      records: h.database.formatData(recipient_list),
      totalTrackerCount: recipientCount,
    };
  };

  return lineMessageTrackerCtl;
};
