import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../api';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import moment from 'moment';
import IconBlueSetting from '../ProposalTemplate/Link/preview/components/Icons/IconBlueSetting';
import { routes } from '../../configs/routes';
import SmallSpinner from '../Inbox/SmallSpinner';

import IconCircleCheck from '../../components/Icons/IconCircleCheck';
import IconCircleCheckBlur from '../../components/Icons/IconCircleCheckBlur';

export default React.memo(({ agencyId, setConnectedAccountCount, onboardingList, setOnboardingList }) => {
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [selected, setSelected] = useState(0);

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
      return <IconCircleCheck width={100} />;
    }
    return <IconCircleCheckBlur width={100} />;
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
    setConnectedAccountCount(credentials.data.non_trial_agency_whatsapp_config?.length);
    setWabaCredentials(credentials.data.agency_whatsapp_config);
  }

  const onboardingSelectedData = useMemo(() => {
    return (
      onboardingList.filter((f) => f.status !== null)[selected] ?? []
    );
  }, [selected, onboardingList]);

  const onboardingData = useMemo(() => {
    return onboardingList.filter((f) => f.status !== null);
  }, [onboardingList]);

  if (status === constant.API_STATUS.PENDING) return <SmallSpinner />;
  if (h.isEmpty(onboardingSelectedData)) return null;

  return (
    <div className="onboarding-content">
      <div className="onboarding-content-header d-flex justify-content-between align-items-center">
        <span>WhatsApp Channel Onboarding</span>
        <span>
          Business Name:
          {onboardingData.length === 1 ? (
            <b> {onboardingSelectedData.client_company_name}</b>
          ) : (
            <select onChange={(e) => setSelected(e.target.value)}>
              {onboardingData.map((v, i) => (
                <option key={i} value={i}>
                  {v.client_company_name}
                </option>
              ))}
            </select>
          )}
        </span>
      </div>
      <div className="d-flex justify-content-between align-items-start zInd prog">
        <div>
          {['pending', 'submitted', 'confirmed'].includes(
            onboardingSelectedData.status,
          ) ? (
            <IconCircleCheck width={100} />
          ) : (
            <IconCircleCheckBlur width={100} />
          )}
          <h3>Pending</h3>
          <p>
            Request sent to Chaaat team{' '}
            <span> {getDateTime(onboardingSelectedData.pending_date, '')}</span>
          </p>
        </div>
        <div className={`stroke`}></div>
        <div>
          {['submitted', 'confirmed'].includes(onboardingSelectedData.status) ? (
            <IconCircleCheck width={100} />
          ) : (
            <IconCircleCheckBlur width={100} />
          )}
          <h3>Submitted</h3>{' '}
          <p>
            Information sent is ready for confirmation{' '}
            {h.notEmpty(onboardingSelectedData.submitted_date) && (
              <span>
                {' '}
                {getDateTime(onboardingSelectedData.submitted_date, '')}
              </span>
            )}
          </p>
        </div>
        <div
          className={`stroke ${
            ['submitted', 'done'].includes(onboardingSelectedData.status)
              ? ''
              : 'blur'
          }`}
        ></div>
        <div>
          {['confirmed'].includes(onboardingSelectedData.status) ? (
            <IconCircleCheck width={100} />
          ) : (
            <IconCircleCheckBlur width={100} />
          )}
          <h3>Confirmed</h3>{' '}
          <p>
            WABA successfully onboarded{' '}
            {h.notEmpty(onboardingSelectedData.confirmed_date) && (
              <span>
                {getDateTime(onboardingSelectedData.confirmed_date, '')}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
});
