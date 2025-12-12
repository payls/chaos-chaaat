import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';

import { faUnlink, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function SalesforceV2(props) {
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

  async function connectToSalesForce(sandbox = false) {
    //Step 1 - Get current agency user
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);
    setSalesForceLoading(1);

    const integration = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE;
    const payload = {
      agency_user: agency_user.data,
      integration: integration,
      sandbox: sandbox,
    };

    //Step 2 - Set config_wizard_url to state to render Iframe or open a new tab
    const config_wizard_url =
      await api.integrations.initiateSalesforceIntegrationRequest(
        payload,
        false,
      );

    //Step 3 - Track the popup and close showing needed message accordingly
    window.open(config_wizard_url.data.url, '_blank');

    const onSalesforceIntegrationComplete = (event) => {
      if (
        event.key === constant.DIRECT_INTEGRATION.EVENTS.SALESFORCE_INTEGRATION
      ) {
        const data = JSON.parse(event.newValue);
        const success = data.success;
        if (success) {
          h.general.alert('success', {
            message: 'Salesforce account was connected successfully',
          });

          callbackStatusRefresh(
            constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE,
          );
        } else {
          h.general.alert('error', {
            message: 'Salesforce integration failed. Please try Again',
          });
        }
        localStorage.setItem('sf_sandbox_mode', sandbox);
        localStorage.removeItem(
          constant.DIRECT_INTEGRATION.EVENTS.SALESFORCE_INTEGRATION,
        );
        setSalesForceLoading(0);
      }
    };

    window.addEventListener('storage', onSalesforceIntegrationComplete);
    return true;
  }

  async function disconnectSalesForce() {
    setDisconnectingSalesForce(1);
    if (agencyUser && agencyUser.agency_fk) {
      localStorage.removeItem('sf_sandbox_mode');
      const apiRes = await api.integrations.deleteSalesforceActiveIntegration(
        agencyUser.agency_fk,
        true,
      );

      if (apiRes.status === 'ok') {
        callbackStatusRefresh(
          constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE,
        );
      }
    }
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

  const handleSalesforceConnection = (event, sandBox = false) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      connectToSalesForce(sandBox)
    } else {
      disconnectSalesForce()
    }
  }

  return (
    <>
      <div
        class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12">
        <div class="crm_card">
          <div class="card_content">
            <div class="card_icon">
              <div class="card_iconImg_wrapper d-inline-flex">
                <img src="../../assets/images/salesforce.svg" alt />
              </div>
            </div>
            <h4
              class="mb-1 px-lg-1 px-md-1 mt-3">Salesforce</h4>
            <p
              class="m-0 px-lg-1 px-md-1">Connect
              Chaaat to Salesforce
              allowing for
              contacts to be synced and
              activity tracked
              back to Salesforce</p>
          </div>
          <hr class="my-3" />
          <div class="card_content">
            <div
              class="px-lg-1 px-md-1 d-flex align-items-center justify-content-between gap-2">
              {
                (salesForceIntegrationStatus === 'inactive')
                  ?
                  <>
                    <div class="d-flex align-items-center gap-3">
                      <label>Connect</label>
                      {
                        (disconnectingSalesForce || salesForceLoading)
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
                                  id="cb2-9"
                                  checked={((salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE) ? true : false)}
                                  type="checkbox" onClick={(event) => { handleSalesforceConnection(event) }} />
                                <label
                                  class="tgl-btn"
                                  for="cb2-9"></label>
                              </div>
                            </div>
                          </div>
                      }
                    </div>
                    <div class="d-flex align-items-center gap-3">
                      <label class="text-right">Sandbox Connect</label>
                      {
                        (disconnectingSalesForce || salesForceLoading)
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
                                  id="cb2-8"
                                  checked={((salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE) ? true : false)}
                                  type="checkbox" onClick={(event) => { handleSalesforceConnection(event, true) }} />
                                <label
                                  class="tgl-btn"
                                  for="cb2-8"></label>
                              </div>
                            </div>
                          </div>
                      }
                    </div>
                  </>
                  : ''
              }
              <div class="d-flex align-items-center gap-3">
                {
                  (salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE)
                    ? <label className="label_gap3">Disconnect</label>
                    : (salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING)
                      ? <label className="label_gap3">Try Again</label>
                      : ''
                }
                {
                  !(salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE
                    || salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.PENDING
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
                              id="cb2-10"
                              checked={((salesForceIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE) ? true : false)}
                              type="checkbox" onClick={(event) => { handleSalesforceConnection(event) }} />
                            <label
                              class="tgl-btn"
                              for="cb2-10"></label>
                          </div>
                        </div>
                      </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
