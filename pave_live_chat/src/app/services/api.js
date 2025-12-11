import Axios from 'axios';
import { config } from '../services/config';
import h from './helpers';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'x-component-secret': '5rO8pBwlI5ezBACN',
  // Origin: config.appUrl,
};
/**
 * Start Chat Session Session
 */
async function startSession(data) {
  console.log(headers);
  const response = await Axios({
    url: `${config.apiUrl}/v1/live-chat/start-session`,
    method: 'post',
    headers,
    data,
  });
  return handleApiResponse(response);
}

/**
 * Start Chat Session Session
 */
async function send(data) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/live-chat/message/webhook`,
    method: 'post',
    headers,
    data,
  });
  return handleApiResponse(response);
}

/**
 * Get Settings
 */
async function getSettings(id) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/live-chat/settings/${id}`,
    method: 'get',
    headers,
  });
  return handleApiResponse(response);
}

/**
 * Get Chat
 */
async function getChat(params) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/live-chat`,
    method: 'get',
    headers,
    params,
  });
  return handleApiResponse(response);
}

/**
 * Get Products
 */
async function getProducts(id) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/live-chat/settings/${id}`,
    method: 'get',
    headers,
  });
  return handleApiResponse(response);
}

/**
 * Get Cities
 */
async function getCities(id, lang) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/live-chat/cities/${id}/${lang}`,
    method: 'get',
    headers,
  });
  return handleApiResponse(response);
}

/**
 * Handles api response
 * @param {object} response
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
async function handleApiResponse(response) {
  const apiRes = { status: '', data: {} };
  if (!response) return apiRes;
  apiRes.data = response.data || {};
  if (h.notEmpty(response) && h.cmpStr(response.status, 200)) {
    apiRes.status = 'ok';
  } else if (h.notEmpty(response) && h.cmpStr(response.status, 403)) {
    alert('Something went wrong');
  } else {
    apiRes.status = 'error';
  }
  return apiRes;
}

const api = {
  startSession,
  handleApiResponse,
  send,
  getSettings,
  getChat,
  getCities,
};
export default api;
