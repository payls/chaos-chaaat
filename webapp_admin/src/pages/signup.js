import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { h } from '../helpers';
import { api } from '../api';
import { routes } from '../configs/routes';
import { Header, Body } from '../components/Layouts/Layout';
import SignUpForm from '../components/SignUp/SignUpForm';
import Link from 'next/dist/client/link';
import CommonGoogleSignin from '../components/Common/CommonGoogleSignin';
import { config } from '../configs/config.js';
import Head from 'next/head';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';

const constant = require('../constants/constant.json');

export default function Signup({ google_client_id }) {
  const router = useRouter();
  const [isModal, setModal] = useState();
  const [isLoading, setLoading] = useState(false);

  const WEBADMIN_LOGIN_URL = `${process.env.NEXT_PUBLIC_ADMIN_URL}/login`;
  let className;

  useEffect(() => {
    window.localStorage.removeItem('register_method');
  }, []);

  useEffect(() => {
    (async () => {
      const invited_email = h.general.findGetParameter('invited_email');
      const first_name = h.general.findGetParameter('first_name');
      const last_name = h.general.findGetParameter('last_name');
      formFields.first_name.value = first_name || '';
      formFields.first_name.readOnly = !!first_name;
      formFields.last_name.value = last_name || '';
      formFields.last_name.readOnly = !!last_name;
      formFields.email.value = invited_email || '';
      formFields.email.readOnly = !!invited_email;

      // Get CSRF TOKEN
      await api.auth.getCsrfToken();
    })();
  }, [router.query]);

  const WEBADMIN_DASHBOARD_URL = `${process.env.NEXT_PUBLIC_ADMIN_URL}/dashboard`;

  if (h.cmpBool(isModal, true)) {
    className = 'col-12 signup-modal-input';
  } else {
    className = 'col-12 signup-generic-input';
  }

  const formFields = {
    first_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'Enter your first name',
      class_name: className,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'Enter your last name',
      class_name: className,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    mobile_number: {
      field_type: h.form.FIELD_TYPE.PHONENUMBER,
      placeholder: 'Enter your mobile',
      class_name: className + ' phone-indent',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.NUMBER,
      ],
    },
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'example@gmail.com',
      class_name: className,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
    password: {
      field_type: h.form.FIELD_TYPE.PASSWORD,
      placeholder: 'Enter your password',
      class_name: className,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_PASSWORD,
      ],
    },
    confirm_password: {
      field_type: h.form.FIELD_TYPE.PASSWORD,
      placeholder: 'Confirm your password',
      class_name: className,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_CONFIRM_PASSWORD,
      ],
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  /**
   * Generic handle submit function for new user sign up
   * @param {*} e
   * @param {string} [auth_type='email']
   * @param {object} social_payload
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e, auth_type, social_payload) => {
    if (e) e.preventDefault();
    let parsedNumber;
    if (h.isEmpty(social_payload)) {
      parsedNumber = parsePhoneNumberFromString(
        fields.mobile_number.value,
        fields.countryCode?.value?.code,
      );
      console.log({
        a: fields.mobile_number.value,
        b: fields.countryCode?.value?.code,
      });
      if (h.isEmpty(parsedNumber) || !parsedNumber.isValid()) {
        h.general.alert('error', { message: 'Invalid number format.' });
        const f = Object.assign({}, fields);
        f.mobile_number.error = true;
        setFields(f);
        return;
      }
    }

    let query = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      auth_type,
      social_payload,
      invitee: h.general.findGetParameter('invitee'),
    };
    let message = '';
    window.localStorage.setItem('register_method', auth_type);
    switch (auth_type) {
      case constant.USER.AUTH_TYPE.GOOGLE:
        const { first_name, last_name, email } =
          h.user.parseGoogleSigninPayload(social_payload);
        query.auth_type = auth_type;
        query.first_name = first_name;
        query.last_name = last_name;
        query.email = email;
        message = 'Thank you for signing up. Please wait while we sign you in.';
        break;
      case constant.USER.AUTH_TYPE.FACEBOOK:
        const {
          first_name: fb_first_name,
          last_name: fb_last_name,
          email: fb_email,
        } = h.user.parseFacebookSigninPayload(social_payload);
        query.auth_type = auth_type;
        query.first_name = fb_first_name;
        query.last_name = fb_last_name;
        query.email = fb_email;
        message = 'Thank you for signing up. Please wait while we sign you in.';
        break;
      default:
      case constant.USER.AUTH_TYPE.EMAIL:
        query.auth_type = constant.USER.AUTH_TYPE.EMAIL;
        query.first_name = fields.first_name.value;
        query.last_name = fields.last_name.value;
        query.email = fields.email.value;
        query.mobile_number = parsedNumber?.number;
        query.password = fields.password.value;
        message = "Thank you for signing up. Let's move on to the next steps.";
        break;
    }

    setLoading(true);
    let userAccessToken = null;
    const response = await api.auth.register(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      h.cookie.setCookie('registration_email_token', query.email);
      const access_token = response.data.access_token;
      userAccessToken = access_token;
      if (access_token) h.cookie.setAccessToken(access_token);

      setTimeout(async () => {
        setLoading(false);

        if (userAccessToken) {
          if (query.invitee) {
            await router.replace(
              `${h.getRoute(
                WEBADMIN_LOGIN_URL,
              )}?access_token=${userAccessToken}`,
            );
          }
          switch (auth_type) {
            case constant.USER.AUTH_TYPE.GOOGLE:
              if (!response.data.created) {
                // already existent account
                await router.replace(
                  `${h.getRoute(
                    WEBADMIN_LOGIN_URL,
                  )}?access_token=${userAccessToken}`,
                );
              } else {
                await router.replace(h.getRoute(routes.company));
              }
              break;
            case constant.USER.AUTH_TYPE.FACEBOOK:
              await router.replace(h.getRoute(WEBADMIN_DASHBOARD_URL));
              break;
            case constant.USER.AUTH_TYPE.EMAIL:
              await router.replace(
                `${h.getRoute(
                  WEBADMIN_LOGIN_URL,
                )}?access_token=${userAccessToken}`,
              );
              break;
            default:
            // do nothing.
          }
        } else {
          await router.replace(h.getRoute(routes.company));
        }
      });
    }
    setLoading(false);
  };

  return (
    <GoogleOAuthProvider clientId={google_client_id}>
      <ToastContainer />

      <Head>
        <title>Chaaat</title>
        <script
          src="https://apis.google.com/js/platform.js"
          async
          defer
        ></script>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={'https://cdn.yourpave.com/assets/favicon-32x32-kH8gKq9n.png'}
        />
        <meta
          name="google-signin-client_id"
          content={process.env.GOOGLE_CLIENT_ID}
        ></meta>
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
          <div
            className="login-page-wrapper-right"
            style={{ overflow: 'auto' }}
          >
            <div>
              <h1 className="mb-2 off-black">Sign up to Chaaat</h1>

              <SignUpForm
                className="text-left"
                formFields={formFields}
                formMode={h.form.FORM_MODE.ADD}
                setLoading={setLoading}
                fields={fields}
                setFields={setFields}
                handleSubmit={handleSubmit}
                showCancelButton={false}
                submitButtonLabel="Next →"
                submitButtonClassName="w-100 login-btn"
                // submitButtonBeforeContent={<div className="row justify-content-center signup-redirect">
                //     <div className='col-12 text-center'>
                //         <p className="mt-3 mb-1 signup-generic-text">Already have an account?</p><br/>
                //         <Link href={h.getRoute(routes.login)}>Log in</Link>
                //     </div>
                // </div>}
              ></SignUpForm>
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
                    Already have an account?{' '}
                    <Link
                      style={{ fontSize: 15, color: '#0368ff' }}
                      href={h.getRoute(WEBADMIN_LOGIN_URL)}
                    >
                      Sign In
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
