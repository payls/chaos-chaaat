import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { h } from '../../helpers';
import settingIcon from '../../../public/assets/images/settings.svg';
import TimeslotSettings from '../modals/timeslots';

export default function OutlookCalendar(props) {
  
  const {
    connection,
    agencyUserData: agencyUser,
    callbackStatusRefresh,
  } = props;

  const [outlookcalendarIntegrationStatus, setOutlookcalendarIntegrationStatus] = useState({});
  const [outlookCalendarLoading, setOutlookCalendarLoading] = useState(false)
  const [timeslot, setTimeslot] = useState(false);
  const openModal = (isTimeslot) => {
    setTimeslot(isTimeslot);
  }
  useEffect(() => {
    setOutlookcalendarIntegrationStatus(connection);
  });

  /**
   * Handles the Outlook Calendar connection logic based on the checkbox state.
   * - If checked, connects the Outlook Calendar account.
   * - If unchecked, disconnects the Outlook Calendar account.
   * 
   * @param {Event} event - The change event from the checkbox (for connecting or disconnecting Outlook Calendar).
   */
  const handleOutlookConnection = async (event) => {
    setOutlookCalendarLoading(1);
    if (event.target.checked) {
      await handleOutlookCalendarConnect();
    } else {
      await handleOutlookCalendarDisconnect();
    }
  };


  const handleOutlookCalendarConnect = async () => {
    localStorage.setItem('outlookcalendar-integration', null);

    // Set config_wizard_url to state to render Iframe or open a new tab
    const config_wizard_url = await api.integrations.initiateOutlookCalIntegration(false);
    window.open(config_wizard_url.data.url, '_blank');

    const onOutlookcalendarComplete = (event) => {
      if (event.key === constant.DIRECT_INTEGRATION.EVENTS.OUTLOOKCALENDAR_INTEGRATION) {
        h.general.alert('success', {
          message: 'Outlook calendar account was connected successfully',
        });

        callbackStatusRefresh(constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE);
        localStorage.removeItem(constant.DIRECT_INTEGRATION.EVENTS.OUTLOOKCALENDAR_INTEGRATION);
        setOutlookCalendarLoading(0);
      }
    };
    window.addEventListener('storage', onOutlookcalendarComplete);
  };

  const handleOutlookCalendarDisconnect = async () => {
    if (agencyUser && agencyUser.agency_fk) {
      const apiRes = await api.integrations.deleteOutlookCalActiveIntegration(agencyUser.agency_fk, true);
      if (apiRes.status === 'ok') {
        callbackStatusRefresh(constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE);
        h.general.alert('success', {
          message: 'Outlook calendar account was disconnected successfully',
        });
      }
    }
    setOutlookCalendarLoading(0);
  };

  return (
    <>
    {
      (timeslot)
      ?
      <TimeslotSettings
        setTimeslotFor="OUTLOOKCALENDAR"
        agencyUserData={agencyUser}
        setTimeslot={setTimeslot}
        timeslot={timeslot}
      />
      :
      ''
      }
      <div
        class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12">
        <div class="crm_card">
          <div class="card_content">
            <div class="card_icon">
              <div class="card_iconImg_wrapper d-inline-flex">
                <img src="../../assets/images/outlook.svg" alt />
              </div>
              <img class="imgctm" role="button" src={settingIcon.src} width="24px" height="24px" onClick={() => openModal(!timeslot)}/>
            </div>
            <h4
              class="mb-1 px-lg-1 px-md-1 mt-3">Outlook</h4>
            <p
              class="m-0 px-lg-1 px-md-1">Connect Chaaat to Outlook Calendar allowing for contacts to be synced and activity tracked back to HubSpot.</p>
          </div>
          <hr class="my-3" />
          <div class="card_content">
            <div
              class="px-lg-1 px-md-1 d-flex align-items-center justify-content-end gap-2">
              <div
                class="d-flex align-items-center gap-3">

                <label
                  for className="label_gap3">{((outlookcalendarIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE) ? 'Disconnect' : 'Connect')}</label>
                  {
                  (outlookCalendarLoading)
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
                          id="cb2-21"
                          checked={((outlookcalendarIntegrationStatus == constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE) ? true : false)}
                          onClick={(event) => { handleOutlookConnection(event) }}
                          type="checkbox" />
                        <label
                          class="tgl-btn"
                          for="cb2-21"></label>
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
  )
}