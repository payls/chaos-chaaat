import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

export async function getMessengerAccessToken(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger/generate/access-token`,
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
 * Get Messenger Channel list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getChannelList(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_id}/messenger/channel-list`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function webhookSubscribe(agency_channel_config_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger/subscribe-to-webhook`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: { agency_channel_config_id: agency_channel_config_id },
  });
  return h.api.handleApiResponse(response, showMessage);
}
