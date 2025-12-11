import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { h } from '../../../helpers';
import { api } from '../../../api';
import { routes } from '../../../configs/routes';

import WebBuilder from './WebBuilder';

const formStepDescription = [
  {
    number: 1,
    description: 'Landing Page Information',
  },
  {
    number: 2,
    description: 'Create and Personalise',
  },
];

const CreateLandingPageForm = ({
  isLoading,
  setLoading,
  formMode,
  setFormMode,
  agencyUser,
}) => {
  const router = useRouter();

  const [formStep, setFormStep] = useState(1);
  const [webBuilderData, setWebBuilderData] = useState(null);

  const formFieldsStep1 = {
    name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'Enter page name',
      title: 'Page Information',
      label: null,
      class_name: `col-12 modern-input-modern mb-3`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    meta_title: {
      field_type: h.form.FIELD_TYPE.TEXT,
      placeholder: 'Enter meta title',
      title: 'Sharing Information',
      label: null,

      class_name: `col-12 modern-input-modern`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    meta_description: {
      field_type: h.form.FIELD_TYPE.TEXTAREA,
      placeholder: 'Enter meta description',
      label: null,
      class_name: `col-12 modern-input-modern  mb-0`,
      validation: [h.form.FIELD_VALIDATION.REQUIRED],
    },
    meta_description2: {
      field_type: h.form.FIELD_TYPE.FILE_WITH_CROPPER,
      //   visible: false,
      placeholder: 'Enter meta description',
      label: null,
      class_name: `col-12 modern-input-modern`,
    },
  };

  const [fieldsStep1, setFieldsStep1] = useState(
    h.form.initFields(formFieldsStep1),
  );

  const handleSubmit = async (toStep) => {
    if (toStep === 3) {
      const apiRes = await api.agencyCustomLandingPage.create(
        {
          agency_fk: agencyUser?.agency_fk,
          landing_page_name: fieldsStep1.name?.value,
          meta_title: fieldsStep1.meta_title?.value,
          meta_description: fieldsStep1.meta_description?.value,
          landing_page: `custom-` + fieldsStep1.name?.value.replace(' ', '-'),
          landing_page_slug:
            `custom-` + fieldsStep1.name?.value.replace(' ', '-'),
          landing_page_data: webBuilderData.data,
          landing_page_html: webBuilderData.html,
          landing_page_css: webBuilderData.css,
        },
        false,
      );

      if (h.cmpStr(apiRes.status, 'ok')) {
        h.general.alert('success', {
          message: 'Landing page created successfully!',
          autoCloseInSecs: 1,
        });

        await router.push(h.getRoute(routes.dashboard['products.custom']));
      }
    } else {
      setFormStep(toStep);
    }
  };
  const handleCancel = () => {};

  const isSubmitButtonActive = agencyUser;

  return (
    <div className="p-3 row">
      <div className="form-steps">
        {formStepDescription.map((step, i) => (
          <div
            className={'step  ' + (step.number === formStep ? 'active' : '')}
            key={i}
          >
            <button
              className={step.number === formStep ? 'selected' : ''}
              onClick={
                () => isSubmitButtonActive && handleSubmit(step.number) // either 1 or 2 will be passed on.
              }
            >
              {step.number}
            </button>
            <span>{step.description}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          zIndex: 1,
          textAlign: 'center',
          fontFamily: 'PoppinsRegular',
          fontSize: '18px',
          width: '100%',
          display: 'none',
        }}
        className="step-name"
      >
        {formStep ? formStepDescription[formStep - 1].description : ''}
      </div>
      {formStep === 1 && (
        <div
          className="d-flex"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            flexBasis: 'auto',
          }}
        >
          <div
            className="modal-body animate-fadeIn"
            style={{ overflowY: 'auto' }}
          >
            <div>
              <h3 align="right" className="modal-sub-title">
                Create Customized Landing Page
              </h3>

              <h.form.GenericForm
                className="text-left"
                formFields={formFieldsStep1}
                formMode={h.form.FORM_MODE.ADD}
                setLoading={setLoading}
                fields={fieldsStep1}
                setFields={setFieldsStep1}
                showCancelButton={false}
                showSubmitButton={false}
                key="proposal-link-form"
              />
            </div>
            <div className="modal-footer">
              <button
                className="common-button transparent-bg"
                onClick={handleCancel}
              >
                Go Back
              </button>
              <button
                className="common-button"
                style={{ cursor: isSubmitButtonActive ? 'pointer' : 'default' }}
                onClick={() =>
                  isSubmitButtonActive && handleSubmit(formStep + 1)
                }
              >
                Save & Next Step
              </button>
            </div>
          </div>
        </div>
      )}
      {formStep === 2 && (
        <>
          <div
            className={'modal-body preview-body animate-fadeIn'}
            style={{
              overflowY: 'auto',
              height: '100%',
              width: '100vw',
              marginLeft: '-10vw',
              marginRight: '-10vw',
            }}
          >
            <WebBuilder updateCallback={setWebBuilderData} />

            <div className="modal-footer mt-4 pos-rlt">
              <button
                className="common-button transparent-bg"
                onClick={() => handleSubmit(formStep - 1)}
              >
                Previous
              </button>
              <button
                className="common-button"
                style={{ cursor: isSubmitButtonActive ? 'pointer' : 'default' }}
                onClick={() =>
                  isSubmitButtonActive && handleSubmit(formStep + 1)
                }
              >
                Save & Finish
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateLandingPageForm;
