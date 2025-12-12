import React, { useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';

export default function MindBody(props) {
  const router = useRouter();

  const {
    connection,
    agencyUserData: agencyUser,
    connectionOwners,
    callbackStatusRefresh,
    integrationStatus,
    pending,
  } = props;
  const [hubspotLoading, setHubspotLoading] = useState(0);
  const [hubspotIntegrationStatus, setHubspotIntegrationStatus] = useState({});
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);

  async function disconnect() {
    const { agency_fk, agency_user_id } = agencyUser;

    const disconnectRes = await api.integrations.disconnectToMindBody({
      agencyId: agency_fk,
      agencyUserId: agency_user_id,
    });

    if (h.general.cmpStr(disconnectRes.status, 'ok')) {
      h.general.alert('success', {
        message: 'Successfully disconnected to MindBody',
        autoCloseInSecs: 2,
      });
      callbackStatusRefresh(false);
    } else {
      h.general.alert('error', {
        message: 'Failed to disconnect to MindBody',
        autoCloseInSecs: 2,
      });
    }
  }
  const isMindbodyConnected = (event) => {
    if (event.target.checked && pending === constant.API_STATUS.FULLFILLED && integrationStatus) {
      async () => await disconnect()
    }
    if (!(!event.target.checked && pending === constant.API_STATUS.FULLFILLED && !integrationStatus)) {
      router.push(
        routes.settings[['integrations.mindbody.connect']],
      );
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
                <img src="../../assets/images/mindbody.svg" alt />
              </div>
            </div>
            <h4
              class="mb-1 px-lg-1 px-md-1 mt-3">Mindbody</h4>
            <p
              class="m-0 px-lg-1 px-md-1">Connect
              Chaaat to MindBody allowing
              for
              contacts to be synced and
              activity tracked
              back to MindBody.</p>
          </div>
          <hr class="my-3" />
          <div class="card_content">
            <div
              class="px-lg-1 px-md-1 d-flex align-items-center justify-content-between gap-2 float-content-right">
              <div
                class="d-flex align-items-center gap-3">
                {
                  (pending === constant.API_STATUS.FULLFILLED && !integrationStatus)
                  ? <label for className="label_gap3">Connect</label>
                  : (pending === constant.API_STATUS.FULLFILLED && integrationStatus)
                  ? <label for className="label_gap3">Disconnect</label>
                  : ''
                }
                {
                  (pending !== constant.API_STATUS.FULLFILLED)
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
                          id="cb2-6"
                          checked={pending === constant.API_STATUS.FULLFILLED && integrationStatus}
                          onClick={(event) => {isMindbodyConnected(event)}}
                          type="checkbox" />
                        <label
                          class="tgl-btn"
                          for="cb2-6"></label>
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
