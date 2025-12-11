import React, { useEffect, useState, useRef } from 'react';
import { h } from '../../../helpers/index.js';
import { api } from '../../../api/index.js';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes.js';
import { config } from '../../../configs/config.js';

import {
  faCircle,
  faClock,
  faInfoCircle,
  faTimes,
  faCheckCircle,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import WAOnboardingStep1 from './WAOnboardingStep1.js';
import WAOnboardingStep2 from './WAOnboardingStep2.js';

const initialForm = {
  facebook_manager_id: '',
  client_company_name: '',
  display_image: '',
  // whatsapp_status: '',
  address: '',
  email: '',
  website: '',
};

/**
 * WhatsAppOnboardingMemo - Loads and process whatsapp onboarding Modal
 * @param {{
 *  handleCloseModal: Function,
 *  agencyId: string,
 *  redirectUrl: string?,
 *  whatsappConfig: object
 * }} props 
 * @returns {JSX}
 */
function WhatsAppOnboardingMemo({
  handleCloseModal,
  agencyId,
  redirectUrl = null,
  whatsappConfig,
}) {
  const fileRef = useRef(null);
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);
  const [step, setStep] = useState(1);
  const [uibLoading, setUibLoading] = useState(0);
  const [info, setInfo] = useState(null);
  const [doneEnabled, setDoneEnabled] = useState(false);

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

  useEffect(() => {
    if (whatsappConfig) {
      const filledUpForm = {
        whatsapp_onboarding_id: whatsappConfig.whatsapp_onboarding_id,
        facebook_manager_id: whatsappConfig.facebook_manager_id,
        client_company_name: whatsappConfig.client_company_name,
        display_image: whatsappConfig.display_image,
        // whatsapp_status: '',
        about: whatsappConfig.about,
        address: whatsappConfig.address,
        email: whatsappConfig.email,
        website: whatsappConfig.website,
      };
      setForm(filledUpForm);
    }
  }, [whatsappConfig]);

  function onChange(v, key) {
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  /**
   * handleOnChangeFile - process file uploads and create a file link to be used for WABA configuration
   * @param {object} event
   * @param {string?} type 
   * @returns {Promise<void>}
   */
  async function handleOnChangeFile(e, type) {
    let selectedFile;
    if (type === 'dnd') {
      selectedFile = e.dataTransfer.files[0];
    } else {
      selectedFile = e.target.files[0];
    }

    setFiles([]);

    // Check if file is selected
    if (!selectedFile) return;
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
      }
      if (type !== 'dnd') {
        setFiles(e.target.files);
      } else {
        setFiles([selectedFile]);
      }
    };
    image.src = URL.createObjectURL(selectedFile);
  }

  /**
   * validateObject - validates the input if has a value
   * @param {object} fieldsToValidate
   * @returns {boolean}
   */
  function validateObject(obj) {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      if (!obj[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Handle delete onboarding record
   *
   * @async
   * @function
   * @name handleDelete
   * @kind function
   * @memberof memoFunc
   * @returns {Promise<void>}
   */
  async function handleDelete() {
    h.general.promptWithTextValidation(
      {
        message: 'Are you sure you want to delete?<p>Type delete to confirm</p>',
        deleteMessageValidation: 'delete'
      },

      async (s) => {
        if (!s) return;
        setStatus(constant.API_STATUS.PENDING);

        const newForm = form;
        newForm.agency_id = agencyId;

        const res = await api.whatsapp.deleteOnboardingData(
          newForm.whatsapp_onboarding_id,
          true,
        );
        if (h.cmpStr(res.status, 'ok')) {
          setStatus(constant.API_STATUS.FULLFILLED);
          handleCloseModal();
        }
      },
    );
  }

  /**
   * Handle submission for partial onboarding form
   *
   * @async
   * @function
   * @name handleSubmit
   * @kind function
   * @memberof memoFunc
   * @returns {Promise<void>}
   */
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
        message: `Are you sure you want to submit?`,
      },

      async (s) => {
        if (!s) return;
        setStatus(constant.API_STATUS.PENDING);

        const newForm = form;
        newForm.agency_id = agencyId;

        const res = await api.whatsapp.sendOnboardingForm(newForm, false);

        if (!h.cmpStr(res.status, 'ok')) {
          setStatus(constant.API_STATUS.FULLFILLED);
          return;
        }

        if (!h.isEmpty(redirectUrl)) {
          window.location = redirectUrl;
          return;
        }

        setStatus(constant.API_STATUS.FULLFILLED);
        setInfo({ ...res.data });
        setStep(2);
      },
    );
  }

  /**
   * connectToUIBOnboarding - 
   * Prepare and executes the UIB - Meta integration
   * 1. Cleanup localstorage from the browser
   * 2. Initiates Loading Process
   * 3. Prepare the payload to be sent to UIB
   * 4. Encode the payload as per UIB specs
   * 5. remove any localstorage data with the whatsapp integration tag and
   * initiates new window to go to UIB onboarding page
   * 6. Create an event listener whenever the onboarding is done.
   * @returns {Promise<boolean>}
   */
  async function connectToUIBOnboarding() {
    //step 1 - delete listener trigger
    localStorage.setItem('whatsapp-integration', null);

    //Step 2 - Set UIB Loading to true
    setUibLoading(1);

    const webappAdminBaseUrl =
      config.env === 'development'
        ? config.devWebAppAdminUrl
        : config.webAdminUrl;
    const apiBaseUrl =
      config.env === 'development' ? config.devApiUrl : config.apiUrl;
    const partner_agencies = config.partnerAgencyList.split(',');

    //Step3 - Prepare the onobarding data object
    const onboarding_data = {
      partnerId: 'PID-63294842a3760900125c7e1c',
      channel: 'whatsapp',
      customerId: `${info.agency_fk}|${info.whatsapp_onboarding_id}`,
      mediaUrl: info.display_image,
      about: info.about,
      redirectUrl: `${webappAdminBaseUrl}/settings/uib-onboarding-redirect-page`,
      webhookUrl: `${config.wabaWebhookUrl}`,
      webhookHeaders: {
        Origin: 'https://partner-api.unificationengine.com',
        'x-component-secret': config.componentToken,
      },
      notificationUrl: `${apiBaseUrl}/v1/whatsapp/onboarding/webhook`,
      notificationHeaders: {
        Origin: 'https://partner-api.unificationengine.com',
        'x-component-secret': config.componentToken,
      },
      metaAccountType: partner_agencies.includes(info.agency_fk) ? 'partner':'customer',
    };

    //Step 4 - Encode the onboarding data object
    const onboarding_base64_data = Buffer.from(
      JSON.stringify(onboarding_data),
      'utf8',
    ).toString('base64');

    const uib_onboarding_url = `https://partner.uib.ai/onboarding?token=${onboarding_base64_data}`;

    //Step 5 - Track the popup and close showing needed message accordingly

    localStorage.removeItem(
      constant.DIRECT_INTEGRATION.EVENTS.WHATSAPP_INTEGRATION,
    );
    window.open(uib_onboarding_url, '_blank');

    let notification_fired = false;
    // processor of checking UIB Onboarding result
    const onUIBOnboardingComplete = async (event) => {
      if (
        event.key === constant.DIRECT_INTEGRATION.EVENTS.WHATSAPP_INTEGRATION
      ) {
        const onboarding_response = JSON.parse(event.newValue);
        const success = onboarding_response.success;
        if (h.cmpBool(notification_fired, false)) {
          if (success) {
            //split customer info to get agency_id and onboarding_id
            const customer_info = onboarding_response.customerId.split('|');
            const newForm = {
              waba_id: onboarding_response.wabaId,
              waba_number: onboarding_response.phoneNumber,
              waba_name: onboarding_response.verifiedName,
              agency_id: customer_info[0],
              whatsapp_onboarding_id: customer_info[1],
            };

            // creating partial record for onboarding
            const apiPartialRes = await api.whatsapp.sendPartialWabaForm(
              newForm,
              false,
            );

            if (h.cmpStr(apiPartialRes.status, 'ok')) {
              //setting onboarding status to submitted
              await api.whatsapp.updateOnboardingSubmission(
                info?.whatsapp_onboarding_id,
                { status: 'submitted' },
                false,
              );
              setInfo({ ...info, status: 'submitted' });
              // await getOnboardingList();
              // setPage('info');
              h.general.alert('success', {
                message:
                  'WhatsApp Business Account onboarded successfully. Please wait for the credentials email to proceed.',
              });

              setDoneEnabled(true);
            }
          } else {
            h.general.alert('error', {
              message: onboarding_response.message,
            });
          }
        }
        localStorage.removeItem(
          constant.DIRECT_INTEGRATION.EVENTS.WHATSAPP_INTEGRATION,
        );
        notification_fired = true;
        setUibLoading(0);
      }
    };

    // listens to onboarding response
    window.addEventListener('storage', onUIBOnboardingComplete);
    return true;
  }

  return (
    <div className="modern-modal-wrapper">
      <div
        className="modern-modal-body lg"
        style={{
          width: 'calc(100% - 100px)',
          maxWidth: '1590px',
        }}
      >
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
          {step === 1 && (
            <WAOnboardingStep1
              handleSubmit={handleSubmit}
              handleDelete={handleDelete}
              onChange={onChange}
              form={form}
              status={status}
              error={error}
              handleOnChangeFile={handleOnChangeFile}
              fileRef={fileRef}
              step={step}
            />
          )}
          {step == 2 && (
            <WAOnboardingStep2
              onHandleClick={connectToUIBOnboarding}
              uibLoading={uibLoading}
              handleCloseModal={handleCloseModal}
              doneEnabled={doneEnabled}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(WhatsAppOnboardingMemo);
