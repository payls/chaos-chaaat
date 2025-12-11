import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
const constant = require('../../constants/constant.json');

export default function CreateInviteUserModal(props) {
  const router = useRouter();
  const { onCloseModal, setLoading } = props;
  const [userTypes, setUserTypes] = useState([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const superAdminRole = props.isSuperAdmin
      ? [constant.USER.ROLE.SUPER_ADMIN]
      : [];

    const acceptedUserTypes = [
      ...superAdminRole,
      constant.USER.ROLE.AGENCY_ADMIN,
      constant.USER.ROLE.AGENCY_SALES,
      constant.USER.ROLE.AGENCY_MARKETING,
    ];
    let userTypes = handleOptionList(acceptedUserTypes);
    setUserTypes(userTypes);
    return () => (document.body.style.overflow = 'unset');
  }, []);

  const handleOptionList = (acceptedUserTypes) => {
    let options = [{ text: 'Select user type', value: '' }];
    acceptedUserTypes.forEach((acceptedUserType) => {
      let details = {};
      details.value = acceptedUserType;
      details.text =
        acceptedUserType.split('_')[0] === 'super'
          ? 'Super Admin'
          : h.general.prettifyConstant(acceptedUserType.split('_')[1]);
      options.push(details);
    });
    return options;
  };

  const formFields = {
    first_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'First Name*',
      class_name: `col-12 login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Last Name',
      class_name: `col-12 login-generic-input`,
    },
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Email address*',
      class_name: `col-12 login-generic-input`,
      validation: [
        h.form.FIELD_VALIDATION.REQUIRED,
        h.form.FIELD_VALIDATION.VALID_EMAIL,
      ],
    },
    user_type: {
      field_type: h.form.FIELD_TYPE.SELECT,
      label: 'User Type',
      class_name: 'col-12 login-generic-input ajd-error-icon',
      options: userTypes,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    let formData = {};
    formData.first_name = fields.first_name.value;
    formData.last_name = fields.last_name.value;
    formData.email = fields.email.value;
    formData.user_type = fields.user_type.value;

    const apiRes = await api.userManagement.inviteUser(formData);
    if (h.cmpStr(apiRes.status, 'ok')) {
      await closeModal();
    }
    setLoading(false);
  };

  const closeModal = async () => {
    await router.push(h.getRoute(routes.settings.user_management), undefined, {
      shallow: true,
    });
    onCloseModal();
  };
  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body sm">
        <div className=" d-flex justify-content-between">
          <h1>Add new user</h1>

          <span
            onClick={closeModal}
            style={{
              cursor: 'pointer',
              fontSize: '1em',
              marginLeft: '3em',
            }}
          >
            <FontAwesomeIcon
              icon={faTimes}
              color="#182327"
              style={{ fontSize: '15px' }}
            />
          </span>
        </div>
        <div className=" modern-style mt-4 mdrn-input-form">
          <span>Add a colleague to the Chaaat platform in one simple step</span>
          <h.form.GenericForm
            className="text-left login-form"
            formFields={formFields}
            formMode={h.form.FORM_MODE.ADD}
            setLoading={setLoading}
            fields={fields}
            setFields={setFields}
            showCancelButton={true}
            handleCancel={closeModal}
            cancelButtonType="button"
            cancelButtonClassName="common-button transparent-bg"
            handleSubmit={handleSubmit}
            submitButtonLabel="Invite"
            submitButtonClassName="common-button"
            buttonWrapperClassName={'modal-footer mt-5'}
            submitButtonVariant="primary3"
          />
        </div>
      </div>
    </div>
  );
}
