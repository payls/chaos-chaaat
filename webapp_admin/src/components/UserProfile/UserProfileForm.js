import React, { useEffect, useRef, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';
import constant from '../../constants/constant.json';
import UserProfilePicture from './UserProfilePicture';
import { routes } from '../../configs/routes';

export default function UserProfileForm(props) {
  const { setLoading, agencyUser, formMode } = props;

  const router = useRouter();

  const [userProfilePictureUrl, setUserProfilePictureUrl] = useState();

  const profilePictureInputRef = useRef();

  const formFields = {
    first_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'First name',
      class_name: `uw-input login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    last_name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Last name',
      class_name: `uw-input login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    email: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Email',
      read_only: true,
      class_name: `uw-input login-generic-input`,
    },
    title: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Job Title',
      class_name: `uw-input login-generic-input`,
    },
    description: {
      field_type: h.form.FIELD_TYPE.TEXTAREA,
      label: 'Bio',
      placeholder: 'Short description of yourself...',
      class_name: `uw-input login-generic-input`,
    },
    mobile_number: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Phone number',
      class_name: `uw-input login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    website: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Website',
      placeholder: 'Website URL',
      class_name: `uw-input login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.VALID_URL],
    },
    instagram: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Instagram',
      placeholder: 'Instagram URL',
      class_name: `uw-input login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.VALID_URL],
    },
    linkedin: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'LinkedIn',
      placeholder: 'LinkedIn link',
      class_name: `uw-input login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.VALID_URL],
    },
    facebook: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Facebook',
      placeholder: 'Facebook link',
      class_name: `uw-input login-generic-input`,
      validation: [h.form.FIELD_VALIDATION.VALID_URL],
    },
    hubspot_bcc_id: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'HubSpot ID',
      placeholder: 'HubSpot ID',
      class_name: `uw-input login-generic-input`,
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    if (h.notEmpty(agencyUser)) {
      const user = h.auth.getUserInfo();

      setUserProfilePictureUrl(user.profile_picture_url);
      fields.first_name.value = agencyUser.user.first_name;
      fields.last_name.value = agencyUser.user.last_name;
      fields.mobile_number.value = agencyUser.user.mobile_number;
      fields.email.value = agencyUser.user.email;
      fields.hubspot_bcc_id.value = agencyUser.user.hubspot_bcc_id;
      fields.title.value = agencyUser.title;
      fields.description.value = agencyUser.description;
      fields.instagram.value = agencyUser.instagram;
      fields.linkedin.value = agencyUser.linkedin;
      fields.facebook.value = agencyUser.facebook;
      fields.website.value = agencyUser.website;
      setFields(fields);
    }
  }, [agencyUser]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    let formData = {};
    formData.first_name = fields.first_name.value;
    formData.last_name = fields.last_name.value;
    formData.mobile_number = fields.mobile_number.value;
    formData.hubspot_bcc_id = fields.hubspot_bcc_id.value;
    formData.title = fields.title.value;
    formData.description = fields.description.value;
    formData.instagram = fields.instagram.value;
    formData.linkedin = fields.linkedin.value;
    formData.facebook = fields.facebook.value;
    formData.website = fields.website.value;
    formData.agency_user_id = agencyUser.agency_user_id;
    formData.user_fk = agencyUser.user_fk;
    formData.profile_picture_url = userProfilePictureUrl;

    const apiRes = await api.agencyUser.updateAgencyUserProfile(formData);
    if (h.cmpStr(apiRes.status, 'ok')) {
      window.location = h.getRoute(routes.settings.profile);
    }
    setLoading(false);
  };

  const handleProfilePictureSelection = () => {
    profilePictureInputRef.current.click();
  };

  const handleFilePickerChange = async (e) => {
    setLoading(true);
    let uploadFiles = [...e.target.files];
    if (h.notEmpty(uploadFiles)) {
      const targetFile = uploadFiles[0];
      const formData = new FormData();
      formData.append('file', targetFile);
      const uploadResponse = await api.upload.upload(
        formData,
        constant.UPLOAD.TYPE.USER_PROFILE_IMAGE,
        false,
      );
      if (h.cmpStr(uploadResponse.status, 'ok')) {
        setUserProfilePictureUrl(uploadResponse.data.file.full_file_url);
      }
    }
    setLoading(false);
  };

  return (
    <div className="d-flex flex-column align-items-left p-f">
      <div
        className="d-flex flex-column align-items-center p-4"
        style={{ gap: '1em' }}
      >
        <UserProfilePicture
          src={userProfilePictureUrl}
          width={100}
          handleOnClick={handleProfilePictureSelection}
          firstname={agencyUser.user.first_name}
          lastname={agencyUser.user.last_name}
        />
        <button
          className="common-button-2 "
          style={{ width: '320px !important' }}
          onClick={handleProfilePictureSelection}
        >
          Edit Profile Picture
        </button>
      </div>
      <input
        className="d-none"
        ref={profilePictureInputRef}
        type="file"
        onChange={handleFilePickerChange}
      />
      <h.form.GenericForm
        className="text-left "
        formFields={formFields}
        formMode={formMode}
        setLoading={setLoading}
        fields={fields}
        setFields={setFields}
        showCancelButton={false}
        handleCancel={() => router.back()}
        cancelButtonLabel={'Cancel'}
        cancelButtonClassName="common-button transparent-bg"
        handleSubmit={handleSubmit}
        submitButtonLabel={'Update'}
        submitButtonClassName="common-button"
        buttonWrapperClassName={'modal-footer mt-5'}
        submitButtonVariant="primary3"
        submitButtonStyle={{ width: '150px', maxWidth: '150px' }}
      />
    </div>
  );
}
