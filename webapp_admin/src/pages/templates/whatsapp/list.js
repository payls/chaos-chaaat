import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { api as api2 } from '../../../components/Sale/Link/preview/api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';
import Link from 'next/link';
import Swal from 'sweetalert2';
// ICON
import {
  faPlus,
  faRedo,
  faInfoCircle,
  faEdit,
  faEye,
  faTrash,
  faVolumeMute,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import CommonResponsiveTable from '../../../components/Common/CommonResponsiveTable';
import CommonDropdownActions from '../../../components/Common/CommonDrodownAction';
import CommonSearchInput from '../../../components/Sale/Link/preview/components/Common/CommonSearchInput';
import CommonSelect from '../../../components/Common/CommonSelect';
import CommonTooltip from '../../../components/Common/CommonTooltip';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import FullTableLoading from '../../../components/Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';
import { getTemplates } from '../../../api/proposalTemplate';
import UnsubscribeTextList from '../../../components/Inbox/UnsubscribeTextList';

export default function CampaignTemplateList() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [agencyId, setAgencyId] = useState(null);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [businessAcnt, setBusinessAcnt] = useState([]);
  const [showUnsubscribeTextList, setShowUnsubscribeTextList] = useState(false);
  const [searchText, setSearchText] = useState(null);
  const [searchWaba, setSearchWaba] = useState(null);
  const [searchCategory, setSearchCategory] = useState(null);
  const [searchLanguage, setSearchLanguage] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    query: '',
    businessAccount: null,
    category: null,
    status: null,
    language: null,
  });
  const [listingPageIndex, setListingPageIndex] = useState(0);
  const [listCount, setListCount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        getBusinessAccounts(apiRes.data.agencyUser.agency.agency_id);
        await getList(apiRes.data.agencyUser.agency.agency_id);
        setAgencyId(apiRes.data.agencyUser.agency.agency_id);
      }
    })();
  }, []);

  async function getList(id) {
    setStatus(constant.API_STATUS.PENDING);
    setLoading(true);
    const apiRes = await api.whatsapp.searchTemplates({
      agency_id: id, template_name: searchText, waba_number: searchWaba, 
      category: searchCategory, language: searchLanguage, status: searchStatus
    }, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      const listData = apiRes.data.agency_waba_templates;
      setData(listData);
      setListCount(listData.length);
      setTotalPendingCount(apiRes.data.pending_templates_count);
    }
    setStatus(constant.API_STATUS.FULLFILLED);
    setLoading(false);
  }

  async function syncTemplates() {
    if (totalPendingCount > 0) {
      setStatus(constant.API_STATUS.PENDING);
      const apiRes = await api2.whatsapp.syncTemplates(agencyId, false);
  
      if (h.cmpStr(apiRes.status, 'ok')) {
        await getList(agencyId);
  
        h.general.alert('success', {
          message: 'Templates has been updated!',
          autoCloseInSecs: 1,
        });
      }
    }
  }

  function getListAction(template) {
    const {
      agency_fk,
      waba_template_id,
      status,
      last_edit_date,
      last_edit_date_raw,
      is_edited,
    } = template;

    const listActionsArr = [];

    if (!h.cmpStr(status, 'PENDING')) {
      let can_edit = true;
      const currentDate = new Date();
      const currentUtcDate = new Date(
        currentDate.getTime() + currentDate.getTimezoneOffset() * 60000,
      );
      // Get the time zone offset in milliseconds
      const timeZoneOffsetMin = new Date().getTimezoneOffset();
      // Convert the offset to milliseconds
      const timeZoneOffsetMs = timeZoneOffsetMin * 60 * 1000;
      // Convert the UTC date and time to the local time zone
      const currentLocalDate = new Date(
        currentUtcDate.getTime() - timeZoneOffsetMs,
      );
      if (!h.isEmpty(last_edit_date)) {
        // Convert the msg created date to the local time zone
        const editDate = h.date.convertUTCDateToLocalDate(
          last_edit_date_raw,
          timeZone,
        );
        const date1 = new Date(currentLocalDate);
        const date2 = new Date(editDate);

        const timeDifference = date1 - date2;
        let hoursDifference = timeDifference / (1000 * 60 * 60);
        hoursDifference = Math.round(hoursDifference);

        if (hoursDifference >= 24) {
          can_edit = true;
        } else {
          can_edit = false;
        }
      } else {
        can_edit = true;
      }
      if (
        h.cmpStr(status, 'DRAFT') ||
        (h.cmpStr(status, 'APPROVED') && h.cmpBool(is_edited, false)) ||
        h.cmpStr(status, 'REJECTED') ||
        (h.cmpStr(status, 'APPROVED') &&
          h.cmpBool(is_edited, true) &&
          h.cmpBool(can_edit, true))
      ) {
        listActionsArr.push({
          label: 'Edit',
          icon: faEdit,
          className: '',
          action: () => {
            window.location.href = h.getRoute(routes.templates.whatsapp.edit, {
              waba_template_id,
            });
          },
        });
      } else {
        const editDate = h.date.convertUTCDateToLocalDate(
          last_edit_date_raw,
          timeZone,
        );
        listActionsArr.push({
          label: 'Edit',
          icon: faEdit,
          className: '',
          action: () => {
            Swal.fire({
              title: 'Edit Template',
              icon: 'warning',
              html: `Template can only be edited once per 24 hours. Last Edit Date: ${editDate}`,
              confirmButtonColor: '#025146',
              confirmButtonText: 'OK',
            });
          },
        });
      }
      listActionsArr.push({
        label: 'Delete',
        icon: faTrash,
        className: 'info-red',
        action: () => {
          handleDeleteTemplatePrompt(agency_fk, waba_template_id);
        },
      });
    }

    return listActionsArr;
  }

  const initialColumns = [
    {
      id: 'template_name',
      Header: 'Name',
      filter: 'text',
      sortType: 'text',
      accessor: 'template_name',

      Cell: ({ row: { original } }) => {
        const { waba_template_id } = original;
        return (
          <Link
            href={h.getRoute(routes.templates.whatsapp.view, {
              waba_template_id,
            })}
          >
            <div className="template">
              <div
                className="template-name"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                <CommonTooltip tooltipText="View Template">
                  <span className="off-black">
                    {h.general.sentenceCase(original.template_name)}
                  </span>
                </CommonTooltip>
              </div>
            </div>
          </Link>
        );
      },
    },
    {
      id: 'template_number',
      Header: 'WABA Number',
      filter: 'text',
      sortType: 'text',
      accessor: 'waba_number',
      Cell: ({ row: { original } }) => {
        return <span className="off-black">{original.waba_number}</span>;
      },
    },
    {
      id: 'template_cat',
      Header: 'Category',
      filter: 'text',
      sortType: 'text',
      accessor: 'category',
      Cell: ({ row: { original } }) => {
        return (
          <span className="off-black">
            {h.general.sentenceCase(original.category)}
          </span>
        );
      },
    },
    {
      id: 'template_lang',
      Header: 'Language',
      filter: 'text',
      sortType: 'text',
      accessor: 'language',
      additionalClass: 'column_hide_1440',
      Cell: ({ row: { original } }) => {
        const langIndex = constant.WHATSAPP.SUPPORTED_LANGUAGE.find((f) =>
          h.notEmpty(f[original.language]),
        );
        return (
          <span className="off-black">
            {h.notEmpty(langIndex) ? langIndex[original.language] : '-'}
          </span>
        );
      },
    },
    {
      id: 'template_state',
      Header: 'Template Status',
      filter: 'text',
      sortType: 'text',
      headerWidth: '140px',
      accessor: 'status',
      Cell: ({ row: { original } }) => {
        const { status } = original;
        return (
          <span className="off-black">{h.general.sentenceCase(status)}</span>
        );
      },
    },
    {
      id: 'template_date',
      Header: 'Created Date',
      filter: 'text',
      sortType: 'date',
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
      id: 'w-actions',
      Header: 'Actions',
      accessor: 'action',
      disableSortBy: true,
      style: { overflow: 'inherit' },
      Cell: ({ row: { original } }) => {
        const { status } = original;
        return (
          <div
            style={{
              display: h.general.cmpStr(status, 'PENDING') ? 'none' : 'grid',
              placeItems: 'center',
            }}
          >
            <CommonDropdownActions items={getListAction(original)} />
          </div>
        );
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const tableColumns = useMemo(() => columns, [columns]);

  async function getBusinessAccounts(id) {
    const apiRes = await api.whatsapp.getAgencyWhatsAppConfigurations(
      id,
      false,
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      setBusinessAcnt(apiRes.data.agency_whatsapp_config);
    }
  }

  function search(value, type) {
    const searchForm = { ...searchQuery };
    searchForm[type] = value;

    setSearchQuery(searchForm);
  }

  const handleDeleteTemplate = async (agency_id, waba_template_id) => {
    setLoading(true);
    const deleteRes = await api.whatsapp.deleteTemplate(waba_template_id, true);
    if (h.cmpStr(deleteRes.status, 'ok')) {
      setStatus(constant.API_STATUS.PENDING);
      const apiRes = await api.whatsapp.listTemplates(
        { agency_id: agency_id },
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        setData(apiRes.data.agency_waba_templates);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    }
    setLoading(false);
  };

  const handleDeleteTemplatePrompt = async (agency_id, waba_template_id) => {
    Swal.fire({
      title: 'Delete Template?',
      icon: 'warning',
      html: `This will permanently delete selected template. Continue?`,
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#025146',
      confirmButtonText: 'Yes',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result && result.value)
        return handleDeleteTemplate(agency_id, waba_template_id);
    });
  };

  useEffect(() => {
    if (agencyId) {
      getList(agencyId);
    }
  }, [agencyId, searchText, searchWaba, searchCategory, searchLanguage, searchStatus]);

  return (
    <>
      <div className="contacts-root layout-v">
        {showUnsubscribeTextList && agencyId && (
          <UnsubscribeTextList
            agencyId={agencyId}
            setLoading={setLoading}
            handleCloseModal={() => setShowUnsubscribeTextList(false)}
          />
        )}
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
                  <h1> WhatsApp Templates</h1>
                </div>
                <div className="d-flex justify-content-center button-icon-container">
                  <CommonTooltip tooltipText="This button can only be clicked if there are templates with pending status" placement="bottom">
                    <CommonIconButton
                      className={`c-transparent mr-2 ${totalPendingCount === 0 ? 'btn-pending-disabled' : ''}`}
                      style={{ width: 150, height: 36 }}
                      onClick={async () => await syncTemplates()}
                      disabled={status === constant.API_STATUS.PENDING}
                    >
                      <FontAwesomeIcon
                        icon={faRedo}
                        spin={status === constant.API_STATUS.PENDING}
                        color="#182327"
                        fontSize="20px"
                        className="mr-2"
                      />
                      {status === constant.API_STATUS.PENDING
                        ? 'Synching...'
                        : 'Sync Templates'}
                    </CommonIconButton>
                  </CommonTooltip>
                  <CommonIconButton
                    className="c-transparent mr-2"
                    style={{ width: 250, height: 36 }}
                    onClick={async () => {
                      setShowUnsubscribeTextList(true);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faVolumeMute}
                      color="#182327"
                      fontSize="20px"
                    />
                    {'Unsubscribe/Opt-Out Triggers'}
                  </CommonIconButton>
                  <CommonIconButton
                    className="c-red"
                    style={{ width: 260, height: 36 }}
                    onClick={() =>
                      router.push(routes.templates.whatsapp.create)
                    }
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      color="#fff"
                      fontSize="20px"
                    />
                    {'Create WhatsApp Template'}
                  </CommonIconButton>
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style no-oxs">
            <div className="bg-white">
              <div className="container dashboard-contacts-container modern-style">
                <div className="messaging-container modern-style">
                  <div className="message-body">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex align-items-center">
                        <CommonSearchInput
                          isLoading={status === constant.API_STATUS.PENDING}
                          callback={(e) => {
                            search(e, 'query');
                            setListingPageIndex(0);
                            setSearchText(e);
                          }}
                          value={searchQuery.query}
                          placeholder={'Search name/WABA number'}
                          className={`mr-2`}
                          disabled={status === constant.API_STATUS.PENDING}
                        />
                        <div style={{ width: '465px' }}>
                          <CommonSelect
                            id="select_b_account"
                            options={[
                              ...businessAcnt.map((m) => ({
                                value: m,
                                label: `${m.waba_name} [${m.waba_number}]`,
                              })),
                            ]}
                            value={searchQuery.businessAccount}
                            isSearchable={true}
                            onChange={(v) => {
                              setListingPageIndex(0);
                              search(v, 'businessAccount');
                              setSearchWaba(h.notEmpty(v) ? v.value.waba_number : null);
                            }}
                            placeholder="Select Business Account"
                            className=""
                            control={{
                              height: 40,
                              minHeight: 40,
                              borderRadius: 8,
                            }}
                            isClearable={true}
                            disabled={status === constant.API_STATUS.PENDING}
                          />
                        </div>
                        <div style={{ display: 'none', width: '250px' }}>
                          <CommonSelect
                            id="select_template_category"
                            options={[
                              ...constant.WHATSAPP.CATEGORY.map((m) => ({
                                value: m,
                                label: Object.values(m),
                              })),
                            ]}
                            value={searchQuery.category}
                            isSearchable={true}
                            onChange={(v) => {
                              setListingPageIndex(0);
                              search(v, 'category');
                              setSearchCategory(h.notEmpty(v) ? Object.keys(v.value)[0] : null);
                            }}
                            placeholder="Select Category"
                            className=""
                            control={{
                              height: 40,
                              minHeight: 40,
                              borderRadius: 8,
                            }}
                            isClearable={true}
                            disabled={status === constant.API_STATUS.PENDING}
                          />
                        </div>
                        <div style={{ display: 'none', marginLeft: '10px', width: '250px' }}>
                          <CommonSelect
                            id="select_template_language"
                            options={[
                              ...constant.WHATSAPP.SUPPORTED_LANGUAGE.map((m) => ({
                                value: m,
                                label: Object.values(m),
                              })),
                            ]}
                            value={searchQuery.language}
                            isSearchable={true}
                            onChange={(v) => {
                              setListingPageIndex(0);
                              search(v, 'language');
                              console.log(v);
                              setSearchLanguage(h.notEmpty(v) ? Object.keys(v.value)[0] : null);
                            }}
                            placeholder="Select Language"
                            className=""
                            control={{
                              height: 40,
                              minHeight: 40,
                              borderRadius: 8,
                            }}
                            isClearable={true}
                            disabled={status === constant.API_STATUS.PENDING}
                          />
                        </div>
                        <div style={{ marginLeft: '10px', width: '250px' }}>
                          <CommonSelect
                            id="select_template_status"
                            options={[
                              ...constant.WHATSAPP.TEMPLATE_STATUS.map((m) => ({
                                value: m,
                                label: Object.values(m),
                              })),
                            ]}
                            value={searchQuery.status}
                            isSearchable={true}
                            onChange={(v) => {
                              setListingPageIndex(0);
                              search(v, 'status');
                              console.log(v);
                              setSearchStatus(h.notEmpty(v) ? Object.keys(v.value)[0] : null);
                            }}
                            placeholder="Select Status"
                            className=""
                            control={{
                              height: 40,
                              minHeight: 40,
                              borderRadius: 8,
                            }}
                            isClearable={true}
                            disabled={status === constant.API_STATUS.PENDING}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="tab-body no-oxs new-table">
                      {status === constant.API_STATUS.PENDING && (
                        <FullTableLoading
                          headers={[
                            'Name',
                            'WABA Number',
                            'Category',
                            'Language',
                            'Status',
                            'Created Date',
                          ]}
                          rowsCount={10}
                        />
                      )}
                      {status !== constant.API_STATUS.PENDING && h.notEmpty(data) && (
                        <div className="no-oxs new-table">
                          <CommonResponsiveTable
                            columns={tableColumns}
                            data={data}
                            options={{
                              manualPagination: false,
                              scrollable: true,
                              pageIndex: listingPageIndex,
                            }}
                            setListingPageIndex={setListingPageIndex}
                            thHeight="50px"
                            modern={true}
                            overflow="auto"
                          />
                        </div>
                      )}
                      {status !== constant.API_STATUS.PENDING && h.isEmpty(data) && (
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
                          No templates found.
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
