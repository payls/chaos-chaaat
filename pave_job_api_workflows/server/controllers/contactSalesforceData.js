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

  /**
   * `contactSalesforceData.initializeContactRecord` is a function that initializes a contact record in the Salesforce data
   * model. It takes in data related to the contact such as receiver number, agency ID, contact ID, contact first name,
   * contact last name, and field configurations.
   * @async
   * @constant
   * @name initializeContactRecord
   * @type {{ create(record: { agency_fk: string; contact_fk: string; first_name: string; last_name: string; email: string; mobile: string; language: string; interested_product: string; interested_city: string; enable_marketing: boolean; tnc_agree: boolean; created_by: string; }, { transaction }?: { transaction?: object; } | undefined): Promise<string>; ... 4 more ...; initializeContactRecord(data: any, { transaction }?: { ...; }): Promise<...>; }}
   */
  contactSalesforceData.initializeContactRecord = async (
    data,
    { transaction } = {},
  ) => {
    const {
      sender_number,
      receiver_number,
      agency_id,
      contact_id,
      contactFirstName,
      contactLastName,
      field_configurations,
    } = data;
    const contact_phone_parts = h.mobile.getMobileParts(receiver_number);
    const formatted_contact_phone =
      contact_phone_parts.countryCode + ' ' + contact_phone_parts.restOfNumber;

    const contact_salesforce_data_id = h.general.generateId();
    const contact_salesforce_data_record = {
      contact_salesforce_data_id,
      agency_fk: agency_id,
      contact_fk: contact_id,
      first_name: h.notEmpty(contactFirstName) ? contactFirstName : 'N/A',
      last_name: h.notEmpty(contactLastName) ? contactLastName : 'N/A',
      language: 'English',
      mobile: formatted_contact_phone,
      enable_marketing: true,
      tnc_agree: true,
      data_synced: false,
    };

    let phone_city_code =
      constant.PHONE_CITY_CODE[contact_phone_parts.countryCode];
    const waba_phone_parts = h.mobile.getMobileParts(sender_number);
    phone_city_code = h.isEmpty(phone_city_code)
      ? constant.PHONE_CITY_CODE[waba_phone_parts.countryCode]
      : phone_city_code;
    contact_salesforce_data_record.interested_city = phone_city_code;

    if (h.notEmpty(field_configurations)) {
      field_configurations.forEach((configuration) => {
        if (h.notEmpty(configuration.defaultValue)) {
          if (h.cmpStr(configuration.field, 'lead_source')) {
            contact_salesforce_data_record.lead_source =
              configuration.defaultValue;
          }
          if (h.cmpStr(configuration.field, 'lead_channel')) {
            contact_salesforce_data_record.lead_source_lv1 =
              configuration.defaultValue;
          }
          if (h.cmpStr(configuration.field, 'origin')) {
            contact_salesforce_data_record.lead_source_lv2 =
              configuration.defaultValue;
          }
        } else {
          if (h.cmpStr(configuration.field, 'lead_source')) {
            contact_salesforce_data_record.lead_source = 'Online';
          }
          if (h.cmpStr(configuration.field, 'lead_channel')) {
            contact_salesforce_data_record.lead_source_lv1 = 'WhatsApp';
          }
          if (h.cmpStr(configuration.field, 'origin')) {
            contact_salesforce_data_record.lead_source_lv2 = 'Chaaat';
          }
        }
      });
    }
    await models.contact_salesforce_data.create(
      contact_salesforce_data_record,
      {
        transaction,
      },
    );
  };

  return contactSalesforceData;
};
