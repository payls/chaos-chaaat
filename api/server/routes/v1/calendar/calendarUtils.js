const { DateTime } = require('luxon');
const models = require('../../../models');
const c = require('../../../controllers');

/**
 * getAgencyCalendarDetails
 * @param {{
 *  agency_id: string,
 *  source: string
 * }} 
 * @returns {Promise<{
 *  agency_oauth_id: string,
 *  agency_fk: string,
 *  status: string,
 *  source: string,
 *  access_info: string,
 *  webhook_info: string
 * }>}
 */
async function getAgencyCalendarDetails ({ agency_id, crm_settings_id,  source }) {
  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id,
      status: 'active',
      source,
    },
  });

  agencyOauth =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  const crmSetting = await c.crmSettings.findOne({
    crm_settings_id,
  });

  return { agencyOauth, crmSetting };
}

/**
 * getCrmSettingTimeslotSettings - parse crmSetting to get crmTimeslots
 * @param {object} crmSetting 
 * @returns {object}
 */
function getCrmSettingTimeslotSettings(crmSetting) {
  let crmTimeslotSettings = crmSetting.crm_timeslot_settings;
  try {
    crmTimeslotSettings = JSON.parse(crmTimeslotSettings);
    return crmTimeslotSettings;
  } catch (err) {
    return null;
  }
}

/**
 * getAvailableTimeSlotsPerDay - get the day's available timeslots
 * @param {{
 *  timeSlots: Array<object>,
 *  dayOfWeek: string
 * }} param0 
 * @returns {Array<{start: number, end: number}>}
 */
function getAvailableTimeSlotsPerDay({ timeSlots, dayOfWeek }) {
  if (!timeSlots || !Array.isArray(timeSlots)) {
    return [];
  }

  const timeSlot = timeSlots.find(timeSlot => timeSlot.weekDay === dayOfWeek);
  const availableSlots = timeSlot?.availableSlots || [];
  return availableSlots.filter((slot) => {
    // filtering out {startTime: -1, endTime: -1, errorMessage: ""}
    return slot.startTime > 0;
  });
}

/**
 * getAvailableTimes - calculate the list of available slots using busyTimes from crm calendar 
 * and the list of available time slot in crm settings
 * @param {{ busyTimes: Array<object>, availableSlots: Array<object> }} param0 
 * @returns {Array<object>}
 */
function getAvailableTimes({ busyTimes, availableSlots }) {
  const availableTimeSlots = [];

  availableSlots.forEach(slot => {
    let lastEndTime = slot.startTime;

    busyTimes.forEach(busy => {
      const busyStart = DateTime.fromISO(busy.start);
      const busyEnd = DateTime.fromISO(busy.end);

      // Find available slot before the busy period
      if (busyStart > lastEndTime) {
        availableTimeSlots.push({
          start: lastEndTime.toISO(),
          end: busyStart.toISO(),
        });
      }

      // Update the last end time
      lastEndTime = busyEnd > lastEndTime ? busyEnd : lastEndTime;
    });

    // Check for available slot after the last busy period
    const slotEnd = slot.endTime;
    if (slotEnd > lastEndTime) {
      availableTimeSlots.push({
        start: lastEndTime.toISO(),
        end: slotEnd.toISO(),
      });
    }
  });

  return availableTimeSlots;
}

/**
 * splitTimeSlotsIntoChunks - from the available slots,
 * calculate the timeslot chunks per durationInMinutes
 * and format the timeslots using the timezone
 * @param {*} availableSlots 
 * @param {*} durationInMinutes 
 * @param {*} timeZone 
 * @returns {Array<{start: string, end: string}>}
 */
function splitTimeSlotsIntoChunks(availableSlots, durationInMinutes, timeZone) {
  const chunkedSlots = [];
  availableSlots.forEach(slot => {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    let current = start;
    while (current < end) {
      const next = new Date(current.getTime() + durationInMinutes * 60000);
      if (next <= end) {
        chunkedSlots.push({
          start: DateTime.fromJSDate(current).setZone(timeZone).toFormat('HH:mm'),
          end: DateTime.fromJSDate(next).setZone(timeZone).toFormat('HH:mm')
        });
      }
      current = next;
    }
  });
  return chunkedSlots;
};

class FlowEndpointException extends Error {
  constructor (statusCode, message) {
    super(message)

    this.name = this.constructor.name
    this.statusCode = statusCode;
  }
}

module.exports.getAgencyCalendarDetails = getAgencyCalendarDetails;
module.exports.getCrmSettingTimeslotSettings = getCrmSettingTimeslotSettings;
module.exports.getAvailableTimeSlotsPerDay = getAvailableTimeSlotsPerDay;
module.exports.getAvailableTimes = getAvailableTimes;
module.exports.splitTimeSlotsIntoChunks = splitTimeSlotsIntoChunks;
module.exports.FlowEndpointException = FlowEndpointException;