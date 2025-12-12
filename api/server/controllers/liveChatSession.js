const h = require('../helpers');
const { Op } = require('sequelize');

module.exports.makeController = (models) => {
  const {
    live_chat: liveChatModel,
    live_chat_session: liveChatSessionModel,
    contact: contactModel,
    agency: agencyModel,
  } = models;

  const liveChatSessionCtl = {};

  /**
   * Create live_chat_session record
   * @param {{
   *  contact_fk: string,
   *  status: string,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  liveChatSessionCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'liveChatSessionCtl.create';
    h.validation.requiredParams(funcName, { record });
    const { contact_fk, status, created_by } = record;
    const live_chat_session_id = h.general.generateId();
    await liveChatSessionModel.create(
      {
        live_chat_session_id,
        contact_fk,
        status,
        created_by,
      },
      { transaction },
    );

    return live_chat_session_id;
  };

  /**
   * Update live_chat_session record
   * @param {string} live_chat_session_id
   * @param {{
   *  contact_fk: string,
   *  status: string,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  liveChatSessionCtl.update = async (
    live_chat_session_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'liveChatSessionCtl.update';
    h.validation.requiredParams(funcName, { record });
    const { contact_fk, status } = record;

    await liveChatSessionModel.update(
      {
        contact_fk,
        status,
        updated_by,
      },
      {
        where: { live_chat_session_id },
        transaction,
      },
    );

    return live_chat_session_id;
  };

  /**
   * Find all live_chat_session records
   * @param {{
   *  live_chat_session_id: string,
   *  contact_fk: string,
   *  status: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  liveChatSessionCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'liveChatSessionCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await liveChatSessionModel.findAll({
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
   * Find one live_chat_session record
   * @param {{
   *  live_chat_session_id: string,
   *  contact_fk: string,
   *  status: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  liveChatSessionCtl.findOne = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'liveChatSessionCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await liveChatSessionModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete live_chat_session record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  liveChatSessionCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'liveChatSessionCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await liveChatSessionModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Process start live chat session
   * @param {object} body
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  liveChatSessionCtl.startSession = async (body, { transaction } = {}) => {
    console.log(body);
    const [agency, paveSupport, existingLiveContact] = await Promise.all([
      agencyModel.findOne({
        where: {
          agency_id: body.agency_id,
        },
      }),
      models.user.findOne({
        where: {
          email: {
            [Op.like]: `%support%`,
          },
        },
        include: [
          {
            model: models.agency_user,
            where: {
              agency_fk: body.agency_id,
            },
            include: [
              {
                model: models.agency,
              },
            ],
          },
        ],
      }),
      contactModel.findOne({
        where: {
          agency_fk: body.agency_id,
          mobile_number: body.mobile_number,
        },
        transaction,
      }),
    ]);

    let contact_id;
    const contactOwner = !h.isEmpty(
      agency.dataValues.default_outsider_contact_owner,
    )
      ? agency.dataValues.default_outsider_contact_owner
      : paveSupport?.agency_user?.dataValues?.agency_user_id;

    if (existingLiveContact) {
      console.log(existingLiveContact);
    } else {
      contact_id = h.general.generateId();
      await contactModel.create(
        {
          contact_id,
          first_name: body.first_name,
          last_name: body.last_name,
          email: null,
          mobile_number: body.mobile_number,
          is_whatsapp: 0,
          agency_fk: body.agency_id,
          agency_user_fk: contactOwner,
          from_export: false,
          status: 'active',
        },
        { transaction },
      );
    }

    const live_chat_session_id = h.general.generateId();
    await liveChatSessionModel.create(
      {
        live_chat_session_id,
        contact_fk: contact_id,
        status: 'active',
        created_by: null,
      },
      { transaction },
    );

    const live_chat_id = h.general.generateId();
    await liveChatModel.create(
      {
        live_chat_id,
        agency_fk: body.agency_id,
        contact_fk: contact_id,
        agency_user_fk: contactOwner,
        session_id: live_chat_session_id,
        msg_type: 'start_session',
        msg_body: 'A live chat session has been started',
        sender_number: null,
        receiver_number: body.mobile_number,
        delivered: 1,
        sent: 1,
        failed: 0,
        read: 1,
        replied: 0,
        created_by: null,
      },
      { transaction },
    );
    return live_chat_session_id;
  };

  return liveChatSessionCtl;
};
