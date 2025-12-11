const h = require('../helpers');

module.exports.makeController = (models) => {
  const {
    shortlisted_property_proposal_template:
      shortlistedPropertyProposalTeplateModel,
    shortlisted_property_setting_proposal_template:
      shortlistedPropertySettingProposalTemplateModel,
  } = models;
  const shortlistedPropertyProposalTemplateCtl = {};
  const projectPropertyController =
    require('./projectProperty').makeProjectPropertyController(models);
  /**
   * Create short listed property proposal template record
   * @param {{
   *  project_property_fk?: string,
   *  property_fk?: string,
   *  proposal_template_fk?: string,
   *  display_order?: integer,
   *  bookmark_date?: date,
   *  is_deleted?: boolean,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedPropertyProposalTemplateCtl.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertyProposalTemplateCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      project_property_fk,
      property_fk,
      proposal_template_fk,
      display_order,
      is_deleted,
      created_by,
    } = record;
    const shortlisted_property_proposal_template_id = h.general.generateId();
    await shortlistedPropertyProposalTeplateModel.create(
      {
        shortlisted_property_proposal_template_id,
        project_property_fk,
        property_fk,
        proposal_template_fk,
        display_order,
        is_deleted,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_property_proposal_template_id;
  };

  /**
   * Update shortlisted property proposal template record
   * @param {string} shortlisted_property_proposal_template_id
   * @param {{
   *  project_property_fk?: string,
   *  property_fk?: string,
   *  proposal_template_fk?: string,
   *  display_order?: integer,
   *  bookmark_date?: date,
   *  is_deleted?: boolean,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedPropertyProposalTemplateCtl.update = async (
    shortlisted_property_proposal_template_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertyProposalTemplateCtl.update';
    h.validation.requiredParams(funcName, {
      shortlisted_property_proposal_template_id,
      record,
    });
    const {
      project_property_fk,
      property_fk,
      proposal_template_fk,
      display_order,
      is_deleted,
      updated_by,
    } = record;
    await shortlistedPropertyProposalTeplateModel.update(
      {
        project_property_fk,
        property_fk,
        proposal_template_fk,
        display_order,
        is_deleted,
        updated_by,
      },
      { where: { shortlisted_property_proposal_template_id }, transaction },
    );
    return shortlisted_property_proposal_template_id;
  };

  /**
   * Find all short listed property records
   * @param {{
   *  project_property_fk?: string,
   *  property_fk?: string,
   *  proposal_template_fk?: string,
   *  display_order?: integer,
   *  bookmark_date?: date,
   *  is_deleted?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object, order?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistedPropertyProposalTemplateCtl.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'shortlistedPropertyProposalTemplateCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistedPropertyProposalTeplateModel.findAll({
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
   *  project_property_fk?: string,
   *  property_fk?: string,
   *  proposal_template_fk?: string,
   *  display_order?: integer,
   *  bookmark_date?: date,
   *  is_deleted?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortlistedPropertyProposalTemplateCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertyProposalTemplateCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistedPropertyProposalTeplateModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete short listed property proposal template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedPropertyProposalTemplateCtl.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertyProposalTemplateCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistedPropertyProposalTeplateModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) {
      await shortlistedPropertySettingProposalTemplateModel.destroy({
        where: {
          shortlisted_property_proposal_template_fk:
            record.shortlisted_property_proposal_template_id,
        },
        transaction,
      });

      await record.destroy({ transaction });
    }
  };

  /**
   * Hard delete all short listed property proposal template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedPropertyProposalTemplateCtl.destroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName = 'shortlistedPropertyProposalTemplateCtl.destroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortlistedPropertyProposalTeplateModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const i in records) {
      const record = records[i];
      await shortlistedPropertySettingProposalTemplateModel.destroy({
        where: {
          shortlisted_property_proposal_template_fk:
            record.shortlisted_property_proposal_template_id,
        },
        transaction,
      });

      await record.destroy({ transaction });
    }
  };

  /**
   * Soft delete all short listed property proposal template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedPropertyProposalTemplateCtl.softDestroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName = 'shortlistedPropertyProposalTemplateCtl.softDestroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortlistedPropertyProposalTeplateModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const record of records) {
      await shortlistedPropertySettingProposalTemplateModel.update(
        {
          is_deleted: true,
        },
        {
          where: {
            shortlisted_property_proposal_template_fk:
              record.shortlisted_property_proposal_template_id,
          },
          transaction,
        },
      );
    }
  };
  /**
   * Parse shortlisted_property_proposal_templates into Obj where properties are
   * placed into their respective projects
   * @param {object} shortlistedPropertyRecords
   * @returns {Promise<Object>}
   */
  shortlistedPropertyProposalTemplateCtl.parseShortlistedProperties = async (
    shortlistedPropertyProposalTemplateRecords,
  ) => {
    const funcName =
      'shortlistedPropertyProposalTemplateCtl.parseShortlistedProperties';
    const shortlistedProperties = [];
    for (
      let j = 0;
      j < shortlistedPropertyProposalTemplateRecords.length;
      j++
    ) {
      const shortlistedPropertyRecord =
        shortlistedPropertyProposalTemplateRecords[j];
      let projectUnit = shortlistedPropertyRecord.project_property;
      // Format project property for frontend
      projectUnit = projectPropertyController.formatProjectPropertyContent(
        projectUnit.dataValues,
      );
      shortlistedProperties.push(
        Object.assign({}, projectUnit, {
          shortlisted_property_proposal_template_id:
            shortlistedPropertyRecord.shortlisted_property_proposal_template_id,
          property_rating: shortlistedPropertyRecord.property_rating,
          is_deleted: shortlistedPropertyRecord.is_deleted,
          display_order: shortlistedPropertyRecord.display_order,
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
   * Get shortlisted property proposal templates
   * @param {object} shortlistedPropertyRecords
   * @returns {Promise<Object>}
   */
  shortlistedPropertyProposalTemplateCtl.getShortlistedProperties = async (
    shortlistedPropertyProposalTemplateRecords,
  ) => {
    const shortlistedProperties = [];
    for (
      let j = 0;
      j < shortlistedPropertyProposalTemplateRecords.length;
      j++
    ) {
      const shortlistedPropertyRecord =
        shortlistedPropertyProposalTemplateRecords[j];
      let projectUnit = shortlistedPropertyRecord.project_property;
      // Format project property for frontend
      projectUnit = projectPropertyController.formatProjectPropertyContent(
        projectUnit.dataValues,
      );
      shortlistedProperties.push(
        Object.assign({}, projectUnit, {
          shortlisted_property_proposal_template_id:
            shortlistedPropertyRecord.shortlisted_property_proposal_template_id,
          property_rating: shortlistedPropertyRecord.property_rating,
          is_deleted: shortlistedPropertyRecord.is_deleted,
          created_date: shortlistedPropertyRecord.dataValues.created_date_raw,
        }),
      );
    }

    return shortlistedProperties;
  };

  return shortlistedPropertyProposalTemplateCtl;
};
