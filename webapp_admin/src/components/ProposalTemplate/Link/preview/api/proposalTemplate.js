import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Create proposal template
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createOrUpdate(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/proposal-template`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get proposal template shortlisted projects
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getProposalTemplateWithShortlistedProjects(
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/proposal-template/${data.proposal_template_id}/shortlisted_project`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get proposal template shortlisted properties
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getProposalTemplatetWithShortlistedProperties(
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/proposal-template/${data.proposal_template_id}/shortlisted_project`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
