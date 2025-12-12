import React, { useState, useEffect } from 'react';
import { Header, Body } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';

const buttonStyle = {
  borderRadius: '10px',
  backgroundColor: '#1C1C1C',
  color: '#FFFFFF',
  height: '55px',
  border: 'none',
  marginBottom: '15px',
};
const buttonWrapperClassName = 'w-100 login-btn';

export default function RegisterVerifyEmail() {
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

  async function resend() {
    await api.auth.resendEmail(emailMessage);
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
                <h3 className="-generic-header-text">Check your email</h3>

                <div className="" style={{ fontFamily: 'PoppinsRegular' }}>
                  <p>
                    We've sent an email to{' '}
                    <b style={{ fontFamily: 'PoppinsSemiBold' }}>
                      <i>{emailMessage}</i>
                    </b>
                  </p>
                  {emailMessage !== 'your registered email' && (
                    <button
                      className={buttonWrapperClassName}
                      style={buttonStyle}
                      onClick={resend}
                    >
                      Resend email
                    </button>
                  )}
                  <p>
                    If you haven't received your invitation email, please check
                    your spam or junk email first, if still nothing, please
                    contact{' '}
                    <a
                      href="mailto:support@chaaat.io"
                      style={{
                        color: '#2292e5',
                        fontFamily: 'PoppinsSemiBold',
                      }}
                    >
                      <b>support@chaaat.io</b>
                    </a>{' '}
                    for further assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
