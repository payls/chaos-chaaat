import React, { useEffect, useState } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import UserProfileFrom from '../../components/UserProfile/UserProfileForm';
import IconContact from '../../components/Icons/IconContact';

export default function Profile() {
  const [agencyUser, setAgencyUser] = useState({});
  const [formMode, setFormMode] = useState('');
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
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

  return (
    <div className="contacts-root layout-v">
      <Header
        className={
          'container dashboard-contacts-container common-navbar-header '
        }
      />
      <Body
        isLoading={isLoading}
        className=" bg-white center-body f-auto overflow-auto"
      >
        <section className="settings-wrapper ">
          <div className=" justify-content-center no-gutters">
            <div className="notif-list">
              {h.notEmpty(agencyUser) && (
                <UserProfileFrom
                  agencyUser={agencyUser}
                  setLoading={setLoading}
                  formMode={formMode}
                />
              )}
            </div>
          </div>
        </section>
      </Body>
      <Footer />
    </div>
  );
}
