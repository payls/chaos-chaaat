import React, { useState } from 'react';
import constant from '../../constants/constant.json';

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
          <h3 style={{ fontFamily: 'PoppinsSemiBold' }}>Successful</h3>
          <p
            style={{
              fontFamily: 'PoppinsLight',
              textAlign: 'center',
              fontSize: '18px',
              color: '#919499',
              marginBottom: '20px',
            }}
          >
            Your request to connect your WhatsApp account has been successfully
            confirmed.{' '}
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
