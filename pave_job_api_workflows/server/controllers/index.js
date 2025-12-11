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
  require('./shortlistedProperty').makeShortListedPropertyController(models);
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

const hubspotCtrl = require('./hubspot').makeHubspotController(models);
const salesforceCtrl = require('./salesforce').makeSalesForceController(models);

const agencyConfigCtl = require('./agencyConfig').makeController(models);

const smsMessageTrackerCtl = require('./smsMessageTracker').makeController(
  models,
);

const agencyWhatsappConfigCtl =
  require('./agencyWhatsappConfig').makeController(models);

const campaignCtaCtl = require('./campaignCta').makeController(models);

const contactLeadScoreCtl =
  require('./contactLeadScore').makeContactLeadScoreController(models);

const campaignCtaOptionsCtl = require('./campaignCtaOptions').makeController(
  models,
);

const campaignAdditionalCta = require('./campaignAdditionalCta').makeController(
  models,
);

const unifiedInboxCtl = require('./unifiedInbox').makeController(models);
const appSyncCredentials = require('./appSyncCredentials').makeController(
  models,
);

const liveChat = require('./liveChat').makeController(models);
const liveChatSession = require('./liveChatSession').makeController(models);
const liveChatSettings = require('./liveChatSettings').makeController(models);

const lineChat = require('./lineChat').makeController(models);
// UIB Line
const follow = require('./line/uib/follow').makeController(models);
const unfollow = require('./line/uib/unfollow').makeController(models);
const text = require('./line/uib/text').makeController(models);
const image = require('./line/uib/image').makeController(models);
const video = require('./line/uib/video').makeController(models);

// Direct Line
const lineMessageTracker = require('./lineMessageTracker').makeController(
  models,
);
const directFollow = require('./line/direct/follow').makeController(models);
const directUnfollow = require('./line/direct/unfollow').makeController(models);
const directText = require('./line/direct/text').makeController(models);
const directImage = require('./line/direct/image').makeController(models);
const directVideo = require('./line/direct/video').makeController(models);
const agencyChannelConfig = require('./agencyChannelConfig').makeController(
  models,
);
const messengerChat = require('./messengerChat').makeController(models);
const messengerText = require('./messenger/text').makeController(models);
const messengerImage = require('./messenger/image').makeController(models);
const messengerVideo = require('./messenger/video').makeController(models);
const messengerDocument = require('./messenger/document').makeController(
  models,
);
const lineFollower = require('./lineFollower').makeController(models);
const contactList = require('./contactList').makeController(models);
const contactListUser = require('./contactListUser').makeController(models);
const unsubscribeText = require('./unsubscribeText').makeController(models);
const contactSalesforceData = require('./contactSalesforceData').makeController(
  models,
);

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
const automationRuleFormCtlr = require('./automationRuleForm').makeController(
  models,
);

const whatsappOnboardingCtl = require('./whatsappOnboarding');
const lock = require('./lock').makeController(models);

const whatsapp = require('./whatsapp').makeController(models);
const agencySubscription = require('./agencySubscription').makeController(
  models,
);
const agencySubscriptionProduct =
  require('./agencySubscriptionProduct').makeController(models);
const chaaatProductMatrix = require('./chaaatProductMatrix').makeController(
  models,
);

const messageInventory = require('./messageInventory').makeController(models);
const campaignInventory = require('./campaignInventory').makeController(models);
const wabaTemplate = require('./wabaTemplate').makeController(models);
const agencyNotification = require('./agencyNotification').makeController(
  models,
);

// const contactMessageWABAForFirstTimeRuleAutomation =
//   require('./contactMessageWABAForFirstTimeRuleAutomation').makeController(
//     models,
//   );

const appointmentBooking = require('./appointmentBooking').makeController(
  models,
);
const clientDetail = require('./clientDetail').makeController(models);
const crmSettings = require('./crmSetting').makeController(models);
const whatsappFlow = require('./whatsappFlow').makeController(models);
const appointmentReminder = require('./appointmentReminder').makeController(
  models,
);
const agencyOauthController = require('./agencyOauth').makeController(models);

module.exports = {
  auth: authController,
  agency: agencyController,
  agencyUser: agencyUserController,
  agencyReport: agencyReportController,
  agencyOauth: agencyOauthController,
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
  hubspot: hubspotCtrl,
  salesforce: salesforceCtrl,
  agencyConfig: agencyConfigCtl,
  smsMessageTracker: smsMessageTrackerCtl,
  agencyWhatsappConfig: agencyWhatsappConfigCtl,
  campaignCta: campaignCtaCtl,
  contactLeadScore: contactLeadScoreCtl,
  campaignCtaOptions: campaignCtaOptionsCtl,
  campaignAdditionalCta: campaignAdditionalCta,
  unifiedInbox: unifiedInboxCtl,
  appSyncCredentials: appSyncCredentials,
  liveChat: liveChat,
  liveChatSession: liveChatSession,
  lineChat: lineChat,
  lineFollow: follow,
  lineUnfollow: unfollow,
  lineText: text,
  lineImage: image,
  lineVideo: video,
  lineDirectFollow: directFollow,
  lineDirectUnfollow: directUnfollow,
  lineDirectText: directText,
  lineDirectImage: directImage,
  lineDirectVideo: directVideo,
  agencyChannelConfig: agencyChannelConfig,
  messengerChat: messengerChat,
  messengerText: messengerText,
  messengerImage: messengerImage,
  messengerVideo: messengerVideo,
  messengerDocument: messengerDocument,
  lineMessageTracker: lineMessageTracker,
  lineFollower: lineFollower,
  contactList: contactList,
  contactListUser: contactListUser,
  unsubscribeText: unsubscribeText,
  automationCategory,
  automationRuleTrigger,
  automationRule,
  automationRulePackage,
  automationRuleTemplate,
  automationRuleFormCtlr,
  // contactMessageWABAForFirstTimeRuleAutomation,
  contactSalesforceData: contactSalesforceData,
  appointmentBooking,
  clientDetail,
  crmSettings,
  whatsappFlow,
  whatsappOnboarding: whatsappOnboardingCtl,
  liveChatSettings: liveChatSettings,
  messageInventory,
  whatsapp,
  agencySubscription,
  agencySubscriptionProduct,
  chaaatProductMatrix,
  campaignInventory,
  wabaTemplate,
  agencyNotification,
  appointmentReminder,
  lock,
};
