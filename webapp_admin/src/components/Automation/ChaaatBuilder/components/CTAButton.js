import React, { useState, useEffect } from 'react';
import mainStyle from '../styles/styles.module.scss';

// COMPONENTS

export default React.memo(({ currentScreenIndex, screens, onUpdate, disabled }) => {
  const [label, setLabel] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    setLabel(screens[currentScreenIndex].cta_label);
  }, [currentScreenIndex]);

  return (
    <div className={mainStyle.buttonDropdown}>
      <button
        type="button"
        className={`${mainStyle.sidebarWrapperBodySectionLink} mb-3`}
        onClick={() => setShow(!show)}
        disabled={disabled}
      >
        <span>Screen {currentScreenIndex + 1} CTA</span>
      </button>
      {show && (
        <div className={mainStyle.buttonDropdownContainer}>
          <div className={mainStyle.buttonDropdownContainerContent}>
            <div className={`${mainStyle.buttonDropdownContainerContentBody}`}>
              <label>Update CTA Label</label>
              <div className={`${mainStyle.templateBodyInputWrapper}`}>
                <input
                  type="text"
                  className={`${mainStyle.templateBodyInput}`}
                  value={label ?? ''}
                  onChange={(e) => {
                    setLabel(e.target.value);
                  }}
                  disabled={false}
                  placeholder={'Continue'}
                  name={'cta_' + (currentScreenIndex + 1)}
                />
              </div>
              <div
                className="d-flex justify-content-center align-items-center mt-3"
                style={{ gap: '12px' }}
              >
                <button
                  type="button"
                  className={`${mainStyle.gradientButton}`}
                  onClick={() => {
                    setShow(false);
                    onUpdate(label, currentScreenIndex);
                  }}
                  disabled={false}
                >
                  <span>Done</span>
                </button>
                <button
                  type="button"
                  className={`${mainStyle.blackBorderButton}`}
                  onClick={() => {
                    setShow(false);
                    setLabel(screens[currentScreenIndex].cta_label);
                  }}
                  disabled={false}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
