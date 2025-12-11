import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';

import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

export default function ContactFilter({
  label,
  options = [],
  allQueries = {},
  setAllQueries = () => {},
  filterKey,
  hide = false,
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
    setAllQueries((prevQueries) => {
      const duplicateAllQueries = { ...prevQueries };
      duplicateAllQueries.setFilter[filterKey] = valueArray.join(',');
      return duplicateAllQueries;
    });
  }, [JSON.stringify(selectedOptions)]);

  useEffect(() => {
    if (h.general.notEmpty(allQueries)) {
      const query = allQueries.setFilter[filterKey];
      const queryArray = query.split(',');
      const queryOptions = options.filter((option) =>
        queryArray.includes(option.value),
      );
      setSelectedOptions(queryOptions);
    }
  }, [JSON.stringify(allQueries), JSON.stringify(options)]);

  return (
    <>
      {!hide ? (
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
      ) : null}
    </>
  );
}
