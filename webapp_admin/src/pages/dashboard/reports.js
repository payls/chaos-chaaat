import React, { useState, useEffect } from 'react';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import ReportListing from '../../components/Report/ReportListing';
import CreateReportModal from '../../components/Report/CreateReportModal';

export default function DashboardSales() {
  const router = useRouter();
  const [isLoading, setLoading] = useState();
  const [shouldReload, setShouldReload] = useState(false);
  const [reports, setReports] = useState([]);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);

  const doneReloading = () => {
    setShouldReload(false);
  };

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    h.userManagement.hasAdminAccessElseRedirect();
  }, []);

  return (
    <>
      {showCreateReportModal && (
        <CreateReportModal
          setLoading={setLoading}
          onCloseModal={() => {
            setShowCreateReportModal(!showCreateReportModal);
            setShouldReload(true);
          }}
        ></CreateReportModal>
      )}
      <div className="dashboard-root">
        <Header />
        <Body isLoading={isLoading}>
          <div className="container dashboard-container  dashboard-contacts-container">
            <div className="mb-5 dashboard-title">
              <FontAwesomeIcon
                icon={faChartLine}
                color="#ADC7A6"
                size="2x"
                style={{ width: 20 }}
              />
              <div>
                <h1>Reports</h1>
                <span>
                  {reports.length} Report
                  {reports.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="p-3">
              <div className="row">
                <button
                  className="common-icon-button"
                  style={{ width: 170 }}
                  onClick={async () => {
                    setShowCreateReportModal(true);
                  }}
                >
                  New report
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    color="#fff"
                    fontSize="20px"
                    style={{ width: 12 }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-list-container">
            <div className="bg-white">
              <div className="container  dashboard-contacts-container">
                <div className="pl-3 pr-3 pb-2">
                  <div className="row">
                    <div className="tab-body" style={{ marginTop: '3em' }}>
                      <ReportListing
                        shouldReload={shouldReload}
                        doneReloading={doneReloading}
                        updateParentReports={setReports}
                        setLoading={setLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
