import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import UserProfileFrom from '../../../components/UserProfile/UserProfileForm';
import IconContact from '../../../components/Icons/IconContact';
import IntegrationsForm from '../../../components/Integrations/IntegrationsForm';

export default function Profile() {
  const router = useRouter();
  const [agencyUser, setAgencyUser] = useState({});
  const [form, setForm] = useState({
    siteId: '',
    apiKey: '',
    staffUsername: '',
    staffPassword: '',
    agencyId: '',
    agencyUserId: '',
  });
  const [isLoading, setLoading] = useState();
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();

    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUser(apiRes.data.agencyUser);
        setForm((f) => ({
          ...f,
          agencyUserId: apiRes.data.agencyUser.agency_user_id,
          agencyId: apiRes.data.agencyUser.agency_fk,
        }));
      }
    })();
  }, []);

  function onChange(v, key) {
    const cForm = { ...form };
    cForm[key] = v;

    setForm(cForm);
  }

  async function submit() {
    setLoading(true);
    setStatus(constant.API_STATUS.PENDING);

    const connectRes = await api.integrations.connectToMindBody(form);

    if (h.general.cmpStr(connectRes.status, 'ok')) {
      await h.general.alert('success', {
        message: 'Successfully connected to MindBody',
        autoCloseInSecs: 2,
      });
      await router.push(routes.settings.integrations);
    } else {
      await h.general.alert('error', {
        message: 'Failed to connect to MindBody',
        autoCloseInSecs: 2,
      });
      setLoading(false);
      setStatus(constant.API_STATUS.IDLE);
    }
  }
  return (
    <div className="contacts-root layout-v">
      <Header
        className={
          'container dashboard-contacts-container common-navbar-header'
        }
      />
      <Body isLoading={isLoading}>
        <div className="projects-list-container modern-style no-oxs">
          <div className="bg-white">
            <div className="container dashboard-contacts-container modern-style">
              <div className="pl-3 pr-3 pb-2">
                <div className="row">
                  <div className="tab-body pt-2">
                    <div className="wdots">
                      <h1
                        className="d-flex justify-content-center align-items-center mt-5"
                        style={{ gap: '1.5em' }}
                      >
                        <img
                          src={
                            'https://cdn.yourpave.com/assets/chaaat-logo-1.png'
                          }
                          style={{
                            width: '90px',
                          }}
                        />
                        <div className="d-flex justify-content-center">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <img
                          src={
                            'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/logo-mindbody+(3).png'
                          }
                          style={{
                            width: '130px',
                          }}
                        />
                      </h1>
                      <h1>Connecting Chaaat to MindBody</h1>
                      <div className="center-content">
                        <div
                          className="settings-wrapper"
                          style={{ width: '500px' }}
                        >
                          <div className="d-flex ">
                            <div className="notif-lft">
                              <label>
                                Chaaat{' '}
                                <span
                                  className="light-red-text"
                                  style={{
                                    fontSize: '12px',
                                    textDecoration: 'underline',
                                  }}
                                >
                                  by chaaat.io
                                </span>
                              </label>
                            </div>
                          </div>
                          <hr />
                          <div className="d-flex mb-3">
                            <div className="notif-list">
                              <label>
                                Site ID
                                <small className="light-red-text">*</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter Site ID"
                                value={form.siteId}
                                onChange={(e) => {
                                  onChange(e.target.value, 'siteId');
                                }}
                                disabled={constant.API_STATUS.IDLE !== status}
                                className="w-input"
                              />
                            </div>
                          </div>
                          <div className="d-flex ">
                            <div className="notif-list">
                              <label>
                                API Key
                                <small className="light-red-text">*</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter API key"
                                value={form.apiKey}
                                onChange={(e) => {
                                  onChange(e.target.value, 'apiKey');
                                }}
                                disabled={constant.API_STATUS.IDLE !== status}
                                className="w-input"
                              />
                            </div>
                          </div>

                          <h1
                            className="mt-4"
                            style={{ fontSize: '14px', textAlign: 'left' }}
                          >
                            Staff Authentication
                          </h1>
                          <div className="d-flex mb-3">
                            <div className="notif-list">
                              <label>
                                Staff Username
                                <small className="light-red-text">*</small>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter staff username"
                                value={form.staffUsername}
                                onChange={(e) => {
                                  onChange(e.target.value, 'staffUsername');
                                }}
                                disabled={constant.API_STATUS.IDLE !== status}
                                className="w-input"
                              />
                            </div>
                          </div>

                          <div className="d-flex mb-3">
                            <div className="notif-list">
                              <label>
                                Staff Password
                                <small className="light-red-text">*</small>
                              </label>
                              <input
                                type="password"
                                placeholder="Enter staff password"
                                value={form.staffPassword}
                                onChange={(e) => {
                                  onChange(e.target.value, 'staffPassword');
                                }}
                                disabled={constant.API_STATUS.IDLE !== status}
                                className="w-input"
                              />
                            </div>
                          </div>
                          <div className="d-flex">
                            <button
                              className="common-button transparent-bg "
                              type="button"
                              onClick={() => {
                                router.push(
                                  h.getRoute(routes.settings.integrations),
                                );
                              }}
                              style={{ width: '100%', flex: '50%' }}
                              disabled={constant.API_STATUS.IDLE !== status}
                            >
                              Back
                            </button>
                            <button
                              className="common-button"
                              type="button"
                              onClick={submit}
                              style={{ width: '100%', flex: '50%' }}
                              disabled={constant.API_STATUS.IDLE !== status}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}
