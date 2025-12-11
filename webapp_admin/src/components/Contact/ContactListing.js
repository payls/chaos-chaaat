import React, { useState, useEffect, useMemo } from 'react';
import {
  faCaretUp,
  faCaretDown,
  faAddressBook,
  faTrash,
  faFile,
  faEye,
  faPlusSquare,
  faEdit,
  faClipboard,
  faTrashAlt,
  faChartBar,
  faMinus,
  faCalendarPlus,
  faEllipsisV,
  faShare,
  faPlusCircle,
  faList,
  faStickyNote,
} from '@fortawesome/free-solid-svg-icons';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import CommonTable from '../Common/CommonTable';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import { config } from '../../configs/config';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import CommonIconButton from '../../components/Common/CommonIconButton';
import CommonDrodownAction from '../Common/CommonDrodownAction';
import IconNote from '../ProposalTemplate/Link/preview/components/Icons/IconNote';
import IconPencilEdit from '../ProposalTemplate/Link/preview/components/Icons/IconPencilEdit';
import IconTrashCan from '../ProposalTemplate/Link/preview/components/Icons/IconTrashCan';

export default function ContactListing({
  isLoading = false,
  showContactActivity = false,
  setShowContactActivity,
  setLoading,
  shouldReload = false,
  totalContacts = 0,
  doneReloading,
  updateParentContacts,
  updateParentContactsCount,
  setCurrentContactId,
  allQueries,
  type,
  manualPagination = false,
  showProposalTemplateModal,
  setShowProposalTemplateModal,
  setCalendarModal = () => {},
  toggleAppointment = () => {},
  isThreeSixty = false,
  setNoteContact = () => {},
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [listingPageSize, setListingPageSize] = useState(
    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
  );
  const [listingPageCount, setListingPageCount] = useState(0);
  // default sort by created date
  const [sortInfo, setSortInfo] = useState({
    columnId: null,
    columnHeader: null,
    order: null,
  });
  const [skipLoad, setSkipLoad] = useState(
    h.general.cmpStr(type, 'saved-view'),
  );

  const debouncedQuery = h.general.useDebounce(
    allQueries.setFilter.search,
    700,
  );

  const handleContactActivityOverview = (contact_id) => {
    setCurrentContactId(contact_id);
    setShowContactActivity(!showContactActivity);
  };

  const handleBulkDelete = async (rows) => {
    let message =
      rows.length > 1
        ? 'Are you sure you want to delete these contacts?'
        : 'Are you sure you want to delete this contact?';

    h.general.prompt(
      {
        message,
      },

      async () => {
        setLoading(true);

        const contact_ids = rows.map((row) => row.contact_id);

        await api.contact.bulkDeleteContacts(
          { contact_ids: contact_ids },

          true,
        );

        getContactsList();
      },
    );
  };

  /**
   * Description
   * Function to trigger request of archiving selected contacts from the list
   * @async
   * @function
   * @name handleContactArchive
   * @param {object} rows contact rows affected
   * @returns {Promise<void>}
   */
  const handleContactArchive = async (rows) => {
    h.general.prompt(
      {
        title: 'Heads up!',
        message:
          'This will permanently archive the selected contacts. <br/>Continue?',
      },
      async (confirmArchive) => {
        if (confirmArchive) {
          setLoading(true);
          const contact_ids = rows.map((row) => row.contact_id);
          await api.contact.archiveSelectedContacts(
            { contact_ids: contact_ids },
            true,
          );
          getContactsList();
        }
      },
    );
  };

  const getLeadScoreArrow = (scoreDiff) => {
    if (scoreDiff > 0) {
      return {
        icon: faCaretUp,
        color: '#4877ff',
        status: 'up',
      };
    } else if (scoreDiff < 0) {
      return {
        icon: faCaretDown,
        color: '#FE5959',
        status: 'down',
      };
    } else {
      return {
        icon: faMinus,
        color: '#8e8e8e',
        status: 'neutral',
      };
    }
  };

  const copyToClipBoard = async (permalink, e, oldContactRecord) => {
    if (e) e.preventDefault();
    if (!navigator.clipboard) {
      return console.log('copy not supported');
    }
    try {
      await navigator.clipboard.writeText(permalink);
      h.general.alert('success', { message: 'Copied!', autoCloseInSecs: 1 });
      let newLeadStatus;
      const constantLeadStatus = constant.LEAD_STATUS;
      switch (oldContactRecord.lead_status) {
        case constantLeadStatus.PROPOSAL_CREATED:
          newLeadStatus = constantLeadStatus.PROPOSAL_SENT;
          break;
        case constantLeadStatus.UPDATED_PROPOSAL_CREATED:
          newLeadStatus = constantLeadStatus.UPDATED_PROPOSAL_SENT;
          break;
        default:
      }
      if (newLeadStatus) {
        const apiRes = await api.contact.update(
          {
            ...oldContactRecord,
            lead_status: newLeadStatus,
          },
          false,
        );

        if (h.general.cmpStr(apiRes.status, 'ok')) {
          getContactsList();
        }
      }
    } catch (err) {
      h.general.alert('error', { message: 'Copy failed', autoCloseInSecs: 1 });
    }
  };

  const handleBuyStatusChange = async (contact_id, e) => {
    await api.contact.update(
      {
        contact_id: contact_id,
        buy_status: e.target.value,
      },
      false,
    );
  };

  let initialColumns = [
    {
      id: 'first_name',
      Header: 'Contact Name',
      accessor: (row) => {
        return h.user.formatFullName(row) ? h.user.formatFullName(row) : '';
      },
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { contact_id } = original;
        const fullName = h.user.formatFullName(original)
          ? h.user.formatFullName(original)
          : 'None';
        return (
          <div
            className="user"
            style={{ cursor: 'pointer' }}
          >
            <div>
              {h.notEmpty(original.profile_picture_url) && (
                <img
                  src={original.profile_picture_url}
                  alt={'profile picture'}
                />
              )}
              {fullName}
            </div>
          </div>
        );
      },
    },
    {
      id: 'mobile_number',
      Header: 'Phone Number',
      accessor: 'mobile_number',
      sortType: 'number',
      Cell: ({ row: { original } }) => {
        const { mobile_number } = original;
        if (h.isEmpty(mobile_number)) {
          return <span>None</span>;
        }
        return <span>{mobile_number}</span>;
      },
    },
    {
      id: 'email',
      Header: 'Email',
      accessor: 'email',
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { email } = original;
        if (h.isEmpty(email)) {
          return <span>None</span>;
        }
        return <span>{email}</span>;
      },
    },
  ];

  if (h.cmpStr(type, 'all-leads') || h.cmpStr(type, 'my-leads') || h.cmpStr(type, 'unassigned-leads')) {
    initialColumns.push({
      id: 'status',
      Header: 'Contact Status',
      accessor: '',
      sortType: 'text',
      headerWidth: '150px',
      Cell: ({ row: { original } }) => {
        const { status } = original;
        const contactStatus = h.cmpStr(status, 'outsider') ? 'unknown' : status;
        return <span>{contactStatus.toUpperCase()}</span>;
      },
    });
  }

  initialColumns = [
    ...initialColumns,
    {
      id: 'created_date',
      Header: 'Created On',
      accessor: (row) => (h.isEmpty(row.created_date) ? '' : row.created_date),
      filter: 'text',
      sortType: 'date',
      Cell: ({ row: { original } }) => {
        const { created_date } = original;
        if (h.isEmpty(created_date)) {
          return <span>None</span>;
        }
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateTime = h.date.convertUTCDateToLocalDate(
          created_date,
          localTimezone,
          'en-AU',
          {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          },
        );
        return <span>{dateTime}</span>;
      },
    },
    {
      id: 'agency_user.user.first_name',
      Header: 'Contact Owner',
      accessor: (row) => {
        return h.isEmpty(row.agency_user)
          ? null
          : h.isEmpty(row.agency_user.user)
            ? null
            : row.agency_user.user.full_name;
      },
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { agency_user = {} } = original;
        return agency_user && agency_user.user ? (
          <div className="user w-100 justify-content-end">
            <div>
              <img
                src={agency_user.user.profile_picture_url}
                alt={'profile picture'}
              />{' '}
              <span>{h.user.formatFullName(agency_user.user)}</span>
            </div>
            {/*hiding the delete button*/}
            {/*<button*/}
            {/*  onClick={async () => {*/}
            {/*    h.general.prompt(*/}
            {/*      {*/}
            {/*        message: 'Are you sure you want to delete this contact?',*/}
            {/*      },*/}
            {/*      async (status) => {*/}
            {/*        if (status) {*/}
            {/*          setLoading(true);*/}
            {/*          await api.contact.deleteContact({ contact_id });*/}
            {/*          await getContactsList();*/}
            {/*        }*/}
            {/*      },*/}
            {/*    );*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <TrashIcon />*/}
            {/*</button>*/}
          </div>
        ) : (
          <span>Not Assigned</span>
        );
      },
    },
    {
      Header: 'Action',
      accessor: '',
      filter: 'text',
      disableSortBy: true,
      headerWidth: '80px',
      Cell: ({ row: { original } }) => {
        const { permalink, contact_id, agency_user, first_name, last_name } =
          original;
        const contactFullName = h.user.combineFirstNLastName(
          first_name,

          last_name,

          '-',
        );
        const contactname =
          contactFullName != '' ? `-for-${contactFullName}` : '';
        const actions = [];

        return (
          <div className="user w-100 justify-content-center">
            <CommonTooltip tooltipText="Contact Notes">
              <IconNote
                style={{ cursor: 'pointer', marginLeft: '5px', marginRight: '5px' }}
                width={20}
                onClick={() => {
                  setNoteContact(contact_id);
                }}
              />
            </CommonTooltip>
            <CommonTooltip tooltipText="Edit Contact">
              <IconPencilEdit
                style={{ cursor: 'pointer', marginLeft: '5px', marginRight: '5px' }}
                width={20}
                onClick={() => {
                  const currentPathName = window.location.pathname;
                  let route;
                  switch (currentPathName) {
                    case routes.dashboard.leads.all_leads:
                      route = routes.contact.edit_all_leads;
                      break;
                    case routes.dashboard.leads.my_leads:
                      route = routes.contact.edit_my_leads;
                      break;
                    case routes.dashboard.leads.unassigned_leads:
                      route = routes.contact.edit_unassigned_leads;
                      break;
                    case routes.dashboard.leads.inactive_leads:
                      route = routes.contact.edit_inactive_leads;
                      break;
                    case routes.dashboard.leads.hubspot_leads:
                      route = routes.contact.edit_hubspot_leads;
                      break;
                    case routes.dashboard.leads.salesforce_leads:
                      route = routes.contact.edit_salesforce_leads;
                      break;
                    default:
                      route = routes.contact.edit_my_leads;
                  }
                  router.push(h.getRoute(route, { contact_id }), undefined, {
                    shallow: true,
                  });
                }}
              />
            </CommonTooltip>
          </div>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(initialColumns);

  const tableColumns = useMemo(() => columns, [columns]);

  // Modifying tableColumns on sort direction change
  const changeSortDirection = (header, direction) => {
    const replicateColumns = columns;

    if (h.general.notEmpty(sortInfo.columnId)) {
      const previousColumnIndex = columns.findIndex(
        (column) => column.Header === sortInfo.columnHeader,
      );
      replicateColumns[previousColumnIndex].sortDirection = '';
    }

    const columnIndex = columns.findIndex((column) => column.Header === header);
    replicateColumns[columnIndex].sortDirection = direction;

    setColumns([...replicateColumns]);
    setSortInfo({
      columnId: replicateColumns[columnIndex].id,
      columnHeader: replicateColumns[columnIndex].Header,
      order: direction,
    });
  };

  const memoizedAllQueries = useMemo(() => {
    return allQueries;
  }, [JSON.stringify(allQueries)]);

  // Reset page index on set filters
  useEffect(() => {
    setListingPageIndex(0);
  }, [allQueries]);

  useEffect(() => {
    if (skipLoad) {
      setSkipLoad(false);
    } else {
      switch (type) {
        case 'my-leads':
          if (allQueries.setFilter.contactOwner) {
            getContactsList();
          }
          break;
        default:
          getContactsList();
          break;
      }
    }
  }, [
    listingPageIndex,
    listingPageSize,
    debouncedQuery,
    sortInfo,
    memoizedAllQueries,
  ]);

  useEffect(() => {
    if (h.cmpBool(shouldReload, true)) {
      (async () => {
        await getContactsList();
        doneReloading();
      })();
    }
  }, [shouldReload]);

  const getContactsList = async () => {
    setLoading(true);
    const setFilter = allQueries.setFilter;
    const moreFilter = allQueries.moreFilter;

    const queries = {
      search: setFilter.search,
      contactOwner: setFilter.contactOwner,
      leadStatus: setFilter.leadStatus,
      proposalSent: setFilter.proposalSent,
      lastOpened: setFilter.lastOpened,
    };

    // query params for GET requests
    let params = {
      ...queries,
    };

    const pagination = {};

    if (manualPagination) {
      pagination.pageIndex = listingPageIndex;
      pagination.pageSize = listingPageSize;
      pagination.sortColumn = sortInfo.columnId ?? 'created_date';
      pagination.sortOrder = sortInfo.order ?? 'DESC';

      // Add total contact count
      if (totalContacts > 0) {
        pagination.totalCount = listingPageIndex !== 0 ? totalContacts : null;
      }

      params = { ...params, ...pagination };
    }

    // request body for POST requests
    const requestBody = {
      ...allQueries,
      pagination: pagination,
    };

    let apiRes;
    switch (type) {
      case 'all-leads':
        {
          apiRes = await api.contact.findAll(requestBody, {}, false);
        }
        break;
      // TODO: remaining GET requests will need to be converted to POST after filters are implemented
      case 'my-leads':
        {
          apiRes = await api.contact.findAll(requestBody, {}, false);
        }
        break;
      case 'unassigned-leads':
        {
          apiRes = await api.contact.findAllUnassignedContacts(
            {},
            params,
            false,
          );
        }
        break;
      case 'inactive-leads':
        {
          apiRes = await api.contact.findAllInactiveContacts(
            requestBody,
            {},
            false,
          );
        }
        break;
      case 'archived-leads':
        {
          apiRes = await api.contact.findAllArchivedContacts(
            requestBody,
            {},
            false,
          );
        }
        break;
      case 'hubspot-leads':
        {
          apiRes = await api.contact.findAllHubspotContacts({}, params, false);
        }
        break;
      case 'salesforce-leads':
        {
          apiRes = await api.contact.findAllSalesForceContacts(
            {},
            params,
            false,
          );
        }
        break;
      case 'saved-view':
        {
          // TODO: will need either new API or changes to existing API when implemented filter for other tabs
          apiRes = await api.contact.findAll(requestBody, {}, false);
        }
        break;
    }

    if (h.cmpStr(apiRes.status, 'ok')) {
      let contacts = apiRes.data.contacts;
      if (h.general.cmpStr(type, 'salesforce-leads')) {
        let searched_contacts = contacts.filter((data) => {
          if (
            data.first_name &&
            data.last_name &&
            data.mobile_number &&
            data.email
          ) {
            return (
              data.first_name
                .toLowerCase()
                .includes(setFilter.search.toLowerCase()) ||
              data.last_name
                .toLowerCase()
                .includes(setFilter.search.toLowerCase()) ||
              data.mobile_number
                .toLowerCase()
                .includes(setFilter.search.toLowerCase()) ||
              data.email.toLowerCase().includes(setFilter.search.toLowerCase())
            );
          }
        });
        if (setFilter.search.length > 1) {
          setContacts(searched_contacts);
          if (updateParentContacts) updateParentContacts(searched_contacts);
        } else {
          setContacts(contacts);
          if (updateParentContacts) updateParentContacts(contacts);
        }
      } else {
        setContacts(contacts);
        if (updateParentContacts) updateParentContacts(contacts);
      }
      if (manualPagination) {
        setListingPageCount(apiRes.data.metadata.pageCount);
        updateParentContactsCount(apiRes.data.metadata.totalCount);
      }
    }

    setLoading(false);
  };

  return (
    <div  className="new-table" style={{marginTop: !h.cmpStr(type, 'archived-leads')? '-50px' : '0px'}}>
      {h.notEmpty(contacts) && !isLoading ? (
        <CommonResponsiveTable
          overflow="auto"
          columns={tableColumns}
          data={contacts}
          options={{
            manualPagination: manualPagination,
            pageCount: manualPagination ? listingPageCount : undefined,
            enableRowSelect: !h.cmpStr(type, 'archived-leads')? true : false,
            scrollable: true,
            pageIndex: listingPageIndex,
            pageSize: listingPageSize,
          }}
          setListingPageIndex={
            manualPagination ? setListingPageIndex : undefined
          }
          setListingPageSize={manualPagination ? setListingPageSize : undefined}
          sortDirectionHandler={
            manualPagination ? changeSortDirection : undefined
          }
          defaultSortColumn={
            sortInfo.columnId === null
              ? columns.find((column) =>
                  h.general.cmpStr(column.id, 'created_date'),
                )
              : null
          }
          bulkActions={[
            {
              action: 'Archive',
              icon: faFile,
              iconColor: 'white',
              handler: handleContactArchive,
            },
          ]}
          thHeight="50px"
          modern={true}
        />
      ) : (
        <div
          className="d-flex w-100 align-items-center justify-content-center flex-column"
          style={{ gap: '2em', marginTop: '100px' }}
        >
          <img
            style={{ width: '40%' }}
            width="100%"
            src="https://cdn.yourpave.com/assets/empty-data-2x.png"
            alt={'profile picture'}
          />
          No available contacts yet.
        </div>
      )}
    </div>
  );
}
