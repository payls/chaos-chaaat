import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Api to send custom template and flow message for approval
 * @param {object} [data]
 * @param {boolean} [showMessage=false]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendWorkflowForApproval(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/workflow/request-approval`,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
