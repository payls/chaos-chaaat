import React, { useState, useRef, useEffect } from 'react';
import { h } from '../../helpers';

import { faTimes, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default React.memo(({ callBack }) => {
  const [buttons, setButtons] = useState([
    {
      value: '',
    },
  ]);

  useEffect(() => {
    if (h.notEmpty(buttons)) {
      callBack(buttons);
    }
  }, [buttons]);

  function handleAddButton() {
    const newBtn = [...buttons];
    newBtn.push({
      value: '',
    });

    setButtons(newBtn);
  }

  function handleUpdateButtonValue(v, index) {
    const newBtn = [...buttons];
    newBtn[index].value = v;

    setButtons(newBtn);
  }

  function handleDeleteButton(index) {
    const newBtn = [...buttons];
    newBtn.splice(index, 1);

    setButtons(newBtn);
  }

  return (
    <>
      {buttons &&
        buttons.length > 0 &&
        buttons.map((btn, i) => (
          <div className="quick-replies-wrapper">
            <label>Button Text</label>
            <span>
              <input
                type="text"
                value={btn.value}
                onChange={(e) => handleUpdateButtonValue(e.target.value, i)}
                size={100}
                maxLength={20}
              />
              <small> {btn.value.length}/20</small>
            </span>
            {buttons.length > 1 && (
              <FontAwesomeIcon
                icon={faTimes}
                color="#182327"
                style={{ marginLeft: '5px', cursor: 'pointer' }}
                onClick={() => handleDeleteButton(i)}
              />
            )}
          </div>
        ))}
      <button
        type="button"
        className="icon-btn"
        onClick={() => {
          handleAddButton();
        }}
        disabled={buttons.length === 10}
        style={{
          display: 'block',
          color: buttons.length === 10 ? '#c5c5c5' : 'inherit',
        }}
      >
        <FontAwesomeIcon
          icon={faPlusCircle}
          color="#182327"
          style={{
            marginRight: '5px',
            color: buttons.length === 10 ? '#c5c5c5' : 'inherit',
          }}
        />
        Add Reply Button
      </button>
    </>
  );
});
