import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';
import moment from 'moment';
import { cloneDeep } from 'lodash';
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
import TemplatePreview from '../../../components/Line/TemplatePreview';
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
    label: 'Pave Admin',
  },
  {
    value: {
      count: 10,
    },
    label: 'Pave Dev Team',
  },
];

export default function CampaignTemplateList() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [agency, setAgency] = useState([]);
  const [lineChannels, setLineChannels] = useState([]);
  const [headerOption, setHeaderOption] = useState('none');
  const [source, setSource] = useState('upload');
  const [sourceUrl, setSourceUrl] = useState(null);
  const [sourceThumbnail, setSourceThumbnail] = useState(null);
  const [buttons, setButtons] = useState('none');
  const [quickReplyBtns, setQuickReplyBtns] = useState([]);
  const [ctaBtns, setCTABtns] = useState([]);
  const [uploadURL, setUploadURL] = useState('');
  const [directURL, setDirectURL] = useState('');
  const [image, setImage] = useState(null);
  const [isBodyWithVariable, setIsBodyWithVariable] = useState(false);
  const [formattedBody, setFormattedBody] = useState(null);
  const [bodyVariables, setBodyVariables] = useState({});
  const [customLandingPages, setCustomLandingPages] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [fieldError, setFieldError] = useState(false);
  const [lineChannel, setLineChannel] = useState(null);
  const [approverIDs, setApproverIDs] = useState([]);
  const [agencyUserId, setAgencyUserId] = useState('');
  const [lineTemplates, setLineTemplates] = useState([
    {
      value: null,
    },
  ]);
  const [lineTemplateList, setLineTemplateList] = useState([]);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [agencyId, setAgencyId] = useState(null);
  const [lineTemplateSchedule, setLineTemplateschedule] = useState([
    {
      datetime: getNearest15Minute(),
      recipient_count: 0,
    },
  ]);
  const [form, setForm] = useState({
    schedule: {
      value: 1,
      label: 'Specific date and time',
    },
    staggered: 'no',
    confirmation: 'no',
    contact_lists: [],
    with_reminder: 'no',
    reminder_time: '15mins',
    campaign_notification_additional_recipients: null,
    cta_response: [],
    cta_settings: [],
    quick_replies: [],
    cta_btn: [],
    body_variables: {},
  });

  const [quickReplySettings, setQuickReplySettings] = useState([]);

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
    if (key === 'line_channel') {
      setLineChannel(v.value.agency_channel_config_id);
    }
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const agency = apiRes.data.agencyUser.agency;
        // getTemplates(agency.agency_id);
        getLandingPages(agency.agency_id);
        setAgency(agency);
        setAgencyId(agency.agency_id);
        setAgencyUserId(apiRes.data.agencyUser.agency_user_id);
        const approvers =
          apiRes.data.agencyUser.agency?.campaign_approval_agent;
        if (!h.isEmpty(approvers)) {
          setApproverIDs(approvers.split(','));
        }

        const credentials = await api.line.getChannelList(
          { agency_id: apiRes.data.agencyUser.agency.agency_id },
          false,
        );
        setLineChannels(credentials.data);
        const temp_form = cloneDeep(form);
        temp_form.campaign_notification_additional_recipients =
          agency?.agency_campaign_additional_recipient;
        setForm(temp_form);
      }
    })();
  }, []);

  useEffect(() => {
    if (h.notEmpty(lineTemplates) && h.notEmpty(lineTemplates[0].value)) {
      let temp_template = cloneDeep(form);
      const line_template = lineTemplates[0].value;
      const template_type = line_template.template_type;
      const contents = JSON.parse(line_template.content);
      setQuickReplyBtns(form.quick_replies);
      if (h.cmpStr(template_type, 'BASIC')) {
        temp_template.header_title = null;
        setHeaderOption('none');
        setSource('url');
        setSourceUrl(null);
        setDirectURL(null);
        setSourceThumbnail(null);
        contents.forEach(function (content) {
          if (['image', 'video'].includes(content.type)) {
            temp_template.template_header = content.type;
            setHeaderOption(content.type);
            setSource('url');
            setSourceUrl(content.originalContentUrl);
            setDirectURL(content.originalContentUrl);
            setSourceThumbnail(content.previewImageUrl);
          }
          if (h.cmpStr(content.type, 'text')) {
            temp_template.template_body = content.text;
            temp_template.quick_replies = [];
            if (!h.isEmpty(content.quickReply)) {
              const quickReplyItems = content.quickReply.items;
              handleButtonOptionAction('QUICK_REPLY');
              quickReplyItems.forEach(function (item) {
                temp_template.quick_replies.push({ value: item.action.text });
              });
              setQuickReplyBtns(temp_template.quick_replies);
            }
          }
        });
      } else if (h.cmpStr(template_type, 'CONFIRM')) {
        temp_template.template_body = contents.template.text;
        temp_template.header_title = null;
        temp_template.quick_replies = [];
        setHeaderOption('none');
        temp_template.header_title = null;
        if (!h.isEmpty(contents.template.actions)) {
          const quickReplyItems = contents.template.actions;
          handleButtonOptionAction('QUICK_REPLY');
          quickReplyItems.forEach(function (item) {
            temp_template.quick_replies.push({ value: item.text });
          });
          setQuickReplyBtns(temp_template.quick_replies);
        }
      } else if (h.cmpStr(template_type, 'BUTTON')) {
        temp_template.template_body = contents.template.text;
        temp_template.header_title = contents.template.title;
        temp_template.quick_replies = [];
        temp_template.redirection_url = !h.isEmpty(
          contents.template.defaultAction,
        )
          ? contents.template.defaultAction.uri
          : null;
        setHeaderOption('image');
        setSource('url');
        setSourceUrl(contents.template.thumbnailImageUrl);
        setDirectURL(contents.template.thumbnailImageUrl);
        setSourceThumbnail(contents.template.thumbnailImageUrl);
        if (!h.isEmpty(contents.template.actions)) {
          const quickReplyItems = contents.template.actions;
          handleButtonOptionAction('QUICK_REPLY');
          quickReplyItems.forEach(function (item) {
            if (h.cmpStr(item.type, 'message')) {
              temp_template.quick_replies.push({
                action: item.option_type,
                value: item.text,
                action_value: item.text,
              });
            } else if (h.cmpStr(item.type, 'uri')) {
              let uriString = item.uri;
              let cleanedURIString = h.notEmpty(uriString)
                ? uriString.replace(/^tel:/, '')
                : null;
              temp_template.quick_replies.push({
                action: item.option_type,
                value: item.label,
                action_value: cleanedURIString,
              });
            }
            setQuickReplyBtns(temp_template.quick_replies);
          });
        }
      }
      setForm(temp_template);
    }
  }, [lineTemplates]);

  function handleSubmit() {
    h.general.prompt(
      {
        message:
          'Are you sure you want to submit and initiate this new campaign?',
      },

      async (submitCampaign) => {
        if (h.cmpBool(submitCampaign, true)) {
          setLoading(true);
          const templates = [];
          if (
            h.isEmpty(form.campaign_name) ||
            h.isEmpty(form.line_channel) ||
            h.isEmpty(lineTemplates[0].value) ||
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

            const formData = {
              campaign_draft_id: null,
              campaign_name: form.campaign_name,
              agency_id: agencyId,
              templates: lineTemplates,
              contact_list: form.contact_lists,
              selected_line_channel:
                form.line_channel.value.agency_channel_config_id,
              api_token: form.line_channel.value.uib_api_token,
              api_secret: form.line_channel.value.uib_api_secret,
              schedule: form.schedule,
              staggered: h.cmpStr(form.staggered, 'yes'),
              timing: lineTemplateSchedule,
              campaign_notification_additional_recipients:
                form.campaign_notification_additional_recipients,
            };

            const apiRes = await api.campaignSchedule.createLineCampaign(
              formData,
              false,
            );

            if (h.cmpStr(apiRes.status, 'ok')) {
              h.general.alert('success', {
                message: `Succesfully created campaign.`,
              });
              setTimeout(() => {
                router.push(routes.dashboard.line);
              }, 2000);
            }
            setLoading(false);
          }
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

          const formData = {
            campaign_name: form.campaign_name,
            agency_id: agencyId,
            templates: lineTemplates,
            contact_list: form.contact_lists,
            selected_line_channel:
              form.line_channel.value.agency_channel_config_id,
            api_token: form.line_channel.value.uib_api_token,
            api_secret: form.line_channel.value.uib_api_secret,
            schedule: form.schedule,
            staggered: h.cmpStr(form.staggered, 'yes'),
            timing: lineTemplateSchedule,
            campaign_notification_additional_recipients:
              form.campaign_notification_additional_recipients,
          };

          const apiRes = await api.campaignSchedule.draftLineCampaignReview(
            formData,
            false,
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully submitted campaign for review.`,
            });
            setTimeout(() => {
              router.push(routes.dashboard.line);
            }, 2000);
          }
          setLoading(false);
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

          const formData = {
            campaign_name: form.campaign_name,
            agency_id: agencyId,
            templates: lineTemplates,
            contact_list: form.contact_lists,
            selected_line_channel:
              form.line_channel.value.agency_channel_config_id,
            api_token: form.line_channel.value.uib_api_token,
            api_secret: form.line_channel.value.uib_api_secret,
            schedule: form.schedule,
            staggered: h.cmpStr(form.staggered, 'yes'),
            timing: lineTemplateSchedule,
            campaign_notification_additional_recipients:
              form.campaign_notification_additional_recipients,
          };

          const apiRes = await api.campaignSchedule.draftLineCampaign(
            formData,
            false,
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully saved campaign draft.`,
            });
            setTimeout(() => {
              router.push(routes.dashboard.line);
            }, 2000);
          }
          setLoading(false);
        }
      },
    );
  }

  function handleButtonOptionAction(type) {
    setButtons(type);
    onChange(type, 'template_button');
  }

  function handleAddSchedule() {
    const waScheduleClone = [...lineTemplateSchedule];
    waScheduleClone.push({
      datetime:
        waScheduleClone.length > 1
          ? waScheduleClone[waScheduleClone.length - 1].datetime
          : null,
      recipient_count: 0,
    });

    setLineTemplateschedule(waScheduleClone);
  }

  function handleRemoveSchedule(index) {
    const waScheduleClone = [...lineTemplateSchedule];
    waScheduleClone.splice(index, 1);

    setLineTemplateschedule(waScheduleClone);
  }

  async function getTemplates(id, channel) {
    setStatus(constant.API_STATUS.PENDING);
    const apiRes = await api.line.listTemplates(
      { agency_id: id, channel_id: channel.value.agency_channel_config_id },
      false,
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      setLineTemplateList(apiRes.data.agency_line_templates);
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
    const templCount = lineTemplateSchedule
      ?.map((m) => m?.recipient_count)
      .reduce((a, b) => a + b);

    const contactCount = form.contact_lists
      ?.filter((f) => h.notEmpty(f.value?.contact_count))
      .map((m) => m.value?.contact_count?.count)
      .reduce((a, b) => a + b, 0);

    return `${templCount} of ${contactCount} Recipients`;
  }

  async function getList(id, channel) {
    const apiRes = await api.contactList.lineContactList(
      {
        agency_id: id,
        channel: channel.value.agency_channel_config_id,
        is_line_opt_in: true,
      },
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
                      Create Line Campaign
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
                        Line Channel<small>*</small>
                      </label>
                      <div>
                        <CommonSelect
                          id="line_channel"
                          options={[
                            ...lineChannels.map((m) => ({
                              value: m,
                              label: `${m.channel_name}`,
                            })),
                          ]}
                          value={form.line_channel}
                          isSearchable={true}
                          onChange={(v) => {
                            onChange(v, 'line_channel');
                            getTemplates(agency.agency_id, v);
                            getList(agency.agency_id, v);
                          }}
                          placeholder="Select Line Channel"
                          className="mt-2"
                          control={{
                            borderColor:
                              fieldError && h.isEmpty(form.line_channel)
                                ? '#fe5959'
                                : '',
                          }}
                        />
                      </div>
                    </div>

                    <div className="d-flex campaign-create-form mt-3">
                      <label>
                        Line Template<small>*</small>
                      </label>
                      <div>
                        {lineTemplates.map((template, i) => {
                          let className = '';
                          if (i > 0) {
                            className = 'mt-2';
                          }
                          const template_name = template?.value?.template_name;
                          return (
                            <>
                              <div className="d-flex" key={i}>
                                <div style={{ flex: 'auto' }}>
                                  <CommonSelect
                                    id={`whatsapp_template-${i}`}
                                    options={lineTemplateList
                                      .filter(
                                        (m) =>
                                          m.status === 'published' &&
                                          m.line_channel === lineChannel,
                                      ) // Filter only APPROVED templates
                                      .map((m) => ({
                                        value: m,
                                        label: h.general.sentenceCase(
                                          m.template_name,
                                        ),
                                      }))}
                                    value={
                                      h.notEmpty(lineTemplates[i].value)
                                        ? lineTemplates[i]
                                        : null
                                    }
                                    isSearchable={true}
                                    onChange={(v) => {
                                      const lineTemplateClone = [
                                        ...lineTemplates,
                                      ];
                                      lineTemplateClone[i] = v;
                                      setLineTemplates(lineTemplateClone);
                                    }}
                                    placeholder="Select template"
                                    className={className}
                                    control={{
                                      borderColor:
                                        fieldError &&
                                        (h.isEmpty(lineTemplates) ||
                                          (h.notEmpty(lineTemplates) &&
                                            lineTemplates[0].value === null))
                                          ? '#fe5959'
                                          : '',
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          );
                        })}
                        <div id="textarea-container"></div>
                      </div>
                    </div>

                    <div className="d-flex campaign-create-form mt-3">
                      <label>
                        Contact lists<small>*</small>
                      </label>
                      <div>
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
                          {/* {form.contact_lists.length > 0 && (
                            <span
                              style={{
                                cursor: 'pointer',
                                textDecoration: 'underline',
                              }}
                            >
                              View Recipients
                            </span>
                          )} */}
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
                                {lineTemplateSchedule.map((item, i) => (
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
                                    form={lineTemplateSchedule}
                                    setForm={setLineTemplateschedule}
                                    handleRemoveSchedule={handleRemoveSchedule}
                                    minDate={
                                      i === 0
                                        ? moment().toDate()
                                        : lineTemplateSchedule[i - 1].datetime
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
                                    lineTemplateSchedule
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
                                  item={lineTemplateSchedule[0]}
                                  form={lineTemplateSchedule}
                                  setForm={setLineTemplateschedule}
                                  handleRemoveSchedule={handleRemoveSchedule}
                                  minDate={moment().toDate()}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* <div
                      className="d-flex campaign-create-form mt-3"
                      style={{ display: 'none' }}
                    >
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
                      <div>
                        <input
                          type="text"
                          value={
                            form.campaign_notification_additional_recipients
                          }
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

                    {/* <div className="d-flex campaign-create-form mt-3">
                      <label></label>
                      <div>
                        <button
                          className="common-button-2 mt-4 text-normal"
                          type="button"
                          onClick={handleDraft}
                        >
                          Save Draft
                        </button>
                      </div>
                    </div> */}

                    <div className="d-flex campaign-create-form mt-3">
                      <label></label>
                      <div>
                        <button
                          className="common-button transparent-bg mt-4 mr-2 text-normal"
                          type="button"
                          disabled={h.isEmpty(form.campaign_name)}
                          onClick={handleDraft}
                        >
                          Save Draft
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
                  <div
                    style={{
                      width: '350px',
                    }}
                  >
                    <TemplatePreview
                      items={[
                        {
                          data: form,
                          quickReplies: quickReplyBtns,
                          cta: ctaBtns,
                          header: headerOption,
                          isFormatted: isBodyWithVariable,
                          formattedBody,
                          sourceThumbnail,
                        },
                      ]}
                    />
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
