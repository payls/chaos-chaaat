import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';
import { useRouter } from 'next/router';
import { api } from '../../api';
import LoginForm from '../../components/Login/LoginForm';
import { Body, Header } from '../../components/Layouts/Layout';
import CommonGoogleSignin from '../../components/Common/CommonGoogleSignin';
import { config } from '../../configs/config';
import constant from '../../constants/constant.json';
import { ToastContainer } from 'react-toastify';
import { faUnlink, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconWhatsApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import WhatsAppOnboardingModal from '../../components/WhatsApp/WhatsAppOnboardingModal3';

export default React.memo(() => {
  const router = useRouter();
  const [isModal, setModal] = useState();
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [agencyUser, setAgencyUser] = useState(null);
  const [openConnect, setOpenConnect] = useState(false);

  const [channels, setChannels] = useState([
    {
      title: 'WhatsApp',
      image: 'https://cdn.yourpave.com/assets/whatsapp-logo.png',
      description: `Connect your WABA account`,
      handleCLick: () => {
        setOpenConnect(true);
      },
      comingSoon: false,
    },
    {
      title: 'Line',
      image: 'https://cdn.yourpave.com/assets/line.png',
      description: `Connect your Line account`,
      comingSoon: true,
      handleCLick: () => {},
    },
  ]);

  let className;

  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);

  useEffect(() => {
    (async () => {
      const isAuthenticated = h.auth.isAuthenticated();
      if (!(await h.userManagement.hasMarketingAccess())) {
        setHasMarketingAccess(false);
      }
      if (isAuthenticated) {
        const user = h.auth.getUserInfo();
        h.paveChat.init({
          container: '#__next', // Main root content wrapper
          agency_id: '08012e63-a6ce-4cb1-abdf-89b592955729', // Agent ID
          user: {
            first_name: user.first_name,
            last_name: user.last_name,
            email_address: user.email,
            phone: user.mobile_number,
          },
        });
      }

      const apiRes = await api.agencyUser.getCurrentUserAgencyNoRedirect(
        {},
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUser(apiRes.data.agencyUser);
      }
    })();
  }, []);

  if (h.cmpBool(isModal, true)) {
    className = 'login-modal-input';
  } else {
    className = 'login-generic-input';
  }

  return (
    <>
      <ToastContainer />
      {openConnect && (
        <WhatsAppOnboardingModal
          agencyId={agencyUser?.agency_fk}
          handleCloseModal={() => {
            setOpenConnect(false);
          }}
          redirectUrl={h.getRoute(routes.dashboard.index)}
        />
      )}
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
                Connect Channels
                <span className="">You can always connect channels later.</span>
              </h1>

              <div className="channel-wrapper d-flex">
                {channels.map((channel, i) => (
                  <div
                    key={i}
                    className={`channel-item ${
                      selectedPrice === i ? 'active' : ''
                    }  ${channel.comingSoon ? 'disabled' : ''}`}
                  >
                    <div className="d-flex flex-row gap-1 align-items-center">
                      <div>
                        <span className="img">
                          <img src={channel.image} width={'40'} />
                        </span>
                      </div>
                      <div>
                        <h3>{channel.title}</h3>
                        <p>{channel.description}</p>
                      </div>
                    </div>
                    {!channel.comingSoon ? (
                      <button
                        className="common-button-2 mt-4 text-normal c-action-button black w-100"
                        onClick={channel.handleCLick}
                      >
                        <span>Connect</span>
                      </button>
                    ) : (
                      <button
                        className="common-button-2 mt-4 text-normal c-action-button black w-100"
                        disabled
                      >
                        <span>Coming Soon</span>
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
                      window.location = h.getRoute(routes.channels.integration);
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
