import React, { useState, useEffect, useMemo } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

// Components
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import CommonTooltip from '../../components/Common/CommonTooltip';
import ContactActivityOverview from '../../components/Dashboard/ContactActivityOverview';
import TableLoading from '../Sale/Link/preview/components/Common/CommonLoading/TableLoading';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';

const tableHeaders = [
  'Rank',
  'Contact Name',
  'Score',
  'Phone Number',
  'Product Shown',
  'Last Opened',
  'Contact Owner',
];
export default function MostEngagedContacts({
  allQueries = {},
  setAllQueries = () => {},
  hide = false,
  agencyFk = null,
  setLoading = true,
  isLoading,
  hideOwner = false,
}) {
  const [contacts, setContacts] = useState([]);
  const [showSideModal, setShowSideModal] = useState(false);
  const [currentLeadScore, setCurrentLeadScore] = useState(null);
  const [contactId, setContactId] = useState('');
  const [contactActivities, setContactActivities] = useState([]);
  const [apiStatus, setApiStatus] = useState(constant.API_STATUS.PENDING);
  const [inc, setInc] = useState(1);

  useEffect(() => {
    getContactsList();
  }, [allQueries]);

  useEffect(() => {
    (async () => {
      let projects = [];
      if (contacts) {
        const cContacts = contacts;
        for (let i = 0; i < cContacts.length; i++) {
          const projectIds = cContacts[i]?.contact?.shortlisted_projects?.map(
            (m) => m.project_fk,
          );

          const { projectNames, updatedProjects } = await getProjectsNames(
            projectIds,
            projects,
          );

          projects = updatedProjects;
          cContacts[i].contact.projectNames = projectNames;
          setInc((p) => p + 1);
        }
      }
    })();
  }, [contacts]);

  const getContactsList = async () => {
    setApiStatus(constant.API_STATUS.PENDING);
    const setFilter = allQueries.setFilter;
    const moreFilter = allQueries.moreFilter;

    const queries = {
      search: setFilter.search,
      contactOwner: setFilter.contactOwner,
      leadStatus: setFilter.leadStatus,
      proposalSent: setFilter.proposalSent,
      lastOpened: setFilter.lastOpened,
    };

    const pagination = {};

    pagination.pageIndex = 0;
    pagination.pageSize = 10;
    pagination.sortColumn = 'lead_score';
    pagination.sortOrder = 'DESC';

    // Add total contact count
    pagination.totalCount = null;

    // request body for POST requests
    const requestBody = {
      agency_id: agencyFk,
      ...getFilterValues(),
    };

    let apiRes = await api.dashboard.getMostEngagedContacts(requestBody, false);

    if (h.cmpStr(apiRes.status, 'ok')) {
      let contacts = apiRes.data.engagement_score;
      setContacts(
        contacts.map((c, index) => ({
          index,
          ...c,
          lead_score: c?.cumulativeScore ?? 0,
          contact: c.contact,
        })),
      );
    }

    setApiStatus(constant.API_STATUS.FULLFILLED);
  };

  const handleContactActivityOverview = (record) => {
    setCurrentLeadScore(record?.cumulativeScore);
    setShowSideModal(!showSideModal);
    setContactId(record?.contact?.contact_id);
    setContactActivities(record?.contact?.contact_activities);
  };

  const getFilterValues = () => {
    const removedNoValueData = Object.fromEntries(
      Object.entries(allQueries.setFilter).filter(
        ([key, value]) => value !== '',
      ),
    );
    return removedNoValueData;
  };
  const loadingColumns = [
    ...[...Array(tableHeaders.length)].map((e, i) => ({
      id: 'index' + i,
      Header: tableHeaders[i],
      Cell: () => <TableLoading className={{}} />,
    })),
  ];

  const initialColumns = [
    {
      id: 'index',
      Header: 'Rank',
      accessor: 'index',
      filter: 'text',
      sortType: 'number',
      Cell: ({ row: { original } }) => {
        return (
          <span
            align="center"
            style={{ width: '100%', display: 'block', fontSize: '25px' }}
            className="toLeft"
          >
            {original.index + 1}
          </span>
        );
      },
    },
    {
      id: 'first_name',
      Header: 'Contact Name',
      accessor: (row) => {
        return h.user.formatFullName(row) ? h.user.formatFullName(row) : '';
      },
      filter: 'text',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const fullName = h.user.formatFullName(original.contact)
          ? h.user.formatFullName(original.contact)
          : 'None';
        return <div>{fullName}</div>;
      },
    },
    {
      id: 'lead_score',
      Header: 'Score',
      accessor: 'lead_score',
      filter: 'text',
      sortType: 'number',
      Cell: ({ row: { original } }) => {
        const { lead_score } = original;
        return (
          <CommonTooltip tooltipText="Click to View Contact Activity">
            <span
              align="center"
              style={{
                width: '100%',
                display: 'block',
                fontSize: '25px',
                cursor: 'pointer',
                textDecoration: 'underline',
                color: '#4877ff',
              }}
              className="toLeft"
              onClick={() => handleContactActivityOverview(original)}
            >
              {lead_score}
            </span>
          </CommonTooltip>
        );
      },
    },
    // {
    //   id: 'email',
    //   Header: 'Email Address',
    //   accessor: 'email',
    //   filter: 'text',
    //   sortType: 'text',
    //   Cell: ({ row: { original } }) => {
    //     const { email } = original;
    //     if (h.isEmpty(email)) {
    //       return <span>None</span>;
    //     }
    //     return <span>{email}</span>;
    //   },
    // },
    {
      id: 'mobile_number',
      Header: 'Phone Number',
      accessor: 'mobile_number',
      sortType: 'number',
      Cell: ({ row: { original } }) => {
        const { mobile_number } = original.contact;
        if (h.isEmpty(mobile_number)) {
          return <span>None</span>;
        }
        return <span>{mobile_number}</span>;
      },
    },
    // {
    //   id: 'projects',
    //   Header: 'Product Shown',
    //   accessor: 'contacts',
    //   sortType: 'number',
    //   Cell: ({ row: { original } }) => {
    //     const { projectNames = '-' } = original.contact;
    //     return <span>{projectNames}</span>;
    //   },
    // },
    // {
    //   id: 'contact_activities',
    //   Header: 'Last Opened',
    //   accessor: 'contact_activities',
    //   sortType: 'text',
    //   Cell: ({ row: { original } }) => {
    //     const { contact } = original;
    //     if (contact.permalink_last_opened) {
    //       const localTimezone =
    //         Intl.DateTimeFormat().resolvedOptions().timeZone;
    //       const dateTime = h.date.convertUTCDateToLocalDate(
    //         contact.permalink_last_opened,
    //         localTimezone,
    //         'en-AU',
    //         {
    //           year: 'numeric',
    //           month: 'numeric',
    //           day: 'numeric',
    //           hour: '2-digit',
    //           minute: '2-digit',
    //           hour12: true,
    //         },
    //       );
    //       return <span>{dateTime}</span>;
    //     }

    //     return <span>-</span>;
    //   },
    // },
  ];

  if (!hideOwner) {
    initialColumns.push({
      id: 'agency_user',
      Header: 'Contact Owner',
      accessor: 'agency_user',
      sortType: 'text',
      Cell: ({ row: { original } }) => {
        const { agency_user } = original.contact;
        if (agency_user) {
          return agency_user?.user?.full_name;
        }

        return <span>-</span>;
      },
    });
  }

  const getProjectsNames = async (ids, projects) => {
    const projectNames = [];
    const p = [...projects];

    if (ids) {
      for (let i = 0; i < ids.length; i++) {
        const projectIndex = p
          .map((m) => m.project_id)
          .findIndex((f) => f === ids[i]);

        if (projectIndex > -1) {
          const foundProject = p[projectIndex];
          projectNames.push(foundProject.name);
        } else {
          const apiRes = await api.project.getProjectV2(ids[i], {}, {}, false);
          if (h.cmpStr(apiRes.status, 'ok')) {
            if (apiRes.data?.project) {
              projectNames.push(apiRes.data?.project?.name);
              p.push(apiRes.data?.project);
            }
          }
        }
      }
    }

    return {
      projectNames: projectNames.length > 0 ? projectNames.join('/') : '-',
      updatedProjects: p,
    };
  };

  const [columns, setColumns] = useState(initialColumns);
  const tableColumns = useMemo(() => columns, [columns]);

  return (
    <>
      <ContactActivityOverview
        showModal={showSideModal}
        setShowModal={setShowSideModal}
        contactId={contactId}
        contactActivities={contactActivities}
        setLoading={() => {}}
        currentLeadScore={currentLeadScore}
      />
      <div className="most-engaged-table modern-style">
        {apiStatus === constant.API_STATUS.PENDING && (
          <FullTableLoading headers={tableHeaders} rowsCount={10} />
        )}

        {h.notEmpty(contacts) &&
          apiStatus === constant.API_STATUS.FULLFILLED && (
            <CommonResponsiveTable
              columns={tableColumns}
              data={contacts}
              options={{
                manualPagination: false,
                pageCount: 10,
                enableRowSelect: false,
                scrollable: true,
                pageIndex: 0,
                pageSize: 25,
              }}
              setListingPageIndex={undefined}
              setListingPageSize={undefined}
              sortDirectionHandler={undefined}
              defaultSortColumn={null}
              bulkActions={[]}
              showFooter={false}
              thHeight="50px"
              key={inc}
            />
          )}
        {h.isEmpty(contacts) &&
          apiStatus === constant.API_STATUS.FULLFILLED && (
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
              No data during this time period.
            </div>
          )}
      </div>
    </>
  );
}
