import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';
import { cloneDeep } from 'lodash';
// ICON
import IconContact from '../../../components/Icons/IconContact';
import {
  faTable,
  faImage,
  faVideo,
  faComment,
  faHandPointer,
  faBold,
  faItalic,
  faStrikethrough,
} from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Components
import CommonResponsiveTable from '../../../components/Common/CommonResponsiveTable';
import CommonTooltip from '../../../components/Common/CommonTooltip';
import CampaignInsights from '../../../components/Messaging/CampaignInsights';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonSelect from '../../../components/Common/CommonSelect';
import CommonTextAreaEditor from '../../../components/Common/CommonTextAreaEditor';
import TemplateBodyTextArea from '../../../components/WhatsApp/TemplateBodyTextAreaEditView';
import TemplateQuickReplies from '../../../components/WhatsApp/TemplateQuickRepliesEditAndView';
import TemplateCallToAction from '../../../components/WhatsApp/TemplateCallToActionEditAndView';
import TemplatePreview from '../../../components/WhatsApp/TemplateEditAndViewPreview';

export default function CampaignTemplateList() {
  const router = useRouter();
  const { waba_template_id } = router.query;
  const fileRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [agency, setAgency] = useState([]);
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [selectedWABA, setSelectedWABA] = useState({});
  const [headerOption, setHeaderOption] = useState('none');
  const [buttons, setButtons] = useState('none');
  const [quickReplyBtns, setQuickReplyBtns] = useState([]);
  const [ctaBtns, setCTABtns] = useState([]);
  const [image, setImage] = useState(null);
  const [isBodyWithVariable, setIsBodyWithVariable] = useState(false);
  const [formattedBody, setFormattedBody] = useState(null);
  const [bodyVariables, setBodyVariables] = useState({});
  const [templateData, setTemplateData] = useState({});
  const [content, setContent] = useState({});
  const [messageBody, setMessageBody] = useState('');
  const [viewMode, setViewMode] = useState('edit');
  const [isDraft, setIsDraft] = useState(false);
  const [imageSource, setImageSource] = useState('upload');
  const [uploadURL, setUploadURL] = useState('');
  const [directURL, setDirectURL] = useState('');
  const [form, setForm] = useState({
    quick_replies: [],
    cta_btn: [],
    body_variables: {},
  });

  function onChange(v, key) {
    if (key === 'template_body') {
      setFormattedBody(null);
      setIsBodyWithVariable(false);
    }
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  function ucwords(str) {
    return str.replace(/\b\w/g, function (l) {
      return l.toUpperCase();
    });
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      const agencyRes = await api.agencyUser.getCurrentUserAgency({}, false);
      setAgency(agencyRes.data.agencyUser.agency);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // Check if the query parameters have been populated
      if (waba_template_id) {
        // Access the parameter value
        const apiRes = await api.whatsapp.getTemplateFromDB(
          waba_template_id,
          false,
        );
        const temp_template = cloneDeep(form);
        const waba_template = h.general.unescapeData(apiRes.data.waba_template);
        setIsDraft(waba_template.is_draft);
        // handling waba_number
        const waba = await wabaCredentials.find(
          (item) => item.waba_number === waba_template.waba_number,
        );
        setSelectedWABA(waba);
        temp_template.template_id = waba_template.template_id;
        // handling language
        const language = waba_template.language;
        const language_arr = constant.WHATSAPP.SUPPORTED_LANGUAGE;
        const language_index = language_arr.findIndex((obj) => obj[language]);
        const selected_language = language_arr[language_index];
        temp_template.template_language = {
          label: [selected_language[language]],
          value: selected_language,
        };
        
        const category = waba_template.category;
        if (h.notEmpty(category)) {
          const category_arr = constant.WHATSAPP.CATEGORY;
          const category_index = category_arr.findIndex((obj) => obj[category]);
          const selected_category = category_arr[category_index];
          temp_template.template_category = {
            label: [selected_category[category]],
            value: selected_category,
          };
        }
        // handling template_name
        temp_template.template_name = waba_template.template_name;
        // handling components
        const content = JSON.parse(waba_template.content);
        const components = content.components;
        // handling HEADER components
        const componentHeaderIndex = components.findIndex(
          (obj) => obj.type === 'HEADER',
        );
        if (componentHeaderIndex !== -1) {
          const image_handler =
            components[componentHeaderIndex].example.header_handle[0];
          temp_template.template_image = image_handler;
          setImage(
            !h.isEmpty(waba_template.header_image)
              ? waba_template.header_image
              : image_handler,
          );
          setImageSource('upload');
          setDirectURL(
            !h.isEmpty(waba_template.header_image)
              ? waba_template.header_image
              : image_handler,
          );
          const template_header = h.general.isImageOrVideo(waba_template.header_image);
          temp_template.template_header = template_header;
          setHeaderOption(template_header);
        } else {
          temp_template.template_header = 'none';
        }

        // handling BODY components
        const componentBodyIndex = components.findIndex(
          (obj) => obj.type === 'BODY',
        );
        if (componentBodyIndex !== -1) {
          const message_body = components[componentBodyIndex].text;
          temp_template.template_body = message_body;
          setFormattedBody(message_body);
          const bodyExample = components[componentBodyIndex].example;
          if (bodyExample) {
            const bodyExampleIndex = 1;
            const examples = bodyExample.body_text[0];
            const exampleObj = examples.reduce((obj, value, index) => {
              obj[`{{${index + 1}}}`] = value;
              return obj;
            }, {});
            setBodyVariables(exampleObj);
            setIsBodyWithVariable(true);
            temp_template.body_variables = exampleObj;
            const variable_types = waba_template.variable_identifier;
            if (!h.isEmpty(variable_types)) {
              temp_template.body_variables_type = variable_types.split(',');
            } else {
              const default_types = ['contact', 'agent'];
              temp_template.body_variables_type = [];

              for (let i = 0; i < examples.length; i++) {
                temp_template.body_variables_type.push(default_types[i % 2]);
              }
            }
          }
          onChange(message_body, 'template_body');
        }

        // handling BUTTONS components
        const componentButtonIndex = components.findIndex(
          (obj) => obj.type === 'BUTTONS',
        );
        if (componentButtonIndex !== -1) {
          const cta = [];
          const quick_replies = [];
          const buttons = components[componentButtonIndex].buttons;

          for (const button of buttons) {
            if (h.cmpStr(button.type, 'URL')) {
              const given_url = button.url;
              const sample_url = button.example ? button.example[0] : null;
              const regex = /{{\d+}}/;
              let type = regex.test(given_url) ? 'dynamic' : 'static';
              if (h.notEmpty(sample_url)) {
                type = sample_url.includes('@') ? 'contact_email' : type;
              }
              const modifiedUrl = given_url.replace(/\/{{\d+}}/, '');
              type = type.replace(/_/g, ' ');
              const btnObj = {
                value: button.text,
                type: {
                  value: type,
                  label: ucwords(type),
                },
                url: '',
                web_url: modifiedUrl,
                action: {
                  value: 'visit_website',
                  label: 'Visit Website',
                },
                phone: '',
                country: '',
              };
              cta.push(btnObj);
              setButtons('CTA');
              onChange('CTA', 'template_button');
              temp_template.template_button = 'CTA';
            }
            if (h.cmpStr(button.type, 'QUICK_REPLY')) {
              quick_replies.push({ value: button.text });
              setButtons('QUICK_REPLY');
              onChange('QUICK_REPLY', 'template_button');
              temp_template.template_button = 'QUICK_REPLY';
            }
          }
          temp_template.cta_btn = cta;
          setCTABtns(cta);
          temp_template.quick_replies = quick_replies;
          setQuickReplyBtns(quick_replies);
        }

        // setMessageBody(message_body);
        setForm(temp_template);
      }
    })();
  }, [waba_template_id, wabaCredentials]);

  useEffect(() => {
    (async () => {
      if (
        typeof selectedWABA === 'object' &&
        selectedWABA !== null &&
        Object.keys(selectedWABA).length !== 0
      ) {
        const temp_template = cloneDeep(form);
        const selectedWABALabel = `${selectedWABA.waba_name} [${selectedWABA.waba_number}]`;
        temp_template.waba_number = {
          value: selectedWABA,
          label: selectedWABALabel,
        };
        setForm(temp_template);
      }
    })();
  }, [selectedWABA]);

  useEffect(() => {
    setQuickReplyBtns(form.quick_replies);
    setCTABtns(form.cta_btn);
  }, [buttons]);

  useEffect(() => {
    if (h.notEmpty(agency)) {
      (async () => {
        setLoading(true);
        //get available agency waba credentials
        const credentials =
          await api.whatsapp.getAgencyWhatsAppConfigurations(
            agency.agency_id,
            false,
          );
        setWabaCredentials(credentials.data.agency_whatsapp_config);
        setLoading(false);
      })();
    } else {
      setLoading(true);
    }
  }, [agency]);

  function handleHeaderOptionAction(type) {
    setHeaderOption(type);
    onChange(type, 'template_header');
  }

  function handleButtonOptionAction(type) {
    setButtons(type);
    const temp_template = cloneDeep(form);
    temp_template['cta_btn'] = [];
    temp_template['quicl_replies'] = [];
    setForm(temp_template);
    onChange(type, 'template_button');
  }

  function handleAddQuickReplies(btns) {
    setQuickReplyBtns(btns);
  }

  function handleAddCTA(btns) {
    setCTABtns(btns);
  }

  function updateFormatBody(newBody) {
    setFormattedBody(newBody);
    setIsBodyWithVariable(true);
  }

  function updateBodyVariables(newVariables) {
    setBodyVariables(newVariables);
  }

  function handleSaveDraft() {
    h.general.prompt(
      {
        message: 'Are you sure you want to save this draft template?',
      },

      async (status) => {
        if (status) {
          if (
            h.isEmpty(form.template_name) ||
            h.isEmpty(form.template_category) ||
            h.isEmpty(form.template_language)
          ) {
            h.general.alert('error', {
              message: 'Please fill in required fields name',
            });

            return;
          }

          if (
            h.notEmpty(form.template_button) &&
            (form.template_button === 'QUICK_REPLY' ||
              form.template_button === 'CTA')
          ) {
            if (
              form.template_button === 'QUICK_REPLY' &&
              (h.isEmpty(quickReplyBtns) ||
                quickReplyBtns.filter((f) => f.value === '').length > 0)
            ) {
              h.general.alert('error', {
                message: 'Please fill in sample quick reply button',
              });

              return;
            }

            if (
              form.template_button === 'CTA' &&
              (h.isEmpty(ctaBtns) ||
                ctaBtns.filter((f) => f.value === '' || f.web_url === '')
                  .length > 0)
            ) {
              h.general.alert('error', {
                message: 'Please fill in sample CTA button',
              });

              return;
            }
          }

          const formData = { ...form };
          formData.waba_template_id = waba_template_id;
          formData.template_name = (formData.template_name ?? '')
            .trim()
            .toLowerCase()
            .split(' ')
            .join('_');
          formData.template_category = formData.template_category?.value;
          formData.template_language = formData.template_language?.value;
          formData.waba_number =
            formData.waba_number?.value?.agency_whatsapp_config_id;
          formData.quick_replies = quickReplyBtns.map((m) => m.value);
          formData.cta_btn = ctaBtns;
          formData.template_image = image;
          formData.body_variables = bodyVariables;
          formData.is_draft = true;

          setLoading(true);

          const apiRes = await api.whatsapp.updateTemplate(formData, false);

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully saved draft template.`,
            });
            setTimeout(() => {
              setLoading(false);
              router.push(routes.templates.whatsapp.list);
            }, 2000);
          }

          setLoading(false);
        }
      },
    );
  }

  function handleSubmit() {
    h.general.prompt(
      {
        message: 'Are you sure you want to submit this template update?',
      },

      async (status) => {
        if (status) {
          if (
            h.isEmpty(form.template_name) ||
            h.isEmpty(form.template_category) ||
            h.isEmpty(form.template_language) ||
            h.isEmpty(form.template_body)
          ) {
            h.general.alert('error', {
              message: 'Please fill in required fields before submitting the template',
            });

            return;
          }

          if (
            h.notEmpty(form.template_button) &&
            (form.template_button === 'QUICK_REPLY' ||
              form.template_button === 'CTA')
          ) {
            if (
              form.template_button === 'QUICK_REPLY' &&
              (h.isEmpty(quickReplyBtns) ||
                quickReplyBtns.filter((f) => f.value === '').length > 0)
            ) {
              h.general.alert('error', {
                message: 'Please fill in sample quick reply button',
              });

              return;
            }

            if (
              form.template_button === 'CTA' &&
              (h.isEmpty(ctaBtns) ||
                ctaBtns.filter((f) => f.value === '' || f.web_url === '')
                  .length > 0)
            ) {
              h.general.alert('error', {
                message: 'Please fill in sample CTA button',
              });

              return;
            }
          }

          const formData = { ...form };
          formData.waba_template_id = waba_template_id;
          formData.template_name = (formData.template_name ?? '')
            .trim()
            .toLowerCase()
            .split(' ')
            .join('_');
          formData.template_category = formData.template_category?.value;
          formData.template_language = formData.template_language?.value;
          formData.waba_number =
            formData.waba_number?.value?.agency_whatsapp_config_id;
          formData.quick_replies = quickReplyBtns.map((m) => m.value);
          formData.cta_btn = ctaBtns;
          formData.template_image = image;
          formData.body_variables = bodyVariables;
          formData.is_draft = false;

          setLoading(true);

          const apiRes = await api.whatsapp.updateTemplate(formData, false);

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully submitted template update.`,
            });
            setTimeout(() => {
              setLoading(false);
              router.push(routes.templates.whatsapp.list);
            }, 2000);
          }

          setLoading(false);
        }
      },
    );
  }

  async function handleOnChangeFile(e) {
    const files = e.target.files;

    // Check file size (in bytes)
    const maxSizeInBytes = h.cmpStr(headerOption, 'image') ? 5 * 1024 * 1024 : 16 * 1024 * 1024; // 5 MB or 16 in bytes
    if (files[0].size > maxSizeInBytes) {
      h.general.alert('error', {
        message: h.cmpStr(headerOption, 'image') ? 'Image file size limit exceeds to 5MB' : 'Video file size limit exceeds to 16MB',
        autoCloseInSecs: 2,
      });
      fileRef.current.value = '';
      return;
    }

    setLoading(true);
    let uploadFiles = [...files];
    let newlyUploadFiles = [];
    if (h.notEmpty(uploadFiles)) {
      for (let i = 0; i < uploadFiles.length; i++) {
        const targetFile = uploadFiles[i];
        const formData = new FormData();
        formData.append('file', targetFile);
        const uploadResponse = await api.upload.upload(
          formData,
          constant.UPLOAD.TYPE.MESSAGE_MEDIA,
          false,
        );
        if (h.cmpStr(uploadResponse.status, 'ok')) {
          newlyUploadFiles.push({
            full_file_url: uploadResponse.data.file.full_file_url,
            file_url: uploadResponse.data.file.file_url,
            file_name: uploadResponse.data.file.file_name,
          });
        }
      }
    }
    if (!h.isEmpty(newlyUploadFiles)) {
      setUploadURL(newlyUploadFiles[0].full_file_url);
      setImage(newlyUploadFiles[0].full_file_url);
    } else {
      setUploadURL('');
      setImage(null);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="contacts-root layout-v ">
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
                  <h1>Edit WhatsApp Template</h1>
                </div>
                <div className="center-body  button-icon-container">
                  <CommonIconButton
                    className="c-red "
                    style={{ width: 164, height: 36 }}
                    onClick={() => {
                      router.push(routes.templates.whatsapp.list);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTable}
                      color="#fff"
                      fontSize="20px"
                      className="mr-2"
                    />
                    {'Template List'}
                  </CommonIconButton>
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
                        style={{ gap: '3em' }}
                      >
                        <div
                          style={{
                            flexGrow: 1,
                          }}
                          className="d-flex  flex-column"
                        >
                          <div
                            className="d-flex campaign-create-form"
                            style={{
                              display: !h.isEmpty(form.template_id)
                                ? 'initial'
                                : 'none !important',
                            }}
                          >
                            <label>
                              Template ID<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter template ID"
                                type="text"
                                value={form.template_id}
                                className="form-item"
                                onChange={(e) =>
                                  onChange(e.target.value, 'template_id')
                                }
                                readOnly="readonly"
                                style={{
                                  backgroundColor: '#f2f2f2',
                                }}
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Business Account<small>*</small>
                            </label>
                            <div style={{ width: '100px' }}>
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
                                className=""
                                disabled={true}
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Template Name<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter template name"
                                type="text"
                                value={form.template_name}
                                className="form-item"
                                onChange={(e) =>
                                  onChange(e.target.value, 'template_name')
                                }
                                readOnly="readonly"
                                style={{
                                  backgroundColor: '#f2f2f2',
                                }}
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Category<small>*</small>
                            </label>
                            <div>
                              <CommonSelect
                                id="template_category"
                                options={[
                                  ...constant.WHATSAPP.CATEGORY.map((m) => ({
                                    value: m,
                                    label: Object.values(m),
                                  })),
                                ]}
                                value={form.template_category}
                                isSearchable={true}
                                onChange={(v) =>
                                  onChange(v, 'template_category')
                                }
                                placeholder="Select category"
                                className=""
                                disabled={!isDraft}
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Language<small>*</small>
                            </label>
                            <div>
                              <CommonSelect
                                id="template_language"
                                options={[
                                  ...constant.WHATSAPP.SUPPORTED_LANGUAGE.map(
                                    (m) => ({
                                      value: m,
                                      label: Object.values(m),
                                    }),
                                  ),
                                ]}
                                value={form.template_language}
                                isSearchable={true}
                                onChange={(v) =>
                                  onChange(v, 'template_language')
                                }
                                placeholder="Select language"
                                className=""
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Header
                              <small className="chip">Optional</small>
                            </label>
                            <div style={{ width: '100px' }}>
                              <button
                                type="button"
                                className={`header-img-btn ${
                                  headerOption === 'none' ? 'active' : ''
                                }`}
                                onClick={() => handleHeaderOptionAction('none')}
                              >
                                None
                              </button>
                              <button
                                type="button"
                                className={`header-img-btn ${
                                  headerOption === 'image' ? 'active' : ''
                                }`}
                                onClick={() =>
                                  handleHeaderOptionAction('image')
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faImage}
                                  color="#182327"
                                  style={{ marginRight: '5px' }}
                                />
                                Image Header
                              </button>
                              <button
                                type="button"
                                className={`header-img-btn ${
                                  headerOption === 'video' ? 'active' : ''
                                }`}
                                onClick={() =>
                                  handleHeaderOptionAction('video')
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faVideo}
                                  color="#182327"
                                  style={{ marginRight: '5px' }}
                                />
                                Video Header
                              </button>
                              {['image', 'video'].includes(headerOption) && (
                                <>
                                  <div
                                    style={{
                                      display: `${
                                        imageSource === 'upload'
                                          ? 'block'
                                          : 'none'
                                      }`,
                                    }}
                                  >
                                    <div
                                      className="send-msg-txtarea d-flex align-items-center"
                                      style={{ width: '100%', gap: '1em' }}
                                    >
                                      <input
                                        type={'file'}
                                        id={'csvFileInput'}
                                        accept={
                                          'video/mp4, video/3gpp'
                                        }
                                        onChange={handleOnChangeFile}
                                        ref={fileRef}
                                        className="form-item mt-2"
                                      />
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      display: `${
                                        imageSource === 'url' ? 'block' : 'none'
                                      }`,
                                    }}
                                  >
                                    <input
                                      type="text"
                                      value={directURL}
                                      className="form-item mt-2"
                                      onChange={(e) => {
                                        setDirectURL(e.target.value);
                                        setImage(e.target.value);
                                      }}
                                      placeholder="Paste desired image url here"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Body<small>*</small>
                            </label>
                            <div style={{ width: '100px' }}>
                              <span
                                style={{
                                  color: '#c5c5c5',
                                  marginBottom: '5px',
                                }}
                              >
                                Enter the text for your message in the language
                                you've selected
                              </span>
                              <TemplateBodyTextArea
                                onChange={onChange}
                                form={form}
                                formattedBody={formattedBody}
                                callbackForUpdateBody={updateFormatBody}
                                callbackForUpdateVariables={updateBodyVariables}
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Buttons
                              <small className="chip">Optional</small>
                            </label>
                            <div style={{ width: '100px' }}>
                              <span
                                style={{
                                  color: '#c5c5c5',
                                  display: 'block',
                                  marginBottom: '5px',
                                }}
                              >
                                Create buttons that let customers respond to
                                your message or take action
                              </span>
                              <button
                                type="button"
                                className={`header-img-btn ${
                                  buttons === 'none' ? 'active' : ''
                                }`}
                                onClick={() => handleButtonOptionAction('none')}
                              >
                                None
                              </button>
                              <button
                                type="button"
                                className={`header-img-btn ${
                                  buttons === 'CTA' ? 'active' : ''
                                }`}
                                onClick={() => handleButtonOptionAction('CTA')}
                              >
                                <FontAwesomeIcon
                                  icon={faHandPointer}
                                  color="#182327"
                                  style={{ marginRight: '5px' }}
                                />
                                Call To Action
                              </button>
                              <button
                                type="button"
                                className={`header-img-btn ${
                                  buttons === 'QUICK_REPLY' ? 'active' : ''
                                }`}
                                onClick={() =>
                                  handleButtonOptionAction('QUICK_REPLY')
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faComment}
                                  color="#182327"
                                  style={{ marginRight: '5px' }}
                                />
                                Quick Reply
                              </button>
                              <div className="">
                                {buttons !== 'none' && <hr />}
                                {buttons === 'QUICK_REPLY' && (
                                  <TemplateQuickReplies
                                    form={form}
                                    callBack={handleAddQuickReplies}
                                  />
                                )}
                                {buttons === 'CTA' && (
                                  <TemplateCallToAction
                                    form={form}
                                    callBack={handleAddCTA}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label></label>
                            <div>
                              <button
                                className="common-button transparent-bg mt-4 mr-1"
                                type="button"
                                style={{
                                  display: isDraft ? 'initial' : 'none',
                                }}
                                onClick={handleSaveDraft}
                                disabled={h.isEmpty(form.template_name)}
                              >
                                Save Draft
                              </button>
                              <button
                                className="common-button mt-4"
                                type="button"
                                onClick={handleSubmit}
                              >
                                Submit
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
                            data={form}
                            quickReplies={quickReplyBtns}
                            cta={ctaBtns}
                            header={headerOption}
                            image={image}
                            isFormatted={isBodyWithVariable}
                            formattedBody={formattedBody}
                          />
                        </div>
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
