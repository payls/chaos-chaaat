import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import { Header, Body } from '../../components/Layouts/Layout';
import Industry from '../../components/Registration/Industry';
import constant from '../../constants/constant.json';

export default function RegisterRealEstateType() {
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
    real_estate_type: {
      field_type: h.form.FIELD_TYPE.SELECT,
      placeholder: 'enter your industry type',
      label: 'Your Industry Type',
      class_name: className,
      options: [
        { text: 'Please select your industry type', value: undefined },
        ...Object.keys(constant.REAL_ESTATE_TYPES).map((key) => {
          return {
            text: constant.REAL_ESTATE_TYPES[key],
            value: key,
          };
        }),
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
      real_estate_type: '',
    };
    // let message = '';

    query.email = h.cookie.getCookie('registration_email_token');
    query.real_estate_type = fields.real_estate_type.value;
    // message = 'Next, please enter your company\'s size';
    setLoading(true);
    // let userAccessToken = null;
    const response = await api.auth.registerRealEstateType(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      // h.general.alert('success', {message});
      setTimeout(async () => {
        setLoading(false);
        if (fields.real_estate_type.value === 'REAL_ESTATE') {
          await router.replace(h.getRoute(routes.industry));
        } else {
          await router.replace(h.getRoute(routes.company_size));
        }
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <Header title="Industry Selection" showHeaderContent={false} />
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
                <h3 className="signup-generic-header-text">
                  What type of industry are you in?
                </h3>

                <Industry
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
                ></Industry>
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
