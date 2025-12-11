import React, { useState } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { api } from '../api';
import { useRouter } from 'next/router';
import { routes } from '../configs/routes';
import CommonGoogleSignin from '../components/Common/CommonGoogleSignin';
import CommonFacebookSignin from '../components/Common/CommonFacebookSignin';
import constant from '../constants/constant.json';

export default function CreateAccount() {
  const formFields = {
    first_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
    password: {
      field_type: h.form.FIELD_TYPE.PASSWORD,
      class_name: 'col-12',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        (key, value, fields) => {
          const confirmPassword = fields.confirm_password.value;
          if (!h.cmpStr(value, confirmPassword)) {
            return 'Passwords do not match';
          }
          return '';
        },
      ],
    },
    confirm_password: {
      field_type: h.form.FIELD_TYPE.PASSWORD,
      class_name: 'col-12',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        (key, value, fields) => {
          const password = fields.password.value;
          if (!h.cmpStr(value, password)) {
            return 'Passwords do not match';
          }
          return '';
        },
      ],
    },
  };

  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
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

    let query = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      auth_type,
      social_payload,
      buyer_type: h.general.findGetParameter('buyer_type'),
    };
    let message = '';

    switch (auth_type) {
      case constant.USER.AUTH_TYPE.GOOGLE:
        const { first_name, last_name, email } =
          h.user.parseGoogleSigninPayload(social_payload);
        query.auth_type = constant.USER.AUTH_TYPE.GOOGLE;
        query.first_name = first_name;
        query.last_name = last_name;
        query.email = email;
        message = 'Thank you for signing up. Please wait while we sign you in.';
        break;
      default:
      case constant.USER.AUTH_TYPE.EMAIL:
        query.auth_type = constant.USER.AUTH_TYPE.EMAIL;
        query.first_name = fields.first_name.value;
        query.last_name = fields.last_name.value;
        query.email = fields.email.value;
        query.password = fields.password.value;
        message =
          'Thank you for signing up. Please check your email inbox for next steps.';
        break;
    }

    setLoading(true);
    const response = await api.auth.register(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      h.general.alert('success', { message });
      if (h.cmpStr(auth_type, constant.USER.AUTH_TYPE.GOOGLE)) {
        const access_token = response.data.access_token;
        h.cookie.setAccessToken(access_token);
      } else {
        fields.first_name.value = '';
        fields.last_name.value = '';
        fields.email.value = '';
        fields.password.value = '';
        fields.confirm_password.value = '';
        setFields(Object.assign({}, fields));
      }
      setTimeout(async () => {
        setLoading(false);
        if (h.cmpStr(auth_type, constant.USER.AUTH_TYPE.GOOGLE)) {
          await router.replace(h.getRoute(routes.dashboard.index));
        } else {
          await router.replace(h.getRoute(routes.home));
        }
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div>
      <Header title="Create Account" />
      <Body isLoading={isLoading} className="pl-4 pr-4">
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-sm-8">
            <h3>
              Next up, create an account. You can do so using your current email
              or social login or create a new one.
            </h3>
          </div>
        </div>
        <div className="row justify-content-center mb-5">
          <div className="col-12 col-sm-10 col-md-10">
            <div className="row justify-content-center mt-5">
              <div className="col-12 col-lg-6 col-xl-5 text-center">
                <div className="d-flex justify-content-center">
                  <CommonGoogleSignin handleSubmit={handleSubmit} />
                  <CommonFacebookSignin handleSubmit={handleSubmit} />
                </div>
              </div>
            </div>
            <div className="row justify-content-center mt-4">
              <div className="col-12 col-lg-6 col-xl-5 text-center">
                <p>- or -</p>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-12 col-lg-6 col-xl-5">
                <h.form.GenericForm
                  formFields={formFields}
                  formMode={h.form.FORM_MODE.ADD}
                  setLoading={setLoading}
                  fields={fields}
                  setFields={setFields}
                  handleSubmit={handleSubmit}
                  submitButtonLabel="Create Account"
                  showCancelButton={false}
                />
              </div>
            </div>
          </div>
        </div>
      </Body>
      <Footer isLoading={isLoading} setLoading={setLoading} />
    </div>
  );
}
