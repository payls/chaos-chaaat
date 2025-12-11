import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get CRM Settings If exist
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getCrmSetting(params, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/crm-setting`,
    method: 'get',
    params,
    DONT_SHOW_ERROR: !showMessage
  });

  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get CRM By ID Settings If exist
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getCrmSettingById(crmSettingId, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/crm-setting/${crmSettingId}`,
    method: 'get',
    DONT_SHOW_ERROR: !showMessage
  });

  return h.api.handleApiResponse(response, showMessage);
}
/**
 * Post CRM Settings If exist
 * @param {{
 *  agency_id: string,
 *  agency_user_id: string,
 *  automation_rule_template_id: string,
 *  screens_data: Array<object>,
 * }} data
 * @param {boolean} showMessage
 * @returns
 */
export async function postCrmSetting(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v2/crm-setting`,
    method: 'post',
    data
  });
  return h.api.handleApiResponse(response, showMessage);
}