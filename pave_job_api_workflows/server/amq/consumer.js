const constants = require('../constants/constant.json');
const processors = require('./processors');
const { v4 } = require('uuid');
const Sentry = require('@sentry/node');

class Consumer {
  constructor({ channel, pubChannel, config, models, log, additionalConfig }) {
    this.channel = channel;
    this.pubChannel = pubChannel;
    this.config = config;
    this.models = models;
    this.log = log;
    this.additionalConfig = additionalConfig;
  }

  async consume(data) {
    const channel = this.channel;
    const pubChannel = this.pubChannel;
    const config = this.config;
    const models = this.models;
    const log = this.log;
    const additionalConfig = this.additionalConfig;

    if (!data || !data.content.toString()) {
      channel.nack(data, false, false);

      log.error({
        data,
        contentLength: data?.content?.toString().length || 0,
      });
    }

    if (data && data.content) {
      try {
        const { consumerType } = JSON.parse(data.content.toString());
        console.log('consumer', consumerType);
        const {
          HS_PROCESS_CONTACTS,
          HS_CREATE_CONTACT,
          HS_UPDATE_CONTACT,
          HS_SEND_CONTACT_NOTE,
          SF_CREATE_CONTACT,
          SF_UPDATE_CONTACT,
          SF_CREATE_CONTACT_OPPORTUNITY,
          SF_CRON_PROCESSOR,
          // SF_UPDATE_OPPORTUNITY,
          SF_SEND_CONTACT_NOTE,
          PAVE_BULK_CREATE_PROPOSAL,
          PAVE_CREATE_PROPOSAL,
          WA_PROCESS_WEBHOOK_PAYLOAD,
          PAVE_BULK_CREATE_MESSAGE,
          PAVE_CREATE_MESSAGE,
          LIVE_CHAT_PROCESS_WEBHOOK_PAYLOAD,
          LINE_PROCESS_WEBHOOK_PAYLOAD,
          FB_MESSENGER_PROCESS_WEBHOOK_PAYLOAD,
          BULK_PROCESS_LINE_CAMPAIGN,
          SEND_LINE_CAMPAIGN,
          SF_GENERATE_LIST_FROM_REPORT,
          SF_GENERATE_LIST_FROM_REPORT_FALLBACK,
          CONTACT_LIST_FROM_CSV_UPLOAD,
          WA_PROCESS_ONBOARDING_WEBHOOK_PAYLOAD,
          APPOINTMENT_BOOKING_REMINDER,
          CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD,
          WA_PROCESS_STATUS_WEBHOOK_PAYLOAD,
          WIX_PROCESS_WEBHOOK_PAYLOAD
        } = constants.AMQ.CONSUMER_TYPES;
        let processor;
        switch (consumerType) {
          case HS_PROCESS_CONTACTS:
            processor = processors.hsProcessContacts;
            break;
          case HS_CREATE_CONTACT:
            processor = processors.hsCreateContact;
            break;
          case HS_UPDATE_CONTACT:
            processor = processors.hsUpdateContact;
            break;
          case HS_SEND_CONTACT_NOTE:
            processor = processors.hsSendContactNote;
            break;
          case SF_CREATE_CONTACT:
            processor = processors.sfCreateContact;
            break;
          case SF_UPDATE_CONTACT:
            processor = processors.sfUpdateContact;
            break;
          case SF_CREATE_CONTACT_OPPORTUNITY:
            processor = processors.sfCreateContactOpportunity;
            break;
          case SF_CRON_PROCESSOR:
            processor = processors.sfCronProcessor;
            break;
          case SF_SEND_CONTACT_NOTE:
            processor = processors.sfSendContactNote;
            break;
          case PAVE_BULK_CREATE_PROPOSAL:
            processor = processors.paveBulkCreateProposal;
            break;
          case PAVE_CREATE_PROPOSAL:
            processor = processors.paveCreateProposal;
            break;
          case WA_PROCESS_WEBHOOK_PAYLOAD:
            processor = processors.waProcessWebhookPayload;
            break;
          case PAVE_BULK_CREATE_MESSAGE:
            processor = processors.paveBulkCreateMessage;
            break;
          case PAVE_CREATE_MESSAGE:
            processor = processors.paveCreateMessage;
            break;
          case LIVE_CHAT_PROCESS_WEBHOOK_PAYLOAD:
            processor = processors.liveChatProcessWebhookPayload;
            break;
          case LINE_PROCESS_WEBHOOK_PAYLOAD:
            processor = processors.lineProcessWebhookPayload;
            break;
          case FB_MESSENGER_PROCESS_WEBHOOK_PAYLOAD:
            processor = processors.fbMessengerProcessWebhookPayload;
            break;
          case BULK_PROCESS_LINE_CAMPAIGN:
            processor = processors.lineProcessBulkCampaign;
            break;
          case SEND_LINE_CAMPAIGN:
            processor = processors.lineSendCampaign;
            break;
          case SF_GENERATE_LIST_FROM_REPORT:
            processor = processors.sfGenerateListFromReport;
            break;
          case SF_GENERATE_LIST_FROM_REPORT_FALLBACK:
            processor = processors.sfGenerateListFromReportFallback;
            break;
          case CONTACT_LIST_FROM_CSV_UPLOAD:
            processor = processors.contactListCSVUpload;
            break;
          case WA_PROCESS_ONBOARDING_WEBHOOK_PAYLOAD:
            processor = processors.waProcessOnboardingWebhookPayload;
            break;
          case APPOINTMENT_BOOKING_REMINDER:
            processor = processors.appointmentBookingReminder;
            break;
          case CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD:
            processor = processors.contactListHubSpotList;
            break;
          case WA_PROCESS_STATUS_WEBHOOK_PAYLOAD:
            processor = processors.waProcessStatusWebhookPayload;
            break;
          case WIX_PROCESS_WEBHOOK_PAYLOAD:
            processor = processors.wixProcessPayload;
            break;
          default:
            processor = processors.hsProcessContacts;
        }

        await processor({
          data,
          models,
          channel,
          config,
          pubChannel,
          log: log.child({
            consumer_name: consumerType,
            consumer_run_id: v4(),
          }),
          additionalConfig,
        });
      } catch (err) {
        Sentry.captureException(err);
        log.error(err);
        log.error({
          1: data?.content
            ? JSON.parse(data.content.toString())
            : data?.content,
          contentLength: data?.content?.toString().length || 0,
        });
      }
    }
  }
}

module.exports = Consumer;
