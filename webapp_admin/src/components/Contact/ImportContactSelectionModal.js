import React, { useState, useEffect, useRef } from 'react';
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
  ({
    listID,
    handleCloseModal,
    agency,
    lineChannels,
    listSource,
    listSourceValue,
  }) => {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState('existing');
    const [loading, setLoading] = useState(true);
    const [hasMarketingAccess, setHasMarketingAccess] = useState(true);
    const [hubspotIntegrationStatus, setHubspotIntegrationStatus] =
      useState(false);
    const [salesForceIntegrationStatus, setSalesForceIntegrationStatus] =
      useState(false);
    const hubspotStatusRef = useRef(hubspotIntegrationStatus);
    const salesforceStatusRef = useRef(salesForceIntegrationStatus);

    useEffect(() => {
      hubspotStatusRef.current = hubspotIntegrationStatus;
    }, [hubspotIntegrationStatus]);
  
    useEffect(() => {
      salesforceStatusRef.current = salesForceIntegrationStatus;
    }, [salesForceIntegrationStatus]);

    useEffect(() => {
      (async () => {
        setLoading(true);
        setHasMarketingAccess(await h.userManagement.hasMarketingAccess());

        const getHubspotIntegration =
          await api.integrations.getHubspotActiveIntegration(
            {
              agency_id: agency.agency_id,
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
              agency_id: agency.agency_id,
            },
            false,
          );

        if (h.cmpStr(getSfIntegration.status, 'ok')) {
          const { agency_oauth } = getSfIntegration.data;
          setSalesForceIntegrationStatus(agency_oauth.status);
        }

        setLoading(false);
      })();
    }, []);

    function handleContinue() {
      if (selectedOption === 'existing') {
        router.push(
          h.getRoute(routes.templates.contact.list_view_import_existing, {
            list_id: listID,
          }),
          undefined,
          {
            shallow: true,
          },
        );
      }

      if (selectedOption === 'csv') {
        router.push(
          h.getRoute(routes.templates.contact.list_view_import_upload, {
            list_id: listID,
          }),
          undefined,
          {
            shallow: true,
          },
        );
      }

      if (selectedOption === 'hubspot') {
        router.push(
          h.getRoute(routes.templates.contact.list_view_import_hubspot, {
            list_id: listID,
          }),
          undefined,
          {
            shallow: true,
          },
        );
      }

      if (selectedOption === 'line') {
        router.push(
          h.getRoute(routes.templates.contact.list_view_import_line, {
            list_id: listID,
          }),
          undefined,
          {
            shallow: true,
          },
        );
      }
      if (selectedOption === 'salesforce') {
        router.push(
          h.getRoute(routes.salesforce.reports, {
            contact_list: listID,
          }),
          undefined,
          {
            shallow: true,
          },
        );
      }
    }

    function downloadTemplate() {
      const header = 'First Name,Last Name,Phone Number,Email,Contact Owner\n';
      const csvData = new Blob([header], { type: 'csv' });
      saveAs(csvData, `Chaaat-contact-csv-template.csv`);
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
            <h1 className="heading-center">Import your contact</h1>
            <h2 className="sub-heading-center">
              Take control of the import process by selecting your desired
              source and get started!
            </h2>
            <div className="d-flex import-contacts">
              <div
                className={selectedOption === 'existing' ? 'active' : ''}
                onClick={() => setSelectedOption('existing')}
                style={{ display: h.notEmpty(listSource) ? 'none' : '' }}
              >
                <img
                  src={
                    'https://cdn.yourpave.com/assets/create_contact_fillup.png'
                  }
                  height={'100'}
                />
                <label style={{ textAlign: 'center' }}>Contacts</label>
                {/* <p style={{ textAlign: 'center' }}>
                  Select from existing contacts
                </p> */}
                <small style={{
                    color: '#0689ff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '20px',
                  }}
                >
                  &nbsp;
                </small>
              </div>
              <div
                className={selectedOption === 'csv' ? 'active' : ''}
                onClick={() => setSelectedOption('csv')}
                style={{ display: h.notEmpty(listSource) ? 'none' : '' }}
              >
                <img
                  src={
                    'https://cdn.yourpave.com/assets/create_contact_csv.png'
                  }
                  height={'100'}
                  style={{ marginTop: '5px', }}
                />
                <label style={{ textAlign: 'center', marginTop: '30px', }}>Upload CSV</label>
                {/* <p style={{ textAlign: 'center' }}>
                  Import contacts from your file
                </p> */}
                <small
                  onClick={() => downloadTemplate()}
                  style={{
                    color: '#0689ff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '10px',
                  }}
                >
                  Download template{' '}
                  <FontAwesomeIcon
                    icon={faDownload}
                    color="#0689ff"
                    // style={{ fontSize: '15px' }}
                  />
                </small>
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
                      hubspotStatusRef.current ===
                      constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.INACTIVE
                        ? 'inactive'
                        : ''
                    }`}
                  />
                  <label style={{ textAlign: 'center', marginTop: '15px' }}>HubSpot Contact List</label>
                  {/* <p style={{ textAlign: 'center' }}>
                    {' '}
                    {hubspotIntegrationStatus ===
                    constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE
                      ? 'Pull contacts from HubSpot'
                      : 'Connect HubSpot to pull contacts'}
                  </p> */}
                  {hubspotStatusRef.current ===
                  constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE ? (
                    <small>&nbsp;</small>
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
              {/* <div
                className={selectedOption === 'line' ? 'active' : ''}
                onClick={() => setSelectedOption('line')}
              >
                <img
                  src={
                    'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/line-logo.png'
                  }
                  height={'50'}
                />
                <label style={{ textAlign: 'center' }}>
                  Existing Line Contacts
                </label>

                <small>&nbsp;</small>
              </div> */}
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
                  <label style={{ textAlign: 'center', marginTop: '15px' }}>
                    Salesforce Reports
                  </label>
                  {salesForceIntegrationStatus ===
                  constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE ? (
                    <small>&nbsp;</small>
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
                  {/* <p style={{ textAlign: 'center' }}>
                  Select from reports and add contacts
                </p> */}
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
