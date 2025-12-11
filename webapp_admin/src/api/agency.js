import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get custom properties that belong to agency
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCustomProperties(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/custom-properties`,
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
 * Update agency user's profile
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateAgencyProfile(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function findById(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_id}`,
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
 * Get Tracker insights
 * @param {*} data
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getCampaignInsights(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_fk}/campaign-performance/${data.tracker_ref_name}`,
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
 * Get additional ctas that belong to agency
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAvailableAdditionalCTAs(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/additional-cta/${data.agency_id}`,
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
 * Get agency subscription
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getSubscription(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/subscription-data`,
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
 * Cancel agency subscription
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function cancelSubscription(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/subscription-cancel`,
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
 *  WhatsApp Rating
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function whatsAppRating(agency_id, waba_number, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${agency_id}/${waba_number}/waba-status`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 *  WhatsApp Rating From DB
 * @param {object} [agent,data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function whatsAppRatingFromDB(waba_number, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${waba_number}/db-waba-status`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get campaign recipients
 * @param {*} data
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getWhatsAppMessageTrackerRecipients(
  data,
  params,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/whatsapp-message-tracker/recipients/${data.agency_id}/${data.tracker_ref_name}`,
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
 * Get Line campaign recipients
 * @param {*} data
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getLineMessageTrackerRecipients(
  data,
  params,
  showMessage,
) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/line-message-tracker/recipients/${data.agency_id}/${data.tracker_ref_name}`,
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
 * Get Line Tracker insights
 * @param {*} data
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getLineCampaignInsights(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_fk}/line-campaign-performance/${data.tracker_ref_name}`,
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
 * Get Unsubscribe Texts
 * @param {*} data
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getUnsubscribeTexts(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${data.agency_id}/unsubscribe-texts`,
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

export async function createNewUnsubscribeText(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/unsubscribe-text`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function deleteUnsubscriibeText(unsubscribe_text_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/unsubscribe-text/${unsubscribe_text_id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 *  Get agency updated WABA details
 * @param {string} agency_id
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAgencyWabaUpdatedDetails(agency_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/sync-waba-details/${agency_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
* This function `getAgencySubscription` is making an asynchronous API call to retrieve agency subscription data based on
* the provided `agencyId`. It sends a GET request to the specified API endpoint using Axios with the agency ID as a
* parameter. The function also takes a boolean `showMessage` parameter to determine whether to display a message after the
* API call.
*
* @async
* @function
* @name getAgencySubscription
* @kind function
* @param {any} agencyId
* @param {any} showMessage
* @returns {Promise<{ data: {}; status: string; }>}
* @exports
*/
export async function getAgencySubscription(agencyId, showMessage) {
 const response = await Axios({
   url: `${config.apiUrl}/v1/staff/agency/inventory/insights/${agencyId}`,
   method: 'get',
   headers: {
     Accept: 'application/json',
     'Content-Type': 'application/json',
   },
 });
 return h.api.handleApiResponse(response, showMessage);
}

export async function generateCustomerPortalLink(agency_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${agency_id}/generate-stripe-session-link`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function generateCustomerSubscriptionCancelLink(agency_id, subscription_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${agency_id}/${subscription_id}/generate-stripe-subscription-cancel-link`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function generateCustomerPaymentLink(agency_id, stripe_price_id, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/${agency_id}/${stripe_price_id}/generate-payment-link`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

export async function generateCustomerPaymentLinkLiveTest(showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/test-generate-live-payment-link`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get Chaaat product matrix
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getProductMatrix(showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/agency/chaaat-pricing-matrix`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}