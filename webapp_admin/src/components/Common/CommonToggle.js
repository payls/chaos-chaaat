import React, { useState } from 'react';

// UI
import RadioToggled from '../FlowBuilder/Icons/RadioToggled';
import RadioToggledV2 from '../FlowBuilder/Icons/RadioToggledV2';
import RadioUnToggled from '../FlowBuilder/Icons/RadioUnToggled';
import RadioUnToggledV2 from '../FlowBuilder/Icons/RadioUnToggledV2';

export default React.memo(
  ({ onToggle = () => {}, options = [], version = 1 }) => {
    const [el, setEl] = useState(options);

    function handleToggle(i) {
      const e = [...el].map((m) => ({ ...m, toggled: false }));
      e[i].toggled = true;
      setEl(e);
      onToggle(options[i]);
    }

    function Toggled() {
      return version === 1 ? <RadioToggled /> : <RadioToggledV2 />;
    }
    function UnToggled() {
      return version === 1 ? <RadioUnToggled /> : <RadioUnToggledV2 />;
    }
    return (
      <div className="simple-toggle-wrapper">
        {el.map((option, i) => (
          <div
            key={i}
            onClick={() => handleToggle(i)}
            style={{ cursor: 'pointer' }}
            className="simple-toggle-item"
          >
            {option.toggled ? <Toggled /> : <UnToggled />}{' '}
            <span>{option.title}</span>
          </div>
        ))}
      </div>
    );
  },
);
