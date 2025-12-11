import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { config } from '../../configs/config';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';

//https://www.npmjs.com/package/react-facebook-login
export default function CommonFacebookSignin(props) {
  const { handleSubmit } = props;

  const buttonStyle = {
    border: 'none',
    background: 'none',
  };

  const onSuccess = (social_payload) => {
    if (handleSubmit)
      handleSubmit(null, constant.USER.AUTH_TYPE.FACEBOOK, social_payload);
  };

  const onFailure = (response) => {
    console.log('Facebook signin failed:', response);
  };

  return (
    <div>
      {!h.cmpStr(config.env, 'production') && (
        <FacebookLogin
          appId={config.facebook.appId}
          autoLoad={false}
          fields="name,first_name,last_name,email,picture"
          callback={onSuccess}
          onFailure={onFailure}
          render={(renderProps) => (
            <button onClick={renderProps.onClick} style={buttonStyle}>
              <img
                src="../../assets/images/facebook_icon.png"
                alt="Pave - Facebook Signin"
                style={{
                  maxWidth: 200,
                  borderRadius: '50%',
                  border: '1px solid rgba(174, 198, 167, 0.5)',
                }}
              />
            </button>
          )}
        />
      )}
    </div>
  );
}
