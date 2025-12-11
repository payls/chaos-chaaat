import Axios from 'axios';
import { config } from '../../configs/config';
import { h } from '../../helpers';
import projectSchema from './project-schema';

export async function getProjectBySlug(data) {
  let response = await Axios({
    url: `${config.contentApiUrl}/v2/project?_embed`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  let apiRes = { status: 'ok', data: { project: {} } };
  if (response && response.data) {
    let projectData = response.data;
    if (projectData) {
      for (let i = 0; i < projectData.length; i++) {
        const project = projectData[i];
        if (h.cmpStr(project.slug, data.slug)) {
          apiRes.data.project = formatProjectData(project);
          break;
        }
      }
    }
  }
  return apiRes;
}

export async function findAll() {
  let response = await Axios({
    url: `${config.contentApiUrl}/v2/project?_embed`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response);
}

function formatProjectData(project) {
  let formattedData = JSON.parse(JSON.stringify(projectSchema));

  formattedData.project_id = project.id ? project.id : '';
  formattedData.slug = project.slug ? project.slug : '';
  formattedData.name =
    project.title && project.title.rendered ? project.title.rendered : '';
  formattedData.property_header_info.name = project.header_name
    ? project.header_name
    : '';
  formattedData.property_header_info.short_description =
    project.header_short_description ? project.header_short_description : '';
  formattedData.property_header_info.cover_picture_url =
    project.header_cover_picture && project.header_cover_picture.guid
      ? project.header_cover_picture.guid
      : '';
  formattedData.location.address = project.location_address
    ? project.location_address
    : '';
  formattedData.location.lat = project.location_latitude
    ? parseFloat(project.location_latitude)
    : null;
  formattedData.location.lng = project.location_longitude
    ? parseFloat(project.location_longitude)
    : null;
  formattedData.location.google_map_url = project.location_google_map_url
    ? project.location_google_map_url
    : '';

  if (project.header_descriptions) {
    let headerDescriptions = project.header_descriptions.split(';');
    formattedData.property_header_info.descriptions = headerDescriptions;
  }

  if (project.content && project.content.rendered) {
    const charToReplace = ['<div>', '</div>', '<p>', '</p>'];
    let description = project.content.rendered;
    charToReplace.forEach((char) => {
      description = description.replaceAll(char, '');
    });
    description = description.replace('&#8211;', '-');
    formattedData.description = description;
  }

  if (project.features) {
    project.features.forEach((feature) => {
      let featureObj = {
        name: feature.post_title ? feature.post_title : '',
        type: feature.feature_type ? feature.feature_type : '',
      };
      formattedData.features.push(featureObj);
    });
  }

  if (project.videos) {
    project.videos.forEach((video) => {
      let videoObj = {
        header_text: video.post_title ? video.post_title : '',
        type: video.video_type ? video.video_type : '',
        url: video.video_url ? video.video_url : '',
      };
      formattedData.videos.push(videoObj);
    });
  }

  if (project.project_images) {
    project.project_images.forEach((image, index) => {
      let convertAltString = `${project.slug}-slider-${index + 1}`;
      let imageObj = {
        src: image.guid ? image.guid : '',
        alt: convertAltString ? convertAltString : '',
      };
      formattedData.images.push(imageObj);
    });
  }

  if (project.nearby) {
    project.nearby.forEach((nearby) => {
      let location = {
        type: nearby.nearby_type ? nearby.nearby_type : '',
        locations: [],
      };
      //Individual location
      let locationName = {};
      locationName.name = nearby.nearby_locations
        ? nearby.nearby_locations
        : '';
      //Add individual location into locations
      location.locations.push(locationName);
      formattedData.location_nearby.push(location);
    });
  }

  if (
    project.country &&
    project.country.length > 0 &&
    project.slug &&
    project.title &&
    project.title.rendered
  ) {
    // if (typeof project.breadcrumbs === 'string') {
    //     let breadcrumbs = project.breadcrumbs.split('/');
    //     project.breadcrumbs = [];
    //     for (let i = 0; i < breadcrumbs.length; i++) {
    //         const breadcrumb = breadcrumbs[i];
    //         project.breadcrumbs.push({ url: ``, text: breadcrumb });
    //     }
    // }
    // project.breadcrumbs.forEach(breadcrumb => {
    //     let breadCrumb = {};
    //     breadCrumb.text = breadcrumb.text ? breadcrumb.text : "",
    //     breadCrumb.url = breadcrumb.url ? breadcrumb.url : ""
    //     formattedData.breadcrumbs.push(breadCrumb);
    // })

    formattedData.breadcrumbs.push({
      url: `/${project.country[0].post_name}`,
      text: `${project.country[0].post_title}`,
    });
    formattedData.breadcrumbs.push({
      url: `/project/${project.slug}`,
      text: `${project.title.rendered}`,
    });
  }

  formattedData.units_available_for_purchase = project.units
    ? _formatAvailableUnits(project.units)
    : [];
  if (project.team_behind)
    Object.assign(
      formattedData.team_behind,
      _formatTeamBehind(project.team_behind),
    );
  else formattedData.team_behind = [];
  formattedData.completion_status = project.completion_status
    ? parseFloat(project.completion_status)
    : null;
  formattedData.availability = project.availability_status
    ? parseFloat(project.availability_status)
    : null;
  formattedData.pricing_description = project.pricing_description
    ? project.pricing_description
    : '';
  formattedData.bedrooms_description = project.bedrooms_description
    ? project.bedrooms_description
    : '';
  formattedData.residences_description = project.residences_description
    ? project.residences_description
    : '';
  formattedData.estimated_completion = project.estimated_completion_description
    ? project.estimated_completion_description
    : '';
  formattedData.units_available = project.units_available_description
    ? project.units_available_description
    : '';
  formattedData.brochure_url = project.brochure_url ? project.brochure_url : '';

  return formattedData;
}

function _formatAvailableUnits(units) {
  let formattedUnits = [];
  //Format individual units
  units.forEach((unit) => {
    //Format unit type string
    let unitType = unit.unit_type ? unit.unit_type : '';
    unitType = unitType.split('_').join(' ');

    const {
      floor,
      sqm,
      bed,
      bath,
      start_price,
      currency,
      weekly_rent,
      rental_yield,
      parking_lots,
      direction_facing,
    } = unit;
    let formattedUnit = {
      property_id: unit.property_id ? unit.property_id : '',
      unit_type: unitType,
      floor: floor ? floor : '',
      sqm: sqm ? parseFloat(sqm) : 0,
      bed: bed ? parseInt(bed) : 0,
      bath: bath ? parseInt(bath) : 0,
      start_price: start_price ? parseFloat(start_price) : 0,
      weekly_rent: weekly_rent ? parseFloat(weekly_rent) : 0,
      rental_yield: rental_yield ? parseFloat(rental_yield) : 0,
      parking_lots: parking_lots ? parseInt(parking_lots) : 0,
      currency: currency ? currency.toUpperCase() : '',
      direction_facing: direction_facing ? direction_facing : '',
      images: [],
    };
    //Get unit image urls
    unit.images.forEach((image) => {
      formattedUnit.images.push(image.guid);
    });
    formattedUnits.push(formattedUnit);
  });
  return formattedUnits;
}

function _formatTeamBehind(teams) {
  let teamBehind = {};
  teams.forEach((team) => {
    teamBehind[`${team.project_team_behind_type}`] = {
      name: team.post_title ? team.post_title : '',
      description: team.description ? team.description : '',
      website: team.website ? team.website : '',
      logos: [],
    };
    if (team.logos && Array.isArray(team.logos)) {
      team.logos.forEach((logo) => {
        teamBehind[`${team.project_team_behind_type}`].logos.push(logo.guid);
      });
    }
  });
  return teamBehind;
}
