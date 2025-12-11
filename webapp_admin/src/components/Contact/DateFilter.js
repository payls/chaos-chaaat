import React, { useState, useEffect } from 'react';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { h } from '../../helpers';
import Select, { components } from 'react-select';
import moment from 'moment';

// UI
import IconChevronDownVector2 from '../../components/Icons/IconChevronDownVector2';

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <IconChevronDownVector2 />
    </components.DropdownIndicator>
  );
};

const dateFilterOptions = [
  { value: 'wtd', label: 'Week to Date' },
  { value: 'mtd', label: 'Month to Date' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'tdy', label: 'Today' },
  { value: 'stp', label: 'Specific Time Period' },
];

export default function DateFilter({
  hide = false,
  callback,
  def = {
    value: 'wtd',
    label: 'Week to Date',
  },
}) {
  const [dateFilter, setDateFilter] = useState(def);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
    callback({
      from: moment(startDate).utc(false).startOf('day').toISOString(),
      to: moment(endDate).utc(false).endOf('day').toISOString(),
    });
  };

  function onChange(value, event) {
    if (value) {
      const currentDate = moment();

      switch (value.value) {
        case 'wtd':
          callback({
            from: moment(currentDate).utc(false).startOf('week').toISOString(),
            to: currentDate.utc(false).endOf('day').toISOString(),
          });
          break;

        case 'mtd':
          callback({
            from: moment(currentDate).utc(false).startOf('month').toISOString(),
            to: currentDate.utc(false).endOf('day').toISOString(),
          });
          break;

        case 'ytd':
          callback({
            from: moment(currentDate).utc(false).startOf('year').toISOString(),
            to: currentDate.utc(false).endOf('day').toISOString(),
          });
          break;
        case 'tdy':
          callback({
            from: moment(currentDate).utc(false).startOf('day').toISOString(),
            to: currentDate.utc(false).endOf('day').toISOString(),
          });
          break;
      }

      // Clear date range
      switch (value.value) {
        case 'wtd':
        case 'mtd':
        case 'ytd':
        case 'tdy':
          setStartDate(null);
          setEndDate(null);
          break;
      }
    } else {
      callback(null);
    }

    setDateFilter(value);
  }

  return (
    <>
      {!hide ? (
        <div className="contact-filter">
          <div style={{ minWidth: '230px' }}>
            <Select
              id="long-value-select"
              instanceId="long-value-select"
              options={dateFilterOptions}
              onChange={onChange}
              name={'data-range'}
              value={dateFilter}
              multiple={false}
              isSearchable={false}
              isClearable={false}
              components={{
                DropdownIndicator,
                IndicatorSeparator: () => null,
              }}
              className={'date-dropdown'}
              placeholder={'Date'}
              styles={{
                singleValue: (provided, state) => ({
                  display: state.selectProps.menuIsOpen ? 'none' : 'block',
                }),
              }}
            />
            {dateFilter && dateFilter.value === 'stp' && (
              <DateRangePicker
                isOutsideRange={() => false}
                startDate={startDate}
                startDateId="tata-start-date"
                endDate={endDate}
                endDateId="tata-end-date"
                onDatesChange={handleDatesChange}
                focusedInput={focusedInput}
                onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
                minimumNights={0}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
