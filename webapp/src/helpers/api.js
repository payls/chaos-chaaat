import { h } from './index';

/**
 * Handles api response
 * @param {object} response
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function handleApiResponse(response, showMessage = true) {
  const apiRes = { status: '', data: {} };
  if (!response) return apiRes;
  apiRes.data = response.data || {};
  if (h.notEmpty(response) && h.cmpStr(response.status, 200)) {
    apiRes.status = 'ok';
    if (h.cmpBool(showMessage, true))
      h.general.alert('success', { message: apiRes.data.message });
  } else if (h.notEmpty(response) && h.cmpStr(response.status, 403)) {
    if (
      !h.cmpStr(window.location.pathname, '/login') &&
      window.location.pathname.indexOf('/contact') === -1
    ) {
      h.auth.redirectToLogin(null, apiRes.data.message);
    }
  } else {
    apiRes.status = 'error';
    if (showMessage) h.general.alert('error', { message: apiRes.data.message });
  }
  return apiRes;
}
