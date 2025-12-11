import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import UserProfileForm from './UserProfileForm';
import { h } from '../../helpers';

export default function UserProfilePopup({
  setLoading,
  formMode = h.form.FORM_MODE.EDIT,
  handleCloseDialog,
}) {
  const [showDialog, setShowDialog] = useState(true);

  const closeDialog = () => {
    setShowDialog(false);
    handleCloseDialog();
  };

  return (
    <Modal
      show={showDialog}
      onHide={closeDialog}
      backdrop="static"
      keyboard={false}
      centered
      size="md"
    >
      <Modal.Header closeButton>
        <Modal.Title>Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <UserProfileForm
          setLoading={setLoading}
          formMode={formMode}
          handleFormCancelled={closeDialog}
          handleFormSubmitted={closeDialog}
        />
      </Modal.Body>
    </Modal>
  );
}
