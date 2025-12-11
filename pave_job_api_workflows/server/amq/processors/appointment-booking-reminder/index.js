const Sentry = require('@sentry/node');

const {
  handleSucceedingAutomationNodeMessage,
  sendAutomatedWorkflowResponse,
  prepareTrackerAutomationData,
} = require('../waba-payload-processor/whatsapp-message-automation');

/**
 * Retrieves the target nodes connected to a specific node in a message flow.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.nodeId - The ID of the node to find targets for.
 * @param {Object} params.messageFlowData - The data representing the message flow.
 * @param {Array<Object>} [params.messageFlowData.edges=[]] - The list of edges in the message flow.
 * @param {Array<Object>} [params.messageFlowData.nodes=[]] - The list of nodes in the message flow.
 * @returns {Array<Object>} An array of target nodes connected to the specified node.
 */
function getReminderTargets({ nodeId, messageFlowData }) {
  const edges = messageFlowData.edges || [];
  const nodes = messageFlowData.nodes || [];

  const reminderEdges = edges.filter((e) => e.source === nodeId);

  const targets = [];

  reminderEdges.forEach((e) => {
    targets.push(nodes.find((n) => n.id === e.target));
  });

  return targets;
}

/**
 * Processes a message by handling the succeeding automation node and sending an automated workflow response.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.nodeId - The ID of the current node.
 * @param {Object} params.target - The target node to process next.
 * @param {Array<Object>} params.allNodes - The array of all nodes in the workflow.
 * @param {Object} params.additionalConfig - Additional configuration options.
 * @param {Object} params.agencyBufferedCredentials - Credentials buffered for the agency.
 * @param {Object} params.latestWorkflowTracker - The latest workflow tracker data.
 * @param {string} params.receiver_number - The receiver's phone number.
 * @param {string} params.sender_number - The sender's phone number.
 * @param {string} params.contactFirstName - The first name of the contact.
 * @param {Object} params.wabaOwner - The owner of the WhatsApp Business Account (WABA).
 * @param {Object} params.agency - The agency related to the workflow.
 * @param {string} params.agency_id - The ID of the agency.
 * @param {string} params.agency_user_id - The ID of the agency user.
 * @param {string} params.contact_id - The ID of the contact.
 * @param {Object} params.contactAgencyUser - The agency user associated with the contact.
 * @param {Object} params.log - Logger object for logging purposes.
 *
 * @returns {Promise<void>} - A promise that resolves when the message processing and response sending are complete.
 */
async function processMessage({
  nodeId,
  target,
  allNodes,
  edgeArr,
  additionalConfig,
  agencyBufferedCredentials,
  latestWorkflowTracker,
  receiver_number,
  sender_number,
  contactFirstName,
  wabaOwner,
  agency,
  agency_id,
  agency_user_id,
  contact_id,
  contactAgencyUser,
  log,
}) {
  const nextNodes = [target];
  const nodeArr = allNodes;

  let node_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let is_end = false;
  let jump_to = null;
  let nodeFound = false;

  const succeedingMessage = await handleSucceedingAutomationNodeMessage({
    contact_id,
    agency_user_id,
    nextNodes,
    nodeArr,
    msg_log: null,
    message: null,
    edgeArr,
    log,
  });

  node_id = succeedingMessage.node_id;
  message_content = succeedingMessage.message_content;
  header_image = succeedingMessage.header_image;
  template_id = succeedingMessage.template_id;
  category = succeedingMessage.category;
  variable_arr = succeedingMessage.variable_arr;
  template = succeedingMessage.template;
  template_name = succeedingMessage.template_name;
  language = succeedingMessage.language;
  is_end = succeedingMessage.is_end;
  jump_to = succeedingMessage.jump_to;
  nodeFound = succeedingMessage.nodeFound;

  await sendAutomatedWorkflowResponse(
    {
      nodeFound,
      node_id,
      template_id,
      category,
      template,
      template_name,
      header_image,
      language,
      variable_arr,
      message_content,
      wabaOwner,
      agency,
      agency_id,
      agency_user_id,
      contact_id,
      contactAgencyUser,
      contactFirstName,
      sender_number,
      receiver_number,
      latestWorkflowTracker,
      agencyBufferedCredentials,
    },
    additionalConfig,
    log,
  );
}

