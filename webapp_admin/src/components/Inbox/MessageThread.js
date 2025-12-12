import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import he from 'he';

import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-video.css';

import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import SelectTemplate from './SelectTemplate';
import SelectLineTemplate from './SelectLineTemplate';
import moment from 'moment';
const cheerio = require('cheerio');

const LightGallery = dynamic(() => import('lightgallery/react'), {
  ssr: false,
});

// ICONS
import {
  faCheckDouble,
  faCommentSlash,
  faCheck,
  faQuestionCircle,
  faFileCsv,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFilePdf,
  faReply,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import MessageInput from './MessageInput';
import MessageThreadHeader from './MessageThreadHeader';
import CommonTooltip from '../Common/CommonTooltip';
import IconTemplate from '../ProposalTemplate/Link/preview/components/Icons/IconTemplate';
import CommonIconButton from '../Common/CommonIconButton';

const fileSizeLimit = {
  image: {
    limit: 5242880,
    label: '5MB',
  },
  video: {
    limit: 16777216,
    label: '16MB',
  },
  document: {
    limit: 104857600,
    label: '100MB',
  },
  audio: {
    limit: 16777216,
    label: '16MB',
  },
}
export default React.memo(
  ({
    agencyId,
    thread,
    contact,
    trackerName,
    scrolled,
    setScrolled,
    medias,
    disableSending,
    setDisableSending,
    sendMessage,
    setBottom,
    showReply,
    msgBody,
    convoRef,
    sending,
    failedSend,
    successSend,
    setLoading,
    showModal,
    setShowModal,
    disableSendingStatus,
    platform,
    backAction = () => {},
    changeLineSelectedChannel = () => {},
    selectedLineChannel,
    lineChannels,
    lineLastChannelUsed,
    isSenderDisabled,
    setOpenSendTemplate,
    setDirectContact,
  }) => {
    const msgTextAreaRef = useRef(null);
    const fileRef = useRef(null);
    const lightGallery = useRef(null);

    const [previewImageSrc, setPreviewImageSrc] = useState(null);
    const [openEditContact, setOpenEditContact] = useState(false);
    const [openSelectTemplate, setOpenSelectTemplate] = useState(false);
    const [openSelectLineTemplate, setOpenSelectLineTemplate] = useState(false);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [toReplyMsg, setToReplyMsg] = useState(null);
    const [templateSending, setTemplateSending] = useState(
      constant.API_STATUS.IDLE,
    );
    const [mediaType, setMediaType] = useState('');

    const [fileUploadStatus, setFileUploadStatus] = useState(
      constant.API_STATUS.IDLE,
    );

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
      if (contact && h.cmpStr(contact?.status, 'inactive')) {
        setDisableSending(true);
      }
    }, [contact]);

    useEffect(() => {
      if (!sending && successSend) {
        setAttachmentFiles([]);
        setToReplyMsg(null);
      }
    }, [successSend]);

    const handleScrollOnLoad = (t, i) => {
      if (typeof t[t.length] === 'undefined' && !scrolled && msgBody.current) {
        setScrolled(true);
        setTimeout(() => {
          msgBody.current?.scrollIntoView();
        }, 50);
      }
    };

    const handleScroll = (event) => {
      const { scrollHeight, scrollTop, clientHeight } = event.target;
      const scroll = scrollHeight - scrollTop - clientHeight - 0.5;

      if (scroll > 0) {
        setBottom(false);
      } else if (scroll == 0) {
        setBottom(true);
      }
    };

    function isImage(url) {
      return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
    }

    function getMediaReplyMsgBody(msg) {
      switch (msg.reply_to_msg_type) {
        case 'frompave':
        case 'text':
        case 'button':
        case 'interactive':
          return `<div class="attached-reply-msg">${msg.reply_to_content}</div>`;
        case 'file_frompave':
          return 'Document';
        case 'document':
          const doc_data = msg.msg_body.split('|');
          return doc_data[1];
        case 'image':
        case 'img_frompave': {
          const media = msg.reply_to_content.split('\n<div');
          return `<img src="${
            media[0] ?? ''
          }" height="300px" style="border-radius: 10px" />`;
        }
        case 'audio':
          return 'Audio';
        case 'video':
        case 'video_frompave': {
          const media = msg.reply_to_content.split('\n<div');
          return `<video controls src="${media[0] ?? ''}" disabled></video>`;
        }
        default:
          return `<span clas="inbox-item-big-msg">Unsupported media</span>`;
      }
    }

    function isMe(msg) {
      return msg?.receiver_url?.includes('name=') ? false : true;
    }

    function getReplyName(msg) {
      return !msg?.receiver_url?.includes('name=')
        ? ''
        : `<h1 style="font-size: 15px;
      font-family: 'PoppinsSemiBold';">${msg.reply_to_contact_id}</h1>`;
    }
    function getReplyBody(msg) {
      if (h.notEmpty(msg.reply_to_event_id)) {
        const reply = (body) => {
          return `<a href="#${
            msg.reply_to_event_id
          }" class="reply-wrapper"><div style='width: 100%;padding: 10px;
          background: #dddddd;
          border-radius: 10px;
          font-size: 12px;' >${getReplyName(msg)}${getMediaReplyMsgBody(
            body,
          )}</div></a>`;
        };

        return reply(msg);
      }
      if (h.notEmpty(msg.reply_to_msg_id)) {
        const reply = (body) => {
          return `<a href="#${
            msg.reply_to_msg_id
          }" class="reply-wrapper"><div style='width: 100%;padding: 10px;
          background: #dddddd;
          border-radius: 10px;
          font-size: 12px;' >${getReplyName(msg)}${getMediaReplyMsgBody(
            body,
          )}</div></a>`;
        };

        return reply(msg);
      }

      return '';
    }

    function withResend(msg) {
      // if (!msg?.receiver_url?.includes('name=') && msg?.failed === 1) {
      //   return (
      //     <div class="failed-send">
      //       Failed to send.{' '}
      //       <span
      //         onClick={() => {
      //           /**
      //            * @TODO
      //            * Resend function here
      //            */
      //         }}
      //       >
      //         Resend
      //       </span>
      //     </div>
      //   );
      // }

      return null;
    }

    function convertTimestampToDateFormat(timestamp) {
      const date = new Date(moment.unix(timestamp));
      const options = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      const formattedDate = date.toLocaleString('en-AU', options);
      return formattedDate;
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
      let message_body;
      // if (isMe(chat) && getReplyBody(chat) !== '') {
      //   message_body =
      //   // `<div style='width: 100% margin-bottom: 20px;' class="with-reply">` +
      //   //   `<div>${getReplyBody(chat)}</div>` +
      //   // `</div>` +
      //   `<sup style='text-align: right; display: block; padding: 10px 0px 10px 10px; margin-right: 10px;'>${h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0 ? convertTimestampToDateFormat(chat.msg_timestamp) : msgDate} ${
      //     platform === constant.INBOX.TYPE.WHATSAPP
      //       ? ' • WABA: ' + chat.sender_number
      //       : ''
      //   }${
      //     platform === constant.INBOX.TYPE.LINE
      //       ? ' • Channel: ' + chat.agency_channel_config.channel_name
      //       : ''
      //   }</sup>` +
      //   `${removeTrailingWhitespaceAndLineBreaks(
      //     convertLinksToAnchorTags(chat.msg_body),
      //   )} `;
      // } else {
        message_body =
        `<sup style='text-align: right; display: block; padding: 10px 0px 10px 10px; margin-right: 10px;'>${h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0 ? convertTimestampToDateFormat(chat.msg_timestamp) : msgDate} ${
          platform === constant.INBOX.TYPE.WHATSAPP
            ? ' • WABA: ' + chat.sender_number
            : ''
        }${
          platform === constant.INBOX.TYPE.LINE
            ? ' • Channel: ' + chat.agency_channel_config.channel_name
            : ''
        }</sup>` +
        `<div style='width: 100%; overflow-wrap: break-word'>` +
        // `<div style='width: 100% margin-bottom: 20px;' class="with-reply">` +
        //   ${getReplyBody(chat)} +
        // `</div>` +
          `${removeTrailingWhitespaceAndLineBreaks(
            convertLinksToAnchorTags(chat.msg_body),
          )} ` +
        `</div>`;
      // }
      

      let hasElements =
        message_body.includes('campaign_header_image') ||
        message_body.includes('<button') ||
        message_body.includes('<img');
      if (cdnURLs.some((v) => message_body.includes(v) && isImage(v))) {
        return (
          <span className="inbox-item-big-msg media-content">
            <img
              src={message_body}
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
            <RenderSafeTextContent content={message_body} replyBody={getReplyBody(chat)} hasElements={hasElements} />
            {withResend(chat)}
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

    function handleImageClick(url) {
      setShowModal(true);
      setPreviewImageSrc(url);
    }

    function handleImgMsgBody(chat) {
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
      const msg_body = chat.msg_body;
      if (msg_body.includes('<div')) {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const url = msg_body.match(urlRegex)[0];
        let rest;
        let rest2;
        const updated_msg_body = msg_body.replace(url, '');
        const $ = cheerio.load(updated_msg_body);
        rest = $(`div[className="test-class"]`).prop('outerHTML');
        $(`div[className="test-class"]`).remove();
        const updatedContent = $('body').html().trim();
        rest2 = updatedContent;

        const message_body = (
          <span className="inbox-item-big-msg w-chi">
            <sup
              style={{
                textAlign: 'right',
                display: 'block',
                padding: '10px 0px 10px 10px',
                marginRight: '10px',
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? ' • WABA: ' + chat.sender_number
                : ''}
              {platform === constant.INBOX.TYPE.LINE
                ? ' • Channel: ' + chat.agency_channel_config.channel_name
                : ''}
            </sup>
            <div style={{ width: '100%' }}>
              <RenderSafeCaptionContent content={rest} type={'span_image_frompave'} />
              <img
                src={url}
                onClick={() => handleImageClick(url)}
                width={'320px'}
                style={{marginTop: !rest ? '0px' : '30px'}}
                className="mb-2 wewewew"
              />
              <RenderSafeCaptionContent content={rest2} type={'div_image_frompave'} />
            </div>
          </span>
        );

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
            {message_body}
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
      } else {
        const message_body = (
          <span className="inbox-item-big-msg">
            <sup
              style={{
                textAlign: 'right',
                display: 'block',
                padding: '10px 0px 10px 10px',
                marginRight: '10px',
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? ' • WABA: ' + chat.sender_number
                : ''}
              {platform === constant.INBOX.TYPE.LINE
                ? ' • Channel: ' + chat.agency_channel_config.channel_name
                : ''}
            </sup>
            <div style={{ width: '100%' }}>
              <img
                src={msg_body}
                onClick={() => handleImageClick(msg_body)}
                height="320px"
              />
            </div>
          </span>
        );
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
            {message_body}
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

    function handleFileMsgBody(chat) {
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
      const msg_body = chat.msg_body;
      if (msg_body.includes('<div')) {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const url = msg_body.match(urlRegex)[0];
        let rest;
        let rest2;
        const updated_msg_body = msg_body.replace(url, '');
        const $ = cheerio.load(updated_msg_body);
        rest = $(`div[className="test-class"]`).prop('outerHTML');
        const msg_caption = $(`div[className="msg-caption"]`).prop('outerHTML');
        $(`div[className="test-class"]`).remove();
        $(`div[className="msg-caption"]`).remove();
        $('body').append(msg_caption);
        const updatedContent = $('body').html().trim();
        rest2 = updatedContent;

        const message_body = (
          <span className="inbox-item-big-msg">
            <sup
              style={{
                textAlign: 'right',
                display: 'block',
                padding: '10px 0px 10px 10px',
                marginRight: '10px',
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? ' • WABA: ' + chat.sender_number
                : ''}
              {platform === constant.INBOX.TYPE.LINE
                ? ' • Channel: ' + chat.agency_channel_config.channel_name
                : ''}
            </sup>
            <div style={{ width: '100%' }}>
              <RenderSafeCaptionContent content={rest} type={'span_file_frompave'} />
            </div>
            <RenderSafeCaptionContent content={rest2} type={'div_file_frompave'} />
          </span>
        );

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
            {message_body}
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
      } else {
        const message_body = (
          <span className="inbox-item-big-msg w-chi">
            <sup
              style={{
                textAlign: 'right',
                display: 'block',
                padding: '10px 0px 10px 10px',
                marginRight: '10px',
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? ' • WABA: ' + chat.sender_number
                : ''}
              {platform === constant.INBOX.TYPE.LINE
                ? ' • Channel: ' + chat.agency_channel_config.channel_name
                : ''}
            </sup>
            <div style={{ width: '100%' }}>
              <img src={msg_body} onClick={() => handleImageClick(msg_body)} />
            </div>
          </span>
        );
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
            {message_body}
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

    function handleVideoMsgBody(chat) {
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
      const msg_body = chat.msg_body;
      if (msg_body.includes('<div')) {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const url = msg_body.match(urlRegex)[0];
        let rest;
        let rest2;
        const updated_msg_body = msg_body.replace(url, '');
        const $ = cheerio.load(updated_msg_body);
        rest = $(`div[className="test-class"]`).prop('outerHTML');
        $(`div[className="test-class"]`).remove();
        const updatedContent = $('body').html().trim();
        rest2 = updatedContent;

        const message_body = (
          <span className="inbox-item-big-msg">
            <sup
              style={{
                textAlign: 'right',
                display: 'block',
                padding: '10px 0px 10px 10px',
                marginRight: '10px',
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? ' • WABA: ' + chat.sender_number
                : ''}
              {platform === constant.INBOX.TYPE.LINE
                ? ' • Channel: ' + chat.agency_channel_config.channel_name
                : ''}
            </sup>
            <div style={{ width: '100%' }}>
              <RenderSafeCaptionContent content={rest} type={'span_video_frompave'} />
              <video style={{ width: '100%', marginTop: '30px' }} controls src={url}></video>
              <RenderSafeCaptionContent content={rest2} type={'div_video_frompave'} />
            </div>
          </span>
        );

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
            {message_body}
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
      } else {
        const message_body = (
          <span className="inbox-item-big-msg w-chi">
            <sup
              style={{
                textAlign: 'right',
                display: 'block',
                padding: '10px 0px 10px 10px',
                marginRight: '10px',
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? ' • WABA: ' + chat.sender_number
                : ''}
              {platform === constant.INBOX.TYPE.LINE
                ? ' • Channel: ' + chat.agency_channel_config.channel_name
                : ''}
            </sup>
            <div style={{ width: '100%' }}>
              <img src={msg_body} onClick={() => handleImageClick(msg_body)} />
            </div>
          </span>
        );
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
            {message_body}
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

    function handleAudioMsgBody(chat) {
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
      const msg_body = chat.msg_body;
      if (msg_body.includes('<div')) {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const url = msg_body.match(urlRegex)[0];
        let rest;
        let rest2;
        const updated_msg_body = msg_body.replace(url, '');
        const $ = cheerio.load(updated_msg_body);
        rest = $(`div[className="test-class"]`).prop('outerHTML');
        $(`div[className="test-class"]`).remove();
        const updatedContent = $('body').html().trim();
        rest2 = updatedContent;

        const message_body = (
          <span className="inbox-item-big-msg">
            <sup
              style={{
                textAlign: "right",
                display: "block",
                padding: "10px 0px 10px 10px",
                marginRight: "10px",
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? " • WABA: " + chat.sender_number
                : ""}
              {platform === constant.INBOX.TYPE.LINE
                ? " • Channel: " + chat.agency_channel_config.channel_name
                : ""}
            </sup>
            <div style={{ width: "100%" }}>
              <RenderSafeCaptionContent content={rest} type={'span_audio_frompave'} />
              {/* <audio style={{ padding: "10px", height: "80px"}} controls src={url} /> */}
              <audio controls style={{ width: '100%', marginTop: '30px' }}>
                <source src={url} />
                Your browser does not support this audio.
              </audio>
              <RenderSafeCaptionContent content={rest2} type={'div_audio_frompave'} />
            </div>
          </span>
        );

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
            {message_body}
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
      } else {
        const message_body = (
          <span className="inbox-item-big-msg w-chi">
            <sup
              style={{
                textAlign: "right",
                display: "block",
                padding: "10px 0px 10px 10px",
                marginRight: "10px",
              }}
            >
              {h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0
                ? convertTimestampToDateFormat(chat.msg_timestamp)
                : msgDate}
              {platform === constant.INBOX.TYPE.WHATSAPP
                ? " • WABA: " + chat.sender_number
                : ""}
              {platform === constant.INBOX.TYPE.LINE
                ? " • Channel: " + chat.agency_channel_config.channel_name
                : ""}
            </sup>
            <audio
              controls
              style={{
                padding: "10px",
                height: "80px",
              }}
            >
              <source src={msg_body} />
              Your browser does not support this audio.
            </audio>
          </span>
        );
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
            {message_body}
            <span className="chat-msg-status">
              <FontAwesomeIcon
                icon={chatIcon.icon}
                color={chatIcon.text === 'read' ? '#00b0f5' : '#969696'}
                size="sm"
                className="mr-1"
              />
            </span>
          </>
        );
      }
    }

    function handleBookingAndFlowMsgBody (chat) {
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
      let msg_body = ''
      if (h.cmpStr(chat.msg_type, "booking_frompave")) {
        msg_body = "You sent a WhatsApp flow, but the version of WhatsApp Web doesn’t support it in the inbox"
      } else if(h.cmpStr(chat.msg_type, "flow")) {
        msg_body = "WhatsApp flow reply format can’t be shown in the inbox"
      }
      if(h.isEmpty(msg_body)) {
        return null
      }
      const message_body =
        `<sup style='text-align: right; display: block; padding: 10px 0px 10px 10px; margin-right: 10px;'>${h.notEmpty(chat.msg_timestamp) && chat.msg_timestamp !== 0 ? convertTimestampToDateFormat(chat.msg_timestamp) : msgDate} ${
          platform === constant.INBOX.TYPE.WHATSAPP
            ? ' • WABA: ' + chat.sender_number
            : ''
        }${
          platform === constant.INBOX.TYPE.LINE
            ? ' • Channel: ' + chat.agency_channel_config.channel_name
            : ''
        }</sup>` +
        `<span>${msg_body}</span>` +
        `</div>`;

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
              className={`inbox-item-big-msg`}
              dangerouslySetInnerHTML={{
                __html: h.template.formatMsg(message_body),
              }}
            ></span>
            <span className="chat-msg-status">
              <FontAwesomeIcon
                icon={chatIcon.icon}
                color={chatIcon.text === 'read' ? '#00b0f5' : '#969696'}
                size="sm"
                className="mr-1"
              />
            </span>
          </>
        );
    }

    function convertLinksToAnchorTags(text) {
      // Regular expression pattern to match URLs
      const urlRegex =
        /((https?:\/\/|www\.)[^\s<]+[^<.,:;"')\]\s](?!\.(jpeg|jpg|gif|png|svg|webp)))/gi;

      // Replace URLs with anchor tags
      const replacedText = text.replace(urlRegex, (url) => {
        // Check if the URL is wrapped in an img tag
        const isImageWrapped = new RegExp(
          /<img[^>]*src=['"](https?:\/\/[^'"]+)['"][^>]*>/,
          'i',
        ).test(text);

        const isVideoWrapped = new RegExp(
          /<video[^>]*src=['"](https?:\/\/[^'"]+)['"][^>]*>/,
          'i',
        ).test(text);

        // Wrap non-image links with anchor tags
        if (!isImageWrapped && !isVideoWrapped) {
          return (
            '<a href="' +
            url +
            '" target="_blank" title="' +
            url +
            '">' +
            shortenUrl(url) +
            '</a>'
          );
        } else {
          return url; // Return image links as is
        }
      });

      return replacedText;
    }

    function getMediaMsgBody(msg) {
      const media = medias.filter((f) => f.id === msg.whatsapp_chat_id);
      const msgDate = h.date.convertUTCDateToLocalDate(
        msg.created_date + ' GMT',
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
      if (media.length > 0) {
        const doc_data = msg.msg_body.split('|');
        const msg_content = msg.msg_body;
        const parser = new DOMParser();
        const doc = parser.parseFromString(msg_content, 'text/html');
        const element = doc.querySelector('span.text_attachment');
        switch (msg.msg_type) {
          case 'document':
            if (element) {
              const content = element.textContent;
              return (
                <span className="inbox-item-big-msg">
                  <div className="inbox-item-user d-flex flex-row justify-content-between">
                    <div className="inbox-item-name">
                      <a href={media[0].value}>{doc_data[1]}</a>
                    </div>
                  </div>
                  <sup className="inbox-item-sm-msg">{doc_data[2]}</sup>
                  <div style={{ width: '100%' }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: content,
                      }}
                    ></span>
                  </div>
                </span>
              );
            } else {
              return (
                <span className="inbox-item-big-msg">
                  <div className="inbox-item-user d-flex flex-row justify-content-between">
                    <div className="inbox-item-name">
                      <a href={media[0].value}>{doc_data[1]}</a>
                    </div>
                  </div>
                  <sup className="inbox-item-sm-msg">{doc_data[2]}</sup>
                </span>
              );
            }
          case 'file':
            if (element) {
              const content = element.textContent;
              return (
                <span className="inbox-item-big-msg">
                  <div className="inbox-item-user d-flex flex-row justify-content-between">
                    <div className="inbox-item-name">
                      <a href={media[0].value}>{doc_data[1]}</a>
                    </div>
                  </div>
                  <sup className="inbox-item-sm-msg">{doc_data[2]}</sup>
                  <div style={{ width: '100%' }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: content,
                      }}
                    ></span>
                  </div>
                </span>
              );
            } else {
              return (
                <span className="inbox-item-big-msg">
                  <div className="inbox-item-user d-flex flex-row justify-content-between">
                    <div className="inbox-item-name">
                      <a href={media[0].value}>{doc_data[1]}</a>
                    </div>
                  </div>
                  <sup className="inbox-item-sm-msg">{doc_data[2]}</sup>
                </span>
              );
            }
          case 'image':
            if (element) {
              const content = element.textContent;
              return (
                <span className="inbox-item-big-msg w-chi">
                  <span className="inbox-item-big-msg media-content">
                    <img
                      src={media[0].value}
                      height="300px"
                      onClick={() => {
                        setShowModal(true);
                        setPreviewImageSrc(media[0].value);
                      }}
                    />
                  </span>
                  <div style={{ width: '100%', padding: '10px 10px 0px 0px' }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: content,
                      }}
                    ></span>
                  </div>
                </span>
              );
            } else {
              return (
                <span className="inbox-item-big-msg media-content">
                  <div
                    style={{ width: '100%', padding: '10px 10px 10px 10px' }}
                  >
                    <img
                      src={media[0].value}
                      width="300px"
                      onClick={() => {
                        setShowModal(true);
                        setPreviewImageSrc(media[0].value);
                      }}
                    />
                  </div>
                </span>
              );
            }
          case 'audio':
            return (
              <span className="inbox-item-big-msg media-content">
                <audio controls src={media[0].value}></audio>
              </span>
            );
          case 'video':
            if (element) {
              const content = element.textContent;
              return (
                <span className="inbox-item-big-msg media-content">
                  <video
                    style={{ width: '100%', padding: '10px 10px 10px 10px' }}
                    controls
                    src={media[0].value}
                  ></video>
                  <div style={{ width: '100%', padding: '0px 0px 10px 10px' }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: content,
                      }}
                    ></span>
                  </div>
                </span>
              );
            } else {
              return (
                <span className="inbox-item-big-msg media-content">
                  <video controls src={media[0].value}></video>
                </span>
              );
            }
          default:
            return (
              <span className="inbox-item-big-msg">Unsupported media</span>
            );
        }
      } else {
        if (!h.isEmpty(msg.media_url)) {
          switch (msg.msg_type) {
            case 'document':
              return (
                <span className="inbox-item-big-msg">
                  <sup
                    style={{
                      textAlign: 'right',
                      display: 'block',
                      padding: '10px 0px 10px 10px',
                    }}
                  >
                    {h.notEmpty(msg.msg_timestamp)
                      ? convertTimestampToDateFormat(msg.msg_timestamp)
                      : msgDate}
                    {platform === constant.INBOX.TYPE.WHATSAPP
                      ? ' • WABA: ' + msg.sender_number
                      : ''}
                    {platform === constant.INBOX.TYPE.LINE
                      ? ' • Channel: ' + msg.agency_channel_config.channel_name
                      : ''}
                  </sup>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getReplyBody(msg),
                    }}
                    className="media-reply"
                  ></div>
                  <div className="inbox-item-user d-flex flex-row justify-content-between">
                    <div className="inbox-item-name">
                      <a href={msg.media_url}>{msg.file_name}</a>
                    </div>
                  </div>
                  <sup className="inbox-item-sm-msg">{msg.content_type}</sup>
                  <div
                    style={{
                      width: '100%',
                      display: !h.isEmpty(msg.caption) ? 'block' : 'none',
                    }}
                  >
                    <RenderSafeCaptionContent content={msg.caption} type={'document'} />
                  </div>
                </span>
              );
            case 'file':
              return (
                <span className="inbox-item-big-msg">
                  <sup
                    style={{
                      textAlign: 'right',
                      display: 'block',
                      padding: '10px 0px 10px 10px',
                    }}
                  >
                    {h.notEmpty(msg.msg_timestamp)
                      ? convertTimestampToDateFormat(msg.msg_timestamp)
                      : msgDate}
                    {platform === constant.INBOX.TYPE.WHATSAPP
                      ? ' • WABA: ' + msg.sender_number
                      : ''}
                    {platform === constant.INBOX.TYPE.LINE
                      ? ' • Channel: ' + msg.agency_channel_config.channel_name
                      : ''}
                  </sup>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getReplyBody(msg),
                    }}
                    className="media-reply"
                  ></div>
                  <div className="inbox-item-user d-flex flex-row justify-content-between">
                    <div className="inbox-item-name">
                      <a href={msg.media_url}>{msg.file_name}</a>
                    </div>
                  </div>
                  <sup className="inbox-item-sm-msg">{msg.content_type}</sup>
                  <div
                    style={{
                      width: '100%',
                      display: !h.isEmpty(msg.caption) ? 'block' : 'none',
                    }}
                  >
                    <RenderSafeCaptionContent content={msg.caption} type={'file'} />
                  </div>
                </span>
              );
            case 'image':
              return (
                <span className="inbox-item-big-msg">
                  <sup
                    style={{
                      textAlign: 'right',
                      display: 'block',
                      padding: '10px 0px 10px 10px',
                    }}
                  >
                    {h.notEmpty(msg.msg_timestamp)
                      ? convertTimestampToDateFormat(msg.msg_timestamp)
                      : msgDate}
                    {platform === constant.INBOX.TYPE.WHATSAPP
                      ? ' • WABA: ' + msg.sender_number
                      : ''}
                    {platform === constant.INBOX.TYPE.LINE
                      ? ' • Channel: ' + msg.agency_channel_config.channel_name
                      : ''}
                  </sup>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getReplyBody(msg),
                    }}
                    className="media-reply"
                  ></div>
                  <span className="inbox-item-big-msg media-content">
                    <img
                      src={msg.media_url}
                      width="300px"
                      onClick={() => {
                        setShowModal(true);
                        setPreviewImageSrc(msg.media_url);
                      }}
                    />
                  </span>
                  <div
                    style={{
                      width: '100%',
                      padding: '10px 10px 0px 0px',
                      display: !h.isEmpty(msg.caption) ? 'block' : 'none',
                    }}
                  >
                    <RenderSafeCaptionContent content={msg.caption} type={'image'} />
                  </div>
                </span>
              );
            case 'video':
              return (
                <span className="inbox-item-big-msg media-content">
                  <sup
                    style={{
                      textAlign: 'right',
                      display: 'block',
                      padding: '20px 0px 0px 10px',
                      marginRight: '10px',
                    }}
                  >
                    {h.notEmpty(msg.msg_timestamp)
                      ? convertTimestampToDateFormat(msg.msg_timestamp)
                      : msgDate}
                    {platform === constant.INBOX.TYPE.WHATSAPP
                      ? ' • WABA: ' + msg.sender_number
                      : ''}
                    {platform === constant.INBOX.TYPE.LINE
                      ? ' • Channel: ' + msg.agency_channel_config.channel_name
                      : ''}
                  </sup>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getReplyBody(msg),
                    }}
                    className="media-reply"
                  ></div>
                  <video
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 10px',
                      borderRadius: '20px',
                    }}
                    controls
                    src={msg.media_url}
                  ></video>
                  <div
                    style={{
                      width: '100%',
                      padding: '0px 0px 10px 10px',
                      display: !h.isEmpty(msg.caption) ? 'block' : 'none',
                    }}
                  >
                    <RenderSafeCaptionContent content={msg.caption} type={'video'} />
                  </div>
                </span>
              );
            case "audio_file":
            case "audio":
              return (
                <span className="inbox-item-big-msg media-content">
                  <sup
                    style={{
                      textAlign: "right",
                      display: "block",
                      padding: "20px 0px 0px 10px",
                      marginRight: "10px",
                    }}
                  >
                    {h.notEmpty(msg.msg_timestamp)
                      ? convertTimestampToDateFormat(msg.msg_timestamp)
                      : msgDate}
                    {platform === constant.INBOX.TYPE.WHATSAPP
                      ? " • WABA: " + msg.sender_number
                      : ""}
                    {platform === constant.INBOX.TYPE.LINE
                      ? " • Channel: " + msg.agency_channel_config.channel_name
                      : ""}
                  </sup>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getReplyBody(msg),
                    }}
                    className="media-reply"
                  ></div>
                  <audio
                    controls
                    style={{
                      padding: "10px",
                      height: "80px",
                    }}
                  >
                    <source src={msg.media_url} />
                    Your browser does not support this audio.
                  </audio>
                  <div
                    style={{
                      width: '100%',
                      padding: '0px 0px 10px 10px',
                      display: !h.isEmpty(msg.caption) ? 'block' : 'none',
                    }}
                  >
                    <RenderSafeCaptionContent content={msg.caption} type={'audio'} />
                  </div>
                </span>
              );
          }
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

    function removeAttachmentFile(index) {
      const attachments = [...attachmentFiles];

      attachments.splice(index, 1);

      setAttachmentFiles(attachments);
    }
    async function handleOnChangeFile(e) {
      let uploadMediaType = mediaType;
      const files = e.target.files;
      let fileSizeExceeded = false;
      // if uploadMediaType is empty when there is an uploaded file, its a copy paste file
      if (h.isEmpty(uploadMediaType)) {
        uploadMediaType = 'image';
      }
      setFileUploadStatus(constant.API_STATUS.PENDING);

      // Check for file size
      for (const file of files) {
        if (file.size > fileSizeLimit[uploadMediaType].limit) {
          fileSizeExceeded = true;
          break;
        }
      }

      if (fileSizeExceeded) {
        h.general.alert('error', {
          message: `The limit for each ${uploadMediaType} file is up to ${fileSizeLimit[uploadMediaType].label}.`,
          autoCloseInSecs: 2,
        });
        setFileUploadStatus(constant.API_STATUS.FULLFILLED);
        return;
      }

      setLoading(true);
      let uploadFiles = [...files];
      let newlyUploadFiles = [];
      if (h.notEmpty(uploadFiles)) {
        for (let i = 0; i < uploadFiles.length; i++) {
          const targetFile = uploadFiles[i];
          const formData = new FormData();
          formData.append('file', targetFile);
          const uploadResponse = await api.upload.upload(
            formData,
            constant.UPLOAD.TYPE.MESSAGE_MEDIA,
            false,
          );
          if (h.cmpStr(uploadResponse.status, 'ok')) {
            newlyUploadFiles.push({
              full_file_url: uploadResponse.data.file.full_file_url,
              file_url: uploadResponse.data.file.file_url,
              file_name: uploadResponse.data.file.file_name,
              file_thumbnail: uploadResponse.data.file.file_thumbnail,
            });
          }
        }
      }
      setAttachmentFiles([...attachmentFiles, ...newlyUploadFiles]);
      fileRef.current.value = null;
      setMediaType('');
      setLoading(false);
      setFileUploadStatus(constant.API_STATUS.FULLFILLED);
    }

    // Light Gallery
    const onInit = useCallback((detail) => {
      if (detail && detail.instance) {
        lightGallery.current = detail.instance;
        lightGallery.current.openGallery();
      }
    }, []);

    function removeTrailingWhitespaceAndLineBreaks(str) {
      return str.replace(/[ \t\n]+$/, '');
    }

    function shortenUrl(url) {
      try {
        const urlObject = new URL(url);
        const baseUrl = urlObject.origin;
        const hash = urlObject.hash;
        const shortenedUrl = baseUrl + '/[...]' + hash;

        return shortenedUrl;
      } catch (e) {
        return url;
      }
    }

    function handleLinkedMessageComponent(msg) {
      switch (msg.reply_to_msg_type) {
        case 'document':
          return (
            <span className="inbox-item-big-msg">
              <div className="inbox-item-user d-flex flex-row justify-content-between">
                <div className="inbox-item-name">
                  <a href={msg.media_url}>{msg.file_name}</a>
                </div>
              </div>
              <sup className="inbox-item-sm-msg">{msg.content_type}</sup>
              <div
                style={{
                  width: '100%',
                  display: !h.isEmpty(msg.caption) ? 'block' : 'none',
                }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: `<span class="text_attachment">${msg.caption}</span>`,
                  }}
                ></span>
              </div>
            </span>
          );
        case 'image':
          return `
            <span id=${msg.reply_to_event_id}>
              <img
                src=${msg.reply_to_content}
                height="100px"
                style="filter: grayscale(1)"
              />
            </span>
        `;
        case 'video':
          return (
            <span className="inbox-item-big-msg media-content">
              <video
                style={{ width: '100%', padding: '10px 10px 10px 10px' }}
                controls
                src={msg.media_url}
              ></video>
              <div
                style={{
                  width: '100%',
                  padding: '0px 0px 10px 10px',
                  display: !h.isEmpty(msg.caption) ? 'block' : 'none',
                }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: `<span class="text_attachment">${msg.caption}</span>`,
                  }}
                ></span>
              </div>
            </span>
          );
      }
    }

    async function handleSendTemplateMessage(template, quickReplyResponses) {
      setTemplateSending(constant.API_STATUS.PENDING);
      const sendMsgRes = await api.whatsapp.sendTemplateReplyMessage(
        {
          agency_id: agencyId,
          mobile_number: contact?.mobile_number,
          message_parts: template,
          contact_id: contact?.contact_id,
          tracker_ref_name: trackerName,
          quick_reply_responses: quickReplyResponses,
        },
        false,
      );
      setOpenSelectTemplate(false);
      setTemplateSending(constant.API_STATUS.FULLFILLED);
    }

    async function handleSendLineTemplateMessage(template) {
      setTemplateSending(constant.API_STATUS.PENDING);
      const sendMsgRes = await api.line.sendTemplateReplyMessage(
        {
          agency_id: agencyId,
          contact_line_id: contact?.line_user_id,
          agency_channel_config_id: template[0].line_channel,
          template_type: template[0].template_type,
          message: template[0].content,
          contact_id: contact?.contact_id,
          tracker_ref_name: trackerName,
        },
        false,
      );
      setOpenSelectLineTemplate(false);
      setTemplateSending(constant.API_STATUS.FULLFILLED);
    }

    function isSenderChat(msg) {
      if (platform === constant.INBOX.TYPE.LIVECHAT) {
        return msg.sender_number === contact?.contact_id;
      }

      if (platform === constant.INBOX.TYPE.LINE) {
        return !msg?.msg_type?.includes('frompave');
      }

      if (platform === constant.INBOX.TYPE.MESSENGER) {
        return !msg?.msg_type?.includes('frompave');
      }

      if (platform === constant.INBOX.TYPE.WHATSAPP) {
        return !msg?.msg_type?.includes('frompave');
      }
      // return msg?.receiver_url?.includes('name=');
    }

    /**
     * Description
     * Process safely rendering of text message
     * @function
     * @name RenderSafeTextContent
     * @param {{ content: string hasElements: boolean }}
     * @returns {React.JSX.Element}
     */
    const RenderSafeTextContent = ({ content, replyBody, hasElements }) => {
      return (
        <span
          className={`inbox-item-big-msg ${hasElements ? 'w-chi' : ''}`}
          dangerouslySetInnerHTML={{
                __html: content,
              }}
        ></span>
      );
    };

    /**
     * Description
     * Process safely rendering of caption
     * @function
     * @name RenderSafeCaptionContent
     * @param {{ content: string type: string }}
     * @returns {React.JSX.Element}
     */
    const RenderSafeCaptionContent = ({ content, type }) => {
      // Process the content to get unescaped values while preserving escaped tags
      const processedContent = content ? removeTrailingWhitespaceAndLineBreaks(content) : content;
    
      return (
        <>
        {['div_image_frompave', 'div_video_frompave', 'div_audio_frompave'].includes(type) && (
          <div className="div" dangerouslySetInnerHTML={{
            __html: processedContent,
          }}></div>
        )}
        {h.cmpStr(type, 'div_file_frompave') && (
          <div style={{marginTop: '40px'}} dangerouslySetInnerHTML={{
            __html: processedContent,
          }}></div>
        )}
        {['span_image_frompave', 'span_file_frompave', 'span_video_frompave', 'span_audio_frompave'].includes(type) && (
          <span class="span" dangerouslySetInnerHTML={{
            __html: processedContent,
          }}></span>
        )}
        {['image', 'video', 'file', 'document', 'audio', 'audio_file'].includes(type) && (
          <span dangerouslySetInnerHTML={{
            __html: processedContent,
          }}></span>
        )}
        </>

      );
    };

    return (
      <div className="inbox-body animate-fadeIn">
        {openSelectTemplate && (
          <SelectTemplate
            agencyId={agencyId}
            handleCloseModal={() => {
              setOpenSelectTemplate(false);
            }}
            sendMessage={(template, quickReplyValues) => {
              handleSendTemplateMessage(template, quickReplyValues, toReplyMsg);
            }}
            singleTemplate={true}
            sending={templateSending}
            toReplyMsg={toReplyMsg}
            templateSending={templateSending}
          />
        )}

        {openSelectLineTemplate && (
          <SelectLineTemplate
            agencyId={agencyId}
            contact={contact}
            handleCloseModal={() => {
              setOpenSelectLineTemplate(false);
            }}
            sendMessage={(template) => {
              handleSendLineTemplateMessage(template, toReplyMsg);
            }}
            singleTemplate={true}
            sending={templateSending}
            toReplyMsg={toReplyMsg}
            templateSending={templateSending}
            lineChannels={lineChannels}
            lineLastChannelUsed={lineLastChannelUsed}
            selectedLineChannel={selectedLineChannel}
            changeLineSelectedChannel={changeLineSelectedChannel}
          />
        )}
        {contact &&
            <MessageThreadHeader
              contact={contact}
            />
        }
        <div
          className="inbox-body-convo"
          style={{
            height:
              attachmentFiles.length > 0 || h.notEmpty(toReplyMsg)
                ? 'calc(100% - 194px)'
                : null,
          }}
          ref={convoRef}
          onScroll={handleScroll}
        >
          {previewImageSrc && (
            <LightGallery
              plugins={[lgZoom, lgVideo]}
              autoplay
              mode="lg-fade"
              dynamic
              dynamicEl={[{ src: previewImageSrc }]}
              onBeforeClose={() => {
                setPreviewImageSrc(null);
              }}
              addClass="property-carousel"
              onInit={onInit}
            ></LightGallery>
          )}

          {thread.length > 0 &&
            thread

              // remove start_session and end_session
              .filter(
                (f) =>
                  ![
                    'start_session',
                    'end_session',
                    'follow',
                    'unfollow',
                  ].includes(f.msg_type),
              )
              .map((msg, i) => (
                <div
                  className={
                    `inbox-item d-flex flex-row ` +
                    (isSenderChat(msg) ? '' : 'me')
                  }
                  key={i}
                  ref={i === thread.length - 1 ? msgBody : null}
                >
                  <div
                    className="inbox-item-body d-flex flex-column"
                    id={
                      !h.isEmpty(msg.quote_token)
                        ? msg.msg_id
                        : msg.original_event_id
                    }
                  >
                    <div className="inbox-item-user d-flex flex-row justify-content-between">
                      <div className="inbox-item-name">
                        {`${contact?.first_name} ${contact?.last_name ?? ''}`}{' '}
                      </div>
                      <div className="inbox-item-time">
                        {msg?.updated_date_time_ago}
                      </div>
                    </div>
                    {msg.msg_body && (
                      <div
                        className="d-flex justify-content-start thread-order"
                        style={{ position: 'relative' }}
                      >
                        {['frompave', 'text', 'button', 'interactive'].includes(
                          msg.msg_type,
                        ) && <>{handleMsgBody(msg)}</>}
                        {['img_frompave'].includes(msg.msg_type) && (
                          <>{handleImgMsgBody(msg)}</>
                        )}
                        {['file_frompave'].includes(msg.msg_type) && (
                          <>{handleFileMsgBody(msg)}</>
                        )}
                        {['video_frompave'].includes(msg.msg_type) && (
                          <>{handleVideoMsgBody(msg)}</>
                        )}
                        {['audio_frompave'].includes(msg.msg_type) && (
                          <>{handleAudioMsgBody(msg)}</>
                        )}
                        {['booking_frompave', 'flow'].includes(msg.msg_type) && (
                          handleBookingAndFlowMsgBody(msg)
                        )}
                        {[
                          'document',
                          'image',
                          'audio', // voice message
                          'audio_file', 
                          'video',
                          'file',
                        ].includes(msg.msg_type) && (
                          <> {getMediaMsgBody(msg)} </>
                        )}

                        {![
                          'video',
                          'button',
                          'audio', // voice message
                          'audio_file',
                          'image',
                          'document',
                          'file',
                          'frompave',
                          'img_frompave',
                          'file_frompave',
                          'video_frompave',
                          'audio_frompave',
                          'text',
                          'interactive',
                          'start_session',
                          'end_session',
                          'follow',
                          'unfollow',
                          'booking_frompave',
                          'flow'
                        ].includes(msg.msg_type) && (
                          <span className="inbox-item-big-msg">
                            Unsupported media
                          </span>
                        )}
                        {[
                          constant.INBOX.TYPE.WHATSAPP,
                          constant.INBOX.TYPE.LINE,
                          constant.INBOX.TYPE.MESSENGER,
                        ].includes(platform) &&
                          !disableSending && (
                            <span className="center-body">
                              <CommonTooltip
                                tooltipText={
                                  platform === constant.INBOX.TYPE.LINE &&
                                  h.notEmpty(attachmentFiles)
                                    ? `Replying with image or video on a message is not supported by Line`
                                    : `Reply`
                                }
                              >
                                <button
                                  type="type"
                                  className="msg-reply-btn"
                                  disabled={
                                    platform === constant.INBOX.TYPE.LINE &&
                                    h.notEmpty(attachmentFiles)
                                  }
                                  onClick={() => {
                                    setToReplyMsg(msg);
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faReply}
                                    color="#182327"
                                  />
                                </button>
                              </CommonTooltip>
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                  {handleScrollOnLoad(thread, i)}
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
          {disableSendingStatus === constant.API_STATUS.FULLFILLED &&
            showReply && (
              <>
                {!disableSending ? (
                  <>
                    <div className="send-msg-txtarea" style={{ width: '100%' }}>
                      <MessageInput
                        sendMessage={(m) => {
                          sendMessage(m, attachmentFiles, toReplyMsg);
                        }}
                        toReplyMsg={toReplyMsg}
                        sending={sending}
                        successSend={successSend}
                        failedSend={failedSend}
                        attachmentFiles={attachmentFiles}
                        msgTextAreaRef={msgTextAreaRef}
                        fileRef={fileRef}
                        handleOnChangeFile={handleOnChangeFile}
                        removeAttachmentFile={removeAttachmentFile}
                        openSendTemplate={setOpenSelectTemplate}
                        openSendLineTemplate={setOpenSelectLineTemplate}
                        contact={contact}
                        clearReplyMsg={() => {
                          setToReplyMsg(null);
                        }}
                        medias={medias}
                        setTemplateSending={setTemplateSending}
                        fileUploadStatus={fileUploadStatus}
                        platform={platform}
                        lineChannels={lineChannels}
                        lineLastChannelUsed={lineLastChannelUsed}
                        changeLineSelectedChannel={changeLineSelectedChannel}
                        setMediaType={setMediaType}
                      />
                    </div>
                  </>
                ) : (
                  <div
                    className="send-msg-body"
                    style={{
                      padding: '0px 16px',
                      paddingTop: '10px',
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
                      {h.cmpBool(isSenderDisabled, true) ? (
                        <span>
                          SENDING MESSAGE DISABLED. THE LAST WABA NUMBER USED IN THIS THREAD IS NO LONGER ACTIVE.
                        </span>
                      ) : !h.cmpStr(contact?.status, 'inactive') ? (
                        <span>
                          SENDING MESSAGE DISABLED. NO RESPONSE FROM CONTACT FOR
                          MORE THAN 24 HOURS.
                        </span>
                      ): (
                        <span>
                          SENDING MESSAGE TO AN INACTIVE CONTACT IS NOT ALLOWED.
                        </span>
                      )}
                      <br />
                      {h.cmpStr(platform, 'whatsapp') && h.cmpBool(isSenderDisabled, false) && !h.cmpStr(contact?.status, 'inactive') && (
                        <div style={{marginTop: '10px'}}>
                          <CommonIconButton
                            className="modern-button common"
                            style={{ width: 250, height: 36 }}
                            onClick={() => {
                              setOpenSelectTemplate(true);
                            }}
                          >
                            Re-open chat with template
                          </CommonIconButton>
                        </div>
                      )}
                      {h.cmpStr(platform, 'whatsapp') && h.cmpBool(isSenderDisabled, true) && (
                        <div style={{marginTop: '10px'}}>
                          <CommonIconButton
                            className="modern-button common"
                            style={{ width: 300, height: 36 }}
                            onClick={() => {
                              setOpenSendTemplate(true);
                            }}
                          >
                            Re-open chat using other WABA Number
                          </CommonIconButton>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    );
  },
);
