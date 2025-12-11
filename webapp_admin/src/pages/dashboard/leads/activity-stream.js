import React, { useEffect, useState, useMemo } from 'react';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { shortlistedPropertyApi } from '../../../components/Sale/Link/preview/api/shortlistedProperty';
import { routes } from '../../../configs/routes';
import { useRouter } from 'next/router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActivityStreamItem from '../../../components/Dashboard/ActivityStreamItem';
import IconSearch from '../../../components/Icons/IconSearch';
import {
  faAngleLeft,
  faAngleRight,
  faRedo,
  faReply,
} from '@fortawesome/free-solid-svg-icons';
import constant from '../../../constants/constant.json';
import IconClock from '../../../components/Icons/IconClock';
import CommonTable from '../../../components/Common/CommonTable';
import CommonTooltip from '../../../components/Common/CommonTooltip';
import CommonResponsiveTable from '../../../components/Common/CommonResponsiveTable';
import ActivityStreamFilter from '../../../components/Dashboard/ActivityStreamFilter';
import { isEmpty, notEmpty } from '../../../helpers/general';
import ReplyToCommentModal from '../../../components/Comment/ReplyToCommentModal';

const ACTIVITY_STREAM_TEXT = {
  BUYER_LINK_OPENED: 'opened link',
  CAROUSEL_IMAGE_CLICKED: 'clicked on photo',
  CAROUSEL_VIDEO_CLICKED: 'clicked on video',
  CAROUSEL_THUMBNAIL_CLICKED: 'clicked on thumbnail',
  CAROUSEL_LEFT_BUTTON_CLICKED: 'scrolled through image gallery',
  CAROUSEL_RIGHT_BUTTON_CLICKED: 'scrolled through image gallery',
  PROJECT_CAROUSEL_IMAGE_CLICKED: 'clicked on project photo',
  PROJECT_CAROUSEL_THUMBNAIL_CLICKED: 'clicked on project thumbnail',
  PROJECT_CAROUSEL_LEFT_BUTTON_CLICKED:
    'scrolled through project image gallery',
  PROEJCT_CAROUSEL_RIGHT_BUTTON_CLICKED:
    'scrolled through project image gallery',
  COMMENT_POSTED: 'commented on property',
  COMMENT_POSTED_PROJECT: 'commented on project',
  PROPERTY_RATED: 'property rated',
  COMMENT_ATTACHMENT_IMAGE_PREVIEWED: 'Image previewed',
  COMMENT_ATTACHMENT_PDF_PREVIEWED: 'PDF previewed',
  COMMENT_ATTACHMENT_EXCEL_DOWNLOADED: 'Excel downloaded',
  COMMENT_ATTACHMENT_WORD_DOWNLOADED: 'Word downloaded',
  COMMENT_ATTACHMENT_POWERPOINT_DOWNLOADED: 'Powerpoint downloaded',
  PROPERTY_BOOKMARKED: 'property bookmarked',
  PROPERTY_UNBOOKMARKED: 'property unbookmarked',
  PROJECT_BOOKMARKED: 'project bookmarked',
  PROJECT_UNBOOKMARKED: 'project unbookmarked',
  MORE_PROPERTY_REQUESTED: 'contact is requesting for more properties',
  PROJECT_ADDITIONAL_FIELD_CLICKED: 'clicked on ',
  AGENT_EMAIL_CLICKED: 'clicked on agent email',
  AGENT_PHONE_CLICKED: 'clicked on agent phone',
  AGENT_INSTAGRAM_CLICKED: 'clicked on agent instagram',
  AGENT_WEBSITE_CLICKED: 'clicked on agent website',
  AGENT_LINKEDIN_CLICKED: 'clicked on agent linkedin',
};

