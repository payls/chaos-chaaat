import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { useRouter } from 'next/router';

export default function CreateContactModal({
  onCloseModal,
  setLoading,
  trackerName,
  formMode,
}) {
  const router = useRouter();

  const [showModal, setShowModal] = useState(
    h.cmpStr(formMode, h.form.FORM_MODE.ADD),
  );
  const formFields = {
    campaign_label_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Campaign Name*',
      class_name: `col-12 modal-input-group`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
      value: trackerName,
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => (document.body.style.overflow = 'unset');
  }, []);

  useEffect(() => {
    if (h.notEmpty(trackerName)) {
      setShowModal(true);
    }
  }, [trackerName]);

  useEffect(() => {
    if (showModal) setLoading(false);
  }, [showModal]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const apiRes = await api.whatsapp.updateById(
      trackerName,
      { campaign_label_name: fields.campaign_label_name.value },
      false,
    );
    if (h.cmpStr(apiRes.status, 'ok')) {
      await closeModal();
    }

    setLoading(false);
  };

  const closeModal = async () => {
    setShowModal(false);
    await router.push(window.location.pathname);
    onCloseModal();
  };

  return (
    <div
      className="modal-root"
      style={{ display: showModal ? 'flex' : 'none' }}
      onClick={() => closeModal}
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Edit Campaign</span>
          <button onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} color="#fff" size="sm" />
          </button>
        </div>
        <div className="modal-body contact-modal-body">
          <h.form.GenericForm
            className="text-left"
            formFields={formFields}
            formMode={h.form.FORM_MODE.edit}
            setLoading={setLoading}
            fields={fields}
            setFields={setFields}
            showCancelButton={true}
            handleCancel={closeModal}
            cancelButtonClassName="common-button transparent-bg"
            handleSubmit={handleSubmit}
            submitButtonLabel={'Update'}
            submitButtonClassName="common-button"
            buttonWrapperClassName={'modal-footer mt-5'}
            submitButtonVariant="primary3"
          />
        </div>
      </div>
    </div>
  );
}
