import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes';
// ICON
import IconContact from '../../components/Icons/IconContact';
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
import CommonTooltip from '../../components/Common/CommonTooltip';
import CommonIconButton from '../../components/Common/CommonIconButton';
import IconWhatsApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonSelect from '../../components/Common/CommonSelect';
import CommonTextAreaEditor from '../../components/Common/CommonTextAreaEditor';
import TemplateBodyTextArea from '../../components/WhatsApp/TemplateBodyTextArea';
import TemplateQuickReplies from '../../components/WhatsApp/TemplateQuickReplies';
import TemplateCallToAction from '../../components/WhatsApp/TemplateCallToAction';
import TemplatePreview from '../../components/WhatsApp/TemplateCreatePreview';

export default function CampaignTemplateList() {
  const router = useRouter();

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
  const [form, setForm] = useState({});

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
    (async () => {
      setLoading(true);
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

      setLoading(false);
    })();
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

  function handleSaveDraft() {
    h.general.prompt(
      {
        message: 'Are you sure you want to save this new template?',
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
          formData.body_variables = bodyVariables;

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

  function handleSubmit() {
    h.general.prompt(
      {
        message: 'Are you sure you want to submit this new template?',
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
          formData.body_variables = bodyVariables;

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
                  <h1>{'Create'} Template</h1>
                </div>
                <div className="center-body"></div>
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
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Header<small className="chip">Optional</small>
                            </label>
                            <div>
                              <span
                                style={{
                                  color: '#c5c5c5',
                                  display: 'block',
                                  marginBottom: '5px',
                                }}
                              >
                                Add header image you want
                              </span>
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
                                Upload Image
                              </button>
                              {headerOption === 'image' && (
                                <input
                                  placeholder="Enter sample image url"
                                  type="text"
                                  value={image}
                                  className="form-item mt-2"
                                  onChange={(e) => setImage(e.target.value)}
                                />
                              )}
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Body<small>*</small>
                            </label>
                            <div>
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
                            <div>
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
                                {buttons !== 'none' && <hr />}
                                {buttons === 'QUICK_REPLY' && (
                                  <TemplateQuickReplies
                                    callBack={handleAddQuickReplies}
                                  />
                                )}
                                {buttons === 'CTA' && (
                                  <TemplateCallToAction
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
