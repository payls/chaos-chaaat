import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { h } from '../../helpers';

/**
 *
 * @param {{yesText:string, noText?:string}} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function CommonModal(props) {
  const {
    yesText = 'Yes',
    noText,
    yesButtonVariant = 'primary',
    noButtonVariant = 'secondary',
    modalTitle = 'Are you sure?',
    modalBody,
  } = props;

  return (
    <Modal.Dialog>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>

      {h.notEmpty(modalBody) && (
        <Modal.Body>
          <p>{modalBody}</p>
        </Modal.Body>
      )}

      <Modal.Footer>
        {h.notEmpty(noText) && (
          <h.form.CustomButton variant={noButtonVariant}>
            {noText}
          </h.form.CustomButton>
        )}
        <h.form.CustomButton variant={yesButtonVariant}>
          {yesText}
        </h.form.CustomButton>
      </Modal.Footer>
    </Modal.Dialog>
  );
}
