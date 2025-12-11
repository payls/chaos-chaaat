import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get dashboard statistics
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getStatistics(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/stats`,
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
 * Get dashboard proposal sent
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getProposalSent(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/proposal-sent`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get dashboard proposal opened
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getProposalOpened(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/proposal-opened`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get dashboard engagement scores
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getEngagementScores(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/engagement-score`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get dashboard sent method scores
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getSentMethod(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/sent-method`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get dashboard device type scores
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getDeviceType(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/device-type`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get dashboard device type scores
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getActivityLocation(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/activity-location`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get dashboard most engaged contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getMostEngagedContacts(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/dashboard/most-engaged-contacts`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get messaging stats
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getMessagingStats(agencyId, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${agencyId}/messaging-stat`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}
