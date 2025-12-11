import React from 'react';
import ActivePageIcon from './ActivePageIcon';
import InactivePageIcon from './InactivePageIcon';

/**
 * WAOnboardingStepIndicator - used for step indicator in the WABA onboarding modal
 * @param {{
 *  step: number?
 * }} props 
 * @returns {JSX}
 */
export default function WAOnboardingStepIndicator({ step = 1 }) {
  return (
    <div
      className="d-flex justify-content-center"
      style={{
        gap: '7px',
        fontSize: '12px',
      }}
    >
      <div className="d-flex justify-content-center align-items-center flex-column"
        style={{
          gap: '7px'
        }}
      ><ActivePageIcon
          width={30}
          opacity='1'
        /><span
          style={{
            opacity: '0.8'
          }}
        >Step 1</span></div>
      <span style={{
        borderTop: '2px dashed #DBECFF',
        width: '200px',
        height: 2,
        marginTop: '18px'
      }}></span>
      {
        step > 1 ?
          <div className="d-flex justify-content-center align-items-center flex-column"
            style={{
              gap: '7px'
            }}
          ><ActivePageIcon
              width={30}
            /><span
              style={{
                opacity: '0.8'
              }}
            >Step 2</span></div>
          :
          <div className="d-flex justify-content-center align-items-center flex-column"
            style={{
              gap: '7px'
            }}
          ><InactivePageIcon
              width={30}
            /><span
              style={{
                opacity: '0.8'
              }}
            >Step 2</span></div>
      }
    </div>
  );
}
