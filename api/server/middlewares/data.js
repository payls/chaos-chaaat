const Sentry = require('@sentry/node');
const htmlEncode = require('he');
const h = require('../helpers');
const allowedTags = process.env.HTML_ALLOWED_TAGS;
const dataMiddleware = module.exports;

/**
 * Description
 * Middleware for sanitizing all request data
 * This includes body, params, and query strings
 * @name sanitizeRequest
 * @param {object} request request data from endpoints
 * @param {object} reply reply data for endpoint
 */
dataMiddleware.sanitizeRequest = async (request, reply) => {
  const { params, query, body } = request;
  request.log.info({
    message: 'RUNNING REQUEST SANITAZTION',
  });
  try {
    if (h.notEmpty(params)) {
      const encodedParams = sanitizeRequestData(params);
      // request.log.info({ message: 'encoded params', data: encodedParams });
      const sanitizedParams = parseValidEntities(encodedParams, allowedTags);
      const finalSanitizedParams = removeExcessNBSP(sanitizedParams);
      request.params = finalSanitizedParams;
    }

    if (h.notEmpty(query)) {
      const encodedQuery = sanitizeRequestData(query);
      // request.log.info({ message: 'encoded query string', data: encodedQuery });
      const sanitizedQuery = parseValidEntities(encodedQuery, allowedTags);
      const finalSanitizedQuery = removeExcessNBSP(sanitizedQuery);
      request.query = finalSanitizedQuery;
    }

    if (h.notEmpty(body)) {
      const encodedBody = sanitizeRequestData(body);
      // request.log.info({ message: 'encoded body', data: encodedBody });
      const santizedBody = parseValidEntities(encodedBody, allowedTags);
      const finalSanitizedBody = removeExcessNBSP(santizedBody);
      request.body = finalSanitizedBody;
    }
    request.log.info({
      message: 'finalized request data complete',
      data: request,
    });
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      message: 'Something went wrong during sanitazion',
      err: err,
    });
  }
};

// Function to check if data has some escaped entities like &lt;
function isPartiallyEscaped(data) {
  // Escape the data
  const escapedData = htmlEncode.encode(data);

  // Check if original data contains escaped entities like &lt;
  const containsEscapedEntities = /&[a-z]+;/i.test(data);

  // If the data contains escaped entities but does not match fully escaped data
  return containsEscapedEntities && data !== escapedData;
}

/**
 * Description
 * Function to escape all data in the request
 * @function
 * @name sanitizeRequestData
 * @kind function
 * @param {object} data
 * @returns {object} returns the escaped data
 */
function sanitizeRequestData(data) {
  try {
    if (typeof data === 'object' && data !== null) {
      // allow if date
      if (data instanceof Date) {
        return data;
      }

      // map if array
      if (Array.isArray(data)) {
        return data.map(sanitizeRequestData);
      }

      // Recursive if object
      const sanitizedObj = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitizedObj[key] = sanitizeRequestData(data[key]);
        }
      }
      return sanitizedObj;
    } else if (typeof data === 'string' && !isPartiallyEscaped(data)) {
      // Sanitize using he
      return htmlEncode.encode(data);
    } else if (typeof data === 'number' || typeof data === 'boolean') {
      // Handle primitive types
      return data;
    } else if (data === null || data === undefined) {
      // Handle null and undefined
      return data;
    }

    // return unchanged values
    return data;
  } catch (err) {
    throw new Error(`Error in sanitizeRequestData: ${err.message}`);
  }
}

/**
 * Description
 * Function to validate data tp be unescaped
 * @function
 * @name parseValidEntities
 * @kind function
 * @param {object} data data to unescape
 * @param {array} allowedTags list of allowed tags
 * @returns {object} unescaped data
 */
function parseValidEntities(data, allowedTags) {
  try {
    if (typeof data === 'object' && data !== null) {
      // allow if date
      if (data instanceof Date) {
        return data;
      }

      // Map if array
      if (Array.isArray(data)) {
        return data.map((item) => parseValidEntities(item, allowedTags));
      }

      // Recursive if object
      const sanitizedObj = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitizedObj[key] = parseValidEntities(data[key], allowedTags);
        }
      }
      return sanitizedObj;
    } else if (typeof data === 'string') {
      // Sanitize using unescapeAllowedTags
      const unescapedString = unescapeAllowedTags(data, allowedTags);
      return h.whatsapp.sanitizeMaliciousAttributes(unescapedString);
    } else if (typeof data === 'number' || typeof data === 'boolean') {
      // Handle primitive types
      return data;
    } else if (data === null || data === undefined) {
      // Handle null and undefined
      return data;
    }

    // Return unchanged values
    return data;
  } catch (err) {
    throw new Error(`Error in parseValidEntities: ${err.message}`);
  }
}

/**
 * Description
 * Function to unescape string based on the allowed tags
 * @function
 * @name unescapeAllowedTags
 * @kind function
 * @param {string} data string to unescape
 * @param {array} allowedTags allowed html tags
 * @returns {string} unescaped string
 */
function unescapeAllowedTags(data, allowedTags) {
  const allowedTagsArray = allowedTags.split('|');
  try {
    // Convert the allowed tags string into a regex pattern
    // eslint-disable-next-line prettier/prettier
    const openingTagRegex = new RegExp(`<\\s*(${allowedTags})\\s*\\b[^>]*>`, 'gi');
    // eslint-disable-next-line prettier/prettier
    const closingTagRegex = new RegExp(`<\\s*\\/(${allowedTags})\\s*\\b[^>]*>`, 'gi');

    // First, unescape the whole input using he.unescape
    let unescapedInput = htmlEncode.unescape(data).trim(); // Using he for unescaping

    // This line now handles the escaping of tags
    unescapedInput = unescapedInput.replace(/<\/?[^>]+>/g, (match) => {
      const toMatch = match;
      // eslint-disable-next-line prettier/prettier
      const tagData = toMatch.match(/^<\s*\/*([a-zA-Z][\w-]*)\s*\b([^>]*)\s*\/*>$/);

      if (h.notEmpty(tagData)) {
        if (allowedTagsArray.includes(tagData[1])) {
          return toMatch;
        } else {
          return htmlEncode.escape(toMatch);
        }
      } else {
        // If the tag matches the allowed list, leave it unescaped
        if (openingTagRegex.test(toMatch)) {
          return toMatch; // Leave allowed tags unescaped
        } else if (closingTagRegex.test(toMatch)) {
          return toMatch; // Leave allowed tags unescaped
        } else {
          // Otherwise, escape the tag to prevent rendering
          return toMatch.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
      }
    });

    return unescapedInput;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Description
 * Function to remove unhandled &amp;&nbsp;
 * @function
 * @name removeExcessNBSP
 * @kind function
 * @param {any} data
 * @returns {any}
 */
function removeExcessNBSP(data) {
  if (typeof data === 'string') {
    return data.replace(/&amp;&nbsp;/g, ' '); // Replace &amp;&nbsp; with a space
  } else if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(removeExcessNBSP);
    }
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        removeExcessNBSP(value),
      ]),
    );
  }
  return data;
}
