import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import { api } from '../../api';

// ICONS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { async } from 'pdfjs-dist';

export default function ProposalTemplateModal(props) {
  const router = useRouter();
  const { onCloseModal, setLoading } = props;
  const [showModal, setShowModal] = useState(true);
  const [proposals, setProposals] = useState(true);

  const formFieldSelectTemplate = {
    proposal_template_id: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group dropdown-btn`,
      label: 'Select From Existing Proposals',
      options: proposals,
      placeholder: 'Select a proposal',
    },
  };

  const [fieldSelectTemplate, setFieldSelectTemplate] = useState(
    h.form.initFields(formFieldSelectTemplate),
  );

  useEffect(() => {
    (async () => {
      const apiAgentRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiAgentRes.status, 'ok')) {
        const apiRes = await api.proposalTemplate.getTemplates(
          { agency_id: apiAgentRes.data.agencyUser.agency_fk },
          false,
        );

        if (h.cmpStr(apiRes.status, 'ok')) {
          h.form.updateFields(
            'proposal_template_id',
            fieldSelectTemplate,
            setFieldSelectTemplate,
            {
              value: '',
            },
          );

          setProposals(
            apiRes.data.proposalTemplates.map((m) => ({
              value: m,
              text: m.name,
            })),
          );
        }
      }
    })();
  }, []);

  // useEffect(() => {
  //   h.form.updateFields(
  //     'proposal_template_id',
  //     fieldSelectTemplate,
  //     setFieldSelectTemplate,
  //     {
  //       value: fieldSelectTemplate.proposal_template_id,
  //     },
  //   );
  // }, [fieldSelectTemplate]);

  const closeModal = async () => {
    setShowModal(false);
    // await router.push(window.location.pathname);
    onCloseModal();
  };

  return (
    <div
      className="modal-root"
      style={{ display: showModal ? 'flex' : 'none' }}
      onClick={() => closeModal}
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Send Proposal</span>
          <button onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} color="#fff" size="lg" />
          </button>
        </div>
        <div className="modal-body proposal-template-modal-body">
          <h.form.GenericForm
            className="text-left"
            formFields={formFieldSelectTemplate}
            setLoading={setLoading}
            fields={fieldSelectTemplate}
            setFields={setFieldSelectTemplate}
            showCancelButton={false}
            showSubmitButton={false}
            key="proposal-template-form"
          />
          <div className="modal-footer">
            <button
              className="common-icon-button create-button"
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                await router.push(routes.proposal.template.add);
              }}
            >
              Create New Proposal
            </button>
            <button className="common-button" style={{ cursor: 'pointer' }}>
              Select & Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
