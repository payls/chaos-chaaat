const models = require('../models');
const authController = require('./auth').makeAuthController(models);
const agencyController = require('./agency').makeAgencyController(models);
const agencyUserController =
  require('./agencyUser').makeAgencyUserController(models);
const agencyReportController =
  require('./agencyReport').makeAgencyReportController(models);
const contactAgencyController =
  require('./contactActivity').makeContactActivityController(models);
const contactController = require('./contact').makeContactController(models);
const contactSourceController =
  require('./contactSource').makeContactSourceController(models);
const contactPropertyDefinitionsController =
  require('./contactPropertyDefinitions').makeContactPropertyDefinitionsController(
    models,
  );
const contactPropertyValuesController =
  require('./contactPropertyValues').makeContactPropertyValuesController(
    models,
  );
const userController = require('./user').makeUserController(models);
const userRoleController = require('./userRole').makeUserRoleController(models);
const userAccessTokenController =
  require('./userAccessToken').makeUserAccessTokenController(models);
const userSocialAuthController =
  require('./userSocialAuth').makeUserSocialAuthController(models);
const userEmailVerificationController =
  require('./userEmailVerification').makeUserEmailVerificationController(
    models,
  );
const userSavedPropertyController =
  require('./userSavedProperty').makeUserSavedPropertyController(models);
const shortListedPropertyController =
  require('./shortListedProperty').makeShortListedPropertyController(models);
const taskController = require('./task').makeTaskController(models);
const taskMessageController =
  require('./taskMessage').makeTaskMessageController(models);
const taskMessageAttachmentController =
  require('./taskMessageAttachment').makeTaskMessageAttachmentController(
    models,
  );
const taskPermissionController =
  require('./taskPermission').makeTaskPermissionController(models);
const shortlistPropertyCommentController =
  require('./shortlistedPropertyComment').makeShortListedPropertyCommentController(
    models,
  );
const shortlistPropertyCommentAttachmentController =
  require('./shortlistedPropertyCommentAttachment').makeShortListedPropertyCommentAttachmentController(
    models,
  );
const shortlistProjectCommentAttachmentController =
  require('./shortlistedProjectCommentAttachment').makeShortListedProjectCommentAttachmentController(
    models,
  );
const shortlistPropertyCommentEmailController =
  require('./shortlistedPropertyCommentEmail').makeShortlistedPropertyCommentEmailController(
    models,
  );
const shortlistProjectCommentEmailController =
  require('./shortlistedProjectCommentEmail').makeShortlistedProjectCommentEmailController(
    models,
  );
const shortlistedProjectCommentController =
  require('./shortlistedProjectComment').makeShortListedProjectCommentController(
    models,
  );
const shortlistedProjectController =
  require('./shortlistedProject').makeShortListedProjectController(models);
const projectController = require('./project').makeProjectController(models);
const projectBreadcrumbController =
  require('./projectBreadcrumb').makeProjectBreadCrumbController(models);
const projectFeatureController =
  require('./projectFeature').makeProjectFeatureController(models);
const projectLocationMapController =
  require('./projectLocationMap').makeProjectLocationMapController(models);
const projectLocationNearbyController =
  require('./projectLocationNearby').makeProjectLocationNearbyController(
    models,
  );
const projectMediaController =
  require('./projectMedia').makeProjectMediaController(models);
const projectTeamBehindController =
  require('./projectTeamBehind').makeProjectTeamBehindController(models);
const projectPropertyController =
  require('./projectProperty').makeProjectPropertyController(models);
const locationController = require('./location').makeLocationController(models);
const featureController = require('./feature').makeFeatureController(models);

const proposalTemplateController =
  require('./proposalTemplate').makeController(models);
const shortlistedProjectProposalTemplate =
  require('./shortlistedProjectProposalTemplate').makeController(models);
const shortlistedProjectSettingProposalTemplate =
  require('./shortlistedProjectSettingProposalTemplate').makeController(models);
const shortlistedPropertyProposalTemplate =
  require('./shortlistedPropertyProposalTemplate').makeController(models);
const shortlistedPropertySettingProposalTemplate =
  require('./shortlistedPropertySettingProposalTemplate').makeController(
    models,
  );
const whatsappMessageTrackerCtl =
  require('./whatsappMessageTracker').makeController(models);

const whatsappChatCtl = require('./whatsappChat').makeController(models);

