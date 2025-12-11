import React, { useState, useEffect } from 'react';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import { h } from '../../../helpers';
import LoginForm from '../../Login/LoginForm';

export default function RegistredSimpleEmailLogin(props) {
  const { email } = props;

  const [isLoading, setLoading] = useState();

  const className = 'col-12 signup-generic-input';

  const formFields = {
    password: {
      field_type: h.form.FIELD_TYPE.PASSWORD,
      class_name: `col-12 ${className}`,
      placeholder: 'enter your password',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    const errorMessage = h.general.findGetParameter('error_message');
    if (h.notEmpty(errorMessage)) {
      h.general.alert('error', { message: errorMessage });
    }
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const password = fields.password.value;

    setLoading(true);

    const response = await api.auth.loginEmail({ email, password }, false);

    fields.password.value = '';
    setFields(Object.assign({}, fields));

    if (h.cmpStr(response.status, 'ok')) {
      const accessToken = response.data.access_token;
      h.cookie.setAccessToken(accessToken);
      props.onSuccessfullyLogin();
    }

    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-10 pt-5">
        <h1 className="signup-generic-header-text">Log In</h1>
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
      </div>
    </div>
  );
}
