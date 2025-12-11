const chalk = require('chalk');
const amqlib = require('amqp-connection-manager');
const config = require('../configs/config')(process.env.NODE_ENV);
const conn = config.amq.connection;
const connectionURI =
  conn.uri ||
  `amqp://${conn.username}:${conn.password}@${conn.host}:${conn.port}`;

console.debug('Connection URI:', connectionURI);
const connection = amqlib.connect(connectionURI);
const channel = connection.createChannel();

connection.on('connect', () => {
  console.debug(chalk.green('Connected to RabbitMQ server'));
});

connection.on('blocked', console.log);

connection.on('connectFailed', (err) => {
  console.debug(chalk.red('Failed'));
  console.debug(chalk.red(err));
  console.error(err);
});

connection.on('unblocked', console.log);

connection.on('*', console.log);

connection.on('disconnect', (err) => {
  if (err.err.code === 404) {
    console.error(
      chalk.red(
        'No Queue or Exchange name found, please make sure Queues or Exchange are already added.',
      ),
    );
  } else {
    console.error(chalk.red('Disconnected to RabbitMQ server'), err);
  }
});

module.exports = channel;
