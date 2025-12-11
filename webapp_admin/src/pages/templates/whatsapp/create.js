import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';
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
import IconUpload from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconUpload';
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
import TemplateBodyTextArea from '../../../components/WhatsApp/TemplateBodyTextArea';
import TemplateQuickReplies from '../../../components/WhatsApp/TemplateQuickReplies';
import TemplateCallToAction from '../../../components/WhatsApp/TemplateCallToAction';
import TemplatePreview from '../../../components/WhatsApp/TemplateCreatePreview';
import TrialEnded from '../../../components/Common/CommonModals/TrialEnded';

const initialForm = {
  template_name: '',
  template_language: {
    value: { en: 'English' },
    label: 'English',
  },
};
export default function CampaignTemplateList() {
  const router = useRouter();
  const templateNameRef = useRef(null);
  const fileRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(false);
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
  const [form, setForm] = useState(initialForm);
  const [imageSource, setImageSource] = useState('upload');
  const [uploadURL, setUploadURL] = useState('');
  const [directURL, setDirectURL] = useState('');
  const [isTrialEnded, setIsTrialEnded] = useState(false);

  function onChange(v, key) {
    if (key === 'template_body') {
      setFormattedBody(null);
      setIsBodyWithVariable(false);
    }
    setForm((prev) => ({ ...prev, [key]: v }));
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
    setQuickReplyBtns([]);
    setCTABtns([]);
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

  function saveDraft() {
    h.general.prompt(
      {
        message: 'Are you sure you want to save this new template?',
      },

      async (status) => {
        if (status) {
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
          formData.is_draft = true;
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

          const selectBoxes = document.querySelectorAll('.variable_type');
          const variableValues = document.querySelectorAll('.variable_value');
          const bodyVariablesType = [];
          const currentBodyVariables = {};
          let selectIndex = 1;
          selectBoxes.forEach((select) => {
            bodyVariablesType.push(select.value);
          });
          variableValues.forEach((variable) => {
            currentBodyVariables[`{{${selectIndex}}}`] = variable.value;
            selectIndex++;
          });
          formData.body_variables = currentBodyVariables;
          formData.body_variables_type = bodyVariablesType.join(',');

          setLoading(true);

          const apiRes = await api.whatsapp.createTemplate(formData, false);

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully saved template as draft.`,
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
  function handleSaveDraft() {
    if (initialForm === form) {
      h.general.prompt(
        {
          message:
            "You haven't fill anything in the form, do you want to save it as draft?",
        },

        async (s) => {
          if (s) {
            saveDraft();
          }
        },
      );
    } else {
      saveDraft();
    }
  }

  function handleSubmit() {
    if (
      h.isEmpty(form.template_name) ||
      h.isEmpty(form.template_category) ||
      h.isEmpty(form.template_language) ||
      h.isEmpty(form.template_body)
    ) {
      setFieldError(true);

      h.general.alert('error', {
        message: 'Please fill in required fields before submitting the template',
      });

      return;
    } else {
      setFieldError(false);
    }

    if (
      h.notEmpty(form.template_button) &&
      (form.template_button === 'QUICK_REPLY' || form.template_button === 'CTA')
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
          ctaBtns.filter((f) => f.value === '' || f.web_url === '').length > 0)
      ) {
        h.general.alert('error', {
          message: 'Please fill in sample CTA button',
        });

        return;
      }
    }

    h.general.prompt(
      {
        message: 'Are you sure you want to submit this new template?',
      },

      async (status) => {
        if (status) {
          const formData = { ...form };
          formData.is_draft = false;
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

          const selectBoxes = document.querySelectorAll('.variable_type');
          const variableValues = document.querySelectorAll('.variable_value');
          const bodyVariablesType = [];
          const currentBodyVariables = {};
          let selectIndex = 1;
          selectBoxes.forEach((select) => {
            bodyVariablesType.push(select.value);
          });
          variableValues.forEach((variable) => {
            currentBodyVariables[`{{${selectIndex}}}`] = variable.value;
            selectIndex++;
          });
          formData.body_variables = currentBodyVariables;
          formData.body_variables_type = bodyVariablesType.join(',');

          setLoading(true);

          const apiRes = await api.whatsapp.createTemplate(formData, false);

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Succesfully submitted template.`,
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
      {isTrialEnded && <TrialEnded />}

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
                  <h1> Create WhatsApp Template</h1>
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
                          <div className="d-flex campaign-create-form">
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
                                className=""
                                control={{
                                  borderColor:
                                    fieldError && h.isEmpty(form.waba_number)
                                      ? '#fe5959'
                                      : '',
                                }}
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
                                ref={templateNameRef}
                                className={`form-item ${
                                  fieldError && h.isEmpty(form.template_name)
                                    ? 'field-error'
                                    : ''
                                }`}
                                onChange={(e) => {
                                  const regex = /^[A-Za-z0-9 ]*$/;

                                  if (regex.test(e.target.value)) {
                                    onChange(e.target.value, 'template_name');
                                  }
                                }}
                              />
                              {templateNameRef.current &&
                                document.activeElement ===
                                  templateNameRef.current && (
                                  <span className="light-red-text">
                                    &#x2022; Special characters are not allowed
                                  </span>
                                )}
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
                                className={`form-item ${
                                  fieldError &&
                                  h.isEmpty(form.template_category)
                                    ? 'field-error'
                                    : ''
                                }`}
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
                                className={`form-item ${
                                  fieldError &&
                                  h.isEmpty(form.template_language)
                                    ? 'field-error'
                                    : ''
                                }`}
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Header<small className="chip">Optional</small>
                            </label>
                            <div style={{ width: '100px' }}>
                              <button
                                type="button"
                                className={`header-none-btn w ${
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
                              {headerOption === 'image' && (
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
                                          'image/png,image/jpeg,image/jpg'
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
                              {headerOption === 'video' && (
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
                                      placeholder="Paste desired video url here"
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
                                error={
                                  fieldError && h.isEmpty(form.template_body)
                                }
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
                                className={`header-none-btn w ${
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
                                {buttons === 'none' && <hr />}
                                {buttons === 'QUICK_REPLY' && (
                                  <>
                                    <hr />
                                    <TemplateQuickReplies
                                      callBack={handleAddQuickReplies}
                                    />
                                  </>
                                )}
                                {buttons === 'CTA' && (
                                  <>
                                    <hr />
                                    <TemplateCallToAction
                                      callBack={handleAddCTA}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label></label>
                            <div>
                              <button
                                className="common-button transparent-bg w-150 mt-4 mr-1"
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={h.isEmpty(form.template_name)}
                              >
                                Save as Draft
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
                            items={[
                              {
                                data: form,
                                quickReplies: quickReplyBtns,
                                cta: ctaBtns,
                                header: headerOption,
                                isFormatted: isBodyWithVariable,
                                formattedBody,
                                image,
                              },
                            ]}
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
