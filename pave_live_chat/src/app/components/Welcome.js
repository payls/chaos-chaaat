'use client';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import h from '../services/helpers';
import api from '../services/api';
import IconSend from './Icons/IconSend';
import IconLogout from './Icons/IconLogout';
import SmallSpinner from './SmallSpinner';

export default function Welcome({
  callback,
  session_id,
  setSession,
  setContact,
  endSession,
  style,
}) {
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
  });
  const [showError, setShowError] = useState(false);
  const [lang, setLang] = useState('en');
  const [isLoading, setLoading] = useState(false);
  const [paveKeys, setPaveKeys] = useState({
    agency_id: null,
  });
  const [showFields, setShowFields] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem('pave-live-chat-contact');
    if (h.notEmpty(storedUser)) {
      setShowFields(false);
      setUser(JSON.parse(storedUser));
      setContact(JSON.parse(storedUser));
    } else {
      const user_json = h.findGetParameter('user_json');
      const agency_id = h.findGetParameter('agency_id');

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
    }
  }, []);

  async function startSession() {
    const storedContact = localStorage.getItem('pave-live-chat-contact')
      ? JSON.parse(localStorage.getItem('pave-live-chat-contact'))
      : null;

    if (h.isEmpty(storedContact)) {
      if (user.first_name !== '' && user.last_name !== '' && ValidateEmail()) {
        setShowError(false);
        setLoading(true);

        const startRes = await api.startSession({
          ...user,
          ...paveKeys,
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

  function ValidateEmail() {
    if (/^[^\s@]+(\+[^\s@]+)?@[^\s@]+\.[^\s@]+$/.test(user.email_address)) {
      return true;
    }

    return false;
  }

  return (
    <>
      <div
        className="pave-chat-welcome"
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
            Hello 👋
            <br />
            <span>How can we help?</span>
          </div>
          <div className="pave-chat-welcome-actions">
            {!session_id && showFields && (
              <>
                <label style={{ color: style.textColor }}>
                  First name <span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  value={user.first_name}
                  className={`${
                    showError && user.first_name === '' ? 'error' : ''
                  }`}
                  onChange={(e) =>
                    setUser({ ...user, first_name: e.target.value })
                  }
                  style={{
                    color: style.inputBoxTextColor,
                    backgroundColor: style.inputBoxBgColor,
                  }}
                />
                <label style={{ color: style.textColor }}>
                  Last name <span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  value={user.last_name}
                  className={`${
                    showError && user.last_name === '' ? 'error' : ''
                  }`}
                  onChange={(e) =>
                    setUser({ ...user, last_name: e.target.value })
                  }
                  style={{
                    color: style.inputBoxTextColor,
                    backgroundColor: style.inputBoxBgColor,
                  }}
                />
                <label style={{ color: style.textColor }}>
                  Email <span>*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={user.email_address}
                  className={`${showError || !ValidateEmail() ? 'error' : ''}`}
                  onChange={(e) =>
                    setUser({ ...user, email_address: e.target.value })
                  }
                  style={{
                    color: style.inputBoxTextColor,
                    backgroundColor: style.inputBoxBgColor,
                  }}
                />
              </>
            )}
            <button
              type="button"
              className="pave-chat-btn btn-red"
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
                    {!showFields ? 'Continue' : 'Start'} chatting with us
                  </span>
                  <IconSend color={style.textBtnColor} />
                </>
              ) : (
                <>
                  <span>Loading...</span>

                  <SmallSpinner />
                </>
              )}
            </button>

            {!showFields && (
              <button
                type="button"
                className={`pave-chat-btn btn-red`}
                onClick={() => {
                  endSession();
                }}
                style={{
                  color: style.textBtnColor,
                  borderColor: style.bgBtnColor,
                  backgroundColor: style.bgBtnColor,
                }}
              >
                {!isLoading ? (
                  <>
                    <span>Logout</span>
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
          </div>
        </div>
      </div>
      {/* <div className="pave-chat-welcome-powered">Powered by Pave</div> */}
    </>
  );
}
