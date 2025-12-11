const Promise = require('bluebird');
const config = require('../config');

function processQnames() {
  const qConfig = config.queues;
  const rawQs = {
    exchanges: [],
    queues: [],
    binds: []
  }

  qConfig.forEach((q) => {
    const {
      exchangeName, queueName, binding, deadLetter
    } = q;

    rawQs.exchanges.push({ name: exchangeName });

    if (deadLetter && typeof deadLetter === 'object') {
      const { exchangeName: dlName, routingKey } = deadLetter;

      rawQs.queues.push({
        name: queueName, routingKey, dlName, deadLetter: true
      });
      rawQs.exchanges.push({ name: dlName });
      rawQs.queues.push({ name: dlName, routingKey });
      rawQs.binds.push({ exchangeName: dlName, queueName: dlName, routingKey });
    } else {
      rawQs.queues.push({ name: queueName });
    }

    if (binding && typeof binding === 'object') {
      rawQs.binds.push({ exchangeName, queueName, routingKey: binding.routingKey })
    }
  });

  return rawQs;
}

function createQs(channel, procNames) {
  const promQs = {
    exchanges: [],
    queues: [],
    binds: []
  };

  promQs.exchanges = procNames.exchanges.map((item) => channel.assertExchange(item.name, 'direct'));

  promQs.queues = procNames.queues.map((item) => {
    if (item.deadLetter) {
      return channel.assertQueue(item.name, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': item.dlName,
          'x-dead-letter-routing-key': item.routingKey,
          'x-queue-mode': 'lazy'
        }
      });
    }

    return channel.assertQueue(item.name, {
      durable: true,
      arguments: {
        'x-queue-mode': 'lazy'
      }
    })
  });

  promQs.binds = procNames.binds.map((item) => channel.bindQueue(item.exchangeName, item.queueName, item.routingKey));

  console.debug('Running create Queues');

  return Promise
    .all(promQs.exchanges)
    .then(() => Promise.all(promQs.queues))
    .then(() => Promise.all(promQs.binds));
}

function purgeQs(channel, procNames) {
  const promQs = {
    exchanges: [],
    queues: [],
    binds: []
  };

  promQs.queues = procNames.exchanges.map((item) => channel.purgeQueue(item.name));

  console.debug('Running purge Queues');

  return Promise.all(promQs.queues);
}

function deleteQs(channel, procNames) {
  const promQs = {
    exchanges: [],
    queues: [],
    binds: []
  };

  promQs.exchanges = procNames.exchanges.map((item) => channel.deleteExchange(item.name));

  promQs.queues = procNames.queues.map((item) => channel.deleteQueue(item.name));

  promQs.binds = procNames.binds.map((item) => channel.unbindQueue(item.exchangeName, item.queueName, item.routingKey));

  console.debug('Running purge Queues');

  return Promise
    .all(promQs.binds)
    .then(() => Promise.all(promQs.exchanges))
    .then(() => Promise.all(promQs.queues));
}

module.exports = {
  processQnames,
  createQs,
  purgeQs,
  deleteQs
};
