import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';
import IconSetting from '../Icons/IconSetting';

export default function HubSpot(props) {
  const {
    connection,
    agencyUserData: agencyUser,
    connectionOwners,
    callbackStatusRefresh,
  } = props;
  const [hubspotLoading, setHubspotLoading] = useState(0);
  const [hubspotIntegrationStatus, setHubspotIntegrationStatus] = useState({});
  const [disconnectingHubspot, setDisconnectingHubspot] = useState(0);

  useEffect(() => {
    setHubspotIntegrationStatus(connection);
  });

  async function connectToHubspot() {
    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);
    setHubspotLoading(1);

    const integration = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT;
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
      if (e.data.type === constant.TRAY.AUTH_POPUP_TYPE.ERROR) {
        // Handle popup error message
        configFinished = {
          status: false,
          data: {},
          error:
            'HubSpot integration request failed. Please try again or contact support for further assistance.',
        };
        configWindow.close();
        refreshStatus(configFinished);
      }
      if (e.data.type === constant.TRAY.AUTH_POPUP_TYPE.CANCEL) {
        configFinished = {
          status: false,
          data: {},
          error: 'HubSpot integration request was cancelled.',
        };
        configWindow.close();
        refreshStatus(configFinished);
      }
      if (e.data.type === constant.TRAY.AUTH_POPUP_TYPE.FINISH) {
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
        const isAuthSuccess = await tieAuthToHubSpotSolution(
          config.data,
          agency_user.data,
        );
        if (isAuthSuccess) {
          h.general.alert('success', {
            message: 'HubSpot account was connected successfully',
          });
        } else {
          h.general.alert('error', {
            message: 'HubSpot integration failed. Please try Again',
          });
        }

        let agencyUserTrayActiveSolutions =
          await api.integrations.getAgencyUserActiveIntegrations(
            null,
            agencyUser,
            false,
          );
        const { active_integrations = {} } = agencyUserTrayActiveSolutions.data;
        callbackStatusRefresh(
          active_integrations.hubspot,
          active_integrations.connectionOwners,
        );
        setHubspotLoading(0);
      } else {
        h.general.alert('error', { message: configFinished.error });
        setHubspotLoading(0);
      }
    };

    window.addEventListener('message', onmessage);
    return true;
  }

  async function disconnectHubSpot() {
    setDisconnectingHubspot(1);
    let tray_user_solution_source_type =
      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT;
    const disconnectUserFromHubSpot =
      await api.integrations.deleteAgencyUserSolutionFromTrayPave(
        {
          agencyUser: { agency_user_id: connectionOwners.hubspot },
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
      active_integrations.hubspot,
      active_integrations.connectionOwners,
    );
    setDisconnectingHubspot(0);
  }

  async function tieAuthToHubSpotSolution(auth, agency_user) {
    let payload = {
      auth,
      agency_user,
      integration: constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT,
    };
    const hubSpotAuthSuccess = await api.integrations.tieAuthToTrayUserSolution(
      payload,
      false,
    );
    if (hubSpotAuthSuccess.status) {
      return true;
    } else {
      return false;
    }
  }

  async function initiateHubSpotFullSync() {
    h.general.alert('success', { message: 'Starting HubSpot full sync' });

    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);

    //Step 2 - Set config_wizard_url to state to render Iframe or open a new tab
    const hubSpotFullSync = await api.integrations.initiateHubspotFullSync(
      { agencyUser: { agency_user_id: connectionOwners.hubspot } },
      false,
    );
  }

  const handleHubspotConnection = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      connectToHubspot()
    } else {
      disconnectHubSpot()
    }
  }

  return (
    <div
      class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12">
      <div class="crm_card">
        <div class="card_content">
          <div class="card_icon">
            <img
              src="../../assets/images/HubSpot.svg"
              alt />
          </div>
          <h4
            class="mb-1 px-lg-1 px-md-1 mt-3">HubSpot</h4>
          <p
            class="m-0 px-lg-1 px-md-1">Connect
            Chaaat to
            HubSpot
            allowing for
            contacts to be synced and
            activity tracked
            back to HubSpot.</p>
        </div>
        <hr class="my-3" />
        <div class="card_content">
          <div
            class="px-lg-1 px-md-1 d-flex align-items-center justify-content-between gap-2 float-content-right">
            <div class="d-flex align-items-center gap-3">
              {
                (hubspotIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE)
                ? <label className="label_gap3">Disconnect</label>
                : (hubspotIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING)
                ? <label className="label_gap3">Try Again</label>
                : (hubspotIntegrationStatus === 'inactive')
                ? <label className="label_gap3">Connect</label>
                : ''
              }
              {
                !(
                  hubspotIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE
                  || hubspotIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING
                  || hubspotIntegrationStatus === 'inactive'
                )
                ? ''
                : (disconnectingHubspot || hubspotLoading)
                ?
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                :
                <div
                  class="checkboxOuter">
                  <div
                    class="checkboxInner">
                    <div
                      class="checkbox">
                      <input
                        class="tgl tgl-ios"
                        id="cb2-5"
                        checked={((hubspotIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE) ? true : false)}
                        type="checkbox" onClick={(event) => { handleHubspotConnection(event) }} />
                      <label
                        class="tgl-btn"
                        for="cb2-5"></label>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
