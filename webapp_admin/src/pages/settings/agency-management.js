import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import SettingForm from '../../components/Settings/SettingForm';
import IconContact from '../../components/Icons/IconContact';

export default function AgencyManagement() {
  const [agencyUser, setAgencyUser] = useState({});
  const [isHubSpotConnected, setHubSpotConnected] = useState(false);
  const [formMode, setFormMode] = useState('');
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    if (!h.notEmpty(agencyUser)) {
      (async () => {
        setLoading(true);
        const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
        if (h.cmpStr(apiRes.status, 'ok')) {
          setAgencyUser(apiRes.data.agencyUser);
        }
        setLoading(false);
      })();
      setFormMode(h.form.FORM_MODE.EDIT);
    }
  }, [agencyUser]);

  return (
    <div className="user-profile-root">
      <Header />
      <Body isLoading={isLoading} className="container">
        <div className="row justify-content-center no-gutters">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="mb-5 comments-title">
              <h1>Settings</h1>
            </div>
            {h.notEmpty(agencyUser) && (
              <SettingForm
                agencyUser={agencyUser}
                setLoading={setLoading}
                formMode={formMode}
                isHubSpotActive={isHubSpotConnected}
              />
            )}
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}
