const chalk = require('chalk');
const amqlib = require('amqp-connection-manager');
const config = require('../config').connection;

const connectionURI = config.uri || `amqp://${config.username}:${config.password}@${config.host}:${config.port}`;

console.debug('Connection URI:', connectionURI);
const connection = amqlib.connect(connectionURI);
const channel = connection.createChannel({
  json: true
});

connection.on('connect', () => {
  console.debug(chalk.green('Connected to RabbitMQ server'));
});

connection.on('blocked', console.log)

connection.on('connectFailed', console.log)

connection.on('unblocked', console.log)

connection.on('*', console.log)

connection.on('disconnect', (err) => {
  if (err.err.code === 404) {
    console.error(chalk.red('No Queue or Exchange name found, please make sure Queues or Exchange are already added.'));
  } else {
    console.error(chalk.red('Disconnected to RabbitMQ server'), err);
  }
});

module.exports = channel;
