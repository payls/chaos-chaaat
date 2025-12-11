import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Check if a user has certain roles of access
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function hasAccess(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/user-management/check-access`,
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
 * Get all the users in an agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/user-management/find-all`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Invite a user to the agency
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function inviteUser(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/user-management/invite`,
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
 * Delete a user
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteUser(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/user-management/${data.user_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Reinvite pending users to agency
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function resendAccountActivationEmail(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/user-management/reinvite`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
