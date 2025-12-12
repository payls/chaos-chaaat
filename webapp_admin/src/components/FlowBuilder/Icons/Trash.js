import React from 'react';

export default React.memo((props) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="0.5"
        y="0.5"
        width="27"
        height="27"
        rx="2.5"
        fill="url(#paint0_linear_797_10087)"
        fillOpacity="0.2"
      />
      <rect
        x="0.5"
        y="0.5"
        width="27"
        height="27"
        rx="2.5"
        stroke="url(#paint1_linear_797_10087)"
      />
      <path
        d="M7.33398 8.5835H20.6673"
        stroke="#333333"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 6.0835H16.5"
        stroke="#333333"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11.0835H19V20.6668C19 21.3572 18.4404 21.9168 17.75 21.9168H10.25C9.55962 21.9168 9 21.3572 9 20.6668V11.0835Z"
        stroke="#333333"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_797_10087"
          x1="-28.5635"
          y1="29.1324"
          x2="57.6007"
          y2="3.01293"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#29F2BC" />
          <stop offset="0.5" stopColor="#4877FF" />
          <stop offset="1" stopColor="#F945B3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_797_10087"
          x1="-28.5635"
          y1="29.1324"
          x2="57.6007"
          y2="3.01293"
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