export default function ActivityStream() {
  let agentNames = [];
  let buyerNames = [];
  const router = useRouter();
  const manualPagination = true;
  const [isLoading, setLoading] = useState();
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [activityStreamArr, setActivityStreamArr] = useState([]);
  const [activityTimeQuery, setActivityTimeQuery] = useState('');
  const [buyerQuery, setBuyerQuery] = useState('');
  const [agentQuery, setAgentQuery] = useState('');
  const [activityQuery, setActivityQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState({});
  const debouncedQuery = h.general.useDebounce(searchQuery, 700);
  const [listingPageSize, setListingPageSize] = useState(
    constant.COMMON_TABLE.PAGE_SIZE.DEFAULT.value,
  );
  const [sortInfo, setSortInfo] = useState({
    columnId: '',
    columnHeader: '',
    order: '',
  });
  const [comment, setComment] = useState();
  const [showReplyToCommentModal, setShowReplyToCommentModal] = useState(false);
  const [commentType, setCommentType] = useState('property');

  useEffect(() => {
    const errorMessage = h.general.findGetParameter('error_message');
    if (h.notEmpty(errorMessage)) {
      h.general.alert('error', { message: errorMessage });
    }
    document.body.style.backgroundColor = '#DEE9DB';
  }, []);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await getActivityStreams({ page: currentPage + 1 });
      // To update filter fields
      let activityTypes = [];
      for (const activityType in constant.CONTACT.ACTIVITY.TYPE) {
        activityTypes.push({
          value: constant.CONTACT.ACTIVITY.TYPE[activityType],
          label: h.general.prettifyConstant(
            constant.CONTACT.ACTIVITY.TYPE[activityType],
          ),
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
        agent: agentNames,
        buyer: buyerNames,
        activity: activityTypes,
        activityTime: dateFilters,
      });
    })();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [
    debouncedQuery,
    activityTimeQuery,
    buyerQuery,
    agentQuery,
    activityQuery,
  ]);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await getActivityStreams({ page: currentPage + 1 });
    })();
  }, [
    currentPage,
    listingPageSize,
    sortInfo,
    debouncedQuery,
    activityTimeQuery,
    buyerQuery,
    agentQuery,
    activityQuery,
  ]);

  const getActivityStreams = async ({ page }) => {
    setLoading(true);
    const queries = {
      searchQuery: searchQuery,
      activityTimeQuery: activityTimeQuery,
      buyerQuery: buyerQuery,
      agentQuery: agentQuery,
      activityQuery: activityQuery,
    };

    const params = {
      ...queries,
    };

    if (manualPagination) {
      params.pageSize = listingPageSize;
      params.sortColumn = sortInfo.columnId;
      params.sortOrder = sortInfo.order;

      if (totalCount) {
        params.totalCount = currentPage !== 0 ? totalCount : null;
      }
    }

    const apiRes = await api.contactActivity.getActivityStreams(
      { page },
      params,
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      if (apiRes.data && apiRes.data.contact_activities) {
        setTotalPages(apiRes.data.metadata.total_pages);
        setTotalCount(apiRes.data.metadata.totalCount);
        const activityStreamHolder = await getActivityStreamArray(
          apiRes.data.contact_activities,
        );
        setActivityStreamArr(activityStreamHolder);
      }
      setLoading(false);
    }
  };

  const formatTextWithMedia = (activityType, metaData, projectDetails) => {
    let formattedText;

    let onScreenDuration = metaData.on_screen_duration;
    let url = metaData.image_url || metaData.url;
    if (url) {
      const isVideoUrl =
        url.includes('youtube') ||
        url.includes('wistia') ||
        url.includes('vimeo') ||
        url.includes('/project/media/video/');
      let videoThumbnailUrl;
      if (isVideoUrl) {
        videoThumbnailUrl = h.youtube.getVideoThumbnail(url);
      }

      formattedText = (
        <span>
          {activityType}
          <br />
          {onScreenDuration ? (
            <>
              on screen: {h.general.prettifySeconds(onScreenDuration)}
              <br />
            </>
          ) : null}
          {isVideoUrl && !videoThumbnailUrl ? (
            <>
              <video className="w-50" controls>
                <source src={url} type="video/mp4" />
              </video>
              <br />
            </>
          ) : (
            <>
              <a target="_blank" href={url}>
                <img
                  style={{ width: 100 }}
                  src={videoThumbnailUrl ? videoThumbnailUrl : url}
                />
              </a>
              <br />
            </>
          )}
          {projectDetails}
        </span>
      );
    } else {
      formattedText = activityType + ' ' + projectDetails;
    }

    return formattedText;
  };

  const formatStreamText = (type, meta, projectDetails) => {
    let formattedText = '';
    let metaData = JSON.parse(meta);
    let imageUrl;
    const constantActivityType = constant.CONTACT.ACTIVITY.TYPE;
    switch (type) {
      case constantActivityType.BUYER_LINK_OPENED:
        let onScreenDuration = '';
        if (notEmpty(metaData.on_screen_duration)) {
          onScreenDuration = metaData.on_screen_duration.toString();
        }
        formattedText = isEmpty(onScreenDuration)
          ? ACTIVITY_STREAM_TEXT.BUYER_LINK_OPENED + ' ' + projectDetails
          : ACTIVITY_STREAM_TEXT.BUYER_LINK_OPENED +
            ' ' +
            projectDetails +
            'with ' +
            onScreenDuration +
            ' seconds on screen';
        break;
      case constantActivityType.CAROUSEL_IMAGE_CLICKED:
        formattedText = formatTextWithMedia(
          ACTIVITY_STREAM_TEXT.CAROUSEL_IMAGE_CLICKED,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.PROJECT_CAROUSEL_IMAGE_CLICKED:
        formattedText = formatTextWithMedia(
          ACTIVITY_STREAM_TEXT.PROJECT_CAROUSEL_IMAGE_CLICKED,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.COMMENT_ATTACHMENT_IMAGE_PREVIEWED:
      case constantActivityType.COMMENT_ATTACHMENT_PDF_PREVIEWED:
      case constantActivityType.COMMENT_ATTACHMENT_EXCEL_DOWNLOADED:
      case constantActivityType.COMMENT_ATTACHMENT_WORD_DOWNLOADED:
      case constantActivityType.COMMENT_ATTACHMENT_POWERPOINT_DOWNLOADED:
        imageUrl = metaData.image_url || metaData.url;
        if (imageUrl) {
          formattedText = (
            <span>
              Comment{' '}
              {
                ACTIVITY_STREAM_TEXT[
                  Object.entries(constantActivityType)
                    .filter(
                      ([activityKey, activityType]) => type === activityType,
                    )
                    .reduce((obj, [activityKey, activityType]) => {
                      return { ...obj, [activityKey]: activityType };
                    })[0]
                ]
              }
              <br />
              {!h.attachment.isImage(imageUrl) && (
                <>
                  <a href={imageUrl} target="_blank">
                    {metaData.file_name}
                  </a>
                  <br />
                </>
              )}
              {h.attachment.isImage(imageUrl) && (
                <>
                  <a target="_blank" href={imageUrl}>
                    <img style={{ width: 100 }} src={imageUrl} />
                  </a>
                  <br />
                </>
              )}
              {projectDetails}
            </span>
          );
        }
        break;
      case constantActivityType.CAROUSEL_THUMBNAIL_CLICKED:
        formattedText = formatTextWithMedia(
          ACTIVITY_STREAM_TEXT.CAROUSEL_THUMBNAIL_CLICKED,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.PROJECT_CAROUSEL_THUMBNAIL_CLICKED:
        formattedText = formatTextWithMedia(
          ACTIVITY_STREAM_TEXT.PROJECT_CAROUSEL_THUMBNAIL_CLICKED,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.CAROUSEL_LEFT_BUTTON_CLICKED:
      case constantActivityType.CAROUSEL_RIGHT_BUTTON_CLICKED:
        formattedText = formatTextWithMedia(
          ACTIVITY_STREAM_TEXT.CAROUSEL_LEFT_BUTTON_CLICKED,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.PROJECT_CAROUSEL_LEFT_BUTTON_CLICKED:
      case constantActivityType.PROJECT_CAROUSEL_RIGHT_BUTTON_CLICKED:
        formattedText = formatTextWithMedia(
          ACTIVITY_STREAM_TEXT.PROJECT_CAROUSEL_LEFT_BUTTON_CLICKED,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.COMMENT_POSTED:
        formattedText = (
          <span>
            {metaData.shortlisted_property_id
              ? ACTIVITY_STREAM_TEXT.COMMENT_POSTED
              : ACTIVITY_STREAM_TEXT.COMMENT_POSTED_PROJECT}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.PROPERTY_RATED:
        let propertyRating = metaData.property_rating;
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT.PROPERTY_RATED +
              ' ' +
              propertyRating +
              ' stars'}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.PROPERTY_BOOKMARKED:
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT.PROPERTY_BOOKMARKED}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.PROPERTY_UNBOOKMARKED:
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT.PROPERTY_UNBOOKMARKED}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.PROJECT_BOOKMARKED:
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT.PROJECT_BOOKMARKED}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.PROJECT_UNBOOKMARKED:
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT.PROJECT_UNBOOKMARKED}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.TAG_CLICKED_ALL:
      case constantActivityType.TAG_CLICKED_IMAGE:
      case constantActivityType.TAG_CLICKED_VIDEO:
      case constantActivityType.TAG_CLICKED_FLOOR_PLAN:
      case constantActivityType.TAG_CLICKED_BROCHURE:
      case constantActivityType.TAG_CLICKED_PROJECT:
        const tag = type.replace('tag_clicked_', '').replaceAll('_', ' ');
        formattedText = formatTextWithMedia(
          `clicked on tag ${tag} in the image gallery`,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_ALL:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_IMAGE:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_VIDEO:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_FLOOR_PLAN:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_BROCHURE:
      case constantActivityType.PROJECT_LEVEL_TAG_CLICKED_PROJECT:
        const projectLevelTag = type
          .replace('project_level_tag_clicked_', '')
          .replaceAll('_', ' ');
        formattedText = formatTextWithMedia(
          `clicked on project tag ${projectLevelTag} in the image gallery`,
          metaData,
          projectDetails,
        );
        break;
      case constantActivityType.MORE_PROPERTY_REQUESTED:
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT.MORE_PROPERTY_REQUESTED}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.PROJECT_ADDITIONAL_FIELD_CLICKED:
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT.PROJECT_ADDITIONAL_FIELD_CLICKED +
              h.general.prettifyConstant(metaData.fieldName)}
            <br />
            {projectDetails}
          </span>
        );
        break;
      case constantActivityType.AGENT_EMAIL_CLICKED:
      case constantActivityType.AGENT_PHONE_CLICKED:
      case constantActivityType.AGENT_WEBSITE_CLICKED:
      case constantActivityType.AGENT_INSTAGRAM_CLICKED:
      case constantActivityType.AGENT_LINKEDIN_CLICKED:
        formattedText = (
          <span>
            {ACTIVITY_STREAM_TEXT[type.toUpperCase()]}
            <br />
            {projectDetails}
          </span>
        );
        break;
      default:
    }
    return formattedText;
  };

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleActivityStream = (activity) => {
    let activityStream = {};

    activityStream.user = h.user.combineFirstNLastName(
      activity.contact.first_name,
      activity.contact.last_name,
    );

    activityStream.contact_fk = activity.contact_fk;
    activityStream.agency_user_id = activity.contact.agency_user.agency_user_id;
    activityStream.agentName = activity.contact.agency_user.user.full_name;

    let projectDetails = '';
    let projectName;
    if (activity.project) {
      if (!activity.project_level) {
        projectName =
          activity.project &&
          activity.project.project &&
          activity.project.project.name
            ? activity.project.project.name
            : '';
        projectDetails =
          activity.project &&
          `${projectName} | #${activity.project?.unit?.unit_number || '-'} | ${
            activity.project?.unit?.number_of_bedroom || '-'
          } bed | ${activity.project?.unit?.number_of_bathroom || '-'} bath${
            activity.project?.unit?.starting_price
              ? ' | ' +
                h.currency.format(activity.project?.unit?.starting_price, 0) +
                ' ' +
                activity.project.project.currency_code
              : ''
          }`;
      } else {
        projectName = activity.project.name;
        projectDetails = `${projectName}`;
      }
    }

    activityStream.activityType = activity.activity_type;

    activityStream.metadata = activity.activity_meta;

    activityStream.text = formatStreamText(
      activity.activity_type,
      activity.activity_meta,
      projectDetails,
    );

    activityStream.date = h.date.formateDate(
      h.date.convertUTCDateToLocalDate(activity.created_date_raw, timezone),
    );
    activityStream.hour = h.date.formatTime(
      h.date.convertUTCDateToLocalDate(activity.created_date_raw, timezone),
    );
    activityStream.activityTime = h.date.formatDateTime(
      h.date.convertUTCDateToLocalDate(activity.created_date_raw, timezone),
    );

    if (activity?.shortlistedPropertyComment) {
      activityStream.comment = activity?.shortlistedPropertyComment;
      activityStream.commentType = 'property';
    }

    if (activity?.shortlistedProjectComment) {
      activityStream.comment = activity?.shortlistedProjectComment;
      activityStream.commentType = 'project';
    }

    activityStream.date_obj = h.date.convertUTCDateToLocalDate(
      activity.created_date_raw,
      timezone,
    );

    return activityStream;
  };

  const getActivityStreamArray = async (activityStream) => {
    let activityStreamArr = [];
    let agentNameArr = [];
    let agentNameTracker = [];
    let buyerNameArr = [];
    let buyerNameTracker = [];
    let activityStreamDict = {};

    if (activityStream) {
      for (let i = 0; i < activityStream.length; i++) {
        const parsedActivity = handleActivityStream(activityStream[i]);

        //To filter duplicate activities
        if (
          h.contactActivity.isWithinTimeInterval(
            activityStreamDict,
            parsedActivity,
          )
        ) {
          continue;
        } else {
          activityStreamDict[parsedActivity.activityTime] = [];
          activityStreamDict[parsedActivity.activityTime].push({
            user: parsedActivity.user,
            activity: parsedActivity.activityType,
            metadata: parsedActivity.metadata,
          });
        }

        if (parsedActivity.activityTime)
          if (!agentNameTracker.includes(parsedActivity.agentName)) {
            agentNameArr.push({
              value: parsedActivity.agency_user_id,
              label: parsedActivity.agentName,
            });
            agentNameTracker.push(parsedActivity.agentName);
          }
        if (!buyerNameTracker.includes(parsedActivity.user)) {
          buyerNameArr.push({
            value: parsedActivity.contact_fk,
            label: parsedActivity.user,
          });
          buyerNameTracker.push(parsedActivity.user);
        }
        activityStreamArr.push(parsedActivity);
      }
      agentNames = agentNameArr;
      buyerNames = buyerNameArr;
    }
    return activityStreamArr;
  };

  // const isWithinTimeInterval = (activityStreamDict, parsedActivity) => {
  //   // Define the target time interval to match
  //   const deltaRange = h.general.range(
  //     constant.CONTACT.ACTIVITY.GROUP_INTERVAL.START,
  //     constant.CONTACT.ACTIVITY.GROUP_INTERVAL.END,
  //   );
  //   for (let i = 0; i < deltaRange.length; i++) {
  //     let dupeDate = new Date(parsedActivity.date_obj);
  //     dupeDate.setMinutes(dupeDate.getMinutes() + parseInt(deltaRange[i]));

  //     const moddedDate = h.date.formatDateTime(dupeDate);

  //     if (activityStreamDict[moddedDate]) {
  //       for (let j = 0; j < activityStreamDict[moddedDate].length; j++) {
  //         const activityInDict = activityStreamDict[moddedDate][j];
  //         if (
  //           activityInDict.user === parsedActivity.user &&
  //           activityInDict.activity === parsedActivity.activityType &&
  //           activityInDict.metadata === parsedActivity.metadata
  //         ) {
  //           return true;
  //         }
  //       }
  //     }
  //   }

  //   return false;
  // };

  const initialColumns = [
    {
      id: 'activity_date',
      Header: 'Activity Time',
      accessor: 'activityTime',
      filter: 'text',
      sortType: 'date',
      sortDescFirst: true,
      Cell: ({ row: { original } }) => {
        const { activityTime } = original;
        if (h.isEmpty(activityTime)) {
          return <span>0</span>;
        }
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const activityDateTime = h.date.convertUTCDateToLocalDate(
          activityTime,
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
        return <span>{activityDateTime}</span>;
      },
    },
    {
      id: 'contact.agency_user.user.first_name',
      Header: 'Agent',
      accessor: 'agentName',
      filter: 'text',
      sortType: 'text',
      sortDescFirst: true,
      Cell: ({ row: { original } }) => {
        const { agentName } = original;
        if (h.isEmpty(agentName)) {
          return <span>no agent name</span>;
        }
        return <span>{agentName}</span>;
      },
    },
    {
      id: 'contact.first_name',
      Header: 'Contact',
      accessor: 'user',
      filter: 'text',
      sortType: 'text',
      sortDescFirst: true,
      Cell: ({ row: { original } }) => {
        const { user } = original;
        if (h.isEmpty(user)) {
          return <span>no name</span>;
        }
        return <span>{user}</span>;
      },
    },
    {
      id: 'activity_type',
      Header: 'Activity Description',
      accessor: 'activityDesc',
      filter: 'text',
      sortType: 'text',
      sortDescFirst: true,
      Cell: ({ row: { original } }) => {
        const { text } = original;
        if (h.isEmpty(text)) {
          return <span>no activity desc</span>;
        }
        return (
          <span>
            {text}
            {h.general.cmpStr(original.activityType, 'comment_posted') && (
              <div className="comment-preview">
                {original.comment?.message.length > 27
                  ? original.comment?.message.substr(0, 27) + '...'
                  : original.comment?.message}

                <CommonTooltip tooltipText="View Comments">
                  <FontAwesomeIcon
                    icon={faReply}
                    color="#025146"
                    size="1x"
                    style={{
                      display: 'block',
                      cursor: 'pointer',
                      marginTop: '3px',
                      marginRight: '-20px',
                      float: 'right',
                    }}
                    onClick={() => handleCommentAction(original)}
                  />
                </CommonTooltip>
              </div>
            )}
          </span>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(initialColumns);

  const tableColumns = useMemo(() => columns, [columns]);
  const handleCommentAction = async (rowValue) => {
    setCommentType(rowValue.commentType);

    const metadata = JSON.parse(rowValue?.metadata);
    const commentApi =
      rowValue.commentType === 'property'
        ? await api.shortlistedPropertyComment.getCommentByCommentId(
            { comment_id: metadata.shortlisted_property_comment_id },
            false,
          )
        : await api.shortlistedProjectComment.getCommentByCommentId(
            { comment_id: metadata.shortlisted_project_comment_id },
            false,
          );
    if (h.cmpStr(commentApi.status, 'ok')) {
      setComment(
        rowValue.commentType === 'property'
          ? commentApi.data.shortlisted_property_comment
          : commentApi.data.shortlisted_project_comment,
      );
      setShowReplyToCommentModal(true);
    }
  };
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

  return (
    <div className="contacts-root">
      {comment && showReplyToCommentModal && (
        <ReplyToCommentModal
          contact={comment.contact}
          selectedComment={comment}
          setLoading={setLoading}
          reloadComment={async () =>
            await getActivityStreams({ page: currentPage + 1 })
          }
          onCloseModal={async () => {
            setShowReplyToCommentModal(false);
          }}
          externalRedirect="activity"
          commentType={commentType}
        />
      )}

      <Header
        className={
          'container dashboard-contacts-container common-navbar-header mb-3'
        }
      />
      <Body isLoading={isLoading}>
        <div className="container dashboard-contacts-container contacts-container">
          <div className="mb-2 contacts-title d-flex justify-content-between">
            <div>
              <h1>Activity Stream</h1>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="contacts-list-container">
            <div className="container dashboard-contacts-container">
              <div className="pl-3 pr-3">
                <div className="row">
                  <div className="tab-body">
                    <div
                      className="d-flex flex-row align-items-center contact-filter-wrapper"
                      style={{ gap: '1em' }}
                    >
                      <div className="search-input mt-4 mb-4">
                        <input
                          placeholder="search buyer, agent etc."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <IconSearch />
                      </div>
                      <ActivityStreamFilter
                        label="Activity Time"
                        options={options.activityTime}
                        setQuery={setActivityTimeQuery}
                      />
                      <ActivityStreamFilter
                        label="Agent"
                        options={options.agent}
                        setQuery={setAgentQuery}
                      />
                      <ActivityStreamFilter
                        label="Activity Type"
                        options={options.activity}
                        setQuery={setActivityQuery}
                      />
                      <div
                        className="d-flex mr-1 justify-content-end"
                        style={{ flexGrow: 1 }}
                      >
                        <button
                          className="btn refresh-btn"
                          onClick={async () =>
                            await getActivityStreams({ page: currentPage + 1 })
                          }
                          style={{ padding: 0 }}
                        >
                          <FontAwesomeIcon
                            icon={faRedo}
                            color="#4877ff"
                            size="2x"
                            style={{ marginRight: 0 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="activity-stream-list modern-style">
                    {h.notEmpty(activityStreamArr) && !isLoading ? (
                      <CommonResponsiveTable
                        columns={tableColumns}
                        data={activityStreamArr}
                        options={
                          manualPagination
                            ? {
                                manualPagination: true,
                                pageCount: totalPages,
                                pageIndex: currentPage,
                              }
                            : undefined
                        }
                        setListingPageIndex={
                          manualPagination ? setCurrentPage : undefined
                        }
                        setListingPageSize={
                          manualPagination ? setListingPageSize : undefined
                        }
                        sortDirectionHandler={
                          manualPagination ? changeSortDirection : undefined
                        }
                        thHeight="50px"
                      />
                    ) : (
                      <p>You have no activities here.</p>
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
  );
}
