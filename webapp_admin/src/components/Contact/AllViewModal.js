import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import constant from '../../constants/constant.json';

export default function AllViewModal(props) {
  const router = useRouter();
  const { agencyUser } = props;
  const { onCloseModal, setLoading } = props;
  const [contactViews, setContactViews] = useState([]);

  useEffect(() => {
    const parsedContactViews = handleOptionList(props.viewTabs);
    setContactViews(parsedContactViews);
  }, []);

  const handleOptionList = (apiContactViews) => {
    let options = [{ text: 'Select a previously saved view', value: '' }];
    apiContactViews.forEach((contactView) => {
      // Only parse views that are public or private ones that are owned by the user
      if (
        (contactView.access_level === constant.ACCESS_LEVEL.PUBLIC ||
          (contactView.access_level === constant.ACCESS_LEVEL.PRIVATE &&
            h.cmpStr(agencyUser.agency_user_id, contactView.agency_user_fk))) &&
        h.general.cmpStr(contactView.contact_view_status, 'active')
      ) {
        let details = {};
        details.value = contactView.contact_view_id;
        details.text = contactView.contact_view_name;
        options.push(details);
      }
    });
    return options;
  };

  const formFields = {
    contact_views: {
      field_type: h.form.FIELD_TYPE.SELECT,
      label: 'Previously Saved View *',
      class_name: `col-12 modal-input-group`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
      options: contactViews,
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    closeModal(fields.contact_views.value);
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
          <span>All View</span>
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
            submitButtonLabel={'Load View'}
            submitButtonClassName="common-button"
            buttonWrapperClassName={'modal-footer mt-5'}
            submitButtonVariant="primary3"
          />
        </div>
      </div>
    </div>
  );
}
