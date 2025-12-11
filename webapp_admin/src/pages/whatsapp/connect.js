import React, { useState, useEffect, useRef } from 'react';
import { Body, Header } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes';
// ICON
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import IconWhatsApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp.js';
import CommonTooltip from '../../components/Common/CommonTooltip.js';

export default function Connect() {
  const fileRef = useRef(null);

  const [isLoading, setLoading] = useState(false);

  const [agencyId, setAgencyId] = useState(null);
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    facebook_manager_id: null,
    client_company_name: null,
    display_image: null,
    // whatsapp_status: null,
    address: null,
    email: null,
    website: null,
  });

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const agency = apiRes.data.agencyUser.agency;

        setAgencyId(agency.agency_id);
      }
    })();
  }, []);

  useEffect(() => {
    if (h.notEmpty(files)) {
      (async () => {
        setLoading(true);
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
        setLoading(false);
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
            autoCloseInSecs: 5,
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

  async function handleSubmit() {
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
        message: 'Are you sure you want to submit?',
      },

      async (s) => {
        if (s) {
          const newForm = form;
          newForm.agency_id = agencyId;

          const res = await api.whatsapp.sendOnboardingForm(newForm, false);

          if (h.cmpStr(res.status, 'ok')) {
            window.location.href = h.getRoute(routes.dashboard.index);
          }
        }
      },
    );
  }

  return (
    <>
      <Header showHeaderContent={false} />
      <Body className="h-inherit" isLoading={isLoading}>
        <div className="h100">
          <div className="login-page-wrapper">
            <div className="login-page-wrapper-left">
              <div>
                <img
                  src="https://cdn.yourpave.com/assets/chaaat-logo.png"
                  width={'102px'}
                />
                <h3>
                  Where <br />
                  Conversations <br />
                  Convert.
                </h3>
                <p>
                  Chaaat's chat-based tool empowers your sales & marketing
                  strategy while satisfying platform compliance, engaging at
                  scale, and personalising your communications.
                </p>
              </div>
            </div>
            <div
              className="login-page-wrapper-right waba-submit"
              style={{ padding: '10px 0%' }}
            >
              <div className="" style={{ gap: '3em' }}>
                <h1 className="mb-4 off-black" style={{ textAlign: 'left' }}>
                  <IconWhatsApp width="20" style={{ marginTop: '-5px' }} />{' '}
                  WhatsApp
                  <span className="mt-2">Channel Onboarding</span>
                </h1>

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
                        <div className="center-body">
                          <img src={form.display_image} width={'100px'} />
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
                    <label></label>
                    <a
                      className="common-button-2 mt-4 text-normal c-action-button black"
                      href={h.getRoute(routes.dashboard.messaging)}
                    >
                      Skip
                    </a>
                    <div
                      className="campaign-create-form"
                      style={{
                        textAlign: 'right',
                      }}
                    >
                      <button
                        className="common-button-2 mt-4 text-normal"
                        type="button"
                        onClick={handleSubmit}
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
      </Body>
    </>
  );
}
