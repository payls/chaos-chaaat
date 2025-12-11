import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { api } from '../api';
import { routes } from '../configs/routes';
import Link from 'next/link';
import Head from 'next/head';

export default function ForgotPassword() {
  const formFields = {
    email: {
      label: 'Email Address',
      placeholder: 'Enter your email address',
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 forgot-password-generic-input',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
  };

  const [isLoading, setLoading] = useState();
  const [isEmailPrompt, setIsEmailPrompt] = useState(false);
  const [fields, setFields] = useState(h.form.initFields(formFields));
  const [isTokenUsed, setTokenUsed] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(
    'Verifying your email address',
  );

  useEffect(() => {
    (async () => {
      api.auth.getCsrfToken();
    })();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    let email = fields.email.value;
    setLoading(true);
    await api.auth.forgotPassword({ email });
    fields.email.value = '';
    setIsEmailPrompt(true);
    setFields(Object.assign({}, fields));
    setLoading(false);
  };

  const buttonStyle = {
    borderRadius: '10px',
    fontFamily: 'PoppinsRegular',
    background:
      'linear-gradient( 90deg, rgba(72, 119, 255, 1) 0%, rgba(97, 112, 244, 1) 21%, rgba(155, 96, 219, 1) 91% )',
    fontSize: '16px',
    color: '#fff',
    height: '55px',
    border: 'none',
    width: '100%',
  };
  const buttonWrapperClassName = 'text-center login-submit-btn';

  return (
    <>
      <Head>
        <title>Chaaat</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={'https://cdn.yourpave.com/assets/favicon-32x32-kH8gKq9n.png'}
        />
      </Head>
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
                Chaaat's chat-based tool empowers your sales & marketing
                strategy while satisfying platform compliance, engaging at
                scale, and personalising your communications.
              </p>
            </div>
          </div>
          <div className="login-page-wrapper-right">
            <div>
              <h1 className="mb-5 off-black">
                {!isEmailPrompt ? `Forgot Password` : `Reset Password Sent`}{' '}
              </h1>
              <div className="text-left ">
                {!isEmailPrompt ? (
                  <h.form.GenericForm
                    formFields={formFields}
                    formMode={h.form.FORM_MODE.ADD}
                    setLoading={setLoading}
                    fields={fields}
                    setFields={setFields}
                    handleSubmit={handleSubmit}
                    submitButtonStyle={buttonStyle}
                    buttonWrapperClassName={buttonWrapperClassName}
                    submitButtonVariant="primary3"
                    submitButtonLabel="Request Password Reset"
                    showCancelButton={false}
                  />
                ) : (
                  <div>
                    <p>
                      If you do not see the email in a few minutes, check your{' '}
                      <b>
                        <i>"junk mail"</i>
                      </b>{' '}
                      folder or{' '}
                      <b>
                        <i>"spam"</i>
                      </b>{' '}
                      folder. We make every effort to ensure that these emails
                      are delivered. If you do not see the email in your inbox,
                      please check your junk mail folder and add{' '}
                      <b>"registrations@chaaat.io"</b> to your White List or
                      Safe Sender List.
                    </p>
                    <p>
                      If you still don't receive an email, then write to{' '}
                      <b>support@chaaat.io</b> explaining the problem. We will
                      do our best to answer your request as soon as possible.
                    </p>

                    <h.form.CustomButton
                      className={buttonWrapperClassName}
                      style={buttonStyle}
                      onClick={() => setIsEmailPrompt(false)}
                    >
                      Resend Password Reset
                    </h.form.CustomButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
