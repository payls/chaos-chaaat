import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';
import { api } from '../../api';
import { Header } from '../../components/Layouts/Layout';
import constant from '../../constants/constant.json';
import { ToastContainer } from 'react-toastify';

export default React.memo(() => {
  const [integrations, setIntegrations] = useState([
    {
      title: 'Google',
      image: '../../../assets/images/gCal.svg',
      description: `Connect your Google account`,
      isConnected: 'inactive',
      handleCLick: () => connectGoogle(),
    },
    {
      title: 'Outlook',
      image: '../../../assets/images/outCal.svg',
      description: `Connect your Outlook account`,
      isConnected: 'inactive',
      handleCLick: () => connectOutlook(),
    },
  ]);

  useEffect(() => {
    (async () => {
      const isAuthenticated = h.auth.isAuthenticated();
      const apiRes = await api.agencyUser.getCurrentUserAgencyNoRedirect(
        {},
        false,
      );
      if (isAuthenticated && apiRes.data.agencyUser.agency_fk) {
        const getOutlookCalIntegration = await api.integrations.getOutlookCalActiveIntegration(
          {
            agency_id: apiRes.data.agencyUser.agency_fk,
          },
          false,
        );
        if (h.cmpStr(getOutlookCalIntegration.status, 'ok')) {
          const { agency_oauth } = getOutlookCalIntegration.data;
          updateIntegration('Outlook', agency_oauth.status);
        }
        const getGcalendarIntegration = await api.integrations.getGcalenderActiveIntegration(
          {
            agency_id: apiRes.data.agencyUser.agency_fk,
          },
          false,
        );
        if (h.cmpStr(getGcalendarIntegration.status, 'ok')) {
          const { agency_oauth } = getGcalendarIntegration.data;
          updateIntegration('Google', agency_oauth.status);
        }
      }
    })();
  }, []);

  const updateIntegration = (title, status) => {

    setIntegrations(prevState => {
      const newState = [ ...prevState ];
      const index = newState.findIndex(integration => integration.title === title);
      if (index !== -1) {
        newState[index] = { ...newState[index], isConnected: status };
      }
      return newState;
    })
  }

  const connectGoogle = async () => {
    localStorage.setItem('googlecalendar-integration', null);
    const config_wizard_url = await api.integrations.initiateGCalendarIntegration(false);
    window.open(config_wizard_url.data.url, '_blank');
    const onGcalendarComplete = (event) => {
      if (event.key === constant.DIRECT_INTEGRATION.EVENTS.GOOGLECALENDAR_INTEGRATION) {
        h.general.alert('success', {
          message: 'Google calendar account was connected successfully',
        });
        updateIntegration(
          'Google', constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE,
        );
        localStorage.removeItem(
          constant.DIRECT_INTEGRATION.EVENTS.GOOGLECALENDAR_INTEGRATION,
        );
      }
    }
    window.addEventListener('storage', onGcalendarComplete);
  }

  const connectOutlook = async () => {
    localStorage.setItem('outlookcalendar-integration', null);
    const config_wizard_url = await api.integrations.initiateOutlookCalIntegration(false);
    window.open(config_wizard_url.data.url, '_blank');
    const onOutlookcalendarComplete = (event) => {
      if (event.key === constant.DIRECT_INTEGRATION.EVENTS.OUTLOOKCALENDAR_INTEGRATION) {
        h.general.alert('success', {
          message: 'Outlook calendar account was connected successfully',
        });
        updateIntegration(
          'Outlook', constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE,
        );
        localStorage.removeItem(
          constant.DIRECT_INTEGRATION.EVENTS.OUTLOOKCALENDAR_INTEGRATION,
        );
      }
    }
    window.addEventListener('storage', onOutlookcalendarComplete);
  }

  return (
    <>
      <ToastContainer />
      <Header showHeaderContent={false} />
      <div className="h100">
        <div className="login-page-wrapper">
          <div className="login-page-wrapper-left">
            <div>
              <img
                src="https://cdn.yourpave.com/assets/chaaat-logo-1.png"
                width={'100px'}
              />
              <h3>
                Where <br />
                Conversations <br />
                <span
                  className="ani"
                  style={{
                    backgroundImage:
                      'linear-gradient(96deg, #30D6CB 7%, #5772F8 31.17%, #9062E0 53.48%, #D64FC2 66.49%)',
                  }}
                >
                  Convert.
                </span>
              </h3>
              <p>
                Chaaat's chat-based tool empowers your sales & marketing
                strategy while satisfying platform compliance, engaging at
                scale, and personalising your communications.
              </p>
            </div>
          </div>
          <div className="login-page-wrapper-right channels">
            <div style={{ width: '100%' }}>
              <h1 className="mb-4 off-black" style={{ textAlign: 'left' }}>
                Connect Integrations
                <span className="">You can always connect integrations later.</span>
              </h1>

              <div className="channel-wrapper d-flex">
                {integrations.map((integration, i) => (
                  <div
                    key={i}
                    className={`channel-item ${integration.isConnected == 'inactive' ? '' : 'disabled'}`}
                  >
                    <div className="d-flex flex-row gap-1 align-items-center">
                      <div>
                        <span>
                          <img src={integration.image} width={'40'} />
                        </span>
                      </div>
                      <div>
                        <h3>{integration.title}</h3>
                        <p>{integration.description}</p>
                      </div>
                    </div>
                    {integration.isConnected == 'inactive'? (
                      <button
                        className="common-button-2 mt-4 text-normal c-action-button black w-100"
                        onClick={integration.handleCLick}
                      >
                        <span>Connect</span>
                      </button>
                    ) : (
                      <button
                        className="common-button-2 mt-4 text-normal c-action-button black w-100"
                        disabled
                      >
                        <span>Connected</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="channel-infos">
                <h4>
                  <br />
                  <button
                    onClick={() => {
                      window.location = h.getRoute(routes.dashboard.index);
                    }}
                    className="common-button-2 mt-4 text-normal c-action-button black"
                  >
                    {' '}
                    SKIP FOR NOW
                  </button>
                  <br />
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
