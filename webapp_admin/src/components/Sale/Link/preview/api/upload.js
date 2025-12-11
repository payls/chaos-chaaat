import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Upload
 * @param {object} data
 * @param {string} upload_type
 * @param {string} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function upload(data, upload_type, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/upload/${upload_type}`,
    method: 'post',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
