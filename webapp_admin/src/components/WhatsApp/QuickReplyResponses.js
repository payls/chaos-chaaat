import React, { useState, useEffect } from 'react';
import Toggle from 'react-toggle';
import {
  faTable,
  faImage,
  faComment,
  faHandPointer,
  faBold,
  faItalic,
  faPlus,
  faStrikethrough,
  faInfoCircle,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import CommonSelect from '../../components/Common/CommonSelect';
import CommonTooltip from '../../components/Common/CommonTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { h } from '../../helpers';

export default React.memo(
  ({
    buttons,
    form,
    quickReplySettings,
    setQuickReplySettings,
    whatsAppTemplateList,
    setForm,
    disabled,
  }) => {
    const [quickResponses, setQuickResponses] = useState([
      ...form.cta_response,
    ]);

    function formatQuickResponses(index, value) {
      const updatedResponses = [...quickResponses];
      updatedResponses[index] = value;
      setQuickResponses(updatedResponses);
    }

    useEffect(() => {
      // Update the form state with the new quickResponses
      setForm((prevForm) => ({
        ...prevForm,
        cta_response: quickResponses,
        cta_settings: quickReplySettings,
      }));
    }, [quickResponses, quickReplySettings, setForm]);

    return (
      <>
        {buttons &&
          buttons.length > 0 &&
          buttons.map((btn, i) => (
            <>
              <div className="mt-3" key={i}>
                <textarea
                  placeholder={`Enter CTA response for "${btn.text}". Leave empty if to use follow up message`}
                  className="qr_textarea"
                  style={{
                    height: '80px',
                    maxHeight: '80px',
                    overflowY: 'scroll',
                    scrollbarWidth: 'thin',
                    scrollBehavior: 'smooth',
                  }}
                  value={h.general.unescapeData(quickResponses[i]) || ''}
                  onChange={(e) => formatQuickResponses(i, e.target.value)}
                  disabled={disabled}
                ></textarea>
                {/* <div className="d-flex">
                  <label className="whatsapp-toggle d-flex align-items-center mt-2">
                    <Toggle
                      value={1}
                      checked={quickReplySettings[i].cta_1_option}
                      icons={false}
                      defaultChecked={quickReplySettings[i].cta_1_option}
                      className="whatsapp-toggle mr-2"
                      onClick={(e) => {
                        const n = [...quickReplySettings];
                        n[i].cta_1_option = !n[i].cta_1_option;
                        n[i].cta_2_option = false;
                        n[i].opt_out = false;
                        setQuickReplySettings(n);
                      }}
                      disabled={disabled}
                    />
                    <span className="">
                      Set as Interested Button{' '}
                      <CommonTooltip tooltipText="Will set this button as Interested Button. Will give contact 50 lead score when this button is selected.">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#08453d"
                          size=""
                        />
                      </CommonTooltip>
                    </span>
                  </label>
                  <label className="whatsapp-toggle d-flex align-items-center ml-2 mt-2">
                    <Toggle
                      value={2}
                      icons={false}
                      checked={quickReplySettings[i].cta_2_option}
                      defaultChecked={quickReplySettings[i].cta_2_option}
                      className="whatsapp-toggle mr-2"
                      onClick={(e) => {
                        const n = [...quickReplySettings];
                        n[i].cta_1_option = false;
                        n[i].cta_2_option = !n[i].cta_2_option;
                        n[i].opt_out = false;
                        setQuickReplySettings(n);
                      }}
                      disabled={disabled}
                    />
                    <span className="">
                      Set as Maybe Later Button{' '}
                      <CommonTooltip tooltipText="Will set this button as Not Interested Button.">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#08453d"
                          size=""
                        />
                      </CommonTooltip>
                    </span>
                  </label>
                  <label className="whatsapp-toggle d-flex align-items-center ml-2 mt-2">
                    <Toggle
                      value={3}
                      icons={false}
                      checked={quickReplySettings[i].opt_out}
                      defaultChecked={quickReplySettings[i].opt_out}
                      className="whatsapp-toggle mr-2"
                      onClick={(e) => {
                        const n = [...quickReplySettings];
                        n[i].cta_1_option = false;
                        n[i].cta_2_option = false;
                        n[i].opt_out = !n[i].opt_out;
                        setQuickReplySettings(n);
                      }}
                      disabled={disabled}
                    />
                    <span className="">
                      Set as Unsubscribe Button{' '}
                      <CommonTooltip tooltipText="Will set this button as Unsubscribe Button. Contact will no longer be receiving whatsapp messages.">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#08453d"
                          size=""
                        />
                      </CommonTooltip>
                    </span>
                  </label>
                </div> */}
                <hr />
                <label className="whatsapp-toggle d-flex align-items-center mt-2">
                  <Toggle
                    icons={false}
                    checked={quickReplySettings[i].enabled}
                    defaultChecked={quickReplySettings[i].enabled}
                    className="whatsapp-toggle mr-2"
                    onClick={(e) => {
                      const n = [...quickReplySettings];
                      n[i].enabled = !n[i].enabled;
                      setQuickReplySettings(n);
                    }}
                    disabled={disabled}
                  />
                  <span className="">Enable Follow-Up Message</span>
                </label>
                {quickReplySettings[i].enabled && (
                  <CommonSelect
                    id={`cta-to-use`}
                    options={whatsAppTemplateList.map((m) => ({
                      value: m,
                      label:
                        `[WABA: ${m.waba_number}] - ` +
                        h.general.sentenceCase(m.template_name),
                    }))}
                    value={quickReplySettings[i].cta_template}
                    isSearchable={true}
                    onChange={(v) => {
                      const n = [...quickReplySettings];
                      n[i].cta_template = v;
                      setQuickReplySettings(n);
                    }}
                    placeholder="Select CTA to use"
                    className={''}
                    disabled={disabled}
                  />
                )}
                {quickReplySettings[i].enabled && (
                  <>
                    <label className="whatsapp-toggle d-flex align-items-center mt-2">
                      <span className="">Final Response</span>
                    </label>
                    <textarea
                      className="form-item"
                      value={h.general.unescapeData(quickReplySettings[i].final_response) || ''}
                      onChange={(v) => {
                        const n = [...quickReplySettings];
                        n[i].final_response = v.target.value;
                        setQuickReplySettings(n);
                      }}
                      disabled={disabled}
                    ></textarea>
                  </>
                )}
                <hr style={{ border: '1px solid #c6c6c6' }} />
              </div>
            </>
          ))}
      </>
    );
  },
);
