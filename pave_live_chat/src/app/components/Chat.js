'use client';
import { API, graphqlOperation, Hub } from 'aws-amplify';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import IconSend from './Icons/IconSend';
import IconCheck from './Icons/IconCheck';
import IconX from './Icons/IconX';
import IconChevronLeft from './Icons/IconChevronLeft';
import IconClock from './Icons/IconClock';

import h from '../services/helpers';
import api from '../services/api';
import { onCreateNotificationMessage } from '../appsync/subscriptions';

const API_STATUS = {
  idle: 'idle',
  pending: 'pending',
  fulfilled: 'fulfilled',
  failed: 'failed',
};

export default function Chat({ session_id, back, contact, style }) {
  const msgTextAreaRef = useRef(null);
  const convoBody = useRef(null);
  const [msgReply, setMsgReply] = useState('');
  const [sending, setSending] = useState(API_STATUS.idle);
  const [setting, seSetting] = useState(null);
  const [thread, setThread] = useState([]);

  const resizeTextArea = () => {
    if (msgTextAreaRef.current) {
      msgTextAreaRef.current.style.height = 'auto';
      msgTextAreaRef.current.style.height =
        msgTextAreaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(resizeTextArea, [msgReply]);

  useEffect(() => {
    (async () => {
      const liveChatSettingRes = await api.getSettings(contact.agency_fk);
      if (h.cmpStr(liveChatSettingRes.status, 'ok')) {
        seSetting(liveChatSettingRes.data.liveChatSettings);
      }

      const liveChatRes = await api.getChat({
        contact_id: contact.contact_id,
        session_id,
      });
      if (h.cmpStr(liveChatRes.status, 'ok')) {
        setThread(
          liveChatRes.data.live_chats.sort(
            (a, b) => a.msg_timestamp - b.msg_timestamp,
          ),
        );
      }
    })();
  }, [contact]);

  useEffect(() => {
    setTimeout(() => convoBody.current?.scrollIntoView(), 1);
  }, [thread]);

  useEffect(() => {
    if (contact && setting) {
      const threadSubscription = API.graphql(
        graphqlOperation(onCreateNotificationMessage, {
          agencyId: contact.agency_fk,
        }),
      ).subscribe({
        next: ({ provider, value }) => {
          const data = JSON.parse(value.data.onCreateNotificationMessage.data);
          if (contact.contact_id === data.contact_fk) {
            setThread((t) => [...t, data]);
            setTimeout(() => convoBody.current?.scrollIntoView(), 1000);
          }
        },
        error: (error) => console.warn(error),
      });

      return () => {
        threadSubscription.unsubscribe(); // Stop receiving data updates from the current thread
      };
    }
  }, [contact, setting]);

  async function sendMessage() {
    setSending(API_STATUS.pending);

    const sendRes = await api.send({
      session_id,
      data: {
        content: msgReply,
        msg_type: 'text',
      },
    });

    if (h.cmpStr(sendRes.status, 'ok')) {
      setSending(API_STATUS.fulfilled);
      setMsgReply('');
    } else {
      setSending(API_STATUS.failed);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    msgTextAreaRef.current.focus();

    setSending(API_STATUS.idle);
  }

  function isMsgOrientation(chat) {
    if (chat.msg_type === 'start_session') {
      return 'start_session';
    }

    return chat.sender_number === contact.contact_id ? 'me' : '';
  }

  return (
    <div className="pave-conversation flex flex-col">
      <div
        className="pave-conversation-header flex flex-row gap-3"
        style={{ backgroundColor: style.chatHeaderColor }}
      >
        <button
          className="pave-conversation-header-btn"
          type="button"
          onClick={back}
        >
          <IconChevronLeft />
        </button>
        <div className="pave-conversation-header-agent flex flex-row gap-2">
          <div className="pave-conversation-header-agent-img">
            <Image
              src={
                setting?.agency_user?.user?.profile_picture_url ??
                'https://cdn.yourpave.com/user/profile/08a3ec94c56c29bf23ef1b5e36ce25d91640d5949e9be97e886d043a4763f882362eb067a999c3155716cdf003434a3e833ea7e6e403ee7e9a8fa974806bda6f.jpeg'
              }
              width={40}
              height={40}
              alt="Pave Logo"
            />
          </div>
          <div className="pave-conversation-header-agent-details flex flex-col">
            <span style={{ color: style.chatHeaderTextColor }}>
              {setting?.agency_user?.user?.full_name ?? ''}
            </span>

            <span className="flex flex-row items-center  gap-2">
              <IconClock /> {setting?.chat_frequency}
            </span>
          </div>
        </div>
      </div>
      <div className="pave-conversation-body flex flex-col gap-3">
        {thread.map((msg, i) => (
          <div
            className={`pave-conversation-body-msg flex ${isMsgOrientation(
              msg,
            )}`}
            key={i}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: msg.msg_body,
              }}
            ></div>
          </div>
        ))}
        <div ref={convoBody}></div>
      </div>
      <div className="pave-conversation-input flex flex-row gap-3 items-end">
        <textarea
          placeholder="Write message..."
          ref={msgTextAreaRef}
          value={msgReply}
          onChange={(e) => {
            setMsgReply(e.target.value);
          }}
          onKeyDown={(e) => {
            console.log(
              e.keyCode === 13 &&
                e.target.value.trim().length > 0 &&
                !e.shiftKey,
            );
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
          disabled={sending === API_STATUS.pending}
          className={sending === API_STATUS.failed ? 'shake' : ''}
          rows={1}
        ></textarea>
        <button
          type="button"
          onClick={sendMessage}
          disabled={sending === API_STATUS.pending || h.isEmpty(msgReply)}
          className={sending === API_STATUS.failed ? 'shake' : ''}
        >
          {sending === API_STATUS.idle && (
            <IconSend
              color={
                sending === API_STATUS.pending || h.isEmpty(msgReply)
                  ? '#c5c5c5'
                  : '#fe5959'
              }
            />
          )}

          {sending === API_STATUS.pending && <div className="loader"></div>}

          {sending === API_STATUS.fulfilled && <IconCheck />}
          {sending === API_STATUS.failed && <IconX />}
        </button>
      </div>
    </div>
  );
}
