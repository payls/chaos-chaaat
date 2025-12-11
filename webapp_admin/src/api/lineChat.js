import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * get line convo
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getThread(data, showMessage, cancelToken) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-chat`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
    ...(cancelToken ?? {}),
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Send Line Text Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-chat`,
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
 * Send Line Image Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendImgMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-chat/img`,
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
 * Send Line Video Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendVideoMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-chat/video`,
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
 * Get Line Channel list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getChannelList(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_id}/line/channel-list`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get Line Template list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function listTemplates(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-template/list`,
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
 * Line Create Template Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createTemplate(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-template/create`,
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
 * Line Update Template Message
 * @param {string} [line_template_id]
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateTemplate(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-template/update`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getTemplate(line_template_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-template/${line_template_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteTemplate(line_template_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-template/${line_template_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getChannelBasedOnChannelID(line_channel_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/line-channel/channel-id/${line_channel_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getChannelBasedOnConfigID(
  agency_channel_config_id,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/line-channel/config-id/${agency_channel_config_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function listPublishedTemplates(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-template/${data.channel}/published`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get Contact Followed Line Channel list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getContactFollowedChannelList(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_id}/line/contact-channel-list/${data.contact_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Send Line Template Reply Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendTemplateReplyMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-chat/template`,
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
 * Get all agency's batch records
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getRecords(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-message-tracker-aggregated`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function sendOptInMessage(agency_channel_config_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-chat/send-opt-in-message`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: { agency_channel_config_id: agency_channel_config_id },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function createNewLineChannel(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/line-channel`,
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
 * Line Campaign Hiding
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function hideCampaign(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-message-tracker/hide-campaign`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
