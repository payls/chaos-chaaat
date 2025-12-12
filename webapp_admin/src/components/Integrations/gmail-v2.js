import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';
import { useRouter } from 'next/router';
// import GoogleLogin from 'react-google-login';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

const SCOPES = ['https://mail.google.com/'];

export default function GmailV2(props) {
  const router = useRouter();

  const { agencyUserData: agencyUser } = props;
  const [gmailLoading, setGmailLoading] = useState(true);
  const [gmailIntegrationStatus, setGmailIntegrationStatus] = useState({});

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onSuccess(tokenResponse),
    scope: SCOPES.join(' '),
    flow: 'auth-code',
  });

  useEffect(() => {
    if (agencyUser?.agency_user_id) {
      (async () => {
        await checkIntegration();
      })();
    }
  }, [agencyUser]);

  /**
   * Check user if gmail integrated
   */
  const checkIntegration = async () => {
    setGmailLoading(true);

    const activeIntegrationResponse =
      await api.integrations.getGMailActiveIntegration(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        false,
      );

    if (h.cmpStr(activeIntegrationResponse.status, 'ok')) {
      if (h.notEmpty(activeIntegrationResponse.data.agency_oauth)) {
        setGmailIntegrationStatus(activeIntegrationResponse.data.agency_oauth);
      } else {
        setGmailIntegrationStatus(null);
      }
    }
    setGmailLoading(false);
  };

  /**
   * Save authentication code upon login sucess on gmail
   * @param {*} data
   */
  const onSuccess = async (data) => {
    setGmailLoading(true);
    const response = await api.integrations.saveGmailCode(
      { ...data, agency_user_fk: agencyUser.agency_user_id },
      false,
    );
    if (h.cmpStr(response.status, 'ok') && response.data) {
      h.general.alert('success', {
        message: 'Gmail account was connected successfully',
      });
      await checkIntegration();
    }
  };

  /**
   * disconnect gmail integration
   */
  const disconnectGMail = async () => {
    setGmailLoading(true);

    const disconnectIntegrationResponse =
      await api.integrations.getGMailDisconnectIntegration(
        {
          agency_user_fk: agencyUser.agency_user_id,
        },
        false,
      );
    if (h.cmpStr(disconnectIntegrationResponse.status, 'ok')) {
      h.general.alert('success', {
        message: 'Successfully disconnected from integration',
      });
      await checkIntegration();
    }
  };

  /**
   * failed gmail integration
   */
  const onFailure = async () => {
    setGmailLoading(false);

    h.general.alert('error', {
      message: 'Oops! It looks like the integration encountered an issue.',
    });
  };

  return (
    <div>
      <div className="align-items-center">
        <div className="row justify-content-center align-items-center p-3">
          <div className="card-deck mx-auto">
            <div className="card text-center" style={{ width: '15rem' }}>
              <img
                className="card-img-top text-center p-3"
                src="../../assets/images/gmailLogo.png"
                alt="Gmail"
                style={{
                  alignSelf: 'center',
                  width: 100,
                  height: 100,
                  maxWidth: 200,
                }}
              />
              <div className="card-body mt-2">
                <h5 className="card-title">
                  Gmail
                  <br />
                  Integration
                </h5>
                <p className="card-text">
                  Connect Chaaat to your email account allowing all
                  notifications to your leads to be sent from your own person
                  work email address.
                </p>
                {!h.notEmpty(gmailIntegrationStatus) && !gmailLoading && (
                  <button className="common-button p-2 w-100" onClick={login}>
                    <span>Sign in with Google</span>
                  </button>

                  // <GoogleLogin
                  //   onSuccess={(credentialResponse) => {
                  //     console.log(credentialResponse);
                  //   }}
                  //   onError={() => {
                  //     console.log('Login Failed');
                  //   }}
                  // />
                  // <GoogleLogin
                  //   scope={SCOPES.join(' ')}
                  //   prompt="consent"
                  //   // // accessType="offline"
                  //   responseType="code"
                  //   clientId={config.gmail.web.client_id}
                  //   onSuccess={onSuccess}
                  //   onFailure={onFailure}
                  //   onRequest={() => {
                  //     setGmailLoading(true);
                  //   }}
                  //   cookiePolicy={'single_host_origin'}
                  //   // render={(renderProps) => (
                  //   //   <button
                  //   //     className="common-button p-2 w-100"
                  //   //     onClick={renderProps.onClick}
                  //   //   >
                  //   //     <span>Connect</span>
                  //   //   </button>
                  //   // )}
                  //   buttonText="Connect with Google"
                  //   theme="dark"
                  // />
                )}

                {h.notEmpty(gmailIntegrationStatus) && !gmailLoading && (
                  <div>
                    <a onClick={() => disconnectGMail()}>
                      <button className="btn btn-primary p-2 w-100 mt-2">
                        <span>DISCONNECT</span>
                      </button>
                    </a>
                  </div>
                )}

                {gmailLoading && (
                  <div>
                    <button className="common-button p-2 w-100">
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
