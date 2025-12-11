import React, { useState, useEffect } from 'react';
import mainStyle from '../styles/styles.module.scss';

export default React.memo(
  ({
    onUpdate,
    title = 'Update CTA Label',
    placeholder = 'Enter CTA Label',
    value,
  }) => {
    const [label, setLabel] = useState(value);
    const [show, setShow] = useState(false);

    return (
      <div className={mainStyle.buttonDropdown}>
        <button
          type="button"
          className={`${mainStyle.sidebarWrapperBodySectionLink} mb-3`}
          onClick={() => setShow(!show)}
        >
          <span>{label}</span>
        </button>
        {show && (
          <div className={mainStyle.buttonDropdownContainer}>
            <div className={mainStyle.buttonDropdownContainerContent}>
              <div
                className={`${mainStyle.buttonDropdownContainerContentBody}`}
              >
                <label>{title}</label>
                <div className={`${mainStyle.templateBodyInputWrapper}`}>
                  <input
                    type="text"
                    className={`${mainStyle.templateBodyInput}`}
                    value={label ?? ''}
                    onChange={(e) => {
                      setLabel(e.target.value);
                    }}
                    disabled={false}
                    placeholder={placeholder}
                    name={'cta_' + new Date().getTime()}
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
                      onUpdate(label);
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
                      setLabel(value);
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
  },
);
