import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { h } from '../../helpers';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import { config } from '../../configs/config';
import { api } from '../../api';
// UI
import IconChaaatLogo from '../Icons/IconChaaatLogo';
import IconDashboard from '../Icons/IconDashboard2';
import IconContacts from '../Icons/IconContacts';
import IconCampaign from '../Icons/IconCampaign';
import IconInbox from '../Icons/IconInbox';
import IconAutomation from '../Icons/IconAutomation';
import IconHelp from '../Icons/IconHelp';
import IconSettings from '../Icons/IconSettings';
import IconTemplates from '../Icons/IconTemplates';

import HeaderMenu from './HeaderMenu';

export default function HeaderContentVertical({ className = '' }) {
  const router = useRouter();
  const currentPage = router.pathname;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState('');
  const [userName, setUserName] = useState('user');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [agency, setAgency] = useState([]);
  const HELP_URL_LINK = 'https://help.yourpave.com/';
  const [hasAdminAccess, setHasAdminAccess] = useState(true);
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);

  const subMenus = [
    {
      title: 'Contacts',
      link: hasMarketingAccess
        ? h.getRoute(routes.dashboard.leads.all_leads)
        : h.getRoute(routes.dashboard.leads.my_leads),
    },
    {
      title: 'List',
      link: h.getRoute(routes.templates.contact.list),
    },
  ];

  useEffect(() => {
    (async () => {
      setHasAdminAccess(await h.userManagement.hasAdminAccess());
      setHasMarketingAccess(await h.userManagement.hasMarketingAccess());
      const agencyRes = await api.agencyUser.getCurrentUserAgency({}, false);
      setAgency(agencyRes?.data?.agencyUser?.agency);

      if (window && window.newrelic) {
        window.newrelic.setUserId(
          agencyRes?.data?.agencyUser?.agency?.agency_id,
        );
      }
    })();
  }, []);

  useEffect(() => {
    const isAuthenticated = h.auth.isAuthenticated();
    if (isAuthenticated) {
      setIsLoggedIn(isAuthenticated);
      const user = h.auth.getUserInfo();
      setUserName(h.user.formatFullName(user));
      setFirstname(user.first_name);
      setLastname(user.last_name);
      setUserProfilePic(user.profile_picture_url);
      h.paveChat.init({
        container: '#__next', // Main root content wrapper
        agency_id: '08012e63-a6ce-4cb1-abdf-89b592955729', // Agent ID
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email_address: user.email,
          phone: user.mobile_number,
        },
      });
    }
  }, []);

  async function handleLogout() {
    h.auth.handleLogout();
  }

  return (
    <div className="vertical-navbar">
      <div className="vertical-navbar-logo">
        <img
          src="https://cdn.yourpave.com/assets/beta-logo.png"
          alt="Chaaat"
          width={40}
          style={{ marginBottom: 10}}
        />
        <a
          href={''}
          className="d-flex flex-column center-body"
          style={{ gap: '0.5em' }}
        >
          <IconChaaatLogo width={78} />
        </a>
      </div>

      <div className="vertical-navbar-items">
        <div className="logged-in-nav-menu">
          {isLoggedIn && (
            <HeaderMenu
              Component={IconDashboard}
              active={currentPage === routes.dashboard.index}
              title={'Dashboard'}
              link={h.getRoute(routes.dashboard.index)}
            />
          )}

          {isLoggedIn && (
            <HeaderMenu
              Component={IconContacts}
              title={'Contact'}
              active={currentPage.includes('/dashboard/leads') || currentPage.includes('/templates/contact')}
              subMenus={hasAdminAccess ? subMenus : []}
              link={!hasAdminAccess ? h.getRoute(routes.dashboard.leads.my_leads) : '#'}
              
            />
          )}

          {isLoggedIn && hasAdminAccess && (
            <HeaderMenu
              Component={IconCampaign}
              title={'Campaign'}
              active={currentPage === routes.dashboard.messaging}
              link={h.getRoute(routes.dashboard.messaging)}
            />
          )}

          {isLoggedIn && (
            <HeaderMenu
              Component={IconInbox}
              title={'Inbox'}
              active={currentPage === routes.inbox.index}
              link={h.getRoute(routes.inbox.index)}
            />
          )}

          {isLoggedIn && hasAdminAccess && (
            <HeaderMenu
              Component={IconTemplates}
              title={'Templates'}
              active={currentPage === routes.templates.whatsapp.list}
              link={h.getRoute(routes.templates.whatsapp.list)}
            />
            // <HeaderMenu
            //   Component={IconTemplates}
            //   title={'Templates'}
            //   active={[
            //     routes.templates.whatsapp.list,
            //     routes.templates.line.list,
            //   ].includes(currentPage)}
            //   subMenus={[
            //     {
            //       title: 'WhatsApp',
            //       link: h.getRoute(routes.templates.whatsapp.list),
            //     },
            //     {
            //       title: 'Line',
            //       link: h.getRoute(routes.templates.line.list),
            //     },
            //   ]}
            // />
          )}

          {isLoggedIn && hasAdminAccess && (
            <HeaderMenu
              Component={IconAutomation}
              title={'Automation '}
              active={
                currentPage === routes.automation.index ||
                currentPage.includes('/automation/rule')
              }
              link={h.getRoute(routes.automation.index)}
            />
          )}
        </div>

        <div className="on-end">
          <HeaderMenu
            Component={IconHelp}
            title={''}
            active={false}
            link={'mailto:support@chaaat.io'}
          />
          {isLoggedIn && hasAdminAccess && (
          <HeaderMenu
            Component={IconSettings}
            title={''}
            active={false}
            link={h.getRoute(routes.settings.index)}
          />)}
          {isLoggedIn && (
            <HeaderMenu
              Component={IconSettings}
              title={''}
              active={false}
              profile={true}
              profileData={{ userProfilePic, userName, firstname, lastname }}
              agency={agency}
              handleLogout={handleLogout}
              subMenus={[
                {
                  title: 'Profile',
                  link: h.getRoute(routes.settings.profile),
                },
                ...(hasAdminAccess
                  ? [
                      {
                        title: ' User Management',
                        link: h.getRoute(routes.settings.user_management),
                      },
                      {
                        title: 'Integrations',
                        link: h.getRoute(routes.settings.integrations),
                      },
                      {
                        title: 'Billing',
                        link: h.getRoute(routes.settings.billing),
                      },
                    ]
                  : []),
                {
                  title: 'Logout',
                  type: 'logout',
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
