import React, { useState, useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';
import moment from 'moment';
import { h } from '../../helpers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  faBold,
  faItalic,
  faStrikethrough,
  faPlusCircle,
  faSmile,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';

export default React.memo(
  ({
    form,
    setForm,
    item,
    handleRemoveSchedule,
    index,
    staggered,
    contactsCount,
    minDate,
    disabled = false,
  }) => {
    function onChange(v, key, i) {
      const cForm = [...form];
      cForm[i][key] = v;

      setForm(cForm);
    }

    function getCountValue(item) {
      if (!staggered) {
        return contactsCount;
      }

      return item.recipient_count || null;
    }

    return (
      <div
        className="d-flex"
        style={{ display: 'block', gap: '1em', marginTop: '10px' }}
      >
        <div style={{ width: '200px' }}>
          <label className="form-inner-label">Date and Time</label>
          <DatePicker
            selected={item.datetime}
            onChange={(date) => onChange(date, 'datetime', index)}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="form-item"
            timeIntervals={15}
            onKeyDown={(e) => {
              e.preventDefault();
            }}
            placeholderText="Select date and time"
            minDate={minDate}
            disabled={disabled}
          />
        </div>
        <div style={{ width: '150px' }}>
          <label className="form-inner-label">Recipient count</label>
          <input
            placeholder="Enter count"
            type="number"
            value={getCountValue(item)}
            className="form-item"
            onChange={(e) => {
              if (e.target.value === '') {
                onChange(0, 'recipient_count', index);
              } else {
                const c = e.target.value !== '' ? parseInt(e.target.value) : 0;
                const f =
                  form
                    .map((m) =>
                      m.recipient_count !== ''
                        ? parseInt(m.recipient_count)
                        : 0,
                    )
                    .reduce((a, b) => a + b) - item.recipient_count;
                if (c + f <= contactsCount) {
                  onChange(
                    e.target.value ? parseInt(e.target.value) : 0,
                    'recipient_count',
                    index,
                  );
                }
              }
            }}
            disabled={!disabled ? !staggered : disabled}
          />
        </div>

        {form.length > 1 && !disabled && (
          <div className="center-body" style={{ paddingTop: '25px' }}>
            <CommonTooltip tooltipText={'Remove'}>
              <FontAwesomeIcon
                icon={faTrashAlt}
                color="#fe5959"
                style={{
                  marginRight: '10px',
                  marginLeft: '10px',
                  cursor: 'pointer',
                }}
                onClick={() => handleRemoveSchedule(index)}
              />
            </CommonTooltip>
          </div>
        )}
      </div>
    );
  },
);
