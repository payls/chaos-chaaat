import React from 'react';
import moment from 'moment';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tiers from './Tiers';

export default React.memo(({ handleCloseModal }) => {
  return (
    <div className="campaign-schedule-wrapper">
      <div className="campaign-schedule-body" style={{ background: '#DEE9DB' }}>
        <div className=" d-flex justify-content-between">
          <h1></h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              onClick={handleCloseModal}
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
        <Tiers />
      </div>
    </div>
  );
});
