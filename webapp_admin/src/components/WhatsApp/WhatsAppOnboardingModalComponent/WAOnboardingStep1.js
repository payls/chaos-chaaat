import React from 'react';
import { h } from '../../../helpers/index.js';
import constant from '../../../constants/constant.json';

import {
  faCircle,
  faClock,
  faInfoCircle,
  faTimes,
  faCheckCircle,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../../Common/CommonTooltip.js';
import ImageUploadIcon from './ImageUploadIcon.js';

import WAOnboardingStepIndicator from './WAOnboardingStepIndicator';

/**
 * WAOnboardingStep1 - WA onboarding Step 1 body
 * @param {{
 *  handleSubmit: Function,
 *  onChange: Function,
 *  form: object,
 *  error: string,
 *  handleOnChangeFile: Function,
 *  handleDelete: Function,
 *  fileRef: object,
 *  step: number,
 *  status: string
 * }} props 
 * @returns {JSX}
 */
export default function WAOnboardingStep1({
  handleSubmit,
  onChange,
  form,
  error,
  handleOnChangeFile,
  handleDelete,
  fileRef,
  step,
  status
}) {
  return (
    <div className="" style={{ gap: '3em' }}>
      <div
        style={{
          flexGrow: 1,
        }}
        className="d-flex  flex-column"
      >
        <WAOnboardingStepIndicator step={step} />
        <div
          className="d-flex"
          style={{
            gap: '50px',
          }}
        >
          <div
            style={{
              flexBasis: '50%',
            }}
          >
            <div className="campaign-create-form mt-3">
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

            <div className="campaign-create-form mt-3">
              <label>
                Display Picture<small>*</small>
              </label>
              <div
                className="center-body"
                style={{
                  display: 'block',
                  border: '1px solid gray',
                  borderRadius: '5px',
                  padding: '5px',
                  height: '178px',
                }}
                onDrop={(ev) => {
                  ev.preventDefault();
                  handleOnChangeFile(ev, 'dnd');
                }}
                onDragOver={(ev) => {
                  ev.preventDefault();
                }}
              >
                <input
                  type={'file'}
                  id={'csvFileInput'}
                  accept={'image/png,image/jpeg,image/jpg'}
                  onChange={handleOnChangeFile}
                  ref={fileRef}
                  className={`form-item ${
                    h.isEmpty(form.display_image) && error ? 'field-error' : ''
                  }`}
                  style={{
                    display: 'none',
                  }}
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
                {h.notEmpty(form.display_image) ? (
                  <div className="center-body mt-3">
                    <img
                      src={form.display_image}
                      width={'50px'}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                ) : (
                  <div className="center-body mt-3">
                    <ImageUploadIcon width="50px" />
                  </div>
                )}
                <p className="center-body mt-2">Drop your Image here, or</p>
                <div className="center-body">
                  <button
                    className="common-button-2 text-normal"
                    type="button"
                    disabled={status === constant.API_STATUS.PENDING}
                    onClick={() => {
                      fileRef.current.click();
                    }}
                  >
                    Choose File
                  </button>
                </div>
              </div>
            </div>

            <div className="campaign-create-form mt-3">
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
          </div>
          <div
            style={{
              flexBasis: '50%',
            }}
          >
            <div className="campaign-create-form mt-3">
              <label>
                Company Name<small>*</small>
              </label>
              <div>
                <input
                  placeholder="Enter company name"
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

            <div className="campaign-create-form mt-3">
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

            <div className="campaign-create-form mt-3">
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

            <div className="campaign-create-form mt-3">
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
          </div>
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="common-button transparent-bg mt-4 text-normal"
            type="button"
            disabled={status === constant.API_STATUS.PENDING}
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            className="common-button-2 mt-4 text-normal"
            type="button"
            disabled={status === constant.API_STATUS.PENDING}
            onClick={() => {
              handleSubmit();
            }}
          >
            Submit and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
