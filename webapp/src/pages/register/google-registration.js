import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Header, Body } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import { config } from '../../configs/config.js';

const buttonStyle = {
  borderRadius: '10px',
  backgroundColor: '#1C1C1C',
  color: '#FFFFFF',
  height: '55px',
  border: 'none',
  marginBottom: '15px',
};
const buttonWrapperClassName = 'w-100 login-btn';
const WEBADMIN_LOGIN_URL = `${config.webAdminUrl}/login`;

export default function RegisterVerifyEmail() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(
    'Please verify your email address',
  );
  const [emailMessage, setEmailMessage] = useState();

  useEffect(() => {
    const email = h.cookie.getCookie('registration_email_token');
    if (!email) {
      setEmailMessage('your registered email');
    } else {
      setEmailMessage(email);
    }
  }, []);

  async function goToLogin() {
    await router.replace(h.getRoute(WEBADMIN_LOGIN_URL));
  }

  useEffect(() => {});

  return (
    <div>
      <Header title="Verify Email" showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <div className="signup-page-container">
          <div className="container h-100 pb-5">
            <div className="d-flex h-100 align-items-center p-5 flex-column">
              <img
                src="https://cdn.yourpave.com/assets/chaaat-logo.png"
                alt="Pave"
                style={{ maxWidth: 130, margin: 40 }}
              />
              <div className="col-12 col-md-6 col-lg-5 mx-auto signup-page-form-container">
                <h3 className="-generic-header-text">
                  Register via Google success
                </h3>

                <div className="" style={{ fontFamily: 'PoppinsRegular' }}>
                  <p>
                    You are now registered to Chaaat using your email account{' '}
                    <b style={{ fontFamily: 'PoppinsSemiBold' }}>
                      <i>{emailMessage}</i>
                    </b>
                  </p>
                  {(
                    <button
                      className={buttonWrapperClassName}
                      style={buttonStyle}
                      onClick={goToLogin}
                    >
                      Click to login
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
