const Sentry = require('@sentry/node');
const h = require('../helpers');
const constant = require('../constants/constant.json');

module.exports.makeProjectPropertyController = (models) => {
  const { project_property: projectPropertyModel } = models;
  const projectPropertyController = {};

  /**
   * Create project's property record
   * @param {{
   *  project_fk: string,
   *  unit_type: string,
   *  unit_number: string,
   *  floor: string,
   *  sqm: number,
   *  number_of_bedroom: number,
   *  number_of_bathroom: number,
   *  number_of_parking_lots: string,
   *  direction_facing: string,
   *  currency_code: string,
   *  starting_price: number,
   *  weekly_rent: number,
   *  rental_yield: number,
   *  status: string,
   *  is_deleted: number,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectPropertyController.create = async (record, { transaction } = {}) => {
    const funcName = 'projectPropertyController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      project_fk,
      unit_type,
      unit_number,
      floor,
      sqm,
      number_of_bedroom,
      number_of_bathroom,
      number_of_parking_lots,
      direction_facing,
      currency_code,
      starting_price,
      weekly_rent,
      rental_yield,
      status,
      is_deleted,
      created_by,
    } = record;
    const project_property_id = h.general.generateId();
    await projectPropertyModel.create(
      {
        project_property_id,
        project_fk,
        unit_type,
        unit_number,
        floor,
        sqm,
        number_of_bedroom,
        number_of_bathroom,
        number_of_parking_lots,
        direction_facing,
        currency_code,
        starting_price,
        weekly_rent,
        rental_yield,
        status,
        is_deleted,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_property_id;
  };

  /**
   * Update project's property record
   *  @param {string} project_property_id
   * @param {{
   *  project_fk: string,
   *  unit_type: string,
   *  unit_number: string,
   *  floor: string,
   *  sqm: number,
   *  number_of_bedroom: number,
   *  number_of_bathroom: number,
   *  number_of_parking_lots: string,
   *  direction_facing: string,
   *  currency_code: string,
   *  starting_price: number,
   *  weekly_rent: number,
   *  rental_yield: number,
   *  status: string,
   *  is_deleted: number,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectPropertyController.update = async (
    project_property_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectPropertyController.update';
    h.validation.requiredParams(funcName, { project_property_id, record });
    const {
      project_fk,
      unit_type,
      unit_number,
      floor,
      sqm,
      number_of_bedroom,
      number_of_bathroom,
      number_of_parking_lots,
      direction_facing,
      currency_code,
      starting_price,
      weekly_rent,
      rental_yield,
      status,
      is_deleted,
      updated_by,
    } = record;
    h.validation.validateConstantValue(
      funcName,
      {
        status: constant.PROPERTY.STATUS,
        direction_facing: constant.DIRECTION,
      },
      { status, direction_facing },
    );
    await projectPropertyModel.update(
      {
        project_fk,
        unit_type,
        unit_number,
        floor,
        sqm,
        number_of_bedroom,
        number_of_bathroom,
        number_of_parking_lots,
        direction_facing,
        currency_code,
        starting_price,
        weekly_rent,
        rental_yield,
        status,
        is_deleted,
        updated_by,
      },
      { where: { project_property_id }, transaction },
    );
    return project_property_id;
  };

  /**
   * Find all project property records
   * @param {{
   *  project_property_id: string,
   *  project_fk: string,
   *  unit_type: string,
   *  unit_number: string,
   *  floor: string,
   *  sqm: number,
   *  number_of_bedroom: number,
   *  number_of_bathroom: number,
   *  number_of_parking_lots: string,
   *  direction_facing: string,
   *  currency_code: string,
   *  starting_price: number,
   *  weekly_rent: number,
   *  rental_yield: number,
   *  status: string,
   *  is_deleted: number,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectPropertyController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectPropertyController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectPropertyModel.findAll({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project's property record
   * @param {{
   *  project_property_id: string,
   *  project_fk: string,
   *  unit_type: string,
   *  unit_number: string,
   *  floor: string,
   *  sqm: number,
   *  number_of_bedroom: number,
   *  number_of_bathroom: number,
   *  number_of_parking_lots: string,
   *  direction_facing: string,
   *  currency_code: string,
   *  starting_price: number,
   *  weekly_rent: number,
   *  rental_yield: number,
   *  status: string,
   *  is_deleted: number,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectPropertyController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectPropertyController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectPropertyModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project property record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectPropertyController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'projectPropertyController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectPropertyModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Create/update units
   * @param {string} project_id
   * @param {array} units
   * @param {{ user_id?:string, transaction?:object }} [options]
   * @returns {Promise<{deleted: *[], created: *[], updated: *[]}>}
   */
  projectPropertyController.saveUnits = async (
    project_id,
    units = [],
    { user_id, transaction } = {},
  ) => {
    const funcName = 'projectPropertyController.saveUnits';
    h.validation.requiredParams(funcName, { project_id });
    const results = { deleted: [], created: [], updated: [] };
    try {
      // Get list of current properties in project
      const currentUnits = await projectPropertyModel.findAll(
        {
          where: {
            project_fk: project_id,
            is_deleted: 0,
          },
        },
        { transaction },
      );
      if (h.notEmpty(currentUnits)) {
        for (let i = 0; i < currentUnits.length; i++) {
          const currentUnit = currentUnits[i];
          // Find units that needs to be deleted
          if (
            !units.find(
              (unit) =>
                h.notEmpty(unit.project_property_id) &&
                h.cmpStr(
                  unit.project_property_id,
                  currentUnit.project_property_id,
                ),
            )
          ) {
            // Update unit's is_deleted flag to 1
            await projectPropertyModel.update(
              { is_deleted: 1, updated_by: user_id },
              {
                where: { project_property_id: currentUnit.project_property_id },
              },
              { transaction },
            );
            results.deleted.push(currentUnit.project_property_id);
          }
          // Find units that needs to be updated
          for (let j = 0; j < units.length; j++) {
            const unitToUpdate = units[j];
            if (
              h.notEmpty(unitToUpdate.project_property_id) &&
              h.cmpStr(
                unitToUpdate.project_property_id,
                currentUnit.project_property_id,
              )
            ) {
              // Update unit
              await projectPropertyModel.update(
                {
                  unit_type: unitToUpdate.unit_type,
                  unit_number: unitToUpdate.unit_number,
                  floor: unitToUpdate.floor,
                  sqm: unitToUpdate.sqm,
                  number_of_bedroom: unitToUpdate.number_of_bedroom,
                  number_of_bathroom: unitToUpdate.number_of_bathroom,
                  number_of_parking_lots: unitToUpdate.number_of_parking_lots,
                  direction_facing: unitToUpdate.direction_facing,
                  currency_code: unitToUpdate.currency_code,
                  starting_price: unitToUpdate.starting_price,
                  weekly_rent: unitToUpdate.weekly_rent,
                  rental_yield: unitToUpdate.rental_yield,
                  status: unitToUpdate.status,
                  updated_by: user_id,
                },
                {
                  where: {
                    project_property_id: currentUnit.project_property_id,
                  },
                },
                { transaction },
              );
              results.updated.push(currentUnit.project_property_id);
            }
          }
        }
      }
      if (h.notEmpty(units)) {
        // Find units that needs to be created
        const unitsToCreate = units.filter((unit) =>
          h.isEmpty(unit.project_property_id),
        );
        for (let i = 0; i < unitsToCreate.length; i++) {
          const unitToCreate = unitsToCreate[i];
          const newProjectPropertyId = h.general.generateId();
          await projectPropertyModel.create(
            {
              project_property_id: newProjectPropertyId,
              project_fk: project_id,
              unit_type: unitToCreate.unit_type,
              unit_number: unitToCreate.unit_number,
              floor: unitToCreate.floor,
              sqm: unitToCreate.sqm,
              number_of_bedroom: unitToCreate.number_of_bedroom,
              number_of_bathroom: unitToCreate.number_of_bathroom,
              number_of_parking_lots: unitToCreate.number_of_parking_lots,
              direction_facing: unitToCreate.direction_facing,
              currency_code: unitToCreate.currency_code,
              starting_price: unitToCreate.starting_price,
              weekly_rent: unitToCreate.weekly_rent,
              rental_yield: unitToCreate.rental_yield,
              status: unitToCreate.status,
              is_deleted: 0,
              created_by: user_id,
              updated_by: user_id,
            },
            { transaction },
          );
          results.created.push(newProjectPropertyId);
        }
      }
    } catch (err) {
      Sentry.captureException(err);
      console.log(`${funcName}: failed to save units`, { results, err });
    }
    return results;
  };

  /**
   * Formats project property for buyer's page
   * @param projectProperty
   * @returns {
   * {project: {
   *  project_id: *,
   *  project_name: DeviceFarm.Name | CodeBuild.ProjectName,
   *  project_currency: string,
   *  location_address: string,
   *  location_latitude: *,
   *  location_longitude: *,
   *  location_google_map_url: *},
   *  property_id: *,
   *  unit_id: *,
   *  unit: {
   *      post_name: string,
   *      unit_type: (string|string|*|schema.body.properties.unit_type|{type}|schema.body.properties.units_available_for_purchase.items.properties.unit_type),
   *      unit_number: *,
   *      floor: *,
   *      sqm: (number|schema.body.properties.units_available_for_purchase.items.properties.sqm|{type}|fields.sqm|{type, get}|schema.body.properties.sqm),
   *      bed: (number|schema.body.properties.units_available_for_purchase.items.properties.number_of_bedroom|{type}|schema.body.properties.number_of_bedroom),
   *      bath: (number|schema.body.properties.number_of_bathroom|{type}|schema.body.properties.units_available_for_purchase.items.properties.number_of_bathroom),
   *      start_price: (number|schema.body.properties.units_available_for_purchase.items.properties.starting_price|{type}|schema.body.properties.starting_price|fields.starting_price|{type, get}),
   *      currency: *, weekly_rent: (number|schema.body.properties.weekly_rent|{type}|schema.body.properties.units_available_for_purchase.items.properties.weekly_rent),
   *      rental_yield: (number|schema.body.properties.units_available_for_purchase.items.properties.rental_yield|{type}|schema.body.properties.rental_yield),
   *      parking_lots: (string|schema.body.properties.number_of_parking_lots|{type}|schema.body.properties.units_available_for_purchase.items.properties.number_of_parking_lots),
   *      direction_facing: *,
   *      images: Array,
   *      medias: Array}
   *      }
   *   }
   */
  projectPropertyController.formatProjectPropertyContent = (
    projectProperty,
  ) => {
    if (h.notEmpty(projectProperty)) {
      projectProperty = JSON.parse(JSON.stringify(projectProperty));
      const images = [];
      const medias = [];
      if (h.notEmpty(projectProperty.project_media_properties)) {
        const sortedMediaProperties =
          projectProperty.project_media_properties.sort((a, b) => {
            return (
              new Date(a?.project_medium?.created_date_raw) -
              new Date(b?.project_medium?.created_date_raw)
            );
          });
        sortedMediaProperties.forEach((media) => {
          const formatMedia = {
            media_type: media?.project_medium?.type,
            media_url: media?.project_medium?.url,
            media_thumbnail_src: media?.project_medium?.thumbnail_src,
            media_title: media?.project_medium?.title,
            media_description: media?.project_medium?.header_text,
            media_display_order: media?.project_medium?.display_order,
            media_property_media_fk: media?.project_medium?.project_media_id,
            media_tag:
              media?.project_medium?.project_media_tags &&
              Array.isArray(media?.project_medium?.project_media_tags)
                ? media?.project_medium?.project_media_tags.map(
                    (project_media_tag) => project_media_tag?.tag,
                  )
                : undefined,
          };
          medias.push(formatMedia);
        });
      }

      return {
        project: {
          project_id: projectProperty.project.project_id,
          project_name: projectProperty.project.name,
          project_type: projectProperty.project.project_type,
          project_currency:
            projectProperty.project.currency_code &&
            projectProperty.project.currency_code.length > 0
              ? projectProperty.project.currency_code.toLowerCase()
              : 'usd',
          project_size_format: projectProperty.project.size_format,
          location_address: projectProperty.project.location_address_1
            ? `${projectProperty.project.location_address_1}`
            : '' + projectProperty.project.location_address_2
            ? `, ${projectProperty.project.location_address_2}`
            : '' + projectProperty.project.location_address_3
            ? `, ${projectProperty.project.location_address_3}`
            : '',
          location_latitude: projectProperty.project.location_latitude,
          location_longitude: projectProperty.project.location_longitude,
          location_google_map_url:
            projectProperty.project.location_google_map_url,
        },
        property_id: projectProperty.project_property_id,
        unit_id: projectProperty.project_property_id,
        unit: {
          post_name: '',
          unit_type: projectProperty.unit_type,
          unit_number: projectProperty.unit_number,
          floor: projectProperty.floor,
          sqm: parseFloat(projectProperty.sqm),
          bed: projectProperty.number_of_bedroom,
          bath: projectProperty.number_of_bathroom,
          start_price: parseFloat(projectProperty.starting_price),
          currency:
            projectProperty.project.currency_code &&
            projectProperty.project.currency_code.length > 0
              ? projectProperty.project.currency_code.toLowerCase()
              : 'usd',
          weekly_rent: projectProperty.weekly_rent,
          rental_yield: projectProperty.rental_yield,
          parking_lots: projectProperty.number_of_parking_lots,
          direction_facing: projectProperty.direction_facing,
          images,
          medias,
        },
      };
    }
  };

  return projectPropertyController;
};
