import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { h } from '../../helpers';
import CommonTooltip from './CommonTooltip';
import CommonSelect from './CommonSelect';

// ICONS
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconEdit from '../ProposalTemplate/Link/preview/components/Icons/IconEdit';

export default React.memo(
  ({
    contact,
    field,
    value,
    cities = [],
    language = [],
    products = [],
    onSuccess = () => {},
    contactUpdate = () => {},
  }) => {
    const [form, setForm] = useState({});

    const [editMode, setEditMode] = useState(false);
    const [status, setStatus] = useState(constant.API_STATUS.IDLE);

    useEffect(() => {
      if (editMode && h.notEmpty(value)) {
        if (field === 'preferred_language') {
          setForm({ [field]: language.find((f) => f.value === value) });
        } else if (field === 'interested_city') {
          setForm({ [field]: cities.find((f) => f.value === value) });
        } else if (field === 'interested_product') {
          setForm({ [field]: products.find((f) => f.label === value) });
        }
      }
    }, [editMode]);

    useEffect(() => {
      setForm({
        [field]: value,
      });
    }, [field]);

    async function save() {
      if (h.isEmpty(form[field])) {
        h.general.alert('error', { message: 'Field cannot be empty.' });
        return;
      }
      setStatus(constant.API_STATUS.PENDING);

      const apiRes = await api.contact.updateTecData(
        contact?.contact_id,
        {
          field,
          value:
            typeof form[field] === 'object' ? form[field].value : form[field],
        },
        form,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        if (field === 'email') {
          contactUpdate({ ...contact, email: form[field] });
        }
        onSuccess();
        setEditMode(false);
      }

      setStatus(constant.API_STATUS.FULLFILLED);
    }

    return (
      <>
        {!editMode ? (
          <div className="d-flex  flex-col justify-content-between ">
            {field === 'enable_marketing' && (
              <span>{form[field] ? 'Yes' : 'No'}</span>
            )}
            {field === 'interested_product' && <span>{value}</span>}
            {field === 'interested_city' && (
              <span>{cities.find((f) => f.value === value)?.label ?? '-'}</span>
            )}
            {![
              'interested_product',
              'interested_city',
              'enable_marketing',
            ].includes(field) && (
              <span style={{ width: '90%', wordWrap: 'break-word' }}>
                {value ?? '-'}
              </span>
            )}

            <CommonTooltip tooltipText="Edit detail">
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setEditMode(true);
                }}
              >
                <IconEdit width={20} />
              </span>
            </CommonTooltip>
          </div>
        ) : (
          <>
            <div
              className="d-flex w-100 inline-edit-form"
              style={{ padding: '0px' }}
            >
              <div className="inline-edit-form-item">
                {field === 'email' && (
                  <input
                    type="text"
                    name="last_name"
                    placeholder={`Enter ${h.general.prettifyConstant(field)}`}
                    value={form[field]}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, [field]: e.target.value }));
                    }}
                    disabled={status === constant.API_STATUS.PENDING}
                  />
                )}
                {field === 'preferred_language' && (
                  <CommonSelect
                    id="preferred_language"
                    className={`${h.isEmpty(form[field]) ? 'field-error' : ''}`}
                    options={language}
                    value={form[field]}
                    isSearchable={true}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, [field]: v }));
                    }}
                    placeholder="Select Language"
                    disabled={status === constant.API_STATUS.PENDING}
                  />
                )}
                {field === 'interested_product' && (
                  <CommonSelect
                    id="interested_product"
                    className={`${h.isEmpty(form[field]) ? 'field-error' : ''}`}
                    options={products}
                    value={form[field]}
                    isSearchable={true}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, [field]: v }));
                    }}
                    placeholder="Select Product"
                    disabled={status === constant.API_STATUS.PENDING}
                  />
                )}
                {field === 'interested_city' && (
                  <CommonSelect
                    id="interested_city"
                    className={`${h.isEmpty(form[field]) ? 'field-error' : ''}`}
                    options={cities}
                    value={form[field]}
                    isSearchable={true}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, [field]: v }));
                    }}
                    placeholder="Select City"
                    disabled={status === constant.API_STATUS.PENDING}
                  />
                )}

                {field === 'enable_marketing' && (
                  <div className="mt-1">
                    <button
                      type="button"
                      className={`header-none-btn w ${
                        form[field] === false ? 'active' : ''
                      }`}
                      onClick={() => {
                        setForm((f) => ({ ...f, [field]: false }));
                      }}
                      disabled={status === constant.API_STATUS.PENDING}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className={`header-none-btn w ${
                        form[field] === true ? 'active' : ''
                      }`}
                      onClick={() => {
                        setForm((f) => ({ ...f, [field]: true }));
                      }}
                      disabled={status === constant.API_STATUS.PENDING}
                    >
                      Yes
                    </button>
                  </div>
                )}

                <div className="inline-edit-form-item btn-actions  d-flex gap-03 mt-1">
                  <button
                    className="common-button transparent-bg text-normal w-inter"
                    onClick={() => setEditMode(false)}
                    disabled={status === constant.API_STATUS.PENDING}
                  >
                    Cancel
                  </button>
                  <button
                    className="common-button-2 text-normal"
                    onClick={save}
                    disabled={
                      status === constant.API_STATUS.PENDING ||
                      h.isEmpty(form[field])
                    }
                  >
                    {status === constant.API_STATUS.PENDING
                      ? 'Saving...'
                      : 'Save'}
                  </button>
                </div>
              </div>
            </div>
            <hr />
          </>
        )}
      </>
    );
  },
);
