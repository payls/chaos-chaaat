const config = {
  development: {
    appName: 'Pave (Development)',
    secretManager: {
      paveSecret: '',
    },
    apiUrl: 'http://localhost:3110',
    apiIntegrationsUrl: 'http://localhost:3113',
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
        ],
      },
    },
    googleAuth: {
      clientId:
        '964349112893-7hhrl6ht92mj7osev54jvd9p081ijucl.apps.googleusercontent.com',
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
        uri: 'amqp://root:root@172.17.0.2:5672', // 'amqp://localhost'
        host: '172.17.0.2',
        port: 5672,
        username: 'root',
        password: 'root',
      },
      keys: {
        componentQueue: process.env.COMPONENT_QUEUE || 'IN.LOCAL.ALLPROCESS',
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
        appointmentBookingReminderQueue: 'IN.LOCAL.ALLPROCESS',
        appointmentBookingReminderRoutingKey: 'BATCH',
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
    stripe: {
      secretKey:
        'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
      publishableKey:
        'pk_test_51Ig0yKIz3ID7iG8qBZxEb28UiwCBvD3SKTBkJ8l5oEQtXOSrrgnVRoJWjiEBiccHftNhnYTqQHo77K0xMw3ez04L00AJCBZoXk',
    },
  },
  staging: {
    appName: 'Pave (Staging)',
    secretManager: {
      paveSecret:
        'arn:aws:secretsmanager:ap-southeast-1:464186511763:secret:staging/pave/secret-S5kR72',
    },
    apiUrl: 'https://api-staging.yourpave.com',
    apiIntegrationsUrl: 'https://api-integrations-staging.yourpave.com',
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    webUrl: 'https://app-staging.yourpave.com',
    webAdminUrl: 'https://staff-staging.yourpave.com',
    jwt: {
      expirySecs: 31536000,
    },
    cdnUrls: ['https://cdn-staging.yourpave.com'],
    corsSettings: {
      api: {
        whitelistOrigins: [
          'https://app-staging.yourpave.com',
          '/*.app-staging.yourpave.com/',
          'https://staff-staging.chaaat.io',
          'https://app-staging.yourpave.com',
          '/*.app-staging.yourpave.com/',
          'https://staff-staging.yourpave.com',
        ],
      },
    },
    googleAuth: {
      clientId:
        '791976211822-eu3474bvqf8gasrkfun8e4ntf7uqrtjc.apps.googleusercontent.com',
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
        appointmentBookingReminderQueue: 'IN.STAGING.ALLPROCESS',
        appointmentBookingReminderRoutingKey: 'BATCH',
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
    stripe: {
      secretKey:
        'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
      publishableKey:
        'pk_test_51Ig0yKIz3ID7iG8qBZxEb28UiwCBvD3SKTBkJ8l5oEQtXOSrrgnVRoJWjiEBiccHftNhnYTqQHo77K0xMw3ez04L00AJCBZoXk',
    },
  },
  booking: {
    appName: 'Pave (Staging)',
    secretManager: {
      paveSecret:
        'arn:aws:secretsmanager:ap-southeast-1:464186511763:secret:staging/pave/secret-S5kR72',
    },
    apiUrl: 'https://api-dev.chaaat.io',
    apiIntegrationsUrl: 'https://api-integrations-dev.chaaat.io',
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    webUrl: 'https://webapp-dev.chaaat.io',
    webAdminUrl: 'https://webapp-admin-dev.chaaat.io',
    jwt: {
      expirySecs: 31536000,
    },
    cdnUrls: ['https://cdn-staging.yourpave.com'],
    corsSettings: {
      api: {
        whitelistOrigins: [
          'https://app-staging.yourpave.com',
          '/*.app-staging.yourpave.com/',
          'https://staff-staging.chaaat.io',
          'https://app-staging.yourpave.com',
          '/*.app-staging.yourpave.com/',
          'https://staff-staging.yourpave.com',
          'https://webapp-admin-dev.chaaat.io',
          'https://webapp-dev.chaaat.io',
          'https://api-integrations-dev.chaaat.io',
          'https://api-dev.chaaat.io',
        ],
      },
    },
    googleAuth: {
      clientId:
        '791976211822-eu3474bvqf8gasrkfun8e4ntf7uqrtjc.apps.googleusercontent.com',
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
    directIntegrations: {
      hubspot: {
        clientId: '7be8ad03-d349-494e-b7ff-3df41bf3b219',
        clientSecret: '30f76cdb-fe16-46e0-84dd-581cab02342d',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms',
        redirectUri:
          'https://webapp-dev.chaaat.io/settings/hubspot-redirect-page',
      },
      salesforce: {
        clientId:
          '3MVG9pRzvMkjMb6l7eEi5gB_ZuZlVZj8ALujptGapfUdu6zZEoCFW0UU3wPNuDfuQwomnTSUD278sIMa2avPZ',
        clientSecret:
          '1F5998FB25EBB9CB345AFF5944BE15C25379DCE71C3CEED5E283DE3D7CF6AEBE',
        scope: 'api refresh_token offline_access cdp_query_api',
        redirectUri:
          'https://webapp-dev.chaaat.io/settings/salesforce-redirect-page',
        webhookToken: 'secret',
      },
    },
    amq: {
      connection: {
        uri: 'amqps://root:Ka5Ji97Mtexp4q1yhXAA@b-ab6ae440-8e2e-442a-ac32-a75fa78a71e8.mq.ap-southeast-1.amazonaws.com:5671', // 'amqp://localhost'
        host: 'localhost',
        port: 5671,
        username: 'root',
        password: 'root',
      },
      keys: {
        componentQueue: 'IN.DEMO.ALLPROCESS',
        componentExchange: 'IN.DEMO.ALLPROCESS',
        componentRoutingKey: 'BATCH',
        hsBulkProcessQueue: 'IN.DEMO.ALLPROCESS',
        hsBulkProcessExchange: 'IN.DEMO.ALLPROCESS',
        hsBulkProcessRoutingKey: 'BATCH',
        hsCreateContactQueue: 'IN.DEMO.ALLPROCESS',
        hsCreateContactExchange: 'IN.DEMO.ALLPROCESS',
        hsCreateContactRoutingKey: 'BATCH',
        hsUpdateContactQueue: 'IN.DEMO.ALLPROCESS',
        hsUpdateContactExchange: 'IN.DEMO.ALLPROCESS',
        hsUpdateContactRoutingKey: 'BATCH',
        hsAdhocQueue: 'IN.DEMO.ALLPROCESS',
        hsAdhocExchange: 'IN.DEMO.ALLPROCESS',
        hsAdhocRoutingKey: 'BATCH',
        sfCreateContactQueue: 'IN.DEMO.ALLPROCESS',
        sfCreateContactExchange: 'IN.DEMO.ALLPROCESS',
        sfCreateContactRoutingKey: 'BATCH',
        sfUpdateContactQueue: 'IN.DEMO.ALLPROCESS',
        sfUpdateContactExchange: 'IN.DEMO.ALLPROCESS',
        sfUpdateContactRoutingKey: 'BATCH',
        sfAdhocQueue: 'IN.DEMO.ALLPROCESS',
        sfAdhocExchange: 'IN.DEMO.ALLPROCESS',
        sfAdhocRoutingKey: 'BATCH',
        paveBulkCreatePropoposalQueue:
          process.env.PAVE_BULK_CREATE_PROPOSAL_QUEUE || 'IN.DEMO.ALLPROCESS',
        paveBulkCreateProposalExchange:
          process.env.PAVE_BULK_CREATE_PROPOSAL_EXCHANGE ||
          'IN.DEMO.ALLPROCESS',
        paveBulkCreatePropoposalRoutingKey: 'BATCH',
        paveCreateProposalQueue:
          process.env.PAVE_CREATE_PROPOSAL_QUEUE || 'IN.DEMO.ALLPROCESS',
        paveCreateProposalExchange:
          process.env.PAVE_CREATE_PROPOSAL_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        paveCreateProposalRoutingKey: 'BATCH',
        whatsappWebhookQueue:
          process.env.WHATSAPP_WEBHOOK_QUEUE || 'IN.DEMO.ALLPROCESS',
        whatsappWebhookExchange:
          process.env.WHATSAPP_WEBHOOK_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        whatsappWebhookRoutingKey: 'BATCH',
        paveBulkCreateMessageQueue:
          process.env.PAVE_BULK_CREATE_MESSAGE_QUEUE || 'IN.DEMO.ALLPROCESS',
        paveBulkCreateMessageExchange:
          process.env.PAVE_BULK_CREATE_MESSAGE_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        paveBulkCreateMessageRoutingKey: 'BATCH',
        paveCreateMessageQueue:
          process.env.PAVE_CREATE_MESSAGE_QUEUE || 'IN.DEMO.ALLPROCESS',
        paveCreateMessageExchange:
          process.env.PAVE_CREATE_MESSAGE_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        paveCreateMessageRoutingKey: 'BATCH',
        liveChatWebhookQueue:
          process.env.LIVE_CHAT_WEBHOOK_QUEUE || 'IN.DEMO.ALLPROCESS',
        liveChatWebhookExchange:
          process.env.LIVE_CHAT_WEBHOOK_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        liveChatWebhookRoutingKey: 'BATCH',
        lineWebhookQueue:
          process.env.LINE_WEBHOOK_QUEUE || 'IN.DEMO.ALLPROCESS',
        lineWebhookExchange:
          process.env.LINE_WEBHOOK_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        lineWebhookRoutingKey: 'BATCH',
        messengerWebhookQueue:
          process.env.MESSENGER_WEBHOOK_QUEUE || 'IN.DEMO.ALLPROCESS',
        messengerWebhookExchange:
          process.env.MESSENGER_WEBHOOK_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        messengerWebhookRoutingKey: 'BATCH',
        bulkProcessLineCampaignQueue:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_QUEUE || 'IN.DEMO.ALLPROCESS',
        bulkProcessLineCampaignExchange:
          process.env.BULK_PROCESS_LINE_CAMPAIGN_EXCHANGE ||
          'IN.DEMO.ALLPROCESS',
        bulkProcessLineCampaignRoutingKey: 'BATCH',
        sendLineCampaignQueue:
          process.env.SEND_LINE_CAMPAIGN_QUEUE || 'IN.DEMO.ALLPROCESS',
        sendLineCampaignExchange:
          process.env.SEND_LINE_CAMPAIGN_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        sendLineCampaignRoutingKey: 'BATCH',
        csvContactListQueue:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_QUEUE ||
          'IN.DEMO.ALLPROCESS',
        csvContactListExchange:
          process.env.CONTACT_LIST_FROM_CSV_UPLOAD_EXCHANGE ||
          'IN.DEMO.ALLPROCESS',
        csvContactListRoutingKey: 'BATCH',
        waOnboardingWebhookQueue:
          process.env.WA_ONBOARDING_WEBHOOK_QUEUE || 'IN.DEMO.ALLPROCESS',
        waOnboardingWebhookRoutingKey: 'BATCH',
        whatsappStatusWebhookQueue:
          process.env.WHATSAPP_STATUS_WEBHOOK_QUEUE || 'IN.DEMO.ALLPROCESS',
        whatsappStatusWebhookExchange:
          process.env.WHATSAPP_STATUS_WEBHOOK_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        whatsappStatusWebhookRoutingKey: 'BATCH',
        wixWebhookQueue: process.env.WIX_WEBHOOK_QUEUE || 'IN.DEMO.ALLPROCESS',
        wixWebhookExchange:
          process.env.WIX_WEBHOOK_EXCHANGE || 'IN.DEMO.ALLPROCESS',
        wixWebhookRoutingKey: 'BATCH',
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    stripe: {
      secretKey:
        'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
      publishableKey:
        'pk_test_51Ig0yKIz3ID7iG8qBZxEb28UiwCBvD3SKTBkJ8l5oEQtXOSrrgnVRoJWjiEBiccHftNhnYTqQHo77K0xMw3ez04L00AJCBZoXk',
    },
  },
  qa: {
    appName: 'Pave (QA)',
    secretManager: {
      paveSecret:
        'arn:aws:secretsmanager:ap-southeast-1:004391475553:secret:qa/pave/secret-DSsWIW',
    },
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
        appointmentBookingReminderQueue: 'IN.QA.ALLPROCESS',
        appointmentBookingReminderRoutingKey: 'BATCH',
        whatsappStatusWebhookQueue:
          process.env.WHATSAPP_STATUS_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
        whatsappStatusWebhookExchange:
          process.env.WHATSAPP_STATUS_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
        whatsappStatusWebhookRoutingKey: 'BATCH',
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'chaaat.io',
    },
    stripe: {
      secretKey:
        'sk_test_51Ig0yKIz3ID7iG8qUNDPSsmMxA4NvAACdLjsuwFilcvLGcSLXHqqVi7HstaeSydvn8Q4A28aOVzHp44bcz9kn4sl00pQMJFYxI',
      publishableKey:
        'pk_test_51Ig0yKIz3ID7iG8qBZxEb28UiwCBvD3SKTBkJ8l5oEQtXOSrrgnVRoJWjiEBiccHftNhnYTqQHo77K0xMw3ez04L00AJCBZoXk',
    },
    wixWebhookQueue: process.env.WIX_WEBHOOK_QUEUE || 'IN.QA.ALLPROCESS',
    wixWebhookExchange: process.env.WIX_WEBHOOK_EXCHANGE || 'IN.QA.ALLPROCESS',
    wixWebhookRoutingKey: 'BATCH',
  },
  production: {
    appName: 'Pave',
    secretManager: {
      paveSecret:
        'arn:aws:secretsmanager:ap-southeast-1:346909834191:secret:production/pave/secret-zATWGY',
    },
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
          'https://app.chaaat.io',
          '/*.chaaat.io/',
          'https://staff.chaaat.io',
        ],
      },
    },
    googleAuth: {
      clientId:
        '964349112893-l02v9n25nrn0hris1aunhvsr238ts3hg.apps.googleusercontent.com',
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
    directIntegrations: {
      hubspot: {
        clientId: 'efcde794-c28d-45f1-a400-b49b15f8a76e',
        clientSecret: '8152b04d-7359-4d99-a72b-effb454c50e9',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms crm.objects.deals.read crm.objects.deals.write crm.lists.read',
        redirectUri:
          'https://staff.yourpave.com/settings/hubspot-redirect-page',
      },
      salesforce: {
        clientId:
          '3MVG9pRzvMkjMb6l7eEi5gB_ZuQXFJzsD77bT.y8ryJm0FL4M7U5jFZL.wIufunQeoO1tl7rs_vsqgUAXcsxg',
        clientSecret:
          '95C5AE3CE2855733E4CFE28C02B8577DE1958E424772687C521C423A1485EC43',
        scope: 'api refresh_token offline_access cdp_query_api',
        redirectUri:
          'https://staff.yourpave.com/settings/salesforce-redirect-page',
        webhookToken: '2eW260nX1Z',
      },
    },
    amq: {
      connection: {
        uri: 'amqps://root:L3Lc1deRUfaYzdG9w9KD@b-981115b8-82d9-4b72-b1c4-136e5713944a.mq.ap-southeast-1.amazonaws.com:5671',
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
        hsBulkProcessQueue: 'IN.PROD.ALLPROCESS',
        hsBulkProcessExchange: 'IN.PROD.ALLPROCESS',
        hsBulkProcessRoutingKey: 'BATCH',
        hsCreateContactQueue: 'IN.PROD.ALLPROCESS',
        hsCreateContactExchange: 'IN.PROD.ALLPROCESS',
        hsCreateContactRoutingKey: 'BATCH',
        hsUpdateContactQueue: 'IN.PROD.ALLPROCESS',
        hsUpdateContactExchange: 'IN.PROD.ALLPROCESS',
        hsUpdateContactRoutingKey: 'BATCH',
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
        sfCronTriggerQueue:
          process.env.SF_CRON_TRIGGER_QUEUE || 'IN.PROD.ALLPROCESS',
        sfCronTriggerExchange:
          process.env.SF_CRON_TRIGGER_EXCHANGE || 'IN.PROD.ALLPROCESS',
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
        whatsappWebhookQueue:
          process.env.WHATSAPP_WEBHOOK_QUEUE || 'IN.PROD.WhatsappWebhook',
        whatsappWebhookExchange:
          process.env.WHATSAPP_WEBHOOK_EXCHANGE || 'IN.PROD.WhatsappWebhook',
        whatsappWebhookRoutingKey: 'BATCH',
        appointmentBookingReminderQueue:
          process.env.APPOINTMENT_BOOKING_REMINDER_QUEUE ||
          'IN.PROD.AppointmentBookingReminder',
        appointmentBookingReminderRoutingKey: 'BATCH',
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
    stripe: {
      secretKey:
        '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',
      publishableKey:
        'pk_live_51Ig0yKIz3ID7iG8qN8lZ8dbQbyMO5pkdD9n5dQ0099OYHdDuCQlPTNBc6yhy7R0BGuIamzoivNZ3T1ASoZvW70h300dlFc7qH2',
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
