import React, { useState } from 'react';

import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default React.memo(({ handleCloseModal = () => {} }) => {
  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body sm">
        <div className="center-body">
          <img
            src="https://cdn.yourpave.com/assets/success-icon.png"
            className="mb-3"
          />
          <h3 style={{ fontFamily: 'PoppinsSemiBold' }}>Trial Ended</h3>
          <p
            style={{
              fontFamily: 'PoppinsLight',
              textAlign: 'center',
              fontSize: '18px',
              color: '#919499',
              marginBottom: '20px',
            }}
          >
            Your trial limit already been used.{' '}
          </p>
          <button
            type="button"
            className="modern-button common"
            onClick={handleCloseModal}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
});
