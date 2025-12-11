import React from 'react';

export default function IconChevronLeft(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g istroke-width="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        {' '}
        <title></title>{' '}
        <g>
          {' '}
          <g>
            {' '}
            <polyline
              fill="none"
              id="Left"
              points="15.5 5 8.5 12 15.5 19"
              stroke={props?.color || ' #2a5245'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></polyline>{' '}
          </g>{' '}
        </g>{' '}
      </g>
    </svg>
  );
}