const sfContactOpportunityCtl =
  require('./sfContactOpportunity').makeController(models);

const sfOpportunityCtl = require('./sfOpportunity').makeController(models);

const agencyConfigCtl = require('./agencyConfig').makeController(models);

const agencyWhatsappConfigCtl =
  require('./agencyWhatsappConfig').makeController(models);

const smsMessageTrackerCtl = require('./smsMessageTracker').makeController(
  models,
);

const agencyCampaignEventDetailsCtl =
  require('./agencyCampaignEventDetails').makeController(models);

const agencyCustomLandingPageCtl =
  require('./agencyCustomLandingPage').makeController(models);

const campaignAdditionalCta = require('./campaignAdditionalCta').makeController(
  models,
);

const stripeCheckoutSession = require('./stripeCheckoutSession').makeController(
  models,
);

const stripeInvoice = require('./stripeInvoice').makeController(models);

const stripePaymentIntent = require('./stripePaymentIntent').makeController(
  models,
);

const unifiedInboxCtl = require('./unifiedInbox').makeController(models);

const campaignSchedule = require('./campaignSchedule').makeController(models);
const emailNotificationSetting =
  require('./emailNotificationSetting').makeController(models);

const wabaTemplate = require('./wabaTemplate').makeController(models);

const mindBodyClientContract =
  require('./mindbodyClientContract').makeController(models);
const mindBodyClientMembership =
  require('./mindbodyClientMembership').makeController(models);
const mindBodyClientVisit = require('./mindbodyClientVisit').makeController(
  models,
);
const mindBodyClientServices =
  require('./mindbodyClientServices').makeController(models);
const mindBodyPackage = require('./mindbodyPackage').makeController(models);
const contactList = require('./contactList').makeController(models);
const contactListUser = require('./contactListUser').makeController(models);
const automationCategory = require('./automationCategory').makeController(
  models,
);
const automationRuleTrigger = require('./automationRuleTrigger').makeController(
  models,
);
const automationRule = require('./automationRule').makeController(models);
const automationRulePackage = require('./automationRulePackage').makeController(
  models,
);
const automationRuleTemplate =
  require('./automationRuleTemplate').makeController(models);

const automationCtlr = require('./automation').makeController(models);
const agencyOauthCtlr = require('./agencyOauth').makeController(models);
const appSyncCredentials = require('./appSyncCredentials').makeController(
  models,
);
const campaignDraft = require('./campaignDraft').makeController(models);

const contactNoteCtlr = require('./contactNote').makeController(models);
const hubSpotFormCtlr = require('./hubSpotForm').makeController(models);
const hubSpotFormSubmissionsCtlr =
  require('./hubSpotFormSubmissions').makeController(models);
const automationRuleFormCtlr = require('./automationRuleForm').makeController(
  models,
);
const liveChat = require('./liveChat').makeController(models);
const liveChatSession = require('./liveChatSession').makeController(models);
const liveChatSettings = require('./liveChatSettings').makeController(models);
const campaignCta = require('./campaignCta').makeController(models);

const agencyChannelConfig = require('./agencyChannelConfig').makeController(
  models,
);

const lineChat = require('./lineChat').makeController(models);
const messengerChat = require('./messengerChat').makeController(models);
const lineTemplate = require('./lineTemplate').makeController(models);
const lineFollower = require('./lineFollower').makeController(models);

const lineMessageTracker = require('./lineMessageTracker').makeController(
  models,
);

const contactSalesforceData = require('./contactSalesforceData').makeController(
  models,
);
const whatsappOnboarding = require('./whatsappOnboarding').makeController(
  models,
);
const whatsappMessagePricing =
  require('./whatsappMessagePricing').makeController(models);

const appointmentBooking = require('./appointmentBooking').makeController(
  models,
);
const clientDetail = require('./clientDetail').makeController(models);
const crmSettings = require('./crmSetting').makeController(models);
const whatsappFlow = require('./whatsappFlow').makeController(models);
const lead = require('./lead').makeController(models);
const lock = require('./lock').makeController(models);

const agencySubscription = require('./agencySubscription').makeController(
  models,
);
const agencySubscriptionProduct =
  require('./agencySubscriptionProduct').makeController(models);

