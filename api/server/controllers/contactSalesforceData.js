const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { contact_salesforce_data: contactSalesforceDataModel } = models;

  const contactSalesforceData = {};

  /**
   * Create contact_salesforce_data record
   * @param {{
   *  agency_fk: string,
   *  contact_fk: string,
   *  first_name: string,
   *  last_name: string,
   *  email: string,
   *  mobile: string,
   *  language: string,
   *  interested_product: string,
   *  interested_city: string,
   *  enable_marketing: boolean,
   *  tnc_agree: boolean,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSalesforceData.create = async (record, { transaction } = {}) => {
    const funcName = 'contactSalesforceData.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      first_name,
      last_name,
      email,
      mobile,
      language,
      interested_product,
      interested_city,
      lead_source,
      lead_source_lv1,
      lead_source_lv2,
      enable_marketing,
      tnc_agree,
      tnc_date,
      created_by,
    } = record;
    const contact_salesforce_data_id = h.general.generateId();
    await contactSalesforceDataModel.create(
      {
        contact_salesforce_data_id,
        agency_fk,
        contact_fk,
        first_name,
        last_name,
        email,
        mobile,
        language,
        interested_product,
        interested_city,
        lead_source,
        lead_source_lv1,
        lead_source_lv2,
        enable_marketing,
        tnc_agree,
        tnc_date,
        created_by,
      },
      { transaction },
    );

    return contact_salesforce_data_id;
  };

  /**
   * Update contact_salesforce_data record
   * @param {string} contact_salesforce_data_id
   * @param {{
   *  agency_fk: string,
   *  contact_fk: string,
   *  first_name: string,
   *  last_name: string,
   *  email: string,
   *  mobile: string,
   *  language: string,
   *  interested_product: string,
   *  interested_city: string,
   *  enable_marketing: boolean,
   *  tnc_agree: boolean,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSalesforceData.update = async (
    contact_salesforce_data_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'contactSalesforceData.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      first_name,
      last_name,
      email,
      mobile,
      language,
      interested_product,
      interested_city,
      lead_source,
      lead_source_lv1,
      lead_source_lv2,
      enable_marketing,
      tnc_agree,
      tnc_date,
    } = record;

    await contactSalesforceDataModel.update(
      {
        agency_fk,
        contact_fk,
        first_name,
        last_name,
        email,
        mobile,
        language,
        interested_product,
        interested_city,
        lead_source,
        lead_source_lv1,
        lead_source_lv2,
        enable_marketing,
        tnc_agree,
        tnc_date,
        updated_by,
      },
      {
        where: { contact_salesforce_data_id },
        transaction,
      },
    );

    return contact_salesforce_data_id;
  };

  /**
   * Find all contact_salesforce_data records
   * @param {{
   *  contact_salesforce_data_id: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  first_name: string,
   *  last_name: string,
   *  email: string,
   *  mobile: string,
   *  language: string,
   *  interested_product: string,
   *  interested_city: string,
   *  enable_marketing: boolean,
   *  tnc_agree: boolean,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactSalesforceData.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'contactSalesforceData.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactSalesforceDataModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      group,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one contact_salesforce_data record
   * @param {{
   *  contact_salesforce_data_id: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  first_name: string,
   *  last_name: string,
   *  email: string,
   *  mobile: string,
   *  language: string,
   *  interested_product: string,
   *  interested_city: string,
   *  enable_marketing: boolean,
   *  tnc_agree: boolean,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactSalesforceData.findOne = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'contactSalesforceData.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactSalesforceDataModel.findOne({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete contact_salesforce_data record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactSalesforceData.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactSalesforceData.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactSalesforceDataModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return contactSalesforceData;
};
