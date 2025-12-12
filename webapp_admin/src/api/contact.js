import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get contacts by id
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findById(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/${data.contact_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get contacts list that belongs to agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/all-contacts`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get current user contacts list that belongs to agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAllCurrentUserContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/current-user-contacts`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get unassigned contacts list that belongs to agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAllUnassignedContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/unassigned-contacts`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all hubspot contacts list that belongs to hubspot connected account of agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAllHubspotContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/hubspot/get-hubspot-contacts`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all salesforce contacts list that belongs to salesforce connected account of agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAllSalesForceContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/get-salesforce-contacts`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all hubspot contacts list that belongs to hubspot connected account of agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function searchAllHubspotContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/hubspot/get-hubspot-contacts`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all salesforce contacts list that belongs to hubspot connected account of agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function searchAllSalesForceContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiIntegrationsUrl}/v1/staff/integrations/salesforce/get-salesforce-contacts`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get contact by contact id
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findOne(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/${data.contact_id}`,
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
 * Create contact
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact`,
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
 * Update contact
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function update(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact`,
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
 * Simple Update contact
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function simpleUpdate(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/info-update`,
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
 * Contact WhatsApp Subscription Update
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function whatsAppSubscriptionUpdate(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/whatsapp-optout-update`,
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
 * Delete contact
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteContact(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact?contact_id=${data.contact_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function saveMessage(data, showMessage) {
  const response = await Axios({});
}

/**
 * Bulk delete contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function bulkDeleteContacts(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/bulk-delete`,
    method: 'delete',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

//=================== copied from webapp =======================//

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
 * Contact set appointment
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function setAppointment(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/${data.contact_id}/set-appointment`,
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
 * Contact delete appointment
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteAppointment(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/${data.contact_id}/set-appointment`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Contact get notes
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getNotes(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-note/${id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Contact save notes
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createNote(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-note/create`,
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
 * Contact delete notes
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteNote(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-note/${id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Contact update notes
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateNote(id, data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact-note/${id}`,
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
 * Update contact engagement
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateEngagement(data, showMessage = true) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/update-engagement-setting`,
    method: 'patch',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Search contact
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function search(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/search`,
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
 * Contact reassignment
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function mergeContacts(data, showMessage = true) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/line-contact-reassign`,
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
 * Contact get Salesforce Data
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getSalesforceFormData(contactId, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/${contactId}/contact-salesforce-data`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Generate TEC SF Lead
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function generateTECSalesforceLead(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/generate-tec-lead`,
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
 * Get prospect salesforce contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getSalesforceContacts(
  agencyId,
  params,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/salesforce/${agencyId}/contacts`,
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
 * Import prospect salesforce contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function importSalesforceContacts(
  data,
  agencyId,
  sfObject,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/salesforce/${agencyId}/contacts?sfObject=${sfObject}`,
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
 * Update TEC Data
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateTecData(contactId, data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/salesforce-data/${contactId}`,
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
 * Get salesforce reports
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getSalesforceReports(agency_id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/salesforce/${agency_id}/reports`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get salesforce reports
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getSalesforceReportMapping(
  agency_id,
  report_id,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/salesforce/${agency_id}/reports/${report_id}/preview`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Confirm Mapping
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function confirmMapping(
  agency_id,
  report_id,
  data,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/salesforce/${agency_id}/reports/${report_id}/contact-list`,
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
 * Get inactive contacts list that belongs to agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAllInactiveContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/inactive-contacts`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Archive selected contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function archiveSelectedContacts(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/bulk-archive`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get archived contacts list that belongs to agency
 * @param {object} [data]
 * @param {object} [params]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAllArchivedContacts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/archived-contacts`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
    params,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Generate Generic Salesforce Data
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function generateSalesforceData(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/generate-salesforce-record`,
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
 * Description
 * Function to get available hubspot contact list
 * @async
 * @function
 * @name getHubSpotContactList
 * @kind function
 * @param {any} data
 * @param {boolean} showMessage?
 * @returns {Promise<{ data: {}; status: string; }>}
 * @exports
 */
export async function getHubSpotContactList(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/contact/hubspot-contact-list`,
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
 * Get prospect hubspot contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getHubSpotContacts(
  agencyId,
  params,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/hubspot/${agencyId}/contacts`,
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
 * Import prospect hubspot contacts
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function importHubSpotContacts(
  data,
  agencyId,
  sfObject,
  showMessage = false,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/hubspot/${agencyId}/contacts`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}