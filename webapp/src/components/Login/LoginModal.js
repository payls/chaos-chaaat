import React, { useState, useEffect } from 'react';
import CommonGoogleSignin from '../../components/Common/CommonGoogleSignin';
import LoginForm from './LoginForm';
import { routes } from '../../configs/routes';
import { api } from '../../api';
import { Modal } from 'react-bootstrap';
import { h } from '../../helpers';
import IconBlackCross from '../Icons/IconBlackCross';
import CommonFacebookSignin from '../Common/CommonFacebookSignin';
import constant from '../../constants/constant.json';

export default function LoginModal(props) {
  const { formFields } = props;
  const [fields, setFields] = useState(h.form.initFields(formFields));
  const [isLoading, setLoading] = useState();
  const [show, setShow] = useState(true);
  const [userName, setUserName] = useState('John Smith');

  useEffect(() => {
    const errorMessage = h.general.findGetParameter('error_message');
    if (h.notEmpty(errorMessage)) {
      h.general.alert('error', { message: errorMessage });
    }
    (async () => {
      await h.auth.verifySessionTokenValidity(
        h.getRoute(routes.dashboard.index),
      );
    })();
  }, []);

  const handleClose = () => setShow(false);

  const handleSubmit = async (e, auth_type, social_payload) => {
    if (e) e.preventDefault();
    const email = fields.email.value;
    const password = fields.password.value;
    setLoading(true);
    let response = null;
    switch (auth_type) {
      case constant.USER.AUTH_TYPE.GOOGLE:
        response = await api.auth.loginGoogle({ social_payload });
        break;
      default:
      case constant.USER.AUTH_TYPE.EMAIL:
        response = await api.auth.loginEmail({ email, password });
        fields.email.value = '';
        fields.password.value = '';
        setFields(Object.assign({}, fields));
        break;
    }
    if (h.cmpStr(response.status, 'ok')) {
      const accessToken = response.data.access_token;
      h.cookie.setAccessToken(accessToken);
      window.location.href = h.getRoute(routes.dashboard.index);
    }
    setLoading(false);
  };

  return (
    <div>
      <Modal show={show} onHide={handleClose} className="login-modal">
        <Modal.Body className="pt-0">
          <div className="row justify-content-center">
            <div className="col-12 pt-3 d-flex justify-content-end">
              <IconBlackCross onClick={handleClose} />
            </div>
            <div className="col-10 pt-5">
              <h1 className="login-generic-header-text">Log In</h1>
              <p className="login-generic-header-text" style={{ fontSize: 16 }}>
                Welcome Back
              </p>
              {/*<p className="login-welcome-user">{userName}!</p>*/}

              <LoginForm
                className="text-left"
                formFields={formFields}
                formMode={h.form.FORM_MODE.ADD}
                setLoading={setLoading}
                fields={fields}
                setFields={setFields}
                showCancelButton={false}
                handleSubmit={handleSubmit}
                submitButtonLabel="Log In"
                submitButtonClassName="w-100 mt-3"
              ></LoginForm>

              <div className="row no-gutters justify-content-center mt-3 login-generic-footer">
                <div className="col-12 form-generic-continue-login">
                  <span>or continue with</span>
                </div>
                <div className="col-12 text-center mt-3">
                  <div className="d-flex justify-content-center">
                    <CommonGoogleSignin handleSubmit={handleSubmit} />
                    <CommonFacebookSignin handleSubmit={handleSubmit} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
