import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Validate number is whatsapp enabled
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function validateNumber(agent, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency-user/${agent}/is_whatsapp_number`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: {},
  });
  return h.api.handleApiResponse(response, showMessage);
}
