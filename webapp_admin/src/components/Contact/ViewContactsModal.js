import React, { useState } from 'react';
import moment from 'moment';

import { faTimes, faUserSlash } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonSearchInput from '../Sale/Link/preview/components/Common/CommonSearchInput';

export default React.memo(
  ({ contacts, handleSubmitList, handleCloseModal }) => {
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
        if (
          f?.mobile_number?.toLowerCase().includes(searchText.toLowerCase())
        ) {
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
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body md" style={{ minHeight: '400px' }}>
          <div className=" d-flex justify-content-between">
            <h1>
              Selected Contacts
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
          <CommonSearchInput
            callback={(e) => {
              setSearchText(e);
            }}
            placeholder={'Search name/mobile/email/contact owner...'}
            className={`mr-2`}
            disabled={false}
          />

          <div
            style={{ overflow: 'auto', height: '380px' }}
            className="new-table"
          >
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
                        {contact?.agency_user
                          ? contact?.agency_user?.user?.first_name +
                            ' ' +
                            contact?.agency_user?.user?.last_name
                          : 'no contact owner'}
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
                  No selected contacts found
                </div>
              ))}
          </div>
          <div className="center-body mt-4">
            <button
              tyle="button"
              className="modern-button common"
              style={{ width: '31%', borderRadius: '30px', height: '50px' }}
              onClick={handleSubmitList}
            >
              Save contacts to list
            </button>
          </div>
        </div>
      </div>
    );
  },
);
