import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { routes } from '../../../configs/routes';

// ICONS
import {
  faInbox,
  faSlidersH,
  faCommentSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import IconWhatsApp from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconSMS from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconComments from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import IconCircleBack from '../../../components/ProposalTemplate/Link/preview/components/Icons/IconCircleBack';
import MessageList from '../../../components/Inbox/MessageList';
import MessageContactOverview from '../../../components/Inbox/MessageContactOverview';
import MessageThread from '../../../components/Inbox/MessageThread';
import MessageFilter from '../../../components/Inbox/MessageFilter';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function SmsInbox() {
  const router = useRouter();

  const [isLoading, setLoading] = useState();
  const [messages, setMessages] = useState([]);
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
  const [showResponsesOnly, setSetShowResponsesOnly] = useState(true);
  const [contactOwners, setContactOwners] = useState([]);
  const [hasAdminAccess, setHasAdminAccess] = useState(true);
  const [selectedAgenctOwner, setSelectedAgenctOwner] = useState(null);
  const [searchText, setSearchText] = useState(null);
  const [contactActivities, setContactActivities] = useState([]);
  const [latestContactActivities, setLatestContactActivities] = useState(null);
  const [filterShow, setFilterShow] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const msgBody = useRef(null);
  const convoRef = useRef(null);

  useEffect(() => {
    (async () => {
      setHasAdminAccess(await h.userManagement.hasAdminAccess());
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgentId(apiRes.data?.agencyUser?.agency_user_id);
        setAgency(apiRes.data?.agencyUser.agency);

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

  const getCampaignRecipientRecords = async (filter = {}) => {
    setLoading(true);
    const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      // if (apiRes.data.agencyUser) {
      //   setAgencyUser(apiRes.data.agencyUser);
      // }
      const smsAppRes = await api.sms.getCampaignRecipientRecords(
        { tracker_ref_name: h.general.findGetParameter('campaign'), ...filter },
        false,
      );
      if (h.cmpStr(smsAppRes.status, 'ok')) {
        setMessages(smsAppRes.data.results);
        // setOverview(smsAppRes.data.preview);
        setLoading(false);
      }
    }
  };

  async function handleGetConvo(msg) {
    setLoading(true);

    const threadRes = await api.sms.getThread(
      {
        tracker_ref_name: h.general.findGetParameter('campaign'),
        contact_fk: msg?.contact_fk,
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

      const threadValue = threadRes.data.sms_thread
        .filter((f) => f.msg_body)
        .sort(function (a, b) {
          return new Date(a.created_date_raw) - new Date(b.created_date_raw);
        });
      setThread(threadValue);
      msgBody.current?.scrollIntoView();
    } else {
      clearInterval();
      setLoading(false);
      setContact(null);
    }
  }

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

  useEffect(() => {
    if (agentId) {
      getCampaignRecipientRecords({
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

  return (
    <>
      <div id="messaging-root">
        <Header className="common-navbar-header" />
        <Body isLoading={isLoading} className="messaging-wrapper">
          <div className="messaging-container">
            <div className="message-navigation">
              <div onClick={() => router.push(routes.dashboard['sms'])}>
                <IconCircleBack width="30" color={'#fff'} />
              </div>
              <div onClick={() => router.push(routes.dashboard['messaging'])}>
                <IconWhatsApp width="30" color={'#fff'} />
              </div>
              <div onClick={() => router.push(routes.dashboard['sms'])}>
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
                    <MessageFilter
                      hasAdminAccess={hasAdminAccess}
                      contactOwners={contactOwners}
                      selectedOwnerOptions={selectedOwnerOptions}
                      setSelectedOwnerOptions={setSelectedOwnerOptions}
                      showPlatforms={false}
                      showSort={false}
                      showQuickReply={false}
                      showOnlyWithReply={true}
                      showResponsesOnly={showResponsesOnly}
                      setSetShowResponsesOnly={setSetShowResponsesOnly}
                      closeFilter={() => {
                        setFilterShow(false);
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="message-item-list">
                {filteredMsgs().length > 0 &&
                  filteredMsgs().map((msg, i) => (
                    <MessageList
                      contact={contact}
                      msg={msg}
                      index={i}
                      messages={messages}
                      setMessages={setMessages}
                      clickAction={handleGetConvo}
                      alwaysReadStatus={true}
                    />
                  ))}
                {filteredMsgs().length === 0 && (
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
              </div>
            </div>

            <div className="message-body inbox-wrapper ">
              <div className="right-section">
                {contact ? (
                  <MessageThread
                    thread={thread}
                    contact={contact}
                    scrolled={scrolled}
                    setScrolled={setScrolled}
                    medias={null}
                    disableSending={false}
                    msgReply={msgReply}
                    setMsgReply={setMsgReply}
                    sendMessage={() => {}}
                    bottom={bottom}
                    setBottom={setBottom}
                    showReply={false}
                    msgBody={msgBody}
                    convoRef={convoRef}
                  />
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
              <MessageContactOverview
                contact={contact}
                selectedAgenctOwner={selectedAgenctOwner}
                messages={messages}
                agency={agency}
                latestContactActivities={latestContactActivities}
                contactActivities={contactActivities}
              />
            )}
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
