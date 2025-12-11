import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Integration of HubSpot with pave
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function initiateIntegrationRequest(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/tray/initiate-integration-request`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Direct integration of Hubspot with pave
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function initiateHubspotIntegrationRequest(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/hubspot/initiate-integration-request`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function completeHubspotIntegrationRequest(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/hubspot/complete-integration-request`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function getHubspotActiveIntegration(params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/hubspot/active-integrations`,
    method: 'get',
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteHubspotActiveIntegration(agencyId, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/hubspot/active-integrations/${agencyId}`,
    method: 'delete',
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Direct integration of Salesforce with pave
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function initiateSalesforceIntegrationRequest(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/initiate-integration-request`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function completeSalesforceIntegrationRequest(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/complete-integration-request`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function completeSalesforceIntegrationRequestStep1(
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/complete-integration-request/1`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
export async function completeSalesforceIntegrationRequestStep2(
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/complete-integration-request/2`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
export async function completeSalesforceIntegrationRequestStep3(
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/complete-integration-request/3`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
export async function getSalesforceActiveIntegration(params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/active-integrations`,
    method: 'get',
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteSalesforceActiveIntegration(agencyId, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/active-integrations/${agencyId}`,
    method: 'delete',
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Initiate HubSpot Full Sync
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function initiateHubspotFullSync(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/hubspot/call-hubspot-webhook-full-sync`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Initiate Salesforce Full Sync
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function initiateSalesforceFullSync(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/call-salesforce-webhook-full-sync`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Tie HubSpot Auth to Tray Solution
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function tieAuthToTrayUserSolution(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/tray/tie-auth-to-tray-user-solution`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get Agency User's Active Integrations
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAgencyUserActiveIntegrations(
  data,
  params,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/tray/get-agency-user-active-integrations`,
    method: 'get',
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteAgencyUserSolutionFromTrayPave(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/tray/delete-agency-user-solution-from-tray-pave`,
    method: 'delete',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteAgencyUserGmailSolutionFromTrayPave(
  data,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/tray/delete-agency-user-solution-from-tray-pave`,
    method: 'delete',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Save authentication code
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function saveGmailCode(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/gmail/integrate`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get Active integration for gmail
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function getGMailActiveIntegration(params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/gmail/active-integration`,
    method: 'get',
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * disconnect gmail integration
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function getGMailDisconnectIntegration(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/gmail/disconnect-integration`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Check Mindbody status
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function getMindBodyStatus(params, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/integration/status/mindbody`,
    method: 'get',
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Connect Mindbody
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function connectToMindBody(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/integration/initiate/mindbody`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Disconnect Mindbody
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function disconnectToMindBody(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/integration/disconnect/mindbody`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Initiating Outlook Calendar integration
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function initiateOutlookCalIntegration(showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/outlookcalendar/initiate-integration`,
    method: 'get'
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**\
 * Initiating Google Calendar integration
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function initiateGCalendarIntegration(showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/gcalendar/initiate-integration`,
    method: 'get'
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Complete Integration of Outlook Calendar
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function integrateOutlookCalIntegration(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/outlookcalendar/active-integration`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Complete Integration of Google Calendar
 * @param {*} data
 * @param {*} showMessage
 * @returns
 */
export async function integrateGCalendarIntegration(data, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/gcalendar/active-integration`,
    method: 'post',
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get Outlook calendar integration
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getOutlookCalActiveIntegration(params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/outlookcalendar/active-integrations`,
    method: 'get',
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get google calendar integration
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getGcalenderActiveIntegration(params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/gcalendar/active-integrations`,
    method: 'get',
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Delete Outlook calendar integration
 * @param {*} params
 * @param {*} showMessage
 * @param {*} agencyId 
 * @returns
 */
export async function deleteOutlookCalActiveIntegration(agencyId, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/outlookcalendar/active-integration/${agencyId}`,
    method: 'delete'
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Delete google calendar integration
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function deleteGcalenderActiveIntegration(agencyId, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/gcalendar/active-integration/${agencyId}`,
    method: 'delete'
  });
  return h.api.handleApiResponse(response, showMessage);
}