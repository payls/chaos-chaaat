const { v4: uuidv4 } = require('uuid');
const Sentry = require('@sentry/node');
const constant = require('../constants/constant.json');
const generalHelper = module.exports;
const htmlEncode = require('he');

// eslint-disable-next-line no-extend-native
String.prototype.replaceAll = function (searchStr, replaceStr) {
  const str = this;
  // escape regexp special characters in search string
  searchStr = searchStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  return str.replace(new RegExp(searchStr, 'gi'), replaceStr);
};

/**
 * console log function with wrapper (easier to spot message in server log)
 * @param {string} message
 */
generalHelper.log = (message) => {
  console.log(
    '\n===========================[ ' +
      new Date().toISOString() +
      ' (GMT+8) ]=============================',
  );
  console.log(message);
  console.log(
    '=======================================================================================\n',
  );
};

/**
 * Check whether a variable is empty
 * @param value
 * @returns {boolean}
 */
generalHelper.isEmpty = (value) => {
  // test results
  // ---------------
  // []        true, empty array
  // {}        true, empty object
  // null      true
  // undefined true
  // ""        true, empty string
  // ''        true, empty string
  // 0         false, number
  // true      false, boolean
  // false     false, boolean
  // Date      false
  // function  false

  if (value === undefined) return true;

  if (
    typeof value === 'function' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    Object.prototype.toString.call(value) === '[object Date]'
  )
    return false;

  if (value === null || value.length === 0)
    // null or 0 length array
    return true;

  if (typeof value === 'object') {
    // empty object

    let r = true;

    if (Object.keys(value).length > 0) {
      r = false;
    }

    return r;
  }

  return typeof value === 'string' && value.trim() === '';
};

/**
 * Check whether a variable is not empty
 * @param value
 * @returns {boolean}
 */
generalHelper.notEmpty = (value) => {
  return !generalHelper.isEmpty(value);
};

/**
 * compare two strings and returns true if match else false
 * @param str1
 * @param str2
 * @returns {boolean}
 */
generalHelper.compareString = (str1, str2) => {
  if (typeof str1 !== typeof undefined && typeof str2 !== typeof undefined) {
    if (String(str1).toLowerCase() === String(str2).toLowerCase()) {
      return true;
    }
  }
  return false;
};

/**
 * alias of compareString function
 * @param str1
 * @param str2
 * @returns {boolean}
 */
generalHelper.cmpStr = (str1, str2) => {
  return generalHelper.compareString(str1, str2);
};

/**
 * compare two booleans and returns true if match else false
 * @param value1
 * @param value2
 * @returns {boolean}
 */
generalHelper.compareBoolean = (value1, value2) => {
  if (
    typeof value1 !== typeof undefined &&
    typeof value1 !== typeof undefined
  ) {
    if (Boolean(value1) === Boolean(value2)) {
      return true;
    }
  }
  return false;
};

/**
 * alias of compareBoolean function
 * @param value1
 * @param value2
 * @returns {boolean}
 */
generalHelper.cmpBool = (value1, value2) => {
  return generalHelper.compareBoolean(value1, value2);
};

/**
 * compare two integer and returns true if match else false
 * @param value1
 * @param value2
 * @returns {boolean}
 */
generalHelper.compareInt = (value1, value2) => {
  if (
    typeof value1 !== typeof undefined &&
    typeof value1 !== typeof undefined
  ) {
    if (parseInt(value1, 10) === parseInt(value2, 10)) {
      return true;
    }
  }
  return false;
};

/**
 * alias of compareInt function
 * @param value1
 * @param value2
 * @returns {boolean}
 */
generalHelper.cmpInt = (value1, value2) => {
  return generalHelper.compareInt(value1, value2);
};

/**
 * get message by message code
 * @param {string} messageCode
 * @param {object} [messageData={}]
 * @param {string} [languageCode="en"]
 * @returns {string}
 */
generalHelper.getMessageByCode = (
  messageCode,
  messageData = {},
  languageCode = 'en',
) => {
  const messageList = require(`../locales/${languageCode}/templates/message.js`);
  if (
    generalHelper.isEmpty(messageCode) ||
    generalHelper.isEmpty(messageList) ||
    generalHelper.isEmpty(messageList[messageCode])
  ) {
    return '';
  } else {
    let message = messageList[messageCode];
    // perform replacement of parts of message by message data provided
    if (!generalHelper.isEmpty(messageData)) {
      for (const key in messageData) {
        message = message.replaceAll(`[${key}]`, messageData[key]);
      }
    }
    return message;
  }
};

/**
 * Hash a string
 * @param {string} data
 * @returns {string}
 */
generalHelper.generateHash = (data) => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * Generate a uuid
 * @returns {string}
 */
generalHelper.generateId = () => {
  return uuidv4();
};

