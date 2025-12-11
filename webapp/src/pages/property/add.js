import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import CommonTable, {
  SelectColumnFilter,
} from '../../components/Common/CommonTable';
import PropertyForm from '../../components/Property/PropertyForm';
import { routes } from '../../configs/routes';
import CommonBreadcrumb from '../../components/Common/CommonBreadcrumb';

export default function PropertyAdd() {
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
  }, []);

  return (
    <div>
      <Header title="Add Property" />
      <Body className="container pt-5 pb-5 min-vh-100" isLoading={isLoading}>
        <CommonBreadcrumb
          breadcrumbs={[
            {
              text: 'Properties',
              route: h.getRoute(routes.dashboard.properties),
            },
            { text: 'Add property' },
          ]}
        />
        <PropertyForm formMode={h.form.FORM_MODE.ADD} setLoading={setLoading} />
      </Body>
      <Footer />
    </div>
  );
}
