const Sentry = require('@sentry/node');
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
      const connection = config.amq.connection;
      const {
        sfAdhocQueue,
        sfAdhocRoutingKey,
        paveBulkCreatePropoposalQueue,
        paveBulkCreatePropoposalRoutingKey,
        whatsappWebhookQueue,
        whatsappWebhookRoutingKey,
        hsAdhocQueue,
        hsAdhocRoutingKey,
        paveBulkCreateMessageQueue,
        paveBulkCreateMessageRoutingKey,
        liveChatWebhookQueue,
        liveChatWebhookRoutingKey,
        lineWebhookQueue,
        lineWebhookRoutingKey,
        messengerWebhookQueue,
        messengerWebhookRoutingKey,
        bulkProcessLineCampaignQueue,
        bulkProcessLineCampaignRoutingKey,
        csvContactListQueue,
        csvContactListRoutingKey,
        waOnboardingWebhookQueue,
        waOnboardingWebhookRoutingKey,
        hbListContactListQueue,
        hbListContactListRoutingKey,
        whatsappStatusWebhookQueue,
        whatsappStatusWebhookRoutingKey,
        wixWebhookQueue,
        wixWebhookRoutingKey
      } = config.amq.keys;
      const connectionURI =
        connection.uri ||
        `amqp://${connection.username}:${connection.password}@${connection.host}:${connection.port}`;

      log.info({ connection: connectionURI }, 'RabbitMQ Connection');
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
        console.log(error);
        log.error(
          {
            error,
          },
          'RabbitMQ Disconnected',
        );
      });
      this.channel = await this.connection.createChannel();
      this.pubBulkProposal = function (content) {
        return this.channel.publish(
          paveBulkCreatePropoposalQueue,
          paveBulkCreatePropoposalRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubWhatsappWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          whatsappWebhookQueue,
          whatsappWebhookRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubLiveChatWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          liveChatWebhookQueue,
          liveChatWebhookRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubLineWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          lineWebhookQueue,
          lineWebhookRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubFBMessengerWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          messengerWebhookQueue,
          messengerWebhookRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubHsAdhocProcess = function (content) {
        return this.channel.publish(
          hsAdhocQueue,
          hsAdhocRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubSfAdhocProcess = function (content) {
        return this.channel.publish(
          sfAdhocQueue,
          sfAdhocRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubBulkMessage = function (content) {
        return this.channel.publish(
          paveBulkCreateMessageQueue,
          paveBulkCreateMessageRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubBulkProcessLineCampaign = function (content) {
        return this.channel.publish(
          bulkProcessLineCampaignQueue,
          bulkProcessLineCampaignRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubSfGenerateListFromReport = function (content) {
        return this.channel.publish(
          sfAdhocQueue,
          sfAdhocRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubCSVContactListCreation = function (content) {
        return this.channel.publish(
          csvContactListQueue,
          csvContactListRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubWhatsappOnboardingWebhookPayload = function (content) {
        return this.channel.publish(
          waOnboardingWebhookQueue,
          waOnboardingWebhookRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubHubSpotContactListCreation = function (content) {
        return this.channel.publish(
          hbListContactListQueue,
          hbListContactListRoutingKey,
          Buffer.from(JSON.stringify(content)),
        );
      };

      this.pubWhatsappStatusWebhookPayloadProcess = function (content) {
        return this.channel.publish(
          whatsappStatusWebhookQueue,
          whatsappStatusWebhookRoutingKey,
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
      Sentry.captureException(err);
      console.log(err);
      log.error('RabbitMQ Init Error', {
        err,
      });
    }
  }
}
module.exports = RabbitMQ;