/**
 * Processes a booking by handling the succeeding automation node and sending an automated workflow response.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.nodeId - The ID of the current node.
 * @param {Object} params.target - The target node to process next.
 * @param {Array<Object>} params.allNodes - The array of all nodes in the workflow.
 * @param {Object} params.additionalConfig - Additional configuration options.
 * @param {Object} params.agencyBufferedCredentials - Credentials buffered for the agency.
 * @param {Object} params.latestWorkflowTracker - The latest workflow tracker data.
 * @param {string} params.receiver_number - The receiver's phone number.
 * @param {string} params.sender_number - The sender's phone number.
 * @param {string} params.contactFirstName - The first name of the contact.
 * @param {Object} params.wabaOwner - The owner of the WhatsApp Business Account (WABA).
 * @param {Object} params.agency - The agency related to the workflow.
 * @param {string} params.agency_id - The ID of the agency.
 * @param {string} params.agency_user_id - The ID of the agency user.
 * @param {string} params.contact_id - The ID of the contact.
 * @param {Object} params.contactAgencyUser - The agency user associated with the contact.
 * @param {Object} params.log - Logger object for logging purposes.
 *
 * @returns {Promise<void>} - A promise that resolves when the booking processing and response sending are complete.
 */
async function processBooking({
  nodeId,
  target,
  allNodes,
  edgeArr,
  additionalConfig,
  agencyBufferedCredentials,
  latestWorkflowTracker,
  receiver_number,
  sender_number,
  contactFirstName,
  wabaOwner,
  agency,
  agency_id,
  agency_user_id,
  contact_id,
  contactAgencyUser,
  log,
}) {
  const nextNodes = [target];
  const nodeArr = allNodes;

  let node_id = null;
  let variable_arr = null;
  let template = null;
  let template_name = null;
  let language = null;
  let flow_id = null;
  let flow = null;
  let is_end = false;
  let jump_to = null;
  let nodeFound = false;

  const succeedingFlow = await handleSucceedingAutomationNodeMessage({
    nextNodes,
    nodeArr,
    edgeArr,
    msg_log: null,
    message: null,
    log,
  });

  node_id = succeedingFlow.node_id;
  message_content = succeedingFlow.message_content;
  header_image = succeedingFlow.header_image;
  template_id = succeedingFlow.template_id;
  category = succeedingFlow.category;
  variable_arr = succeedingFlow.variable_arr;
  template = succeedingFlow.template;
  template_name = succeedingFlow.template_name;
  language = succeedingFlow.language;
  is_end = succeedingFlow.is_end;
  jump_to = succeedingFlow.jump_to;
  nodeFound = succeedingFlow.nodeFound;
  flow_id = succeedingFlow.flow_id;
  flow = succeedingFlow.flow;

  await sendAutomatedWorkflowResponse(
    {
      nodeFound,
      node_id,
      flow_id,
      flow,
      template_id,
      jump_to,
      is_end,
      category,
      template,
      template_name,
      header_image,
      language,
      variable_arr,
      message_content,
      wabaOwner,
      agency,
      agency_id,
      agency_user_id,
      contact_id,
      contactAgencyUser,
      contactFirstName,
      sender_number,
      receiver_number,
      latestWorkflowTracker,
      agencyBufferedCredentials,
    },
    additionalConfig,
    log,
  );
}

/**
 * Processes a target based on its type by delegating to the appropriate handler function.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.nodeId - The ID of the current node.
 * @param {Object} params.target - The target node to process next.
 * @param {string} params.target.type - The type of the target, determining the processing function ('booking' or 'message').
 * @param {Array<Object>} params.allNodes - The array of all nodes in the workflow.
 * @param {Object} params.additionalConfig - Additional configuration options.
 * @param {Object} params.agencyBufferedCredentials - Credentials buffered for the agency.
 * @param {Object} params.latestWorkflowTracker - The latest workflow tracker data.
 * @param {string} params.receiver_number - The receiver's phone number.
 * @param {string} params.sender_number - The sender's phone number.
 * @param {string} params.contactFirstName - The first name of the contact.
 * @param {Object} params.wabaOwner - The owner of the WhatsApp Business Account (WABA).
 * @param {Object} params.agency - The agency related to the workflow.
 * @param {string} params.agency_id - The ID of the agency.
 * @param {string} params.agency_user_id - The ID of the agency user.
 * @param {string} params.contact_id - The ID of the contact.
 * @param {Object} params.contactAgencyUser - The agency user associated with the contact.
 * @param {Object} params.log - Logger object for logging purposes.
 *
 * @returns {Promise<void>} - A promise that resolves when the target processing is complete.
 */
async function processTarget({
  nodeId,
  target,
  allNodes,
  edgeArr,
  additionalConfig,
  agencyBufferedCredentials,
  latestWorkflowTracker,
  receiver_number,
  sender_number,
  contactFirstName,
  wabaOwner,
  agency,
  agency_id,
  agency_user_id,
  contact_id,
  contactAgencyUser,
  log,
}) {
  switch (target.type) {
    case 'booking':
      await processBooking({
        nodeId,
        target,
        allNodes,
        edgeArr,
        additionalConfig,
        agencyBufferedCredentials,
        latestWorkflowTracker,
        receiver_number,
        sender_number,
        contactFirstName,
        wabaOwner,
        agency,
        agency_id,
        agency_user_id,
        contact_id,
        contactAgencyUser,
        log,
      });
    case 'message':
    default:
      await processMessage({
        nodeId,
        target,
        allNodes,
        edgeArr,
        additionalConfig,
        agencyBufferedCredentials,
        latestWorkflowTracker,
        receiver_number,
        sender_number,
        contactFirstName,
        wabaOwner,
        agency,
        agency_id,
        agency_user_id,
        contact_id,
        contactAgencyUser,
        log,
      });
  }
}

