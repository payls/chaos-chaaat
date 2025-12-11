import Axios from 'axios';
import {h} from './index';

/**
 * Send form data to Hubspot form
 * Reference: https://legacydocs.hubspot.com/docs/methods/forms/submit_form
 * @param {string} api_form_submission_url
 * @param {string} portal_id
 * @param {string} form_id
 * @param {object} data
 * @returns {Promise<void>}
 */
export async function sendToHubspotForm(
  api_form_submission_url,
  portal_id,
  form_id,
  data,
) {
  data = JSON.stringify(data);
  const response = await Axios({
    url: `${api_form_submission_url}/${portal_id}/${form_id}`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, false);
}
