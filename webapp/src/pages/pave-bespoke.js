import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { useRouter } from 'next/router';
import { routes } from '../configs/routes';
import { config } from '../configs/config';

export default function PaveBespoke() {
  const [translations, setTranslations] = useState({
    header_title: {
      text: 'Pave Bespoke',
    },
    header_description: {
      text: "Want something that we don't have? Pave Bespoke is for you, and everything is viewable online from start to buying that first pot plant for the lounge room.",
    },
    search_discovery_header: {
      text: 'Search & Discovery',
    },
    search_discovery_description: {
      text: 'Share with us what you’re looking to achieve and we’ll scour the globe for you. Nothing is too challenging for us. From ski villas in Italy to apartments in New York, we’ll assist with the heavy lifting on the search to find that little gem meeting all of your criteria.',
    },
    negotiation_header: {
      text: 'Negotiation',
    },
    negotiation_description: {
      text: 'As your representative, we can act on your behalf to lead the negotiations allowing privacy as well the benefit of using trained property negotiators.',
    },
    settlement_header: {
      text: 'Settlement',
    },
    settlement_description: {
      text: 'We’re with you each step of the way, from paying the deposit to selecting legal advisors or overseas finance specialists all the way through to settlement and handover.',
    },
    furnishing_decoration_header: {
      text: 'Furnishing & Decoration',
    },
    furnishing_decoration_description: {
      text: 'Once we agree the budget and style, we can source and suggest furniture options and decorations to make your new property look amazing from day one!',
    },
    property_management_header: {
      text: 'Property Management',
    },
    property_management_description: {
      text: 'We diligence and shortlist managers for you to choose so that your new property is always in good hands.',
    },
    pricing_header: {
      text: 'Pricing',
    },
    pricing_description_1: {
      text: "US$5,000 down payment. If you haven't found something you love after 3 months, we happily refund half the fee, no questions asked.",
    },
    pricing_description_2: {
      text: '*Our furniture and decoration advisory fee depends on the complexity of the project, but roughly speaking we charge around US$1,000 for a 2 bedroom apartment.',
    },
    speak_with_experts_header: {
      text: 'Speak with one of our experts',
    },
    speak_with_experts_description: {
      text: 'Leave us your contact and one of your team members will reach out.',
    },
  });

  const formFields = {
    first_name: {
      label: '',
      placeholder: 'First name',
      style: { backgroundColor: '#fff', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      label: '',
      placeholder: 'Last name',
      style: { backgroundColor: '#fff', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    email: {
      label: '',
      style: { backgroundColor: '#fff', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
    phone: {
      label: '',
      style: { backgroundColor: '#fff', border: 'none', height: 45 },
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: 'col-12 col-md-6 mb-3',
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    message: {
      label: '',
      style: {
        backgroundColor: '#fff',
        border: 'none',
        height: 120,
        padding: 14,
      },
      placeholder: 'How can we help?',
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
        pageName: 'Pave bespoke page',
      },
      skipValidation: true,
    };
    setLoading(true);
    const apiRes = await h.hubspot.sendToHubspotForm(
      config.hubspot.apiFormSubmissionV3,
      config.hubspot.portalId,
      config.hubspot.form.paveBespokeFormId,
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
      <Header title="Pave Bespoke" />
      <Body isLoading={isLoading}>
        <section
          style={{
            backgroundImage: 'url(/assets/images/pave-bespoke-header-bg.jpg)',
            backgroundSize: 'cover',
          }}
        >
          <div
            className="row d-flex align-items-center"
            style={{ minHeight: 550 }}
          >
            <div className="col-12 col-lg-1" />
            <div className="col-12 col-lg-5 text-white">
              <div className="row justify-content-center justify-content-xl-end">
                <div
                  className="col-10 col-sm-10 col-xl-8 pt-5 px-4 px-sm-5 pb-4"
                  style={{ backgroundColor: '#f3c4aa' }}
                >
                  <h1 className="text-color3">
                    {h.translate.displayText(translations.header_title)}
                  </h1>
                  <p className="text-color3 mt-3">
                    {h.translate.displayText(translations.header_description)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mt-5 pt-5">
          <div className="timeline">
            <div
              className="row no-gutters justify-content-end justify-content-md-around align-items-start  timeline-nodes"
              style={{ backgroundColor: 'rgba(237, 230, 221, 0.4)' }}
            >
              <div className="col-10 col-md-5 order-3 order-md-1 timeline-content pb-5">
                <div className="row pb-5">
                  <div className="col-12 col-lg-9">
                    <h4 className="mb-3" style={{ marginTop: -15 }}>
                      {h.translate.displayText(
                        translations.search_discovery_header,
                      )}
                    </h4>
                    <p>
                      {h.translate.displayText(
                        translations.search_discovery_description,
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="col-2 col-sm-1 order-2 timeline-image text-md-center"
                style={{ marginTop: -24 }}
              >
                <img
                  src="/assets/images/pave-bespoke-oval.png"
                  className="img-fluid"
                  alt="img"
                />
              </div>
              <div className="col-10 col-md-5 order-1 order-md-3 py-3 timeline-date">
                {/*<time>2018-02-23</time>*/}
              </div>
            </div>
            <div
              className="row no-gutters justify-content-end justify-content-md-around align-items-start  timeline-nodes"
              style={{ backgroundColor: 'rgba(237, 230, 221, 0.4)' }}
            >
              <div className="col-10 col-md-5 order-3 order-md-1 timeline-content pb-5">
                <div className="row pb-5 justify-content-start justify-content-lg-end">
                  <div className="col-12 col-lg-9">
                    <h4 className="mb-3">
                      {h.translate.displayText(translations.negotiation_header)}
                    </h4>
                    <p>
                      {h.translate.displayText(
                        translations.negotiation_description,
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-2 col-sm-1 order-2 timeline-image text-md-center">
                <img
                  src="/assets/images/pave-bespoke-oval.png"
                  className="img-fluid"
                  alt="img"
                />
              </div>
              <div className="col-10 col-md-5 order-1 order-md-3 py-3 timeline-date">
                {/*<time>2018-02-23</time>*/}
              </div>
            </div>
            <div
              className="row no-gutters justify-content-end justify-content-md-around align-items-start  timeline-nodes"
              style={{ backgroundColor: 'rgba(237, 230, 221, 0.4)' }}
            >
              <div className="col-10 col-md-5 order-3 order-md-1 timeline-content pb-5">
                <div className="row pb-5">
                  <div className="col-12 col-lg-9">
                    <h4 className="mb-3">
                      {h.translate.displayText(translations.settlement_header)}
                    </h4>
                    <p>
                      {h.translate.displayText(
                        translations.settlement_description,
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-2 col-sm-1 order-2 timeline-image text-md-center">
                <img
                  src="/assets/images/pave-bespoke-oval.png"
                  className="img-fluid"
                  alt="img"
                />
              </div>
              <div className="col-10 col-md-5 order-1 order-md-3 py-3 timeline-date">
                {/*<time>2018-02-23</time>*/}
              </div>
            </div>
            <div
              className="row no-gutters justify-content-end justify-content-md-around align-items-start  timeline-nodes"
              style={{ backgroundColor: 'rgba(237, 230, 221, 0.4)' }}
            >
              <div className="col-10 col-md-5 order-3 order-md-1 timeline-content">
                <div className="row pb-5 justify-content-start justify-content-lg-end">
                  <div className="col-12 col-lg-9">
                    <h4 className="mb-3">
                      {h.translate.displayText(
                        translations.furnishing_decoration_header,
                      )}
                    </h4>
                    <p>
                      {h.translate.displayText(
                        translations.furnishing_decoration_description,
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-2 col-sm-1 order-2 timeline-image text-md-center">
                <img
                  src="/assets/images/pave-bespoke-oval.png"
                  className="img-fluid"
                  alt="img"
                />
              </div>
              <div className="col-10 col-md-5 order-1 order-md-3 py-3 timeline-date">
                {/*<time>2018-02-23</time>*/}
              </div>
            </div>
            <div className="row no-gutters justify-content-end justify-content-md-around align-items-start  timeline-nodes mt-5">
              <div className="col-10 col-md-5 order-3 order-md-1 timeline-content pb-5">
                <div className="row pb-5">
                  <div className="col-12 col-lg-9">
                    <h4 className="mb-3">
                      {h.translate.displayText(
                        translations.property_management_header,
                      )}
                    </h4>
                    <p>
                      {h.translate.displayText(
                        translations.property_management_description,
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-2 col-sm-1 order-2 timeline-image text-md-center">
                <img
                  src="/assets/images/pave-bespoke-oval.png"
                  className="img-fluid"
                  alt="img"
                />
              </div>
              <div className="col-10 col-md-5 order-1 order-md-3 py-3 timeline-date">
                {/*<time>2018-02-23</time>*/}
              </div>
            </div>
          </div>
        </div>

        <section style={{ backgroundColor: '#08443d' }}>
          <div className="row d-flex align-items-center">
            <div className="col-12 col-lg-5 col-lg-5 px-5 py-5 py-lg-0">
              <div className="row justify-content-center justify-content-lg-end">
                <div className="col-12 col-xl-8">
                  <h1 className="text-color2">
                    {h.translate.displayText(translations.pricing_header)}
                  </h1>
                  <p className="mt-3 text-white">
                    {h.translate.displayText(
                      translations.pricing_description_1,
                    )}
                    <br />
                    <br />
                    {h.translate.displayText(
                      translations.pricing_description_2,
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-7 p-0 text-right">
              <img
                className="img-fluid"
                src="/assets/images/pave-bespoke-footer-bg.jpg"
              />
            </div>
          </div>
        </section>

        <section className="my-5 py-4">
          <div className="container pave-bespoke-form">
            <div className="row d-flex align-items-center">
              <div className="col-0 col-lg-2" />
              <div className="col-12 col-lg-4 pt-5 pt-lg-0 px-5 px-lg-0">
                <h2 style={{ maxWidth: 240 }}>
                  {h.translate.displayText(
                    translations.speak_with_experts_header,
                  )}
                </h2>
                <p className="mt-4">
                  {h.translate.displayText(
                    translations.speak_with_experts_description,
                  )}
                </p>
              </div>
              <div className="col-12 col-lg-6 pt-3 px-4 px-md-5">
                <h.form.GenericForm
                  formFields={formFields}
                  formMode={h.form.FORM_MODE.ADD}
                  setLoading={setLoading}
                  fields={fields}
                  setFields={setFields}
                  handleSubmit={handleSubmit}
                  showCancelButton={false}
                  submitButtonVariant="primary2"
                  submitButtonStyle={{ marginBottom: -20 }}
                  buttonWrapperClassName="text-right"
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

/**
 * Generic advisor card component
 * @param {string} [profilePicture]
 * @param {string} personName
 * @param {string} companyTitle
 * @param {string} description
 * @returns {JSX.Element}
 * @constructor
 */
export function AdvisorCard({
  profilePicture,
  personName,
  companyTitle,
  description,
}) {
  profilePicture = h.isEmpty(profilePicture)
    ? '/assets/images/profile_picture_placeholder.png'
    : profilePicture;
  return (
    <div>
      <img className="img-fluid" src={profilePicture} />
      <p
        className="text-color3 font-TenorSansRegular mt-3 mb-0"
        style={{ lineHeight: 0.8 }}
      >
        {personName}
      </p>
      <small className="text-muted font-MontserratRegular">
        {companyTitle}
      </small>
      <p
        className="text-left font-MontserratRegular text-color-4 mt-3"
        style={{ fontSize: 12 }}
      >
        {description}
      </p>
    </div>
  );
}
