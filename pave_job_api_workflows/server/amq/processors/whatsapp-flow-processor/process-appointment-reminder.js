const c = require('../../../controllers');
const moment = require('moment-timezone');
const { v4 } = require('uuid');


/**
 * Creates a unique reminder in the database if it doesn't already exist.
 *
 * @param {Object} reminderObject - The reminder details.
 * @param {string} reminderObject.node_id - The ID of the node in the automation rule flow.
 * @param {string} reminderObject.contact_fk - The ID of the contact for whom the reminder is being created.
 * @param {string} [reminderObject.appointment_reminder_id] - The ID of the appointment reminder.
 * @param {string} [reminderObject.automation_rule_template_fk] - The foreign key referencing the automation rule template.
 * @param {string} [reminderObject.reminder_type] - The type of reminder, such as 'before' or 'after'.
 * @param {string} [reminderObject.time_unit] - The unit of time for the reminder (e.g., 'minute', 'hour', 'day').
 * @param {number} [reminderObject.time_unit_number_val] - The numerical value for the time unit.
 * @param {Date} [reminderObject.reminder_time] - The date and time when the reminder should trigger.
 * @param {string} [reminderObject.status] - The status of the reminder (e.g., 'in-progress').
 * @param {string} [reminderObject.agency_user_fk] - The ID of the agency user who created the reminder.
 * @param {string} [reminderObject.whatsapp_flow_fk] - The foreign key referencing the WhatsApp flow.
 * 
 * @returns {Promise<void>} - A promise that resolves when the unique reminder is created or if it already exists.
 */
async function createUniqueReminder (reminderObject) {
  const hasReminder = await c.appointmentReminder.findOne({
    node_id: reminderObject.node_id,
    contact_fk: reminderObject.contact_fk,
  });

  if (!hasReminder) {
    await c.appointmentReminder.create(reminderObject);
  }
}

/**
 * Creates a JavaScript Date object from a SQL timestamp, applying a specific timezone.
 *
 * @param {string} sqlTimestamp - The SQL timestamp string to be converted.
 * @param {string} [timezone='Asia/Hong_Kong'] - The timezone to apply when parsing the SQL timestamp.
 * @returns {Date} - A JavaScript Date object representing the given SQL timestamp in the specified timezone.
 */
function createDateFromSQLTimestamp(sqlTimestamp, timezone = 'Asia/Hong_Kong') {
  // Parse the SQL timestamp and apply the given timezone
  const dateTime = moment.tz(sqlTimestamp, timezone);

  // Convert it to a JavaScript Date object
  const jsDate = dateTime.toDate();

  return jsDate;
}

/**
 * Calculates a reminder datetime by adjusting the given date based on the specified time unit, value, and reminder type.
 *
 * @param {Object} params - The parameters object.
 * @param {string} [params.time_unit='hour'] - The unit of time to adjust by ('minute', 'hour', or 'day').
 * @param {number} params.time_unit_number_val - The number of time units to adjust.
 * @param {string} params.reminder_type - The type of adjustment ('before' or 'after').
 * @param {Date|string} params.date - The date to adjust, as a Date object or a date string.
 * @returns {Date} - The adjusted date, converted to UTC.
 * 
 * @throws {Error} - Throws an error if the time unit or reminder type is invalid.
 */
function calculateReminderDatetime({
  time_unit = 'hour',
  time_unit_number_val,
  reminder_type,
  date,
  timezone
}) {
  // Convert input date to a Date object if it's not already
  let reminderDate = new Date(date);

  // Define the amount of time to add/subtract based on time_unit and time_unit_number_val
  let timeAdjustment;
  if (time_unit.toLowerCase().indexOf('hour') > -1) {
    timeAdjustment = time_unit_number_val * 60 * 60 * 1000; // Convert hours to milliseconds
  } else if (time_unit.toLowerCase().indexOf('day') > -1) {
    timeAdjustment = time_unit_number_val * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  } else if (time_unit.toLowerCase().indexOf('minute') > -1) {
    timeAdjustment = time_unit_number_val * 60 * 1000;
  }
  else {
    throw new Error('Invalid time unit. Use "minute", "hour" or "day".');
  }

  // Adjust the date based on reminder_type
  if (reminder_type === 'before') {
    reminderDate = new Date(reminderDate.getTime() - timeAdjustment);
  } else if (reminder_type === 'after') {
    reminderDate = new Date(reminderDate.getTime() + timeAdjustment);
  } else {
    throw new Error('Invalid reminder type. Use "before" or "after".');
  }

  // Convert to UTC
  const utcDate = new Date(reminderDate.toISOString());

  const formattedDate = moment(utcDate).utc().format('YYYY-MM-DD HH:mm:ss');
  const timezoneTime = moment.tz(formattedDate, timezone);
  const formattedTime = timezoneTime.format('YYYY-MM-DDTHH:mm:ssZ');
  const jsDate = new Date(formattedTime);

  return jsDate.toISOString();
}

