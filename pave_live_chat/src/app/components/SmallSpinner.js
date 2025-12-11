'use client';
import React from 'react';

export default function SmallSpinner({ style = {} }) {
  return (
    <div
      style={{
        textAlign: 'center',
        fontFamily: 'PoppinsSemiBold',
        color: '#5A6264',
        display: 'flex',
        ...style,
      }}
    >
      <span className="spinner">&nbsp;</span>
    </div>
  );
}
