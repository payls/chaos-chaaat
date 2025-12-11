import React from 'react';

export default function IconOrangeConcierge(props) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 4.07937V3.5H9.5C9.77625 3.5 10 3.27625 10 3V2.5C10 2.22375 9.77625 2 9.5 2H6.5C6.22375 2 6 2.22375 6 2.5V3C6 3.27625 6.22375 3.5 6.5 3.5H7V4.07937C3.60906 4.56594 1 7.47438 1 11H15C15 7.47438 12.3909 4.56594 9 4.07937ZM15.5 12H0.5C0.22375 12 0 12.2237 0 12.5V13.5C0 13.7763 0.22375 14 0.5 14H15.5C15.7763 14 16 13.7763 16 13.5V12.5C16 12.2237 15.7763 12 15.5 12Z"
        fill={props?.fillColor || '#F2C4AB'}
      />
    </svg>
  );
}
