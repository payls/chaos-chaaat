import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get all agency's batch records
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getActiveKey(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/appsync/active-key`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
