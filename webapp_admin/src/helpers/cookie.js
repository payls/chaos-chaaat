import { getEnv } from '../helpers/general';
import { h } from '../helpers';

export const cookieAccessToken = 'AlphaTango';

export function cookiePrefix() {
  return 'P2CI5NDUUOP88ON9LFW2_' + getEnv() + '_pavewebadmin_';
}

/**
 * get all cookies and set into an array
 * @returns {{}}
 */
export function getCookies() {
  const pairs = document.cookie.split(';');
  let cookies = {};
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    cookies[pair[0].trim()] = unescape(pair[1]);
  }
  return cookies;
}

/**
 * store a cookie using key and value
 * @param {string} key
 * @param {string} value
 */
export function setCookie(key, value) {
  const now = new Date();
  const time = now.getTime();
  const expireTime = time + 2147483647; //Set maximum time
  now.setTime(expireTime);

  h.cookie.deleteCookie(key);
  document.cookie =
    h.cookie.cookiePrefix() +
    key +
    '=' +
    value +
    ';expires=' +
    now.toUTCString() +
    ' path=/';
}

/**
 * get cookie value by key
 * @param {string} key
 * @returns {string}
 */
export function getCookie(key) {
  const cookies = h.cookie.getCookies();
  const cookieKey = h.cookie.cookiePrefix() + key;
  const accessToken = cookies[cookieKey] ? cookies[cookieKey] : '';
  return accessToken;
}

/**
 * delete a cookie by key
 * @param {string} key
 */
export function deleteCookie(key) {
  document.cookie =
    h.cookie.cookiePrefix() +
    key +
    '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
}

/**
 * store access token
 * @param accessToken
 */
export function setAccessToken(accessToken) {
  h.cookie.deleteAccessToken();
  h.cookie.setCookie(h.cookie.cookieAccessToken, accessToken);
}

/**
 * delete access token
 */
export function deleteAccessToken() {
  h.cookie.deleteCookie(h.cookie.cookieAccessToken);
  h.sentry.clearUser();
}

/**
 * get access token
 * @returns {string}
 */
export function getAccessToken() {
  return h.cookie.getCookie(h.cookie.cookieAccessToken);
}
