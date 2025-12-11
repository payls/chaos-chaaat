const amqplib = require('amqp-connection-manager');

class RabbitMQ {
  constructor({ log, config }) {
    this.log = log;
    this.config = config;
  }

  async init() {
    const config = this.config;
    const log = this.log;
    try {
      const {
        hsBulkProcessQueue,
        hsCreateContactQueue,
        hsUpdateContactQueue,
        sfCreateContactQueue,
        sfUpdateContactQueue,
        sfAdhocQueue,
      } = config.amq.keys;
      const connection = config.amq.connection;
      const connectionURI =
        connection.uri ||
        `amqp://${connection.username}:${connection.password}@${connection.host}:${connection.port}`;

      log.info('RabbitMQ Connection', { connection: connectionURI });
      this.connection = amqplib.connect(connectionURI);
      this.connection.on('connect', () => {
        log.info(
          {
            conn: connectionURI,
          },
          'RabbitMQ connected',
        );
      });
      this.connection.on('disconnect', (error) => {
        log.error(
          {
            error,
          },
          'RabbitMQ Disconnected',
        );
      });
      this.channel = await this.connection.createChannel();

      this.pubHsContactProcessor = function (content) {
        console.log(hsBulkProcessQueue);
        return this.channel.publish(
          hsBulkProcessQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubHsCreateContact = function (content) {
        return this.channel.publish(
          hsCreateContactQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubHsUpdateContact = function (content) {
        return this.channel.publish(
          hsUpdateContactQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubSfCreateContact = function (content) {
        return this.channel.publish(
          sfCreateContactQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubSfUpdateContact = function (content) {
        return this.channel.publish(
          sfUpdateContactQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubSfAdhoc = function (content) {
        return this.channel.publish(
          sfAdhocQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      return this;
    } catch (err) {
      log.error('RabbitMQ Init Error', {
        err,
      });
    }
  }
}

module.exports = RabbitMQ;
