import { h } from '../helpers';
import jwt from 'jsonwebtoken';
import { api } from '../api';
import { routes } from '../configs/routes';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
  redirectOnLogin = !h.cmpBool(redirectOnLogin, false);
  let noRedirectFlag = h.general.findGetParameter('no_redirect');
  if (noRedirectFlag && noRedirectFlag === '1') return;
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
  return jwt.decode(h.cookie.getAccessToken());
}

/**
 * checks if user is authenticated by checking for access token in cookie
 * @returns {boolean}
 */
export function isAuthenticated() {
  const accessToken = h.cookie.getAccessToken();
  return accessToken && accessToken !== '';
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

export function withAuth(WrappedComponent) {
  const Wrapper = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      const isAuthenticated = h.auth.isAuthenticated();

      if (isAuthenticated) {
        setLoading(false);
        router.replace(h.getRoute(routes.dashboard.leads.all_leads));
        return;
      }

      setLoading(false);
      h.auth.redirectToLogin();
    }, []);

    return loading ? (
      <WrappedComponent {...props} />
    ) : (
      <div
        style={{
          content: '',
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            marginLeft: -30,
            marginTop: -80,
            fontSize: '30px',
            fontWeight: 'bold',
          }}
        >
          <div className="sk-cube-grid">
            <div className="sk-cube sk-cube1"></div>
            <div className="sk-cube sk-cube2"></div>
            <div className="sk-cube sk-cube3"></div>
            <div className="sk-cube sk-cube4"></div>
            <div className="sk-cube sk-cube5"></div>
            <div className="sk-cube sk-cube6"></div>
            <div className="sk-cube sk-cube7"></div>
            <div className="sk-cube sk-cube8"></div>
            <div className="sk-cube sk-cube9"></div>
          </div>
        </div>
      </div>
    );
  };

  return Wrapper;
}

export async function handleLogout() {
  h.general.alert('info', {
    message: `Logging out...`,
    autoCloseInSecs: 10,
  });
  await api.auth.logout({ access_token: h.cookie.getAccessToken() }, false);
  h.cookie.deleteAccessToken();
  window.location.href = h.getRoute(routes.home);
}
