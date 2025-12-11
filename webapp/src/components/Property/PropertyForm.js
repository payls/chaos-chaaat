import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import constant from '../../constants/constant.json';

export default function PropertyForm({ propertyId, setLoading, formMode }) {
  const router = useRouter();

  const fieldClass = 'col-12 col-sm-6';
  const formFields = {
    project_fk: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: fieldClass,
      options: [{ text: 'Select a project', value: undefined }],
      label: 'Project',
    },
    currency_code: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    code: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    address_1: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    address_2: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    address_3: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    unit_number: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    floor_number: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    direction_facing: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: fieldClass,
      options: [
        { text: 'Select direction', value: undefined },
        {
          text: h.general.prettifyConstant(constant.DIRECTION.NORTH_EAST),
          value: constant.DIRECTION.NORTH_EAST,
        },
        {
          text: h.general.prettifyConstant(constant.DIRECTION.NORTH),
          value: constant.DIRECTION.NORTH,
        },
        {
          text: h.general.prettifyConstant(constant.DIRECTION.NORTH_WEST),
          value: constant.DIRECTION.NORTH_WEST,
        },
        {
          text: h.general.prettifyConstant(constant.DIRECTION.EAST),
          value: constant.DIRECTION.EAST,
        },
        {
          text: h.general.prettifyConstant(constant.DIRECTION.SOUTH),
          value: constant.DIRECTION.SOUTH,
        },
        {
          text: h.general.prettifyConstant(constant.DIRECTION.SOUTH_EAST),
          value: constant.DIRECTION.SOUTH_EAST,
        },
        {
          text: h.general.prettifyConstant(constant.DIRECTION.SOUTH_WEST),
          value: constant.DIRECTION.SOUTH_WEST,
        },
      ],
    },
    area_sqm: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
      label: 'Area (sqm)',
    },
    area_sqft: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
      label: 'Area (sqft)',
    },
    offer_price: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
    },
    no_of_bedrooms: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
      label: 'No. of Bedrooms',
    },
    no_of_bathrooms: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: fieldClass,
      label: 'No. of Bathrooms',
    },
    status: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: fieldClass,
      options: [
        { text: 'Select property status', value: undefined },
        {
          text: h.general.prettifyConstant(constant.PROPERTY.STATUS.VACANT),
          value: constant.PROPERTY.STATUS.VACANT,
        },
        {
          text: h.general.prettifyConstant(
            constant.PROPERTY.STATUS.OWNER_OCCUPIED,
          ),
          value: constant.PROPERTY.STATUS.OWNER_OCCUPIED,
        },
        {
          text: h.general.prettifyConstant(
            constant.PROPERTY.STATUS.RENTAL_PENDING,
          ),
          value: constant.PROPERTY.STATUS.RENTAL_PENDING,
        },
        {
          text: h.general.prettifyConstant(constant.PROPERTY.STATUS.RENTED),
          value: constant.PROPERTY.STATUS.RENTED,
        },
        {
          text: h.general.prettifyConstant(
            constant.PROPERTY.STATUS.PURCHASE_PENDING,
          ),
          value: constant.PROPERTY.STATUS.PURCHASE_PENDING,
        },
      ],
    },
    has_balcony: {
      field_type: h.form.FIELD_TYPE.CHECKBOX,
      class_name: fieldClass,
    },
    notes: {
      field_type: h.form.FIELD_TYPE.TEXTAREA,
      class_name: 'col-12',
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    (async () => {
      await getPropertyById(propertyId);
    })();
  }, [propertyId]);

  const getPropertyById = async (property_id) => {
    if (h.notEmpty(property_id)) {
      setLoading(true);
      const apiRes = await api.property.findOne({ property_id }, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const property = apiRes.data.property;
        fields.project_fk.value = property.project_fk;
        fields.currency_code.value = property.currency_code;
        fields.code.value = property.code;
        fields.address_1.value = property.address_1;
        fields.address_2.value = property.address_2;
        fields.address_3.value = property.address_3;
        fields.unit_number.value = property.unit_number;
        fields.floor_number.value = property.floor_number;
        fields.direction_facing.value = property.direction_facing;
        fields.area_sqm.value = property.area_sqm;
        fields.area_sqft.value = property.area_sqft;
        fields.offer_price.value = property.offer_price;
        fields.no_of_bedrooms.value = property.no_of_bedrooms;
        fields.no_of_bathrooms.value = property.no_of_bathrooms;
        fields.has_balcony.value = property.has_balcony;
        fields.notes.value = property.notes;
        fields.status.value = property.status;
        setFields(fields);
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    let record = {
      project_fk: fields.project_fk.value,
      currency_code: fields.currency_code.value,
      code: fields.code.value,
      address_1: fields.address_1.value,
      address_2: fields.address_2.value,
      address_3: fields.address_3.value,
      unit_number: fields.unit_number.value,
      floor_number: fields.floor_number.value,
      direction_facing: fields.direction_facing.value,
      area_sqm: fields.area_sqm.value,
      area_sqft: fields.area_sqft.value,
      offer_price: fields.offer_price.value,
      no_of_bedrooms: h.notEmpty(fields.no_of_bedrooms.value)
        ? parseInt(fields.no_of_bedrooms.value)
        : undefined,
      no_of_bathrooms: h.notEmpty(fields.no_of_bathrooms.value)
        ? parseInt(fields.no_of_bathrooms.value)
        : undefined,
      has_balcony: h.notEmpty(fields.has_balcony.value)
        ? parseInt(fields.has_balcony.value)
        : 0,
      notes: fields.notes.value,
      status: fields.status.value,
    };
    let apiRes = null;
    setLoading(true);
    switch (formMode) {
      case h.form.FORM_MODE.ADD:
        apiRes = await api.property.create(record);
        if (h.cmpStr(apiRes.status, 'ok')) {
          setTimeout(async () => {
            await router.push(h.getRoute(routes.dashboard.properties));
          }, 2000);
        }
        break;
      case h.form.FORM_MODE.EDIT:
        record.property_id = propertyId;
        apiRes = await api.property.update(record);
        break;
    }
    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-sm-8 col-xl-6">
        <h1>{h.general.prettifyConstant(formMode)} Property</h1>
        <br />
        <h.form.GenericForm
          formFields={formFields}
          formMode={formMode}
          setLoading={setLoading}
          fields={fields}
          setFields={setFields}
          handleSubmit={handleSubmit}
          handleCancel={async (e) => {
            e.preventDefault();
            await router.push(h.getRoute(routes.dashboard.properties));
          }}
        />
      </div>
    </div>
  );
}
