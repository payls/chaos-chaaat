import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';

export default function CreateReportModal(props) {
  const router = useRouter();
  const { onCloseModal, setLoading } = props;
  const [projects, setProjects] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    (async () => {
      await getProjects();
    })();
    return () => (document.body.style.overflow = 'unset');
  }, []);

  const getProjects = async () => {
    const apiRes = await api.project.findAll({}, {}, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      setProjects(handleOptionList(apiRes.data.projects));
    }
  };

  const formFields = {
    project: {
      field_type: h.form.FIELD_TYPE.SELECT,
      label: 'Project',
      class_name: `col-12 modal-input-group`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
      options: projects,
    },
    from_date: {
      field_type: h.form.FIELD_TYPE.DATE,
      label: 'From',
      class_name: `col modal-input-group`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    to_date: {
      field_type: h.form.FIELD_TYPE.DATE,
      label: 'To',
      class_name: `col modal-input-group`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  const handleOptionList = (projects) => {
    let options = [{ text: 'Select project', value: '' }];
    projects.forEach((project) => {
      let details = {};
      details.value = project.project_id;
      details.text = project.name;
      options.push(details);
    });
    return options;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    let formData = {};
    formData.project_id = fields.project.value;
    formData.from = fields.from_date.value;
    formData.to = fields.to_date.value;
    formData.timezoneOffsetMinutes = new Date().getTimezoneOffset();

    // TODO: Need to validate that to > from in the form itself
    if (formData.to < formData.from) formData.to = formData.from;

    const apiRes = await api.agencyReport.create(formData);
    if (h.cmpStr(apiRes.status, 'ok')) {
      await closeModal();
    }

    setLoading(false);
  };

  const closeModal = async () => {
    await router.push(window.location.pathname);
    onCloseModal();
  };

  return (
    <div className="modal-root" onClick={() => closeModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Create report</span>
          <button onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} color="#fff" size="2x" />
          </button>
        </div>
        <div className="modal-body contact-modal-body">
          <span>Choose a project and time period to generate report</span>
          <h.form.GenericForm
            className="text-left"
            formFields={formFields}
            setLoading={setLoading}
            fields={fields}
            setFields={setFields}
            showCancelButton={true}
            handleCancel={closeModal}
            cancelButtonClassName="common-button transparent-bg"
            handleSubmit={handleSubmit}
            submitButtonLabel="Create"
            submitButtonClassName="common-button"
            buttonWrapperClassName={'modal-footer mt-3'}
            submitButtonVariant="primary3"
          />
        </div>
      </div>
    </div>
  );
}
