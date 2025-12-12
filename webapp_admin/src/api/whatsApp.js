import { config } from '../configs/config';
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
export async function getThread(data, showMessage, cancelToken) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat`,
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
 * get live chat convo
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getThreadLiveChat(data, showMessage, cancelToken) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/live-chat`,
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
 * get messenger convo
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getThreadMessengerChat(data, showMessage, cancelToken) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/messenger`,
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
 * Retrieve WhatsApp templates
 * @param {string} [waba_id]
 * @param {string} [credentials]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAvailableTemplates(waba_id, credentials, showMessage) {
  const templateListConfig = {
    method: 'get',
    url: `https://template.unificationengine.com/list?access_token=${waba_id}`,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  };
  const templateListResponse = await Axios(templateListConfig)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });
  return h.api.handleApiResponse(templateListResponse, showMessage);
}

/**
 * Retrieve Quick Replies list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getQuickReplies(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/${data.agency_id}/${data.tracker_ref_name}/quick-replies`,
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
 * Retrieve WhatsApp media - image
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function retrieveImage(data, showMessage) {
  const response = await Axios({
    url: `https://apiv2.unificationengine.com/v2/message/retrieve`,
    method: 'post',
    headers: {
      Authorization: `Basic ${data.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: data.params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Retrieve agency available waba credentials
 * @param {object} [agency_id,data]
 * @param {boolean} [showMessage=false]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAgencyWhatsAppConfigurations(agency_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${agency_id}/waba-credentials`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Retrieve selected agency waba credentials
 * @param {object} [agency_id,data]
 * @param {boolean} [showMessage=false]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAgencyWhatsAppSelectedCredentials(
  agency_whatsapp_config_id,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${agency_whatsapp_config_id}/selected-waba-credentials`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * WhatsApp Update
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateById(id, data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker/${id}`,
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
 * WhatsApp Campaign Hiding
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function hideCampaign(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker/hide-campaign`,
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
 * WhatsApp Hidden Campaign Show
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function showHiddenCampaigns(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker/show-hidden-campaign`,
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
 * Download Campaign Reports
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function downloadCampaignReports(tracker_ref_name, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker/download-campaign-reports/${tracker_ref_name}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Download Campaign Manual Reports
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function downloadCampaignManualReports(
  tracker_ref_name,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker/download-campaign-manual-reports/${tracker_ref_name}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function createTemplate(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/create`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function listTemplates(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/list-db-agency-templates`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function searchTemplates(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp/template`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params: data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getTemplateFromDB(waba_template_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/db-template/${waba_template_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteTemplate(waba_template_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/${waba_template_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function updateTemplate(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-template/update`,
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
 * Send WhatsApp Image Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendImgMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/img`,
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
 * Retrieve selected agency waba credentials by sender number
 * @param {object} [agency_id,data]
 * @param {boolean} [showMessage=false]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getMessageWhatsAppToken(
  agency_id,
  sender_number,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/${agency_id}/${sender_number}/waba-sender-credentials`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Send WhatsApp File Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendFileMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/file`,
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
 * Send WhatsApp File Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendVideoMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/video`,
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
 * Send WhatsApp Audio Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendAudioMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/audio`,
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
 * Retrieve agency available waba credentials
 * @param {object} [agency_id,data]
 * @param {boolean} [showMessage=false]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function initializeMediaAndDocPulling(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat-media`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Send WhatsApp Template Reply Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendTemplateReplyMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/template`,
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
 * Send Initial WhatsApp Template Message
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendInitialTemplateMessage(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/init-template`,
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
 * Send WhatsApp Onboarding form
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendOnboardingForm(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-onboarding`,
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
 * Delete WhatsApp Onboarding
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteOnboardingData(id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-onboarding/${id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get All WhatsApp Onboarding list
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getOnboardingList(agencyId, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-onboarding/${agencyId}/submissions`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get WhatsApp Onboarding submission
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getOnboardingSubmission(onboarding_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-onboarding/${onboarding_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Send WhatsApp Credentials
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendWabaForm(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-config`,
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
 * Update WhatsApp Onboarding submission
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateOnboardingSubmission(
  onboarding_id,
  data,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-onboarding/${onboarding_id}`,
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
 * Send Partial WhatsApp Credential Details When Onboarded Via UIB
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function sendPartialWabaForm(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-config/partial`,
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
 * Get Agency WhatsApp Config Connected to an Onboarding Submission
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getOnboardingWhatsAppConfig(
  whatsAppOnboardingId,
  params,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/whatsapp-config/onboarding/${whatsAppOnboardingId}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Retrieve WhatsApp messaging stat
 * @param {string} [agency_id]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getMessageStat(agency_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-chat/${agency_id}/message-stat`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Create Whatsapp JSON flow
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createWhatsappFlow(
  data,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-flows/create`,
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Update Whatsapp JSON flow
 * @param {string} whatsappFlowId
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateWhatsappFlow(
  whatsappFlowId,
  data,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-flows/${whatsappFlowId}`,
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
 * GET Whatsapp JSON flow by ID
 * @param {string} whatsappFlowId
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getWhatsappFlowById(
  whatsappFlowId,
  showMessage = false,
) {
  if (!whatsappFlowId) return;
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-flows/${whatsappFlowId}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Delete Whatsapp JSON flow by Crm settings ID
 * @param {string} crm_settings_id
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteWhatsappFlowByCrmId(
  crm_settings_id,
  data,
  showMessage = false,
) {
  if (!crm_settings_id) return;
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-flows/${crm_settings_id}/delete-by-crm-settings-id`,
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
 * Sign Public key for new WABA if the flow key does not exists
 * @param {string} wabaId
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function registerWhastappFlowKey(
  wabaId,
  showMessage = false,
) {
  if (!wabaId) return;
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-flows/register-key`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: {
      waba_id: wabaId
    }
  });
  return h.api.handleApiResponse(response, showMessage);
}
