import {Container, Nav, Navbar, NavDropdown} from 'react-bootstrap';
import {h} from '../../helpers';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import {routes} from '../../configs/routes';
import {config} from '../../configs/config';

export default function HeaderContent() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userProfilePicture, setUserProfilePicture] = useState();
  const [translations, setTranslations] = useState({
    about_us_menu: {text: 'About Us'},
    pave_bespoke_menu: {text: 'Pave Bespoke'},
    why_pave_menu: {text: 'Why Pave'},
    learn_menu: {text: 'Learn'},
    dashboard_menu: {text: 'Dashboard'},
    properties_menu: {text: 'Properties'},
    tasks_menu: {text: 'Tasks'},
    timeline_menu: {text: 'Timeline'},
    logout_menu: {text: 'Logout'},
    log_in_menu: {text: 'Log In'},
  });

  useEffect(() => {
    h.intercom.destroy();
    h.intercom.init(config.intercom.appId);
    const isAuthenticated = h.auth.isAuthenticated();
    if (isAuthenticated) {
      setIsLoggedIn(isAuthenticated);
      const user = h.auth.getUserInfo() || {};
      setUserName(h.user.formatFullName(user));
      setUserProfilePicture(user.profile_picture_url);
      if (window.Intercom)
        window.Intercom('update', {
          app_id: config.intercom.appId,
          user_id: user.user_id,
          name: h.user.formatFullName(user),
          email: user.email,
          avatar: {
            type: 'avatar',
            image_url: user.profile_picture_url,
          },
          environment: config.env,
        });
    }
  }, []);

  return (
    <Navbar className="pt-5 pt-lg-4 pb-5 pb-lg-3" expand="lg">
      <Container>
        <Navbar.Brand
          className="d-block d-lg-none"
          href={h.getRoute(routes.home)}
        >
          <img
            src="https://cdn.yourpave.com/assets/pave-logo-v2.png"
            alt="Pave"
            style={{maxWidth: 130, marginLeft: -6}}
          />
        </Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto row">
            <div className="col-12 d-none d-lg-block">
              <a href={h.getRoute(routes.home)}>
                <img
                  src="https://cdn.yourpave.com/assets/pave-logo-v2.png"
                  alt="Pave"
                  style={{maxWidth: 130, marginLeft: -6}}
                />
              </a>
            </div>
            {/*<Nav.Link className="pl-2" href="/buy">Buy</Nav.Link>*/}
            {/*<Nav.Link className="pl-2" href="/rent">Rent</Nav.Link>*/}
            <Nav.Link className="pl-2" href={h.getRoute(routes.about_us)}>
              {h.translate.displayText(translations.about_us_menu)}
            </Nav.Link>
            <Nav.Link className="pl-2" href={h.getRoute(routes.pave_bespoke)}>
              {h.translate.displayText(translations.pave_bespoke_menu)}
            </Nav.Link>
            <Nav.Link className="pl-2" href={h.getRoute(routes.why_pave)}>
              {h.translate.displayText(translations.why_pave_menu)}
            </Nav.Link>
            <Nav.Link
              className="pl-2"
              target="_blank"
              href={h.getRoute(routes.help_center)}
            >
              {h.translate.displayText(translations.learn_menu)}
            </Nav.Link>
            {/*{isLoggedIn && <NavDropdown title="Manage" id="nav-dropdown-manage">*/}
            {/*<NavDropdown.Item onClick={async () => await router.push('/manage/merchants')}>Merchants</NavDropdown.Item>*/}
            {/*<NavDropdown.Item onClick={async () => await router.push('/manage/owners')}>Owners</NavDropdown.Item>*/}
            {/*<NavDropdown.Item onClick={async () => await router.push('/manage/deals')}>Deals</NavDropdown.Item>*/}
            {/*<NavDropdown.Divider />*/}
            {/*<NavDropdown.Item href="#action/3.4">Separated Link</NavDropdown.Item>*/}
            {/*</NavDropdown>}*/}
            {isLoggedIn && (
              <Nav.Link
                className="pl-2"
                onClick={() => router.push(h.getRoute(routes.dashboard.index))}
              >
                {h.translate.displayText(translations.dashboard_menu)}
              </Nav.Link>
            )}
            {isLoggedIn && (
              <Nav.Link
                className="pl-2"
                href={h.getRoute(routes.dashboard.properties)}
              >
                {h.translate.displayText(translations.properties_menu)}
              </Nav.Link>
            )}
            {isLoggedIn && (
              <Nav.Link
                className="pl-2"
                href={h.getRoute(routes.dashboard.tasks)}
              >
                {h.translate.displayText(translations.tasks_menu)}
              </Nav.Link>
            )}
            {isLoggedIn && (
              <Nav.Link
                className="pl-2"
                href={h.getRoute(routes.dashboard.timeline)}
              >
                {h.translate.displayText(translations.timeline_menu)}
              </Nav.Link>
            )}
          </Nav>
          <Nav className="mr-auto"></Nav>
          <Nav className="mr-sm-2">
            {/*<Nav.Link href="/buy">Buy</Nav.Link>*/}
            {/*<Nav.Link href="/rent">Rent</Nav.Link>*/}
            {/*<Nav.Link href="/about-us">About Us</Nav.Link>*/}
            {/*<Nav.Link href="/learn">Learn</Nav.Link>*/}
            {/*<Nav.Link href="/pricing">Pricing</Nav.Link>*/}
            {/*{isLoggedIn && <Nav.Link>{userName}</Nav.Link>}*/}
            {/*{isLoggedIn && <Nav.Link href={h.getRoute(routes.logout)}>Logout</Nav.Link>}*/}
            {isLoggedIn && (
              <NavDropdown
                id="nav-dropdown"
                title={
                  <div
                    className="row d-flex align-items-center"
                    style={{maxWidth: 200}}
                  >
                    <div className="col-4">
                      <img
                        style={{maxWidth: 50}}
                        className="rounded-circle"
                        src={userProfilePicture}
                      />
                    </div>
                    <div className="col-8" style={{wordWrap: 'break-word'}}>
                      <p
                        className="my-auto text-wrap font-MontserratRegular"
                        style={{fontSize: 12}}
                      >
                        {userName}
                      </p>
                    </div>
                  </div>
                }
              >
                <NavDropdown.Item href={h.getRoute(routes.logout)} eventKey="1">
                  {h.translate.displayText(translations.logout_menu)}
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          {!isLoggedIn && (
            <h.form.CustomForm inline>
              <h.form.CustomButton
                className="mr-sm-2 mt-2 mb-3"
                variant="outline-primary"
                onClick={async (e) => {
                  e.preventDefault();
                  await router.push(h.getRoute(routes.login));
                }}
              >
                {h.translate.displayText(translations.log_in_menu)}
              </h.form.CustomButton>
            </h.form.CustomForm>
          )}
          {/*{!isLoggedIn && <h.form.CustomForm inline>*/}
          {/*	<h.form.CustomButton className="mt-2 mb-3" variant="primary" onClick={async (e) => {*/}
          {/*		e.preventDefault();*/}
          {/*		await router.push(h.getRoute(routes.get_started))*/}
          {/*	}}>Get Started</h.form.CustomButton>*/}
          {/*</h.form.CustomForm>}*/}
        </Navbar.Collapse>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      </Container>
    </Navbar>
  );
}
