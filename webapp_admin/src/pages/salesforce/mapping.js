import React, { useState, useEffect, } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes';
// ICON
import {
  faInfo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonIconButton from '../../components/Common/CommonIconButton';

// Components
import SFDCDropdown from '../../components/Salesforce/SFDCDropdown';

export default function ReportMapping() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [agency, setAgency] = useState(null);
  const [reportList, setReportList] = useState('');
  const [reportName, setReportName] = useState('');
  const [reportId, setReportId] = useState('');
  const [reportMapping, setReportMapping] = useState([]);
  const [mappingFields, setMappingFields] = useState([
    {
      label: 'First Name',
      field: 'first_name',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    {
      label: 'Last Name',
      field: 'last_name',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    {
      label: 'Mobile',
      field: 'mobile_number',
      mappedTo: '',
      required: true,
      defaultValue: '',
    },
    {
      label: 'City Code',
      field: 'city_code',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    {
      label: 'Email',
      field: 'email',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
    {
      label: 'language',
      field: 'language',
      mappedTo: '',
      required: false,
      defaultValue: '',
    },
  ]);

  useEffect(() => {
    const { report, name, list } = router.query;
    if (h.notEmpty(report)) {
      setReportName(name);
      setReportId(report);
      setReportList(list);
      h.auth.isLoggedInElseRedirect();
      (async () => {
        await h.userManagement.hasAdminAccessElseRedirect();
        const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
        if (h.cmpStr(apiRes.status, 'ok')) {
          const agency = apiRes.data.agencyUser.agency;
          setAgency(agency);
          await getReportMapping(agency, report);
        }
      })();
    }
  }, [router]);

  function onChange(v, index) {
    const cFields = Array.from(mappingFields);
    cFields[index].mappedTo = { label: v, value: v };
    setMappingFields(cFields);
  }

  async function getReportMapping(agency, report) {
    setLoading(constant.API_STATUS.PENDING);
    const apiRes = await api.contact.getSalesforceReportMapping(
      agency.agency_id,
      report,
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      setReportMapping(apiRes.data.results);
    }

    setLoading(constant.API_STATUS.FULLFILLED);
  }

  function getResultSample(mappedTo, key) {
    const res = reportMapping.slice(0, 20);
    return res.map((m) => {
      if (h.notEmpty(m[mappedTo?.label ?? key])) {
        return m[mappedTo?.label ?? key];
      }
    });
  }

  async function handleConfirmMapping() {
    h.general.prompt(
      {
        message: `Are you sure you want to submit mapping?`,
      },

      async (status) => {
        if (status) {
          setLoading(constant.API_STATUS.PENDING);

          const apiRes = await api.contact.confirmMapping(
            agency.agency_id,
            reportId,
            {
              report_name: reportName,
              report_field_map: mappingFields
                .filter((f) => h.notEmpty(f.mappedTo))
                .map((m) => ({
                  ...m,
                  mappedTo: m.mappedTo?.value,
                })),
              contact_list_id: reportList,
              list_count: reportMapping.length,
            },
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            // setReportMapping(apiRes.data.results);
            h.general.alert('success', {
              message: 'Report mapping successfully saved.',
            });

            router.push(
              h.getRoute(routes.templates.contact.list_view, {
                list_id: reportList,
              }),
              undefined,
              { shallow: true },
            );
          }

          setLoading(constant.API_STATUS.FULLFILLED);
        }
      },
    );
  }

  return (
    <>
      <div className="contacts-root layout-v">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading === constant.API_STATUS.PENDING}>
          <div className="n-banner">
            <div className="container dashboard-contacts-container contacts-container">
              <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
                <div>
                  <h1>Report Mapping</h1>
                  <span>
                    Map which field from the Salesforce report should be
                    imported
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container no-oxs">
            <div className="container dashboard-contacts-container mb-1">
              <div className="pl-3 pr-3">
                <div className="row">
                  <div className="tab-container">
                    <div className="tab-list"></div>
                    {h.notEmpty(reportMapping) && (
                      <div className="btn-list">
                        <div className="button-icon-container">
                          <CommonIconButton
                            className="c-red"
                            style={{ paddingLeft: '10px', width: '150px' }}
                            onClick={handleConfirmMapping}
                            disabled={isLoading === constant.API_STATUS.PENDING}
                          >
                            Confirm mapping
                          </CommonIconButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white">
              <div className="container dashboard-contacts-container ">
                <div className="pl-3 pr-3 pb-2">
                  <div className="row">
                    <div className="tab-body">
                      {h.notEmpty(reportMapping) &&
                        isLoading === constant.API_STATUS.FULLFILLED && (
                          <section className="report-mapping my-3">
                            <header>
                              <div class="col">Chaaat.io</div>

                              {mappingFields.map((fields, index) => (
                                <div class="col" key={`header-${index}`}>
                                  <label
                                    class={`cont ${
                                      fields.label === 'Mobile'
                                        ? 'disabled-checkbox'
                                        : ''
                                    }`}
                                  >
                                    {fields.label === 'Mobile' ? (
                                      <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                      />
                                    ) : (
                                      <input type="checkbox" />
                                    )}
                                    <img
                                      class="img-unchecked"
                                      src="https://cdn.yourpave.com/assets/untoggled.png"
                                      width={25}
                                    />
                                    <img
                                      class="img-checked"
                                      src="https://cdn.yourpave.com/assets/toggled.png"
                                      width={25}
                                    />
                                  </label>
                                  {fields.label}
                                </div>
                              ))}
                            </header>
                            <div class="row">
                              <div class="col sf">Salesforce</div>

                              {mappingFields.map((fields, index) => (
                                <div class="col" key={`header-${index}`}>
                                  <SFDCDropdown
                                    k={`dropdwn-${index}`}
                                    reportMapping={reportMapping}
                                    value={fields.mappedTo}
                                    label={fields.label}
                                    onSelect={(m) => onChange(m, index)}
                                  />
                                </div>
                              ))}
                            </div>
                            <div class="row">
                              <div class="col">Results</div>

                              {mappingFields.map((fields, index) => (
                                <div className="col result" key={index}>
                                  {getResultSample(
                                    fields.mappedTo,
                                    fields.label,
                                  ).map((m) => (
                                    <>
                                      {m} <br />
                                    </>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                      {h.isEmpty(reportMapping) &&
                        isLoading === constant.API_STATUS.FULLFILLED && (
                          <div className="no-messages-found center-body">
                            <span>
                              <FontAwesomeIcon
                                icon={faInfo}
                                color="#DEE1E0"
                                style={{ fontSize: '40px' }}
                              />
                            </span>
                            <br />
                            No Salesforce data was fetched.
                            <br />
                            <button
                              type="type"
                              className="chip-button mt-2"
                              onClick={() => {
                                window.location = h.getRoute(
                                  routes.templates.contact.list_view,
                                  {
                                    list_id: reportList,
                                  },
                                );
                              }}
                            >
                              Go back to report list
                            </button>
                          </div>
                        )}
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
