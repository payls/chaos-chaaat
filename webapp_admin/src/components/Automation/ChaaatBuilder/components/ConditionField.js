import React, { useState, useEffect, useRef } from 'react';
import mainStyle from '../styles/styles.module.scss';
import { unescapeData } from '../../../../helpers/general';

// COMPONENTS
import CommonSelect from '../../../Common/CommonSelect';

// UI
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';


const FIELD_TYPES = [
  // {
  //   fieldType: 'date',
  //   label: 'Select date',
  //   placeholder: 'Enter date',
  //   type: 'text',
  //   value: {},
  // },
  {
    fieldType: 'msg_reply',
    label: 'Message reply',
    placeholder: 'Enter message reply',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'duration',
    label: 'Duration',
    placeholder: 'Enter duration',
    type: 'text',
    value: {},
  },
  // {
  //   fieldType: 'time',
  //   label: ' Select time',
  //   placeholder: 'Enter time',
  //   type: 'text',
  //   value: {},
  // },
  // {
  //   fieldType: 'dob',
  //   label: 'Date of birth (DOB)',
  //   placeholder: 'Enter date of birth',
  //   type: 'date',
  //   value: {},
  // },
  {
    fieldType: 'location',
    label: 'Location',
    placeholder: 'Enter location',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'no_people',
    label: 'Add no. of people',
    placeholder: 'Enter no. of people',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'first_name',
    label: 'First name',
    placeholder: 'Enter first name',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'last_name',
    label: 'Last name',
    placeholder: 'Enter last name',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'full_name',
    label: 'Full name',
    placeholder: 'Enter full name',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'email',
    label: 'Email',
    placeholder: 'Enter email',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'phone',
    label: 'Phone number',
    placeholder: 'Enter phone',
    type: 'text',
    value: {},
  },
  {
    fieldType: 'notes',
    label: 'Notes',
    placeholder: 'Enter notes',
    type: 'textarea',
    value: {},
  },
  {
    fieldType: 'special_request',
    label: 'Special Request',
    placeholder: 'Enter special request',
    type: 'textarea',
    value: {},
  },
];

const OPERATOR_TYPES = [
  {
    label: 'equals to',
    value: 'equals to',
  },
  {
    label: 'not equals to',
    value: 'not equals to',
  },
  {
    label: 'contains',
    value: 'contains',
  },
  {
    label: 'does not contain',
    value: 'does not contain',
  },
  {
    label: 'is empty',
    value: 'is empty',
  },
  {
    label: 'is not empty',
    value: 'is not empty',
  },
  {
    label: 'Regex',
    value: 'regex',
  },
  {
    label: 'smart match',
    value: 'smart match',
  },
];

export default React.memo(({ index, onSave, data }) => {
  const dropdownRef = useRef(null);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(
    data || {
      operator: null,
      variable: null,
      value: '',
    },
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  /**
   * Handles the cancel action.
   */
  function handleCancel() {
    setForm(
      data || {
        operator: null,
        variable: null,
        value: '',
      },
    );
    setShow(false);
  }

  return (
    <div className={mainStyle.buttonDropdown}>
      <button
        type="button"
        className={`${mainStyle.sidebarWrapperBodySectionLink} mb-3`}
        onClick={() => setShow(!show)}
      >
        <span>Condition {index + 1}</span>
      </button>
      {show && (
        <div className={mainStyle.buttonDropdownContainer} ref={dropdownRef}>
          <div className={mainStyle.buttonDropdownContainerContent}>
            <div className={`${mainStyle.buttonDropdownContainerContentBody}`}>
              <label>Condition Form</label>
              <div className={`${mainStyle.templateBodyInputWrapper}`}>
                <div className={`${mainStyle.flowForm} ${mainStyle.wFull}`}>
                  <section>
                    <span>Variable</span>
                    <CommonSelect
                      id={`type`}
                      options={FIELD_TYPES}
                      value={form.variable}
                      isSearchable={true}
                      placeholder="Select variable"
                      className={`${mainStyle.flowFormSelectControl} select-template mb-3`}
                      disabled={false}
                      onChange={(v) => setForm((p) => ({ ...p, variable: v }))}
                      iconComponent={<ChevronDownSelect />}
                    />
                  </section>
                  <section>
                    <span>Operator</span>
                    <CommonSelect
                      id={`type`}
                      options={OPERATOR_TYPES}
                      value={form.operator}
                      isSearchable={true}
                      placeholder="Select operator"
                      className={`${mainStyle.flowFormSelectControl} select-template mb-3`}
                      disabled={false}
                      onChange={(v) => setForm((p) => ({ ...p, operator: v }))}
                      iconComponent={<ChevronDownSelect />}
                    />
                  </section>
                  <section>
                    <span>Value</span>
                    <input
                      type="text"
                      className={`${mainStyle.templateBodyInputAppended} mb-3`}
                      value={unescapeData(form.value)}
                      onChange={(v) =>
                        setForm((p) => ({ ...p, value: v.target.value }))
                      }
                      disabled={false}
                      placeholder={'Enter value'}
                      name={'label_' + index}
                    />
                  </section>
                </div>
              </div>
              <div
                className="d-flex justify-content-center align-items-center mt-3"
                style={{ gap: '12px' }}
              >
                <button
                  type="button"
                  className={`${mainStyle.gradientButton}`}
                  onClick={() => {
                    setShow(false);
                    onSave(form, index);
                  }}
                  disabled={false}
                >
                  <span>Done</span>
                </button>
                <button
                  type="button"
                  className={`${mainStyle.blackBorderButton}`}
                  onClick={handleCancel}
                  disabled={false}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
