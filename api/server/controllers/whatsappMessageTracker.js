const h = require('../helpers');
const sequelize = require('sequelize');
const { Op, Sequelize } = sequelize;

module.exports.makeController = (models) => {
  const { whatsapp_message_tracker: whatsappMessageTrackerModel } = models;

  const whatsappMessageTrackerCtl = {};

  /**
   * Create whatsapp_message_tracker record
   * @param {{
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_origin: string,
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
      msg_origin,
      msg_body,
      pending,
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
        msg_origin,
        msg_body,
        pending,
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
   *  tracker_ref_name?: string,
   * 	agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_origin: string,
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
      msg_origin,
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
        msg_origin,
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
    { transaction, offset, limit, order },
  ) => {
    const funcName = 'whatsappMessageTrackerCtl.getAggregatedRecords';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });

    const records = await whatsappMessageTrackerModel.findAll({
      where: { ...where },
      include: [
        {
          model: models.campaign_schedule,
          required: false,
        },
      ],
      attributes: [
        'agency_fk',
        'tracker_ref_name',
        'campaign_name',
        'campaign_name_label',
        'batch_count',
        [sequelize.fn('max', sequelize.col('sender_number')), 'waba_number'],
        'visible',
        [
          sequelize.fn(
            'sum',
            sequelize.literal(
              'CASE WHEN tracker_type = "main" AND pending = 1 AND sent = 0 AND failed = 0 AND delivered = 0 AND `read` = 0 AND replied = 0 THEN pending ELSE 0 END',
            ),
          ),
          'total_pending',
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal(
              'CASE WHEN tracker_type = "main" THEN 1 ELSE 0 END',
            ),
          ),
          'total_sent',
        ],
        // [sequelize.fn('sum', sequelize.col('sent')), 'total_sent'],
        [
          sequelize.fn(
            'sum',
            sequelize.literal(
              'CASE WHEN tracker_type = "main" AND sent = 1 AND failed = 0 THEN 1 ELSE 0 END',
            ),
          ),
          'total_delivered',
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal('CASE WHEN failed = 1 THEN failed ELSE 0 END'),
          ),
          'total_failed',
        ],
        [sequelize.fn('sum', sequelize.col('read')), 'total_read'],
        [sequelize.fn('sum', sequelize.col('replied')), 'total_replied'],
        'template_count',
        'broadcast_date',
        [
          sequelize.literal(
            '(SELECT waba_status FROM agency_whatsapp_config WHERE agency_whatsapp_config.agency_fk = whatsapp_message_tracker.agency_fk AND agency_whatsapp_config.waba_number = whatsapp_message_tracker.sender_number)',
          ),
          'waba_status_rating',
        ],
        [
          sequelize.literal(
            '(SELECT waba_quality FROM agency_whatsapp_config WHERE agency_whatsapp_config.agency_fk = whatsapp_message_tracker.agency_fk AND agency_whatsapp_config.waba_number = whatsapp_message_tracker.sender_number)',
          ),
          'waba_quality_rating',
        ],
      ],
      group: ['tracker_ref_name', 'campaign_schedule_id'],
      raw: true,
      offset,
      limit,
      order,
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
    { include, order, attributes, transaction } = {},
  ) => {
    const funcName = 'whatsappMessageTrackerCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await whatsappMessageTrackerModel.findOne({
      where: { ...where },
      include,
      order,
      attributes,
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

  whatsappMessageTrackerCtl.getAutomationWhatsAppMessageTracker = async (
    agency_id,
    automation_rule_id,
  ) => {
    const records = await whatsappMessageTrackerModel.findAll({
      where: {
        msg_origin: {
          [Op.in]: ['automation', 'user', 'campaign'],
        },
        agency_fk: agency_id,
        msg_id: automation_rule_id,
      },
      attributes: [
        [
          sequelize.fn(
            'sum',
            sequelize.literal('CASE WHEN pending = 0 THEN 1 ELSE 0 END'),
          ),
          'triggered_count',
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal('CASE WHEN sent = 1 THEN 1 ELSE 0 END'),
          ),
          'sent_count',
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal('CASE WHEN delivered = 1 THEN 1 ELSE 0 END'),
          ),
          'delivered_count',
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal('CASE WHEN failed = 1 THEN 1 ELSE 0 END'),
          ),
          'failed_count',
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal('CASE WHEN `read` = 1 THEN 1 ELSE 0 END'),
          ),
          'read_count',
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal('CASE WHEN replied = 1 THEN 1 ELSE 0 END'),
          ),
          'with_reply_count',
        ],
      ],
    });
    return h.database.formatData(records);
  };

  whatsappMessageTrackerCtl.getAutomationWhatsAppRecipients = async (
    agency_id,
    automation_rule_id,
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
      msg_origin: {
        [Op.in]: ['automation', 'user', 'campaign'],
      },
      agency_fk: agency_id,
      msg_id: automation_rule_id,
    };
    if (!h.isEmpty(from) && !h.isEmpty(to)) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      where.created_date = { [Op.between]: [startDate, endDate] };
    }
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
      whatsappMessageTrackerModel.findAll({
        where,
        attributes: [
          [sequelize.col('whatsapp_message_tracker.agency_fk'), 'agency_id'],
          [sequelize.col('contact_fk'), 'contact_id'],
          [sequelize.col('receiver_number'), 'recipient_number'],
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
      whatsappMessageTrackerModel.count(
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

  whatsappMessageTrackerCtl.getCampaignWhatsAppRecipients = async (
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
                  // sequelize.literal(
                  //   `CONCAT(first_name, ' ', last_name) LIKE '%${search}%'`,
                  // ),
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
      whatsappMessageTrackerModel.findAll({
        where,
        attributes: [
          [sequelize.col('whatsapp_message_tracker.agency_fk'), 'agency_id'],
          [sequelize.col('contact_fk'), 'contact_id'],
          [sequelize.col('receiver_number'), 'recipient_number'],
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
      whatsappMessageTrackerModel.count(
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

  return whatsappMessageTrackerCtl;
};
