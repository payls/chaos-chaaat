import React, { useEffect, useState, useMemo } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

import {
  faCircle,
  faRedoAlt,
  faTimes,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonDrodownAction from '../Common/CommonDrodownAction';
import CommonResponsiveTable from '../Common/CommonResponsiveTable';
import CommonTooltip from '../Common/CommonTooltip';
import CommonIconButton from '../Common/CommonIconButton';
import SmallSpinner from './SmallSpinner';
import FullTableLoading from '../Sale/Link/preview/components/Common/CommonLoading/FullTableLoading';

const queryClient = new QueryClient();

export default React.memo(({ handleCloseModal, agencyId }) => {
  const [columns, setColumns] = useState([]);
  const [wabaList, setWabaList] = useState([]);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [enableSyncButton, setEnableSyncButton] = useState(false);
  const [lastUpdateDate, setLastUpdateDate] = useState('');
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    (async () => {
      setStatus(constant.API_STATUS.PENDING);
      const apiRes = await api.whatsapp.getAgencyWhatsAppConfigurations(
        agencyId,
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        const list = [...apiRes.data.agency_whatsapp_config];
        setWabaList(list.length > 0 ? list : []);

        if (h.notEmpty(apiRes.data.last_updated_date)) {
          // check when is last update date
          const lastUpdateDate = h.date.convertUTCDateToLocalDate(
            apiRes.data.last_updated_date,
            timeZone,
          );
  
          const updateDate = new Date(lastUpdateDate);
          const formattedDate = moment(updateDate).format('MMM DD YYYY h:mm:ss A');
          setLastUpdateDate(formattedDate);
  
          if (moment().isAfter(moment(updateDate).add(1, 'hours'))) {
            setEnableSyncButton(true);
          } else {
            setEnableSyncButton(false);
          }
        } else {
          setLastUpdateDate('None');
          setEnableSyncButton(false);
        }

      }
      setStatus(constant.API_STATUS.FULLFILLED);
    })();

    const initialColumns = [
      {
        id: 'w-q-waba-name',
        Header: 'WABA Name',
        headerWidth: '70px',
        Cell: ({ row: { original } }) => {
          const { waba_name } = original;

          return <div style={{ textTransform: 'initial' }}>{waba_name}</div>;
        },
      },
      {
        id: 'w-q-number',
        Header: 'WABA Number',
        headerWidth: '70px',
        Cell: ({ row: { original } }) => {
          const { waba_number } = original;

          return <div style={{ textTransform: 'initial' }}>{waba_number}</div>;
        },
      },
      {
        id: 'w-q-daily-limit',
        Header: 'Daily Messaging Limit',
        headerWidth: '70px',
        Cell: ({ row: { original } }) => {
          const { daily_messaging_limit } = original;

          return (
            <div style={{ textTransform: 'initial' }}>
              {daily_messaging_limit ?? '-'}
            </div>
          );
        },
      },
      {
        id: 'w-q-status',
        Header: 'Status',
        headerWidth: '70px',
        Cell: ({ row: { original } }) => {
          const { waba_status } = original;

          let wabaStatus = waba_status;

          return (
            <div style={{ textTransform: 'initial' }}>
              {h.notEmpty(wabaStatus) && (
                <>{h.general.ucFirstAllWords(wabaStatus.toLowerCase())}</>
              )}

              {!h.notEmpty(wabaStatus) && <>-</>}
            </div>
          );
        },
      },
      {
        id: 'w-q-rating',
        Header: 'Quality Rating',
        headerWidth: '70px',
        Cell: ({ row: { original } }) => {
          const { waba_quality } = original;

          let wabaQuality = waba_quality;

          let ratingColor = '';
          let ratingValue = '';

          switch (wabaQuality) {
            case 'YELLOW':
              ratingColor = '#FDB919';
              ratingValue = 'Medium';
              break;
            case 'RED':
              ratingColor = '#cd0000';
              ratingValue = 'Low';
              break;
            case 'GREEN':
              ratingColor = '#009700';
              ratingValue = 'High';
              break;
            case 'UNKNOWN':
              ratingColor = '#dedede';
              ratingValue = 'Unknown';
              break;
            default:
              ratingColor = '#dedede';
              ratingValue = waba_quality;
              break;
          }

          return (
            <div style={{ textTransform: 'initial' }}>
              {h.notEmpty(wabaQuality) && (
                <>
                  <FontAwesomeIcon
                    color={ratingColor}
                    icon={faCircle}
                    style={{ fontSize: '13px', marginRight: '5px' }}
                  />
                  {ratingValue}
                </>
              )}

              {!h.notEmpty(wabaQuality) && <>-</>}
            </div>
          );
        },
      },
    ];

    setColumns(initialColumns);
  }, []);

  const tableColumns = useMemo(() => columns, [columns]);

  async function getWhatsAppRating(waba_number) {
    const apiRes = await queryClient.fetchQuery(['wabaNumber'], () =>
      api.agency.whatsAppRating(agencyId, waba_number, false),
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      return {
        waba: apiRes.data?.waba,
      };
    }

    return { error: true };
  }

  async function syncWABAStatus() {
    setStatus(constant.API_STATUS.PENDING);
    await api.agency.getAgencyWabaUpdatedDetails(agencyId, false);

    const apiRes = await api.whatsapp.getAgencyWhatsAppConfigurations(
      agencyId,
      false,
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      const list = [...apiRes.data.agency_whatsapp_config];
      setWabaList(list.length > 0 ? list : []);

      if (h.notEmpty(apiRes.data.last_updated_date)) {
        // check when is last update date
        const lastUpdateDate = h.date.convertUTCDateToLocalDate(
          apiRes.data.last_updated_date,
          timeZone,
        );
  
        const updateDate = new Date(lastUpdateDate);
        const formattedDate = moment(updateDate).format('MMM DD YYYY h:mm:ss A');
        setLastUpdateDate(formattedDate);
        if (moment().isAfter(moment(updateDate).add(1, 'hours'))) {
          setEnableSyncButton(true);
        } else {
          setEnableSyncButton(false);
        }
      } else {
        setLastUpdateDate('None');
        setEnableSyncButton(false);
      }

      
      setStatus(constant.API_STATUS.FULLFILLED);
    }
  }

  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body">
        <div className=" d-flex justify-content-between">
          <h1>WABA Quality Rating</h1>
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
        <div style={{
          marginTop: '30px',
          textAlign: 'left',
          width: '50%',
          display: 'inline-block',
          verticalAlign: 'bottom',
        }}>
          Last updated: {lastUpdateDate}
        </div>
        <div style={{
          marginTop: '10px',
          textAlign: 'right',
          width: '50%',
          display: 'inline-block',
        }}>
          <CommonTooltip tooltipText="This button can only be clicked every 1 hour after latest update" placement="bottom">
            <CommonIconButton
              className={`common-button mr-2 ${h.cmpBool(enableSyncButton, false) ? 'btn-pending-disabled' : ''}`}
              style={{ width: 200, height: 36 }}
              onClick={async () => await syncWABAStatus()}
              disabled={status === constant.API_STATUS.PENDING}
            >
              <FontAwesomeIcon
                icon={faRedo}
                spin={status === constant.API_STATUS.PENDING}
                color="#182327"
                fontSize="20px"
                className="mr-2"
              />
              {status === constant.API_STATUS.PENDING
                ? 'Synching...'
                : 'Sync WABA Status'}
            </CommonIconButton>
          </CommonTooltip>

        </div>
        <div className=" modern-style mt-4 new-table">
          {status === constant.API_STATUS.PENDING && (
            <FullTableLoading
              headers={['WABA Name', 'WABA Number', 'Status', 'Quality Rating']}
            />
          )}

          {status === constant.API_STATUS.FULLFILLED && (
            <CommonResponsiveTable
              columns={tableColumns}
              data={wabaList}
              options={{
                scrollable: true,
              }}
              thHeight="50px"
              showFooter={false}
              noDataText={'No WABAs connected yet'}
            />
          )}
        </div>
      </div>
    </div>
  );
});
