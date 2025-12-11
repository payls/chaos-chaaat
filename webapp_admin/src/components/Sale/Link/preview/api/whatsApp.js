import { config } from '../../../../../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get all agency's batch records
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getRecords(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker-aggregated`,
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
 * Validate whatsapp mobile number
 * If valid it will add the number to agency connection
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function validateAndAddConnection(data, showMessage) {
  const environment = h.cmpStr(config.env, 'production')
    ? 'whatsappofficial'
    : 'whatsappsandbox';
  const connectionData = JSON.stringify({
    uri: `${environment}://${data.mobile_number}@whatsapp.com`,
    name: `${data.mobile_number}`,
  });
  const connectionConfig = {
    method: 'post',
    url: 'https://apiv2.unificationengine.com/v2/connection/add',
    headers: {
      Authorization: `Basic ${data.credentials}`,
      'Content-Type': 'application/json',
    },
    data: connectionData,
  };
  const addConnectionResponse = await Axios(connectionConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });
  return h.api.handleApiResponse(addConnectionResponse, showMessage);
}

/**
 * Validate number is whatsapp enabled
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function validateNumber(agent, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/agency-user/${agent}/is_whatsapp_number`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: {},
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get whatsapp tracker details
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getTrackerDetails(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker`,
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
 * get whatsapp convo
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getThread(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat`,
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
 * Send WhatsApp Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat`,
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
 * Retrieve WhatsApp Image Reply
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function retrieveImage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/${data.agency_id}/${data.message_id}/${data.media_id}/retrieve-image`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getAvailableTemplates(waba_id, credentials, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/${waba_id}/${credentials}/list-templates`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getTemplates(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/${id}/list-db-agency-templates`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function syncTemplates(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/${id}/sync-agency-templates`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}
