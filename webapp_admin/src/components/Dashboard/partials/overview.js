import React, { useState } from 'react';
import { h } from '../../../helpers';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCalendar,
  faDesktop,
  faCircle,
  faMobile,
  faEnvelope,
  faUser,
  faInfo,
  faCheck,
  faMapPin,
  faClipboardList,
  faClipboardCheck,
} from '@fortawesome/free-solid-svg-icons';
import ContactActivityList from './../ContactActivityList';
import IconWhatsAppBlack from '../../ProposalTemplate/Link/preview/components/Icons/IconWhatsAppBlack';
import IconLineApp from '../../ProposalTemplate/Link/preview/components/Icons/IconLineApp';
import IconSMS from '../../ProposalTemplate/Link/preview/components/Icons/IconSMS';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default React.memo(
  ({
    contact,
    contactActivities,
    viewMoreTrigger = true,
    data: {
      viewCount,
      lastViewedDate,
      lastViewedLocal,
      lastViewedDevice,
      mindBodyData,
    },
    currentLeadScore = null,
  }) => {
    const [viewMore, setViewMore] = useState(!viewMoreTrigger ? true : false);

    const convertActivityType = (activityType) => {
      const words = activityType.split('_').map((word) => {
        const firstChar = word.charAt(0).toUpperCase();
        const restOfString = word.slice(1).replace(/_/g, ' ');
        let activity = `${firstChar}${restOfString}`;
        activity = activity.replace(/\bProjet\b/g, 'Project');
        return activity;
      });

      return words.join(' ');
    };

    function getContractValue(arrValue) {
      let data = '';

      for (const v of arrValue) {
        data += `${v.ContractName}(${v.AutopayStatus}), `;
      }

      return data.substring(0, data.length - 2);
    }

    function getMemberShipValue(arrValue) {
      let data = '';

      for (const v of arrValue) {
        data += `${v.Name}, `;
      }

      return data.substring(0, data.length - 2);
    }

    function getVisitValue(arrValue, type) {
      switch (type) {
        case 'total':
          return arrValue.length;
        case 'last':
          if (arrValue.length === 1) {
            return null;
          }
          const last = arrValue
            .sort(function (a, b) {
              const endTimeA = moment(a.EndDateTime)
                .tz('Asia/Singapore')
                .valueOf();

              const endTimeB = moment(b.EndDateTime)
                .tz('Asia/Singapore')
                .valueOf();

              return endTimeA + endTimeB;
            })
            .filter((f) => {
              const now = moment().tz('Asia/Singapore').valueOf();

              const startTime = moment(f.EndDateTime)
                .tz('Asia/Singapore')
                .valueOf();

              return startTime < now;
            });

          return last.length !== 0 ? last[0].Name : null;
        case 'first':
          const first = arrValue.sort(function (a, b) {
            return new Date(b.EndDateTime) - new Date(a.EndDateTime);
          });

          return first[0].name;
        case 'next':
          const next = arrValue
            .sort(function (a, b) {
              const endTimeA = moment(a.StartDateTime)
                .tz('Asia/Singapore')
                .valueOf();

              const endTimeB = moment(b.StartDateTime)
                .tz('Asia/Singapore')
                .valueOf();

              return endTimeA - endTimeB;
            })
            .filter((f) => {
              const now = moment().tz('Asia/Singapore').valueOf();

              const startTime = moment(f.StartDateTime)
                .tz('Asia/Singapore')
                .valueOf();

              return startTime > now;
            });
          console.log(next);

          return next.length !== 0 ? next[next.length - 1].Name : null;
      }
    }
    return (
      <div
        id="contact-overview-root"
        className="contact-activity-overview-content message-user-info"
      >
        {contact && (
          <>
            <h1>
              {`${currentLeadScore ?? contact?.lead_score ?? ''} `}
              <small className="message-user-info-lead">Lead Score</small>
            </h1>
            <h3>{`${contact?.first_name ?? ''} ${
              contact?.last_name ?? ''
            }`}</h3>
            <div className="info-list">
              {contact?.user?.full_name && (
                <div>
                  <span>
                    <FontAwesomeIcon
                      icon={faUser}
                      color="#02021e"
                      style={{ fontSize: '15px' }}
                    />{' '}
                  </span>
                  <div>
                    <small className="smaill-title">Contact Owner</small>
                    <br />
                    {contact?.user?.full_name}
                  </div>
                </div>
              )}
              {contact?.mobile_number && (
                <div>
                  <span>
                    <FontAwesomeIcon
                      icon={faMobile}
                      color="#02021e"
                      style={{ fontSize: '15px' }}
                    />{' '}
                  </span>
                  <div>
                    <small className="smaill-title">Mobile</small>
                    <br />
                    <a href={`tel:${contact?.mobile_number}`}>
                      <b> {contact?.mobile_number}</b>
                    </a>
                  </div>
                </div>
              )}
              {contact?.email && (
                <div>
                  <span>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      color="#02021e"
                      style={{ fontSize: '15px' }}
                    />{' '}
                  </span>
                  <div>
                    <small className="smaill-title">Email</small>
                    <br />
                    <a href={`mailto:${contact?.email}}`}>
                      <b> {contact?.email}</b>
                    </a>
                  </div>
                </div>
              )}
              <div>
                <span>
                  <FontAwesomeIcon
                    icon={faEye}
                    color="#02021e"
                    style={{ fontSize: '15px' }}
                  />{' '}
                </span>
                <div>
                  <small className="smaill-title">Total number of views</small>
                  <br />
                  {viewCount}
                </div>
              </div>
              <div>
                <span>
                  <FontAwesomeIcon
                    icon={faCalendar}
                    color="#02021e"
                    style={{ fontSize: '15px' }}
                  />{' '}
                </span>
                <div>
                  <small className="smaill-title">Most recent view</small>
                  <br />
                  {lastViewedDate}{' '}
                  {lastViewedLocal ? '- ' + lastViewedLocal : ''}
                </div>
              </div>
              <div>
                <span>
                  <FontAwesomeIcon
                    icon={faDesktop}
                    color="#02021e"
                    style={{ fontSize: '15px' }}
                  />{' '}
                </span>
                <div>
                  <small className="smaill-title">Viewed on</small>
                  <br />
                  {h.contactActivity.prettifyViewOnDeviceString(
                    lastViewedDevice,
                  )}
                </div>
              </div>
              {viewMore && (
                <div>
                  <span>
                    <IconWhatsAppBlack width="15px" color={'#02021e'} />
                  </span>
                  <div style={{ width: ' calc(100% - 70px)' }}>
                    <small className="smaill-title">
                      WhatsApp Subscription
                    </small>
                    <br />
                    <b>{contact?.opt_out_whatsapp ? 'Opt-Out' : 'Opt-In'}</b>
                  </div>
                </div>
              )}
              {viewMore && (
                <div>
                  <span>
                    <IconLineApp width="25px" color={'#02021e'} />
                  </span>
                  <div style={{ width: ' calc(100% - 70px)' }}>
                    <small className="smaill-title">Line Subscription</small>
                    <br />
                    <b>Opt-In</b>
                  </div>
                </div>
              )}
              {viewMore && (
                <div>
                  <span>
                    <IconSMS width="15px" color={'#02021e'} />
                  </span>
                  <div style={{ width: ' calc(100% - 70px)' }}>
                    <small className="smaill-title">SMS Subscription</small>
                    <br />
                    <b>{contact?.opt_out_sms ? 'Opt-Out' : 'Opt-In'}</b>
                  </div>
                </div>
              )}
              {viewMoreTrigger && (
                <label
                  style={{
                    textAlign: 'center',
                    marginTop: '10px',
                    color: '#02021e',
                    // textDecoration: 'underline',
                    cursor: 'pointer',
                    fontFamily: 'PoppinsSemiBold',
                  }}
                  onClick={() => {
                    setViewMore(!viewMore);
                  }}
                >
                  View {viewMore ? 'less' : 'more'} info
                </label>
              )}
            </div>
            {(h.notEmpty(mindBodyData?.contracts) ||
              h.notEmpty(mindBodyData?.memberships) ||
              h.notEmpty(mindBodyData?.visits)) && (
              <>
                <h2>MindBody</h2>
                <div className="info-list">
                  {h.notEmpty(mindBodyData?.contracts) && (
                    <div>
                      <span>
                        <FontAwesomeIcon
                          icon={faInfo}
                          color="#02021e"
                          style={{ fontSize: '15px' }}
                        />{' '}
                      </span>
                      <div>
                        <small className="smaill-title">Contract Status</small>
                        <br />
                        {getContractValue(mindBodyData?.contracts)}
                      </div>
                    </div>
                  )}

                  {h.notEmpty(mindBodyData?.memberships) && (
                    <div>
                      <span>
                        <FontAwesomeIcon
                          icon={faCheck}
                          color="#02021e"
                          style={{ fontSize: '15px' }}
                        />{' '}
                      </span>
                      <div>
                        <small className="smaill-title">
                          Active Memberships / Packages
                        </small>
                        <br />
                        {getMemberShipValue(mindBodyData?.memberships)}
                      </div>
                    </div>
                  )}
                  {h.notEmpty(mindBodyData?.visits) && (
                    <>
                      <div>
                        <span>
                          <FontAwesomeIcon
                            icon={faMapPin}
                            color="#02021e"
                            style={{ fontSize: '15px' }}
                          />{' '}
                        </span>
                        <div>
                          <small className="smaill-title">Total Visits</small>
                          <br />
                          {getVisitValue(mindBodyData?.visits, 'total')}
                        </div>
                      </div>
                      {getVisitValue(mindBodyData?.visits, 'next') !== null && (
                        <div>
                          <span>
                            <FontAwesomeIcon
                              icon={faClipboardList}
                              color="#02021e"
                              style={{ fontSize: '15px' }}
                            />{' '}
                          </span>
                          <div>
                            <small className="smaill-title">Next Visit</small>
                            <br />
                            {getVisitValue(mindBodyData?.visits, 'next')}
                          </div>
                        </div>
                      )}

                      {getVisitValue(mindBodyData?.visits, 'last') !== null && (
                        <div>
                          <span>
                            <FontAwesomeIcon
                              icon={faClipboardCheck}
                              color="#02021e"
                              style={{ fontSize: '15px' }}
                            />{' '}
                          </span>
                          <div>
                            <small className="smaill-title">Last Visit</small>
                            <br />
                            {getVisitValue(mindBodyData?.visits, 'last')}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
            {contactActivities && contactActivities.length > 0 && (
              <>
                <h2>Activities</h2>

                <div className="user-activities">
                  {contactActivities.map((activity, i) => (
                    <div key={i}>
                      <FontAwesomeIcon
                        icon={faCircle}
                        color="#FE5959"
                        style={{
                          marginRight: '5px',
                          marginTop: '6px',
                          fontSize: '8px',
                        }}
                      />
                      <div className="d-flex flex-column">
                        <span>{activity.activity_date_time_ago}</span>
                        {convertActivityType(activity.activity_type)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  },
);
