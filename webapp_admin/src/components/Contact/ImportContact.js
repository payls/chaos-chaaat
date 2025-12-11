import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import { routes } from '../../configs/routes';
import { saveAs } from 'file-saver';
import { faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SmallSpinner from '../Inbox/SmallSpinner';

export default React.memo(
  ({ handleCloseModal, agency, listSource, onSelectNewContact }) => {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState('new');
    const [loading, setLoading] = useState(true);
    const [hasMarketingAccess, setHasMarketingAccess] = useState(true);
    const [hubspotIntegrationStatus, setHubspotIntegrationStatus] =
      useState(false);
    const [salesForceIntegrationStatus, setSalesForceIntegrationStatus] =
      useState(false);

    useEffect(() => {
      (async () => {
        setLoading(true);
        setHasMarketingAccess(await h.userManagement.hasMarketingAccess());

        const getHubspotIntegration =
          await api.integrations.getHubspotActiveIntegration(
            {
              agency_id: agency.agency_fk,
            },
            false,
          );

        if (h.cmpStr(getHubspotIntegration.status, 'ok')) {
          const { agency_oauth } = getHubspotIntegration.data;
          setHubspotIntegrationStatus(agency_oauth.status);
        }

        const getSfIntegration =
          await api.integrations.getSalesforceActiveIntegration(
            {
              agency_id: agency.agency_fk,
            },
            false,
          );

        if (h.cmpStr(getSfIntegration.status, 'ok')) {
          const { agency_oauth } = getSfIntegration.data;
          setSalesForceIntegrationStatus(agency_oauth.status);
        }

        setLoading(false);
      })();
    }, [agency]);

    function handleContinue() {
      if (selectedOption === 'new') {
        onSelectNewContact();
        handleCloseModal();
      }

      if (selectedOption === 'salesforce') {
        router.push(h.getRoute(routes.salesforce.contact, {}), undefined, {
          shallow: true,
        });
      }

      if (selectedOption === 'hubspot') {
        router.push(h.getRoute(routes.hubspot.contact, {}), undefined, {
          shallow: true,
        });
      }
    }

    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body md" style={{ minHeight: '400px' }}>
          <div className=" d-flex justify-content-between">
            <h1>&nbsp;</h1>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                onClick={() => handleCloseModal(false)}
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
          <div className=" modern-style pt-3 pr-5 pl-5 pb-5">
            <h1 className="heading-center">Add your contact</h1>
            <h2 className="sub-heading-center">
              Take control by selecting your desired method and get started!
            </h2>
            <div className="d-flex import-contacts">
              <div
                className={selectedOption === 'new' ? 'active' : ''}
                onClick={() => setSelectedOption('new')}
                style={{ display: h.notEmpty(listSource) ? 'none' : '' }}
              >
                <img
                  src={
                    'https://cdn.yourpave.com/assets/create_contact_fillup.png'
                  }
                  height={'100'}
                />
                <label style={{ textAlign: 'center' }}>Contact form</label>
                <p style={{ textAlign: 'center' }}>Fill up contact form</p>
                <small>&nbsp;</small>
              </div>

              {hasMarketingAccess && (
                <div
                  className={selectedOption === 'hubspot' ? 'active' : ''}
                  onClick={() => {
                    if (
                      hubspotIntegrationStatus ===
                      constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE
                    ) {
                      setSelectedOption('hubspot');
                    }
                  }}
                  style={{
                    display: h.notEmpty(listSource) ? 'none' : '',
                  }}
                >
                  <img
                    src={
                      'https://cdn.yourpave.com/assets/create_contact_hubspot.png'
                    }
                    height={'100'}
                    className={`${
                      hubspotIntegrationStatus ===
                      constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE
                        ? 'inactive'
                        : ''
                    }`}
                  />
                  <label style={{ textAlign: 'center', marginTop: '15px' }}>HubSpot</label>
                  {/* <p style={{ textAlign: 'center' }}>
                    {' '}
                    {hubspotIntegrationStatus ===
                    constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE
                      ? 'Pull contacts from HubSpot'
                      : 'Connect HubSpot to pull contacts'}
                  </p> */}
                  {hubspotIntegrationStatus ===
                  constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE ? (
                    <>
                      <p style={{ textAlign: 'center' }}>
                        Select from available HubSpot contacts
                      </p>
                    </>
                  ) : (
                    <small
                      onClick={() =>
                        router.push(
                          h.getRoute(routes.settings.integrations, {}),
                          undefined,
                          {
                            shallow: true,
                          },
                        )
                      }
                      style={{ color: '#0689ff', cursor: 'pointer' }}
                    >
                      Connect
                    </small>
                  )}
                  <small>&nbsp;</small>
                </div>
              )}

              {hasMarketingAccess && (
                <div
                  className={selectedOption === 'salesforce' ? 'active' : ''}
                  onClick={() => {
                    if (
                      salesForceIntegrationStatus ===
                      constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE
                    ) {
                      setSelectedOption('salesforce');
                    }
                  }}
                >
                  <img
                    src={
                      'https://cdn.yourpave.com/assets/create_contact_salesforce.png'
                    }
                    height={'100'}
                  />
                  <label style={{ textAlign: 'center' }}>Salesforce</label>
                  {salesForceIntegrationStatus ===
                  constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE ? (
                    <>
                      <p style={{ textAlign: 'center' }}>
                        Select from reports and add contacts
                      </p>
                    </>
                  ) : (
                    <small
                      onClick={() =>
                        router.push(
                          h.getRoute(routes.settings.integrations, {}),
                          undefined,
                          {
                            shallow: true,
                          },
                        )
                      }
                      style={{ color: '#0689ff', cursor: 'pointer' }}
                    >
                      Connect
                    </small>
                  )}

                  <small>&nbsp;</small>
                </div>
              )}
            </div>
            <div className="center-body mt-4">
              <button
                tyle="button"
                className="modern-button common"
                style={{ width: '31%', borderRadius: '30px', height: '50px' }}
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
