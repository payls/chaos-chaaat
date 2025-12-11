const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const c = require('../../controllers');
const h = require('../../helpers');

function sortContacts(contacts) {
  const updates = contacts.filter(
    (contact) => contact.subscriptionType === 'contact.propertyChange',
  );

  const creates = contacts.filter(
    (contact) => contact.subscriptionType !== 'contact.propertyChange',
  );

  return [...creates, ...updates];
}

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  let { data: contacts } = JSON.parse(data.content.toString());
  const { hsCreateContactQueue, hsUpdateContactQueue } = config.amq.keys;
  const { HS_CREATE_CONTACT, HS_UPDATE_CONTACT } = constant.AMQ.CONSUMER_TYPES;
  if (Array.isArray(contacts)) {
    contacts = sortContacts(contacts);
    for (const contact of contacts) {
      const forUpdate = contact.subscriptionType === 'contact.propertyChange';
      const consumerType = forUpdate ? HS_UPDATE_CONTACT : HS_CREATE_CONTACT;
      const exchangeName = forUpdate
        ? hsUpdateContactQueue
        : hsCreateContactQueue;

      // Prepare Data
      const agencies = await models.agency.findAll({
        where: {
          hubspot_id: contact.portalId,
        },
        include: [
          {
            model: models.agency_oauth,
            where: { status: 'active', source: 'HUBSPOT' },
            required: true,
          },
        ],
      });
      // process hubspot payload data
      try {
        await c.lock.acquireLock(
          'hs-process-contacts',
          contact?.objectId,
          channel,
          data,
          log,
        );
        log.info('starting to go to the process');
        await channel.publish(
          exchangeName,
          'BATCH',
          Buffer.from(
            JSON.stringify({
              consumerType,
              data: {
                agencies,
                contact,
              },
            }),
          ),
        );
        log.info('Successfully publishing contact Event: ', contact.eventId);
      } catch (err) {
        Sentry.captureException(err);
        log.error(err);
        log.error('An error publishing Contact Event: ', contact.eventId);
      }
    }
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  }
};
