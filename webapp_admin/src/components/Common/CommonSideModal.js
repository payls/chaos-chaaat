import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';

export default function CommonSideModal(props) {
  const { showModal = false, width = '400px' } = props;
  const negatedWidth = '-' + width;

  return (
    <div
      className={
        'common-side-modal d-flex flex-column ' +
        (showModal ? 'modal-open' : '')
      }
      style={{
        boxShadow: showModal ? '-3px 0 8px 0 rgba(66,91,118,.21)' : '',
        width: width,
        right: showModal ? '0' : negatedWidth,
      }}
    >
      {props.children}
    </div>
  );
}
