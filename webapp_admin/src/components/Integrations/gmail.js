import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';

export default function Gmail(props) {
  const {
    connection,
    agencyUserData: agencyUser,
    connectionOwners,
    callbackStatusRefresh,
  } = props;
  const [gmailLoading, setGmailLoading] = useState(0);
  const [gmailIntegrationStatus, setGmailIntegrationStatus] = useState({});
  const [disconnectingGmail, setDisconnectingGmail] = useState(0);

  useEffect(() => {
    setGmailIntegrationStatus(connection);
  });

  async function connectToGmail() {
    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);
    setGmailLoading(1);

    const integration = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL;
    const payload = {
      agency_user: agency_user.data,
      integration: integration,
    };

    //Step 2 - Set config_wizard_url to state to render Iframe or open a new tab
    const config_wizard_url = await api.integrations.initiateIntegrationRequest(
      payload,
      false,
    );

    //Step 3 - Track the popup and close showing needed message accordingly
    const configWindow = window.open(config_wizard_url.data.url, '_blank');
    let configFinished = { status: false, data: {}, error: {} };

    const onmessage = (e) => {
      if (e.data.type === 'tray.authpopup.error') {
        // Handle popup error message
        configFinished = {
          status: false,
          data: {},
          error:
            'Gmail integration request failed. Please try again or contact support for further assistance.',
        };
        configWindow.close();
        refreshStatus(configFinished);
      }
      if (e.data.type === 'tray.authpopup.cancel') {
        configFinished = {
          status: false,
          data: {},
          error: 'Gmail integration request was cancelled.',
        };
        configWindow.close();
        refreshStatus(configFinished);
      }
      if (e.data.type === 'tray.authpopup.finish') {
        // Handle popup finish message
        configFinished = {
          status: true,
          data: e.data,
          successMessage:
            'Almost done. Please wait while we verify additional things',
          show: false,
        };
        configWindow.close();
        refreshStatus(configFinished);
      }
    };

    const refreshStatus = async (config) => {
      if (config.status) {
        if (config.show) {
          h.general.alert('success', { message: config.successMessage });
        }
        const isAuthSuccess = await tieAuthToGmailSolution(
          config.data,
          agency_user.data,
        );
        if (isAuthSuccess) {
          h.general.alert('success', {
            message: 'Gmail account was connected successfully',
          });
        } else {
          h.general.alert('error', {
            message: 'Gmail integration failed. Please try Again',
          });
        }

        let agencyUserTrayActiveSolutions =
          await api.integrations.getAgencyUserActiveIntegrations(
            null,
            agencyUser,
            false,
          );
        const { active_integrations } = agencyUserTrayActiveSolutions.data;
        callbackStatusRefresh(
          active_integrations.gmail,
          active_integrations.connectionOwners,
        );
        setGmailLoading(0);
      } else {
        h.general.alert('error', { message: configFinished.error });
        setGmailLoading(0);
      }
    };

    window.addEventListener('message', onmessage);
    return true;
  }

  async function disconnectGmail() {
    setDisconnectingGmail(1);
    let tray_user_solution_source_type =
      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL;
    const disconnectUserFromGmail =
      await api.integrations.deleteAgencyUserGmailSolutionFromTrayPave(
        {
          agencyUser: { agency_user_id: connectionOwners.gmail },
          tray_user_solution_source_type,
        },
        true,
      );
    let agencyUserTrayActiveSolutions =
      await api.integrations.getAgencyUserActiveIntegrations(
        null,
        agencyUser,
        false,
      );
    const { active_integrations } = agencyUserTrayActiveSolutions.data;
    callbackStatusRefresh(
      active_integrations.gmail,
      active_integrations.connectionOwners,
    );
    setDisconnectingGmail(0);
  }

  async function tieAuthToGmailSolution(auth, agency_user) {
    let payload = {
      auth,
      agency_user,
      integration: constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL,
    };
    const gmailAuthSuccess = await api.integrations.tieAuthToTrayUserSolution(
      payload,
      false,
    );
    if (gmailAuthSuccess.status) {
      return true;
    } else {
      return false;
    }
  }

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
                  Gmail <br />
                  Integration
                </h5>
                <p className="card-text">
                  Connect Chaaat to your email account allowing all
                  notifications to your leads to be sent from your own person
                  work email address.
                </p>
                {gmailIntegrationStatus ===
                constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING ? (
                  <div>
                    <span className="card-text" style={{ color: 'red' }}>
                      Your previous attempt failed!{' '}
                    </span>
                    <a onClick={() => connectToGmail()}>
                      <button className="common-button p-2 w-100 mt-2">
                        {gmailLoading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : (
                          <span>Try Again</span>
                        )}
                      </button>
                    </a>
                  </div>
                ) : (
                  ''
                )}
                {gmailIntegrationStatus === 'inactive' ? (
                  <a onClick={() => connectToGmail()}>
                    <button className="common-button p-2 w-100">
                      {gmailLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </a>
                ) : (
                  ''
                )}
                {gmailIntegrationStatus ===
                constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE ? (
                  <div>
                    <a className="mt-5" onClick={() => disconnectGmail()}>
                      <button className="btn btn-primary p-2 w-100">
                        {disconnectingGmail ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : (
                          <span>DISCONNECT</span>
                        )}
                      </button>
                    </a>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
