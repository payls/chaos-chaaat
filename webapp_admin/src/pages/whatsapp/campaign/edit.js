import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';
import { cloneDeep } from 'lodash';
import moment from 'moment';
// ICON
import IconContact from '../../../components/Icons/IconContact';
import {
  faTable,
  faImage,
  faComment,
  faHandPointer,
  faBold,
  faItalic,
  faPlus,
  faStrikethrough,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Components
import CommonTooltip from '../../../components/Common/CommonTooltip';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import CommonSelect from '../../../components/Common/CommonSelect';
import ScheduleForm from '../../../components/WhatsApp/ScheduleForm';
import TemplatePreview from '../../../components/WhatsApp/TemplatePreviewSendTemplate.js';
import QuickReplyResponses from '../../../components/WhatsApp/QuickReplyResponses.js';

const SCHEDULE_OPTIONS = [
  {
    value: 0,
    label: 'Send immediately',
  },
  {
    value: 1,
    label: 'Specific date and time',
  },
];

const LANDING_PAGE_OPTIONS = [
  {
    value: 0,
    label: 'Sample Landing Page 1',
  },
  {
    value: 1,
    label: 'Sample Landing Page 2',
  },
];

const SAMPLE_CONTACT_LIST = [
  {
    value: {
      count: 100,
    },
    label: 'Chaaat Admin',
  },
  {
    value: {
      count: 10,
    },
    label: 'Chaaat Dev Team',
  },
];

export default function CampaignTemplateList() {
  const router = useRouter();
  const { campaign_draft_id } = router.query;

  const [isLoading, setLoading] = useState(false);
  const [agency, setAgency] = useState([]);
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [headerOption, setHeaderOption] = useState('none');
  const [buttons, setButtons] = useState('none');
  const [quickReplyBtns, setQuickReplyBtns] = useState([]);
  const [ctaBtns, setCTABtns] = useState([]);
  const [image, setImage] = useState(null);
  const [isBodyWithVariable, setIsBodyWithVariable] = useState(false);
  const [formattedBody, setFormattedBody] = useState(null);
  const [bodyVariables, setBodyVariables] = useState({});
  const [customLandingPages, setCustomLandingPages] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [fieldError, setFieldError] = useState(false);
  const [approverIDs, setApproverIDs] = useState([]);
  const [agencyUserId, setAgencyUserId] = useState('');
  const [automationsCategoriesList, setAutomationsCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [listRules, setListRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState([]);
  const [rulesResStatus, setRulesResStatus] = useState('');
  const [campaignType, setCampaignType] = useState('');

  const [whatsAppTemplates, setWhatsAppTemplates] = useState([
    {
      value: null,
    },
  ]);

  const [whatsAppTemplateList, setWhatsAppTemplateList] = useState([]);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [agencyId, setAgencyId] = useState(null);
  const [whatsAppTemplateSchedule, setWhatsAppTemplateSchedule] = useState([
    {
      datetime: getNearest15Minute(),
      recipient_count: 0,
    },
  ]);
  const [form, setForm] = useState({});
  const [quickReplySettings, setQuickReplySettings] = useState([]);
  const [wabaNumber, setWabaNumber] = useState(null);

  /**
   * Description
   * Get the nearest 15 minute interval for scheduling option
   * @function
   * @name getNearest15Minute
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {Date}
   */
  function getNearest15Minute() {
    // Step 1: Create a Moment object representing the current date and time
    const now = moment().add(15, 'minutes');

    // Step 2: Get the current minutes
    const currentMinutes = now.minutes();

    // Step 3: Round the minutes to the nearest 15-minute interval
    const nearestQuarter = Math.round(currentMinutes / 15) * 15;

    // Step 4: Set the seconds and milliseconds to zero
    const roundedTime = now.minutes(nearestQuarter).seconds(0).milliseconds(0);

    // Step 5: Optionally, format the resulting Moment object as needed
    const formattedTime = roundedTime.toDate();

    return formattedTime;
  }

  /**
   * Description
   * Event onchange listener
   * @function
   * @name onChange
   * @kind function
   * @memberof CampaignTemplateList
   * @param {any} v
   * @param {any} key
   * @returns {void}
   */
  function onChange(v, key) {
    if (key === 'template_body') {
      setFormattedBody(null);
      setIsBodyWithVariable(false);
    }
    if (key === 'waba_number') {
      setWabaNumber(v.value.waba_number);
    }
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  /**
   * Description
   * Initial useEffect when the campaign_draft_id is provided
   */
  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    if (h.notEmpty(campaign_draft_id)) {
      (async () => {
        setLoading(true);
        await h.userManagement.hasAdminAccessElseRedirect();
        const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
        if (h.cmpStr(apiRes.status, 'ok')) {
          const agency = apiRes.data.agencyUser.agency;
          getAutomations(agency.agency_id);
          setAgency(agency);
          setAgencyId(agency.agency_id);
          setAgencyUserId(apiRes.data.agencyUser.agency_user_id);
          const approvers =
            apiRes.data.agencyUser.agency?.campaign_approval_agent;
          if (!h.isEmpty(approvers)) {
            setApproverIDs(approvers.split(','));
          }
  
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
              const wabaConfig = credentials.data.agency_whatsapp_config;
              setWabaCredentials(credentials.data.agency_whatsapp_config);

              // get the campaign draft data
              const dataRes = await api.campaignSchedule.getCampaignDraft(
                campaign_draft_id,
                false,
              );
      
              // check the configuration to get the waba number
              if (h.cmpStr(dataRes.status, 'ok')) {
                const configurations = JSON.parse(
                  dataRes.data.campaign_draft.configuration,
                );
                const waba = wabaConfig.find(
                  (entry) =>
                    entry.agency_whatsapp_config_id ===
                    configurations.selected_waba_credentials_id,
                );
                if (configurations.selected_waba_credentials_id) {
                  setWabaNumber(waba.waba_number);
                }
              } else {
                h.general.alert('error', { message: 'Something went wrong while loading the draft. Refresh the page and try again.' });
              }
            }
          }
          getList(agency.agency_id);
        }
      })();
    }
  }, [campaign_draft_id]);

  /**
   * Description
   * Loading the templates per waba selection
   */
  useEffect(() => {
    if (
      h.notEmpty(agencyId) && h.notEmpty(wabaNumber)
    ) {
      getTemplates(agencyId, wabaNumber);
    } else {
      setWhatsAppTemplateList([]);
    }
  }, [agencyId, wabaNumber]);

  /**
   * Description
   * Prepare the configurations to rendering info, schedules, contact list,
   * and selected templates
   */
  useEffect(() => {
    (async () => {
      if (
        h.notEmpty(campaign_draft_id) &&
        h.notEmpty(contactList) &&
        h.notEmpty(wabaCredentials)
      ) {
        const draftRes = await api.campaignSchedule.getCampaignDraft(
          campaign_draft_id,
          false,
        );
        if (h.cmpStr(draftRes.status, 'ok')) {
          const configurations = JSON.parse(
            draftRes.data.campaign_draft.configuration,
          );
          const waba = wabaCredentials.find(
            (entry) =>
              entry.agency_whatsapp_config_id ===
              configurations.selected_waba_credentials_id,
          );
          if (configurations.selected_waba_credentials_id) {
            onChange({ value: waba, label: waba.waba_name }, 'waba_number');
            configurations.waba_number = { value: waba, label: waba.waba_name };
          }
          configurations.confirmation = h.cmpBool(
            configurations.is_confirmation,
            true,
          )
            ? 'yes'
            : 'no';
          configurations.contact_lists = configurations.contact_list;
          configurations.staggered = h.cmpBool(configurations.staggered, true)
            ? 'yes'
            : 'no';
          if (
            !h.isEmpty(configurations.permalink_template) &&
            !h.cmpStr(configurations.permalink_template, 'pave')
          ) {
            const landingPage = customLandingPages.find(
              (entry) =>
                entry.landing_page === configurations.permalink_template,
            );
            configurations.landing_page = {
              value: landingPage,
              label: landingPage.landing_page_name,
            };
          } else {
            configurations.landing_page = null;
          }

          const schedules = configurations.timing;
          const timing = [];
          schedules.forEach((sched) => {
            timing.push({
              recipient_count: sched.recipient_count,
              datetime: moment(sched.datetime).toDate(),
            });
          });
          setWhatsAppTemplateSchedule(timing);
          const templates = configurations.templates;
          const waTemplateClone = [];
          let index = 0;
          templates.forEach((template) => {
            const original_name = template.original_name;
            const waba_template = whatsAppTemplateList.find(
              (entry) => entry.template_id === template.id,
            );
            waTemplateClone[index] = {
              value: waba_template,
              label: formatTeplateName(original_name.replace(/_/g, ' ')),
            };
            index++;
          });
          const button_arr = [];
          waTemplateClone.forEach((clone) => {
            if (!h.isEmpty(clone.value.content)) {
              const content = JSON.parse(clone.value.content);
              for (let component of content.components) {
                if (
                  component.type === 'BUTTONS' &&
                  h.notEmpty(component.buttons)
                ) {
                  const quick_reply_btns = [];
                  const quick_reply_settings = [];
                  let btnIndex = 0;
                  for (let button of component.buttons) {
                    if (h.cmpStr(button.type, 'QUICK_REPLY')) {
                      quick_reply_settings.push({
                        enabled: !h.isEmpty(quickReplySettings[btnIndex])
                          ? quickReplySettings[btnIndex].enabled
                          : false,
                        cta_1_option: !h.isEmpty(quickReplySettings[btnIndex])
                          ? quickReplySettings[btnIndex].cta_1_option
                          : false,
                        cta_2_option: !h.isEmpty(quickReplySettings[btnIndex])
                          ? quickReplySettings[btnIndex].cta_2_option
                          : false,
                        opt_out: !h.isEmpty(quickReplySettings[btnIndex])
                          ? quickReplySettings[btnIndex].opt_out
                          : false,
                        cta_template: !h.isEmpty(quickReplySettings[btnIndex])
                          ? quickReplySettings[btnIndex].cta_template
                          : null,
                        final_response: !h.isEmpty(quickReplySettings[btnIndex])
                          ? quickReplySettings[btnIndex].final_response
                          : '',
                      });
                      quick_reply_btns.push(button);
                    }
                    btnIndex++;
                  }
                  if (!h.isEmpty(configurations.cta_settings)) {
                    setQuickReplySettings(configurations.cta_settings);
                  } else {
                    setQuickReplySettings(quick_reply_settings);
                  }
                  if (!h.isEmpty(quick_reply_btns)) {
                    button_arr[clone.value.template_name] = quick_reply_btns;
                  }
                }
              }
            }
          });
          setQuickReplyBtns(button_arr);
          //configurations.timing = timing;
          setWhatsAppTemplates(waTemplateClone);
          if(configurations && configurations.automations && configurations.automations.length !== 0) {
            setSelectedCategory(configurations.automations[0].category)
            getRules(configurations.automations[0].category.value, configurations.selected_waba_credentials_id)
            setSelectedRule(configurations.automations[0].automation_rule_id)
          }
          configurations.campaign_type ? setCampaignType(configurations.campaign_type) : setCampaignType('templates');
          setForm(configurations);
        }
        setLoading(false);
      }
    })();
  }, [campaign_draft_id, contactList, wabaCredentials]);

  /**
   * Description
   * This prepares the whatsapp template data to set the template preview
   * and the button configurations
   */
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
              body = v?.text;
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
      const waTemplateClone = [...whatsAppTemplates];
      waTemplateClone.push({ value: '' });
      const button_arr = [];
      for (let clone of waTemplateClone) {
        if (!h.isEmpty(clone.value.content)) {
          const content = JSON.parse(clone.value.content);
          for (let component of content.components) {
            if (component.type === 'BUTTONS' && h.notEmpty(component.buttons)) {
              const quick_reply_btns = [];
              const quick_reply_settings = [];
              let btnIndex = 0;
              for (let button of component.buttons) {
                if (h.cmpStr(button.type, 'QUICK_REPLY')) {
                  quick_reply_btns.push(button);
                  quick_reply_settings.push({
                    enabled: !h.isEmpty(quickReplySettings[btnIndex])
                      ? quickReplySettings[btnIndex].enabled
                      : false,
                    cta_1_option: !h.isEmpty(quickReplySettings[btnIndex])
                      ? quickReplySettings[btnIndex].cta_1_option
                      : false,
                    cta_2_option: !h.isEmpty(quickReplySettings[btnIndex])
                      ? quickReplySettings[btnIndex].cta_2_option
                      : false,
                    opt_out: !h.isEmpty(quickReplySettings[btnIndex])
                      ? quickReplySettings[btnIndex].opt_out
                      : false,
                    cta_template: !h.isEmpty(quickReplySettings[btnIndex])
                      ? quickReplySettings[btnIndex].cta_template
                      : null,
                    final_response: !h.isEmpty(quickReplySettings[btnIndex])
                      ? quickReplySettings[btnIndex].final_response
                      : '',
                  });
                }
                btnIndex++;
              }
              setQuickReplySettings(quick_reply_settings);
              if (!h.isEmpty(quick_reply_btns)) {
                button_arr[clone.value.template_name] = quick_reply_btns;
              }
            }
          }
        }
      }
      setQuickReplyBtns(button_arr);
    }
  }, [whatsAppTemplates]);

    /**
   * Description
   * Function to format name of template
   * @function
   * @name formatTeplateName
   * @kind function
   * @memberof CampaignTemplateList
   * @param {any} input
   * @returns {any}
   */
  function formatTeplateName(input) {
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  }

  /**
   * Description
   * Function for submitting and initiating campaign
   * @function
   * @name handleSubmit
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {void}
   */
  function handleSubmit() {
    if (validateSubmission() !== '') return;
    h.general.prompt(
      {
        message: 'Are you sure you want to submit and initiate this campaign?',
      },

      async (submitCampaign) => {
        if (h.cmpBool(submitCampaign, true)) {
          setLoading(true);
          const templates = [];
          const automations = [];

          if (
            h.isEmpty(form.campaign_name) ||
            h.isEmpty(form.waba_number) ||
            (
              (form.campaign_type === 'templates' && h.isEmpty(whatsAppTemplates[0]?.value)) || 
              (form.campaign_type === 'automation' && h.isEmpty(selectedRule))
            ) ||
            h.isEmpty(form.contact_lists)
          ) {
            setFieldError(true);
            h.general.alert('error', {
              message:
                'Required fields not filled up. Check the form and try again.',
            });
            setLoading(false);
          } else {
            setFieldError(false);

            if (form.campaign_type === 'templates') {
              for (let template of whatsAppTemplates) {
                template.value.selected = true;
                const content = JSON.parse(template.value.content);
                content.selected = true;
                content.header_image = template.value.header_image;
                content.original_name = content.name;
                let body_component = [];

                for (let component of content.components) {
                  if (h.cmpStr(component.type, 'BODY')) {
                    if (!h.isEmpty(component.example)) {
                      const body_text = component.example.body_text[0];
                      const variable_types = template.value.variable_identifier;
                      if (!h.isEmpty(variable_types)) {
                        body_component = variable_types.split(',');
                      } else {
                        const default_types = ['contact', 'agent'];
                        const iterations = body_text.length;
                        for (let i = 0; i < iterations; i++) {
                          body_component.push(default_types[i % 2]);
                        }
                      }
                    }
                  }
                }
                content.body_component = body_component;
                templates.push(content);
              }
            }

            if (form.campaign_type === 'automation') {
              const automation = {
                category: selectedCategory,
                automation_rule_id: selectedRule
              }
  
              automations.push(automation);
            }

            const qrTextAreas = document.querySelectorAll('.qr_textarea');
            const qrAutoResponses = [];

            if (qrTextAreas.length > 0) {
              qrTextAreas.forEach(function (qr) {
                qrAutoResponses.push(qr.value);
              });
            }

            const formData = {
              campaign_draft_id: campaign_draft_id,
              campaign_name: form.campaign_name,
              agency_id: agencyId,
              campaign_type: form.campaign_type,
              templates: templates,
              automations: automations,
              contact_list: form.contact_lists,
              whatsApp: true,
              trigger_quick_reply: false,
              is_template: form.campaign_type === 'automation' ? false : true,
              selected_waba_credentials_id:
                form.waba_number.value.agency_whatsapp_config_id,
              cta_response: qrAutoResponses,
              cta_settings: quickReplySettings,
              schedule: form.schedule,
              staggered: h.cmpStr(form.staggered, 'yes'),
              timing: whatsAppTemplateSchedule,
              campaign_notification_additional_recipients:
                form.campaign_notification_additional_recipients,
            };

            const apiRes = await api.campaignSchedule.createCampaign(
              formData,
              false,
            );

            if (h.cmpStr(apiRes.status, 'ok')) {
              h.general.alert('success', {
                message: `Succesfully created campaign.`,
              });
              setTimeout(() => {
                router.push(routes.dashboard.messaging);
              }, 2000);
            }
            setLoading(false);
          }
        }
      },
    );
  }

  /**
   * Description
   * Function to save campaign as draft
   * @function
   * @name handleDraft
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {void}
   */
  function handleDraft() {
    h.general.prompt(
      {
        message: 'Are you sure you want to save campaign as draft?',
      },

      async (submitCampaign) => {
        if (h.cmpBool(submitCampaign, true)) {
          setLoading(true);
          const templates = [];
          const automations = [];

          if (form.campaign_type === 'templates') {
            for (let template of whatsAppTemplates) {
              template.value.selected = true;
              const content = JSON.parse(template.value.content);
              content.selected = true;
              content.header_image = template.value.header_image;
              content.original_name = content.name;
              let body_component = [];

              for (let component of content.components) {
                if (h.cmpStr(component.type, 'BODY')) {
                  if (!h.isEmpty(component.example)) {
                    const body_text = component.example.body_text[0];
                    const variable_types = template.value.variable_identifier;
                    if (!h.isEmpty(variable_types)) {
                      body_component = variable_types.split(',');
                    } else {
                      const default_types = ['contact', 'agent'];
                      const iterations = body_text.length;
                      for (let i = 0; i < iterations; i++) {
                        body_component.push(default_types[i % 2]);
                      }
                    }
                  }
                }
              }
              content.body_component = body_component;
              templates.push(content);
            }
          }

          if (form.campaign_type === 'automation') {
            const automation = {
              category: selectedCategory,
              automation_rule_id: selectedRule
            }

            automations.push(automation);
          }

          const qrTextAreas = document.querySelectorAll('.qr_textarea');
          const qrAutoResponses = [];

          if (qrTextAreas.length > 0) {
            qrTextAreas.forEach(function (qr) {
              qrAutoResponses.push(qr.value);
            });
          }

          const formData = {
            campaign_name: form.campaign_name,
            agency_id: agencyId,
            campaign_type: form.campaign_type,
            templates: templates,
            automations: automations,
            contact_list: form.contact_lists,
            whatsApp: true,
            trigger_quick_reply: false,
            is_template: form.campaign_type === 'automation' ? false : true,
            selected_waba_credentials_id:
              form.waba_number.value.agency_whatsapp_config_id,
            cta_response: qrAutoResponses,
            cta_settings: quickReplySettings,
            schedule: form.schedule,
            staggered: h.cmpStr(form.staggered, 'yes'),
            timing: whatsAppTemplateSchedule,
            campaign_notification_additional_recipients:
              form.campaign_notification_additional_recipients,
          };

          const apiRes = await api.campaignSchedule.draftCampaignUpdate(
            campaign_draft_id,
            formData,
            false,
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully saved campaign draft.`,
            });
            setTimeout(() => {
              router.push(routes.dashboard.messaging);
            }, 2000);
          }
          setLoading(false);
        }
      },
    );
  }

  /**
   * Description
   * Function to delete campaign draft
   * @function
   * @name handleDeleteDraft
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {void}
   */
  function handleDeleteDraft() {
    h.general.prompt(
      {
        message: 'Are you sure you want to delete this campaign draft?',
      },

      async (deleteDraft) => {
        if (h.cmpBool(deleteDraft, true)) {
          setLoading(true);
          const apiRes = await api.campaignSchedule.deleteDraft(
            campaign_draft_id,
            false,
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully deleted campaign draft.`,
            });
            setTimeout(() => {
              router.push(routes.dashboard.messaging);
            }, 2000);
          }
          setLoading(false);
        }
      },
    );
  }

  /**
   * Get total number of contact in selected contact list
   *
   * @constant
   * @name totalCountOfContacts
   * @kind variable
   * @memberof CampaignTemplateList
   * @type {number}
   */
  const totalCountOfContacts = useMemo(() => {
    return form.contact_lists?.reduce((accumulator, currentObject) => {
      return accumulator + currentObject.value?.contact_count?.count ?? 0;
    }, 0);
  }, [form.contact_lists]);

  /**
   * Validation for submission
   *
   * @function
   * @name validateSubmission
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {string}
   */
  function validateSubmission() {
    let error = '';

    // Validate business account
    if (h.isEmpty(form.waba_number)) {
      error = `No Business Account selected`;
    }

    // Validate if there is template selected
    const w = whatsAppTemplates[0];
    if (h.isEmpty(w?.value) && form.campaign_type === "templates") {
      error = `No template selected`;
    }

    // Validate if there is automation rule selected
    if (h.isEmpty(selectedRule) && form.campaign_type === "automation") {
      error = `No automation rule selected`;
    }

    // Validate if no contact list
    if (h.isEmpty(form.contact_lists)) {
      error = `No contact list selected`;
    } else {
      if (totalCountOfContacts === 0) {
        error = `No contact found in selected contact list`;
      }
    }

    if (error) {
      h.general.alert('error', {
        message: error,
      });
    }
    return error;
  }

  /**
   * Description
   * Function to submit campaign for review
   * @function
   * @name handleReview
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {void}
   */
  function handleReview() {
    if (validateSubmission() !== '') return;
    h.general.prompt(
      {
        message:
          'Are you sure you want to save and submit campaign for review?',
      },

      async (submitCampaign) => {
        if (h.cmpBool(submitCampaign, true)) {
          setLoading(true);
          const templates = [];
          const automations = [];

          if (form.campaign_type === 'templates') {
            for (let template of whatsAppTemplates) {
              template.value.selected = true;
              const content = JSON.parse(template.value.content);
              content.selected = true;
              content.header_image = template.value.header_image;
              content.original_name = content.name;
              let body_component = [];

              for (let component of content.components) {
                if (h.cmpStr(component.type, 'BODY')) {
                  if (!h.isEmpty(component.example)) {
                    const body_text = component.example.body_text[0];
                    const variable_types = template.value.variable_identifier;
                    if (!h.isEmpty(variable_types)) {
                      body_component = variable_types.split(',');
                    } else {
                      const default_types = ['contact', 'agent'];
                      const iterations = body_text.length;
                      for (let i = 0; i < iterations; i++) {
                        body_component.push(default_types[i % 2]);
                      }
                    }
                  }
                }
              }
              content.body_component = body_component;
              templates.push(content);
            }
          }

          if (form.campaign_type === 'automation') {
            const automation = {
              category: selectedCategory,
              automation_rule_id: selectedRule
            }

            automations.push(automation);
          }

          const qrTextAreas = document.querySelectorAll('.qr_textarea');
          const qrAutoResponses = [];

          if (qrTextAreas.length > 0) {
            qrTextAreas.forEach(function (qr) {
              qrAutoResponses.push(qr.value);
            });
          }

          const formData = {
            campaign_name: form.campaign_name,
            agency_id: agencyId,
            campaign_type: form.campaign_type,
            templates: templates,
            automations: automations,
            contact_list: form.contact_lists,
            whatsApp: true,
            trigger_quick_reply: false,
            is_template: form.campaign_type === 'automation' ? false : true,
            selected_waba_credentials_id:
              form.waba_number.value.agency_whatsapp_config_id,
            is_confirmation: h.cmpStr(form.confirmation, 'yes'),
            cta_response: qrAutoResponses,
            cta_settings: quickReplySettings,
            schedule: form.schedule,
            staggered: h.cmpStr(form.staggered, 'yes'),
            timing: whatsAppTemplateSchedule,
            campaign_notification_additional_recipients:
              form.campaign_notification_additional_recipients,
          };

          const apiRes = await api.campaignSchedule.draftCampaignUpdateReview(
            campaign_draft_id,
            formData,
            false,
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully submitted campaign for review.`,
            });
            setTimeout(() => {
              router.push(routes.dashboard.messaging);
            }, 2000);
          }
          setLoading(false);
        }
      },
    );
  }

  /**
   * Description
   * Add schedule in the campaign
   * @function
   * @name handleAddSchedule
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {void}
   */
  function handleAddSchedule() {
    const waScheduleClone = [...whatsAppTemplateSchedule];
    waScheduleClone.push({
      datetime:
        waScheduleClone.length > 1
          ? waScheduleClone[waScheduleClone.length - 1].datetime
          : null,
      recipient_count: 0,
    });

    setWhatsAppTemplateSchedule(waScheduleClone);
  }

  /**
   * Description
   * Remove schedule in the campaign
   * @function
   * @name handleRemoveSchedule
   * @kind function
   * @memberof CampaignTemplateList
   * @param {any} index
   * @returns {void}
   */
  function handleRemoveSchedule(index) {
    const waScheduleClone = [...whatsAppTemplateSchedule];
    waScheduleClone.splice(index, 1);

    setWhatsAppTemplateSchedule(waScheduleClone);
  }

  /**
   * Description
   * Get templates available for the waba number per agency
   * @async
   * @function
   * @name getTemplates
   * @kind function
   * @memberof CampaignTemplateList
   * @param {any} id
   * @param {any} waba_number
   * @returns {Promise<void>}
   */
  async function getTemplates(id, waba_number) {
    setStatus(constant.API_STATUS.PENDING);
    const apiRes = await api.whatsapp.searchTemplates({ agency_id: id, waba_number });

    if (h.cmpStr(apiRes.status, 'ok')) {
      setWhatsAppTemplateList(apiRes.data.agency_waba_templates);
    }
    setStatus(constant.API_STATUS.FULLFILLED);
  }

  async function getAutomations(id) {
    const rulesRes = await api.automation.getCategories({
      agency_id: id,
      platform: 'chaaatbuilder'
    });

    if (h.cmpStr(rulesRes.status, 'ok')) {
      const listData = rulesRes.data.categories;
      setAutomationsCategoriesList(listData);
    }
  }

  async function getRules(categoryId, businessAccount = null) {
    setRulesResStatus(constant.API_STATUS.PENDING);
    const rulesRes = await api.automation.getRules(categoryId, {
      rule_trigger_fk: "eb7875aa-7e42-4260-8941-02ba9b91b124", // Broadcast rules only
      business_account: businessAccount
        ? businessAccount
        : form?.waba_number?.value?.agency_whatsapp_config_id,
      status: "active"
    });

    if (h.cmpStr(rulesRes.status, 'ok')) {
      setListRules(rulesRes.data.rules);
    }
    setRulesResStatus(constant.API_STATUS.FULLFILLED);
  }

  const handleCategoryChange = (selectedOption) => {
    onChange(selectedOption, selectedOption.value);
    const selectedCategoryId = selectedOption?.value;
    setSelectedCategory(selectedOption);
    selectedCategoryId ? getRules(selectedCategoryId) : setListRules([]);
  };

  async function getLandingPages(agency_fk) {
    setStatus(constant.API_STATUS.PENDING);
    const apiRes = await api.agencyCustomLandingPage.get(
      {
        agency_fk,
      },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      setCustomLandingPages(apiRes.data.custom_landing_pages);
    }
    setStatus(constant.API_STATUS.FULLFILLED);
  }

  /**
   * Description
   * Get the current count value for the recipients in schedule
   * @function
   * @name getCountValues
   * @kind function
   * @memberof CampaignTemplateList
   * @returns {string}
   */
  function getCountValues() {
    const templCount = whatsAppTemplateSchedule
      ?.map((m) => m?.recipient_count)
      .reduce((a, b) => a + b);

    const contactCount = form.contact_lists
      ?.filter((f) => h.notEmpty(f.value?.contact_count))
      .map((m) => m.value?.contact_count?.count)
      .reduce((a, b) => a + b, 0);

    return `${templCount} of ${contactCount} Recipients`;
  }

  /**
   * Description
   * Get the available contact lists for the agency
   * @async
   * @function
   * @name getList
   * @kind function
   * @memberof CampaignTemplateList
   * @param {string} id agency ID
   * @returns {Promise<void>}
   */
  async function getList(id) {
    const apiRes = await api.contactList.contactList(
      { agency_id: id, is_whatsapp_opt_in: true },
      false,
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      const listData = apiRes.data.contact_list;

      setContactList(
        listData
          .filter((f) => h.notEmpty(f.contact_count))
          .map((m) => ({ value: m, label: m.list_name })),
      );
    }
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
      setQuickReplyBtns([]);
      setPreviewData([]);
    }
  }

  return (
    <>
      <div id="messaging-root" className="layout-v">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading}>
          <div className="messaging-container modern-style">
            <div
              className="message-body"
              style={{
                width: '100%',
                padding: '10px',
                overflow: 'auto',
                paddingBottom: '100px',
              }}
            >
              <div className="">
                <div className="pl-3 pr-3 pb-2">
                  <div className="d-flex justify-content-between">
                    <h1
                      style={{
                        fontFamily: 'PoppinsRegular',
                        textIndent: '-15px',
                        lineHeight: '55px',
                        fontSize: '20px',
                      }}
                    >
                      Edit WhatsApp Campaign Draft
                    </h1>
                  </div>
                </div>
                <div
                  className="d-flex justify-content-between "
                  style={{ gap: '3em' }}
                >
                  <div
                    style={{
                      flexGrow: 1,
                    }}
                    className="d-flex  flex-column"
                  >
                    <div className="d-flex campaign-create-form mt-3">
                      <label>
                        Campaign Name<small>*</small>
                      </label>
                      <div>
                        <input
                          placeholder="Enter campaign name"
                          type="text"
                          value={form.campaign_name}
                          className={`form-item ${
                            fieldError && h.isEmpty(form.campaign_name)
                              ? 'field-error'
                              : ''
                          }`}
                          onChange={(e) =>
                            onChange(e.target.value, 'campaign_name')
                          }
                        />
                      </div>
                    </div>

                    <div className="d-flex campaign-create-form mt-3">
                      <label>
                        Business Account<small>*</small>
                      </label>
                      <div>
                        <CommonSelect
                          id="waba_number"
                          options={[
                            ...wabaCredentials.map((m) => ({
                              value: m,
                              label: `${m.waba_name} [${m.waba_number}]`,
                            })),
                          ]}
                          value={form.waba_number}
                          isSearchable={true}
                          onChange={(v) => {
                            onChange(v, 'waba_number');
                            checkIfMatchingTemplateAndWabaNumber(v);
                          }}
                          placeholder="Select business account"
                          className="mt-2"
                          control={{
                            borderColor:
                              fieldError && h.isEmpty(form.waba_number)
                                ? '#fe5959'
                                : '',
                          }}
                        />
                      </div>
                    </div>
                    
                    {campaignType === 'templates' && (
                      <div className="d-flex campaign-create-form mt-3">
                        <label>
                          WhatsApp Template<small>*</small>
                        </label>
                        <div>
                          {whatsAppTemplates.map((wa_template, i) => {
                            let className = '';
                            if (i > 0) {
                              className = 'mt-2';
                            }
                            const template_name =
                              wa_template?.value?.template_name;
                            return (
                              <>
                                <div className="d-flex" key={i}>
                                  <div style={{ flex: 'auto' }}>
                                    <CommonSelect
                                      id={`whatsapp_template-${i}`}
                                      options={whatsAppTemplateList
                                        .filter(
                                          (m) =>
                                            m.status === 'APPROVED' &&
                                            m.waba_number === wabaNumber,
                                        ) // Filter only APPROVED templates
                                        .map((m) => ({
                                          value: m,
                                          label: h.general.sentenceCase(
                                            m.template_name,
                                          ),
                                        }))}
                                      value={
                                        h.notEmpty(whatsAppTemplates[i].value)
                                          ? whatsAppTemplates[i]
                                          : null
                                      }
                                      isSearchable={true}
                                      onChange={(v) => {
                                        const waTemplateClone = [
                                          ...whatsAppTemplates,
                                        ];
                                        waTemplateClone[i] = v;
                                        setWhatsAppTemplates(waTemplateClone);
                                      }}
                                      placeholder="Select template"
                                      className={className}
                                      control={{
                                        borderColor:
                                          fieldError &&
                                          (h.isEmpty(whatsAppTemplates) ||
                                            (h.notEmpty(whatsAppTemplates) &&
                                              whatsAppTemplates[0].value ===
                                                null))
                                            ? '#fe5959'
                                            : '',
                                      }}
                                    />
                                  </div>
                                </div>
                                {!h.isEmpty(quickReplyBtns[template_name]) && (
                                  <>
                                    <div className="mt-3">
                                      Auto Responses for {wa_template.label}
                                    </div>
                                    <QuickReplyResponses
                                      buttons={quickReplyBtns[template_name]}
                                      form={form}
                                      quickReplySettings={quickReplySettings}
                                      setQuickReplySettings={
                                        setQuickReplySettings
                                      }
                                      whatsAppTemplateList={whatsAppTemplateList}
                                      setForm={setForm}
                                    />
                                  </>
                                )}
                              </>
                            );
                          })}
                          
                          <div id="textarea-container"></div>
                        </div>
                      </div>
                    )}

                    {campaignType === 'automation' && (
                      <>
                        <div className="d-flex campaign-create-form mt-3">
                          <label>
                            Select Automation Category<small>*</small>
                          </label>
                            <CommonSelect 
                              id="automationsCategoriesList"
                              placeholder="Select a category"
                              value={selectedCategory}
                              options={
                                automationsCategoriesList.map((list) => ({
                                  value: list.automation_category_id,
                                  label: h.general.sentenceCase(list.title)
                                })) 
                              }
                              onChange={handleCategoryChange}  
                              className=""
                              control={{
                                borderColor:
                                  fieldError && h.isEmpty(form.automationsCategoriesList)
                                    ? '#fe5959'
                                    : '',
                              }}
                            />
                        </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>Select automation<small>*</small></label>
                            <CommonSelect
                              value={selectedRule}
                              options={listRules.map((rule) => ({
                                value: rule.automation_rule_id,
                                label: h.general.sentenceCase(rule.name)
                              }))}
                              onChange={(v) => {
                                onChange(v, v.label);
                                setSelectedRule(v)
                              }}
                              placeholder="Select automation"
                              isDisabled={rulesResStatus !== 'SUCCESS'}
                            />
                          </div>
                      </>
                    )}

                    <div className="d-flex campaign-create-form mt-3">
                      <label>
                        Contact lists<small>*</small>
                      </label>
                      <div a>
                        <div>
                          <CommonSelect
                            id="contact_lists"
                            options={contactList}
                            value={form.contact_lists}
                            isSearchable={true}
                            onChange={(v) => onChange(v, 'contact_lists')}
                            placeholder="Select contact list"
                            className=""
                            multiple={true}
                            control={{
                              borderColor:
                                fieldError && h.isEmpty(form.contact_lists)
                                  ? '#fe5959'
                                  : '',
                            }}
                          />
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <span style={{ color: '#686868' }}>
                            (
                            {form.contact_lists
                              ?.filter((f) =>
                                h.notEmpty(f.value?.contact_count),
                              )
                              .map((m) => m.value?.contact_count?.count)
                              .reduce((a, b) => a + b, 0)}
                            ) Contacts
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex campaign-create-form mt-3">
                      <label>
                        Schedule<small>*</small>
                      </label>
                      <div>
                        <CommonSelect
                          id="schedule"
                          options={SCHEDULE_OPTIONS}
                          value={form.schedule}
                          isSearchable={true}
                          onChange={(v) => onChange(v, 'schedule')}
                          placeholder="Select schedule"
                          className=""
                        />
                      </div>
                    </div>
                    {form.schedule?.value === 1 && (
                      <>
                        <div className="d-flex campaign-create-form mt-3">
                          <label>
                            Staggered Send<small>*</small>
                          </label>
                          <div>
                            <button
                              type="button"
                              className={`header-none-btn w ${
                                form.staggered === 'no' ? 'active' : ''
                              }`}
                              onClick={() => onChange('no', 'staggered')}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              className={`header-none-btn w ${
                                form.staggered === 'yes' ? 'active' : ''
                              }`}
                              onClick={() => onChange('yes', 'staggered')}
                            >
                              Yes
                            </button>
                            <hr />

                            {form.staggered === 'yes' && (
                              <>
                                {whatsAppTemplateSchedule.map((item, i) => (
                                  <ScheduleForm
                                    key={i}
                                    index={i}
                                    staggered={true}
                                    item={item}
                                    contactsCount={form.contact_lists
                                      ?.filter((f) =>
                                        h.notEmpty(f.value?.contact_count),
                                      )
                                      .map((m) => m.value?.contact_count?.count)
                                      .reduce((a, b) => a + b, 0)}
                                    form={whatsAppTemplateSchedule}
                                    setForm={setWhatsAppTemplateSchedule}
                                    handleRemoveSchedule={handleRemoveSchedule}
                                    minDate={
                                      i === 0
                                        ? moment().toDate()
                                        : whatsAppTemplateSchedule[i - 1]
                                            .datetime
                                    }
                                  />
                                ))}

                                <div className="d-flex justify-content-between mt-2">
                                  <span style={{ color: '#686868' }}>
                                    {getCountValues()}
                                  </span>
                                </div>
                                <button
                                  className="common-button-2 mt-4 text-normal"
                                  type="button"
                                  onClick={handleAddSchedule}
                                  style={{ width: '160px !important' }}
                                  disabled={
                                    whatsAppTemplateSchedule
                                      .map((m) =>
                                        m.recipient_count !== ''
                                          ? parseInt(m.recipient_count)
                                          : 0,
                                      )
                                      .reduce((a, b) => a + b) ===
                                    form.contact_lists
                                      ?.filter((f) =>
                                        h.notEmpty(f.value?.contact_count),
                                      )
                                      .map((m) => m.value?.contact_count?.count)
                                      .reduce((a, b) => a + b, 0)
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faPlus}
                                    color="#fff"
                                    style={{ marginRight: '5px' }}
                                  />
                                  Add Schedule
                                </button>
                              </>
                            )}

                            {form.staggered === 'no' && (
                              <>
                                <ScheduleForm
                                  key={'staggered'}
                                  index={0}
                                  staggered={false}
                                  contactsCount={form.contact_lists
                                    ?.filter((f) =>
                                      h.notEmpty(f.value?.contact_count),
                                    )
                                    .map((m) => m.value?.contact_count?.count)
                                    .reduce((a, b) => a + b, 0)}
                                  item={whatsAppTemplateSchedule[0]}
                                  form={whatsAppTemplateSchedule}
                                  setForm={setWhatsAppTemplateSchedule}
                                  handleRemoveSchedule={handleRemoveSchedule}
                                  minDate={moment().toDate()}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="d-flex campaign-create-form mt-3">
                      <label>Additional Email Notification Recipients</label>
                      <div style={{ width: '100px' }}>
                        <input
                          type="text"
                          value={agency?.agency_campaign_additional_recipient}
                          className="form-item"
                          onChange={(e) =>
                            onChange(
                              e.target.value,
                              'campaign_notification_additional_recipients',
                            )
                          }
                        />
                        <sub>
                          Note: This field is used for additional email
                          notification recipients. Add comma (,) as separator.
                        </sub>
                      </div>
                    </div>

                    <div className="d-flex campaign-create-form mt-3">
                      <label></label>
                      <div>
                        <button
                          className="common-button transparent-bg mt-4 mr-2 text-normal"
                          type="button"
                          onClick={handleDraft}
                          disabled={h.isEmpty(form.campaign_name)}
                        >
                          Save Draft
                        </button>
                        <button
                          className="common-button light-red mt-4 mr-2 text-normal"
                          type="button"
                          style={{
                            backgroundColor: '#fe5959 !important',
                            borderColor: '#fe5959 !important',
                          }}
                          onClick={handleDeleteDraft}
                        >
                          Delete Draft
                        </button>
                        <button
                          className="common-button mt-4 mr-2 text-normal w-150"
                          type="button"
                          onClick={handleReview}
                        >
                          Submit for Review
                        </button>
                      </div>
                      <div
                        className="campaign-create-form"
                        style={{
                          textAlign: 'right',
                          display:
                            !h.isEmpty(approverIDs) &&
                            approverIDs.includes(agencyUserId)
                              ? 'block'
                              : 'none',
                        }}
                      >
                        <button
                          className="common-button-2 mt-4 text-normal"
                          type="button"
                          onClick={handleSubmit}
                        >
                          Initiate Campaign
                        </button>
                      </div>
                    </div>
                  </div>
                  {form.campaign_type === 'templates' && (
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
                          header: m.headerImg ? 'image' : 'none',
                          image: m.headerImg !== 'none' ? m.headerImg : false,
                          isFormatted: false,
                          formattedBody: m.body ?? false,
                        }))}
                      />
                    </div>
                  )}
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
