import React, {useState, useEffect} from 'react';
import CommonGoogleSignin from '../../components/Common/CommonGoogleSignin';
import SignUpForm from '../../components/SignUp/SignUpForm';
import {Header, Body, Footer} from '../../components/Layouts/Layout';
import {routes} from '../../configs/routes';
import {h} from '../../helpers';
import Link from 'next/dist/client/link';
import CommonFacebookSignin from '../Common/CommonFacebookSignin';

export default function SignUpGeneric(props) {
  const {formFields, fields, setFields, handleSubmit} = props;
  const [isLoading, setLoading] = useState();
  // const [fields, setFields] = useState(h.form.initFields(formFields));
  //
  // const handleSubmit = async (e, auth_type, social_payload) => {
  //     if (e) e.preventDefault();
  //     const email = fields.email.value;
  //     const password = fields.password.value;
  //     setLoading(true);
  //     let response = null;
  //     switch (auth_type) {
  //         // case constant.USER.AUTH_TYPE.GOOGLE:
  //         //     response = await api.auth.loginGoogle({ social_payload });
  //         //     break;
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
    <div className="signup-generic">
      <Header/>
      <Body isLoading={isLoading}>
        <header className="home-video-section">
          <div className="overlay"></div>
          <video
            playsinline="playsinline"
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
                <h3 className="signup-generic-text">Sign Up</h3>
                <p className="text-color4" style={{fontSize: 16}}>
                  Don't have an account?
                </p>

                <div className="p-2"/>

                <SignUpForm
                  className="text-left"
                  formFields={formFields}
                  formMode={h.form.FORM_MODE.ADD}
                  setLoading={setLoading}
                  fields={fields}
                  setFields={setFields}
                  handleSubmit={handleSubmit}
                  showCancelButton={false}
                  submitButtonLabel="Sign Up"
                  submitButtonClassName="w-100 mt-0"
                  // submitButtonBeforeContent={<div className="row justify-content-center signup-redirect">
                  //     <div className='col-12 text-center'>
                  //         <p className="mt-3 mb-1 signup-generic-text">Already have an account?</p><br/>
                  //         <Link href={h.getRoute(routes.login)}>Log in</Link>
                  //     </div>
                  // </div>}
                ></SignUpForm>

                <div className="row justify-content-center signup-redirect">
                  <div className="col-12 text-center">
                    <p
                      className="mt-3 pb-0 mb-0 signup-generic-text"
                      style={{fontSize: 12}}
                    >
                      Already have an account?
                    </p>
                    <br/>
                    <Link
                      style={{fontSize: 12}}
                      href={h.getRoute(routes.login)}
                    >
                      Log in
                    </Link>
                  </div>
                </div>

                <div className="row justify-content-center mt-3 signup-generic-footer">
                  <div className="col-12 generic-hr-sect">
                    <span className="signup-generic-text">
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
              </div>
            </div>
          </div>
        </header>
      </Body>
      <Footer isLoading={isLoading} setLoading={setLoading}/>
    </div>
  );
}
