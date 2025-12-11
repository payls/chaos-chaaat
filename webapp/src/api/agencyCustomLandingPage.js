import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Get landing pages by slug
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getBySlug(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/custom-landing-page/slug/${data.slug}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}
