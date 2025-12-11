import React, { useState } from 'react';
import { h } from '../../helpers';
import { config } from '../../configs/config';

export default function ProjectContactForm({ project }) {
  const [translations, setTranslations] = useState({
    first_name_field: { text: 'First name' },
    last_name_field: { text: 'Last name' },
    email_field: { text: 'Email' },
    phone_field: { text: 'Phone' },
  });

  const formFields = {
    first_name: {
      label: '',
      placeholder: h.translate.displayText(translations.first_name_field),
      style: { backgroundColor: '#f5f5f5', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      label: '',
      placeholder: h.translate.displayText(translations.last_name_field),
      style: { backgroundColor: '#f5f5f5', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    email: {
      label: '',
      placeholder: h.translate.displayText(translations.email_field),
      style: { backgroundColor: '#f5f5f5', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
    phone: {
      label: '',
      placeholder: h.translate.displayText(translations.phone_field),
      style: { backgroundColor: '#f5f5f5', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
  };

  const [isLoading, setLoading] = useState();
  const [fields, setFields] = useState(formFields);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const formData = {
      submittedAt: new Date().getTime(),
      fields: [
        { name: 'firstname', value: fields.first_name.value },
        { name: 'lastname', value: fields.last_name.value },
        { name: 'email', value: fields.email.value },
        { name: 'mobilephone', value: fields.phone.value },
        {
          name: 'message',
          value: `Submission from project page '${project.name}'`,
        },
      ],
      context: {
        pageUri: window.location.href,
        pageName: document.title || 'Project page',
      },
      skipValidation: true,
    };
    setLoading(true);
    const apiRes = await h.hubspot.sendToHubspotForm(
      config.hubspot.apiFormSubmissionV3,
      config.hubspot.portalId,
      config.hubspot.form.projectPageFormId,
      formData,
    );
    setLoading(false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      fields.first_name.value = '';
      fields.last_name.value = '';
      fields.email.value = '';
      fields.phone.value = '';
      setFields(Object.assign({}, fields));
      h.general.alert('success', {
        message: 'Thank you for submitting. We will be in touch shortly.',
      });
    }
  };

  return (
    <div>
      <h.form.GenericForm
        formFields={formFields}
        formMode={h.form.FORM_MODE.ADD}
        setLoading={setLoading}
        fields={fields}
        setFields={setFields}
        handleSubmit={handleSubmit}
        showCancelButton={false}
        submitButtonVariant="primary2"
        // buttonWrapperClassName="text-left"
      />
    </div>
  );
}
