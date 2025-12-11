import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes';
import { handleLegacyAutomationValidation, handleV2AutomationValidation } from './formValidation';

/**
 * Description
 * Function to handle legacy form submission process
 * @async
 * @function
 * @name handleAutomationFormSubmit
 * @kind function
 * @param {object} form
 * @param {string} formMode
 * @param {string} categoryId
 * @param {array} quickReplyArr
 * @param {string} automationRuleId
 * @param {string} categoryPlatform
 * @param {object} manualForm
 * @param {boolean} showNewHBFormField
 * @param {object} whatsAppTemplates
 * @param {object} setError
 * @param {object} setFieldError
 * @param {object} setManualFieldError
 * @param {any} router
 * @returns {Promise<...>}
 */
export async function handleAutomationFormSubmit(
  form,
  formMode,
  categoryId,
  quickReplyArr,
  automationRuleId,
  categoryPlatform,
  manualForm,
  showNewHBFormField,
  whatsAppTemplates,
  setError,
  setFieldError,
  setManualFieldError,
  router
) {
  setError(false);
  setFieldError(false);
  setManualFieldError(false);
  const flowData = JSON.parse(localStorage.getItem('key'));

  // Remove nodes object
  if (form.is_workflow) {
    const newNodes = removeNodesFromArray(flowData.nodes);
    flowData.nodes = newNodes;
  }

  // validate legacy automation form
  const isValid = handleLegacyAutomationValidation(
    form,
    categoryPlatform,
    whatsAppTemplates,
    showNewHBFormField,
    manualForm,
    setError,
    setFieldError,
    setManualFieldError
  );

  if (h.cmpBool(isValid, false)) {
    return;
  }

  h.general.prompt(
    {
      message:
        formMode === 'create'
          ? 'Are you sure you want to submit this new rule?'
          : 'Are you sure you want to submit this rule',
    },
    async (status) => {
      if (status) {
        let formData = { ...form };
        formData = handleLegacySubmissionDataBasedOnCategoryPlatform(
          formData,
          categoryPlatform,
          manualForm,
          showNewHBFormField,
          flowData
        );

        if (h.cmpBool(form.is_workflow, false)) {
          formData.templates = whatsAppTemplates.map(
            (item) => item.value.waba_template_id,
          );
        } else {
          formData.templates = [];
        }
        formData.category_id = categoryId;
        formData.quick_reply_settings = quickReplyArr;

        const createRes =
          formMode === 'create'
            ? await api.automation.saveRule(formData, true)
            : await api.automation.updateRuleV2(
                automationRuleId,
                formData,
                true,
              );

        if (h.cmpStr(createRes.status, 'ok')) {
          h.general.alert('success', {
            message: 'Automation rule saved',
          });
          setTimeout(() => {
            router.push(
              h.getRoute(routes.automation.index, {
                platform: categoryPlatform,
              }),
              undefined,
              {
                shallow: true,
              },
            );
          }, 3000);
        }
      }
    },
  );
}

/**
 * Description
 * Function to handle V2 automation submission
 * @async
 * @function
 * @name handleFormSave
 * @kind function
 * @param {any} form
 * @param {any} categoryId
 * @param {any} formMode
 * @param {any} categoryPlatform
 * @param {any} whatsAppTemplates
 * @param {any} msgFlowData
 * @param {any} quickReplyArr
 * @param {any} setError
 * @param {any} setFieldError
 * @returns {Promise<false | { ...; } | undefined>}
 */
