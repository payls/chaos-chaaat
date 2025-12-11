import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { cloneDeep } from 'lodash';

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
import TemplatePreview from '../Line/TemplatePreview';
import CommonSelect from '../Common/CommonSelect';
import CommonTooltip from '../Common/CommonTooltip';

export default React.memo(
  ({
    agencyId,
    contact,
    handleCloseModal,
    sendMessage,
    singleTemplate,
    templateSending,
    setTemplateSending,
    sending,
    lineChannels,
    lineLastChannelUsed,
    selectedLineChannel,
    changeLineSelectedChannel,
  }) => {
    const router = useRouter();
    const [lineTemplateList, setLineTemplateList] = useState([]);
    const [lineTemplates, setLineTemplates] = useState([
      {
        value: null,
      },
    ]);
    //for template preview
    const [form, setForm] = useState({
      quick_replies: [],
      cta_btn: [],
      body_variables: {},
    });
    const [headerOption, setHeaderOption] = useState('none');
    const [source, setSource] = useState('upload');
    const [sourceUrl, setSourceUrl] = useState(null);
    const [sourceThumbnail, setSourceThumbnail] = useState(null);
    const [buttons, setButtons] = useState('none');
    const [quickReplyBtns, setQuickReplyBtns] = useState([]);
    const [ctaBtns, setCTABtns] = useState([]);
    const [formattedBody, setFormattedBody] = useState(null);
    const [isBodyWithVariable, setIsBodyWithVariable] = useState(false);
    const [uploadURL, setUploadURL] = useState('');
    const [directURL, setDirectURL] = useState('');
    const [selectedChannel, setSelectedChannel] = useState({});

    const [status, setStatus] = useState(constant.API_STATUS.PENDING);

    function onChange(v, key) {
      if (key === 'template_body') {
        setFormattedBody(null);
        setIsBodyWithVariable(false);
      }
      setForm((prev) => ({ ...prev, [key]: v }));
    }

    useEffect(() => {
      if (agencyId) {
        getTemplates(agencyId, lineLastChannelUsed, selectedLineChannel);
      }
    }, [agencyId]);

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
                let cleanedURIString = uriString.replace(/^tel:/, '');
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

    useEffect(() => {
      setQuickReplyBtns(form.quick_replies);
      setCTABtns(form.cta_btn);
    }, [buttons]);

    function handleButtonOptionAction(type) {
      setButtons(type);
      onChange(type, 'template_button');
    }

    async function getTemplates(id, lineLastChannelUsed, selectedLineChannel) {
      setStatus(constant.API_STATUS.PENDING);
      let channelApiRes;
      if (!h.isEmpty(selectedLineChannel)) {
        channelApiRes = await api.line.getChannelBasedOnConfigID(
          selectedLineChannel,
          false,
        );
      } else {
        channelApiRes = await api.line.getChannelBasedOnChannelID(
          lineLastChannelUsed,
          false,
        );
      }

      if (h.cmpStr(channelApiRes.status, 'ok')) {
        setSelectedChannel({
          value: channelApiRes.data.line_channel,
          label: channelApiRes.data.line_channel.channel_name,
        });
        const apiRes = await api.line.listPublishedTemplates(
          {
            channel: channelApiRes.data.line_channel.agency_channel_config_id,
          },
          false,
        );
        if (h.cmpStr(apiRes.status, 'ok')) {
          setLineTemplateList(apiRes.data.line_templates);
          setLineTemplates([{ value: null, label: 'Select template' }]);
          setForm({
            quick_replies: [],
            cta_btn: [],
            body_variables: {},
          });
          setButtons('QUICK_REPLY');
          setQuickReplyBtns([]);
          setHeaderOption('none');
          setSource('url');
          setDirectURL(null);
          setSourceThumbnail(null);
        }
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    }

    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body md" style={{ minHeight: '400px' }}>
          <div className=" d-flex justify-content-between">
            <h1>Select Line Template</h1>
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
                    <label>Contact Channel</label>
                    <div className="d-flex">
                      <div style={{ flex: 'auto' }}>
                        <CommonSelect
                          id="contact"
                          options={[
                            ...lineChannels.map((m) => ({
                              value: m,
                              label: `${m.channel_name}`,
                            })),
                          ]}
                          value={selectedChannel}
                          isSearchable={true}
                          onChange={(v) => {
                            getTemplates(
                              v.value.agency_fk,
                              null,
                              v.value.agency_channel_config_id,
                            );
                          }}
                          placeholder="Select Channel"
                          className=""
                          disabled={sending === constant.API_STATUS.PENDING}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex campaign-create-form mt-3">
                  <div>
                    <label>Published Templates</label>
                    {lineTemplates.map((line_template, i) => {
                      let className = '';
                      if (i > 0) {
                        className = 'mt-2';
                      }

                      return (
                        <div className="d-flex" key={i}>
                          <div style={{ flex: 'auto' }}>
                            <CommonSelect
                              id={`line_template-${i}`}
                              options={lineTemplateList
                                .filter((m) => m.status === 'published') // Filter only published templates
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
                                const lineTemplateClone = [...lineTemplates];
                                lineTemplateClone[i] = v;
                                setLineTemplates(lineTemplateClone);
                              }}
                              placeholder="Select template"
                              className={className}
                              disabled={sending === constant.API_STATUS.PENDING}
                            />
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
                  h.isEmpty(lineTemplates) ||
                  (h.notEmpty(lineTemplates) &&
                    lineTemplates[0].value === null) ||
                  sending === constant.API_STATUS.PENDING
                }
                onClick={() => {
                  sendMessage(lineTemplates.map((m) => m.value));
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
