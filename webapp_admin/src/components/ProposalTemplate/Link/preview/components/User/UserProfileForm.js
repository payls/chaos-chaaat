import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';

export default function UserProfileForm({
  setLoading,
  formMode = h.form.FORM_MODE.EDIT,
  handleFormCancelled,
  handleFormSubmitted,
}) {
  const fieldClass = 'col-12-light';
  const [formFields, setFormFields] = useState();
  const [fields, setFields] = useState();
  const [userName, setUserName] = useState('');
  // const user = h.auth.getUserInfo();
  // setUserName(h.user.formatFullName(user));

  useEffect(() => {
    let newFormFields = {};
    newFormFields = {
      profile: {
        field_type: h.form.FIELD_TYPE.SECTION,
        class_name: 'col-12-section',
      },
      full_name: {
        field_type: h.form.FIELD_TYPE.TEXT,
        class_name: fieldClass,
        // value: h.user.formatFullName(user),
        value: 'test',
        validation: [h.form.FIELD_VALIDATION.REQUIRED],
      },
      email: {
        readOnly: true,
        disabled: true,
        field_type: h.form.FIELD_TYPE.TEXT,
        class_name: fieldClass,
        // value: user.email,
        value: 'test',
      },
      phone_number: {
        field_type: h.form.FIELD_TYPE.TEXT,
        class_name: fieldClass,
        validation: [h.form.FIELD_VALIDATION.PHONENUMBER],
      },
      change_password: {
        field_type: h.form.FIELD_TYPE.SECTION,
        class_name: 'col-12-section',
      },
      current_password: {
        field_type: h.form.FIELD_TYPE.PASSWORD,
        class_name: fieldClass,
        validation: [h.form.FIELD_VALIDATION.REQUIRED],
      },
      new_password: {
        field_type: h.form.FIELD_TYPE.PASSWORD,
        class_name: fieldClass,
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
        class_name: fieldClass,
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
    setFormFields(newFormFields);
    setFields(h.form.initFields(newFormFields));
  }, [formMode]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const email = fields.email.value;
    const password = fields.current_password.value;
    setLoading(true);
    let response = null;
    response = await api.auth.loginEmail({ email, password });
    fields.email.value = '';
    fields.password.value = '';
    setFields(Object.assign({}, fields));
    if (h.cmpStr(response.status, 'ok')) {
      const accessToken = response.data.access_token;
      h.cookie.setAccessToken(accessToken);
      window.location.href = h.getRoute(routes.dashboard.index);
    }
    setLoading(false);
    if (handleFormSubmitted) handleFormSubmitted();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <h.form.GenericForm
          formFields={formFields}
          formMode={formMode}
          setLoading={setLoading}
          fields={fields}
          setFields={setFields}
          handleSubmit={handleSubmit}
          submitButtonLabel="Send"
          handleCancel={async (e) => {
            e.preventDefault();
            if (handleFormCancelled) handleFormCancelled();
          }}
        />
      </div>
    </div>
  );
}
