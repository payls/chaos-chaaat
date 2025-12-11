module.exports = {
  hsProcessContacts: require('./hs-process-contacts'),
  hsCreateContact: require('./hs-create-contact'),
  hsUpdateContact: require('./hs-update-contact'),
  hsSendContactNote: require('./hs-send-contact-notes'),
  sfCreateContact: require('./sf-create-contact'),
  sfUpdateContact: require('./sf-update-contact'),
  sfCreateContactOpportunity: require('./sf-create-contact-opportunity'),
  sfCronProcessor: require('./sf-cron-processor'),
  sfSendContactNote: require('./sf-send-contact-notes'),
  paveBulkCreateProposal: require('./pave-bulk-create-proposal'),
  paveCreateProposal: require('./pave-create-proposal'),
  waProcessWebhookPayload: require('./waba-payload-processor')
    .receiveMessagePayload,
  paveBulkCreateMessage: require('./pave-bulk-create-message'),
  paveCreateMessage: require('./pave-create-message'),
  liveChatProcessWebhookPayload: require('./live-chat-process-webhook-payload'),
  lineProcessWebhookPayload: require('./line-process-webhook-payload'),
  fbMessengerProcessWebhookPayload: require('./fb-messenger-process-webhook-payload'),
  lineProcessBulkCampaign: require('./line-process-bulk-campaign'),
  lineSendCampaign: require('./line-send-campaign'),
  sfGenerateListFromReport: require('./sf-generate-list-from-report')
    .generateList,
  sfGenerateListFromReportFallback: require('./sf-generate-list-from-report')
    .generateListFallback,
  contactListCSVUpload: require('./contact-list-generation/csv').generateList,
  waProcessOnboardingWebhookPayload: require('./wa-process-onboarding-webhook-payload'),
  appointmentBookingReminder: require('./appointment-booking-reminder'),
  contactListHubSpotList: require('./contact-list-generation/hubspot-list')
    .generateList,
  waProcessStatusWebhookPayload: require('./waba-payload-processor')
    .receiveStatusPayload,
  wixProcessPayload: require('./wix-payload').receiveWixPayload
};
