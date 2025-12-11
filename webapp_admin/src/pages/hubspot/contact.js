import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import { api as api2 } from '../../components/Sale/Link/preview/api';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes';
import Link from 'next/link';
import Swal from 'sweetalert2';
// ICON
import {
  faPlus,
  faRedo,
  faInfoCircle,
  faEdit,
  faEye,
  faTrash,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonIconButton from '../../components/Common/CommonIconButton';

// Components
import Contacts from '../../components/HubSpot/Contacts';
import useHubSpotStore from '../../components/HubSpot/store';

export default function CampaignTemplateList() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const { linkDetails, setStoreLinkDetails, contactsArray, hbObjectStore } =
  useHubSpotStore();

  const [agency, setAgency] = useState(null);
  const [tab, setTab] = useState('all-contacts');

  useEffect(() => {
    const { list } = router.query;
    setStoreLinkDetails({ ...linkDetails, list });
  }, [router]);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const agency = apiRes.data.agencyUser.agency;
        setAgency(agency);
      }
    })();
  }, []);

  async function importContacts() {
    h.general.prompt(
      {
        message: `Are you sure to import selected HubSpot contacts?`,
      },

      async (status) => {
        if (status) {
          setLoading(constant.API_STATUS.PENDING);
          h.general.alert('info', {
            message: `Please wait while we import the contacts. Don't refresh or close the page. Thank you.`,
            autoCloseInSecs: 5,
          });

          const chunkedArray = chunkArray(contactsArray, 5);
          let importRes = null;
          for (let i = 0; i < chunkedArray.length; i++) {
            importRes = await api.contact.importHubSpotContacts(
              {
                contact_list: chunkedArray[i],
              },
              agency.agency_id,
              hbObjectStore.value,
            );
          }

          if (h.cmpStr(importRes.status, 'ok')) {
            h.general.alert('success', {
              message: 'Contact successfully imported.',
            });
          }


          setTimeout(() => {
            window.location = routes.dashboard.leads.all_leads;
          }, 3000);

          setLoading(constant.API_STATUS.FULLFILLED);
        }
      },
    );
  }

  function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
  }

  return (
    <>
      <div className="contacts-root layout-v">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading}>
          <div className="n-banner">
            <div className="container dashboard-contacts-container contacts-container">
              <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
                <div>
                  <h1>Import Prospect Contacts from HubSpot</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style no-oxs">
            <div className="container dashboard-contacts-container">
              <div className="pl-3 pr-3">
                <div className="row">
                  <div className="tab-container">
                    <div className="tab-list">
                      <div
                        className={`tab ${
                          tab === 'all-contacts' ? 'active-tab' : ''
                        }`}
                        onClick={() => setTab('all-contacts')}
                      >
                        <span>HubSpot contacts</span>
                      </div>
                    </div>
                    {tab === 'all-contacts' && (
                      <div className="btn-list">
                        <div className="button-icon-container">
                          <CommonIconButton
                            className="c-red"
                            style={{ paddingLeft: '10px', width: '180px' }}
                            onClick={importContacts}
                            disabled={contactsArray.length === 0}
                          >
                            <FontAwesomeIcon
                              icon={faUsers}
                              color="#fff"
                              fontSize="20px"
                              className="mr-2"
                            />
                            Import Contacts{' '}
                            {contactsArray.length !== 0
                              ? `(${contactsArray.length})`
                              : ''}
                          </CommonIconButton>
                        </div>
                      </div>
                    )}
                    {tab === 'reports' && (
                      <div className="btn-list">
                        <div className="button-icon-container">
                          <CommonIconButton
                            className="c-red"
                            style={{ paddingLeft: '10px', width: '180px' }}
                            onClick={() => {
                              router.push(
                                h.getRoute(
                                  routes.salesforce.mapping,
                                  linkDetails,
                                ),
                                undefined,
                                { shallow: true },
                              );
                            }}
                            disabled={h.isEmpty(linkDetails?.report_id)}
                          >
                            <FontAwesomeIcon
                              icon={faUsers}
                              color="#fff"
                              fontSize="20px"
                              className="mr-2"
                            />
                            Add and create list
                          </CommonIconButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white">
              <div className="container dashboard-contacts-container modern-style">
                <div className="pl-3 pr-3 pb-2">
                  <div className="row">
                    <div className="tab-body">
                      {agency && tab === 'all-contacts' && (
                        <Contacts agency={agency} />
                      )}
                    </div>
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
