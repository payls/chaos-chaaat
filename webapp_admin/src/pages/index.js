import React from 'react';
import { Header, Body, Footer } from '../components/Layouts/Layout';
import { h } from '../helpers/index';

function Index() {
  return (
    <div>
      <Header />
      <Body>
        <div className="row justify-content-center pb-5">
          <div className="col-12 col-sm-6">
            <div className="p-3" />
            <h2>Chaaat Staff Portal</h2>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}

export default h.auth.withAuth(Index);
