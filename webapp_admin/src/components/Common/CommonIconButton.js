import React from 'react';

export default function CommonIconButton(props) {
  const { children } = props;

  return (
    <button className="common-icon-button" {...props}>
      {children}
    </button>
  );
}
