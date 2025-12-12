import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import { useRouter } from 'next/router';
import { config } from '../../configs/config';

export default function AuthResetPassword() {
  const router = useRouter();

  const WEBADMIN_LOGIN_URL = `${config.webAdminUrl}/login`;
  const formFields = {
    password: {
      placeholder: 'Enter new password',
      field_type: h.form.FIELD_TYPE.PASSWORD,
      class_name: 'col-12 reset-password-generic-input',
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
      placeholder: 'Enter new password again',
      field_type: h.form.FIELD_TYPE.PASSWORD,
      class_name: 'col-12 reset-password-generic-input',
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

  const [isLoading, setLoading] = useState();
  const [fields, setFields] = useState(h.form.initFields(formFields));
  const [isTokenUsed, setTokenUsed] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(
    'Reset password Link has expired.',
  );

  useEffect(() => {
    (async () => {
      const token = h.general.findGetParameter('token');
      if (h.notEmpty(token)) {
        setLoading(true);
        const apiRes = await api.auth.getUserByResetPasswordToken(
          { token },
          false,
        );
        if (h.cmpStr(apiRes.status, 'ok')) {
          setTokenUsed(apiRes.data.is_token_used);
        }
        setLoading(false);
      } else {
        window.location.href = h.getRoute(WEBADMIN_LOGIN_URL);
      }
      // GET CSRF Token
      api.auth.getCsrfToken();
    })();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const token = h.general.findGetParameter('token');
    setLoading(true);
    const apiRes = await api.auth.resetPassword({
      token,
      password: fields.password.value,
    });
    fields.password.value = '';
    fields.confirm_password.value = '';
    setFields(Object.assign({}, fields));
    setLoading(false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setTokenUsed(true);
      setVerifyMessage('Password updated successfully. Please login.');
    }
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
    <div>
      <Header title="Reset Password" showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <div className="signup-page-container">
          <div className="container h-100 pb-5">
            <div className="d-flex h-100 align-items-center p-5 flex-column">
              <img
                src="https://cdn.yourpave.com/assets/chaaat-logo.png"
                alt="Pave"
                style={{ maxWidth: 130, margin: 40 }}
              />
              <div
                className="col-12 col-md-6 col-lg-5 mx-auto signup-page-form-container"
                style={{ width: '422px' }}
              >
                <h3 className="-generic-header-text"> Reset Password</h3>

                {h.cmpBool(isTokenUsed, false) && (
                  <h.form.GenericForm
                    formFields={formFields}
                    formMode={h.form.FORM_MODE.ADD}
                    setLoading={setLoading}
                    fields={fields}
                    setFields={setFields}
                    handleSubmit={handleSubmit}
                    submitButtonLabel="Confirm"
                    submitButtonStyle={buttonStyle}
                    buttonWrapperClassName={buttonWrapperClassName}
                    submitButtonVariant="primary3"
                    showCancelButton={false}
                  />
                )}
                {h.cmpBool(isTokenUsed, true) && (
                  <div>
                    <p>{verifyMessage}</p>
                    <h.form.CustomForm inline>
                      <h.form.CustomButton
                        className="mr-sm-2 mt-2 mb-3"
                        variant="primary3"
                        style={buttonStyle}
                        onClick={async (e) => {
                          e.preventDefault();
                          await router.push(h.getRoute(WEBADMIN_LOGIN_URL));
                        }}
                      >
                        Log In
                      </h.form.CustomButton>
                    </h.form.CustomForm>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
