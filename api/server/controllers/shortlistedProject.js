const h = require('../helpers');
const constant = require('../constants/constant.json');

module.exports.makeShortListedProjectController = (models) => {
  const {
    shortlisted_project: shortListedProjectModel,
    shortlisted_project_setting: shortlistedProjectSettingModel,
  } = models;
  const shortListedProjectController = {};
  const featureController = require('./feature').makeFeatureController(models);
  const projectMediaController =
    require('./projectMedia').makeProjectMediaController(models);

  /**
   * Create short listed project record
   * @param {{
   *  project_fk: string,
   *  contact_fk: string,
   *  display_order?: integer,
   *  is_enquired?: boolean,
   *  enquired_date?: date,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortListedProjectController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortListedProjectController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      project_fk,
      contact_fk,
      display_order,
      is_enquired,
      enquired_date,
      is_bookmarked,
      bookmark_date,
      created_by,
    } = record;
    const shortlisted_project_id = h.general.generateId();
    await shortListedProjectModel.create(
      {
        shortlisted_project_id,
        project_fk,
        contact_fk,
        display_order,
        is_enquired,
        enquired_date,
        is_bookmarked,
        bookmark_date,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_project_id;
  };

  /**
   * Update short listed project record
   * @param {string} shortlisted_project_id
   * @param {{
   *  project_fk: string,
   *  contact_fk: string,
   *  project_rating?: integer,
   *  display_order?: integer,
   *  is_enquired?: boolean,
   *  enquired_date?: date,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortListedProjectController.update = async (
    shortlisted_project_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortListedProjectController.update';
    h.validation.requiredParams(funcName, { shortlisted_project_id, record });
    const {
      project_fk,
      contact_fk,
      project_rating,
      display_order,
      is_enquired,
      enquired_date,
      is_bookmarked,
      bookmark_date,
      updated_by,
    } = record;
    await shortListedProjectModel.update(
      {
        project_fk,
        contact_fk,
        project_rating,
        display_order,
        is_enquired,
        enquired_date,
        is_bookmarked,
        bookmark_date,
        updated_by,
      },
      { where: { shortlisted_project_id }, transaction },
    );
    return shortlisted_project_id;
  };

  /**
   * Update all short listed project record
   * @param {array} shortlisted_project_ids
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortListedProjectController.tagOpenShortlistedProjects = async (
    shortlisted_project_ids,
    { transaction } = {},
  ) => {
    const funcName =
      'shortListedProjectController.tagOpenAllShortlistedProjects';
    h.validation.requiredParams(funcName, { shortlisted_project_ids });

    await shortListedProjectModel.update(
      {
        is_opened: 1,
      },
      {
        where: { shortlisted_project_id: shortlisted_project_ids },
        transaction,
      },
    );
    return shortlisted_project_ids;
  };

  /**
   * Find all short listed project records
   * @param {{
   *  shortlisted_project_id?: string,
   *  project_fk?: string,
   *  contact_fk?: string,
   *  display_order?: integer,
   *  is_enquired?: boolean,
   *  enquired_date?: date,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortListedProjectController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortListedProjectController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortListedProjectModel.findAll({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one short listed project record
   * @param {{
   *  shortlisted_project_id?: string,
   *  project_fk?: string,
   *  contact_fk?: string,
   *  display_order?: integer,
   *  is_enquired?: boolean,
   *  enquired_date?: date,
   *  is_bookmarked?: boolean,
   *  bookmark_date?: date,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortListedProjectController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortListedProjectController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortListedProjectModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Count shortlisted project by unique column
   * @param column?: string
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortListedProjectController.countUnique = async (
    column,
    { include, transaction } = {},
  ) => {
    const records = await shortListedProjectModel.count({
      distinct: true,
      col: column,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete short listed project record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortListedProjectController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortListedProjectController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortListedProjectModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) {
      await shortlistedProjectSettingModel.destroy({
        where: {
          shortlisted_project_fk: record.shortlisted_project_id,
        },
        transaction,
      });
      await record.destroy({ transaction });
    }
  };

  /**
   * Hard delete all short listed project record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortListedProjectController.destroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName = 'shortListedProjectController.destroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortListedProjectModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const i in records) {
      const record = records[i];
      await shortlistedProjectSettingModel.destroy({
        where: {
          shortlisted_project_fk: record.shortlisted_project_id,
        },
        transaction,
      });
      await record.destroy({ transaction });
    }
  };

  /**
   * Soft delete all short listed project record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortListedProjectController.softDestroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName = 'shortListedProjectController.softDestroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortListedProjectModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const record of records) {
      await shortListedProjectModel.update(
        {
          is_deleted: true,
        },
        {
          where: {
            shortlisted_project_id: record.shortlisted_project_id,
          },
          transaction,
        },
      );
    }
  };

  /**
   *  Populates shortlisted_projects with their shortlisted_properties
   *  @param {object} shortlisted_properties
   *  @param {object} shortlisted_projects
   *  @returns {Promise<void>}
   */
  shortListedProjectController.insertShortlistedProperties = async (
    shortlisted_properties,
    shortlistedProjectRecords,
  ) => {
    const funcName = 'shortListedProjectController.insertShortlistedProperties';
    h.validation.requiredParams(funcName, {
      shortlistedProjectRecords,
    });

    // Place parsed shortlisted properties into shortlisted projects
    for (let i = 0; i < shortlistedProjectRecords.length; i++) {
      const currProject = shortlistedProjectRecords[i];
      currProject.dataValues.shortlisted_properties =
        shortlisted_properties[currProject.dataValues.project_fk];
      const shortlisted_project_id = currProject.dataValues.project_fk;
      const projectMedia = currProject.project.project_media;
      const parsedProjectMedia = [];
      if (h.notEmpty(projectMedia)) {
        for (const media_idx in projectMedia) {
          const media_tags = [];
          const media = projectMedia[media_idx];
          for (const tag_idx in media.dataValues.project_media_tags) {
            const tag = media.dataValues.project_media_tags[tag_idx].tag;
            media_tags.push(tag);
          }
          if (media_tags.includes(constant.PROPERTY.MEDIA.TAG.PROJECT)) {
            parsedProjectMedia.push(media);
          }
        }
      }
      currProject.dataValues.project_media = parsedProjectMedia;
      // Retrieve project features for given shortlisted_project
      const feature = await featureController.findAll(
        {},
        {
          include: [
            {
              model: models.project,
              required: true,
              as: 'projects',
              where: { project_id: shortlisted_project_id },
            },
          ],
        },
      );
      currProject.dataValues.features = feature;
    }
  };

  return shortListedProjectController;
};
