import { config } from '../configs/config';
import { routes } from '../configs/routes';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get list of agency users that belongs to agency
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAgencyUsers(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency-user`,
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
 * Get current user's agency information
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCurrentUserAgency(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency-user/current-user`,
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
 * Get current user's agency information - no redirect
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCurrentUserAgencyNoRedirect(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency-user/current-user`,
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
 * Update agency user's profile
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateAgencyUserProfile(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency-user/user-profile`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get agency user details by owner full name
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAgencyUserByUserFullName(contact_owner, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency-user/search-by-full-name/${contact_owner}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}
