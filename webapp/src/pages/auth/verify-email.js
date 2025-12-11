import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import { config } from '../../configs/config';

export default function AuthVerifyEmail() {
  const [isLoading, setLoading] = useState(false);
  const [isTokenUsed, setTokenUsed] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(
    'Verifying your email address',
  );

  const WEBADMIN_LOGIN_URL = `${config.webAdminUrl}/login`;

  useEffect(() => {
    (async () => {
      const token = h.general.findGetParameter('token');
      if (h.notEmpty(token)) {
        setLoading(true);
        const response = await api.auth.getUserByEmailVerificationToken(
          { token },
          false,
        );
        const user = response.data.user;
        const isTokenUsed = response.data.is_token_used;
        setTokenUsed(isTokenUsed);
        if (h.notEmpty(user)) {
          //Auto verify user email
          if (!isTokenUsed) {
            const response = await api.auth.verifyUserEmail(
              { token, email: user.email, auth_type: 'email' },
              false,
            );
            if (h.cmpStr(response.status, 'ok')) {
              setTokenUsed(true);
              setVerifyMessage(
                'Your email was successfully verified. Please log-in to set up your account!.',
              );
              setLoading(false);
            }
          } else {
            setVerifyMessage('Email has already been verified before.');
          }
        }
        setLoading(false);
      } else {
        window.location.href = h.getRoute(WEBADMIN_LOGIN_URL);
      }
    })();
  }, []);

  return (
    <div className="h100">
      <div className="login-page-wrapper">
        <div className="login-page-wrapper-left">
          <div>
            <img
              src="https://cdn.yourpave.com/assets/chaaat-logo-1.png"
              width={'100px'}
            />
            <h3>
              Where <br />
              Conversations <br />
              <span
                className="ani"
                style={{
                  backgroundImage:
                    'linear-gradient(96deg, #30D6CB 7%, #5772F8 31.17%, #9062E0 53.48%, #D64FC2 66.49%)',
                }}
              >
                Convert.
              </span>
            </h3>
            <p>
              Chaaat's chat-based tool empowers your sales & marketing strategy
              while satisfying platform compliance, engaging at scale, and
              personalising your communications.
            </p>
          </div>
        </div>
        <div className="login-page-wrapper-right">
          <div>
            <h1 className="mb-2 off-black">Welcome to Chaaat!</h1>

            <p className="mb-4">{verifyMessage}</p>
            {h.cmpBool(isTokenUsed, true) && (
              <h.form.CustomButton
                variant="outline-primary"
                className="ml-1 w-100 login-btn btn btn-primary3"
                onClick={() =>
                  (window.location.href = h.getRoute(WEBADMIN_LOGIN_URL))
                }
                style={{
                  borderRadius: '10px',
                  backgroundColor: '#1C1C1C',
                  color: '#FFFFFF',
                  height: '55px',
                  border: 'none',
                }}
              >
                Log In
              </h.form.CustomButton>
            )}
          </div>
        </div>
      </div>
      {/* <div className="login-page-container">
          <div className="container">
            <img
              src="https://cdn.yourpave.com/assets/chaaat-logo.png"
              alt="Pave"
              style={{ maxWidth: 130, marginTop: 10 }}
            />
          </div>
          <div className="container h-100 mt-5 pb-5">
            <div className="d-flex h-100 align-items-center row">
              <div className="col-12 col-md-6 col-lg-5 mx-auto login-page-form-container pt-5">
                <h1 className="login-generic-header-text">Log In</h1>
                <p
                  className="login-generic-header-text"
                  style={{ fontSize: 16 }}
                >
                  Welcome Back
                </p>

                <LoginForm
                  className="text-left"
                  formFields={formFields}
                  formMode={h.form.FORM_MODE.ADD}
                  setLoading={setLoading}
                  fields={fields}
                  setFields={setFields}
                  showCancelButton={false}
                  handleSubmit={handleSubmit}
                  submitButtonLabel="Log In"
                  submitButtonClassName="w-100 mt-3"
                ></LoginForm>

                <div className="row no-gutters justify-content-center mt-3 login-generic-footer">
                  <div className="col-12 form-generic-continue-login">
                    <span>or continue with</span>
                  </div>
                  <div className="col-12 text-center mt-3">
                    <div className="d-flex justify-content-center">
                      <div className="d-flex justify-content-center">
                        <CommonGoogleSignin handleSubmit={handleSubmit} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row justify-content-center">
                  <div className="col-8 col-lg-6 col-xl-6"></div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      {/*}*/}
      {/*{h.cmpBool(isModal, true) &&*/}
      {/* {<LoginModal formFields={formFields} />} */}
    </div>
  );
}
