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
import BasicTemplateEdit from '../../../components/Line/BasicTemplateEdit';
import ConfirmTemplateEdit from '../../../components/Line/ConfirmTemplateEdit';
import ButtonTemplateEdit from '../../../components/Line/ButtonTemplateEdit';
import TemplatePreview from '../../../components/Line/TemplatePreview';

export default function CampaignTemplateList() {
  const router = useRouter();

  const fileRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [fieldErrorList, setFieldErrorList] = useState(false);
  const [agency, setAgency] = useState([]);
  const [lineChannels, setLineChannels] = useState([]);
  const [templateType, setTemplateType] = useState(null);
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [selectedLineChannel, setSelectedLineChannel] = useState({});
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
  const [isDraft, setIsDraft] = useState(false);
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
      const credentials = await api.line.getChannelList(
        { agency_id: agencyRes.data.agencyUser.agency.agency_id },
        false,
      );
      setLineChannels(credentials.data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // Check if the query parameters have been populated
      if (h.notEmpty(lineChannels)) {
        const { line_template_id } = router.query;
        // Access the parameter value
        const apiRes = await api.line.getTemplate(line_template_id, false);
        const temp_template = cloneDeep(form);
        const line_template = apiRes.data.line_template;
        setIsDraft(h.cmpStr(line_template.status, 'draft'));
        // handling line channel config
        const line_channel_config = await lineChannels.find(
          (item) =>
            item.agency_channel_config_id === line_template.line_channel,
        );
        setSelectedLineChannel(line_channel_config);
        // handling template_name
        temp_template.template_name = h.general.sentenceCase(
          line_template.template_name,
        );
        // handling template_type
        const template_type = line_template.template_type;
        const type_arr = constant.LINE_TEMPLATE_TYPES;
        const type_index = type_arr.findIndex((obj) => obj[template_type]);
        const selected_type = type_arr[type_index];
        temp_template.template_type = {
          label: [selected_type[template_type]],
          value: selected_type,
        };
        setTemplateType(template_type);
        // handling components
        const contents = JSON.parse(line_template.content);
        if (h.cmpStr(template_type, 'BASIC')) {
          contents.forEach(function (content) {
            if (['image', 'video'].includes(content.type)) {
              temp_template.template_header = content.type;
              setHeaderOption(content.type);
              setSource('url');
              setDirectURL(content.originalContentUrl);
              setSourceUrl(content.originalContentUrl);
              setSourceThumbnail(content.previewImageUrl);
            }
            if (h.cmpStr(content.type, 'text')) {
              temp_template.template_body = content.text;
              if (!h.isEmpty(content.quickReply)) {
                const quickReplyItems = content.quickReply.items;
                handleButtonOptionAction('QUICK_REPLY');
                quickReplyItems.forEach(function (item) {
                  temp_template.quick_replies.push({ value: item.action.text });
                });
              }
            }
          });
        } else if (h.cmpStr(template_type, 'CONFIRM')) {
          temp_template.template_body = contents.template.text;
          if (!h.isEmpty(contents.template.actions)) {
            const quickReplyItems = contents.template.actions;
            handleButtonOptionAction('QUICK_REPLY');
            quickReplyItems.forEach(function (item) {
              temp_template.quick_replies.push({ value: item.text });
            });
          }
        } else if (h.cmpStr(template_type, 'BUTTON')) {
          temp_template.template_body = contents.template.text;
          temp_template.header_title = contents.template.title;
          temp_template.redirection_url = !h.isEmpty(
            contents.template.defaultAction,
          )
            ? contents.template.defaultAction.uri
            : null;

          if (!h.isEmpty(contents.template.actions)) {
            const quickReplyItems = contents.template.actions;
            quickReplyItems.forEach(function (item) {
              if (h.cmpStr(item.type, 'message')) {
                temp_template.quick_replies.push({
                  action: item.option_type,
                  value: item.text,
                  action_value: item.text,
                });
              } else if (h.cmpStr(item.type, 'uri')) {
                let uriString = item.uri;

                if (uriString && uriString.includes('tel:')) {
                  uriString = uriString.replace(/^tel:/, '');
                }

                temp_template.quick_replies.push({
                  action: item.option_type,
                  value: item.label,
                  action_value: uriString,
                });
              }
            });
          }
          setHeaderOption('image');
          setSource('url');
          setSourceUrl(contents.template.thumbnailImageUrl);
          setDirectURL(contents.template.thumbnailImageUrl);
          setSourceThumbnail(contents.template.thumbnailImageUrl);
        }
        setForm(temp_template);
      }
    })();
  }, [lineChannels]);

  useEffect(() => {
    (async () => {
      if (
        typeof selectedLineChannel === 'object' &&
        selectedLineChannel !== null &&
        Object.keys(selectedLineChannel).length !== 0
      ) {
        const temp_template = cloneDeep(form);
        const selectedLineChannelLabel = `${selectedLineChannel.channel_name} [${selectedLineChannel.channel_id}]`;
        temp_template.channel = {
          value: selectedLineChannel,
          label: selectedLineChannelLabel,
        };
        setForm(temp_template);
      }
    })();
  }, [selectedLineChannel]);

  useEffect(() => {
    setQuickReplyBtns(form.quick_replies);
    setCTABtns(form.cta_btn);
  }, [buttons]);

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

  function handleSaveDraft() {
    h.general.prompt(
      {
        message:
          'Are you sure you want to save this template and set as draft?',
      },

      async (status) => {
        if (status) {
          const formData = {};
          const { line_template_id } = router.query;
          formData.line_template_id = line_template_id;
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
                altText: 'Confirmation Message',
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
            const apiRes = await api.line.updateTemplate(formData, false);

            if (h.cmpStr(apiRes.status, 'ok')) {
              h.general.alert('success', {
                message: `Succesfully updated template and set as draft.`,
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
    setFieldError(false);
    h.general.prompt(
      {
        message: 'Are you sure you want to update and publish this template?',
      },

      async (status) => {
        if (status) {
          const formData = {};
          const { line_template_id } = router.query;
          formData.line_template_id = line_template_id;
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
              setFieldError(false);

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
                with_error.push('Action Value Buttons');
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
              const apiRes = await api.line.updateTemplate(formData, false);

              if (h.cmpStr(apiRes.status, 'ok')) {
                h.general.alert('success', {
                  message: `Template updated and published successfully.`,
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
                  <h1>Edit Line Template</h1>
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
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Line Channel<small>*</small>
                            </label>
                            <div>
                              <CommonSelect
                                id="waba_number"
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
                              Template Type<small>*</small>
                            </label>
                            <div>
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
                                disabled={true}
                              />
                            </div>
                          </div>
                          {templateType && h.cmpStr(templateType, 'BASIC') && (
                            <BasicTemplateEdit
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
                              uploadURL={uploadURL}
                              setUploadURL={setUploadURL}
                              directURL={directURL}
                              setDirectURL={setDirectURL}
                              handleAddQuickReplies={handleAddQuickReplies}
                              fieldError={fieldError}
                              erroredFields={fieldErrorList}
                            />
                          )}
                          {templateType && h.cmpStr(templateType, 'BUTTON') && (
                            <ButtonTemplateEdit
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
                              directURL={directURL}
                              setDirectURL={setDirectURL}
                              handleAddQuickReplies={handleAddQuickReplies}
                              fieldError={fieldError}
                              erroredFields={fieldErrorList}
                            />
                          )}
                          {templateType &&
                            h.cmpStr(templateType, 'CONFIRM') && (
                              <ConfirmTemplateEdit
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
                                className="common-button transparent-bg mt-4 mr-1"
                                type="button"
                                onClick={handleSaveDraft}
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
