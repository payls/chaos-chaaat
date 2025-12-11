import React, { useState, useEffect, useRef, useMemo } from 'react';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import moment from 'moment';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { routes } from '../../../configs/routes';

// ICON
import IconContact from '../../../components/Icons/IconContact';
import {
  faPaperPlane,
  faCheckDouble,
  faCommentSlash,
  faComments,
  faClock,
  faCheckCircle,
  faChartBar,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import CommonResponsiveTable from '../../../components/Common/CommonResponsiveTable';
import CommonTooltip from '../../../components/Common/CommonTooltip';

import IconSearch from '../../../components/Icons/IconSearch';
import ContactFilter from '../../../components/Contact/ContactFilter';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';

export default function SmsSharedInbox() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [contactName, setContactName] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [trackerData, setTrackerData] = useState(null);
  const handleDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
    const duplicateQueries = h.general.deepCloneObject(allQueries);

    duplicateQueries.setFilter.from = startDate;
    duplicateQueries.setFilter.to = endDate;
    setAllQueries(duplicateQueries);
  };
  const [overview, setOverview] = useState({
    sent: 0,
    delivered: 0,
    failed: 0,
    replied: 0,
  });
  const [messages, setMessages] = useState([]);
  const [agencyUser, setAgencyUser] = useState({});
  const [options, setOptions] = useState({});
  const [allQueries, setAllQueries] = useState({
    setFilter: {
      from: '',
      to: '',
    },
  });
  const initialColumns = [
    {
      id: 'tracker_ref_name',
      Header: 'Campaign Name',
      accessor: (row) => {
        return row.tracker_ref_name;
      },
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { tracker_ref_name } = original;
        if (h.isEmpty(tracker_ref_name)) {
          return <span>None</span>;
        }
        return (
          <span
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              router.push(
                h.getRoute(routes.dashboard['sms.inbox'], {
                  campaign: original.tracker_ref_name,
                }),
                undefined,
                { shallow: true },
              );
            }}
          >
            {tracker_ref_name}
          </span>
        );
      },
    },
    {
      id: 'created_date',
      Header: 'Campaign Date',
      accessor: (row) => (h.isEmpty(row.created_date) ? '' : row.created_date),
      filter: 'text',
      sortType: 'date',
      Cell: ({ row: { original } }) => {
        const { created_date } = original;
        if (h.isEmpty(created_date)) {
          return <span>None</span>;
        }
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateTime = h.date.convertUTCDateToLocalDate(
          moment(created_date).utc(false).format('DD MMM YYYY hh:mm a') +
            ' GMT',
          localTimezone,
          'en-AU',
          {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          },
        );
        return <span>{dateTime}</span>;
      },
    },
    {
      id: 'w-sent',
      Header: 'Sent',
      accessor: (row) => (h.isEmpty(row.total_sent) ? '' : row.total_sent),
      filter: 'text',
      headerWidth: '100px',
      Cell: ({ row: { original } }) => {
        const { total_sent } = original;
        const percentage = getPercentage(total_sent, total_sent);
        return (
          <div
            className="w-progressbar"
            role="progressbar"
            aria-valuenow={percentage >= 0 ? percentage : 0}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
              '--value': percentage >= 0 ? percentage : 0,
              '--fgcolor': getColor(percentage >= 0 ? percentage : 0),
            }}
          ></div>
        );
      },
    },
    {
      id: 'w-delivered',
      Header: 'Delivered',
      accessor: (row) =>
        h.isEmpty(row.total_delivered) ? '' : row.total_delivered,
      filter: 'text',
      headerWidth: '100px',
      Cell: ({ row: { original } }) => {
        const { total_sent, total_delivered } = original;
        const percentage = getPercentage(total_delivered, total_sent);
        return (
          <div
            className="w-progressbar"
            role="progressbar"
            aria-valuenow={percentage >= 0 ? percentage : 0}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
              '--value': percentage >= 0 ? percentage : 0,
              '--fgcolor': getColor(percentage >= 0 ? percentage : 0),
            }}
          ></div>
        );
      },
    },
    {
      id: 'w-failed',
      Header: 'Failed',
      accessor: (row) => (h.isEmpty(row.total_failed) ? '' : row.total_failed),
      filter: 'text',
      headerWidth: '100px',
      Cell: ({ row: { original } }) => {
        const { total_sent, total_failed } = original;
        const percentage = getPercentage(total_failed, total_sent);
        return (
          <div
            className="w-progressbar"
            role="progressbar"
            aria-valuenow={percentage >= 0 ? percentage : 0}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
              '--value': percentage >= 0 ? percentage : 0,
              '--fgcolor': getColor(percentage >= 0 ? percentage : 0),
            }}
          ></div>
        );
      },
    },
    {
      id: 'w-replied',
      Header: 'Replied',
      accessor: (row) =>
        h.isEmpty(row.total_replied) ? '' : row.total_replied,
      filter: 'text',
      headerWidth: '100px',
      Cell: ({ row: { original } }) => {
        const { total_replied, batch_count } = original;
        const percentage = getPercentage(total_replied, batch_count);

        return (
          <div
            className="w-progressbar"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ '--value': percentage, '--fgcolor': getColor(percentage) }}
          ></div>
        );
      },
    },
    {
      id: 'batch_count',
      Header: 'Batch Count',
      accessor: (row) => {
        return row.batch_count;
      },
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { batch_count } = original;
        if (h.isEmpty(batch_count)) {
          return <span>None</span>;
        }
        return <span>{batch_count}</span>;
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const tableColumns = useMemo(() => columns, [columns]);

  useEffect(() => {
    (async () => {
      if (h.notEmpty(agencyUser)) {
        const apiRes = await api.agencyUser.getAgencyUsers(
          { agency_fk: agencyUser.agency.agency_id },
          false,
        );
        if (h.cmpStr(apiRes.status, 'ok')) {
          let agencyUsers = [];
          for (const agencyUser of apiRes.data.agency_users) {
            agencyUsers.push({
              value: agencyUser.agency_user_id,
              label: agencyUser.user.full_name,
            });
          }
          setOptions({ ...options, contactOwners: agencyUsers });
        }
      }
    })();
  }, [agencyUser]);

  const getSmsRecords = async (values = {}) => {
    setLoading(true);
    const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      if (apiRes.data.agencyUser) {
        setAgencyUser(apiRes.data.agencyUser);
      }
      const smsAppRes = await api.sms.getRecords(
        {
          agency_id: apiRes.data.agencyUser.agency_fk,
          ...values,
        },
        false,
      );
      if (h.cmpStr(smsAppRes.status, 'ok')) {
        setMessages(smsAppRes.data.results);
        setOverview(smsAppRes.data.preview);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    (async () => {
      await getSmsRecords({
        allQueries: allQueries,
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await getSmsRecords({
        allQueries: allQueries,
      });
    })();
  }, [allQueries]);

  const getPercentage = (value, total_value) => {
    let portion_value = value / total_value;
    let total = Math.ceil(portion_value * 100);

    return total;
  };

  const getColor = (value) => {
    if (value <= 25) {
      return '#4877ff';
    } else if (value <= 50) {
      return '#4877ff';
    } else if (value <= 75) {
      return '#00ce8c';
    } else if (value <= 100) {
      return '#00ce8c';
    }
  };

  return (
    <>
      <div id="messaging-root">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading} className="messaging-wrapper">
          <div className="messaging-container modern-style">
            <div
              className="message-navigation"
              style={{ height: '100% !important' }}
            >
              <div
                className=""
                onClick={() => router.push(routes.dashboard.messaging)}
              >
                <CommonTooltip
                  tooltipText={'WhatsApp Shared Inbox'}
                  placement={'right'}
                >
                  <IconWhatsApp width="30" color={'#fff'} />
                </CommonTooltip>
              </div>
              <div
                className="active"
                onClick={() => router.push(routes.dashboard.sms)}
              >
                <CommonTooltip
                  tooltipText={'SMS Shared Inbox'}
                  placement={'right'}
                >
                  <IconSMS width="30" color={'#fff'} />
                </CommonTooltip>
              </div>
              <div onClick={() => router.push(routes.dashboard.comments)}>
                <CommonTooltip tooltipText={'Comments'} placement={'right'}>
                  <IconComments width="30" color={'#fff'} />
                </CommonTooltip>
              </div>
            </div>

            <div
              className="message-body"
              style={{ width: '100%', padding: '10px', overflow: 'auto' }}
            >
              <div className="">
                <div className="pl-3 pr-3 pb-2">
                  <div className="d-flex justify-content-between">
                    <h1
                      style={{
                        fontFamily: 'PoppinsRegular',
                        textIndent: '-15px',
                        lineHeight: '55px',
                        fontSize: '20px',
                      }}
                    >
                      SMS Shared Inbox
                    </h1>

                    <div
                      className="d-flex mr-1 justify-content-end"
                      style={{ flexGrow: 1 }}
                    >
                      <CommonTooltip tooltipText="Reload">
                        <button
                          className="btn refresh-btn"
                          onClick={async () =>
                            await getSmsRecords({
                              allQueries: allQueries,
                            })
                          }
                          style={{ padding: 0 }}
                        >
                          <FontAwesomeIcon
                            icon={faRedo}
                            color="#025146"
                            size="2x"
                            style={{ marginRight: 0 }}
                            spin={isLoading}
                          />
                        </button>
                      </CommonTooltip>
                    </div>
                  </div>
                  <div className="row">
                    <div className="whatsapp-overview-wrapper d-flex flex-wrap">
                      <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                        <div className="whatsapp-overview-wrapper-item-icon">
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            style={{ cursor: 'pointer' }}
                            color="#08453D"
                            size="lg"
                          />
                        </div>
                        <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                          <label>Total Sent</label>
                          <span>{overview.sent}</span>
                        </div>
                      </div>

                      <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                        <div className="whatsapp-overview-wrapper-item-icon">
                          <FontAwesomeIcon
                            icon={faCheckDouble}
                            style={{ cursor: 'pointer' }}
                            color="#08453D"
                            size="lg"
                          />
                        </div>
                        <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                          <label>Total Delivered</label>
                          <span style={{ color: '#00c203' }}>
                            {overview.delivered}
                          </span>
                        </div>
                      </div>

                      <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                        <div className="whatsapp-overview-wrapper-item-icon">
                          <FontAwesomeIcon
                            icon={faCommentSlash}
                            style={{ cursor: 'pointer' }}
                            color="#08453D"
                            size="lg"
                          />
                        </div>
                        <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                          <label>Total Failed</label>
                          <span style={{ color: '#ff4141' }}>
                            {overview.failed}
                          </span>
                        </div>
                      </div>

                      <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                        <div className="whatsapp-overview-wrapper-item-icon">
                          <FontAwesomeIcon
                            icon={faComments}
                            style={{ cursor: 'pointer' }}
                            color="#08453D"
                            size="lg"
                          />
                        </div>
                        <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                          <label>Total Replied</label>
                          <span style={{ color: '#1c83ff' }}>
                            {overview.replied}
                          </span>
                        </div>
                      </div>
                    </div>

                    {h.notEmpty(messages) ? (
                      <div className="tab-body">
                        <CommonResponsiveTable
                          columns={tableColumns}
                          data={messages}
                          options={{
                            scrollable: true,
                          }}
                          thHeight="50px"
                        />
                      </div>
                    ) : (
                      <div className="d-flex w-100 align-items-center justify-content-center">
                        <img
                          style={{ width: '65%' }}
                          width="100%"
                          src="https://cdn.yourpave.com/assets/empty-data-2x.png"
                          alt={'profile picture'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
