import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import moment from 'moment';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlusCircle,
  faPlus,
  faFilter,
  faSave,
  faThumbtack,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import ContactListing from '../../../components/Contact/ContactListing';
import CreateContactModal from '../../../components/Contact/CreateContactModal';
import { useRouter } from 'next/router';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import ContactFilter from '../../../components/Contact/ContactFilter';
import ContactGenericFilter from '../../../components/Contact/ContactGenericFilter';
import ContactActivityOverview from '../../../components/Contact/ContactActivityOverview';
import CalendarModal from '../../../components/Contact/CalendarModal';
import NotesModal from '../../../components/Contact/NotesModal';
import CommonSearchInput from '../../../components/Sale/Link/preview/components/Common/CommonSearchInput';
import CommonAlert from '../../../components/Common/CommonAlert';
import ImportContact from '../../../components/Contact/ImportContact';

export default function AllLeads() {
  const router = useRouter();

  const [isLoading, setLoading] = useState();
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [calendarModal, setCalendarModal] = useState(null);
  const [showSideModal, setShowSideModal] = useState(false);
  const [showContactActivity, setShowContactActivity] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [totalContacts, setTotalContacts] = useState();
  const [selectedContactId, setSelectedContactId] = useState('');
  const [formMode, setFormMode] = useState('');
  const [currentContactId, setCurrentContactId] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [agencyUserId, setAgencyUserId] = useState(false);
  const [noteContact, setNoteContact] = useState(null);
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
  const [customProperties, setCustomProperties] = useState([]);
  const [options, setOptions] = useState({});
  const [hubspotIntegrationStatus, setHubspotIntegrationStatus] = useState({});
  const [salesForceIntegrationStatus, setSalesForceIntegrationStatus] =
    useState({});
  const [agencyUser, setAgencyUser] = useState({});
  const [showProposalTemplateModal, setShowProposalTemplateModal] =
    useState(false);
  const [agencyWhatsAppCredentials, setAgencyWhatsAppCredentials] = useState();
  const [
    salesforceDirectIntegrationStatus,
    setSalesforceDirectIntegrationStatus,
  ] = useState(null);
  const [hubspotDirectIntegrationStatus, setHubspotDirectIntegrationStatus] =
    useState(null);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [showImportContact, setShowImportContact] = useState(false);

  useEffect(() => {
    if (noteContact) {
      setShowNotes(true);
    }
  }, [noteContact]);
  useEffect(() => {
    (async () => {
      h.auth.isLoggedInElseRedirect();
      if (!(await h.userManagement.hasMarketingAccess())) {
        await router.replace(h.getRoute(routes.dashboard.leads.my_leads));
      }
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

      const customPropertiesRes = await api.agency.getCustomProperties(
        {},
        false,
      );
      if (h.cmpStr(customPropertiesRes.status, 'ok')) {
        setCustomProperties(customPropertiesRes.data.customProperties);
      }
    })();

    // initializing options for filter dropdowns
    let leadStatuses = [];
    for (const leadStatus in constant.LEAD_STATUS) {
      // TODO: Add check to send both no_proposal + proposal_created for label "None"
      leadStatuses.push({
        value: constant.LEAD_STATUS[leadStatus],
        label: h.general.prettifyConstant(constant.LEAD_STATUS[leadStatus]),
      });
    }

    let dateFilters = [];
    for (const dateFilter in constant.DATE_FILTER) {
      dateFilters.push({
        value: constant.DATE_FILTER[dateFilter].VALUE,
        label: h.general.prettifyConstant(
          constant.DATE_FILTER[dateFilter].VALUE,
        ),
      });
    }

    setOptions({
      ...options,
      leadStatuses: leadStatuses,
      lastOpened: dateFilters,
      proposalSent: dateFilters,
    });
  }, []);

  // retrieving agency users for filter dropdown Contact Owner
  useEffect(() => {
    (async () => {
      if (h.notEmpty(agencyUser)) {
        const apiRes = await api.agencyUser.getAgencyUsers(
          { agency_fk: agencyUser.agency.agency_id },
          false,
        );
        if (h.cmpStr(apiRes.status, 'ok')) {
          let agencyUsers = [];
          for (const agencyUser of apiRes.data.agency_users) {
            agencyUsers.push({
              value: agencyUser.agency_user_id,
              label: agencyUser.user.full_name,
            });
          }
          setOptions({ ...options, contactOwners: agencyUsers });
        }
      }
    })();
  }, [agencyUser]);

  useEffect(() => {
    const contact_id = h.general.findGetParameter('contact_id');
    const form_mode = h.general.findGetParameter('form_mode');
    const link_action = h.general.findGetParameter('link_action');

    setSelectedContactId(contact_id);
    setFormMode(form_mode);
    if (
      h.cmpStr(form_mode, h.form.FORM_MODE.ADD) ||
      h.cmpStr(form_mode, h.form.FORM_MODE.EDIT)
    ) {
      setShowCreateContactModal(true);
    }

    if (h.notEmpty(link_action)) {
      setShowGetStartedModal(true);
    }
  }, [router.query]);

  const doneReloading = () => {
    setShouldReload(false);
  };

  useEffect(() => {
    localStorage.setItem('selected_contacts', null);
    localStorage.setItem('with_no_owner_contact', false);
  }, [isLoading]);

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

      {showGetStartedModal && (
        <CommonAlert
          handleCloseModal={() => {
            setShowGetStartedModal(false);
          }}
        />
      )}
      <ContactGenericFilter
        showModal={showSideModal}
        setShowModal={setShowSideModal}
        allCustomProperties={customProperties}
        allQueries={allQueries}
        setAllQueries={setAllQueries}
      />
      <ContactActivityOverview
        agencyUser={agencyUser}
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
                        className="tab active-tab"
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
                          className="tab"
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

            <div className="projects-list-container modern-style no-oxs">
              <div className="bg-white">
                <div className="container dashboard-contacts-container modern-style">
                  <div className="pl-3 pr-3 pb-2">
                    <div className="row">
                      <div className="tab-body">
                        <div
                          className="d-flex flex-row align-items-center contact-filter-wrapper"
                          style={{ gap: '1em' }}
                        >
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

                          <ContactFilter
                            label="Contact Owner"
                            options={options.contactOwners}
                            allQueries={allQueries}
                            setAllQueries={setAllQueries}
                            filterKey="contactOwner"
                          />
                        </div>
                        {h.notEmpty(agencyUser) && (
                          <ContactListing
                            isLoading={isLoading}
                            allQueries={allQueries}
                            shouldReload={shouldReload}
                            doneReloading={doneReloading}
                            setLoading={setLoading}
                            totalContacts={totalContacts}
                            updateParentContacts={setContacts}
                            updateParentContactsCount={setTotalContacts}
                            type="inactive-leads"
                            manualPagination={true}
                            setCalendarModal={setCalendarModal}
                            toggleAppointment={toggleAppointment}
                            showContactActivity={showContactActivity}
                            setShowContactActivity={setShowContactActivity}
                            setCurrentContactId={setCurrentContactId}
                            showProposalTemplateModal={
                              showProposalTemplateModal
                            }
                            setShowProposalTemplateModal={
                              setShowProposalTemplateModal
                            }
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
