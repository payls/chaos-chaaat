import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Create shortlisted property comment
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-property/comment/${data.shortlisted_property_comment_id}/react`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
