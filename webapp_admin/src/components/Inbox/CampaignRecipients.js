import React, { useState } from 'react';
import moment from 'moment';
import { h } from '../../helpers';

import { faTimes, faUserSlash } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default React.memo(({ contacts, handleCloseModal }) => {
  const [searchText, setSearchText] = useState('');

  function searchContacts() {
    return contacts.filter((f) => {
      //Full name search
      if (
        (f?.first_name + ' ' + f?.last_name)
          ?.toLowerCase()
          .includes(searchText.toLowerCase())
      ) {
        return true;
      }

      // Mobile
      if (f?.mobile_number?.toLowerCase().includes(searchText.toLowerCase())) {
        return true;
      }

      // Email
      if (f?.email?.toLowerCase().includes(searchText.toLowerCase())) {
        return true;
      }

      // Contact owner
      if (
        (
          f?.agency_user?.user?.first_name +
          ' ' +
          f?.agency_user?.user?.last_name
        )
          ?.toLowerCase()
          .includes(searchText.toLowerCase())
      ) {
        return true;
      }

      return false;
    });
  }
  return (
    <div className="campaign-schedule-wrapper input-search">
      <div className="campaign-schedule-body">
        <div className=" d-flex justify-content-between">
          <h1>
            Campaign Scheduled Recipients
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
              <FontAwesomeIcon icon={faTimes} color="#182327" size="2x" />
            </span>
          </div>
        </div>
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
              placeholder="Search name/mobile/email/contact owner..."
              value={searchText || ''}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div style={{ overflow: 'auto', height: '380px' }}>
          {contacts.length > 0 && (
            <table className="contact-summary-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Contact Owner</th>
                </tr>
              </thead>
              <tbody className="long">
                {searchContacts().map((contact, i) => (
                  <tr>
                    <td>
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td>{contact.mobile_number}</td>
                    <td>{contact.email}</td>
                    <td>
                      {contact?.agency_user?.user?.first_name +
                        ' ' +
                        contact?.agency_user?.user?.last_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {contacts.length === 0 ||
            (searchContacts().length === 0 && (
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
            ))}
        </div>
      </div>
    </div>
  );
});
