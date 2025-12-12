import React from 'react';
import {Nav, Navbar, NavDropdown} from 'react-bootstrap';
import {h} from '../../helpers';
import {routes} from '../../configs/routes';
import {useRouter} from 'next/router';

/**
 * Saved property nav bar
 * @returns {JSX.Element}
 * @constructor
 */
export default function SavedPropertyNavBar(props) {
  return (
    <div>
      <Navbar
        className="properties-nav-bar-top"
        expand="md"
        style={{backgroundColor: '#ffffff'}}
      >
        <Navbar.Brand className="text-right" href="#saved-properties">
          Saved Properties
        </Navbar.Brand>
        {/*<Navbar.Toggle aria-controls="basic-navbar-nav" />*/}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link
              href="#invite"
              className="properties-nav-bar-link ml-2 mr-2 text-center"
            >
              <img
                className="img-fluid mr-2 pb-1"
                src="/assets/images/icons/icon-invite.svg"
              ></img>
              Invite
            </Nav.Link>
            <Nav.Link
              href="#activity"
              className="properties-nav-bar-link ml-2 mr-2 text-center"
            >
              Activity
            </Nav.Link>
            <Nav.Link
              href="#discussion"
              className="properties-nav-bar-link ml-2 mr-2 text-center"
            >
              Discussion
            </Nav.Link>
            <NavDropdown
              title={<img src="/assets/images/icons/icon-settings.svg"></img>}
              id="basic-nav-dropdown"
              className="properties-nav-bar-link ml-2 mr-2 text-center"
            >
              <NavDropdown.Item href="#">Profile</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
