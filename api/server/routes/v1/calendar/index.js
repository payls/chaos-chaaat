const googleCalendarHandler = require('./googleCalendarHandler');
const outlookCalendarHandler = require('./outlookCalendarHandler');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/calendar/googlecalendar/:agency_id/:crm_settings_id/available-timeslot',
    handler: googleCalendarHandler.handler,
    schema: googleCalendarHandler.schema,
  });

  fastify.route({
    method: 'POST',
    url: '/calendar/googlecalendar/:agency_id/:crm_settings_id/available-timeslot',
    handler: googleCalendarHandler.handler,
    schema: googleCalendarHandler.schema,
  });

  fastify.route({
    method: 'GET',
    url: '/calendar/outlookcalendar/:agency_id/:crm_settings_id/available-timeslot',
    handler: outlookCalendarHandler.handler,
    schema: outlookCalendarHandler.schema,
  });

  fastify.route({
    method: 'POST',
    url: '/calendar/outlookcalendar/:agency_id/:crm_settings_id/available-timeslot',
    handler: outlookCalendarHandler.handler,
    schema: outlookCalendarHandler.schema,
  });

  next();
};
