import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import MediaForm from './MediaForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import constant from '../../constants/constant.json';

export default function PropertyForm({ onChangeFields }) {
  const formFields = {
    unit_type: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Unit Type',
      options: Object.values(constant.PROPERTY.UNIT_TYPE).map((obj) => ({
        value: obj,
        text: obj.toUpperCase(),
      })),
    },
    unit_number: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Unit Number',
    },
    floor: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Floor',
    },
    sqm: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'SQM',
    },
    number_of_bedroom: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Number of Bedroom',
    },
    number_of_bathroom: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Number of Bathroom',
    },
    number_of_parking_lots: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Number of Parking Lots',
    },
    direction_facing: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Location Longitude',
      options: Object.values(constant.DIRECTION).map((obj) => ({
        value: obj,
        text: obj.toUpperCase(),
      })),
    },
    currency_code: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Currency Code',
      options: Object.values(constant.CURRENCY.CODE).map((obj) => ({
        value: obj,
        text: obj.toUpperCase(),
      })),
    },
    starting_price: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Starting Price',
    },
    weekly_rent: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Weekly Rent',
    },
    rental_yield: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Rental Yield',
    },
    status: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Status',
      options: Object.values(constant.PROPERTY.STATUS).map((obj) => ({
        value: obj,
        text: obj.toUpperCase(),
      })),
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    onChangeFields(fields);
  }, [fields]);

  const [mediaForms, setMediaForms] = useState([]);

  const addNewMediaForm = () => {
    if (mediaForms.length === 0) {
      setMediaForms([{}]);
    } else {
      setMediaForms([...mediaForms, {}]);
    }
  };

  const removeMediaForm = (formIndex) => {
    return setMediaForms(
      mediaForms.filter((form, index) => {
        if (index === formIndex) {
          return null;
        }

        return form;
      }),
    );
  };

  const setMediaFormFields = (newFields, formIndex) => {
    onChangeFields({ ...fields, mediaForms });
    return setMediaForms(
      mediaForms.map((form, index) => {
        if (index === formIndex) {
          return newFields;
        }

        return form;
      }),
    );
  };

  return (
    <div className="mt-4">
      <h.form.GenericForm
        className="text-left"
        formFields={formFields}
        formMode={h.form.FORM_MODE.ADD}
        setLoading={() => {}}
        fields={fields}
        setFields={setFields}
        showCancelButton={false}
        showSubmitButton={false}
      />

      {mediaForms.length > 0 && (
        <div className="forms">
          <div className="mb-2">
            <span style={{ fontSize: 24 }}>Media Forms</span>
          </div>
          {mediaForms.map((_, mediaFormIndex) => (
            <div key={mediaFormIndex}>
              <div className="d-flex flex-row align-items-center">
                <b className="mr-2" style={{ fontSize: 16 }}>
                  Media Form {mediaFormIndex + 1}
                </b>
                <button
                  className="btn"
                  onClick={() => removeMediaForm(mediaFormIndex)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <MediaForm
                onChangeFields={(fields) =>
                  setMediaFormFields(fields, mediaFormIndex)
                }
              />
            </div>
          ))}
        </div>
      )}

      <button
        style={{ width: 170 }}
        className="common-button"
        onClick={addNewMediaForm}
      >
        New Media
      </button>
    </div>
  );
}
