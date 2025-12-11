import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get contact activities that belongs to agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getActivityStreams(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-activity?page=${data.page}`,
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
 *
 * @param {object} data
 * @param
 * @param {object} showMessage
 * @returns
 */
export async function getContactActivityOverview(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-activity/overview?contact_id=${data.contact_id}`,
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
 *
 * @param {object} data
 * @param
 * @param {object} showMessage
 * @returns
 */
export async function getContactActivities(
  data,
  params,
  showMessage,
  cancelToken = null,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-activity/overview?contact_id=${data.contact_id}&hasAllActivities=true`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
    ...(cancelToken ?? {}),
  });
  return h.api.handleApiResponse(response, showMessage);
}

//=================== copied from webapp =======================//
/**
 * Create contact activity record
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/activity`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
