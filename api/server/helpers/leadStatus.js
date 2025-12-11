const leadStatusHelper = module.exports;
const constant = require('../constants/constant.json');

/**
 * Verify that the lead status state change is allowed
 * @param currentState
 * @param afterState
 * @returns {Promise<void>}
 */
leadStatusHelper.validateStateChange = (currentState, afterState) => {
  const throwError = () => {
    throw new Error(
      `proposal state change from ${currentState} to ${afterState} not allowed`,
    );
  };
  const constantLeadStatus = constant.LEAD_STATUS;
  if (currentState !== afterState)
    switch (afterState) {
      case constantLeadStatus.PROPOSAL_CREATED: {
        if (currentState !== constantLeadStatus.NO_PROPOSAL) throwError();
        break;
      }
      case constantLeadStatus.PROPOSAL_SENT: {
        if (currentState !== constantLeadStatus.PROPOSAL_CREATED) throwError();
        break;
      }
      case constantLeadStatus.PROPOSAL_OPENED: {
        if (
          currentState !== constantLeadStatus.PROPOSAL_CREATED &&
          currentState !== constantLeadStatus.PROPOSAL_SENT
        )
          throwError();
        break;
      }
      case constantLeadStatus.UPDATED_PROPOSAL_CREATED: {
        if (
          currentState !== constantLeadStatus.PROPOSAL_CREATED &&
          currentState !== constantLeadStatus.PROPOSAL_SENT
        )
          throwError();
        break;
      }
      case constantLeadStatus.UPDATED_PROPOSAL_SENT: {
        if (currentState !== constantLeadStatus.UPDATED_PROPOSAL_CREATED)
          throwError();
        break;
      }
      case constantLeadStatus.UPDATED_PROPOSAL_OPENED: {
        if (
          currentState !== constantLeadStatus.UPDATED_PROPOSAL_CREATED &&
          currentState !== constantLeadStatus.UPDATED_PROPOSAL_SENT
        )
          throwError();
        break;
      }
      default:
    }
};
