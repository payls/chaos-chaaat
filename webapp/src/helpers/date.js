import { isEmpty } from './general';

/**
 * Get time since text for date
 * @param {Date} date
 * @returns {string}
 */
export function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ` year${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return (
      Math.floor(interval) + ` month${Math.floor(interval) > 1 ? 's' : ''}`
    );
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ` day${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ` hour${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return (
      Math.floor(interval) + ` minute${Math.floor(interval) > 1 ? 's' : ''}`
    );
  }
  return Math.floor(seconds) + ` second${Math.floor(interval) > 1 ? 's' : ''}`;
}

/**
 * Formats UTC date to local date
 * @param rawDate
 * @returns {string}
 */
export function convertUTCDateToLocalDate(
  dateString,
  timezone,
  locales = 'en-US',
  options = { timeZone: timezone },
) {
  const date = new Date(dateString);
  return date.toLocaleString(locales, options);
}

/**
 * Formats date to quarter
 * @param rawDate
 * @returns {string}
 */
export function convertDateToQuarter(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth();
  let formattedDate = '';
  if (month >= 0 && month <= 2) {
    formattedDate += 'Q1';
  } else if (month >= 3 && month <= 5) {
    formattedDate += 'Q2';
  } else if (month >= 6 && month <= 8) {
    formattedDate += 'Q3';
  } else {
    formattedDate += 'Q4';
  }
  formattedDate += ' ' + date.getFullYear();
  return formattedDate;
}

/**
 * Checks whether date is null or defined as 0000-00-00 00:00:00
 * @params rawDate
 * @returns {boolean}
 */
export function isDateEmpty(dateString) {
  if (isEmpty(dateString)) {
    return true;
  }
  let date = Date.parse(dateString);
  if (isNaN(date)) {
    return true;
  }
  return false;
}
