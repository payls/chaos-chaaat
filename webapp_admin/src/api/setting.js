import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Create live chat setting
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/live-chat-settings/generate`,
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
 * Retrieve live chat setting
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function get(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/live-chat-settings/${id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Update live chat setting
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function update(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/live-chat-settings/${data.live_chat_settings_id}`,
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
 * Update Salesforce mapping setting
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function saveSFDCMapping(
  live_chat_settings_id,
  data,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/salesforce/field-configuration/${live_chat_settings_id}`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
