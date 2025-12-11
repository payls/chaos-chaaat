const amqplib = require('amqp-connection-manager');

class RabbitMQ {
  constructor({ config }) {
    this.log = {
      info: console.info,
      warn: console.info,
      error: console.info,
    };
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
        sfCronTriggerQueue,
        sfCronTriggerRoutingKey,
        paveBulkCreatePropoposalQueue,
        bulkProcessLineCampaignQueue,
        whatsappWebhookQueue,
        whatsappStatusWebhookQueue,
        appointmentBookingReminderQueue,
        wixWebhookQueue,
        wixWebhookRoutingKey,
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

      this.connection.on('connectFailed', (err) => {
        log.info(
          {
            conn: connectionURI,
            error: err,
          },
          'RabbitMQ connection failed',
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

      this.pubSfCronTrigger = function (content) {
        return this.channel.publish(
          sfCronTriggerQueue,
          sfCronTriggerRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubSendCampaign = function (content) {
        return this.channel.publish(
          paveBulkCreatePropoposalQueue,
          'BATCH',
          Buffer.from(content),
        );
      };

      this.pubBulkProcessLineCampaign = function (content) {
        return this.channel.publish(
          bulkProcessLineCampaignQueue,
          'BATCH',
          Buffer.from(content),
        );
      };

      this.pubWhatsappWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          whatsappWebhookQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubWhatsappStatusWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          whatsappStatusWebhookQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubAppointmentBookingReminder = function (content) {
        return this.channel.publish(
          appointmentBookingReminderQueue,
          'BATCH',
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.wixWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          wixWebhookQueue,
          wixWebhookRoutingKey,
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
