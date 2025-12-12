import {h} from '../helpers';
import jwt from 'jsonwebtoken';
import {api} from '../api';
import {routes} from '../configs/routes';

/**
 * redirect user with non-authenticated session to login page
 * @param {string} [redirectDomain] Domain to overwrite default redirect behaviour
 * @param {string} [customMessage] Custom message to show user when redirected to login page
 * @param {boolean} [redirectOnLogin=true] Flag to indicate whether to redirect to previous URL after successful login
 */
export function redirectToLogin(
  redirectDomain,
  customMessage,
  redirectOnLogin,
) {
  redirectOnLogin = h.cmpBool(redirectOnLogin, false) ? false : true;
  let noRedirectFlag = h.general.findGetParameter('no_redirect');
  if (noRedirectFlag && noRedirectFlag == '1') return;
  let redirectRoute = h.general.findGetParameter('redirectRoute');
  let currentPathnameEncoded = encodeURIComponent(window.location.pathname);
  let currentSearchEncoded = encodeURIComponent(window.location.search);
  let redirectTo = `${redirectDomain || ''}/login?`;
  if (redirectOnLogin && !redirectRoute)
    redirectTo = `${redirectTo}&redirect_route=${currentPathnameEncoded}&redirect_search=${currentSearchEncoded}&`;
  if (customMessage)
    redirectTo = `${redirectTo}error_message=${encodeURIComponent(
      customMessage,
    )}&`;
  redirectTo = `${redirectTo}no_redirect=${encodeURIComponent(
    redirectOnLogin ? 0 : 1,
  )}&`;
  window.location.href = redirectTo;
}

/**
 * Verifies if user's session token is still valid with server side
 * @param {string} [redirectUrlIfValid]
 * @returns {Promise<void>}
 */
export async function verifySessionTokenValidity(redirectUrlIfValid) {
  if (h.auth.isAuthenticated()) {
    const apiRes = await api.auth.verifySessionToken({
      access_token: h.cookie.getAccessToken(),
    });
    if (h.cmpStr(apiRes.status, 'ok')) {
      const accessToken = apiRes.data.access_token;
      h.cookie.setAccessToken(accessToken);
      if (redirectUrlIfValid) window.location.href = redirectUrlIfValid;
    } else {
      h.general.alert('error', {
        message: 'Login token is invalid or has expired. Please login again.',
      });
      h.cookie.deleteAccessToken();
      window.location.href = h.getRoute(routes.login);
    }
  }
}

/**
 * get user information from jwt
 * @returns {{}}
 */
export function getUserInfo() {
  const decoded = jwt.decode(h.cookie.getAccessToken());
  return decoded;
}

/**
 * checks if user is authenticated by checking for access token in cookie
 * @returns {boolean}
 */
export function isAuthenticated() {
  const accessToken = h.cookie.getAccessToken();
  if (accessToken && accessToken !== '') {
    return true;
  } else {
    return false;
  }
}

/**
 * Determines if user is logged in, and if not, redirects user to login page
 */
export function isLoggedInElseRedirect() {
  if (!this.isAuthenticated()) {
    this.redirectToLogin(
      null,
      'Sorry, you will need to login first to access this page',
    );
  }
}
