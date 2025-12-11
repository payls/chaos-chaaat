import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Update shortlisted project rating
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateShortlistedProjectRating(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-project/${data.shortlisted_project_id}/project-rating`,
    withCredentials: true,
    method: 'put',
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
 * Update shortlisted project bookmark
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateShortlistedProjectBookmark(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-project/${data.shortlisted_project_id}/bookmark`,
    withCredentials: true,
    method: 'put',
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
 * Enquire about shortlisted project
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function enquireShortlistedProject(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-project/${data.shortlisted_project_id}/enquire`,
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
 * Get Shortlisted Project Settings
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getShortlistedProjectSettings(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-project/${data.shortlisted_project_id}/setting`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
