import React from 'react';
import { useGoogleLogin } from 'react-google-login';
import { config } from '../../configs/config';
import constant from '../../constants/constant.json';

export default function CommonGoogleSignin(props) {
  const { handleSubmit } = props;

  const buttonStyle = {
    border: 'none',
    background: 'none',
  };

  const onSuccess = (social_payload) => {
    if (handleSubmit)
      handleSubmit(null, constant.USER.AUTH_TYPE.GOOGLE, social_payload);
  };

  const onFailure = (response) => {
    console.log('Google signin failed:', response);
  };

  const { signIn } = useGoogleLogin({
    onSuccess,
    onFailure,
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENTID,
    isSignedIn: false,
    accessType: 'offline',
  });

  return (
    <div>
      <button onClick={signIn} style={buttonStyle}>
        <img
          src="../../assets/images/google_icon.png"
          alt="Chaaat - Google Signin"
          style={{
            maxWidth: 200,
            borderRadius: '50%',
            border: '1px solid rgba(174, 198, 167, 0.5)',
          }}
        />
        {/*<img*/}
        {/*src="https://cdn.yourpave.com/assets/btn_google_signin_dark_normal_web%402x.png"*/}
        {/*alt="Pave - Google Signin"*/}
        {/*style={{maxWidth: 200}}*/}
        {/*/>*/}
      </button>
    </div>
  );
}
