import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import { Header, Body } from '../../components/Layouts/Layout';
import CompanySize from '../../components/Registration/CompanySize';
import constant from '../../constants/constant.json';

export default function RegisterCompanySize() {
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
    company_size: {
      field_type: h.form.FIELD_TYPE.SELECT,
      placeholder: 'Enter your company size',
      label: 'Your company size',
      class_name: className,
      options: [
        { text: 'Select your company size', value: undefined },
        {
          text: constant.COMPANY.SIZE.INDIVIDUAL,
          value: constant.COMPANY.SIZE.INDIVIDUAL,
        },
        {
          text: constant.COMPANY.SIZE.SMALL,
          value: constant.COMPANY.SIZE.SMALL,
        },
        {
          text: constant.COMPANY.SIZE.MEDIUM,
          value: constant.COMPANY.SIZE.MEDIUM,
        },
        {
          text: constant.COMPANY.SIZE.LARGE,
          value: constant.COMPANY.SIZE.LARGE,
        },
      ],
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
      company_size: '',
    };
    // let message;

    query.email = h.cookie.getCookie('registration_email_token');
    query.company_size = fields.company_size.value;
    // message = 'Next, please enter your company\'s website';

    setLoading(true);
    // let userAccessToken = null;
    const response = await api.auth.registerCompanySize(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      // h.general.alert('success', { message });
      setTimeout(async () => {
        await router.replace(h.getRoute(routes.company_website));
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <Header title="Company Size" showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <div className="signup-page-container">
          <div className="container">
            <img
              src="https://cdn.yourpave.com/assets/chaaat-logo.png"
              alt="Pave"
              style={{ maxWidth: 130, marginTop: 10 }}
            />
          </div>
          <div className="container h-100 mt-5 pb-5">
            <div className="d-flex h-100 align-items-center row">
              <div className="col-12 col-md-6 col-lg-5 mx-auto signup-page-form-container">
                <h3 className="company-size-generic-header-text">
                  What is the size of your workforce?
                </h3>
                <CompanySize
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
                ></CompanySize>
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
