const h = require('../helpers');
const constant = require('../constants/constant.json');
const { v4: uuidv4 } = require('uuid');

module.exports.makeProjectController = (models) => {
  const {
    project: projectModel,
    feature: featureModel,
    project_feature: projectFeatureModel,
  } = models;
  const featureController = require('./feature').makeFeatureController(models);
  const projectController = {};

  /**
   * Create project record
   * @param {{
   *  agency_fk: string,
   *  name: string,
   *  description: string,
   *  key_stats: string,
   *  project_highlights: string,
   *  why_invest: string,
   *  shopping: string,
   *  transport: string,
   *  education: string,
   *  project_type: string,
   *  currency_code: string,
   *  size_format: string,
   *  completion_date: string,
   *  location_address_1: string,
   *  location_address_2: string,
   *  location_address_3: string,
   *  location_latitude: number,
   *  location_longitude: number,
   *  location_google_map_url: string,
   *  location_google_place_id?: string,
   *  location_google_place_raw?: string,
   *  status: string,
   *  is_deleted: number,
   *  country_fk: string,
   *  slug: string,
   *  property_header_info_name: string,
   *  property_header_info_descriptions: string,
   *  property_header_info_short_description: string,
   *  property_header_info_cover_picture_url: string,
   *  property_header_info_cover_picture_title: string,
   *  property_header_info_cover_picture_filename: string,
   *  completion_status: number,
   *  availability_status: number,
   *  bedrooms_description: string,
   *  pricing_description: string,
   *  residences_description: string,
   *  estimated_completion: string,
   *  units_available_description: string,
   *  brochure_url: string,
   *  sf_project_id: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectController.create = async (record, { transaction } = {}) => {
    const funcName = 'projectController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      name,
      description,
      key_stats,
      project_highlights,
      why_invest,
      shopping,
      transport,
      education,
      project_type,
      currency_code,
      size_format,
      completion_date,
      location_address_1,
      location_address_2,
      location_address_3,
      location_latitude,
      location_longitude,
      location_google_map_url,
      location_google_place_id,
      location_google_place_raw,
      status,
      is_deleted,
      country_fk,
      slug,
      property_header_info_name,
      property_header_info_descriptions,
      property_header_info_short_description,
      property_header_info_cover_picture_url,
      property_header_info_cover_picture_title,
      property_header_info_cover_picture_filename,
      completion_status,
      availability_status,
      bedrooms_description,
      pricing_description,
      residences_description,
      estimated_completion,
      units_available_description,
      brochure_url,
      sf_project_id,
      created_by,
    } = record;
    h.validation.validateConstantValue(
      funcName,
      { status: constant.PROJECT.STATUS, size_format: constant.SIZE_FORMAT },
      { status, size_format },
    );
    const project_id = h.general.generateId();
    await projectModel.create(
      {
        project_id,
        agency_fk,
        name,
        description,
        key_stats,
        project_highlights,
        why_invest,
        shopping,
        transport,
        education,
        project_type,
        currency_code,
        size_format,
        completion_date,
        location_address_1,
        location_address_2,
        location_address_3,
        location_latitude,
        location_longitude,
        location_google_map_url,
        location_google_place_id,
        location_google_place_raw,
        status,
        is_deleted,
        country_fk,
        slug,
        property_header_info_name,
        property_header_info_descriptions,
        property_header_info_short_description,
        property_header_info_cover_picture_url,
        property_header_info_cover_picture_title,
        property_header_info_cover_picture_filename,
        completion_status,
        availability_status,
        bedrooms_description,
        pricing_description,
        residences_description,
        estimated_completion,
        units_available_description,
        brochure_url,
        created_by,
        sf_project_id,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_id;
  };

  /**
   * Update project record
   * @param {string} project_id
   * @param {{
   *  agency_fk: string,
   *  name: string,
   *  description: string,
   *  key_stats: string,
   *  project_highlights: string,
   *  why_invest: string,
   *  shopping: string,
   *  transport: string,
   *  education: string,
   *  project_type: string,
   *  currency_code: string,
   *  size_format: string,
   *  completion_date: string,
   *  location_address_1: string,
   *  location_address_2: string,
   *  location_address_3: string,
   *  location_latitude: number,
   *  location_longitude: number,
   *  location_google_map_url: string,
   *  location_google_place_id?: string,
   *  location_google_place_raw?: string,
   *  status: string,
   *  is_deleted: number,
   *  country_fk: string,
   *  slug: string,
   *  property_header_info_name: string,
   *  property_header_info_descriptions: string,
   *  property_header_info_short_description: string,
   *  property_header_info_cover_picture_url: string,
   *  property_header_info_cover_picture_title: string,
   *  property_header_info_cover_picture_filename: string,
   *  completion_status: number,
   *  availability_status: number,
   *  bedrooms_description: string,
   *  pricing_description: string,
   *  residences_description: string,
   *  estimated_completion: string,
   *  units_available_description: string,
   *  brochure_url: string,
   *  sf_project_id: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectController.update = async (
    project_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectController.update';
    h.validation.requiredParams(funcName, { project_id, record });
    const {
      agency_fk,
      name,
      description,
      key_stats,
      project_highlights,
      why_invest,
      shopping,
      transport,
      education,
      project_type,
      currency_code,
      size_format,
      completion_date,
      location_address_1,
      location_address_2,
      location_address_3,
      location_latitude,
      location_longitude,
      location_google_map_url,
      location_google_place_id,
      location_google_place_raw,
      status,
      is_deleted,
      country_fk,
      slug,
      property_header_info_name,
      property_header_info_descriptions,
      property_header_info_short_description,
      property_header_info_cover_picture_url,
      property_header_info_cover_picture_title,
      property_header_info_cover_picture_filename,
      completion_status,
      availability_status,
      bedrooms_description,
      pricing_description,
      residences_description,
      estimated_completion,
      units_available_description,
      brochure_url,
      sf_project_id,
      updated_by,
    } = record;
    h.validation.validateConstantValue(
      funcName,
      { status: constant.PROJECT.STATUS, size_format: constant.SIZE_FORMAT },
      { status, size_format },
    );
    await projectModel.update(
      {
        agency_fk,
        name,
        description,
        key_stats,
        project_highlights,
        why_invest,
        shopping,
        transport,
        education,
        project_type,
        currency_code,
        size_format,
        completion_date,
        location_address_1,
        location_address_2,
        location_address_3,
        location_latitude,
        location_longitude,
        location_google_map_url,
        location_google_place_id,
        location_google_place_raw,
        status,
        is_deleted,
        country_fk,
        slug,
        property_header_info_name,
        property_header_info_descriptions,
        property_header_info_short_description,
        property_header_info_cover_picture_url,
        property_header_info_cover_picture_title,
        property_header_info_cover_picture_filename,
        completion_status,
        availability_status,
        bedrooms_description,
        pricing_description,
        residences_description,
        estimated_completion,
        units_available_description,
        brochure_url,
        sf_project_id,
        updated_by,
      },
      { where: { project_id }, transaction },
    );
    return project_id;
  };

  /**
   * Find all project records
   * @param {{
   *  project_id: string,
   *  agency_fk: string,
   *  name: string,
   *  description: string,
   *  key_stats: string,
   *  project_highlights: string,
   *  why_invest: string,
   *  shopping: string,
   *  transport: string,
   *  education: string,
   *  project_type: string,
   *  currency_code: string,
   *  size_format: string,
   *  completion_date: string,
   *  location_address_1: string,
   *  location_address_2: string,
   *  location_address_3: string,
   *  location_latitude: number,
   *  location_longitude: number
   *  location_google_map_url: string,
   *  location_google_place_id?: string,
   *  location_google_place_raw?: string,
   *  status: string,
   *  is_deleted: number,
   *  country_fk: string,
   *  slug: string,
   *  property_header_info_name: string,
   *  property_header_info_descriptions: string,
   *  property_header_info_short_description: string,
   *  property_header_info_cover_picture_url: string,
   *  property_header_info_cover_picture_title: string,
   *  property_header_info_cover_picture_filename: string,
   *  completion_status: number,
   *  availability_status: number,
   *  bedrooms_description: string,
   *  pricing_description: string,
   *  residences_description: string,
   *  estimated_completion: string,
   *  units_available_description: string,
   *  brochure_url: string,
   *  sf_project_id: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'projectController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project
   * @param {{
   *  project_id: string,
   *  agency_fk: string,
   *  name: string,
   *  description: string,
   *  key_stats: string,
   *  project_highlights: string,
   *  why_invest: string,
   *  shopping: string,
   *  transport: string,
   *  education: string,
   *  project_type: string,
   *  currency_code: string,
   *  size_format: string,
   *  completion_date: string,
   *  location_address_1: string,
   *  location_address_2: string,
   *  location_address_3: string,
   *  location_latitude: number,
   *  location_longitude: number
   *  location_google_map_url: string,
   *  location_google_place_id?: string,
   *  location_google_place_raw?: string,
   *  status: string,
   *  is_deleted: number,
   *  country_fk: string,
   *  slug: string,
   *  property_header_info_name: string,
   *  property_header_info_descriptions: string,
   *  property_header_info_short_description: string,
   *  property_header_info_cover_picture_url: string,
   *  property_header_info_cover_picture_title: string,
   *  property_header_info_cover_picture_filename: string,
   *  completion_status: number,
   *  availability_status: number,
   *  bedrooms_description: string,
   *  pricing_description: string,
   *  residences_description: string,
   *  estimated_completion: string,
   *  units_available_description: string,
   *  brochure_url: string,
   *  sf_project_id: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'projectController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'projectController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Project Feature relation - Add feature to project
   * @param {string} projectId
   * @param features
   * @param {string} userId
   * @param transaction
   * @returns {Promise<void>}
   */
  projectController.addFeature = async (
    projectId,
    features,
    userId,
    { transaction } = {},
  ) => {
    const funcName = 'projectController.addFeature';
    h.validation.requiredParams(funcName, { projectId, features, userId });
    h.validation.isObjectOrArray(funcName, { features });
    const featuresToAdd = [];
    await Promise.all(
      features.map(async (feature) => {
        const findFeature = await featureModel.findOne({
          where: { type: feature.type, name: feature.name },
          transaction,
        });
        if (h.notEmpty(findFeature)) {
          // Link existing feature to project
          featuresToAdd.push(findFeature.feature_id);
        } else {
          // Create feature && link to project
          const newFeatureId = await featureController.create(
            {
              project_fk_unique: projectId,
              type: feature.type,
              name: feature.name,
              created_by: userId,
            },
            { transaction },
          );
          featuresToAdd.push(newFeatureId);
        }
      }),
    );
    // Create project and feature relation
    await projectModel
      .findOne({ where: { project_id: projectId }, transaction })
      // eslint-disable-next-line promise/always-return
      .then(async (project) => {
        await Promise.all(
          featuresToAdd.map(async (featureId) => {
            project.addFeature(featureId, {
              through: {
                project_feature_id: uuidv4(),
                created_by: userId,
                updated_by: userId,
              },
            });
          }),
        );
      })
      .catch((err) => {
        console.log(`${funcName}: Failed to add feature to project`, err);
      });
  };

  /**
   * Project Feature relation - Update feature to project
   * @param {string} projectId
   * @param {object} features
   * @param {string} userId
   * @param transaction
   * @returns {Promise<void>}
   */
  projectController.updateFeature = async (
    projectId,
    features = {},
    userId,
    { transaction } = {},
  ) => {
    const funcName = 'projectController.updateFeature';
    h.validation.requiredParams(funcName, { projectId, userId });
    // h.validation.isObjectOrArray(funcName, { features });
    const featuresToAdd = [];
    if (h.notEmpty(features)) {
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const findFeature = await featureModel.findOne({
          where: { type: feature.type, name: feature.name },
          transaction,
        });
        if (h.notEmpty(findFeature)) {
          // Link existing feature to project
          featuresToAdd.push(findFeature.feature_id);
        } else {
          // Create feature && link to project
          const newFeatureId = await featureController.create(
            {
              project_fk_unique: projectId,
              type: feature.type,
              name: feature.name,
              created_by: userId,
            },
            { transaction },
          );
          featuresToAdd.push(newFeatureId);
        }
      }
      // await Promise.all(features.map(async (feature) => {
      //     let findFeature = await featureModel.findOne({
      //         where: { type: feature.type, name: feature.name },
      //         transaction
      //     });
      //     if (h.notEmpty(findFeature)) {
      //         //Link existing feature to project
      //         featuresToAdd.push(findFeature.feature_id);
      //     } else {
      //         //Create feature && link to project
      //         let newFeatureId = await featureController.create({
      //             project_fk_unique: projectId,
      //             type: feature.type,
      //             name: feature.name,
      //             created_by: userId
      //         }, { transaction });
      //         featuresToAdd.push(newFeatureId);
      //     }
      // }));
    }
    // Update project and feature relations
    // const project = await projectModel.findOne({where: { project_id: projectId }, transaction})
    const featuresToRemove = await projectFeatureModel.findAll({
      where: { project_fk: projectId },
    });
    if (h.notEmpty(featuresToRemove)) {
      await projectFeatureModel.destroy(
        { where: { project_fk: projectId } },
        { transaction },
      );
      // for (let i = 0; i < featuresToRemove.length; i++) {
      //     const projectFeature = featuresToRemove[i];
      //     await projectFeatureModel.destroy({ where: { project_feature_id: projectFeature.project_feature_id } }, { transaction });
      // }
    }

    if (h.notEmpty(featuresToAdd)) {
      for (let i = 0; i < featuresToAdd.length; i++) {
        const featureId = featuresToAdd[i];
        await projectFeatureModel.create(
          {
            project_feature_id: h.general.generateId(),
            project_fk: projectId,
            feature_fk: featureId,
            created_by: userId,
          },
          { transaction },
        );
      }
    }

    // .then(async(project) => {
    //     //Remove all previous relations
    //     // let projectFeatureIds = [];
    //     let featuresToRemove = await projectFeatureModel.findAll({where: { project_fk: projectId }});
    //     for (let i = 0; i < featuresToRemove.length; i++) {
    //         const projectFeature = featuresToRemove[i];
    //         await projectFeatureModel.destroy({ where: { project_feature_id: projectFeature.project_feature_id } }, { transaction });
    //     }
    //     // featuresToRemove.map(projectFeature => {
    //     //     projectFeatureIds.push(projectFeature.project_feature_id);
    //     // })
    //     // await project.removeFeatures(projectFeatureIds);
    //     return project;
    // })
    // .then(async(project) => {
    //     //Add updated relations
    //     await Promise.all(featuresToAdd.map(async(featureId) => {
    //         await project.addFeature(featureId, {through: { project_feature_id: uuidv4(), created_by: userId, updated_by: userId }});
    //         return;
    //     }))
    // })
    // .catch(err => {
    //     console.log(`${funcName}: Failed to update feature to project`, err);
    //     return;
    // })
  };

  return projectController;
};
