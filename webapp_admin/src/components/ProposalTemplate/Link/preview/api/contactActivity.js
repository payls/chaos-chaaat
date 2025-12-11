import {h} from '../helpers';
import Axios from 'axios';
import {config} from '../configs/config';

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
