import React, { useEffect, useState, useRef } from 'react';
import { h } from '../../helpers/index.js';
import { api } from '../../api/index.js';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes.js';

import {
  faCircle,
  faClock,
  faInfoCircle,
  faTimes,
  faCheckCircle,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip.js';
import IconWhatsApp from '../ProposalTemplate/Link/preview/components/Icons/IconWhatsApp.js';

const initialForm = {
  facebook_manager_id: '',
  client_company_name: '',
  display_image: '',
  // whatsapp_status: '',
  address: '',
  email: '',
  website: '',
};

export default React.memo(
  ({ handleCloseModal, agencyId, redirectUrl = null }) => {
    const fileRef = useRef(null);

    const [error, setError] = useState(false);
    const [files, setFiles] = useState([]);

    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState(constant.API_STATUS.IDLE);

    useEffect(() => {
      if (h.notEmpty(files)) {
        (async () => {
          setStatus(constant.API_STATUS.PENDING);

          let uploadFiles = [...files];
          let newlyUploadFiles = [];
          if (h.notEmpty(uploadFiles)) {
            for (let i = 0; i < uploadFiles.length; i++) {
              const targetFile = uploadFiles[i];
              const formData = new FormData();
              formData.append('file', targetFile);
              const uploadResponse = await api.upload.upload(
                formData,
                constant.UPLOAD.TYPE.MESSAGE_MEDIA,
                false,
              );
              if (h.cmpStr(uploadResponse.status, 'ok')) {
                newlyUploadFiles.push({
                  full_file_url: uploadResponse.data.file.full_file_url,
                  file_url: uploadResponse.data.file.file_url,
                  file_name: uploadResponse.data.file.file_name,
                });
              }
            }
          }
          if (!h.isEmpty(newlyUploadFiles)) {
            onChange(newlyUploadFiles[0].full_file_url, 'display_image');
          } else {
            onChange(null, 'display_image');
          }
          setStatus(constant.API_STATUS.FULLFILLED);
        })();
      }
    }, [files]);

    function onChange(v, key) {
      setForm((prev) => ({ ...prev, [key]: v }));
    }

    async function handleOnChangeFile(e) {
      const selectedFile = e.target.files[0];
      setFiles([]);

      // Check if file is selected
      if (selectedFile) {
        // Check file size (in bytes)
        const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB in bytes
        if (selectedFile.size > maxSizeInBytes) {
          h.general.alert('error', {
            message: 'File size limit exceeds to 5MB',
            autoCloseInSecs: 2,
          });
          return;
        }

        // Validate image dimensions
        const image = new Image();
        image.onload = () => {
          if (image.width > 640 || image.height > 640) {
            h.general.alert('error', {
              message:
                'The image you uploaded exceeds the maximum size allowed. Please ensure that the image dimensions are no larger than 640 pixels in width or height.',
              autoCloseInSecs: 2,
            });
            return;
          } else {
            setFiles(e.target.files);
          }
        };
        image.src = URL.createObjectURL(selectedFile);
      }
    }

    function validateObject(obj) {
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        if (!obj[key]) {
          return false;
        }
      }
      return true;
    }

    async function handleSubmit(createAgain = false) {
      setError(false);
      if (!validateObject(form)) {
        setError(true);
        h.general.alert('error', { message: 'Fill all required fields.' });
        return;
      }

      if (!h.general.validateEmail(form.email)) {
        setError(true);
        h.general.alert('error', { message: 'Incorrect email format' });
        return;
      }

      if (!h.general.validateURL(form.website)) {
        setError(true);
        h.general.alert('error', { message: 'Incorrect website format' });
        return;
      }

      h.general.prompt(
        {
          message: `Are you sure you want to submit${
            createAgain ? ' and create another' : ''
          }?`,
        },

        async (s) => {
          if (s) {
            setStatus(constant.API_STATUS.PENDING);

            const newForm = form;
            newForm.agency_id = agencyId;

            const res = await api.whatsapp.sendOnboardingForm(newForm, true);

            if (h.cmpStr(res.status, 'ok')) {
              if (createAgain) {
                setForm(initialForm);
              } else {
                if (h.isEmpty(redirectUrl)) {
                  handleCloseModal();
                } else {
                  window.location = redirectUrl;
                }
              }
            }
            setStatus(constant.API_STATUS.FULLFILLED);
          }
        },
      );
    }

    return (
      <div className="modern-modal-wrapper">
        <div className="modern-modal-body">
          <div className=" d-flex justify-content-between">
            <h1>
              WhatsApp Channel Onboarding
              <span>
                Fill in the form to get started with WhatsApp Integration
              </span>
            </h1>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                onClick={() =>
                  constant.API_STATUS.PENDING !== status
                    ? handleCloseModal()
                    : null
                }
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
          </div>
          <div
            className="login-page-wrapper-right waba-submit"
            style={{ padding: '10px 0%' }}
          >
            <div className="" style={{ gap: '3em' }}>
              <div
                style={{
                  flexGrow: 1,
                }}
                className="d-flex  flex-column"
              >
                <div className="d-flex campaign-create-form mt-3">
                  <label>
                    Facebook Business Manager ID<small>*</small>
                  </label>
                  <div>
                    <input
                      placeholder="Enter facebook business manager ID"
                      type="text"
                      value={form.facebook_manager_id}
                      className={`form-item ${
                        h.isEmpty(form.facebook_manager_id) && error
                          ? 'field-error'
                          : ''
                      }`}
                      onChange={(e) =>
                        onChange(e.target.value, 'facebook_manager_id')
                      }
                      disabled={status === constant.API_STATUS.PENDING}
                    />
                    <span className="info">
                      <CommonTooltip tooltipText="If you don't have one, create it at https://business.facebook.com">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                      </CommonTooltip>
                    </span>
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <label>
                    Client Company Name<small>*</small>
                  </label>
                  <div>
                    <input
                      placeholder="Enter client company name"
                      type="text"
                      value={form.client_company_name}
                      className={`form-item ${
                        h.isEmpty(form.client_company_name) && error
                          ? 'field-error'
                          : ''
                      }`}
                      onChange={(e) =>
                        onChange(e.target.value, 'client_company_name')
                      }
                      disabled={status === constant.API_STATUS.PENDING}
                    />
                    <span className="info">
                      <CommonTooltip tooltipText="Full legal company name">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                      </CommonTooltip>
                    </span>
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <label>
                    Display Picture<small>*</small>
                  </label>
                  <div
                    style={{
                      display: 'block',
                    }}
                  >
                    <input
                      type={'file'}
                      id={'csvFileInput'}
                      accept={'image/png,image/jpeg,image/jpg'}
                      onChange={handleOnChangeFile}
                      ref={fileRef}
                      className={`form-item ${
                        h.isEmpty(form.display_image) && error
                          ? 'field-error'
                          : ''
                      }`}
                      disabled={status === constant.API_STATUS.PENDING}
                    />
                    <span className="info">
                      <CommonTooltip tooltipText="640px x 640px (max 5MB)">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                      </CommonTooltip>
                    </span>
                    {h.notEmpty(form.display_image) && (
                      <div className="center-body mt-2">
                        <img
                          src={form.display_image}
                          width={'100px'}
                          style={{ borderRadius: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <label>
                    Address<small>*</small>
                  </label>
                  <div>
                    <textarea
                      placeholder="Enter addres"
                      className={`form-item ${
                        h.isEmpty(form.address) && error ? 'field-error' : ''
                      }`}
                      style={{
                        height: '75px !important',
                        maxHeight: '75px',
                        overflowY: 'scroll',
                        scrollbarWidth: 'thin',
                        scrollBehavior: 'smooth',
                      }}
                      maxLength={256}
                      value={form.address}
                      onChange={(e) => onChange(e.target.value, 'address')}
                      disabled={status === constant.API_STATUS.PENDING}
                    />
                    <span className="info">
                      <CommonTooltip tooltipText="Maximum of 256 characters">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                      </CommonTooltip>
                    </span>
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <label>
                    About Message<small>*</small>
                  </label>
                  <div>
                    <textarea
                      style={{
                        height: '75px !important',
                        maxHeight: '75px',
                        overflowY: 'scroll',
                        scrollbarWidth: 'thin',
                        scrollBehavior: 'smooth',
                      }}
                      value={form.about}
                      placeholder="Enter about message"
                      className={`form-item ${
                        h.isEmpty(form.client_company_name) && error
                          ? 'field-error'
                          : ''
                      }`}
                      disabled={status === constant.API_STATUS.PENDING}
                      onChange={(e) => onChange(e.target.value, 'about')}
                    />
                    <span className="info">
                      <CommonTooltip tooltipText="The 'about' message to bet set for the WhatsApp Business Account.">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                      </CommonTooltip>
                    </span>
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <label>
                    Email<small>*</small>
                  </label>
                  <div>
                    <input
                      placeholder="Enter email"
                      type="text"
                      value={form.email}
                      className={`form-item ${
                        (h.isEmpty(form.email) ||
                          !h.general.validateEmail(form.email)) &&
                        error
                          ? 'field-error'
                          : ''
                      }`}
                      onChange={(e) => onChange(e.target.value, 'email')}
                      maxLength={128}
                      disabled={status === constant.API_STATUS.PENDING}
                    />
                    <span className="info">
                      <CommonTooltip tooltipText="Maximum of 128 characters">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                      </CommonTooltip>
                    </span>
                  </div>
                </div>

                <div className="d-flex campaign-create-form mt-3">
                  <label>
                    Website URL<small>*</small>
                  </label>
                  <div>
                    <input
                      placeholder="Enter website URL"
                      type="text"
                      value={form.website}
                      className={`form-item ${
                        (h.isEmpty(form.website) ||
                          !h.general.validateURL(form.website)) &&
                        error
                          ? 'field-error'
                          : ''
                      }`}
                      maxLength={256}
                      onChange={(e) => onChange(e.target.value, 'website')}
                      disabled={status === constant.API_STATUS.PENDING}
                    />
                    <span className="info">
                      <CommonTooltip tooltipText="Maximum of 256 characters">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          color="#182327"
                          style={{ fontSize: '15px' }}
                        />
                      </CommonTooltip>
                    </span>
                  </div>
                </div>
                <div className="d-flex campaign-create-form mt-3">
                  <div>
                    We recommend you use a new number to avoid registration
                    issues with Meta. These issues typically happen with
                    existing numbers due to past events/ blockages with the
                    accounts. The new number will only be required during the
                    set up process and does not need to be an expensive plan.
                    Simply enough to receive one SMS to register and retain the
                    number
                  </div>
                </div>
                <div className="d-flex campaign-create-form mt-3">
                  <label></label>
                  <button
                    className="common-button-2 mt-4 text-normal c-action-button black"
                    type="button"
                    disabled={status === constant.API_STATUS.PENDING}
                    onClick={() => {
                      handleSubmit(true);
                    }}
                  >
                    Submit and add another
                  </button>
                  <div
                    className="campaign-create-form"
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    <button
                      className="common-button-2 mt-4 text-normal"
                      type="button"
                      disabled={status === constant.API_STATUS.PENDING}
                      onClick={() => {
                        handleSubmit();
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
