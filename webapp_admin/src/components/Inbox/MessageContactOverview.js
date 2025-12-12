import React, { useEffect, useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { h } from '../../helpers';
import { config } from '../../configs/config';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import SmallSpinner from './SmallSpinner';

// ICONS
import {
  faCircle,
  faEnvelope,
  faUser,
  faPencilAlt,
  faMobile,
  faUsers,
  faCertificate,
  faClock,
  faStickyNote,
  faUserAlt,
  faTag,
  faPlus,
  faBuilding,
  faUserCog,
  faInfoCircle,
  faCloud,
  faPause,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import IconWhatsAppBlack from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsAppBlack';
import IconChevronLeft from '../../components/ProposalTemplate/Link/preview/components/Icons/IconChevronLeft';
import IconWhatsApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconLineApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconLineApp';
import IconSMS from '../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconClose from '../../components/ProposalTemplate/Link/preview/components/Icons/IconClose';
import IconWeChatApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWeChatApp';
import CommonTooltip from '../Common/CommonTooltip';
import CommonDrodownAction from '../Common/CommonDrodownAction';
import NotesModal from '../Contact/NotesModal';
import InboxContacts from './InboxContacts';
import AutomationList from './AutomationList';
import TECLeadForm from '../TEC/SalesforceLeadForm';
import CommonInlineNameFormEdit from '../Common/CommonInlineNameFormEdit';
import IconSalesforce from '../ProposalTemplate/Link/preview/components/Icons/IconSalesforce';
import Toggle from 'react-toggle';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const queryClient = new QueryClient();

function showTECLeadForm(liveChatSetting) {
  if (
    h.cmpBool(liveChatSetting.whatsapp_salesforce_enabled, true) ||
    h.cmpBool(liveChatSetting.livechat_salesforce_enabled, true)
  ) {
    return true;
  }

  return false;
}

export default React.memo(
  ({
    agentUserId,
    contactOptOut,
    setContactOptOut,
    contact,
    selectedAgenctOwner,
    messages,
    agency,
    handleEditContact,
    handleUpdateContactData,
    threadLatestCampaign,
    isLastMessageBusinessCampaign,
    contactUpdate = () => {},
    platform,
    mobileView,
    backAction = () => {},
  }) => {
    const [viewMore, setViewMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAutomationList, setShowAutomationList] = useState(false);
    const [contactActivities, setContactActivities] = useState([]);
    const [latestContactActivities, setLatestContactActivities] =
      useState(null);
    const [showNotes, setShowNotes] = useState(false);
    const [showContacts, setShowContacts] = useState(false);
    const [contactEngagements, setContactEngagements] = useState(false);
    const [pausedAutomation, setPausedAutomation] = useState({
      automation: false,
      campaign: false,
    });
    const [labels, setLabels] = useState([]);
    const [addNewLabel, setAddNewLabel] = useState(false);
    const [showTEC, setShowTEC] = useState(false);
    const [liveChatSetting, setLiveChatSetting] = useState({});
    const [
      salesforceDirectIntegrationStatus,
      setSalesforceDirectIntegrationStatus,
    ] = useState(null);
    

    useEffect(() => {
      if (contact) {
        setPausedAutomation(contact?.paused_automation);
        setContactEngagements({
          automation:
            contact.whatsapp_engagement === constant.ENGAGEMENTS.ALL ||
            contact.whatsapp_engagement.includes(
              constant.ENGAGEMENTS.AUTOMATION,
            ),
          campaign:
            contact.whatsapp_engagement === constant.ENGAGEMENTS.ALL ||
            contact.whatsapp_engagement.includes(constant.ENGAGEMENTS.CAMPAIGN),
        });
        getLabels(contact);
        getActivities();
        getLiveChatSettings(contact.agency_fk);
        getActiveAgencySalesforceData(contact.agency_fk);
      }
    }, [contact]);

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

    async function getLiveChatSettings(agency_id) {
      const liveChatSettingRes = await api.setting.get(agency_id, false);
      if (h.cmpStr(liveChatSettingRes.status, 'ok')) {
        setLiveChatSetting(liveChatSettingRes.data.liveChatSetting);
      }
    }

    async function getActiveAgencySalesforceData(agency_id) {
      const getSalesforceIntegration =
        await api.integrations.getSalesforceActiveIntegration(
          {
            agency_id: agency_id,
          },
          false,
        );

      if (h.cmpStr(getSalesforceIntegration.status, 'ok')) {
        const { agency_oauth } = getSalesforceIntegration.data;
        setSalesforceDirectIntegrationStatus(agency_oauth.status);
      }
    }

    async function getActivities() {
      setLoading(true);
      const apiRes = await queryClient.fetchQuery(
        ['getContactOverview'],
        ({ signal }) => {
          const CancelToken = axios.CancelToken;
          const source = CancelToken.source();

          // Cancel the request if TanStack Query signals to abort
          signal?.addEventListener('abort', () => {
            source.cancel('Query was cancelled by TanStack Query');
          });

          return api.contactActivity.getContactActivities(
            { contact_id: contact?.contact_id },
            {},
            false,
            source.token,
          );
        },
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
    }

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

    async function updateEngagement(type, value) {
      const engagements = { ...contactEngagements };

      engagements[type] = value;

      const newEngagements = [];

      for (const key in engagements) {
        if (engagements[key] === true) {
          newEngagements.push(key);
        }
      }

      setContactEngagements(engagements);

      contactUpdate({
        ...contact,
        whatsapp_engagement: newEngagements.join(','),
      });
      await api.contact.updateEngagement({
        contact_id: contact.contact_id,
        engagements: newEngagements,
      });
    }

    async function pauseAutomation() {
      const paused_automation = !pausedAutomation;
      const apiRes = await api.contact.update(
        {
          first_name: contact?.first_name,
          last_name: contact?.last_name,
          contact_id: contact?.contact_id,
          mobile_number: contact?.mobile_number,
          agency_user_id: contact?.agency_user_fk,
          agency_id: contact?.agency_fk,
          paused_automation,
        },
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        h.general.alert('success', {
          message: paused_automation
            ? 'Automation messages have been successfully paused.'
            : 'Automation messages have resumed successfully after being paused.',
        });
        handleUpdateContactData({
          ...contact,
          paused_automation,
        });
        setPausedAutomation(paused_automation);
      }
    }

    async function deleteLabel(index) {
      const newLabels = [...labels];
      newLabels.splice(index, 1);

      await updateLabel(newLabels);
    }

    async function addLabel(label) {
      await updateLabel([...labels, label]);
    }

    async function updateLabel(newLabels) {
      const updateRes = await api.contact.simpleUpdate(
        {
          contact_id: contact.contact_id,
          labels: newLabels.join(','),
        },
        false,
      );

      if (h.cmpStr(updateRes.status, 'ok')) {
        setLabels(newLabels);
      }
    }

    async function getLabels(contact) {
      const contactRes = await api.contact.findOne(contact, false);

      if (h.cmpStr(contactRes.status, 'ok')) {
        setLabels(
          h.notEmpty(contactRes.data?.contact?.labels)
            ? contactRes.data.contact.labels.split(',')
            : [],
        );
      }
    }

    async function toggleWhatsAppSubscription(opt_out_whatsapp) {
      const subscription_action = h.cmpBool(opt_out_whatsapp, true) ? 'restrict' : 'allow';
      h.general.prompt(
        {
          message:
            `This will ${subscription_action} sending messages to this contact's WhatsApp number. Continue Action?`,
        },

        async (confirmAction) => {
          if (confirmAction) {
            setLoading(true);
            const updateRes = await api.contact.whatsAppSubscriptionUpdate(
              {
                contact_id: contact.contact_id,
                opt_out_whatsapp: opt_out_whatsapp,
              },
              false,
            );

            if (h.cmpStr(updateRes.status, 'ok')) {
              const optOutDate = h.date.convertUTCDateToLocalDate(
                updateRes.data.opt_out_whatsapp_date + ' GMT',
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
              setContactOptOut({
                opt_out_whatsapp: updateRes.data.opt_out_whatsapp,
                opt_out_whatsapp_date: h.cmpStr(subscription_action, 'restrict') ? optOutDate : null,
              });
            }

            setLoading(false);
          }
        },
      );
    }

    return (
      <>
        {showNotes && (
          <NotesModal
            contactId={contact.contact_id}
            agencyUserId={agentUserId}
            handleCloseModal={() => {
              setShowNotes(false);
            }}
          />
        )}

        {contact && showContacts && (
          <InboxContacts
            oldContactId={contact.contact_id}
            agencyId={contact?.agency_fk}
            handleCloseModal={() => {
              setShowContacts(false);
            }}
          />
        )}

        {showAutomationList && (
          <AutomationList
            oldContactId={contact.contact_id}
            agencyId={contact?.agency_fk}
            handleCloseModal={() => {
              setShowAutomationList(false);
            }}
          />
        )}

        <div
          className={`message-user-info animate-fadeIn ${
            mobileView === 'info' ? '' : 'hidden'
          }`}
        >
          <span className="overview-back">
            <IconChevronLeft
              width="18"
              color={'#182327'}
              onClick={() => backAction('chat')}
            />
          </span>
          {contact && (
            <>
              {contact && (
                <CommonInlineNameFormEdit
                  contact={contact}
                  onSuccess={handleUpdateContactData}
                />
              )}

              <div className="info-list">
                {contact && h.notEmpty(contact?.status) && (
                  <div>
                    <span>
                      <FontAwesomeIcon
                        icon={faUserCog}
                        color="#02021e"
                        style={{ fontSize: '15px' }}
                      />{' '}
                    </span>
                    <div>
                      <small className="smaill-title">Contact Status</small>
                      <br />
                      {contact?.status.charAt(0).toUpperCase() + contact?.status.slice(1)}
                    </div>
                  </div>
                )}
                {selectedAgenctOwner?.user?.full_name && (
                  <div>
                    <span>
                      <FontAwesomeIcon
                        icon={faUser}
                        color="#02021e"
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

                {/* {contact?.status === 'outsider' && (
                  <div>
                    <span>
                      <FontAwesomeIcon
                        icon={faCog}
                        color="#02021e"
                        style={{ fontSize: '15px' }}
                      />{' '}
                    </span>
                    <div>
                      <small className="smaill-title">Contact merge</small>
                      <br />
                      <b
                        onClick={() => {
                          setShowContacts(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        Click to merge with existing contact
                      </b>
                    </div>
                  </div>
                )} */}

                {contact?.mobile_number && (
                  <div>
                    <span>
                      <FontAwesomeIcon
                        icon={faMobile}
                        color="#02021e"
                        style={{ fontSize: '15px' }}
                      />{' '}
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
                        color="#02021e"
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
                {h.notEmpty(contact?.company) && (
                  <div>
                    <span>
                      <FontAwesomeIcon
                        icon={faBuilding}
                        color="#02021e"
                        style={{ fontSize: '15px' }}
                      />
                    </span>
                    <div style={{ width: ' calc(100% - 70px)' }}>
                      <small className="smaill-title">Company</small>
                      <br />
                      <b>{contact?.company}</b>
                    </div>
                  </div>
                )}
                {messages.length > 0 && (
                  <div
                    style={{
                      display: isLastMessageBusinessCampaign
                        ? 'inherit'
                        : 'none',
                    }}
                  >
                    <span>
                      <FontAwesomeIcon
                        icon={faUsers}
                        color="#02021e"
                        style={{ fontSize: '15px' }}
                      />
                    </span>
                    <div
                      style={{
                        width: ' calc(100% - 70px)',
                      }}
                    >
                      <small className="smaill-title">Campaign</small>
                      <br />
                      <b onClick={() => {}} style={{ cursor: 'pointer' }}>
                        {threadLatestCampaign ??
                          messages[messages.length - 1]?.campaign_name ??
                          messages[
                            messages.length - 1
                          ]?.tracker_ref_name.replace('_', ' ')}
                      </b>
                    </div>
                  </div>
                )}
                {contact?.permalink && (
                  <div>
                    <span>
                      <FontAwesomeIcon
                        icon={faCertificate}
                        color="#02021e"
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

                <div>
                  <span>
                    <FontAwesomeIcon
                      icon={faTag}
                      color="#02021e"
                      style={{ fontSize: '15px' }}
                    />
                  </span>
                  <div style={{ width: ' calc(100% - 70px)' }}>
                    <small className="smaill-title">Labels</small>
                    <br />
                    {labels.map((label, i) => (
                      <b
                        className={`label-tag ${label.replace(' ', '')}`}
                        key={i}
                      >
                        {label}
                        <IconClose
                          color="#02021e"
                          width="10px"
                          style={{
                            verticalAlign: 'middle',
                            display: 'inline-block',
                            marginLeft: '5px',
                            cursor: 'pointer',
                          }}
                          onClick={async () => {
                            await deleteLabel(i);
                          }}
                        />
                      </b>
                    ))}
                    {labels.length !== 0 && <br />}
                    {!addNewLabel &&
                      labels.length !== constant.CONTACT_LABELS.length && (
                        <b
                          className={`label-tag add`}
                          onClick={() => {
                            setAddNewLabel(true);
                          }}
                        >
                          Click to add label
                        </b>
                      )}
                    {addNewLabel && (
                      <div>
                        {labels.length !== constant.CONTACT_LABELS.length && (
                          <div className="labels-wrapper">
                            {constant.CONTACT_LABELS.filter(
                              (f) => !labels.includes(f),
                            ).map((label, i) => (
                              <b
                                className={`label-tag ${label.replace(
                                  ' ',
                                  '',
                                )}`}
                                key={i}
                                style={{ cursor: 'pointer' }}
                                onClick={async () => {
                                  await addLabel(label);
                                }}
                              >
                                {label}
                              </b>
                            ))}
                          </div>
                        )}
                        <b
                          className={`label-tag add`}
                          onClick={() => {
                            setAddNewLabel(false);
                          }}
                        >
                          Close
                        </b>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span>
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      color="#02021e"
                      style={{ fontSize: '15px' }}
                    />
                  </span>
                  <div style={{ width: ' calc(100% - 70px)' }}>
                    <small className="smaill-title">Notes</small>
                    <br />
                    <b
                      onClick={() => {
                        setShowNotes(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      Click to view notes
                    </b>
                  </div>
                </div>

                {salesforceDirectIntegrationStatus === constant.DIRECT_INTEGRATION.INTEGRATION_STATUS.ACTIVE &&
                  ['whatsapp', 'livechat'].includes(platform) &&
                  showTECLeadForm(liveChatSetting) && (
                    <div>
                      <span>
                        <IconSalesforce width="20px" color={'#02021e'} />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">Salesforce Data</small>
                        <br />

                        <TECLeadForm
                          contact={contact}
                          contactId={contact.contact_id}
                          agencyId={contact.agency_fk}
                          agencyUserId={agentUserId}
                          platform={platform}
                          contactUpdate={contactUpdate}
                        />

                        {h.cmpStr(platform, 'line') &&
                          h.cmpBool(
                            liveChatSetting.line_salesforce_enabled,
                            true,
                          ) && (
                            <b
                              onClick={() => {
                                setShowTEC(true);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              Click to Generate/View TEC Lead
                            </b>
                          )}
                        {h.cmpStr(platform, 'whatsapp') &&
                          h.cmpBool(
                            liveChatSetting.whatsapp_salesforce_enabled,
                            false,
                          ) && <b>Feature Disabled for this Channel</b>}
                        {h.cmpStr(platform, 'line') &&
                          h.cmpBool(
                            liveChatSetting.line_salesforce_enabled,
                            false,
                          ) && <b>Feature Disabled for this Channel</b>}
                      </div>
                    </div>
                  )}

                {[constant.INBOX.TYPE.WHATSAPP].includes(platform) && (
                  <div style={{ alignItems: 'start' }}>
                    <span>
                      <FontAwesomeIcon
                        icon={faPause}
                        color="#02021e"
                        style={{ fontSize: '15px' }}
                      />
                    </span>
                    <div style={{ width: ' calc(100% - 70px)' }}>
                      <small className="smaill-title">
                        Pause Automation for this Contact
                      </small>
                      <br />
                      <div className="d-flex align-items-center flex-wrap">
                        <Toggle
                          icons={false}
                          checked={pausedAutomation}
                          className="whatsapp-toggle mr-2 nodrag"
                          onChange={pauseAutomation}
                        />
                        <span>Paused</span>
                      </div>
                    </div>
                  </div>
                )}

                {[constant.INBOX.TYPE.WHATSAPP].includes(platform) && (
                  <>
                    {contactOptOut && (
                      <div style={{ alignItems: 'start' }}>
                        <span>
                          <IconWhatsAppBlack width="15px" color={'#02021e'} />
                        </span>
                        <div style={{ width: ' calc(100% - 70px)' }}>
                          <small className="smaill-title">
                            WhatsApp Subscription
                          </small>
                          <br />
                          <div className="d-flex align-items-center flex-wrap">
                            <Toggle
                              icons={false}
                              checked={!contactOptOut?.opt_out_whatsapp}
                              className="whatsapp-toggle mr-2 nodrag"
                              onChange={() => {
                                toggleWhatsAppSubscription(!contactOptOut?.opt_out_whatsapp);
                              } } />
                            <span>
                              {contactOptOut?.opt_out_whatsapp ? 'Opt-Out' : 'Opt-In'}
                            </span>
                            {contactOptOut?.opt_out_whatsapp_date && (
                              <>
                                <br />
                                <span className="ml-5">
                                  <small className="mt-3 ml-2">{contactOptOut?.opt_out_whatsapp_date}</small>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ alignItems: 'start' }}>
                      <span>
                        <FontAwesomeIcon
                          icon={faUserAlt}
                          color="#02021e"
                          style={{ fontSize: '15px' }} />
                      </span>
                      <div style={{ width: ' calc(100% - 70px)' }}>
                        <small className="smaill-title">
                          WhatsApp Engagements
                        </small>
                        <br />
                        <div className="d-flex aligh-items-center">
                          <div className="d-flex align-items-center flex-wrap mb-1">
                            <Toggle
                              icons={false}
                              checked={contactEngagements.automation}
                              className="whatsapp-toggle mr-2 nodrag"
                              onChange={() => {
                                updateEngagement(
                                  constant.ENGAGEMENTS.AUTOMATION,
                                  !contactEngagements.automation
                                );
                              } } />
                            <label className="m-0">
                              Automation{' '}
                              <CommonTooltip
                                tooltipText={contactEngagements.automation
                                  ? 'Disable automation for this contact'
                                  : 'Enable automation for this contact'}
                              >
                                <FontAwesomeIcon
                                  icon={faInfoCircle}
                                  color="#02021e"
                                  size=""
                                  className="c-pointer"
                                  onClick={() => {
                                    setShowAutomationList(true);
                                  } } />
                              </CommonTooltip>
                            </label>
                          </div>
                        </div>
                        <div className="d-flex aligh-items-center mb-4">
                          <div className="d-flex align-items-center flex-wrap">
                            <Toggle
                              icons={false}
                              checked={contactEngagements.campaign}
                              className="whatsapp-toggle mr-2 nodrag"
                              onChange={(e) => {
                                updateEngagement(
                                  constant.ENGAGEMENTS.CAMPAIGN,
                                  !contactEngagements.campaign
                                );
                              } } />
                            <label className="m-0">
                              Campaign{' '}
                              <CommonTooltip
                                tooltipText={contactEngagements.campaign
                                  ? 'Disable campaign for this contact'
                                  : 'Enable campaign for this contact'}
                              >
                                <FontAwesomeIcon
                                  icon={faInfoCircle}
                                  color="#02021e"
                                  size=""
                                  className="c-pointer" />
                              </CommonTooltip>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {viewMore && latestContactActivities && (
                  <div>
                    <span>
                      <FontAwesomeIcon
                        icon={faClock}
                        color="#02021e"
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
              </div>

              {!loading &&
                contactActivities &&
                contactActivities.length > 0 && (
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
                            <span>
                              {handleFormatDate(activity.activity_date)}
                            </span>
                            {convertActivityType(activity.activity_type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

              {loading && <SmallSpinner />}
            </>
          )}
        </div>
      </>
    );
  },
);
