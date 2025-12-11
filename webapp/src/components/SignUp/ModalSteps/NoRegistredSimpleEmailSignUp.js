import React, { useState, useEffect } from 'react';
import SignUpForm from '../SignUpForm';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import { h } from '../../../helpers';
import constant from '../../../constants/constant.json';
import { useRouter } from 'next/router';

export default function NoRegistredSimpleEmailSignUp(props) {
  const { email } = props;

  const router = useRouter();
  const [isLoading, setLoading] = useState();

  const className = 'col-12 signup-generic-input';

  const formFields = {
    first_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'enter your first name',
      class_name: className,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'enter your last name',
      class_name: className,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    password: {
      field_type: h.form.FIELD_TYPE.PASSWORD,
      placeholder: 'enter your password',
      class_name: className,
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

    const query = {
      first_name: fields.first_name.value,
      last_name: fields.last_name.value,
      email: email,
      password: fields.password.value,
      auth_type: constant.USER.AUTH_TYPE.EMAIL,
      buyer_type: h.general.findGetParameter('buyer_type'),
    };

    const message =
      'Thank you for signing up. Please check your email inbox for next steps.';

    setLoading(true);
    const response = await api.auth.register(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      h.general.alert('success', { message });

      fields.first_name.value = '';
      fields.last_name.value = '';
      fields.password.value = '';
      setFields(Object.assign({}, fields));

      setTimeout(async () => {
        setLoading(false);
        await router.replace(h.getRoute(routes.home));
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-10 pt-5">
        <h1 className="signup-generic-header-text">Sign Up</h1>
        <p className="signup-generic-header-text" style={{ fontSize: 16 }}>
          Don't have an account?
        </p>
        <SignUpForm
          className="text-left"
          formFields={formFields}
          formMode={h.form.FORM_MODE.ADD}
          setLoading={setLoading}
          fields={fields}
          setFields={setFields}
          handleSubmit={handleSubmit}
          showCancelButton={false}
          submitButtonLabel="Sign Up"
          submitButtonClassName="w-100 mt-3"
        ></SignUpForm>
      </div>
    </div>
  );
}
