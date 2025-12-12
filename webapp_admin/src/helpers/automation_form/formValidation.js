import { h } from '../../helpers';
import constant from '../../constants/constant.json';

/**
 * Description
 * Function to handle legacy automation validations
 * @function
 * @name handleLegacyAutomationValidation
 * @kind function
 * @param {object} form
 * @param {string} categoryPlatform
 * @param {object} whatsAppTemplates
 * @param {boolean} showNewHBFormField
 * @param {object} manualForm
 * @param {object} setError
 * @param {object} setFieldError
 * @param {object} setManualFieldError
 * @returns {boolean}
 */
export function handleLegacyAutomationValidation(
  form,
  categoryPlatform,
  whatsAppTemplates,
  showNewHBFormField,
  manualForm,
  setError,
  setFieldError,
  setManualFieldError
) {
  if (
    h.isEmpty(form.name)
  ) {
    h.general.alert('error', {
      message: `Please fill in Form Name`,
    });
    setFieldError(true);

    return false;
  }

  if (h.isEmpty(form.business_account)) {
    h.general.alert('error', {
      message: 'Please fill in Business account',
    });
    setFieldError(true);

    return false;
  }

  if (h.cmpBool(form.is_workflow, false) &&
    (categoryPlatform === constant.AUTOMATION_PLATFORM.HUBSPOT ||
      categoryPlatform === constant.AUTOMATION_PLATFORM.MINDBODY) &&
    h.isEmpty(whatsAppTemplates[0].value)) {
    setError(true);
    h.general.alert('error', {
      message: 'Please select a WhatsApp template',
    });

    return false;
  }

  // check if manual forms are enabled for hubspot automation
  if (categoryPlatform === constant.AUTOMATION_PLATFORM.HUBSPOT &&
    h.cmpBool(showNewHBFormField, true) &&
    (h.isEmpty(manualForm.form_id) || h.isEmpty(manualForm.form_name))) {
    setManualFieldError(true);
    h.general.alert('error', {
      message: 'Please fill in required fields in the manual form',
    });

    return false;
  }

  // check if manual forms is not enabled and form is selected for hubspot automation
  if (categoryPlatform === constant.AUTOMATION_PLATFORM.HUBSPOT &&
    h.cmpBool(showNewHBFormField, false) &&
    h.isEmpty(form.forms)) {
    setFieldError(true);
    h.general.alert('error', {
      message: 'Please select a hubspot form',
    });

    return false;
  }

  return true;
}

/**
 * Description
 * Function to handle V2 automation validations
 * @function
 * @name handleV2AutomationValidation
 * @kind function
 * @param {any} form
 * @param {any} categoryPlatform
 * @param {any} whatsAppTemplates
 * @param {any} setError
 * @param {any} setFieldError
 * @returns {boolean}
 */
export function handleV2AutomationValidation(
  form,
  categoryPlatform,
  whatsAppTemplates,
  setError,
  setFieldError
) {
  if (categoryPlatform === constant.AUTOMATION_PLATFORM.CHAAATBUILDER) {
    if (
      h.isEmpty(form.name) ||
      h.isEmpty(form.description) ||
      h.isEmpty(form.rule) ||
      h.isEmpty(form.business_account) ||
      h.isEmpty(form.workflow_timeout_count)
    ) {
      setFieldError(true);
      h.general.alert("error", {
        message: "Please fill in required details",
      });
      return false;
    }
  }

  if (categoryPlatform !== constant.AUTOMATION_PLATFORM.CHAAATBUILDER) {
    if (
      h.isEmpty(form.name) ||
      (categoryPlatform !== constant.AUTOMATION_PLATFORM.OTHER &&
        form.rule_trigger_setting !== "immediately" &&
        (h.isEmpty(whatsAppTemplates) ||
          parseInt(form.rule_trigger_setting_count) === 0 ||
          form.rule_trigger_setting_count === null ||
          form.rule_trigger_setting_count === "")) ||
      (categoryPlatform === constant.AUTOMATION_PLATFORM.OTHER &&
        (h.isEmpty(form.business_account) || form.messaging_channel === null))
    ) {
      setError(true);
      h.general.alert("error", {
        message: "Please fill in required details",
      });
      return false;
    }
  }

  return true;
}

// export default { handleLegacyAutomationValidation, handleV2AutomationValidation };