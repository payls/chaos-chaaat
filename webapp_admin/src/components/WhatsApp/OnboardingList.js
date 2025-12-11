import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import moment from 'moment';
import IconBlueSetting from '../ProposalTemplate/Link/preview/components/Icons/IconBlueSetting';
import { routes } from '../../configs/routes';
import SmallSpinner from '../Inbox/SmallSpinner';

export default React.memo(({ agencyId }) => {
  const [onboardingList, setOnboardingList] = useState([]);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [wabaCredentials, setWabaCredentials] = useState([]);

  useEffect(() => {
    (async () => {
      setStatus(constant.API_STATUS.PENDING);
      const res = await api.whatsapp.getOnboardingList(
        agencyId,
        // { status: 'pending,submitted' },
        {},
        false,
      );

      if (h.cmpStr(res.status, 'ok')) {
        setOnboardingList(res.data.submissions);
      }

      await getWabaCredentials();

      setStatus(constant.API_STATUS.FULLFILLED);
    })();
  }, []);

  function getStatus(status) {
    switch (status) {
      case 'pending':
        return {
          pending: true,
          review: false,
          done: false,
          className: 'pending',
        };
      case 'submitted':
        return {
          pending: true,
          review: true,
          done: false,
          className: 'review',
        };
      case 'confirmed':
        return {
          pending: true,
          review: true,
          done: true,
          className: 'done',
        };
    }
  }

  function getClass(status, s) {
    if (status === 'confirmed') {
      return 'done';
    }
    return s;
  }

  const getDateTime = (stringDate, type) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const msgDate = h.date.convertUTCDateToLocalDate(
      stringDate + ' GMT',
      timeZone,
      'en-AU',
      {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );

    const date2 = new Date(msgDate);

    let formattedDate = date2.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

    let formattedTime = date2.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    switch (type) {
      case 'date':
        return formattedDate;
      case 'time':
        return formattedTime;
      default:
        return formattedDate + ' ' + formattedTime;
    }
  };

  async function getWabaCredentials() {
    const credentials = await api.whatsapp.getAgencyWhatsAppConfigurations(
      agencyId,
      false,
    );
    setWabaCredentials(credentials.data.agency_whatsapp_config);
  }

  function WhatsAppCount() {
    return (
      <div className="info-dash-wrapper d-flex">
        <div className="info-dash-wrapper-item d-flex flex-row justify-content-between">
          <div className="d-flex flex-row gap-1">
            <div className="center-body">
              <img
                src={'https://cdn.yourpave.com/assets/whatsapp-logo.png'}
                width={'40'}
                style={{ margin: '8px 3px' }}
              />
            </div>
            <div className="info-dash-wrapper-item-details d-flex flex-row">
              <div className="d-flex flex-column">
                <label>WhatsApp Business Account</label>
                <span>{wabaCredentials.length} connected account/s</span>
              </div>
            </div>
          </div>
          {onboardingList.filter((f) =>
            ['pending', 'submitted'].includes(f.status),
          ).length > 0 && (
            <button
              className="common-button-2 mt-1 text-normal black"
              onClick={() => {
                window.location = h.getRoute(routes.settings.integrations + '?new_connection=whatsapp');
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status === constant.API_STATUS.PENDING) return <SmallSpinner />;
  if (onboardingList.filter((f) => f.status !== 'confirmed').length === 0)
    return (
      <>
        {WhatsAppCount()}
        <div className="info-dash-wrapper d-flex">
          <div
            className="info-dash-wrapper-item"
            style={{ padding: '26px 10px', background: '#aae4ff1f' }}
          >
            <div className="center-body">
              <IconBlueSetting
                width="200px"
                height="60px"
                style={{ marginBottom: '30px' }}
              />
              <h3
                style={{
                  fontSize: '15px',
                  fontFamily: 'PoppinsRegular',
                  textAlign: 'center',
                }}
              >
                Channel Integrations
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  fontFamily: 'PoppinsRegular',
                  textAlign: 'center',
                  color: '#9b9b9b',
                  padding: '10px 50px',
                }}
              >
                Connect your account <br />
                to our channels and get started with <br />
                campaigns and automations
              </p>
              <button
                className="common-button-2 mt-1 text-normal black"
                onClick={() => {
                  window.location = h.getRoute(routes.settings.integrations + '?new_connection=whatsapp');
                }}
              >
                <span>
                  {onboardingList.filter((f) => f.status === 'confirmed')
                    .length > 0
                    ? 'Connect another'
                    : 'Connect'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
      {WhatsAppCount()}
      {h.notEmpty(
        onboardingList.filter((f) => f.status !== 'confirmed').length,
      ) &&
        onboardingList
          .filter((f) => f.status !== 'confirmed')
          .map((submission, index) => {
            const { pending, review, done } = getStatus(submission.status);
            return (
              <div className="timeline-wrapper" key={index}>
                <h3>
                  WhatsApp Channel Onboarding
                  <span>Business Name: {submission.client_company_name}</span>
                </h3>
                <div className="timeline-container">
                  <ul className="tl">
                    <li
                      className={`${
                        pending ? getClass(submission.status, 'pending') : ''
                      }`}
                    >
                      <div className="item-icon"></div>
                      <div className="item-text">
                        <div className="item-title">Pending</div>
                        <div className="item-detail">
                          Request sent to Chaaat Team
                        </div>
                      </div>
                      <div className="item-timestamp">
                        {getDateTime(submission.pending_date, 'date')}
                        <br /> {getDateTime(submission.pending_date, 'time')}
                      </div>
                    </li>
                    <li
                      className={`tl-item ${
                        review ? getClass(submission.status, 'review') : ''
                      }`}
                    >
                      <div className="item-icon"></div>
                      <div className="item-text">
                        <div className="item-title">Submitted</div>
                        <div className="item-detail">
                          Information sent is ready for confirmation
                        </div>
                      </div>
                      {h.notEmpty(submission.submitted_date) && (
                        <div className="item-timestamp">
                          {getDateTime(submission.submitted_date, 'date')}
                          <br />{' '}
                          {getDateTime(submission.submitted_date, 'time')}
                        </div>
                      )}
                    </li>
                    <li
                      className={`tl-item ${
                        done ? getClass(submission.status, 'done') : ''
                      }`}
                    >
                      <div className="item-icon"></div>
                      <div className="item-text">
                        <div className="item-title">Confirmed</div>
                        <div className="item-detail">
                          {submission.status !== 'confirmed'
                            ? 'Waiting for confirmation'
                            : 'WhatsApp account is now confirmed and connected'}
                        </div>
                      </div>
                      {h.notEmpty(submission.confirmed_date_raw) && (
                        <div className="item-timestamp">
                          {moment(submission.confirmed_date_raw).format(
                            'DD MMM YYYY',
                          )}
                          <br />{' '}
                          {moment(
                            submission.confirmed_date_raw,
                            'HH:mm',
                          ).format('HH:mm')}
                        </div>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            );
          })}
      <hr />
    </>
  );
});