/**
 * Get access token from request header
 * @param {FastifyRequest} request
 * @returns {string}
 */
generalHelper.getAccessToken = (request) => {
  let accessToken = null;
  if (request.headers.authorization) {
    accessToken = request.headers.authorization;
    if (accessToken.indexOf('Bearer') > -1) {
      accessToken = accessToken.replace('Bearer ', '');
    }
  }
  return accessToken || request.headers['x-access-token'];
};

/**
 * To add a suffix to a file
 * @param {string} url
 * @param {string} suffix
 * @returns
 */
generalHelper.addSuffix = (url, suffix) => {
  if (!url) return '';
  const ext = this.getFileExt(url);
  const fileName = this.fileRemoveExt(url);
  return fileName + suffix + '.' + ext;
};

/**
 * To remove the file ext of a filename
 * @param {string} url
 * @returns
 */
generalHelper.fileRemoveExt = (url) => {
  if (!url) return '';
  return url.replace(/\.[^/.]+$/, '');
};

/**
 * Get file extension only
 * @param {string} url
 * @returns {string}
 */
generalHelper.getFileExt = (url) => {
  if (!url) return '';
  const urlSplits = url.split('/');
  const fileName = urlSplits[urlSplits.length - 1];
  return fileName.split('.')[1] || '';
};

/**
 * Get file name and extension
 * @param {string} url
 * @returns {string}
 */
generalHelper.getFileNameExt = (url) => {
  if (!url) return '';
  const urlSplits = url.split('/');
  return urlSplits[urlSplits.length - 1];
};

/**
 * Validate whether a string is a regular expression
 * @param {string} pattern
 * @returns {boolean}
 */
generalHelper.validateRegex = (pattern) => {
  if (!pattern) return false;
  if (typeof pattern !== 'object') return false;
  try {
    // eslint-disable-next-line no-new
    new RegExp(pattern);
    return true;
  } catch (e) {
    Sentry.captureException(encodeURI);
    return false;
  }
};

/**
 * Capitalize all first letters of sentence
 * @param {string} str
 * @param {string} [delimiter = ' ']
 * @returns {string}
 */
generalHelper.ucFirstAllWords = function (str, delimiter) {
  if (generalHelper.isEmpty(str)) return '';
  delimiter = delimiter || ' ';
  str = str.toLowerCase();
  const formatSentence = function (str, delimiter) {
    const pieces = str.split(delimiter);
    for (let i = 0; i < pieces.length; i++) {
      let j = '';
      if (generalHelper.cmpStr(pieces[i].charAt(0), '(')) {
        j = pieces[i].charAt(1).toUpperCase();
        pieces[i] = '(' + j + pieces[i].substr(2);
      } else {
        j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1);
      }
    }
    return pieces.join(delimiter);
  };
  let finalSentence = formatSentence(str, delimiter);
  finalSentence = formatSentence(finalSentence, '.');
  return finalSentence;
};

generalHelper.generateRandomAlpanumeric = function (length) {
  return Math.random().toString(36).slice(length);
};

/**
 * Format CDN URL
 * @param {object} config
 * @param {string} file_url
 * @returns {string}
 */
generalHelper.formatCdnUrl = (config, file_url) => {
  if (!file_url) return file_url;
  if (file_url.indexOf('https://') > -1 || file_url.indexOf('http://') > -1)
    return file_url;
  return `${config.cdnUrls[0]}/${file_url}`;
};

/**
 * prettify constant value for display
 * @param value
 * @returns {string}
 */
generalHelper.prettifyConstant = (value) => {
  let replacedVal;
  if (this.isEmpty(value)) {
    replacedVal = '';
  } else {
    replacedVal = this.ucFirstAllWords(
      value.toLowerCase().replaceAll('_', ' '),
    );
  }

  return replacedVal.trim();
};

/**
 * format location string given a geo object
 *
 */
generalHelper.formateLocationStr = (geo) => {
  let location = '';
  if (this.notEmpty(geo)) {
    if (this.notEmpty(geo.city)) {
      location = geo.city + ', ';
    }
    if (this.notEmpty(geo.region)) {
      location = location + geo.region + ', ';
    }
    if (this.notEmpty(geo.country)) {
      location = location + geo.country;
    }
  }
  return location;
};

/**
 * checks if a tag is of a media tag
 */
generalHelper.isMediaTag = (tag) => {
  const keyList = Object.keys(constant.CONTACT.ACTIVITY.MEDIA_TAGS);

  for (let i = 0; i < keyList.length; i++) {
    const key = keyList[i];
    if (tag === constant.CONTACT.ACTIVITY.MEDIA_TAGS[key]) {
      return true;
    }
  }
  return false;
};

/**
 * checks if a tag is of a project media tag
 */
