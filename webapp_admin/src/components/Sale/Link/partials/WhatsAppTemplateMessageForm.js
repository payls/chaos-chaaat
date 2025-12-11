import React, { useState, useEffect, useMem, useCallback } from 'react';
import { cloneDeep } from 'lodash';
import { h } from '../preview/helpers';
import { api } from '../preview/api';
import Toggle from 'react-toggle';
import constant from '../preview/constants/constant.json';
import WhatsAppMessageImageSelector from '../preview/components/Project/WhatsAppMessageImageSelector';
import { getCurrentStatusOrder } from '../../../../helpers/leadStatus';
import CtaOptions from './CtaOptions';
export default function WhatsAppMessageForm({
  setLoading,
  agency,
  templates,
  setTemplates,
  wabaSelectedCredentials,
  ctaResponses,
  setCtaResponses,
  ctaOptions,
  setCtaOptions,
}) {
  useEffect(() => {
    (async () => {
      setLoading(true);
      const credentials = h.notEmpty(wabaSelectedCredentials.agency_waba_id)
        ? wabaSelectedCredentials.agency_waba_template_token +
          ':' +
          wabaSelectedCredentials.agency_waba_template_secret
        : null;
      if (!h.isEmpty(credentials)) {
        const agencyBufferedCredentials = Buffer.from(
          credentials,
          'utf8',
        ).toString('base64');
        const availableTemplates = await api.whatsapp.getAvailableTemplates(
          wabaSelectedCredentials.agency_waba_id,
          agencyBufferedCredentials,
          false,
        );
        if (
          h.cmpStr(availableTemplates.status, 'ok') &&
          !h.isEmpty(availableTemplates.data.templates)
        ) {
          setTemplates([]);
          const fetchTemplates = availableTemplates.data.templates;
          fetchTemplates.map((template, i) => {
            if (
              !template.name.includes('sample') &&
              h.cmpStr(template.status, 'APPROVED')
            ) {
              template.original_name = template.name;
              template.name = template.name
                .toLowerCase()
                .split('_')
                .join(' ')
                .replace(/\b[a-z]/g, function (letter) {
                  return letter.toUpperCase();
                });
              template.selected = false;
              template.header_image =
                'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png';
              template.body_component = [];
              setTemplates((current) => [...current, template]);
            }
          });
        }
      }
      setLoading(false);
    })();
  }, [wabaSelectedCredentials]);

  const handleHeaderImageURL = (index, event) => {
    const temp_templates = cloneDeep(templates);
    setLoading(true);
    if (event.target.value) {
      temp_templates[index].header_image = event.target.value;
    }
    setTemplates(temp_templates);
    setLoading(false);
  };

  const handleTemplateSelection = async (index) => {
    setLoading(true);
    templates[index].selected = !templates[index].selected;
    await setTemplates(templates);
    setLoading(false);
  };

  const handleBodyComponentSelect = (index, componentIndex, event) => {
    const temp_templates = cloneDeep(templates);
    setLoading(true);
    temp_templates[index].body_component[componentIndex] = event.target.value;
    setTemplates(temp_templates);
    setLoading(false);
  };

  const handleSetCTAResponse = (index, event) => {
    ctaResponses[index] = event.target.value;
  };

  return (
    <>
      {!h.isEmpty(templates) &&
        templates.map((template, index) => {
          return (
            <>
              <div
                className="col-md-12  mt-3"
                style={{ border: '1px solid #eff2ed', borderRadius: '8px' }}
              >
                <label className="whatsapp-toggle d-flex align-items-center">
                  <Toggle
                    icons={false}
                    defaultChecked={false}
                    className="whatsapp-toggle"
                    onClick={() => handleTemplateSelection(index)}
                  />
                  <h3 className="modal-sub-title-item mt-2">{template.name}</h3>
                </label>
                {template.components.map((component, componentIndex) => {
                  if (h.cmpBool(template.selected, true)) {
                    if (h.cmpStr(component.type, 'HEADER')) {
                      if (h.cmpStr(component.format, 'IMAGE')) {
                        return (
                          <>
                            <div className=" justify-content-center">
                              <img
                                src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png"
                                style={{ width: '100%' }}
                              ></img>
                            </div>
                            <div className="modal-input-group mt-3 mb-3">
                              <label>Header Image URL</label>
                              <input
                                placeholder="Paste Header Image URL Here"
                                onChange={() =>
                                  handleHeaderImageURL(index, event)
                                }
                              />
                            </div>
                          </>
                        );
                      }
                    }
                    if (h.cmpStr(component.type, 'BODY')) {
                      if (typeof component.example !== 'undefined') {
                        const examples =
                          component.example.body_text.length > 0
                            ? component.example.body_text[0]
                            : '';
                        return (
                          <>
                            <div className="d-flex justify-content-center">
                              <p style={{ whiteSpace: 'pre-wrap' }}>
                                {component.text}
                              </p>
                            </div>
                            {examples.map((example, exampleIndex) => {
                              return (
                                <div class="modal-input-group mt-3 mb-3">
                                  <label>
                                    Message Body Component #{exampleIndex + 1}{' '}
                                    &#123;&#123;{exampleIndex + 1}&#125;&#125;
                                  </label>
                                  <select
                                    onChange={() =>
                                      handleBodyComponentSelect(
                                        index,
                                        exampleIndex,
                                        event,
                                      )
                                    }
                                  >
                                    <option value="contact">Contact</option>
                                    <option value="agent">Agent</option>
                                    <option value="link">Proposal Link</option>
                                  </select>
                                </div>
                              );
                            })}
                          </>
                        );
                      } else {
                        return (
                          <>
                            <div className="d-flex justify-content-center">
                              <p style={{ whiteSpace: 'pre-wrap' }}>
                                {component.text}
                              </p>
                            </div>
                          </>
                        );
                      }
                    }
                    if (h.cmpStr(component.type, 'BUTTONS')) {
                      return (
                        <>
                          {component.buttons.map((button, buttonIndex) => {
                            return (
                              <>
                                <h6
                                  style={{
                                    display: h.cmpStr(
                                      button.type,
                                      'QUICK_REPLY',
                                    )
                                      ? 'block'
                                      : 'none',
                                  }}
                                >
                                  CTA {buttonIndex + 1}
                                </h6>
                                <div
                                  className="d-flex justify-content-center"
                                  style={{
                                    border: '1px solid #215046',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    marginBottom: '2px',
                                  }}
                                >
                                  {button.text}
                                </div>
                                <div
                                  style={{
                                    display: h.cmpStr(
                                      button.type,
                                      'QUICK_REPLY',
                                    )
                                      ? 'block'
                                      : 'none',
                                  }}
                                  class="modal-input-group mt-3 mb-3"
                                >
                                  <h6>Response</h6>
                                  <sup
                                    style={{
                                      marginTop: '5px',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    Note: If this field are left empty, the
                                    generic responses will be used.
                                  </sup>
                                  <textarea
                                    placeholder="Enter CTA Response here"
                                    onKeyUp={() =>
                                      handleSetCTAResponse(buttonIndex, event)
                                    }
                                    style={{
                                      marginBottom: '10px',
                                      display: 'block',
                                      width: '100%',
                                    }}
                                  ></textarea>
                                  <CtaOptions
                                    agency={agency}
                                    ctaOptions={ctaOptions}
                                    setCtaOptions={setCtaOptions}
                                    templates={templates}
                                    setTemplates={setTemplates}
                                    setLoading={setLoading}
                                    index={index}
                                    componentIndex={componentIndex}
                                    buttonIndex={buttonIndex}
                                    button={button}
                                    openCtaOptions={button.show_cta11}
                                  ></CtaOptions>
                                </div>
                              </>
                            );
                          })}
                        </>
                      );
                    }
                  }
                })}
              </div>
            </>
          );
        })}
    </>
  );
}
