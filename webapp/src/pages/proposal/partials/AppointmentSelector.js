import React, { useState } from 'react';

import {
  faExclamationCircle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';

function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
  if (value.length === 0) {
    return `${placeholderButtonLabel}`;
  } else {
    return `(${value.length}) ${placeholderButtonLabel}`;
  }
}
const dayOptions = [
  {
    label: 'Monday',
    value: 'monday',
  },
  {
    label: 'Tuesday',
    value: 'tuesday',
  },
  {
    label: 'Wednesday',
    value: 'wednesday',
  },
  {
    label: 'Thursday',
    value: 'thursday',
  },
  {
    label: 'Friday',
    value: 'friday',
  },
  {
    label: 'Saturday',
    value: 'saturday',
  },
  {
    label: 'Sunday',
    value: 'sunday',
  },
];

const timeOptions = [
  {
    label: '5am - 9am',
    value: '1',
  },
  {
    label: '9am - 2pm',
    value: '2',
  },
  {
    label: '2pm - 5pm',
    value: '3',
  },
  {
    label: '5pm - 9pm',
    value: '4',
  },
];

export default React.memo(
  ({ close = () => {}, submitCallback = () => {}, contact }) => {
    const [selectedOptions, setSelectedOptions] = useState([
      {
        day: null,
        time: null,
      },
    ]);

    function onChangeDay(value, i) {
      const newValue = [...selectedOptions];
      newValue[i].day = value;
      setSelectedOptions(newValue);
    }

    function onChangeTime(value, i) {
      const newValue = [...selectedOptions];
      newValue[i].time = value;
      setSelectedOptions(newValue);
    }

    function onDelete(i) {
      const newValue = [...selectedOptions];
      newValue.splice(i, 1);
      setSelectedOptions([...newValue]);
    }

    function getTimeOptions(day) {
      if (!day) return [];
      if (day.label === 'Saturday') {
        return [
          {
            label: '5am - 9am',
            value: '1',
          },
          {
            label: '9am - 2pm',
            value: '2',
          },
          {
            label: '2pm - 5pm',
            value: '3',
          },
        ];
      }

      if (day.label === 'Sunday') {
        return [
          {
            label: '5am - 9am',
            value: '1',
          },
          {
            label: '9am - 2pm',
            value: '2',
          },
        ];
      }

      return timeOptions;
    }
    return (
      <div className="modern-modal">
        <div className="modern-modal-body animate__animated animate__fadeInDown animate__faster">
          <div className="modern-modal-body-msg">
            <p>
              <FontAwesomeIcon
                icon={faExclamationCircle}
                color={'#ababab'}
                style={{ margin: '20px 0px' }}
                height={'55px'}
              />
              <br />
              Great, {contact?.first_name?.trim()}, please let us know your
              preferred training days (you can select more than 1 if you like).
            </p>
            {selectedOptions.map((item, i) => (
              <div className="d-flex options">
                <Select
                  id="day-topion"
                  options={dayOptions}
                  onChange={(e) => {
                    onChangeDay(e, i);
                  }}
                  name={'day-option'}
                  value={selectedOptions[i]?.day}
                  multiple={false}
                  isSearchable={false}
                  isClearable={false}
                  placeholder={'Select Day'}
                />
                <Select
                  id="time-topion"
                  options={getTimeOptions(selectedOptions[i]?.day)}
                  isDisabled={!selectedOptions[i]?.day}
                  onChange={(e) => {
                    onChangeTime(e, i);
                  }}
                  name={'time-option'}
                  value={selectedOptions[i]?.time}
                  multiple={false}
                  isSearchable={false}
                  isClearable={false}
                  placeholder={'Select Time'}
                />
                <div>
                  <button
                    type="button"
                    className="trash-action"
                    disabled={selectedOptions.length === 1}
                    title="Delete"
                    onClick={() => {
                      onDelete(i);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      color={selectedOptions.length === 1 ? 'grey' : '#000'}
                      height={'15px'}
                    />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-schedule"
              onClick={() => {
                setSelectedOptions([
                  ...selectedOptions,
                  {
                    day: null,
                    time: null,
                  },
                ]);
              }}
            >
              + ADD SCHEDULE
            </button>

            <div className="d-flex modern-modal-body-msg-actions">
              <button type="button" className="actions" onClick={() => close()}>
                CANCEL
              </button>
              <button
                type="button"
                className="actions submit"
                onClick={() => submitCallback(selectedOptions)}
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
