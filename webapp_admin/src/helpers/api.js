import { h } from './index';
import * as he from 'he';
import * as cheerio from 'cheerio';

/**
 * Handles api response
 * @param {object} response
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function handleApiResponse(response, showMessage = true) {
  const apiRes = { status: '', data: {} };
  if (!response) return apiRes;
  apiRes.data = response.data || {};
  if (h.notEmpty(response) && h.cmpStr(response.status, 200)) {
    apiRes.status = 'ok';
    if (h.cmpBool(showMessage, true) && h.notEmpty(response.data.message))
      h.general.alert('success', { message: apiRes.data.message });
  } else if (h.notEmpty(response) && h.cmpStr(response.status, 403)) {
    if (!h.cmpStr(window.location.pathname, '/login')) {
      h.auth.redirectToLogin(null, apiRes.data.message);
    }
  } else {
    apiRes.status = 'error';
    if (showMessage) h.general.alert('error', { message: apiRes.data.message });
  }
  return apiRes;
}

/**
 * escapeString
 * @param {*} input string
 * @returns escaped / encoded string
 */
function escapeString(input) {
  if (typeof input === 'string') {
    const encoded =  he.encode(input, {
      'useNamedReferences': true
    });

    return encoded;
  }
  return input;
}

/**
 * encodeObject - A recursive function that escapes string value.
 *  For object type, will escape field values
 *  For Array type, will run this function for each item
 *  For null and undefined types and others, will return the original value
 * @param {*} object any
 * @returns any
 */
export function encodeObject(object) {
  const type_of = typeof object;
  if (typeof object === 'string') {
    const unescapedVal = sanitizeMaliciousAttributes(object);
    return escapeString(unescapedVal);
  }

  if (typeof object === 'number') {
    return object; // Numbers are fine, no escaping needed
  }

  if (Array.isArray(object)) {
    return object.map(item => encodeObject(item)); // Recursively process arrays
  }

  if (typeof object === 'object' && object !== null) {
    if (object instanceof Date) {
      return object;
    }
    const newObj = {};
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        newObj[key] = encodeObject(object[key]); // Recursively process object keys
      }
    }
    return newObj;
  }

  if (typeof object === 'number' || typeof object === 'boolean') {
    // Handle primitive types
    return object;
  }
  
  if (object === null || object === undefined) {
    // Handle null and undefined
    return object;
  }


  return object; // Return as-is for null/undefined or unrecognized types
}

/**
 * Sanitizes a given HTML message by removing malicious attributes from all elements
 * and preserving certain attributes like class, classname, and style.
 *
 * @param {string} message - The HTML message content to sanitize.
 * @returns {string} - The sanitized HTML message content with malicious attributes removed.
 */
export function sanitizeMaliciousAttributes(message) {
  const $ = cheerio.load(message);
  $('*').each((_, element) => {
    const attribs = element.attribs;
    const className = $(element).attr('classname');
    const c = $(element).attr('class');
    const style = $(element).attr('style');
    const src = $(element).attr('src');

    for (const attr in attribs) {
      $(element).removeAttr(attr);

      if (className) {
        $(element).attr('classname', className);
      }

      if (style) {
        $(element).attr('style', style);
      }

      if (c) {
        $(element).attr('class', c);
      }

      if(src) {
        $(element).attr('src', src);
      }
    }
  });

  let updatedContent = $('body').html().trim();

  updatedContent = updatedContent.replace(/classname=/g, 'className=');

  return updatedContent;
};
