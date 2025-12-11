export const config = {
  development: {
    apiUrl: 'http://localhost:3110',
    appUrl: 'http://localhost:3000',

    appSync: {
      aws_appsync_graphqlEndpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      aws_appsync_region: 'ap-southeast-1',
      aws_appsync_authenticationType: 'API_KEY',
      aws_appsync_apiKey: 'da2-atsy3mfmkfhp3etzi7rc3oekly',
    },
  },
  staging: {
    apiUrl: 'https://api-staging.yourpave.com',
    appUrl: 'https://livechat-staging.yourpave.com',
    appSync: {
      aws_appsync_graphqlEndpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      aws_appsync_region: 'ap-southeast-1',
      aws_appsync_authenticationType: 'API_KEY',
      aws_appsync_apiKey: 'da2-atsy3mfmkfhp3etzi7rc3oekly',
    },
  },
  qa: {
    apiUrl: 'https://api-qa.yourpave.com',
    appUrl: 'https://livechat-qa.yourpave.com',
    appSync: {
      aws_appsync_graphqlEndpoint:
        'https://xmg6dm4vozhytftvzziarheoay.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      aws_appsync_region: 'ap-southeast-1',
      aws_appsync_authenticationType: 'API_KEY',
      aws_appsync_apiKey: 'da2-atsy3mfmkfhp3etzi7rc3oekly',
    },
  },
  production: {
    apiUrl: 'https://api.chaaat.io',
    appUrl: 'https://livechat.yourpave.com',
    appSync: {
      aws_appsync_graphqlEndpoint:
        'https://ppj3476yybfdjeole445qz75pe.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      aws_appsync_region: 'ap-southeast-1',
      aws_appsync_authenticationType: 'API_KEY',
      aws_appsync_apiKey: 'da2-tolqn7pivvfq5mogldn4ws6inq',
    },
  },
}[process.env.APP_ENV || getEnv()];

function getEnv() {
  const debug = true;
  const hostName =
    typeof window !== 'undefined' ? window.location.hostname : '';
  const processEnvironment = function (debug, environment) {
    if (debug) console.log('Current environment: ' + environment);
    return environment;
  };

  // development environment
  if (hostName.indexOf('localhost') > -1) {
    return processEnvironment(debug, 'development');
  }
  // staging environment
  else if (hostName.indexOf('live-chat-staging.yourpave.com') > -1) {
    return processEnvironment(debug, 'staging');
  }
  // qa environment
  else if (hostName.indexOf('live-chat-qa.yourpave.com') > -1) {
    return processEnvironment(debug, 'qa');
  }
  // production environment
  else {
    return processEnvironment(debug, 'production');
  }
}
