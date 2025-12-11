import React, { useState } from 'react';

// UI
import RadioSlide from '../FlowBuilder/Icons/RadioSlide';
import RadioUnSlide from '../FlowBuilder/Icons/RadioUnSlide';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { h } from '../../helpers';
// STORE
import useSideBarStore from '../Automation/ChaaatBuilder/store';

export default React.memo(
  ({ onToggle = () => {}, defaultValue = false, data = {}, agency }) => {
    const { setCRMData, crmData } = useSideBarStore();
    const [toggle, seToggle] = useState(defaultValue);
    const [el, setEl] = useState(data);
    async function handleToggle() {
      const e = { ...el };
      if (e.toggled) {
        switch (data.selected) {
          case 'OUTLOOK':
            console.log(data.selected);
            localStorage.setItem('outlookcalendar-integration', null);
            const config_wizard_outlook_url = await api.integrations.initiateOutlookCalIntegration(false);
            window.open(config_wizard_outlook_url.data.url, '_blank');
            const onOutlookcalendarComplete = (event) => {
              if (event.key === constant.DIRECT_INTEGRATION.EVENTS.OUTLOOKCALENDAR_INTEGRATION) {
                h.general.alert('success', {
                  message: 'Outlook calendar account was connected successfully',
                });
                el.isConnected = 'active'
                crmData[data.selected].isConnected = 'active'
                setCRMData(crmData)
                localStorage.removeItem(
                  constant.DIRECT_INTEGRATION.EVENTS.OUTLOOKCALENDAR_INTEGRATION,
                );
              }
            }
            window.addEventListener('storage', onOutlookcalendarComplete);
            break;
          case 'GOOGLE':
            localStorage.setItem('googlecalendar-integration', null);
            const config_wizard_url = await api.integrations.initiateGCalendarIntegration(false);
            window.open(config_wizard_url.data.url, '_blank');
            const onGcalendarComplete = (event) => {
              if (event.key === constant.DIRECT_INTEGRATION.EVENTS.GOOGLECALENDAR_INTEGRATION) {
                h.general.alert('success', {
                  message: 'Google calendar account was connected successfully',
                });
                el.isConnected = 'active'
                crmData[data.selected].isConnected = 'active'
                setCRMData(crmData)
                localStorage.removeItem(
                  constant.DIRECT_INTEGRATION.EVENTS.GOOGLECALENDAR_INTEGRATION,
                );
              }
            }
            window.addEventListener('storage', onGcalendarComplete);
            break;
        }
      } else {
        switch (data.selected) {
          case 'OUTLOOK':
            if (agency.agency_config && agency.agency_config.agency_fk) {
              const apiRes = await api.integrations.deleteOutlookCalActiveIntegration(
                agency.agency_config.agency_fk,
                true,
              );
              if (apiRes.status === 'ok') {
                el.isConnected = 'inactive'
                crmData[data.selected].isConnected = 'inactive'
                setCRMData(crmData)
                h.general.alert('success', {
                  message: 'Outlook calendar account was disconnected successfully',
                });
              }
            }
            break;
          case 'GOOGLE':
            if (agency.agency_config && agency.agency_config.agency_fk) {
              const apiRes = await api.integrations.deleteGcalenderActiveIntegration(
                agency.agency_config.agency_fk,
                true,
              );
              if (apiRes.status === 'ok') {
                callbackStatusRefresh(
                  constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE,
                );h.general.alert('success', {
                  message: 'Google calendar account was disconnected successfully',
                });
              }
            }
            break;
        }
      }
      e.toggled = !e.toggled;
      setEl(e);
      onToggle(!e.toggled);
    }
    return (
      <div className="simple-toggle-box-wrapper">
        <div
          onClick={handleToggle}
          style={{ cursor: 'pointer' }}
          className="simple-toggle-item"
        >
          <span>{el?.title}</span>
          {el?.toggled && el.isConnected != 'active' ? <RadioSlide /> : <RadioUnSlide />}{' '}
        </div>
      </div>
    );
  },
);
