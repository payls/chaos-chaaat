const constant = require('../constants/constant.json');

/**
 * Takes two states and returns whether currentState is the state
 * after the targetState
 * @param currentState
 * @param afterState
 * @returns {Boolean}
 */
export function afterLeadStatus(currentState, targetState) {
  const currentStateOrder = getCurrentStatusOrder(currentState);
  const targetStateOrder = getCurrentStatusOrder(targetState);
  return currentStateOrder > targetStateOrder;
}

/**
 * Takes in lead status and returns the order of the status
 * @param currentState
 * @returns {Int}
 */
export function getCurrentStatusOrder(currentState) {
  switch (currentState) {
    case constant.LEAD_STATUS.NO_PROPOSAL:
      return constant.LEAD_STATUS_ORDER.NO_PROPOSAL;
    case constant.LEAD_STATUS.PROPOSAL_CREATED:
      return constant.LEAD_STATUS_ORDER.PROPOSAL_CREATED;
    case constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED:
      return constant.LEAD_STATUS_ORDER.UPDATED_PROPOSAL_CREATED;
    case constant.LEAD_STATUS.PROPOSAL_SENT:
      return constant.LEAD_STATUS_ORDER.PROPOSAL_SENT;
    case constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT:
      return constant.LEAD_STATUS_ORDER.UPDATED_PROPOSAL_SENT;
    case constant.LEAD_STATUS.PROPOSAL_OPENED:
      return constant.LEAD_STATUS_ORDER.PROPOSAL_OPENED;
    case constant.LEAD_STATUS.UPDATED_PROPOSAL_OPENED:
      return constant.LEAD_STATUS_ORDER.UPDATED_PROPOSAL_OPENED;
  }
}

/**
 * Verify that the lead status state change is allowed
 * @param currentState
 * @param afterState
 * @returns {Promise<void>}
 */
export function validateStateChange(currentState, afterState) {
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
}
