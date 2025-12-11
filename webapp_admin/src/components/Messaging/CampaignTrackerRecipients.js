import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { h } from '../../helpers';
import { api } from '../../api';
import {
  faTimes,
  faUserSlash,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import CommonSelect from '../../components/Common/CommonSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DateFilter from '../Contact/DateFilter';
import CommonTooltip from '../Common/CommonTooltip';

const messageStatus = [
  'all messages',
  'sent',
  'delivered',
  'failed',
  'read',
  'replied',
];

export default React.memo(
  ({ tracker, platform = 'whatsapp', handleCloseModal }) => {
    const currentDate = moment();
    const [searchText, setSearchText] = useState('');
    const [selectedMessageStatus, setSelectedMessageStatus] = useState({
      label: 'ALL MESSAGES',
      value: 'all messages',
    });
    const [contacts, setContacts] = useState([]);
    const [dateFilter, setDateFilter] = useState({
      from: moment(currentDate).startOf('month').toISOString(),
      to: currentDate.endOf('month').toISOString(),
    });

    const debouncedQuery = h.general.useDebounce(searchText, 700);

    useEffect(() => {
      (async () => {
        let response;
        if (h.cmpStr(platform, 'whatsapp')) {
          response = await api.agency.getWhatsAppMessageTrackerRecipients(
            {
              agency_id: tracker.agency_fk,
              tracker_ref_name: tracker.tracker_ref_name,
            },
            {
              pageIndex: 0,
              pageSize: 100000,
              sortColumn: 'created_date',
              sortOrder: 'DESC',
              search: searchText,
              searchStatus: selectedMessageStatus.value,
            },
            false,
          );
        }

        if (h.cmpStr(platform, 'line')) {
          response = await api.agency.getLineMessageTrackerRecipients(
            {
              agency_id: tracker.agency_fk,
              tracker_ref_name: tracker.tracker_ref_name,
            },
            {
              pageIndex: 0,
              pageSize: 100000,
              sortColumn: 'created_date',
              sortOrder: 'DESC',
              search: searchText,
              searchStatus: selectedMessageStatus.value,
            },
            false,
          );
        }

        if (h.cmpStr(response.status, 'ok')) {
          setContacts(response.data.list);
        }
      })();
    }, [tracker, selectedMessageStatus, debouncedQuery]);

    return (
      <div className="campaign-schedule-wrapper input-search">
        <div className="campaign-schedule-body">
          <div className=" d-flex justify-content-between">
            <h1>
              Campaign Message Recipients
              <small
                style={{ display: 'block', color: '#989898', fontSize: '14px' }}
              >
                {contacts.length} contacts
              </small>
            </h1>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                onClick={handleCloseModal}
                style={{
                  cursor: 'pointer',
                  fontSize: '1em',
                  marginLeft: '3em',
                }}
              >
                <FontAwesomeIcon
                  icon={faTimes}
                  color="#182327"
                  style={{ fontSize: '15px' }}
                />
              </span>
            </div>
          </div>
          <div
            className="d-flex"
            style={{ gap: '1em', alignItems: 'baseline', marginBottom: '10px' }}
          >
            <div style={{ flex: '0 300px' }}>
              <div className="search-message-wrapper">
                <div class="group">
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <g>
                      <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                    </g>
                  </svg>
                  <input
                    type="search"
                    class="input"
                    placeholder="Search name/mobile/email..."
                    value={searchText || ''}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div className="contact-filter" style={{ flex: '0 300px' }}>
              <CommonSelect
                id="message_status"
                options={messageStatus.map((m) => ({
                  label: m.toUpperCase(),
                  value: m,
                }))}
                value={selectedMessageStatus}
                isSearchable={false}
                onChange={(e) => {
                  setSelectedMessageStatus(e);
                }}
                placeholder="Select Message Status"
                className=""
                control={{
                  height: 40,
                  minHeight: 40,
                  borderRadius: 8,
                }}
              />
            </div>
          </div>

          <div
            style={{ overflow: 'auto', height: '380px' }}
            className="new-table"
          >
            {contacts.length > 0 && (
              <table className="contact-summary-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th style={{ width: '170px' }}>Phone</th>
                    <th style={{ width: '300px' }}>Email</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>Sent</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>
                      Delivered
                    </th>
                    <th style={{ width: '80px', textAlign: 'center' }}>
                      Failed
                    </th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Read</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>
                      Replied
                    </th>
                  </tr>
                </thead>
                <tbody className="long">
                  {contacts.map((contact, i) => (
                    <tr>
                      <td>
                        {contact.contact.first_name} {contact.contact.last_name}
                      </td>
                      <td>{contact.contact.mobile_number}</td>
                      <td>
                        {contact.contact.email ? contact.contact.email : '--'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color: contact.sent ? '#3fc860' : '#fe5959',
                        }}
                      >
                        {contact.sent ? 'Yes' : 'No'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color: contact.delivered ? '#3fc860' : '#fe5959',
                        }}
                      >
                        {contact.delivered ? 'Yes' : 'No'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color: contact.failed ? '#3fc860' : '#fe5959',
                        }}
                      >
                        {contact.failed ? (
                          <CommonTooltip
                            tooltipText={
                              contact.failed === 1 && !contact.failed_reason
                                ? 'Failed to send to number'
                                : h.cmpStr(
                                      contact.failed_reason,
                                      'Contact Opt Out',
                                    )
                                  ? contact.failed_reason
                                  : JSON.parse(contact.failed_reason)
                                      .map((m) => m.title)
                                      .join(' ,')
                            }
                          >
                            <div>
                              Yes
                              <FontAwesomeIcon
                                icon={faInfoCircle}
                                color="#08453d"
                                style={{
                                  fontSize: '15px',
                                  marginLeft: '5px',
                                  display: 'inline-block',
                                }}
                              />
                            </div>
                          </CommonTooltip>
                        ) : (
                          'No'
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color: contact.read ? '#3fc860' : '#fe5959',
                        }}
                      >
                        {contact.read ? 'Yes' : 'No'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color: contact.replied ? '#3fc860' : '#fe5959',
                        }}
                      >
                        {contact.replied ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {contacts.length === 0 && (
              <div className="no-messages-found">
                <span>
                  <FontAwesomeIcon
                    icon={faUserSlash}
                    color="#DEE1E0"
                    style={{ fontSize: '40px' }}
                  />
                </span>
                <br />
                No recipient found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
