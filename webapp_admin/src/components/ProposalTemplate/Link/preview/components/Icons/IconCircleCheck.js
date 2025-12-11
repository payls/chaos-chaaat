import React from 'react';

export default function IconCircleCheck(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      {...props}
    >
      <circle
        cx="20.5625"
        cy="20.5625"
        r="20.5625"
        fill="url(#paint0_linear_1856_12435)"
      />
      <path
        d="M29.9857 13.708L17.027 26.5596L11.1367 20.718"
        stroke="white"
        strokeWidth="2.50612"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1856_12435"
          x1="-41.9527"
          y1="42.7883"
          x2="84.6011"
          y2="4.42524"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#29F2BC" />
          <stop offset="0.5" stopColor="#4877FF" />
          <stop offset="1" stopColor="#F945B3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
