const propertyHelper = module.exports;
const generalHelper = require('../helpers/general');
const constant = require('../constants/constant.json');
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
};

/**
 * Helper function to shortlisted property settings' image toggles
 * @param {obj} project
 * @param {obj} propertySettings
 * @returns {Array}
 */
propertyHelper.getShownProjectImages = (propertySettings) => {
  const shownPropertyImages = [];
  const propertyImageSettings = [
    'media_setting_image',
    'media_setting_video',
    'media_setting_floor_plan',
    'media_setting_brocure',
    'media_setting_factsheet',
    'media_setting_render_3d',
    'hidden_media',
    'media_order',
  ];
  for (const keyInx in propertyImageSettings) {
    const setting = propertyImageSettings[keyInx];

    if (
      (h.notEmpty(propertySettings) && propertySettings[setting]) ||
      h.isEmpty(propertySettings)
    ) {
      shownPropertyImages.push(constant.SHORTLIST_PROPERTY.SETTING[setting]);
    }
  }
  return shownPropertyImages;
};
