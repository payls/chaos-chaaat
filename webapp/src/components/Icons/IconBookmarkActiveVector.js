import React from 'react';

export default function IconOrangeBath(props) {
  return (
    <svg width="18" height="22" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g>
        <title>Layer 1</title>
        <path
          fill={props.stroke ?? '#04221E'}
          id="svg_1"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="1.5"
          stroke={props.stroke ?? '#04221E'}
          d="m16.739,5.15344c0,-2.75088 -1.8807,-3.85364 -4.5884,-3.85364l-6.35893,0c-2.62456,0 -4.59147,1.02757 -4.59147,3.67018l0,14.72382c0,0.7258 0.78095,1.1829 1.41353,0.8281l6.38195,-3.58l6.32682,3.5739c0.6336,0.3569 1.4165,-0.1002 1.4165,-0.827l0,-14.53536z"
          clipRule="evenodd"
          fillRule="evenodd"
        />
        <path
          fill="#fff"
          id="svg_2"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="1.5"
          stroke={props.strokeLine ?? '#fff'}
          d="m5.27148,8.02762l7.31832,0"
        />
      </g>
    </svg>
  );
}
