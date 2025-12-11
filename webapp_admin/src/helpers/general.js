import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; //https://github.com/fkhadra/react-toastify
import Swal from 'sweetalert2';
import htmlEncode from 'he';

String.prototype.replaceAll = function (searchStr, replaceStr) {
  let str = this;

  // escape regexp special characters in search string
  searchStr = notEmpty(searchStr)
    ? searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    : '';

  return str.replace(new RegExp(searchStr, 'gi'), replaceStr);
};

if (!Object.values) {
  /**
   * Polyfill for Object.values to support IE11
   * @param {object} obj
   * @returns {[]}
   */
  Object.values = function (obj) {
    if (!obj) return [];
    if (typeof obj !== 'object') return [];
    return Object.keys(obj).map((key) => {
      return obj[key];
    });
  };
}

if (!Object.entries) {
  /**
   * Polyfill for Object.entries to support IE11
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill
   * @param {object} obj
   * @returns {[]}
   */
  Object.entries = function (obj) {
    if (!obj) return [];
    if (typeof obj !== 'object') return [];
    let ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
  };
}

/**
 * prettify constant value for display
 * @param value
 * @returns {string}
 */
export function prettifyConstant(value) {
  if (this.isEmpty(value)) {
    return '';
  } else {
    return this.ucFirstAllWords(value.toLowerCase().replaceAll('_', ' '));
  }
}

/**
 * gets all url GET parameters
 * @returns {string}
 * @param parameterName
 */
export function findGetParameter(parameterName) {
  let result = null,
    tmp = [];
  let items = window.location.search.substr(1).split('&');
  for (let index = 0; index < items.length; index++) {
    tmp = items[index].split('=');
    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
  }
  return result;
}

/**
 * initialize state for standard structure across all react elements
 *
 * [SAMPLE additionalStates data]
 * additionalStates: {
 *      fields: [
 *          {
 *              value: 'default value of field',
 *              dirty: 'boolean (true/false) indicator to indicate by default if field is edited or not'
 *              // this is usually used for fields that will not have user interactions on it
 *              // form submission validation will checked if fields have been edited or not using this dirty flag
 *          }
 *          ...
 *      },
 *      ...
 * }
 * @template T
 * @param {T} additionalStates
 * @returns {{ loading: boolean, fields: Object<string, { value: any, error: string, dirty: boolean, changed: boolean}> } & T}
 */
export function initState(additionalStates) {
  // add any states that you want to have across all components here
  let initializedState = {
    loading: false,
  };
  if (additionalStates) {
    for (let additionalState in additionalStates) {
      initializedState[additionalState] = additionalStates[additionalState];
      if (additionalState === 'fields') {
        for (let field in initializedState[additionalState]) {
          initializedState[additionalState][field] = {
            // store actual value of field
            value: initializedState[additionalState][field].value || '',
            // store error message of field
            error: '',
            // flag to indicate whether field has been edited before
            dirty: initializedState[additionalState][field].dirty || false,
            // flag to indicate whether value has changed compared to previous value
            changed: false,
          };
        }
      }
    }
  }
  return initializedState;
}

/**
 * check variable for empty value
 * @param value
 * @returns {boolean}
 */
export function isEmpty(value) {
  // test results
  //---------------
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

  return false;
}

/**
 * inverse of isEmpty function
 * @param value
 * @returns {boolean}
 */
export function notEmpty(value) {
  return !isEmpty(value);
}

/**
 * truncate text with ellipsis
 * @param string
 * @param length
 * @param ellipsis
 * @returns {*}
 */
export function truncate(string, length, ellipsis) {
  length = typeof length !== typeof undefined ? length : 20;
  ellipsis = typeof ellipsis !== typeof undefined ? ellipsis : '...';
  if (string.length > length) {
    return string.substring(0, length) + ellipsis;
  } else {
    return string;
  }
}

/**
 * compare two values and returns true if match else false
 * @param str1
 * @param str2
 */
export function compareString(str1, str2) {
  if (typeof str1 !== typeof undefined && typeof str2 !== typeof undefined) {
    if (String(str1).toLowerCase() === String(str2).toLowerCase()) {
      return true;
    }
  }
  return false;
}

/**
 * alias of compareString function
 * @param str1
 * @param str2
 */
export function cmpStr(str1, str2) {
  return this.compareString(str1, str2);
}

/**
 * compare two booleans and returns true if match else false
 * @param value1
 * @param value2
 * @returns {boolean}
 */
