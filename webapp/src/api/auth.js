import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Register user
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function register(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/register`,
    withCredentials: true,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-csrf-token': h.cookie.getCookie('_csrf'),
    },
    data,
  });

  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get user information by user email verification token
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getUserByEmailVerificationToken(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/email/verify/${data.token}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Confirm login by email
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function verifyUserEmail(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/email/verify`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Login user by email and password
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function loginEmail(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/login/email`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return await h.api.handleApiResponse(response, showMessage);
}

/**
 * Login user by google signin
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function loginGoogle(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/login/google`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return await h.api.handleApiResponse(response, showMessage);
}

/**
 * Login user by facebook signin
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function loginFacebook(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/login/facebook`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return await h.api.handleApiResponse(response, showMessage);
}

/**
 * Logout user session
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function logout(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/logout`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return await h.api.handleApiResponse(response, showMessage);
}

/**
 * Verify user session token
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function verifySessionToken(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/session/verify`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * User forgot password
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function forgotPassword(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/password/forgot`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Verify reset password token
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getUserByResetPasswordToken(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/password/reset/${data.token}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Reset password
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function resetPassword(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/auth/password/reset`,
    withCredentials: true,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-csrf-token': h.cookie.getCookie('_csrf'),
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Check email
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function checkUserEmail(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/check-email?email=${data.email}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function registerCompanyWebsite(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency/company-website`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function registerIndustry(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency/industry`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function registerRealEstateType(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency/real-estate-type`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function registerCompanyName(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency/company-name`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function registerCompany(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency/company`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function registerCompanySize(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency/company-size`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getCsrfToken() {
  const response = await Axios({
    url: `${config.apiUrl}/v1/services/csrf`,
    withCredentials: true,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  h.api.handleApiResponse(response).then((res) => {
    if (res && h.cmpStr(res.status, 'ok')) {
      h.cookie.setCookie('_csrf', res.data.token);
    }
  });
}

export async function resendEmail(email) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency/user/resend-verification/${email}`,
    withCredentials: true,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  h.api.handleApiResponse(response).then((res) => {
    if (res && h.cmpStr(res.status, 'ok')) {
      h.cookie.setCookie('_csrf', res.data.token);
    }
  });
}
