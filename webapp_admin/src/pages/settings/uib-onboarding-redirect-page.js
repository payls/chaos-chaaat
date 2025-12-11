import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import UserProfileFrom from '../../components/UserProfile/UserProfileForm';
import IconContact from '../../components/Icons/IconContact';
import IntegrationsForm from '../../components/Integrations/IntegrationsForm';

export default function Profile() {
  const [agencyUser, setAgencyUser] = useState({});
  const [formMode, setFormMode] = useState('');
  const [isLoading, setLoading] = useState();
  const router = useRouter();
  const onboarding_response = router.query;

  useEffect(() => {
    (async () => {
      setLoading(true);
      await h.auth.isLoggedInElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUser(apiRes.data.agencyUser);
      }
      setLoading(false);
    })();
    setFormMode(h.form.FORM_MODE.EDIT);
  }, []);

  useEffect(() => {
    (async () => {
      /**
       * this section checks whether the onboarding is success in UIB end
       * if success is true - onboarding_response.status will be true and there will be a data variable in the router.query
       * if success is false - nothing will be processed and will return error in the main screen
       */
      if (!isLoading && agencyUser && h.notEmpty(onboarding_response)) {
        let wabaDetails = {};
        // when onboarding is successful
        if (h.cmpStr(onboarding_response.status, 'true')) {
          let decodedWABADetails = Buffer.from(
            onboarding_response.data,
            'base64',
          ).toString('utf-8');
          wabaDetails = JSON.parse(decodedWABADetails);
        }
        wabaDetails.message = onboarding_response.message;
        wabaDetails.success = h.cmpStr(onboarding_response.status, 'true')
          ? true
          : false;

        localStorage.setItem(
          constant.DIRECT_INTEGRATION.EVENTS.WHATSAPP_INTEGRATION,
          JSON.stringify(wabaDetails),
        );

        window.close();
      };
    })();
  }, [agencyUser, isLoading, onboarding_response]);

  return (
    <div className="contacts-root layout-v">
      <Header
        className={
          'container dashboard-contacts-container common-navbar-header mb-3'
        }
      />
      <Body isLoading={isLoading}>
        <div className="container dashboard-contacts-container contacts-container">
          <div className="mb-2 contacts-title d-flex justify-content-center">
            <div className="pt-3 pb-3">
              <h1>Onboarding WhatsApp Business Account</h1>
            </div>
          </div>
        </div>
        <div>
          <div align="center"></div>
          <div id="breathing-button">
            <img
              style={{ objectFit: 'cover', width: '100%', overflow: 'hidden' }}
              src="https://cdn.yourpave.com/assets/whatsaapp-logo-circle.png"
            />
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}
