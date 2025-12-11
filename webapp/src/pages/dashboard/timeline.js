import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';

export default function DashboardIndex() {
  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
  }, []);

  return (
    <div>
      <Header title="Timeline" />
      <Body className="container pt-5 pb-5 min-vh-100">
        <h1>Timeline</h1>
        <p>
          This page is currently pending launch and we’ll notify you as soon as
          that happens. Here you’ll see past and present events related to each
          property, included related documents, receipts and invoices. You’ll
          also be able to create your own events or store your own documents
          here as well for easy access.
        </p>
      </Body>
      <Footer />
    </div>
  );
}