export function compareBoolean(value1, value2) {
  if (
    typeof value1 !== typeof undefined &&
    typeof value1 !== typeof undefined
  ) {
    if (Boolean(value1) === Boolean(value2)) {
      return true;
    }
  }
  return false;
}

/**
 * alias of compareBoolean function
 * @param value1
 * @param value2
 */
export function cmpBool(value1, value2) {
  return this.compareBoolean(value1, value2);
}

/**
 * compare two integer and returns true if match else false
 * @param value1
 * @param value2
 * @returns {boolean}
 */
export function compareInt(value1, value2) {
  if (
    typeof value1 !== typeof undefined &&
    typeof value1 !== typeof undefined
  ) {
    if (parseInt(value1, 10) === parseInt(value2, 10)) {
      return true;
    }
  }
  return false;
}

/**
 * alias of compareString function
 * @param value1
 * @param value2
 */
export function cmpInt(value1, value2) {
  return this.compareInt(value1, value2);
}

/**
 * compare two float and returns true if match else false
 * @param value1
 * @param value2
 * @returns {boolean}
 */
export function compareFLoat(value1, value2) {
  if (
    typeof value1 !== typeof undefined &&
    typeof value1 !== typeof undefined
  ) {
    if (parseFloat(value1, 10) === parseFloat(value2, 10)) {
      return true;
    }
  }
  return false;
}

/**
 * alias of compareFLoat function
 * @param value1
 * @param value2
 */
export function cmpFloat(value1, value2) {
  return this.compareFLoat(value1, value2);
}

/**
 * get current environment based on hostname
 * @returns {*}
 */
export function getEnv() {
  const debug = false;
  const hostName = window.location.hostname;
  const processEnvironment = function (debug, environment) {
    if (debug) console.log('Current environment: ' + environment);
    return environment;
  };
  // development environment
  if (hostName.indexOf('0.0.0.0') > -1) {
    return processEnvironment(debug, 'development');
  }
  // staging environment
  // else if (hostName.indexOf('app-staging.yourpave.com') > -1) {
  // 	return processEnvironment(debug, 'staging');
  // }
  // production environment
  else {
    return processEnvironment(debug, 'production');
  }
}

/**
 * Generic alert
 * @param {string} type
 * @param {{message:string, autoClose?:number}} option
 */
export function alert(
  type = 'success',
  options = { message: '', autoCloseInSecs: 5 },
) {
  type = type || 'success';
  const toastOptions = {
    className: 'toast-' + type,
    position: 'top-center',
    autoClose: options.autoCloseInSecs * 1000,
  };
  switch (type) {
    case 'warn':
      toast.warn(options.message, toastOptions);
      break;
    case 'info':
      toast.info(options.message, toastOptions);
      break;
    case 'error':
      toast.error(options.message, toastOptions);
      break;
    default:
      toast.success(options.message, toastOptions);
  }
}

/**
 * generic prompt using Sweetalert2
 * @param data
 * @param callback
 */
export function prompt(data, callback) {
  if (data && data.message) {
    Swal.fire({
      title: data.title || 'Chaaat',
      html: data.message,
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#0070F9',
      confirmButtonText: 'Yes',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'No',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result && result.value) callback(true);
      else callback(false);
    });
  }
}

/**
 * prompt with text validation using Sweetaler2
 * @param data
 * @param callback
 */
export function promptWithTextValidation(data, callback) {
  if (data && data.message) {
    Swal.fire({
      title: data.title || 'Chaaat',
      html: data.message,
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#0070F9',
      confirmButtonText: 'Yes',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'No',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      input: 'text',
      text: `Please type '${data.deleteMessageValidation}' to confirm.`,
      preConfirm: (inputValue) => {
        if (inputValue !== data.deleteMessageValidation) {
          Swal.showValidationMessage(`You must type "${data.deleteMessageValidation}" to confirm.`)
        }
      }
    }).then((result) => {
      if (result && result.value) callback(true);
      else callback(false);
    });
  }
}

/**
 * generic prompt using Sweetalert2
 * @param data
 */
export function promptPromise(data) {
  if (data && data.message) {
    return Swal.fire({
      title: data.title || 'Chaaat',
      html: data.message,
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#0070F9',
      confirmButtonText: 'Yes',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'No',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result && result.value) return true;
      return false;
    });
  }
}

/**
 * generic prompt using Sweetalert2
 * @param data
 * @param callback
 */
