const projectHelper = module.exports;
const generalHelper = require('../helpers/general');
const constant = require('../constants/constant.json');
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
};
/**
 * Helper function to obtain
 * @param {obj} project
 * @param {obj} projectSettings
 * @returns {Array}
 */
projectHelper.getProjectDetails = (project, projectSettings) => {
  const currProjectDetails = [];
  const projectDetails = [
    'key_stats',
    'project_highlights',
    'why_invest',
    'shopping',
    'transport',
    'education',
  ];
  const projectKeys = Object.keys(project);
  for (const keyInx in projectKeys) {
    const key = projectKeys[keyInx];

    if (projectDetails.includes(key) && h.notEmpty(project[key])) {
      const settingKey = constant.SHORTLIST_PROJECT.SETTING[key];
      if (
        (h.notEmpty(projectSettings) && projectSettings[settingKey]) ||
        h.isEmpty(projectSettings)
      ) {
        currProjectDetails.push(key);
      }
    }
  }

  return currProjectDetails;
};

/**
 * Helper function to shortlisted project settings' image toggles
 * @param {obj} project
 * @param {obj} projectSettings
 * @returns {Array}
 */
projectHelper.getShownProjectImages = (projectSettings) => {
  const shownProjectImages = [];
  const projectImageSettings = [
    'media_setting_image',
    'media_setting_video',
    'media_setting_floor_plan',
    'media_setting_brocure',
    'media_setting_factsheet',
    'media_setting_render_3d',
    'hidden_media',
    'media_order',
  ];
  for (const keyInx in projectImageSettings) {
    const setting = projectImageSettings[keyInx];

    if (
      (h.notEmpty(projectSettings) && projectSettings[setting]) ||
      h.isEmpty(projectSettings)
    ) {
      shownProjectImages.push(constant.SHORTLIST_PROJECT.SETTING[setting]);
    }
  }
  return shownProjectImages;
};
