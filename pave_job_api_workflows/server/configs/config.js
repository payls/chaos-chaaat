const config = {
  development: {
    appName: 'Pave Integrations (Development)',
    apiUrl: 'http://localhost:3110',
    apiIntegrationsUrl: 'http://localhost:3113',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    webUrl: 'http://localhost:3111',
    webAdminUrl: 'http://localhost:3112',
    jwt: {
      expirySecs: 31536000,
    },
    cdnUrls: ['https://cdn-staging.yourpave.com'],
    corsSettings: {
      api: {
        whitelistOrigins: [
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
        ],
      },
    },
    googleAuth: {
      clientId:
        '964349112893-7hhrl6ht92mj7osev54jvd9p081ijucl.apps.googleusercontent.com',
    },
    googleCalendar: {
      redirectUri:
        'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http://localhost:3112/settings/google-redirect&client_id=121800118665-t4abml92j5dfuqtidmfqafd68eb66nov.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    tray: {
      hubspot: 'c88b96d4-ca15-4a5d-946c-042cf5078ea7',
      gmail: 'f51720f5-b5a4-4b13-bb82-42e29d825262',
      outlook: '10de2e45-bd74-4676-a7e7-26194e7cc0f5',
      salesforce: '78eff761-ce14-46dd-82c4-9e32cd72cd42',
    },
    trayWebhookWorkflowNames: {
      hubspot: {
        fullSync: 'Dev - Get All Contacts - Pave',
        createEngagements: 'Dev - Create Engagements',
      },
      gmail: {
        sendEmail: 'Dev - (Gmail) Send Email - Pave',
      },
      outlook: {
        sendEmail: 'Dev - (MS365) Send Email - Pave',
      },
      salesforce: {
        fullSync: 'Dev - Get All Contacts - Pave',
        createEngagements: 'Dev - Create Engagements - Pave',
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
        componentQueue: process.env.COMPONENT_QUEUE || 'IN.LOCAL.ALLPROCESS',
        componentExchange:
          process.env.COMPONENT_EXCHANGE || 'IN.LOCAL.ALLPROCESS',
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
        sfCronTriggerQueue: 'IN.LOCAL.ALLPROCESS',
        sfCronTriggerExchange: 'IN.LOCAL.ALLPROCESS',
        sfCronTriggerRoutingKey: 'BATCH',
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
      },
      prefetch: Number(process.env.AMQ_PREFETCH_COUNT) || 1,
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    graphql: {
      endpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_key: 'da2-s43apfe6hrdlxhjcoy2tcwkica',
    },
    wix: {
      appId: '18f8cb1b-88bf-4495-8b88-c331625348b6',
      clientSecret: '9a234bb5-7498-49f7-abd0-e7a8758aa7b7',
      publicKey: `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA12OJlV13V7aTi1uswkIN
        LCWgZggVb27ywouryajYScr3C263P79S8vZU6mI89VNgj/W2vFFg3VBnD2i/4bU7
        yrLJ40RceQiQ2RpvytaH8LXFKKXHazGstvgj7tTHBqodJcjyf+iM4+FcyR82qUUm
        oD8PKUIxbbIhCGgEvHjFy1qHtaOQSs/ZVnZB3oBhM45jll4ix4ppEdAUzKqU5Z0y
        KlA5fBkG1z8OpJf/llOuvke5QFjaen+fyVxn+6dilVq6HtMAiB8pGgBURmTGyqLf
        iTW4ekYI7cZpC1TlA7k+FnLo6DyGSvjkivAe8n2ICLcFrWSIdWeBzEOhEbTZgrMH
        4QIDAQAB
        -----END PUBLIC KEY-----`,
    },
  },
  staging: {
    appName: 'Pave Integrations (Staging)',
    apiUrl: 'https://api-staging.chaaat.io',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
    apiIntegrationsUrl: 'https://api-integrations-staging.chaaat.io',
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
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
          'https://app-staging.yourpave.com',
          '/*.app-staging.yourpave.com/',
          'https://staff-staging.yourpave.com',
          'http://localhost:3115', // For Cypress tests
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
        '791976211822-eu3474bvqf8gasrkfun8e4ntf7uqrtjc.apps.googleusercontent.com',
    },
    googleCalendar: {
      redirectUri:
        'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=https://staff-staging.chaaat.io/settings/google-redirect&client_id=121800118665-t4abml92j5dfuqtidmfqafd68eb66nov.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    tray: {
      hubspot: '1c7a7525-0ea8-469f-99e9-eedf39b55f61',
      gmail: '49a66fb2-08b8-40d9-ad03-d968fc4058ec',
      outlook: 'f30be151-496f-43f0-92d0-844f1f095f81',
      salesforce: 'af6bee04-756d-4504-aaee-bdf94c09545e',
    },
    trayWebhookWorkflowNames: {
      hubspot: {
        fullSync: 'Get All Contacts - Pave',
        createEngagements: 'Create Engagements',
      },
      gmail: {
        sendEmail: '(Gmail) Send Email - Pave',
      },
      outlook: {
        sendEmail: '(MS365) Send Email - Pave',
      },
      salesforce: {
        fullSync: 'Get All Contacts - Pave',
        createEngagements: 'Create Engagements - Pave',
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
      },
      prefetch: Number(process.env.AMQ_PREFETCH_COUNT) || 1,
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    graphql: {
      endpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_key: 'da2-s43apfe6hrdlxhjcoy2tcwkica',
    },
    wix: {
      appId: '18f8cb1b-88bf-4495-8b88-c331625348b6',
      clientSecret: '9a234bb5-7498-49f7-abd0-e7a8758aa7b7',
      publicKey: `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA12OJlV13V7aTi1uswkIN
        LCWgZggVb27ywouryajYScr3C263P79S8vZU6mI89VNgj/W2vFFg3VBnD2i/4bU7
        yrLJ40RceQiQ2RpvytaH8LXFKKXHazGstvgj7tTHBqodJcjyf+iM4+FcyR82qUUm
        oD8PKUIxbbIhCGgEvHjFy1qHtaOQSs/ZVnZB3oBhM45jll4ix4ppEdAUzKqU5Z0y
        KlA5fBkG1z8OpJf/llOuvke5QFjaen+fyVxn+6dilVq6HtMAiB8pGgBURmTGyqLf
        iTW4ekYI7cZpC1TlA7k+FnLo6DyGSvjkivAe8n2ICLcFrWSIdWeBzEOhEbTZgrMH
        4QIDAQAB
        -----END PUBLIC KEY-----`,
    },
  },
  qa: {
    appName: 'Pave Integrations (QA)',
    apiUrl: 'https://api-qa.yourpave.com',
    apiIntegrationsUrl: 'https://api-integrations-qa.yourpave.com',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
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
    googleCalendar: {
      redirectUri:
        'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=https://staff-qa.chaaat.io/settings/google-redirect&client_id=121800118665-t4abml92j5dfuqtidmfqafd68eb66nov.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    tray: {
      hubspot: '1c7a7525-0ea8-469f-99e9-eedf39b55f61',
      gmail: '49a66fb2-08b8-40d9-ad03-d968fc4058ec',
      outlook: 'f30be151-496f-43f0-92d0-844f1f095f81',
      salesforce: 'af6bee04-756d-4504-aaee-bdf94c09545e',
    },
    trayWebhookWorkflowNames: {
      hubspot: {
        fullSync: 'Get All Contacts - Pave',
        createEngagements: 'Create Engagements',
      },
      gmail: {
        sendEmail: '(Gmail) Send Email - Pave',
      },
      outlook: {
        sendEmail: '(MS365) Send Email - Pave',
      },
      salesforce: {
        fullSync: 'Get All Contacts - Pave',
        createEngagements: 'Create Engagements - Pave',
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
          'https://staff-qa.yourpave.com/settings/hubspot-redirect-page',
      },
      salesforce: {
        clientId:
          '3MVG9pRzvMkjMb6l7eEi5gB_ZuR5rIBTEl1mBs1dkd9tkeYomyuodncIgBrj8ZOhveyNWNUPce7kmk5_KfGJs',
        clientSecret:
          '478EB9C4E9CFBFB6B2A590E1D49D48CEDFC4249D5D52A81971D9C3797DF23EB7',
        scope: 'api refresh_token offline_access cdp_query_api',
        redirectUri:
          'https://staff-qa.yourpave.com/settings/salesforce-redirect-page',
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
        sfCronTriggerQueue: 'IN.QA.ALLPROCESS',
        sfCronTriggerExchange: 'IN.QA.ALLPROCESS',
        sfCronTriggerRoutingKey: 'BATCH',
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
        liveChatWebhookRoutingKey: 'BATCH',
        lineWebhookQueue: process.env.LINE_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
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
      },
      prefetch: Number(process.env.AMQ_PREFETCH_COUNT) || 1,
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    graphql: {
      endpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_key: 'da2-s43apfe6hrdlxhjcoy2tcwkica',
    },
    wix: {
      appId: '18f8cb1b-88bf-4495-8b88-c331625348b6',
      clientSecret: '9a234bb5-7498-49f7-abd0-e7a8758aa7b7',
      publicKey: `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA12OJlV13V7aTi1uswkIN
        LCWgZggVb27ywouryajYScr3C263P79S8vZU6mI89VNgj/W2vFFg3VBnD2i/4bU7
        yrLJ40RceQiQ2RpvytaH8LXFKKXHazGstvgj7tTHBqodJcjyf+iM4+FcyR82qUUm
        oD8PKUIxbbIhCGgEvHjFy1qHtaOQSs/ZVnZB3oBhM45jll4ix4ppEdAUzKqU5Z0y
        KlA5fBkG1z8OpJf/llOuvke5QFjaen+fyVxn+6dilVq6HtMAiB8pGgBURmTGyqLf
        iTW4ekYI7cZpC1TlA7k+FnLo6DyGSvjkivAe8n2ICLcFrWSIdWeBzEOhEbTZgrMH
        4QIDAQAB
        -----END PUBLIC KEY-----`,
    },
  },
  production: {
    appName: 'Pave Integrations',
    apiUrl: 'https://api.chaaat.io',
    apiIntegrationsUrl: 'https://api-integrations.chaaat.io',
    aws: {
      region: 'ap-southeast-1',
      secretsManager: {
        encryptionKeySecret: 'chaaat-encryption-keys',
      },
    },
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
          'https://app.chaaat.io',
          'https://app.yourpave.com',
          '/*.chaaat.io/',
          '/*.yourpave.com/',
          'https://staff.chaaat.io',
          'https://livechat.chaaat.io',
          'https://staff.yourpave.com',
          'https://livechat.yourpave.com',
          '(^|^[^:]+://|[^.]+.)yourpave.com(:d{1,5})?$',
          '(^|^[^:]+://|[^.]+.)chaaat.io(:d{1,5})?$',
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
        '964349112893-l02v9n25nrn0hris1aunhvsr238ts3hg.apps.googleusercontent.com',
    },
    googleCalendar: {
      redirectUri:
        'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=https://staff.chaaat.io/settings/google-redirect&client_id=121800118665-t4abml92j5dfuqtidmfqafd68eb66nov.apps.googleusercontent.com',
    },
    facebookAuth: {
      appId: '244944790716805',
      appSecret: 'c8c1e13561b738efcc3f6aab24ae24e4',
      api: {
        generateAccessToken: 'https://graph.facebook.com/oauth/access_token',
        inspectAccessToken: 'https://graph.facebook.com/debug_token',
      },
    },
    tray: {
      hubspot: '1c7a7525-0ea8-469f-99e9-eedf39b55f61',
      gmail: '49a66fb2-08b8-40d9-ad03-d968fc4058ec',
      outlook: 'f30be151-496f-43f0-92d0-844f1f095f81',
      salesforce: 'af6bee04-756d-4504-aaee-bdf94c09545e',
    },
    trayWebhookWorkflowNames: {
      hubspot: {
        fullSync: 'Get All Contacts - Pave',
        createEngagements: 'Create Engagements',
      },
      gmail: {
        sendEmail: '(Gmail) Send Email - Pave',
      },
      outlook: {
        sendEmail: '(MS365) Send Email - Pave',
      },
      salesforce: {
        fullSync: 'Get All Contacts - Pave',
        createEngagements: 'Create Engagements - Pave',
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
        componentRoutingKey: 'BATCH',
        hsBulkProcessQueue: 'IN.PROD.ALLPROCESS',
        hsBulkProcessExchange: 'IN.PROD.ALLPROCESS',
        hsBulkProcessRoutingKey: 'BATCH',
        hsCreateContactQueue: 'IN.PROD.ALLPROCESS',
        hsCreateContactExchange: 'IN.PROD.ALLPROCESS',
        hsCreateContactRoutingKey: 'BATCH',
        hsUpdateContactQueue: 'IN.PROD.ALLPROCESS',
        hsUpdateContactExchange: 'IN.PROD.ALLPROCESS',
        hsUpdateContactRoutingKey: 'BATCH',
        hsAdhocQueue: 'IN.PROD.ALLPROCESS',
        hsAdhocExchange: 'IN.PROD.ALLPROCESS',
        hsAdhocRoutingKey: 'BATCH',
        sfCreateContactQueue: 'IN.PROD.ALLPROCESS',
        sfCreateContactExchange: 'IN.PROD.ALLPROCESS',
        sfCreateContactRoutingKey: 'BATCH',
        sfUpdateContactQueue: 'IN.PROD.ALLPROCESS',
        sfUpdateContactExchange: 'IN.PROD.ALLPROCESS',
        sfUpdateContactRoutingKey: 'BATCH',
        sfAdhocQueue: 'IN.PROD.ALLPROCESS',
        sfAdhocExchange: 'IN.PROD.ALLPROCESS',
        sfAdhocRoutingKey: 'BATCH',
        sfCronTriggerQueue: 'IN.PROD.ALLPROCESS',
        sfCronTriggerExchange: 'IN.PROD.ALLPROCESS',
        sfCronTriggerRoutingKey: 'BATCH',
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
      },
      prefetch: Number(process.env.AMQ_PREFETCH_COUNT) || 1,
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    graphql: {
      endpoint:
        'https://ppj3476yybfdjeole445qz75pe.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      api_key: 'da2-okfua7ksj5hijar5kich5xxwoy',
    },
    wix: {
      appId: 'a8914b5a-3a8f-4ce4-a5c4-927d85376e7a',
      clientSecret: 'b40cbf03-21b5-494b-94e7-4d5d42e8f5db',
      publicKey: `-----BEGIN PUBLIC KEY-----
          MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA00ZSBBcmU5FOfcdQ2xu5
          qZBGo0J0C/iP5S5Pwh2XLhwxIAjjVguW/UM8XaeBg2fpqdi3Ph5HnTWhlN3FtDBf
          tuvuZUDF2yPrKXYXtXebXUalZZECuxULu13JXSkR5wWuqhLSmEimwMgwWg64gQyG
          W4xlkB9gABPUCWeJdJ9wHq4FBfl80uT2QhVBnNHXIP0njfEu0xI73t5wGcwdRefF
          iFg0VxWSFLJ1MAmaAuEKUzmB8OynJhL9dqxW46e7cPE7pvUvdjcscMmJeaBsmX4l
          AcDPVdZ/b0cCDB/5frN4aWHvgiq70qBf55nhaClr/AMAVDxwuYETeWV8EVqUZkxG
          iwIDAQAB
          -----END PUBLIC KEY-----`,
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
