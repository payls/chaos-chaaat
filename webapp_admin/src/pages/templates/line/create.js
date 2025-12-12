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
import BasicTemplateCreate from '../../../components/Line/BasicTemplateCreate';
import ButtonTemplateCreate from '../../../components/Line/ButtonTemplateCreate';
import ConfirmTemplateCreate from '../../../components/Line/ConfirmTemplateCreate';
import TemplatePreview from '../../../components/Line/TemplatePreview';

export default function CampaignTemplateList() {
  const router = useRouter();
  const templateNameRef = useRef(null);
  const fileRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [fieldErrorList, setFieldErrorList] = useState(false);
  const [agency, setAgency] = useState([]);
  const [lineChannels, setLineChannels] = useState([]);
  const [templateType, setTemplateType] = useState(null);
  const [headerOption, setHeaderOption] = useState('none');
  const [source, setSource] = useState('upload');
  const [sourceUrl, setSourceUrl] = useState(null);
  const [sourceThumbnail, setSourceThumbnail] = useState(null);
  const [buttons, setButtons] = useState('none');
  const [quickReplyBtns, setQuickReplyBtns] = useState([]);
  const [ctaBtns, setCTABtns] = useState([]);
  const [image, setImage] = useState(null);
  const [isBodyWithVariable, setIsBodyWithVariable] = useState(false);
  const [formattedBody, setFormattedBody] = useState(null);
  const [bodyVariables, setBodyVariables] = useState({});
  const [form, setForm] = useState({
    line_channel: '',
    template_name: '',
  });
  const [imageSource, setImageSource] = useState('upload');
  const [uploadURL, setUploadURL] = useState('');
  const [directURL, setDirectURL] = useState('');

  function onChange(v, key) {
    if (key === 'template_body') {
      setFormattedBody(null);
      setIsBodyWithVariable(false);
    }
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  useEffect(() => {
    (async () => {
      if (form.template_type) {
        const templateTypeValue = form.template_type.value;
        if (templateTypeValue && templateTypeValue.BASIC) {
          form.header_title = null;
          form.template_body = null;
          setTemplateType('BASIC');
          setHeaderOption('none');
          setSourceUrl(null);
          setSource('upload');
          setSourceThumbnail(null);
        } else if (templateTypeValue && templateTypeValue.BUTTON) {
          form.header_title = null;
          form.template_body = null;
          setTemplateType('BUTTON');
          setHeaderOption('image');
          setSourceUrl(null);
          setSource('upload');
          setSourceThumbnail(null);
        } else if (templateTypeValue && templateTypeValue.CONFIRM) {
          form.header_title = null;
          form.template_body = 'This is a confirmation message';
          setTemplateType('CONFIRM');
          setHeaderOption('none');
          setSourceUrl(null);
          setSource('upload');
          setSourceThumbnail(null);
        } else if (templateTypeValue && templateTypeValue.CAROUSEL) {
          form.header_title = null;
          setTemplateType('CAROUSEL');
        } else if (templateTypeValue && templateTypeValue.IMAGE_CAROUSEL) {
          form.header_title = null;
          setTemplateType('IMAGE_CAROUSEL');
        } else {
          form.header_title = null;
          form.template_body = null;
          setHeaderOption('none');
          setSourceUrl(null);
          setSource('upload');
          setSourceThumbnail(null);
          setTemplateType(null);
        }
      } else {
        setTemplateType(null);
      }
    })();
  }, [form.template_type]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const agencyRes = await api.agencyUser.getCurrentUserAgency({}, false);
      setAgency(agencyRes.data.agencyUser.agency);
      const credentials = await api.line.getChannelList(
        { agency_id: agencyRes.data.agencyUser.agency.agency_id },
        false,
      );
      setLineChannels(credentials.data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, ['action_buttons']: quickReplyBtns }));
  }, [quickReplyBtns]);

  function handleAddQuickReplies(btns) {
    setQuickReplyBtns(btns);
  }

  function handleSaveDraft() {
    h.general.prompt(
      {
        message: 'Are you sure you want to save this draft?',
      },

      async (status) => {
        if (status) {
          const formData = {};
          if (
            h.isEmpty(form.channel) ||
            h.isEmpty(form.template_name) ||
            h.isEmpty(templateType)
          ) {
            setFieldError(true);
            h.general.alert('error', {
              message: 'Please fill in required fields name',
            });

            return;
          } else {
            let template_components;
            if (templateType && h.cmpStr(templateType, 'BASIC')) {
              template_components = [];
              setFieldError(false);
              h.lineTemplate.handleBasicTemplateFormData(
                form,
                template_components,
                sourceUrl,
                sourceThumbnail,
                quickReplyBtns,
              );
            } else if (templateType && h.cmpStr(templateType, 'CONFIRM')) {
              template_components = {
                type: 'template',
                altText: 'You received a Confirmation Message',
              };
              h.lineTemplate.handleConfirmTemplateFormData(
                form,
                template_components,
                quickReplyBtns,
              );
            } else if (templateType && h.cmpStr(templateType, 'BUTTON')) {
              template_components = {
                type: 'template',
                altText: !h.isEmpty(form.header_title)
                  ? form.header_title
                  : 'You received a Button Message',
              };

              h.lineTemplate.handleButtonTemplateFormData(
                form,
                template_components,
                sourceUrl,
                sourceThumbnail,
                quickReplyBtns,
              );
            }

            formData.template_type = templateType;
            formData.template_name = (form.template_name ?? '')
              .trim()
              .toLowerCase()
              .split(' ')
              .join('_');
            formData.line_channel = form.channel.value.agency_channel_config_id;
            formData.content = template_components;
            formData.status = 'draft';
            const apiRes = await api.line.createTemplate(formData, false);

            if (h.cmpStr(apiRes.status, 'ok')) {
              h.general.alert('success', {
                message: `Succesfully saved template as draft.`,
              });
              setTimeout(() => {
                setLoading(false);
                router.push(routes.templates.line.list);
              }, 2000);
            }
          }

          setLoading(false);
        }
      },
    );
  }

  function handleSubmit() {
    h.general.prompt(
      {
        message:
          'Are you sure you want to submit and pubslish this new template?',
      },

      async (status) => {
        if (status) {
          setFieldError(false);
          const formData = {};
          if (
            h.isEmpty(form.channel) ||
            h.isEmpty(form.template_name) ||
            h.isEmpty(templateType)
          ) {
            setFieldError(true);
            h.general.alert('error', {
              message: 'Please fill in required fields name',
            });

            return;
          } else {
            let template_components;
            const with_error = [];
            let hasFormError = false;
            if (templateType && h.cmpStr(templateType, 'BASIC')) {
              template_components = [];
              h.lineTemplate.handleBasicTemplateFormData(
                form,
                template_components,
                sourceUrl,
                sourceThumbnail,
                quickReplyBtns,
              );
              if (h.isEmpty(form.template_body)) {
                hasFormError = true;
                with_error.push('Body');
              }
            } else if (templateType && h.cmpStr(templateType, 'CONFIRM')) {
              template_components = {
                type: 'template',
                altText: 'Confirmation Message',
              };
              h.lineTemplate.handleConfirmTemplateFormData(
                form,
                template_components,
                quickReplyBtns,
              );

              if (h.isEmpty(form.template_body)) {
                hasFormError = true;
                with_error.push('Body');
              }
              if (template_components.template.actions.length < 2) {
                hasFormError = true;
                with_error.push('Action Buttons');
              }
            } else if (templateType && h.cmpStr(templateType, 'BUTTON')) {
              template_components = {
                type: 'template',
                altText: !h.isEmpty(form.header_title)
                  ? form.header_title
                  : 'You received a Button Message',
              };

              h.lineTemplate.handleButtonTemplateFormData(
                form,
                template_components,
                sourceUrl,
                sourceThumbnail,
                quickReplyBtns,
              );

              if (h.isEmpty(template_components.template.thumbnailImageUrl)) {
                hasFormError = true;
                with_error.push('Heading Thumbnail Image');
              }

              if (h.isEmpty(template_components.template.text)) {
                hasFormError = true;
                with_error.push('Body');
              }

              if (template_components.template.actions.length < 1) {
                setFieldError(true);
                hasFormError = true;
                with_error.push('Action Buttons');
              } else {
                const action_buttons = template_components.template.actions;
              }

              let notText = template_components.template.actions.filter(
                (f) => f.type === 'uri',
              );

              if (
                notText.length > 0 &&
                notText.every(
                  (e) =>
                    h.isEmpty(e.uri) ||
                    e.uri === '' ||
                    e.uri === 'tel:undefined',
                )
              ) {
                setFieldError(true);
                hasFormError = true;
                with_error.push('Action Value Buttonsssss');
              }
            }

            if (h.cmpBool(hasFormError, true)) {
              setFieldError(true);
              const errorList = with_error.join(', ');
              setFieldErrorList(with_error);

              h.general.alert('error', {
                message:
                  'Error publishing template. Please check form and try again.' +
                  '\n' +
                  'Please check the following field(s):' +
                  '\n' +
                  `${errorList}`,
              });
            } else {
              formData.template_type = templateType;
              formData.template_name = (form.template_name ?? '')
                .trim()
                .toLowerCase()
                .split(' ')
                .join('_');
              formData.line_channel =
                form.channel.value.agency_channel_config_id;
              formData.content = template_components;
              formData.status = 'published';
              const apiRes = await api.line.createTemplate(formData, false);

              if (h.cmpStr(apiRes.status, 'ok')) {
                h.general.alert('success', {
                  message: `Template created and published successfully.`,
                });
                setTimeout(() => {
                  setLoading(false);
                  router.push(routes.templates.line.list);
                }, 2000);
              }
            }
          }

          setLoading(false);
        }
      },
    );
  }

  async function handleOnChangeFile(e) {
    const files = e.target.files;

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
                  <h1> Create Line Template</h1>
                </div>
                <div className="center-body">
                  <CommonIconButton
                    style={{ width: 164, height: 36 }}
                    onClick={() => {
                      router.push(routes.templates.line.list);
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
                              Line Channel<small>*</small>
                            </label>
                            <div
                              style={{
                                border: `${
                                  fieldError && h.isEmpty(form.channel)
                                    ? '1px solid #fe5959'
                                    : ''
                                }`,
                                borderRadius: '6px !important',
                              }}
                            >
                              <CommonSelect
                                id="line_channel"
                                options={[
                                  ...lineChannels.map((m) => ({
                                    value: m,
                                    label: `${m.channel_name} [${m.channel_id}]`,
                                  })),
                                ]}
                                value={form.channel}
                                isSearchable={true}
                                onChange={(v) => onChange(v, 'channel')}
                                placeholder="Select Line Channel"
                                className=""
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
                              Template Type<small>*</small>
                            </label>
                            <div
                              style={{
                                border: `${
                                  fieldError && h.isEmpty(form.template_type)
                                    ? '1px solid #fe5959'
                                    : ''
                                }`,
                                borderRadius: '6px !important',
                              }}
                            >
                              <CommonSelect
                                id="template_type"
                                options={[
                                  ...constant.LINE_TEMPLATE_TYPES.map((m) => ({
                                    value: m,
                                    label: Object.values(m),
                                  })),
                                ]}
                                value={form.template_type}
                                isSearchable={true}
                                onChange={(v) => onChange(v, 'template_type')}
                                placeholder="Select Template Type"
                                className=""
                              />
                            </div>
                          </div>
                          {templateType && h.cmpStr(templateType, 'BASIC') && (
                            <BasicTemplateCreate
                              onChange={onChange}
                              form={form}
                              setLoading={setLoading}
                              headerOption={headerOption}
                              setHeaderOption={setHeaderOption}
                              source={source}
                              setSource={setSource}
                              sourceUrl={sourceUrl}
                              setSourceUrl={setSourceUrl}
                              sourceThumbnail={sourceThumbnail}
                              setSourceThumbnail={setSourceThumbnail}
                              handleAddQuickReplies={handleAddQuickReplies}
                              fieldError={fieldError}
                              erroredFields={fieldErrorList}
                            />
                          )}
                          {templateType && h.cmpStr(templateType, 'BUTTON') && (
                            <ButtonTemplateCreate
                              onChange={onChange}
                              form={form}
                              setLoading={setLoading}
                              headerOption={headerOption}
                              setHeaderOption={setHeaderOption}
                              source={source}
                              setSource={setSource}
                              sourceUrl={sourceUrl}
                              setSourceUrl={setSourceUrl}
                              sourceThumbnail={sourceThumbnail}
                              setSourceThumbnail={setSourceThumbnail}
                              handleAddQuickReplies={handleAddQuickReplies}
                              fieldError={fieldError}
                              erroredFields={fieldErrorList}
                            />
                          )}
                          {templateType &&
                            h.cmpStr(templateType, 'CONFIRM') && (
                              <ConfirmTemplateCreate
                                onChange={onChange}
                                form={form}
                                fieldError={fieldError}
                                callBackQuickReplies={handleAddQuickReplies}
                                erroredFields={fieldErrorList}
                              />
                            )}
                          <div className="d-flex campaign-create-form mt-3">
                            <label></label>
                            <div>
                              <button
                                className="common-button transparent-bg w-150 mt-4 mr-1"
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={
                                  h.isEmpty(form.channel) ||
                                  h.isEmpty(form.template_name) ||
                                  h.isEmpty(templateType)
                                }
                              >
                                Save as Draft
                              </button>
                              <button
                                className="common-button mt-4"
                                type="button"
                                onClick={handleSubmit}
                                disabled={
                                  h.isEmpty(form.channel) ||
                                  h.isEmpty(form.template_name) ||
                                  h.isEmpty(templateType)
                                }
                              >
                                Publish
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
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
