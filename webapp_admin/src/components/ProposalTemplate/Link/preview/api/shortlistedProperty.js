import {h} from '../helpers';
import Axios from 'axios';
import {config} from '../configs/config';

/**
 * Update shortlisted property rating
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateShortlistedPropertyRating(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-property/${data.shortlisted_property_id}/property-rating`,
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
 * Update shortlisted property bookmark
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateShortlistedPropertyBookmark(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-property/${data.shortlisted_property_id}/bookmark`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
