const Sentry = require('@sentry/node');

/**
 * Generic error catch function
 * @param {Promise} p
 * @returns {Promise<[Error|null,*]>}
 */
module.exports.catchError = async (p) => {
  try {
    const result = await Promise.resolve(p);
    return [null, result];
  } catch (err) {
    Sentry.captureException(err);
    return [err, null];
  }
};
