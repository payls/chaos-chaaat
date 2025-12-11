import React, { useState, useEffect, useRef } from 'react';
import { h } from '../../../../helpers';
import { api } from '../../../../api';
import constant from '../../../../constants/constant.json';
import mainStyle from '../styles/styles.module.scss';

// COMPONENTS
import TemplateSelect from './TemplateSelect';
import CreateTemplate from './CreateTemplate';

// STORE
import useSideBarStore from '../store';
import { getNodeIndex, getUpdatedNodeData } from '../store/functions';

export default React.memo(
  ({
    agency,
    onSelect,
    template_name,
    business_account,
    waba_number,
    nodeDataIndex,
    id,
  }) => {
    const createTemplateProps = {
      template_name,
      business_account,
      nodeDataIndex,
      id,
    };
    const { nodeData, setNodeData } = useSideBarStore();
    const { agency_id } = agency;
    const [method, setMethod] = useState(
      nodeData[nodeDataIndex]?.data?.flowData?.method ?? 'template',
    );
    const resetTemplateRef = useRef()
    const [updatedNodes, setUpdatedNodes] = useState(null);
    const [templateList, setTemplateList] = useState({
      status: constant.API_STATUS.IDLE,
      data: [],
    });

    useEffect(() => {
      if (h.notEmpty(agency_id)) {
        (async () => {
          await getWhatsAppTemplates(agency_id);
        })();
      }
    }, [agency_id]);

    const resetTemplateData = () => {
      const templateData = {
        template_name: '',
        template_category: null,
        template_language: null,
        template_body: null,
        quick_replies: null,
        body_variables: {},
        body_variables_type: [],
        cta_btn: null,
        template_button: null,
        header_image: null,
        template_id: null,
        selected_template: null,
        selectedBtn: null,
        image: null,
        formattedBody: null,
      }
      for (let key in templateData) {
        setNodeData(
          getUpdatedNodeData(nodeData, nodeDataIndex, key, templateData[key]),
        );
      }
      if (
        resetTemplateRef?.current &&
        typeof resetTemplateRef.current === "function"
      ) {
        resetTemplateRef.current();
      }
    }

    /**
     * The `async function getWhatsAppTemplates(agency_id)` is a function that is responsible for fetching WhatsApp templates
     * for a specific agency. Here is a breakdown of what the function does:
     *
     * @async
     * @function
     * @name getWhatsAppTemplates
     * @kind function
     * @memberof default.React.memo() callback
     * @param {any} agency_id
     * @returns {Promise<void>}
     */
    async function getWhatsAppTemplates(agency_id) {
      let t = templateList;

      setTemplateList((prev) => ({
        ...prev,
        status: constant.API_STATUS.PENDING,
      }));

      const apiRes = await api.whatsapp.listTemplates({
        agency_id,
        waba_number,
        status: "APPROVED"
      });

      if (h.cmpStr(apiRes.status, 'ok')) {
        t = { ...t, data: apiRes.data.agency_waba_templates };
      }
      setTemplateList({
        ...t,
        status: constant.API_STATUS.FULLFILLED,
      });
    }

    /**
     * Updates the selected method and node data.
     *
     * @param {string} selectedMethod - The selected method.
     * @returns {void}
     */
    function changeMethod(selectedMethod) {
      setMethod(selectedMethod);
      setNodeData(
        getUpdatedNodeData(nodeData, nodeDataIndex, 'method', selectedMethod),
      );
      resetTemplateData()
    }

    return (
      <div className={mainStyle.sidebarWrapperBodySection}>
        <label>Send Message</label>
        <div className={mainStyle.btnSelectOption}>
          <button
            type="button"
            className={`${mainStyle.btnSelectOptionBtn} ${
              method === 'template' ? mainStyle.btnSelectOptionBtnActive : ''
            }`}
            onClick={() => changeMethod('template')}
          >
            <span>Template</span>
          </button>
          <button
            type="button"
            className={`${mainStyle.btnSelectOptionBtn} ${
              method === 'custom' ? mainStyle.btnSelectOptionBtnActive : ''
            }`}
            onClick={() => changeMethod('custom')}
          >
            <span> Custom</span>
          </button>
        </div>
        {method === 'template' && (
          <TemplateSelect
            onSelect={onSelect}
            options={templateList.data
              .filter((m) => m.status !== 'REJECTED') // Filter only APPROVED templates
              .map((m) => ({
                value: m,
                label: h.general.sentenceCase(m.template_name),
              }))}
            {...createTemplateProps}
            resetTemplateRef={resetTemplateRef}
          />
        )}

        {method === "custom" && (
          <CreateTemplate
            {...createTemplateProps}
            templateViewMethod="custom"
            resetTemplateRef={resetTemplateRef}
            resetTemplateData={resetTemplateData}
          />
        )}
      </div>
    );
  },
);
