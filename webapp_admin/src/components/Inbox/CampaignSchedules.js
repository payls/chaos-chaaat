import React from 'react';
import moment from 'moment';
import { h } from '../../helpers';

import {
  faClock,
  faUsers,
  faPauseCircle,
  faTrash,
  faRedoAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonDrodownAction from '../Common/CommonDrodownAction';

export default React.memo(({ items, handleCloseModal }) => {
  function getDay(shcd) {
    const dateTime = h.date.convertUTCDateToLocalDate(
      moment(shcd.send_date).utc(false).format('DD MMM YYYY hh:mm a') + ' GMT',
      shcd.time_zone,
      'en-AU',
      {
        weekday: 'short',
        hour12: true,
      },
    );

    return dateTime;
  }

  function getDayDate(shcd) {
    const dateTime = h.date.convertUTCDateToLocalDate(
      moment(shcd.send_date).utc(false).format('DD MMM YYYY hh:mm a') + ' GMT',
      shcd.time_zone,
      'en-AU',
      {
        day: 'numeric',
        hour12: true,
      },
    );

    return dateTime;
  }

  function getTime(shcd) {
    const dateTime = h.date.convertUTCDateToLocalDate(
      moment(shcd.send_date).utc(false).format('DD MMM YYYY hh:mm a') + ' GMT',
      shcd.time_zone,
      'en-AU',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );

    return dateTime;
  }

  return (
    <div className="campaign-schedule-wrapper">
      <div className="campaign-schedule-body">
        <div className=" d-flex justify-content-between">
          <h1>Schedules</h1>
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
        {items.map((item) => (
          <div className="schedules-wrapper-list mb-1">
            <div className="schedules-wrapper-list-item">
              <div className="schedules-wrapper-list-item-day">
                <small>{getDay(item)}</small>
                {getDayDate(item)}
              </div>

              <div className="schedules-wrapper-list-item-info">
                <div className="mt-1">
                  <FontAwesomeIcon
                    color="#c5c5c5"
                    icon={faUsers}
                    style={{ marginRight: '8px' }}
                  />
                  {item.recipient_count} Recipients
                </div>
                <div className="mt-2">
                  <FontAwesomeIcon
                    color="#c5c5c5"
                    icon={faClock}
                    style={{ marginRight: '8px', marginLeft: '2px' }}
                  />
                  {getTime(item)}
                </div>
              </div>
              <div className="schedules-wrapper-list-item-info-2">
                <div className="schedules-wrapper-list-item-info-name mt-1">
                  {item.campaign_name}
                </div>

                {item.status === 2 && item.triggered === 0 && (
                  <div className="chip-status paused">
                    <FontAwesomeIcon
                      color="#FDB919"
                      icon={faPauseCircle}
                      style={{ fontSize: '15px' }}
                    />
                    Paused
                  </div>
                )}
                {item.status === 1 && item.triggered === 0 && (
                  <div className="chip-status upcoming">
                    <FontAwesomeIcon
                      color="#009700"
                      icon={faClock}
                      style={{ fontSize: '15px' }}
                    />
                    Upcoming
                  </div>
                )}
                {item.status === 1 && item.triggered === 1 && (
                  <div className="chip-status running">
                    <FontAwesomeIcon
                      color="#0097c0"
                      icon={faRedoAlt}
                      spin={true}
                      style={{ fontSize: '15px' }}
                    />
                    Processing
                  </div>
                )}
              </div>
              <div className="schedules-wrapper-list-item-action">
                <CommonDrodownAction
                  items={[
                    {
                      label: 'Delete',
                      icon: faTrash,
                      action: () => {
                        // handleDownloadCampaignReport(original);
                      },
                      className: `info-red`,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
