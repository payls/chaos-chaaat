import React from 'react';

export default React.memo((props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="12" fill="white" />
      <circle cx="12" cy="12" r="12" fill="white" />
      <circle cx="12" cy="12" r="6" fill="url(#paint0_linear_552_6248)" />
      <defs>
        <linearGradient
          id="paint0_linear_552_6248"
          x1="-6.2415"
          y1="18.4853"
          x2="30.686"
          y2="7.29126"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#29F2BC" />
          <stop offset="0.5" stopColor="#4877FF" />
          <stop offset="1" stopColor="#F945B3" />
        </linearGradient>
      </defs>
    </svg>
  );
});
