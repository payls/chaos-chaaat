import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { debounce } from 'lodash';
import { routes } from '../../configs/routes';

// UI
import {
  faRedoAlt,
  faTimes,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// COMPONENTS
import TemplatePreview from '../WhatsApp/TemplatePreviewSendTemplate';
import CommonSelect from '../Common/CommonSelect';
import CommonAsyncSelect from '../Common/CommonAsyncSelect';
import CommonTooltip from '../Common/CommonTooltip';

export default React.memo(
  ({ agency, handleCloseModal, sending, setSending, directContact }) => {
    const router = useRouter();
    const [previewData, setPreviewData] = useState([]);
    const [whatsAppTemplateList, setWhatsAppTemplateList] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [waba, setWaba] = useState(null);
    const [whatsAppTemplates, setWhatsAppTemplates] = useState([
      {
        value: null,
      },
    ]);
    const [wabaCredentials, setWabaCredentials] = useState([]);

    const [status, setStatus] = useState(constant.API_STATUS.PENDING);

    useEffect(() => {
      if (agency) {
        // getTemplates(agency?.agency_id);
        // check of whatsapp option can be used
        if (
          !h.isEmpty(agency.agency_config) &&
          !h.isEmpty(agency.agency_config.whatsapp_config)
        ) {
          getWABAs(agency);
        }
      }
    }, [agency]);

    useEffect(() => {
      if (h.notEmpty(directContact)) {
        setSelectedContact(directContact);
      }
    }, [directContact]);

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


    // handling change of selected waba number to update list of templates
    useEffect(() => {
      if (
        h.notEmpty(waba)
      ) {
        getTemplates(agency?.agency_id, waba.value.waba_number);
      } else {
        setWhatsAppTemplateList([]);
      }
    }, [waba]);

    /**
     * Retrieves templates from the WhatsApp API based on the provided agency ID.
     * @param {string} id - The agency ID.
     * @returns {Promise<void>} - A promise that resolves when the templates are retrieved.
     */
    async function getTemplates(id, waba_number) {
      setStatus(constant.API_STATUS.PENDING);
      const apiRes = await api.whatsapp.searchTemplates({ agency_id: id, waba_number });

      if (h.cmpStr(apiRes.status, 'ok')) {
        setWhatsAppTemplateList(apiRes.data.agency_waba_templates);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    }

    /**
     * Retrieves the available agency WABA credentials.
     * @param {Object} agency - The agency object.
     * @returns {Promise<void>} - A promise that resolves when the WABA credentials are retrieved.
     */
    async function getWABAs(agency) {
      setStatus(constant.API_STATUS.PENDING);
      const whatsapp_config = JSON.parse(agency.agency_config.whatsapp_config);

      if (
        !h.isEmpty(whatsapp_config) &&
        !h.isEmpty(whatsapp_config.is_enabled) &&
        h.cmpBool(whatsapp_config.is_enabled, true)
      ) {
        //get available agency waba credentials
        const credentials = await api.whatsapp.getAgencyWhatsAppConfigurations(
          agency.agency_id,
          false,
        );
        setWabaCredentials(credentials.data.agency_whatsapp_config);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    }

    /**
     * Sends an initial template message to a contact.
     *
     * @param {Object} contact - The contact object.
     * @param {Object} template - The template object.
     * @param {Array} quickReplyResponses - The array of quick reply responses.
     * @returns {Promise<void>} - A promise that resolves when the message is sent.
     */
    async function sendInitialTemplateMessage(
      contact,
      template,
      quickReplyResponses,
    ) {
      setSending(true);
      const contact_id = contact.contact_id;
      const sendMsgRes = await api.whatsapp.sendInitialTemplateMessage(
        {
          contact_id,
          message_parts: template,
          quick_reply_responses: quickReplyResponses,
        },
        false,
      );
      setSending(false);
      handleCloseModal();
    }

    /**
     * Removes a template from the WhatsApp templates array.
     *
     * @param {number} index - The index of the template to be removed.
     */
    function handleRemoveTemplate(index) {
      const waTemplateClone = [...whatsAppTemplates];
      waTemplateClone.splice(index, 1);

      setWhatsAppTemplates(waTemplateClone);
    }

    /**
     * Fetches data based on the provided input value and invokes the callback function with the fetched data.
     *
     * @param {string} inputValue - The input value to search for.
     * @param {Function} callback - The callback function to invoke with the fetched data.
     * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
     */
    const fetchData = async (inputValue, callback) =>
      callback(
        await new Promise(async (resolve) => {
          const contacts = await api.contact.search({
            agency_id: agency?.agency_id,
            search: inputValue.toLowerCase(),
          });

          resolve(
            contacts.data.contacts.map((m) => ({
              label: `${m.first_name} ${m.last_name} ${
                m.mobile_number ? ' - (' + m.mobile_number + ')' : ''
              }`,
              value: m,
            })),
          );
        }),
      );

    const debouncedFetchData = debounce(fetchData, 300);
    const loadOptions = (inputValue, callback) => {
      debouncedFetchData(inputValue, callback);
    };

    /**
     * IconError component.
     * Renders an SVG icon representing an error.
     *
     * @component
     * @returns {JSX.Element} SVG icon representing an error.
     */
    const IconError = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <g clipPath="url(#clip0_4283_10563)">
          <path
            d="M11 0C8.82441 0 6.69767 0.645139 4.88873 1.85383C3.07979 3.06253 1.66989 4.7805 0.83733 6.79048C0.00476615 8.80047 -0.213071 11.0122 0.211367 13.146C0.635804 15.2798 1.68345 17.2398 3.22183 18.7782C4.76021 20.3166 6.72022 21.3642 8.85401 21.7886C10.9878 22.2131 13.1995 21.9952 15.2095 21.1627C17.2195 20.3301 18.9375 18.9202 20.1462 17.1113C21.3549 15.3023 22 13.1756 22 11C21.9969 8.08359 20.8369 5.28753 18.7747 3.22531C16.7125 1.16309 13.9164 0.00315432 11 0V0ZM11 20.1667C9.18701 20.1667 7.41473 19.6291 5.90728 18.6218C4.39983 17.6146 3.22491 16.1829 2.53111 14.5079C1.83731 12.8329 1.65578 10.9898 2.00947 9.21167C2.36317 7.43351 3.23621 5.80017 4.51819 4.51819C5.80017 3.23621 7.43352 2.36317 9.21168 2.00947C10.9898 1.65577 12.8329 1.8373 14.5079 2.5311C16.1829 3.22491 17.6146 4.39982 18.6218 5.90727C19.6291 7.41472 20.1667 9.18701 20.1667 11C20.164 13.4303 19.1974 15.7604 17.4789 17.4789C15.7604 19.1974 13.4303 20.164 11 20.1667Z"
            fill="#D70808"
          />
          <path
            d="M10.9987 4.58203C10.7556 4.58203 10.5224 4.67861 10.3505 4.85052C10.1786 5.02243 10.082 5.25558 10.082 5.4987V12.832C10.082 13.0751 10.1786 13.3083 10.3505 13.4802C10.5224 13.6521 10.7556 13.7487 10.9987 13.7487C11.2418 13.7487 11.475 13.6521 11.6469 13.4802C11.8188 13.3083 11.9154 13.0751 11.9154 12.832V5.4987C11.9154 5.25558 11.8188 5.02243 11.6469 4.85052C11.475 4.67861 11.2418 4.58203 10.9987 4.58203Z"
            fill="#D70808"
          />
          <path
            d="M11.9154 16.4987C11.9154 15.9924 11.505 15.582 10.9987 15.582C10.4924 15.582 10.082 15.9924 10.082 16.4987C10.082 17.005 10.4924 17.4154 10.9987 17.4154C11.505 17.4154 11.9154 17.005 11.9154 16.4987Z"
            fill="#D70808"
          />
        </g>
        <defs>
          <clipPath id="clip0_4283_10563">
            <rect width="22" height="22" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );

    /**
     * Renders a component indicating that the user is not connected with WhatsApp.
     * Provides a link to connect with WhatsApp.
     *
     * @component
     * @returns {JSX.Element} The rendered NotConnected component.
     */
    const NotConnected = () => (
      <div
        className="d-flex align-items-center mt-2 mb-3"
        style={{ gap: '0.5em' }}
      >
        <IconError />
        <div
          style={{
            borderRadius: '5px',
            border: '1px solid #D70808',
            background: '#fdf3f3',
            padding: '5px 10px',
            color: '#182327',
            fontSize: '12px',
          }}
        >
          You are not connected with WhatsApp.{' '}
          <Link href={h.getRoute(routes.settings.integrations)}>
            Connect here
          </Link>
        </div>
      </div>
    );

    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body md" style={{ minHeight: '400px' }}>
          <div className=" d-flex justify-content-between">
            <h1>Send New WhatsApp Message</h1>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                onClick={() => {
                  if (sending !== constant.API_STATUS.PENDING) {
                    handleCloseModal(false);
                  }
                }}
                style={{
                  cursor: 'pointer',
                  fontSize: '1em',
                  marginLeft: '3em',
                }}
              >
                <FontAwesomeIcon
                  icon={faTimes}
                  color="#182327"
                  style={{ fontSize: '15px' }}
                />
              </span>
            </div>
          </div>
          <div className=" modern-style pt-3">
            <div
              className="d-flex justify-content-between "
              style={{ gap: '3em', height: '550px' }}
            >
              <div
                style={{
                  flexGrow: 1,
                }}
                className="d-flex  flex-column"
              >
                <div className="d-flex campaign-create-form mt-3">
                  <div>
                    <label>
                      Business Account
                      <small style={{ color: '#fe5959' }}>*</small>
                    </label>
                    <div className="d-flex">
                      <div style={{ flex: 'auto' }}>
                        <CommonSelect
                          id="waba_number"
                          options={[
                            ...wabaCredentials.map((m) => ({
                              value: m,
                              label: `${m.waba_name} [${m.waba_number}]`,
                            })),
                          ]}
                          value={waba}
                          isSearchable={true}
                          onChange={(v) => {
                            setWaba(v);
                          }}
                          placeholder="Select business account"
                          className=""
                          control={{
                            borderColor: h.isEmpty(waba) ? '#fe5959' : '',
                          }}
                          disabled={sending}
                        />
                      </div>
                    </div>
                    {h.isEmpty(wabaCredentials) && <NotConnected />}
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <div>
                    <label>
                      Contact
                      <small style={{ color: '#fe5959' }}>*</small>
                    </label>
                    <div className="d-flex">
                      <div style={{ flex: 'auto' }}>
                        <CommonAsyncSelect
                          id="contact"
                          options={[
                            ...contacts.map((m) => ({
                              value: m,
                              label: `${m.first_name} [${m.last_name}]`,
                            })),
                          ]}
                          value={selectedContact}
                          isSearchable={true}
                          onChange={(v) => {
                            setSelectedContact(v);
                          }}
                          placeholder="Type your contact name/mobile"
                          loadOptions={loadOptions}
                          className=""
                          control={{
                            borderColor: h.isEmpty(selectedContact)
                              ? '#fe5959'
                              : '',
                          }}
                          disabled={sending}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <div>
                    <label>
                      WhatsApp Template
                      <small style={{ color: '#fe5959' }}>*</small>
                    </label>
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
                              options={whatsAppTemplateList
                                .filter((m) => m.status === 'APPROVED') // Filter only APPROVED templates
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
                                const waTemplateClone = [...whatsAppTemplates];
                                waTemplateClone[i] = v;

                                setWhatsAppTemplates(waTemplateClone);
                              }}
                              control={{
                                borderColor:
                                  h.isEmpty(whatsAppTemplates) ||
                                  (h.notEmpty(whatsAppTemplates) &&
                                    h.isEmpty(whatsAppTemplates[0].value))
                                    ? '#fe5959'
                                    : '',
                              }}
                              placeholder="Select template"
                              className={className}
                              disabled={sending}
                            />
                          </div>
                          <div className="center-body">
                            {whatsAppTemplates.length > 1 && (
                              <CommonTooltip tooltipText={'Remove'}>
                                <FontAwesomeIcon
                                  icon={faTrashAlt}
                                  color="#fe5959"
                                  style={{
                                    marginRight: '10px',
                                    marginLeft: '10px',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleRemoveTemplate(i)}
                                />
                              </CommonTooltip>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: '350px',
                  transform: 'scale(0.8)',
                  marginTop: '-70px',
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
            </div>
            <div className="center-body mt-4">
              <button
                tyle="button"
                className="modern-button common"
                style={{
                  width: '31%',
                  borderRadius: '30px',
                  height: '50px',
                }}
                disabled={
                  h.isEmpty(waba) ||
                  h.isEmpty(selectedContact) ||
                  h.isEmpty(whatsAppTemplates) ||
                  (h.notEmpty(whatsAppTemplates) &&
                    whatsAppTemplates[0].value === null) ||
                  sending
                }
                onClick={() => {
                  const quickReplies = document.querySelectorAll(
                    'textarea.qr_textarea',
                  );
                  const quickReplyValues = [];
                  quickReplies.forEach((quickReply) => {
                    const quickReplyValue = quickReply.value;
                    quickReplyValues.push(quickReplyValue);
                  });

                  sendInitialTemplateMessage(
                    selectedContact.value,
                    whatsAppTemplates,
                    quickReplyValues,
                  );
                }}
              >
                {sending === constant.API_STATUS.PENDING && (
                  <FontAwesomeIcon
                    icon={faRedoAlt}
                    color="#fff"
                    size="lg"
                    spin={sending}
                    className="mr-2"
                  />
                )}
                {sending ? 'Sending message...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
