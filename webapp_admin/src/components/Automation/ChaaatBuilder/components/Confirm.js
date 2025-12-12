import React, { useState, useEffect, useRef } from 'react';
import mainStyle from '../styles/styles.module.scss';

export default React.memo(
  ({ onConfirm, icon, message, confirmLabel = 'Confirm', disabled }) => {
    const dropdownRef = useRef(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          handleCancel();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownRef]);

    /**
     * Handles the cancel action.
     */
    function handleCancel() {
      setShow(false);
    }

    /**
     * Handles the click event.
     */
    function handleClick() {
      setShow(true);
    }

    return (
      <div className={`${mainStyle.btnConfirm} ${disabled ? mainStyle.btnConfirmDisabled :""}`}>
        <span onClick={() => !disabled && handleClick()}>{icon}</span>
        {show && (
          <div className={mainStyle.btnConfirmContainer} ref={dropdownRef}>
            <div className={mainStyle.btnConfirmContainerContent}>
              <div className={`${mainStyle.btnConfirmContainerContentBody}`}>
                <div
                  className={`${mainStyle.helperText} ${mainStyle.textAlignCenter}`}
                >
                  {message}
                </div>
                <div
                  className="d-flex justify-content-center align-items-center mt-4"
                  style={{ gap: "12px" }}
                >
                  <button
                    type="button"
                    className={`${mainStyle.gradientButton}`}
                    onClick={() => {
                      setShow(false);
                      onConfirm();
                    }}
                    disabled={false}
                  >
                    <span>{confirmLabel}</span>
                  </button>
                  <button
                    type="button"
                    className={`${mainStyle.blackBorderButton}`}
                    onClick={handleCancel}
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
