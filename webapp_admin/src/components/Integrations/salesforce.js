import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';

export default function Salesforce(props) {
  const {
    connection,
    agencyUserData: agencyUser,
    connectionOwners,
    callbackStatusRefresh,
  } = props;
  const [salesForceLoading, setSalesForceLoading] = useState(0);
  const [disconnectingSalesForce, setDisconnectingSalesForce] = useState(0);
  const [salesForceIntegrationStatus, setSalesForceIntegrationStatus] =
    useState({});

  useEffect(() => {
    setSalesForceIntegrationStatus(connection);
  });

  async function connectToSalesForce() {
    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);
    setSalesForceLoading(1);

    const integration = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE;
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
            'Salesforce integration request failed. Please try again or contact support for further assistance.',
        };
        configWindow.close();
        refreshStatus(configFinished);
      }
      if (e.data.type === 'tray.authpopup.cancel') {
        configFinished = {
          status: false,
          data: {},
          error: 'Salesforce integration request was cancelled.',
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
        const isAuthSuccess = await tieAuthToSalesForceSolution(
          config.data,
          agency_user.data,
        );
        if (isAuthSuccess) {
          h.general.alert('success', {
            message: 'Salesforce account was connected successfully',
          });
        } else {
          h.general.alert('error', {
            message: 'Salesforce integration failed. Please try Again',
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
          active_integrations.salesforce,
          active_integrations.connectionOwners,
        );
        setSalesForceLoading(0);
      } else {
        h.general.alert('error', { message: configFinished.error });
        setSalesForceLoading(0);
      }
    };

    window.addEventListener('message', onmessage);
    return true;
  }

  async function tieAuthToSalesForceSolution(auth, agency_user) {
    let payload = {
      auth,
      agency_user,
      integration: constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE,
    };
    const salesForceAuthSuccess =
      await api.integrations.tieAuthToTrayUserSolution(payload, false);
    if (salesForceAuthSuccess.status) {
      return true;
    } else {
      return false;
    }
  }

  async function disconnectSalesForce() {
    setDisconnectingSalesForce(1);
    let tray_user_solution_source_type =
      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE;
    const disconnectUserFromSalesForce =
      await api.integrations.deleteAgencyUserSolutionFromTrayPave(
        {
          agencyUser: { agency_user_id: connectionOwners.salesforce },
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
      active_integrations.salesforce,
      active_integrations.connectionOwners,
    );
    setDisconnectingSalesForce(0);
  }

  async function initiateSalesforceFullSync() {
    h.general.alert('success', { message: 'Starting Salesforce full sync' });

    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);

    //Step 2 - Set config_wizard_url to state to render Iframe or open a new tab
    const salesforceFullSync =
      await api.integrations.initiateSalesforceFullSync(
        { agencyUser: { agency_user_id: connectionOwners.salesforce } },
        false,
      );
  }

  const handleSalesforceConnection = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      connectToSalesForce()
    } else {
      disconnectSalesForce()
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
            class="px-lg-1 px-md-1 d-flex align-items-center justify-content-end gap-2">
            <div class="d-flex align-items-center gap-3">
              {
                (salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE)
                ? <label className="label_gap3">Disconnect</label>
                : (salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING)
                ? <label className="label_gap3">Try Again</label>
                : (salesForceIntegrationStatus === 'inactive')
                ? <label className="label_gap3">Connect</label>
                : ''
              }
              {
                  !(
                    salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE
                    || salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING
                  || salesForceIntegrationStatus === 'inactive'
                )
                ? ''
                : (disconnectingSalesForce || salesForceLoading)
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
                        id="cb2-7"
                        checked={((salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE) ? true : false)}
                        type="checkbox" onClick={(event) => { handleSalesforceConnection(event) }} />
                      <label
                        class="tgl-btn"
                        for="cb2-7"></label>
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
