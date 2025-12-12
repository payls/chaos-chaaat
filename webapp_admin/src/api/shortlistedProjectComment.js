import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get list of shortlisted project comments
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getComments(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-project/comments`,
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
 * Get list of shortlisted project comment by comment ID
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCommentByCommentId(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-project/comment/${data.comment_id}`,
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
 * Create a new comment from a agency user
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createComment(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-project/${data.shortlisted_project_id}/comment`,
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
 * Delete a comment by comment ID
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteComment(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-project/${data.shortlisted_project_comment_id}/delete-comment`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

// ========================= copied from webapp ========================= //

/**
 * Get shortlisted project comments
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-project/${data.shortlisted_project_id}/comment`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
