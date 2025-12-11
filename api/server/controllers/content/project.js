const h = require('../../helpers');
const NodeCache = h.cache.init();
const projectApi = require('../../api/content/project');

module.exports.makeController = (models) => {
  const contentProjectController = {};

  /**
   * Get all projects from WordPress content site
   * @returns {Promise<{}>}
   */
  contentProjectController.findAll = async () => {
    let projects = [];
    const projectsCache = h.cache.getValue(NodeCache, 'content_projects');
    if (h.notEmpty(projectsCache)) {
      projects = projectsCache;
    } else {
      let { data } = await projectApi.findAll();
      if (h.notEmpty(data)) {
        data = data.map((project) => {
          if (project && project.title && project.title.rendered)
            project.title.rendered = project.title.rendered.replaceAll(
              '&#8211;',
              '-',
            );
          return project;
        });
      }
      projects = data;
      h.cache.setValue(NodeCache, 'content_projects', data);
    }
    return projects;
  };

  /**
   * Find one unit by unit ID
   * @param {string} unit_id
   * @returns {Promise<{unit: {bed: *, parking_lots: *, rental_yield: *, images: (*|*[]), weekly_rent: *, direction_facing, start_price: *, currency: *, unit_type: *, floor: *, bath: *, sqm: *}, unit_id, property_id}>}
   */
  contentProjectController.findOneUnit = async (unit_id) => {
    const funcName = 'contentProjectController.findOneUnit';
    h.validation.requiredParams(funcName, { unit_id });
    const projects = await contentProjectController.findAll();
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      for (let k = 0; k < project.units.length; k++) {
        const projectUnit = project.units[k];
        if (h.cmpInt(unit_id, projectUnit.id)) {
          let medias = h.notEmpty(projectUnit.medias)
            ? projectUnit.medias.map((media) => {
                return {
                  media_type: h.isEmpty(media.youtube_link) ? 'image' : 'video',
                  media_url: h.isEmpty(media.youtube_link)
                    ? media.image.guid
                    : media.youtube_link,
                  media_title: media.post_title,
                  media_description: media.post_content,
                };
              })
            : [];
          if (projectUnit.images) {
            medias = medias.concat(
              h.notEmpty(projectUnit.images)
                ? projectUnit.images.map((image) => {
                    return {
                      media_type: 'image',
                      media_url: image.guid,
                      media_title: image.title,
                      media_thumbnail_src: image.thumbnail_src,
                      media_description: '',
                      media_display_order: image.media_display_order,
                      media_property_media_fk: image.media_property_media_fk,
                    };
                  })
                : [],
            );
          }
          return {
            // project_raw: project,
            project: {
              project_id: project.id,
              project_name: project.title.rendered,
              project_currency:
                project.project_currency && project.project_currency.length > 0
                  ? project.project_currency[0].toLowerCase()
                  : 'usd',
              location_address: project.location_address,
              location_latitude: project.location_latitude,
              location_longitude: project.location_longitude,
              location_google_map_url: project.location_google_map_url,
            },
            property_id: projectUnit.id,
            unit_id: projectUnit.id,
            // unit_raw: projectUnit,
            unit: {
              post_name: projectUnit.post_name,
              unit_type: projectUnit.unit_type,
              unit_number: projectUnit.unit_number,
              floor: projectUnit.floor,
              sqm: projectUnit.sqm,
              bed: projectUnit.bed,
              bath: projectUnit.bath,
              start_price: projectUnit.start_price,
              currency: projectUnit.currency,
              weekly_rent: projectUnit.weekly_rent,
              rental_yield: projectUnit.rental_yield,
              parking_lots: projectUnit.parking_lots,
              direction_facing: projectUnit.direction_facing,
              // images_raw: projectUnit.images,
              images: projectUnit.images
                ? projectUnit.images.map((image) => {
                    return {
                      image_url: image.guid,
                      image_title: image.title,
                      image_mimetype: image.post_mime_type,
                      image_id: image.ID,
                      image_order: image.menu_order,
                    };
                  })
                : [],
              medias,
            },
          };
        }
      }
    }
  };

  return contentProjectController;
};
