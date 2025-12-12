import React, { useState, useEffect, useMem, useCallback } from 'react';
import { h } from '../preview/helpers';
import Toggle from 'react-toggle';
import constant from '../preview/constants/constant.json';
import WhatsAppMessageImageSelector from '../preview/components/Project/WhatsAppMessageImageSelector';
export default function WhatsAppMessageForm({
  proposalId,
  triggerQuickReply,
  setTriggerQuickReply,
  triggerDisplayImage,
  setTriggerDisplayImage,
  projectImages,
  selectedImages,
  setSelectedImages,
}) {
  // check if quick reply options are enabled
  const handleAddQuickReplyOptions = () => {
    setTriggerQuickReply(!triggerQuickReply);
  };

  // check if adding image to message is enabled
  const handleAddDisplayImage = () => {
    setTriggerDisplayImage(!triggerDisplayImage);
  };

  const listed_projects = [];

  return (
    <>
      <div className="buyers-link-whatsapp-message">
        <label className="whatsapp-toggle d-flex align-items-center"></label>
        <div className="buyers-link-whatsapp-message-body">
          Chaaat Shortlisted Properties for Review
          <br />
          <br />
          <p>
            Hi [BUYER]!
            <br />
            <br />
            You've received a shortlist of properties to review from
            [AGENT_FIRST_NAME] of [AGENCY_NAME]:
            <br />
            <br />
            Please click on the following link to review a wide range of
            information about the properties and also provide us any thoughts or
            comments you may have:
            <br />
            <br />
            [PERMALINK]
            <br />
            <br />
            Best wishes,
            <br />
            The [AGENCY_NAME] Team
          </p>
        </div>
        <label className="whatsapp-toggle d-flex align-items-center">
          <Toggle
            icons={false}
            className="whatsapp-toggle"
            onClick={() => handleAddQuickReplyOptions()}
          />
          <span>Include WhatsApp Quick Reply Options?</span>
        </label>
        {triggerQuickReply && (
          <div className="buyers-link-whatsapp-message-body">
            <h3 className="modal-sub-title-item mb-4">
              The WhatsApp message that will be sent to the buyer
            </h3>
            <p>
              <button
                class="common-button transparent-bg mr-2"
                style={{
                  width: '255px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                }}
              >
                I'm interested
              </button>
              <button
                class="common-button transparent-bg mr-2"
                style={{
                  width: '255px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                }}
              >
                This one not for me
              </button>
              <button
                class="common-button transparent-bg mr-2"
                style={{
                  width: '255px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                }}
              >
                Not looking
              </button>
            </p>
          </div>
        )}
        <label className="whatsapp-toggle d-flex align-items-center">
          <Toggle
            icons={false}
            className="whatsapp-toggle"
            onClick={() => handleAddDisplayImage()}
          />
          <span>
            Include Project Image? Below will show available images per project
            included in the proposal.
          </span>
        </label>
        {projectImages.length > 0 &&
          triggerDisplayImage &&
          projectImages.map((project, i) => {
            if (project.length > 0) {
              if (!listed_projects.includes(project[i].project_fk)) {
                listed_projects.push(project[i].project_fk);
                return (
                  <WhatsAppMessageImageSelector
                    projectName={project[i].project_name}
                    projectImages={project}
                    constant={constant}
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                  />
                );
              }
            }
          })}
      </div>
    </>
  );
}
