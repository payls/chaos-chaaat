import React from 'react';
import { toast } from 'react-toastify'; //https://github.com/fkhadra/react-toastify
import Swal from 'sweetalert2';

String.prototype.replaceAll = function (searchStr, replaceStr) {
  let str = this;

  // escape regexp special characters in search string
  searchStr = notEmpty(searchStr) ? searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') : '';

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
 * @param url
 * @returns {string}
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
      title: data.title || 'pave',
      html: data.message,
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#0070F9',
      confirmButtonText: 'Yes',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result && result.value) callback(true);
      else callback(false);
    });
  }
}

/**
 * capitalize first letter of word
 * @param str
 * @returns {string}
 */
export function ucFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
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

export function phonenumber(inputtxt) {
  let phoneno = /^\d{10}$/;
  if (inputtxt.value.match(phoneno)) {
    return true;
  }
  return false;
}

/**
 * Format URL by encoding whitespaces if there are any
 * @param {string} url
 */
export function formatUrl(url) {
  if (!url) return url;
  if (url.indexOf(' ') > -1) {
    url = url.replaceAll(' ', '%20');
  }
  return url;
}

/**
 * Convert string to camel case
 * @param {string} stg
 * @returns {string}
 */
export function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 * Returns whole number
 * @param {string} decimal
 * @param {int} fraction
 * @returns {string}
 */
export function customFormatDecimal(decimal, fraction = 0) {
  return Math.floor(decimal) == decimal
    ? Math.floor(decimal).toFixed(fraction)
    : decimal;
}
