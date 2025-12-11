const config = {
  development: {
    appName: 'Pave Integrations (Development)',
    apiUrl: 'http://localhost:3110',
    apiIntegrationsUrl: process.env.NGROK_WEBHOOK,
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
          'http://localhost:3112',
          'http://localhost:3113',
          'https://app.hubspot.com',
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
    newRelic: {
      licenseKey: '',
    },
    directIntegrations: {
      hubspot: {
        clientId: 'b9c33a7b-7802-4b20-a587-1cb9e1b5ea07',
        clientSecret: '70b89c8e-d99d-48c8-a63f-41043fb27943',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms',
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
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'yourpaveapp.com',
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
  },
  staging: {
    appName: 'Pave Integrations (Staging)',
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
          'https://staff-staging.yourpave.com',
        ],
      },
    },
    googleAuth: {
      clientId:
        '964349112893-vo51tbaq9vpnbclho54k5a47a9kasca4.apps.googleusercontent.com',
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
    newRelic: {
      licenseKey: '49443d1676957a5d211dd390f52473ea7f0fNRAL',
    },
    directIntegrations: {
      hubspot: {
        clientId: '2523606a-ab7f-480b-8f27-a724eab3f4b7',
        clientSecret: '5c88f59d-a810-4579-8367-95f4c4b8cb15',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms',
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
        uri: 'amqps://root:J6Q9wAPQfB9zUJNY0JgM@b-7059e950-6c41-4ba6-b5ea-968bb5eb6fea.mq.ap-southeast-1.amazonaws.com:5671', // 'amqp://localhost'
        host: 'localhost',
        port: 5671,
        username: 'root',
        password: 'root',
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
        sfCreateContactQueue: 'IN.STAGING.ALLPROCESS',
        sfCreateContactExchange: 'IN.STAGING.ALLPROCESS',
        sfCreateContactRoutingKey: 'BATCH',
        sfUpdateContactQueue: 'IN.STAGING.ALLPROCESS',
        sfUpdateContactExchange: 'IN.STAGING.ALLPROCESS',
        sfUpdateContactRoutingKey: 'BATCH',
        sfAdhocQueue: 'IN.STAGING.ALLPROCESS',
        sfAdhocExchange: 'IN.STAGING.ALLPROCESS',
        sfAdhocRoutingKey: 'BATCH',
        sfCronTriggerQueue: 'IN.STAGING.ALLPROCESS',
        sfCronTriggerExchange: 'IN.STAGING.ALLPROCESS',
        sfCronTriggerRoutingKey: 'BATCH',
        paveBulkCreatePropoposalQueue:
          process.env.PAVE_BULK_CREATE_PROPOSAL_QUEUE ||
          'IN.STAGING.CreateProposalBulk',
        paveBulkCreateProposalExchange:
          process.env.PAVE_BULK_CREATE_PROPOSAL_EXCHANGE ||
          'IN.STAGING.CreateProposalBulk',
        paveBulkCreatePropoposalRoutingKey: 'BATCH',
        paveCreateProposalQueue:
          process.env.PAVE_CREATE_PROPOSAL_QUEUE || 'IN.STAGING.CreateProposal',
        paveCreateProposalExchange:
          process.env.PAVE_CREATE_PROPOSAL_EXCHANGE ||
          'IN.STAGING.CreateProposal',
        paveCreateProposalRoutingKey: 'BATCH',
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'yourpaveapp.com',
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
  },
  qa: {
    appName: 'Pave Integrations (QA)',
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
    newRelic: {
      licenseKey: '49443d1676957a5d211dd390f52473ea7f0fNRAL',
    },
    directIntegrations: {
      hubspot: {
        clientId: '7be8ad03-d349-494e-b7ff-3df41bf3b219',
        clientSecret: '30f76cdb-fe16-46e0-84dd-581cab02342d',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms',
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
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'yourpaveapp.com',
    },
    gmail: {
      web: {
        client_id:
          '570902044484-j6r4sv1ctsn131sc5a78ga0jvcesfe8c.apps.googleusercontent.com',
        client_secret: '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',
        project_id: 'pave-platform',
        javascript_origins: 'https://staff-qa.yourpave.com',
      },
    },
  },
  production: {
    appName: 'Pave Integrations',
    apiUrl: 'https://api.yourpave.com',
    apiIntegrationsUrl: 'https://api-integrations.yourpave.com',
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    webUrl: 'https://app.yourpave.com',
    webAdminUrl: 'https://staff.yourpave.com',
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
          '(^|^[^:]+://|[^.]+.)chaaat.io(:d{1,5})?$',
          '(^|^[^:]+://|[^.]+.)yourpave.com(:d{1,5})?$',
          'https://partner-api.unificationengine.com',
          'https://partner.uib.ai/',
          'https://18.157.156.56/',
          'https://3.124.97.71/',
          'https://18.157.127.135/',
          'https://ianromieona.github.io/',
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
    newRelic: {
      licenseKey: '49443d1676957a5d211dd390f52473ea7f0fNRAL',
    },
    directIntegrations: {
      hubspot: {
        clientId: 'efcde794-c28d-45f1-a400-b49b15f8a76e',
        clientSecret: '8152b04d-7359-4d99-a72b-effb454c50e9',
        scope:
          'crm.objects.contacts.read crm.objects.owners.read crm.objects.contacts.write forms',
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
      },
    },
    email: {
      domain: process.env.EMAIL_DOMAIN || 'yourpaveapp.com',
    },
    gmail: {
      web: {
        client_id:
          '570902044484-j6r4sv1ctsn131sc5a78ga0jvcesfe8c.apps.googleusercontent.com',
        client_secret: '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',
        project_id: 'pave-platform',
        javascript_origins: 'https://staff.yourpave.com',
      },
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
