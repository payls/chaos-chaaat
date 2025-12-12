import React, { useState } from 'react';

// UI
import CheckboxToggled from '../FlowBuilder/Icons/CheckboxToggled';
import CheckboxUntoggled from '../FlowBuilder/Icons/CheckboxUntoggled';

export default React.memo(
  ({ onToggle = () => {}, defaultValue = false, title }) => {
    const [toggle, setToggle] = useState(defaultValue);

    function handleToggle() {
      const t = !toggle;
      setToggle(t);
      onToggle(t);
    }

    return (
      <div className="simple-toggle-wrapper">
        <div
          onClick={handleToggle}
          style={{ cursor: 'pointer' }}
          className="simple-toggle-item"
        >
          {toggle ? <CheckboxToggled /> : <CheckboxUntoggled />}{' '}
          <span>{title}</span>
        </div>
      </div>
    );
  },
);
