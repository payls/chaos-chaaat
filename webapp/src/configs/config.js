// import { getEnv } from '../helpers/general';

export const config = {
  development: {
    env: 'development',
    appName: 'Pave',
    webAppName: 'Pave Webapp (Development)',
    webUrl: 'http://localhost:3111',
    webAdminUrl: 'http://localhost:3112',
    apiUrl: 'http://localhost:3110',
    cdnUrls: ['https://cdn-staging.yourpave.com'],
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    googleAuth: {
      clientId:
        '791976211822-f5n2eggmlhrsksptojoqf4v9jf8er6tj.apps.googleusercontent.com',
      clientSecret: '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',
      callbackUrl: 'http://localhost:3111/signin/google/callback',
    },
    google: {
      apiKey: 'AIzaSyABtaDwodzYHE_QRnMWhPeP2uisfbeT55U',
    },
    facebook: {
      appId: '244944790716805',
    },
    intercom: {
      appId: 'rh6bqfv9',
    },
    hubspot: {
      apiFormSubmissionV3:
        'https://api.hsforms.com/submissions/v3/integration/submit/',
      portalId: '8857423',
      form: {
        contactUsFormId: '110bdbd9-35ba-4877-9461-2770d1160e35',
        paveBespokeFormId: 'd2b2e4b6-aae8-4c76-9033-2deca9bc3cc6',
        newsletterSubscriptionFormId: '0abbef29-905a-4ef8-9ff9-100990a5f79a',
        projectPageFormId: 'f910f60d-0461-4207-95a2-03e4ef1c9392',
      },
    },
    newRelic: {
      licenseKey: '',
      appId: '',
    },
  },

  staging: {
    env: 'staging',
    appName: 'Pave',
    webAppName: 'Pave Webapp (Staging)',
    webUrl: 'https://app-staging.chaaat.io',
    webAdminUrl: 'https://staff-staging.chaaat.io',
    // apiUrl: 'https://api-staging.chaaat.io',
    apiUrl: 'https://api-staging.chaaat.io',
    cdnUrls: ['https://cdn-staging.yourpave.com'],
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    googleAuth: {
      clientId:
        '791976211822-eu3474bvqf8gasrkfun8e4ntf7uqrtjc.apps.googleusercontent.com',
      clientSecret: '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',
      callbackUrl: 'https://app-staging.chaaat.io/signin/google/callback',
    },
    google: {
      apiKey: 'AIzaSyBi-NpRDXIT8H8e04V_iT3eofQ3ziRqeik',
    },
    facebook: {
      appId: '244944790716805',
    },
    intercom: {
      appId: 'rh6bqfv9',
    },
    hubspot: {
      apiFormSubmissionV3:
        'https://api.hsforms.com/submissions/v3/integration/submit/',
      portalId: '8857423',
      form: {
        contactUsFormId: '110bdbd9-35ba-4877-9461-2770d1160e35',
        paveBespokeFormId: 'd2b2e4b6-aae8-4c76-9033-2deca9bc3cc6',
        newsletterSubscriptionFormId: '0abbef29-905a-4ef8-9ff9-100990a5f79a',
        projectPageFormId: 'f910f60d-0461-4207-95a2-03e4ef1c9392',
      },
    },
    newRelic: {
      licenseKey: 'NRJS-b5747faf95d4fcfd49b',
      appId: '1115982870',
    },
  },

  qa: {
    env: 'qa',
    appName: 'Pave',
    webAppName: 'Pave Webapp (QA)',
    webUrl: 'https://app-qa.yourpave.com',
    webAdminUrl: 'https://staff-qa.yourpave.com',
    apiUrl: 'https://api-qa.yourpave.com',
    cdnUrls: ['https://cdn-qa.yourpave.com'],
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    googleAuth: {
      clientId:
        '964349112893-61alj67kh7lugfhfrarfgas8nudna8kl.apps.googleusercontent.com',
      clientSecret: 'Sgnc2CbB4JIeLxcI7JZUKLQ5',
      callbackUrl: 'https://app-qa.yourpave.com/signin/google/callback',
    },
    google: {
      apiKey: 'AIzaSyDr-yo1FPTndLfVx78pUFnVYbv-nbGfu3w',
    },
    facebook: {
      appId: '244944790716805',
    },
    intercom: {
      appId: 'rh6bqfv9',
    },
    hubspot: {
      apiFormSubmissionV3Url:
        'https://api.hsforms.com/submissions/v3/integration/submit/',
      portalId: '8857423',
      form: {
        contactUsFormId: '110bdbd9-35ba-4877-9461-2770d1160e35',
        paveBespokeFormId: 'd2b2e4b6-aae8-4c76-9033-2deca9bc3cc6',
        newsletterSubscriptionFormId: '0abbef29-905a-4ef8-9ff9-100990a5f79a',
        projectPageFormId: 'f910f60d-0461-4207-95a2-03e4ef1c9392',
      },
    },
    newRelic: {
      licenseKey: 'NRJS-b5747faf95d4fcfd49b',
      appId: '1117627927',
    },
  },

  production: {
    env: 'production',
    appName: 'Pave',
    webAppName: 'Pave Webapp',
    webUrl: 'https://app.chaaat.io',
    webAdminUrl: 'https://staff.chaaat.io',
    apiUrl: 'https://api.chaaat.io',
    cdnUrls: ['https://cdn.yourpave.com'],
    contentApiUrl: 'https://content.yourpave.com/wp-json/wp',
    googleAuth: {
      clientId:
        '791976211822-mde937b4rs6t1dg6v0dbkes0ii7g9ig5.apps.googleusercontent.com',
      clientSecret: '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',
      callbackUrl: 'https://app.chaaat.io/signin/google/callback',
    },
    google: {
      apiKey: 'AIzaSyCTgQZ93h2DWmKlD3Krq9k0RytpMlG4FH8',
    },
    facebook: {
      appId: '244944790716805',
    },
    intercom: {
      appId: 'rh6bqfv9',
    },
    hubspot: {
      apiFormSubmissionV3:
        'https://api.hsforms.com/submissions/v3/integration/submit/',
      portalId: '8857423',
      form: {
        contactUsFormId: '110bdbd9-35ba-4877-9461-2770d1160e35',
        paveBespokeFormId: 'd2b2e4b6-aae8-4c76-9033-2deca9bc3cc6',
        newsletterSubscriptionFormId: '0abbef29-905a-4ef8-9ff9-100990a5f79a',
        projectPageFormId: 'f910f60d-0461-4207-95a2-03e4ef1c9392',
      },
    },
    newRelic: {
      licenseKey: 'NRJS-b5747faf95d4fcfd49b',
      appId: '1117337189',
    },
  },
}[process.env.NEXT_PUBLIC_APP_ENV || getEnv()];

function getEnv() {
  const debug = true;
  const hostName =
    typeof window !== 'undefined' ? window.location.hostname : '';
  const processEnvironment = function (debug, environment) {
    if (debug) console.log('Current environment: ' + environment);
    return environment;
  };
  // development environment
  if (
    hostName.indexOf('localhost') > -1 ||
    process.env.NEXT_PUBLIC_APP_ENV === 'development'
  ) {
    return processEnvironment(debug, 'development');
  }
  // staging environment
  else if (hostName.indexOf('app-staging.yourpave.com') > -1) {
    return processEnvironment(debug, 'staging');
  } else if (
    hostName.indexOf('app-staging.chaaat.io') > -1 ||
    process.env.NEXT_PUBLIC_APP_ENV === 'staging'
  ) {
    return processEnvironment(debug, 'staging');
  }

  // production environment
  else {
    return processEnvironment(debug, 'production');
  }
}
