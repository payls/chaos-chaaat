import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { h } from '../helpers';
import { routes } from '../configs/routes';

import { Header, Body, Footer } from '../components/Layouts/Layout';
import Subscription from '../components/Billing/Subscription';

export default React.memo(() => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const scriptUrl = 'https://js.stripe.com/v3/pricing-table.js';
  useEffect(() => {
    (async () => {
      h.auth.isLoggedInElseRedirect();
      if (!(await h.userManagement.hasMarketingAccess())) {
        await router.replace(h.getRoute(routes.dashboard.leads.my_leads));
      }
    })();
  }, []);

  useEffect(() => {}, []);

  return (
    <div
      className="contacts-root layout-v"
      style={{ height: '100%', background: '#fff' }}
    >
      <Header className="common-navbar-header" />
      <Body className="container-fluid" isLoading={isLoading}>
      <Subscription
        setLoading={setLoading}
        isLoading={isLoading}
      />
      </Body>
      <Footer />
    </div>
  );
});
