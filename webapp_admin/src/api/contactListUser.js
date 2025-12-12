import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Proess contact list users for csv upload
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createListContacts(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/create-list-contacts`,
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
 * Delete list contact
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function removeFromContactList(
  contact_list_user_id,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-list-user/${contact_list_user_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Proess contact list users from existing contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function processListUsersFromContacts(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/create-list-contacts-from-existing`,
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
 * Pull contacts from hubspot
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function hubspotContactList(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/hubspot-contact-list`,
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
 * Proess contact list users from hubspot contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createListContactsFromHubSpot(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/create-list-contacts-from-hubspot`,
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
 * Process fetching of hubspot contact list members
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function fetchListMembers(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-list/hubspot/members`,
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
 * Process importing of contacts from selected hubspot contact list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function importHubSpotContactList(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-list/hubspot`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
