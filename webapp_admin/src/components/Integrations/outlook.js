import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';

export default function Outlook(props) {
  const {
    connection,
    agencyUserData: agencyUser,
    connectionOwners,
    callbackStatusRefresh,
  } = props;
  const [outlookLoading, setOutlookLoading] = useState(0);
  const [outlookIntegrationStatus, setOutlookIntegrationStatus] = useState({});
  const [disconnectingOutlook, setDisconnectingOutlook] = useState(0);

  useEffect(() => {
    setOutlookIntegrationStatus(connection);
  });

  async function connectToOutlook() {
    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);
    setOutlookLoading(1);

    const integration = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK;
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
            'Outlook integration request failed. Please try again or contact support for further assistance.',
        };
        configWindow.close();
        refreshStatus(configFinished);
      }
      if (e.data.type === 'tray.authpopup.cancel') {
        configFinished = {
          status: false,
          data: {},
          error: 'Outlook integration request was cancelled.',
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
        const isAuthSuccess = await tieAuthToOutlookSolution(
          config.data,
          agency_user.data,
        );
        if (isAuthSuccess) {
          h.general.alert('success', {
            message: 'Microsoft account was connected successfully',
          });
        } else {
          h.general.alert('error', {
            message: 'Microsoft integration failed. Please try Again',
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
          active_integrations.outlook,
          active_integrations.connectionOwners,
        );
        setOutlookLoading(0);
      } else {
        h.general.alert('error', { message: configFinished.error });
        setOutlookLoading(0);
      }
    };

    window.addEventListener('message', onmessage);
    return true;
  }

  async function disconnectOutlook() {
    setDisconnectingOutlook(1);
    let tray_user_solution_source_type =
      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK;
    const disconnectUserFromOutlook =
      await api.integrations.deleteAgencyUserSolutionFromTrayPave(
        {
          agencyUser: { agency_user_id: connectionOwners.outlook },
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
      active_integrations.outlook,
      active_integrations.connectionOwners,
    );
    setDisconnectingOutlook(0);
  }

  async function tieAuthToOutlookSolution(auth, agency_user) {
    let payload = {
      auth,
      agency_user,
      integration: constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK,
    };
    const outlookAuthSuccess = await api.integrations.tieAuthToTrayUserSolution(
      payload,
      false,
    );
    if (outlookAuthSuccess.status) {
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
                className="card-img-top text-center p-2"
                src="../../assets/images/outlook365Logo.png"
                alt="Outlook"
                style={{
                  alignSelf: 'center',
                  width: 80,
                  height: 100,
                  maxWidth: 200,
                }}
              />
              <div className="card-body mt-2">
                <h5 className="card-title">
                  MS Outlook 365 <br /> Integration
                </h5>
                <p className="card-text">
                  Connect Chaaat to your email account allowing all
                  notifications to your leads to be sent from your personal work
                  email address.
                </p>
                {outlookIntegrationStatus ===
                constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING ? (
                  <div>
                    <span className="card-text" style={{ color: 'red' }}>
                      Your previous attempt failed!{' '}
                    </span>
                    <a onClick={() => connectToOutlook()}>
                      <button className="common-button p-2 w-100 mt-2">
                        {outlookLoading ? (
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
                {outlookIntegrationStatus === 'inactive' ? (
                  <a onClick={() => connectToOutlook()}>
                    <button className="common-button p-2 w-100">
                      {outlookLoading ? (
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
                {outlookIntegrationStatus ===
                constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE ? (
                  <div>
                    <a className="mt-5" onClick={() => disconnectOutlook()}>
                      <button className="btn btn-primary p-2 w-100">
                        {disconnectingOutlook ? (
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
