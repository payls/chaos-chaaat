import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { api } from '../api';
import { routes } from '../configs/routes';
import Link from 'next/link';

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
  const [fields, setFields] = useState(h.form.initFields(formFields));
  const [isTokenUsed, setTokenUsed] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(
    'Verifying your email address',
  );

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    let email = fields.email.value;
    setLoading(true);
    await api.auth.forgotPassword({ email });
    fields.email.value = '';
    setFields(Object.assign({}, fields));
    setLoading(false);
  };

  const buttonStyle = {
    borderRadius: '10px',
    backgroundColor: '#1C1C1C',
    color: '#FFFFFF',
    height: '55px',
  };
  const buttonWrapperClassName = 'text-center';

  return (
    <div>
      <Header title="Forgot Password" showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <div className="forgot-password-page-container">
          <div className="container">
            <img
              src="https://cdn.yourpave.com/assets/chaaat-logo.png"
              alt="Pave"
              style={{ maxWidth: 130, marginTop: 10 }}
            />
          </div>
          <div className="container h-100 mt-5 pb-5">
            <div className="d-flex h-100 align-items-center row">
              <div className="col-12 col-md-6 col-lg-5 mx-auto forgot-password-page-form-container pt-5">
                <h1 className="forgot-password-generic-header-text">
                  Forgot Password
                </h1>
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
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
