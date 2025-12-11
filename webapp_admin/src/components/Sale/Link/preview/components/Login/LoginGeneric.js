import React, {useState} from 'react';
import CommonGoogleSignin from '../../components/Common/CommonGoogleSignin';
import LoginForm from '../../components/Login/LoginForm';
import {Header, Body, Footer} from '../../components/Layouts/Layout';
import {h} from '../../helpers';
import CommonFacebookSignin from '../Common/CommonFacebookSignin';

export default function LoginGeneric(props) {
  const {formFields, fields, setFields, handleSubmit} = props;
  const [isLoading, setLoading] = useState();
  // const [fields, setFields] = useState(h.form.initFields(formFields));
  const [userName, setUserName] = useState('John Smith');

  // useEffect(() => {
  //     const errorMessage = h.general.findGetParameter('error_message');
  //     if (h.notEmpty(errorMessage)) {
  //         h.general.alert('error', { message: errorMessage });
  //     }
  //     (async () => {
  //         await h.auth.verifySessionTokenValidity(h.getRoute(routes.dashboard.index));
  //     })();
  // }, []);

  // const handleSubmit = async (e, auth_type, social_payload) => {
  //     if (e) e.preventDefault();
  //     const email = fields.email.value;
  //     const password = fields.password.value;
  //     setLoading(true);
  //     let response = null;
  //     switch (auth_type) {
  //         case constant.USER.AUTH_TYPE.GOOGLE:
  //             response = await api.auth.loginGoogle({ social_payload });
  //             break;
  //         default:
  //         case constant.USER.AUTH_TYPE.EMAIL:
  //             response = await api.auth.loginEmail({ email, password });
  //             fields.email.value = '';
  //             fields.password.value = '';
  //             setFields(Object.assign({}, fields));
  //             break;
  //     }
  //     if (h.cmpStr(response.status, 'ok')) {
  //         const accessToken = response.data.access_token;
  //         h.cookie.setAccessToken(accessToken);
  //         window.location.href = h.getRoute(routes.dashboard.index);
  //     }
  //     setLoading(false);
  // };

  return (
    <div className="login-generic">
      <Header/>
      <Body isLoading={isLoading}>
        <header className="home-video-section">
          <div className="overlay"></div>
          <video
            playsInline="playsinline"
            autoPlay="autoplay"
            muted
            loop="loop"
          >
            <source
              src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/landing-page-video-2.mp4"
              type="video/mp4"
            />
          </video>
          <div className="container h-100">
            <div className="d-flex h-100 align-items-center row">
              <div className="col-12 col-md-6 col-lg-4 mx-auto">
                <h1 className="login-generic-text">Log In</h1>
                <p className="text-color4" style={{fontSize: 16}}>
                  Welcome Back
                </p>
                {/*<p className="login-welcome-user login-generic-text">{userName}!</p>*/}

                <div className="p-2"/>

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

                <div className="row justify-content-center mt-3 login-generic-footer">
                  <div className="col-12 generic-hr-sect">
                    <span className="login-generic-text px-4">
                      or continue with
                    </span>
                  </div>
                  <div className="col-12 text-center mt-3">
                    <div className="d-flex justify-content-center">
                      <CommonGoogleSignin handleSubmit={handleSubmit}/>
                      <CommonFacebookSignin handleSubmit={handleSubmit}/>
                    </div>
                  </div>
                </div>

                <div className="row justify-content-center">
                  <div className="col-8 col-lg-6 col-xl-6"></div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </Body>
      <Footer isLoading={isLoading} setLoading={setLoading}/>
    </div>
  );
}
