import React, { useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { api } from '../../api';

export default React.memo(({ agencyId, handleCloseModal }) => {
  const router = useRouter();

  const [name, setName] = useState('');

  const submit = async () => {
    const newListNameWords = name.split(' ');
    const capitalizedWords = newListNameWords.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1),
    );
    const capitalizedName = capitalizedWords.join(' ');
    const formData = {
      agency_id: agencyId,
      list_name: capitalizedName,
    };
    const apiRes = await api.contactList.create(formData, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      const contact_list_id = apiRes.data.contact_list_id;
      await router.push(
        h.getRoute(routes.templates.contact.list_view, {
          list_id: contact_list_id,
        }),
        undefined,
        {
          shallow: true,
        },
      );
    }
  };
  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body sm">
        <div className=" d-flex justify-content-between">
          <h1>Create new list</h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              onClick={() => handleCloseModal(false)}
              style={{
                cursor: 'pointer',
                fontSize: '1em',
                marginLeft: '3em',
              }}
            >
              <FontAwesomeIcon
                icon={faTimes}
                color="#182327"
                style={{ fontSize: '15px' }}
              />
            </span>
          </div>
        </div>
        <div className=" modern-style mt-4 mdrn-input-form">
          <input
            type="text"
            className="form-item"
            placeholder="Enter list name..."
            value={name || ''}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="d-flex modern-modal-actions justify-content-between pt-2">
          <div style={{ flex: '50%' }}>
            <button
              type="type"
              className="modern-button fullw"
              onClick={() => handleCloseModal(false)}
            >
              Close
            </button>
          </div>
          <div style={{ flex: '50%' }}>
            <button
              type="type"
              className="modern-button common fullw"
              onClick={submit}
              disabled={h.isEmpty(name)}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
