import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { h } from '../helpers';
import { api } from '../api';
import { routes } from '../configs/routes';
import { Header, Body } from '../components/Layouts/Layout';
import SignUpForm from '../components/SignUp/SignUpForm';
import Link from 'next/dist/client/link';
import CommonGoogleSignin from '../components/Common/CommonGoogleSignin';
import CommonFacebookSignin from '../components/Common/CommonFacebookSignin';
import { config } from '../configs/config.js';
import Head from 'next/head';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ToastContainer } from 'react-toastify';

const constant = require('../constants/constant.json');

export default function Signup() {
  const router = useRouter();
  const [isModal, setModal] = useState();
  const [isLoading, setLoading] = useState(false);

  // const [inviteeTest, setInviteeTest] = useState("");
  // let inviteeTest = h.general.findGetParameter("invitee") || "";
  const WEBADMIN_LOGIN_URL = `${config.webAdminUrl}/login`;
  let className;

  useEffect(() => {
    window.localStorage.removeItem('register_method');
  }, []);

  useEffect(() => {
    (async () => {
      // setInviteeTest(h.general.findGetParameter("invitee"));
      // console.log(inviteeTest);
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

  const WEBADMIN_DASHBOARD_URL = `${config.webAdminUrl}/dashboard`;

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
      // value: inviteeTest || "None here",
      // value: h.general.findGetParameter("first_name") || "",
      // readOnly: !!h.general.findGetParameter("first_name"),
    },
    last_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'Enter your last name',
      class_name: className,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
      // value: h.general.findGetParameter("last_name") || "",
      // readOnly: !!h.general.findGetParameter("last_name"),
    },
    mobile_number: {
      field_type: h.form.FIELD_TYPE.PHONENUMBER,
      placeholder: 'Enter your mobile',
      class_name: className + ' phone-indent',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.NUMBER,
      ],
      // value: h.general.findGetParameter("last_name") || "",
      // readOnly: !!h.general.findGetParameter("last_name"),
    },
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'example@gmail.com',
      class_name: className,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
      // value: h.general.findGetParameter("invite_email") || "",
      // readOnly: !!h.general.findGetParameter("invite_email"),
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
      buyer_type: h.general.findGetParameter('buyer_type'),
      invitee: h.general.findGetParameter('invitee'),
    };
    let message = '';
    switch (auth_type) {
      case constant.USER.AUTH_TYPE.GOOGLE:
        console.log(social_payload);
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
      window.localStorage.setItem('register_method', response.data.auth_type);
      h.cookie.setCookie('registration_email_token', query.email);
      const access_token = response.data.access_token;
      userAccessToken = access_token;
      if (access_token) h.cookie.setAccessToken(access_token);

      if (userAccessToken) {
        if (query.invitee) {
          await router.replace(
            `${h.getRoute(WEBADMIN_LOGIN_URL)}?access_token=${userAccessToken}`,
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
    } else {
      setLoading(false);
    }
  };

  return (
    <>
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
          content={config.googleAuth.clientId}
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
          <div className="login-page-wrapper-right">
            <div>
              <h1 className="mb-5 off-black">Sign Up to Chaaat</h1>

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
                disableEnter={isLoading}
              ></SignUpForm>
              <small>or Sign in with</small>
              <div className="row">
                <div className="col-12">
                  <CommonGoogleSignin
                    handleSubmit={handleSubmit}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="row justify-content-center signup-redirect">
                <div className="col-12 text-center">
                  <p
                    className="mt-5 pb-0 mb-0 signup-generic-text"
                    style={{ fontSize: 15 }}
                  >
                    Already have an account?{' '}
                    <Link
                      style={{ fontSize: 12 }}
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
    </>
  );
}
