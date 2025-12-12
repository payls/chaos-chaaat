import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';
import CommonSideModal from '../Common/CommonSideModal';
import IconSearch from '../Icons/IconSearch';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import ReactSelect from 'react-select';
import { faAngleLeft, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ContactGenericFilter(props) {
  const {
    showModal = false,
    setShowModal,
    allCustomProperties,
    allQueries = {},
    setAllQueries,
  } = props;

  const [customProperties, setCustomProperties] = useState([]);
  const [searchCustomProperties, setSearchCustomProperties] = useState('');
  const [propertySelected, setPropertySelected] = useState(null);
  const [selectingMoreCustomProperties, setSelectingMoreCustomProperties] =
    useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filteredCustomProperties, setFilteredCustomProperties] = useState([]);

  const getSelectedPropertyOptions = () => {
    if (h.general.isEmpty(propertySelected)) return [];
    const attributeValueKeys = {
      string: 'attribute_value_string',
      int: 'attribute_value_int',
      date: 'attribute_value_date',
    };

    const attributeValueKey =
      attributeValueKeys[propertySelected.attribute_type];

    let options = [];
    if (propertySelected.attribute_type === 'date') {
      for (const dateOption in constant.DATE_FILTER) {
        options.push({
          value: constant.DATE_FILTER[dateOption].VALUE,
          label: h.general.prettifyConstant(
            constant.DATE_FILTER[dateOption].VALUE,
          ),
        });
      }
    } else {
      options = propertySelected.contact_property_values.map((value) => ({
        value: value[attributeValueKey],
        label: value[attributeValueKey],
      }));
    }

    return options;
  };

  useEffect(() => {
    if (h.general.notEmpty(searchCustomProperties)) {
      const searchResult = allCustomProperties.filter((property) => {
        const lowerDebouncedQuery = searchCustomProperties.toLowerCase();
        const lowerAttributeName = property.attribute_name.toLowerCase();
        const lowerPrettifiedAttributeName = h.general
          .prettifyConstant(lowerAttributeName)
          .toLowerCase();
        return (
          lowerAttributeName.includes(lowerDebouncedQuery) ||
          lowerPrettifiedAttributeName.includes(lowerDebouncedQuery)
        );
      });
      setCustomProperties(searchResult);
    } else {
      setCustomProperties(allCustomProperties);
    }
  }, [allCustomProperties, searchCustomProperties]);

  function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
    if (value.length === 0) {
      return `${placeholderButtonLabel}`;
    } else {
      return `${value.length} ${placeholderButtonLabel}`;
    }
  }

  function onChange(value) {
    this.setState(value);
  }

  function onChangeDate(value) {
    this.setState([value]);
  }

  useEffect(() => {
    parseToGenericQueries();
  }, [JSON.stringify(filteredCustomProperties)]);

  useEffect(() => {
    parseToFilteredCustomProperties();
  }, [JSON.stringify(allQueries)]);

  const parseToGenericQueries = () => {
    const queryObject = {};
    for (const key in filteredCustomProperties) {
      const filteredCustomProperty = filteredCustomProperties[key];
      queryObject[filteredCustomProperty.attribute_name] = {
        attribute_type: filteredCustomProperty.attribute_type,
        attribute_value: filteredCustomProperty.attribute_value,
      };
    }
    const duplicateQueries = h.general.deepCloneObject(allQueries);
    duplicateQueries.moreFilter = queryObject;
    setAllQueries(duplicateQueries);
  };

  const parseToFilteredCustomProperties = () => {
    const newFilteredCustomProperties = [];
    const genericQueries = allQueries.moreFilter;
    for (const key in genericQueries) {
      const objectToAdd = {
        attribute_name: key,
        attribute_type: genericQueries[key].attribute_type,
        attribute_value: genericQueries[key].attribute_value,
      };
      newFilteredCustomProperties.push(objectToAdd);
    }
    setFilteredCustomProperties(newFilteredCustomProperties);
  };

  const selectingProperty = (property) => {
    setPropertySelected(property);
    setSelectingMoreCustomProperties(false);
    const existingProperty = filteredCustomProperties.find(
      (filteredProperty) =>
        filteredProperty.attribute_name === property.attribute_name,
    );
    if (existingProperty) {
      setSelectedOptions(
        existingProperty.attribute_value.map((value) => ({
          value: value,
          label: value,
        })),
      );
    }
  };

  const applyFilter = () => {
    const existingCustomProperty = filteredCustomProperties.find(
      (property) => property.attribute_name === propertySelected.attribute_name,
    );

    const objectToAdd = {
      attribute_name: propertySelected.attribute_name,
      attribute_type: propertySelected.attribute_type,
      attribute_value: selectedOptions.map((option) => option.value),
    };

    if (existingCustomProperty) {
      const duplicateArray = filteredCustomProperties;
      const removeIndex = duplicateArray.indexOf(existingCustomProperty);
      duplicateArray.splice(removeIndex, 1);
      setFilteredCustomProperties([...duplicateArray, objectToAdd]);
    } else {
      setFilteredCustomProperties([...filteredCustomProperties, objectToAdd]);
    }

    setPropertySelected(null);
    setSelectedOptions([]);
  };

  const removeFilteredCustomProperty = (property) => {
    const duplicateArray = filteredCustomProperties;
    const propertyToDelete = duplicateArray.find(
      (e) => e.attribute_name === property.attribute_name,
    );
    const removeIndex = duplicateArray.indexOf(propertyToDelete);
    duplicateArray.splice(removeIndex, 1);
    setFilteredCustomProperties([...duplicateArray]);
  };

  const appliedFilterComponents = () => {
    return filteredCustomProperties.map((property, index) => {
      const formattedName = property.attribute_name;
      const bridgingText = h.general.cmpStr(property.attribute_type, 'date')
        ? ' is in '
        : ' is exactly ';
      const strongValues = property.attribute_value.map(
        (value) => '<strong>' + value + '</strong>',
      );
      let formattedValues;
      if (property.attribute_value.length > 1) {
        formattedValues =
          strongValues.slice(0, -1).join(', ') +
          ' or ' +
          strongValues[property.attribute_value.length - 1];
      } else {
        if (h.general.cmpStr(property.attribute_type, 'date')) {
          formattedValues = strongValues[0].replaceAll('_', ' ');
        } else {
          formattedValues = strongValues[0];
        }
      }
      const dangerouslySetInnerHTML =
        formattedName + bridgingText + formattedValues;
      return (
        <>
          {index !== 0 && (
            <div className="py-3" style={{ color: '#99acc2' }}>
              and
            </div>
          )}
          <div
            className="p-3"
            style={{
              border: '1px solid #dfe3eb',
              borderRadius: '3px',
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            <div className="d-flex flex-row justify-content-between">
              <span
                dangerouslySetInnerHTML={{
                  __html: dangerouslySetInnerHTML,
                }}
              ></span>
              <span style={{ paddingTop: '0.5px', paddingLeft: '5px' }}>
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  color="red"
                  fontSize="20px"
                  style={{ width: 12, cursor: 'pointer' }}
                  onClick={() => {
                    removeFilteredCustomProperty(property);
                  }}
                />
              </span>
            </div>
          </div>
        </>
      );
    });
  };

  return (
    <CommonSideModal showModal={showModal}>
      <div className="custom-filter-header">
        <div
          className="d-flex align-items-center pl-5"
          style={{ height: '100%' }}
        >
          Filters
        </div>
        <div className="custom-filter-header-close-container d-flex align-items-center pr-4">
          <span
            className="custom-filter-header-close"
            onClick={() => setShowModal(false)}
          >
            X
          </span>
        </div>
      </div>
      <div
        className="custom-filter-content d-flex flex-column align-items-center"
        style={{ position: 'relative' }}
      >
        {h.general.notEmpty(filteredCustomProperties) &&
          !selectingMoreCustomProperties &&
          !propertySelected && (
            <div
              className="pt-4 px-5"
              style={{ width: '100%', height: '100%' }}
            >
              <div
                className="mb-4"
                style={{ borderBottom: '1px solid #dfe3eb' }}
              >
                <h6>Current Active Filters</h6>
              </div>
              {h.general.notEmpty(filteredCustomProperties) &&
                appliedFilterComponents()}
              <button
                className="common-button mt-5"
                style={{ width: 'initial' }}
                onClick={() => {
                  setSelectingMoreCustomProperties(true);
                }}
              >
                More custom filters
              </button>
            </div>
          )}
        {((h.general.isEmpty(filteredCustomProperties) && !propertySelected) ||
          (h.general.notEmpty(filteredCustomProperties) &&
            selectingMoreCustomProperties)) && (
          <>
            <div className="px-5 pt-4 pb-2" style={{ width: '100%' }}>
              {selectingMoreCustomProperties && (
                <div>
                  <span
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      color: '#08453d',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setSelectingMoreCustomProperties(false);
                    }}
                  >
                    <span style={{ padding: '0 10px 0 0' }}>
                      <FontAwesomeIcon
                        icon={faAngleLeft}
                        color="#08453d"
                        fontSize="20px"
                      />
                    </span>
                    Back
                  </span>
                </div>
              )}

              <h6 className="pt-4">Custom Properties</h6>

              <div className="tab-body pt-2" style={{ width: '100%' }}>
                <div className="search-input d-flex justify-content-center">
                  <input
                    placeholder="Search"
                    value={searchCustomProperties}
                    onChange={(e) => {
                      setSearchCustomProperties(e.target.value);
                    }}
                  />
                  <IconSearch />
                </div>
              </div>
            </div>
            <div
              className="pt-3 px-5"
              style={{
                width: '100%',
                flexGrow: '1',
              }}
            >
              <div className="custom-filter-scrollable-container">
                <div className="custom-filter-scrollable">
                  {customProperties &&
                    customProperties.map((property) => {
                      return (
                        <div
                          className="custom-property py-2 px-1"
                          onClick={() => {
                            selectingProperty(property);
                          }}
                        >
                          {property.attribute_name}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </>
        )}
        {propertySelected && (
          <div className="pt-4 px-5" style={{ width: '100%', height: '100%' }}>
            <div>
              <span
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: '#08453d',
                  fontWeight: 'bold',
                }}
                onClick={() => {
                  setPropertySelected(null);
                  if (h.general.notEmpty(filteredCustomProperties))
                    setSelectingMoreCustomProperties(true);
                  setSelectedOptions([]);
                }}
              >
                <span style={{ padding: '0 10px 0 0' }}>
                  <FontAwesomeIcon
                    icon={faAngleLeft}
                    color="#08453d"
                    fontSize="20px"
                  />
                </span>
                Back
              </span>
            </div>
            <h6 className="pt-4 pb-2">{propertySelected.attribute_name}</h6>
            <div style={{ width: '100%' }}>
              {h.general.cmpStr(propertySelected.attribute_type, 'date') ? (
                <ReactSelect
                  options={getSelectedPropertyOptions()}
                  value={selectedOptions}
                  onChange={onChangeDate}
                  setState={setSelectedOptions}
                  getOptionLabel={(option) => `${option.value}`}
                />
              ) : (
                <ReactMultiSelectCheckboxes
                  options={getSelectedPropertyOptions()}
                  width="100%"
                  placeholderButtonLabel={
                    h.general.isEmpty(selectedOptions)
                      ? 'Select value'
                      : selectedOptions.length === 1
                      ? ' value selected'
                      : 'values selected'
                  }
                  getDropdownButtonLabel={getDropdownButtonLabel}
                  value={selectedOptions}
                  onChange={onChange}
                  setState={setSelectedOptions}
                />
              )}
            </div>
            <button
              className="common-button mt-5"
              style={{
                width: 'initial',
                backgroundColor: h.general.isEmpty(selectedOptions)
                  ? 'grey'
                  : '#08453d',
                borderColor: h.general.isEmpty(selectedOptions)
                  ? 'grey'
                  : '#08453d',
                cursor: h.general.isEmpty(selectedOptions)
                  ? 'not-allowed'
                  : 'pointer',
              }}
              onClick={() => {
                if (h.general.notEmpty(selectedOptions)) applyFilter();
              }}
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>
    </CommonSideModal>
  );
}
