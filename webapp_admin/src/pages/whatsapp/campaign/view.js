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
import ScheduleForm from '../../../components/WhatsApp/ScheduleFormView';
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
  const [draftStatus, setDraftStatus] = useState('');

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

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      setLoading(true);
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const agency = apiRes.data.agencyUser.agency;
        getTemplates(agency.agency_id);
        // getLandingPages(agency.agency_id);
        setAgency(agency);
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
        getList(agency.agency_id);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (
        !h.isEmpty(campaign_draft_id) &&
        !h.isEmpty(contactList) &&
        !h.isEmpty(wabaCredentials)
      ) {
        const draftRes = await api.campaignSchedule.getCampaignDraft(
          campaign_draft_id,
          false,
        );
        if (h.cmpStr(draftRes.status, 'ok')) {
          const draftStat = draftRes.data.campaign_draft.status;
          setDraftStatus(draftStat.toUpperCase());
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
          setForm(configurations);
        }
        setLoading(false);
      }
    })();
  }, [campaign_draft_id, contactList, wabaCredentials]);

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

  function formatTeplateName(input) {
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  }

  function handleSubmit() {
    h.general.prompt(
      {
        message: 'Are you sure you want to submit this new campaign?',
      },

      async (submitCampaign) => {
        if (h.cmpBool(submitCampaign, true)) {
          setLoading(true);
          const templates = [];
          if (
            h.isEmpty(form.campaign_name) ||
            h.isEmpty(form.waba_number) ||
            h.isEmpty(whatsAppTemplates[0].value) ||
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
              templates: templates,
              contact_list: form.contact_lists,
              sms: false,
              whatsApp: true,
              email: false,
              add_owner: false,
              trigger_quick_reply: false,
              trigger_add_image: false,
              selected_images: [],
              is_generic: false,
              is_template: form.campaign_type === 'automation' ? false : true,
              selected_waba_credentials_id:
                form.waba_number.value.agency_whatsapp_config_id,
              api_token: form.waba_number.value.agency_whatsapp_api_token,
              api_secret: form.waba_number.value.agency_whatsapp_api_secret,
              permalink_template: !h.isEmpty(form.landing_page)
                ? form.landing_page.value.landing_page_slug
                : 'pave',
              event_name: '',
              event_details: '',
              campaign_notification_additional_recipients: '',
              is_confirmation: h.cmpStr(form.confirmation, 'yes'),
              cta_response: qrAutoResponses,
              schedule: form.schedule,
              staggered: h.cmpStr(form.staggered, 'yes'),
              timing: whatsAppTemplateSchedule,
              event_details: form.event_details,
              event_name: form.event_name,
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

  function handleDraft() {
    h.general.prompt(
      {
        message: 'Are you sure you want to save campaign as draft?',
      },

      async (submitCampaign) => {
        if (h.cmpBool(submitCampaign, true)) {
          setLoading(true);
          const templates = [];

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
            templates: templates,
            contact_list: form.contact_lists,
            sms: false,
            whatsApp: true,
            email: false,
            add_owner: false,
            trigger_quick_reply: false,
            trigger_add_image: false,
            selected_images: [],
            is_generic: false,
            is_template: form.campaign_type === 'automation' ? false : true,
            selected_waba_credentials_id:
              form.waba_number.value.agency_whatsapp_config_id,
            api_token: form.waba_number.value.agency_whatsapp_api_token,
            api_secret: form.waba_number.value.agency_whatsapp_api_secret,
            permalink_template: !h.isEmpty(form.landing_page)
              ? form.landing_page.value.landing_page_slug
              : 'pave',
            event_name: '',
            event_details: '',
            campaign_notification_additional_recipients: '',
            is_confirmation: h.cmpStr(form.confirmation, 'yes'),
            cta_response: qrAutoResponses,
            schedule: form.schedule,
            staggered: h.cmpStr(form.staggered, 'yes'),
            timing: whatsAppTemplateSchedule,
            event_details: form.event_details,
            event_name: form.event_name,
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

  function handleReview() {
    h.general.prompt(
      {
        message:
          'Are you sure you want to save and submit campaign for review?',
      },

      async (submitCampaign) => {
        if (h.cmpBool(submitCampaign, true)) {
          setLoading(true);
          const templates = [];

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
            templates: templates,
            contact_list: form.contact_lists,
            sms: false,
            whatsApp: true,
            email: false,
            add_owner: false,
            trigger_quick_reply: false,
            trigger_add_image: false,
            selected_images: [],
            is_generic: false,
            is_template: form.campaign_type === 'automation' ? false : true,
            selected_waba_credentials_id:
              form.waba_number.value.agency_whatsapp_config_id,
            api_token: form.waba_number.value.agency_whatsapp_api_token,
            api_secret: form.waba_number.value.agency_whatsapp_api_secret,
            permalink_template: !h.isEmpty(form.landing_page)
              ? form.landing_page.value.landing_page_slug
              : 'pave',
            event_name: '',
            event_details: '',
            campaign_notification_additional_recipients: '',
            is_confirmation: h.cmpStr(form.confirmation, 'yes'),
            cta_response: qrAutoResponses,
            schedule: form.schedule,
            staggered: h.cmpStr(form.staggered, 'yes'),
            timing: whatsAppTemplateSchedule,
            event_details: form.event_details,
            event_name: form.event_name,
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

  function handleAddTemplate() {
    const waTemplateClone = [...whatsAppTemplates];
    waTemplateClone.push({ value: '' });

    setWhatsAppTemplates(waTemplateClone);
  }

  function handleRemoveTemplate(index) {
    const waTemplateClone = [...whatsAppTemplates];
    waTemplateClone.splice(index, 1);

    setWhatsAppTemplates(waTemplateClone);
  }

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

  function handleRemoveSchedule(index) {
    const waScheduleClone = [...whatsAppTemplateSchedule];
    waScheduleClone.splice(index, 1);

    setWhatsAppTemplateSchedule(waScheduleClone);
  }

  async function getTemplates(id) {
    setStatus(constant.API_STATUS.PENDING);
    const apiRes = await api.whatsapp.listTemplates({ agency_id: id });

    if (h.cmpStr(apiRes.status, 'ok')) {
      setWhatsAppTemplateList(apiRes.data.agency_waba_templates);
    }
    setStatus(constant.API_STATUS.FULLFILLED);
  }

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
                      View WhatsApp Campaign Draft
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
                          disabled={true}
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
                          onChange={(v) => onChange(v, 'waba_number')}
                          placeholder="Select business account"
                          className="mt-2"
                          control={{
                            borderColor:
                              fieldError && h.isEmpty(form.waba_number)
                                ? '#fe5959'
                                : '',
                          }}
                          disabled={true}
                        />
                      </div>
                    </div>

                    {form.campaign_type === 'templates' && (
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
                                      disabled={true}
                                    />
                                  </div>
                                  <div className="center-body">
                                    {whatsAppTemplates.length > 1 && (
                                      <CommonTooltip tooltipText={'Remove'}>
                                        <FontAwesomeIcon
                                          icon={faTrashAlt}
                                          color="grey"
                                          style={{
                                            marginRight: '10px',
                                            marginLeft: '10px',
                                            cursor: 'pointer',
                                          }}
                                          // onClick={() => handleRemoveTemplate(i)}
                                        />
                                      </CommonTooltip>
                                    )}
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
                                      disabled={true}
                                    />
                                  </>
                                )}
                              </>
                            );
                          })}
                          <button
                            className="common-button mt-2 text-normal"
                            type="button"
                            style={{ width: '150px !important' }}
                            disabled={true}
                          >
                            <FontAwesomeIcon
                              icon={faPlus}
                              color="#fff"
                              style={{ marginRight: '5px' }}
                            />
                            Add template
                          </button>
                          <div id="textarea-container"></div>
                        </div>
                      </div>
                    )}

                    {form.campaign_type === 'automation' && (
                      <>
                        <div className="d-flex campaign-create-form mt-3">
                          <label>
                            Select Automation Category<small>*</small>
                          </label>
                            <CommonSelect
                              placeholder="Select a category"
                              value={form.automations[0].category}
                              disabled={true}
                            />
                        </div>

                        <div className="d-flex campaign-create-form mt-3">
                          <label>Select automation<small>*</small></label>
                          <CommonSelect
                            value={form.automations[0].automation_rule_id}
                            placeholder="Select automation"
                            disabled={true}
                          />
                        </div>
                      </>
                    )}

                    <div className="d-flex campaign-create-form mt-3">
                      <label>
                        Contact lists<small>*</small>
                      </label>
                      <div style={{ width: '100px' }}>
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
                            disabled={true}
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
                          disabled={true}
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
                              disabled={true}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              className={`header-none-btn w ${
                                form.staggered === 'yes' ? 'active' : ''
                              }`}
                              onClick={() => onChange('yes', 'staggered')}
                              disabled={true}
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
                                    minDate={
                                      i === 0
                                        ? moment().toDate()
                                        : whatsAppTemplateSchedule[i - 1]
                                            .datetime
                                    }
                                    disabled={true}
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
                                  style={{ width: '160px !important' }}
                                  disabled={true}
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
                                  minDate={moment().toDate()}
                                  disabled={true}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* <div className="d-flex campaign-create-form mt-3">
                      <label>Landing Page</label>
                      <div>
                        <div>
                          <CommonSelect
                            id="schedule"
                            options={customLandingPages.map((m) => ({
                              value: m,
                              label: m.landing_page_name,
                            }))}
                            value={form.landing_page || null}
                            isSearchable={true}
                            onChange={(v) => onChange(v, 'landing_page')}
                            placeholder="Select landing page"
                            className=""
                            disabled={true}
                          />
                          {form.landing_page && (
                            <div className="d-flex justify-content-between mt-2">
                              <span style={{ color: '#686868' }}> </span>
                              <span
                                style={{
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                                onClick={async () => {
                                  window.open(
                                    h.route.getRoute(
                                      routes.dashboard['products.preview'],
                                      {
                                        slug: form.landing_page?.value
                                          ?.landing_page_slug,
                                      },
                                    ),

                                    '_blank',
                                  );
                                }}
                              >
                                View Preview
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div> */}

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
                          disabled={true}
                        />
                        <sub>
                          Note: This field is used for additional email
                          notification recipients. Add comma (,) as separator.
                        </sub>
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
