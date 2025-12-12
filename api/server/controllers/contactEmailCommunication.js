const h = require('../helpers');

module.exports.makeContactEmailCommunicationController = (models) => {
  const { contact_email_communication: contactEmailCommunicationModel } =
    models;
  const contactEmailCommunicationController = {};

  /**
   * Create new record in contact_email_communication model
   * @param {{
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  email_subject?: string,
   *  email_body?: string,
   *  email_meta?: string,
   *  created_by?: string
   * }} record
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<string>}
   */
  contactEmailCommunicationController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactEmailCommunicationController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      contact_fk,
      agency_user_fk,
      email_subject,
      email_body,
      email_meta,
      created_by,
    } = record;
    const contact_email_communication_id = h.general.generateId();
    await contactEmailCommunicationModel.create(
      {
        contact_email_communication_id,
        contact_fk,
        agency_user_fk,
        email_subject,
        email_body,
        email_meta,
        created_by: created_by || contact_fk,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_email_communication_id;
  };

  /**
   * Update a record in contact_email_communication model
   * @param {{
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  email_subject?: string,
   *  email_body?: string,
   *  email_meta?: string,
   *  updated_by?: string
   * }} record
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<string>}
   */
  contactEmailCommunicationController.update = async (
    contact_email_communication_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactEmailCommunicationController.update';
    h.validation.requiredParams(funcName, {
      contact_email_communication_id,
      record,
    });
    const {
      contact_fk,
      agency_user_fk,
      email_subject,
      email_body,
      email_meta,
      updated_by,
    } = record;

    await contactEmailCommunicationModel.update(
      {
        contact_fk,
        agency_user_fk,
        email_subject,
        email_body,
        email_meta,
        updated_by,
      },
      { where: { contact_email_communication_id }, transaction },
    );
    return contact_email_communication_id;
  };

  /**
   * Bulk update records in contact_email_communication model
   * @param {{
   *  contact_email_communication_id?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  email_subject?: string,
   *  email_body?: string,
   *  email_meta?: string,
   *  created_by?: string
   *  updated_by?: string
   * }} where
   * @param {{
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  email_subject?: string,
   *  email_body?: string,
   *  email_meta?: string,
   *  updated_by?: string
   * }} record
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<string>}
   */
  contactEmailCommunicationController.bulkUpdate = async (
    where,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactEmailCommunicationController.bulkUpdate';
    h.validation.requiredParams(funcName, {
      where,
      record,
    });
    const {
      contact_fk,
      agency_user_fk,
      email_subject,
      email_body,
      email_meta,
      updated_by,
    } = record;

    return await contactEmailCommunicationModel.update(
      {
        contact_fk,
        agency_user_fk,
        email_subject,
        email_body,
        email_meta,
        updated_by,
      },
      { where: { ...where }, transaction },
    );
  };

  /**
   * find all contact_email_communication records
   * @param {{
   *  contact_email_communication_id?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  email_subject?: string,
   *  email_body?: string,
   *  email_meta?: string,
   *  created_by?: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, order?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactEmailCommunicationController.findAll = async (
    where,
    { include, order, transaction } = {},
  ) => {
    const funcName = 'contactEmailCommunicationController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactEmailCommunicationModel.findAll({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * find single contact_email_communication records
   * @param {{
   *  contact_email_communication_id?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  email_subject?: string,
   *  email_body?: string,
   *  email_meta?: string,
   *  created_by?: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactEmailCommunicationController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'contactEmailCommunicationController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactEmailCommunicationModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete contact activity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactEmailCommunicationController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactEmailCommunicationController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactEmailCommunicationModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return contactEmailCommunicationController;
};
