const h = require('../helpers');

module.exports.makeContactPropertyValuesController = (models) => {
  const { contact_property_values: contactPropertyValuesModel } = models;

  const contactPropertyValuesController = {};

  /**
   * create contact_property_values record
   * @param {{
   *  contact_fk: string,
   *  contact_property_definition_fk: string,
   *  attribute_value_int?: double,
   *  attribute_value_string?: text,
   *  attribute_value_date?: timestamp,
   *  is_deleted?: boolean,
   *  created_by: string,
   * }} record
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<string>}
   */
  contactPropertyValuesController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyValuesController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      contact_fk,
      contact_property_definition_fk,
      attribute_value_int,
      attribute_value_string,
      attribute_value_date,
      is_deleted,
      created_by,
    } = record;

    // make sure only one of the three values is non null
    h.validation.onlyOneValueIsNotNull(funcName, {
      attribute_value_int,
      attribute_value_string,
      attribute_value_date,
    });

    const contact_property_value_id = h.general.generateId();
    await contactPropertyValuesModel.create(
      {
        contact_property_value_id,
        contact_fk,
        contact_property_definition_fk,
        attribute_value_int,
        attribute_value_string,
        attribute_value_date,
        is_deleted,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_property_value_id;
  };

  /**
   * update contact_property_values record
   * @param {string} contact_property_value_id
   * @param {{
   *  contact_fk: string,
   *  contact_property_definition_fk: string,
   *  attribute_value_int?: double,
   *  attribute_value_string?: text,
   *  attribute_value_date?: timestamp,
   *  is_deleted?: boolean,
   *  updated_by: string,
   * }} record
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<string>}
   */
  contactPropertyValuesController.update = async (
    contact_property_value_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyValuesController.update';
    h.validation.requiredParams(funcName, {
      contact_property_value_id,
      record,
    });
    const {
      contact_fk,
      contact_property_definition_fk,
      attribute_value_int,
      attribute_value_string,
      attribute_value_date,
      is_deleted,
      updated_by,
    } = record;

    // make sure only one of the three values is not null
    h.validation.onlyOneValueIsNotNull(funcName, {
      attribute_value_int,
      attribute_value_string,
      attribute_value_date,
    });

    await contactPropertyValuesModel.update(
      {
        contact_fk,
        contact_property_definition_fk,
        attribute_value_int,
        attribute_value_string,
        attribute_value_date,
        is_deleted,
        updated_by,
      },
      {
        where: { contact_property_value_id },
        transaction,
      },
    );

    return contact_property_value_id;
  };

  /**
   * Find all contact_property_values records
   * @param {{
   *  contact_property_value_id?: string,
   *  contact_fk?: string,
   *  contact_property_definition_fk?: string,
   *  attribute_value_int?: double,
   *  attribute_value_string?: text,
   *  attribute_value_date?: timestamp,
   *  is_deleted?: boolean,
   *  created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<Array>}
   */
  contactPropertyValuesController.findAll = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyValuesController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactPropertyValuesModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one contact_property_values records
   * @param {{
   *  contact_property_value_id?: string,
   *  contact_fk?: string,
   *  contact_property_definition_fk?: string,
   *  attribute_value_int?: double,
   *  attribute_value_string?: text,
   *  attribute_value_date?: timestamp,
   *  is_deleted?: boolean,
   *  created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<Array>}
   */
  contactPropertyValuesController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'contactPropertyValuesController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactPropertyValuesModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete contact_property_values record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactPropertyValuesController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyValuesController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactPropertyValuesModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return contactPropertyValuesController;
};
