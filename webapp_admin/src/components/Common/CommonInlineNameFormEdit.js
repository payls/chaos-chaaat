import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { h } from '../../helpers';
import CommonTooltip from './CommonTooltip';

// ICONS
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconEdit from '../ProposalTemplate/Link/preview/components/Icons/IconEdit';

export default React.memo(({ contact, onSuccess }) => {
  const [form, setForm] = useState({
    first_name: null,
    last_name: null,
    contact_id: null,
    mobile_number: null,
    agency_user_id: null,
    agency_id: null,
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setForm({
      first_name: contact?.first_name,
      last_name: contact?.last_name,
      contact_id: contact?.contact_id,
      mobile_number: contact?.mobile_number,
      agency_user_id: contact?.agency_user_fk,
      agency_id: contact?.agency_fk,
    });

    return () => {
      setEditMode(false);
    };
  }, [contact]);

  async function save() {
    const apiRes = await api.contact.update(form);

    if (h.cmpStr(apiRes.status, 'ok')) {
      onSuccess({
        ...contact,
        first_name: form?.first_name,
        last_name: form?.last_name,
      });
      setEditMode(false);
    }
  }

  return (
    <>
      {!editMode ? (
        <>
          <div className="mt-4">
            <h3 className="">
              <CommonTooltip tooltipText="Edit contact details">
                <span
                  style={{ cursor: 'pointer' }}
                  className="d-flex justify-content-between "
                  onClick={() => {
                    setEditMode(true);
                  }}
                >
                  <b>{`${contact?.first_name ?? ''} ${
                    contact?.last_name ?? ''
                  }`}</b>

                  <IconEdit width={20} />
                </span>
              </CommonTooltip>
            </h3>
          </div>
        </>
      ) : (
        <>
          <div className="d-flex w-100 inline-edit-form">
            <div className="inline-edit-form-item">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                placeholder="Enter your first name"
                value={form.first_name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, first_name: e.target.value }));
                }}
              />
            </div>
            <div className="inline-edit-form-item">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                placeholder="Enter your last name"
                value={form.last_name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, last_name: e.target.value }));
                }}
              />
              <div className="inline-edit-form-item btn-actions  d-flex gap-03 mt-1">
                <button
                  className="common-button transparent-bg text-normal w-inter"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
                <button className="common-button-2 text-normal" onClick={save}>
                  Save
                </button>
              </div>
            </div>
          </div>
          <hr />
        </>
      )}
    </>
  );
});
