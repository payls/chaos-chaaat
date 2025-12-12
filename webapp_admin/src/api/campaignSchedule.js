import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Campaign schedule list
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAll(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule`,
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
 * Campaign recipient list
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function recipients(id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule/${id}/recipients`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Campaign actions
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function action(id, action, data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule/${id}/${action}`,
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
 * Campaign creation
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createCampaign(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule`,
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
 * Campaign draft creation
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftCampaign(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getCampaignDraft(campaign_draft_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft/${campaign_draft_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Campaign draft update
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftCampaignUpdate(
  campaign_draft_id,
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft/${campaign_draft_id}`,
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
 * Campaign draft for review
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftCampaignReview(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft-review`,
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
 * Campaign draft update
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftCampaignUpdateReview(
  campaign_draft_id,
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft-review/${campaign_draft_id}`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getAllCampaignDrafts(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft-list`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteDraft(campaign_draft_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-draft/${campaign_draft_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Campaign draft creation
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftLineCampaign(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-campaign-schedule-draft`,
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
 * Line Campaign draft update
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftLineCampaignUpdate(
  campaign_draft_id,
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft/line/${campaign_draft_id}`,
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
 * Line Campaign draft for review
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftLineCampaignReview(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft-review/line`,
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
 * Line Campaign draft update
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function draftLineCampaignUpdateReview(
  campaign_draft_id,
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule-draft-review/line/${campaign_draft_id}`,
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
 * Line Campaign creation
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createLineCampaign(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/campaign-schedule/line`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