/**
 * Saves a reminder for an appointment based on the automation rule flow and booking date.
 *
 * @param {Object} params - The parameters object.
 * @param {Object} params.target - The target node containing information for the reminder.
 * @param {Object} params.automationRuleFlow - The flow of automation rules, including nodes and edges.
 * @param {Object} params.log - Logger object for logging purposes.
 * @param {Object} params.crmSetting - CRM settings related to the automation rule.
 * @param {string} params.appointment_booking_id - The ID of the appointment booking.
 * @param {Date|string} params.bookingDate - The date of the booking.
 * @param {string} params.whatsapp_flow_fk - The foreign key for the WhatsApp flow.
 * @param {string} params.contact_fk - The foreign key for the contact.
 * 
 * @returns {Promise<void>} - A promise that resolves when the reminder is saved.
 */
async function saveReminder({
  target,
  automationRuleFlow,
  log,
  crmSetting,
  appointment_booking_id,
  bookingDate,
  whatsapp_flow_fk,
  contact_fk,
  afterBookingDate,
  timezone,
}) {
  try {
    const isReminderNode = automationRuleFlow.nodes.find((node) => node.id === target.target);
    if (isReminderNode.type === 'reminder') {
      const time_unit = isReminderNode?.data?.flowData?.time_unit?.value;
      const time_unit_number_val = parseInt(isReminderNode?.data?.flowData?.number) || 1
      const reminder_type = isReminderNode?.data?.flowData?.set_reminder?.value || 'after';
      const reminder_time = calculateReminderDatetime({
        time_unit,
        time_unit_number_val,
        reminder_type,
        date: reminder_type === 'before' ? bookingDate : afterBookingDate,
        timezone,
      });
      const reminderObject = {
        appointment_reminder_id: v4(),
        automation_rule_template_fk: crmSetting?.automation_rule_template_fk,
        reminder_type,
        time_unit,
        time_unit_number_val,
        appointment_booking_fk: appointment_booking_id,
        reminder_time,
        node_id: isReminderNode.id,
        whatsapp_flow_fk,
        contact_fk,
        status: 'in-progress',
      };

      if (crmSetting?.created_by) reminderObject.agency_user_fk = crmSetting?.created_by
      await createUniqueReminder(reminderObject);
    }
  } catch (err) {
    log.warn(err);
  }
}

/**
 * Creates reminders for an appointment based on the automation rule flow and CRM settings.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.whatsapp_flow_id - The ID of the WhatsApp flow associated with the booking.
 * @param {string} params.contact_id - The ID of the contact associated with the booking.
 * @param {Object} params.crmSetting - CRM settings related to the automation rule.
 * @param {string} params.appointment_booking_id - The ID of the appointment booking.
 * @param {Object} params.log - Logger object for logging purposes.
 * 
 * @returns {Promise<void>} - A promise that resolves when all reminders have been created.
 */
async function createReminders({
  whatsapp_flow_id,
  contact_id,
  crmSetting,
  appointment_booking_id,
  log,
}) {

  if (!crmSetting?.automation_rule_template_fk) return;
  const automationRuleTemplate = await c.automationRuleTemplate.findOne({
    automation_rule_template_id: crmSetting?.automation_rule_template_fk
  });

  if (!automationRuleTemplate) return;

  const automationRuleFlow = JSON.parse(automationRuleTemplate.message_flow_data || '{}');

  if (!automationRuleFlow || !automationRuleFlow.nodes) return;

  const bookingNode = automationRuleFlow.nodes.find((node) => node?.data?.whatsapp_flow_id === whatsapp_flow_id);

  if (!bookingNode) return;

  const targets = automationRuleFlow.edges.filter(node => node.source === bookingNode.id);
  const appointmentBooking = await c.appointmentBooking.findOne({
    appointment_booking_id,
  });

  if (!appointmentBooking) return;

  const bookingDate = createDateFromSQLTimestamp(appointmentBooking?.start_time, appointmentBooking?.timezone)
  const afterBookingDate = createDateFromSQLTimestamp(appointmentBooking?.end_time, appointmentBooking?.timezone)
  for (const target of targets) {
    // create reminders
    await saveReminder({
      target,
      automationRuleFlow,
      log: log.child({ sub_function: 'saveReminder' }),
      crmSetting,
      appointment_booking_id,
      whatsapp_flow_fk: whatsapp_flow_id,
      contact_fk: contact_id,
      bookingDate,
      afterBookingDate,
      timezone: appointmentBooking?.timezone,
    });
  }
}

