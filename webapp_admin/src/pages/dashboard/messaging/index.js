import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import Swal from 'sweetalert2';

import moment from 'moment';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';
// ICON
import IconContact from '../../../components/Icons/IconContact';
import {
  faPaperPlane,
  faCheckDouble,
  faCommentSlash,
  faComments,
  faClock,
  faCheckCircle,
  faChartBar,
  faRedo,
  faEdit,
  faArchive,
  faEye,
  faEyeSlash,
  faFileDownload,
  faSlidersH,
  faInfoCircle,
  faMinusCircle,
  faTrash,
  faPauseCircle,
  faRedoAlt,
  faListAlt,
  faBan,
  faPlayCircle,
  faUsers,
  faCircle,
  faList,
  faPlus,
  faFileAlt,
  faUserCheck,
  faUserEdit,
} from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import CommonResponsiveTable from '../../../components/Common/CommonResponsiveTable';
import CommonTooltip from '../../../components/Common/CommonTooltip';
import CampaignInsights from '../../../components/Messaging/CampaignInsights';
import EditField from './EditField';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import Toggle from 'react-toggle';
import { saveAs } from 'file-saver';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonDropdownActions from '../../../components/Common/CommonDrodownAction';
import CampaignRecipients from '../../../components/Inbox/CampaignRecipients';
import WABAList from '../../../components/Inbox/WABAList';
import CampaignTrackerRecipients from '../../../components/Messaging/CampaignTrackerRecipients';

const queryClient = new QueryClient();

