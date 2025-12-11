export const config = {
  env: process.env.NEXT_PUBLIC_APP_ENV,
  appName: 'Chaaat',
  webAppAdminName: 'Chaaat Staff Admin',
  webAdminUrl: process.env.NEXT_PUBLIC_ADMIN_URL,
  webUrl: process.env.NEXT_PUBLIC_WEB_URL,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  apiIntegrationsUrl: process.env.NEXT_PUBLIC_INTEGRATION_URL,
  cdnUrls: process.env.NEXT_PUBLIC_CDNURLS,
  liveChatUrl: process.env.NEXT_PUBLIC_LIVECHATJS,
  liveChatCSSUrl: process.env.NEXT_PUBLIC_LIVECHATCSS,
  devWebAppAdminUrl: process.env.NEXT_PUBLIC_DEV_ADMIN_URL,
  devApiUrl: process.env.NEXT_PUBLIC_DEV_API_URL,
  componentToken: process.env.NEXT_PUBLIC_COMPONENT_TOKEN,
  googleAuth: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  },
  tinymce: {
    apiKey: process.env.NEXT_PUBLIC_TINYMCE_APIKEY,
  },
  wabaWebhookUrl: process.env.NEXT_PUBLIC_WABA_WEBHOOK_URL,
  partnerAgencyList: process.env.NEXT_PUBLIC_PARTNER_AGENCY_LIST,
  tec_agency_list: process.env.NEXT_PUBLIC_TEC_AGENCY_LIST,
};
