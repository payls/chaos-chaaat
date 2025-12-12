import { API, graphqlOperation, Hub } from 'aws-amplify';
import { CONNECTION_STATE_CHANGE, ConnectionState } from '@aws-amplify/pubsub';

import { QueryClient, useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { api } from '../api';
import constant from '../constants/constant.json';
import { config } from '../configs/config';
import axios from 'axios';
import { onCreateNotificationMessage } from '../appsync/subscriptions';
// ICONS
import {
  faInbox,
  faSlidersH,
  faCommentSlash,
  faVolumeUp,
  faVolumeMute,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import MessageList from '../components/Inbox/MessageList';
import MessageFilter from '../components/Inbox/MessageFilter';
import MessageContactOverview from '../components/Inbox/MessageContactOverview';
import MessageThread from '../components/Inbox/MessageThread';
import SmallSpinner from '../components/Inbox/SmallSpinner';
import ThreadLoading from '../components/Inbox/ThreadLoading';
import CreateContactModal from '../components/Contact/CreateContactModal';
import CommonTooltip from '../components/Common/CommonTooltip';

const mime = require('mime-types');
const LIMIT = 20;
const queryClient = new QueryClient();

export default React.memo(() => {
  const [isLoading, setLoading] = useState(true);
  const [loadingNewConvo, setLoadingNewConvo] = useState(
    constant.API_STATUS.IDLE,
  );
  const [failedSend, setFailedSend] = useState(false);
  const [successSend, setSuccessSend] = useState(false);
  const [isSending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [filterShow, setFilterShow] = useState(false);
  const [thread, setThread] = useState([]);
  const [contact, setContact] = useState(null);
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(null);
  const [bottom, setBottom] = useState(false);
  const [messageListOffset, setMessageListOffset] = useState(0);
  const [loadingNewData, setLoadingNewData] = useState(false);
  const [stopFetching, setStopFetching] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const [agency, setAgency] = useState(null);
  const [agentUserId, setAgencyUserId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    constant.INBOX.TYPE.WHATSAPP,
    constant.INBOX.TYPE.LINE,
    // constant.INBOX.TYPE.SMS,
  ]);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedOwnerOptions, setSelectedOwnerOptions] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [showResponsesOnly, setSetShowResponsesOnly] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [medias, setMedias] = useState(null);
  const [contactOwners, setContactOwners] = useState([]);
  const [hasAdminAccess, setHasAdminAccess] = useState(true);
  const [defaultDelay, setDefaultDelay] = useState(10000);
  const [selectedAgenctOwner, setSelectedAgenctOwner] = useState(null);
  const [searchText, setSearchText] = useState(null);
  const [pendingMedias, setPendingMedias] = useState([]);
  const [disableSending, setDisableSending] = useState(false);
  const [filters, setFilters] = useState({});
  const [trackerName, setTrackerName] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [openEditContact, setOpenEditContact] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [threadLatestCampaign, setThreadLatestCampaign] = useState('');
  const [isLastMessageBusinessCampaign, setIsLastMessageBusinessCampaign] =
    useState(false);
  const [muted, setMuted] = useState(null);
  const [disableSendingStatus, setDisableSendingStatus] = useState(
    constant.API_STATUS.PENDING,
  );
  const [status, setStatus] = useState(constant.API_STATUS.PENDING);

  const msgBody = useRef(null);
  const convoRef = useRef(null);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const debouncedQuery = h.general.useDebounce(searchText, 700);

  const [appSyncApiKey, setAppSyncApiKey] = useState('');

  useEffect(() => {
    if (muted === null) {
      setMuted(
        localStorage.getItem('mute-chat')
          ? parseInt(localStorage.getItem('mute-chat'))
          : 0,
      );
    } else {
      localStorage.setItem('mute-chat', parseInt(muted));
    }
  }, [muted]);

  useEffect(() => {
    (async () => {
      const apiRes = await api.appsync.getActiveKey({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAppSyncApiKey(apiRes.data.api_key);
      }
    })();
  }, [agency]);

  useEffect(() => {
    if (agency && contact) {
      const threadSubscription = API.graphql(
        graphqlOperation(onCreateNotificationMessage, {
          agencyId: agency.agency_id,
        }),
      ).subscribe({
        next: ({ provider, value }) => {
          const data = JSON.parse(value.data.onCreateNotificationMessage.data);
          if (data.contact_fk === contact.contact_id) {
            setThread((t) => [...t, data]);
            setTimeout(() => msgBody.current?.scrollIntoView(), 30);
            if (
              parseInt(localStorage.getItem('mute-chat')) === 0 &&
              data?.receiver_url?.includes('name=')
            ) {
              new Audio(
                'https://cdn.yourpave.com/assets/message_received.wav',
              ).play();
            }
          }

          (async () => {
            setStatus(constant.API_STATUS.PENDING);
            const valueArray = selectedOptions.map((option) => option.value);

            const trackerRes = await api.unifiedInbox.getMessages(
              {
                quick_reply: valueArray.join('|'),
                agency_id: agency?.agency_id,
                only_with_response: showResponsesOnly ? true : null,
                agency_user_id: selectedOwnerOptions
                  .map((m) => m.value)
                  ?.join(','),
                offset: 0,
                limit: LIMIT,
                searchQuery: searchText,
                sortBy: selectedSort,
                msg_platform: selectedPlatforms.join(','),
              },
              false,
            );

            const newPullMessages = trackerRes.data.results.map(
              (m) => m.contact_fk,
            );

            const oldMessages = messages.filter(
              (f) => !newPullMessages.includes(f.contact_fk),
            );

            setMessages([...trackerRes.data.results, ...oldMessages]);
            setStatus(constant.API_STATUS.FULLFILLED);
          })();
        },
        error: (error) => console.warn(error),
      });

      return () => {
        threadSubscription.unsubscribe(); // Stop receiving data updates from the current thread
      };
    }
  }, [agency, contact]);

  useEffect(() => {
    (async () => {
      setHasAdminAccess(await h.userManagement.hasAdminAccess());
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgentId(apiRes.data?.agencyUser?.agency_user_id);
        setAgency(apiRes.data?.agencyUser.agency);
        setCurrentUser(apiRes.data?.agencyUser?.user);
        setAgencyUserId(apiRes.data?.agencyUser?.agency_user_id);

        const campaign_tracker_ref_name =
          h.general.findGetParameter('campaign');
        const quickRepRes = await api.whatsapp.getQuickReplies(
          {
            agency_id: apiRes.data?.agencyUser?.agency_fk,
            tracker_ref_name: campaign_tracker_ref_name,
          },
          false,
        );
        if (h.cmpStr(quickRepRes.status, 'ok')) {
          setQuickReplies(
            quickRepRes.data?.quick_replies?.map((m) => ({
              ...m,
              label: m.name,
            })),
          );
        }
        if (h.notEmpty(apiRes.data?.agencyUser)) {
          const apiUsersRes = await api.agencyUser.getAgencyUsers(
            { agency_fk: apiRes.data?.agencyUser?.agency_fk },
            false,
          );
          if (h.cmpStr(apiUsersRes.status, 'ok')) {
            let agencyUsers = [];
            for (const agencyUser of apiUsersRes.data.agency_users) {
              agencyUsers.push({
                value: agencyUser.agency_user_id,
                label: agencyUser.user.full_name,
              });
            }
            setContactOwners(agencyUsers);
          }
        }
      }
    })();

    return () => {
      clearInterval(timer);
      setTimer(null);
    };
  }, []);

  const getList = async (filter = {}, append = false) => {
    setFilters(filter);
    if (!append) {
      setLoading(true);
    }
    setStatus(constant.API_STATUS.PENDING);
    const trackerRes = await api.unifiedInbox.getMessages(filter, false);

    if (h.cmpStr(trackerRes.status, 'ok')) {
      if (!append) {
        setThread([]);
        setContact(null);
      }

      //  block fetching if messages are match with total

      setStopFetching(
        [...messages, ...trackerRes.data.results].length >=
          trackerRes.data.total,
      );

      // Set unique by receiver number
      if (append) {
        const msgArr = [...messages, ...trackerRes.data.results];
        setMessages(msgArr);
      } else {
        setMessages(trackerRes.data.results);
        if (trackerRes.data.results.length > 0) {
          await handleGetConvo(trackerRes.data.results[0]);
        }
      }

      if (!append) {
        setLoading(false);
      }
      setLoadingNewData(false);
      setStatus(constant.API_STATUS.FULLFILLED);
    }
  };

  useEffect(() => {
    if (agentId) {
      const valueArray = selectedOptions.map((option) => option.value);
      setMessages([]);
      getList({
        quick_reply: valueArray.join('|'),
        agency_id: agency?.agency_id,
        only_with_response: showResponsesOnly ? true : null,
        agency_user_id: selectedOwnerOptions.map((m) => m.value)?.join(','),
        offset: 0,
        limit: LIMIT,
        searchQuery: searchText,
        sortBy: selectedSort,
        msg_platform: selectedPlatforms.join(','),
      });
    }
  }, [
    JSON.stringify(selectedOptions),
    agentId,
    showResponsesOnly,
    selectedOwnerOptions,
    debouncedQuery,
  ]);

  useEffect(() => {
    if (messageListOffset > 0) {
      handleGetList();
    }
  }, [messageListOffset]);

  useEffect(() => {
    (async () => {
      if (thread) {
        const newMediaForm = [];
        const pendingMediaArr = pendingMedias;
        for (let i in medias) {
          if (
            medias[i].status === 'idle' &&
            !pendingMediaArr.includes(medias[i].id) &&
            medias[i].type
          ) {
            pendingMediaArr.push(medias[i].id);
            await getMedia({
              ...medias[i].msg,
              type: medias[i].type,
              sender_number: medias[i].msg.sender_number,
            }).then((r) => {
              newMediaForm.push({
                ...medias[i],
                value: r,
                status: 'fulfilled',
              });
            });
          } else {
            if (medias[i].msg.msg_type === 'img_frompave') {
              medias[i].msg.msg_body = medias[i].msg.msg_body;
            }
            newMediaForm.push({ ...medias[i] });
          }
        }

        setPendingMedias(pendingMediaArr);
        setMedias(newMediaForm);
      }
    })();
  }, [thread]);

  const handleGetList = () => {
    const valueArray = selectedOptions.map((option) => option.value);
    getList(
      {
        quick_reply: valueArray.join('|'),
        agency_id: agency?.agency_id,
        only_with_response: showResponsesOnly ? true : null,
        agency_user_id: selectedOwnerOptions.map((m) => m.value)?.join(','),
        msg_platform: selectedPlatforms.join(','),
        offset: messageListOffset,
        limit: LIMIT,
        searchQuery: searchText,
      },
      true,
    );
  };

  const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        setIntervalId(id);
        return () => clearInterval(id);
      }
    }, [delay]);
  };

  async function handleGetConvo(msg) {
    setLoading(true);
    setLoadingNewConvo(true);

    // Set contact info
    setUser(msg);
    setSelectedAgenctOwner(msg.contact?.agency_user ?? msg.agency_user);
    setContact(msg.contact);

    setDisableSendingStatus(constant.API_STATUS.PENDING);
    const threadRes = await queryClient.fetchQuery(
      ['getNewThread'],
      ({ signal }) => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        // Cancel the request if TanStack Query signals to abort
        signal?.addEventListener('abort', () => {
          source.cancel('Query was cancelled by TanStack Query');
        });

        return api.whatsapp.getThread(
          {
            sender_number: msg?.sender,
            receiver_number: msg?.receiver,
          },
          false,
          source.token,
        );
      },
    );

    if (h.cmpStr(threadRes.status, 'ok')) {
      setLoading(false);
      setThreadLatestCampaign(threadRes.data.campaign_name);
      setIsLastMessageBusinessCampaign(threadRes.data.is_business_campaign);
      const threadValue = threadRes.data.whatsapp_chats
        .filter((f) => f.msg_body)
        .sort(function (a, b) {
          return new Date(a.created_date_raw) - new Date(b.created_date_raw);
        });

      const mediaArr = medias;
      const lastContactResponse = threadValue
        .slice()
        .reverse()
        .find((entry) => entry.msg_type !== 'frompave');
      threadValue.forEach((msg, index) => {
        const mediaIndex = medias.findIndex(
          (f) => f.id === msg.whatsapp_chat_id,
        );
        if (mediaIndex < -1) {
          const mediaObj = {
            id: msg.whatsapp_chat_id,
            value: '',
            status: 'idle',
            msg,
          };

          switch (msg.msg_type) {
            case 'image':
              mediaObj.type = 'image/jpeg';
              break;
            case 'audio':
              mediaObj.type = 'audio/ogg';
              break;
            case 'video':
              mediaObj.type = 'video/mp4';
              break;
            case 'document':
              mediaObj.type = 'application/document';
              break;
          }

          mediaArr.push(mediaObj);
        }

        if (h.cmpInt(index + 1, threadValue.length)) {
          if (lastContactResponse) {
            const currentDate = new Date();
            const currentUtcDate = new Date(
              currentDate.getTime() + currentDate.getTimezoneOffset() * 60000,
            );
            // const currentUtcDateString = currentUtcDate.toISOString();

            const currentUtcDateString = h.date.convertUTCDateToLocalDate(
              currentUtcDate,
              timeZone,
            );

            const msgDate = h.date.convertUTCDateToLocalDate(
              lastContactResponse.created_date_raw,
              timeZone,
            );

            const date1 = new Date(currentUtcDateString);
            const date2 = new Date(msgDate);

            const timeDifference = date1 - date2;
            let hoursDifference = timeDifference / (1000 * 60 * 60);
            hoursDifference = Math.round(hoursDifference);

            if (hoursDifference >= 24) {
              setDisableSending(true);
            } else {
              setDisableSending(false);
            }
          } else {
            setDisableSending(true);
          }
        }
      });
      setScrolled(false);
      setMedias(mediaArr);
      setThread(threadValue);
      setTrackerName(threadRes?.data?.tracker_ref_name);
    } else {
      clearInterval();
      setLoading(false);
      setContact(null);
    }
    setLoadingNewConvo(false);
    setDisableSendingStatus(constant.API_STATUS.FULLFILLED);
  }

  async function sendMessage(msgReply, files, toReplyMsg) {
    setSending(true);
    setLoading(true);

    if (user && contact) {
      const msgParts = [];
      const agent_name = currentUser?.first_name;
      const contact_mobile_number = String(user?.contact?.mobile_number);
      const receiver_number = h.notEmpty(contact_mobile_number)
        ? contact_mobile_number.replace(/[^0-9]/g, '')
        : null;
      if (!h.isEmpty(msgReply) && h.isEmpty(files)) {
        const expression =
          /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
        const matches = msgReply.match(expression);
        const newMsgReply =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
          agent_name +
          '</strong></div>\n' +
          msgReply;
        if (matches && matches.length > 0) {
          msgParts.push({
            id: '1',
            contentType: 'text/html',
            data: newMsgReply,
            size: newMsgReply.length,
            type: 'link',
            sort: 0,
          });
        } else {
          msgParts.push({
            id: '1',
            contentType: 'text/html',
            data: newMsgReply,
            size: newMsgReply.length,
            type: 'body',
            sort: 0,
          });
        }

        const sendMsgRes = await api.whatsapp.sendMessage(
          {
            agency_id: user?.agency_fk,
            mobile_number: receiver_number,
            message_parts: msgParts,
            contact_id: contact?.contact_id,
            agent_id: agentId,
            tracker_ref_name: trackerName,
            to_reply_msg: toReplyMsg,
          },
          false,
        );
        if (h.cmpStr(sendMsgRes.status, 'ok')) {
          // await handleGetConvo(user);
          setSending(false);
          setSuccessSend(true);
          setTimeout(() => setSuccessSend(false), 1000);
        } else {
          setSending(false);
          setFailedSend(true);
          setTimeout(() => setFailedSend(false), 500);
        }
      }

      if (h.isEmpty(msgReply) && !h.isEmpty(files)) {
        const newMsgReply =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>' +
          agent_name +
          '</strong></div>';
        files.forEach(async (file, index) => {
          const fileMsgParts = [];
          const fileUrl = file.full_file_url;
          const contentType = h.general.getMimeType(fileUrl);
          const imgMimeTypes = ['image/jpg', 'image/png'];
          const vidMimeTypes = ['video/mp4', 'video/3gpp', 'video/3gp'];
          let sendMsgRes;
          if (imgMimeTypes.includes(contentType)) {
            fileMsgParts.push({
              id: '1',
              contentType: contentType,
              data: fileUrl,
              size: fileUrl.length,
              type: 'image_link',
              name: file.file_name,
              sort: 0,
            });
            fileMsgParts.push({
              id: '2',
              contentType: 'text/html',
              data: newMsgReply,
              size: newMsgReply.length,
              type: 'body',
              sort: 1,
            });
            sendMsgRes = await api.whatsapp.sendImgMessage(
              {
                agency_id: user?.agency_fk,
                mobile_number: receiver_number,
                message_parts: fileMsgParts,
                contact_id: contact?.contact_id,
                agent_id: agentId,
                tracker_ref_name: trackerName,
                to_reply_msg: toReplyMsg,
              },
              false,
            );
          } else if (vidMimeTypes.includes(contentType)) {
            fileMsgParts.push({
              id: '1',
              contentType: contentType,
              data: fileUrl,
              size: fileUrl.length,
              type: 'video_link',
              name: file.file_name,
              sort: 0,
            });
            fileMsgParts.push({
              id: '2',
              contentType: 'text/html',
              data: newMsgReply,
              size: newMsgReply.length,
              type: 'body',
              sort: 1,
            });
            sendMsgRes = await api.whatsapp.sendVideoMessage(
              {
                agency_id: user?.agency_fk,
                mobile_number: receiver_number,
                message_parts: fileMsgParts,
                contact_id: contact?.contact_id,
                agent_id: agentId,
                tracker_ref_name: trackerName,
                file_name: file.file_name,
                to_reply_msg: toReplyMsg,
              },
              false,
            );
          } else {
            fileMsgParts.push({
              id: '1',
              contentType: contentType,
              data: fileUrl,
              size: fileUrl.length,
              type: 'file',
              name: file.file_name,
              sort: 0,
            });
            fileMsgParts.push({
              id: '2',
              contentType: 'text/html',
              data: newMsgReply,
              size: newMsgReply.length,
              type: 'body',
              sort: 1,
            });
            sendMsgRes = await api.whatsapp.sendFileMessage(
              {
                agency_id: user?.agency_fk,
                mobile_number: receiver_number,
                message_parts: fileMsgParts,
                contact_id: contact?.contact_id,
                agent_id: agentId,
                tracker_ref_name: trackerName,
                file_name: file.file_name,
                content_type: contentType,
                to_reply_msg: toReplyMsg,
              },
              false,
            );
          }
          if (h.cmpStr(sendMsgRes.status, 'ok')) {
            // await handleGetConvo(user);
            setSending(false);
            setSuccessSend(true);
            setTimeout(() => setSuccessSend(false), 1000);
          } else {
            setSending(false);
            setFailedSend(true);
            setTimeout(() => setFailedSend(false), 500);
          }
        });
      }

      if (!h.isEmpty(msgReply) && !h.isEmpty(files)) {
        const newMsgReply =
          '<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 28px;"><strong>' +
          agent_name +
          '</strong></div>';
        msgReply = `<div className="msg-caption">${msgReply}</div>`;
        files.forEach(async (file, index) => {
          const fileMsgParts = [];
          const fileUrl = file.full_file_url;
          const contentType = h.general.getMimeType(fileUrl);
          const imgMimeTypes = ['image/jpg', 'image/png'];
          const vidMimeTypes = ['video/mp4', 'video/3gpp', 'video/3gp'];
          let sendMsgRes;
          if (imgMimeTypes.includes(contentType)) {
            fileMsgParts.push({
              id: '1',
              contentType: contentType,
              data: fileUrl,
              size: fileUrl.length,
              type: 'image_link',
              name: file.file_name,
              sort: 0,
            });
            fileMsgParts.push({
              id: '2',
              contentType: 'text/html',
              data: newMsgReply,
              size: newMsgReply.length,
              type: 'body',
              sort: 1,
            });
            fileMsgParts.push({
              id: '3',
              contentType: 'text/html',
              data: msgReply,
              size: msgReply.length,
              type: 'body',
              sort: 2,
            });
            sendMsgRes = await api.whatsapp.sendImgMessage(
              {
                agency_id: user?.agency_fk,
                mobile_number: receiver_number,
                message_parts: fileMsgParts,
                contact_id: contact?.contact_id,
                agent_id: agentId,
                tracker_ref_name: trackerName,
                to_reply_msg: toReplyMsg,
              },
              false,
            );
          } else if (vidMimeTypes.includes(contentType)) {
            fileMsgParts.push({
              id: '1',
              contentType: contentType,
              data: fileUrl,
              size: fileUrl.length,
              type: 'video_link',
              name: file.file_name,
              sort: 0,
            });
            fileMsgParts.push({
              id: '2',
              contentType: 'text/html',
              data: newMsgReply,
              size: newMsgReply.length,
              type: 'body',
              sort: 1,
            });
            fileMsgParts.push({
              id: '3',
              contentType: 'text/html',
              data: msgReply,
              size: msgReply.length,
              type: 'body',
              sort: 2,
            });
            sendMsgRes = await api.whatsapp.sendVideoMessage(
              {
                agency_id: user?.agency_fk,
                mobile_number: receiver_number,
                message_parts: fileMsgParts,
                contact_id: contact?.contact_id,
                agent_id: agentId,
                tracker_ref_name: trackerName,
                file_name: file.file_name,
                to_reply_msg: toReplyMsg,
              },
              false,
            );
          } else {
            fileMsgParts.push({
              id: '1',
              contentType: contentType,
              data: fileUrl,
              size: fileUrl.length,
              type: 'file',
              name: file.file_name,
              sort: 0,
            });
            fileMsgParts.push({
              id: '2',
              contentType: 'text/html',
              data: newMsgReply,
              size: newMsgReply.length,
              type: 'body',
              sort: 1,
            });
            fileMsgParts.push({
              id: '3',
              contentType: 'text/html',
              data: msgReply,
              size: msgReply.length,
              type: 'body',
              sort: 2,
            });
            sendMsgRes = await api.whatsapp.sendFileMessage(
              {
                agency_id: user?.agency_fk,
                mobile_number: receiver_number,
                message_parts: fileMsgParts,
                contact_id: contact?.contact_id,
                agent_id: agentId,
                tracker_ref_name: trackerName,
                file_name: file.file_name,
                content_type: contentType,
                to_reply_msg: toReplyMsg,
              },
              false,
            );
          }
          if (h.cmpStr(sendMsgRes.status, 'ok')) {
            // await handleGetConvo(user);
            setSending(false);
            setSuccessSend(true);
            setDefaultDelay(10000); //reset pooling for the webhook to cope up
            setTimeout(() => setSuccessSend(false), 1000);
          } else {
            setSending(false);
            setFailedSend(true);
            setTimeout(() => setFailedSend(false), 500);
          }
        });
      }

      setTimeout(() => msgBody.current?.scrollIntoView(), 30);
      setLoading(false);
      setShowModal(false);
    }
  }

  const handleScrollMessages = (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const scroll = scrollHeight - scrollTop - clientHeight - 0.5;
    if (scroll < 200 && !loadingNewData && !stopFetching) {
      setLoadingNewData(true);
      setMessageListOffset(messageListOffset + LIMIT);
    }
  };

  async function getMedia({
    msg_type,
    receiver_number,
    sender_number,
    msg_id,
    msg_body,
    type,
  }) {
    const agency_id = agency.agency_id;
    const whatsAppTokenDetails = await api.whatsapp.getMessageWhatsAppToken(
      agency_id,
      sender_number,
      false,
    );
    if (h.cmpStr(whatsAppTokenDetails.status, 'ok')) {
      const whatsAppToken = h.whatsApp.getWhatsAppToken(
        whatsAppTokenDetails?.data?.waba,
      );

      let retrieveImageData;
      let doc_data;
      if (h.cmpStr(msg_type, 'document')) {
        doc_data = msg_body.split('|');
        retrieveImageData = JSON.stringify({
          uri: `unified://${receiver_number}?messageId=${receiver_number}&mediaId=${doc_data[0]}`,
        });
      } else if (h.cmpStr(msg_type, 'image')) {
        doc_data = msg_body.split('|');
        if (doc_data instanceof Array) {
          retrieveImageData = JSON.stringify({
            uri: `unified://${receiver_number}?messageId=${receiver_number}&mediaId=${doc_data[0]}`,
          });
        } else {
          retrieveImageData = JSON.stringify({
            uri: `unified://${receiver_number}?messageId=${receiver_number}&mediaId=${msg_body}`,
          });
        }
      } else if (h.cmpStr(msg_type, 'video')) {
        doc_data = msg_body.split('|');
        if (doc_data instanceof Array) {
          retrieveImageData = JSON.stringify({
            uri: `unified://${receiver_number}?messageId=${receiver_number}&mediaId=${doc_data[0]}`,
          });
        } else {
          retrieveImageData = JSON.stringify({
            uri: `unified://${receiver_number}?messageId=${receiver_number}&mediaId=${msg_body}`,
          });
        }
      } else {
        retrieveImageData = JSON.stringify({
          uri: `unified://${receiver_number}?messageId=${receiver_number}&mediaId=${msg_body}`,
        });
      }
      const apiRes = await queryClient.fetchQuery(['fetchMedia'], () =>
        api.whatsapp.retrieveImage({
          params: retrieveImageData,
          token: whatsAppToken,
        }),
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        switch (msg_type) {
          case 'image':
          case 'audio':
          case 'video':
            return `data:${type};base64, ${apiRes.data.messages[receiver_number][0]?.parts[0]?.data}`;
          case 'document':
            return `data:${doc_data[2]};base64, ${apiRes.data.messages[receiver_number][0]?.parts[0]?.data}`;
        }
      }
      return '';
    }
  }

  const handleSelectPlatform = (platform) => {
    const selected_platforms = platform ? [...selectedPlatforms] : [];

    if (platform) {
      if (selectedPlatforms.includes(platform)) {
        selected_platforms.splice(selectedPlatforms.indexOf(platform), 1);
      } else {
        selected_platforms.push(platform);
      }
    }

    setSelectedPlatforms(selected_platforms);

    getList({
      ...filters,
      msg_platform: selected_platforms.join(','),
      offset: 0,
      limit: LIMIT,
      searchQuery: searchText,
    });
  };

  const handleSelectSort = (sortBy) => {
    setSelectedSort(sortBy);

    getList({
      ...filters,
      sortBy,
      offset: 0,
      limit: LIMIT,
      searchQuery: searchText,
    });
  };

  function handleUpdateContact(data) {
    setOpenEditContact(false);
    const contactIndex = messages.findIndex(
      (f) => f.contact.contact_id === contact?.contact_id,
    );

    if (contactIndex > -1) {
      const newMessages = [...messages];
      newMessages[contactIndex].contact = { ...contact, ...data };
      setMessages(newMessages);
    }
    setContact({ ...contact, ...data });
  }

  return (
    <>
      {openEditContact && (
        <CreateContactModal
          formMode={h.form.FORM_MODE.EDIT}
          contactId={contact?.contact_id}
          setLoading={setLoading}
          onCloseModal={handleUpdateContact}
        />
      )}
      <div id="messaging-root">
        <Header className="common-navbar-header" />
        <Body className="messaging-wrapper">
          <div className="messaging-container">
            <div className="message-items">
              <div className="search-message-wrapper">
                <div className="group">
                  <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <g>
                      <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                    </g>
                  </svg>
                  <input
                    type="search"
                    className="input"
                    placeholder="Search name/mobile/email..."
                    value={searchText || ''}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                {/* <input
                  type="text"
                  placeholder="Search name/mobile/email..."
                  value={searchText || ''}
                  onChange={(e) => setSearchText(e.target.value)}
                /> */}
                {isLoading && (
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: 'PoppinsSemiBold',
                      color: '#5A6264',
                      marginTop: '20px',
                      marginBottom: '20px',
                      position: 'absolute',
                      right: '28px',
                      top: '8px',
                    }}
                  >
                    <span className="spinner">&nbsp;</span>
                  </div>
                )}
              </div>
              <div className="message-item-navigation">
                <div className="active">
                  <FontAwesomeIcon
                    icon={faInbox}
                    color="#4877ff"
                    style={{ fontSize: '20px' }}
                  />
                </div>
                {/* <div>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    color="#2a5245"
                    style={{ fontSize: '20px' }}
                  />
                  <span>1</span>
                </div>

                <div>
                  <FontAwesomeIcon
                    icon={faCommentSlash}
                    color="#2a5245"
                    style={{ fontSize: '20px' }}
                  />
                </div> */}

                <div
                  className={`on-end ${
                    selectedOptions.length > 0 ||
                    selectedOwnerOptions.length > 0
                      ? 'has-filter'
                      : ''
                  }`}
                  style={{ display: 'flex', width: '58px', gap: '1em' }}
                >
                  <CommonTooltip
                    tooltipText={
                      muted ? 'Unmute chat messages' : 'Mute chat messages'
                    }
                  >
                    <FontAwesomeIcon
                      icon={muted === 1 ? faVolumeMute : faVolumeUp}
                      color="#4877ff"
                      style={{ fontSize: '20px' }}
                      onClick={() => setMuted(muted === 1 ? 0 : 1)}
                    />
                  </CommonTooltip>
                  <FontAwesomeIcon
                    icon={faSlidersH}
                    color="#4877ff"
                    style={{ fontSize: '20px' }}
                    onClick={() => setFilterShow(!filterShow)}
                  />
                  {filterShow && (
                    <MessageFilter
                      hasAdminAccess={hasAdminAccess}
                      contactOwners={contactOwners}
                      selectedOwnerOptions={selectedOwnerOptions}
                      setSelectedOwnerOptions={setSelectedOwnerOptions}
                      handleSelectSort={handleSelectSort}
                      selectedSort={selectedSort}
                      selectedPlatforms={selectedPlatforms}
                      handleSelectPlatform={handleSelectPlatform}
                      closeFilter={() => {
                        setFilterShow(false);
                      }}
                    />
                  )}
                </div>
              </div>
              <div
                className={`message-item-list ${
                  loadingNewConvo ? 'opaque-5' : ''
                }`}
                onScroll={handleScrollMessages}
              >
                {messages.map((msg, i) => (
                  <MessageList
                    key={i}
                    contact={contact}
                    msg={msg}
                    index={i}
                    messages={messages}
                    setMessages={setMessages}
                    clickAction={(msg) =>
                      !loadingNewConvo ? handleGetConvo(msg) : null
                    }
                  />
                ))}

                {!isLoading && messages.length === 0 && (
                  <div className="no-messages-found">
                    <span>
                      <FontAwesomeIcon
                        icon={faCommentSlash}
                        color="#DEE1E0"
                        style={{ fontSize: '40px' }}
                      />
                    </span>
                    <br />
                    No messages found
                  </div>
                )}
                {loadingNewData && <SmallSpinner />}
              </div>
            </div>
            <div className="message-body inbox-wrapper ">
              <div className="right-section">
                {loadingNewConvo === false && (
                  <>
                    {contact ? (
                      <MessageThread
                        agentId={agency?.agency_id}
                        sending={isSending}
                        thread={thread}
                        contact={contact}
                        trackerName={trackerName}
                        scrolled={scrolled}
                        setScrolled={setScrolled}
                        medias={medias}
                        disableSending={disableSending}
                        disableSendingStatus={disableSendingStatus}
                        sendMessage={(m, f, t) => sendMessage(m, f, t)}
                        bottom={bottom}
                        setBottom={setBottom}
                        showReply={true}
                        msgBody={msgBody}
                        convoRef={convoRef}
                        successSend={successSend}
                        failedSend={failedSend}
                        setLoading={setLoading}
                        showModal={showModal}
                        setShowModal={setShowModal}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center inbox-body">
                        <div className="inbox-body-convo d-flex align-items-center justify-content-center ">
                          <img
                            style={{ width: '440px' }}
                            src="https://cdn.yourpave.com/assets/leads-empty-2.png"
                            alt={'Pave'}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
                {loadingNewConvo === true && <ThreadLoading />}
                {loadingNewConvo === constant.API_STATUS.IDLE && (
                  <div className="d-flex align-items-center justify-content-center inbox-body">
                    <div className="inbox-body-convo d-flex align-items-center justify-content-center ">
                      <img
                        style={{ width: '440px' }}
                        src="https://cdn.yourpave.com/assets/leads-empty-2.png"
                        alt={'Pave'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <MessageContactOverview
              agentUserId={agentUserId}
              contact={contact}
              selectedAgenctOwner={selectedAgenctOwner}
              messages={messages}
              agency={agency}
              loadingNewConvoLoading={loadingNewConvo}
              handleEditContact={setOpenEditContact}
              threadLatestCampaign={threadLatestCampaign}
              isLastMessageBusinessCampaign={isLastMessageBusinessCampaign}
            />
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
});