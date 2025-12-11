import React, { useEffect } from 'react';
import { Bar } from '@reactchartjs/react-chart.js';

import CommonNavLeftSideBar from '../../components/Common/CommonNavLeftSideBar';

import IconClipboardList from '../../components/Icons/IconClipboardList';
import IconFoundationDollar from '../../components/Icons/IconFoundationDollar';
import IconHammerScrewdriver from '../../components/Icons/IconHammerScrewdriver';
import IconHandCoinFill from '../../components/Icons/IconHandCoinFill';
import IconOwnedHouse from '../../components/Icons/IconOwnedHouse';
import IconPendingHouse from '../../components/Icons/IconPendingHouse';
import IconRentedHouse from '../../components/Icons/IconRentedHouse';

import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { config } from '../../configs/config';

export default function DashboardIndex() {
  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
  }, []);

  const chartData = [
    3000, 3500, 3200, 100, -700, -200, 2500, 1200, 3000, 2000, 1000, 3850,
  ];

  const chartDataConfig = {
    labels: [
      '2020-01-01',
      '2020-02-01',
      '2020-03-01',
      '2020-04-01',
      '2020-05-01',
      '2020-06-01',
      '2020-07-01',
      '2020-08-01',
      '2020-09-01',
      '2020-10-01',
      '2020-11-01',
      '2020-12-01',
    ],
    datasets: [
      {
        data: chartData,
        backgroundColor: chartData.map((item) =>
          item > 0 ? '#828282' : '#404040',
        ),
      },
    ],
  };

  return (
    <div style={{ backgroundColor: '#1C1C1C' }}>
      <Header title="Dashboard" />
      <Body className="container pt-5 pb-5 min-vh-100">
        {h.cmpStr(config.env, 'production') && (
          <p>
            This page is currently under construction and we’ll notify you when
            this feature is launched. We’ll be providing you a useful overview
            of the properties you either own or are a tenant of.
          </p>
        )}
        {!h.cmpStr(config.env, 'production') && (
          <div id="sidebar-wrapper" className="row">
            <div className="col-4 col-sm-4 col-md-3 col-lg-2 col-xl-2">
              <CommonNavLeftSideBar />
            </div>
            <div className="col-8 col-md-9 col-xl-10">
              <h1 className="text-white">Dashboard</h1>

              <p className="m-4"></p>

              <div className="row">
                <div className="col-sm mr-2 mb-2 dashboard-small-card">
                  <div
                    className="dashboard-small-card-header"
                    style={{ color: '#F2C4AB' }}
                  >
                    <IconOwnedHouse className="mr-3" />
                    <span>5</span>
                  </div>
                  <span className="dashboard-small-card-value">Owned</span>
                </div>
                <div className="col-sm mr-2 ml-2 mb-2 dashboard-small-card">
                  <div
                    className="dashboard-small-card-header"
                    style={{ color: '#ADC7A6' }}
                  >
                    <IconRentedHouse className="mr-3" />
                    <span>
                      3 <span>out of 5</span>
                    </span>
                  </div>
                  <span className="dashboard-small-card-value">Rented out</span>
                </div>
                <div className="col-sm ml-2 mb-2 dashboard-small-card">
                  <div
                    className="dashboard-small-card-header"
                    style={{ color: '#F2C4AB' }}
                  >
                    <IconPendingHouse className="mr-3" />
                    <span>3</span>
                  </div>
                  <span className="dashboard-small-card-value">Pending</span>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-lg dashboard-medium-card">
                  <div className="card-badge-container">
                    <div className="card-badge">coming SOON</div>
                  </div>
                  <div className="row">
                    <div className="col-md mb-2">
                      <div className="dashboard-medium-card-header">
                        <IconFoundationDollar className="mr-2" />
                        <span className="dashboard-medium-card-header-light-title">
                          Total value of your property portfolio is
                        </span>
                      </div>
                      <span className="dashboard-medium-card-bold-value">
                        USD X,X00,000
                      </span>
                    </div>
                    <div className="col-md mb-2">
                      <div className="dashboard-medium-card-header">
                        <IconHandCoinFill className="mr-2" />
                        <span className="dashboard-medium-card-header-light-title">
                          Rental income this month of
                        </span>
                      </div>
                      <span className="dashboard-medium-card-bold-value">
                        USD X,X00,000
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md mr-2 mb-2 dashboard-medium-card">
                  <div className="card-badge-container">
                    <div className="card-badge">SOON</div>
                  </div>
                  <div className="dashboard-medium-card-header">
                    <IconHammerScrewdriver className="mr-2" />
                    <span className="dashboard-medium-card-header-bold-title">
                      Jobs
                    </span>
                  </div>
                  <div className="dashboard-medium-card-light-value">
                    Manage your entire maintenance workflow in Jobs with clever
                    automation tools to save you time.
                  </div>
                </div>

                <div className="col-md ml-2 mb-2 dashboard-medium-card">
                  <div className="card-badge-container">
                    <div className="card-badge">SOON</div>
                  </div>
                  <div className="dashboard-medium-card-header">
                    <IconClipboardList className="mr-2" />
                    <span className="dashboard-medium-card-header-bold-title">
                      Inspections
                    </span>
                  </div>
                  <div className="dashboard-medium-card-light-value">
                    Inspections allows you to plan, schedule and conduct
                    inspections, all in the one place
                  </div>
                </div>
              </div>

              <div className="row mt-4 mb-2 dashboard-large-card">
                <div className="card-badge-container">
                  <div className="card-badge">coming SOON</div>
                </div>
                <div className="col-md">
                  <div className="dashboard-large-card-header row align-items-end">
                    <div className="col-md">
                      <span className="dashboard-large-card-header-title">
                        Financial Activity
                      </span>
                      <div className="dashboard-large-card-chart-labels">
                        <div className="dashboard-large-card-chart-label">
                          <div
                            className="dashboard-large-card-chart-label-color"
                            style={{ backgroundColor: '#828282' }}
                          ></div>
                          <span>Money In</span>
                        </div>
                        <div className="dashboard-large-card-chart-label">
                          <div
                            className="dashboard-large-card-chart-label-color"
                            style={{ backgroundColor: '#404040' }}
                          ></div>
                          <span>Money Out</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md dashboard-large-card-header-financial-activities-container">
                      <span className="large-card-header-financial-activities">
                        watch your financial activities in all properties you
                        own
                      </span>
                      <span className="large-card-header-total-income">
                        total income: XXX,000
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-large-card-chart">
                    <Bar
                      data={chartDataConfig}
                      options={{
                        legend: {
                          display: false,
                        },
                        scales: {
                          yAxes: [
                            {
                              ticks: {
                                fontFamily: 'MontserratRegular',
                                fontColor: '#828282',
                                fontSize: 9,
                                padding: 5,
                                callback: function (value, index, values) {
                                  return value + '$';
                                },
                              },
                              gridLines: {
                                drawOnChartArea: false,
                              },
                            },
                          ],
                          xAxes: [
                            {
                              type: 'time',
                              position: 'bottom',
                              time: {
                                displayFormats: { day: 'MM/YY' },
                                tooltipFormat: 'DD/MM/YY',
                                unit: 'month',
                              },
                              ticks: {
                                fontFamily: 'MontserratRegular',
                                fontColor: '#828282',
                                fontSize: 9,
                                padding: 5,
                                autoSkip: false,
                                minRotation: 0,
                                maxRotation: 0,
                              },
                              gridLines: {
                                drawOnChartArea: false,
                              },
                            },
                          ],
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Body>
      <Footer />
    </div>
  );
}
