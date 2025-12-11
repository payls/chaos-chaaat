import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
// ICON
import {
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonIconButton from '../../components/Common/CommonIconButton';

// Components
import Reports from '../../components/Salesforce/Reports';
import useSalesforceStore from '../../components/Salesforce/store';

export default function CampaignTemplateList() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const { linkDetails, setStoreLinkDetails } = useSalesforceStore();

  const [agency, setAgency] = useState(null);

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
                  <h1>Import Prospect Contacts from Salesforce</h1>
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
                      <div className={`tab active-tab`}>
                        <span>Reports</span>
                      </div>
                    </div>
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
                          Add to list
                        </CommonIconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white">
              <div className="container dashboard-contacts-container modern-style">
                <div className="pl-3 pr-3 pb-2">
                  <div className="row">
                    <div className="tab-body">
                      {agency && <Reports agency={agency} />}
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
