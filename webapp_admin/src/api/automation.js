import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';

/**
 * Get all categories
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCategories(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/categories`,
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
 * Get category
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCategory(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/categories/${id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Save Category
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function createCategory(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/categories`,
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
 * Delete category
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteCategory(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/categories`,
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
 * Get all rules by category
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getRules(id, params, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rules/${id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    params
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all rules by category
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getRule(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rule/${id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all packages
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getPackages(params, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/packages`,
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
 * Get all packages
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getForms(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/forms/${id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all rules
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getTriggers(platform, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rule-triggers/${platform}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get all rules
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAllAutomations(params, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rules`,
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
 * Save rule
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function saveRule(data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rules`,
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
 * Save Rule Template Message Flow Data
 * @param {{
 *  automation_rule_id: string,
 *  automation_rule_template_id: string,
 * }} params
 * 
 * @param {{
 *  nodes: Array<object>,
 *  edges: Array<object>,
 * }} data
 * @returns {Promise<{data: object}>}
 */
export async function saveRuleTemplateFlowData(params, data, showMessage = false) {
  const {
    automation_rule_id,
    automation_rule_template_id,
  } = params;
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rule/${automation_rule_id}/template/${automation_rule_template_id}/flow-data`,
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
 * Update rule
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateRule(id, data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rule/${id}`,
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
 * Update rule
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateRuleV2(id, data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rule/${id}/v2`,
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
 * Update rule status
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function updateRuleStatus(id, data, showMessage = false, isLegacy) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rule/status/${id}?isLegacy=${isLegacy}`,
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
 * Delete rule
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function deleteRule(id, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/rule/${id}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get Automation insights
 * @param {*} data
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function geInsights(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/insight/${data.agency_id}/${data.automation_rule_id}`,
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
 * Get Active Automation Count for waba number
 * @param {*} params
 * @param {*} [showMessage=false]
 * @returns
 */
export async function getActiveAutomationCountForWaba(params, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/active-count`,
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
 * Get Automation recipients
 * @param {*} data
 * @param {*} params
 * @param {*} showMessage
 * @returns
 */
export async function getRecipients(data, params, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/recipients/${data.agency_id}/${data.automation_rule_id}`,
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
 * Submits a workflow for automation.
 *
 * @param {string} id - The ID of the workflow.
 * @param {object} data - The data to be submitted.
 * @param {boolean} [showMessage=false] - Whether to show a success message.
 * @returns {Promise<any>} - A promise that resolves to the response from the server.
 */
export async function submitWorkflow(id, data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/workflow/${id}`,
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
 * Save workflow for automation.
 *
 * @param {string} id - The ID of the workflow.
 * @param {object} data - The data to be saved.
 * @param {boolean} [showMessage=false] - Whether to show a success message.
 * @returns {Promise<any>} - A promise that resolves to the response from the server.
 */
export async function saveWorkflow(id, data, showMessage = false) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/staff/automation/workflow/${id}`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
