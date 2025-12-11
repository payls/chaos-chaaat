import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { h } from '../helpers';
import { routes } from '../configs/routes';
import { api } from '../api';

import { Header, Body, Footer } from '../components/Layouts/Layout';
import PricingDetails from '../components/Billing/PricingDetails';

export default React.memo(() => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const scriptUrl = 'https://js.stripe.com/v3/pricing-table.js';
  useEffect(() => {
    (async () => {
      setLoading(true);
      h.auth.isLoggedInElseRedirect();
      if (!(await h.userManagement.hasMarketingAccess())) {
        await router.replace(h.getRoute(routes.dashboard.leads.my_leads));
      }

      const apiRes = await api.agencyUser.getCurrentUserAgencyNoRedirect(
        {},
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        if (apiRes.data.agencyUser) {
          await getSubscription(apiRes.data.agencyUser.agency_fk);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function getSubscription(agency_id) {
    setLoading(true);
    const subsRes = await api.agency.getSubscription(
      {
        agency_id,
      },
      false,
    );
    if (subsRes.data.plan) {
      setSubscription(subsRes.data.subscription);
      setLoading(false);
    } else {
      // window.location.href = h.getRoute(routes.pricing);
      setLoading(false);
    }
  }

  useEffect(() => {}, []);

  return (
    <div
      className="contacts-root layout-v"
      style={{ height: '100%', background: '#fff' }}
    >
      <Header className="common-navbar-header" />
      <Body className="container-fluid" isLoading={isLoading}>
      <PricingDetails
        setLoading={setLoading}
        isLoading={isLoading}
        subscription={subscription}
      />
      </Body>
      <Footer />
    </div>
  );
});
