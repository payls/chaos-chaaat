import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import IconContact from '../../../components/Icons/IconContact';
import { api } from '../../../api';
import { config } from '../../../configs/config';
import { routes } from '../../../configs/routes';
// ICONS
import {
  faPaperPlane,
  faCheckDouble,
  faDotCircle,
  faCommentSlash,
  faCheckCircle,
  faCircle,
  faInbox,
  faSlidersH,
  faEnvelope,
  faComments,
  faExclamationCircle,
  faUser,
  faMobile,
  faStop,
  faUsers,
  faCertificate,
  faEye,
  faDesktop,
  faClock,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

import IconWhatsAppBlack from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsAppBlack';
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconLineApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconLineApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import IconCircleBack from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconCircleBack';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import CommonModalAttachment from '../../../components/Sale/Link/preview/components/Common/CommonModalAttachment';

export default function WhatsAppInbox() {
  const router = useRouter();

  const [isLoading, setLoading] = useState();
  const [messages, setMessages] = useState([]);
  const [filterShow, setFilterShow] = useState(false);
  const [thread, setThread] = useState([]);
  const [contact, setContact] = useState(null);
  const [user, setUser] = useState(null);
  const [msgReply, setMsgReply] = useState('');
  const [timer, setTimer] = useState(null);
  const [bottom, setBottom] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const [agency, setAgency] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOwnerOptions, setSelectedOwnerOptions] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [showResponsesOnly, setSetShowResponsesOnly] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [medias, setMedias] = useState(null);
  const [contactOwners, setContactOwners] = useState([]);
  const [hasAdminAccess, setHasAdminAccess] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState(null);
  const [defaultDelay, setDefaultDelay] = useState(10000);
  const [selectedAgenctOwner, setSelectedAgenctOwner] = useState(null);
  const [searchText, setSearchText] = useState(null);
  const [pendingMedias, setPendingMedias] = useState([]);
  const [disableSending, setDisableSending] = useState(false);
  const [contactActivities, setContactActivities] = useState([]);
  const [latestContactActivities, setLatestContactActivities] = useState(null);
  const [viewMore, setViewMore] = useState(false);

  const msgBody = useRef(null);
  const msgTextAreaRef = useRef(null);
  const convoRef = useRef(null);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    (async () => {
      setHasAdminAccess(await h.userManagement.hasAdminAccess());
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgentId(apiRes.data?.agencyUser?.agency_user_id);
        setAgency(apiRes.data?.agencyUser.agency);

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

  const getList = async (filter = {}) => {
    setLoading(true);
    const trackerRes = await api.whatsapp.getTrackerDetails(
      {
        tracker_ref_name: h.general.findGetParameter('campaign'),
        ...filter,
      },
      false,
    );

    if (h.cmpStr(trackerRes.status, 'ok')) {
      setThread([]);
      setSearchText(null);
      setContact(null);

      // Set unique by receiver number
      setMessages([
        ...new Map(
          trackerRes.data.results.map((item) => [
            item['receiver_number'],
            item,
          ]),
        ).values(),
      ]);

      // const arr = [
      //   {
      //     ...trackerRes.data.results[0],
      //     whatsapp_message_tracker_id: 'dup',
      //     campaign_name: 'Batch 1',
      //   },
      //   ...trackerRes.data.results,
      // ];

      // const groupedMessages = arr.reduce((acc, message) => {
      //   const receiverNumber = message.receiver_number;
      //   if (!acc[receiverNumber]) {
      //     acc[receiverNumber] = {
      //       receiver_number: receiverNumber,
      //       items: [],
      //       ...message,
      //     };
      //   }
      //   acc[receiverNumber].items.push(message);
      //   return acc;
      // }, {});

      // const result = Object.values(groupedMessages);

      // setMessages(result);

      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      const valueArray = selectedOptions.map((option) => option.value);
      getList({
        quick_reply: valueArray.join('|'),
        agency_id: agency?.agency_id,
        only_with_response: showResponsesOnly ? true : null,
        agency_user_id: selectedOwnerOptions.map((m) => m.value)?.join(','),
      });
    }
  }, [
    JSON.stringify(selectedOptions),
    agentId,
    showResponsesOnly,
    selectedOwnerOptions,
  ]);

  useEffect(() => {
    (async () => {
      if (thread) {
        const newMediaForm = [];
        const pendingMediaArr = pendingMedias;
        for (let i in medias) {
          if (
            medias[i].status === 'idle' &&
            !pendingMediaArr.includes(medias[i].id)
          ) {
            pendingMediaArr.push(medias[i].id);
            getMedia({ ...medias[i].msg, type: medias[i].type }).then((r) => {
              newMediaForm.push({
                ...medias[i],
                value: r,
                status: 'fulfilled',
              });
            });
          } else {
            newMediaForm.push({ ...medias[i] });
          }
        }

        setPendingMedias(pendingMediaArr);
        setMedias(newMediaForm);
      }
    })();
  }, [thread]);

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

  useInterval(() => {
    if (user && convoRef && thread) {
      (async () => {
        const threadRes = await api.whatsapp.getThread(
          {
            sender_number: user?.sender_number,
            receiver_number: user?.receiver_number,
            tracker_ref_name: user?.tracker_ref_name,
          },
          false,
        );
        if (h.cmpStr(threadRes.status, 'ok')) {
          setDefaultDelay(5000);
          const threadValue = threadRes.data.whatsapp_chats
            .filter((f) => f.msg_body)
            .sort(function (a, b) {
              return (
                new Date(a.created_date_raw) - new Date(b.created_date_raw)
              );
            });

          const mediaArr = [];
          const lastContactResponse = threadValue
            .slice()
            .reverse()
            .find((entry) => entry.msg_type !== 'frompave');
          threadValue.forEach((msg, index) => {
            const media = medias.filter((f) => f.id === msg.whatsapp_chat_id);
            if (media.length > 0) {
              mediaArr.push(media[0]);
            } else {
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
              }

              mediaArr.push(mediaObj);
            }
            if (h.cmpInt(index + 1, threadValue.length)) {
              if (lastContactResponse) {
                const currentDate = new Date();
                const currentUtcDate = new Date(
                  currentDate.getTime() +
                    currentDate.getTimezoneOffset() * 60000,
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
                }
              } else {
                setDisableSending(true);
              }
            }
          });
          setMedias(mediaArr);
          setThread(threadValue);
          if (bottom) {
            await msgBody.current?.scrollIntoView();
          }
        } else {
          clearInterval(intervalId);
          setLoading(false);
        }
      })();
    }
  }, defaultDelay);

  const updateConvo = async (msg) => {};

  const resizeTextArea = () => {
    if (thread && msgTextAreaRef.current) {
      msgTextAreaRef.current.style.height = 'auto';
      msgTextAreaRef.current.style.height =
        msgTextAreaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(resizeTextArea, [msgReply]);

  const getFirstInitials = (firstname, lastname) => {
    let firstInitial;
    let secondInitial;

    if (h.general.notEmpty(firstname)) {
      firstInitial = firstname.charAt(0).toUpperCase();
    } else {
      firstInitial = '';
    }

    if (h.general.notEmpty(lastname)) {
      secondInitial = lastname.charAt(0).toUpperCase();
    } else {
      secondInitial = '';
    }
    return firstInitial + secondInitial;
  };

  async function handleGetConvo(msg) {
    setLoading(true);

    const threadRes = await api.whatsapp.getThread(
      {
        sender_number: msg?.sender_number,
        receiver_number: msg?.receiver_number,
        tracker_ref_name: msg?.tracker_ref_name,
      },
      false,
    );

    if (h.cmpStr(threadRes.status, 'ok')) {
      setUser(msg);
      setSelectedAgenctOwner(msg.contact?.agency_user ?? msg.agency_user);
      setContact(msg.contact);

      const apiRes = await api.contactActivity.getContactActivities(
        { contact_id: msg.contact?.contact_id },
        {},
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setContactActivities(
          apiRes.data?.contactActivityOverview?.allActivity?.sort(
            (activityA, activityB) => {
              const dateA = new Date(activityA.activity_date_raw);
              const dateB = new Date(activityB.activity_date_raw);
              return dateB - dateA;
            },
          ),
        );

        setLatestContactActivities(
          apiRes.data?.contactActivityOverview?.latestActivity,
        );
      }

      setLoading(false);

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
        }

        mediaArr.push(mediaObj);

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
      setMedias(mediaArr);
      setThread(threadValue);
      setTimer(setInterval(() => updateConvo(msg), 2000));
      msgBody.current?.scrollIntoView();
    } else {
      clearInterval();
      setLoading(false);
      setContact(null);
    }
  }

  function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  function handleMsgBody(chat) {
    const cdnURLs = [
      'https://cdn-staging.yourpave.com',
      'https://cdn-qa.yourpave.com',
      'https://cdn.yourpave.com',
    ];

    const msgDate = h.date.convertUTCDateToLocalDate(
      chat.created_date + ' GMT',
      timeZone,
      'en-AU',
      {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );
    const message_body =
      `<sup style='text-align: right; display: block; padding: 10px 0px 10px 10px; margin-right: 10px;'>${msgDate}</sup>` +
      `<div style='width: 100%'>${chat.msg_body}</div>`;
    if (cdnURLs.some((v) => message_body.includes(v) && isImage(v))) {
      return (
        <span className="inbox-item-big-msg media-content">
          <img
            src={message_body}
            width="100%"
            onClick={() => {
              setShowModal(true);
              setPreviewImageSrc(message_body);
            }}
          />
        </span>
      );
    } else {
      let chatIcon = {
        icon: faCheck,
        text: '',
      };

      if (chat.delivered) {
        chatIcon = {
          icon: faCheckDouble,
          text: '',
        };
      }

      if (chat.read) {
        chatIcon = {
          icon: faCheckDouble,
          text: 'read',
        };
      }

      if (chat.failed) {
        chatIcon = {
          icon: faCommentSlash,
          text: '',
        };
      }

      return (
        <>
          <span
            className="inbox-item-big-msg"
            dangerouslySetInnerHTML={{
              __html: message_body,
            }}
          ></span>
          {/* {getLastMeChatIndex === index && ( */}
          <span className="chat-msg-status">
            <FontAwesomeIcon
              icon={chatIcon.icon}
              color={chatIcon.text === 'read' ? '#00b0f5' : '#969696'}
              size="sm"
              className="mr-1"
            />
          </span>
          {/* )} */}
        </>
      );
    }
  }

  async function sendMessage() {
    setLoading(true);
    if (user && contact) {
      const msgParts = [];

      const expression =
        /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      const matches = msgReply.match(expression);
      const agent_name = contact?.agency_user?.user?.first_name;
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

      const contact_mobile_number = String(user?.contact?.mobile_number);
      const receiver_number = h.notEmpty(contact_mobile_number)
        ? contact_mobile_number.replace(/[^0-9]/g, '')
        : null;

      const sendMsgRes = await api.whatsapp.sendMessage(
        {
          agency_id: user?.agency_fk,
          mobile_number: receiver_number,
          message_parts: msgParts,
          contact_id: contact?.contact_id,
          agent_id: agentId,
          tracker_ref_name: h.general.findGetParameter('campaign'),
        },
        false,
      );

      if (h.cmpStr(sendMsgRes.status, 'ok')) {
        await handleGetConvo(user);
        setMsgReply('');
      } else {
        setLoading(false);
      }
    }
  }

  const handleScroll = (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const scroll = scrollHeight - scrollTop - clientHeight - 0.5;

    if (scroll > 0) {
      setBottom(false);
    } else if (scroll == 0) {
      setBottom(true);
    }
  };

  function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
    if (value.length === 0) {
      return `${placeholderButtonLabel}`;
    } else {
      return `(${value.length}) ${placeholderButtonLabel}`;
    }
  }

  function onChange(value, event) {
    this.setState(value);
  }

  async function getMedia({
    msg_type,
    receiver_number,
    msg_id,
    msg_body,
    type,
  }) {
    const whatsAppToken = h.whatsApp.getWhatsAppToken(agency);
    const retrieveImageData = JSON.stringify({
      uri: `unified://${receiver_number}?messageId=${receiver_number}&mediaId=${msg_body}`,
    });

    const apiRes = await api.whatsapp.retrieveImage({
      params: retrieveImageData,
      token: whatsAppToken,
    });

    if (h.cmpStr(apiRes.status, 'ok')) {
      switch (msg_type) {
        case 'image':
        case 'audio':
        case 'video':
          return `data:${type};base64, ${apiRes.data.messages[receiver_number][0]?.parts[0]?.data}`;
      }
    }
    return '';
  }

  function getMediaMsgBody(msg) {
    const media = medias.filter((f) => f.id === msg.whatsapp_chat_id);

    if (media.length > 0) {
      switch (msg.msg_type) {
        case 'image':
          return (
            <span className="inbox-item-big-msg media-content">
              <img
                src={media[0].value}
                width="100%"
                onClick={() => {
                  setShowModal(true);
                  setPreviewImageSrc(media[0].value);
                }}
              />
            </span>
          );
        case 'audio':
          return (
            <span className="inbox-item-big-msg media-content">
              <audio controls src={media[0].value}></audio>
            </span>
          );
        case 'video':
          return (
            <span className="inbox-item-big-msg media-content">
              <video controls src={media[0].value}></video>
            </span>
          );
        default:
          return <span className="inbox-item-big-msg">Unsupported media</span>;
      }
    }
  }

  const handleModal = (e, attachment) => {
    if (e) e.preventDefault();
    if (showModal) {
      setShowModal(false);
      setPreviewImageSrc(null);
    } else {
      setShowModal(true);
    }
  };

  const filteredMsgs = () => {
    if (searchText !== null) {
      return messages.filter((f) => {
        //Full name search
        if (
          (f.contact?.first_name + ' ' + f.contact?.last_name)
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
        ) {
          return true;
        }

        // Mobile
        if (
          f.contact?.mobile_number
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
        ) {
          return true;
        }

        // Email
        if (
          f.contact?.email?.toLowerCase().includes(searchText.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
    }
    return messages;
  };

  const convertActivityType = (activityType) => {
    const words = activityType.split('_').map((word) => {
      const firstChar = word.charAt(0).toUpperCase();
      const restOfString = word.slice(1).replace(/_/g, ' ');
      let activity = `${firstChar}${restOfString}`;
      activity = activity.replace(/\bProjet\b/g, 'Project');
      return activity;
    });

    return words.join(' ');
  };

  function checkForAttachmentMessage(str) {
    if (str.match(/<img.*?>/) || str.match(/<video.*?>.*?<\/video>/)) {
      return 'Attachment';
    } else {
      return str ?? ' ';
    }
  }

  return (
    <>
      <div id="messaging-root">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading} className="messaging-wrapper">
          {/* <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '245px',
              top: '0px',
              left: '0px',
              background: 'red',
            }}
          ></div> */}
          {previewImageSrc && (
            <CommonModalAttachment
              key={`modal-whatsapp-image-preview`}
              attachment={{ attachment_url: previewImageSrc ?? '' }}
              show={showModal}
              handleModal={handleModal}
            />
          )}
          <div className="messaging-container">
            <div className="message-navigation">
              <div onClick={() => router.push(routes.dashboard.messaging)}>
                <IconCircleBack width="30" color={'#fff'} />
              </div>
              <div onClick={() => router.push(routes.dashboard.messaging)}>
                <IconWhatsApp width="30" color={'#fff'} />
              </div>
              <div onClick={() => router.push(routes.dashboard.sms)}>
                <IconSMS width="30" color={'#fff'} />
              </div>
              <div onClick={() => router.push(routes.dashboard.comments)}>
                <IconComments width="30" color={'#fff'} />
              </div>
            </div>
            <div className="message-items">
              <div className="search-message-wrapper">
                <div class="group">
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <g>
                      <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                    </g>
                  </svg>
                  <input
                    type="search"
                    class="input"
                    placeholder="Search name/mobile/email..."
                    value={searchText || ''}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className="message-item-navigation">
                <div className="active">
                  <FontAwesomeIcon
                    icon={faInbox}
                    color="#2a5245"
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
                >
                  <FontAwesomeIcon
                    icon={faSlidersH}
                    color="#2a5245"
                    style={{ fontSize: '20px' }}
                    onClick={() => setFilterShow(!filterShow)}
                  />
                  {filterShow && (
                    <section
                      className="messages-filter-wrapper "
                      style={{
                        position: 'absolute',
                      }}
                    >
                      <ReactMultiSelectCheckboxes
                        options={quickReplies}
                        placeholderButtonLabel={'Quick Reply'}
                        getDropdownButtonLabel={getDropdownButtonLabel}
                        value={selectedOptions}
                        onChange={onChange}
                        setState={setSelectedOptions}
                      />
                      {hasAdminAccess && (
                        <ReactMultiSelectCheckboxes
                          options={contactOwners}
                          placeholderButtonLabel={'Contact Owner'}
                          getDropdownButtonLabel={getDropdownButtonLabel}
                          value={selectedOwnerOptions}
                          onChange={onChange}
                          setState={setSelectedOwnerOptions}
                        />
                      )}
                      <div className="">
                        <label
                          className="cb-container"
                          style={{
                            fontSize: '14px',
                            paddingLeft: '25px',
                            paddingTop: '3px',
                          }}
                        >
                          Only show with responses
                          <input
                            type={'checkbox'}
                            style={{ marginLeft: '10px' }}
                            defaultChecked={showResponsesOnly}
                            onChange={(e) =>
                              setSetShowResponsesOnly(e.target.checked)
                            }
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>
                      {/* <label>Platform:</label>
                      <div className="platform-items d-flex">
                        <span className="wa active">
                          <IconWhatsApp width="18" color={'#fff'} />
                        </span>
                        <span className="line active">
                          <IconLineApp width="25  " color={'#fff'} />
                        </span>
                      </div> */}
                      <button
                        type="button"
                        onClick={() => setFilterShow(false)}
                      >
                        CLOSE
                      </button>
                    </section>
                  )}
                </div>
              </div>
              <div className="message-item-list">
                {filteredMsgs().map((msg, i) => (
                  <div
                    key={i}
                    className={`message-item-list-item  d-flex flex-row ${
                      contact?.contact_id === msg?.contact?.contact_id
                        ? 'active'
                        : ''
                    }`}
                    style={{ gap: '0.5em' }}
                    onClick={() => {
                      handleGetConvo(msg);
                    }}
                  >
                    <div
                      className="d-flex justify-content-center"
                      style={{ flex: '10%' }}
                    >
                      <span className="inbox-avatar wa">
                        <IconWhatsApp width="18" color={'#fff'} />
                      </span>
                      {/* <span className="inbox-avatar line">
                          <IconLineApp width="25" color={'#fff'} />
                        </span> */}
                    </div>
                    <div style={{ width: 'calc(100% - 35px)' }}>
                      <div className="inbox-item-user d-flex flex-row justify-content-between">
                        <div className="inbox-item-name">
                          {`${msg?.contact?.first_name ?? ''} ${
                            msg?.contact?.last_name ?? ''
                          }`}
                        </div>
                        <div className="inbox-item-time">
                          {msg?.updated_date_time_ago}
                        </div>
                      </div>

                      <div
                        className="inbox-item-sm-msg"
                        dangerouslySetInnerHTML={{
                          __html: msg?.msg_body
                            ? checkForAttachmentMessage(msg?.msg_body)
                            : '',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="message-body inbox-wrapper ">
              <div className="right-section">
                {contact ? (
                  <div className="inbox-body ">
                    <div
                      className="inbox-body-convo"
                      ref={convoRef}
                      onScroll={handleScroll}
                    >
                      {thread.length > 0 &&
                        thread.map((msg, i) => (
                          <div
                            className={
                              `inbox-item d-flex flex-row ` +
                              (msg?.receiver_url?.includes('name=') ? '' : 'me')
                            }
                            key={i}
                          >
                            <div className="inbox-item-body d-flex flex-column">
                              <div className="inbox-item-user d-flex flex-row justify-content-between">
                                <div className="inbox-item-name">
                                  {`${contact?.first_name} ${
                                    contact?.last_name ?? ''
                                  }`}
                                </div>
                                <div className="inbox-item-time">
                                  {msg?.updated_date_time_ago}
                                </div>
                              </div>
                              {msg.msg_body && (
                                <div
                                  className="d-flex justify-content-start"
                                  style={{ position: 'relative' }}
                                >
                                  {[
                                    'frompave',
                                    'text',
                                    'button',
                                    'interactive',
                                  ].includes(msg.msg_type) && (
                                    <>{handleMsgBody(msg)}</>
                                  )}
                                  {['image', 'audio', 'video'].includes(
                                    msg.msg_type,
                                  ) && <>{getMediaMsgBody(msg)}</>}

                                  {![
                                    'video',
                                    'button',
                                    'audio',
                                    'image',
                                    'frompave',
                                    'text',
                                    'interactive',
                                  ].includes(msg.msg_type) && (
                                    <span className="inbox-item-big-msg">
                                      Unsupported media
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      <div ref={msgBody}> </div>
                    </div>
                    <div
                      className="send-msg-body"
                      style={{
                        padding: '10px 16px',
                        borderTop: '1px solid #f2f2f2',
                      }}
                    >
                      {!disableSending ? (
                        <>
                          <div
                            className="send-msg-txtarea"
                            style={{ width: '100%' }}
                          >
                            <textarea
                              style={{
                                padding: '2px',
                                resize: 'none',
                                height: '40px !important',
                                background: 'rgb(255, 255, 255) !important',
                                border:
                                  '1px solid rgb(209, 209, 209) !important',
                                fontSize: '16px',
                                padding: '7px 19px',
                                maxHeight: '100px',
                                width: '100%',
                              }}
                              placeholder="Type your message here"
                              ref={msgTextAreaRef}
                              value={msgReply}
                              onChange={(e) => {
                                setMsgReply(e.target.value);
                              }}
                              rows={1}
                              onKeyDown={(e) => {
                                if (
                                  e.keyCode === 13 &&
                                  e.target.value.trim().length > 0 &&
                                  !e.shiftKey
                                ) {
                                  sendMessage();
                                  e.preventDefault();
                                  return false;
                                }
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            disabled={!msgReply || msgReply.trim().length === 0}
                            onClick={() => {
                              sendMessage();
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              color="#fff"
                              size="lg"
                            />
                          </button>
                        </>
                      ) : (
                        <div
                          className="send-msg-body"
                          style={{
                            padding: '10px 16px',
                            color: '#5A6264',
                            fontFamily: 'PoppinsSemiBold',
                          }}
                        >
                          <div
                            className="send-msg-txtarea"
                            style={{ width: '100%', textAlign: 'center' }}
                          >
                            <FontAwesomeIcon
                              icon={faCommentSlash}
                              color="#5A6264"
                              size="lg"
                              style={{
                                marginLeft: '5px',
                                display: 'inline-block',
                              }}
                            />{' '}
                            SENDING MESSAGE DISABLED. NO RESPONSE FROM CONTACT
                            FOR MORE THAN 24 HOURS.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center inbox-body">
                    <div className="inbox-body-convo d-flex align-items-center justify-content-center ">
                      <img
                        style={{ width: '440px' }}
                        src="https://cdn.yourpave.com/assets/empty-data-2x.png"
                        alt={'Pave'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {contact && (
              <div className="message-user-info">
                <h1>
                  {`${contact?.lead_score ?? ''} `}
                  <small className="message-user-info-lead">Lead Score</small>
                </h1>
                <h3>
                  {`${contact?.first_name ?? ''} ${contact?.last_name ?? ''}`}
                </h3>
                <div className="info-list">
                  {selectedAgenctOwner?.user?.full_name && (
                    <div>
                      <span>
                        <FontAwesomeIcon
                          icon={faUser}
                          color="#2a5245"
                          style={{ fontSize: '15px' }}
                        />{' '}
                      </span>
                      <div>
                        <small className="smaill-title">Contact Owner</small>
                        <br />
                        {selectedAgenctOwner?.user?.full_name}
                      </div>
                    </div>
                  )}
                  {contact?.mobile_number && (
                    <div>
                      <span>
                        {/* <FontAwesomeIcon
                          icon={faMobile}
                          color="#2a5245"
                          style={{ fontSize: '15px' }}
                        />{' '} */}
                        <IconWhatsAppBlack width="15px" color={'#2a5245'} />
                        {/* <IconLineApp width="25px" color={'#2a5245'} /> */}
                      </span>
                      <div>
                        <small className="smaill-title">Mobile</small>
                        <br />
                        <a href={`tel:${contact?.mobile_number}`}>
                          <b> {contact?.mobile_number}</b>
                        </a>
                      </div>
                    </div>
                  )}
                  {contact?.email && (
                    <div>
                      <span>
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          color="#2a5245"
                          style={{ fontSize: '15px' }}
                        />{' '}
                      </span>
                      <div>
                        <small className="smaill-title">Email</small>
                        <br />
                        <a href={`mailto:${contact?.email}}`}>
                          <b> {contact?.email}</b>
                        </a>
                      </div>
                    </div>
                  )}
                  {messages.length > 0 && (
                    <div>
                      <span>
                        <FontAwesomeIcon
                          icon={faUsers}
                          color="#2a5245"
                          style={{ fontSize: '15px' }}
                        />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">Campaign</small>
                        <br />
                        <b onClick={() => {}} style={{ cursor: 'pointer' }}>
                          {messages[0]?.campaign_name}
                        </b>
                      </div>
                    </div>
                  )}
                  {contact?.permalink && (
                    <div>
                      <span>
                        <FontAwesomeIcon
                          icon={faCertificate}
                          color="#2a5245"
                          style={{ fontSize: '15px' }}
                        />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">Product</small>
                        <br />
                        <b
                          onClick={() => {
                            window.open(
                              h.route.createSubdomainUrl(
                                agency?.agency_subdomain,
                                `${config.webUrl}/preview?permalink=${contact?.permalink}`,
                              ),

                              '_blank',
                            );
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Click to view product
                        </b>
                      </div>
                    </div>
                  )}

                  {viewMore && latestContactActivities && (
                    <div>
                      <span>
                        <FontAwesomeIcon
                          icon={faClock}
                          color="#2a5245"
                          style={{ fontSize: '15px' }}
                        />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">
                          Most recent product view
                        </small>
                        <br />
                        <b>
                          {h.date.formatDateTime(
                            h.date.convertUTCDateToLocalDate(
                              latestContactActivities.created_date_raw,
                              timeZone,
                            ),
                          )}{' '}
                          {latestContactActivities?.location
                            ? ' - ' + latestContactActivities?.location
                            : ''}
                        </b>
                      </div>
                    </div>
                  )}

                  {viewMore && contact && (
                    <div>
                      <span>
                        <IconWhatsAppBlack width="15px" color={'#2a5245'} />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">
                          WhatsApp Subscription
                        </small>
                        <br />
                        <b>
                          {contact?.opt_out_whatsapp ? 'Opt-Out' : 'Opt-In'}
                        </b>
                      </div>
                    </div>
                  )}

                  {viewMore && contact && (
                    <div>
                      <span>
                        <IconLineApp width="25px" color={'#2a5245'} />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">
                          Line Subscription
                        </small>
                        <br />
                        <b>Opt-In</b>
                      </div>
                    </div>
                  )}

                  {viewMore && contact && (
                    <div>
                      <span>
                        <IconSMS width="15px" color={'#2a5245'} />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">SMS Subscription</small>
                        <br />
                        <b>{contact?.opt_out_sms ? 'Opt-Out' : 'Opt-In'}</b>
                      </div>
                    </div>
                  )}

                  <label
                    style={{
                      textAlign: 'center',
                      marginTop: '10px',
                      color: '#2a5245',
                      // textDecoration: 'underline',
                      cursor: 'pointer',
                      fontFamily: 'PoppinsSemiBold',
                    }}
                    onClick={() => {
                      setViewMore(!viewMore);
                    }}
                  >
                    View {viewMore ? 'less' : 'more'} info
                  </label>
                </div>

                {contactActivities && (
                  <>
                    <h2>Activities</h2>

                    <div className="user-activities">
                      {contactActivities.map((activity, i) => (
                        <div key={i}>
                          <FontAwesomeIcon
                            icon={faCircle}
                            color="#FE5959"
                            style={{
                              marginRight: '5px',
                              marginTop: '6px',
                              fontSize: '8px',
                            }}
                          />
                          <div className="d-flex flex-column">
                            <span>{activity.activity_date_time_ago}</span>
                            {convertActivityType(activity.activity_type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
