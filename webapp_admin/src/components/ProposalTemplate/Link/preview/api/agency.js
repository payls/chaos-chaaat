import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get custom properties that belong to agency
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCustomProperties(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/custom-properties`,
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
export async function updateAgencyProfile(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function findById(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_id}`,
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
