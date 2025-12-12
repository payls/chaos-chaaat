import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import UserProfileFrom from '../../components/UserProfile/UserProfileForm';
import IconContact from '../../components/Icons/IconContact';
import IntegrationsForm from '../../components/Integrations/IntegrationsForm';

export default function Profile() {
  const [agencyUser, setAgencyUser] = useState({});
  const [formMode, setFormMode] = useState('');
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    // (async () => {
    //   await h.userManagement.hasAdminAccessElseRedirect();
    // })();

    (async () => {
      setLoading(true);
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        localStorage.removeItem('sf_sandbox_mode');
        setAgencyUser(apiRes.data.agencyUser);
      }
      setLoading(false);
    })();
    setFormMode(h.form.FORM_MODE.EDIT);
  }, []);

  return (
    <div className="contacts-root layout-v">
      <Header
        className={
          'container dashboard-contacts-container common-navbar-header mb-3'
        }
      />
      <Body isLoading={isLoading}>
        <IntegrationsForm />
        {/* <div className="container dashboard-contacts-container contacts-container">
          <div className="mb-2 contacts-title d-flex justify-content-center">
            <div className="pt-3 pb-3">
              <h1>Integrations</h1>
            </div>
          </div>
        </div>
        <div className="projects-list-container modern-style no-oxs">
          <div className="bg-white">
            <div className="container dashboard-contacts-container modern-style">
              <div className="pl-3 pr-3 pb-2">
                <div className="row">
                  <div className="tab-body pt-2">
                    <IntegrationsForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </Body>
      <Footer />
    </div>
  );
}
