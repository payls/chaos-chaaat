import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import IconContact from '../../../components/Icons/IconContact';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import {
  faPlusCircle,
  faPlus,
  faUserPlus,
  faThumbtack,
} from '@fortawesome/free-solid-svg-icons';
import IconSearch from '../../../components/Icons/IconSearch';
import ContactListing from '../../../components/Contact/ContactListing';
import CreateContactModal from '../../../components/Contact/CreateContactModal';
import { useRouter } from 'next/router';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import ContactActivityOverview from '../../../components/Contact/ContactActivityOverview';
import CalendarModal from '../../../components/Contact/CalendarModal';
import NotesModal from '../../../components/Contact/NotesModal';
import CommonSearchInput from '../../../components/Sale/Link/preview/components/Common/CommonSearchInput';
import ImportContact from '../../../components/Contact/ImportContact';

export default function HubspotLeads() {
  const router = useRouter();

  const [isLoading, setLoading] = useState();
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [calendarModal, setCalendarModal] = useState(null);
  const [totalContacts, setTotalContacts] = useState();
  const [selectedContactId, setSelectedContactId] = useState('');
  const [formMode, setFormMode] = useState('');
  const [allQueries, setAllQueries] = useState({
    setFilter: {
      search: '',
      contactOwner: '',
      leadStatus: '',
      proposalSent: '',
      lastOpened: '',
    },
    moreFilter: {},
  });
  const [viewTabs, setViewTabs] = useState([]);
  const [hubspotIntegrationStatus, setHubspotIntegrationStatus] = useState({});
  const [salesForceIntegrationStatus, setSalesForceIntegrationStatus] =
    useState({});
  const [agencyUser, setAgencyUser] = useState({});
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);

  const [currentContactId, setCurrentContactId] = useState('');
  const [showContactActivity, setShowContactActivity] = useState(false);
  const [showProposalTemplateModal, setShowProposalTemplateModal] =
    useState(false);
  const [agencyWhatsAppCredentials, setAgencyWhatsAppCredentials] = useState();
  const [
    salesforceDirectIntegrationStatus,
    setSalesforceDirectIntegrationStatus,
  ] = useState(null);
  const [hubspotDirectIntegrationStatus, setHubspotDirectIntegrationStatus] =
    useState(null);

  const [showNotes, setShowNotes] = useState(false);
  const [agencyUserId, setAgencyUserId] = useState(false);
  const [noteContact, setNoteContact] = useState(null);
  const [showImportContact, setShowImportContact] = useState(false);

  useEffect(() => {
    if (noteContact) {
      setShowNotes(true);
    }
  }, [noteContact]);

  useEffect(() => {
    (async () => {
      h.auth.isLoggedInElseRedirect();
      setHasMarketingAccess(await h.userManagement.hasMarketingAccess());
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUserId(apiRes.data.agencyUser.agency_user_id);

        if (apiRes.data.agencyUser) {
          setAgencyUser(apiRes.data.agencyUser);
          const agencyAPIRes = await api.agency.findById(
            { agency_id: apiRes.data.agencyUser.agency_fk },
            {},
            false,
          );
          const credentials = h.notEmpty(
            agencyAPIRes.data.agency.agency_whatsapp_api_token,
          )
            ? agencyAPIRes.data.agency.agency_whatsapp_api_token +
              ':' +
              agencyAPIRes.data.agency.agency_whatsapp_api_secret
            : null;
          if (!h.isEmpty(credentials))
            setAgencyWhatsAppCredentials(
              Buffer.from(credentials, 'utf8').toString('base64'),
            );
        }
      }
      const agencyId = apiRes.data.agencyUser.agency_fk;
      const getSalesforceIntegration =
        await api.integrations.getSalesforceActiveIntegration(
          {
            agency_id: agencyId,
          },
          false,
        );

      if (h.cmpStr(getSalesforceIntegration.status, 'ok')) {
        const { agency_oauth } = getSalesforceIntegration.data;
        setSalesforceDirectIntegrationStatus(agency_oauth.status);
      }

      const getHubspotDirectIntegration =
        await api.integrations.getHubspotActiveIntegration(
          {
            agency_id: agencyId,
          },
          false,
        );

      if (h.cmpStr(getHubspotDirectIntegration.status, 'ok')) {
        const { agency_oauth } = getHubspotDirectIntegration.data;
        setHubspotDirectIntegrationStatus(agency_oauth.status);
      }

      const contactViews = await api.contactView.getAllContactViews({}, false);
      setViewTabs(contactViews.data.contactViews);
    })();
  }, []);

  useEffect(() => {
    const contact_id = h.general.findGetParameter('contact_id');
    const form_mode = h.general.findGetParameter('form_mode');
    setSelectedContactId(contact_id);
    setFormMode(form_mode);
    if (
      h.cmpStr(form_mode, h.form.FORM_MODE.ADD) ||
      h.cmpStr(form_mode, h.form.FORM_MODE.EDIT)
    ) {
      setShowCreateContactModal(true);
    }
  }, [router.query]);

  const doneReloading = () => {
    setShouldReload(false);
  };

  const pinContactView = async (contactView) => {
    const contactViewProperty = contactView.contact_view_properties.find(
      (view) => view.agency_user_fk === agencyUser.agency_user_id,
    );
    const oldIsPinned =
      contactViewProperty !== undefined ? contactViewProperty.is_pinned : false;
    const duplicateView = {
      contact_view_id: contactView.contact_view_id,
      agency_fk: contactView.agency_fk,
      agency_user_fk: agencyUser.agency_user_id,
      contact_view_name: contactView.contact_view_name,
      contact_view_fields: contactView.contact_view_fields,
      access_level: contactView.access_level,
      is_pinned: !oldIsPinned,
    };

    if (!oldIsPinned) {
      // limit pin counts
      const pinnedCountReducer = (prev, curr) => {
        const contactViewProperty = curr.contact_view_properties.find(
          (view) => view.agency_user_fk === agencyUser.agency_user_id,
        );
        const oldIsPinned =
          contactViewProperty !== undefined
            ? contactViewProperty.is_pinned
            : false;
        if (oldIsPinned) prev += 1;
        return prev;
      };

      const pinnedCount = viewTabs.reduce(pinnedCountReducer, 0);
      if (pinnedCount >= 2) {
        h.general.alert('error', {
          message: `You can't pin more than 2 views`,
        });
        return;
      }
    }

    const apiRes = await api.contactView.saveContactView(duplicateView, false);
    if (apiRes.status === 'ok') {
      const contactViews = await api.contactView.getAllContactViews({}, false);
      setViewTabs(contactViews.data.contactViews);
      const pinText = !oldIsPinned ? 'pinned' : 'unpinned';
      h.general.alert('success', { message: `Succesfully ${pinText} view` });
    }
  };

  /**
   * Submit Appointment
   * @param {*} e
   */
  const toggleAppointment = async ({ contact_id, has_appointment }) => {
    setLoading(true);

    if (has_appointment) {
      await api.contact.deleteAppointment({
        contact_id: contact_id,
      });
    } else {
      await api.contact.setAppointment({
        contact_id: contact_id,
        appointment_date: moment(),
      });
    }

    setShouldReload(true);

    setLoading(false);
  };
  return (
    <>
      {agencyUser && showImportContact && (
        <ImportContact
          agency={agencyUser}
          onSelectNewContact={() => {
            setShowCreateContactModal(true);
            setFormMode(h.form.FORM_MODE.ADD);
          }}
          handleCloseModal={() => setShowImportContact(false)}
        />
      )}
      {noteContact && agencyUserId && showNotes && (
        <NotesModal
          contactId={noteContact}
          agencyUserId={agencyUserId}
          handleCloseModal={() => {
            setShowNotes(false);
            setNoteContact(null);
          }}
        />
      )}
      <ContactActivityOverview
        showModal={showContactActivity}
        setShowModal={setShowContactActivity}
        contactId={currentContactId}
        setLoading={setLoading}
      />
      {showCreateContactModal && (
        <CreateContactModal
          formMode={formMode}
          contactId={selectedContactId}
          setLoading={setLoading}
          onCloseModal={() => {
            setShowCreateContactModal(!showCreateContactModal);
            setShouldReload(true);
          }}
          agencyWhatsAppCredentials={agencyWhatsAppCredentials}
        />
      )}
      {calendarModal && (
        <CalendarModal
          setLoading={setLoading}
          calendarModal={calendarModal}
          onCloseModal={() => {
            setCalendarModal(false);
            setShouldReload(true);
          }}
        />
      )}
      <div className="contacts-root layout-v">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading}>
          <div className="n-banner">
            <div className="container dashboard-contacts-container contacts-container">
              <div className="mb-2 contacts-title d-flex justify-content-between">
                <div>
                  <h1>Contacts</h1>
                  <span>
                    {totalContacts ? totalContacts : contacts.length} Contact
                    {contacts.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="contacts-list-container">
            <div className="container dashboard-contacts-container">
              <div className="pl-3 pr-3">
                <div className="row">
                  <div className="tab-container">
                    <div className="tab-list">
                      <div
                        className="tab"
                        onClick={() =>
                          router.push(routes.dashboard.leads.all_leads)
                        }
                      >
                        <span>All contacts</span>
                      </div>
                      <div
                        className="tab"
                        onClick={() =>
                          router.push(routes.dashboard.leads.my_leads)
                        }
                      >
                        <span>My contacts</span>
                      </div>
                      <div
                        className="tab"
                        onClick={() =>
                          router.push(routes.dashboard.leads.unassigned_leads)
                        }
                      >
                        <span>Unassigned contacts</span>
                      </div>
                      <div
                        className="tab"
                        onClick={() =>
                          router.push(routes.dashboard.leads.inactive_leads)
                        }
                      >
                        <span>Inactive contacts</span>
                      </div>
                      <div
                        className="tab"
                        onClick={() =>
                          router.push(routes.dashboard.leads.archived_leads)
                        }
                      >
                        <span>Archived contacts</span>
                      </div>
                      {hubspotIntegrationStatus ===
                        constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE ||
                      hubspotDirectIntegrationStatus ===
                        constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE ? (
                        <div
                          className="tab active-tab"
                          onClick={() =>
                            router.push(routes.dashboard.leads.hubspot_leads)
                          }
                        >
                          <span>HubSpot contacts</span>
                        </div>
                      ) : (
                        ''
                      )}
                      {salesForceIntegrationStatus ===
                        constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE ||
                      salesforceDirectIntegrationStatus ===
                        constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE ? (
                        <div
                          className="tab"
                          onClick={() =>
                            router.push(routes.dashboard.leads.salesforce_leads)
                          }
                        >
                          <span>Salesforce contacts</span>
                        </div>
                      ) : (
                        ''
                      )}
                      {h.general.notEmpty(viewTabs) &&
                        viewTabs.map((tab) => {
                          const currentUserProperty =
                            tab.contact_view_properties.find(
                              (view) =>
                                view.agency_user_fk ===
                                agencyUser.agency_user_id,
                            );
                          if (
                            (currentUserProperty !== undefined &&
                              currentUserProperty.is_pinned) ||
                            h.general.cmpStr(
                              tab.contact_view_id,
                              router.query.savedView,
                            )
                          ) {
                            return (
                              <div
                                className={
                                  h.general.cmpStr(
                                    tab.contact_view_id,
                                    router.query.savedView,
                                  )
                                    ? 'tab active-tab'
                                    : 'tab'
                                }
                                onClick={() => {
                                  router.push(
                                    routes.dashboard.leads.saved_view +
                                      tab.contact_view_id,
                                  );
                                }}
                              >
                                <span
                                  className="thumbtack-container"
                                  style={{ paddingRight: '10px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    pinContactView(tab);
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faThumbtack}
                                    color={
                                      currentUserProperty === undefined
                                        ? '#cbd6e2'
                                        : currentUserProperty.is_pinned
                                        ? 'black'
                                        : '#cbd6e2'
                                    }
                                    style={{ width: 12 }}
                                    size="lg"
                                  />
                                </span>
                                <span>{tab.contact_view_name}</span>
                              </div>
                            );
                          }
                        })}
                    </div>
                    <div className="btn-list">
                      <div className="button-icon-container">
                        <CommonIconButton
                          className="c-red"
                          onClick={() => {
                            // setShowCreateContactModal(true);
                            // setFormMode(h.form.FORM_MODE.ADD);
                            setShowImportContact(true);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faUserPlus}
                            color="#fff"
                            fontSize="20px"
                            className="mr-2"
                          />
                          New contact
                        </CommonIconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="projects-list-container modern-style">
              <div className="bg-white">
                <div className="container dashboard-contacts-container">
                  <div className="pl-3 pr-3 pb-2">
                    <div className="row">
                      <div className="tab-body">
                        <CommonSearchInput
                          isLoading={isLoading}
                          callback={(e) => {
                            const duplicateQueries =
                              h.general.deepCloneObject(allQueries);
                            duplicateQueries.setFilter.search = e;
                            setAllQueries(duplicateQueries);
                          }}
                          placeholder={'Search phone, name, email etc.'}
                          className={`mr-2`}
                        />
                        {h.notEmpty(agencyUser) && (
                          <ContactListing
                            isLoading={isLoading}
                            totalContacts={totalContacts}
                            manualPagination={true}
                            allQueries={allQueries}
                            shouldReload={shouldReload}
                            doneReloading={doneReloading}
                            setLoading={setLoading}
                            updateParentContacts={setContacts}
                            updateParentContactsCount={setTotalContacts}
                            setShowContactActivity={setShowContactActivity}
                            setCurrentContactId={setCurrentContactId}
                            type="hubspot-leads"
                            setShowProposalTemplateModal={
                              setShowProposalTemplateModal
                            }
                            setCalendarModal={setCalendarModal}
                            toggleAppointment={toggleAppointment}
                            isThreeSixty={false}
                            setNoteContact={setNoteContact}
                          />
                        )}
                      </div>
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
