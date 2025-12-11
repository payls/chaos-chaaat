const amqplib = require('amqp-connection-manager');
const models = require('../models');
const Sentry = require('@sentry/node');
const Consumer = require('./consumer');

class Initialize {
  constructor({ log, config, additionalConfig }) {
    this.config = config;
    this.log = log;
    this.additionalConfig = additionalConfig;
    this.models = models;

    this.rmq = {};
    const connection = config.amq.connection;
    const connectionURI =
      connection.uri ||
      `amqp://${connection.username}:${connection.password}@${connection.host}:${connection.port}`;

    this.rmq.connection = amqplib.connect(connectionURI);

    this.rmq.connection.on('connect', () => {
      log.info(
        {
          conn: connectionURI,
        },
        'RabbitMQ connected',
      );
    });

    this.rmq.connection.on('disconnect', (error) => {
      log.error(
        {
          error,
        },
        'RabbitMQ Disconnected',
      );
    });
  }

  async startProcess() {
    const rmq = this.rmq;
    const config = this.config;
    const componentQueue = config.amq.keys.componentQueue;
    const pubChannel = rmq.connection.createChannel();
    const prefetch = config.amq.prefetch || 1;
    this.conChannel = rmq.connection.createChannel({
      json: true,
      setup: async (channel) => {
        this.setupChannel = channel;
        channel.prefetch(prefetch);

        const componentConsumer = new Consumer({
          channel,
          pubChannel,
          config,
          models: this.models,
          log: this.log,
          additionalConfig: this.additionalConfig,
        });

        this.consumerTag = await channel.consume(
          componentQueue,
          async (data) => {
            try {
              await componentConsumer.consume(data, channel);
            } catch (err) {
              console.log(err);
            }
          },
        );

        return this.consumerTag;
      },
    });

    return this.conChannel
      .waitForConnect()
      .then(() => {
        this.log.info('Listening for messages');

        return undefined;
      })
      .catch(console.log);
  }

  async cleanup() {
    this.log.info('Gracefully shutting down amq consumer');

    try {
      await this.setupChannel.channel(this.consumerTag.consumerTag);
      await this.setupChannel.close();
      await this.conChannel.close();
    } catch (err) {
      this.log.warn('Had issue in cleaning up resources.');
    }
  }
}

module.exports = Initialize;
