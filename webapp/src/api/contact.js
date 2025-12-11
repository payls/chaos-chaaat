import { h } from '../helpers';
import Axios from 'axios';
import { config } from '../configs/config';

/**
 * Get contact with shortlisted properties by permalink
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getContactWithShortlistedProperties(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/${data.permalink}/shortlisted_property`,
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
 * Get contact with shortlisted projects by permalink
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getContactWithShortlistedProjects(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/${data.permalink}/shortlisted_project`,
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
 * Update contact with shortlisted projects by permalink - tag opened
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function setOpenByContact(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/${data.permalink}/open`,
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
 * Get Agency User - SLIM
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAgencyUser(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/contact/${data.permalink}/agency-user`,
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
 * Get Shortlisted table list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getShortlistedTableList(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/contact/${data.permalink}/shortlist-table`,
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
 * Get campagin cta button click
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCheckIfBtnClicked(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/web_cta1_confirmed/${data.contact_id}`,
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
 * Get campagin cta
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function clickCTA1(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/contact/cta1`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
