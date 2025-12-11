import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Updates the OAuth timeslot settings for an agency.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} params.source - The OAuth provider source (e.g., 'google', 'microsoft').
 * @param {number} params.agencyId - The unique identifier for the agency.
 * @param {Object} params.crm_timeslot_settings - The settings for the CRM timeslot.
 * @param {boolean} [showMessage=false] - Whether to display a success or error message.
 * @returns {Promise<Object>} - The API response.
 */
export async function updateAgencyOauthTimeslot({ source, agencyId, crm_timeslot_settings }, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/agency/${agencyId}/agency-oauth/${source}/timeslot`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: {
      crm_timeslot_settings,
    },
    DONT_SHOW_ERROR: !showMessage
  });

  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Retrieves the OAuth timeslot settings for an agency.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} params.source - The OAuth provider source (e.g., 'google', 'microsoft').
 * @param {number} params.agencyId - The unique identifier for the agency.
 * @param {boolean} [showMessage=false] - Whether to display a success or error message.
 * @returns {Promise<Object>} - The API response.
 */
export async function getAgencyOauthTimeslot({ source, agencyId }, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/agency/${agencyId}/agency-oauth/${source}/timeslot`,
    method: 'get',
    DONT_SHOW_ERROR: !showMessage
  });

  return h.api.handleApiResponse(response, showMessage);
}
