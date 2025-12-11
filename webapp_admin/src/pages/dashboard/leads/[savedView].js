import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import IconContact from '../../../components/Icons/IconContact';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlusCircle,
  faPlus,
  faFilter,
  faSave,
  faTrashAlt,
  faThumbtack,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import IconSearch from '../../../components/Icons/IconSearch';
import ContactListing from '../../../components/Contact/ContactListing';
import CreateContactModal from '../../../components/Contact/CreateContactModal';
import { useRouter } from 'next/router';
import { routes } from '../../../configs/routes';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import ContactFilter from '../../../components/Contact/ContactFilter';
import ContactGenericFilter from '../../../components/Contact/ContactGenericFilter';
import AddViewModal from '../../../components/Contact/AddViewModal';
import AllViewModal from '../../../components/Contact/AllViewModal';
import ContactActivityOverview from '../../../components/Contact/ContactActivityOverview';

export default function SavedView() {
  const router = useRouter();

  const [isLoading, setLoading] = useState();
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [showAddViewModal, setShowAddViewModal] = useState(false);
  const [showContactActivity, setShowContactActivity] = useState(false);
  const [showAllViewModal, setShowAllViewModal] = useState(false);
  const [showSideModal, setShowSideModal] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [totalContacts, setTotalContacts] = useState();
  const [selectedContactId, setSelectedContactId] = useState('');
  const [currentContactId, setCurrentContactId] = useState('');

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
  const [currentView, setCurrentView] = useState({}); // for saving view after retrieving from API
  const [customProperties, setCustomProperties] = useState([]);
  const [viewTabs, setViewTabs] = useState([]);
  const [options, setOptions] = useState({});
  const [hubspotIntegrationStatus, setHubspotIntegrationStatus] = useState({});
  const [salesForceIntegrationStatus, setSalesForceIntegrationStatus] =
    useState({});
  const [agencyUser, setAgencyUser] = useState({});
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);
  const [showProposalTemplateModal, setShowProposalTemplateModal] =
    useState(false);
  const [agencyWhatsAppCredentials, setAgencyWhatsAppCredentials] = useState();

  useEffect(() => {
    (async () => {
      h.auth.isLoggedInElseRedirect();
      setHasMarketingAccess(await h.userManagement.hasMarketingAccess());
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
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

  useEffect(() => {
    if (router.query.savedView) {
      (async () => {
        const contactViews = await api.contactView.getAllContactViews(
          {},
          false,
        );
        setViewTabs(contactViews.data.contactViews);
        const currentTab = contactViews.data.contactViews.find(
          (tab) => tab.contact_view_id === router.query.savedView,
        );
        updateFilterState(JSON.parse(currentTab?.contact_view_fields));
        setCurrentView(currentTab);
      })();
    }
  }, [router.query.savedView]);

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
    setSelectedContactId(contact_id);
    setFormMode(form_mode);
    if (
      h.cmpStr(form_mode, h.form.FORM_MODE.ADD) ||
      h.cmpStr(form_mode, h.form.FORM_MODE.EDIT)
    ) {
      setShowCreateContactModal(true);
    }
  }, [router.query]);

  // To handle save view button
  const saveContactView = () => {
    const duplicateView = h.general.deepCloneObject(currentView);
    duplicateView.contact_view_fields = JSON.stringify(allQueries);
    const apiRes = api.contactView.saveContactView(duplicateView, true);
  };

  // To handle delete view button
  const deleteContactView = async () => {
    const duplicateView = h.general.deepCloneObject(currentView);
    duplicateView.contact_view_fields = JSON.stringify(allQueries);
    duplicateView.contact_view_status = 'inactive';
    duplicateView.is_pinned = 0;
    const apiRes = await api.contactView.saveContactView(duplicateView, false);
    if (apiRes.status === 'ok') {
      h.general.alert('success', { message: `Succesfully deleted view` });
      setTimeout(() => {
        router.push(routes.dashboard.leads.all_leads);
      }, 2000);
    }
  };

  useEffect(() => {
    localStorage.setItem('selected_contacts', null);
    localStorage.setItem('with_no_owner_contact', false);
  }, [isLoading]);

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

  const doneReloading = () => {
    setShouldReload(false);
  };

  const updateFilterState = (requestBody) => {
    const duplicateBody = h.general.deepCloneObject(requestBody);
    setAllQueries(duplicateBody);
  };

  return (
    <>
      <ContactGenericFilter
        showModal={showSideModal}
        setShowModal={setShowSideModal}
        allCustomProperties={customProperties}
        allQueries={allQueries}
        setAllQueries={setAllQueries}
      />
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
      {showAddViewModal && (
        <AddViewModal
          allQueries={allQueries}
          setLoading={setLoading}
          onCloseModal={() => {
            setShowAddViewModal(!showAddViewModal);
            setShouldReload(true);
          }}
        />
      )}
      {showAllViewModal && (
        <AllViewModal
          agencyUser={agencyUser}
          viewTabs={viewTabs}
          setLoading={setLoading}
          onCloseModal={() => {
            setShowAllViewModal(!showAllViewModal);
            setShouldReload(true);
          }}
        />
      )}

      <div className="contacts-root">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading}>
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

          <div className="contacts-list-container">
            <div className="container dashboard-contacts-container">
              <div className="pl-3 pr-3">
                <div className="row">
                  <div className="tab-container">
                    <div className="tab-list">
                      {hasMarketingAccess && (
                        <div
                          className="tab"
                          onClick={() =>
                            router.push(routes.dashboard.leads.all_leads)
                          }
                        >
                          <span>All contacts</span>
                        </div>
                      )}
                      <div
                        className="tab"
                        onClick={() =>
                          router.push(routes.dashboard.leads.my_leads)
                        }
                      >
                        <span>My contacts</span>
                      </div>
                      {hasMarketingAccess && (
                        <div
                          className="tab"
                          onClick={() =>
                            router.push(routes.dashboard.leads.unassigned_leads)
                          }
                        >
                          <span>Unassigned contacts</span>
                        </div>
                      )}
                      {hasMarketingAccess && (
                        <div
                          className="tab"
                          onClick={() =>
                            router.push(routes.dashboard.leads.inactive_leads)
                          }
                        >
                          <span>Inactive contacts</span>
                        </div>
                      )}
                      {hasMarketingAccess && (
                        <div
                          className="tab"
                          onClick={() =>
                            router.push(routes.dashboard.leads.archived_leads)
                          }
                        >
                          <span>Archived contacts</span>
                        </div>
                      )}
                      {hubspotIntegrationStatus ===
                        constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE &&
                      hasMarketingAccess ? (
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
                        constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE &&
                      hasMarketingAccess ? (
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
                          const isCurrentTab = h.general.cmpStr(
                            tab.contact_view_id,
                            router.query.savedView,
                          );
                          if (
                            (currentUserProperty !== undefined &&
                              currentUserProperty.is_pinned) ||
                            isCurrentTab
                          ) {
                            return (
                              <div
                                className={
                                  isCurrentTab ? 'tab active-tab' : 'tab'
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
                                  style={{ marginRight: '10px' }}
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
                                          ? '#c5c5c5'
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
                      <div className="button-icon-container">
                        <FontAwesomeIcon
                          icon={faPlus}
                          color="#c5c5c5"
                          fontSize="20px"
                          style={{ width: 12 }}
                        />
                        <button
                          className="just-text-button-underline"
                          onClick={() => {
                            setShowAddViewModal(true);
                          }}
                        >
                          Add View
                        </button>
                      </div>
                      <div className="button-icon-container">
                        <FontAwesomeIcon
                          icon={faFilter}
                          color="#c5c5c5"
                          fontSize="20px"
                          style={{ width: 12 }}
                        />
                        <button
                          className="just-text-button-underline"
                          onClick={() => {
                            setShowAllViewModal(true);
                          }}
                        >
                          All Views
                        </button>
                      </div>
                    </div>
                    <div className="btn-list">
                      {h.general.cmpStr(
                        currentView.agency_user_fk,
                        agencyUser.agency_user_id,
                      ) && (
                        <div className="button-icon-container">
                          <CommonIconButton
                            className="c-transparent"
                            onClick={() => {
                              deleteContactView();
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTrashAlt}
                              color="#f2f2f2"
                              fontSize="20px"
                              className="mr-2"
                            />
                            Delete View
                          </CommonIconButton>
                        </div>
                      )}
                      <div className="button-icon-container">
                        <CommonIconButton
                          className="c-transparent"
                          onClick={() => {
                            saveContactView();
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faSave}
                            color="#f2f2f2"
                            fontSize="20px"
                            className="mr-2"
                          />
                          Save View
                        </CommonIconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="container dashboard-contacts-container">
                <div className="pl-3 pr-3 pb-2">
                  <div className="row">
                    <div className="tab-body">
                      <div
                        className="d-flex flex-row align-items-center"
                        style={{ gap: '1em' }}
                      >
                        <div className="search-input mt-4 mb-4">
                          <input
                            placeholder="search phone, name, email etc."
                            value={allQueries.setFilter.search}
                            onChange={(e) => {
                              const duplicateQueries =
                                h.general.deepCloneObject(allQueries);
                              duplicateQueries.setFilter.search =
                                e.target.value;
                              setAllQueries(duplicateQueries);
                            }}
                          />
                          <IconSearch />
                        </div>
                        <ContactFilter
                          label="Contact Owner"
                          options={options.contactOwners}
                          allQueries={allQueries}
                          setAllQueries={setAllQueries}
                          filterKey="contactOwner"
                          hide={hasMarketingAccess ? false : true}
                        />
                        <ContactFilter
                          label="Lead Status"
                          options={options.leadStatuses}
                          allQueries={allQueries}
                          setAllQueries={setAllQueries}
                          filterKey="leadStatus"
                        />
                        <ContactFilter
                          label="Proposal Sent"
                          options={options.proposalSent}
                          allQueries={allQueries}
                          setAllQueries={setAllQueries}
                          filterKey="proposalSent"
                        />
                        <ContactFilter
                          label="Last Opened"
                          options={options.lastOpened}
                          allQueries={allQueries}
                          setAllQueries={setAllQueries}
                          filterKey="lastOpened"
                        />
                        <button
                          className="more-filters-button"
                          style={{
                            backgroundColor: h.general.notEmpty(
                              allQueries.moreFilter,
                            )
                              ? '#eef4ed'
                              : 'white',
                          }}
                          onClick={() => {
                            setShowSideModal(!showSideModal);
                          }}
                        >
                          <span style={{ paddingRight: '5px' }}>
                            <FontAwesomeIcon
                              icon={faFilter}
                              color="#7c98b6"
                              fontSize="20px"
                              style={{ width: 12 }}
                            />
                          </span>
                          More Filters
                        </button>
                      </div>

                      <ContactListing
                        isLoading={isLoading}
                        allQueries={allQueries}
                        shouldReload={shouldReload}
                        doneReloading={doneReloading}
                        setLoading={setLoading}
                        totalContacts={totalContacts}
                        updateParentContacts={setContacts}
                        updateParentContactsCount={setTotalContacts}
                        type="saved-view"
                        manualPagination={true}
                        showContactActivity={showContactActivity}
                        setShowContactActivity={setShowContactActivity}
                        setCurrentContactId={setCurrentContactId}
                        showProposalTemplateModal={showProposalTemplateModal}
                        setShowProposalTemplateModal={
                          setShowProposalTemplateModal
                        }
                      />
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
