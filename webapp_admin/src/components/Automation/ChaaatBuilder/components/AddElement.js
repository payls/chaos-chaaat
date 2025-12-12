import React, { useState, useEffect, useMemo, useCallback } from 'react';
import mainStyle from '../styles/styles.module.scss';
import { h } from '../../../../helpers';

// UI
import CirclePlus from '../../../FlowBuilder/Icons/CirclePlus';
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';

// COMPONENTS
import CommonSelect from '../../../Common/CommonSelect';
import CommonToggle from '../../../Common/CommonToggle';

const FIELD_TYPES = [
  {
    fieldType: 'DatePicker',
    label: 'Select date',
    placeholder: 'Enter date',
    type: 'text',
    value: "",
    name: "date"
  },
  {
    fieldType: 'Dropdown',
    label: 'Duration',
    placeholder: 'Enter duration',
    type: 'text',
    value: "",
    name: "duration"
  },
  {
    fieldType: 'Dropdown',
    label: ' Select time',
    placeholder: 'Enter time',
    type: 'text',
    value: "",
    name: "select_time"
  },
  {
    fieldType: 'DatePicker',
    label: 'Date of birth (DOB)',
    placeholder: 'Enter date of birth',
    type: 'date',
    value: "",
    name: "dob"
  },
  {
    fieldType: 'TextInput',
    label: 'Location',
    placeholder: 'Enter location',
    type: 'text',
    value: "",
    name: "location"
  },
  {
    fieldType: 'TextInput',
    label: 'Add no. of people',
    placeholder: 'Enter no. of people',
    type: 'text',
    value: "",
    name: "number_of_people"
  },
  {
    fieldType: 'TextInput',
    label: 'First name',
    placeholder: 'Enter first name',
    type: 'text',
    value: "",
    name: "first_name"
  },
  {
    fieldType: 'TextInput',
    label: 'Last name',
    placeholder: 'Enter last name',
    type: 'text',
    value: "",
    name: "last_name"
  },
  {
    fieldType: 'TextInput',
    label: 'Full name',
    placeholder: 'Enter full name',
    type: 'text',
    value: "",
    name: "full_name"
  },
  {
    fieldType: 'TextInput',
    label: 'Email',
    placeholder: 'Enter email',
    type: 'text',
    value: "",
    name: "email"
  },
  {
    fieldType: 'TextInput',
    label: 'Phone number',
    placeholder: 'Enter phone',
    type: 'text',
    value: "",
    name: "phone"
  },
  {
    fieldType: 'TextArea',
    label: 'Notes',
    placeholder: 'Enter notes',
    type: 'textarea',
    value: "",
    name: "notes"
  },
  {
    fieldType: 'TextArea',
    label: 'Special Request',
    placeholder: 'Enter special request',
    type: 'textarea',
    value: "",
    name: "special_request"
  },
];

const GOOGLE_OUTLOOK_FIELD_TYPES = [
  {
    fieldType: 'TextInput',
    label: 'Country code',
    placeholder: 'Country code',
    type: 'text',
    value: "",
    name: "country_code"
  },
  {
    fieldType: 'TextInput',
    label: 'Full name',
    placeholder: 'Full name',
    type: 'text',
    value: "",
    name: "full_name"
  },
  {
    fieldType: 'TextInput',
    label: 'Company Name',
    placeholder: 'Company Name',
    type: 'text',
    value: "",
    name: "company_name"
  },
  {
    fieldType: 'TextInput',
    label: 'Email',
    placeholder: 'Email',
    type: 'text',
    value: "",
    name: "email"
  },
  {
    fieldType: 'TextArea',
    label: 'Notes',
    placeholder: 'Notes',
    type: 'textarea',
    value: "",
    name: "notes"
  }
]

