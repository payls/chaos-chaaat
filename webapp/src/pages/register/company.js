import React, { useState, useEffect } from 'react';
// import SignUpModal from "../../components/SignUp/SignUpModal";
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import { Header, Body } from '../../components/Layouts/Layout';
import constant from '../../constants/constant.json';

const buttonStyle = {
  borderRadius: '10px',
  backgroundColor: '#1C1C1C',
  color: '#FFFFFF',
  height: '55px',
};
const buttonWrapperClassName = 'text-center login-submit-btn';

export default function Company() {
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
      label: 'Your company name*',
      class_name: className,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    real_estate_type: {
      field_type: h.form.FIELD_TYPE.SELECT,
      placeholder: 'enter your industry type',
      label: 'Your Industry Type*',
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
    // industry: {
    //   field_type: h.form.FIELD_TYPE.SELECT,
    //   placeholder: 'enter your Industry Role',
    //   label: 'Your Industry Role',
    //   class_name: className,
    //   options: [
    //     { text: 'Please select your industry role', value: undefined },
    //     {
    //       text: constant.COMPANY.INDUSTRY_TYPE.REAL_ESTATE_AGENT,
    //       value: constant.COMPANY.INDUSTRY_TYPE.REAL_ESTATE_AGENT,
    //     },
    //     {
    //       text: constant.COMPANY.INDUSTRY_TYPE.DEVELOPER,
    //       value: constant.COMPANY.INDUSTRY_TYPE.DEVELOPER,
    //     },
    //     {
    //       text: constant.COMPANY.INDUSTRY_TYPE.PROJECT_MARKETER,
    //       value: constant.COMPANY.INDUSTRY_TYPE.PROJECT_MARKETER,
    //     },
    //   ],
    //   validation: [h.form.FIELD_VALIDATION.REQUIRED],
    // },

    company_size: {
      field_type: h.form.FIELD_TYPE.SELECT,
      placeholder: 'Enter your company size',
      label: 'Your company size*',
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
    company_website: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'enter your company website',
      label: 'Your company website*',
      class_name: className,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_URL,
      ],
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
      real_estate_type: '',
      company_size: '',
      company_website: '',
      register_method: '',
    };
    // let message;

    query.email = h.cookie.getCookie('registration_email_token');
    query.company_name = fields.company_name.value;
    query.real_estate_type = fields.real_estate_type.value;
    query.company_size = fields.company_size.value;
    query.company_website = fields.company_website.value;
    query.register_method =
      window.localStorage.getItem('register_method') || null;

    setLoading(true);
    const response = await api.auth.registerCompany(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      fields.company_name.value = '';
      setFields(Object.assign({}, fields));
      setTimeout(async () => {
        setLoading(false);
        if (
          h.cmpStr(window.localStorage.getItem('register_method'), 'google')
        ) {
          window.localStorage.removeItem('register_method');
          await router.replace(h.getRoute(routes.google_registration));
        } else {
          window.localStorage.removeItem('register_method');
          await router.replace(h.getRoute(routes.verify_email_registration));
        }
      });
    }
    setLoading(false);
  };
  return (
    <div>
      <Header title="Chaaat | Company Details" showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <div className="signup-page-container">
          <div className="container h-100 pb-5">
            <div className="d-flex h-100 align-items-center p-5 flex-column">
              <img
                src="https://cdn.yourpave.com/assets/chaaat-logo.png"
                alt="Pave"
                style={{ maxWidth: 130, margin: 40 }}
              />
              <div className="col-12 col-md-6 col-lg-5 mx-auto signup-page-form-container">
                <h3 className="-generic-header-text">Register your company</h3>

                <h.form.GenericForm
                  className="text-left"
                  formFields={formFields}
                  formMode={h.form.FORM_MODE.ADD}
                  setLoading={setLoading}
                  fields={fields}
                  setFields={setFields}
                  handleSubmit={handleSubmit}
                  showCancelButton={false}
                  submitButtonLabel="Submit"
                  submitButtonClassName="w-100 login-btn"
                  submitButtonStyle={buttonStyle}
                  buttonWrapperClassName={buttonWrapperClassName}
                  submitButtonVariant="primary3"
                />
              </div>
            </div>
          </div>
        </div>
      </Body>
    </div>
  );
}
