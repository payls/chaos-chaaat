import React from 'react';

export default function IconUtilityArea(props) {
  return (
    <svg
      {...props}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.08002 2.16016H16.92V3.96016H1.08002V2.16016ZM2.16002 4.68016V16.5602H15.84V4.68016H2.16002ZM11.52 7.92016H6.12002V6.84016H11.52V7.92016Z"
        fill={props.fillColor || '#F2C4AB'}
      />
    </svg>
  );
}
