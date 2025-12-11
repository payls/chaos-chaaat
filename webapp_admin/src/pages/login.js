import React, { useState, useEffect } from 'react';
import { h } from '../helpers';
import { routes } from '../configs/routes';
import { api } from '../api';
import LoginForm from '../components/Login/LoginForm';
import { Body, Header } from '../components/Layouts/Layout';
import CommonGoogleSignin from '../components/Common/CommonGoogleSignin';
import { config } from '../configs/config';
import constant from '../constants/constant.json';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Link from 'next/dist/client/link';

/**
 * Login Page
 *
 * @function
 * @name Login
 * @kind function
 * @param {{ google_client_id: any }} { google_client_id } google client id
 * @returns {React.JSX.Element}
 * @exports
 */
export default function Login({ google_client_id }) {
  const [isModal, setModal] = useState();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');

  let className;

  useEffect(() => {
    // Get CSRF TOKEN
    (async () => {
      await api.auth.getCsrfToken();
    })();
  }, []);

  useEffect(() => {
    if (h.isEmpty(h.cookie.getCookie('registration_email_token'))) {
      const access_token = h.general.findGetParameter('access_token');
      const errorMessage = h.general.findGetParameter('error_message');
      if (h.notEmpty(errorMessage)) {
        h.general.alert('error', { message: errorMessage });
      }
      if (h.notEmpty(access_token)) {
        h.cookie.setAccessToken(access_token);
        (async () => {
          await h.auth.verifySessionTokenValidity(
            h.getRoute(routes.dashboard.index),
          );
        })();
      }
    }
  }, []);

  if (h.cmpBool(isModal, true)) {
    className = 'login-modal-input';
  } else {
    className = 'login-generic-input';
  }

  const formFields = {
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: null,
      placeholder: 'Email',
      class_name: `col-12 ${className}`,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
    password: {
      label: null,
      field_type: h.form.FIELD_TYPE.PASSWORD,
      class_name: `col-12 ${className}`,
      placeholder: 'Password',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    // remember_me: {
    //   field_type: h.form.FIELD_TYPE.CHECKBOX,
    //   class_name: `col-6 ${className}`,
    //   style: { borderRadius: '10px' },
    // },
    forgot_password: {
      field_type: h.form.FIELD_TYPE.LINK,
      class_name: 'col-12 login-forgot-text text-right',
      label: 'Forgot Password?',
      href: h.getRoute(routes.forgot_password),
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  const handleSubmit = async (e, auth_type, social_payload) => {
    if (e) e.preventDefault();
    const email = fields.email.value;
    const password = fields.password.value;

    h.cookie.setCookie('registration_email_token', email);

    setLoading(true);
    setError('');
    let response = null;
    if (h.cmpStr(auth_type, constant.USER.AUTH_TYPE.GOOGLE)) {
      const { first_name, last_name, email } =
          h.user.parseGoogleSigninPayload(social_payload);
          h.cookie.setCookie('registration_email_token', email);
      response = await api.auth.loginGoogle({ social_payload });
    } else if (h.cmpStr(auth_type, constant.USER.AUTH_TYPE.FACEBOOK)) {
      const {
          first_name: fb_first_name,
          last_name: fb_last_name,
          email: fb_email,
        } = h.user.parseFacebookSigninPayload(social_payload);
      h.cookie.setCookie('registration_email_token', fb_email);
      response = await api.auth.loginFacebook({ social_payload });
    } else {
      try {
        response = await api.auth.loginEmail({ email, password });
        fields.email.value = '';
        fields.password.value = '';
      } catch (response) {
        if (response.response.status === 400 || response.response.status === 401) {
          setError('Invalid email or password provided.');
        } else {
          setError('Something went wrong. Please contact support.');
        }
      }
    }

    if (!h.isEmpty(response) && h.cmpStr(response.status, 'ok')) {
      const accessToken = response.data.access_token;
      const WEBADMIN_LOGIN_URL = `${config.webAdminUrl}/login`;
      const WEBADMIN_DASHBOARD_URL = `${config.webAdminUrl}/dashboard`;
      if (accessToken) h.cookie.setAccessToken(accessToken);
      if (h.notEmpty(response.data.agency_name)) {
        h.cookie.deleteCookie('registration_email_token');
        // Check if agency is paid and redirect to error page if not
        // window.location.href = response?.data?.is_paid
        //   ? h.getRoute(routes.dashboard.index)
        //   : h.getRoute(routes.pricing);
        window.location.href = h.getRoute(routes.dashboard.index);
      } else {
        window.localStorage.setItem('register_method', auth_type);
        if (accessToken) {
          switch (auth_type) {
            case constant.USER.AUTH_TYPE.GOOGLE:
              window.location.href = h.getRoute(routes.company);
              break;
            case constant.USER.AUTH_TYPE.FACEBOOK:
              window.location.href = h.getRoute(WEBADMIN_DASHBOARD_URL);
              break;
            case constant.USER.AUTH_TYPE.EMAIL:
              window.location.href = `${h.getRoute(
                  WEBADMIN_LOGIN_URL,
                )}?access_token=${accessToken}`;
              break;
            default:
            // do nothing.
          }
        } else {
          window.location.href = h.getRoute(routes.company);
        }
      }
    }
    setLoading(false);
  };

  return (
    <GoogleOAuthProvider clientId={google_client_id}>
      <ToastContainer />
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
              <h1 className="mb-5 off-black">Sign in to Chaaat</h1>
              <span className="light-red-text pl-3">{error ?? ''}</span>

              <LoginForm
                className="text-left login-form"
                formFields={formFields}
                formMode={h.form.FORM_MODE.ADD}
                setLoading={setLoading}
                fields={fields}
                setFields={setFields}
                showCancelButton={false}
                handleSubmit={handleSubmit}
                submitButtonLabel="Log In"
                submitButtonClassName="w-100 login-btn"
              ></LoginForm>
              <small>or Sign in with</small>
              <div className="row">
                <div className="col-12">
                  <CommonGoogleSignin handleSubmit={handleSubmit} />
                </div>
              </div>
              <div className="row justify-content-center signup-redirect">
                <div className="col-12 text-center">
                  <p
                    className="mt-5 pb-0 mb-0 signup-generic-text"
                    style={{ fontSize: 15, fontFamily: 'PoppinsRegular' }}
                  >
                    Don't have an account?{' '}
                    <Link
                      style={{ fontSize: 15, color: '#0368ff' }}
                      href={h.getRoute(process.env.NEXT_PUBLIC_SIGNUP_URL)}
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

/**
 * Send Google client id to Client
 *
 * @async
 * @function
 * @name getServerSideProps
 * @kind function
 * @returns {Promise<{ props: { google_client_id: string | undefined; }; }>}
 * @exports
 */
export async function getServerSideProps() {
  return {
    props: {
      google_client_id: process.env.GOOGLE_CLIENT_ID,
    },
  };
}
