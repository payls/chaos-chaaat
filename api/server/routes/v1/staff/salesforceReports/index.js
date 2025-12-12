const reportList = require('./reportList');
const reportPreview = require('./reportDataPreview');
const reportDataSaveContactList = require('./reportDataSaveContactList');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/salesforce/:agency_id/reports',
    preValidation: reportList.preValidation,
    schema: reportList.schema,
    handler: reportList.handler,
  });

  fastify.route({
    method: 'GET',
    url: '/staff/salesforce/:agency_id/reports/:report_id/preview',
    preValidation: reportList.preValidation,
    schema: reportPreview.schema,
    handler: reportPreview.handler,
  });

  fastify.route({
    method: 'POST',
    url: '/staff/salesforce/:agency_id/reports/:report_id/contact-list',
    preValidation: reportDataSaveContactList.preValidation,
    schema: reportDataSaveContactList.schema,
    handler: reportDataSaveContactList.handler,
  });

  next();
};
