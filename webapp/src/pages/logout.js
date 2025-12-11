import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers';
import { api } from '../api';
import { routes } from '../configs/routes';
import { config } from '../configs/config';

export default function Logout() {
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    (async () => {
      // setLoading(true);
      await api.auth.logout({ access_token: h.cookie.getAccessToken() }, false);
      h.cookie.deleteAccessToken();
      // setLoading(false);
      h.intercom.destroy();
      h.intercom.init(config.intercom.appId);
      window.location.href = h.getRoute(routes.home);
    })();
  });

  return (
    <div>
      <Header title="Logout" />
      <Body className="container pt-5 pb-5 min-vh-100" isLoading={isLoading}>
        <div className="row justify-content-center pb-5">
          <div className="col-12 col-sm-6 col-md-5">
            <h1>Signing out ...</h1>
          </div>
        </div>
      </Body>
      <Footer isLoading={isLoading} setLoading={setLoading} />
    </div>
  );
}
