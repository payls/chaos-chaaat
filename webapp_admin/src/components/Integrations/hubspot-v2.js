import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';

import { faUnlink, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function HubSpotV2(props) {
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
    //step 0 - delete listener trigger
    localStorage.setItem('hubspot-integration', null);

    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);
    setHubspotLoading(1);

    const integration = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT;
    const payload = {
      agency_user: agency_user.data,
      integration: integration,
    };
    //Step 2 - Set config_wizard_url to state to render Iframe or open a new tab
    const config_wizard_url =
      await api.integrations.initiateHubspotIntegrationRequest(payload, false);

    //Step 3 - Track the popup and close showing needed message accordingly
    window.open(config_wizard_url.data.url, '_blank');

    const onHubspotIntegrationComplete = (event) => {
      if (
        event.key === constant.DIRECT_INTEGRATION.EVENTS.HUBSPOT_INTEGRATION
      ) {
        const data = JSON.parse(event.newValue);
        const success = data.success;
        if (success) {
          h.general.alert('success', {
            message: 'HubSpot account was connected successfully',
          });

          callbackStatusRefresh(
            constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE,
          );
        } else {
          h.general.alert('error', {
            message: 'HubSpot integration failed. Please try Again',
          });
        }
        localStorage.removeItem(
          constant.DIRECT_INTEGRATION.EVENTS.HUBSPOT_INTEGRATION,
        );
        setHubspotLoading(0);
      }
    };

    window.addEventListener('storage', onHubspotIntegrationComplete);
    return true;
  }

  async function disconnectHubSpot() {
    setDisconnectingHubspot(1);
    if (agencyUser && agencyUser.agency_fk) {
      const apiRes = await api.integrations.deleteHubspotActiveIntegration(
        agencyUser.agency_fk,
        true,
      );

      if (apiRes.status === 'ok') {
        callbackStatusRefresh(
          constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE,
        );
      }
    }
    setDisconnectingHubspot(0);
  }

  const handleHubspotConnection = (event) => {
    console.log(event.target.checked)
    const isChecked = event.target.checked;
    if (isChecked) {
      connectToHubspot()
    } else {
      disconnectHubSpot()
    }
  }
  function isConnected(hubspotIntegrationStatus) {
    if (hubspotIntegrationStatus == constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE) {
      return true
    }

    return false;
  }

  return (
    <div
      class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12">
      <div class="crm_card">
        <div class="card_content">
          <div class="card_icon">
            <div class="card_iconImg_wrapper d-inline-flex">
              <img src="../../assets/images/HubSpot.svg" alt />
            </div>
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
                (hubspotIntegrationStatus == constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE)
                ? <label className="label_gap3">Disconnect</label>
                : (hubspotIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING)
                ? <label className="label_gap3">Try Again</label>
                : (hubspotIntegrationStatus === constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE)
                ? <label className="label_gap3">Connect</label>
                : ''
              }
              {
                !(
                  hubspotIntegrationStatus == constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE
                  || hubspotIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING
                  || hubspotIntegrationStatus === constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE
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
                        id="cb2-4"
                        checked={((hubspotIntegrationStatus == constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE) ? true : false)}
                        type="checkbox" onClick={(event) => { handleHubspotConnection(event) }} />
                      <label
                        class="tgl-btn"
                        for="cb2-4"></label>
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
