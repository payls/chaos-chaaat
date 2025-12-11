import React, { useEffect, useState } from 'react';
import constant from '../../constants/constant.json';
import { useGoogleLogin } from '@react-oauth/google';
import { h } from '../../helpers';
import Axios from 'axios';

export default function CommonGoogleSignin(props) {
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const { handleSubmit } = props;
  const buttonStyle = {
    border: 'none',
    background: 'none',
  };

  useEffect(() => {
    if (h.notEmpty(user)) {
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
        .catch((err) => {
          h.sentry.captureException(err);
          console.log(err);
        });
    }
  }, [user]);

  useEffect(() => {
    if (h.notEmpty(profile)) {
      onSuccess(profile);
    }
  }, [profile]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => {
      h.sentry.captureException(err);
      console.log('Login Failed:', error);
    },
  });

  const onSuccess = (social_payload) => {
    if (handleSubmit)
      handleSubmit(null, constant.USER.AUTH_TYPE.GOOGLE, social_payload);
  };

  return (
    <div>
      <button onClick={login} className={'sign-in-google'}>
        <img
          src="../../assets/images/google_icon.png"
          alt="Chaaat - Google Signin"
          style={{
            borderRadius: '50%',
          }}
        />
        Sign in with Google
        {/*<img*/}
        {/*src="https://cdn.yourpave.com/assets/btn_google_signin_dark_normal_web%402x.png"*/}
        {/*alt="Pave - Google Signin"*/}
        {/*style={{maxWidth: 200}}*/}
        {/*/>*/}
      </button>
    </div>
  );
}
