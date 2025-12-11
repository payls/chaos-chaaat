import React, { useState } from 'react';
import Select, { components } from 'react-select';
import { h } from '../../helpers';

// UI
import IconChevronDownVector2 from '../../components/Icons/IconChevronDownVector2';
import ChevronDownSelect from '../FlowBuilder/Icons/ChevronDownSelect';

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
    onMenuOpen = () => {},
    iconComponent = null,
  }) => {
    const DropdownIndicator = (props) => {
      return (
        <components.DropdownIndicator {...props}>
          {h.notEmpty(iconComponent) ? (
            iconComponent
          ) : (
            <IconChevronDownVector2 />
          )}
        </components.DropdownIndicator>
      );
    };

    return (
      <Select
        id={id}
        instanceId={id}
        options={options}
        onChange={onChange}
        value={value}
        isMulti={multiple}
        isSearchable={isSearchable}
        isClearable={isClearable}
        className={className}
        placeholder={placeholder}
        isDisabled={disabled}
        onMenuOpen={onMenuOpen}
        menuPlacement="auto" // dropdown automatically adjust based on the available space
        menuPortalTarget={
          typeof document !== 'undefined' ? document?.body : null
        }
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
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    );
  },
);
