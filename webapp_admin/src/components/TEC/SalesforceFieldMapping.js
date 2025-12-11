import React, { useEffect, useState, useRef } from 'react';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import constant from '../../constants/constant.json';
import { api } from '../../api';
import { h } from '../../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';

export default React.memo(({ liveChatSetting }) => {
  const requiredRef = useRef(null);
  const [error, setError] = useState(false);
  const [fields, setFields] = useState([
    {
      label: 'First Name',
      field: 'first_name',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    {
      label: 'Last Name',
      field: 'last_name',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    {
      label: 'Phone Number',
      field: 'phone',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    {
      label: 'Email Address',
      field: 'email_address',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    // {
    //   label: 'Lead Source',
    //   field: 'lead_source',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: 'message_channel',
    // },
    // {
    //   label: 'Lead Channel',
    //   field: 'lead_channel',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: '',
    // },
    // {
    //   label: 'Origin',
    //   field: 'origin',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: 'Chaaat',
    // },
    // {
    //   label: 'Allow Marketing Email',
    //   field: 'marketing',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: '',
    // },
    // {
    //   label: 'Interested Product',
    //   field: 'product',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: '',
    // },
    // {
    //   label: 'Interested City',
    //   field: 'city',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: '',
    // },
    // {
    //   label: 'Terms and Conditions',
    //   field: 'consent_date',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: '',
    // },
    // {
    //   label: 'Language',
    //   field: 'language',
    //   mappedTo: '',
    //   required: false,
    //   defaultValue: '',
    // },
    {
      label: 'Comments',
      field: 'comments',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
  ]);
  const disabledFields = ['lead_source','lead_channel','origin','marketing','product','city','consent_date','language'];
  console.log(fields);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);

  useEffect(() => {
    if (
      h.notEmpty(liveChatSetting?.agency_id) &&
      h.notEmpty(JSON.parse(liveChatSetting?.field_configuration))
    ) {
      setFields(JSON.parse(liveChatSetting?.field_configuration));
    }
  }, [liveChatSetting]);

  function onChange(v, index) {
    const cFields = Array.from(fields);
    cFields[index].mappedTo = v;
    setFields(cFields);
  }

  function onChangeCb(v, index) {
    const cFields = Array.from(fields);
    cFields[index].required = v;
    setFields(cFields);
    requiredRef.current.checked = false;
  }

  function onChangeDefault(v, index) {
    const cFields = Array.from(fields);
    cFields[index].defaultValue = v;
    setFields(cFields);
  }

  function handleRequiredCheckbox(e) {
    let cFields = Array.from(fields);
    cFields = cFields.map((m) => ({ ...m, required: e.target.checked }));
    setFields(cFields);
  }

  function validate(array) {
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      if (!disabledFields.includes(item.field) && item.required && !item.mappedTo) {
        return false;
      }
    }
    return true;
  }

  async function handleSave() {
    setStatus(constant.API_STATUS.PENDING);
    setError(false);

    if (!validate(fields)) {
      setError(true);

      h.general.alert('error', {
        message: 'Fields cannot be empty if set as required.',
      });
    } else {
      await api.setting.saveSFDCMapping(
        liveChatSetting.live_chat_settings_id,
        { field_configuration: JSON.stringify(fields) },
        true,
      );
    }

    setStatus(constant.API_STATUS.FULLFILLED);
  }

  return (
    <>
      <div
        className="login-page-wrapper-right waba-submit nonwaba"
        style={{ padding: '10px 0%' }}
      >
        <div className="" style={{ gap: '3em' }}>
          <div
            style={{
              flexGrow: 1,
            }}
            className="d-flex  flex-column"
          >
            <div className="d-flex campaign-create-form mt-3">
              <label>Chaaat.io</label>

              <div>
                <div className="d-flex right-flex">
                  <div
                    style={{
                      display: 'block',
                      lineHeight: '2.4',
                      fontSize: '15px',
                      flex: 'auto',
                    }}
                  >
                    To Salesforce
                  </div>
                  <div
                    style={{
                      display: 'block',
                      lineHeight: '2.4',
                      fontSize: '15px',
                      flex: 'auto',
                      paddingLeft: '80px',
                    }}
                  >
                    Default value
                  </div>
                  <span style={{ lineHeight: '3em' }}>
                    Required{' '}
                    <input
                      type="checkbox"
                      className="ml-3"
                      style={{
                        accentColor: '#0275ff',
                        transform: 'scale(1.154)',
                      }}
                      ref={requiredRef}
                      onClick={handleRequiredCheckbox}
                    />
                  </span>
                </div>
                <hr />
              </div>
            </div>

            {fields.map((field, i) => (
              <>
              {!disabledFields.includes(field.field) && (
                <div className="d-flex campaign-create-form mt-3" key={i}>
                  <label>{field.label}</label>
                  <div className="d-flex right-flex">
                    <div className="pos-rlt" style={{ width: '250px' }}>
                      <input
                        type="text"
                        value={field.mappedTo}
                        className={`form-item white ${
                          error && h.isEmpty(field.mappedTo) && field.required
                            ? 'field-error'
                            : ''
                        }`}
                        onChange={(e) => onChange(e.target.value, i)}
                        disabled={status === constant.API_STATUS.PENDING}
                      />
                      <span className="info">
                        <CommonTooltip
                          tooltipText={`Please enter a valid Salesforce ${field.label} field`}
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            color="#182327"
                            style={{ fontSize: '15px' }}
                          />
                        </CommonTooltip>
                      </span>
                    </div>
                    <div className="pos-rlt" style={{ width: '250px' }}>
                      <input
                        type="text"
                        value={field.defaultValue}
                        className={`form-item white`}
                        onChange={(e) => onChangeDefault(e.target.value, i)}
                        disabled={status === constant.API_STATUS.PENDING}
                      />

                      <label className="l-info">
                        {field.label === 'Lead Channel' && (
                          <>
                            When this field is left blank, the default value
                            will be whatever messaging channel is used where
                            contact initiated conversation.
                          </>
                        )}
                        {field.label === 'Allow Marketing Email' && (
                          <>Default values can be either true or false.</>
                        )}
                        {field.label === 'Comments' && (
                          <>
                            This will hold all the message logs for every
                            contact when enabled. If default value is added, all
                            succeeding messages will be appended.
                          </>
                        )}
                      </label>
                      <span className="info">
                        <CommonTooltip
                          tooltipText={`Please enter a valid default  Salesforce ${field.label} field`}
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            color="#182327"
                            style={{ fontSize: '15px' }}
                          />
                        </CommonTooltip>
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onClick={(e) => onChangeCb(e.target.checked, i)}
                    />
                  </div>
                </div>
              )}
              </>
            ))}
            <div className="d-flex campaign-create-form mt-3">
              <label></label>
              <div className="">
                <div className="notif-list mb-4">
                  <button
                    className="common-button mt-4"
                    type="button"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
