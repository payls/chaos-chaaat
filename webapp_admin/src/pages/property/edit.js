import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import PropertyForm from '../../components/Property/PropertyForm';
import { routes } from '../../configs/routes';
import CommonBreadcrumb from '../../components/Common/CommonBreadcrumb';

export default function PropertyEdit() {
  const [isLoading, setLoading] = useState();
  const [propertyId, setPropertyId] = useState();

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    setPropertyId(h.general.findGetParameter('property_id'));
  }, []);

  return (
    <div>
      <Header />
      <Body isLoading={isLoading}>
        <CommonBreadcrumb
          breadcrumbs={[
            {
              text: 'Properties',
              route: h.getRoute(routes.dashboard.properties),
            },
            { text: 'View property' },
          ]}
        />
        <PropertyForm
          formMode={h.form.FORM_MODE.EDIT}
          setLoading={setLoading}
          propertyId={propertyId}
        />
      </Body>
      <Footer />
    </div>
  );
}
