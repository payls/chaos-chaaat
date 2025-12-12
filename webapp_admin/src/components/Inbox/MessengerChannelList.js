import React, { useEffect, useState, useMemo } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import Swal from 'sweetalert2';

import {
  faCircle,
  faRedoAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonDrodownAction from '../Common/CommonDrodownAction';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import SmallSpinner from './SmallSpinner';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';

const queryClient = new QueryClient();

export default React.memo(({ handleCloseModal, agencyId, setLoading }) => {
  const [columns, setColumns] = useState([]);
  const [lineChannels, setLineChannels] = useState([]);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [view, setView] = useState('list');
  const [form, setForm] = useState({
    agency_id: agencyId,
    channel_name: '',
    bot_basic_id: '',
    channel_id: '',
    channel_secret: '',
    channel_access_token: '',
  });

  useEffect(() => {
    (async () => {
      await getChannels();
    })();

    const processWebhookSubscription = async (agency_channel_config_id) => {
      setLoading(true);
      const apiRes = await api.messenger.webhookSubscribe(
        agency_channel_config_id,
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        h.general.alert('success', {
          message: `Page now subscribed on webhooks. All messages received by the Page will be transmitted here.`,
        });
        await getChannels();
      }
      setLoading(false);
    };

    const promptSendingOptInMessage = async (agency_channel_config_id) => {
      Swal.fire({
        title: 'Send Line Opt On Message?',
        icon: 'warning',
        html: `This will send an opt in message to all contacts following this Line Account. Once contact responded, our system will be able to record their Line User ID, that will be used for message sending using Chaaat platform. Continue?`,
        reverseButtons: true,
        showCancelButton: true,
        confirmButtonColor: '#025146',
        confirmButtonText: 'Yes',
        cancelButtonColor: '#606A71',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (h.cmpBool(result.isConfirmed, true)) {
          setLoading(true);
          const apiRes = await api.line.sendOptInMessage(
            agency_channel_config_id,
            false,
          );

          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: `Opt in broadcast message sent. Contacts that will respond will be added to this channel's contact list.`,
            });
            await getChannels();
          }
          setLoading(false);
        } else {
          promptCancelOptInMessage();
        }
        return true;
        // if (result && result.value)
        //   return handleDeleteTemplate(agency_id, waba_template_id);
      });
    };

    const promptCancelOptInMessage = () => {
      Swal.fire({
        title: 'Sending Opt In Message Cancelled',
        icon: 'warning',
        html: `Sending Opt In message cancelled. If you decided to send the message, open the Line Channels screen and click <b><Send Message/b> button. If not, and still want to retrieve the followers Line User IDs, you need to be a verified or premium Line Account.`,
        reverseButtons: true,
        showCancelButton: false,
        confirmButtonColor: '#025146',
        confirmButtonText: 'OK',
        cancelButtonColor: '#606A71',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        return true;
      });
    };

    const initialColumns = [
      {
        id: 'w-q-channel-name',
        Header: 'Page Name',
        headerWidth: '170px',
        Cell: ({ row: { original } }) => {
          const { channel_name } = original;

          return <div style={{ textTransform: 'initial' }}>{channel_name}</div>;
        },
      },
      {
        id: 'w-q-bot-id',
        Header: 'Page ID',
        headerWidth: '150px',
        Cell: ({ row: { original } }) => {
          const { channel_id } = original;

          return <div style={{ textTransform: 'initial' }}>{channel_id}</div>;
        },
      },
      {
        id: 'w-opt-in',
        Header: 'Webhook',
        headerWidth: '150px',
        Cell: ({ row: { original } }) => {
          const { uib_api_secret, agency_channel_config_id } = original;

          return (
            <div style={{ textTransform: 'initial', textAlign: 'center' }}>
              {h.cmpInt(uib_api_secret, 1) ? (
                <button className="common-button text-normal w-150" disabled>
                  SUBSCRIBED
                </button>
              ) : (
                <button
                  className="common-button text-normal w-150"
                  onClick={async () => {
                    processWebhookSubscription(agency_channel_config_id);
                  }}
                >
                  CLICK TO SUBSCRIBE
                </button>
              )}
            </div>
          );
        },
      },
      // {
      //   id: 'w-opt-in',
      //   Header: 'Opt In Message',
      //   headerWidth: '150px',
      //   Cell: ({ row: { original } }) => {
      //     const { sent_opt_in_message, agency_channel_config_id } = original;

      //     return (
      //       <div style={{ textTransform: 'initial', textAlign: 'center' }}>
      //         {sent_opt_in_message ? (
      //           <button className="common-button text-normal w-150" disabled>
      //             MESSAGE SENT
      //           </button>
      //         ) : (
      //           <button
      //             className="common-button text-normal w-150"
      //             onClick={async () => {
      //               promptSendingOptInMessage(agency_channel_config_id);
      //             }}
      //           >
      //             SEND MESSAGE
      //           </button>
      //         )}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   id: 'opt_in_message_date',
      //   Header: 'Opt In Sent Date',
      //   accessor: (row) =>
      //     h.isEmpty(row.opt_in_message_sent_date)
      //       ? ''
      //       : row.opt_in_message_sent_date,
      //   filter: 'text',
      //   sortType: 'date',
      //   headerWidth: '150px',
      //   Cell: ({ row: { original } }) => {
      //     const { sent_opt_in_message, opt_in_message_sent_date } = original;

      //     const bDate = opt_in_message_sent_date;
      //     const localTimezone =
      //       Intl.DateTimeFormat().resolvedOptions().timeZone;
      //     const dateTime = h.date.convertUTCDateToLocalDate(
      //       moment(bDate).utc(false).format('DD MMM YYYY hh:mm a') + ' GMT',
      //       localTimezone,
      //       'en-AU',
      //       {
      //         year: 'numeric',
      //         month: 'numeric',
      //         day: 'numeric',
      //         hour: '2-digit',
      //         minute: '2-digit',
      //         hour12: true,
      //       },
      //     );
      //     return (
      //       <div style={{ textTransform: 'initial', textAlign: 'center' }}>
      //         {sent_opt_in_message ? dateTime : '--'}
      //       </div>
      //     );
      //   },
      // },
    ];

    setColumns(initialColumns);
  }, []);

  const tableColumns = useMemo(() => columns, [columns]);

  async function create() {
    setStatus(constant.API_STATUS.PENDING);
    const res = await api.line.createNewLineChannel(form, true);

    if (h.cmpStr(res.status, 'ok')) {
      await getChannels();
    }

    setView('list');
  }

  async function launchMessengerSignUp(config_id) {
    // Launch Facebook login
    setLoading(true);
    FB.login(
      async function (response) {
        if (response.authResponse) {
          FB.logout();
          if (h.cmpStr(response.status, 'connected')) {
            const code = response.authResponse.code;
            const messengerToken = await api.messenger.getMessengerAccessToken(
              { agency_id: agencyId, code: code },
              false,
            );
          } else {
            console.log('failed to connect');
          }
          // The returned code must be transmitted to your backend,
          // which will perform a server-to-server call from there to our servers for an access token
        } else {
          console.log('User cancelled login or did not fully authorize.');
          return false;
        }
        await getChannels();
        setLoading(false);
      },
      {
        config_id: config_id, // Meta config ID
        response_type: 'code', // must be set to 'code' for System User access token
        override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
      },
    );
  }

  async function getChannels() {
    (async () => {
      setStatus(constant.API_STATUS.PENDING);
      const credentials = await api.messenger.getChannelList(
        { agency_id: agencyId },
        false,
      );
      if (h.cmpStr(credentials.status, 'ok')) {
        setLineChannels(credentials.data.length > 0 ? credentials.data : []);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    })();
  }
  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body">
        <div className=" d-flex justify-content-between">
          <h1>Messenger Pages</h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              onClick={handleCloseModal}
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
          {view === 'list' && (
            <>
              {status === constant.API_STATUS.PENDING && (
                <FullTableLoading
                  headers={['Page Name', 'Page ID', 'Webhook']}
                />
              )}

              {status === constant.API_STATUS.FULLFILLED && (
                <CommonResponsiveTable
                  columns={tableColumns}
                  data={lineChannels}
                  options={{
                    scrollable: true,
                  }}
                  thHeight="50px"
                  showFooter={false}
                  noDataText={'No Line channels connected yet'}
                />
              )}
              <div className="center-body">
                <button
                  onClick={async () => {
                    const messengerResponse =
                      await launchMessengerSignUp(396696312882757);
                    if (messengerResponse) {
                      console.log(messengerResponse);
                    }
                  }}
                  style={{
                    backgroundColor: '#1877f2',
                    border: 0,
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    height: '40px',
                    padding: '0 24px',
                    marginBottom: '10px',
                  }}
                >
                  Login with Facebook
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
