import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

import { h } from '../../../helpers';
import { api } from '../../../api';
import { routes } from '../../../configs/routes';

function CreatePageModal({
  showModal,
  closeModal,
  setLoading,
  agencyUser,
  successCallBack,
}) {
  const router = useRouter();

  const [formStep, setFormStep] = useState(1);

  const formFieldsStep1 = {
    name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'Enter name',
      title: 'Landing Page Information',
      label: null,
      class_name: `col-12 modern-input-modern mb-3`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    // meta_title: {
    //   field_type: h.form.FIELD_TYPE.TEXT,
    //   placeholder: 'Enter meta title',
    //   title: 'Sharing Information',
    //   label: null,

    //   class_name: `col-12 modern-input-modern`,
    // },
    // meta_description: {
    //   field_type: h.form.FIELD_TYPE.TEXTAREA,
    //   placeholder: 'Enter meta description',
    //   label: null,
    //   class_name: `col-12 modern-input-modern  mb-0`,
    // },
  };

  const [fieldsStep1, setFieldsStep1] = useState(
    h.form.initFields(formFieldsStep1),
  );

  const handleSubmit = async () => {
    setLoading(true);
    const apiRes = await api.agencyCustomLandingPage.create(
      {
        agency_fk: agencyUser?.agency_fk,
        landing_page_name: fieldsStep1.name?.value,
        meta_title: fieldsStep1.meta_title?.value,
        meta_description: fieldsStep1.meta_description?.value,
        landing_page: `custom-` + fieldsStep1.name?.value.replace(' ', '-'),
        landing_page_slug:
          `custom-` + fieldsStep1.name?.value.replace(' ', '-'),
        // landing_page_data: webBuilderData.data,
        // landing_page_html: webBuilderData.html,
        // landing_page_css: webBuilderData.css,
      },
      false,
    );

    if (h.cmpStr(apiRes.status, 'ok')) {
      h.general.alert('success', {
        message: 'Landing page created successfully!',
        autoCloseInSecs: 1,
      });

      successCallBack();
    }

    setLoading(false);
  };

  return (
    <div
      className="modal-root"
      style={{ display: showModal ? 'flex' : 'none' }}
      onClick={() => closeModal}
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Create New Page</span>
          <button onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} color="#fff" size="sm" />
          </button>
        </div>
        <div className="modal-body contact-modal-body">
          <h.form.GenericForm
            className="text-left"
            formFields={formFieldsStep1}
            formMode={h.form.FORM_MODE.ADD}
            setLoading={setLoading}
            fields={fieldsStep1}
            setFields={setFieldsStep1}
            showCancelButton={true}
            key="proposal-link-form"
            handleCancel={closeModal}
            cancelButtonClassName="common-button transparent-bg"
            handleSubmit={handleSubmit}
            submitButtonLabel={'Create'}
            submitButtonClassName="common-button"
            buttonWrapperClassName={'modal-footer mt-2'}
            submitButtonVariant="primary3"
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(CreatePageModal);
