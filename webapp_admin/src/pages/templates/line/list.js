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

export default function CampaignTemplateList() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [agencyId, setAgencyId] = useState(null);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [businessAcnt, setBusinessAcnt] = useState([]);
  const [searchQuery, setSearchQuery] = useState({
    query: '',
    businessAccount: null,
  });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function getListAction(template) {
    const { agency_fk, line_template_id, status, is_edited } = template;

    const listActionsArr = [];

    if (!h.cmpStr(status, 'PENDING')) {
      listActionsArr.push({
        label: 'Edit',
        icon: faEdit,
        className: '',
        action: () => {
          window.location.href = h.getRoute(routes.templates.line.edit, {
            line_template_id,
          });
        },
      });
      listActionsArr.push({
        label: 'Delete',
        icon: faTrash,
        className: 'info-red',
        action: () => {
          handleDeleteTemplatePrompt(agency_fk, line_template_id);
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
      headerWidth: '200',
      accessor: 'template_name',

      Cell: ({ row: { original } }) => {
        const { line_template_id } = original;
        return (
          <Link
            href={h.getRoute(routes.templates.line.view, {
              line_template_id,
            })}
          >
            <div className="template">
              <div
                className=""
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
      id: 'template_channel',
      Header: 'Channel',
      filter: 'text',
      sortType: 'text',
      headerWidth: '200px',
      accessor: 'channel_name',
      Cell: ({ row: { original } }) => {
        const { agency_channel_config } = original;
        const { channel_name } = agency_channel_config;
        return <span className="off-black">{channel_name}</span>;
      },
    },
    {
      id: 'template_type',
      Header: 'Template Type',
      filter: 'text',
      sortType: 'text',
      headerWidth: '150px',
      accessor: 'template_type',
      Cell: ({ row: { original } }) => {
        const { template_type } = original;
        return <span className="off-black">{template_type}</span>;
      },
    },
    {
      id: 'template_status',
      Header: 'Template Status',
      filter: 'text',
      sortType: 'text',
      headerWidth: '150px',
      accessor: 'status',
      Cell: ({ row: { original } }) => {
        const { status } = original;
        return (
          <span className="off-black">{h.general.sentenceCase(status)}</span>
        );
      },
    },
    // {
    //   id: 'created_by',
    //   Header: 'Created By',
    //   filter: 'text',
    //   sortType: 'text',
    //   headerWidth: '200px',
    //   accessor: 'status',
    //   Cell: ({ row: { original } }) => {
    //     const { user } = original;
    //     return <span className="off-black">{h.user.formatFullName(user)}</span>;
    //   },
    // },
    {
      id: 'template_date',
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
      id: 'w-actions',
      Header: 'Actions',
      accessor: 'action',
      disableSortBy: true,
      headerWidth: '75px',
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

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        getAgencyChannels(apiRes.data.agencyUser.agency.agency_id);
        await getTemplates(apiRes.data.agencyUser.agency.agency_id);
        setAgencyId(apiRes.data.agencyUser.agency.agency_id);
      }
    })();
  }, []);

  async function getTemplates(id) {
    setStatus(constant.API_STATUS.PENDING);
    const apiRes = await api.line.listTemplates({ agency_id: id }, false);

    if (h.cmpStr(apiRes.status, 'ok')) {
      setData(
        apiRes.data.agency_line_templates.length > 0
          ? apiRes.data.agency_line_templates
          : [],
      );
    }
    setStatus(constant.API_STATUS.FULLFILLED);
  }

  async function getAgencyChannels(id) {
    const apiRes = await api.line.getChannelList({ agency_id: id }, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setBusinessAcnt(h.notEmpty(apiRes.data) ? apiRes.data : []);
    }
  }

  function search(value, type) {
    const searchForm = { ...searchQuery };
    searchForm[type] = value;

    setSearchQuery(searchForm);
  }

  const templateListData = useMemo(() => {
    return data.filter((f) => {
      let r = false;
      if (
        f.template_name !== '' &&
        f.template_name.toLowerCase().includes(searchQuery.query.toLowerCase())
      ) {
        r = true;
      }

      if (searchQuery.businessAccount) {
        if (
          f.line_channel ===
          searchQuery.businessAccount?.value?.agency_channel_config_id
        ) {
          r = true;
        } else {
          r = false;
        }
      }

      return r;

      // if()
      // return (
      //   f.template_name
      //     .toLowerCase()
      //     .includes(searchQuery.query.toLowerCase()) &&
      //   searchQuery.businessAccount &&
      //   f.line_channel ===
      //     searchQuery.businessAccount?.value?.agency_channel_config_id
      // );
    });
  }, [searchQuery, data]);

  const handleDeleteTemplate = async (agency_id, line_template_id) => {
    setLoading(true);
    const deleteRes = await api.line.deleteTemplate(line_template_id, true);
    if (h.cmpStr(deleteRes.status, 'ok')) {
      setStatus(constant.API_STATUS.PENDING);
      const apiRes = await api.line.listTemplates(
        { agency_id: agency_id },
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        setData(apiRes.data.agency_line_templates);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    }
    setLoading(false);
  };

  const handleDeleteTemplatePrompt = async (agency_id, line_template_id) => {
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
        return handleDeleteTemplate(agency_id, line_template_id);
    });
  };

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
                  <h1> Line Templates</h1>
                </div>
                <div className="d-flex justify-content-center">
                  <CommonIconButton
                    style={{ width: 200, height: 36 }}
                    onClick={() => router.push(routes.templates.line.create)}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      color="#fff"
                      fontSize="20px"
                    />
                    {'Create Line Template'}
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
                          }}
                          placeholder={'Search template name'}
                          className={`mr-2`}
                          disabled={status === constant.API_STATUS.PENDING}
                        />
                        <div style={{ width: '350px' }}>
                          <CommonSelect
                            id="select_b_account"
                            options={
                              businessAcnt.length > 0
                                ? [
                                    ...businessAcnt.map((m) => ({
                                      value: m,
                                      label: `${m.channel_name} [${m.channel_id}]`,
                                    })),
                                  ]
                                : []
                            }
                            value={searchQuery.businessAccount}
                            isSearchable={true}
                            onChange={(v) => {
                              search(v, 'businessAccount');
                            }}
                            placeholder="Select Line Channel"
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
                            'Channel',
                            'Status',
                            'Created Date',
                          ]}
                          rowsCount={10}
                        />
                      )}
                      {status === constant.API_STATUS.FULLFILLED &&
                        data.length > 0 && (
                          <CommonResponsiveTable
                            columns={tableColumns}
                            data={templateListData}
                            options={{
                              manualPagination: false,
                              scrollable: true,
                            }}
                            thHeight="50px"
                            modern={true}
                          />
                        )}

                      {status === constant.API_STATUS.FULLFILLED &&
                        data.length === 0 && (
                          <div className="no-messages-found">
                            <span>
                              <FontAwesomeIcon
                                icon={faInfoCircle}
                                color="#DEE1E0"
                                style={{ fontSize: '40px' }}
                              />
                            </span>
                            <br />
                            No templates found
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
