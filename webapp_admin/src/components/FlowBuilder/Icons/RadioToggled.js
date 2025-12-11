import React from 'react';

export default React.memo((props) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="9.5" fill="white" stroke="#4877FF" />
      <circle cx="10" cy="10" r="7" fill="url(#paint0_linear_1946_15223)" />
      <defs>
        <linearGradient
          id="paint0_linear_1946_15223"
          x1="-11.2818"
          y1="17.5662"
          x2="31.8004"
          y2="4.50647"
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