export default React.memo(({ currentScreenIndex, onAdd, screens, selectedCrm, disabled, bookingOption }) => {
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);
  const [elementObj, setElementObj] = useState({
    name: '',
    label: '',
    placeholder: '',
    fieldType: null,
    required: false,
  });
  const [ addFormElement, setAddFormElement ] = useState(FIELD_TYPES);
  const [ fieldTypes, setFieldType ] = useState([]);

  /**
  * Sets the options for the add form elements based on the selected booking option
  * 
  * @param {string} _bookingOption - The booking option to determine which fields to set.
  */
  const setAddFormElementOptions = (_bookingOption) => {
    if (_bookingOption === "custom") {
      setAddFormElement([
        ...GOOGLE_OUTLOOK_FIELD_TYPES,
        {
          fieldType: 'TextInput',
          label: 'Number',
          placeholder: 'Number',
          type: 'text',
          value: "",
          name: "number"
        },
        {
          name: "date",
          value: "",
          label: "Select date",
          placeholder: "Select date",
          fieldType: "DatePicker",
          type: "text",
          "min-date": Date.now().toString(),
        },
        {
          name: "duration",
          value: "",
          label: "Set duration",
          placeholder: "Set duration",
          fieldType: "Dropdown",
          type: "dropdown",
        },
        {
          name: "select_time",
          value: "",
          label: "Select time",
          placeholder: "Select time",
          fieldType: "Dropdown",
          type: "dropdown",
        },
      ]);
    } else {
      setAddFormElement(GOOGLE_OUTLOOK_FIELD_TYPES);
    }
  };

  /**
  * This UseEffect fetches and sets element options based on selected crms and screens
  */
  useEffect(() => {
    const fetchData = async () => {
        await Promise.all([
            setElementObj(selected),
            selectedCrm === 'GOOGLE' || selectedCrm === 'OUTLOOK' ? setAddFormElementOptions(bookingOption) : Promise.resolve()
        ]);
        let initialFieldType = [];
        console.log("screens", screens)
        screens.forEach((screen) => {
          screen?.elements && screen?.elements.length > 0 && screen?.elements.forEach((key) => {
              initialFieldType.push(key.name);
          });
        })
        setFieldType(initialFieldType);
    };

    fetchData();
}, [selected, screens, currentScreenIndex, selectedCrm, bookingOption]);

  /**
   * Handles the change event for the input fields.
   * Updates the element object with the new value.
   * @param {string} v - The new value.
   * @param {string} key - The key of the element object to update.
   */
  function onChange(v, key) {
    console.log(v, key)
    setElementObj((prev) => ({ ...prev, [key]: v }));
  }

  /**
   * Handles the submit event when adding a new element.
   * Logs the selected and element objects.
   * Calls the onAdd function with the merged objects.
   * Resets the state values.
   */
  function handleSubmit() {
    onAdd({ ...selected, ...elementObj });
    setShow(false);
    setSelected(null);
    setElementObj({
      name: elementObj.name,
      placeholder: '',
      fieldType: null,
      required: false,
    });
  }

  function isFieldDropDownDisabled() {
    return (addFormElement.filter(
      (f) => !fieldTypes.includes(f.name),
    )).length < 1
  }

  return (
    <>
      <button
        type="button"
        className={`${mainStyle.sidebarWrapperBodySectionLink} ${mainStyle.sidebarWrapperBodySectionLinkM} mb-3 `}
        onClick={() => setShow(!show)}
        disabled={isFieldDropDownDisabled() || disabled}
      >
        <span>
          <CirclePlus style={{ marginRight: '10px' }} /> Add form elements
        </span>
      </button>
      {show && (
        <div className={`${mainStyle.gradientWrapper} mb-3`}>
          <div className={mainStyle.flowForm}>
            <CommonSelect
              id={`type`}
              options={addFormElement.filter(
                (f) => !fieldTypes.includes(f.name),
              )}
              value={selected}
              isSearchable={true}
              placeholder="Select element type"
              className=" select-template"
              disabled={isFieldDropDownDisabled()}
              onChange={setSelected}
              iconComponent={<ChevronDownSelect />}
            />
            {selected && (
              <div className=" mt-3 ">
                <label>Label</label>
                <div className={`${mainStyle.templateBodyInputWrapper}`}>
                  <input
                    type="text"
                    className={`${mainStyle.templateBodyInput} mb-3`}
                    value={elementObj && elementObj?.placeholder}
                    onChange={(e) => onChange(e.target.value, 'placeholder')}
                    disabled={false}
                    placeholder={'Enter label'}
                    name={'label_' + (currentScreenIndex + 1)}
                  />
                </div>

                <label>Helper text</label>
                <div className={`${mainStyle.templateBodyInputWrapper}`}>
                  <input
                    type="text"
                    className={`${mainStyle.templateBodyInput} mb-3`}
                    value={elementObj && elementObj?.value}
                    onChange={(e) => onChange(e.target.value, 'value')}
                    disabled={false}
                    placeholder={elementObj && elementObj?.placeholder}
                    name={'helper_' + (currentScreenIndex + 1)}
                  />
                </div>

                <label>Required</label>
                <div className="mb-3">
                  <CommonToggle
                    onToggle={(e) => {
                      onChange(e?.value, 'required')}
                    }
                    version={2}
                    options={[
                      {
                        title: 'Required',
                        toggled: false,
                        value: true,
                      },
                      {
                        title: 'Optional',
                        toggled: true,
                        value: false,
                      },
                    ]}
                  />
                </div>

                <button
                  type="button"
                  className={`${mainStyle.sidebarWrapperBodySectionLink} mt-3`}
                  onClick={handleSubmit}
                >
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
