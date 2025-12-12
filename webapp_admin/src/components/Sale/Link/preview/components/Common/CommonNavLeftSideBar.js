import React from 'react';
import {useRouter} from 'next/router';
import {Nav, Badge} from 'react-bootstrap';

import IconSideBarProperties from '../Icons/IconSideBarProperties';
import IconSideBarPropertiesWhite from '../Icons/IconSideBarPropertiesWhite';
import IconRoundSave from '../Icons/IconRoundSave';
import IconRoundSaveWhite from '../Icons/IconRoundSaveWhite';

/**
 * Common Nav left side bar
 * @returns {JSX.Element}
 * @constructor
 */
export default function CommonNavLeftSideBar(props) {
  const router = useRouter();

  return (
    <div className="mt-5 pt-4">
      <Nav
        className="d-block sidebar-bg sidebar font-MontserratRegular"
        activeKey="saved-search-create"
      >
        <Nav.Item>
          <span
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {router.pathname === '/dashboard' ? (
              <IconSideBarPropertiesWhite/>
            ) : (
              <IconSideBarProperties/>
            )}
            <Nav.Link
              className="d-inline ml-2 sidebar-nav-item"
              style={{
                color: router.pathname === '/dashboard' ? '#DADADA' : 'default',
              }}
              eventKey="dashboard"
              href="/dashboard"
            >
              Dashboard
            </Nav.Link>
          </span>
        </Nav.Item>
        {/* <Nav.Item className="mb-2">
                   <Nav.Link className="sidebar-nav-Link pl-0" eventKey="properties-owned" href="/owned">Owned</Nav.Link>
                   <Nav.Link className="sidebar-nav-Link pl-0" eventKey="properties-rented-out" href="/rented-out">Rented Out</Nav.Link>
                   <Nav.Link className="sidebar-nav-Link pl-0" eventKey="properties-pending" href="/pending">Pending</Nav.Link>
                </Nav.Item>

                <Nav.Item className="sidebar-subtitle">
                   <span>
                       <img className="d-inline img-fluid sidebar-subtitle-icon" src="/assets/images/icons/icon-sidebar-jobs.svg"/>
                       <Nav.Link className="d-inline ml-2 sidebar-nav-item" eventKey="jobs">Jobs</Nav.Link>
                       <Badge pill variant="danger">{2}</Badge>
                   </span>
                </Nav.Item>

                <Nav.Item className="sidebar-subtitle">
                   <span>
                       <img className="d-inline img-fluid sidebar-subtitle-icon" src="/assets/images/icons/icon-sidebar-inspections.svg"/>
                       <Nav.Link className="d-inline ml-2 sidebar-nav-item" eventKey="inspections">Inspections</Nav.Link>
                   </span>
                </Nav.Item> */}

        <Nav.Item className="sidebar-subtitle">
          <span
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {router.pathname === '/dashboard/properties' ? (
              <IconRoundSaveWhite/>
            ) : (
              <IconRoundSave/>
            )}
            <Nav.Link
              className="d-inline ml-2 sidebar-nav-item"
              style={{
                color:
                  router.pathname === '/dashboard/properties'
                    ? '#DADADA'
                    : 'default',
              }}
              eventKey="saved-searches"
              href="/dashboard/properties"
            >
              Your Properties
            </Nav.Link>
          </span>
        </Nav.Item>
        {/* <Nav.Item className="mb-2">
                   <Nav.Link className="sidebar-nav-Link pl-0" eventKey="saved-searches-create" href="/create-new">Create new</Nav.Link>
                </Nav.Item> */}
      </Nav>
    </div>
  );
}
