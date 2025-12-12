import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';
// ICON
import {
  faPlus,
  faInfo,
  faUsers,
  faTrash,
  faBullhorn,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import CommonResponsiveTable from '../../../components/Common/CommonResponsiveTable';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonDropdownActions from '../../../components/Common/CommonDrodownAction';
import CommonTooltip from '../../../components/Common/CommonTooltip';
import CreateListModal from '../../../components/Contact/CreateListModal';
import EditField from '../../dashboard/messaging/EditField';
import CommonSearchInput from '../../../components/Sale/Link/preview/components/Common/CommonSearchInput';
import CommonIconButton from '../../../components/Common/CommonIconButton';

export default function CampaignTemplateList() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [data, setData] = useState([]);
  const [listCount, setListCount] = useState(0);
  const [showCreateList, setShowCreateList] = useState(false);
  const [agencyId, setAgencyId] = useState(null);
  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [listingPageSize, setListingPageSize] = useState(
    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
  );
  const [listingPageCount, setListingPageCount] = useState(0);

  const [searchText, setSearchText] = useState(null);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
      (async () => {
        await h.userManagement.hasAdminAccessElseRedirect();
        const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
        if (h.cmpStr(apiRes.status, 'ok')) {
          await getList(apiRes.data.agencyUser.agency.agency_id);
          setAgencyId(apiRes.data.agencyUser.agency.agency_id);
        }
      })();
  }, [listingPageSize, listingPageIndex]);

  async function getList(id) {
    setStatus(constant.API_STATUS.PENDING);
    setLoading(true);
    const apiRes = await api.contactList.contactList(
      {
        agency_id: id,
        search: searchText,
        limit: listingPageSize,
        skip: listingPageIndex * listingPageSize,
      },
      false
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      const listData = apiRes.data.contact_list;
      const totalRecords = apiRes.data.totalRecords;
      setData(listData);
      setListCount(totalRecords);
      setListingPageCount(
        Math.ceil(apiRes.data.totalRecords / listingPageSize),
      );
    }
    setStatus(constant.API_STATUS.FULLFILLED);
    setLoading(false);
  }

  const updateContactListName = async (contactListID, contactListName) => {
    const formData = {
      contact_list_id: contactListID,
      list_name: contactListName,
    };
    const apiRes = await api.contactList.update(formData, true);
    if (h.cmpStr(apiRes.status, 'ok')) {
      getList(apiRes.data.contactListRecord.agency_fk);
    }
  };

  const initialColumns = [
    {
      id: 'list_name',
      Header: 'Name',
      filter: 'text',
      sortType: 'text',
      accessor: 'name',
      headerWidth: '100',

      Cell: ({ row: { original } }) => {
        const { contact_list_id, list_name } = original;
        return (
          <EditField
            text={list_name}
            clickAction={() => {
              router.push(
                h.getRoute(routes.templates.contact.list_view, {
                  list_id: contact_list_id,
                }),
                undefined,
                { shallow: true },
              );
            }}
            saveAction={(e) => {
              const newListName = e.name.trim();
              const newListNameWords = newListName.split(' ');
              const capitalizedWords = newListNameWords.map(
                (word) => word.charAt(0).toUpperCase() + word.slice(1),
              );
              const capitalizedName = capitalizedWords.join(' ');
              if (!h.cmpStr(list_name, capitalizedName)) {
                updateContactListName(contact_list_id, capitalizedName);
              }
            }}
          />
        );
      },
    },
    {
      id: 'Members',
      Header: 'Members',
      filter: 'text',
      sortType: 'text',
      headerWidth: '100',
      accessor: 'members',

      Cell: ({ row: { original } }) => {
        const { user_count } = original;
        return <>{user_count} contacts</>;
      },
    },
    {
      id: 'Status',
      Header: 'Status',
      filter: 'text',
      sortType: 'text',
      headerWidth: '100',
      accessor: 'status',

      Cell: ({ row: { original } }) => {
        const { status } = original;
        return <>{h.general.sentenceCase(status)}</>;
      },
    },
    {
      id: 'list_date',
      Header: 'Created Date',
      filter: 'text',
      sortType: 'date',
      headerWidth: '240px',
      accessor: 'created_date',
      Cell: ({ row: { original } }) => {
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const utcDate = new Date(original.created_date_raw);
        const options = {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: localTimezone,
        };
        const localDateString = utcDate.toLocaleString(undefined, options);

        return <span className="off-black">{localDateString}</span>;
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
      label: 'Delete list',
      icon: faTrash,
      className: 'info-red ',
      action: () => {
        h.general.prompt(
          {
            message: 'Are you sure you want to delete this list?',
          },

          async (confirmDelete) => {
            if (confirmDelete) {
              setLoading(true);
              const removeApiRes = await api.contactList.deleteContactList(
                data.contact_list_id,
                false,
              );
              if (h.cmpStr(removeApiRes.status, 'ok')) {
                h.general.alert('success', {
                  message: 'Contact list deleted!',
                  autoCloseInSecs: 1,
                });
                setTimeout(() => {
                  getList(data.agency_fk);
                  setLoading(false);
                }, 1000);
              }
              setLoading(false);
            }
          },
        );
      },
    });
    return listActionsArr;
  }

  useEffect(() => {
    if (agencyId) {
      getList(agencyId);
    }
  }, [searchText, agencyId]);

  return (
    <>
      {showCreateList && (
        <CreateListModal
          agencyId={agencyId}
          handleCloseModal={setShowCreateList}
        />
      )}
      <div data-testid="chaaat-contact-list-page" className="contacts-root layout-v">
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
                  <h1> Contact Lists</h1>
                  <span>{listCount} list/s</span>
                </div>
                <div className="d-flex justify-content-center ">
                  <CommonIconButton
                    className="common-icon-button c-red"
                    style={{ width: 200, height: 36 }}
                    onClick={() => {
                      setShowCreateList(true);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      color="#fff"
                      spin={isLoading}
                      style={{ fontSize: '15px' }}
                    />
                    {'Create new list'}
                  </CommonIconButton>
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style">
            <div className="bg-white">
              <div className="container dashboard-contacts-container modern-style">
                <div className="messaging-container modern-style">
                  <div className="message-body">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex align-items-center">
                        <CommonSearchInput
                          isLoading={isLoading}
                          callback={(e) => {
                            setListingPageIndex(0);
                            setSearchText(e);
                            if (
                              tableRef &&
                              tableRef.current &&
                              tableRef.current.gotoPage
                            ) {
                              tableRef.current.gotoPage(0);
                            }
                          }}
                          placeholder={'Search contact list name'}
                          className={`mr-2`}
                        />
                      </div>
                    </div>
                    <div className="tab-body no-oxs">
                      {h.notEmpty(data) ? (
                        <div className="no-oxs new-table">
                          <CommonResponsiveTable
                            ref={tableRef}
                            columns={tableColumns}
                            data={data}
                            options={{
                              manualPagination: true,
                              pageCount: listingPageCount,
                              scrollable: true,
                              pageIndex: listingPageIndex,
                              pageSize: listingPageSize
                            }}
                            setListingPageSize={setListingPageSize}
                            setListingPageIndex={setListingPageIndex}
                            thHeight="50px"
                            modern={true}
                          />
                        </div>
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
                          No contact lists found.
                        </div>
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