export async function handleFormSave(
  automationRuleId,
  form,
  categoryId,
  formMode,
  categoryPlatform,
  whatsAppTemplates,
  msgFlowData,
  quickReplyArr,
  setError,
  setFieldError
) {
  const message = formMode === 'create' ? 'Are you sure you want to save this new Rule?' : 'Are you sure you want to update Rule?';
  const status = await h.general.promptPromise(
    {
      message,
    }
  );

  if (!status) return;

  setFieldError(false);
  const isValid = handleV2AutomationValidation(
    form,
    categoryPlatform,
    whatsAppTemplates,
    setError,
    setFieldError
  );

  if (h.cmpBool(isValid, false)) {
    return;
  }

  const formData = {
    ...form,
    rule: form.rule.value.rule_trigger_id,
  }

  switch (categoryPlatform) {
    case constant.AUTOMATION_PLATFORM.MINDBODY:
      formData.packages = formData.packages
        ? formData.packages.map(
            (item) => item.value.mindbody_package_id,
          )
        : [];
      formData.message_flow_data = {};
      break;
    case constant.AUTOMATION_PLATFORM.HUBSPOT:
      formData.forms = [formData.forms.value.hubspot_form_id];
      formData.message_flow_data = {};
      break;
    case constant.AUTOMATION_PLATFORM.OTHER:
      const flowData = JSON.parse(localStorage.getItem('key'));
      // Remove nodes object
      if (form.is_workflow) {
        const newNodes = removeNodesFromArray(flowData.nodes);
        flowData.nodes = newNodes;
      }
      formData.rule = flowData.nodes.find(
        (t) => t.nodeId === 'ruleTrigger',
      )?.data?.value?.value?.rule_trigger_id;
      formData.message_flow_data = flowData;
      break;
    case constant.AUTOMATION_PLATFORM.CHAAATBUILDER:
      if (msgFlowData) {
        formData.message_flow_data = JSON.parse(msgFlowData);
      }
      break;
  }

  if (h.cmpBool(form.is_workflow, false)) {
    formData.templates = whatsAppTemplates.map(
      (item) => item.value.waba_template_id,
    );
  } else {
    formData.templates = [];
  }

  formData.category_id = categoryId;
  formData.quick_reply_settings = quickReplyArr;
  const createRes =
    formMode === 'create'
      ? await api.automation.saveRule(formData, true)
      : await api.automation.updateRuleV2(
          automationRuleId,
          formData,
          true,
        );

  if (!h.cmpStr(createRes.status, 'ok')) {
    return false
  }

  h.general.alert('success', {
    message: 'Automation rule saved',
  });

  return {
    status: true,
    automationRuleId: createRes.data?.ruleObj?.automation_rule_id
  };
}

/**
 * Description
 * Function to process category platform based form data
 * @function
 * @name handleLegacySubmissionDataBasedOnCategoryPlatform
 * @kind function
 * @param {any} formData
 * @param {any} categoryPlatform
 * @param {any} manualForm
 * @param {any} showNewHBFormField
 * @param {any} flowData
 * @returns {any}
 */
function handleLegacySubmissionDataBasedOnCategoryPlatform(
  formData,
  categoryPlatform,
  manualForm,
  showNewHBFormField,
  flowData
) {
  switch (categoryPlatform) {
    case constant.AUTOMATION_PLATFORM.MINDBODY:
      formData.rule = formData.rule.value.rule_trigger_id;
      formData.packages = formData.packages
        ? formData.packages.map(
            (item) => item.value.mindbody_package_id,
          )
        : [];
      formData.message_flow_data = {};
      break;
    case constant.AUTOMATION_PLATFORM.HUBSPOT:
      formData.rule = formData.rule.value.rule_trigger_id;
      formData.message_flow_data = {};
      formData.is_new_hubspot_form = showNewHBFormField;
      if (showNewHBFormField) {
        formData.new_hubspot_form = manualForm;
      } else {
        formData.forms = [formData.forms.value.hubspot_form_id];
      }
      break;
    case constant.AUTOMATION_PLATFORM.OTHER:
      formData.rule = flowData.nodes.find(
        (t) => t.nodeId === 'ruleTrigger',
      )?.data?.value?.value?.rule_trigger_id;
      formData.message_flow_data = flowData;
      break;
  }

  return formData;
}


/**
 * Description
 * Function to remove nodes from automation node array
 * @function
 * @name removeNodesFromArray
 * @kind function
 * @param {any} array
 * @returns {any}
 */
function removeNodesFromArray(array) {
  return array.map((obj) => removeNodes(obj));
}


/**
 * Description
 * Function to remove the nodes when saving the flow data in the database
 * @function
 * @name removeNodes
 * @kind function
 * @param {any} obj
 * @returns {any}
 */
function removeNodes(obj) {
  if (obj && obj.hasOwnProperty('nodes')) {
    delete obj.nodes;
  }
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      removeNodes(obj[key]);
    }
  }
  return obj;
}

// export default { handleAutomationFormSubmit, handleFormSave };

