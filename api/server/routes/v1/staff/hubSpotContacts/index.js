const contactDataList = require('./contactDataList');
const contactDataSave = require('./contactDataListSave');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/hubspot/:agency_id/contacts',
    preValidation: contactDataList.preValidation,
    handler: contactDataList.handler,
    schema: contactDataList.schema,
  });

  fastify.route({
    method: 'POST',
    url: '/staff/hubspot/:agency_id/contacts',
    preValidation: contactDataSave.preValidation,
    handler: contactDataSave.handler,
    schema: contactDataSave.schema,
  });

  next();
};
