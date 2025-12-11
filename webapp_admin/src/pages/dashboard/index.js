import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';

// UI
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import Web from '../../components/Icons/Chaaat/Web';
import Laptop from '../../components/Icons/Chaaat/Laptop';
import QR from '../../components/Icons/Chaaat/QR';
import WA from '../../components/Icons/Chaaat/WA';
import Circles from '../../components/Icons/Chaaat/Circles';
import dashboardStyle from '../../styles/dashboard';

import DashboardItems from '../components/DashboardItems';

export default function DashboardIndex() {
  const router = useRouter();
  const [subscriptionInfo, setSubscription] = useState({
    status: constant.API_STATUS.IDLE,
    data: null,
  });
  const [agency, setAgency] = useState(null);
  const [trialWabaNumber, setTrialWabaNumber] = useState(null);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [connectedAccountCount, setConnectedAccountCount] = useState(0);
  const [onboardingList, setOnboardingList] = useState([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      h.auth.isLoggedInElseRedirect();
      setStatus(constant.API_STATUS.PENDING);
      setLoading(true);

      await h.userManagement.hasAdminAccessElseRedirect();
      await getAgency();

      setStatus(constant.API_STATUS.FULLFILLED);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (h.notEmpty(agency)) {
      (async () => {
        await getSubscriptionInfo(agency.agency_id);
        setLoading(false);
      })();
    }
  }, [agency]);

  /**
   * Get current agency of the user and set to `setAgency` state
   *
   * @async
   * @function
   * @name getAgency
   * @kind function
   * @memberof DashboardIndex
   * @returns {Promise<void>}
   */
  async function getAgency() {
    const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      const agency = apiRes.data.agencyUser.agency;
      setAgency(agency);
    }
  }

  /**
   * Get subscription info
   *
   * @async
   * @function
   * @name getSubscriptionInfo
   * @returns {Promise<void>}
   */
  async function getSubscriptionInfo(agencyId) {
    setSubscription((prev) => ({
      ...prev,
      status: constant.API_STATUS.PENDING,
    }));

    const res = await api.agency.getAgencySubscription(agencyId, false);

    if (h.cmpStr(res.status, 'ok')) {
      setSubscription({ ...subscriptionInfo, data: res.data.data });

      if (h.notEmpty(res.data.data.trial_waba_info)) {
        getTrialWabaNumber(res.data.data.trial_waba_info);
      }
    }

    setSubscription((prev) => ({
      ...prev,
      status: constant.API_STATUS.FULLFILLED,
    }));
  }

  /**
   * The `daysRemaining()` function calculates the number of days remaining between the current date and the end date of the
   * current subscription. It uses the `moment` library to handle date calculations.
   *
   * @function
   * @name daysRemaining
   * @kind function
   * @memberof DashboardIndex
   * @returns {number}
   */
  function daysRemaining() {
    const eventdate = moment(
      subscriptionInfo?.data?.current_subscription?.subscription_end,
    );
    const todaysdate = moment();

    const daysLeft = eventdate.diff(todaysdate, 'days') + 1;
    return `${daysLeft} day${daysLeft < 2 ? '' : 's'}`;
  }

  /**
   * Get Trial WABA Number from `api.agency.getAgencySubscription` `waba_info` object
   *
   * @function
   * @name getTrialWabaNumber
   * @kind function
   * @memberof DashboardIndex
   * @param {any} waba_list
   * @returns {void}
   */
  function getTrialWabaNumber(waba_list) {
    const trial = waba_list.find((f) => f.is_trial_number);

    setTrialWabaNumber(trial);
  }

  return (
    <div data-testid="chaaat-dashboard-page" className="contacts-root layout-v">
      <Header
        className={
          'container dashboard-contacts-container common-navbar-header mb-3'
        }
      />
      <Body isLoading={isLoading}>
        <div
          className="d-flex justify-content-between align-items-center"
          style={dashboardStyle.header}
        >
          <div className="d-flex" style={{ gap: '16px' }}>
            <a
              href={`https://calendly.com/demo-3r-3/30min`}
              target="_blank"
              className="chaaat-gradient-btn"
            >
              Book a meeting
            </a>

            <a
              href={routes.pricing}
              style={dashboardStyle.upgradeBtn}
              className="chaaat-btn-hover"
            >
              Upgrade
            </a>
          </div>
          {h.notEmpty(subscriptionInfo.data) &&
            subscriptionInfo.status !== constant.API_STATUS.PENDING &&
            h.cmpStr(subscriptionInfo.data?.subscription_name, 'Trial') &&
            subscriptionInfo.data?.current_subscription?.status === 'active' && (
              <div
                className="d-flex align-items-center"
                style={{ gap: '16px' }}
              >
                <div>
                  <span style={dashboardStyle.activeCount}>
                    {subscriptionInfo.data
                      ?.whatsapp_message_sending_limit -
                      subscriptionInfo.data?.remaining_whatsapp_credits}{' '}
                    /
                  </span>{' '}
                  <span style={dashboardStyle.totalCount}>
                    {
                      subscriptionInfo.data
                        ?.whatsapp_message_sending_limit
                    }
                  </span>{' '}
                  <span style={dashboardStyle.activeCount}>
                    messages are sent
                  </span>
                </div>
                <div className="center-body" style={{ position: 'relative' }}>
                  <Circles />
                  <span style={dashboardStyle.daysLeft}>{daysRemaining()}</span>
                </div>
              </div>
            )}
          {subscriptionInfo.status === constant.API_STATUS.PENDING && (
            <div className="d-flex align-items-center" style={{ gap: '16px' }}>
              <FontAwesomeIcon
                icon={faRedo}
                color="#dedede"
                spin="true"
                size="2x"
              />
            </div>
          )}
        </div>
        {h.cmpStr(subscriptionInfo.data?.subscription_name, 'Trial') && (
          <div className="bg-white">
            <div className="contacts-list-container">
              <div className="container dashboard-contacts-container ">
                <div className="dashboard-landing center-body">
                  <div
                    className="gradient-wrapper"
                    style={
                      (h.notEmpty(subscriptionInfo.data) &&
                        subscriptionInfo.status !== constant.API_STATUS.PENDING &&
                        h.cmpStr(subscriptionInfo.data?.subscription_name, 'Trial') &&
                        subscriptionInfo.data?.current_subscription?.status === 'active') ||
                        onboardingList.length > 0 ?
                      dashboardStyle.bannerWrapper : dashboardStyle.bannerWrapperHidden
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="231"
                      height="282"
                      viewBox="0 0 231 282"
                      fill="none"
                      style={{ position: 'absolute', filter: 'opacity(0.1)' }}
                    >
                      <path
                        d="M137.011 -12.9997C114.449 -28.3911 91.5739 -43.6362 66.4183 -55C44.844 -43.9893 16.5214 -42.5935 -1.9487 -27.3574C-64.5048 24.2454 -107.806 97.0153 -98.8197 186.143C-91.4257 259.475 55.9707 294.565 115.783 275.664C145.406 266.302 170.832 247.372 190.773 225.002C228.351 182.844 239.358 126.947 222.427 74.4417C209.471 34.2686 171.392 10.4539 137.011 -12.9997Z"
                        stroke="#5E81C7"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div
                      className="gradient-content center-body"
                      style={dashboardStyle.bannerContent}
                    >
                      {h.notEmpty(subscriptionInfo.data) &&
                        subscriptionInfo.status !== constant.API_STATUS.PENDING &&
                        h.cmpStr(subscriptionInfo.data?.subscription_name, 'Trial') &&
                        subscriptionInfo.data?.current_subscription?.status === 'active' && (
                        <>
                        <h4 style={dashboardStyle.bannerSubHeader}>
                          Ready to dive in? Send your first message to explore your
                          team inbox!
                        </h4>

                        <p style={dashboardStyle.subLine}>
                          {subscriptionInfo.status ===
                          constant.API_STATUS.FULLFILLED ? (
                            <>
                              To proceed, please initiate your WhatsApp message with{' '}
                              {subscriptionInfo?.data?.agency_code}
                            </>
                          ) : (
                            <FontAwesomeIcon
                              icon={faRedo}
                              color="#dedede"
                              spin="true"
                              size="1x"
                            />
                          )}
                        </p>
                        <div
                          className="d-flex justify-content-center"
                          style={{ gap: '40px' }}
                        >
                          <div style={dashboardStyle.methodOption}>
                            <WA />

                            <h5 style={dashboardStyle.methodHeader}>
                              Send a Message
                            </h5>
                            <p style={dashboardStyle.methodDescription}>
                              Utilize the buttons below to send a pre-filled
                              WhatsApp message. Alternatively, save{' '}
                              {trialWabaNumber?.waba_number ?? '-'} to your contacts
                              and send a message beginning with {subscriptionInfo?.data?.agency_code}.
                            </p>

                            <button
                              className="chaaat-btn left-aligned chaaat-btn-hover"
                              type="button"
                              onClick={() => {
                                window.open(
                                  `https://web.whatsapp.com/send/?phone=${trialWabaNumber?.waba_number}&text=${subscriptionInfo?.data?.agency_code}`,
                                  '_blank',
                                );
                              }}
                              disabled={
                                h.isEmpty(subscriptionInfo?.data) ||
                                subscriptionInfo.status ===
                                  constant.API_STATUS.PENDING
                              }
                            >
                              <Web style={{ marginRight: '18px' }} />
                              WhatsApp Web
                            </button>
                            <br />

                            <button
                              className="chaaat-btn left-aligned chaaat-btn-hover"
                              type="button"
                              onClick={() => {
                                window.open(
                                  `https://api.whatsapp.com/send?phone=${trialWabaNumber?.waba_number}&text=${subscriptionInfo?.data?.agency_code}`,
                                  '_blank',
                                );
                              }}
                              disabled={
                                h.isEmpty(subscriptionInfo?.data) ||
                                subscriptionInfo.status ===
                                  constant.API_STATUS.PENDING
                              }
                            >
                              <Laptop style={{ marginRight: '18px' }} />
                              WhatsApp Desktop App
                            </button>
                          </div>
                          <div style={dashboardStyle.methodOption}>
                            <QR />

                            <h5 style={dashboardStyle.methodHeader}>
                              Scan the QR Code
                            </h5>
                            <p style={dashboardStyle.methodDescription}>
                              Scan the code with your phone camera, tap the link to
                              open a pre-filled WhatsApp message, and hit 'send' to
                              begin your trial.
                            </p>

                            <QRCode
                              size={100}
                              value={
                                h.isEmpty(subscriptionInfo?.data) ||
                                subscriptionInfo.status ===
                                  constant.API_STATUS.PENDING
                                  ? 'Chaaat loading'
                                  : `https://api.whatsapp.com/send?phone=${trialWabaNumber?.waba_number}&text=${subscriptionInfo?.data?.agency_code}`
                              }
                              viewBox={`0 0 256 256`}
                            />
                          </div>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="249"
                          height="620"
                          viewBox="0 0 249 620"
                          fill="none"
                          style={{
                            position: 'absolute',
                            filter: 'opacity(0.1)',
                            right: '0px',
                          }}
                        >
                          <path
                            d="M524.909 4.07983C475.061 -30.0301 424.521 -63.8159 368.943 -89C321.277 -64.5985 258.701 -61.505 217.894 -27.7394C79.684 86.6212 -15.9856 247.892 3.86934 445.413C20.2056 607.93 345.86 685.696 478.008 643.806C543.455 623.06 599.632 581.108 643.688 531.532C726.714 438.103 751.032 314.226 713.623 197.865C685.001 108.834 600.869 56.057 524.909 4.07983Z"
                            stroke="#6964BF"
                            strokeLinecap="round"
                          />
                        </svg>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <DashboardItems
          setLoading={setLoading}
          isLoading={isLoading}
          connectedAccountCount={connectedAccountCount}
        />
      </Body>
      <Footer />
    </div>
  );
}