const unsubscribeText = require('./unsubscribeText').makeController(models);
const chaaatProductMatrix = require('./chaaatProductMatrix').makeController(
  models,
);
const agencyInventory = require('./agencyInventory').makeController(models);
const messageInventory = require('./messageInventory').makeController(models);
const campaignInventory = require('./campaignInventory').makeController(models);
const agencyNotification = require('./agencyNotification').makeController(
  models,
);
const appointmentReminder = require('./appointmentReminder').makeController(
  models,
);

module.exports = {
  auth: authController,
  agency: agencyController,
  agencyUser: agencyUserController,
  agencyReport: agencyReportController,
  contact: contactController,
  contactActivity: contactAgencyController,
  contactPropertyDefinitions: contactPropertyDefinitionsController,
  contactPropertyValues: contactPropertyValuesController,
  contactSource: contactSourceController,
  user: userController,
  userRole: userRoleController,
  userAccessToken: userAccessTokenController,
  userSocialAuth: userSocialAuthController,
  userEmailVerification: userEmailVerificationController,
  userSavedProperty: userSavedPropertyController,
  shortListedProperty: shortListedPropertyController,
  shortListedPropertyComment: shortlistPropertyCommentController,
  shortListedPropertyCommentAttachment:
    shortlistPropertyCommentAttachmentController,
  shortListedProjectCommentAttachment:
    shortlistProjectCommentAttachmentController,
  shortlistedPropertyCommentEmail: shortlistPropertyCommentEmailController,
  shortlistedProjectCommentEmail: shortlistProjectCommentEmailController,
  shortlistedProject: shortlistedProjectController,
  shortlistedProjectComment: shortlistedProjectCommentController,
  task: taskController,
  taskMessage: taskMessageController,
  taskMessageAttachment: taskMessageAttachmentController,
  taskPermission: taskPermissionController,
  project: projectController,
  projectBreadcrumb: projectBreadcrumbController,
  projectFeature: projectFeatureController,
  projectLocationMap: projectLocationMapController,
  projectLocationNearby: projectLocationNearbyController,
  projectMedia: projectMediaController,
  projectTeamBehind: projectTeamBehindController,
  projectProperty: projectPropertyController,
  location: locationController,
  feature: featureController,
  proposalTemplate: proposalTemplateController,
  shortlistedProjectProposalTemplate,
  shortlistedProjectSettingProposalTemplate,
  shortlistedPropertyProposalTemplate,
  shortlistedPropertySettingProposalTemplate,
  whatsappMessageTracker: whatsappMessageTrackerCtl,
  whatsappChat: whatsappChatCtl,
  sfContactOpportunity: sfContactOpportunityCtl,
  sfOpportunity: sfOpportunityCtl,
  agencyConfig: agencyConfigCtl,
  agencyWhatsAppConfig: agencyWhatsappConfigCtl,
  smsMessageTracker: smsMessageTrackerCtl,
  agencyCampaignEventDetails: agencyCampaignEventDetailsCtl,
  agencyCustomLandingPage: agencyCustomLandingPageCtl,
  campaignAdditionalCta: campaignAdditionalCta,
  unifiedInbox: unifiedInboxCtl,
  stripeCheckoutSession,
  stripeInvoice,
  stripePaymentIntent,
  campaignSchedule,
  emailNotificationSetting,
  wabaTemplate,
  mindBodyClientContract,
  mindBodyClientMembership,
  mindBodyClientVisit,
  mindBodyClientServices,
  mindBodyPackage,
  contactList,
  contactListUser,
  automationCategory,
  automationRuleTrigger,
  automationRule,
  automationRulePackage,
  automationRuleTemplate,
  automationCtlr,
  agencyOauthCtlr,
  appSyncCredentials,
  campaignDraft,
  contactNoteCtlr,
  hubSpotFormCtlr,
  hubSpotFormSubmissionsCtlr,
  automationRuleFormCtlr,
  liveChat,
  liveChatSession,
  liveChatSettings,
  campaignCta,
  agencyChannelConfig,
  lineChat,
  messengerChat,
  lineTemplate,
  lineFollower,
  lineMessageTracker,
  contactSalesforceData,
  whatsappOnboarding,
  lead,
  whatsappMessagePricing,
  crmSettings,
  whatsappFlow,
  agencySubscription,
  unsubscribeText,
  messageInventory,
  chaaatProductMatrix,
  agencySubscriptionProduct,
  agencyInventory,
  campaignInventory,
  agencyNotification,
  appointmentReminder,
  lock,
};
