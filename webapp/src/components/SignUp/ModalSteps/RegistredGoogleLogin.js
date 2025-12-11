import React, { useState, useEffect } from 'react';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import { h } from '../../../helpers';
import CommonGoogleSignin from '../../Common/CommonGoogleSignin';

export default function RegistredGoogleLogin(props) {
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    const errorMessage = h.general.findGetParameter('error_message');
    if (h.notEmpty(errorMessage)) {
      h.general.alert('error', { message: errorMessage });
    }
  }, []);

  const handleSubmit = async (e, auth_type, social_payload) => {
    if (e) e.preventDefault();

    setLoading(true);

    const response = await api.auth.loginGoogle({ social_payload }, false);

    if (h.cmpStr(response.status, 'ok')) {
      const accessToken = response.data.access_token;
      h.cookie.setAccessToken(accessToken);
      props.onSuccessfullyLogin();
    }

    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-10 pt-5">
        <h1 className="signup-generic-header-text">Log In</h1>
        <CommonGoogleSignin handleSubmit={handleSubmit} />
      </div>
    </div>
  );
}
