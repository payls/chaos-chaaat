import React from 'react';

export default React.memo((props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      {...props}
    >
      <circle
        cx="13"
        cy="13"
        r="12.6"
        fill="white"
        stroke="url(#paint0_linear_964_10647)"
        strokeWidth="0.8"
      />
      <defs>
        <linearGradient
          id="paint0_linear_964_10647"
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
      </defs>
    </svg>
  );
});
