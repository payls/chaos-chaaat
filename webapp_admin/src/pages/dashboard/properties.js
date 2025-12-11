import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import CommonBreadcrumb from '../../components/Common/CommonBreadcrumb';
import CommonFloatingAction from '../../components/Common/CommonFloatingAction';
import PropertyListing from '../../components/Property/PropertyListing';
import { routes } from '../../configs/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

export default function DashboardProperties() {
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
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
          ]}
        />
        <CommonFloatingAction
          text={<FontAwesomeIcon icon={faPlus} />}
          route={h.getRoute(routes.property.add)}
        />
        <div className="dashboard-properties">
          <h1>Properties</h1>
          <div className="d-flex flex-start">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">
                  <FontAwesomeIcon icon={faSearch} style={{ width: 20 }} />
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                placeholder="keyword filter"
              />
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Project Name</th>
                <th scope="col">City</th>
                <th scope="col">Flo</th>
                <th scope="col">Sq</th>
                <th scope="col">Be</th>
                <th scope="col">Bat</th>
                <th scope="col">Price</th>
                <th scope="col">Leads Assigned</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The Issara Sat</td>
                <td>Bangk</td>
                <td>29</td>
                <td>46.</td>
                <td>2</td>
                <td>1</td>
                <td>200 0</td>
                <td>Tim James (x) Jeff W</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* <PropertyListing setLoading={setLoading} /> */}
      </Body>
      <Footer />
    </div>
  );
}
