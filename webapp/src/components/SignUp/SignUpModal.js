import React, { useState, useEffect } from 'react';
import SignUpForm from '../../components/SignUp/SignUpForm';
import { api } from '../../api';
import { Modal } from 'react-bootstrap';
import { h } from '../../helpers';
import IconBlackCross from '../Icons/IconBlackCross';

import NoRegistredSimpleEmailSignUp from './ModalSteps/NoRegistredSimpleEmailSignUp';
import NoRegistredGoogleSignUp from './ModalSteps/NoRegistredGoogleSignUp';
import RegistredGoogleLogin from './ModalSteps/RegistredGoogleLogin';
import RegistredSimpleEmailLogin from './ModalSteps/RegistredSimpleEmailLogin';

export default function SignUpModal(props) {
  const [isLoading, setLoading] = useState();
  const [show, setShow] = useState(true);
  const [activeStep, setActiveStep] = useState('default');

  const className = 'col-12 signup-generic-input';

  const formFields = {
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'example@gmail.com',
      label: 'Your Email',
      class_name: className,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    const errorMessage = h.general.findGetParameter('error_message');
    if (h.notEmpty(errorMessage)) {
      h.general.alert('error', { message: errorMessage });
    }
  }, []);

  const handleClose = () => setShow(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const email = fields.email.value;

    setLoading(true);

    const apiResponse = await api.auth.checkUserEmail({ email }, false);

    // mock if user is registred or not
    const isRegistredEmail = true;

    if (!isRegistredEmail) {
      if (apiResponse.data.is_google_email) {
        // render to google sign up
        setActiveStep('not-registred-google-signup');
      } else {
        // render to simple email sign up
        setActiveStep('not-registred-simple-email-signup');
      }
    } else {
      if (apiResponse.data.is_google_email) {
        // render to google login
        setActiveStep('registred-google-login');
      } else {
        // render to simple email login
        setActiveStep('registred-simple-email-login');
      }
    }

    setLoading(false);
  };

  return (
    <div>
      <Modal show={show} onHide={handleClose} className="signup-modal">
        <Modal.Body className="pt-0">
          <div className="col-12 pt-3 d-flex justify-content-end">
            <IconBlackCross onClick={handleClose} />
          </div>
          {activeStep === 'default' && (
            <div className="row justify-content-center">
              <div className="col-10 pt-5">
                <h1 className="signup-generic-header-text">Sign Up</h1>
                <p
                  className="signup-generic-header-text"
                  style={{ fontSize: 16 }}
                >
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
                  submitButtonLabel="Continue"
                  submitButtonClassName="w-100 mt-3"
                ></SignUpForm>
              </div>
            </div>
          )}

          {activeStep === 'not-registred-google-signup' && (
            <NoRegistredGoogleSignUp email={fields.email.value} />
          )}

          {activeStep === 'not-registred-simple-email-signup' && (
            <NoRegistredSimpleEmailSignUp email={fields.email.value} />
          )}

          {activeStep === 'registred-google-login' && (
            <RegistredGoogleLogin
              onSuccessfullyLogin={props.onSuccessfullyLogin}
            />
          )}

          {activeStep === 'registred-simple-email-login' && (
            <RegistredSimpleEmailLogin
              onSuccessfullyLogin={props.onSuccessfullyLogin}
              email={fields.email.value}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
