import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

export default function Profile() {
  const [agencyUser, setAgencyUser] = useState({});
  const [formMode, setFormMode] = useState('');
  const [isLoading, setLoading] = useState();
  const router = useRouter();
  const code = router.query.code;

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    // (async () => {
    //   await h.userManagement.hasAdminAccessElseRedirect();
    // })();

    (async () => {
      setLoading(true);
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
      if (!isLoading && agencyUser && code) {
        const apiRes = await api.integrations.completeHubspotIntegrationRequest(
          {
            code,
            agencyUser,
          },
        );

        localStorage.setItem(
          constant.DIRECT_INTEGRATION.EVENTS.HUBSPOT_INTEGRATION,
          JSON.stringify(apiRes.data),
        );
        window.close();
      }
    })();
  }, [agencyUser, isLoading, code]);

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
              <h1>Connecting to Hubspot</h1>
            </div>
          </div>
        </div>
        <div>
          <div align="center"></div>
          <div id="breathing-button">
            <img
              style={{ objectFit: 'cover', width: '100%', overflow: 'hidden' }}
              src="../../assets/images/hubspotLogoCircle.png"
            ></img>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}
