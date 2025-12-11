import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../../components/Layouts/Layout';
import { h } from '../../../../helpers';
import { api } from '../../../../api';
import { routes } from '../../../../configs/routes';

// ICON
import {
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonIconButton from '../../../../components/Common/CommonIconButton';
import Lists from '../../../../components/HubSpot/Lists.js';
import useHubSpotStore from '../../../../components/HubSpot/store.js';
import Swal from 'sweetalert2';

export default function HubSpotContactList() {
  const router = useRouter();
  const { list } = router.query;
  const [isLoading, setLoading] = useState(false);
  const { linkDetails, setStoreLinkDetails } = useHubSpotStore();
  const [agency, setAgency] = useState(null);

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


  useEffect(() => {
    const { list } = router.query;
    setStoreLinkDetails({ ...linkDetails, list });
  }, [router]);

  async function addToList() {
    console.log(linkDetails);
    h.general.prompt(
      {
        message:
          `This will import all contacts from the selected HubSpot list to this contact list based on their phone/mobile numbers. Would you like to continue?`,
      },

      async (confirmAction) => {
        if (confirmAction) {
          setLoading(true);
          const listMembersRes = await api.contactListUser.fetchListMembers({agency_id: agency.agency_id, hubspot_list: linkDetails}, false);
          if (h.cmpStr(listMembersRes.status, 'ok')) {
            console.log(listMembersRes);
            const contactListSubmitRes =
              await api.contactListUser.importHubSpotContactList(
                { contact_list_id: list, contact_list: listMembersRes.data.membership },
                false,
              );
            if (h.cmpStr(contactListSubmitRes.status, 'ok')) {
              setLoading(false);
              window.location.href = h.getRoute(
                routes.templates.contact.list_view,
                {
                  list_id: list,
                },
              );
            }
            setLoading(false);
          } else {
            Swal.fire({
              title: 'HubSpot List Contact Pulling Failed!',
              icon: 'error',
              html: `Some went wrong during the pulling process. Please try again.`,
              confirmButtonColor: '#025146',
              confirmButtonText: 'OK',
            });
            setLoading(false);
          }
        }
      },
    );
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
                  <h1>Import Contacts from HubSpot</h1>
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
                        <span>Contact Lists</span>
                      </div>
                    </div>
                    <div className="btn-list">
                      <div className="button-icon-container">
                        <CommonIconButton
                          className="common-button"
                          style={{ paddingLeft: '10px', width: '180px' }}
                          onClick={() => {
                            addToList();
                          }}
                          disabled={h.isEmpty(linkDetails?.list_id)}
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
                      {agency && <Lists agency={agency} />}
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
