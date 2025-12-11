import * as Sentry from '@sentry/nextjs';

/**
 * Handle Capturing of error
 *
 * @function
 * @name captureException
 * @kind function
 * @param {any} error
 * @returns {void}
 * @exports
 */
export async function captureException(error) {
  await Sentry.captureException(error);
}

/**
 * Set data to sentry loggin
 *
 * @function
 * @name setUser
 * @kind function
 * @param {any} data
 * @returns {void}
 * @exports
 */
export async function setUser(data) {
  await Sentry.setUser(data);
}

/**
 * Cleat sentry user
 *
 * @async
 * @function
 * @name clearUser
 * @kind function
 * @returns {Promise<void>}
 * @exports
 */
export async function clearUser() {
  await Sentry.setUser(null);
}
