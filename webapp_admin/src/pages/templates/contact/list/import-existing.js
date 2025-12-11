import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../../components/Layouts/Layout';
import { h } from '../../../../helpers';
import { api } from '../../../../api';
import constant from '../../../../constants/constant.json';
import { routes } from '../../../../configs/routes';
// ICON
import {
  faPlus,
  faInfo,
  faUsers,
  faTrash,
  faBullhorn,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FullTableLoading from '../../../../components/Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';

// Components
import CommonResponsiveTable from '../../../../components/Common/CommonResponsiveTable';
import IconWhatsApp from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonDropdownActions from '../../../../components/Common/CommonDrodownAction';
import CommonTooltip from '../../../../components/Common/CommonTooltip';
import ViewContactsModal from '../../../../components/Contact/ViewContactsModal';
import CommonSearchInput from '../../../../components/Sale/Link/preview/components/Common/CommonSearchInput';

export default function CampaignTemplateList() {
  const router = useRouter();
  const { list } = router.query;
  const [isLoading, setLoading] = useState(false);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showSelected, setShowSelected] = useState(false);

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
  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [listingPageSize, setListingPageSize] = useState(
    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
  );
  const [totalContacts, setTotalContacts] = useState(0);
  const [listingPageCount, setListingPageCount] = useState(0);
  // default sort by created date
  const [sortInfo, setSortInfo] = useState({
    columnId: null,
    columnHeader: null,
    order: null,
  });
  const [contactListData, setContactListData] = useState(null);

  const [allContacts, setAllContacts] = useState([]);

  const [showCreateList, setShowCreateList] = useState(false);
  const initialColumns = [
    {
      id: 'list_name',
      Header: 'Name',
      filter: 'text',
      sortType: 'text',
      headerWidth: '100',

      Cell: ({ row: { original, index } }) => {
        const { first_name, last_name } = original;
        const fullName = h.user.formatFullName(original)
          ? h.user.formatFullName(original)
          : 'None';
        return fullName;
      },
    },
    {
      id: 'sanitize_phone',
      Header: 'Phone number',
      filter: 'text',
      sortType: 'text',
      headerWidth: '100',

      Cell: ({ row: { original } }) => {
        const { mobile_number } = original;
        if (h.isEmpty(mobile_number)) {
          return <span>None</span>;
        }
        return <span>{mobile_number}</span>;
      },
    },
    {
      id: 'sanitize_email',
      Header: 'Email',
      filter: 'text',
      sortType: 'text',
      headerWidth: '100',

      Cell: ({ row: { original } }) => {
        const { email } = original;
        if (h.isEmpty(email)) {
          return <span>None</span>;
        }
        return <span>{email}</span>;
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const tableColumns = useMemo(() => columns, [columns]);
  const memoizedAllQueries = useMemo(() => {
    return allQueries;
  }, [JSON.stringify(allQueries)]);

  useEffect(() => {
    (async () => {
      if (h.notEmpty(list)) {
        const listRes = await api.contactList.getListDetails(
          list,
          {
            search: null,
            pageIndex: listingPageIndex,
            pageSize: listingPageSize,
            total: listingPageCount ? listingPageCount : null,
            sortOrder: sortInfo.order ?? 'DESC',
            sortColumn: sortInfo.columnId ?? 'created_date',
          },
          false,
        );
        if (h.cmpStr(listRes.status, 'ok')) {
          setContactListData(listRes.data.contact_list);
        }
      }
    })();
  }, [list]);

  // Reset page index on set filters
  useEffect(() => {
    setListingPageIndex(0);
  }, [allQueries]);

  useEffect(() => {
    getAllContacts();
  }, [listingPageIndex, listingPageSize, sortInfo, memoizedAllQueries]);

  async function getAllContacts() {
    setStatus(constant.API_STATUS.PENDING);
    const setFilter = allQueries.setFilter;

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

    pagination.pageIndex = listingPageIndex;
    pagination.pageSize = listingPageSize;
    pagination.sortColumn = sortInfo.columnId ?? 'created_date';
    pagination.sortOrder = sortInfo.order ?? 'DESC';

    // Add total contact count
    if (totalContacts > 0) {
      pagination.totalCount = listingPageIndex !== 0 ? totalContacts : null;
    }

    // request body for POST requests
    const requestBody = {
      ...allQueries,
      pagination: pagination,
    };

    const apiRes = await api.contact.findAll(requestBody, {}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setAllContacts(apiRes.data.contacts);
      setListingPageCount(apiRes.data.metadata.pageCount);
    }

    setStatus(constant.API_STATUS.FULLFILLED);
  }

  function getListAction(data) {
    const listActionsArr = [];

    listActionsArr.push({
      label: 'Delete',
      icon: faTrash,
      className: 'info-red',
      action: () => {
        h.general.prompt(
          {
            message: 'Are you sure you want to delete this list?',
          },

          async (status) => {
            if (status) {
            }
          },
        );
      },
    });
    return listActionsArr;
  }

  function handleViewSelected(rows) {
    const selectedContacts = rows.map((row) => ({
      contact_id: row.contact_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      mobile_number: row.mobile_number,
      is_whatsapp: row.is_whatsapp,
      agency_user: row.agency_user,
    }));

    setSelectedContacts(selectedContacts);
    setShowSelected(true);
  }

  // Modifying tableColumns on sort direction change
  function changeSortDirection(header, direction) {
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
  }
  const handleSubmitList = async () => {
    h.general.prompt(
      {
        message: 'Are you sure you want to submit selected contacts?',
      },

      async (confirmSubmit) => {
        if (confirmSubmit) {
          setLoading(true);
          const contactListSubmitRes =
            await api.contactListUser.processListUsersFromContacts(
              { contact_list_id: list, contact_list: selectedContacts },
              false,
            );
          if (h.cmpStr(contactListSubmitRes.status, 'ok')) {
            h.general.alert('success', {
              message: 'Contact List Saved!',
              autoCloseInSecs: 1,
            });
            setTimeout(() => {
              setLoading(false);
              window.location.href = h.getRoute(
                routes.templates.contact.list_view,
                {
                  list_id: list,
                },
              );
            }, 2000);
          }
          setLoading(false);
        }
      },
    );
  };

  return (
    <>
      {showSelected && (
        <ViewContactsModal
          contacts={selectedContacts}
          handleSubmitList={handleSubmitList}
          handleCloseModal={() => {
            setShowSelected(false);
          }}
        />
      )}
      <div id="messaging-root" className="layout-v">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading}>
          <div className="messaging-container modern-style">
            <div
              className="message-body new-table"
              style={{ width: '100%', padding: '10px', overflow: 'auto' }}
            >
              <div className="">
                <div className="pl-3 pr-3 pb-2">
                  <div className="d-flex justify-content-between">
                    <h1
                      style={{
                        fontFamily: 'PoppinsRegular',
                        lineHeight: '1.5',
                        fontSize: '20px',
                      }}
                    >
                      Import from existing contacts
                      <span
                        style={{
                          display: 'block',
                          color: '#5A6264',
                          fontFamily: 'PoppinsLight',
                          fontSize: '14px',
                        }}
                      >
                        {contactListData ? contactListData.list_name : ''}
                      </span>
                    </h1>
                  </div>
                  <div className="d-flex justify-content-between">
                    <CommonSearchInput
                      isLoading={isLoading}
                      callback={(e) => {
                        const duplicateQueries =
                          h.general.deepCloneObject(allQueries);
                        duplicateQueries.setFilter.search = e;
                        setAllQueries(duplicateQueries);
                      }}
                      placeholder={'Search contact name'}
                      className={`mr-2`}
                      disabled={false}
                    />

                    <div className="d-flex justify-content-end align-items-center">
                      {/* <button
                        type="type"
                        className="chip-button mr-2 light-red"
                        onClick={() => {}}
                      >
                        <FontAwesomeIcon
                          icon={faSave}
                          color="#fff"
                          spin={isLoading}
                          style={{ fontSize: '15px' }}
                        />
                        {'Save Contacts'}
                      </button> */}
                    </div>
                  </div>

                  {status === constant.API_STATUS.PENDING && (
                    <FullTableLoading
                      headers={['', 'Name', 'Phone Number', 'Email']}
                      rowsCount={10}
                    />
                  )}

                  {status === constant.API_STATUS.FULLFILLED &&
                    allContacts.length > 0 && (
                      <div className="no-oxs">
                        <CommonResponsiveTable
                          columns={tableColumns}
                          data={allContacts}
                          thHeight="50px"
                          options={{
                            manualPagination: true,
                            pageCount: listingPageCount,
                            enableRowSelect: true,
                            scrollable: true,
                            pageIndex: listingPageIndex,
                            pageSize: listingPageSize,
                            newCheckBox: true,
                          }}
                          setListingPageIndex={setListingPageIndex}
                          setListingPageSize={setListingPageSize}
                          sortDirectionHandler={changeSortDirection}
                          bulkActions={[
                            {
                              action: 'View selected contacts',
                              icon: faUsers,
                              iconColor: '#fff',
                              handler: handleViewSelected,
                            },
                          ]}
                          modern={true}
                        />
                      </div>
                    )}

                  {status === constant.API_STATUS.FULLFILLED &&
                    allContacts.length === 0 && (
                      <div className="no-messages-found">
                        <span>
                          <FontAwesomeIcon
                            icon={faInfo}
                            color="#DEE1E0"
                            style={{ fontSize: '40px' }}
                          />
                        </span>
                        <br />
                        No contact found
                      </div>
                    )}
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
