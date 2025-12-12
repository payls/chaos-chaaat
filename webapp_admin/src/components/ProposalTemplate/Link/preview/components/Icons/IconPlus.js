import React from 'react';

export default function IconPlus(props) {
  return (
    <svg
      {...props}
      fill={props?.color || ' #2a5245'}
      viewBox="0 0 52 52"
      data-name="Layer 1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g>
        <path d="M50,24H28V2a2,2,0,0,0-4,0V24H2a2,2,0,0,0,0,4H24V50a2,2,0,0,0,4,0V28H50a2,2,0,0,0,0-4Z"></path>
      </g>
    </svg>
  );
}
