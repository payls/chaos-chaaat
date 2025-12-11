const h = require('../helpers');
const constant = require('../constants/constant.json');

module.exports.makeController = (models) => {
  const {
    shortlisted_project_proposal_template:
      shortlistedProjectProposalTemplateModel,
    shortlisted_project_setting_proposal_template:
      shortlistedProjectSettingProposalTemplateModel,
  } = models;
  const shortlistedProjectProposalTemplateController = {};
  const featureController = require('./feature').makeFeatureController(models);
  const projectMediaController =
    require('./projectMedia').makeProjectMediaController(models);

  /**
   * Create short listed project proposal template record
   * @param {{
   *  project_fk: string,
   *  proposal_template_fk: string,
   *  display_order?: integer,
   *  created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedProjectProposalTemplateController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectProposalTemplateController';
    h.validation.requiredParams(funcName, { record });
    const { project_fk, proposal_template_fk, display_order, created_by } =
      record;
    const shortlisted_project_proposal_template_id = h.general.generateId();

    await shortlistedProjectProposalTemplateModel.create(
      {
        shortlisted_project_proposal_template_id,
        project_fk,
        proposal_template_fk,
        display_order,
        created_by,
      },
      { transaction },
    );

    return shortlisted_project_proposal_template_id;
  };

  /**
   * Update short listed project proposal template record
   * @param {string} shortlisted_project_proposal_template_id
   * @param {{
   *  project_fk: string,
   *  proposal_template_fk: string,
   *  display_order?: integer,
   *  is_deleted?: boolean,
   *  created_by: string
   *  updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedProjectProposalTemplateController.update = async (
    shortlisted_project_proposal_template_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectProposalTemplateController.update';
    h.validation.requiredParams(funcName, {
      shortlisted_project_proposal_template_id,
      record,
    });
    const {
      project_fk,
      proposal_template_fk,
      is_deleted,
      display_order,
      updated_by,
    } = record;
    await shortlistedProjectProposalTemplateModel.update(
      {
        project_fk,
        proposal_template_fk,
        is_deleted,
        display_order,
        updated_by,
      },
      { where: { shortlisted_project_proposal_template_id }, transaction },
    );
    return shortlisted_project_proposal_template_id;
  };
  /**
   * Find all short listed project records
   * @param {{
   *  shortlisted_project_proposal_template_id?: string,
   *  project_fk: string,
   *  proposal_template_fk: string,
   *  display_order?: integer,
   *  is_deleted?: boolean,
   *  created_by: string
   *  updated_by: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistedProjectProposalTemplateController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectProposalTemplateController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistedProjectProposalTemplateModel.findAll({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one short listed project proposal template record
   * @param {{
   *  shortlisted_project_proposal_template_id?: string,
   *  project_fk: string,
   *  proposal_template_fk: string,
   *  display_order?: integer,
   *  is_deleted?: boolean,
   *  created_by: string
   *  updated_by: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortlistedProjectProposalTemplateController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectProposalTemplateController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistedProjectProposalTemplateModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete short listed project proposal template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedProjectProposalTemplateController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectProposalTemplateController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistedProjectProposalTemplateModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) {
      await shortlistedProjectSettingProposalTemplateModel.destroy({
        where: {
          shortlisted_project_proposal_template_fk:
            record.shortlisted_project_proposal_template_id,
        },
        transaction,
      });
      await record.destroy({ transaction });
    }
  };

  /**
   * Hard delete all short listed project proposal template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedProjectProposalTemplateController.destroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName = 'shortlistedProjectProposalTemplateController.destroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortlistedProjectProposalTemplateModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const i in records) {
      const record = records[i];
      await shortlistedProjectSettingProposalTemplateModel.destroy({
        where: {
          shortlisted_project_proposal_template_fk:
            record.shortlisted_project_proposal_template_id,
        },
        transaction,
      });
      await record.destroy({ transaction });
    }
  };

  /**
   * Soft delete all short listed project proposal template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedProjectProposalTemplateController.softDestroyAll = async (
    where,
    { transaction } = {},
  ) => {
    if (Object.keys(where).length === 0) return;
    const funcName =
      'shortlistedProjectProposalTemplateController.softDestroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await shortlistedProjectProposalTemplateModel.findAll({
      where: { ...where },
      transaction,
    });

    if (records.length < 1) return;

    for (const record of records) {
      await shortlistedProjectProposalTemplateModel.update(
        {
          is_deleted: true,
        },
        {
          where: {
            shortlisted_project_id:
              record.shortlisted_project_proposal_template_id,
          },
          transaction,
        },
      );
    }
  };

  /**
   *  Populates shortlisted_project_proposal_temaplates with their shortlisted_property_proposal_templates
   *  @param {object} shortlisted_properties
   *  @param {object} shortlisted_projects
   *  @returns {Promise<void>}
   */
  shortlistedProjectProposalTemplateController.insertShortlistedProperties =
    async (
      shortlisted_property_proposal_templates,
      shortlistedProjectProposalRecords,
    ) => {
      const funcName =
        'shortlistedProjectProposalTemplateController.insertShortlistedProperties';
      h.validation.requiredParams(funcName, {
        shortlistedProjectProposalRecords,
      });

      // Place parsed shortlisted properties into shortlisted projects
      for (let i = 0; i < shortlistedProjectProposalRecords.length; i++) {
        const currProject = shortlistedProjectProposalRecords[i];
        currProject.dataValues.shortlisted_property_proposal_templates =
          shortlisted_property_proposal_templates[
            currProject.dataValues.project_fk
          ];
        const project_id = currProject.dataValues.project_fk;
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
                where: { project_id },
              },
            ],
          },
        );
        currProject.dataValues.features = feature;
      }
    };

  return shortlistedProjectProposalTemplateController;
};
