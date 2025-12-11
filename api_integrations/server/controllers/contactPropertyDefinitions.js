const h = require('../helpers');

module.exports.makeContactPropertyDefinitionsController = (models) => {
  const { contact_property_definitions: contactPropertyDefinitionsModel } =
    models;

  const contactPropertyDefinitionsController = {};

  /**
   * create contact_property_definitions record
   * @param {{
   *  agency_user_fk: string,
   *  agency_fk: string,
   *  attribute_name?: string,
   *  attribute_type?: string,
   *  attribute_source?: string,
   *  status?: string,
   *  created_by: string,
   * }} record
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<string>}
   */
  contactPropertyDefinitionsController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyDefinitionsController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_user_fk,
      agency_fk,
      attribute_name,
      attribute_type,
      attribute_source,
      status,
      created_by,
    } = record;

    const contact_property_definition_id = h.general.generateId();
    await contactPropertyDefinitionsModel.create(
      {
        contact_property_definition_id,
        agency_user_fk,
        agency_fk,
        attribute_name,
        attribute_type,
        attribute_source,
        status,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_property_definition_id;
  };

  /**
   * Update contact_property_definitions record
   * @param {string} contact_property_definition_id
   * @param {{
   *  agency_user_fk?: string,
   *  agency_fk?: string,
   *  attribute_name?: string,
   *  attribute_type?: string,
   *  attribute_source?: string,
   *  status?: string,
   *  updated_by: string,
   * }} record
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<string>}
   */
  contactPropertyDefinitionsController.update = async (
    contact_property_definition_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyDefinitionsController.update';
    h.validation.requiredParams(funcName, {
      contact_property_definition_id,
      record,
    });
    const {
      agency_user_fk,
      agency_fk,
      attribute_name,
      attribute_type,
      attribute_source,
      status,
      updated_by,
    } = record;

    await contactPropertyDefinitionsModel.update(
      {
        agency_user_fk,
        agency_fk,
        attribute_name,
        attribute_type,
        attribute_source,
        status,
        updated_by,
      },
      {
        where: { contact_property_definition_id },
        transaction,
      },
    );

    return contact_property_definition_id;
  };

  /**
   * Find all contact_property_definitions records
   * @param {{
   *  contact_property_definition_id?: string,
   *  agency_user_fk?: string,
   *  agency_fk?: string,
   *  attribute_name?: string,
   *  attribute_type?: string,
   *  attribute_source?: string,
   *  status?: string,
   *  created_by?: string,
   *  updated_by?: string,
   * }} where
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<Array>}
   */
  contactPropertyDefinitionsController.findAll = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyDefinitionsController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactPropertyDefinitionsModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one contact_property_definitions record
   * @param {{
   *  contact_property_definition_id?: string,
   *  agency_user_fk?: string,
   *  agency_fk?: string,
   *  attribute_name?: string,
   *  attribute_type?: string,
   *  attribute_source?: string,
   *  status?: string,
   *  created_by?: string,
   *  updated_by?: string,
   * }} where
   * @param {{ transaction?: object }} [options]
   * @returns {Promise<Array>}
   */
  contactPropertyDefinitionsController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'contactPropertyDefinitionsController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactPropertyDefinitionsModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete contact_property_definitions record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactPropertyDefinitionsController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactPropertyDefinitionsController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactPropertyDefinitionsModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return contactPropertyDefinitionsController;
};
