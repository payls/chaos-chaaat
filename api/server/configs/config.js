const config = {
  development: {
    appName: 'Pave (Development)',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
    webAppName: 'Pave Webapp (Development)',
    webAppAdminName: 'Pave Webapp Admin (Development)',
    apiUrl: process.env.API_URL,
    apiIntegrationsUrl: 'http://localhost:3113',
    contentApiUrl: 'https://content.chaaat.io/wp-json/wp',
    webUrl: 'http://localhost:3111',
    webAdminUrl: 'http://localhost:3112',
    jwt: {
      expirySecs: 31536000,
    },
    cdnUrls: ['https://cdn-staging.yourpave.com'],
    corsSettings: {
      api: {
        whitelistOrigins: [
          'https://3f57-2001-4453-6c2-da00-61aa-1e62-3236-617d.ngrok-free.app',
          'https://d51f-112-208-183-229.ngrok-free.app',
          'http://localhost:3111',
          '/*.localhost:3111/',
          'http://localhost:3112',
          'http://localhost:3115',
          '(^|^[^:]+://|[^.]+.)localhost:3111(:d{1,5})?$',
          'https://partner-api.unificationengine.com',
          'https://partner.uib.ai/',
          'https://18.157.156.56/',
          'https://3.124.97.71/',
          'https://18.157.127.135/',
          'https://dashboard.stripe.com/',
          'http://localhost:3000',
          'http://localhost:3001',
          'https://staff.chaaat.io',
        ],
      },
    },
    googleAuth: {
      clientId:
        '791976211822-f5n2eggmlhrsksptojoqf4v9jf8er6tj.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    transloadit: {
      imageOptimiseTemplateId: 'ba066dbd27154434a25898ebfd978558',
    },
    component: {
      secret: '5rO8pBwlI5ezBACN',
    },
    newRelic: {
      licenseKey: '',
    },
    directIntegrations: {
      hubspot: {
        clientId: 'b9c33a7b-7802-4b20-a587-1cb9e1b5ea07',
        clientSecret: '70b89c8e-d99d-48c8-a63f-41043fb27943',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms crm.objects.deals.read crm.objects.deals.write crm.lists.read',
        redirectUri: 'http://localhost:3112/settings/hubspot-redirect-page',
      },
      salesforce: {
        clientId:
          '3MVG9pRzvMkjMb6l7eEi5gB_ZuZlVZj8ALujptGapfUdu6zZEoCFW0UU3wPNuDfuQwomnTSUD278sIMa2avPZ',
        clientSecret:
          '1F5998FB25EBB9CB345AFF5944BE15C25379DCE71C3CEED5E283DE3D7CF6AEBE',
        scope: 'api refresh_token offline_access cdp_query_api',
        redirectUri: 'http://localhost:3112/settings/salesforce-redirect-page',
        webhookToken: 'secret',
      },
    },
    amq: {
      connection: {
        uri: null, // 'amqp://localhost'
        host: 'localhost',
        port: 5672,
        username: 'root',
        password: 'root',
      },
      keys: {
        componentQueue: 'IN.LOCAL.ALLPROCESS',
        componentExchange: 'IN.LOCAL.ALLPROCESS',
        componentRoutingKey: 'BATCH',
        hsBulkProcessQueue: 'IN.LOCAL.ALLPROCESS',
        hsBulkProcessExchange: 'IN.LOCAL.ALLPROCESS',
        hsBulkProcessRoutingKey: 'BATCH',
        hsCreateContactQueue: 'IN.LOCAL.ALLPROCESS',
        hsCreateContactExchange: 'IN.LOCAL.ALLPROCESS',
        hsCreateContactRoutingKey: 'BATCH',
        hsUpdateContactQueue: 'IN.LOCAL.ALLPROCESS',
        hsUpdateContactExchange: 'IN.LOCAL.ALLPROCESS',
        hsUpdateContactRoutingKey: 'BATCH',
        hsAdhocQueue: 'IN.LOCAL.ALLPROCESS',
        hsAdhocExchange: 'IN.LOCAL.ALLPROCESS',
        hsAdhocRoutingKey: 'BATCH',
        sfCreateContactQueue: 'IN.LOCAL.ALLPROCESS',
        sfCreateContactExchange: 'IN.LOCAL.ALLPROCESS',
        sfCreateContactRoutingKey: 'BATCH',
        sfUpdateContactQueue: 'IN.LOCAL.ALLPROCESS',
        sfUpdateContactExchange: 'IN.LOCAL.ALLPROCESS',
        sfUpdateContactRoutingKey: 'BATCH',
        sfAdhocQueue: 'IN.LOCAL.ALLPROCESS',
        sfAdhocExchange: 'IN.LOCAL.ALLPROCESS',
        sfAdhocRoutingKey: 'BATCH',
        paveBulkCreatePropoposalQueue:
          process.env.PAVE_BULK_CREATE_PROPOSAL_QUEUE || 'IN.LOCAL.ALLPROCESS',
        paveBulkCreateProposalExchange:
          process.env.PAVE_BULK_CREATE_PROPOSAL_EXCHANGE ||
          'IN.LOCAL.ALLPROCESS',
        paveBulkCreatePropoposalRoutingKey: 'BATCH',
        paveCreateProposalQueue:
          process.env.PAVE_CREATE_PROPOSAL_QUEUE || 'IN.LOCAL.ALLPROCESS',
        paveCreateProposalExchange:
          process.env.PAVE_CREATE_PROPOSAL_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        paveCreateProposalRoutingKey: 'BATCH',
        whatsappWebhookQueue:
          process.env.WHATSAPP_WEBHOOK_QUEUE || 'IN.LOCAL.ALLPROCESS',
        whatsappWebhookExchange:
          process.env.WHATSAPP_WEBHOOK_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        whatsappWebhookRoutingKey: 'BATCH',
        paveBulkCreateMessageQueue:
          process.env.PAVE_BULK_CREATE_MESSAGE_QUEUE || 'IN.LOCAL.ALLPROCESS',
        paveBulkCreateMessageExchange:
          process.env.PAVE_BULK_CREATE_MESSAGE_EXCHANGE ||
          'IN.LOCAL.ALLPROCESS',
        paveBulkCreateMessageRoutingKey: 'BATCH',
        paveCreateMessageQueue:
          process.env.PAVE_CREATE_MESSAGE_QUEUE || 'IN.LOCAL.ALLPROCESS',
        paveCreateMessageExchange:
          process.env.PAVE_CREATE_MESSAGE_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        paveCreateMessageRoutingKey: 'BATCH',
        liveChatWebhookQueue:
          process.env.LIVE_CHAT_WEBHOOK_QUEUE || 'IN.LOCAL.ALLPROCESS',
        liveChatWebhookExchange:
          process.env.LIVE_CHAT_WEBHOOK_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        liveChatWebhookRoutingKey: 'BATCH',
        lineWebhookQueue:
          process.env.LINE_WEBHOOK_QUEUE || 'IN.LOCAL.ALLPROCESS',
        lineWebhookExchange:
          process.env.LINE_WEBHOOK_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        lineWebhookRoutingKey: 'BATCH',
        messengerWebhookQueue:
          process.env.MESSENGER_WEBHOOK_QUEUE || 'IN.LOCAL.ALLPROCESS',
        messengerWebhookExchange:
          process.env.MESSENGER_WEBHOOK_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        messengerWebhookRoutingKey: 'BATCH',
        bulkProcessLineCampaignQueue:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_QUEUE || 'IN.LOCAL.ALLPROCESS',
        bulkProcessLineCampaignExchange:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_EXCHANGE ||
          'IN.LOCAL.ALLPROCESS',
        bulkProcessLineCampaignRoutingKey: 'BATCH',
        sendLineCampaignQueue:
          process.env.SEND_LINE_CAMPAIGN_QUEUE || 'IN.LOCAL.ALLPROCESS',
        sendLineCampaignExchange:
          process.env.SEND_LINE_CAMPAIGN_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        sendLineCampaignRoutingKey: 'BATCH',
        csvContactListQueue:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_QUEUE ||
          'IN.LOCAL.ALLPROCESS',
        csvContactListExchange:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_EXCHANGE ||
          'IN.LOCAL.ALLPROCESS',
        csvContactListRoutingKey: 'BATCH',
        waOnboardingWebhookQueue:
          process.env.WA_ONBOARDING_WEBHOOK_QUEUE || 'IN.LOCAL.ALLPROCESS',
        waOnboardingWebhookRoutingKey: 'BATCH',
        appointmentBookingReminderQueue: 'IN.LOCAL.ALLPROCESS',
        appointmentBookingReminderRoutingKey: 'BATCH',
        hbListContactListQueue:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_QUEUE ||
          'IN.LOCAL.ALLPROCESS',
        hbListContactListExchange:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_EXCHANGE ||
          'IN.LOCAL.ALLPROCESS',
        hbListContactListRoutingKey: 'BATCH',
        whatsappStatusWebhookQueue:
          process.env.WHATSAPP_STATUS_WEBHOOK_QUEUE || 'IN.LOCAL.ALLPROCESS',
        whatsappStatusWebhookExchange:
          process.env.WHATSAPP_STATUS_WEBHOOK_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        whatsappStatusWebhookRoutingKey: 'BATCH',
        wixWebhookQueue: process.env.WIX_WEBHOOK_QUEUE || 'IN.LOCAL.ALLPROCESS',
        wixWebhookExchange:
          process.env.WIX_WEBHOOK_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
        wixWebhookRoutingKey: 'BATCH',
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    redis: {
      enabled: false,
      port: 6379,
      host: 'host.docker.internal',
      db: 0,
      password: null,
      url: null,
      connectTimeout: Number(process.env.REDIS_TIMEOUT) || 10000,
    },
    gmail: {
      web: {
        client_id:
          '570902044484-j6r4sv1ctsn131sc5a78ga0jvcesfe8c.apps.googleusercontent.com',
        client_secret: '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',
        project_id: 'pave-platform',
        javascript_origins: 'http://localhost:3112',
      },
    },
    stripe: {
      secretKey:
        'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
      publishableKey:
        'pk_test_51Ig0yKIz3ID7iG8qBZxEb28UiwCBvD3SKTBkJ8l5oEQtXOSrrgnVRoJWjiEBiccHftNhnYTqQHo77K0xMw3ez04L00AJCBZoXk',
    },

    mindbody: {
      apiKey: 'ad52885b540d47ea961f5034e838b1ed',
      siteId: '-99',
      baseUrl: 'https://api.mindbodyonline.com/public/v6',
      webhookUrl: 'https://8fb7-122-54-90-10.ngrok-free.app',
    },

    pusher: {
      appId: '1642419',
      key: '28a0684ac386c4f40050',
      secret: '36bdb959a254dc1dfbde',
    },

    graphql: {
      endpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_id: 'hbaedhepr5cqpfviyy7ipkeqry',
      api_key: 'da2-s43apfe6hrdlxhjcoy2tcwkica',
    },
    messenger: {
      client_id: '315343961336992',
      client_secret: '02173d79ca339ef83ab17902c2ac4be2',
    },
  },
  staging: {
    appName: 'Pave (Staging)',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
    webAppName: 'Pave Webapp (Staging)',
    webAppAdminName: 'Pave Webapp Admin (Staging)',
    apiUrl: 'https://api-staging.chaaat.io',
    apiIntegrationsUrl: 'https://api-integrations-staging.chaaat.io',
    contentApiUrl: 'https://content.chaaat.io/wp-json/wp',
    webUrl: 'https://app-staging.chaaat.io',
    webAdminUrl: 'https://staff-staging.chaaat.io',
    jwt: {
      expirySecs: 31536000,
    },
    cdnUrls: ['https://cdn-staging.yourpave.com'],
    corsSettings: {
      api: {
        whitelistOrigins: [
          'https://app-staging.yourpave.com',
          '/*.app-staging.yourpave.com/',
          'https://staff-staging.yourpave.com',
          'https://app-staging.chaaat.io',
          '/*.app-staging.chaaat.io/',
          'https://staff-staging.chaaat.io',
          'https://staff.chaaat.io',
          'https://livechat-staging.yourpave.com',
          'http://localhost:3115', // For Cypress tests
          '(^|^[^:]+://|[^.]+.)yourpave.com(:d{1,5})?$',
          'https://livechat.chaaat.io',
          '(^|^[^:]+://|[^.]+.)chaaat.io(:d{1,5})?$',
          'https://partner-api.unificationengine.com',
          'https://partner.uib.ai/',
          'https://18.157.156.56/',
          'https://3.124.97.71/',
          'https://18.157.127.135/',
          'https://chaaatio.netlify.app', // For netlify test
          'https://chaaatio.netlify.app/',
          'http://localhost:3001',
        ],
      },
    },
    googleAuth: {
      clientId:
        '791976211822-f5n2eggmlhrsksptojoqf4v9jf8er6tj.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    transloadit: {
      imageOptimiseTemplateId: 'ba066dbd27154434a25898ebfd978558',
    },
    component: {
      secret: 'uFVgBN4yygGpl1Zz',
    },
    newRelic: {
      licenseKey: '49443d1676957a5d211dd390f52473ea7f0fNRAL',
      appId: '1107182003',
    },
    directIntegrations: {
      hubspot: {
        clientId: '2523606a-ab7f-480b-8f27-a724eab3f4b7',
        clientSecret: '5c88f59d-a810-4579-8367-95f4c4b8cb15',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms crm.objects.deals.read crm.objects.deals.write crm.lists.read',
        redirectUri:
          'https://staff-staging.yourpave.com/settings/hubspot-redirect-page',
      },
      salesforce: {
        clientId:
          '3MVG9pRzvMkjMb6l7eEi5gB_ZuXKSRKlvosQxtltBYvHh9xGYHuPaJnA0kxi0xvfv5UeoYmzLV5e10u6oelu0',
        clientSecret:
          '8A2476240AD0A9503D7C044819352234CE1961104AFF004276856ACA50680085',
        scope: 'api refresh_token offline_access cdp_query_api',
        redirectUri:
          'https://staff-staging.yourpave.com/settings/salesforce-redirect-page',
        webhookToken: 'FYYof1PWDg',
      },
    },
    amq: {
      connection: {
        uri: 'amqps://root:J6Q9wAPQfB9zUJNY0JgM@b-d9312bda-5029-4482-b02c-96caa45d35f6.mq.ap-southeast-1.amazonaws.com:5671', // 'amqp://localhost'
        host: 'b-d9312bda-5029-4482-b02c-96caa45d35f6.mq.ap-southeast-1.amazonaws.com',
        port: 5671,
        username: 'root',
        password: 'J6Q9wAPQfB9zUJNY0JgM',
      },
      keys: {
        componentQueue: 'IN.STAGING.ALLPROCESS',
        componentExchange: 'IN.STAGING.ALLPROCESS',
        componentRoutingKey: 'BATCH',
        hsBulkProcessQueue: 'IN.STAGING.ALLPROCESS',
        hsBulkProcessExchange: 'IN.STAGING.ALLPROCESS',
        hsBulkProcessRoutingKey: 'BATCH',
        hsCreateContactQueue: 'IN.STAGING.ALLPROCESS',
        hsCreateContactExchange: 'IN.STAGING.ALLPROCESS',
        hsCreateContactRoutingKey: 'BATCH',
        hsUpdateContactQueue: 'IN.STAGING.ALLPROCESS',
        hsUpdateContactExchange: 'IN.STAGING.ALLPROCESS',
        hsUpdateContactRoutingKey: 'BATCH',
        hsAdhocQueue: 'IN.STAGING.ALLPROCESS',
        hsAdhocExchange: 'IN.STAGING.ALLPROCESS',
        hsAdhocRoutingKey: 'BATCH',
        sfCreateContactQueue: 'IN.STAGING.ALLPROCESS',
        sfCreateContactExchange: 'IN.STAGING.ALLPROCESS',
        sfCreateContactRoutingKey: 'BATCH',
        sfUpdateContactQueue: 'IN.STAGING.ALLPROCESS',
        sfUpdateContactExchange: 'IN.STAGING.ALLPROCESS',
        sfUpdateContactRoutingKey: 'BATCH',
        sfAdhocQueue: 'IN.STAGING.ALLPROCESS',
        sfAdhocExchange: 'IN.STAGING.ALLPROCESS',
        sfAdhocRoutingKey: 'BATCH',
        paveBulkCreatePropoposalQueue: 'IN.STAGING.ALLPROCESS',
        paveBulkCreateProposalExchange: 'IN.STAGING.ALLPROCESS',
        paveBulkCreatePropoposalRoutingKey: 'BATCH',
        paveCreateProposalQueue: 'IN.STAGING.ALLPROCESS',
        paveCreateProposalExchange: 'IN.STAGING.ALLPROCESS',
        paveCreateProposalRoutingKey: 'BATCH',
        whatsappWebhookQueue: 'IN.STAGING.ALLPROCESS',
        whatsappWebhookExchange: 'IN.STAGING.ALLPROCESS',
        whatsappWebhookRoutingKey: 'BATCH',
        paveBulkCreateMessageQueue: 'IN.STAGING.ALLPROCESS',
        paveBulkCreateMessageExchange: 'IN.STAGING.ALLPROCESS',
        paveBulkCreateMessageRoutingKey: 'BATCH',
        paveCreateMessageQueue: 'IN.STAGING.ALLPROCESS',
        paveCreateMessageExchange: 'IN.STAGING.ALLPROCESS',
        paveCreateMessageRoutingKey: 'BATCH',
        liveChatWebhookQueue: 'IN.STAGING.ALLPROCESS',
        liveChatWebhookExchange: 'IN.STAGING.ALLPROCESS',
        liveChatWebhookRoutingKey: 'BATCH',
        lineWebhookQueue: 'IN.STAGING.ALLPROCESS',
        lineWebhookExchange: 'IN.STAGING.ALLPROCESS',
        lineWebhookRoutingKey: 'BATCH',
        messengerWebhookQueue: 'IN.STAGING.ALLPROCESS',
        messengerWebhookExchange: 'IN.STAGING.ALLPROCESS',
        messengerWebhookRoutingKey: 'BATCH',
        bulkProcessLineCampaignQueue: 'IN.STAGING.ALLPROCESS',
        bulkProcessLineCampaignExchange: 'IN.STAGING.ALLPROCESS',
        bulkProcessLineCampaignRoutingKey: 'BATCH',
        sendLineCampaignQueue: 'IN.STAGING.ALLPROCESS',
        sendLineCampaignExchange: 'IN.STAGING.ALLPROCESS',
        sendLineCampaignRoutingKey: 'BATCH',
        csvContactListQueue:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_QUEUE ||
          'IN.STAGING.ALLPROCESS',
        csvContactListExchange:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_EXCHANGE ||
          'IN.STAGING.ALLPROCESS',
        csvContactListRoutingKey: 'BATCH',
        waOnboardingWebhookQueue: 'IN.STAGING.ALLPROCESS',
        waOnboardingWebhookRoutingKey: 'BATCH',
        appointmentBookingReminderQueue: 'IN.STAGING.ALLPROCESS',
        appointmentBookingReminderRoutingKey: 'BATCH',
        hbListContactListQueue:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_QUEUE ||
          'IN.STAGING.ALLPROCESS',
        hbListContactListExchange:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_EXCHANGE ||
          'IN.STAGING.ALLPROCESS',
        hbListContactListRoutingKey: 'BATCH',
        whatsappStatusWebhookQueue:
          process.env.WHATSAPP_STATUS_WEBHOOK_QUEUE || 'IN.STAGING.ALLPROCESS',
        whatsappStatusWebhookExchange:
          process.env.WHATSAPP_STATUS_WEBHOOK_EXCHANGE ||
          'IN.STAGING.ALLPROCESS',
        whatsappStatusWebhookRoutingKey: 'BATCH',
        wixWebhookQueue:
          process.env.WIX_WEBHOOK_QUEUE || 'IN.STAGING.ALLPROCESS',
        wixWebhookExchange:
          process.env.WIX_WEBHOOK_EXCHANGE || 'IN.STAGING.ALLPROCESS',
        wixWebhookRoutingKey: 'BATCH',
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    redis: {
      enabled: false,
    },
    gmail: {
      web: {
        client_id:
          '570902044484-j6r4sv1ctsn131sc5a78ga0jvcesfe8c.apps.googleusercontent.com',
        client_secret: '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',
        project_id: 'pave-platform',
        javascript_origins: 'https://staff-staging.yourpave.com',
      },
    },
    stripe: {
      secretKey:
        'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
      publishableKey:
        'pk_test_51Ig0yKIz3ID7iG8qBZxEb28UiwCBvD3SKTBkJ8l5oEQtXOSrrgnVRoJWjiEBiccHftNhnYTqQHo77K0xMw3ez04L00AJCBZoXk',
    },
    mindbody: {
      apiKey: 'ad52885b540d47ea961f5034e838b1ed',
      siteId: '-99',
      baseUrl: 'https://api.mindbodyonline.com/public/v6',
      webhookUrl: 'https://8fb7-122-54-90-10.ngrok-free.app',
    },

    pusher: {
      appId: '1642419',
      key: '28a0684ac386c4f40050',
      secret: '36bdb959a254dc1dfbde',
    },

    graphql: {
      endpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_key: 'da2-s43apfe6hrdlxhjcoy2tcwkica',
    },
    messenger: {
      client_id: '315343961336992',
      client_secret: '02173d79ca339ef83ab17902c2ac4be2',
    },
  },
  qa: {
    appName: 'Pave (QA)',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
    webAppName: 'Pave Webapp (QA)',
    webAppAdminName: 'Pave Webapp Admin (QA)',
    apiUrl: 'https://api-qa.yourpave.com',
    apiIntegrationsUrl: 'https://api-integrations-qa.yourpave.com',
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    webUrl: 'https://app-qa.yourpave.com',
    webAdminUrl: 'https://staff-qa.yourpave.com',
    jwt: {
      expirySecs: 31536000,
    },
    cdnUrls: ['https://cdn-qa.yourpave.com'],
    corsSettings: {
      api: {
        whitelistOrigins: [
          'https://app-qa.yourpave.com',
          '/*.app-qa.yourpave.com/',
          'https://staff-qa.yourpave.com',
          '(^|^[^:]+://|[^.]+.)chaaat.io(:d{1,5})?$',
          '(^|^[^:]+://|[^.]+.)yourpave.com(:d{1,5})?$',
          'https://partner-api.unificationengine.com',
          'https://partner.uib.ai/',
          'https://18.157.156.56/',
          'https://3.124.97.71/',
          'https://18.157.127.135/',
        ],
      },
    },
    googleAuth: {
      clientId:
        '964349112893-61alj67kh7lugfhfrarfgas8nudna8kl.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    transloadit: {
      imageOptimiseTemplateId: 'coming-soon',
    },
    component: {
      secret: 'gzrbE4e5VKzy6f3f',
    },
    newRelic: {
      licenseKey: '49443d1676957a5d211dd390f52473ea7f0fNRAL',
      appId: '1106908812',
    },
    directIntegrations: {
      hubspot: {
        clientId: '7be8ad03-d349-494e-b7ff-3df41bf3b219',
        clientSecret: '30f76cdb-fe16-46e0-84dd-581cab02342d',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms crm.objects.deals.read crm.objects.deals.write crm.lists.read',
        redirectUri:
          'https://staff-qa.chaaat.io/settings/hubspot-redirect-page',
      },
      salesforce: {
        clientId:
          '3MVG9pRzvMkjMb6l7eEi5gB_ZuR5rIBTEl1mBs1dkd9tkeYomyuodncIgBrj8ZOhveyNWNUPce7kmk5_KfGJs',
        clientSecret:
          '478EB9C4E9CFBFB6B2A590E1D49D48CEDFC4249D5D52A81971D9C3797DF23EB7',
        scope: 'api refresh_token offline_access cdp_query_api',
        redirectUri:
          'https://staff-qa.chaaat.io/settings/salesforce-redirect-page',
        webhookToken: 'bHARif6YEg',
      },
    },
    amq: {
      connection: {
        uri: 'amqps://root:J6Q9wAPQfB9zUJNY0JgM@b-7059e950-6c41-4ba6-b5ea-968bb5eb6fea.mq.ap-southeast-1.amazonaws.com:5671', // 'amqp://localhost'
        host: 'localhost',
        port: 5671,
        username: 'root',
        password: 'root',
      },
      keys: {
        componentQueue: 'IN.QA.ALLPROCESS',
        componentExchange: 'IN.QA.ALLPROCESS',
        componentRoutingKey: 'BATCH',
        hsBulkProcessQueue: 'IN.QA.ALLPROCESS',
        hsBulkProcessExchange: 'IN.QA.ALLPROCESS',
        hsBulkProcessRoutingKey: 'BATCH',
        hsCreateContactQueue: 'IN.QA.ALLPROCESS',
        hsCreateContactExchange: 'IN.QA.ALLPROCESS',
        hsCreateContactRoutingKey: 'BATCH',
        hsUpdateContactQueue: 'IN.QA.ALLPROCESS',
        hsUpdateContactExchange: 'IN.QA.ALLPROCESS',
        hsUpdateContactRoutingKey: 'BATCH',
        hsAdhocQueue: 'IN.QA.ALLPROCESS',
        hsAdhocExchange: 'IN.QA.ALLPROCESS',
        hsAdhocRoutingKey: 'BATCH',
        sfCreateContactQueue: 'IN.QA.ALLPROCESS',
        sfCreateContactExchange: 'IN.QA.ALLPROCESS',
        sfCreateContactRoutingKey: 'BATCH',
        sfUpdateContactQueue: 'IN.QA.ALLPROCESS',
        sfUpdateContactExchange: 'IN.QA.ALLPROCESS',
        sfUpdateContactRoutingKey: 'BATCH',
        sfAdhocQueue: 'IN.QA.ALLPROCESS',
        sfAdhocExchange: 'IN.QA.ALLPROCESS',
        sfAdhocRoutingKey: 'BATCH',
        paveBulkCreatePropoposalQueue:
          process.env.PAVE_BULK_CREATE_PROPOSAL_QUEUE ||
          'IN.QA.CreateProposalBulk',
        paveBulkCreateProposalExchange:
          process.env.PAVE_BULK_CREATE_PROPOSAL_EXCHANGE ||
          'IN.QA.CreateProposalBulk',
        paveBulkCreatePropoposalRoutingKey: 'BATCH',
        paveCreateProposalQueue:
          process.env.PAVE_CREATE_PROPOSAL_QUEUE || 'IN.QA.CreateProposal',
        paveCreateProposalExchange:
          process.env.PAVE_CREATE_PROPOSAL_EXCHANGE || 'IN.QA.CreateProposal',
        paveCreateProposalRoutingKey: 'BATCH',
        whatsappWebhookQueue:
          process.env.WHATSAPP_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
        whatsappWebhookExchange:
          process.env.WHATSAPP_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
        whatsappWebhookRoutingKey: 'BATCH',
        paveBulkCreateMessageQueue:
          process.env.PAVE_BULK_CREATE_MESSAGE_QUEUE || 'IN.QA.ALLPROCESS',
        paveBulkCreateMessageExchange:
          process.env.PAVE_BULK_CREATE_MESSAGE_EXCHANGE || 'IN.QA.ALLPROCESS',
        paveBulkCreateMessageRoutingKey: 'BATCH',
        paveCreateMessageQueue:
          process.env.PAVE_CREATE_MESSAGE_QUEUE || 'IN.QA.ALLPROCESS',
        paveCreateMessageExchange:
          process.env.PAVE_CREATE_MESSAGE_EXCHANGE || 'IN.QA.ALLPROCESS',
        paveCreateMessageRoutingKey: 'BATCH',
        liveChatWebhookQueue:
          process.env.LIVE_CHAT_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
        liveChatWebhookExchange:
          process.env.LIVE_CHAT_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
        lineWebhookQueue: process.env.LINE_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
        liveChatWebhookRoutingKey: 'BATCH',
        lineWebhookExchange:
          process.env.LINE_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
        lineWebhookRoutingKey: 'BATCH',
        messengerWebhookQueue:
          process.env.MESSENGER_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
        messengerWebhookExchange:
          process.env.MESSENGER_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
        messengerWebhookRoutingKey: 'BATCH',
        bulkProcessLineCampaignQueue:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_QUEUE ||
          'IN.QA.bulkProcessLineCampaign',
        bulkProcessLineCampaignExchange:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_EXCHANGE ||
          'IN.QA.bulkProcessLineCampaign',
        bulkProcessLineCampaignRoutingKey: 'BATCH',
        sendLineCampaignQueue:
          process.env.SEND_LINE_CAMPAIGN_QUEUE || 'IN.QA.sendLineCampaign',
        sendLineCampaignExchange:
          process.env.SEND_LINE_CAMPAIGN_EXCHANGE || 'IN.QA.sendLineCampaign',
        sendLineCampaignRoutingKey: 'BATCH',
        csvContactListQueue:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_QUEUE || 'IN.QA.ALLPROCESS',
        csvContactListExchange:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_EXCHANGE ||
          'IN.QA.ALLPROCESS',
        csvContactListRoutingKey: 'BATCH',
        waOnboardingWebhookQueue: 'IN.QA.ALLPROCESS',
        waOnboardingWebhookRoutingKey: 'BATCH',
        appointmentBookingReminderQueue: 'IN.QA.ALLPROCESS',
        appointmentBookingReminderRoutingKey: 'BATCH',
        hbListContactListQueue:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_QUEUE ||
          'IN.QA.ALLPROCESS',
        hbListContactListExchange:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_EXCHANGE ||
          'IN.QA.ALLPROCESS',
        hbListContactListRoutingKey: 'BATCH',
        whatsappStatusWebhookQueue:
          process.env.WHATSAPP_STATUS_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
        whatsappStatusWebhookExchange:
          process.env.WHATSAPP_STATUS_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
        whatsappStatusWebhookRoutingKey: 'BATCH',
        wixWebhookQueue: process.env.WIX_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
        wixWebhookExchange:
          process.env.WIX_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
        wixWebhookRoutingKey: 'BATCH',
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    redis: {
      enabled: false,
    },
    gmail: {
      web: {
        client_id:
          '570902044484-j6r4sv1ctsn131sc5a78ga0jvcesfe8c.apps.googleusercontent.com',
        client_secret: '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',
        project_id: 'pave-platform',
        javascript_origins: 'https://staff-qa.chaaat.io',
      },
    },
    stripe: {
      secretKey:
        'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
      publishableKey:
        'pk_test_51Ig0yKIz3ID7iG8qBZxEb28UiwCBvD3SKTBkJ8l5oEQtXOSrrgnVRoJWjiEBiccHftNhnYTqQHo77K0xMw3ez04L00AJCBZoXk',
    },
    mindbody: {
      apiKey: 'ad52885b540d47ea961f5034e838b1ed',
      siteId: '-99',
      baseUrl: 'https://api.mindbodyonline.com/public/v6',
      webhookUrl: 'https://8fb7-122-54-90-10.ngrok-free.app',
    },

    pusher: {
      appId: '1642419',
      key: '28a0684ac386c4f40050',
      secret: '36bdb959a254dc1dfbde',
    },

    graphql: {
      endpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_key: 'da2-s43apfe6hrdlxhjcoy2tcwkica',
    },
    messenger: {
      client_id: '315343961336992',
      client_secret: '02173d79ca339ef83ab17902c2ac4be2',
    },
  },
  production: {
    appName: 'Pave',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
    webAppName: 'Pave Webapp',
    webAppAdminName: 'Pave Webapp Admin',
    apiUrl: 'https://api.chaaat.io',
    apiIntegrationsUrl: 'https://api-integrations.chaaat.io',
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    webUrl: 'https://app.chaaat.io',
    webAdminUrl: 'https://staff.chaaat.io',
    jwt: {
      expirySecs: 31536000,
    },
    cdnUrls: ['https://cdn.yourpave.com'],
    corsSettings: {
      api: {
        whitelistOrigins: [
          'https://app.yourpave.com',
          '/*.yourpave.com/',
          'https://staff.yourpave.com',
          'https://livechat.yourpave.com',
          '(^|^[^:]+://|[^.]+.)yourpave.com(:d{1,5})?$',
          'https://app.chaaat.io',
          '/*.chaaat.io/',
          'https://staff.chaaat.io',
          'https://livechat.chaaat.io',
          '(^|^[^:]+://|[^.]+.)chaaat.io(:d{1,5})?$',
          'https://partner-api.unificationengine.com',
          'https://partner.uib.ai/',
          'https://18.157.156.56/',
          'https://3.124.97.71/',
          'https://18.157.127.135/',
          'https://chaaat.io',
        ],
      },
    },
    googleAuth: {
      clientId:
        '791976211822-mde937b4rs6t1dg6v0dbkes0ii7g9ig5.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    transloadit: {
      imageOptimiseTemplateId: 'coming-soon',
    },
    component: {
      secret: 'Wyfi1U68eqmzUGks',
    },
    newRelic: {
      licenseKey: '49443d1676957a5d211dd390f52473ea7f0fNRAL',
      appId: '1106510191',
    },
    directIntegrations: {
      hubspot: {
        clientId: 'efcde794-c28d-45f1-a400-b49b15f8a76e',
        clientSecret: '8152b04d-7359-4d99-a72b-effb454c50e9',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms crm.objects.deals.read crm.objects.deals.write crm.lists.read',
        redirectUri: 'https://staff.chaaat.io/settings/hubspot-redirect-page',
      },
      salesforce: {
        clientId:
          '3MVG9pRzvMkjMb6l7eEi5gB_ZuQXFJzsD77bT.y8ryJm0FL4M7U5jFZL.wIufunQeoO1tl7rs_vsqgUAXcsxg',
        clientSecret:
          '95C5AE3CE2855733E4CFE28C02B8577DE1958E424772687C521C423A1485EC43',
        scope: 'api refresh_token offline_access cdp_query_api',
        redirectUri:
          'https://staff.chaaat.io/settings/salesforce-redirect-page',
        webhookToken: '2eW260nX1Z',
      },
    },
    amq: {
      connection: {
        uri: 'amqps://root:L3Lc1deRUfaYzdG9w9KD@b-23a0a376-43d2-4381-b41c-49667c7bee13.mq.ap-southeast-1.amazonaws.com:5671',
        host: 'localhost',
        port: 5672,
        username: 'root',
        password: 'root',
      },
      keys: {
        componentQueue: process.env.COMPONENT_QUEUE || 'IN.PROD.ALLPROCESS',
        componentExchange:
          process.env.COMPONENT_EXCHANGE || 'IN.PROD.ALLPROCESS',
        componentRoutingKey: process.env.COMPONENT_ROUTING_KEY || 'BATCH',
        hsBulkProcessQueue:
          process.env.HS_CONTACT_PROCESSOR_QUEUE || 'IN.PROD.ALLPROCESS',
        hsBulkProcessExchange:
          process.env.HS_CONTACT_PROCESSOR_EXCHANGE || 'IN.PROD.ALLPROCESS',
        hsBulkProcessRoutingKey: 'BATCH',
        hsCreateContactQueue:
          process.env.HS_CREATE_CONTACT_QUEUE || 'IN.PROD.ALLPROCESS',
        hsCreateContactExchange: 'IN.PROD.ALLPROCESS',
        hsCreateContactRoutingKey:
          process.env.HS_CREATE_CONTACT_EXCHANGE || 'BATCH',
        hsUpdateContactQueue:
          process.env.HS_UPDATE_CONTACT_QUEUE || 'IN.PROD.ALLPROCESS',
        hsUpdateContactExchange:
          process.env.HS_UPDATE_CONTACT_EXCHANGE || 'IN.PROD.ALLPROCESS',
        hsUpdateContactRoutingKey: 'BATCH',
        hsAdhocQueue: process.env.HS_ADHOC_QUEUE || 'IN.PROD.ALLPROCESS',
        hsAdhocExchange: process.env.HS_ADHOC_EXCHANGE || 'IN.PROD.ALLPROCESS',
        hsAdhocRoutingKey: 'BATCH',
        sfCreateContactQueue:
          process.env.SF_CREATE_CONTACT_QUEUE || 'IN.PROD.ALLPROCESS',
        sfCreateContactExchange:
          process.env.SF_CREATE_CONTACT_EXCHANGE || 'IN.PROD.ALLPROCESS',
        sfCreateContactRoutingKey: 'BATCH',
        sfUpdateContactQueue:
          process.env.SF_UPDATE_CONTACT_QUEUE || 'IN.PROD.ALLPROCESS',
        sfUpdateContactExchange:
          process.env.SF_UPDATE_CONTACT_EXCHANGE || 'IN.PROD.ALLPROCESS',
        sfUpdateContactRoutingKey: 'BATCH',
        sfAdhocQueue: process.env.SF_UPDATE_ADHOC_QUEUE || 'IN.PROD.ALLPROCESS',
        sfAdhocExchange:
          process.env.SF_UPDATE_ADHOC_EXCHANGE || 'IN.PROD.ALLPROCESS',
        sfAdhocRoutingKey: 'BATCH',
        paveBulkCreatePropoposalQueue:
          process.env.PAVE_BULK_CREATE_PROPOSAL_QUEUE ||
          'IN.PROD.CreateProposalBulk',
        paveBulkCreateProposalExchange:
          process.env.PAVE_BULK_CREATE_PROPOSAL_EXCHANGE ||
          'IN.PROD.CreateProposalBulk',
        paveBulkCreatePropoposalRoutingKey: 'BATCH',
        paveCreateProposalQueue:
          process.env.PAVE_CREATE_PROPOSAL_QUEUE || 'IN.PROD.CreateProposal',
        paveCreateProposalExchange:
          process.env.PAVE_CREATE_PROPOSAL_EXCHANGE || 'IN.PROD.CreateProposal',
        paveCreateProposalRoutingKey: 'BATCH',
        whatsappWebhookQueue:
          process.env.WHATSAPP_WEBHOOK_QUEUE || 'IN.PROD.WhatsappWebhook',
        whatsappWebhookExchange:
          process.env.WHATSAPP_WEBHOOK_EXCHANGE || 'IN.PROD.WhatsappWebhook',
        whatsappWebhookRoutingKey: 'BATCH',
        paveBulkCreateMessageQueue:
          process.env.PAVE_BULK_CREATE_MESSAGE_QUEUE || 'IN.PROD.ALLPROCESS',
        paveBulkCreateMessageExchange:
          process.env.PAVE_BULK_CREATE_MESSAGE_EXCHANGE || 'IN.PROD.ALLPROCESS',
        paveBulkCreateMessageRoutingKey: 'BATCH',
        paveCreateMessageQueue:
          process.env.PAVE_CREATE_MESSAGE_QUEUE || 'IN.PROD.ALLPROCESS',
        paveCreateMessageExchange:
          process.env.PAVE_CREATE_MESSAGE_EXCHANGE || 'IN.PROD.ALLPROCESS',
        paveCreateMessageRoutingKey: 'BATCH',
        liveChatWebhookQueue:
          process.env.LIVE_CHAT_WEBHOOK_QUEUE || 'IN.PROD.LiveChatWebhook',
        liveChatWebhookExchange:
          process.env.LIVE_CHAT_WEBHOOK_EXCHANGE || 'IN.PROD.LiveChatWebhook',
        liveChatWebhookRoutingKey: 'BATCH',
        lineWebhookQueue:
          process.env.LINE_WEBHOOK_QUEUE || 'IN.PROD.LineWebhook',
        lineWebhookExchange:
          process.env.LINE_WEBHOOK_EXCHANGE || 'IN.PROD.LineWebhook',
        lineWebhookRoutingKey: 'BATCH',
        messengerWebhookQueue:
          process.env.MESSENGER_WEBHOOK_QUEUE || 'IN.PROD.MessengerWebhook',
        messengerWebhookExchange:
          process.env.MESSENGER_WEBHOOK_EXCHANGE || 'IN.PROD.MessengerWebhook',
        messengerWebhookRoutingKey: 'BATCH',
        bulkProcessLineCampaignQueue:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_QUEUE ||
          'IN.PROD.BulkProcessLineCampaign',
        bulkProcessLineCampaignExchange:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_EXCHANGE ||
          'IN.PROD.BulkProcessLineCampaign',
        bulkProcessLineCampaignRoutingKey: 'BATCH',
        sendLineCampaignQueue:
          process.env.SEND_LINE_CAMPAIGN_QUEUE || 'IN.PROD.SendLineCampaign',
        sendLineCampaignExchange:
          process.env.SEND_LINE_CAMPAIGN_EXCHANGE || 'IN.PROD.SendLineCampaign',
        sendLineCampaignRoutingKey: 'BATCH',
        csvContactListQueue:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_QUEUE ||
          'IN.PROD.ALLPROCESS',
        csvContactListExchange:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_EXCHANGE ||
          'IN.PROD.ALLPROCESS',
        csvContactListRoutingKey: 'BATCH',
        waOnboardingWebhookQueue:
          process.env.WA_ONBOARDING_WEBHOOK_QUEUE || 'IN.PROD.ALLPROCESS',
        waOnboardingWebhookRoutingKey: 'BATCH',
        appointmentBookingReminderQueue:
          process.env.APPOINTMENT_BOOKING_REMINDER_QUEUE ||
          'IN.PROD.AppointmentBookingReminder',
        appointmentBookingReminderRoutingKey: 'BATCH',
        hbListContactListQueue:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_QUEUE ||
          'IN.PROD.ALLPROCESS',
        hbListContactListExchange:
          process.env.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD_EXCHANGE ||
          'IN.PROD.ALLPROCESS',
        hbListContactListRoutingKey: 'BATCH',
        whatsappStatusWebhookQueue:
          process.env.WHATSAPP_STATUS_WEBHOOK_QUEUE ||
          'IN.PROD.WhatsappStatusWebhook',
        whatsappStatusWebhookExchange:
          process.env.WHATSAPP_STATUS_WEBHOOK_EXCHANGE ||
          'IN.PROD.WhatsappStatusWebhook',
        whatsappStatusWebhookRoutingKey: 'BATCH',
        wixWebhookQueue: process.env.WIX_WEBHOOK_QUEUE || 'IN.PROD.ALLPROCESS',
        wixWebhookExchange:
          process.env.WIX_WEBHOOK_EXCHANGE || 'IN.PROD.ALLPROCESS',
        wixWebhookRoutingKey: 'BATCH',
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      port: 6379,
      host: process.env.REDIS_HOST,
      db: Number(process.env.REDIS_DB) || 0,
      password: process.env.REDIS_PASSWORD,
      url: null,
      connectTimeout: Number(process.env.REDIS_TIMEOUT) || 10000,
    },
    gmail: {
      web: {
        client_id:
          '570902044484-j6r4sv1ctsn131sc5a78ga0jvcesfe8c.apps.googleusercontent.com',
        client_secret: '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',
        project_id: 'pave-platform',
        javascript_origins: 'https://staff.chaaat.io',
      },
    },
    stripe: {
      secretKey:
        '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',
      publishableKey:
        'pk_live_51Ig0yKIz3ID7iG8qN8lZ8dbQbyMO5pkdD9n5dQ0099OYHdDuCQlPTNBc6yhy7R0BGuIamzoivNZ3T1ASoZvW70h300dlFc7qH2',
    },
    mindbody: {
      apiKey: 'af3e50c8a81142e3bddee68845373a38',
      siteId: '5725040',
      baseUrl: 'https://api.mindbodyonline.com/public/v6',
      webhookUrl: 'https://api.chaaat.io',
    },

    pusher: {
      appId: '1642419',
      key: '28a0684ac386c4f40050',
      secret: '36bdb959a254dc1dfbde',
    },

    graphql: {
      endpoint:
        'https://ppj3476yybfdjeole445qz75pe.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_id: 'b2nbl3im4rehzlr6vsafsyyxza',
      api_key: 'da2-okfua7ksj5hijar5kich5xxwoy',
    },
    messenger: {
      client_id: '315343961336992',
      client_secret: '02173d79ca339ef83ab17902c2ac4be2',
    },
  },
};
/**
 * @param {string} [environment="development"]
 * @returns {*}
 */
module.exports = (environment = 'development') => {
  return config[environment];
};
