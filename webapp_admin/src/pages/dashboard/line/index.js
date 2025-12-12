import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

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
import CampaignInsights from '../../../components/Messaging/CampaignLineInsights';
import EditField from './EditField';
import CommonIconButton from '../../../components/Common/CommonIconButton';
import Toggle from 'react-toggle';
import { saveAs } from 'file-saver';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import CommonDropdownActions from '../../../components/Common/CommonDrodownAction';
import CampaignRecipients from '../../../components/Inbox/CampaignRecipients';
import LineChannelList from '../../../components/Inbox/LineChannelList';
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
  const [showLineChannelList, setShowLineChannelList] = useState(false);
  const [approverIDs, setApproverIDs] = useState([]);

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
  const [loadedLineChecker, setLoadedLineChecker] = useState(false);
  const [agencyId, setAgencyId] = useState('');
  const [columns, setColumns] = useState([]);
  const [scheduleColumns, setScheduleColumns] = useState([]);
  const [agencyUserId, setAgencyUserId] = useState('');

  useEffect(() => {
    (async () => {
      const newMessages = [];
      const wabaNumber = [];
      if (messages && messages.length > 0 && !loadedLineChecker) {
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
        setLoadedLineChecker(true);
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
      }
    })();
  }, []);

  useEffect(() => {
    const initialColumns = [
      {
        id: 'tracker_ref_name',
        Header: 'Campaign name',
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
              <span style={{ textTransform: 'none' }}>
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
                trackerName={original.tracker_ref_name}
                saveAction={saveEditName}
                link={false}
              />
            );
          }
        },
      },
      {
        id: 'date_sent',
        Header: 'Date',
        accessor: (row) =>
          h.isEmpty(row.broadcast_date) ? '' : row.broadcast_date,
        filter: 'text',
        sortType: 'date',
        headerWidth: '110px',
        Cell: ({ row: { original } }) => {
          const { broadcast_date, send_date } = original;

          const bDate = broadcast_date || send_date;
          const localTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const dateTime = h.date.convertUTCDateToLocalDate(
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
          return <span className="off-black">{dateTime}</span>;
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
            <span className="off-black">{batch_count ?? recipient_count}</span>
          );
        },
      },
      {
        id: 'w-line-channel',
        Header: 'Line Channel',
        filter: 'text',
        headerWidth: '80px',
        Cell: ({ row: { original } }) => {
          const { line_channel_name } = original;

          if (!line_channel_name) {
            return (
              <FontAwesomeIcon color={'#c5c5c5'} icon={faRedoAlt} spin={true} />
            );
          }

          return <span className="off-black">{line_channel_name ?? '-'}</span>;
        },
      },
      {
        id: 'w-sent',
        Header: 'Sent',
        accessor: (row) => (h.isEmpty(row.total_sent) ? '' : row.total_sent),
        filter: 'text',
        headerWidth: '40px',
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
        accessor: (row) =>
          h.isEmpty(row.total_delivered) ? '' : row.total_delivered,
        filter: 'text',
        headerWidth: '40px',
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
      {
        id: 'w-pending',
        Header: 'Pending',
        accessor: (row) =>
          h.isEmpty(row.total_pending) ? '' : row.total_pending,
        filter: 'text',
        headerWidth: '40px',
        Cell: ({ row: { original } }) => {
          const { total_pending, batch_count, template_count } = original;
          const percentage = getPercentage(
            total_pending,
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
        id: 'w-failed',
        Header: 'Failed',
        accessor: (row) =>
          h.isEmpty(row.total_failed) ? '' : row.total_failed,
        filter: 'text',
        headerWidth: '40px',
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
        accessor: (row) => (h.isEmpty(row.total_read) ? '' : row.total_read),
        filter: 'text',
        headerWidth: '40px',
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
        accessor: (row) =>
          h.isEmpty(row.total_replied) ? '' : row.total_replied,
        filter: 'text',
        headerWidth: '40px',
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
        headerWidth: '30px',
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
                    style={{ fontSize: '20px' }}
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
        headerWidth: '30px',
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
  }, [paveAccount]);

  const handleHideCampaign = async (campaign) => {
    setLoading(true);
    const hideRes = await api.line.hideCampaign(
      { tracker_ref_name: campaign.tracker_ref_name },
      true,
    );
    if (h.cmpStr(hideRes.status, 'ok')) {
      h.general.alert('success', {
        message: 'Campaign Hidden Successfully!',
        autoCloseInSecs: 1,
      });
    } else {
      h.general.alert('error', {
        message: 'Failed to hide selected campaign!',
        autoCloseInSecs: 1,
      });
    }
    await getLineRecords({
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

  const getLineRecords = async (values = {}) => {
    setLoading(true);
    setLoadedLineChecker(false);

    const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);

    if (h.cmpStr(apiRes.status, 'ok')) {
      const draftRes = await api.campaignSchedule.getAllCampaignDrafts(
        {
          agency_id: apiRes.data.agencyUser.agency_fk,
          platform: 'line',
        },
        false,
      );

      const campaignRes = await api.campaignSchedule.getAll(
        {
          agency_id: apiRes.data.agencyUser.agency_fk,
          platform: 'line',
        },
        false,
      );

      const lineRes = await api.line.getRecords(
        {
          agency_id: apiRes.data.agencyUser.agency_fk,
          ...values,
        },
        false,
      );
      if (h.cmpStr(lineRes.status, 'ok')) {
        setMessages([
          ...draftRes.data.results.map((m) => ({
            ...m,
            campaign_draft: m,
          })),
          ...campaignRes.data.results.map((m) => ({
            ...m,
            campaign_schedule: m,
          })),
          ...lineRes.data.results,
        ]);
        setOverview(lineRes.data.preview);
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
      await getLineRecords({
        includeHiddenCampaigns: includeHiddenCampaigns,
      });
    })();
  }, [includeHiddenCampaigns]);

  useEffect(() => {
    (async () => {
      if (startDate && endDate) {
        await getLineRecords({
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
      return '#FE5959';
    } else if (value <= 50) {
      return '#FDB919';
    } else if (value <= 75) {
      return '#faef00';
    } else if (value <= 100) {
      return '#509e85';
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
      await getLineRecords({
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

      if (h.cmpBool(paveAccount, true)) {
        listActionsArr.push({
          label: 'Hide Campaign',
          icon: faMinusCircle,
          action: () => {
            handleHideCampaign(campaign);
          },
        });
      }

      // listActionsArr.push({
      //   label: 'Download Report',
      //   icon: faFileDownload,
      //   action: () => {
      //     handleDownloadCampaignReport(campaign);
      //   },
      // });
    }

    // if (
    //   (!campaignValue || (campaignValue && campaignValue.status === 4)) &&
    //   h.cmpBool(paveAccount, true) &&
    //   h.cmpBool(visible, true)
    // ) {
    //   listActionsArr.push({
    //     label: 'Hide Campaign',
    //     icon: faMinusCircle,
    //     action: () => {
    //       handleHideCampaign(campaign);
    //     },
    //   });
    // }

    // draft campaign
    if (campaignValue && campaignValue.status === 'draft') {
      const campaign_draft_id = campaignValue.campaign_draft_id;
      listActionsArr.push({
        label: 'Preview Draft',
        icon: faEye,
        action: () => {
          router.push(
            h.getRoute(routes.line.campaign.view, {
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
            h.getRoute(routes.line.campaign.edit, {
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
            h.getRoute(routes.line.campaign.view, {
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
              h.getRoute(routes.line.campaign.review, {
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
            await getLineRecords({
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
            await getLineRecords({
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
          platform="line"
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

      {showLineChannelList && agencyId && (
        <LineChannelList
          agencyId={agencyId}
          setLoading={setLoading}
          handleCloseModal={() => setShowLineChannelList(false)}
        />
      )}
      <div id="messaging-root" className="layout-v">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading} className="messaging-wrapper">
          <div className="messaging-container modern-style">
            <div
              className="message-body"
              style={{ width: '100%', padding: '10px', overflow: 'auto' }}
            >
              <div className="">
                <div className="pl-3 pr-3 pb-2">
                  <div className="d-flex justify-content-between">
                    <h1
                      style={{
                        fontFamily: 'PoppinsRegular',
                        textIndent: '-15px',
                        lineHeight: '55px',
                        fontSize: '20px',
                      }}
                    >
                      Line Campaign Tracker
                    </h1>
                    {/* <div className="row mb-3 mt-3">
                      <DateRangePicker
                        isOutsideRange={() => false}
                        startDate={startDate}
                        startDateId="tata-start-date"
                        endDate={endDate}
                        endDateId="tata-end-date"
                        onDatesChange={handleDatesChange}
                        focusedInput={focusedInput}
                        onFocusChange={(focusedInput) =>
                          setFocusedInput(focusedInput)
                        }
                      />
                    </div> */}

                    {/* <div
                      className="d-flex mr-1 justify-content-end"
                      style={{ flexGrow: 1 }}
                    >
                      <CommonTooltip tooltipText="Apply Filter">
                        <button
                          className="btn refresh-btn"
                          onClick={async () =>
                            await getLineRecords({
                              includeHiddenCampaigns: includeHiddenCampaigns,
                            })
                          }
                          style={{ padding: 0 }}
                        >
                          <FontAwesomeIcon
                            icon={faSlidersH}
                            color="#025146"
                            size="2x"
                            style={{ marginRight: 0 }}
                          />
                        </button>
                      </CommonTooltip>
                    </div> */}
                    <div
                      className="d-flex mt-2 justify-content-end"
                      style={{ flexGrow: 1, marginRight: '-16px !important' }}
                    >
                      <div
                        className="d-flex justify-content-end"
                        style={{
                          marginTop: '-13px',
                          marginRight: '10px',
                          flexGrow: 45,
                          display: h.cmpBool(paveAccount, true)
                            ? 'block'
                            : 'none',
                        }}
                      >
                        <CommonTooltip
                          tooltipText={
                            h.cmpBool(includeHiddenCampaigns, true)
                              ? 'Hide Test Messages'
                              : 'Show Test Messages'
                          }
                        >
                          <label className="price-all-toggle d-flex align-items-center">
                            <Toggle
                              defaultChecked={includeHiddenCampaigns}
                              icons={false}
                              className="price-toggle"
                              onChange={async () =>
                                await handleShowHideCampaign()
                              }
                            />
                          </label>
                        </CommonTooltip>
                      </div>
                      <button
                        type="type"
                        className="chip-button mr-2"
                        onClick={async () =>
                          await getLineRecords({
                            includeHiddenCampaigns: includeHiddenCampaigns,
                          })
                        }
                      >
                        <FontAwesomeIcon
                          icon={faRedo}
                          color="#025146"
                          spin={isLoading}
                          style={{ fontSize: '15px' }}
                        />
                        {isLoading ? 'Reloading...' : 'Reload'}
                      </button>
                      <button
                        type="type"
                        className="chip-button mr-2"
                        onClick={async () =>
                          router.push(routes.line.campaign.create)
                        }
                      >
                        <FontAwesomeIcon
                          icon={faPlus}
                          color="#025146"
                          style={{ fontSize: '15px' }}
                        />
                        Create Campaign
                      </button>
                      <button
                        type="type"
                        className="chip-button light-red mr-2"
                        onClick={async () => {
                          setShowLineChannelList(true);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faList}
                          color="#fff"
                          style={{ fontSize: '15px' }}
                        />
                        Line Channels
                      </button>
                    </div>
                  </div>
                  <div className="row">
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
                      <div className="whatsapp-overview-wrapper-item-2 d-flex flex-row">
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
                      </div>
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
                    <hr />
                    {h.notEmpty(messages) ? (
                      <div className="tab-body no-oxs new-table">
                        <CommonResponsiveTable
                          columns={tableColumns}
                          data={messages}
                          options={{
                            scrollable: true,
                          }}
                          thHeight="50px"
                          modern={true}
                        />
                      </div>
                    ) : (
                      <div className="d-flex w-100 align-items-center justify-content-center">
                        <img
                          style={{ width: '65%' }}
                          width="100%"
                          src="https://cdn.yourpave.com/assets/leads-empty.png"
                          alt={'profile picture'}
                        />
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
