import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Upload
 * @param {object} data
 * @param {string} upload_type
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function upload(data, upload_type, showMessage) {
  const query = {
    url: `${config.apiUrl}/v1/staff/upload/${upload_type}`,
    method: 'post',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
    },
    data,
  };
  try {
    const response = await Axios(query);
    return h.api.handleApiResponse(response, showMessage);
  } catch (err) {
    return h.api.handleApiResponse(undefined, showMessage);
  }
}
