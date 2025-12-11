import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get contact by contact id
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getUniquePermaLink(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link/get-unique-permalink`,
    method: 'get',
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
 * Get contacts links list
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link`,
    method: 'get',
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
 * Delete contact Link
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteContact(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link?contact_id=${data.contact_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Create contacts Link
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link`,
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
 * Update contacts Link
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function update(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link`,
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
 * Save Permalink Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function savePermalinkMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link/permalink-message`,
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
 * Save email preferences
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function saveEmailPreferences(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link/email-preference`,
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
 * Get email message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function InviteEmail(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link/get-email-message`,
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
 * Get generic email message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function genericInviteEmail(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/link/get-generic-email-message`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}