async function createReminderFromTrigger ({
  params,
  log,
}) {
  // check if there are reminder
  const automationRuleTemplate = params.automation_template;
  const messageFlowData = JSON.parse(automationRuleTemplate?.message_flow_data || '{}');
  const contact_fk = params.contact_id;
  const agency_user_fk = params.agency_user_id;
  const nodes = messageFlowData.nodes;
  const edges = messageFlowData.edges;
  const targetEdge = edges.find(e => e.source === '1');
  const targetNode = nodes.find(n => n.id === targetEdge.target);

  if (!targetNode || targetNode.type !== 'reminder') {
    log.info({
      message: 'No reminder found',
    });
    return;
  }

  const time_unit = targetNode?.data?.flowData?.time_unit?.value;
  const time_unit_number_val = parseInt(targetNode?.data?.flowData?.number) || 1
  const reminder_type = targetNode?.data?.flowData?.set_reminder?.value || 'after';
  const reminder_time = calculateReminderDatetime({
    time_unit,
    time_unit_number_val,
    reminder_type,
    date: new Date(),
  });

  const reminderObject = {
    node_id: targetNode.id,
    automation_rule_template_fk: automationRuleTemplate.automation_rule_template_id,
    contact_fk,
    time_unit,
    time_unit_number_val,
    reminder_time,
    reminder_type,
    status: 'in-progress',
    agency_user_fk,
  };

  log.info({
    message: 'Creating Reminder',
    reminderObject,
  });

  await createUniqueReminder(reminderObject);
}

/**
 * Creates a reminder from a trigger event based on automation rule flow data.
 *
 * @param {Object} params - The parameters object.
 * @param {Object} params.automation_template - The automation rule template object.
 * @param {string} params.contact_id - The ID of the contact.
 * @param {string} params.agency_user_id - The ID of the agency user.
 * @param {Object} params.log - Logger object for logging purposes.
 * 
 * @returns {Promise<void>} - A promise that resolves when the reminder is created.
 */
async function createReminderFromSucceedingMessage ({
  params,
  node_id,
  log,
}) {
  // check if there are reminder
  const automationRuleTemplate = params.automation_template;
  const messageFlowData = JSON.parse(automationRuleTemplate?.message_flow_data || '{}');
  const contact_fk = params.contact_id;
  const agency_user_fk = params.agency_user_id;
  const nodes = messageFlowData.nodes;

  const targetNode = nodes.find(n => n.id === node_id);

  if (!targetNode || targetNode.type !== 'reminder') {
    log.info({
      message: 'No reminder found',
    });
    return;
  }

  const time_unit = targetNode?.data?.flowData?.time_unit?.value;
  const time_unit_number_val = parseInt(targetNode?.data?.flowData?.number) || 1
  const reminder_type = targetNode?.data?.flowData?.set_reminder?.value || 'after';
  const reminder_time = calculateReminderDatetime({
    time_unit,
    time_unit_number_val,
    reminder_type,
    date: new Date(),
  });

  const reminderObject = {
    node_id: targetNode.id,
    automation_rule_template_fk: automationRuleTemplate.automation_rule_template_id,
    contact_fk,
    time_unit,
    time_unit_number_val,
    reminder_time,
    reminder_type,
    status: 'in-progress',
    agency_user_fk,
  };

  log.info({
    message: 'Creating Reminder',
    reminderObject,
  });

  await createUniqueReminder(reminderObject);
}


module.exports.createReminderFromTrigger = createReminderFromTrigger;
module.exports.createReminderFromSucceedingMessage = createReminderFromSucceedingMessage;
module.exports.createReminders = createReminders;
