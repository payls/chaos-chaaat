import React from 'react';

export default function CommonButton(props) {
  const { transparentBg, children } = props;

  return (
    <button
      className={
        transparentBg ? 'common-button transparent-bg' : 'common-button'
      }
      {...props}
    >
      {children}
    </button>
  );
}
