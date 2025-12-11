import localization from '../services/localization';
import countryCodes from '../services/countryCodes';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const findGetParameter = (parameterName) => {
  let result = null,
    tmp = [];

  if (typeof window === 'undefined') {
    return '';
  }

  let items = window.location.search.substr(1).split('&');
  for (let index = 0; index < items.length; index++) {
    tmp = items[index].split('=');
    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
  }
  return result;
};

/**
 * check variable for empty value
 * @param value
 * @returns {boolean}
 */
export function isEmpty(value) {
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
 * compare two values and returns true if match else false
 * @param str1
 * @param str2
 */
export function cmpStr(str1, str2) {
  if (typeof str1 !== typeof undefined && typeof str2 !== typeof undefined) {
    if (String(str1).toLowerCase() === String(str2).toLowerCase()) {
      return true;
    }
  }
  return false;
}

/**
 * translate
 * @param str
 * @param lang
 */
export function translate(str, lang) {
  return localization[lang][str];
}

/**
 * validate name
 * @param str
 * @param lang
 */
export function validateName(input) {
  var pattern = /^[A-Za-z .,()-]+$/;

  return pattern.test(input);
}

/**
 * validate email
 * @param str
 * @param lang
 */
export function validateEmail(email) {
  return /^[^\s@]+(\+[^\s@]+)?@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * validate phone
 * @param str
 * @param lang
 */
export function validatePhone(phone, cc) {
  const c = countryCodes.find((c) => c.dial_code === cc);
  let parsedNumber = parsePhoneNumberFromString(phone, c.code);

  if (
    parsedNumber === undefined ||
    (parsedNumber !== undefined && !parsedNumber.isValid())
  ) {
    return true;
  }

  return false;
}

const h = {
  findGetParameter,
  notEmpty,
  isEmpty,
  cmpStr,
  translate,
  validateName,
  validateEmail,
  validatePhone,
};
export default h;
