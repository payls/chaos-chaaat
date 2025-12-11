import React, { useEffect, useState } from 'react';
import { h } from '../../../../../../helpers';

export default React.memo(
  ({
    isLoading = false,
    callback = () => {},
    placeholder = 'Search...',
    className,
    disabled,
  }) => {
    const [searchText, setSearchText] = useState(null);

    const debouncedQuery = h.general.useDebounce(searchText, 700);

    useEffect(() => {
      if (debouncedQuery !== null) {
        callback(debouncedQuery);
      }
    }, [debouncedQuery]);

    return (
      <div className={`input-search ${className}`}>
        <div className="search-message-wrapper">
          <div className="group">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" style={{ zIndex: 3 }}>
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>
            <input
              type="search"
              className="input"
              placeholder={placeholder}
              value={searchText || ''}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '300px', zIndex: 1 }}
              disabled={disabled}
            />
          </div>
          {isLoading && (
            <div
              style={{
                textAlign: 'center',
                fontFamily: 'PoppinsSemiBold',
                color: '#5A6264',
                marginTop: '20px',
                marginBottom: '20px',
                position: 'absolute',
                right: '28px',
                top: '8px',
              }}
            >
              <span className="spinner">&nbsp;</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);
