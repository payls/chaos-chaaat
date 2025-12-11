import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { h } from '../../helpers';
import { api } from '../../api';

import {
  faTimes,
  faUserSlash,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default React.memo(({ oldContactId, agencyId, handleCloseModal }) => {
  const [searchText, setSearchText] = useState(null);
  const [contacts, setContacts] = useState('');

  const debouncedQuery = h.general.useDebounce(searchText, 700);

  useEffect(() => {
    if (searchText !== null) {
      (async () => {
        await searchContacts();
      })();
    }
  }, [debouncedQuery]);

  async function searchContacts() {
    const searchRes = await api.contact.search({
      agency_id: agencyId,
      search: searchText.toLowerCase(),
    });
    setContacts(searchRes.data.contacts);
  }

  /**
   * @TODO MERGE
   */
  async function merge(contact) {
    h.general.prompt(
      {
        message: `Are you sure you want to merge this contact to ${contact.first_name} ${contact.last_name}? This can't be reverted.`,
      },

      async (status) => {
        if (status) {
          const processMerge = await api.contact.mergeContacts({
            contact_id: oldContactId,
            new_contact_id: contact.contact_id,
          });

          if (h.cmpStr(processMerge.status, 'ok')) {
            window.location.reload();
          }
        }
      },
    );
  }
  return (
    <div className="campaign-schedule-wrapper input-search">
      <div className="campaign-schedule-body" style={{ width: '800px' }}>
        <div className="d-flex justify-content-between">
          <h1>Contacts</h1>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="long">
                {contacts.map((contact, i) => (
                  <tr>
                    <td>
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td>{contact.mobile_number}</td>
                    <td>{contact.email}</td>
                    <td>{contact?.agency_user?.user?.full_name}</td>

                    <td>
                      <button
                        tylpe="buttonm"
                        className="common-icon-button"
                        onClick={async () => {
                          await merge(contact);
                        }}
                      >
                        MERGE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {searchText !== null && contacts.length === 0 && (
            <div className="no-messages-found">
              <span>
                <FontAwesomeIcon
                  icon={faUserSlash}
                  color="#DEE1E0"
                  style={{ fontSize: '40px' }}
                />
              </span>
              <br />
              No contacts found
            </div>
          )}

          {searchText === null && (
            <div className="no-messages-found">
              <span>
                <FontAwesomeIcon
                  icon={faUsers}
                  color="#DEE1E0"
                  style={{ fontSize: '40px' }}
                />
              </span>
              <br />
              Search Contacts
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
