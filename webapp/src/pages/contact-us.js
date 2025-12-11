import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { config } from '../configs/config';

export default function ContactUs() {
  const [translations, setTranslations] = useState({
    contact_us_text: { text: 'Contact us' },
    location_description_1: { text: '10F, China Evergrande Centre' },
    location_description_2: { text: '33 Lockhart Rd' },
    location_description_3: { text: 'Wan Chai' },
    location_description_4: { text: 'Hong Kong' },
    speak_with_expert_text: { text: 'Speak with our experts' },
    first_name_field: { text: 'First name' },
    last_name_field: { text: 'Last name' },
    email_field: { text: 'Email' },
    phone_field: { text: 'Phone' },
    message_field: { text: 'How can we help?' },
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
    message: {
      label: '',
      placeholder: h.translate.displayText(translations.message_field),
      style: {
        backgroundColor: '#f5f5f5',
        border: 'none',
        height: 120,
        padding: 14,
      },
      field_type: h.form.FIELD_TYPE.TEXTAREA,
      class_name: 'col-12',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
  };

  const [isLoading, setLoading] = useState();
  const [fields, setFields] = useState(formFields);

  useEffect(() => {
    h.route.redirectToHome();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const formData = {
      submittedAt: new Date().getTime(),
      fields: [
        { name: 'firstname', value: fields.first_name.value },
        { name: 'lastname', value: fields.last_name.value },
        { name: 'email', value: fields.email.value },
        { name: 'mobilephone', value: fields.phone.value },
        { name: 'message', value: fields.message.value },
      ],
      context: {
        pageUri: window.location.href,
        pageName: 'Contact us page',
      },
      skipValidation: true,
    };
    setLoading(true);
    const apiRes = await h.hubspot.sendToHubspotForm(
      config.hubspot.apiFormSubmissionV3,
      config.hubspot.portalId,
      config.hubspot.form.contactUsFormId,
      formData,
    );
    setLoading(false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      fields.first_name.value = '';
      fields.last_name.value = '';
      fields.email.value = '';
      fields.phone.value = '';
      fields.message.value = '';
      setFields(Object.assign({}, fields));
      h.general.alert('success', {
        message: 'Thank you for submitting. We will be in touch shortly.',
      });
    }
  };

  return (
    <div>
      <Header title="contact-us" />
      <Body isLoading={isLoading}>
        <section>
          <div className="row">
            <div className="col-12" style={{ backgroundColor: '#ede6dd' }}>
              <h1 className="m-5 text-center">
                {h.translate.displayText(translations.contact_us_text)}
              </h1>
            </div>
          </div>
        </section>

        <section>
          <div className="container p-0 p-md-5">
            <div className="row justify-content-center text-center">
              <div className="contact-icon col-12 col-md-4 pt-5">
                <img
                  style={{ maxWidth: 22 }}
                  src="/assets/images/icon-phone.png"
                  alt="Pave - phone icon"
                />
                <p className="pt-5">
                  <a className="text-color3" href="tel:+85290814832">
                    +852-9081-4832
                  </a>
                </p>
              </div>
              <div className="contact-icon col-12 col-md-4 pt-5">
                <img
                  style={{ maxWidth: 30 }}
                  src="/assets/images/icon-mail.png"
                  alt="Pave - mail icon"
                />
                <p className="pt-5">
                  <a className="text-color3" href="mailto:hello@yourpave.com">
                    hello@yourpave.com
                  </a>
                </p>
              </div>
              <div className="col-12 col-md-4 pt-5">
                <img
                  style={{ maxWidth: 30 }}
                  src="/assets/images/icon-home.png"
                  alt="Pave - home icon"
                />
                <p className="pt-5">
                  {h.translate.displayText(translations.location_description_1)}
                  <br />
                  {h.translate.displayText(translations.location_description_2)}
                  <br />
                  {h.translate.displayText(translations.location_description_3)}
                  <br />
                  {h.translate.displayText(translations.location_description_4)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container pb-5">
            <div className="row">
              <div className="col-12">
                <h2 className="m-5 text-center">
                  {h.translate.displayText(translations.speak_with_expert_text)}
                </h2>
              </div>
            </div>
            <div className="row px-0 px-md-5 mx-0 mx-md-5">
              <div className="col-12">
                <h.form.GenericForm
                  formFields={formFields}
                  formMode={h.form.FORM_MODE.ADD}
                  setLoading={setLoading}
                  fields={fields}
                  setFields={setFields}
                  handleSubmit={handleSubmit}
                  showCancelButton={false}
                  submitButtonVariant="primary2"
                />
              </div>
            </div>
          </div>
        </section>
      </Body>
      <Footer isLoading={isLoading} setLoading={setLoading} />
    </div>
  );
}
