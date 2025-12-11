'use client';
import { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import Image from 'next/image';
import h from '../services/helpers';
import api from '../services/api';
import IconSend from './Icons/IconSend';
import IconLogout from './Icons/IconLogout';
import IconChevronLeft from './Icons/IconChevronLeft';
import countryCodes from '../services/countryCodes';
import SmallSpinner from './SmallSpinner';
import FormFieldMapping from './FormFieldMapping';

export default function WelcomeTEC({
  callback,
  session_id,
  setSession,
  endSession,
  setContact,
  style,
  fieldConfig,
}) {
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    phone: '',
    product: '',
    city: '',
    marketing: false,
  });
  const [showError, setShowError] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [countryCode, setSelectedCountryCode] = useState('+65');
  const [terms, setTOC] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const [products, setProducts] = useState([
    {
      value: 'Serviced Office',
      label: 'Private Office',
    },
    {
      value: 'Coworking',
      label: 'Coworking Space',
    },
    {
      value: 'Virtual Office',
      label: 'Virtual Office',
    },
    {
      value: 'Meeting Rooms',
      label: 'Meeting Room',
    },
    {
      value: 'Event Spaces',
      label: 'Event Space',
    },
    {
      value: 'Enterprise Solution',
      label: 'Enterprise Solution',
    },
    {
      value: 'Others',
      label: 'Others',
    },
  ]);
  const [cities, setCities] = useState([]);
  const [lang, setLang] = useState('en');
  const [paveKeys, setPaveKeys] = useState({
    agency_id: null,
  });
  const [showFields, setShowFields] = useState(false);
  useEffect(() => {
    const language = h.findGetParameter('language');
    const storedLang = localStorage.getItem('lang');
    const agency_id = h.findGetParameter('agency_id');
    const langValue = storedLang ?? language ?? ' en';

    setLang(langValue);

    const storedUser = localStorage.getItem('pave-live-chat-contact');
    if (h.notEmpty(storedUser)) {
      setShowFields(false);
      setUser(JSON.parse(storedUser));
      setContact(JSON.parse(storedUser));
    } else {
      const user_json = h.findGetParameter('user_json');

      setPaveKeys({ agency_id });
      if (h.notEmpty(user_json)) {
        setShowFields(false);
        setUser(JSON.parse(user_json));
      } else {
        setShowFields(true);
      }
    }
    const storedSession = localStorage.getItem('pave-live-chat-session-id');
    if (h.notEmpty(storedSession)) {
      setSession(storedSession);
    } else {
      getCities(agency_id, langValue);
    }

    const showLang = fieldConfig.find((f) => f.label === 'Language')?.required;
    setShowLanguage(showLang);
  }, []);

  async function getCities(id, language) {
    const response = await api.getCities(id, language);

    if (h.cmpStr(response.status, 'ok')) {
      setCities(response.data.cities);
    }
  }

  function mappedTo(field) {
    switch (field) {
      case 'First Name':
        return 'first_name';
      case 'Last Name':
        return 'last_name';
      case 'Email Address':
        return 'email_address';
      case 'Phone Number':
        return 'phone';
      case 'Interested Product':
        return 'product';
      case 'Interested City':
        return 'city';
      case 'Allow Marketing Email':
        return 'marketing';
    }
  }

  function isFieldConfigRequired(field) {
    const r = fieldConfig.find((f) => f.label === field);

    return r.required;
  }

  function isFormRequired(field) {
    const isFieldRequired = isFieldConfigRequired(field);
    const key = mappedTo(field);
    if (isFieldRequired) {
      // Validate name
      if (['first_name', 'last_name'].includes(key))
        return user[key] !== '' && h.validateName(user[key]);

      // Validate email
      if (['email_address'].includes(key))
        return user[key] !== '' && h.validateEmail(user.email_address);

      // Validate phone number
      if (['phone'].includes(key)) {
        return !h.validatePhone(user.phone, countryCode);
      }

      // Wildcard validate
      return user[key] !== '';
    }
  }

  async function startSession() {
    const storedContact = localStorage.getItem('pave-live-chat-contact')
      ? JSON.parse(localStorage.getItem('pave-live-chat-contact'))
      : null;

    if (h.isEmpty(storedContact)) {
      if (
        isFormRequired('First Name') &&
        isFormRequired('Last Name') &&
        isFormRequired('Email Address') &&
        isFormRequired('Phone Number') &&
        isFormRequired('Interested Product') &&
        isFormRequired('Interested City')
      ) {
        setShowError(false);
        setLoading(true);
        const startRes = await api.startSession({
          ...user,
          phone: `${countryCode} ${user.phone}`,
          ...paveKeys,
          language: lang,
        });

        if (h.cmpStr(startRes.status, 'ok')) {
          callback(startRes.data);
        }
        setLoading(false);
      } else {
        setShowError(true);
      }
    } else {
      const storedContact = localStorage.getItem('pave-live-chat-contact')
        ? JSON.parse(localStorage.getItem('pave-live-chat-contact'))
        : null;
      const storedLiveSessionId = localStorage.getItem(
        'pave-live-chat-session-id',
      )
        ? localStorage.getItem('pave-live-chat-session-id')
        : null;

      callback({
        contact: storedContact,
        live_chat_session_id: storedLiveSessionId,
      });
    }
  }

  function toc() {
    let termsLink = ``;
    let policyLink = ``;

    switch (lang) {
      case 'jp': {
        termsLink =
          'https://wwww.executivecentre.com/ja-jp/terms-and-conditions/';
        policyLink = 'https://www.executivecentre.com/ja-jp/privacy-policy/';
        break;
      }
      case 'kr': {
        termsLink = 'https://www.executivecentre.co.kr/terms-and-conditions/';
        policyLink = 'https://www.executivecentre.co.kr/privacy-policy/';
        break;
      }
      case 'zh-hk': {
        termsLink =
          'https://www.executivecentre.com/zh-hk/terms-and-conditions/';
        policyLink = 'https://www.executivecentre.com/zh-hk/privacy-policy/';
        break;
      }
      case 'zh-Hant':
      case 'zh-tw': {
        termsLink =
          'https://www.executivecentre.com/zh-tw/terms-and-conditions/';
        policyLink = 'https://www.executivecentre.com/zh-tw/privacy-policy/';
        break;
      }
      default: {
        termsLink = `https://www.executivecentre.com/terms-and-conditions/`;
        policyLink = `https://www.executivecentre.com/privacy-policy/`;
        break;
      }
    }

    return h
      .translate(
        "I agree to TEC's {tou} and have read and understood the {pp}",
        lang,
      )
      .replace(
        '{tou}',
        `<a href="${termsLink}" target=”_blank”>${h.translate(
          'Terms of Use',
          lang,
        )}</a>`,
      )
      .replace(
        '{pp}',
        `<a href="${policyLink}" target=”_blank”>${h.translate(
          'Privacy Policy',
          lang,
        )}</a>`,
      );
  }

  return (
    <>
      <div
        className="pave-chat-welcome tec"
        style={{
          backgroundImage: style.backgroundImage,
          backgroundColor: style.backgroundColor,
        }}
      >
        <div>
          <img src={style.logoUrl} width={'80px'} />
          <div
            className="pave-chat-welcome-greet"
            style={{ color: style.textColor }}
          >
            <div className="pave-chat-welcome-greet-header">
              <div>
                {' '}
                {h.translate('Hello', lang)}
                <br />
                <span>{h.translate('How can we help?', lang)}</span>
              </div>
              {showLanguage && (
                <div className="">
                  <select
                    onChange={(e) => {
                      setLang(e.target.value);
                      localStorage.setItem('lang', e.target.value);
                      getCities(paveKeys.agency_id, e.target.value);
                    }}
                    style={{ color: style.textColor }}
                  >
                    <option selected={lang === 'en'} value="en">
                      English
                    </option>
                    <option selected={lang === 'jp'} value="jp">
                      Japanese
                    </option>
                    <option selected={lang === 'kr'} value="kr">
                      Korean
                    </option>
                    {/* <option selected={lang === 'zh-hk'} value="zh-hk">
                      Traditional Chinese (Hong Kong)
                    </option>
                    <option selected={lang === 'zh-tw'} value="zh-tw">
                      Traditional Chinese (Taiwan)
                    </option> */}
                    <option selected={lang === 'zh-Hant'} value="zh-Hant">
                      Traditional Chinese
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="pave-chat-welcome-actions">
            {!session_id && showFields && (
              <>
                <FormFieldMapping
                  fieldConfig={fieldConfig}
                  setUser={setUser}
                  showError={showError}
                  user={user}
                  style={style}
                  lang={lang}
                  setSelectedCountryCode={setSelectedCountryCode}
                  showFields={showFields}
                  session_id={session_id}
                  step={step}
                  products={products}
                  cities={cities}
                  terms={terms}
                  countryCode={countryCode}
                  setTOC={setTOC}
                  toc={toc}
                  mappedTo={mappedTo}
                />
              </>
            )}

            {!session_id && showFields && step === 1 && (
              <button
                type="button"
                className="pave-chat-btn btn-red"
                onClick={() => setStep(2)}
                style={{
                  color: style.textBtnColor,
                  borderColor: style.bgBtnColor,
                  backgroundColor: style.bgBtnColor,
                }}
              >
                <span>{h.translate('Continue', lang)}</span>
                <IconChevronLeft
                  color={style.textBtnColor}
                  width="20px"
                  style={{ transform: 'rotate(180deg)' }}
                />
              </button>
            )}
            {(step === 2 || !showFields) && (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#fe5959',
                    marginTop: '10px',
                    marginBottom: '10px',
                  }}
                >
                  {showError && (
                    <div>
                      {h.translate(
                        'Please ensure that all fields are filled and correct.',
                        lang,
                      )}
                    </div>
                  )}
                </div>

                {showFields && (
                  <button
                    type="button"
                    className="pave-chat-btn btn-black"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    <span>{h.translate('Back', lang)}</span>
                    <IconChevronLeft color="#fff" width="20px" />
                  </button>
                )}
                {showFields && (
                  <button
                    type="button"
                    className={`pave-chat-btn btn-${
                      session_id || terms ? 'red' : 'grey'
                    }`}
                    onClick={startSession}
                    disabled={isLoading || (!session_id && !terms)}
                    style={{
                      color: style.textBtnColor,
                      borderColor: style.bgBtnColor,
                      backgroundColor: style.bgBtnColor,
                    }}
                  >
                    {!isLoading ? (
                      <>
                        <span>
                          {h.translate('Start chatting with us', lang)}
                        </span>
                        <IconSend color={style.textBtnColor} />
                      </>
                    ) : (
                      <>
                        <span>{h.translate('Loading', lang)}...</span>

                        <SmallSpinner />
                      </>
                    )}
                  </button>
                )}
                {!showFields && (
                  <button
                    type="button"
                    className={`pave-chat-btn btn-red`}
                    onClick={startSession}
                    disabled={isLoading}
                    style={{
                      color: style.textBtnColor,
                      borderColor: style.bgBtnColor,
                      backgroundColor: style.bgBtnColor,
                    }}
                  >
                    {!isLoading ? (
                      <>
                        <span>
                          {h.translate('Continue chatting with us', lang)}
                        </span>
                        <IconSend color={style.textBtnColor} />
                      </>
                    ) : (
                      <>
                        <span>{h.translate('Loading', lang)}...</span>

                        <SmallSpinner />
                      </>
                    )}
                  </button>
                )}

                {!showFields && (
                  <button
                    type="button"
                    className={`pave-chat-btn btn-red`}
                    onClick={() => {
                      endSession();
                      setTOC(false);
                    }}
                    style={{
                      color: style.textBtnColor,
                      borderColor: style.bgBtnColor,
                      backgroundColor: style.bgBtnColor,
                    }}
                  >
                    {!isLoading ? (
                      <>
                        <span>{h.translate('Logout', lang)}</span>
                        <IconLogout color={style.textBtnColor} />
                      </>
                    ) : (
                      <>
                        <span>{h.translate('Loading', lang)}...</span>

                        <SmallSpinner />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