export function infoPrompt(data, callback) {
  if (data && data.message) {
    Swal.fire({
      title: data.title || 'Chaaat',
      html: data.message,
      reverseButtons: true,
      showCancelButton: false,
      confirmButtonColor: '#0070F9',
      confirmButtonText: 'Close',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'No',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result && result.value) callback(true);
      else callback(false);
    });
  }
}

/**
 * PDF Tag prompt using Sweetalert2
 * @param data
 * @param callback
 */
export function pdfSelectedTagPrompt(data, callback) {
  if (data && data.message) {
    Swal.fire({
      title: data.title || 'Pave',
      html: data.message,
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#0070F9',
      confirmButtonText: 'Yes',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'No',
      preConfirm: () => {
        const brochure = Swal.getPopup().querySelector('#brochure').checked;
        const factsheet = Swal.getPopup().querySelector('#factsheet').checked;

        return { brochure, factsheet };
      },
    }).then((result) => {
      callback(result);
    });
  }
}
export function sentenceCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  const strr = str.replaceAll('_', ' ');
  return strr.charAt(0).toUpperCase() + strr.slice(1).toLowerCase();
}

/**
 * capitalize all first letters of sentence
 * @param {string} str
 * @returns {string}
 */
export function ucFirstAllWords(str) {
  if (!str) return '';
  let pieces = str.split(' ');
  for (let i = 0; i < pieces.length; i++) {
    const j = pieces[i].charAt(0).toUpperCase();
    pieces[i] = j + pieces[i].substr(1);
  }
  return pieces.join(' ');
}

export function renderLink(txt) {
  const URL_REGEX =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  return txt
    .split(' ')
    .map((part) =>
      URL_REGEX.test(part) ? <a href={part}>{part} </a> : part + ' ',
    );
}

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
}

/**
 * Get file extension only
 * @param {string} url
 * @returns {string}
 */
export function getFileExt(url) {
  if (!url) return '';
  const urlSplits = url.split('/');
  const fileName = urlSplits[urlSplits.length - 1];
  return fileName.split('.')[1] || '';
}

/**
 * Get file name and extension
 * @param {string} url
 * @returns {string}
 */
export function getFileNameExt(url) {
  if (!url) return '';
  const urlSplits = url.split('/');
  const fileName = urlSplits[urlSplits.length - 1];
  return fileName;
}

/**
 * A custom decimal formatting method for bed and bath display for decimal and non-decimal
 * @param decimal
 * @param fraction
 * @returns {string|*}
 */
export function customFormatDecimal(decimal, fraction = 0) {
  return Math.floor(decimal) == decimal
    ? Math.floor(decimal).toFixed(fraction)
    : decimal;
}

/**
 * Only strings are accepted in this function. String will be checked if float and returned true if yes.
 * @param str
 * @returns {boolean} : true if numeric else false
 */
