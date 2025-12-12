const constant = require('../constants/constant.json');
const contactActivityHelper = module.exports;
/**
 * Helper function to prettify viewed on device string
 * @param {string} viewOnString
 * @returns {string}
 */
contactActivityHelper.prettifyViewOnDeviceString = (
  viewOnString,
  asOthers = false,
) => {
  let parsedString = viewOnString;

  if (viewOnString.includes(constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.IPAD)) {
    parsedString = constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.IPAD;
  } else if (
    viewOnString.includes(constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.IPHONE)
  ) {
    parsedString = constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.IPHONE;
  } else if (
    viewOnString.includes(constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.ANDROID)
  ) {
    parsedString = constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.ANDROID;
  } else if (
    viewOnString.includes(constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.MACOS)
  ) {
    parsedString = constant.CONTACT.ACTIVITY.VIEWED_ON_VALUES.MACOS;
  } else if (
    viewOnString.includes(constant.CONTACT.ACTIVITY.VIEWED_ON_DEVICE.WINDOWS)
  ) {
    parsedString = constant.CONTACT.ACTIVITY.VIEWED_ON_VALUES.WINDOWS;
  } else {
    parsedString = asOthers ? 'Others' : parsedString;
  }

  return parsedString;
};
