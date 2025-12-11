import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get list of shortlisted property comments
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getComments(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-property/comments`,
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
 * Get list of shortlisted property comment by comment ID
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCommentByCommentId(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-property/comment/${data.comment_id}`,
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
    url: `${config.apiUrl}/v1/staff/shortlisted-property/${data.shortlisted_property_id}/comment`,
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
    url: `${config.apiUrl}/v1/staff/shortlisted-property/${data.shortlisted_property_comment_id}/delete-comment`,
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
 * Get shortlisted property comments
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-property/${data.shortlisted_property_id}/comment`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
