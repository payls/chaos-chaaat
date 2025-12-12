import React, { useState, useEffect } from 'react';

import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

export default function ActivityStreamFilter({
  label,
  options = [],
  setQuery = () => {},
}) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
    if (value.length === 0) {
      return `${placeholderButtonLabel}`;
    } else {
      return `(${value.length}) ${placeholderButtonLabel}`;
    }
  }

  function onChange(value, event) {
    this.setState(value);
  }

  useEffect(() => {
    const valueArray = selectedOptions.map((option) => option.value);
    setQuery(valueArray.join(','));
  }, [selectedOptions]);

  return (
    <div className="contact-filter">
      <ReactMultiSelectCheckboxes
        options={options}
        placeholderButtonLabel={label}
        getDropdownButtonLabel={getDropdownButtonLabel}
        value={selectedOptions}
        onChange={onChange}
        setState={setSelectedOptions}
      />
    </div>
  );
}
