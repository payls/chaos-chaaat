import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get all contact views
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAllContactViews(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/get-contact-views`,
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
 * Save contact view
 * @param data
 * @param showMessage
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function saveContactView(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/save-contact-view`,
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
 * Delete contact view
 * @param data
 * @param showMessage
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteContactView(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/delete-contact-view`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
