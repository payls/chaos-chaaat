const h = require('../helpers');

module.exports.makeController = (models) => {
  const { whatsapp_chat: whatsappChatModel } = models;

  const whatsappChatCtl = {};

  /**
   * Create whatsapp_chat record
   * @param {{
   *  campaign_name,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  original_event_id: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  whatsappChatCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'whatsappChatCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      campaign_name,
      agency_fk,
      contact_fk,
      agency_user_fk,
      original_event_id,
      msg_id,
      msg_info,
      msg_type,
      msg_template_id,
      msg_category,
      msg_body,
      media_url,
      media_msg_id,
      content_type,
      file_name,
      reply_to_event_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      caption,
      msg_origin,
      msg_timestamp,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      delivered,
      sent,
      failed,
      failed_reason,
      read,
      created_by,
    } = record;
    const whatsapp_chat_id = h.general.generateId();
    await whatsappChatModel.create(
      {
        whatsapp_chat_id,
        campaign_name,
        agency_fk,
        contact_fk,
        agency_user_fk,
        original_event_id,
        msg_id,
        msg_info,
        msg_type,
        msg_template_id,
        msg_category,
        msg_body,
        media_url,
        media_msg_id,
        content_type,
        file_name,
        reply_to_event_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_file_name,
        reply_to_contact_id,
        caption,
        msg_origin,
        msg_timestamp,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url,
        delivered,
        sent,
        failed,
        failed_reason,
        read,
        created_by,
      },
      { transaction },
    );

    return whatsapp_chat_id;
  };
  /**
   * Update whatsapp_chat record
   * @param {string} whatsapp_chat_id
   * @param {{
   *  original_event_id: string,
   *  agency_user_fk: string,
   *  contact_fk: string,
   *  agency_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  whatsappChatCtl.update = async (
    whatsapp_chat_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'whatsappChatCtl.update';
    h.validation.requiredParams(funcName, { record });
    await whatsappChatModel.update(record, {
      where: { whatsapp_chat_id },
      transaction,
    });

    return whatsapp_chat_id;
  };

  /**
   * Find all whatsapp_chat records
   * @param {{
   *  whatsapp_chat_id: string,
   *  original_event_id: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  agency_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  whatsappChatCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'whatsappChatCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await whatsappChatModel.findAll({
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
   * Find one whatsapp_chat record
   * @param {{
   *  whatsapp_chat_id: string,
   *  original_event_id: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  agency_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  sender_number: string,
   *  sender_url: string,
   *  receiver_number: string,
   *  receiver_url: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  whatsappChatCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'whatsappChatCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await whatsappChatModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete whatsapp_chat record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  whatsappChatCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'whatsappChatCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await whatsappChatModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count whatsapp_chat record based on criteria provided
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  whatsappChatCtl.count = async (where, { include, transaction } = {}) => {
    const funcName = 'whatsappChatCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await whatsappChatModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return whatsappChatCtl;
};
