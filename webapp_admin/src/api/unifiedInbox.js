import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get whatsapp tracker details
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getMessages(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/unified-inbox`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get whatsapp tracker details
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getChatMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/unified-inbox/${data.chat_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
