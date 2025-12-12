import React, { useEffect, useRef, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';
import constant from '../../constants/constant.json';
import AgencyLogo from './AgencyLogo';

export default function SettingForm(props) {
  const { setLoading, agencyUser, formMode, isHubSpotActive } = props;
  const router = useRouter();

  const [agencyLogoUrl, setAgencyLogoUrl] = useState();
  const [agencyLogoWhiteBgUrl, setAgencyLogoWhiteBgUrl] = useState();
  const agencyLogoInputRef = useRef();

  const formFields = {
    sub_domain: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Sub Domain',
      placeholder: 'Sub Domain Name',
      class_name: `col-12 modal-input-group`,
    },

    agency_campaign_additional_recipient: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'Additional Email Recipient',
      placeholder: 'Additional email to be used in campaign notifications',
      class_name: `col-12 modal-input-group`,
    },

    hubspot_id: {
      field_type: h.form.FIELD_TYPE.TEXT,
      label: 'HubSpot ID',
      placeholder: 'HubSpot ID',
      class_name: `col-12 modal-input-group`,
      visible: isHubSpotActive,
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    if (h.notEmpty(agencyUser)) {
      setAgencyLogoUrl(
        h.url.formatImageCdnUrl(agencyUser?.agency?.agency_logo_url),
      );

      fields.sub_domain.value = agencyUser?.agency?.agency_subdomain;
      fields.agency_campaign_additional_recipient.value =
        agencyUser?.agency?.agency_campaign_additional_recipient;
      fields.hubspot_id.value = agencyUser?.agency?.hubspot_id;
      setFields(fields);
    }
  }, [agencyUser]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    let formData = {};
    formData.agency_id = agencyUser?.agency?.agency_id;
    formData.agency_subdomain = fields.sub_domain.value;
    formData.agency_campaign_additional_recipient =
      fields.agency_campaign_additional_recipient.value;
    formData.hubspot_id = fields.hubspot_id.value;
    formData.agency_logo_whitebg_url =
      h.url.removeDomainUrl(agencyLogoWhiteBgUrl);
    formData.agency_logo_url = h.url.removeDomainUrl(agencyLogoUrl);

    const apiRes = await api.agency.updateAgencyProfile(formData);
    if (h.cmpStr(apiRes.status, 'ok')) {
      // To update latest user profile information in session
      await h.auth.verifySessionTokenValidity(window.location.href);
    }
    setLoading(false);
  };

  const handleAgencyLogoSelection = () => {
    agencyLogoInputRef.current.click();
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
        constant.UPLOAD.TYPE.AGENCY_LOGO_IMAGE,
        false,
      );
      if (h.cmpStr(uploadResponse.status, 'ok')) {
        setAgencyLogoUrl(
          h.url.formatImageCdnUrl(uploadResponse.data.file.full_file_url),
        );
        setAgencyLogoWhiteBgUrl(
          h.url.formatImageCdnUrl(
            uploadResponse.data.file.full_file_white_bg_url,
          ),
        );
      }
    }
    setLoading(false);
  };

  return (
    <div className="d-flex flex-column align-items-left">
      <div className="d-flex align-items-center">
        <AgencyLogo
          src={agencyLogoUrl}
          height={100}
          width={100}
          handleOnClick={handleAgencyLogoSelection}
          name={agencyUser.agency.agency_name}
        />
        <button
          className="common-button ml-4"
          style={{ width: 220 }}
          onClick={handleAgencyLogoSelection}
        >
          Edit Agency Logo
        </button>
      </div>
      <input
        className="d-none"
        ref={agencyLogoInputRef}
        type="file"
        onChange={handleFilePickerChange}
      />
      <h.form.GenericForm
        className="text-left"
        formFields={formFields}
        formMode={formMode}
        setLoading={setLoading}
        fields={fields}
        setFields={setFields}
        showCancelButton
        handleCancel={() => router.back()}
        cancelButtonLabel={'Cancel'}
        cancelButtonClassName="common-button transparent-bg"
        handleSubmit={handleSubmit}
        submitButtonLabel={'Update'}
        submitButtonClassName="common-button"
        buttonWrapperClassName={'modal-footer mt-5'}
        submitButtonVariant="primary3"
      />
    </div>
  );
}
