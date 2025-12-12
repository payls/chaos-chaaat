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
  return 'Now';
}

//Converts month number to shortened month text
const convertMonth = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
};

/**
 * Formats date from database to YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formateDate(rawDate) {
  let date = new Date(rawDate);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = convertMonth[month];
  let day = date.getDate();
  return `${day} ${month} ${year}`;
}

/**
 * Formats time from database to HH:MM (24hrs)
 * @param rawDate
 * @returns {string}
 */
export function formatTime(rawDate) {
  let date = new Date(rawDate);
  let hour = `0${date.getHours()}`.slice(-2);
  let minutes = `0${date.getMinutes()}`.slice(-2);
  return `${hour}:${minutes}`;
}

/**
 * Formats time from database to YYYY-MM-DD HH:MM (24hrs)
 * @param {Date} rawDate
 * @returns {string}
 * @returns
 */
export function formatDateTime(rawDate) {
  let date = new Date(rawDate);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = convertMonth[month];
  let day = date.getDate();
  let hour = `0${date.getHours()}`.slice(-2);
  let minutes = `0${date.getMinutes()}`.slice(-2);
  return `${day} ${month} ${year} ${hour}:${minutes}`;
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
