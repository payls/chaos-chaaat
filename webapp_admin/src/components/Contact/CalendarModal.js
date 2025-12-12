import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { h } from '../../helpers';
import { times } from 'lodash';

import 'react-dates/initialize';
import {
  DayPickerRangeController,
  DayPickerSingleDateController,
} from 'react-dates';
import moment from 'moment';
import 'react-dates/lib/css/_datepicker.css';
import { Button } from 'react-bootstrap';

// ICONS
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CalendarModal({
  onCloseModal,
  setLoading,
  calendarModal,
  includeTime = true,
}) {
  const [date, setDate] = useState(moment());
  const [focused, setFocused] = useState(null);
  const [time, setTime] = useState({
    hr: '01',
    min: '00',
    am_pm: 'AM',
  });

  /**
   * Submit Appointment
   * @param {*} e
   */
  const handleSubmit = async () => {
    const aptDate = moment(date).format('YYYY-MM-DD');
    const aptDateTime = moment(
      `${aptDate} ${time.hr}:${time.min}:${time.am_pm}`,
    ).format();

    const apiRes = await api.contact.setAppointment({
      contact_id: calendarModal.contact_id,
      appointment_date: aptDateTime,
    });

    if (h.cmpStr(apiRes.status, 'ok')) {
      onCloseModal();
    }

    setLoading(false);
  };

  /**
   * Close Modal
   */
  const closeModal = () => {
    onCloseModal();
  };

  const handleDateChange = (date) => {
    setDate(date);
  };

  const handleFocusChange = () => {
    // Force the focused states to always be truthy so that date is always selectable
    setFocused(true);
  };

  return (
    <div
      className="modal-root"
      onClick={() => {
        closeModal();
      }}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '530px' }}
      >
        <div className="modal-header">
          <span>Set contact for an appointment</span>
          <button
            onClick={() => {
              closeModal();
            }}
          >
            <FontAwesomeIcon icon={faTimes} color="#fff" size="sm" />
          </button>
        </div>
        <div className="modal-body">
          <DayPickerSingleDateController
            onDateChange={handleDateChange}
            onFocusChange={handleFocusChange}
            focused={focused}
            date={date}
            daySize={60}
            minDate={moment()}
          />
          <div className="d-flex mt-2" style={{ gap: '1em' }}>
            <div style={{ width: '100%' }}>
              <span>Hour</span>

              <select
                className="time-select"
                onChange={(e) => {
                  setTime({ ...time, hr: e.target.value });
                }}
              >
                {times(12, (i) => {
                  const val = i < 9 ? `0${i + 1}` : i + 1;
                  return <option value={val}>{val}</option>;
                })}
              </select>
            </div>
            <div style={{ width: '100%' }}>
              <span>Minute</span>

              <select
                className="time-select"
                onChange={(e) => {
                  setTime({ ...time, min: e.target.value });
                }}
              >
                <option value="00">00</option>
                {times(55, (i) => {
                  if ((i + 1) % 5 === 0) {
                    const val = i < 9 ? `0${i + 1}` : i + 1;
                    return <option value={val}>{val}</option>;
                  }
                })}
              </select>
            </div>
            <div style={{ width: '100%' }}>
              <span>AM/PM</span>
              <select
                className="time-select"
                onChange={(e) => {
                  setTime({ ...time, am_pm: e.target.value });
                }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div className={`col-12 col-sm-12 modal-footer mt-5`}>
            <Button
              variant="secondary"
              type="button"
              onClick={closeModal}
              className="common-button transparent-bg"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                h.general.prompt(
                  {
                    message:
                      'Are you sure you want to set appointment to this date?',
                  },

                  async (status) => {
                    if (status) {
                      await handleSubmit();
                    }
                  },
                );
              }}
              className="common-button"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
