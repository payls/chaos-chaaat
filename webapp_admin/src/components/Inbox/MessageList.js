import React from 'react';
import moment from 'moment';
import constant from '../../constants/constant.json';
import { h } from '../../helpers';
const cheerio = require('cheerio');

import IconWhatsApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconLineApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconLineApp';
import IconSMS from '../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconWeb from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWeb';
import IconMessenger from '../../components/ProposalTemplate/Link/preview/components/Icons/IconMessenger';
import IconWeChatApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWeChatApp';
import { faQuestionCircle, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';

export default React.memo(
  ({
    contact,
    msg,
    messages,
    setMessages,
    clickAction,
    index,
    alwaysReadStatus = false,
    platform,
  }) => {
    const handleFormatDate = (stringDate) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // const now = moment();
      // const inputDate = moment(stringDate);
      // const diffInHours = now.diff(inputDate, 'hours');

      // let formattedDateTime;
      // if (diffInHours < 24) {
      //   formattedDateTime = inputDate.format('HH:mm');
      // } else {
      //   formattedDateTime = inputDate.format('DD MMM');
      // }

      // return formattedDateTime;
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-AU', {
        timeZone: timeZone,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      const localNow = formatter.format(now);

      const msgDate = h.date.convertUTCDateToLocalDate(
        stringDate + ' GMT',
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

      const date1 = new Date(localNow);
      const date2 = new Date(msgDate);

      const timeDifference = date1 - date2;
      let hoursDifference = timeDifference / (1000 * 60 * 60);
      hoursDifference = Math.round(hoursDifference);

      let formattedTime;
      if (hoursDifference < 24) {
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        formattedTime = date2.toLocaleTimeString('en-AU', options);
      } else {
        formattedTime = date2.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
        });
      }

      return formattedTime;
    };

    function checkForAttachmentMessage(str, msgType) {
      const $ = cheerio.load(str);
      $(`div[className="test-class"]`).remove();
      
      const updatedStr = $.html();

      if (updatedStr.match(/<img.*?>/) || updatedStr.match(/<video.*?>.*?<\/video>/)) {
        return 'Attachment';
      } else if (h.cmpStr(msgType, "booking_frompave")){
        return "You sent a WhatsApp flow, but the version of WhatsApp Web doesn’t support it in the inbox"
      } else if (h.cmpStr(msgType, "flow")){
        return "WhatsApp flow reply format can’t be shown in the inbox"
      }
      else {
        //if (cssPropertiesRegex.test(str)) {
        const container = document.createElement('div');
        container.innerHTML = updatedStr;
        const extractedText = extractTextFromNodes(container);
        return extractedText;
        //} else {
        // return str ?? ' ';
        //}
      }
    }

    function extractTextFromNodes(node) {
      let text = '';
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent.trim();
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName !== 'BUTTON') {
          for (const childNode of node.childNodes) {
            text += extractTextFromNodes(childNode);
          }
        }
      }
      return text;
    }

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

    const readStatus = (read) => {
      if (alwaysReadStatus) return true;

      return read;
    };

    const RenderSafeContent = ({ content }) => {
      // Unescape the content
      // const unescapedContent = he.unescape(content);
    
      // Function to escape any dynamic HTML tags, treating them as text
      const ignoreEscapedTags = (str) => {
        // This regular expression matches any HTML tags
        return str.replace(/&lt;(\/?[\w\s="'-]+)&gt;/gi, (match) => {
          // Keep them as they are (do not unescape them)
          return match;
        });
      };
    
      // Ignore any dynamic HTML tags
      const ignoredContent = ignoreEscapedTags(content);
      const textContent = ignoredContent
      ? checkForAttachmentMessage(ignoredContent)
      : '';
      return (
        <div
            className="inbox-item-sm-msg"
            // dangerouslySetInnerHTML={{
            //   __html: ignoredContent
            //     ? checkForAttachmentMessage(ignoredContent)
            //     : '',
            // }}
          >{textContent}</div>
      );
    };

    return (
      <div
        key={index}
        className={`message-item-list-item  d-flex flex-row animate-fadeIn ${
          contact?.contact_id === msg?.contact?.contact_id &&
          platform === msg.msg_platform
            ? 'active'
            : ''
        } ${!readStatus(msg?.agency_user_read) ? 'unread' : ''}`}
        style={{ gap: '0.5em' }}
        onClick={() => {
          const cloneMsgs = [...messages];
          cloneMsgs[index].agency_user_read = true;
          setMessages(cloneMsgs);

          clickAction(msg);
        }}
      >
        <div className="d-flex justify-content-center" style={{ flex: '10%' }}>
          {msg.msg_platform === constant.INBOX.TYPE.WHATSAPP && (
            <span className="inbox-avatar wa center-body">
              <IconWhatsApp width="18" color={'#fff'} />
            </span>
          )}
          {msg.msg_platform === constant.INBOX.TYPE.LINE && (
            <span className="inbox-avatar line">
              <IconLineApp width="25" color={'#fff'} />
            </span>
          )}

          {msg.msg_platform === constant.INBOX.TYPE.SMS && (
            <span className="inbox-avatar line">
              <IconSMS width="25" color={'#fff'} />
            </span>
          )}
          {msg.msg_platform === constant.INBOX.TYPE.WECHAT && (
            <span className="inbox-avatar line">
              <IconWeChatApp width="18" color={'#fff'} />
            </span>
          )}
          {msg.msg_platform === constant.INBOX.TYPE.LIVECHAT && (
            <span className="inbox-avatar livechat center-body">
              <IconWeb width="25" color={'#fff'} />
            </span>
          )}
          {msg.msg_platform === constant.INBOX.TYPE.MESSENGER && (
            <span className="inbox-avatar messenger center-body">
              <IconMessenger width="25" color={'#fff'} />
            </span>
          )}
          {![
            constant.INBOX.TYPE.WHATSAPP,
            constant.INBOX.TYPE.LINE,
            constant.INBOX.TYPE.WECHAT,
            constant.INBOX.TYPE.SMS,
            constant.INBOX.TYPE.LIVECHAT,
            constant.INBOX.TYPE.MESSENGER,
          ].includes(msg.msg_platform) && (
            <span className="inbox-avatar name">
              {getFirstInitials(
                msg?.contact?.first_name,
                msg?.contact?.last_name,
              )}
            </span>
          )}
        </div>
        <div style={{ width: 'calc(100% - 35px)' }}>
          <div className="inbox-item-user d-flex flex-row justify-content-between">
            <div className="inbox-item-name">
              {`${msg?.contact?.first_name ?? ''} ${
                msg?.contact?.last_name ?? ''
              }`}
            </div>
            <div className="inbox-item-time">
              {/* {msg?.updated_date_time_ago.replace('ago', '')} */}
              {handleFormatDate(msg?.last_msg_date)}
            </div>
          </div>

          <RenderSafeContent content={msg?.msg_body} />
        </div>
      </div>
    );
  },
);
