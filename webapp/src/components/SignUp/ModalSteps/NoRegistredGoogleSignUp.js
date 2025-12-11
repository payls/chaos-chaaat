import React, { useState, useEffect } from 'react';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import { h } from '../../../helpers';
import CommonGoogleSignin from '../../Common/CommonGoogleSignin';
import { useRouter } from 'next/router';
import constant from '../../../constants/constant.json';

export default function NoRegistredGoogleSignUp(props) {
  const { email } = props;

  const router = useRouter();
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    const errorMessage = h.general.findGetParameter('error_message');
    if (h.notEmpty(errorMessage)) {
      h.general.alert('error', { message: errorMessage });
    }
  }, []);

  const handleSubmit = async (e, auth_type, social_payload) => {
    if (e) e.preventDefault();

    let query = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      auth_type,
      social_payload,
      buyer_type: h.general.findGetParameter('buyer_type'),
    };

    const { first_name, last_name, email } =
      h.user.parseGoogleSigninPayload(social_payload);
    query.auth_type = constant.USER.AUTH_TYPE.GOOGLE;
    query.first_name = first_name;
    query.last_name = last_name;
    query.email = email;
    const message =
      'Thank you for signing up. Please wait while we sign you in.';

    setLoading(true);

    const response = await api.auth.register(query, false);
    if (response && h.cmpStr(response.status, 'ok')) {
      h.general.alert('success', { message });

      const access_token = response.data.access_token;
      if (access_token) h.cookie.setAccessToken(access_token);

      setTimeout(async () => {
        setLoading(false);

        await router.replace(h.getRoute(routes.dashboard.index));
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-10 pt-5">
        <h1 className="signup-generic-header-text">Sign Up</h1>
        <p className="signup-generic-header-text" style={{ fontSize: 16 }}>
          Don't have an account?
        </p>
        <span>{email.value}</span>
        <CommonGoogleSignin handleSubmit={handleSubmit} />
      </div>
    </div>
  );
}
