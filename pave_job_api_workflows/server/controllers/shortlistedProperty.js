const h = require('../helpers');

module.exports.makeShortListedPropertyController = (models) => {
  const {
    shortlisted_property: shortListedPropertyModel,
    shortlisted_property_setting: shortlistedPropertySettingModel,
  } = models;
  const shortListedPropertyController = {};
  const projectPropertyController =
    require('./projectProperty').makeProjectPropertyController(models);

  /**
   * Create short listed property record
   * @param {{
   *  project_property_fk?: string,
   *  property_fk?: string,
   *  contact_fk?: string,
   *  display_order?: integer,
   *  property_rating?: number,
   *  property_rating_updated_date?: string,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  is_requested_for_reservation?: boolean,
   *  reservation_date?: date,
   *  is_general_enquiry?: boolean,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortListedPropertyController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortListedPropertyController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      project_property_fk,
      property_fk,
      contact_fk,
      display_order,
      property_rating,
      property_rating_updated_date,
      is_bookmarked,
      bookmark_date,
      is_general_enquiry,
      created_by,
    } = record;
    const shortlisted_property_id = h.general.generateId();
    await shortListedPropertyModel.create(
      {
        shortlisted_property_id,
        project_property_fk,
        property_fk,
        contact_fk,
        display_order,
        property_rating,
        property_rating_updated_date,
        is_bookmarked,
        bookmark_date,
        is_general_enquiry,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_property_id;
  };

  /**
   * Update shortlisted property record
   * @param {string} shortlisted_property_id
   * @param {{
   *  project_property_fk?: string,
   * 	property_fk?: string,
   *  contact_fk?: string,
   *  display_order?: integer,
   *  property_rating?: number,
   *  property_rating_updated_date?: string,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  is_requested_for_reservation?: boolean,
   *  reservation_date?: date,
   *  is_general_enquiry?: boolean,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortListedPropertyController.update = async (
    shortlisted_property_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortListedPropertyController.update';
    h.validation.requiredParams(funcName, { shortlisted_property_id, record });
    const {
      project_property_fk,
      property_fk,
      contact_fk,
      display_order,
      property_rating,
      property_rating_updated_date,
      is_bookmarked,
      bookmark_date,
      is_requested_for_reservation,
      reservation_date,
      is_general_enquiry,
      updated_by,
    } = record;
    await shortListedPropertyModel.update(
      {
        project_property_fk,
        property_fk,
        contact_fk,
        display_order,
        property_rating,
        property_rating_updated_date,
        is_bookmarked,
        bookmark_date,
        is_requested_for_reservation,
        reservation_date,
        is_general_enquiry,
        updated_by,
      },
      { where: { shortlisted_property_id }, transaction },
    );
    return shortlisted_property_id;
  };

  /**
   * Update all short listed project record
   * @param {array} shortlisted_property_ids
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortListedPropertyController.tagOpenShortlistedProperties = async (
    shortlisted_property_ids,
    { transaction } = {},
  ) => {
    const funcName =
      'shortListedPropertyController.tagOpenShortlistedProperties';
    h.validation.requiredParams(funcName, { shortlisted_property_ids });

    await shortListedPropertyModel.update(
      {
        is_opened: 1,
      },
      {
        where: { shortlisted_property_id: shortlisted_property_ids },
        transaction,
      },
    );
    return shortlisted_property_ids;
  };

  /**
   * Find all short listed property records
   * @param {{
   *  shortlisted_property_id?: string,
   *  project_property_fk?: string,
   * 	property_fk?: string,
   *  contact_fk?: string,
   *  display_order?: integer,
   *  property_rating?: number,
   *  property_rating_updated_date?: string,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  is_requested_for_reservation?: boolean,
   *  reservation_date?: date,
   *  is_general_enquiry?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object, order?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortListedPropertyController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'shortListedPropertyController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortListedPropertyModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one short listed property record
   * @param {{
   *  shortlisted_property_id?: string,
   *  project_property_fk?: string,
   * 	property_fk?: string,
   *  contact_fk?: string,
   *  display_order?: integer,
   *  property_rating?: number,
   *  property_rating_updated_date?: string,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  is_requested_for_reservation?: boolean,
   *  reservation_date?: date,
   *  is_general_enquiry?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortListedPropertyController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortListedPropertyController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortListedPropertyModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Count shortlisted property by unique column
   * @param column?: string
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortListedPropertyController.countUnique = async (
    column,
    { include, transaction } = {},
  ) => {
    const records = await shortListedPropertyModel.count({
      distinct: true,
      col: column,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete short listed property record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortListedPropertyController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortListedPropertyController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortListedPropertyModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) {
      await shortlistedPropertySettingModel.destroy({
        where: {
          shortlisted_property_fk: record.shortlisted_property_id,
        },
        transaction,
      });

      await record.destroy({ transaction });
    }
  };

  /**
   * Hard delete all short listed property record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortListedPropertyController.destroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName = 'shortListedPropertyController.destroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortListedPropertyModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const i in records) {
      const record = records[i];
      await shortlistedPropertySettingModel.destroy({
        where: {
          shortlisted_property_fk: record.shortlisted_property_id,
        },
        transaction,
      });

      await record.destroy({ transaction });
    }
  };

  /**
   * Soft delete all short listed property record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortListedPropertyController.softDestroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName = 'shortListedPropertyController.softDestroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortListedPropertyModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const record of records) {
      await shortListedPropertyModel.update(
        {
          is_deleted: true,
        },
        {
          where: {
            shortlisted_property_id: record.shortlisted_property_id,
          },
          transaction,
        },
      );
    }
  };

  /**
   * Parse shortlisted_properties into Obj where properties are
   * placed into their respective projects
   * @param {object} shortlistedPropertyRecords
   * @returns {Promise<Object>}
   */
  shortListedPropertyController.parseShortlistedProperties = async (
    shortlistedPropertyRecords,
  ) => {
    // const funcName = 'shortListedPropertyController.parseShortlistedProperties';
    const shortlistedProperties = [];
    for (let j = 0; j < shortlistedPropertyRecords.length; j++) {
      const shortlistedPropertyRecord = shortlistedPropertyRecords[j];
      let projectUnit = shortlistedPropertyRecord.project_property;
      // Format project property for frontend
      projectUnit = projectPropertyController.formatProjectPropertyContent(
        projectUnit.dataValues,
      );
      shortlistedProperties.push(
        Object.assign({}, projectUnit, {
          shortlisted_property_id:
            shortlistedPropertyRecord.shortlisted_property_id,
          property_rating: shortlistedPropertyRecord.property_rating,
          is_bookmarked: shortlistedPropertyRecord.is_bookmarked,
          is_opened: shortlistedPropertyRecord.is_opened,
          is_requested_for_reservation:
            shortlistedPropertyRecord.is_requested_for_reservation,
          reservation_date: shortlistedPropertyRecord.reservation_date,
          is_general_enquiry: shortlistedPropertyRecord.is_general_enquiry,
          display_order: shortlistedPropertyRecord.display_order,
          bookmark_date: shortlistedPropertyRecord.dataValues.bookmark_date_raw,
          created_date: shortlistedPropertyRecord.dataValues.created_date_raw,
        }),
      );
    }

    // Given a shortlisted_properties assign them to their respective shortlisted_projects
    const parsedShortlistedProperties = {};
    for (let i = 0; i < shortlistedProperties.length; i++) {
      const currProperty = shortlistedProperties[i];
      if (!(currProperty.project.project_id in parsedShortlistedProperties)) {
        parsedShortlistedProperties[currProperty.project.project_id] = [];
      }
      parsedShortlistedProperties[currProperty.project.project_id].push(
        currProperty,
      );
    }
    return parsedShortlistedProperties;
  };

  /**
   * Get shortlisted properties
   * @param {object} shortlistedPropertyRecords
   * @returns {Promise<Object>}
   */
  shortListedPropertyController.getShortlistedProperties = async (
    shortlistedPropertyRecords,
  ) => {
    const shortlistedProperties = [];
    for (let j = 0; j < shortlistedPropertyRecords.length; j++) {
      const shortlistedPropertyRecord = shortlistedPropertyRecords[j];
      let projectUnit = shortlistedPropertyRecord.project_property;
      // Format project property for frontend
      projectUnit = projectPropertyController.formatProjectPropertyContent(
        projectUnit.dataValues,
      );
      shortlistedProperties.push(
        Object.assign({}, projectUnit, {
          shortlisted_property_id:
            shortlistedPropertyRecord.shortlisted_property_id,
          property_rating: shortlistedPropertyRecord.property_rating,
          is_bookmarked: shortlistedPropertyRecord.is_bookmarked,
          is_opened: shortlistedPropertyRecord.is_opened,
          is_requested_for_reservation:
            shortlistedPropertyRecord.is_requested_for_reservation,
          reservation_date: shortlistedPropertyRecord.reservation_date,
          is_general_enquiry: shortlistedPropertyRecord.is_general_enquiry,
          display_order: shortlistedPropertyRecord.display_order,
          bookmark_date: shortlistedPropertyRecord.dataValues.bookmark_date_raw,
          created_date: shortlistedPropertyRecord.dataValues.created_date_raw,
        }),
      );
    }

    return shortlistedProperties;
  };
  return shortListedPropertyController;
};
