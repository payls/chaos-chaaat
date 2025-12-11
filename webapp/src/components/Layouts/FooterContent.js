import React, { useState } from 'react';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';
import { config } from '../../configs/config';

export default function FooterContent({
  isLoading = false,
  setLoading = () => {},
}) {
  const formFields = {
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name:
        'subscribe-input-email bg-transparent mr-sm-2 border-color4 text-color4',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
      placeholder: 'Leave us your email for exclusive updates.',
    },
  };
  const [fields, setFields] = useState(h.general.initState(formFields));
  const [submitButtonLabel, setSubmitButtonLabel] = useState('Submit');
  const [translations, setTranslations] = useState({
    company_header: { text: 'Company' },
    social_header: { text: 'Social' },
    explore_header: { text: 'Explore' },
    subscribe_header: { text: 'Subscribe' },
    about_us_menu: { text: 'About Us' },
    pave_bespoke_menu: { text: 'Pave Bespoke' },
    why_pave_menu: { text: 'Why Pave' },
    contact_us_menu: { text: 'Contact Us' },
    learn_menu: { text: 'Learn' },
  });

  const validate = (key, fields, setFields) => {
    const value = fields[key].value;
    fields[key].error = '';
    if (h.isEmpty(value)) {
      fields[key].error = 'Please enter email address';
    } else if (!h.validate.validateEmail(value)) {
      fields[key].error = 'Please enter a valid email address';
    }
    setFields(Object.assign({}, fields));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    validate('email', fields, setFields);
    if (h.isEmpty(fields.email.error)) {
      const formData = {
        submittedAt: new Date().getTime(),
        fields: [{ name: 'email', value: fields.email.value }],
        context: {
          pageUri: window.location.href,
          pageName: document.title,
        },
        skipValidation: true,
      };
      setLoading(true);
      const apiRes = await h.hubspot.sendToHubspotForm(
        config.hubspot.apiFormSubmissionV3,
        config.hubspot.portalId,
        config.hubspot.form.newsletterSubscriptionFormId,
        formData,
      );
      setLoading(false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        fields.email.value = '';
        setFields(Object.assign({}, fields));
        h.general.alert('success', { message: 'Thank you for subscribing.' });
      }
    }
  };

  return (
    <footer className="footer pt-5 pb-5">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-6">
            <div className="row no-gutters">
              <div className="col-12 col-lg-4">
                <h5>{h.translate.displayText(translations.company_header)}</h5>
                <ul className="mt-lg-4 pt-lg-2">
                  <li>
                    <a href={h.getRoute(routes.about_us)}>
                      {h.translate.displayText(translations.about_us_menu)}
                    </a>
                  </li>
                  <li>
                    <a href={h.getRoute(routes.pave_bespoke)}>
                      {h.translate.displayText(translations.pave_bespoke_menu)}
                    </a>
                  </li>
                  <li>
                    <a href={h.getRoute(routes.why_pave)}>
                      {h.translate.displayText(translations.why_pave_menu)}
                    </a>
                  </li>
                  <li>
                    <a href={h.getRoute(routes.contact_us)}>
                      {h.translate.displayText(translations.contact_us_menu)}
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-12 col-lg-4">
                <h5>{h.translate.displayText(translations.social_header)}</h5>
                <ul className="mt-lg-3">
                  <li className="mr-3" style={{ display: 'inline-block' }}>
                    <a target="_blank" href={h.getRoute(routes.facebook)}>
                      <img
                        style={{ height: 18 }}
                        src="/assets/images/icon-facebook.png"
                      />
                    </a>
                  </li>
                  <li className="mr-3" style={{ display: 'inline-block' }}>
                    <a target="_blank" href={h.getRoute(routes.linkedin)}>
                      <img
                        style={{ height: 15 }}
                        src="/assets/images/icon-linkedin.png"
                      />
                    </a>
                  </li>
                  <li className="mr-3" style={{ display: 'inline-block' }}>
                    <a target="_blank" href={h.getRoute(routes.instagram)}>
                      <img
                        style={{ height: 18 }}
                        src="/assets/images/icon-instagram.png"
                      />
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-12 col-lg-4">
                <h5>{h.translate.displayText(translations.explore_header)}</h5>
                <ul className="mt-lg-4 pt-lg-2">
                  {/*	<li><a href="/buy">Buy</a></li>*/}
                  {/*	<li><a href="/sell">Sell</a></li>*/}
                  <li>
                    <a target="_blank" href={h.getRoute(routes.help_center)}>
                      {h.translate.displayText(translations.learn_menu)}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <h5>{h.translate.displayText(translations.subscribe_header)}</h5>
            <h.form.CustomForm
              className="subscribe-form"
              style={{ lineHeight: 3 }}
              inline
              onSubmit={(e) => handleSubmit(e)}
            >
              <div className="row no-gutters">
                <div className="col-12 col-lg-11">
                  <h.form.CustomInput
                    variant="primary"
                    type="text"
                    placeholder="Sign up for our property market research"
                    name="email"
                    data={fields.email}
                    className="subscribe-input-email bg-transparent mr-sm-2 border-color4 text-color4"
                    onChange={(e) =>
                      h.form.onChange(e, 'email', fields, setFields, validate)
                    }
                  />
                </div>
                <div className="col-12 col-lg-1">
                  <h.form.CustomButton
                    className=""
                    variant="primary"
                    onClick={async (e) => {
                      await handleSubmit(e);
                    }}
                  >
                    {submitButtonLabel}
                  </h.form.CustomButton>
                </div>
              </div>
            </h.form.CustomForm>
          </div>
        </div>
        <div className="row text-center pt-5">
          <div className="col-12">
            <p className="text-color1 font-MontserratRegular">
              &#169; Pave 2021
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
