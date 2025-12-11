const h = require('../helpers');

module.exports.makeContactViewController = (models) => {
  const { contact_view: contactViewModel } = models;

  const contactViewController = {};

  /**
   * Create contact_view record
   * @param {{
   *  agency_fk:  string ,
   *  agency_user_fk: string,
   *  contact_view_name: string,
   *  contact_view_fields: string,
   *  access_level: integer,
   *  contact_view_status: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactViewController.create = async (record, { transaction } = {}) => {
    const funcName = 'contactViewController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      agency_user_fk,
      contact_view_name,
      contact_view_fields,
      access_level,
      created_by,
    } = record;
    const contact_view_id = h.general.generateId();
    const contact_view_status = 'active';
    await contactViewModel.create(
      {
        contact_view_id,
        agency_fk,
        agency_user_fk,
        contact_view_name,
        contact_view_fields,
        access_level,
        contact_view_status,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_view_id;
  };

  /**
   * Update contact_view record
   * @param {string} contact_view_id
   * @param {{
   *  agency_fk: string ,
   *  agency_user_fk: string,
   *  contact_view_name: string,
   *  contact_view_fields: string,
   *  access_level: integer,
   *  contact_view_status: string,
   * 	created_by: string,
   * 	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactViewController.update = async (
    contact_view_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactViewController.update';
    h.validation.requiredParams(funcName, { contact_view_id, record });
    const {
      agency_fk,
      agency_user_fk,
      contact_view_name,
      contact_view_fields,
      access_level,
      contact_view_status,
      updated_by,
    } = record;
    await contactViewModel.update(
      {
        agency_fk,
        agency_user_fk,
        contact_view_name,
        contact_view_fields,
        access_level,
        contact_view_status,
        updated_by,
      },
      { where: { contact_view_id }, transaction },
    );
    return contact_view_id;
  };

  /**
   * Bulkd Update contact_view records
   * @param {{
   *  contact_view_id?: string,
   *  agency_fk: string ,
   *  agency_user_fk: string,
   *  contact_view_name: string,
   *  contact_view_fields: string,
   *  access_level: integer,
   *  contact_view_status: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{
   *  agency_fk: string ,
   *  agency_user_fk: string,
   *  contact_view_name: string,
   *  contact_view_fields: string,
   *  access_level: integer,
   *  contact_view_status: string,
   * 	created_by: string,
   * 	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactViewController.bulkUpdate = async (
    where,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactViewController.bulkUpdate';
    h.validation.requiredParams(funcName, { where, record });
    const {
      agency_fk,
      agency_user_fk,
      contact_view_name,
      contact_view_fields,
      access_level,
      contact_view_status,
      updated_by,
    } = record;
    return await contactViewModel.update(
      {
        agency_fk,
        agency_user_fk,
        contact_view_name,
        contact_view_fields,
        access_level,
        contact_view_status,
        updated_by,
      },
      { where: { ...where }, transaction },
    );
  };

  /**
   * Find all contact_view records
   * @param {{
   *  contact_view_id?: string,
   *  agency_fk: string ,
   *  agency_user_fk: string,
   *  contact_view_name: string,
   *  contact_view_fields: string,
   *  access_level: integer,
   *  contact_view_status: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactViewController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'contactViewController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactViewModel.findAll({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one contact_view record
   * @param {{
   *  contact_view_id?: string,
   *  agency_fk: string ,
   *  agency_user_fk: string,
   *  contact_view_name: string,
   *  contact_view_fields: string,
   *  access_level: integer,
   *  contact_view_status: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactViewController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'contactViewController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactViewModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Find or create a contactView
   * @param where
   * @param defaults
   * @param transaction
   * @returns {Promise<{created: *, record: (Object|Array)}>}
   */
  contactViewController.findOrCreate = async (
    where,
    defaults,
    { transaction } = {},
  ) => {
    const funcName = 'contactViewController.findOrCreate';

    /* Implementation using the findOrCreate from sequelize */
    h.validation.requiredParams(funcName, { where, defaults });

    const {
      agency_fk,
      agency_user_fk,
      contact_view_name,
      contact_view_fields,
      access_level,
      created_by,
    } = defaults;

    h.validation.requiredParams(funcName, { contact_view_fields, agency_fk });

    const contact_view_id = h.general.generateId();

    const [record, created] = await contactViewModel.findOrCreate({
      where: { ...where },
      defaults: {
        contact_view_id,
        agency_fk,
        agency_user_fk,
        contact_view_name,
        contact_view_fields,
        access_level,
        created_by,
        updated_by: created_by,
      },
      transaction,
    });

    return { record: h.database.formatData(record), created: created };
  };

  /**
   * Hard delete task record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactViewController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactViewController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactViewModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return contactViewController;
};