export default function WhatsAppSharedInbox() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [trackerData, setTrackerData] = useState(null);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [trackerName, setTrackerName] = useState(null);
  const [paveAccount, setPaveAccount] = useState(false);
  const [includeHiddenCampaigns, setIncludeHiddenCampaigns] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [showTrackerRecipients, setShowTrackerRecipients] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [showWABAList, setWABAList] = useState(false);
  const [approverIDs, setApproverIDs] = useState([]);
  const [unsubscribeTexts, setUnsubscribeTexts] = useState([]);
  const [hasWABA, setHasWABA] = useState(false);

  const handleDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };
  const [overview, setOverview] = useState({
    pending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    read: 0,
    replied: 0,
  });
  const [messages, setMessages] = useState([]);
  const [loadedWabaChecker, setLoadedWabaChecker] = useState(false);
  const [agencyId, setAgencyId] = useState('');
  const [columns, setColumns] = useState([]);
  const [scheduleColumns, setScheduleColumns] = useState([]);
  const [agencyUserId, setAgencyUserId] = useState('');

  useEffect(() => {
    (async () => {
      const newMessages = [];
      const wabaNumber = [];
      if (messages && messages.length > 0 && !loadedWabaChecker) {
        const mMsgs = messages;
        for (let i = 0; i < mMsgs.length; i++) {
          if (h.notEmpty(mMsgs[i].campaign_schedule_id)) {
            newMessages.push(mMsgs[i]);
            continue;
          }

          const fIndex = wabaNumber.findIndex(
            (f) => mMsgs[i].waba_number === f.waba_number,
          );

          if (fIndex < 0) {
            const waba_quality_status = await getWhatsAppRating(
              mMsgs[i].waba_number,
            );
            mMsgs[i].waba_number = waba_quality_status.data.waba_number;
            mMsgs[i].waba_status_rating = waba_quality_status.data.waba_status;
            mMsgs[i].waba_quality_rating =
              waba_quality_status.data.waba_quality;
            wabaNumber.push({
              waba_number: waba_quality_status.data.waba_number,
              waba_status_rating: waba_quality_status.data.waba_status,
              waba_quality_rating: waba_quality_status.data.waba_quality,
            });
          } else {
            mMsgs[i].waba_number = wabaNumber[fIndex].waba_number;
            mMsgs[i].waba_status_rating = wabaNumber[fIndex].waba_status_rating;
            mMsgs[i].waba_quality_rating =
              wabaNumber[fIndex].waba_quality_rating;
          }
          newMessages.push(mMsgs[i]);
        }
        setMessages(newMessages);
        setLoadedWabaChecker(true);
      }
    })();
  }, [messages]);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyId(apiRes.data.agencyUser.agency.agency_id);
        setAgencyUserId(apiRes.data.agencyUser.agency_user_id);
        const email_addr = apiRes.data.agencyUser.user.email;
        const support_email = 'yourpave.com';
        if (email_addr.includes(support_email)) {
          setPaveAccount(true);
        }
        const approvers =
          apiRes.data.agencyUser.agency?.campaign_approval_agent;
        if (!h.isEmpty(approvers)) {
          setApproverIDs(approvers.split(','));
        }

        const wabaRes = await api.whatsapp.getAgencyWhatsAppConfigurations(
          apiRes.data.agencyUser.agency.agency_id,
          false,
        );
        if (h.cmpStr(wabaRes.status, 'ok')) {
          const list = [...wabaRes.data.agency_whatsapp_config];
          setHasWABA(h.notEmpty(list));
        }
      }
      const texts = await api.agency.getUnsubscribeTexts(
        { agency_id: apiRes.data.agencyUser.agency.agency_id },
        false,
      );
      if (h.cmpStr(texts.status, 'ok')) {
        setUnsubscribeTexts(texts.data);

        if (h.isEmpty(texts.data)) {
          promptSettingUnsubscribeTexts();
        }
      }
    })();
  }, []);

  const promptSettingUnsubscribeTexts = async () => {
    Swal.fire({
      title: 'Set Unsubscribe Trigger Texts?',
      icon: 'warning',
      html: `It seems that you don't have any unsubscribe trigger texts configured. Would you like to set some before proceeding on creating a campaign?`,
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#4877ff',
      confirmButtonText: 'Yes! Proceed',
      cancelButtonColor: '#606A71',
      cancelButtonText: 'I will not need it yet',
    }).then(async (result) => {
      if (h.cmpBool(result.isConfirmed, true)) {
        router.push(routes.templates.whatsapp.list);
      } else {
        Swal.fire({
          title: 'Setting Unsubscribe Trigger Text Cancelled',
          icon: 'info',
          html: `You have cancelled setting the trigger texts. If you ever changed your mind, got to Templates > WhatsApp, and click the Unsubscribe/Opt-Out Triggers button.`,
          reverseButtons: true,
          showCancelButton: false,
          confirmButtonColor: '#4877ff',
          confirmButtonText: 'OK',
          cancelButtonColor: '#606A71',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          return true;
        });
      }
      return true;
      // if (result && result.value)
      //   return handleDeleteTemplate(agency_id, waba_template_id);
    });
  };

  useEffect(() => {
    const initialColumns = [
      {
        id: 'tracker_ref_name',
        Header: 'Campaign name',
        headerWidth: '250px',
        accessor: (row) =>
          h.isEmpty(row.campaign_name_label)
            ? !h.isEmpty(row.campaign_name)
              ? row.campaign_name
              : row.tracker_ref_name
            : row.campaign_name_label,
        disableSortBy: true,
        Cell: ({ row: { original } }) => {
          if (typeof original.batch_count === 'undefined') {
            return (
              <span style={{ textTransform: 'none', fontSize: '14px' }}>
                {h.isEmpty(original.campaign_name_label)
                  ? !h.isEmpty(original.campaign_name)
                    ? original.campaign_name
                    : original.tracker_ref_name
                  : original.campaign_name_label}
              </span>
            );
          } else {
            return (
              <EditField
                text={
                  h.isEmpty(original.campaign_name_label)
                    ? !h.isEmpty(original.campaign_name)
                      ? original.campaign_name
                      : original.tracker_ref_name
                    : original.campaign_name_label
                }
                textStyle={{ fontSize: '14px' }}
                trackerName={original.tracker_ref_name}
                saveAction={saveEditName}
                link={false}
              />
            );
          }
        },
      },
      {
        id: 'sort_date',
        Header: 'Scheduled Date',
        headerWidth: '150px',
        accessor: (row) =>
          h.isEmpty(row.sort_date) ? '' : row.sort_date,
        filter: 'text',
        sortType: 'date',
        Cell: ({ row: { original } }) => {
          const { sort_date } = original;
          let dateTime = 'Schedule Not Finalized';
          if (h.notEmpty(sort_date)) {
            const bDate = sort_date;
            const localTimezone =
              Intl.DateTimeFormat().resolvedOptions().timeZone;
            dateTime = h.date.convertUTCDateToLocalDate(
              moment(bDate).utc(false).format('DD MMM YYYY hh:mm a') + ' GMT',
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
          }
          return <span className="off-black" style={{fontSize: '14px'}}>{dateTime}</span>;
        },
      },
      {
        id: 'w-batch_count',
        Header: 'Count',
        accessor: 'batch_count',
        filter: 'text',
        headerWidth: '60px',
        Cell: ({ row: { original } }) => {
          const { batch_count, recipient_count } = original;
          return (
            <span className="off-black" style={{fontSize: '14px'}}>{batch_count ?? recipient_count}</span>
          );
        },
      },
      {
        id: 'w-waba-number',
        Header: 'WABA',
        filter: 'text',
        headerWidth: '120px',
        Cell: ({ row: { original } }) => {
          const { waba_number } = original;

          if (!waba_number) {
            return '-';
          }

          return <span className="off-black" style={{fontSize: '14px'}}>{waba_number ?? '-'}</span>;
        },
      },
      // {
      //   id: 'w-q-status',
      //   Header: 'WABA Status',
      //   headerWidth: '100px',
      //   Cell: ({ row: { original } }) => {
      //     const { waba_status_rating } = original;

      //     let wabaStatus = waba_status_rating;

      //     if (!wabaStatus) {
      //       return '-';
      //     }

      //     return (
      //       <div style={{ textTransform: 'initial', fontSize: '14px' }}>
      //         {h.notEmpty(wabaStatus) && (
      //           <>{h.general.ucFirstAllWords(wabaStatus.toLowerCase())}</>
      //         )}

      //         {!h.notEmpty(wabaStatus) && <>-</>}
      //       </div>
      //     );
      //   },
      // },
      {
        id: 'w-q-rating',
        Header: 'Quality',
        headerWidth: '100px',
        Cell: ({ row: { original } }) => {
          const { waba_quality_rating } = original;

          let wabaQuality = waba_quality_rating;

          let ratingColor = '';
          let ratingValue = '';

          switch (wabaQuality) {
            case 'YELLOW':
              ratingColor = '#FDB919';
              ratingValue = 'Medium';
              break;
            case 'RED':
              ratingColor = '#cd0000';
              ratingValue = 'Low';
              break;
            case 'GREEN':
              ratingColor = '#009700';
              ratingValue = 'High';
              break;
            case 'UNKNOWN':
              ratingColor = '#dedede';
              ratingValue = 'Unknown';
              break;
            default:
              ratingColor = '#dedede';
              ratingValue = waba_quality_rating;
              break;
          }

          if (!wabaQuality) {
            return '-';
          }

          return (
            <div style={{ textTransform: 'initial', fontSize: '14px' }}>
              {h.notEmpty(wabaQuality) && (
                <>
                  <FontAwesomeIcon
                    color={ratingColor}
                    icon={faCircle}
                    style={{ fontSize: '10px', marginRight: '5px' }}
                  />
                  {ratingValue}
                </>
              )}

              {!h.notEmpty(wabaQuality) && <>-</>}
            </div>
          );
        },
      },
      {
        id: 'w-sent',
        Header: 'Sent',
        accessor: (row) => (h.isEmpty(row.total_sent) ? '' : row.total_sent),
        filter: 'text',
        headerWidth: '55px',
        Cell: ({ row: { original } }) => {
          const { total_sent, batch_count, template_count } = original;
          const percentage = getPercentage(
            total_sent,
            batch_count,
            template_count,
          );
          return (
            <div
              className="w-progressbar"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{
                '--value': percentage,
                '--fgcolor': getColor(percentage),
              }}
            ></div>
          );
        },
      },

      {
        id: 'w-delivered',
        Header: 'Delivered',
        headerWidth: '85px',
        accessor: (row) =>
          h.isEmpty(row.total_delivered) ? '' : row.total_delivered,
        filter: 'text',
        Cell: ({ row: { original } }) => {
          const { total_sent, total_delivered, template_count } = original;
          const percentage = getPercentage(
            total_delivered,
            total_sent,
            template_count,
          );
          return (
            <div
              className="w-progressbar"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{
                '--value': percentage,
                '--fgcolor': getColor(percentage),
              }}
            ></div>
          );
        },
      },
      // {
      //   id: 'w-pending',
      //   Header: 'Pending',
      //   accessor: (row) =>
      //     h.isEmpty(row.total_pending) ? '' : row.total_pending,
      //   filter: 'text',
      //   headerWidth: '80px',
      //   Cell: ({ row: { original } }) => {
      //     const { total_pending, batch_count, template_count } = original;
      //     const percentage = getPercentage(
      //       total_pending,
      //       batch_count,
      //       template_count,
      //     );
      //     return (
      //       <div
      //         className="w-progressbar"
      //         role="progressbar"
      //         aria-valuenow={percentage}
      //         aria-valuemin="0"
      //         aria-valuemax="100"
      //         style={{
      //           '--value': percentage,
      //           '--fgcolor': getColor(percentage),
      //         }}
      //       ></div>
      //     );
      //   },
      // },
      {
        id: 'w-failed',
        Header: 'Failed',
        headerWidth: '60px',
        accessor: (row) =>
          h.isEmpty(row.total_failed) ? '' : row.total_failed,
        filter: 'text',
        headerWidth: '80px',
        Cell: ({ row: { original } }) => {
          const { total_failed, batch_count, template_count } = original;
          const percentage = getPercentage(
            total_failed,
            batch_count,
            template_count,
          );

          return (
            <div
              className="w-progressbar"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{
                '--value': percentage,
                '--fgcolor': getColor(percentage),
              }}
            ></div>
          );
        },
      },
      {
        id: 'w-read',
        Header: 'Read',
        headerWidth: '55px',
        accessor: (row) => (h.isEmpty(row.total_read) ? '' : row.total_read),
        filter: 'text',
        Cell: ({ row: { original } }) => {
          const { total_read, total_delivered, template_count } = original;
          const percentage = getPercentage(
            total_read,
            total_delivered,
            template_count,
          );

          return (
            <div
              className="w-progressbar"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{
                '--value': percentage,
                '--fgcolor': getColor(percentage),
              }}
            ></div>
          );
        },
      },
      {
        id: 'w-replied',
        Header: 'Replied',
        headerWidth: '68px',
        accessor: (row) =>
          h.isEmpty(row.total_replied) ? '' : row.total_replied,
        filter: 'text',
        Cell: ({ row: { original } }) => {
          const { total_replied, total_read, template_count } = original;
          const percentage = getPercentage(
            total_replied,
            total_read,
            template_count,
          );

          return (
            <div
              className="w-progressbar"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{
                '--value': percentage,
                '--fgcolor': getColor(percentage),
              }}
            ></div>
          );
        },
      },
      {
        id: 'w-status',
        Header: 'Status',
        headerWidth: '55px',
        style: { overflow: 'inherit' },
        Cell: ({ row: { original } }) => {
          const { campaign_schedule } = original;

          const cSched = getCampaignValue(original);

          const campaignValue =
            campaign_schedule ??
            (original['campaign_schedule.agency_fk']
              ? cSched
              : original['campaign_draft_id']
                ? original
                : null);

          // DONE
          if (!campaignValue || (campaignValue && campaignValue.status === 4)) {
            return (
              <div className="center-body">
                <CommonTooltip tooltipText={'Done'}>
                  <FontAwesomeIcon
                    color="#0097c0"
                    icon={faCircleCheck}
                    style={{ fontSize: '15px' }}
                  />
                </CommonTooltip>
              </div>
            );
          }

          // PENDING
          if (campaignValue.status === 2) {
            return (
              <div className="center-body">
                <CommonTooltip tooltipText={'Paused'}>
                  <FontAwesomeIcon
                    color="#FDB919"
                    icon={faPauseCircle}
                    style={{ fontSize: '20px' }}
                  />
                </CommonTooltip>
              </div>
            );
          }

          // UPCOMING
          if (!campaignValue.triggered && campaignValue.status === 1) {
            return (
              <div className="center-body">
                <CommonTooltip tooltipText={'Upcoming'}>
                  <FontAwesomeIcon
                    color="#009700"
                    icon={faClock}
                    style={{ fontSize: '20px' }}
                  />
                </CommonTooltip>
              </div>
            );
          }

          // PROCESSING
          if (campaignValue.triggered && campaignValue.status === 1) {
            return (
              <div className="center-body">
                <CommonTooltip tooltipText={'Processing'}>
                  <FontAwesomeIcon
                    color="#0097c0"
                    icon={faRedoAlt}
                    spin={true}
                    style={{ fontSize: '20px' }}
                  />
                </CommonTooltip>
              </div>
            );
          }

          // CANCELLED
          if (campaignValue.status === 3) {
            return (
              <div className="center-body">
                <CommonTooltip tooltipText={'Cancelled'}>
                  <FontAwesomeIcon
                    color="#FE5959"
                    icon={faBan}
                    style={{ fontSize: '20px' }}
                  />
                </CommonTooltip>
              </div>
            );
          }

          // DRAFT
          if (campaignValue.status === 'draft') {
            return (
              <div className="center-body">
                <CommonTooltip tooltipText={'Draft'}>
                  <FontAwesomeIcon
                    color="#87898a"
                    icon={faFileAlt}
                    style={{ fontSize: '20px' }}
                  />
                </CommonTooltip>
              </div>
            );
          }

          // DRAFT
          if (campaignValue.status === 'review') {
            return (
              <div className="center-body">
                <CommonTooltip tooltipText={'For Review'}>
                  <FontAwesomeIcon
                    color="#ffc107"
                    icon={faUserEdit}
                    style={{ fontSize: '20px' }}
                  />
                </CommonTooltip>
              </div>
            );
          }

          return '';
        },
      },
      {
        id: 'w-actions',
        Header: 'Action',
        accessor: 'action',
        disableSortBy: true,
        headerWidth: '60px',
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

    setColumns(initialColumns);
  }, [paveAccount, agencyUserId]);

  const handleHideCampaign = async (campaign) => {
    setLoading(true);
    const hideRes = await api.whatsapp.hideCampaign(
      { tracker_ref_name: campaign.tracker_ref_name },
      true,
    );
    if (h.cmpStr(hideRes.status, 'ok')) {
      h.general.alert('success', {
        message: 'Campaign Archived Successfully!',
        autoCloseInSecs: 1,
      });
    } else {
      h.general.alert('error', {
        message: 'Failed to archive selected campaign',
        autoCloseInSecs: 1,
      });
    }
    await getWhatsAppRecords({
      includeHiddenCampaigns: includeHiddenCampaigns,
    });
    setLoading(false);
  };

  const handleShowHideCampaign = async () => {
    setIncludeHiddenCampaigns(!includeHiddenCampaigns);
  };

  const tableColumns = useMemo(() => columns, [columns]);
  const tableScheduleColumns = useMemo(
    () => scheduleColumns,
    [scheduleColumns],
  );

  // Common sorting function
  function handleSorting(arr, key, order = 'desc') {
    return arr.sort((a, b) => {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  const getWhatsAppRecords = async (values = {}) => {
    setLoading(true);
    setLoadedWabaChecker(false);

    const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);

    if (h.cmpStr(apiRes.status, 'ok')) {
      const draftRes = await api.campaignSchedule.getAllCampaignDrafts(
        {
          agency_id: apiRes.data.agencyUser.agency_fk,
          platform: 'whatsapp',
        },
        false,
      );

      const campaignRes = await api.campaignSchedule.getAll(
        {
          agency_id: apiRes.data.agencyUser.agency_fk,
          platform: 'whatsapp',
        },
        false,
      );

      const whatsAppRes = await api.whatsapp.getRecords(
        {
          agency_id: apiRes.data.agencyUser.agency_fk,
          ...values,
        },
        false,
      );
      if (h.cmpStr(whatsAppRes.status, 'ok')) {
        const campaignList = [
          ...draftRes.data.results.map((m) => ({
            ...m,
            campaign_draft: m,
            sort_date: null, // Use updated_date for draft campaign
          })),
          ...campaignRes.data.results.map((m) => ({
            ...m,
            campaign_schedule: m,
            sort_date: m.send_date, // Use updated_date for schedule campaign
          })),
          ...whatsAppRes.data.results.map((m) => ({
            ...m,
            sort_date: m.broadcast_date // Use broadcast_date for immediate initiated campaign
          }))
        ]
        const sortedCampaignList = handleSorting(campaignList, "sort_date", "desc")
        setMessages(sortedCampaignList)
        setOverview(whatsAppRes.data.preview);
        setLoading(false);
      }
    }
  };

  const handleDownloadCampaignReport = async (campaign) => {
    setLoading(true);
    const reportDownlaod = await api.whatsapp.downloadCampaignReports(
      campaign?.tracker_ref_name,
      false,
    );
    const campaign_name_label = campaign?.campaign_name_label
      ? campaign?.campaign_name_label
      : campaign?.campaign_name;
    if (h.cmpStr(reportDownlaod.status, 'ok')) {
      const fileName = `${campaign_name_label} Report.csv`;
      const fileData = reportDownlaod.data;
      const blob = new Blob([fileData], { type: 'text/csv' });
      saveAs(blob, fileName);

      const manulaReportDownlaod =
        await api.whatsapp.downloadCampaignManualReports(
          campaign?.tracker_ref_name,
          false,
        );
      if (h.cmpStr(manulaReportDownlaod.status, 'ok')) {
        const manualFileName = `${campaign_name_label} Manual Replies Report.csv`;
        const manualFileData = manulaReportDownlaod.data;
        const manualBlob = new Blob([manualFileData], { type: 'text/csv' });
        saveAs(manualBlob, manualFileName);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await getWhatsAppRecords({
        includeHiddenCampaigns: includeHiddenCampaigns,
      });
    })();
  }, [includeHiddenCampaigns]);

  useEffect(() => {
    (async () => {
      if (startDate && endDate) {
        await getWhatsAppRecords({
          from: moment(startDate).format('yyyy-MM-DD'),
          to: moment(endDate).format('yyyy-MM-DD'),
          includeHiddenCampaigns: includeHiddenCampaigns,
        });
      }
    })();
  }, [startDate, endDate]);

  const getPercentage = (value, valueFrom, template_count = 1) => {
    let newValue = value;
    // if (template_count > 1) {
    //   newValue = value / template_count;
    // }
    let total = (newValue / valueFrom) * 100;

    return total.toFixed(0) >= 0 ? total.toFixed(0) : 0;
  };

  const getColor = (value) => {
    if (value <= 25) {
      return '#4877ff';
    } else if (value <= 50) {
      return '#4877ff';
    } else if (value <= 75) {
      return '#00ce8c';
    } else if (value <= 100) {
      return '#00ce8c';
    }
  };

  const saveEditName = async ({ name, trackerName }) => {
    setLoading(true);

    const apiRes = await api.whatsapp.updateById(
      trackerName,
      { campaign_label_name: name },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      await getWhatsAppRecords({
        includeHiddenCampaigns: includeHiddenCampaigns,
      });
    }

    setLoading(false);
  };

  function getListAction(campaign) {
    const { campaign_schedule, visible } = campaign;

    const cSched = getCampaignValue(campaign);

    const campaignValue =
      campaign_schedule ??
      (campaign['campaign_schedule.agency_fk']
        ? cSched
        : campaign['campaign_draft_id']
          ? campaign
          : null);

    const listActionsArr = [];

    // UPCOMING
    if (
      campaignValue &&
      !campaignValue.triggered &&
      campaignValue.status === 1
    ) {
      listActionsArr.push({
        label: 'Pause',
        icon: faPauseCircle,
        action: () => {
          campaignAction(campaignValue.campaign_schedule_id, 'pause');
        },
      });

      listActionsArr.push({
        label: 'Cancel',
        icon: faBan,
        action: () => {
          campaignAction(campaignValue.campaign_schedule_id, 'cancel');
        },
      });

      listActionsArr.push({
        label: 'View Scheduled Recipients',
        icon: faUsers,
        action: async () => {
          await getRecipients(campaignValue.campaign_schedule_id);
        },
      });
    }

    // PAUSED
    if (campaignValue && campaignValue.status === 2) {
      listActionsArr.push({
        label: 'Resume',
        icon: faPlayCircle,
        action: () => {
          campaignAction(campaignValue.campaign_schedule_id, 'resume');
        },
      });

      listActionsArr.push({
        label: 'View Scheduled Recipients',
        icon: faUsers,
        action: async () => {
          await getRecipients(campaignValue.campaign_schedule_id);
        },
      });

      if (campaignValue.triggered) {
        listActionsArr.push({
          label: 'View Insights',
          icon: faInfoCircle,
          action: () => {
            setTrackerData(campaign);
            setShowInsights(true);
          },
        });
      }
    }

    // PROCESSING
    if (
      campaignValue &&
      campaignValue.triggered &&
      campaignValue.status === 1
    ) {
      // listActionsArr.push({
      //   label: 'Pause',
      //   icon: faPauseCircle,
      //   action: () => {
      //     campaignAction(campaignValue.campaign_schedule_id, 'pause');
      //   },
      // });

      listActionsArr.push({
        label: 'View Scheduled Recipients',
        icon: faUsers,
        action: async () => {
          await getRecipients(campaignValue.campaign_schedule_id);
        },
      });

      listActionsArr.push({
        label: 'View Insights',
        icon: faInfoCircle,
        action: () => {
          setTrackerData(campaign);
          setShowInsights(true);
        },
      });
    }

    // CANCELED
    if (campaignValue && campaignValue.status === 3) {
      listActionsArr.push({
        label: 'View Recipients',
        icon: faUsers,
        action: async () => {
          await getRecipients(campaignValue.campaign_schedule_id);
        },
      });
      listActionsArr.push({
        label: 'Delete',
        icon: faTrash,
        className: 'info-red b-top',
        action: () => {
          campaignAction(campaignValue.campaign_schedule_id, 'delete');
        },
      });
    }

    // DONE
    if (!campaignValue || (campaignValue && campaignValue.status === 4)) {
      // if (campaignValue) {
      //   listActionsArr.push({
      //     label: 'View Scheduled Recipients',
      //     icon: faUsers,
      //     action: async () => {
      //       await getRecipients(campaignValue.campaign_schedule_id);
      //     },
      //   });
      // } else {
      listActionsArr.push({
        label: 'View Message Recipients',
        icon: faUsers,
        action: () => {
          setTrackerData(campaign);
          setShowTrackerRecipients(true);
        },
      });
      // }

      listActionsArr.push({
        label: 'View Insights',
        icon: faInfoCircle,
        action: () => {
          setTrackerData(campaign);
          setShowInsights(true);
        },
      });

      // listActionsArr.push({
      //   label: 'Download Report',
      //   icon: faFileDownload,
      //   action: () => {
      //     handleDownloadCampaignReport(campaign);
      //   },
      // });
    }

    if (
      (!campaignValue || campaignValue.status === 4) &&
      h.cmpBool(paveAccount, true) &&
      h.cmpBool(visible, true)
    ) {
      listActionsArr.push({
        label: 'Archive Campaign',
        icon: faMinusCircle,
        action: () => {
          handleHideCampaign(campaign);
        },
      });
    }

    // draft campaign
    if (campaignValue && campaignValue.status === 'draft') {
      const campaign_draft_id = campaignValue.campaign_draft_id;
      listActionsArr.push({
        label: 'Preview Draft',
        icon: faEye,
        action: () => {
          router.push(
            h.getRoute(routes.whatsapp.campaign.view, {
              campaign_draft_id,
            }),
            undefined,
            {
              shallow: true,
            },
          );
        },
      });
      listActionsArr.push({
        label: 'Edit Draft',
        icon: faEdit,
        action: () => {
          router.push(
            h.getRoute(routes.whatsapp.campaign.edit, {
              campaign_draft_id,
            }),
            undefined,
            {
              shallow: true,
            },
          );
        },
      });
    }

    // draft campaign for review
    if (campaignValue && campaignValue.status === 'review') {
      const campaign_draft_id = campaignValue.campaign_draft_id;
      listActionsArr.push({
        label: 'Preview Draft',
        icon: faEye,
        action: () => {
          router.push(
            h.getRoute(routes.whatsapp.campaign.view, {
              campaign_draft_id,
            }),
            undefined,
            {
              shallow: true,
            },
          );
        },
      });
      if (!h.isEmpty(approverIDs) && approverIDs.includes(agencyUserId)) {
        const campaign_draft_id = campaignValue.campaign_draft_id;
        listActionsArr.push({
          label: 'Review Draft',
          icon: faUserEdit,
          action: () => {
            router.push(
              h.getRoute(routes.whatsapp.campaign.review, {
                campaign_draft_id,
              }),
              undefined,
              {
                shallow: true,
              },
            );
          },
        });
      }
    }

    return listActionsArr;
  }

  async function campaignAction(campaign_schedule_id, action) {
    h.general.prompt(
      {
        message: `Are you sure to ${action} this campaign?`,
      },

      async (status) => {
        if (status) {
          setLoading(true);

          const scheduleApiRes = await api.campaignSchedule.action(
            campaign_schedule_id,
            action,
            {},
            false,
          );

          if (h.cmpStr(scheduleApiRes.status, 'ok')) {
            await getWhatsAppRecords({
              includeHiddenCampaigns: includeHiddenCampaigns,
            });
          }

          setLoading(false);
        }
      },
    );
  }

  async function getRecipients(campaign_schedule_id) {
    setLoading(true);

    const recipientsApiRes = await api.campaignSchedule.recipients(
      campaign_schedule_id,
      false,
    );

    if (h.cmpStr(recipientsApiRes.status, 'ok')) {
      setShowRecipients(true);
      setRecipients(recipientsApiRes.data.schedule_recipients);
    }

    setLoading(false);
  }

  async function getWhatsAppRating(waba_number) {
    const apiRes = await api.agency.whatsAppRatingFromDB(waba_number, false);

    return apiRes;
  }

  function getCampaignValue(original) {
    const cSched = {
      agency_fk: original['campaign_schedule.agency_fk'] ?? null,
      campaign_name: original['campaign_schedule.campaign_name'] ?? null,
      campaign_schedule_id:
        original['campaign_schedule.campaign_schedule_id'] ?? null,
      campaign_source: original['campaign_schedule.campaign_source'] ?? null,
      created_date: original['campaign_schedule.created_date'] ?? null,
      recipient_count: original['campaign_schedule.recipient_count'] ?? null,
      send_date: original['campaign_schedule.send_date'] ?? null,
      status: original['campaign_schedule.status'] ?? null,
      time_zone: original['campaign_schedule.time_zone'] ?? null,
      tracker_ref_name: original['campaign_schedule.tracker_ref_name'] ?? null,
      triggered: original['campaign_schedule.triggered'] ?? null,
    };

    return cSched;
  }

  return (
    <>
      {showEditCampaignModal && trackerName && (
        <EditCampaign
          setLoading={setLoading}
          onCloseModal={async () => {
            await getWhatsAppRecords({
              includeHiddenCampaigns: includeHiddenCampaigns,
            });
            setShowEditCampaignModal(false);
            setTrackerName(null);
          }}
          trackerName={trackerName}
        />
      )}
      {showInsights && trackerData && (
        <CampaignInsights
          tracker={trackerData}
          handleCloseModal={() => {
            setShowInsights(false);
          }}
        />
      )}
      {showTrackerRecipients && trackerData && (
        <CampaignTrackerRecipients
          tracker={trackerData}
          handleCloseModal={() => {
            setShowTrackerRecipients(false);
          }}
        />
      )}

      {showRecipients && (
        <CampaignRecipients
          contacts={recipients}
          handleCloseModal={() => {
            setShowRecipients(false);
          }}
        />
      )}

      {showWABAList && agencyId && (
        <WABAList
          agencyId={agencyId}
          handleCloseModal={() => setWABAList(false)}
        />
      )}
      <div data-testid="chaaat-campaign-page" className="contacts-root layout-v">
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
                  <h1> WhatsApp Campaign Tracker</h1>
                </div>
                <div className="d-flex justify-content-center button-icon-container">
                  <CommonIconButton
                    className="c-red mr-2"
                    style={{ width: 164, height: 36 }}
                    onClick={() => {
                      if (hasWABA) {
                        router.push(routes.whatsapp.campaign.create);
                      } else {
                        h.general.prompt(
                          {
                            message: `You don't have any WABA that can be used to create campaign. Would you like to onboard a number?`,
                          },
                    
                          async (confirm) => {
                            if (confirm) {
                              router.push(
                                h.getRoute(routes.settings.integrations + '?new_connection=whatsapp'),
                                undefined,
                                {
                                  shallow: true,
                                },
                              );
                            }
                          },
                        );
                      }
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      color="#fff"
                      fontSize="20px"
                      className="mr-2"
                    />
                    {'Create Campaign'}
                  </CommonIconButton>
                  <CommonIconButton
                    // className="c-red "
                    style={{ width: 164, height: 36 }}
                    className="c-transparent"
                    onClick={async () => {
                      setWABAList(true);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faList}
                      color="#000"
                      fontSize="20px"
                      className="mr-2"
                    />
                    {'WABA Numbers'}
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
                      <div className="whatsapp-overview-wrapper d-flex flex-wrap">
                        <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                          <div className="whatsapp-overview-wrapper-item-icon">
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              style={{ cursor: 'pointer' }}
                              color="#08453D"
                              size="lg"
                            />
                          </div>
                          <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                            <label>Total Sent</label>
                            <span style={{ color: '#182327' }}>
                              {overview.sent?.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>

                        <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                          <div className="whatsapp-overview-wrapper-item-icon">
                            <FontAwesomeIcon
                              icon={faCheckDouble}
                              style={{ cursor: 'pointer' }}
                              color="#00c203"
                              size="lg"
                            />
                          </div>
                          <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                            <label>Total Delivered</label>
                            <span style={{ color: '#182327' }}>
                              {(
                                overview.sent -
                                (overview.failed + overview.pending)
                              )?.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>

                        <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                          <div className="whatsapp-overview-wrapper-item-icon">
                            <FontAwesomeIcon
                              icon={faCommentSlash}
                              style={{ cursor: 'pointer' }}
                              color="#ff4141"
                              size="lg"
                            />
                          </div>
                          <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                            <label>Total Failed</label>
                            <span style={{ color: '#182327' }}>
                              {overview.failed?.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>

                        <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                          <div className="whatsapp-overview-wrapper-item-icon">
                            <FontAwesomeIcon
                              icon={faComments}
                              style={{ cursor: 'pointer' }}
                              color="#1c83ff"
                              size="lg"
                            />
                          </div>
                          <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                            <label>Total Replied</label>
                            <span style={{ color: '#182327' }}>
                              {overview.replied?.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>
                        {/* <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                          <div className="whatsapp-overview-wrapper-item-icon">
                            <FontAwesomeIcon
                              icon={faClock}
                              style={{ cursor: 'pointer' }}
                              color="#ff9c1e"
                              size="lg"
                            />
                          </div>
                          <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                            <label>Total Pending</label>
                            <span style={{ color: '#182327' }}>
                              {overview.pending?.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div> */}
                        <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
                          <div className="whatsapp-overview-wrapper-item-icon">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              style={{ cursor: 'pointer' }}
                              color="#00ceb0"
                              size="lg"
                            />
                          </div>
                          <div className="whatsapp-overview-wrapper-item-details d-flex flex-column">
                            <label>Total Read</label>
                            <span style={{ color: '#182327' }}>
                              {overview.read?.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {h.notEmpty(messages) && h.notEmpty(agencyUserId) ? (
                      <div className="tab-body no-oxs new-table">
                        <CommonResponsiveTable
                          columns={tableColumns}
                          data={messages}
                          options={{
                            scrollable: true,
                          }}
                          thHeight="50px"
                          modern={true}
                          overflow="auto"
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
                        No available campaign records yet.
                      </div>
                    )}
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
