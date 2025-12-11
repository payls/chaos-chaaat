import React from 'react';

export default React.memo((props) => {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="13"
        cy="13"
        r="12.6"
        fill="white"
        stroke="url(#paint0_linear_1010_5094)"
        strokeWidth="0.8"
      />
      <circle
        cx="13"
        cy="13"
        r="6.6"
        fill="url(#paint1_linear_1010_5094)"
        stroke="url(#paint2_linear_1010_5094)"
        strokeWidth="0.8"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1010_5094"
          x1="-26.5233"
          y1="27.0515"
          x2="53.4864"
          y2="2.79772"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#29F2BC" />
          <stop offset="0.5" stopColor="#4877FF" />
          <stop offset="1" stopColor="#F945B3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1010_5094"
          x1="-8.28175"
          y1="20.5662"
          x2="34.8004"
          y2="7.50647"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#29F2BC" />
          <stop offset="0.5" stopColor="#4877FF" />
          <stop offset="1" stopColor="#F945B3" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1010_5094"
          x1="-8.28175"
          y1="20.5662"
          x2="34.8004"
          y2="7.50647"
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
