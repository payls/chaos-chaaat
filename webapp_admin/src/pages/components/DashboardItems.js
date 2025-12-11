import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import moment from 'moment';

export default function DashboardItems({isLoading, setLoading, connectedAccountCount}) {
  const router = useRouter();
  const [agencyUser, setAgencyUser] = useState(null);
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);
  const [whatsAppStat, setWhatsAppStat] = useState({
    channel_count: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    read: 0,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      h.auth.isLoggedInElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgencyNoRedirect(
        {},
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUser(apiRes.data.agencyUser);
        const whatsappRes = await api.whatsapp.getMessageStat(apiRes.data.agencyUser.agency_fk, false);
        if (h.cmpStr(whatsappRes.status, 'ok')) {
          setWhatsAppStat({
            sent: whatsappRes.data.data.sent_count,
            delivered: whatsappRes.data.data.delivered_count,
            failed: whatsappRes.data.data.failed_count,
            read: whatsappRes.data.data.read_count,
            channel_count: whatsappRes.data.data.channel_count,
          });
        }
      }
      setHasMarketingAccess(await h.userManagement.hasMarketingAccess());
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="dashboard-items-wrapper mb-5">
        <div className="d-flex justify-content-center">
          <div key={0} className="dashboard-items-content item">
            {/* start message items */}
            <div className="dashboard-overview-wrapper d-flex flex-wrap">
              <div className="dashboard-overview-wrapper-item-1 flex-row">
                <div className="dashboard-overview-wrapper-item-icon">
                  <img src="https://cdn.yourpave.com/assets/dashboard_templates.png" height="80" />
                </div>
                <div className="dashboard-overview-wrapper-item-details flex-column">
                  <label>Templates</label>
                </div>
                <div className="dashboard-overview-wrapper-item-description">
                  Use our template builder to launch a campaign in minutes.
                </div>
                <button
                  type="button" className="dashboard-overview btn-gradient"
                  onClick={() => {
                    router.push(
                      h.getRoute(routes.templates.whatsapp.create),
                      undefined,
                      {
                        shallow: true,
                      },
                    );
                  }}
                  disabled={!hasMarketingAccess}
                >
                  Create
                </button>
              </div>
              <div className="dashboard-overview-wrapper-item-1 flex-row">
                <div className="dashboard-overview-wrapper-item-icon">
                  <img src="https://cdn.yourpave.com/assets/dashboard_campaigns.png" height="80" />
                </div>
                <div className="dashboard-overview-wrapper-item-details flex-column">
                  <label>Campaign</label>
                </div>
                <div className="dashboard-overview-wrapper-item-description">
                  Initiate your contact engagements by creating your campaign.
                </div>
                <button
                  type="button" className="dashboard-overview btn-gradient"
                  onClick={() => {
                    router.push(
                      h.getRoute(routes.whatsapp.campaign.create),
                      undefined,
                      {
                        shallow: true,
                      },
                    );
                  }}
                  disabled={!hasMarketingAccess}
                >
                  Create
                </button>
              </div>
              <div className="dashboard-overview-wrapper-item-1 flex-row">
                <div className="dashboard-overview-wrapper-item-icon">
                  <img src="https://cdn.yourpave.com/assets/dashboard_automations.png" height="80" />
                </div>
                <div className="dashboard-overview-wrapper-item-details flex-column">
                  <label>Automation</label>
                </div>
                <div className="dashboard-overview-wrapper-item-description">
                  Send automated message based on your rule.
                </div>
                <button
                  type="button" className="dashboard-overview btn-gradient"
                  onClick={() => {
                    router.push(
                      h.getRoute(routes.automation.index),
                      undefined,
                      {
                        shallow: true,
                      },
                    );
                  }}
                  disabled={!hasMarketingAccess}
                >
                  Create
                </button>
              </div>
            </div>
            {/* end message items */}
            {/* start message stats */}
            <div className="dashboard-overview-message-wrapper mt-4">
              <div className="dashboard-overview-message-stat zInd">
                <label className="overview">
                  All campaign performances
                </label>
                <label  className="overview">This month</label>
                <div className="dashboard-message-stat-details d-flex flex-wrap mt-4">
                  <div className="stat d-flex">
                    <div className="dashboard-message-stat-icon">
                      <img src="https://cdn.yourpave.com/assets/total_sent.png" height="80"/>
                    </div>
                    <div className="dashboard-message-stat-content">
                      <label>{whatsAppStat.sent}</label>
                      <span>Total conversation</span>
                    </div>
                  </div>
                  <div className="stat d-flex">
                    <div className="dashboard-message-stat-icon">
                      <img src="https://cdn.yourpave.com/assets/total_delivered.png" height="80"/>
                    </div>
                    <div className="dashboard-message-stat-content flex-column">
                      <label>{whatsAppStat.delivered}</label>
                      <span>Total delivered</span>
                    </div>
                  </div>
                  <div className="stat d-flex">
                    <div className="dashboard-message-stat-icon">
                      <img src="https://cdn.yourpave.com/assets/total_failed.png" height="80"/>
                    </div>
                    <div className="dashboard-message-stat-content flex-column">
                      <label>{whatsAppStat.failed}</label>
                      <span>Total failed</span>
                    </div>
                  </div>
                  <div className="stat d-flex">
                    <div className="dashboard-message-stat-icon">
                      <img src="https://cdn.yourpave.com/assets/total_replied.png" height="80"/>
                    </div>
                    <div className="dashboard-message-stat-content flex-column">
                      <label>{whatsAppStat.read}</label>
                      <span>Total read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end message stats */}
            {/* start user and contact section */}
            <div className="dashboard-overview-wrapper d-flex flex-wrap mt-4">
              <div className="dashboard-overview-wrapper-item-2">
                <div className="dashboard-user-contact-details d-flex flex-wrap">
                  <div className="integration d-flex">
                    <div className="dashboard-user-contact-details-icon member">
                      <img src="https://cdn.yourpave.com/assets/dashboard-team-members.png" height="80"/>
                    </div>
                    <div className="dashboard-user-contact-details-content">
                      <label>Add team members</label>
                      <span>
                        Organize your team by inviting members to join.
                      </span>
                    </div>
                    <div className="dashboard-user-contact-details-button">
                      <button
                        type="button" className="dashboard-overview btn-gradient member"
                        onClick={() => {
                          router.push(
                            h.getRoute(routes.settings.user_management + '?open_invite_user=true'),
                            undefined,
                            {
                              shallow: true,
                            },
                          );
                        }}
                        disabled={!hasMarketingAccess}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="dashboard-user-contact-details-button-min">
                    <button
                      type="button" className="dashboard-overview btn-gradient member"
                      onClick={() => {
                        router.push(
                          h.getRoute(routes.settings.user_management + '?open_invite_user=true'),
                          undefined,
                          {
                            shallow: true,
                          },
                        );
                      }}
                      disabled={!hasMarketingAccess}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="dashboard-overview-wrapper-item-2">
                <div className="dashboard-user-contact-details d-flex flex-wrap">
                  <div className="integration d-flex">
                    <div className="dashboard-user-contact-details-icon contact">
                      <img src="https://cdn.yourpave.com/assets/dashboard-contact.png" height="80"/>
                    </div>
                    <div className="dashboard-user-contact-details-content">
                      <label>Create/upload your contacts</label>
                      <span>
                        Import or create contacts.
                      </span>
                    </div>
                    <div className="dashboard-user-contact-details-button">
                      <button
                          type="button" className="dashboard-overview btn-gradient contact"
                          onClick={() => {
                            router.push(
                              h.getRoute(routes.contact.add),
                              undefined,
                              {
                                shallow: true,
                              },
                            );
                          }}
                          disabled={!hasMarketingAccess}
                        >
                          Add
                        </button>
                    </div>
                  </div>
                  <div className="dashboard-user-contact-details-button-min">
                    <button
                        type="button" className="dashboard-overview btn-gradient contact"
                        onClick={() => {
                          router.push(
                            h.getRoute(routes.contact.add),
                            undefined,
                            {
                              shallow: true,
                            },
                          );
                        }}
                        disabled={!hasMarketingAccess}
                      >
                        Add
                      </button>
                  </div>
                </div>
              </div>
            </div>
            {/* end user and contact section */}
          </div>
          <div key={1} className="dashboard-items-content connect item">
            <div className="dashboard-overview-wrapper d-flex flex-wrap">
              <div className="dashboard-overview-wrapper-item-3">
                <div className="dashboard-integration-details d-flex flex-wrap">
                  <div className="integration d-flex">
                    <div className="dashboard-integration-details-icon">
                      <img src="https://cdn.yourpave.com/assets/dashboard-connect-integration.png" height="80"/>
                    </div>
                    <div className="dashboard-integration-details-content">
                      <label>Connect integration</label>
                      <span>
                        Link your account to our integration and commence our customer / contact interaction.
                      </span>
                      <div className="dashboard-integration-details-button">
                        <button
                          type="button" className="dashboard-overview btn-gradient"
                          onClick={() => {
                            router.push(
                              h.getRoute(routes.settings.integrations),
                              undefined,
                              {
                                shallow: true,
                              },
                            );
                          }}
                          disabled={!hasMarketingAccess}
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                    <div className="dashboard-integration-details-button-min">
                      <button
                        type="button" className="dashboard-overview btn-gradient"
                        onClick={() => {
                          router.push(
                            h.getRoute(routes.settings.integrations),
                            undefined,
                            {
                              shallow: true,
                            },
                          );
                        }}
                        disabled={!hasMarketingAccess}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* start whatsapp connect */}
            <div className="dashboard-overview-wrapper d-flex flex-wrap mt-4">
              <div className="dashboard-overview-wrapper-item-4">
                <div className="dashboard-waba-details d-flex flex-wrap">
                  <div className="waba-connect d-flex">
                    <div className="dashboard-waba-details-icon">
                      <img src="https://cdn.yourpave.com/assets/dashboard-whatsapp.png" height="80"/>
                    </div>
                    <div className="dashboard-waba-details-content">
                      <label>WhatsApp business account</label>
                      <span>
                        {whatsAppStat.channel_count} connected account
                      </span>
                      <div className="dashboard-waba-details-button">
                        <button
                          type="button" className="dashboard-overview btn-gradient"
                          onClick={() => {
                            router.push(
                              h.getRoute(routes.settings.integrations + '?new_connection=whatsapp'),
                              undefined,
                              {
                                shallow: true,
                              },
                            );
                          }}
                          disabled={!hasMarketingAccess}
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end whatsapp connect */}
          </div>
        </div>
      </div>
    </>
  );
}