const h = require('../helpers');
const { Op } = require('sequelize');

module.exports.makeController = (models) => {
  const { messenger_chat: messengerChatModel } = models;

  const messengerChatCtl = {};

  /**
   * Create messenger_chat record
   * @param {{
   *  campaign_name: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  messenger_webhook_event_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_event_id: string,
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
  messengerChatCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'messengerChatCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      messenger_webhook_event_fk,
      campaign_name,
      msg_id,
      msg_type,
      msg_body,
      media_url,
      content_type,
      file_name,
      reply_to_messenger_chat_id,
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
    const messenger_chat_id = h.general.generateId();
    await messengerChatModel.create(
      {
        messenger_chat_id,
        agency_fk,
        contact_fk,
        agency_user_fk,
        messenger_webhook_event_fk,
        campaign_name,
        msg_id,
        msg_type,
        msg_body,
        media_url,
        content_type,
        file_name,
        reply_to_messenger_chat_id,
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

    return messenger_chat_id;
  };

  /**
   * Update messenger_chat record
   * @param {string} messenger_chat_id
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
   *  reply_to_messenger_chat_id: string,
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
  messengerChatCtl.update = async (
    messenger_chat_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'messengerChatCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      messenger_webhook_event_fk,
      campaign_name,
      msg_id,
      msg_type,
      msg_body,
      media_url,
      content_type,
      file_name,
      reply_to_messenger_chat_id,
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

    await messengerChatModel.update(
      {
        agency_fk,
        contact_fk,
        agency_user_fk,
        messenger_webhook_event_fk,
        campaign_name,
        msg_id,
        msg_type,
        msg_body,
        media_url,
        content_type,
        file_name,
        reply_to_messenger_chat_id,
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
        where: { messenger_chat_id },
        transaction,
      },
    );

    return messenger_chat_id;
  };

  /**
   * Find all messenger_chat records
   * @param {{
   *  messenger_chat_id: string,
   *  campaign_name: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  messenger_webhook_event_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_event_id: string,
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
  messengerChatCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'messengerChatCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await messengerChatModel.findAll({
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
   * Find one messenger_chat record
   * @param {{
   *  messenger_chat_id: string,
   *  campaign_name: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  messenger_webhook_event_fk: string,
   *  msg_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_event_id: string,
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
  messengerChatCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'messengerChatCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await messengerChatModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete messenger_chat record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  messengerChatCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'messengerChatCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await messengerChatModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return messengerChatCtl;
};
