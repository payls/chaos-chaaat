import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get email notifcation settings
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getSettings(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/email-notification-setting`,
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
 * Save email notifcation settings
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function save(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/email-notification-setting`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