generalHelper.isProjectMediaTag = (tag) => {
  const keyList = Object.keys(constant.CONTACT.ACTIVITY.PROJECT_MEDIA_TAGS);

  for (let i = 0; i < keyList.length; i++) {
    const key = keyList[i];
    if (tag === constant.CONTACT.ACTIVITY.PROJECT_MEDIA_TAGS[key]) {
      return true;
    }
  }
  return false;
};

/**
 * Converting seconds to minutes and seconds
 * @param {Int} seconds
 * @returns {string}
 */
generalHelper.prettifySeconds = (seconds) => {
  let prettifiedString = '';
  if (seconds < 60) {
    prettifiedString = seconds + (seconds > 1 ? ' seconds' : ' second');
  } else {
    const minute = Math.floor(seconds / 60);
    const second = seconds % 60;
    prettifiedString =
      minute +
      (minute > 1 ? ' minutes ' : ' minute ') +
      second +
      (second > 1 ? ' seconds' : ' second');
  }
  return prettifiedString;
};

/**
 * Combines first name and last name into a string
 * @param first_name
 * @param last_name
 * @param separator
 * @returns {string}
 */
generalHelper.combineFirstLastName = (
  first_name,
  last_name,
  separator = ' ',
) => {
  const fname = first_name || '';
  const lname = last_name || '';
  return fname.concat(' ', lname).trim().replaceAll(' ', separator);
};

generalHelper.getDateTimeInterval = async (datetime1, datetime2) => {
  const diff = Math.abs(datetime2 - datetime1) / 1000; // get difference in seconds

  const intervals = {
    year: Math.floor(diff / 31536000),
    month: Math.floor(diff / 2592000),
    week: Math.floor(diff / 604800),
    day: Math.floor(diff / 86400),
    hour: Math.floor(diff / 3600) % 24,
    minute: Math.floor(diff / 60) % 60,
    second: Math.floor(diff) % 60,
  };

  const parts = [];

  for (const [key, value] of Object.entries(intervals)) {
    if (value !== 0) {
      parts.push(`${value} ${key}${value !== 1 ? 's' : ''}`);
    }
  }

  // Add remaining seconds if any
  if (parts.length === 1 && intervals.second !== 0) {
    parts.push(
      `${intervals.second} second${intervals.second !== 1 ? 's' : ''}`,
    );
  }

  return parts.join(', ');
};

generalHelper.getMimeType = async (url) => {
  // Create an array of image and video extensions to check against
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  const videoExtensions = ['.mp4', '.3gp'];

  // Get the file extension from the URL
  const fileExtension = url.substring(url.lastIndexOf('.'));

  // Check if the file extension is in the imageExtensions array
  if (imageExtensions.includes(fileExtension.toLowerCase())) {
    if (fileExtension === 'png') {
      return 'image/png';
    } else {
      return 'image/jpg';
    }
  }

  // Check if the file extension is in the videoExtensions array
  if (videoExtensions.includes(fileExtension.toLowerCase())) {
    return 'video/mp4';
  }
};

generalHelper.generatePassword = () => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|:;<>,.?/';

  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

generalHelper.isArray = (variable) => {
  if (Array.isArray(variable)) {
    return true;
  }
  return false;
};

/**
 * The code `generalHelper.generateTrialCode` is defining an asynchronous
 * function that takes `agencyController` as a parameter. The function is
 * responsible for generating a unique trial code for a specific agency.
 *
 * @async
 * @constant
 * @name generateTrialCode
 * @returns {Promise} returns the generated trial code for the new agency
 */
generalHelper.generateTrialCode = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let trial_code = '';
  while (trial_code.length < 6) {
    trial_code += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return trial_code;
};

/**
 * Description
 * Generates support password
 * @constant
 * @name generalHelper
 * @type {typeof module.exports}
 * @returns {string} returns alpha numeric password
 */
generalHelper.generateSupportPassword = () => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

/**
 * Description
 * Unescape data
 * @function
 * @name unescapeData
 * @kind function
 * @param {object} data
 * @returns {object} data unescaped version
 * @exports
 */
generalHelper.unescapeData = (data) => {
  if (typeof data === 'object' && data !== null) {
    // allow if date
    if (data instanceof Date) {
      return data;
    }
    // Map if array
    if (Array.isArray(data)) {
      return data.map((item) => generalHelper.unescapeData(item));
    }
    // Recursive if object
    const sanitizedObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObj[key] = generalHelper.unescapeData(data[key]);
      }
    }
    return sanitizedObj;
  } else if (typeof data === 'string') {
    // Sanitize using unescapeAllowedTags
    return htmlEncode.unescape(data);
  } else if (typeof data === 'number' || typeof data === 'boolean') {
    // Handle primitive types
    return data;
  } else if (data === null || data === undefined) {
    // Handle null and undefined
    return data;
  }
  // Return unchanged values
  return data;
};
