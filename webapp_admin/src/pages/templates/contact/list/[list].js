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
  faUserAltSlash,
  faTrashAlt,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import CommonResponsiveTable from '../../../../components/Common/CommonResponsiveTable';
import IconWhatsApp from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonDropdownActions from '../../../../components/Common/CommonDrodownAction';
import CommonTooltip from '../../../../components/Common/CommonTooltip';
import CreateListModal from '../../../../components/Contact/CreateListModal';
import ImportContactSelectionModal from '../../../../components/Contact/ImportContactSelectionModal';
import CreateContactModal from '../../../../components/Contact/CreateContactModal';
import CommonSearchInput from '../../../../components/Sale/Link/preview/components/Common/CommonSearchInput';
import CommonIconButton from '../../../../components/Common/CommonIconButton';
import FullTableLoading from '../../../../components/Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';

export default function CampaignTemplateList() {
  const router = useRouter();
  const { list } = router.query;

  const [isLoading, setLoading] = useState(false);
  const [apiLoadingStatus, setApiLoadingStatus] = useState(
    constant.API_STATUS.PENDING,
  );
  const [openImportContact, setOpenImportContact] = useState(false);
  const [data, setData] = useState([]);
  const [listData, setListData] = useState({});
  const [listName, setListName] = useState(null);
  const [listCount, setListCount] = useState(0);
  const [listSource, setListSource] = useState(null);
  const [listSourceValue, setListSourceValue] = useState(null);
  const [contactId, setContactId] = useState(null);
  const [agency, setAgency] = useState(null);
  const [searchText, setSearchText] = useState(null);
  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [listingPageSize, setListingPageSize] = useState(
    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
  );
  const [listingPageCount, setListingPageCount] = useState(0);
  const [sortInfo, setSortInfo] = useState({
    columnId: null,
    columnHeader: null,
    order: null,
  });
  const [allQueries, setAllQueries] = useState({
    setFilter: {
      search: '',
    },
    moreFilter: {},
  });
  const [lineChannels, setLineChannels] = useState([]);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgency(apiRes.data.agencyUser.agency);
        const credentials = await api.line.getChannelList(
          { agency_id: apiRes.data.agencyUser.agency.agency_id },
          false,
        );
        setLineChannels(credentials.data);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (list) {
        await getContactMembers(list);
      }
    })();
  }, [list, listingPageIndex, listingPageSize, sortInfo, allQueries]);

  async function getContactMembers(list) {
    setApiLoadingStatus(constant.API_STATUS.PENDING);
    const setFilter = allQueries.setFilter;

    const listRes = await api.contactList.getListDetails(
      list,
      {
        search: setFilter.search,
        pageIndex: listingPageIndex,
        pageSize: listingPageSize,
        total: listingPageCount ? listingPageCount : null,
        sortOrder: sortInfo.order ?? 'DESC',
        sortColumn: sortInfo.columnId ?? 'created_date',
      },
      false,
    );
    if (h.cmpStr(listRes.status, 'ok')) {
      if (!h.isEmpty(listRes.data.contact_list)) {
        setListData(listRes.data.contact_list);
        setListName(listRes.data.contact_list.list_name);
        setListCount(listRes.data.contact_list.user_count);
        setListingPageCount(listRes.data.metadata.pageCount);
        setListSource(
          listRes.data.contact_list.source_type === 'LINE' ? 'LINE' : null,
        );
        setListSourceValue(listRes.data.contact_list.source_value);
        // updateParentProjectsCount(listRes.data.metadata.totalCount);
        const contactData = [];
        if (!h.isEmpty(listRes.data.contact_list_users)) {
          const contact_list_users = listRes.data.contact_list_users;
          for (const contact_list of contact_list_users) {
            const contactObj = {
              contact_list_user_id: contact_list?.contact_list_user_id,
              contact_id: contact_list?.contact_id,
              name:
                contact_list?.contact?.first_name +
                ' ' +
                contact_list?.contact?.last_name,
              email: contact_list?.contact?.email,
              phone_number: contact_list?.contact?.mobile_number,
              lead_score: contact_list?.contact?.lead_score,
              import_type: contact_list?.import_type,
              owner: !h.isEmpty(contact_list?.contact?.agency_user)
                ? contact_list?.contact?.agency_user?.user?.first_name +
                  ' ' +
                  contact_list?.contact?.agency_user?.user?.last_name
                : 'Not Assigned',
            };
            contactData.push(contactObj);
          }
          setData(contactData);
        } else {
          setData(contactData);
        }
      }
      setApiLoadingStatus(constant.API_STATUS.FULLFILLED);
    }
  }

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

  const initialColumns = [
    {
      id: 'contact.first_name',
      Header: 'Contact Name',
      accessor: (row) => {
        return h.user.formatFullName(row) ? h.user.formatFullName(row) : '';
      },
      filter: 'text',
      sortType: 'text',
      headerWidth: '100',

      Cell: ({ row: { original } }) => {
        const { name, contact_id } = original;
        return (
          <span
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => setContactId(contact_id)}
          >
            {name}
          </span>
        );
      },
    },
    {
      id: 'contact.email',
      Header: 'Email',
      accessor: 'email',
      filter: 'text',
      sortType: 'text',
      headerWidth: '100',

      Cell: ({ row: { original } }) => {
        const { email } = original;
        return <>{email}</>;
      },
    },
    {
      id: 'contact.mobile_number',
      Header: 'Phone Number',
      accessor: 'mobile_number',
      filter: 'text',
      sortType: 'text',
      headerWidth: '170px',

      Cell: ({ row: { original } }) => {
        const { phone_number } = original;
        return <>{phone_number}</>;
      },
    },
    {
      id: 'contact.lead_score',
      Header: 'Lead Score',
      accessor: 'lead_score',
      filter: 'text',
      sortType: 'number',
      headerWidth: '120px',

      Cell: ({ row: { original } }) => {
        const { lead_score } = original;
        return (
          <>
            <div style={{ textAlign: 'center' }}>{lead_score}</div>
          </>
        );
      },
    },
    {
      id: 'contact.agency_user.user.first_name',
      Header: 'Contact Owner',
      accessor: 'owner',
      filter: 'text',
      sortType: 'text',
      headerWidth: '200px',

      Cell: ({ row: { original } }) => {
        const { owner } = original;
        return <>{owner}</>;
      },
    },
    {
      id: 'import_type',
      Header: 'Import Type',
      accessor: 'import_type',
      filter: 'text',
      sortType: 'text',
      headerWidth: '120px',

      Cell: ({ row: { original } }) => {
        const { import_type } = original;
        return (
          <>
            <div style={{ textAlign: 'center' }}>{import_type}</div>
          </>
        );
      },
    },
    {
      id: 'contact-actions',
      Header: 'Action',
      accessor: 'action',
      disableSortBy: true,
      headerWidth: '80px',
      style: { overflow: 'inherit' },
      Cell: ({ row: { original } }) => {
        return (
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <CommonDropdownActions items={getListAction(original)} />
          </div>
        );
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const tableColumns = useMemo(() => columns, [columns]);

  function getListAction(data) {
    const listActionsArr = [];

    listActionsArr.push({
      label: 'Remove from list',
      icon: faUserAltSlash,
      action: () => {
        // Action function here
        removeFromList(data.contact_list_user_id);
      },
    });
    return listActionsArr;
  }

  function deleteList() {
    h.general.prompt(
      {
        message: 'Are you sure you want to delete this list?',
      },

      async (confirmDelete) => {
        if (confirmDelete) {
          setLoading(true);
          const removeApiRes = await api.contactList.deleteContactList(
            list,
            false,
          );
          if (h.cmpStr(removeApiRes.status, 'ok')) {
            h.general.alert('success', {
              message: 'Contact list deleted!',
              autoCloseInSecs: 1,
            });
            setTimeout(() => {
              setLoading(false);
              router.push(routes.templates.contact.list);
            }, 2000);
          }
          setLoading(false);
        }
      },
    );
  }

  function removeFromList(contact_list_user_id) {
    h.general.prompt(
      {
        message: 'Are you sure you want to remove contact from this list?',
      },
      async (confirmDelete) => {
        if (confirmDelete) {
          setLoading(true);
          const removeApiRes = await api.contactListUser.removeFromContactList(
            contact_list_user_id,
            false,
          );
          if (h.cmpStr(removeApiRes.status, 'ok')) {
            h.general.alert('success', {
              message: 'Contact Removed from List!',
              autoCloseInSecs: 1,
            });
            await getContactMembers(list);
          }
          setLoading(false);
        }
      },
    );
  }

  return (
    <>
      {h.notEmpty(contactId) && (
        <CreateContactModal
          formMode={h.form.FORM_MODE.EDIT}
          contactId={contactId}
          setLoading={setLoading}
          onCloseModal={async () => {
            setContactId(null);
            await getContactMembers(list);
          }}
        />
      )}

      {openImportContact && (
        <ImportContactSelectionModal
          listID={list}
          handleCloseModal={setOpenImportContact}
          agency={agency}
          lineChannels={lineChannels}
          listSource={listSource}
          listSourceValue={listSourceValue}
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
              <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
                <div>
                  <h1>
                    {apiLoadingStatus === constant.API_STATUS.PENDING
                      ? 'Loading...'
                      : listName}
                  </h1>
                  <span>{listCount} contact/s</span>
                </div>
                {apiLoadingStatus === constant.API_STATUS.FULLFILLED && (
                  <div className="d-flex justify-content-center button-icon-container">
                    <CommonIconButton
                      className="c-transparent mr-2"
                      onClick={() => {
                        deleteList(true);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        color="#182327"
                        fontSize="20px"
                        className="mr-2"
                      />
                      Delete list
                    </CommonIconButton>

                    <CommonIconButton
                      className="c-red"
                      style={{ width: 200, height: 36 }}
                      onClick={() => {
                        setOpenImportContact(true);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUsers}
                        color="#fff"
                        spin={isLoading}
                        style={{ fontSize: '15px' }}
                      />
                      Import Contacts
                    </CommonIconButton>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style no-oxs">
            <div className="bg-white">
              <div className="container dashboard-contacts-container modern-style">
                <div className="messaging-container modern-style">
                  <div className="message-body new-table">
                    <div className="d-flex justify-content-between">
                      {listData.status !== 'GENERATING' && (
                        <div className="d-flex align-items-center">
                          <CommonSearchInput
                            isLoading={isLoading}
                            callback={(e) => {
                              setListingPageIndex(0);
                              const duplicateQueries =
                                h.general.deepCloneObject(allQueries);
                              duplicateQueries.setFilter.search = e;
                              setAllQueries(duplicateQueries);
                            }}
                            placeholder={'Search contact name'}
                            className={`mr-2`}
                          />
                        </div>
                      )}
                    </div>
                    <div className="tab-body no-oxs">
                      {listData.status === 'GENERATING' && (
                        <div className="no-messages-found center-body">
                          <span>
                            <FontAwesomeIcon
                              icon={faRedo}
                              color="#DEE1E0"
                              style={{ fontSize: '40px' }}
                              spin="true"
                            />
                          </span>
                          <br />
                          Generating contact list... <br /> Please refresh the page
                          and check back later.
                          <br />
                          <button
                            type="type"
                            className="chip-button mt-2"
                            onClick={() => {
                              window.location = window.location;
                            }}
                          >
                            Refresh
                          </button>
                        </div>
                      )}

                      {h.notEmpty(data) &&
                        listData.status !== 'GENERATING' &&
                        apiLoadingStatus === constant.API_STATUS.FULLFILLED && (
                          <div className="no-oxs">
                            <CommonResponsiveTable
                              columns={tableColumns}
                              data={data}
                              options={{
                                manualPagination: true,
                                pageCount: listingPageCount,
                                enableRowSelect: false,
                                scrollable: true,
                                pageIndex: listingPageIndex,
                                pageSize: listingPageSize,
                              }}
                              setListingPageIndex={setListingPageIndex}
                              setListingPageSize={setListingPageSize}
                              sortDirectionHandler={changeSortDirection}
                              thHeight="50px"
                              // searchString={searchText}
                              modern={true}
                            />
                          </div>
                        )}
                      {h.isEmpty(data) &&
                        listData.status !== 'GENERATING' &&
                        apiLoadingStatus === constant.API_STATUS.FULLFILLED && (
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
                            No contacts found.
                            <br />
                            <button
                              type="type"
                              className="chip-button mt-2"
                              onClick={() => {
                                setOpenImportContact(true);
                              }}
                            >
                              Import contacts
                            </button>
                          </div>
                        )}
                      {apiLoadingStatus === constant.API_STATUS.PENDING && (
                        <FullTableLoading
                          headers={[
                            'Name',
                            'Email',
                            'Phone Number',
                            'Lead Score',
                            'Contact Owner',
                            'Import Type',
                            'Actions',
                          ]}
                        />
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
