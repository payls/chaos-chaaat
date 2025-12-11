'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import h from './services/helpers';

import Welcome from './components/Welcome';
import WelcomeTEC from './components/WelcomeTEC';
import Chat from './components/Chat';
import { config } from './services/config';
import { Amplify } from 'aws-amplify';
import api from './services/api';

Amplify.configure(config.appSync);

export default function Home() {
  const storedLiveSessionId =
    typeof window !== 'undefined' &&
    localStorage.getItem('pave-live-chat-session-id')
      ? localStorage.getItem('pave-live-chat-session-id')
      : null;
  const [session, setSession] = useState(storedLiveSessionId);
  const [contact, setContact] = useState(false);
  const [page, setPage] = useState('home');
  const [welcomePage, setWelcomePage] = useState(null);
  const [isReset, setIsReset] = useState(false);
  const [fieldConfig, setFieldConfig] = useState([
    {
      label: 'First Name',
      field: 'first_name',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Last Name',
      field: 'last_name',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Phone Number',
      field: 'phone',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Email Address',
      field: 'email_address',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Lead Source',
      field: 'lead_source',
      mappedTo: '',
      required: true,
      defaultValue: 'message_channel',
    },
    {
      label: 'Lead Channel',
      field: 'lead_channel',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Origin',
      field: 'origin',
      mappedTo: '',
      required: true,
      defaultValue: 'Chaaat',
    },
    {
      label: 'Allow Marketing Email',
      field: 'marketing',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Interested Product',
      field: 'product',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Interested City',
      field: 'city',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Terms and Conditions',
      field: 'consent_date',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Language',
      field: 'language',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'Comments',
      field: 'comments',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
  ]);
  const [style, setStyle] = useState(null);

  useEffect(() => {
    getStyles();
  }, []);

  useEffect(() => {
    if (h.notEmpty(style)) {
      setWelcomePage(WelcomeComponent());
    }
  }, [style]);

  useEffect(() => {
    // const handleUnload = () => {
    //   localStorage.removeItem('pave-live-chat-session-id');
    //   localStorage.removeItem('pave-live-chat-contact');
    // };
    // window.addEventListener('beforeunload', handleUnload);
    // return () => {
    //   window.removeEventListener('beforeunload', handleUnload);
    // };

    const chaaatStatus = sessionStorage.getItem('chaaat-status');
    if (!isReset && h.isEmpty(chaaatStatus)) {
      localStorage.removeItem('pave-live-chat-session-id');
      localStorage.removeItem('pave-live-chat-contact');
      setContact(false);
      setSession(null);
      setIsReset(true);
    }
  }, [isReset]);

  async function getStyles() {
    const agency_id = h.findGetParameter('agency_id');
    const s = await api.getSettings(agency_id);
    if (h.cmpStr(s.status, 'ok')) {
      const fields = JSON.parse(s.data?.liveChatSettings?.field_configuration);

      setFieldConfig(fields);
      if (h.notEmpty(s.data?.liveChatSettings?.styles)) {
        setStyle(JSON.parse(s.data.liveChatSettings.styles));
      } else {
        setStyle({
          logoUrl:
            'https://www.yourpave.com/hubfs/Pave/images/image%201%20(1).png',
          backgroundImage: 'https://cdn.yourpave.com/pave-chat/bg.png',
          backgroundColor: '#182327',
          textColor: '#ffffff',
          bgBtnColor: 'rgba(254, 89, 89, 1)',
          textBtnColor: 'rgba(255, 255, 255, 1)',
          chatHeaderColor: '#182327',
          chatHeaderTextColor: '#fff',
        });
      }
    }
  }

  function initiateChat(v) {
    setContact(v.contact);
    setSession(v.live_chat_session_id);
    setPage('chat');
    localStorage.setItem('pave-live-chat-session-id', v.live_chat_session_id);
    localStorage.setItem('pave-live-chat-contact', JSON.stringify(v.contact));

    sessionStorage.setItem('chaaat-status', 'access');
  }

  function leaveChat(v) {
    setPage('home');
  }

  function endSession() {
    localStorage.removeItem('pave-live-chat-session-id');
    localStorage.removeItem('pave-live-chat-contact');
    sessionStorage.setItem('chaaat-status', 'refreshed');
    location.href = location.href;
  }

  function WelcomeComponent() {
    const agency_id = h.findGetParameter('agency_id');
    const isTEC = h.findGetParameter('isTECform');
    let WelcomeComponent;

    switch (agency_id) {
      case 'cf0c1702-23f7-4b0a-9e75-c87bc4c580bd':
      case 'fcb9edcc-20b3-4103-85e3-dbc50907ae5b':
        WelcomeComponent = WelcomeTEC;
        break;
      default:
        WelcomeComponent = Welcome;
        break;
    }

    if (isTEC === 'true') {
      WelcomeComponent = WelcomeTEC;
    }

    return (
      <WelcomeComponent
        callback={(v) => initiateChat(v)}
        session_id={session}
        fieldConfig={fieldConfig}
        setSession={setSession}
        endSession={endSession}
        style={style}
        setContact={setContact}
      />
    );
  }

  return (
    <main id="pave-chat">
      <div className="pave-chat-body">
        {page === 'home' && welcomePage}
        {page === 'chat' && (
          <Chat
            contact={contact}
            session_id={session}
            back={leaveChat}
            style={style}
          />
        )}
      </div>
    </main>
  );
}
