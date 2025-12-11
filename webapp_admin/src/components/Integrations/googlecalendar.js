import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { h } from '../../helpers';
import settingIcon from '../../../public/assets/images/settings.svg';
import TimeslotSettings from '../modals/timeslots';

export default function GoogleCalendar(props) {
  
  const {
    connection,
    agencyUserData: agencyUser,
    callbackStatusRefresh,
  } = props;
  const [gCalendarIntegrationStatus, setGcalendarIntegrationStatus] = useState({});
  const [googleCalendarLoading, setGoogleCalendarLoading] = useState(false)
  const [timeslot, setTimeslot] = useState(false);
  const openModal = (isTimeslot) => {
    setTimeslot(isTimeslot);
  }
  useEffect(() => {
    setGcalendarIntegrationStatus(connection);
  });

  /**
   * Handles the Google Calendar connection logic based on the checkbox state.
   * - If checked, connects the Google Calendar account.
   * - If unchecked, disconnects the Google Calendar account.
   * 
   * @param {Event} event - The change event from the checkbox (for connecting or disconnecting Google Calendar).
  */
  const handleGoogleConnection = async (event) => {
    setGoogleCalendarLoading(1);
    const agency_user = await api.agencyUser.getCurrentUserAgency({}, false);
  
    if (event.target.checked) {
      await handleGoogleCalendarConnect(agency_user);
    } else {
      await handleGoogleCalendarDisconnect();
    }
  };

  const handleGoogleCalendarConnect = async (agency_user) => {
    localStorage.setItem('googlecalendar-integration', null);

    // Set config_wizard_url to state to render Iframe or open a new tab
    const config_wizard_url = await api.integrations.initiateGCalendarIntegration(false);
    window.open(config_wizard_url.data.url, '_blank');
  
    const onGcalendarComplete = (event) => {
      if (event.key === constant.DIRECT_INTEGRATION.EVENTS.GOOGLECALENDAR_INTEGRATION) {
        h.general.alert('success', {
          message: 'Google calendar account was connected successfully',
        });
        callbackStatusRefresh(constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE);
        localStorage.removeItem(constant.DIRECT_INTEGRATION.EVENTS.GOOGLECALENDAR_INTEGRATION);
        setGoogleCalendarLoading(0);
      }
    };
    window.addEventListener('storage', onGcalendarComplete);
  };

  const handleGoogleCalendarDisconnect = async () => {
    if (agencyUser && agencyUser.agency_fk) {
      const apiRes = await api.integrations.deleteGcalenderActiveIntegration(
        agencyUser.agency_fk,
        true
      );
      if (apiRes.status === "ok") {
        callbackStatusRefresh(
          constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE
        );
        h.general.alert("success", {
          message: "Google calendar account was disconnected successfully",
        });
      }
    }
    setGoogleCalendarLoading(0);
  };

  return (
    <>
      {
      (timeslot)
      ?
      <TimeslotSettings
        setTimeslotFor="GCALENDAR"
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
                <img src="../../assets/images/google_calendar_icon.svg" alt />
              </div>
              {gCalendarIntegrationStatus ===
                constant.INTEGRATION_CONSTANTS.INSTANCE_STATUS.ACTIVE && (
                <img
                  class="imgctm"
                  role="button"
                  src={settingIcon.src}
                  width="24px"
                  height="24px"
                  onClick={() => openModal(!timeslot)}
                />
              )}
            </div>
            <h4
              class="mb-1 px-lg-1 px-md-1 mt-3">Google</h4>
            <p
              class="m-0 px-lg-1 px-md-1">Connect Chaaat to Google Calendar allowing for contacts to be synced and activity tracked back to Google.</p>
          </div>
          <hr class="my-3" />
          <div class="card_content">
            <div
              class="px-lg-1 px-md-1 d-flex align-items-center justify-content-end gap-2">
              <div
                class="d-flex align-items-center gap-3">
                <label className="label_gap3"
                  for>{((gCalendarIntegrationStatus == constant.INTEGRATION_CONSTANTS.INSTANCE_STATUS.ACTIVE) ? 'Disconnect' : 'Connect')}</label>
                  {
                  (googleCalendarLoading)
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
                          id="cb2-1"
                          checked={((gCalendarIntegrationStatus == constant.INTEGRATION_CONSTANTS.INSTANCE_STATUS.ACTIVE) ? true : false)}
                          onClick={(event) => { handleGoogleConnection(event) }}
                          type="checkbox" />
                        <label
                          class="tgl-btn"
                          for="cb2-1"></label>
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