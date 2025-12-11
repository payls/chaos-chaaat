import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * get line convo
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getThread(data, showMessage, cancelToken) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
    ...(cancelToken ?? {}),
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Send Messenger Text Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger`,
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
 * Send Messenger Image Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendImgMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger/img`,
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
 * Send Messenger Video Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendVideoMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger/video`,
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
 * Send Messenger File Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendFileMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger/file`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
