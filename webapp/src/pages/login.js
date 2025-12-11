import React, { useState, useEffect } from 'react';
import { h } from '../helpers';
import { routes } from '../configs/routes';
import { useRouter } from 'next/router';
import { api } from '../api';
import LoginForm from '../components/Login/LoginForm';
import { Body, Header } from '../components/Layouts/Layout';
import CommonGoogleSignin from '../components/Common/CommonGoogleSignin';
import CommonFacebookSignin from '../components/Common/CommonFacebookSignin';
import constant from '../constants/constant.json';

export default function Login() {
  const router = useRouter();
  const [isModal, setModal] = useState();
  const [isLoading, setLoading] = useState(false);
  let className;

  useEffect(() => {
    // setModal(true);
  });

  useEffect(() => {
    const errorMessage = h.general.findGetParameter('error_message');
    if (h.notEmpty(errorMessage)) {
      h.general.alert('error', { message: errorMessage });
    }
    (async () => {
      await h.auth.verifySessionTokenValidity(
        h.getRoute(routes.dashboard.index),
      );
    })();
  }, []);

  if (h.cmpBool(isModal, true)) {
    className = 'login-modal-input';
  } else {
    className = 'login-generic-input';
  }

  const formFields = {
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Your email',
      placeholder: 'example@gmail.com',
      class_name: `col-12 ${className}`,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
    password: {
      field_type: h.form.FIELD_TYPE.PASSWORD,
      class_name: `col-12 ${className}`,
      placeholder: 'enter your password',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    remember_me: {
      field_type: h.form.FIELD_TYPE.CHECKBOX,
      class_name: `col-6 ${className}`,
      style: { borderRadius: '10px' },
    },
    forgot_password: {
      field_type: h.form.FIELD_TYPE.LINK,
      class_name: 'col-6 login-forgot-text text-right',
      label: 'Forgot Password?',
      href: h.getRoute(routes.forgot_password),
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  const handleSubmit = async (e, auth_type, social_payload) => {
    if (e) e.preventDefault();
    const email = fields.email.value;
    const password = fields.password.value;
    setLoading(true);
    let response = null;
    switch (auth_type) {
      case constant.USER.AUTH_TYPE.GOOGLE:
        response = await api.auth.loginGoogle({ social_payload });
        break;
      case constant.USER.AUTH_TYPE.FACEBOOK:
        response = await api.auth.loginFacebook({ social_payload });
        break;
      default:
      case constant.USER.AUTH_TYPE.EMAIL:
        response = await api.auth.loginEmail({ email, password });
        fields.email.value = '';
        fields.password.value = '';
        setFields(Object.assign({}, fields));
        break;
    }
    if (h.cmpStr(response.status, 'ok')) {
      const accessToken = response.data.access_token;
      h.cookie.setAccessToken(accessToken);
      window.location.href = h.getRoute(routes.dashboard.index);
    }
    setLoading(false);
  };

  return (
    <div>
      {/*{h.cmpBool(isModal, false) &&*/}
      {/* <LoginGeneric
            fields={fields}
            setFields={setFields}
            handleSubmit={handleSubmit}
            formFields={formFields}
        /> */}
      <Header title="Login" showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <div className="login-page-container">
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
                {/*<p className="login-welcome-user login-generic-text">{userName}!</p>*/}

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
                        <CommonFacebookSignin handleSubmit={handleSubmit} />
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
        </div>
      </Body>
      {/*}*/}
      {/*{h.cmpBool(isModal, true) &&*/}
      {/* {<LoginModal formFields={formFields} />} */}
    </div>
  );
}
