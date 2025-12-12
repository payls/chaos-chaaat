import React, {useState, useEffect} from 'react';

export default function CommonModalFullScreen(props) {
  const {showModal = false} = props;

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    }
  }, [showModal]);

  return (
    <div
      className="common-modal-full-screen"
      style={{
        display: showModal ? 'block' : 'none',
      }}
    >
      <div className="common-modal-full-screen-container d-flex flex-column">
        {props.children}
      </div>
    </div>
  );
}
