import React, { useState, useEffect, useCallback } from 'react';
import { h } from '../../../../helpers';
import { api } from '../../../../api';
import styles from '../styles/styles.module.scss';
import templateStyle from '../styles/template-form.module.scss';

// COMPONENTS
import TemplateBodyTextArea from '../../../WhatsApp/TemplateBodyTextArea';
import UpdateableButton from './UpdateableButton';

// STORE
import useSideBarStore from '../store';
import { getUpdatedNodeData } from '../store/functions';
import { unescapeData } from '../../../../helpers/general';

export default React.memo((props) => {
  const { nodeDataIndex, storedNodeData, onSaveInitialPage, whatsappFlowSelected } = props;
  const {
    nodeData,
    setNodeData,
    setBookingMode,
    crm,
    setCRM,
    bookingOption,
    cachedBookingOption,
    screens,
    setScreens,
    setCachedBookingOption,
    defaultForBookingScreen,
    defaultCustomBookingScreen,
  } = useSideBarStore();

  const [formattedBody, setFormattedBody] = useState(
    storedNodeData?.data?.flowData?.formattedBody ?? null,
  );
  const [isBodyWithVariable, setIsBodyWithVariable] = useState(false);
  // const [formattedBody, setFormattedBody] = useState(null);
  const [body_variables, setBodyVariables] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.body_variables ?? {},
  );
  const [body_variables_type, setBodyVariablesType] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.body_variables ?? [],
  );

  const [templateForm, setTemplateForm] = useState({
    template_body: storedNodeData?.data?.flowData?.template_body ?? '',
  });

  const [agencyUser, setAgencyUser] = useState(null);
  const [agencyUserFetchErr, setAgencyUserFetchErr] = useState(false);

  useEffect(() => {
    const crmVal = storedNodeData?.data?.flowData?.crm;
    if (crmVal) setCRM(crmVal);
  }, [storedNodeData]);

  useEffect(() => {
    (async () => {
      if (agencyUser || agencyUserFetchErr) return;
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUser(apiRes.data.agencyUser);
      } else {
        setAgencyUserFetchErr(true);
      }
    })();
  }, [agencyUser, agencyUserFetchErr]);

  useEffect(() => {
    const flowData = nodeData[nodeDataIndex]?.data?.flowData;
    // if (templateViewMethod === 'custom') {
    //   setTemplateForm({});
    //   resetTemplate();
    //   return;
    // }
    if (flowData) {
      // Get body content
      let body_variables = null;
      let body_variables_type = null;

      const exampleObj = nodeData[nodeDataIndex]?.data?.flowData?.body_variables;
      setBodyVariables(exampleObj);
      setIsBodyWithVariable(true);
      body_variables = exampleObj;
      body_variables_type = nodeData[nodeDataIndex]?.data?.flowData?.body_variables_type;

      setTemplateForm((e) => ({ ...e, body_variables, body_variables_type }));
    }
  }, [nodeDataIndex]);

  /**
   * Handles the change event for the input fields in the InitialBookingForm component.
   *
   * @param {any} v - The new value of the input field.
   * @param {string} key - The key of the input field being changed.
   * @returns {void}
   */
  function onChange(v, key) {
    setTemplateForm((prev) => ({ ...prev, [key]: v }));
    setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, [key], v));
  }

  /**
   * Update new body value
   *
   * @function
   * @name updateFormatBody
   * @kind function
   * @memberof default.React.memo() callback
   * @param {any} newBody
   * @returns {void}
   */
  function updateFormatBody(newBody) {
    setFormattedBody(newBody);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'formattedBody', newBody),
    );
    setIsBodyWithVariable(true);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'isBodyWithVariable', true),
    );
  }

  /**
   * Update body variables to store
   *
   * @function
   * @name updateBodyVariables
   * @kind function
   * @memberof default.React.memo() callback
   * @param {any} newVariables
   * @returns {void}
   */
  function updateBodyVariables(newVariables) {
    setBodyVariables(newVariables);
    setNodeData(
      getUpdatedNodeData(
        nodeData,
        nodeDataIndex,
        'body_variables',
        newVariables,
      ),
    );
  }

  const storeCRMSettings = async ({
    agencyId,
    agencyUserId,
    automationRuleId,
    crmType,
    screens,
  }) => { // <--- check this one
    const crm_type
      = crmType.indexOf('GOOGLE') > -1 ? 'GCALENDAR'
      : crmType.indexOf('OUTLOOK') > -1 ? 'OUTLOOKCALENDAR'
      : 'no-crm';
    const apiRes = await api.crmSetting.postCrmSetting({
      screens_data: screens,
      agency_id: agencyId,
      agency_user_id: agencyUserId,
      automation_rule_template_id: automationRuleId,
      crm_type,
    });
  }

  const bookingMode = useCallback(() => {
    if (crm && Object.keys(crm).length != 0) {
      let s = [...screens];
      if (bookingOption !== cachedBookingOption) {
        s = bookingOption === 'custom' ? defaultCustomBookingScreen : defaultForBookingScreen
      }

      let elIndex = null;

      if (crm?.key === 'GOOGLE' || crm?.key === 'OUTLOOK') {
        const screenFirst = s[0]?.elements.filter(element => {
          return element.name !== 'first_name' && element.name !== 'last_name';
        });
        s[0].elements = screenFirst;
        const fullNameExist = s[0]?.elements.findIndex((f) => f.name === 'full_name');
        if (fullNameExist === -1 && bookingOption == 'book-appointment') {
          s[0].elements.unshift({
            name: 'full_name',
            value: '',
            placeholder: 'Full name',
            type: 'text',
            fieldType: 'TextInput',
            required: false,
          })
        }
      }

      if (crm?.key === 'GOOGLE') {
        elIndex = s[0]?.elements.findIndex((f) => f.name === 'phone');
      }

      if (crm?.key === 'OUTLOOK') {
        elIndex = s[0]?.elements.findIndex((f) => f.name === 'email');
      }

      if (elIndex !== null && elIndex !== -1) {
        s[0].elements[elIndex].required = true;
      }

      setScreens(s);

      // send crm update here
      onSaveInitialPage(crm, s);

      setBookingMode(true);
      setNodeData(
        getUpdatedNodeData(
          nodeData,
          nodeDataIndex,
          "initial_cta_button",
          storedNodeData?.data?.flowData?.initial_cta_button ?? "Test Flow"
        )
      );
      
    } else {
      h.general.alert('error', {
        message: 'Please select CRM.',
      });
    }
    setCachedBookingOption(bookingOption);
  }, [crm, bookingOption]);

  return (
    <div className={styles.sidebarWrapperBodySection}>
      <label>Initial Booking Message</label>
      <div className={`${templateStyle.bodyMessageWrapper} q-wrapper mb-3`}>
        <TemplateBodyTextArea
          onChange={onChange}
          form={templateForm}
          formattedBody={formattedBody}
          callbackForUpdateBody={updateFormatBody}
          callbackForUpdateVariables={updateBodyVariables}
          className={`${styles.templateBodyTextArea} mb-3`}
          maxChar={null}
          nodeDataIndex={nodeDataIndex}
        />
      </div>

      <UpdateableButton
        onUpdate={(val) => {
          onChange(val, 'initial_cta_button');
        }}
        title="Update CTA button label"
        value={
          unescapeData(storedNodeData?.data?.flowData?.initial_cta_button ?? 'Test Flow')
        }
      />
      <button
        type="button"
        className={styles.gradientBtn}
        onClick={() => bookingMode()}
      >
        <span>Continue</span>
      </button>
    </div>
  );
});
