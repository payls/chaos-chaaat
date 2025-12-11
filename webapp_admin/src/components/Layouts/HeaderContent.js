import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { h } from '../../helpers';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { routes } from '../../configs/routes';
import { config } from '../../configs/config';
import { api } from '../../api';
import UserProfilePicture from '../UserProfile/UserProfilePicture';
import CommonTooltip from '../Common/CommonTooltip';

export default function HeaderContent({ className = '' }) {
  const router = useRouter();
  const currentPage = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState('');
  const [userName, setUserName] = useState('user');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [agency, setAgency] = useState([]);
  const HELP_URL_LINK = 'https://help.yourpave.com/';
  const [hasAdminAccess, setHasAdminAccess] = useState(true);
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);

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
        agency_id: getChaaatId(), // Agent ID
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email_address: user.email,
          phone: user.mobile_number,
        },
      });
    }
  }, []);

  useEffect(() => {
    // SET USER TO SENTRY
    if (h.notEmpty(agency)) {
      const user = h.auth.getUserInfo();
      h.sentry.setUser({
        id: user.user_id,
        email: user.email,
        phone: user.mobile_number,
        first_name: user.first_name,
        last_name: user.last_name,
        agency_id: agency?.agency_id,
      });
    }
  }, [agency]);

  function getChaaatId() {
    switch (config.env) {
      case 'development':
        return '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47';
      case 'staging':
        return '491d8a54-6975-4c53-ae18-30a4bb031fbf';
      default:
        return '08012e63-a6ce-4cb1-abdf-89b592955729';
    }
  }

  if (h.isEmpty(currentPage)) {
    return null;
  }

  async function handleLogout() {
    h.auth.handleLogout();
  }

  return (
    <Navbar
      // bg="transparent"
      expand="lg"
      variant="dark"
      className={className || 'common-navbar-header '}
    >
      <Navbar.Brand href={h.getRoute(routes.dashboard.index)} className="">
        <img
          src="https://cdn.yourpave.com/assets/chaaat-logo.png"
          alt="Chaaat"
          width={110}
          // style={{ maxWidth: 130, marginLeft: -6 }}
        />
        {/* <img
          src="https://cdn.yourpave.com/assets/beta-logo.png"
          alt="Chaaat"
          width={40}
          style={{ marginLeft: 10 }}
        /> */}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto common-navbar-nav">
          {isLoggedIn && (
            <Nav.Link
              href={h.getRoute(routes.dashboard.index)}
              id="nav-header-dashboard"
              className="ml-3 mr-3"
              active={currentPage === routes.dashboard.index}
            >
              Dashboard
            </Nav.Link>
          )}
          {isLoggedIn && (
            <NavDropdown
              href={
                hasMarketingAccess
                  ? h.getRoute(routes.dashboard.leads.all_leads)
                  : h.getRoute(routes.dashboard.leads.my_leads)
              }
              title="Contacts"
              id="nav-header-contacts"
              className="ml-3 mr-3"
              active={currentPage.includes('/dashboard/leads')}
            >
              <NavDropdown.Item
                href={
                  hasMarketingAccess
                    ? h.getRoute(routes.dashboard.leads.all_leads)
                    : h.getRoute(routes.dashboard.leads.my_leads)
                }
              >
                Contacts
              </NavDropdown.Item>
              <NavDropdown.Item
                href={h.getRoute(routes.templates.contact.list)}
              >
                List
              </NavDropdown.Item>
            </NavDropdown>
          )}

          {/* {isLoggedIn && (
            <Nav.Link
              href={h.getRoute(routes.dashboard.products)}
              id="nav-header-marketing"
              className="ml-3 mr-3 hide-module-mobile"
              active={
                currentPage === routes.dashboard.products ||
                currentPage === routes.dashboard['products.custom']
              }
            >
              Landing Pages
            </Nav.Link>
          )} */}

          {isLoggedIn && (
            <NavDropdown
              title="Campaigns"
              id="nav-header-campaigns"
              className="ml-3 mr-3"
              active={[
                routes.dashboard.messaging,
                routes.dashboard.line,
              ].includes(currentPage)}
            >
              <NavDropdown.Item href={h.getRoute(routes.dashboard.messaging)}>
                WhatsApp
              </NavDropdown.Item>

              {/* <NavDropdown.Item href={h.getRoute(routes.dashboard.line)}>
                Line
              </NavDropdown.Item> */}
              {/* <NavDropdown.Item href={h.getRoute(routes.dashboard.messenger)}>
                Messenger
              </NavDropdown.Item> */}
            </NavDropdown>
          )}

          {isLoggedIn && (
            <Nav.Link
              href={h.getRoute(routes.inbox.index)}
              id="nav-header-inbox"
              className="ml-3 mr-3 pos-rlt"
              active={currentPage === routes.inbox.index}
            >
              Inbox
              {/* <span className="message-count">&nbsp;</span> */}
            </Nav.Link>
          )}
          {isLoggedIn && (
            // <Nav.Link
            //   href={h.getRoute(routes.templates.whatsapp.list)}
            //   id="nav-header-comments"
            //   className="ml-3 mr-3"
            //   active={currentPage === routes.templates.whatsapp.list}
            // >
            //   Templates
            // </Nav.Link>

            <NavDropdown
              title="Templates"
              id="nav-header-templates"
              className="ml-3 mr-3"
              active={[
                routes.templates.whatsapp.list,
                routes.templates.line.list,
              ].includes(currentPage)}
            >
              <NavDropdown.Item
                href={h.getRoute(routes.templates.whatsapp.list)}
              >
                WhatsApp
              </NavDropdown.Item>

              {/* <NavDropdown.Item href={h.getRoute(routes.templates.line.list)}>
                Line
              </NavDropdown.Item> */}
            </NavDropdown>
          )}
          {isLoggedIn && (
            <Nav.Link
              href={h.getRoute(routes.automation.index)}
              id="nav-header-comments"
              className="ml-3 mr-3"
              active={currentPage === routes.automation.index}
            >
              Automations
            </Nav.Link>
          )}

          {/* {isLoggedIn && hasAdminAccess && (
            <Nav.Link
              href={h.getRoute(routes.dashboard.reports)}
              id="nav-header-marketing"
              className="ml-3 mr-3"
            >
              REPORTS
            </Nav.Link>
          )} */}
        </Nav>
        <Nav className="mr-sm-2 common-navbar-nav">
          {isLoggedIn && (
            <Nav.Link
              href={'mailto:support@chaaat.io'}
              target="_blank"
              rel="noopener noreferrer"
              id="nav-header-dashboard"
              className="mr-3"
            >
              Help Center
            </Nav.Link>
          )}
        </Nav>
        <Nav className="mr-sm-2 common-navbar-nav">
          {isLoggedIn && (
            <NavDropdown
              id="nav-dropdown-user-profile"
              className="dropdown-toggle-green nav-dropdown-user-profile hide-module-mobile"
              alignRight
              title={
                <>
                  <UserProfilePicture
                    src={userProfilePic}
                    alt={userName}
                    height="40px"
                    width="40px"
                    firstname={firstname}
                    lastname={lastname}
                    style={{ marginRight: '5px' }}
                  />
                  <div
                    className="d-flex flex-column"
                    style={{ lineHeight: '1.3' }}
                  >
                    <span
                      style={{
                        fontFamily: 'PoppinsSemiBold',
                        color: '#fff',
                      }}
                    >
                      {firstname} {lastname}
                    </span>
                    <CommonTooltip tooltipText={agency?.agency_name}>
                      <span
                        style={{
                          fontFamily: 'PoppinsRegular',
                          fontSize: '12px',
                          color: '#fff',
                          width: '110px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {agency?.agency_name ?? ''}
                      </span>
                    </CommonTooltip>
                  </div>
                </>
              }
            >
              <NavDropdown.Item href={h.getRoute(routes.settings.profile)}>
                Profile
              </NavDropdown.Item>
              {hasAdminAccess && (
                <NavDropdown.Item
                  href={h.getRoute(routes.settings.user_management)}
                  className="hide-module-mobile"
                >
                  User Management
                </NavDropdown.Item>
              )}
              {/*{hasAdminAccess && (*/}
              <NavDropdown.Item href={h.getRoute(routes.settings.integrations)}>
                Integrations
              </NavDropdown.Item>
              <NavDropdown.Item href={h.getRoute(routes.settings.billing)}>
                Billing
              </NavDropdown.Item>
              <NavDropdown.Item href={h.getRoute(routes.settings.index)}>
                Settings
              </NavDropdown.Item>
              {/*)}*/}
              {/* <NavDropdown.Item href={h.getRoute(routes.logout)}> */}
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          )}
          {isLoggedIn && (
            <div className="show-module-mobile">
              <Nav.Link
                href={h.getRoute(routes.settings.profile)}
                className="ml-3 mr-3"
              >
                Profile
              </Nav.Link>
              {hasAdminAccess && (
                <Nav.Link
                  href={h.getRoute(routes.settings.user_management)}
                  className="ml-3 mr-3"
                >
                  User Management
                </Nav.Link>
              )}

              <Nav.Link
                href={h.getRoute(routes.settings.integrations)}
                className="ml-3 mr-3"
              >
                Integration
              </Nav.Link>
              <Nav.Link
                href={h.getRoute(routes.settings.integrations)}
                className="ml-3 mr-3"
              >
                Billing
              </Nav.Link>
              <Nav.Link
                href={h.getRoute(routes.settings.index)}
                id="nav-header-comments"
                className="ml-3 mr-3"
              >
                Settings
              </Nav.Link>
              {/* <Nav.Link href={h.getRoute(routes.logout)} className="ml-3 mr-3"> */}
              <Nav.Link onClick={handleLogout} className="ml-3 mr-3">
                Logout
              </Nav.Link>
            </div>
          )}
        </Nav>
        {!isLoggedIn && (
          <h.form.CustomForm inline>
            <h.form.CustomButton
              className="mr-sm-2"
              variant="outline-primary"
              onClick={async (e) => {
                e.preventDefault();
                await router.push(h.getRoute(routes.login));
              }}
            >
              Log In
            </h.form.CustomButton>
          </h.form.CustomForm>
        )}
        {/*{!isLoggedIn && <h.form.CustomForm inline>*/}
        {/*	<h.form.CustomButton variant="primary" onClick={async (e) => {*/}
        {/*		e.preventDefault();*/}
        {/*		await router.push(h.getRoute(routes.get_started))*/}
        {/*	}}>Get Started</h.form.CustomButton>*/}
        {/*</h.form.CustomForm>}*/}
      </Navbar.Collapse>
    </Navbar>
  );
}
