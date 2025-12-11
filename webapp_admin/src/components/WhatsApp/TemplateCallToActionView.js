import React, { useState, useRef, useEffect } from 'react';
import { h } from '../../helpers';

import { faTimes, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonSelect from '../../components/Common/CommonSelect';

const CTA_ACTIONS = [
  // {
  //   value: 'call_phone_number',
  //   label: 'Call Phone Number',
  // },
  {
    value: 'visit_website',
    label: 'Visit Website',
  },
];

const URL_TYPE = [
  {
    value: 'static',
    label: 'Static',
  },
  {
    value: 'dynamic',
    label: 'Permalink',
  },
  {
    value: 'contact_email',
    label: 'Contact Email',
  },
];

export default React.memo(({ form, callBack, disabled }) => {
  const [buttons, setButtons] = useState(form.cta_btn);

  useEffect(() => {
    if (h.notEmpty(buttons)) {
      callBack(buttons);
    }
  }, [buttons]);

  function handleAddButton() {
    const newBtn = [...buttons];
    newBtn.push({
      value: '',
      type: {
        value: 'dynamic',
        label: 'Dynamic',
      },
      url: '',
      web_url: '',
      action: {
        value: 'visit_website',
        label: 'Visit Website',
      },
      phone: '',
      country: '',
    });

    setButtons(newBtn);
  }

  function handleUpdateButtonValue(v, index, key) {
    const newBtn = [...buttons];
    newBtn[index][key] = v;

    setButtons(newBtn);
  }

  function handleDeleteButton(index) {
    const newBtn = [...buttons];
    newBtn.splice(index, 1);

    setButtons(newBtn);
  }

  return (
    <>
      {buttons &&
        buttons.length > 0 &&
        buttons.map((btn, i) => (
          <div
            className="d-flex cta-wrapper align-items-center"
            style={{ gap: '2em' }}
          >
            <div>
              <label>Type of Action</label>
              <span>
                <CommonSelect
                  id={`type-${i}`}
                  options={CTA_ACTIONS}
                  value={btn.action}
                  isSearchable={false}
                  onChange={(v) => handleUpdateButtonValue(v, i, 'action')}
                  placeholder="Select"
                  className="w-130"
                  disabled={disabled}
                />
              </span>
            </div>
            <div>
              <label>Button Text</label>
              <span>
                <input
                  type="text"
                  value={btn.value}
                  onChange={(e) =>
                    handleUpdateButtonValue(e.target.value, i, 'value')
                  }
                  size={100}
                  maxLength={20}
                  className="form-info"
                  disabled={disabled}
                />
                <small> {btn.value.length}/20</small>
              </span>
            </div>
            {btn.action.value === 'call_phone_number' && (
              <>
                <div>
                  <label>Country</label>
                  <span>
                    <CommonSelect
                      id={`country-${i}`}
                      options={[]}
                      value={btn.country}
                      isSearchable={true}
                      onChange={(v) => handleUpdateButtonValue(v, i, 'country')}
                      placeholder="Select"
                      className="w-150"
                      disabled={disabled}
                    />
                  </span>
                </div>
                <div>
                  <label>Phone</label>
                  <span>
                    <input
                      type="text"
                      value={btn.phone}
                      onChange={(e) =>
                        handleUpdateButtonValue(e.target.value, i, 'phone')
                      }
                      size={100}
                      maxLength={20}
                      className="form-info"
                      disabled={disabled}
                    />
                  </span>
                </div>
              </>
            )}
            {btn.action.value === 'visit_website' && (
              <>
                <div>
                  <label>URL Type</label>
                  <span>
                    <CommonSelect
                      id={`web-url-${i}`}
                      options={URL_TYPE}
                      value={btn.type}
                      isSearchable={true}
                      onChange={(v) => handleUpdateButtonValue(v, i, 'type')}
                      placeholder="Select"
                      className="w-130"
                      disabled={disabled}
                    />
                  </span>
                </div>
                <div>
                  <label>Website URL</label>
                  <span>
                    <input
                      type="text"
                      value={btn.web_url}
                      onChange={(e) =>
                        handleUpdateButtonValue(e.target.value, i, 'web_url')
                      }
                      size={100}
                      className="form-info"
                      style={{
                        padding: ['dynamic', 'contact_email'].includes(
                          btn.type.value,
                        )
                          ? '9px 40px 9px 8px'
                          : '9px 8px',
                      }}
                      disabled={disabled}
                    />
                    {['dynamic', 'contact_email'].includes(btn.type.value) && (
                      <small>{`{{1}}`}</small>
                    )}
                  </span>
                </div>
              </>
            )}
            {/* <FontAwesomeIcon
              icon={faTimes}
              color="#182327"
              style={{ marginLeft: '5px', cursor: 'pointer' }}
              onClick={() => handleDeleteButton(i)}
            /> */}
          </div>
        ))}
      {/* <button
        type="button"
        className="icon-btn"
        onClick={() => {
          handleAddButton();
        }}
        disabled={buttons.length === 1}
        style={{
          display: 'block',
          color: buttons.length === 1 ? '#c5c5c5' : 'inherit',
        }}
      >
        <FontAwesomeIcon
          icon={faPlusCircle}
          color="#182327"
          style={{
            marginRight: '5px',
            color: buttons.length === 1 ? '#c5c5c5' : 'inherit',
          }}
        />
        Add Action Button
      </button> */}
    </>
  );
});
