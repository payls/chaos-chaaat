import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get projects
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function contentFindAll(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/content/project`,
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
 * Get projects
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/project`,
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
 * Get projects
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getTableList(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/project-list`,
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
 * Update project by project_id
 * @param {string} project_id
 * @param {number} step
 * @param {object} data
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function update(project_id, step, data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/project/${project_id}/form/${step}`,
    method: 'put',
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
 * Generate project ID
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function generateId(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/project/generate-id`,
    method: 'post',
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
 * Get project by project ID and step
 * @param {string} projectId
 * @param {number} step
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getProjectByStep(projectId, step, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/project/${projectId}/step/${step}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get project properties by project id
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function contentFindAllProperties(
  projectId,
  data,
  params,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/content/project/${projectId}/property?slim=true`,
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
 * Get project by project id
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getProjectV2(projectId, data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/project/${projectId}`,
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
