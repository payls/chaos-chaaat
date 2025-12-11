import React, { useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { routes } from '../../configs/routes';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { api } from '../../api';

export default React.memo(
  ({ agencyId, handleCloseModal, reloadCategories = () => {}, platform }) => {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const submit = async () => {
      const newListNameWords = title.split(' ');
      const capitalizedWords = newListNameWords.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1),
      );
      const capitalizedName = capitalizedWords.join(' ');
      const formData = {
        agency_id: agencyId,
        title: capitalizedName,
        description: description,
        platform,
      };
      const apiRes = await api.automation.createCategory(formData, true);
      if (h.cmpStr(apiRes.status, 'ok')) {
        reloadCategories();
        handleCloseModal(false);
      }
    };
    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body sm">
          <div className=" d-flex justify-content-between">
            <h1>Create new Category</h1>
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
            <label>Title</label>
            <input
              type="text"
              className="form-item mb-2"
              placeholder=""
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label>
              Description <small style={{ color: '#c5c5c5' }}>(Optional)</small>
            </label>

            <input
              type="text"
              className="form-item"
              placeholder=""
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
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
                disabled={h.isEmpty(title)}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
