import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import { routes } from '../../configs/routes';
import { saveAs } from 'file-saver';
import {
  faRedoAlt,
  faTimes,
  faTrashAlt,
  faDownload,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SmallSpinner from '../Inbox/SmallSpinner';
import TemplatePreview from '../WhatsApp/TemplatePreviewSendTemplate';
import CommonSelect from '../Common/CommonSelect';
import CommonTooltip from '../Common/CommonTooltip';

export default React.memo(
  ({
    agencyId,
    handleCloseModal,
    sendMessage,
    singleTemplate,
    templateSending,
    setTemplateSending,
    sending,
  }) => {
    const router = useRouter();
    const [previewData, setPreviewData] = useState([]);
    const [whatsAppTemplateList, setWhatsAppTemplateList] = useState([]);
    const [whatsAppTemplates, setWhatsAppTemplates] = useState([
      {
        value: null,
      },
    ]);

    const [status, setStatus] = useState(constant.API_STATUS.PENDING);

    useEffect(() => {
      if (agencyId) {
        getTemplates(agencyId);
      }
    }, [agencyId]);

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

    async function getTemplates(id) {
      setStatus(constant.API_STATUS.PENDING);
      const apiRes = await api.whatsapp.listTemplates({ agency_id: id });

      if (h.cmpStr(apiRes.status, 'ok')) {
        setWhatsAppTemplateList(apiRes.data.agency_waba_templates);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
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

    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body md" style={{ minHeight: '400px' }}>
          <div className=" d-flex justify-content-between">
            <h1>Select Template</h1>
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
                                  label: `${h.general.sentenceCase(
                                    m.template_name,
                                  )} (${m.waba_number})`,
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
                              placeholder="Select template"
                              className={className}
                              disabled={sending === constant.API_STATUS.PENDING}
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
                    <button
                      className="common-button mt-2 text-normal w170"
                      type="button"
                      onClick={handleAddTemplate}
                      disabled={whatsAppTemplates.length === 2}
                      style={{ display: singleTemplate ? 'none' : 'block' }}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        color="#fff"
                        style={{ marginRight: '5px' }}
                      />
                      Add template
                    </button>
                  </div>
                </div>
                {/* <div
                  className="d-flex campaign-create-form mt-3"
                  style={{ display: 'none' }}
                >
                  {previewData.length > 0 &&
                    previewData[0].quickReplies.length > 0 && (
                      <div>
                        <label>
                          Auto Responses
                          <small style={{ color: '#fe5959' }}>*</small>
                        </label>
                      </div>
                    )}
                </div>
                {previewData.length > 0 &&
                  previewData[0].quickReplies.length > 0 && (
                    <div style={{ display: 'none' }}>
                      {previewData[0].quickReplies.map((quickReply, index) => (
                        <>
                          <div
                            class="d-flex campaign-create-form mt-3"
                            key={index}
                          >
                            <label>{quickReply.value}</label>
                            <textarea
                              className="qr_textarea"
                              style={{
                                height: '100px',
                                maxHeight: '100px',
                                overflowY: 'scroll',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth',
                              }}
                            ></textarea>
                          </div>
                        </>
                      ))}
                    </div>
                  )} */}
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
                  h.isEmpty(whatsAppTemplates) ||
                  (h.notEmpty(whatsAppTemplates) &&
                    whatsAppTemplates[0].value === null) ||
                  sending === constant.API_STATUS.PENDING
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
                  sendMessage(
                    whatsAppTemplates.map((m) => m.value),
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
                {sending === constant.API_STATUS.PENDING
                  ? 'Sending message...'
                  : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
