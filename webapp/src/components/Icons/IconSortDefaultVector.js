import React from 'react';

export default function IconSortDefaultVector(props) {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="sortingIconTitle"
      stroke="#000000"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill={props.fill || '#fff'}
    >
      <polyline points="8 8.333 12 4.333 16 8.333 16 8.333" />
      <polyline points="16 15.667 12 19.667 8 15.667 8 15.667" />
    </svg>
  );
}
