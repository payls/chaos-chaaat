import React, { useRef, useState, useEffect } from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';

import { faPlus, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from './CommonTooltip';

export default React.memo(({ className = '', items = [] }) => {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={`${className} dropdown-menu-wrapper`}>
      <CommonTooltip tooltipText="Attach">
        <button type="button" onClick={() => setToggle(true)}>
          <FontAwesomeIcon color="#055349" icon={faPlus} />
        </button>
      </CommonTooltip>
      {toggle && (
        <div className={`dropdown-actions-items`} ref={dropdownRef}>
          {items &&
            items.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  item.action();
                  setToggle(false);
                }}
                className={`${item?.className ?? ''}`}
              >
                <span className={`${!item.icon ? 'iconEl' : ''}`}>
                  {item.icon ? (
                    <FontAwesomeIcon
                      color="#878787"
                      icon={item.icon}
                      style={{ fontSize: '18px' }}
                    />
                  ) : (
                    item.iconEl
                  )}
                </span>
                <label>{item.label}</label>
              </div>
            ))}
        </div>
      )}
    </div>
  );
});
