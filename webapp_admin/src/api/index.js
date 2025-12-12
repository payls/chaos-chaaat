import * as authApi from './auth';
import * as propertyApi from './property';
import * as taskApi from './task';
import * as taskMessageApi from './taskMessage';
import * as contactApi from './contact';
import * as contactActivityApi from './contactActivity';
import * as dashboardApi from './dashboard';
import * as agencyApi from './agency';
import * as agencyUserApi from './agencyUser';
import * as agencyReportApi from './agencyReport';
import * as projectApi from './project';
import * as contactLinkApi from './contactLink';
import * as shortlistedPropertyCommentApi from './shortlistedPropertyComment';
import * as shortlistedProjectCommentApi from './shortlistedProjectComment';
import * as shortlistedPropertyCommentReactionApi from './shortlistedPropertyCommentReaction';
import * as uploadApi from './upload';
import * as userManagementApi from './userManagement';
import * as integrationsApi from './integrations';
import * as contentCountryApi from './content/country';
import * as contentProjectApi from './content/project';
import * as contactViewApi from './contactView';
import * as proposalTemplateApi from './proposalTemplate';
import * as whatsAppApi from './whatsApp';
import * as smsApi from './sms';
import * as unifiedInboxApi from './unifiedInbox';
import * as agencyCustomLandingPageApi from './agencyCustomLandingPage';
import * as campaignScheduleApi from './campaignSchedule';
import * as emailNotificationApi from './emailNotification';
import * as contactListApi from './contactList';
import * as contactListUserApi from './contactListUser';
import * as automationApi from './automation';
import * as appSyncApi from './appsync';
import * as settingApi from './setting';
import * as liveChatApi from './liveChat';
import * as lineChatApi from './lineChat';
import * as fbMessengerChatApi from './fbMessengerChat';
import * as messengerApi from './messenger';
import * as crmSettingApi from './crmSetting';
import * as agencyOauthApi from './agencyOauth';

export const api = {
  auth: authApi,
  property: propertyApi,
  task: taskApi,
  taskMessage: taskMessageApi,
  contact: contactApi,
  contactActivity: contactActivityApi,
  content: {
    country: contentCountryApi,
    project: contentProjectApi,
  },
  dashboard: dashboardApi,
  agency: agencyApi,
  agencyUser: agencyUserApi,
  agencyReport: agencyReportApi,
  project: projectApi,
  contactLink: contactLinkApi,
  shortlistedProjectComment: shortlistedProjectCommentApi,
  shortlistedPropertyComment: shortlistedPropertyCommentApi,
  shortlistedPropertyCommentReaction: shortlistedPropertyCommentReactionApi,
  upload: uploadApi,
  userManagement: userManagementApi,
  integrations: integrationsApi,
  contactView: contactViewApi,
  proposalTemplate: proposalTemplateApi,
  whatsapp: whatsAppApi,
  sms: smsApi,
  agencyCustomLandingPage: agencyCustomLandingPageApi,
  unifiedInbox: unifiedInboxApi,
  campaignSchedule: campaignScheduleApi,
  emailNotification: emailNotificationApi,
  contactList: contactListApi,
  contactListUser: contactListUserApi,
  automation: automationApi,
  appsync: appSyncApi,
  setting: settingApi,
  liveChat: liveChatApi,
  line: lineChatApi,
  fbmessenger: fbMessengerChatApi,
  messenger: messengerApi,
  crmSetting: crmSettingApi,
  agencyOauth: agencyOauthApi,
};