export function isNumeric(str) {
  if (typeof str != 'string') return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

/**
 * Deep clone object
 * @param {object} object
 * @returns {object}
 */
export function deepCloneObject(object) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Generates an array of ints from start int to end int
 * Behaves similarly to Python's range()
 */
export function range(start, end) {
  let absStart = Math.abs(start);
  let absEnd = Math.abs(end);
  let arrayLen = absStart + absEnd + 1;

  return Array(arrayLen)
    .fill()
    .map((_, idx) => start + idx);
}

/**
 * Get the country given a google raw location
 * @param {obj} googleRawLocation
 * @returns {string}
 */
export function getCountry(google_place_raw) {
  let country = '';
  if (notEmpty(google_place_raw)) {
    for (let i = 0; i < google_place_raw.address_components.length; i++) {
      const add_component = google_place_raw.address_components[i];
      if (add_component.types.includes('country')) {
        country = add_component.long_name;
      }
    }
  }
  return country;
}

export function hasAdminTwo(country) {
  const withAdminTwoCountries = ['United Kingdom'];

  return withAdminTwoCountries.includes(country);
}

/**
 *
 * @param {obj} google_place_raw
 * @returns {string}
 */
export function getCity(google_place_raw) {
  const country = getCountry(google_place_raw);
  let city = '';
  if (notEmpty(google_place_raw)) {
    for (let i = 0; i < google_place_raw.address_components.length; i++) {
      const add_component = google_place_raw.address_components[i];
      if (
        hasAdminTwo(country) &&
        add_component.types.includes('administrative_area_level_2')
      ) {
        city = add_component.long_name;
        break;
      }
      if (add_component.types.includes('administrative_area_level_1')) {
        city = add_component.long_name;
        break;
      }

      if (add_component.types.includes('locality')) {
        city = add_component.long_name;
      }
    }
  }
  return city;
}

/**
 * Converting seconds to minutes and seconds
 * @param {Int} seconds
 * @returns {string}
 */
export function prettifySeconds(seconds) {
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
}

export function getMimeType(url) {
  // Create an array of file extensions to check against
  const fileExtensions = [
    'png',
    'jpg',
    'jpeg',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'csv',
    'txt',
    'mp4',
    '3gpp',
    '3gp',
    'aac',
    'amr',
    "mpga","mp2","mp2a","mp3","m2a","m3a", // audio/mpeg
    'ogg',
    'oga',
    'opus'
  ];

  // Get the file extension from the URL
  const fileExtension = url.substring(url.lastIndexOf('.'));
  const adjFileExtension = fileExtension.substring(1);

  // Check if the file extension is in the fileExtensions array
  if (fileExtensions.includes(adjFileExtension.toLowerCase())) {
    if (adjFileExtension === 'png') {
      return 'image/png';
    } else if (adjFileExtension === 'jpg') {
      return 'image/jpg';
    } else if (adjFileExtension === 'jpeg') {
      return 'image/jpg';
    } else if (adjFileExtension === 'pdf') {
      return 'application/pdf';
    } else if (adjFileExtension === 'doc') {
      return 'application/msword';
    } else if (adjFileExtension === 'docx') {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (adjFileExtension === 'xls') {
      return 'application/vnd.ms-excel';
    } else if (adjFileExtension === 'xlsx') {
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (adjFileExtension === 'ppt') {
      return 'application/vnd.ms-powerpoint';
    } else if (adjFileExtension === 'pptx') {
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (adjFileExtension === 'csv') {
      return 'text/csv';
    } else if (adjFileExtension === 'mp4') {
      return 'video/mp4';
    } else if (adjFileExtension === '3gpp') {
      return 'video/3gpp';
    } else if (adjFileExtension === '3gp') {
      return 'video/3gp';
    } else if (adjFileExtension === 'aac') {
      return 'audio/aac';
    } else if (adjFileExtension === 'amr') {
      return 'audio/amr';
    } else if (["mpga","mp2","mp2a","mp3","m2a","m3a"].includes(adjFileExtension)) {
      return 'audio/mpeg';
    } else {
      return 'text/plain';
    }
  }
}

/**
 * Validate Object if all keys has value
 * @param {Object} obj
 * @returns {boolean}
 */
export function validateForm(obj, exempt = []) {
  for (const key in obj) {
    if (exempt.includes(key)) continue;
    if (obj[key] === '' || obj[key] === null) return false;
  }
  return true;
}

/**
 * Validate email
 * @param {Object} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const e = /^[^\s@]+(\+[^\s@]+)?@[^\s@]+\.[^\s@]+$/;
  return e.test(email);
}

/**
 * Validate url
 * @param {Object} url
 * @returns {boolean}
 */
export function validateURL(url) {
  const res = url.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
  );
  if (res == null) return false;
  else return true;
}

/**
 * Convert characters to uppercase
 * @param {Object} url
 * @returns {boolean}
 */
export function ucwords(str) {
  return str.replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
}

/**
 * Validate number
 * @param {Object} number
 * @returns {boolean}
 */
export function validateNumberField(input) {
  return input !== '' && /^[0-9]+$/.test(input);
}

/**
 * Return values that is changed in 2 objects
 * @param {Object} url
 * @returns {boolean}
 */
export function valuesChanged(obj1, obj2) {
  const changedKeyValues = {};

  Object.keys(obj2).forEach((key) => {
    if (obj1.hasOwnProperty(key) && obj2[key] !== obj1[key]) {
      changedKeyValues[key] = obj1[key];
    }
  });

  return changedKeyValues;
}

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
export function unescapeData(data) {
  if (typeof data === 'object' && data !== null) {
    // Map if array
    if (Array.isArray(data)) {
      return data.map((item) => unescapeData(item));
    }
    // Recursive if object
    const sanitizedObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObj[key] = unescapeData(data[key]);
      }
    }
    return sanitizedObj;
  } else if (typeof data === 'string') {
    // Sanitize using unescapeAllowedTags
    return htmlEncode.unescape(data);
  }
  // Return unchanged values
  return data;
};

export function isImageOrVideo(url) {
  if (isEmpty(url)) {
    return 'none';
  }
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const videoExtensions = ['mp4', '3gp'];

  const extension = url.split('.').pop().toLowerCase();
  
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  
  return 'none';
}