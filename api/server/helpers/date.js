const moment = require('moment');
const dateHelper = module.exports;
const generalHelper = require('./general');
const timezone = 'Asia/Singapore';
const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  cmpStr: generalHelper.cmpStr,
};

/**
 * Format date
 * @param value
 * @param format
 * @param isUTC
 * @returns {Promise<string>}
 */
dateHelper.format = (value, format, isUTC) => {
  let formattedDate = '';
  format = typeof format !== typeof undefined ? format : 'DD MMM YYYY hh:mm a';
  if (h.cmpStr(process.env.NODE_ENV, 'development')) {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : false;
  } else {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : true;
  }
  if (!h.isEmpty(value) && !h.cmpStr(value, '0000-00-00 00:00:00')) {
    if (isUTC) {
      formattedDate = moment(value).tz(timezone).utc().format(format);
    } else {
      formattedDate = moment(value).tz(timezone).format(format);
    }
  }
  return formattedDate;
};

/**
 * Generate sql current date
 * @returns {string}
 */
dateHelper.getSqlCurrentDate = () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * format date to seconds function
 * @param value
 * @param isUTC
 * @param format
 * @returns {string}
 */
dateHelper.formatDateToSeconds = (value, isUTC, format) => {
  let formattedDate = '';
  format = typeof format !== typeof undefined ? format : 'X';
  if (h.cmpStr(process.env.NODE_ENV, 'development')) {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : false;
  } else {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : true;
  }
  if (value && !h.isEmpty(value) && !h.cmpStr(value, '0000-00-00 00:00:00')) {
    if (isUTC) {
      formattedDate = moment(value, format).tz(timezone).utc().valueOf();
    } else {
      formattedDate = moment(value, format).tz(timezone).valueOf();
    }
  }
  return formattedDate;
};

/**
 * format date time function
 * @param value
 * @param isUTC
 * @param format
 * @returns {string}
 */
dateHelper.formatDateTime = (value, isUTC, format) => {
  let formattedDate = '';
  format = typeof format !== typeof undefined ? format : 'DD MMM YYYY hh:mm a';
  if (h.cmpStr(process.env.NODE_ENV, 'development')) {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : false;
  } else {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : true;
  }
  if (!h.isEmpty(value) && !h.cmpStr(value, '0000-00-00 00:00:00')) {
    if (isUTC) {
      formattedDate = moment(value, format).tz(timezone).utc().format(format);
    } else {
      formattedDate = moment(value, format).tz(timezone).format(format);
    }
  }
  return formattedDate;
};

/**
 * format time ago E.g. 5 mins ago, 1 hour ago, etc
 * @param value
 * @param isUTC
 * @returns {string}
 */
dateHelper.formatTimeAgo = (value, isUTC) => {
  let timeAgo = '';
  if (h.cmpStr(process.env.NODE_ENV, 'development')) {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : false;
  } else {
    isUTC = typeof isUTC !== typeof undefined ? Boolean(isUTC) : true;
  }
  if (!h.isEmpty(value) && !h.cmpStr(value, '0000-00-00 00:00:00')) {
    if (isUTC) {
      timeAgo = moment(value).tz(timezone).utc().fromNow();
    } else {
      timeAgo = moment(value).tz(timezone).fromNow();
    }
  }
  return timeAgo;
};