/**
 * Rabbit MQ processor for whatsapp flow message related to appointments.
 * process all whatsappflow information and send / updates a calendar invite based on the info.
 * @param {{
 *  data: object,
 *  models: object,
 *  channel: RabbitMQChannel,
 *  config: object,
 *  pubChannel: RabbitMQChannel,
 *  log: FastifyLogFn,
 *  additionalConfig: object
 * }} param0
 * @returns {void}
 */
module.exports = async ({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) => {
  const amq_progress_tracker_id = data.fields.consumerTag;
  const payload = JSON.parse(data.content.toString());
  const body = payload.data;
  const encryptionKeys = additionalConfig.ek || {};

  const amqProgressTrackerController =
    require('../../../controllers/amqProgressTracker').makeController(models);

  log.info({ data: 'APPOINTMENT PAYLOAD DATA', payload: body });
  const reminder = body?.reminder;

  if (!reminder) {
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  }

  try {
    const contact = reminder?.contact;

    if (!contact) {
      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }

    const automationRuleTemplate = reminder?.automation_rule_template;
    if (!automationRuleTemplate) {
      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }
    const messageFlowData = JSON.parse(
      automationRuleTemplate?.message_flow_data || '{}',
    );
    //
    const nodeId = reminder.node_id;

    const targets = getReminderTargets({ nodeId, messageFlowData });

    const allNodes = messageFlowData?.nodes || [];
    const edgeArr = messageFlowData?.edges || [];
    const business_account = automationRuleTemplate?.business_account;

    const waba = await models.agency_whatsapp_config.findOne({
      where: {
        agency_whatsapp_config_id: business_account,
      },
    });

    const agency_id = waba?.agency_fk || reminder?.agency_user?.agency_fk;

    const contact_id = contact.contact_id;
    const receiver_number = contact.mobile_number;
    const agency_user_id = reminder?.agency_user?.agency_user_id;
    const rule_id = automationRuleTemplate.automation_rule_fk;
    const sender_number = waba.waba_number;
    const contactFirstName = contact.first_name;

    let latestWorkflowTracker = await models.whatsapp_message_tracker.findOne({
      where: {
        receiver_number,
        sender_number,
        agency_fk: agency_id,
        msg_id: rule_id,
      },
      order: [['created_date', 'DESC']],
    });

    const tracker_name = latestWorkflowTracker?.tracker_ref_name || '';

    const params = {
      agency_id,
      waba: waba.toJSON(),
      agency_user_id,
      tracker_name,
      contact_id,
      is_new_workflow_message: false,
      rule_id,
      receiver_number,
      sender_number,
    };

    const {
      wabaOwner,
      agency,
      tracker_ref_name,
      campaign_name,
      msg_origin,
      msg_info,
      contactAgencyUser,
      agencyBufferedCredentials,
      new_record,
    } = await prepareTrackerAutomationData(params, log);

    if (!latestWorkflowTracker) {
      latestWorkflowTracker = {
        agency_fk: agency_id,
      };
    }

    for (const target of targets) {
      await processTarget({
        nodeId,
        target,
        allNodes,
        edgeArr,
        additionalConfig,
        agencyBufferedCredentials,
        latestWorkflowTracker:
          latestWorkflowTracker && latestWorkflowTracker.toJSON
            ? latestWorkflowTracker.toJSON()
            : latestWorkflowTracker,
        receiver_number,
        sender_number,
        contactFirstName,
        wabaOwner,
        agency: agency && agency.toJSON ? agency.toJSON() : agency,
        agency_id,
        agency_user_id,
        contact_id,
        contactAgencyUser:
          contactAgencyUser && contactAgencyUser.toJSON
            ? contactAgencyUser.toJSON()
            : contactAgencyUser,
        log,
      });
    }

    if (reminder.appointment_reminder_id) {
      await models.appointment_reminder.update(
        {
          status: 'done',
        },
        {
          where: {
            appointment_reminder_id: reminder.appointment_reminder_id,
          },
        },
      );
    }

    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    Sentry.captureException(err);
    if (reminder.appointment_reminder_id) {
      await models.appointment_reminder.update(
        {
          status: 'failed',
        },
        {
          where: {
            appointment_reminder_id: reminder.appointment_reminder_id,
          },
        },
      );
    }
    log.error({
      err: err,
      stringifiedErr: JSON.stringify(err),
      function: 'main',
    });
    await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
    return await channel.nack(data, false, false);
  }
};
