import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Send WhatsApp Image Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/live-chat`,
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
 * Get Cities from Salesforce
 */
export async function getCities(id, lang, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/live-chat/cities/${id}/${lang}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}
