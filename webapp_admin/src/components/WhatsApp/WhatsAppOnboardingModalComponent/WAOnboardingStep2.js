import React, { useEffect, useState, useRef } from 'react';
import WAOnboardingStepIndicator from './WAOnboardingStepIndicator.js';

/**
 * WAOnboardingStep2 - WA onboarding Step 2 body
 * @param {{
*  onHandleClick: Function,
*  uibLoading: boolean,
*  handleCloseModal: Function,
*  doneEnabled: boolean
* }} props 
* @returns {JSX}
*/
export default function WAOnboardingStep2({
  onHandleClick,
  uibLoading,
  handleCloseModal,
  doneEnabled
}) {
  return (
    <div className="" style={{ gap: '3em' }}>
      <div
        style={{
          flexGrow: 1,
          gap: '5em'
        }}
        className="d-flex  flex-column"
      >
        <WAOnboardingStepIndicator
          step={2}
        />
        <div
          className="center-body"
        >
          <button
            className="common-button-2 mt-4 text-normal"
            type="button"
            onClick={onHandleClick}
            disabled={uibLoading}
            style={{
              width: '300px',
            }}
          >
            {uibLoading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <span>Connect your Facebook business profile</span>
            )}
          </button>
          <div className="d-flex campaign-create-form mt-3"
            style={{
              width: '1000px',
            }}
          >
            <div>
              <p style={{
                textAlign: 'center'
              }}>We recommend you use a new number to avoid registration
                issues with Meta. These issues typically happen with
                existing numbers due to past events/ blockages with the
                accounts. The new number will only be required during the
                set up process and does not need to be an expensive plan.
                Simply enough to receive one SMS to register and retain the
                number</p>
            </div>
          </div>

          <div
            style={{
              marginTop: '3em',
              marginBottom: '3emf'
            }}
          >
            <button
              className="common-button-2 mt-4 text-normal"
              type="button"
              style={{
                width: '200px'
              }}
              disabled={!doneEnabled}
              onClick={handleCloseModal}
            >Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
