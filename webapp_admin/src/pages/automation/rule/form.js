import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import moment from 'moment';
import Toggle from 'react-toggle';
import ReactFlow, { ReactFlowProvider } from 'reactflow';

// ICON
import {
  faTrashAlt,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';

// Components
import CommonTooltip from '../../../components/Common/CommonTooltip';
import CommonSelect from '../../../components/Common/CommonSelect';
import TemplatePreview from '../../../components/WhatsApp/TemplatePreviewSendTemplate';
import FlowBuilder from '../../../components/Automation/FlowBuilder';
import { handleAutomationFormSubmit, handleFormSave } from '../../../helpers/automation_form/formSubmission';

export default function AutomationCreateRule() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [lineChannels, setLineChannels] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderLoad, setBuilderLoad] = useState(false);
  const [isBodyWithVariable, setIsBodyWithVariable] = useState(false);
  const [formattedBody, setFormattedBody] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [packages, setPackages] = useState([]);
  const [forms, setForms] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [automationRuleId, setRuleId] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [showImmediate, setShowImmediate] = useState(true);
  const [showDays, setShowDays] = useState(true);
  const [showWeeks, setShowWeeks] = useState(true);
  const [buttonPreLabel, setButtonPreLabel] = useState('After');
  const [categoryPlatform, setCategoryPlatform] = useState(null);
  const [ruleInfo, setRuleInfo] = useState(null);
  const [fieldError, setFieldError] = useState(false);
  const [msgFlowData, setMsgFlowData] = useState(null);
  const [error, setError] = useState(false);
  const [messageFlowData, setMessageFlowData] = useState(null);
  const [hasSubmittedForApproval, setHasSubmittedToApproval] = useState(false);
  const [searchWaba, setSearchWaba] = useState(null);
  const [showNewHBFormField, setShowNewHBFormField] = useState(false);
  const [manualForm, setManualForm] = useState({
    form_id: '',
    form_name: '',
  });
  const [manualFieldError, setManualFieldError] = useState(false);
  
  const [quickReplyArr, setQuickReplyArr] = useState([]);

  const [whatsAppTemplates, setWhatsAppTemplates] = useState([
    {
      value: null,
    },
  ]);
  const [lineTemplates, setLineTemplates] = useState([]);

  const [whatsAppTemplateList, setWhatsAppTemplateList] = useState([]);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [agencyId, setAgencyId] = useState(null);
  const [hasToRestore, setHasToRetore] = useState(false);

  const [form, setForm] = useState({
    name: null,
    description: null,
    packages: [],
    rule: null,
    rule_trigger_setting: 'immediately',
    is_workflow: true,
    rule_trigger_setting_count: '0',
    workflow_timeout_count: 48,
    workflow_timeout_type: 'hours',
    business_account: null,
    messaging_channel: 'whatsapp',
    exclude_package: false,
    message_flow_data: {},
    templates: []
  });

  function onChange(v, key) {
    if (key === 'template_body') {
      setFormattedBody(null);
      setIsBodyWithVariable(false);
    }
    // if forms disable manual form
    if (key === 'forms') {
      setShowNewHBFormField(false);
    }
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  useEffect(() => {
    const { category, form_mode, ruleId } = router.query;
    setFormMode(form_mode);
    setCategoryId(category);
    !automationRuleId && setRuleId(ruleId);
  }, [router]);

  useEffect(() => {
    if (h.notEmpty(categoryId)) {
      (async () => {
        try {
          const categoryRes = await api.automation.getCategory(categoryId);
          if (h.cmpStr(categoryRes.status, 'ok')) {
            setCategoryPlatform(categoryRes.data.category.platform);
            setForm((prev) => ({
              ...prev,
              is_workflow: categoryRes.data.category.platform === 'OTHER' || categoryRes.data.category.platform === 'CHAAATBUILDER',
            }));
          }
        } catch (error) {
          setLoading(false)
        }
      })();
    }
  }, [categoryId]);

  useEffect(() => {
    setShowBuilder(false);
    onChange(null, 'business_account');
  }, [form.messaging_channel]);

  useEffect(() => {
    if (form.business_account) {
      setShowBuilder(false);
      setBuilderLoad(true);
      setTimeout(() => {
        setShowBuilder(true);
        setBuilderLoad(false);
      }, 500);
    }
  }, [form.business_account]);

  useEffect(() => {
    if (h.notEmpty(categoryPlatform) && h.notEmpty(agencyId)) {
      (async () => {
        try {
          switch (categoryPlatform) {
            case constant.AUTOMATION_PLATFORM.HUBSPOT: {
              if (categoryPlatform === constant.AUTOMATION_PLATFORM.HUBSPOT) {
                const formsRes = await api.automation.getForms(agencyId);
  
                if (h.cmpStr(formsRes.status, 'ok')) {
                  setForms(
                    formsRes.data.forms.map((item) => ({
                      label: item.form_name,
                      value: item,
                    })),
                  );
                }
              }
              break;
            }
            case constant.AUTOMATION_PLATFORM.MINDBODY: {
              // Get Packages
              const packageRes = await api.automation.getPackages({
                agency_id: agencyId,
              });
              if (h.cmpStr(packageRes.status, 'ok')) {
                setPackages(
                  packageRes.data.packages
                    .sort(function (a, b) {
                      if (a.name < b.name) {
                        return -1;
                      }
                      if (a.name > b.name) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((item) => ({
                      label: `[${
                        item.source_type === 'auto' ? 'MINDBODY' : 'MANUAL'
                      }] ${item.name}`,
                      value: item,
                    })),
                );
              }
            }
            case constant.AUTOMATION_PLATFORM.OTHER: {
              const credentials = await api.line.getChannelList(
                { agency_id: agencyId },
                false,
              );
              setLineChannels(credentials.data);
  
              const apiRes = await api.line.listTemplates(
                { agency_id: agencyId },
                false,
              );
  
              if (h.cmpStr(apiRes.status, 'ok')) {
                setLineTemplates(apiRes.data.agency_line_templates);
              }
  
              break;
            }
            default:
              break;
          }
  
          // Get Trigger
          const triggerRes = await api.automation.getTriggers(categoryPlatform);
          if (h.cmpStr(triggerRes.status, 'ok')) {
            setTriggers(
              triggerRes.data.triggers.map((item) => ({
                label: item.description,
                value: item,
              })),
            );
          }
        } catch (error) {
          setLoading(false)
        }
      })();
    }
  }, [categoryPlatform, agencyId]);

  useEffect(() => {
    if (h.notEmpty(triggers) && h.notEmpty(ruleInfo)) {
      const selected_business_account = getBusinessChannel(ruleInfo);
      setSearchWaba(selected_business_account?.value?.waba_number);

      const { form_mode } = router.query;

      if (
        (form_mode === 'edit' || form_mode === 'view') &&
        h.notEmpty(ruleInfo)
      ) {
        setLoading(true);
        const trggr = triggers.find(
          (f) => f.value.rule_trigger_id === ruleInfo.rule.rule_trigger_fk,
        );

        // let ruleDep =

        const pckgs = packages.filter((f) =>
          ruleInfo.rule?.automation_rule_packages
            .map((m) => m.package_fk)
            .includes(f.value.mindbody_package_id),
        );

        const frms = forms.find(
          (f) =>
            ruleInfo.rule?.automation_rule_form.hubspot_form.form_id ===
            f.value.form_id,
        );

        const tmplts = whatsAppTemplateList
          .filter((f) =>
            ruleInfo.rule?.automation_rule_templates
              .map((m) => m.template_fk)
              .includes(f.waba_template_id),
          )
          .map((m) => ({ label: m.template_name, value: m }));

        const cForm = {
          name: ruleInfo.rule.name,
          description: ruleInfo.rule.description,
          rule_trigger_setting: ruleInfo.rule.rule_trigger_setting,
          rule_trigger_setting_count: ruleInfo.rule.rule_trigger_setting_count,
          workflow_timeout_count: ruleInfo.rule.workflow_timeout_count,
          workflow_timeout_type: ruleInfo.rule.workflow_timeout_type,
          rule: trggr,
          packages: pckgs,
          forms: frms,
          exclude_package:
            ruleInfo.rule?.exclude_package === '0' ? false : true,
        };
        if (
          ruleInfo.rule.automation_rule_templates.every(
            (e) => e.is_workflow === '1',
          )
        ) {
          cForm.messaging_channel =
            ruleInfo.rule.automation_rule_templates[0].message_channel;
          cForm.is_workflow = true;

          cForm.business_account = getBusinessChannel(ruleInfo);
          setHasToRetore(
            ruleInfo.rule.automation_rule_templates[0].message_flow_data,
          );
        } else {
          cForm.messaging_channel =
            ruleInfo.rule.automation_rule_templates[0].message_channel;
          cForm.is_workflow = false;
          cForm.business_account = getBusinessChannel(ruleInfo);

          if (h.notEmpty(tmplts)) {
            const content = JSON.parse(tmplts[0]?.value?.content);
            const btnObj = content.components.find((f) => f.type === 'BUTTONS');
            if (btnObj) {
              const btns = btnObj.buttons.filter(
                (f) => f.type === 'QUICK_REPLY',
              );
              if (btns.length > 0) {
                setQuickReplyArr(
                  btns.map((m, i) => {
                    const r = {
                      ...m,
                      enabled: false,

                      cta_1_option:
                        ruleInfo.rule.automation_rule_templates[0][
                          `cta_${i + 1}_option_type`
                        ] === 1,
                      cta_2_option:
                        ruleInfo.rule.automation_rule_templates[0][
                          `cta_${i + 1}_option_type`
                        ] === 2,
                      opt_out:
                        ruleInfo.rule.automation_rule_templates[0][
                          `cta_${i + 1}_option_type`
                        ] === 3,

                      cta_response:
                        ruleInfo.rule.automation_rule_templates[0][
                          `cta_${i + 1}_response`
                        ],

                      final_response:
                        ruleInfo.rule.automation_rule_templates[0][
                          `cta_${i + 1}_final_response`
                        ],

                      enabled: ruleInfo.rule.automation_rule_templates[0][
                        `trigger_cta_${i + 1}_options`
                      ]
                        ? true
                        : false,

                      cta_template: [
                        whatsAppTemplateList.find(
                          (f) =>
                            f.waba_template_id ===
                            ruleInfo.rule.automation_rule_templates[0][
                              `trigger_cta_${i + 1}_options`
                            ],
                        ),
                      ].map((m) => ({
                        label:
                          `[WABA: ${m?.waba_number}] - ` +
                          h.general.sentenceCase(m?.template_name),
                        value: m,
                      })),
                    };
                    r.cta_template = !h.isEmpty(r.cta_template[0].value)
                      ? r.cta_template[0]
                      : null;
                    return r;
                  }),
                );
              }
            }
          }
        }
        setForm(cForm);
        setLoading(false)

        if (
          ruleInfo.rule.automation_rule_templates.every(
            (e) => e.is_workflow !== '1',
          )
        ) {
          updateSettings(trggr);
        }

        setWhatsAppTemplates(tmplts);
        setLoading(false);
      }
    }
  }, [triggers, ruleInfo, agencyId, searchWaba, whatsAppTemplateList, lineTemplates]);

  useEffect(() => {
    if (!ruleInfo) return;

    const automationRuleTemplates = ruleInfo?.rule?.automation_rule_templates;

    if (!automationRuleTemplates || automationRuleTemplates.length < 1) return;

    let msgFlowData = null;
    const msgFlowDataJson = automationRuleTemplates[0]?.message_flow_data;

    try {
      msgFlowData = JSON.parse(msgFlowDataJson);
    } catch (err) {
      // ignore
    }

    if (!msgFlowData) return;
    setMessageFlowData(msgFlowData);
  }, [ruleInfo]);
  
  useEffect(() => {
    const nodes = messageFlowData?.nodes || [];
    const approvalSubmission = nodes.reduce((submitted, node) => {
      if (submitted) return submitted;

      const flowData = node?.data?.flowData;

      if (!flowData) return submitted;

      const status = flowData?.status;

      if (!status) return submitted;

      const wasSubmitted
        =  status.toLowerCase() === 'approve'
        || status.toLowerCase() === 'pending'
        || status.toLowerCase() === 'published';

      return wasSubmitted;

    }, false);

    setHasSubmittedToApproval(approvalSubmission);
  }, [messageFlowData]);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      try {
        if (formMode && formMode !== "create") {
          setLoading(true)
        }
        await h.userManagement.hasAdminAccessElseRedirect();
        const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
        if (h.cmpStr(apiRes.status, 'ok')) {
          const agency = apiRes.data.agencyUser.agency;
          getTemplates(agency.agency_id);
          setAgencyId(agency.agency_id);

          // check of whatsapp option can be used
          if (
            !h.isEmpty(agency.agency_config) &&
            !h.isEmpty(agency.agency_config.whatsapp_config)
          ) {
            const whatsapp_config = JSON.parse(
              agency.agency_config.whatsapp_config,
            );

            if (
              !h.isEmpty(whatsapp_config) &&
              !h.isEmpty(whatsapp_config.is_enabled) &&
              h.cmpBool(whatsapp_config.is_enabled, true)
            ) {
              //get available agency waba credentials
              const credentials =
                await api.whatsapp.getAgencyWhatsAppConfigurations(
                  agency.agency_id,
                  false,
                );
              setWabaCredentials(credentials.data.agency_whatsapp_config);
            }
          }
        }
      } catch (error) {
        setLoading(false)
      }
    })();
  }, [formMode]);

  useEffect(() => {
    (async () => {
      try {
        const { form_mode, ruleId } = router.query;
        if (wabaCredentials.length > 0 && (form_mode === 'edit' || form_mode === 'view')) {
          setRuleId(ruleId);
          const res = await api.automation.getRule(ruleId, false);

          setCategoryPlatform(res.data.rule.automation_category.platform);
          if (h.cmpStr(res.status, 'ok')) {
            setRuleInfo(h.general.unescapeData(res.data));
            setMsgFlowData(res.data?.rule?.automation_rule_templates[0]?.message_flow_data);
          }
        }
      } catch (error) {
        setLoading(false)
      }
    })();
  }, [router, wabaCredentials]);

  useEffect(() => {
    if (h.notEmpty(agencyId)) {
      (async () => {
        getTemplates(agencyId);
      })();
    }
  }, [agencyId, searchWaba]);

  useEffect(() => {
    if (
      h.notEmpty(whatsAppTemplates) &&
      h.notEmpty(whatsAppTemplates[0].value)
    ) {
      const templates = [];
      for (let waTemp of whatsAppTemplates) {
        const { content, header_image } = waTemp.value;
        if (h.notEmpty(content)) {
          const { components } = JSON.parse(content);

          let headerImg = null;
          let body = null;
          let quickReplies = [];
          let ctas = [];

          for (let v of components) {
            if (
              v.type === 'HEADER' &&
              h.notEmpty(v.example) &&
              h.notEmpty(v.example.header_handle)
            ) {
              headerImg = !h.isEmpty(header_image)
                ? header_image
                : v.example.header_handle[0];
            }

            if (v.type === 'BODY') {
              body = v.text;
            }
            if (v.type === 'BUTTONS' && h.notEmpty(v.buttons)) {
              ctas =
                v.buttons[0].type === 'URL'
                  ? v.buttons.map((m) => ({ value: m.text }))
                  : [];
              quickReplies =
                v.buttons[0].type === 'QUICK_REPLY'
                  ? v.buttons.map((m) => ({ value: m.text }))
                  : [];
            }
          }

          templates.push({ headerImg, body, ctas, quickReplies });
        }
      }
      setPreviewData(templates);
    }
  }, [whatsAppTemplates]);

  function getBusinessChannel(ruleInfo) {
    const channel = ruleInfo.rule.automation_rule_templates[0].message_channel;

    switch (channel) {
      case 'whatsapp':
        return (
          wabaCredentials
            .filter(
              (f) =>
                f.agency_whatsapp_config_id ===
                ruleInfo.rule.automation_rule_templates[0].business_account,
            )
            .map((m) => ({
              value: m,
              label: `${m.waba_name} [${m.waba_number}]`,
            }))[0] ?? []
        );
      case 'line':
        return (
          lineChannels
            .filter(
              (f) =>
                f.agency_channel_config_id ===
                ruleInfo.rule.automation_rule_templates[0].business_account,
            )
            .map((m) => ({
              value: m,
              label: `${m.channel_name} [${m.channel_id}]`,
            }))[0] ?? []
        );
    }

    return null;
  }
  function updateSettings(v, update = false) {
    if (
      [
        // MINDBODY
        'da7875aa-7e42-4260-8941-02ba9b90e0e3',
        'da7875aa-7e42-4260-8941-02ba9b90e0e4',
        'da7875aa-7e42-4260-8941-02ba9b90e0e8',
        'da7875aa-7e42-4260-8941-02ba9b90e0e9',

        // HUBSPOT
        'da7875aa-7e42-4260-8941-02ba9b90e0d1',
      ].includes(v.value.rule_trigger_id)
    ) {
      setShowImmediate(true);
    } else {
      if (update) {
        onChange('day', 'rule_trigger_setting');
      }
      setShowImmediate(false);
    }

    if (
      [
        'da7875aa-7e42-4260-8941-02ba9b90e0e8',
        'da7875aa-7e42-4260-8941-02ba9b90e0e9',
      ].includes(v.value.rule_trigger_id)
    ) {
      setShowDays(false);
      setShowWeeks(false);
      onChange('immediately', 'rule_trigger_setting');
    } else {
      setShowDays(true);
      setShowWeeks(true);
    }

    if (
      ['da7875aa-7e42-4260-8941-02ba9b90e0f0'].includes(v.value.rule_trigger_id)
    ) {
      setShowDays(true);
      setShowWeeks(false);
      setShowImmediate(false);
    }

    if (
      ['eb7875aa-7e42-4260-8941-02ba9b91b1b0'].includes(v.value.rule_trigger_id)
    ) {
      setShowDays(false);
      setShowWeeks(false);
      setShowImmediate(true);
      onChange('immediately', 'rule_trigger_setting');
    }

    if (v.value.rule_trigger_id === 'da7875aa-7e42-4260-8941-02ba9b90e0e6') {
      setButtonPreLabel('Before');
    } else {
      setButtonPreLabel('After');
    }
  }

  /**
   * Description
   * Function to handle trigger automation form submission
   * @function
   * @name handleSubmit
   * @kind function
   * @memberof AutomationCreateRule
   * @returns {void}
   */
  function handleSubmit() {
    handleAutomationFormSubmit(
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
    );
  }

  function handleRemoveTemplate(index) {
    const waTemplateClone = [...whatsAppTemplates];
    waTemplateClone.splice(index, 1);

    setWhatsAppTemplates(waTemplateClone);
  }

  async function getTemplates(id) {
    setStatus(constant.API_STATUS.PENDING);
    if (h.notEmpty(searchWaba)) {
      const apiRes = await api.whatsapp.searchTemplates({
        agency_id: id, 
        waba_number: searchWaba,
        status: 'APPROVED',
      }, false);
  
      if (h.cmpStr(apiRes.status, 'ok')) {
        setWhatsAppTemplateList(apiRes.data.agency_waba_templates);
      }
    } else {
      setWhatsAppTemplateList([]);
    }
    setStatus(constant.API_STATUS.FULLFILLED);
  }

  const listBtns = () => {
    if (
      whatsAppTemplates.length > 0 &&
      whatsAppTemplates[0].value !== null &&
      whatsAppTemplates[0].value.content
    ) {
      const content = JSON.parse(whatsAppTemplates[0].value.content);
      const btnObj = content.components.find((f) => f.type === 'BUTTONS');
      if (btnObj) {
        const btns = btnObj.buttons.filter((f) => f.type === 'QUICK_REPLY');

        if (btns.length > 0) {
          const btnList = [...quickReplyArr];
          return (
            <div className="campaign-create-form">
              {btnList.map((b, i) => (
                <div
                  style={{
                    margin: '10px 0px',
                    border: '1px solid #e5e5e5',
                    padding: '10px',
                    borderRadius: '3px',
                  }}
                >
                  <label className="cta-label">
                    CTA from "<b>{b.text}</b>"
                  </label>
                  <hr style={{ marginTop: '0.3rem', marginBottom: '0.3rem' }} />
                  <label className="whatsapp-toggle d-flex align-items-center mt-2">
                    <Toggle
                      icons={false}
                      defaultChecked={b.enabled}
                      className="whatsapp-toggle mr-2"
                      disabled={formMode === 'view'}
                      onClick={(e) => {
                        const n = [...quickReplyArr];
                        n[i].enabled = !n[i].enabled;
                        setQuickReplyArr(n);
                      }}
                    />
                    <span className="">Enable Follow-Up Message</span>
                  </label>
                  {!b.enabled && (
                    <textarea
                      placeholder={`Enter CTA response for "${b.text}". Leave empty if to use follow up message`}
                      style={{
                        height: '80px',
                        maxHeight: '80px',
                        overflowY: 'scroll',
                        scrollbarWidth: 'thin',
                        scrollBehavior: 'smooth',
                      }}
                      value={h.general.unescapeData(b.cta_response) || ''}
                      className="form-item"
                      onChange={(e) => {
                        const n = [...quickReplyArr];
                        n[i].cta_response = e.target.value;
                        setQuickReplyArr(n);
                      }}
                      disabled={formMode === 'view'}
                    ></textarea>
                  )}
                  {b.enabled && (
                    <CommonSelect
                      id={`cta-to-use`}
                      options={whatsAppTemplateList.map((m) => ({
                        value: m,
                        label:
                          `[WABA: ${m.waba_number}] - ` +
                          h.general.sentenceCase(m.template_name),
                      }))}
                      value={b.cta_template}
                      isSearchable={true}
                      onChange={(v) => {
                        const n = [...quickReplyArr];
                        n[i].cta_template = v;
                        setQuickReplyArr(n);
                      }}
                      placeholder="Select CTA to use"
                      className={''}
                      disabled={formMode === 'view'}
                    />
                  )}
                  {b.enabled && (
                    <>
                      <label className="whatsapp-toggle d-flex align-items-center mt-2">
                        <span className="">Final Response</span>
                      </label>
                      <textarea
                        className="form-item"
                        disabled={formMode === 'view'}
                        onChange={(v) => {
                          const n = [...quickReplyArr];
                          n[i].final_response = v.target.value;
                          setQuickReplyArr(n);
                        }}
                        value={h.general.unescapeData(b.final_response)}
                      ></textarea>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        }
      }
    }
    return <></>;
  };

  function getTemplateAccounts() {
    switch (form.messaging_channel) {
      case 'whatsapp':
        return wabaCredentials.map((m) => ({
          value: m,
          label: `${m.waba_name} [${m.waba_number}]`,
        }));
      case 'line':
        return lineChannels.map((m) => ({
          value: m,
          label: `${m.channel_name} [${m.channel_id}]`,
        }));
    }
  }

  function getTemplateList() {
    if (h.isEmpty(form.business_account)) {
      return [];
    }

    switch (form.messaging_channel) {
      case 'whatsapp':
        return whatsAppTemplateList.filter(
          (f) => f.waba_number === form.business_account?.value?.waba_number,
        );
      case 'line':
        return lineTemplates.filter(
          (f) =>
            f.line_channel ===
            form.business_account?.value.agency_channel_config_id,
        );
    }
  }

  // new automation functionality configuration saving
  async function handleSave () {
    return handleFormSave(
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
    );
  };

  async function onSave () {
    const success = await handleSave();
    if (success && success.status && formMode === 'create' && success.automationRuleId) {
      router.push(h.getRoute(`/automation/rule/form?ruleId=${success.automationRuleId}&form_mode=edit`));
    }
  }

  async function onSaveAndGoToWorkflow () {
    const success = await handleSave();
    if (success && success.status) router.push(h.getRoute(`/automation/builder?ruleId=${success.automationRuleId}`));
  }

  /**
   * Description
   * Checks if selected waba matches the selected template waba number
   * @function
   * @name checkIfMatchingTemplateAndWabaNumber
   * @kind function
   * @memberof CampaignTemplateList
   * @param {object} waba
   * @returns {void}
  */
  function checkIfMatchingTemplateAndWabaNumber(waba) {
    if (h.notEmpty(whatsAppTemplates[0].value) && !h.cmpStr(waba.value.waba_number, whatsAppTemplates[0].value.waba_number)) {

      setWhatsAppTemplates([
        {
          value: null,
        },
      ]);
      setQuickReplyArr([]);
      setPreviewData([]);
    }
  }

  const handleCancel = () => {
    router.push(h.getRoute(`/automation`)); 
  }

  /**
   * Description
   * Function to update the manual form details if the manual entries is enabled
   * @function
   * @name onManualFormChange
   * @kind function
   * @memberof AutomationCreateRule
   * @param {any} v
   * @param {any} key
   * @returns {void}
   */
  function onManualFormChange(v, key) {
    setManualForm((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <>
      <div className="contacts-root layout-v">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading}>
          <div className="n-banner">
            <div className="container dashboard-contacts-container contacts-container">
              <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
                <div>
                  <h1 style={{ textTransform: 'capitalize' }}>
                    {formMode} Automation
                  </h1>
                </div>
                <div className="d-flex center-body" style={{gap: '25px'}}>
                  <button className='chaaat-lgtBlue-button'
                    onClick={onSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style no-oxs">
            <div className="bg-white">
              <div className="container dashboard-contacts-container modern-style">
                <div className="messaging-container modern-style">
                  <div
                    className="message-body"
                    style={{
                      width: '100%',
                      paddingLeft: '0px',
                      paddingRight: '0px',
                      paddingTop: '10px',
                      overflow: 'auto',
                      paddingBottom: '100px',
                    }}
                  >
                    <div className="">
                      <div
                        className="d-flex justify-content-between "
                        style={{ gap: '10em', minWidth: '1000px', maxWidth: '1200px' }}
                      >
                        <div
                          style={{
                            flexGrow: 1,
                          }}
                          className="d-flex  flex-column"
                        >
                          {/* Common Name start */}
                          <div className="campaign-create-form mt-3">
                            <label>
                              Name<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter name"
                                type="text"
                                value={form.name || ''}
                                onChange={(e) =>
                                  onChange(e.target.value, 'name')
                                }
                                disabled={formMode === 'view'}
                                className={`form-item ${
                                  fieldError && h.isEmpty(form.name)
                                    ? 'field-error'
                                    : ''
                                }`}
                              />
                            </div>
                          </div>
                          {/* Common Name end */}

                          {/* Common Description start */}
                          <div className="campaign-create-form mt-3">
                            <label>
                              Description<small>*</small>
                            </label>
                            <div>
                              <textarea
                                placeholder="Enter description"
                                type="text"
                                value={form.description || ''}
                                onChange={(e) =>
                                  onChange(e.target.value, 'description')
                                }
                                disabled={formMode === 'view'}
                                className={`form-item ${
                                  fieldError && h.isEmpty(form.description)
                                    ? 'field-error'
                                    : ''
                                }`}
                              />
                            </div>
                          </div>
                          {/* Common Description end */}
                          
                          {/* Chaaat Builder */}
                          {categoryPlatform ===
                            constant.AUTOMATION_PLATFORM.CHAAATBUILDER && (
                              <div className="campaign-create-form mt-3">
                                <label>
                                  When should the automation start<small>*</small>
                                </label>
                                <div>
                                <CommonSelect
                                    id="automation_trigger_type"
                                    options={triggers}
                                    value={form.rule}
                                    isSearchable={true}
                                    onChange={(v) => onChange(v, 'rule')}
                                    placeholder="Select automation trigger Type"
                                    className=""
                                    multiple={false}
                                    disabled={formMode === 'view'}
                                    control={{
                                      borderColor:
                                        fieldError && h.isEmpty(form.rule)
                                          ? '#fe5959'
                                          : '',
                                    }}
                                  />
                                </div>
                              </div>
                          )}
                          {/* Chaaat Builder */}

                          {categoryPlatform ===
                            constant.AUTOMATION_PLATFORM.OTHER && (
                            <div className="campaign-create-form mt-3">
                              <label>
                                Messaging Channel<small>*</small>
                              </label>
                              <div>
                                <div>
                                  <button
                                    type="button"
                                    className={`header-none-btn w ${
                                      form.messaging_channel === 'whatsapp'
                                        ? 'active'
                                        : ''
                                    }`}
                                    onClick={(v) => {
                                      onChange('whatsapp', 'messaging_channel');
                                    }}
                                    disabled={formMode === 'view'}
                                    style={{
                                      display: 'inline-flex',
                                      gap: '5px',
                                    }}
                                  >
                                    <IconWhatsApp width="18" color={'#000'} />{' '}
                                    WhatsApp
                                  </button>
                                  {/* <button
                                    type="button"
                                    className={`header-none-btn w ${
                                      form.messaging_channel === 'line'
                                        ? 'active'
                                        : ''
                                    }`}
                                    onClick={(v) => {
                                      onChange('line', 'messaging_channel');
                                    }}
                                    disabled={formMode === 'view'}
                                    style={{
                                      display: 'inline-flex',
                                      gap: '5px',
                                    }}
                                  >
                                    <IconLineApp width="18" color={'#000'} />{' '}
                                    Line
                                  </button> */}
                                </div>
                              </div>
                            </div>
                          )}

                          {categoryPlatform ===
                            constant.AUTOMATION_PLATFORM.OTHER && (
                            <div className="campaign-create-form mt-3">
                              <label>Workflow</label>
                              <div>
                                <div>
                                  <button
                                    type="button"
                                    className={`header-none-btn w ${
                                      !form.is_workflow ? 'active' : ''
                                    }`}
                                    onClick={(v) => {
                                      onChange(false, 'is_workflow');
                                    }}
                                    disabled={formMode === 'view'}
                                  >
                                    No
                                  </button>
                                  <button
                                    type="button"
                                    className={`header-none-btn w ${
                                      form.is_workflow ? 'active' : ''
                                    }`}
                                    onClick={(v) => {
                                      onChange(true, 'is_workflow');
                                    }}
                                    disabled={formMode === 'view'}
                                  >
                                    Yes
                                  </button>
                                </div>
                                {form.rule_trigger_setting !==
                                  'immediately' && (
                                  <div
                                    style={{
                                      width: '180px',
                                      marginTop: '10px',
                                    }}
                                  >
                                    <label
                                      className="form-inner-label"
                                      style={{ textTransform: 'capitalize' }}
                                    >
                                      {form.rule_trigger_setting}
                                      <small style={{ color: '#fe5959' }}>
                                        *
                                      </small>
                                    </label>
                                    <input
                                      placeholder={`Enter number of ${form.rule_trigger_setting}`}
                                      type="number"
                                      value={
                                        form?.rule_trigger_setting_count || 0
                                      }
                                      className="form-item"
                                      onChange={(e) =>
                                        onChange(
                                          e.target.value,
                                          'rule_trigger_setting_count',
                                        )
                                      }
                                      disabled={formMode === 'view'}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {categoryPlatform ===
                            constant.AUTOMATION_PLATFORM.OTHER && (
                            <div className="campaign-create-form mt-3">
                              <label>Automation Timeout</label>
                              <div>
                                <div
                                  style={{
                                    width: '180px',
                                    marginTop: '10px',
                                  }}
                                >
                                  <label className="form-inner-label">
                                    How many {form.workflow_timeout_type}?
                                    <small style={{ color: '#fe5959' }}>
                                      *
                                    </small>
                                  </label>
                                  <input
                                    placeholder={`Enter number of ${form.workflow_timeout_type}`}
                                    type="number"
                                    value={form.workflow_timeout_count}
                                    className="form-item"
                                    onChange={(e) =>
                                      onChange(
                                        e.target.value,
                                        'workflow_timeout_count',
                                      )
                                    }
                                    max={48}
                                    disabled={formMode === 'view'}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Messaging Channels */}

                          <div className="campaign-create-form mt-3">
                            <label>
                              Business Account<small>*</small>
                            </label>
                            <div>
                              <div className="d-flex">
                                <div style={{ flex: 'auto' }}>
                                  <CommonSelect
                                    id={`business-account`}
                                    options={getTemplateAccounts()}
                                    value={form.business_account}
                                    isSearchable={true}
                                    onChange={(v) => {
                                      onChange(v, 'business_account');
                                      setSearchWaba(h.notEmpty(v) ? v.value.waba_number : null);
                                      if (h.cmpStr(formMode, 'create')) {
                                        checkIfMatchingTemplateAndWabaNumber(v);
                                      }
                                    }}
                                    placeholder="Select business account"
                                    className={`form-item ${h.isEmpty(form.business_account) && error ? 'field-error' : ''}`}
                                    disabled={formMode === 'view' || formMode === 'edit' || hasSubmittedForApproval}
                                    control={{
                                      borderColor:
                                        fieldError && h.isEmpty(form.business_account)
                                          ? '#fe5959'
                                          : '',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* HubSpot & MindBody */}
                          {!form.is_workflow && (
                            <div className="campaign-create-form mt-3">
                              <label>
                                WhatsApp Template<small>*</small>
                              </label>
                              <div>
                                {whatsAppTemplates.map((wa_template, i) => {
                                  let className = '';
                                  if (i > 0) {
                                    className = 'mt-2';
                                  }

                                  return (
                                    <div className="d-flex" key={i}>
                                      <div style={{ flex: 'auto' }}>
                                        <CommonSelect
                                          id={`whatsapp_template-${i}`}
                                          options={whatsAppTemplateList.map(
                                            (m) => ({
                                              value: m,
                                              label:
                                                `[WABA: ${m.waba_number}] - ` +
                                                h.general.sentenceCase(
                                                  m.template_name,
                                                ),
                                            }),
                                          )}
                                          value={
                                            h.notEmpty(
                                              whatsAppTemplates[i].value,
                                            )
                                              ? whatsAppTemplates[i]
                                              : null
                                          }
                                          isSearchable={true}
                                          onChange={(v) => {
                                            const waTemplateClone = [
                                              ...whatsAppTemplates,
                                            ];
                                            waTemplateClone[i] = v;
                                            setWhatsAppTemplates(
                                              waTemplateClone,
                                            );

                                            const content = JSON.parse(
                                              v.value.content,
                                            );
                                            const btnObj =
                                              content.components.find(
                                                (f) => f.type === 'BUTTONS',
                                              );
                                            if (btnObj) {
                                              const btns =
                                                btnObj.buttons.filter(
                                                  (f) =>
                                                    f.type === 'QUICK_REPLY',
                                                );
                                              if (btns.length > 0) {
                                                setQuickReplyArr(
                                                  btns.map((m) => ({
                                                    ...m,
                                                    enabled: false,
                                                    cta_response: '',
                                                    cta_template: null,
                                                  })),
                                                );
                                              }
                                            }
                                          }}
                                          placeholder="Select template"
                                          className={`${className} ${
                                            h.isEmpty(
                                              whatsAppTemplates[i].value,
                                            ) && error
                                              ? 'field-error'
                                              : ''
                                          }`}
                                          disabled={formMode === 'view'}
                                        />
                                      </div>
                                      {formMode !== 'view' && (
                                        <div className="center-body">
                                          {whatsAppTemplates.length > 1 && (
                                            <CommonTooltip
                                              tooltipText={'Remove'}
                                            >
                                              <FontAwesomeIcon
                                                icon={faTrashAlt}
                                                color="#fe5959"
                                                style={{
                                                  marginRight: '10px',
                                                  marginLeft: '10px',
                                                  cursor: 'pointer',
                                                }}
                                                onClick={() =>
                                                  handleRemoveTemplate(i)
                                                }
                                              />
                                            </CommonTooltip>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                
                                <>{listBtns()}</>
                              </div>
                            </div>
                          )}
                          {/* HubSpot & MindBody */}

                          {/* MindBody */}
                          {categoryPlatform ===
                            constant.AUTOMATION_PLATFORM.MINDBODY && (
                            <div className="campaign-create-form mt-3">
                              <label>Packages</label>
                              <div>
                                <div>
                                  <CommonSelect
                                    id="packages"
                                    options={packages}
                                    value={form.packages}
                                    isSearchable={true}
                                    onChange={(v) => onChange(v, 'packages')}
                                    placeholder="Select packages"
                                    className=""
                                    multiple={true}
                                    disabled={formMode === 'view'}
                                  />
                                </div>
                                <div className="mt-1 d-flex justify-content-end">
                                  <label>
                                    <input
                                      type="checkbox"
                                      className="mr-1"
                                      id="exclude-package"
                                      onChange={(v) => {
                                        onChange(
                                          v.target.checked,
                                          'exclude_package',
                                        );
                                      }}
                                      checked={
                                        form.exclude_package ? true : false
                                      }
                                      disabled={formMode === 'view'}
                                    />
                                    Exclude these packages?
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* MindBody */}

                          {/* HubSpot */}
                          {categoryPlatform ===
                            constant.AUTOMATION_PLATFORM.HUBSPOT && (
                            <div className="campaign-create-form mt-3">
                              <label>Form</label>
                              <div>
                                <div>
                                  <CommonSelect
                                    id="packages"
                                    options={forms}
                                    value={form.forms}
                                    isSearchable={true}
                                    onChange={(v) => onChange(v, 'forms')}
                                    placeholder="Select HubSpot Form"
                                    className={`form-item ${
                                      fieldError && h.isEmpty(form.forms)
                                        ? 'field-error'
                                        : ''
                                    }`}
                                    multiple={false}
                                    disabled={formMode === 'view'}
                                  />
                                </div>
                                <div className="manual-form-control mt-3">
                                  <span className="mr-2">Or</span>
                                  <button
                                    className="chaaat-common-button text-normal"
                                    type="button"
                                    onClick={() => {
                                      setShowNewHBFormField(!showNewHBFormField);
                                      setForm((prev) => ({ ...prev, ['forms']: null }));
                                    }}
                                  >
                                    <span style={{fontSize: '14px'}}>Enter the form details manually</span>
                                    <span className="chevron point-up ml-4" style={{ fontSize: '14px', display: showNewHBFormField ? 'inline' : 'none'  }}>
                                      <FontAwesomeIcon
                                        icon={faChevronUp}
                                        color="#fff"
                                      />
                                    </span>
                                    <span className="chevron point-down ml-4" style={{ fontSize: '14px', display: !showNewHBFormField ? 'inline' : 'none' }}>
                                      <FontAwesomeIcon
                                        icon={faChevronDown}
                                        color="#fff"
                                      />
                                    </span>
                                  </button>
                                </div>
                                <div className="manual-form-input p-3 mt-4" style={{display: showNewHBFormField ? 'block' : 'none' }}>
                                  <div className="manual-form-input-fields p-3">
                                    <label>
                                      Form ID<small style={{color: 'red'}}>*</small>
                                    </label>
                                    <input
                                      type="text"
                                      value={manualForm.form_id}
                                      className={`form-item ${
                                        manualFieldError && h.isEmpty(manualForm.form_id)
                                          ? 'field-error'
                                          : ''
                                      }`}
                                      onChange={(e) =>
                                        onManualFormChange(e.target.value, 'form_id')
                                      }
                                    />
                                    <label className="mt-3">
                                      Form Name<small style={{color: 'red'}}>*</small>
                                    </label>
                                    <input
                                      type="text"
                                      value={manualForm.form_name}
                                      className={`form-item ${
                                        manualFieldError && h.isEmpty(manualForm.form_name)
                                          ? 'field-error'
                                          : ''
                                      }`}
                                      onChange={(e) =>
                                        onManualFormChange(e.target.value, 'form_name')
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* HubSpot */}

                          {/* Chaaat Builder */}
                          {categoryPlatform === constant.AUTOMATION_PLATFORM.CHAAATBUILDER && (
                            <div className="campaign-create-form mt-3">
                              <div>
                                <div
                                  style={{
                                    marginTop: '10px',
                                  }}
                                >
                                  <label className="form-inner-label">
                                    Set the time cap for running the automation
                                    <small style={{ color: '#fe5959' }}>
                                      *
                                    </small>
                                  </label>
                                  <input
                                    placeholder={`Enter number of ${form.workflow_timeout_type}`}
                                    type="number"
                                    value={form.workflow_timeout_count}
                                    onChange={(e) =>
                                      onChange(
                                        e.target.value,
                                        'workflow_timeout_count',
                                      )
                                    }
                                    max={48}
                                    disabled={formMode === 'view'}
                                    className={`form-item ${
                                      fieldError && h.isEmpty(form.workflow_timeout_count)
                                        ? 'field-error'
                                        : ''
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Chaaat Builder */}

                          {/* Messaging Channels & Chaaat Builder */}
                          {!form.is_workflow &&
                            h.notEmpty(whatsAppTemplateList) && (
                              <div className="campaign-create-form mt-3">
                                <label>
                                  Rule Trigger<small>*</small>
                                </label>
                                <div>
                                  <CommonSelect
                                    id="rule"
                                    options={triggers}
                                    value={form.rule}
                                    isSearchable={true}
                                    onChange={(v) => {
                                      onChange(v, 'rule');
                                      updateSettings(v, true);
                                    }}
                                    placeholder="Select rule"
                                    className={`form-item ${h.isEmpty(form.rule) && error ? 'field-error' : ''}`}
                                    disabled={formMode === 'view'}
                                  />
                                </div>
                              </div>
                            )}
                          {(h.notEmpty(whatsAppTemplateList) ||
                            h.notEmpty(lineTemplates)) && (
                            <>
                              {form.is_workflow && categoryPlatform === constant.AUTOMATION_PLATFORM.OTHER && (
                                <div className="campaign-create-form mt-3">
                                  {!showBuilder && (
                                    <label>
                                      Workflow Builder<small>*</small>
                                    </label>
                                  )}

                                  <div>
                                    {showBuilder &&
                                      !builderLoad &&
                                      h.notEmpty(triggers.length) &&
                                      h.notEmpty(getTemplateList()) && (
                                        <ReactFlowProvider>
                                          <FlowBuilder
                                            templates={getTemplateList()}
                                            messageChannel={
                                              form.messaging_channel
                                            }
                                            onSubmit={handleSubmit}
                                            toRestoreData={hasToRestore}
                                            formMode={formMode}
                                            triggers={triggers}
                                          />
                                        </ReactFlowProvider>
                                      )}
                                    {!showBuilder && (
                                      <div>
                                        <div className="d-flex">
                                          <div
                                            style={{ flex: 'auto' }}
                                            className="mt-2"
                                          >
                                            <i>
                                              {!builderLoad ? (
                                                <>
                                                  {' '}
                                                  Select Business Account to
                                                  show workflow creation
                                                </>
                                              ) : (
                                                <>Loading workflow builder...</>
                                              )}
                                            </i>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {showBuilder &&
                                      h.isEmpty(getTemplateList()) && (
                                        <div>
                                          <div className="d-flex">
                                            <div
                                              style={{ flex: 'auto' }}
                                              className="mt-2"
                                            >
                                              <i>No templates available</i>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {/* Messaging Channels & Chaaat Builder */}

                          {/* Mindbody & HubSpot */}
                          {categoryPlatform !== constant.AUTOMATION_PLATFORM.OTHER && 
                          categoryPlatform !== constant.AUTOMATION_PLATFORM.CHAAATBUILDER && (
                            <div className="campaign-create-form mt-3">
                              <label></label>
                              <div>
                                <label className="form-inner-label">
                                  Settings
                                </label>
                                <div>
                                  {showImmediate && (
                                    <button
                                      type="button"
                                      className={`header-none-btn w ${
                                        form.rule_trigger_setting ===
                                        'immediately'
                                          ? 'active'
                                          : ''
                                      }`}
                                      onClick={(v) =>
                                        onChange(
                                          'immediately',
                                          'rule_trigger_setting',
                                        )
                                      }
                                      disabled={formMode === 'view'}
                                    >
                                      Immediately
                                    </button>
                                  )}
                                  {showDays && (
                                    <button
                                      type="button"
                                      className={`header-none-btn w ${
                                        form.rule_trigger_setting === 'day'
                                          ? 'active'
                                          : ''
                                      }`}
                                      onClick={(v) =>
                                        onChange('day', 'rule_trigger_setting')
                                      }
                                      disabled={formMode === 'view'}
                                    >
                                      {buttonPreLabel} Day
                                    </button>
                                  )}
                                  {showWeeks && (
                                    <button
                                      type="button"
                                      className={`header-none-btn w ${
                                        form.rule_trigger_setting === 'week'
                                          ? 'active'
                                          : ''
                                      }`}
                                      onClick={(v) =>
                                        onChange('week', 'rule_trigger_setting')
                                      }
                                      disabled={formMode === 'view'}
                                    >
                                      {buttonPreLabel} Week
                                    </button>
                                  )}
                                </div>
                                {form.rule_trigger_setting !==
                                  'immediately' && (
                                  <div
                                    style={{
                                      width: '180px',
                                      marginTop: '10px',
                                    }}
                                  >
                                    <label
                                      className="form-inner-label"
                                      style={{ textTransform: 'capitalize' }}
                                    >
                                      {form.rule_trigger_setting}
                                      <small style={{ color: '#fe5959' }}>
                                        *
                                      </small>
                                    </label>
                                    <input
                                      placeholder={`Enter number of ${form.rule_trigger_setting}`}
                                      type="number"
                                      value={
                                        form?.rule_trigger_setting_count || 0
                                      }
                                      className="form-item"
                                      onChange={(e) =>
                                        onChange(
                                          e.target.value,
                                          'rule_trigger_setting_count',
                                        )
                                      }
                                      disabled={formMode === 'view'}
                                    />
                                  </div>
                                )}
                                <hr />
                              </div>
                            </div>
                          )}
                          {/* Mindbody & HubSpot */}

                          {/* Chaaat Builder */}
                          {categoryPlatform ===
                            constant.AUTOMATION_PLATFORM.CHAAATBUILDER && (
                            <div className="campaign-create-form mt-3 d-flex gap-3">
                              <button
                                className="chaaat-common-button mt-4 text-normal"
                                type="button"
                                onClick={onSaveAndGoToWorkflow}
                              >
                                Save & Go to Workflow
                              </button>
                              <button
                                className="chaaat-gradient-btn mt-4 text-normal mb-0 d-flex justify-content-center"
                                type="button"
                                onClick={handleCancel}
                                style={{
                                  width: "220px"
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {/* Chaaat Builder */}

                          {/* Mindbody & HubSpot */}
                          {formMode !== 'view' &&
                            (h.general.isEmpty(form.is_workflow) ||
                              form.is_workflow === false) && (
                              <div className="d-flex campaign-create-form mt-3">
                                <label></label>
                                <div>
                                  <button
                                    className="chaaat-common-button mt-4 text-normal"
                                    type="button"
                                    onClick={handleSubmit}
                                  >
                                    {formMode === 'create'
                                      ? 'Create'
                                      : 'Update'}
                                  </button>
                                </div>
                              </div>
                            )}
                          {/* Mindbody & HubSpot */}
                        </div>

                        {/* Mindbody & HubSpot */}
                        {!form.is_workflow && (
                          <div
                            style={{
                              width: '350px',
                            }}
                          >
                            <TemplatePreview
                              items={previewData.map((m) => ({
                                data: { template_body: m.body },
                                quickReplies: m.quickReplies,
                                cta: m.ctas,
                                header: h.general.isImageOrVideo(m.headerImg),
                                image:
                                  m.headerImg !== 'none' ? m.headerImg : false,
                                isFormatted: false,
                                formattedBody: m.body ?? false,
                              }))}
                            />
                          </div>
                        )}
                        {/* Mindbody & HubSpot */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
