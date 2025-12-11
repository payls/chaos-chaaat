import React, { useState, useEffect } from 'react';
// import SignUpModal from "../../components/SignUp/SignUpModal";
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import { Header, Body } from '../../components/Layouts/Layout';
import CompanyName from '../../components/Registration/CompanyName';

export default function RegisterCompanyName() {
  const router = useRouter();
  const [isModal, setModal] = useState();
  const [isLoading, setLoading] = useState(false);
  let className;
  let errorMessage;
  let email;

  useEffect(() => {
    // setModal(true);
  });

  /**
   * Find email in cookies and send to signup if not found
   */
  useEffect(() => {
    email = h.cookie.getCookie('registration_email_token');
    if (!email) {
      errorMessage = 'Unable to find email. Please signup or login';
      h.general.alert('error', { message: errorMessage });
      setTimeout(async () => {
        window.location.href = h.getRoute(routes.signup);
      }, 2000);
    }
  }, []);

  if (h.cmpBool(isModal, true)) {
    className = 'col-12 signup-modal-input';
  } else {
    className = 'col-12 signup-generic-input';
  }

  const formFields = {
    company_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'enter your company name',
      label: 'Your company name',
      class_name: className,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  /**
   * Generic handle submit function for new user sign up
   * @param {*} e
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    let query = {
      email: '',
      company_name: '',
    };
    // let message;

    query.email = h.cookie.getCookie('registration_email_token');
    query.company_name = fields.company_name.value;
    // message = 'Next, please enter your industry';

    setLoading(true);
    const response = await api.auth.registerCompanyName(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      fields.company_name.value = '';
      setFields(Object.assign({}, fields));
      setTimeout(async () => {
        setLoading(false);
        await router.replace(h.getRoute(routes.real_estate_type));
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <Header title="Company Name" showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <div className="signup-page-container">
          <div className="container"></div>

          <div className="container h-100 mt-5 pb-5">
            <div className="d-flex h-100 align-items-center p-5 flex-column">
              <img
                src="https://cdn.yourpave.com/assets/chaaat-logo.png"
                alt="Pave"
                style={{ maxWidth: 130, margin: 40 }}
              />
              <div className="col-12 col-md-6 col-lg-5 mx-auto signup-page-form-container">
                <h3 className="-generic-header-text">
                  What is your company's name?
                </h3>

                <CompanyName
                  className="text-left"
                  formFields={formFields}
                  formMode={h.form.FORM_MODE.ADD}
                  setLoading={setLoading}
                  fields={fields}
                  setFields={setFields}
                  handleSubmit={handleSubmit}
                  showCancelButton={false}
                  submitButtonLabel="Next →"
                  submitButtonClassName="w-100 login-btn"
                ></CompanyName>
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
