import React, { useState } from 'react';
import { components } from 'react-select';

import AsyncSelect from 'react-select/async';

// UI
import IconChevronDownVector2 from '../Icons/IconChevronDownVector2';

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <IconChevronDownVector2 />
    </components.DropdownIndicator>
  );
};

export default React.memo(
  ({
    options,
    onChange,
    value = null,
    multiple = false,
    isSearchable = false,
    isClearable = false,
    placeholder = '',
    className = 'date-dropdown',
    id = '',
    control = {},
    disabled = false,
    loadOptions = async () => {},
  }) => {
    return (
      <AsyncSelect
        cacheOptions
        value={value}
        onChange={onChange}
        loadOptions={loadOptions}
        isDisabled={disabled}
        placeholder={placeholder}
        components={{
          DropdownIndicator,
          IndicatorSeparator: () => null,
        }}
        styles={{
          singleValue: (provided, state) => ({
            display: state.selectProps.menuIsOpen ? 'none' : 'block',
          }),
          control: (base) => ({
            ...base,
            ...control,
          }),
        }}
      />
    );
  },
);
