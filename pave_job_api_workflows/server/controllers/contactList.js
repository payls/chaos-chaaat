const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');

module.exports.makeController = (models) => {
  const { contact_list: contactListModel } = models;
  const contactList = {};

  /**
   * Create contact list record
   * @param {{
   *  list_name?: string,
   *  list_type?: string,
   *  list_property_name?: string,
   *  list_property_value?: string,
   * 	agency_fk: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactList.create = async (record, { transaction } = {}) => {
    const funcName = 'contactList.create';
    h.validation.requiredParams(funcName, { record });
    const {
      list_name,
      list_type,
      list_property_name,
      list_property_value,
      source_type,
      source_value,
      agency_fk,
      status,
      user_count,
      created_by,
    } = record;
    const contact_list_id = h.general.generateId();
    await contactListModel.create(
      {
        contact_list_id,
        list_name,
        list_type,
        list_property_name,
        list_property_value,
        source_type,
        source_value,
        agency_fk,
        user_count,
        status,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_list_id;
  };

  /**
   * Find one contact_list record
   * @param {{
   *  contact_list_id: string,
   *  list_name: string,
   *  agency_fk: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactList.findOne = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'contactList.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactListModel.findOne({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Find all contact_list records
   * @param {{
   *  contact_list_id: string,
   *  list_name: string,
   *  agency_fk: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactList.findAll = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'contactList.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactListModel.findAll({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete contact_list record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactList.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactList.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactListModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Update contact_list record
   * @param {string} contact_list_id
   * @param {{
   *  list_name: string,
   *  list_type?: string,
   *  list_property_name?: string,
   *  list_property_value?: string,
   *  agency_fk: string,
   *  status: string,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactList.update = async (
    contact_list_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'contactList.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      list_name,
      user_count,
      list_type,
      list_property_name,
      list_property_value,
      source_type,
      source_value,
      status,
    } = record;

    await contactListModel.update(
      {
        list_name,
        agency_fk,
        user_count,
        list_type,
        list_property_name,
        list_property_value,
        source_type,
        source_value,
        status,
        updated_by,
      },
      {
        where: { contact_list_id },
        transaction,
      },
    );

    return contact_list_id;
  };

  /**
 * Increment a specific column value in a contact list.
 *
 * @param {object} where - Conditions to identify the target contact list.
 * @param {string} column - The column to be incremented.
 * @param {number} by - The increment value.
 * @param {{ transaction?: object }} [options] - Additional options, such as a transaction.
 * @returns {Promise<void>}
 */
  contactList.increment = async (where, column, by = 1, { transaction } = {}) => {
    const funcName = 'contactList.increment';
    h.validation.requiredParams(funcName, { where, column });
    
    await contactListModel.increment(column, {
      by,
      where: { ...where },
      transaction,
    });
  };

  return contactList;
};
