const h = require('../helpers');
const constant = require('../constants/constant.json');

module.exports.makeProjectMediaController = (models) => {
  const {
    project_media: projectMediaModel,
    project_media_property: projectMediaPropertyModel,
    project_media_tag: projectMediaTagModel,
  } = models;
  const projectMediaController = {};

  /**
   * Create project media record
   * @param {{
   *  project_fk: string,
   *  type: string,
   *  url: string,
   *  thumbnail_src: string,
   *  title: string,
   *  header_text: string,
   *  is_hero_image: boolean,
   *	created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectMediaController.create = async (record, { transaction } = {}) => {
    const funcName = 'projectMediaController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      project_fk,
      type,
      url,
      thumbnail_src,
      title,
      header_text,
      is_hero_image,
      display_order,
      created_by,
    } = record;

    const project_media_id = h.general.generateId();
    await projectMediaModel.create(
      {
        project_media_id,
        project_fk,
        type,
        url,
        thumbnail_src,
        title,
        header_text,
        is_hero_image,
        display_order,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_media_id;
  };

  /**
   * Update project media record
   * @param {string} project_media_id
   * @param {{
   *  project_fk: string,
   *  type: string,
   *  url: string,
   *  title: string,
   *  header_text: string,
   *  is_hero_image: boolean,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectMediaController.update = async (
    project_media_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectMediaController.update';
    h.validation.requiredParams(funcName, { project_media_id, record });
    const {
      project_fk,
      type,
      url,
      title,
      header_text,
      is_hero_image,
      display_order,
      updated_by,
    } = record;
    h.validation.validateConstantValue(
      funcName,
      { type: constant.PROPERTY.MEDIA.TYPE },
      { type },
    );
    await projectMediaModel.update(
      {
        project_fk,
        type,
        url,
        title,
        header_text,
        is_hero_image,
        display_order,
        updated_by,
      },
      { where: { project_media_id }, transaction },
    );
    return project_media_id;
  };

  /**
   * Find all project media records
   * @param {{
   *  project_media_id: string,
   *  project_fk: string,
   *  type: string,
   *  url: string,
   *  title: string,
   *  header_text: string,
   *  is_hero_image: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectMediaController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'projectMediaController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectMediaModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project media record
   * @param {{
   *  project_media_id: string,
   *  project_fk: string,
   *  type: string,
   *  url: string,
   *  title: string,
   *  header_text: string,
   *  is_hero_image: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectMediaController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectMediaController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectMediaModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project media record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectMediaController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'projectMediaController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectMediaModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Delete project medias
   * @param {string} projectId
   * @param {array} medias
   * @param {{ user_id?:string, transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectMediaController.deleteMedias = async (
    projectId,
    medias,
    { transaction } = {},
  ) => {
    const funcName = 'projectMediaController.deleteMedias';
    h.validation.requiredParams(funcName, { projectId });
    if (medias && medias.length > 0) {
      const deleteTasks = [];
      medias
        .filter((media) => media.project_media_id)
        .forEach((media) => {
          // Delete project_media_property record that joins project_property to project_media
          deleteTasks.push(
            projectMediaPropertyModel.destroy(
              {
                where: {
                  project_fk: projectId,
                  project_media_fk: media.project_media_id,
                },
              },
              { transaction },
            ),
          );

          // Delete project_media_property record that joins project_tag to project_media
          deleteTasks.push(
            projectMediaTagModel.destroy(
              {
                where: {
                  project_media_fk: media.project_media_id,
                },
              },
              { transaction },
            ),
          );

          // Delete project_media record
          deleteTasks.push(
            projectMediaModel.destroy(
              {
                where: {
                  project_media_id: media.project_media_id,
                },
              },
              { transaction },
            ),
          );
        });
      await Promise.all(deleteTasks);
    }
  };

  /**
   * Create/update project medias
   * @param {string} project_id
   * @param {array} medias
   * @param {{ user_id?:string, transaction?:object }} [options]
   * @returns {Promise<{project_media_property: {deleted: *[], created: *[], updated: *[]}, project_media: {deleted: *[], created: *[], updated: *[]}}>}
   */
  projectMediaController.saveMedias = async (
    project_id,
    medias,
    { user_id, transaction } = {},
  ) => {
    const funcName = 'projectMediaController.saveMedias';
    h.validation.requiredParams(funcName, { project_id });
    const results = {
      project_media: { deleted: [], created: [], updated: [] },
      project_media_property: { deleted: [], created: [], updated: [] },
      project_media_tag: { deleted: [], created: [], updated: [] },
    };
    try {
      // Get list of current project medias in project
      const currentMedias = await projectMediaModel.findAll(
        {
          where: {
            project_fk: project_id,
          },
        },
        { transaction },
      );
      // For updating
      if (h.notEmpty(currentMedias) && h.notEmpty(medias)) {
        for (let i = 0; i < currentMedias.length; i++) {
          const currentMedia = currentMedias[i];
          // Find medias that needs to be updated
          for (let j = 0; j < medias.length; j++) {
            const mediaToUpdate = medias[j];
            if (
              h.notEmpty(mediaToUpdate.project_media_id) &&
              h.cmpStr(
                mediaToUpdate.project_media_id,
                currentMedia.project_media_id,
              )
            ) {
              // Update project_media record
              await projectMediaModel.update(
                {
                  type: mediaToUpdate.type,
                  url: mediaToUpdate.url,
                  filename: mediaToUpdate.filename,
                  thumbnail_src: mediaToUpdate.thumbnail,
                  title: mediaToUpdate.title,
                  is_hero_image: mediaToUpdate.is_hero_image,
                  display_order: mediaToUpdate.display_order,
                  updated_by: user_id,
                },
                { where: { project_media_id: currentMedia.project_media_id } },
                { transaction },
              );
              results.project_media.updated.push(currentMedia.project_media_id);

              // deleting all media properties and add again later
              const mediaPropertiesToDelete =
                await projectMediaPropertyModel.findAll({
                  where: {
                    project_fk: project_id,
                    project_media_fk: currentMedia.project_media_id,
                  },
                });

              for (const {
                dataValues: mediaPropertyToDelete,
              } of mediaPropertiesToDelete) {
                await projectMediaPropertyModel.destroy(
                  {
                    where: {
                      project_media_property_id:
                        mediaPropertyToDelete.project_media_property_id,
                    },
                  },
                  { transaction },
                );
              }

              // deleting all media tags and add again later
              const mediaTagsToDelete = await projectMediaTagModel.findAll({
                where: {
                  project_media_fk: currentMedia.project_media_id,
                },
              });

              for (const {
                dataValues: mediaTagToDelete,
              } of mediaTagsToDelete) {
                await projectMediaTagModel.destroy(
                  {
                    where: {
                      project_media_tag_id:
                        mediaTagToDelete.project_media_tag_id,
                    },
                  },
                  { transaction },
                );
              }

              // Create or update project_media_property records
              if (h.notEmpty(mediaToUpdate.units_selected)) {
                for (let j = 0; j < mediaToUpdate.units_selected.length; j++) {
                  const selectedProjectPropertyId =
                    mediaToUpdate.units_selected[j];
                  const saveResult = await saveProjectMediaProperty(
                    project_id,
                    currentMedia.project_media_id,
                    selectedProjectPropertyId,
                    { user_id, transaction },
                  );
                  results.project_media_property.created = [
                    ...results.project_media_property.created,
                    ...saveResult.created,
                  ];
                  results.project_media_property.updated = [
                    ...results.project_media_property.updated,
                    ...saveResult.updated,
                  ];
                  results.project_media_property.deleted = [
                    ...results.project_media_property.deleted,
                    ...saveResult.deleted,
                  ];
                }
              }

              // Create or update project_media_tag records
              if (h.notEmpty(mediaToUpdate.tags)) {
                for (let j = 0; j < mediaToUpdate.tags.length; j++) {
                  const tag = mediaToUpdate.tags[j];
                  const saveResult = await saveProjectMediaTag(
                    currentMedia.project_media_id,
                    tag,
                    { user_id, transaction },
                  );
                  results.project_media_tag.created = [
                    ...results.project_media_tag.created,
                    ...saveResult.created,
                  ];
                  results.project_media_tag.updated = [
                    ...results.project_media_tag.updated,
                    ...saveResult.updated,
                  ];
                  results.project_media_tag.deleted = [
                    ...results.project_media_tag.deleted,
                    ...saveResult.deleted,
                  ];
                }
              }
            }
          }
        }
      }

      // For creating
      if (h.notEmpty(medias)) {
        // Find medias that needs to be created
        const mediasToCreate = medias.filter((media) =>
          h.isEmpty(media.project_media_id),
        );
        for (let i = 0; i < mediasToCreate.length; i++) {
          const mediaToCreate = mediasToCreate[i];
          const newProjectMediaId = h.general.generateId();
          const currentDateTime = new Date();
          currentDateTime.setSeconds(currentDateTime.getSeconds() + i);
          await projectMediaModel.create(
            {
              project_media_id: newProjectMediaId,
              project_fk: project_id,
              type: mediaToCreate.type,
              thumbnail_src: mediaToCreate.thumbnail,
              url: mediaToCreate.url,
              filename: mediaToCreate.filename,
              title: mediaToCreate.title,
              is_hero_image: mediaToCreate.is_hero_image,
              display_order: mediaToCreate.display_order,
              created_by: user_id,
              updated_by: user_id,
              created_date: currentDateTime
                .toISOString()
                .slice(0, 19)
                .replace('T', ' '),
            },
            { transaction },
          );

          results.project_media.created.push(newProjectMediaId);

          // Create or update project_media_property records
          if (h.notEmpty(mediaToCreate.units_selected)) {
            for (let j = 0; j < mediaToCreate.units_selected.length; j++) {
              const selectedProjectPropertyId = mediaToCreate.units_selected[j];
              const saveResult = await saveProjectMediaProperty(
                project_id,
                newProjectMediaId,
                selectedProjectPropertyId,
                { user_id, transaction },
              );
              results.project_media_property.created = [
                ...results.project_media_property.created,
                ...saveResult.created,
              ];
              results.project_media_property.updated = [
                ...results.project_media_property.updated,
                ...saveResult.updated,
              ];
              results.project_media_property.deleted = [
                ...results.project_media_property.deleted,
                ...saveResult.deleted,
              ];
            }
          }

          // Create or update project_media_tag records
          if (h.notEmpty(mediaToCreate.tags)) {
            for (let j = 0; j < mediaToCreate.tags.length; j++) {
              const tag = mediaToCreate.tags[j];
              const saveResult = await saveProjectMediaTag(
                newProjectMediaId,
                tag,
                { user_id, transaction },
              );
              results.project_media_tag.created = [
                ...results.project_media_tag.created,
                ...saveResult.created,
              ];
              results.project_media_tag.updated = [
                ...results.project_media_tag.updated,
                ...saveResult.updated,
              ];
              results.project_media_tag.deleted = [
                ...results.project_media_tag.deleted,
                ...saveResult.deleted,
              ];
            }
          }
        }
      }
    } catch (err) {
      console.log(`${funcName}: failed to save project medias`, {
        results,
        err,
      });
    }
    return results;
  };

  /**
   * Save project_media_property record
   * @param {string} project_id
   * @param {string} project_media_id
   * @param {string} project_property_id
   * @param {{ user_id?:string, transaction?:object }} [options]
   * @returns {Promise<{deleted: *[], created: *[], updated: *[]}>}
   */
  async function saveProjectMediaProperty(
    project_id,
    project_media_id,
    project_property_id,
    { user_id, transaction } = {},
  ) {
    const funcName = 'saveProjectMediaProperty';
    h.validation.requiredParams(funcName, {
      project_id,
      project_media_id,
      project_property_id,
    });
    let project_media_property_id = '';
    const results = { created: [], updated: [], deleted: [] };
    const projectMediaProperty = await projectMediaPropertyModel.findOne(
      {
        where: {
          project_fk: project_id,
          project_media_fk: project_media_id,
          project_property_fk: project_property_id,
        },
      },
      { transaction },
    );
    if (h.isEmpty(projectMediaProperty)) {
      // Create project_media_property record
      project_media_property_id = h.general.generateId();
      await projectMediaPropertyModel.create(
        {
          project_media_property_id,
          project_fk: project_id,
          project_media_fk: project_media_id,
          project_property_fk: project_property_id,
          created_by: user_id,
          updated_by: user_id,
        },
        { transaction },
      );
      results.created.push(project_media_property_id);
    } else {
      project_media_property_id =
        projectMediaProperty.project_media_property_id;
      results.updated.push(project_property_id);
    }
    return results;
  }

  /**
   * Save project_media_tag record
   * @param {string} project_media_id
   * @param {string} tag
   * @param {{ user_id?:string, transaction?:object }} [options]
   * @returns {Promise<{deleted: *[], created: *[], updated: *[]}>}
   */
  async function saveProjectMediaTag(
    project_media_id,
    tag,
    { user_id, transaction } = {},
  ) {
    const funcName = 'saveProjectMediaTag';
    h.validation.requiredParams(funcName, {
      project_media_id,
      tag,
    });
    let project_media_tag_id = '';
    const results = { created: [], updated: [], deleted: [] };
    const projectMediaTag = await projectMediaTagModel.findOne(
      {
        where: {
          project_media_fk: project_media_id,
          tag: tag,
        },
      },
      { transaction },
    );
    if (h.isEmpty(projectMediaTag)) {
      // Create project_media_property record
      project_media_tag_id = h.general.generateId();
      await projectMediaTagModel.create(
        {
          project_media_tag_id,
          project_media_fk: project_media_id,
          tag: tag,
          created_by: user_id,
          updated_by: user_id,
        },
        { transaction },
      );
      results.created.push(project_media_tag_id);
    } else {
      project_media_tag_id = projectMediaTag.project_media_tag_id;
      results.updated.push(project_media_tag_id);
    }
    return results;
  }

  return projectMediaController;
};
