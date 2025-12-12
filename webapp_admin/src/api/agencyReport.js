import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get reports that belongs to agency
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/report`,
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
 * Create agency report
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/report`,
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
 * Delete agency report
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteReport(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/report?agency_report_id=${data.agency_report_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
