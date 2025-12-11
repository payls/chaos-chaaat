import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Get contact with shortlisted properties by permalink
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getContactWithShortlistedProperties(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/${data.permalink}/shortlisted_property`,
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
 * Get contact with shortlisted projects by permalink
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getContactWithShortlistedProjects(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/${data.permalink}/shortlisted_project`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
