import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { h } from '../helpers';
import { api } from '../api';
import { config } from '../configs/config';
import Prism from 'prismjs';
import { routes } from '../configs/routes';
import { faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { TagsInput } from 'react-tag-input-component';
import CommonSelect from '../components/Common/CommonSelect';
import IconChevronLeft from '../components/ProposalTemplate/Link/preview/components/Icons/IconChevronLeft';
import SalesforceFieldMapping from '../components/TEC/SalesforceFieldMapping';
import CommonTooltip from '../components/Common/CommonTooltip';
import Link from 'next/link';
const constant = require('../constants/constant.json');

const timeIntervals = [
  '12:00am',
  '01:00am',
  '02:00am',
  '03:00am',
  '04:00am',
  '05:00am',
  '06:00am',
  '07:00am',
  '08:00am',
  '09:00am',
  '10:00am',
  '11:00am',
  '12:00pm',
  '01:00pm',
  '02:00pm',
  '03:00pm',
  '04:00pm',
  '05:00pm',
  '06:00pm',
  '07:00pm',
  '08:00pm',
  '09:00pm',
  '10:00pm',
  '11:00pm',
];

const salesforTransmission = ['Contact', 'Lead'];

const chatFrequency = ['A few minutes', 'A few hours', 'Reply instantly'];

const defaultLiveChatStyle = {
  logoUrl: 'https://cdn.yourpave.com/assets/chaaat-logo.png',
  backgroundImage: '',
  backgroundColor: '#182327',
  textColor: '#ffffff',
  bgBtnColor: '#4779fd',
  textBtnColor: '#ffffff',
  chatHeaderColor: '#182327',
  chatHeaderTextColor: '#ffffff',
  inputBoxBgColor: '#182327',
  inputBoxTextColor: '#ffffff',
  triggerLogo: 'https://cdn.yourpave.com/pave-chat/chaaat-logo-1.png',
};

export default React.memo(() => {
  const router = useRouter();
  const [campaignEmails, setCampaignEmails] = useState([]);
  const [agencyUserId, setAgencyUserId] = useState(null);
  const [campaignAddedRecipients, setCampaignAddedRecipients] = useState([]);
  const [agencyType, setAgencyType] = useState(null);
  const [agencyId, setAgencyId] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState([]);
  const [emailText, setEmailText] = useState('');
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [defaultUserOwner, setDefaultUserOwner] = useState({});
  const [defaultUserOwnerID, setDefaultUserOwnerID] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPave, setIsPave] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [approverAgentIds, setApproverAgentIds] = useState(null);
  const [settingPage, setSettingPage] = useState('general');
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [secretReveal, setSecretReveal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [disableCampaignNotification, setDisableCampaignNotification] = useState(false)
  const [liveChatSetting, setLiveChatSetting] = useState({
    live_chat_settings_id: null,
    agency_id: null,
    agency_user_id: null,
    allowed_domain: '',
    chat_start_time: {},
    chat_end_time: {},
    chat_frequency: {},
    waba_number: '',
    salesforce_enabled: false,
    salesforce_transmission_type: {
      label: 'Contact',
      value: 'Contact',
    },
    salesforce_chat_logs_transmission_enabled: false,
    salesforce_chat_logs_transmission_field: '',
    whatsapp_salesforce_enabled: false,
    line_salesforce_enabled: false,
    styles: defaultLiveChatStyle,
    api_url: '',
    api_token: '',
  });
  const [liveChatSettingOriginal, setLiveChatSettingOriginal] = useState(null);
  const [api_client_secret_disabled, setApi_client_secret_disabled] =
    useState(true);
  const api_client_secret_disabledRef = useRef(null);

  const [api_client_id_disabled, setApi_client_id_disabled] = useState(true);
  const api_client_id_disabledRef = useRef(null);

  const [api_update_token_disabled, setApi_update_token_disabled] =
    useState(true);
  const api_update_token_disabledRef = useRef(null);

  const [api_token_disabled, setApi_token_disabled] = useState(true);
  const api_token_disabledRef = useRef(null);
  const [role, setRole] = useState(null);

  const [
    salesforceDirectIntegrationStatus,
    setSalesforceDirectIntegrationStatus,
  ] = useState(null);

  const [style, setStyle] = useState(defaultLiveChatStyle);

  useEffect(() => {
    (async () => {
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyType(apiRes.data.agencyUser.agency.real_estate_type);
        setAgencyId(apiRes.data.agencyUser.agency.agency_id);
        setCurrentUser(apiRes.data?.agencyUser?.user);
        const paveEmail = 'yourpave.com';
        const chaaatEmail = 'chaaat.io';
        const currentUserEmail = apiRes.data?.agencyUser?.user?.email;
        if (h.notEmpty(apiRes.data.agencyUser?.user?.user_roles[0].user_role)) {
          setRole(apiRes.data.agencyUser?.user?.user_roles[0].user_role);
        }
        setIsPave(
          currentUserEmail.includes(paveEmail) ||
            currentUserEmail.includes(chaaatEmail),
        );
        setCampaignAddedRecipients(
          apiRes.data.agencyUser.agency.agency_campaign_additional_recipient
            ? apiRes.data.agencyUser.agency.agency_campaign_additional_recipient.split(
                ',',
              )
            : [],
        );
        setDisableCampaignNotification(
          apiRes.data.agencyUser?.agency?.campaign_notification_disable ?? false
        );
        setDefaultUserOwnerID(
          apiRes.data.agencyUser.agency.default_outsider_contact_owner,
        );
        setApproverAgentIds(
          apiRes.data.agencyUser.agency.campaign_approval_agent,
        );
        const settingsApi = await api.emailNotification.getSettings(
          {
            agency_user_id: apiRes.data.agencyUser.agency_user_id,
          },
          false,
        );

        if (h.cmpStr(settingsApi.status, 'ok')) {
          const settingClone = [
            ...settingsApi.data.email_notification_settings,
          ];
          const allSettings = settingsApi.data.email_notification_settings.map(
            (m) => m.notification_type,
          );
          for (const s in constant.EMAIL_NOTIFICATION_TYPE) {
            if (!allSettings.includes(constant.EMAIL_NOTIFICATION_TYPE[s])) {
              settingClone.push({
                notification_type: constant.EMAIL_NOTIFICATION_TYPE[s],
                status: defaultValue(constant.EMAIL_NOTIFICATION_TYPE[s]),
              });
            }
          }
          setEmailNotifications(settingClone);
        }
        setAgencyUserId(apiRes.data.agencyUser.agency_user_id);
        const getSalesforceIntegration =
          await api.integrations.getSalesforceActiveIntegration(
            {
              agency_id: apiRes.data.agencyUser.agency.agency_id,
            },
            false,
          );

        if (h.cmpStr(getSalesforceIntegration.status, 'ok')) {
          const { agency_oauth } = getSalesforceIntegration.data;
          setSalesforceDirectIntegrationStatus(agency_oauth.status);
        }
      }
    })();
  }, []);

  useEffect(() => {
    //Fetch list of agency users
    (async () => {
      setLoading(true);
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const agencyUsersRes = await api.agencyUser.getAgencyUsers(
          { agency_fk: apiRes.data.agencyUser.agency_fk },
          false,
        );
        const agencyUsersList = await handleOptionList(
          agencyUsersRes.data.agency_users,
        );

        const cO = agencyUsersList.filter(
          (f) =>
            f.value ===
            apiRes.data.agencyUser.agency?.default_outsider_contact_owner,
        );
        setAgencyUsers(agencyUsersList);
        setDefaultUserOwner(cO);

        const liveChatSettingRes = await api.setting.get(
          apiRes.data.agencyUser.agency_fk,
          false,
        );
        setIsNew(h.isEmpty(liveChatSettingRes.data.liveChatSetting));
        let wabaNumbers = [];

        if (apiRes.data.agencyUser?.agency?.agency_config?.whatsapp_config) {
          const whatsapp_config = JSON.parse(
            apiRes.data.agencyUser?.agency?.agency_config?.whatsapp_config,
          );
          if (
            !h.isEmpty(whatsapp_config) &&
            !h.isEmpty(whatsapp_config.is_enabled) &&
            h.cmpBool(whatsapp_config.is_enabled, true)
          ) {
            //get available agency waba credentials
            const credentials =
              await api.whatsapp.getAgencyWhatsAppConfigurations(
                apiRes.data.agencyUser.agency_fk,
                false,
              );

            wabaNumbers = credentials.data.agency_whatsapp_config;
            setWabaCredentials(credentials.data.agency_whatsapp_config);
          }
        }

        const liveChatConfig = {
          ...liveChatSetting,
          ...(liveChatSettingRes.data.liveChatSetting
            ? {
                ...liveChatSettingRes.data.liveChatSetting,
                chat_start_time: {
                  label:
                    liveChatSettingRes.data.liveChatSetting.chat_start_time,
                  value:
                    liveChatSettingRes.data.liveChatSetting.chat_start_time,
                },
                chat_end_time: {
                  label: liveChatSettingRes.data.liveChatSetting.chat_end_time,
                  value: liveChatSettingRes.data.liveChatSetting.chat_end_time,
                },
                chat_frequency: {
                  label: liveChatSettingRes.data.liveChatSetting.chat_frequency,
                  value: liveChatSettingRes.data.liveChatSetting.chat_frequency,
                },
                waba_number: wabaNumbers
                  .map((m) => ({
                    value: m,
                    label: `${m.waba_name} [${m.waba_number}]`,
                  }))
                  .find(
                    (waba) =>
                      waba.waba_number ===
                      liveChatSettingRes.data.liveChatSetting.waba_name,
                  ),
                salesforce_enabled:
                  liveChatSettingRes.data.liveChatSetting.salesforce_enabled,
                salesforce_transmission_type: {
                  label:
                    liveChatSettingRes.data.liveChatSetting
                      .salesforce_transmission_type ?? 'Contact',
                  value:
                    liveChatSettingRes.data.liveChatSetting
                      .salesforce_transmission_type ?? 'Contact',
                },
                salesforce_chat_logs_transmission_enabled:
                  liveChatSettingRes.data.liveChatSetting
                    .salesforce_chat_logs_transmission_enabled,
                salesforce_chat_logs_transmission_field:
                  liveChatSettingRes.data.liveChatSetting
                    .salesforce_chat_logs_transmission_field,
                whatsapp_salesforce_enabled:
                  liveChatSettingRes.data.liveChatSetting
                    .whatsapp_salesforce_enabled,
                line_salesforce_enabled:
                  liveChatSettingRes.data.liveChatSetting
                    .line_salesforce_enabled,
                styles: h.notEmpty(
                  liveChatSettingRes?.data?.liveChatSetting?.styles,
                )
                  ? JSON.parse(
                      liveChatSettingRes?.data?.liveChatSetting?.styles,
                    )
                  : defaultLiveChatStyle,
                api_url: liveChatSettingRes.data.liveChatSetting.api_url,
                api_token: liveChatSettingRes.data.liveChatSetting.api_token,
              }
            : {}),
          agency_user_id: liveChatSettingRes.data.liveChatSetting
            ? agencyUsersList.find(
                (f) =>
                  f.value ===
                  liveChatSettingRes.data.liveChatSetting.agency_user_fk,
              )
            : null,
          agency_id: agencyId,
        };

        setLiveChatSettingOriginal(liveChatConfig);
        setLiveChatSetting(liveChatConfig);
        if (liveChatSettingRes?.data?.liveChatSetting?.styles) {
          setStyle(JSON.parse(liveChatSettingRes.data.liveChatSetting.styles));
        } else {
          setStyle(defaultLiveChatStyle);
        }
      }
      setLoading(false);
    })();
  }, [agencyUserId]);

  useEffect(() => {
    setDefaultUserOwnerID(defaultUserOwner.value);
  }, [defaultUserOwner]);

  useEffect(() => {
    if (!h.isEmpty(approverAgentIds)) {
      const selectedApproverAgentIds = approverAgentIds.split(',');
      const selectedApprovers = [];
      selectedApproverAgentIds.forEach((agentId) => {
        const agent = agencyUsers.filter((f) => f.value === agentId);
        selectedApprovers.push(agent[0]);
      });
      if (!h.isEmpty(selectedApprovers)) {
        setApprovers(selectedApprovers);
      }
    }
  }, [agencyUsers]);

  const handleOptionList = async (agencyUsersList) => {
    let options = [];
    agencyUsersList.forEach((agencyUser) => {
      let details = {};
      details.value = agencyUser.agency_user_id;
      details.label = agencyUser.user.full_name;
      options.push(details);
    });
    return options;
  };

  const getSettings = (v) => {
    const setting = h.notEmpty(emailNotifications)
      ? emailNotifications.find((f) => f.notification_type === v)
      : null;
    return setting?.status;
  };

  function handleChangeValue(v) {
    const settingsClone = [...emailNotifications];
    const settingIndex = emailNotifications.findIndex(
      (f) => f.notification_type === v,
    );

    settingsClone[settingIndex].status = !settingsClone[settingIndex].status;
    setEmailNotifications(settingsClone);
  }

  async function handleUpdate() {
    if (settingPage === 'general') {
      const settingsApi = await api.emailNotification.save(
        {
          agency_user_id: agencyUserId,
          settings: emailNotifications,
        },
        false,
      );

      // Update Campaign Recipients
      await handleUpdateCampaignRecipientsAndDefaultOwner();

      // Update Campaign Approver
      await handleUpdateCampaignApprovers();

      if (h.cmpStr(settingsApi.status, 'ok')) {
        h.general.alert('success', {
          message: 'Email settings successfully updated',
        });
      }
    } else if (
      settingPage === 'live-chat' ||
      settingPage === 'whatsapp-plugin'
    ) {
      const newForm = liveChatSetting;
      newForm.salesforce_transmission_type =
        newForm.salesforce_transmission_type?.value ?? null;
      newForm.agency_user_id = newForm.agency_user_id?.value ?? null;
      newForm.chat_start_time = newForm.chat_start_time?.value ?? null;
      newForm.chat_end_time = newForm.chat_end_time?.value ?? null;
      newForm.chat_frequency = newForm.chat_frequency?.value ?? null;
      newForm.waba_number = newForm.waba_number?.valueOf?.waba_number ?? null;
      newForm.styles = JSON.stringify(style);
      delete newForm.api_url;
      delete newForm.api_token;
      delete newForm.api_update_token;
      delete newForm.api_client_secret;
      delete newForm.api_client_id;
      delete newForm.api_data_pull_url;
      delete newForm.api_oauth_url;
      delete newForm.api_update_url;

      if (!liveChatSetting.live_chat_settings_id) {
        const createRes = await api.setting.create(newForm, true);
        if (h.cmpStr(createRes.status, 'ok')) {
          window.location.href = window.location.href;
        }
      } else {
        const updateRes = await api.setting.update(newForm, true);
        if (h.cmpStr(updateRes.status, 'ok')) {
          window.location.href = window.location.href;
        }
      }
    } else if (settingPage === 'salesforce') {
      // Validations
      if (
        (h.isEmpty(liveChatSetting.api_url) ||
          liveChatSetting.api_url === '') &&
        h.notEmpty(liveChatSetting.api_token) &&
        liveChatSetting.api_token !== false
      ) {
        h.general.alert('error', {
          message: 'Please fill in create record API URL',
        });
        return;
      }

      if (
        h.notEmpty(liveChatSetting.api_url) &&
        (h.isEmpty(liveChatSetting.api_token) ||
          liveChatSetting.api_token === false)
      ) {
        h.general.alert('error', {
          message: 'Please fill in create record API TOKEN',
        });
        return;
      }

      if (
        (h.isEmpty(liveChatSetting.api_update_url) ||
          liveChatSetting.api_update_url === '') &&
        h.notEmpty(liveChatSetting.api_update_token) &&
        liveChatSetting.api_update_token !== false
      ) {
        h.general.alert('error', {
          message: 'Please fill in update record API URL',
        });
        return;
      }

      if (
        h.notEmpty(liveChatSetting.api_update_url) &&
        (h.isEmpty(liveChatSetting.api_update_token) ||
          liveChatSetting.api_update_token === false)
      ) {
        h.general.alert('error', {
          message: 'Please fill in update record API TOKEN',
        });
        return;
      }

      const newForm = h.general.valuesChanged(
        liveChatSetting,
        liveChatSettingOriginal,
      );
      if (newForm?.salesforce_transmission_type) {
        newForm.salesforce_transmission_type =
          newForm.salesforce_transmission_type?.value ?? null;
      }

      if (isNew) {
        const createRes = await api.setting.create(
          { ...newForm, agency_id: agencyId },
          true,
        );
        if (h.cmpStr(createRes.status, 'ok')) {
          window.location.href = window.location.href;
        }
      } else {
        const updateRes = await api.setting.update(
          {
            ...newForm,
            live_chat_settings_id: liveChatSetting.live_chat_settings_id,
          },
          true,
        );
        if (h.cmpStr(updateRes.status, 'ok')) {
          window.location.href = window.location.href;
        }
      }
    }
  }

  async function handleUpdateCampaignRecipientsAndDefaultOwner() {
    const approverIds = approvers.map((m) => m.value);
    await api.agency.updateAgencyProfile(
      {
        agency_id: agencyId,
        agency_campaign_additional_recipient: campaignAddedRecipients.join(','),
        default_outsider_contact_owner: defaultUserOwnerID,
        campaign_approval_agent: approverIds.join(','),
        campaign_notification_disable: disableCampaignNotification
      },
      false,
    );
  }

  async function handleUpdateCampaignApprovers() {
    const approverIds = approvers.map((m) => m.value);
  }

  function mockValue(key) {
    if (liveChatSetting[key] === true) {
      return '••••••••••••••••••••••••••••';
    } else if (liveChatSetting[key] === false) {
      return '';
    } else {
      return liveChatSetting[key];
    }
  }
  function defaultValue(type) {
    switch (type) {
      // Email notifs that is default to false
      case constant.EMAIL_NOTIFICATION_TYPE.CREATE_NEW_LEAD:
      case constant.EMAIL_NOTIFICATION_TYPE.UPDATE_NEW_LEAD:
        return false;

      // Email notifs that is default to true
      case constant.EMAIL_NOTIFICATION_TYPE.ENGAGEMENT_SUMMARY:
      case constant.EMAIL_NOTIFICATION_TYPE.WEEKLY_SUMMARY:
      case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_RATING:
      case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_PROPERTY_RESERVE:
      case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_ENQUIRY:
      case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_COMMENT:
        return true;
      default:
        return false;
    }
  }

  function removeEmail(index) {
    const arr = [...campaignAddedRecipients];
    arr.splice(index, 1);

    setCampaignAddedRecipients(arr);
  }

  async function initializeMediaAndDocPulling() {
    setLoading(true);
    const apiRes = await api.whatsapp.initializeMediaAndDocPulling({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }

  function handeAddApprover(v) {
    const exist = approvers.find((f) => f.value === v.value);
    if (h.isEmpty(exist)) {
      setApprovers((p) => [...p, v]);
    }
  }

  function removeApprover(index) {
    const arr = [...approvers];
    arr.splice(index, 1);

    setApprovers(arr);
  }

  const copyToClipBoard = async (permalink, e) => {
    if (e) e.preventDefault();
    if (!navigator.clipboard) {
      return console.log('copy not supported');
    }
    try {
      await navigator.clipboard.writeText(permalink);
      h.general.alert('success', { message: 'Copied!', autoCloseInSecs: 1 });
    } catch (err) {
      h.general.alert('error', { message: 'Copy failed', autoCloseInSecs: 1 });
    }
  };

  function onBlur(key, setDisable) {
    if (liveChatSetting[key] === '') {
      setLiveChatSetting({
        ...liveChatSetting,
        [key]: liveChatSettingOriginal[key],
      });
    }

    setDisable(true);
  }

  return (
    <div className="contacts-root layout-v">
      <Header
        className={
          'container dashboard-contacts-container common-navbar-header '
        }
      />
      <Body
        isLoading={isLoading}
        className=" bg-white overflow-auto f-auto"
      >
        <div className="n-banner">
          <div className="container dashboard-contacts-container contacts-container">
            <div className="messaging-wrapper-header">
              <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
                  <div>
                    <h1>Settings</h1>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container d-flex" style={{ gap: '1em' }}>
          <div className="settings-nav" style={{ minWidth: '22%' }}>
            <span
              className={settingPage === 'general' ? 'active' : ''}
              onClick={() => setSettingPage('general')}
            >
              General
            </span>
            <span
              className={settingPage === 'live-chat' ? 'active' : ''}
              onClick={() => setSettingPage('live-chat')}
            >
              Live Chat Integration
            </span>
            <span
              className={settingPage === 'whatsapp-plugin' ? 'active' : ''}
              onClick={() => setSettingPage('whatsapp-plugin')}
            >
              WhatsApp Plugin
            </span>
            <span
              className={settingPage === 'salesforce' ? 'active' : ''}
              onClick={() => setSettingPage('salesforce')}
            >
              Salesforce Integration
            </span>
            {(liveChatSetting.salesforce_enabled ||
              liveChatSetting.whatsapp_salesforce_enabled ||
              liveChatSetting.line_salesforce_enabled) && (
              <span
                className={settingPage === 'field-mapping' ? 'active' : ''}
                onClick={() => setSettingPage('field-mapping')}
              >
                Field mapping of SFDC
              </span>
            )}
          </div>
          <section
            className="settings-wrapper"
            style={{ width: '100%', paddingRight: '30px' }}
          >
            {settingPage === 'live-chat' && (
              <>
                <div className="d-flex ">
                  <div className="notif-list">
                    <h1>Settings</h1>
                    <label>Assigned chat agent</label>
                    <CommonSelect
                      id="assign_agent_select"
                      options={agencyUsers}
                      value={liveChatSetting.agency_user_id ?? null}
                      isSearchable={true}
                      onChange={(e) => {
                        setLiveChatSetting({
                          ...liveChatSetting,
                          agency_user_id: e,
                        });
                      }}
                      placeholder="Select assigned agent"
                      className=""
                      control={{
                        height: 40,
                        minHeight: 40,
                        borderRadius: 8,
                      }}
                    />
                    <em>Assigned agent in the live chat plugin</em>
                    <br />
                    <br />
                    <h1>Time available</h1>
                    <div className="d-flex time-a">
                      <div>
                        <label>Start time</label>
                        <CommonSelect
                          id="start_time"
                          options={timeIntervals.map((m) => ({
                            label: m,
                            value: m,
                          }))}
                          value={liveChatSetting.chat_start_time ?? null}
                          isSearchable={true}
                          onChange={(e) => {
                            setLiveChatSetting({
                              ...liveChatSetting,
                              chat_start_time: e,
                            });
                          }}
                          placeholder="Select start time"
                          className=""
                          control={{
                            height: 40,
                            minHeight: 40,
                            borderRadius: 8,
                          }}
                        />
                      </div>
                      <div>
                        <label>End time</label>
                        <CommonSelect
                          id="end_time"
                          options={timeIntervals.map((m) => ({
                            label: m,
                            value: m,
                          }))}
                          value={liveChatSetting.chat_end_time ?? null}
                          isSearchable={true}
                          onChange={(e) => {
                            setLiveChatSetting({
                              ...liveChatSetting,
                              chat_end_time: e,
                            });
                          }}
                          placeholder="Select end time"
                          className=""
                          control={{
                            height: 40,
                            minHeight: 40,
                            borderRadius: 8,
                          }}
                        />
                      </div>
                    </div>
                    <br />
                    <h1>Chat frequency</h1>
                    <div className="d-flex time-a">
                      <div>
                        <label>How frequent agent to reply</label>
                        <CommonSelect
                          id="end_time"
                          options={chatFrequency.map((m) => ({
                            label: m,
                            value: m,
                          }))}
                          value={liveChatSetting.chat_frequency ?? null}
                          isSearchable={true}
                          onChange={(e) => {
                            setLiveChatSetting({
                              ...liveChatSetting,
                              chat_frequency: e,
                            });
                          }}
                          placeholder="Select end time"
                          className=""
                          control={{
                            height: 40,
                            minHeight: 40,
                            borderRadius: 8,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <br />
                {style && (
                  <>
                    <div className="d-flex cont-layout-col">
                      <div className="notif-list mb-4">
                        <h1>Customization</h1>
                        <div className="d-flex time-a cont-layout">
                          <div className="custom-fields">
                            <label>Logo URL</label>
                            <input
                              type="text"
                              placeholder="Enter logo URL"
                              onChange={(e) => {
                                setStyle({ ...style, logoUrl: e.target.value });
                              }}
                              value={style.logoUrl}
                              style={{
                                fontFamily: 'PoppinsRegular',
                                display: 'block',
                                width: '350px',
                                padding: '10px',
                              }}
                            />
                            <label className="mt-2">Trigger Logo</label>
                            <input
                              type="text"
                              placeholder="Enter trigger logo URL"
                              onChange={(e) => {
                                setStyle({
                                  ...style,
                                  triggerLogo: e.target.value,
                                });
                              }}
                              value={style.triggerLogo}
                              style={{
                                fontFamily: 'PoppinsRegular',
                                display: 'block',
                                width: '350px',
                                padding: '10px',
                              }}
                            />
                            <label className="l-info">
                              if blank, Chaaat logo with be the default.
                            </label>
                            <br />
                            <label className="mt-2">
                              Background Image Link
                            </label>
                            <input
                              type="text"
                              placeholder="Enter image URL"
                              onChange={(e) => {
                                setStyle({
                                  ...style,
                                  backgroundImage: e.target.value,
                                });
                              }}
                              value={style.backgroundImage}
                              style={{
                                fontFamily: 'PoppinsRegular',
                                display: 'block',
                                width: '350px',
                                padding: '10px',
                              }}
                            />
                            <label className="l-info">
                              if blank, Background Color will override.
                            </label>
                            <br />
                            <label className="mt-2">Background Color</label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    backgroundColor: e.target.value,
                                  });
                                }}
                                value={style.backgroundColor}
                              />
                              <input
                                type="text"
                                placeholder="Enter background color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    backgroundColor: e.target.value,
                                  });
                                }}
                                value={style.backgroundColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>
                            <label className="mt-2">Text Color</label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                value={style.textColor}
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    textColor: e.target.value,
                                  });
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Enter text color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    textColor: e.target.value,
                                  });
                                }}
                                value={style.textColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>
                            <label className="mt-2">
                              Input Box Background Color
                            </label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    inputBoxBgColor: e.target.value,
                                  });
                                }}
                                value={style.inputBoxBgColor}
                              />
                              <input
                                type="text"
                                placeholder="Enter input box background Color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    inputBoxBgColor: e.target.value,
                                  });
                                }}
                                value={style.inputBoxBgColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>
                            <label className="mt-2">Input Box Text Color</label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    inputBoxTextColor: e.target.value,
                                  });
                                }}
                                value={style.inputBoxTextColor}
                              />
                              <input
                                type="text"
                                placeholder="Enter input text background color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    inputBoxTextColor: e.target.value,
                                  });
                                }}
                                value={style.inputBoxTextColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>
                            <label className="mt-2">
                              Button Background Color
                            </label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    bgBtnColor: e.target.value,
                                  });
                                }}
                                value={style.bgBtnColor}
                              />
                              <input
                                type="text"
                                placeholder="Enter button color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    bgBtnColor: e.target.value,
                                  });
                                }}
                                value={style.bgBtnColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>

                            <label className="mt-2">Button Text Color</label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    textBtnColor: e.target.value,
                                  });
                                }}
                                value={style.textBtnColor}
                              />
                              <input
                                type="text"
                                placeholder="Enter button color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    textBtnColor: e.target.value,
                                  });
                                }}
                                value={style.textBtnColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>
                            <label className="mt-2">Chat Header Color</label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    chatHeaderColor: e.target.value,
                                  });
                                }}
                                value={style.chatHeaderColor}
                              />
                              <input
                                type="text"
                                placeholder="Enter header color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    chatHeaderColor: e.target.value,
                                  });
                                }}
                                value={style.chatHeaderColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>
                            <label className="mt-2">
                              Chat Header Text Color
                            </label>
                            <div className="d-flex ">
                              <input
                                type="color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    chatHeaderTextColor: e.target.value,
                                  });
                                }}
                                value={style.chatHeaderTextColor}
                              />
                              <input
                                type="text"
                                placeholder="Enter header color"
                                onChange={(e) => {
                                  setStyle({
                                    ...style,
                                    chatHeaderTextColor: e.target.value,
                                  });
                                }}
                                value={style.chatHeaderTextColor}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '300px',
                                  padding: '10px',
                                }}
                              />
                            </div>
                          </div>
                          <div className="center-body">
                            <div
                              className="live-chat-preview-wrap"
                              style={{
                                backgroundColor: style.backgroundColor,
                                backgroundImage: `url(${style.backgroundImage})`,
                              }}
                            >
                              <img src={style.logoUrl} width={'80px'} />
                              <div
                                className="pave-chat-welcome-greet"
                                style={{ color: style.textColor }}
                              >
                                Hello 👋
                                <br />
                                <span>How can we help?</span>
                              </div>
                              <div className="pave-chat-welcome-actions">
                                <label style={{ color: style.textColor }}>
                                  First Name <span>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Enter your First Name`}
                                  style={{
                                    color: style.inputBoxTextColor,
                                    backgroundColor: style.inputBoxBgColor,
                                  }}
                                  value={'Chaaat'}
                                />
                                <label style={{ color: style.textColor }}>
                                  Last Name <span>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Enter your Last Name`}
                                  style={{
                                    color: style.inputBoxTextColor,
                                    backgroundColor: style.inputBoxBgColor,
                                  }}
                                  value={'Team'}
                                />
                                <label style={{ color: style.textColor }}>
                                  Phone Number <span>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Enter your Phone Number`}
                                  style={{
                                    color: style.inputBoxTextColor,
                                    backgroundColor: style.inputBoxBgColor,
                                  }}
                                />
                                <label style={{ color: style.textColor }}>
                                  Email <span>*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Enter your Email`}
                                  style={{
                                    color: style.inputBoxTextColor,
                                    backgroundColor: style.inputBoxBgColor,
                                  }}
                                />
                                <button
                                  type="button"
                                  className="pave-chat-btn btn-red"
                                  style={{
                                    color: style.textBtnColor,
                                    borderColor: style.bgBtnColor,
                                    backgroundColor: style.bgBtnColor,
                                  }}
                                >
                                  <span>Continue</span>
                                  <IconChevronLeft
                                    color={style.textBtnColor}
                                    width="20px"
                                    style={{ transform: 'rotate(180deg)' }}
                                  />
                                </button>
                              </div>
                            </div>
                            <div
                              style={{
                                textAlign: 'center',
                                width: '100%',
                                fontFamily: 'PoppinsRegular',
                              }}
                            >
                              Trigger Logo
                              <br />
                              <br />
                              <img
                                src={
                                  style?.triggerLogo ??
                                  'https://cdn.yourpave.com/pave-chat/chaaat-logo-1.png'
                                }
                                width="50px"
                              ></img>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="d-flex cont-layout-col ">
                  <div className="notif-list mb-4">
                    <h1>Code Snippet</h1>
                    <div className="d-flex time-a">
                      <div>
                        <label>
                          Copy and paste this code in the{' '}
                          <code>{`<head>`}</code> of your website . You may
                          change <code>#main-content</code> depending on the
                          root wrapper of your website.
                        </label>
                        <pre
                          style={{
                            background: '#434343',
                            color: '#f2f2f2',
                            borderRadius: '8px',
                            padding: '10px',
                          }}
                          className="code-insert"
                        >
                          <code
                            className="language-javascript"
                            dangerouslySetInnerHTML={{
                              __html: Prism.highlight(
                                `
<link rel="stylesheet" href="https://livechat.chaaat.io/v1/css/live-chat.css" />
<script src="https://livechat.chaaat.io/v1/js/live-chat.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function(event) {
      var chaaat = new ChaaatChat({
        // Main root content wrapper
          container: '#main-content',
          // Agent ID
          agency_id: '${agencyId}',
          // Language - en, jp, kr, zh-hk, zh-tw
          language: 'en',
      });
  });
</script>
                                            `,
                                Prism.languages.javascript,
                                'javascript',
                              ),
                            }}
                          ></code>
                        </pre>
                      </div>
                    </div>
                    <button
                      className="common-button mt-4"
                      type="button"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}

            {settingPage === 'whatsapp-plugin' && (
              <>
                <div className="d-flex ">
                  <div className="notif-list">
                    <h1>Settings</h1>
                    <label>WhatsApp Business Account</label>
                    <CommonSelect
                      id="assign_agent_select"
                      options={[
                        ...wabaCredentials.map((m) => ({
                          value: m,
                          label: `${m.waba_name} [${m.waba_number}]`,
                        })),
                      ]}
                      value={liveChatSetting.waba_number ?? null}
                      isSearchable={true}
                      onChange={(e) => {
                        setLiveChatSetting({
                          ...liveChatSetting,
                          waba_number: e,
                        });
                      }}
                      placeholder="Select assigned agent"
                      className=""
                      control={{
                        height: 40,
                        minHeight: 40,
                        borderRadius: 8,
                      }}
                    />
                    <br />
                  </div>
                </div>
                <br />
                <div className="d-flex ">
                  <div className="notif-list mb-4">
                    <h1>Code Snippet</h1>
                    <div className="d-flex time-a">
                      <div>
                        <label>
                          Copy and paste this code in the{' '}
                          <code>{`<head>`}</code> of your website . You may
                          change <code>#main-content</code> depending on the
                          root wrapper of your website.
                        </label>

                        <pre
                          style={{
                            background: '#434343',
                            color: '#f2f2f2',
                            borderRadius: '8px',
                            padding: '10px',
                          }}
                          className="code-insert"
                        >
                          <code
                            className="language-javascript"
                            dangerouslySetInnerHTML={{
                              __html: Prism.highlight(
                                `
<link rel="stylesheet" href="https://livechat.chaaat.io/v1/css/live-chat.css" />
<script src="https://livechat.chaaat.io/v1/js/wa.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", (event) => {
      var chaaat = new ChaaatWhatsApp({
          container: '#main-content', // Main root content wrapper
          phone: '${
            liveChatSetting?.waba_number
              ? liveChatSetting?.waba_number?.value?.waba_number
              : ''
          }', // WABA number
          text: 'I checked the website and I have question to ask', // Initial chat text
      });
  });
</script>
                                            `,
                                Prism.languages.javascript,
                                'javascript',
                              ),
                            }}
                          ></code>
                        </pre>
                      </div>
                    </div>
                    <button
                      className="common-button mt-4"
                      type="button"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}

            {settingPage === 'general' && (
              <>
                <div className="d-flex ">
                  <div className="notif-list">
                    <h1>Account activity</h1>
                    <ul>
                      <li>
                        <input
                          type="checkbox"
                          id="c3"
                          checked={getSettings(
                            constant.EMAIL_NOTIFICATION_TYPE.CREATE_NEW_LEAD,
                          )}
                          onChange={() => {
                            handleChangeValue(
                              constant.EMAIL_NOTIFICATION_TYPE.CREATE_NEW_LEAD,
                            );
                          }}
                        />
                        <label for="c3">Someone added a new lead</label>
                      </li>
                      <li>
                        <input
                          type="checkbox"
                          id="c4"
                          checked={getSettings(
                            constant.EMAIL_NOTIFICATION_TYPE.UPDATE_NEW_LEAD,
                          )}
                          onChange={() => {
                            handleChangeValue(
                              constant.EMAIL_NOTIFICATION_TYPE.UPDATE_NEW_LEAD,
                            );
                          }}
                        />
                        <label for="c4">Someone updated a new lead</label>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="d-flex ">
                  <div className="notif-list">
                    <h1>Campaign notifications default settings</h1>
                    <ul className='mb-3'>
                      <li>
                        <input
                          type="checkbox"
                          id="cmp_email_notification"
                          checked={disableCampaignNotification}
                          onChange={(e) => {
                            setDisableCampaignNotification(e.target.checked)
                          }}
                        />
                        <label for="cmp_email_notification">Turn off campaign notification emails</label>
                      </li>
                    </ul>

                    <label>Additional email notification recipients</label>
                    <input
                      type="text"
                      placeholder="Enter email"
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      disabled={disableCampaignNotification}
                      onKeyDown={(e) => {
                        if (
                          e.keyCode === 13 &&
                          e.target.value.trim().length > 0
                        ) {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                          if (!emailRegex.test(e.target.value)) {
                            return;
                          }

                          if (
                            campaignAddedRecipients.includes(e.target.value)
                          ) {
                            return;
                          }
                          setEmailText('');
                          setCampaignAddedRecipients([
                            ...campaignAddedRecipients,
                            e.target.value,
                          ]);
                        }
                      }}
                      style={{
                        fontFamily: 'PoppinsRegular',
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                      }}
                    />

                    <em>press enter to add new email</em>
                    <hr />
                    <ul>
                      {campaignAddedRecipients.map((i, a) => (
                        <li
                          className="d-flex justify-content-between"
                          style={{ marginBottom: '0px' }}
                        >
                          <span>{i}</span>
                          <FontAwesomeIcon
                            icon={faTimes}
                            color="#fe5959"
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeEmail(a)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="d-flex ">
                  <div
                    className="notif-list"
                    style={{
                      width: '100%',
                      display: ['super_admin', 'staff_admin', 'agency_admin', 'agency_marketing'].includes(role) ? 'block' : 'none',
                    }}
                  >
                    <h1>Campaign approver settings</h1>
                    <CommonSelect
                      id="contact_owner_select"
                      options={agencyUsers}
                      value={null}
                      isSearchable={true}
                      onChange={handeAddApprover}
                      placeholder="Select Contact Owner"
                      className=""
                      control={{
                        height: 40,
                        minHeight: 40,
                        borderRadius: 8,
                      }}
                    />

                    <em>Select contact owner to add as approver</em>
                    <hr />
                    <ul>
                      {approvers.map((i, a) => (
                        <li
                          className="d-flex justify-content-between"
                          style={{ marginBottom: '0px' }}
                        >
                          <span>{i?.label}</span>
                          <FontAwesomeIcon
                            icon={faTimes}
                            color="#fe5959"
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeApprover(a)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="d-flex ">
                  <div className="notif-list">
                    <h1>Default Contact Owner</h1>
                    <CommonSelect
                      id="contact_owner_select"
                      options={agencyUsers}
                      value={defaultUserOwner ?? null}
                      isSearchable={true}
                      onChange={setDefaultUserOwner}
                      placeholder="Select Contact Owner"
                      className=""
                      control={{
                        height: 40,
                        minHeight: 40,
                        borderRadius: 8,
                      }}
                    />
                    <em>
                      When a message is received from a mobile number not yet
                      registered in the system, the temporary user record will
                      be assigned to this agent
                    </em>
                    <br />
                    <button
                      className="common-button mt-4"
                      type="button"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}

            {settingPage === 'salesforce' && (
              <>
                <div className="d-flex ">
                  <div className="notif-list mb-4">
                    <h1>Channels</h1>
                    <div className="d-flex time-a">
                      {salesforceDirectIntegrationStatus !== 'inactive' && (
                        <ul className="mb-2">
                          <li>
                            <input
                              type="checkbox"
                              id="salesforce_enabled"
                              checked={
                                liveChatSetting.salesforce_enabled ?? false
                              }
                              value={
                                liveChatSetting.salesforce_enabled ?? false
                              }
                              onChange={(e) => {
                                setLiveChatSetting({
                                  ...liveChatSetting,
                                  salesforce_enabled:
                                    !liveChatSetting.salesforce_enabled,
                                });
                              }}
                            />
                            <label for="salesforce_enabled">
                              Enable on Live Chat
                            </label>
                          </li>
                          <li>
                            <input
                              type="checkbox"
                              id="wa_salesforce_enabled"
                              checked={
                                liveChatSetting.whatsapp_salesforce_enabled ??
                                false
                              }
                              value={
                                liveChatSetting.whatsapp_salesforce_enabled ??
                                false
                              }
                              onChange={(e) => {
                                setLiveChatSetting({
                                  ...liveChatSetting,
                                  whatsapp_salesforce_enabled:
                                    !liveChatSetting.whatsapp_salesforce_enabled,
                                });
                              }}
                            />
                            <label for="wa_salesforce_enabled">
                              Enable on WhatsApp
                            </label>
                          </li>
                          {/* <li>
                            <input
                              type="checkbox"
                              id="salesforce_enabled"
                              checked={
                                liveChatSetting.line_salesforce_enabled ?? false
                              }
                              value={
                                liveChatSetting.line_salesforce_enabled ?? false
                              }
                              onChange={(e) => {
                                setLiveChatSetting({
                                  ...liveChatSetting,
                                  line_salesforce_enabled:
                                    !liveChatSetting.line_salesforce_enabled,
                                });
                              }}
                            />
                            <label for="salesforce_enabled">
                              Enable on Line
                            </label>
                          </li> */}
                        </ul>
                      )}
                      {salesforceDirectIntegrationStatus === 'inactive' && (
                        <div
                          style={{
                            borderRadius: '10px',
                            padding: '20px 20px',
                            background: '#f1d7d7',
                            textAlign: 'center',
                          }}
                        >
                          No connected salesforce account <br />
                          <Link href={h.getRoute(routes.settings.integrations)}>
                            Connect
                          </Link>
                        </div>
                      )}
                    </div>
                    {salesforceDirectIntegrationStatus === 'active' &&
                      (liveChatSetting.salesforce_enabled ||
                        liveChatSetting.whatsapp_salesforce_enabled ||
                        liveChatSetting.line_salesforce_enabled) && (
                        <>
                          <div className="d-flex time-a">
                            <div className="mb-3">
                              <label>Data transmission type</label>
                              <CommonSelect
                                id="salesforce_transmission_type"
                                options={salesforTransmission.map((m) => ({
                                  label: m,
                                  value: m,
                                }))}
                                value={
                                  liveChatSetting.salesforce_transmission_type ??
                                  null
                                }
                                isSearchable={false}
                                onChange={(e) => {
                                  setLiveChatSetting({
                                    ...liveChatSetting,
                                    salesforce_transmission_type: e,
                                  });
                                }}
                                placeholder="Select Type"
                                className=""
                                control={{
                                  height: 40,
                                  minHeight: 40,
                                  borderRadius: 8,
                                }}
                              />
                              <em>
                                This is where the data will be recorded in
                                salesforce
                              </em>
                            </div>
                          </div>
                          <div className="d-flex time-a">
                            <ul className="mb-2">
                              <li>
                                <input
                                  type="checkbox"
                                  id="salesforce_chat_logs_transmission_enabled"
                                  checked={
                                    liveChatSetting.salesforce_chat_logs_transmission_enabled ??
                                    false
                                  }
                                  value={
                                    liveChatSetting.salesforce_chat_logs_transmission_enabled ??
                                    false
                                  }
                                  onChange={(e) => {
                                    setLiveChatSetting({
                                      ...liveChatSetting,
                                      salesforce_chat_logs_transmission_enabled:
                                        !liveChatSetting.salesforce_chat_logs_transmission_enabled,
                                    });
                                  }}
                                />
                                <label for="salesforce_chat_transcription">
                                  Enable Chat Transcription
                                  <br />
                                  <em>
                                    Enables recording chat log to salesforce. If
                                    enabled, will need a custom field for
                                    recording chat history.
                                  </em>
                                </label>
                              </li>
                            </ul>
                          </div>
                          {liveChatSetting.salesforce_chat_logs_transmission_enabled && (
                            <>
                              <div className="d-flex time-a">
                                <div>
                                  <label for="salesforce_chat_logs_transmission_field">
                                    Custom Salesforce Transcription Field
                                  </label>
                                  <input
                                    type="text"
                                    id="salesforce_chat_logs_transmission_field"
                                    placeholder="Enter your custom salesforce field. Case sensitive."
                                    value={
                                      liveChatSetting.salesforce_chat_logs_transmission_field
                                    }
                                    onChange={(e) => {
                                      setLiveChatSetting({
                                        ...liveChatSetting,
                                        salesforce_chat_logs_transmission_field:
                                          e.target.value,
                                      });
                                    }}
                                    style={{
                                      fontFamily: 'PoppinsRegular',
                                      display: 'block',
                                      width: '100%',
                                      padding: '10px',
                                    }}
                                  />
                                  <em>
                                    Add a custom field (textarea) to use for
                                    recording chat logs.
                                  </em>
                                </div>
                              </div>
                              <div
                                className="field-group mt-2"
                                style={{
                                  marginLeft: '-20px',
                                  marginRight: '-20px',
                                }}
                              >
                                <div className="d-flex time-a mt-2">
                                  <div>
                                    <label for="api_url">
                                      Create Record API URL{' '}
                                      <b
                                        style={{
                                          fontFamily: 'PoppinsSemiBold',
                                        }}
                                      >
                                        (POST REQUEST, Content
                                        Type:application/json)
                                      </b>
                                    </label>
                                    <input
                                      type="text"
                                      id="api_url"
                                      placeholder="Enter your custom API URL."
                                      value={liveChatSetting.api_url}
                                      onChange={(e) => {
                                        setLiveChatSetting({
                                          ...liveChatSetting,
                                          api_url: e.target.value,
                                        });
                                      }}
                                      style={{
                                        fontFamily: 'PoppinsRegular',
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px',
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="d-flex time-a mt-2">
                                  <div>
                                    <label for="api_token">
                                      Custom Salesforce API TOKEN
                                    </label>
                                    <div className="pos-rlt">
                                      <input
                                        type={
                                          api_token_disabled
                                            ? 'password'
                                            : 'text'
                                        }
                                        id="api_token"
                                        placeholder="Enter your custom API Token."
                                        value={mockValue('api_token')}
                                        onChange={(e) => {
                                          setLiveChatSetting({
                                            ...liveChatSetting,
                                            api_token: e.target.value,
                                          });
                                        }}
                                        style={{
                                          fontFamily: 'PoppinsRegular',
                                          display: 'block',
                                          width: '100%',
                                          padding: '10px',
                                        }}
                                        disabled={
                                          !h.notEmpty(
                                            liveChatSetting?.api_url,
                                          ) || api_token_disabled
                                        }
                                        onBlur={() =>
                                          onBlur(
                                            'api_token',
                                            setApi_token_disabled,
                                          )
                                        }
                                        ref={api_token_disabledRef}
                                      />
                                      {api_token_disabled && (
                                        <span className="icon-left-prepend">
                                          <CommonTooltip tooltipText={`Edit`}>
                                            <FontAwesomeIcon
                                              icon={faEdit}
                                              color="#182327"
                                              style={{ fontSize: '15px' }}
                                              onClick={() => {
                                                if (api_token_disabled) {
                                                  setApi_token_disabled(false);
                                                  setTimeout(
                                                    () =>
                                                      api_token_disabledRef.current.focus(),
                                                    25,
                                                  );
                                                  setLiveChatSetting({
                                                    ...liveChatSetting,
                                                    api_token: '',
                                                  });
                                                }
                                              }}
                                            />
                                          </CommonTooltip>
                                        </span>
                                      )}
                                    </div>
                                    <em>
                                      Enter a no expiry token here to override
                                      the OAuth process for the Create Record
                                      API
                                    </em>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="field-group mt-2"
                                style={{
                                  marginLeft: '-20px',
                                  marginRight: '-20px',
                                }}
                              >
                                <div className="d-flex time-a mt-2">
                                  <div>
                                    <label for="api_update_url">
                                      Update Record API URL{' '}
                                      <b
                                        style={{
                                          fontFamily: 'PoppinsSemiBold',
                                        }}
                                      >
                                        (PUT REQUEST, Content
                                        Type:application/json)
                                      </b>
                                    </label>
                                    <input
                                      type="text"
                                      id="api_update_url"
                                      placeholder="Enter your custom API URL."
                                      value={liveChatSetting.api_update_url}
                                      onChange={(e) => {
                                        setLiveChatSetting({
                                          ...liveChatSetting,
                                          api_update_url: e.target.value,
                                        });
                                      }}
                                      style={{
                                        fontFamily: 'PoppinsRegular',
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px',
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="d-flex time-a mt-2">
                                  <div>
                                    <label for="api_update_token">
                                      Custom Salesforce API TOKEN
                                    </label>
                                    <div className="pos-rlt">
                                      <input
                                        type={
                                          api_update_token_disabled
                                            ? 'password'
                                            : 'text'
                                        }
                                        id="api_update_token"
                                        placeholder="Enter your custom API Token."
                                        value={mockValue('api_update_token')}
                                        onChange={(e) => {
                                          setLiveChatSetting({
                                            ...liveChatSetting,
                                            api_update_token: e.target.value,
                                          });
                                        }}
                                        style={{
                                          fontFamily: 'PoppinsRegular',
                                          display: 'block',
                                          width: '100%',
                                          padding: '10px',
                                        }}
                                        disabled={
                                          !h.notEmpty(
                                            liveChatSetting?.api_update_url,
                                          ) || api_update_token_disabled
                                        }
                                        onBlur={() =>
                                          onBlur(
                                            'api_update_token',
                                            setApi_update_token_disabled,
                                          )
                                        }
                                        ref={api_update_token_disabledRef}
                                      />
                                      {api_update_token_disabled && (
                                        <span className="icon-left-prepend">
                                          <CommonTooltip tooltipText={`Edit`}>
                                            <FontAwesomeIcon
                                              icon={faEdit}
                                              color="#182327"
                                              style={{ fontSize: '15px' }}
                                              onClick={() => {
                                                if (api_update_token_disabled) {
                                                  setApi_update_token_disabled(
                                                    false,
                                                  );
                                                  setTimeout(
                                                    () =>
                                                      api_update_token_disabledRef.current.focus(),
                                                    25,
                                                  );
                                                  setLiveChatSetting({
                                                    ...liveChatSetting,
                                                    api_update_token: '',
                                                  });
                                                }
                                              }}
                                            />
                                          </CommonTooltip>
                                        </span>
                                      )}
                                    </div>
                                    <em>
                                      Enter a no expiry token here to override
                                      the OAuth process for the Update Record
                                      API
                                    </em>
                                  </div>
                                </div>
                                <div className="d-flex time-a mt-2">
                                  <ul className="mb-0">
                                    <li>
                                      <input
                                        type="checkbox"
                                        id="add_salesforce_id"
                                        checked={
                                          liveChatSetting.add_salesforce_id ??
                                          true
                                        }
                                        value={
                                          liveChatSetting.add_salesforce_id ??
                                          true
                                        }
                                        onChange={(e) => {
                                          setLiveChatSetting({
                                            ...liveChatSetting,
                                            add_salesforce_id:
                                              !liveChatSetting.add_salesforce_id,
                                          });
                                        }}
                                      />
                                      <label for="add_salesforce_id">
                                        Append SFDC ID
                                        <br />
                                        <em>
                                          Enable this field to append the
                                          Salesforce ID of the contact in the
                                          update API URL
                                        </em>
                                      </label>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                  </div>
                </div>
                {salesforceDirectIntegrationStatus === 'active' &&
                  (liveChatSetting.salesforce_enabled ||
                    liveChatSetting.whatsapp_salesforce_enabled ||
                    liveChatSetting.line_salesforce_enabled) &&
                  liveChatSetting.salesforce_chat_logs_transmission_enabled && (
                    <div className="d-flex ">
                      <div className="notif-lft">
                        <label>Client Credentials</label>
                      </div>
                      <div className="notif-list mb-4">
                        <h1>Details</h1>
                        <div className="d-flex time-a mt-2">
                          <div>
                            <label for="api_oauth_url">
                              OAuth API URL{' '}
                              <b style={{ fontFamily: 'PoppinsSemiBold' }}>
                                (POST REQUEST, Content
                                Type:application/x-www-form-urlencoded)
                              </b>
                            </label>
                            <input
                              type="text"
                              id="api_oauth_url"
                              placeholder="Enter your custom API URL."
                              value={liveChatSetting.api_oauth_url}
                              onChange={(e) => {
                                setLiveChatSetting({
                                  ...liveChatSetting,
                                  api_oauth_url: e.target.value,
                                });
                              }}
                              style={{
                                fontFamily: 'PoppinsRegular',
                                display: 'block',
                                width: '100%',
                                padding: '10px',
                              }}
                            />
                            <strong>
                              The OAuth API should have a body parameter of{' '}
                              grant_type with value client_credentials
                            </strong>
                          </div>
                        </div>
                        <div className="d-flex time-a mt-2">
                          <div>
                            <label for="api_client_id">Client ID</label>
                            <div className="pos-rlt">
                              <input
                                type={
                                  api_client_id_disabled ? 'password' : 'text'
                                }
                                id="api_client_id"
                                value={mockValue('api_client_id')}
                                onChange={(e) => {
                                  setLiveChatSetting({
                                    ...liveChatSetting,
                                    api_client_id: e.target.value,
                                  });
                                }}
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '100%',
                                  padding: '10px',
                                }}
                                disabled={
                                  !h.notEmpty(liveChatSetting?.api_oauth_url) ||
                                  api_client_id_disabled
                                }
                                onBlur={() =>
                                  onBlur(
                                    'api_client_id',
                                    setApi_client_id_disabled,
                                  )
                                }
                                ref={api_client_id_disabledRef}
                              />
                              {api_client_id_disabled && (
                                <span className="icon-left-prepend">
                                  <CommonTooltip tooltipText={`Edit`}>
                                    <FontAwesomeIcon
                                      icon={faEdit}
                                      color="#182327"
                                      style={{ fontSize: '15px' }}
                                      onClick={() => {
                                        if (api_client_id_disabled) {
                                          setApi_client_id_disabled(false);
                                          setTimeout(
                                            () =>
                                              api_client_id_disabledRef.current.focus(),
                                            25,
                                          );
                                          setLiveChatSetting({
                                            ...liveChatSetting,
                                            api_client_id: '',
                                          });
                                        }
                                      }}
                                    />
                                  </CommonTooltip>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex time-a mt-2">
                          <div>
                            <label for="api_client_secret">Client Secret</label>
                            <div className="pos-rlt">
                              <input
                                type={
                                  api_client_secret_disabled
                                    ? 'password'
                                    : 'text'
                                }
                                id="api_client_secret"
                                value={mockValue('api_client_secret')}
                                onChange={(e) => {
                                  setLiveChatSetting({
                                    ...liveChatSetting,
                                    api_client_secret: e.target.value,
                                  });
                                }}
                                onBlur={() =>
                                  onBlur(
                                    'api_client_secret',
                                    setApi_client_secret_disabled,
                                  )
                                }
                                style={{
                                  fontFamily: 'PoppinsRegular',
                                  display: 'block',
                                  width: '100%',
                                  padding: '10px',
                                }}
                                disabled={
                                  !h.notEmpty(liveChatSetting?.api_oauth_url) ||
                                  api_client_secret_disabled
                                }
                                ref={api_client_secret_disabledRef}
                              />
                              {api_client_secret_disabled && (
                                <span className="icon-left-prepend">
                                  <CommonTooltip tooltipText={`Edit`}>
                                    <FontAwesomeIcon
                                      icon={faEdit}
                                      color="#182327"
                                      style={{ fontSize: '15px' }}
                                      onClick={() => {
                                        if (api_client_secret_disabled) {
                                          setApi_client_secret_disabled(false);
                                          setTimeout(
                                            () =>
                                              api_client_secret_disabledRef.current.focus(),
                                            25,
                                          );
                                          setLiveChatSetting({
                                            ...liveChatSetting,
                                            api_client_secret: '',
                                          });
                                        }
                                      }}
                                    />
                                  </CommonTooltip>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="notif-list mb-4 mt-4">
                          <h1>Salesforce Reports / Contact Pulling</h1>
                          <div
                            className="field-group mt-2"
                            style={{
                              marginLeft: '-20px',
                              marginRight: '-20px',
                            }}
                          >
                            <div className="d-flex time-a ">
                              <div>
                                <label for="api_data_pull_url">
                                  Pull Record API URL{' '}
                                  <b style={{ fontFamily: 'PoppinsSemiBold' }}>
                                    (GET REQUEST, Content Type:application/json)
                                  </b>
                                </label>
                                <input
                                  type="text"
                                  id="api_data_pull_url"
                                  placeholder="Enter your custom API URL."
                                  value={liveChatSetting.api_data_pull_url}
                                  onChange={(e) => {
                                    setLiveChatSetting({
                                      ...liveChatSetting,
                                      api_data_pull_url: e.target.value,
                                    });
                                  }}
                                  disabled={
                                    h.isEmpty(liveChatSetting.api_oauth_url) ||
                                    h.isEmpty(liveChatSetting.api_client_id) ||
                                    liveChatSetting.api_client_id === false ||
                                    h.isEmpty(
                                      liveChatSetting.api_client_secret,
                                    ) ||
                                    liveChatSetting.api_client_secret === false
                                  }
                                  style={{
                                    fontFamily: 'PoppinsRegular',
                                    display: 'block',
                                    width: '100%',
                                    padding: '10px',
                                  }}
                                />
                                <em>
                                  Contact admin if you want to implement your
                                  custom salesforce API
                                </em>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {salesforceDirectIntegrationStatus === 'active' && (
                  <div className="d-flex ">
                    <div className="notif-lft">
                      <label></label>
                    </div>
                    <div className="notif-list mb-4">
                      <div className="d-flex time-a mt-2">
                        <div className="notif-list mb-4">
                          <button
                            className="common-button mt-4"
                            type="button"
                            onClick={handleUpdate}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {settingPage === 'field-mapping' && (
              <SalesforceFieldMapping liveChatSetting={liveChatSetting} />
            )}
          </section>
        </div>
      </Body>
      <Footer />
    </div>
  );
});
