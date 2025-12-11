import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes';

export default function AddViewModal(props) {
  const router = useRouter();
  const { onCloseModal, setLoading, allQueries } = props;
  const [agencyUser, setAgencyUser] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    (async () => {
      await getAgencyInfo();
    })();
    return () => (document.body.style.overflow = 'unset');
  }, []);

  const getAgencyInfo = async () => {
    const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setAgencyUser(apiRes.data.agencyUser);
    }
  };

  const formFields = {
    contact_view_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Name *',
      class_name: `col-12 modal-input-group`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    contact_view_privacy: {
      field_type: h.form.FIELD_TYPE.SELECT,
      label: 'Shared with *',
      class_name: `col-12 modal-input-group`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
      options: [
        { text: 'Select privacy for view', value: undefined },
        { text: 'Private', value: constant.ACCESS_LEVEL.PRIVATE },
        { text: 'Public', value: constant.ACCESS_LEVEL.PUBLIC },
      ],
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    let formData = {};
    formData.agency_user_fk = agencyUser.agency_user_id;
    formData.contact_view_name = fields.contact_view_name.value;
    formData.access_level = fields.contact_view_privacy.value;
    formData.contact_view_fields = JSON.stringify(allQueries);
    formData.agency_fk = agencyUser.agency_fk;

    const apiRes = await api.contactView.saveContactView(formData, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      closeModal(apiRes.data.contact_view_id);
    } else {
      closeModal();
    }

    setLoading(false);
  };

  const closeModal = (viewId = null) => {
    if (viewId !== null) {
      router.push(routes.dashboard.leads.saved_view + viewId);
    }
    onCloseModal();
  };

  return (
    <div
      className="modal-root"
      onClick={() => {
        closeModal();
      }}
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Add View</span>
          <button
            onClick={() => {
              closeModal();
            }}
          >
            <FontAwesomeIcon icon={faTimes} color="#fff" size="sm" />
          </button>
        </div>
        <div className="modal-body contact-modal-body">
          <h.form.GenericForm
            className="text-left"
            formFields={formFields}
            formMode={h.form.FORM_MODE.ADD}
            setLoading={setLoading}
            fields={fields}
            setFields={setFields}
            showCancelButton={true}
            handleCancel={() => {
              closeModal();
            }}
            cancelButtonClassName="common-button transparent-bg"
            handleSubmit={handleSubmit}
            submitButtonLabel={'Create'}
            submitButtonClassName="common-button"
            buttonWrapperClassName={'modal-footer mt-5'}
            submitButtonVariant="primary3"
          />
        </div>
      </div>
    </div>
  );
}
