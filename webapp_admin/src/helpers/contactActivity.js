import { h } from '../helpers';
import constant from '../constants/constant.json';

/**
 * A function to check if parsed activity is within the time interval of
 * activities within the activityStreamDict
 * @param {*} activityStreamDict
 * @param {*} parsedActivity
 * @returns {boolean}
 */
export function isWithinTimeInterval(activityStreamDict, parsedActivity) {
  // Define the target time interval to match
  const deltaRange = h.general.range(
    constant.CONTACT.ACTIVITY.GROUP_INTERVAL.START,
    constant.CONTACT.ACTIVITY.GROUP_INTERVAL.END,
  );

  for (let i = 0; i < deltaRange.length; i++) {
    let dupeDate = new Date(parsedActivity.date_obj);
    dupeDate.setMinutes(dupeDate.getMinutes() + parseInt(deltaRange[i]));

    const moddedDate = h.date.formatDateTime(dupeDate);

    if (activityStreamDict[moddedDate]) {
      for (let j = 0; j < activityStreamDict[moddedDate].length; j++) {
        if (
          activityStreamDict[moddedDate][j].user === parsedActivity.user &&
          activityStreamDict[moddedDate][j].activity ===
            parsedActivity.activityType
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Helper function to prettify viewed on device string
 * @param {string} viewOnString
 * @returns {string}
 */
export function prettifyViewOnDeviceString(viewOnString) {
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
  }

  return parsedString;
}
