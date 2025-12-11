import React, { useState } from 'react';
export default function BulkSendProposalBtn({
  showBulkProposalBtn,
  showProposalTemplateModal,
  setShowProposalTemplateModal
}) {
  return (
    <div
      className="d-flex mr-1 justify-content-end"
      style={{ flexGrow: 1 }}
    >
      <div 
        className="button-icon-bordered-container ml-3"
        style={{
          display: showBulkProposalBtn ? 'block' : 'none'
        }}
      >
          <button
            className="just-text-button"
            onClick={() => {
              setShowProposalTemplateModal(!showProposalTemplateModal)
            }}
          >
            Send Proposal
          </button>
        </div>
    </div>
  );
}