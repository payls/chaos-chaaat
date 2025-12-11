const h = require('../helpers');
const { Op } = require('sequelize');

module.exports.makeController = (models) => {
  const { line_chat: lineChatModel } = models;

  const lineChatCtl = {};

  /**
   * Create line_chat record
   * @param {{
   *  campaign_name: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  line_webhook_event_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_msg_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender: string,
   *  receiver: string,
   *  sender_url: string,
   *  receiver_url: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lineChatCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'lineChatCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      line_webhook_event_fk,
      campaign_name,
      msg_id,
      msg_type,
      msg_body,
      reply_token,
      quote_token,
      media_url,
      content_type,
      file_name,
      reply_to_msg_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      caption,
      msg_timestamp,
      sender,
      sender_url,
      receiver,
      receiver_url,
      delivered,
      sent,
      failed,
      read,
      replied,
      created_by,
    } = record;
    const line_chat_id = h.general.generateId();
    await lineChatModel.create(
      {
        line_chat_id,
        agency_fk,
        contact_fk,
        agency_user_fk,
        line_webhook_event_fk,
        campaign_name,
        msg_id,
        msg_type,
        msg_body,
        reply_token,
        quote_token,
        media_url,
        content_type,
        file_name,
        reply_to_msg_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_file_name,
        reply_to_contact_id,
        caption,
        msg_timestamp,
        sender,
        sender_url,
        receiver,
        receiver_url,
        delivered,
        sent,
        failed,
        read,
        replied,
        created_by,
      },
      { transaction },
    );

    return line_chat_id;
  };

  /**
   * Update line_chat record
   * @param {string} line_chat_id
   * @param {{
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_msg_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  lineChatCtl.update = async (
    line_chat_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'lineChatCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      line_webhook_event_fk,
      campaign_name,
      msg_id,
      msg_type,
      msg_body,
      reply_token,
      quote_token,
      media_url,
      content_type,
      file_name,
      reply_to_msg_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      caption,
      msg_timestamp,
      sender,
      sender_url,
      receiver,
      receiver_url,
      delivered,
      sent,
      failed,
      read,
      replied,
    } = record;

    await lineChatModel.update(
      {
        agency_fk,
        contact_fk,
        agency_user_fk,
        line_webhook_event_fk,
        campaign_name,
        msg_id,
        msg_type,
        msg_body,
        reply_token,
        quote_token,
        media_url,
        content_type,
        file_name,
        reply_to_msg_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_file_name,
        reply_to_contact_id,
        caption,
        msg_timestamp,
        sender,
        sender_url,
        receiver,
        receiver_url,
        delivered,
        sent,
        failed,
        read,
        replied,
        updated_by,
      },
      {
        where: { line_chat_id },
        transaction,
      },
    );

    return line_chat_id;
  };

  /**
   * Find all line_chat records
   * @param {{
   *  line_chat_id: string,
   *  campaign_name: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  line_webhook_event_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_msg_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender: string,
   *  receiver: string,
   *  sender_url: string,
   *  receiver_url: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  lineChatCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'lineChatCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lineChatModel.findAll({
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
   * Find one line_chat record
   * @param {{
   *  line_chat_id: string,
   *  campaign_name: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  line_webhook_event_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_msg_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender: string,
   *  receiver: string,
   *  sender_url: string,
   *  receiver_url: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  lineChatCtl.findOne = async (where, { include, order, transaction } = {}) => {
    const funcName = 'lineChatCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await lineChatModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete line_chat record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  lineChatCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'lineChatCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await lineChatModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count line_chat record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  lineChatCtl.count = async (where, { include, transaction } = {}) => {
    const funcName = 'lineChatCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await lineChatModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return lineChatCtl;
};
