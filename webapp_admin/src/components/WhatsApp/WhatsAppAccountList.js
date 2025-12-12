import React, { useEffect, useState, useMemo } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { config } from '../../configs/config';

import {
  faCircle,
  faClock,
  faInfoCircle,
  faTimes,
  faCheckCircle,
  faPlusCircle,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';
import CommonTooltip from '../Common/CommonTooltip';
import WhatsAppOnboardingModal from './WhatsAppOnboardingModalComponent';

export default React.memo(
  ({ handleCloseModal, agencyId, isChaaat, isSuperAdmin }) => {
    const [columns, setColumns] = useState([]);
    const [wabaList, setWabaList] = useState([]);
    const [status, setStatus] = useState(constant.API_STATUS.IDLE);
    const [info, setInfo] = useState(null);
    const [page, setPage] = useState('list');
    const [uibLoading, setUibLoading] = useState(0);
    const [onboardingWabaDetails, setOnboardingWabaDetails] = useState(null);
    const [openConnect, setOpenConnect] = useState(false);

    const [form, setForm] = useState({
      agency_id: '',
      whatsapp_onboarding_id: '',
      waba_name: '',
      waba_number: '',
      agency_whatsapp_api_token: '',
      agency_whatsapp_api_secret: '',
      agency_waba_id: '',
      agency_waba_template_token: '',
      agency_waba_template_secret: '',
    });

    useEffect(() => {
      (async () => {
        await getOnboardingList();
      })();

      const initialColumns = [
        {
          id: 'w-q-display-image',
          Header: 'Image',
          headerWidth: '30px',
          Cell: ({ row: { original } }) => {
            const { display_image } = original;

            return (
              <div className="center-body">
                <img src={display_image} height={50} />
              </div>
            );
          },
        },
        {
          id: 'w-q-facebook-manager-id',
          Header: 'Facebook Manager ID',
          headerWidth: '70px',
          Cell: ({ row: { original } }) => {
            const { facebook_manager_id } = original;

            return (
              <div style={{ textTransform: 'initial' }}>
                {facebook_manager_id}
              </div>
            );
          },
        },
        {
          id: 'w-q-client-company-name',
          Header: 'Client Company Name',
          headerWidth: '70px',
          Cell: ({ row: { original } }) => {
            const { client_company_name } = original;

            return (
              <div style={{ textTransform: 'initial' }}>
                {client_company_name}
              </div>
            );
          },
        },

        {
          id: 'w-q-email',
          Header: 'Email',
          headerWidth: '70px',
          Cell: ({ row: { original } }) => {
            const { email } = original;

            return <div style={{ textTransform: 'initial' }}>{email}</div>;
          },
        },
        {
          id: 'w-q-website',
          Header: 'Website',
          headerWidth: '70px',
          Cell: ({ row: { original } }) => {
            const { website } = original;

            return <div style={{ textTransform: 'initial' }}>{website}</div>;
          },
        },
        {
          id: 'w-q-status',
          Header: 'Status',
          headerWidth: '50px',
          Cell: ({ row: { original } }) => {
            const { status } = original;
            const { icon, color, tooltip } = getStatusInfo(status);
            return (
              <>
                <CommonTooltip tooltipText={tooltip}>
                  <FontAwesomeIcon color={color} icon={icon} />
                </CommonTooltip>{' '}
                <span className="text-normal">
                  {h.general.ucFirstAllWords(status)}
                </span>
              </>
            );
          },
        },
        {
          id: 'w-q-showmore',
          Header: 'Action',
          headerWidth: '50px',
          Cell: ({ row: { original } }) => {
            const isPending = original.status && original.status.toUpperCase() === constant.API_STATUS.PENDING;
            return (
              <span
                style={{
                  fontFamily: 'PoppinsRegular',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  color: '#4285f4',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setInfo(original);
                  setOpenConnect(true);
                  setPage(null);
                }}
              >
                Show more info
              </span>
            );
          },
        },
      ];

      setColumns(initialColumns);
    }, []);

    useEffect(() => {
      (async () => {
        if (
          h.notEmpty(info) &&
          h.notEmpty(info.status) &&
          h.cmpStr(info.status, 'submitted')
        ) {
          await getOnboardingWhatsAppConfig(info?.whatsapp_onboarding_id);
        }
        await getOnboardingList();
      })();
    }, [info]);

    const tableColumns = useMemo(() => columns, [columns]);

    function onChange(v, key) {
      setForm((prev) => ({ ...prev, [key]: v }));
    }

    function onUpdateChange(v, key) {
      setOnboardingWabaDetails((prev) => ({ ...prev, [key]: v }));
    }

    async function getOnboardingList() {
      setStatus(constant.API_STATUS.PENDING);
      setWabaList([]);

      const apiRes = await api.whatsapp.getOnboardingList(agencyId, {}, false);

      if (h.cmpStr(apiRes.status, 'ok')) {
        const list = [...apiRes.data.submissions];

        setWabaList(list);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    }

    async function handleSubmit() {
      setStatus(constant.API_STATUS.PENDING);
      const newForm = {
        ...form,
        agency_id: agencyId,
        whatsapp_onboarding_id: info?.whatsapp_onboarding_id,
      };

      const apiRes = await api.whatsapp.sendWabaForm(newForm, false);

      if (h.cmpStr(apiRes.status, 'ok')) {
        h.general.alert('success', {
          message: 'Successfully confirmed and connected WABA Account',
        });
        setInfo(null);
        await getOnboardingList();
        setPage('list');
      }

      setStatus(constant.API_STATUS.FULLFILLED);
    }

    async function handleMarkAsSubmitted() {
      setStatus(constant.API_STATUS.PENDING);

      const apiRes = await api.whatsapp.updateOnboardingSubmission(
        info?.whatsapp_onboarding_id,
        { status: 'submitted' },
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        h.general.alert('success', {
          message: 'Successfully marked as submitted',
        });
        setInfo({ ...info, status: 'submitted' });
        await getOnboardingList();
        setPage('info');
      }

      setStatus(constant.API_STATUS.FULLFILLED);
    }

    function getStatusInfo(status) {
      switch (status) {
        case 'pending':
          return {
            icon: faClock,
            color: '#f9b458',
            tooltip: 'Waiting for Chaaat team to submit request details',
          };
        case 'submitted':
          return {
            icon: faInfoCircle,
            color: '#009cfa',
            tooltip: 'Request submitted and awaiting confirmation',
          };
        case 'confirmed':
          return {
            icon: faCircle,
            color: '#01d748',
            tooltip: 'Request confirmed and connected',
          };
      }

      return {
        icon: faClock,
        color: '#f9b458',
      };
    }

    function parseHeaders(headers) {
      const h = JSON.parse(headers);

      return h?.headers ?? [];
    }

    async function connectToUIBOnboarding() {
      //step 1 - delete listener trigger
      localStorage.setItem('whatsapp-integration', null);

      //Step 1 - Set UIB Loading to true
      setUibLoading(1);

      const webappAdminBaseUrl = config.env === 'development' ? config.devWebAppAdminUrl : config.webAdminUrl;
      const apiBaseUrl = config.env === 'development' ? config.devApiUrl : config.apiUrl;
      const partner_agencies = config.partnerAgencyList.split(',');

      //Step3 - Prepare the onobarding data object
      const onboarding_data = {
        partnerId: 'PID-63294842a3760900125c7e1c',
        channel: 'whatsapp',
        customerId: `${info.agency_fk}|${info.whatsapp_onboarding_id}`,
        mediaUrl: info.display_image,
        about: info.about,
        redirectUrl: `${webappAdminBaseUrl}/settings/uib-onboarding-redirect-page`,
        webhookUrl: `${config.wabaWebhookUrl}`,
        webhookHeaders: {
          'Origin': 'https://partner-api.unificationengine.com',
          'x-component-secret': config.componentToken
        },
        notificationUrl: `${apiBaseUrl}/v1/whatsapp/onboarding/webhook`,
        notificationHeaders: {
          'Origin': 'https://partner-api.unificationengine.com',
          'x-component-secret': config.componentToken
        },
        metaAccountType: partner_agencies.includes(info.agency_fk) ? 'partner':'customer',
      };

      //Step 4 - Encode the onboarding data object
      const onboarding_base64_data = Buffer.from(
        JSON.stringify(onboarding_data),
        'utf8',
      ).toString('base64');

      const uib_onboarding_url = `https://partner.uib.ai/onboarding?token=${onboarding_base64_data}`;

      //Step 5 - Track the popup and close showing needed message accordingly

      localStorage.removeItem(constant.DIRECT_INTEGRATION.EVENTS.WHATSAPP_INTEGRATION);
      window.open(uib_onboarding_url, '_blank');

      let notification_fired = false;
      // processor of checking UIB Onboarding result
      const onUIBOnboardingComplete = async (event) => {
        if (
          event.key === constant.DIRECT_INTEGRATION.EVENTS.WHATSAPP_INTEGRATION
        ) {
          const onboarding_response = JSON.parse(event.newValue);
          const success = onboarding_response.success;
          if (h.cmpBool(notification_fired, false)) {
            if (success) {
              //split customer info to get agency_id and onboarding_id
              const customer_info = onboarding_response.customerId.split('|');
              const newForm = {
                waba_id: onboarding_response.wabaId,
                waba_number: onboarding_response.phoneNumber,
                waba_name: onboarding_response.verifiedName,
                agency_id: customer_info[0],
                whatsapp_onboarding_id: customer_info[1],
              };

              // creating partial record for onboarding
              const apiPartialRes = await api.whatsapp.sendPartialWabaForm(
                newForm,
                false,
              );

              if (h.cmpStr(apiPartialRes.status, 'ok')) {
                //setting onboarding status to submitted
                await api.whatsapp.updateOnboardingSubmission(
                  info?.whatsapp_onboarding_id,
                  { status: 'submitted' },
                  false,
                );
                setInfo({ ...info, status: 'submitted' });
                await getOnboardingList();
                setPage('info');
                h.general.alert('success', {
                  message:
                    'WhatsApp Business Account onboarded successfully. Please wait for the credentials email to proceed.',
                });
              }
            } else {
              h.general.alert('error', {
                message: onboarding_response.message,
              });
            }
          }
          localStorage.removeItem(
            constant.DIRECT_INTEGRATION.EVENTS.WHATSAPP_INTEGRATION,
          );
          notification_fired = true;
          setUibLoading(0);
        }
      };

      // listens to onboarding response
      window.addEventListener('storage', onUIBOnboardingComplete);
      return true;
    }

    async function getOnboardingWhatsAppConfig(whatsapp_onboarding_id) {
      setStatus(constant.API_STATUS.PENDING);
      setOnboardingWabaDetails(null);

      const apiRes = await api.whatsapp.getOnboardingWhatsAppConfig(
        whatsapp_onboarding_id,
        {},
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        const details = apiRes.data.agency_whatsapp_config;
        if (h.notEmpty(details)) {
          setOnboardingWabaDetails({
            agency_whatsapp_config_id: details.agency_whatsapp_config_id,
            agency_id: details.agency_fk,
            whatsapp_onboarding_id: details.whatsapp_onboarding_fk,
            waba_name: details.waba_name,
            waba_number: details.waba_number,
            agency_whatsapp_api_token: details.agency_whatsapp_api_token,
            agency_whatsapp_api_secret: details.agency_whatsapp_api_secret,
            agency_waba_id: details.agency_waba_id,
            agency_waba_template_token: details.agency_waba_template_token,
            agency_waba_template_secret: details.agency_waba_template_secret,
          });
        }
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    }

    return (
      <>
        {
          openConnect && info ? openConnect && (
            <WhatsAppOnboardingModal
              agencyId={agencyId}
              whatsappConfig={info}
              handleCloseModal={async () => {
                setOpenConnect(false);
                await getOnboardingList();
                setPage('list');
              }}
            />
          ) :

            <div className="modern-modal-wrapper">
              <div className="modern-modal-body lg">
                <div className=" d-flex justify-content-between align-items-start">
                  {h.notEmpty(info) ? (
                    <h1>WhatsApp Account: {info.client_company_name}</h1>
                  ) : (
                    <h1>WhatsApp Accounts</h1>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      onClick={() =>
                        constant.API_STATUS.PENDING !== status
                          ? handleCloseModal()
                          : null
                      }
                      style={{
                        cursor: 'pointer',
                        fontSize: '1em',
                        marginLeft: '3em',
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTimes}
                        color="#182327"
                        style={{ fontSize: '15px' }}
                      />
                    </span>
                  </div>
                </div>
                <div className=" modern-style mt-4">
                  {status === constant.API_STATUS.PENDING && (
                    <FullTableLoading
                      headers={[
                        'WABA Name',
                        'WABA Number',
                        'Status',
                        'Quality Rating',
                      ]}
                    />
                  )}

                  {page === 'list' && status === constant.API_STATUS.FULLFILLED && (
                    <CommonResponsiveTable
                      columns={tableColumns}
                      data={wabaList}
                      options={{
                        scrollable: true,
                      }}
                      thHeight="50px"
                      showFooter={false}
                      noDataText={'No WhatsApp accounts connected yet'}
                    />
                  )}

                  {h.notEmpty(info) &&
                    page === 'info' &&
                    status === constant.API_STATUS.FULLFILLED && (
                      <div
                        className="d-flex justify-content-between "
                        style={{ gap: '3em' }}
                      >
                        <div
                          style={{
                            flexGrow: 1,
                          }}
                          className="d-flex  flex-column"
                        >
                          {isSuperAdmin && isChaaat && info?.status === 'pending' && (
                            <div className="d-flex campaign-create-form mt-3">
                              <label></label>
                              <div>
                                {/* <CommonTooltip tooltipText="To transition request to Submitted">
                            <button
                              type="type"
                              className="chip-button mb-0 mr-4 c-action-button"
                              onClick={handleMarkAsSubmitted}
                              style={{ fontSize: '12px' }}
                            >
                              <FontAwesomeIcon
                                color={'#4877ff'}
                                icon={faCheckCircle}
                              />{' '}
                              Mark as Submitted
                            </button>
                          </CommonTooltip> */}
                                <CommonTooltip tooltipText="To transition request to Submitted">
                                  <button
                                    className="chip-button mb-0 mr-4 c-action-button"
                                    onClick={() => connectToUIBOnboarding()}
                                  >
                                    {uibLoading ? (
                                      <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                      ></span>
                                    ) : (
                                      <span>Onboard WhatsApp Business Account</span>
                                    )}
                                  </button>
                                </CommonTooltip>
                              </div>
                            </div>
                          )}
                          {isSuperAdmin &&
                            isChaaat &&
                            info?.status === 'submitted' &&
                            h.isEmpty(onboardingWabaDetails) && (
                              <div className="d-flex campaign-create-form mt-3">
                                <label></label>
                                <div>
                                  <CommonTooltip tooltipText="Mark request as Confirmed">
                                    <button
                                      type="type"
                                      className="chip-button mb-0 mr-4 c-action-button"
                                      onClick={() => {
                                        setInfo(info);
                                        setPage('request');
                                      }}
                                      style={{ fontSize: '12px' }}
                                    >
                                      <FontAwesomeIcon
                                        color={'#4877ff'}
                                        icon={faPlusCircle}
                                      />{' '}
                                      Add UIB Credentials
                                    </button>
                                  </CommonTooltip>
                                </div>
                              </div>
                            )}
                          {isSuperAdmin &&
                            isChaaat &&
                            info?.status === 'submitted' &&
                            h.notEmpty(onboardingWabaDetails) && (
                              <div className="d-flex campaign-create-form mt-3">
                                <label></label>
                                <div>
                                  <CommonTooltip tooltipText="Mark request as Confirmed">
                                    <button
                                      type="type"
                                      className="chip-button mb-0 mr-4 c-action-button"
                                      onClick={() => {
                                        setInfo(info);
                                        setPage('update_request');
                                      }}
                                      style={{ fontSize: '12px' }}
                                    >
                                      <FontAwesomeIcon
                                        color={'#4877ff'}
                                        icon={faEdit}
                                      />{' '}
                                      Update UIB Credentials
                                    </button>
                                  </CommonTooltip>
                                </div>
                              </div>
                            )}
                          <div className="d-flex campaign-create-form mt-3">
                            <label>Address</label>
                            <div>
                              <input
                                placeholder="Enter template name"
                                type="text"
                                value={info?.address}
                                className={`form-item `}
                                disabled
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>WhatsApp Status</label>
                            <div>
                              <input
                                placeholder="Enter template name"
                                type="text"
                                value={info?.whatsapp_status}
                                className={`form-item `}
                                disabled
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>Onboarding Channel</label>
                            <div>
                              <input
                                placeholder="Enter template name"
                                type="text"
                                value={info?.onboarding_channel}
                                className={`form-item `}
                                disabled
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>Webhook URL</label>
                            <div>
                              <input
                                placeholder="Enter template name"
                                type="text"
                                value={info?.webhook_url}
                                className={`form-item `}
                                disabled
                              />
                            </div>
                          </div>

                          <div className="d-flex campaign-create-form mt-3">
                            <label>Headers</label>
                            <div>
                              {parseHeaders(info.headers).map((h, i) => (
                                <div
                                  className="d-flex flex-row mb-3"
                                  style={{ gap: '1em' }}
                                  key={i}
                                >
                                  <input
                                    placeholder="Enter template name"
                                    type="text"
                                    value={h.key}
                                    className={`form-item `}
                                    disabled
                                  />{' '}
                                  <input
                                    placeholder="Enter template name"
                                    type="text"
                                    value={h.value}
                                    className={`form-item `}
                                    disabled
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {h.notEmpty(info) &&
                    page === 'request' &&
                    status === constant.API_STATUS.FULLFILLED && (
                      <div
                        className="d-flex justify-content-between "
                        style={{ gap: '3em' }}
                      >
                        <div
                          style={{
                            flexGrow: 1,
                          }}
                          className="d-flex  flex-column"
                        >
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              WABA Name<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter WABA name"
                                type="text"
                                value={form.waba_name}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onChange(e.target.value, 'waba_name')
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              WABA Number<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter WABA number"
                                type="text"
                                value={form.waba_number}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onChange(e.target.value, 'waba_number')
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              WABA ID<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter WABA ID"
                                type="text"
                                value={form.agency_waba_id}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onChange(e.target.value, 'agency_waba_id')
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              API Token<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter API token"
                                type="text"
                                value={form.agency_whatsapp_api_token}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onChange(
                                    e.target.value,
                                    'agency_whatsapp_api_token',
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              API Secret<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter API secret"
                                type="text"
                                value={form.agency_whatsapp_api_secret}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onChange(
                                    e.target.value,
                                    'agency_whatsapp_api_secret',
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Template Token<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter template token"
                                type="text"
                                value={form.agency_waba_template_token}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onChange(
                                    e.target.value,
                                    'agency_waba_template_token',
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Template Secret<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter template secret"
                                type="text"
                                value={form.agency_waba_template_secret}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onChange(
                                    e.target.value,
                                    'agency_waba_template_secret',
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {h.notEmpty(info) &&
                    h.notEmpty(onboardingWabaDetails) &&
                    page === 'update_request' &&
                    status === constant.API_STATUS.FULLFILLED && (
                      <div
                        className="d-flex justify-content-between "
                        style={{ gap: '3em' }}
                      >
                        <div
                          style={{
                            flexGrow: 1,
                          }}
                          className="d-flex  flex-column"
                        >
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              WABA Name<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter WABA name"
                                type="text"
                                value={onboardingWabaDetails?.waba_name || ''}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onUpdateChange(e.target.value, 'waba_name')
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              WABA Number<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter WABA number"
                                type="text"
                                value={onboardingWabaDetails.waba_number || ''}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onUpdateChange(e.target.value, 'waba_number')
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              WABA ID<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter WABA ID"
                                type="text"
                                value={onboardingWabaDetails.agency_waba_id || ''}
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onUpdateChange(e.target.value, 'agency_waba_id')
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              API Token<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter API token"
                                type="text"
                                value={
                                  onboardingWabaDetails.agency_whatsapp_api_token ||
                                  ''
                                }
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onUpdateChange(
                                    e.target.value,
                                    'agency_whatsapp_api_token',
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              API Secret<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter API secret"
                                type="text"
                                value={
                                  onboardingWabaDetails.agency_whatsapp_api_secret ||
                                  ''
                                }
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onUpdateChange(
                                    e.target.value,
                                    'agency_whatsapp_api_secret',
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Template Token<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter template token"
                                type="text"
                                value={
                                  onboardingWabaDetails.agency_waba_template_token ||
                                  ''
                                }
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onUpdateChange(
                                    e.target.value,
                                    'agency_waba_template_token',
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="d-flex campaign-create-form mt-3">
                            <label>
                              Template Secret<small>*</small>
                            </label>
                            <div>
                              <input
                                placeholder="Enter template secret"
                                type="text"
                                value={
                                  onboardingWabaDetails.agency_waba_template_secret ||
                                  ''
                                }
                                className={`form-item `}
                                disabled={constant.API_STATUS.PENDING === status}
                                onChange={(e) =>
                                  onUpdateChange(
                                    e.target.value,
                                    'agency_waba_template_secret',
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {h.notEmpty(info) && (
                    <div
                      className="d-flex justify-content-center mt-4"
                      style={{ gap: '1em' }}
                    >
                      <button
                        tyle="button"
                        className="modern-button secondary"
                        style={{
                          width: '20%',
                          borderRadius: '30px',
                          height: '50px',
                        }}
                        onClick={() => {
                          setInfo(null);
                          setPage('list');
                        }}
                        disabled={constant.API_STATUS.PENDING === status}
                      >
                        Back
                      </button>

                      {page === 'request' && (
                        <button
                          tyle="button"
                          className="modern-button common"
                          style={{
                            width: '20%',
                            borderRadius: '30px',
                            height: '50px',
                          }}
                          onClick={handleSubmit}
                          disabled={
                            !h.general.validateForm(form, [
                              'whatsapp_onboarding_id',
                              'agency_id',
                            ]) || constant.API_STATUS.PENDING === status
                          }
                        >
                          Submit
                        </button>
                      )}

                      {page === 'update_request' && (
                        <button
                          tyle="button"
                          className="modern-button common"
                          style={{
                            width: '20%',
                            borderRadius: '30px',
                            height: '50px',
                          }}
                          disabled={
                            !h.general.validateForm(onboardingWabaDetails, [
                              'whatsapp_onboarding_id',
                              'agency_id',
                            ]) || constant.API_STATUS.PENDING === status
                          }
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
        }
      </>
    );
  },
);
