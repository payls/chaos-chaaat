import React, { useEffect, useState } from 'react';
import { config } from '../../configs/config';
import constant from '../../constants/constant.json';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { h } from '../../helpers';
import Axios from 'axios';

export default function CommonGoogleSignin(props) {
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const { handleSubmit, disabled } = props;

  const buttonStyle = {
    border: 'none',
    background: 'none',
  };

  useEffect(() => {
    if (h.notEmpty(user)) {
      console.log(user);
      Axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json',
          },
        },
      )
        .then((res) => {
          setProfile({ profileObj: res.data, tokenId: user.access_token });
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  useEffect(() => {
    if (h.notEmpty(profile)) {
      console.log(profile);
      onSuccess(profile);
    }
  }, [profile]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error),
  });

  const onSuccess = (social_payload) => {
    if (handleSubmit)
      handleSubmit(null, constant.USER.AUTH_TYPE.GOOGLE, social_payload);
  };

  return (
    <div>
      <button onClick={login} className={'sign-in-google'} disabled={disabled}>
        <img
          src="../../assets/images/google_icon.png"
          alt="Chaaat - Google Signin"
          style={{
            borderRadius: '50%',
          }}
        />
        Sign in with Google
      </button>
    </div>
  );
}
