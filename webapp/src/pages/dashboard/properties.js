import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import CommonBreadcrumb from '../../components/Common/CommonBreadcrumb';
import CommonFloatingAction from '../../components/Common/CommonFloatingAction';
import PropertyListing from '../../components/Property/PropertyListing';
import { routes } from '../../configs/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { config } from '../../configs/config';

import CommonNavLeftSideBar from '../../components/Common/CommonNavLeftSideBar';
import SavedPropertyNavBar from '../../components/Property/SavedPropertyNavBar';
import SavedPropertyTabs from '../../components/Property/SavedPropertyTabs';

export default function DashboardProperties() {
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    // h.auth.isLoggedInElseRedirect();
  }, []);

  return (
    <div style={{ backgroundColor: '#1C1C1C' }}>
      <Header title="Your Properties" />
      <Body className="container pt-5 pb-5 min-vh-100" isLoading={isLoading}>
        {/*<CommonBreadcrumb breadcrumbs={[*/}
        {/*	{ text: 'Properties', route: h.getRoute(routes.dashboard.properties) }*/}
        {/*]} />*/}
        {/*{!h.cmpStr(config.env, 'production') && <CommonFloatingAction text={<FontAwesomeIcon icon={faPlus} />} route={h.getRoute(routes.property.add)} />}*/}
        {/*<h1>Properties</h1>*/}
        {/*{!h.cmpStr(config.env, 'production') && <PropertyListing setLoading={setLoading} />}*/}
        {/*{h.cmpStr(config.env, 'production') && <p>This page is currently under construction and we’ll notify you when this feature is launched. You’ll have the ability to upload properties you’ve bought via Pave, our Partners or even unrelated Real Estate Agents.</p>}*/}

        {/*<div>*/}
        {/*<SavedPropertyNavBar></SavedPropertyNavBar>*/}
        {/*</div>*/}

        <div id="sidebar-wrapper" className="row">
          <div className="col-4 col-sm-4 col-md-3 col-lg-2 col-xl-2">
            <CommonNavLeftSideBar />
          </div>
          <div className="col-8 col-md-9 col-xl-10">
            <h1 className="text-white">Saved Properties</h1>

            <p className="m-2"></p>

            <SavedPropertyTabs />
          </div>
        </div>
      </Body>
      <Footer isLoading={isLoading} setLoading={setLoading} />
    </div>
  );
}
