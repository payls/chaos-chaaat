import React, { useRef, useState, useEffect } from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';

import { faEllipsisV, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default React.memo(
  ({ className = '', items = [], icon = true, html }) => {
    const router = useRouter();
    const dropdownRef = useRef(null);
    const [toggle, setToggle] = useState(false);

    function trigger() {
      if (!icon) {
        return <span onClick={() => setToggle(true)}>{html}</span>;
      }

      return (
        <button type="button" onClick={() => setToggle(true)}>
          <FontAwesomeIcon color="#055349" icon={faEllipsisV} />
        </button>
      );
    }

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setToggle(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownRef]);

    return (
      <div className={`${className} dropdown-actions-wrapper`}>
        {trigger()}
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
                  {item.icon &&
                    <span>
                      <FontAwesomeIcon
                        color="#878787"
                        icon={item.icon}
                        style={{ fontSize: '18px' }}
                      />
                    </span>
                  }
                  <label>{item.label}</label>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  },
);
