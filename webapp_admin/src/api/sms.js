import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Validate agency sms connected mobile number
 * If valid it will add the number to agency connection
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function validateAndAddConnection(data, showMessage) {
  const connectionData = JSON.stringify({
    uri: `sms://${data.mobile_number}@twilio.com`,
    name: `${data.mobile_number}_sms`,
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
 * Get all agency's batch records
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getRecords(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/sms-message-tracker-aggregated`,
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
 * Get all campaign records
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCampaignRecipientRecords(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/sms-message-tracker`,
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
    url: `${config.apiUrl}/v1/staff/sms-message-tracker/thread`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
