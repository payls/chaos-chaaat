import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { api } from '../api';
import { routes } from '../configs/routes';

export default function Logout() {
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    (async () => {
      // setLoading(true);
      await api.auth.logout({ access_token: h.cookie.getAccessToken() }, false);
      h.cookie.deleteAccessToken();
      // setLoading(false);
      window.location.href = h.getRoute(routes.home);
    })();
  });

  return (
    <div>
      <Header showHeaderContent={false} />
      <Body isLoading={isLoading}>
        <h1>Signing out ...</h1>
      </Body>
      <Footer />
    </div>
  );
}
