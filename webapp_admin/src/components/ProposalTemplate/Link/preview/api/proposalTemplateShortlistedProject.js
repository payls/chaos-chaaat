import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

// /**
//  * Update shortlisted project bookmark
//  * @param {object} [data]
//  * @param {boolean} [showMessage=true]
//  * @returns {Promise<{data: {}, status: string}>}
//  */
// export async function updateShortlistedProjectBookmark(data, showMessage) {
//   const response = await Axios({
//     url: `${config.apiUrl}/v1/shortlisted-project/${data.shortlisted_project_id}/bookmark`,
//     method: 'put',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     data,
//   });
//   return h.api.handleApiResponse(response, showMessage);
// }

// /**
//  * Enquire about shortlisted project
//  * @param {object} [data]
//  * @param {boolean} [showMessage=true]
//  * @returns {Promise<{data: {}, status: string}>}
//  */
// export async function enquireShortlistedProject(data, showMessage) {
//   const response = await Axios({
//     url: `${config.apiUrl}/v1/shortlisted-project/${data.shortlisted_project_id}/enquire`,
//     method: 'put',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     data,
//   });
//   return h.api.handleApiResponse(response, showMessage);
// }

/**
 * Get Shortlisted Project Settings
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getShortlistedProjectSettings(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-project-proposal-template/${data.shortlisted_project_proposal_template_fk}/setting`,
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
 * Save Shortlisted Project Settings
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function saveShortlistedProjectSettings(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/shortlisted-project-proposal-template/${data.shortlisted_project_id}/setting`,
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
 * Get Shortlisted Project Properties Proposal Template
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getShortlistedProjectPropertyProposalTemplate(
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/shortlisted-project-proposal-template/${data.shortlisted_project_proposal_template_id}/properties`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
