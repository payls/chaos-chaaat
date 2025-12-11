const axios = require('axios');
const { gql } = require('graphql-tag');
const { print } = require('graphql');
const { v4: uuidv4 } = require('uuid');
const { SignatureV4 } = require('@smithy/signature-v4');
const { HttpRequest } = require('@smithy/protocol-http');
const { Sha256 } = require('@aws-crypto/sha256-js');
const Sentry = require('@sentry/node');

const config = require('../configs/config')(process.env.NODE_ENV);

const appSyncHelper = module.exports;

const endpoint = config.graphql.endpoint;
const apiUrl = new URL(endpoint);

const signer = new SignatureV4({
  service: 'appsync',
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.APPSYNC_API_KEY,
    secretAccessKey: process.env.APPSYNC_API_SECRET,
  },
  sha256: Sha256,
});

/**
 * Description
 * Function for graphql query
 * @async
 * @function
 * @name signedFetch
 * @kind variable
 * @param {object} graphqlObject object for graphql query
 * @returns {Promise<any>}
 */
const signedFetch = async (graphqlObject) => {
  if (!graphqlObject) return;

  // set up the HTTP request
  const request = new HttpRequest({
    hostname: apiUrl.host,
    path: apiUrl.pathname,
    body: JSON.stringify(graphqlObject),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: apiUrl.hostname,
    },
  });

  const signedRequest = await signer.sign(request);

  const { headers, body, method } = await signedRequest;

  return await fetch(endpoint, {
    headers,
    body,
    method,
  }).then((res) => res.json());
};

/**
 * Description
 * Function to send messag notifications in the frontend to have realtime
 * messaging
 * @async
 * @constant
 * @name appSyncHelper
 * @param {string} api_key optional api_key for appsync
 * @param {object} msgData message data to be sent in dynamo db
 */
appSyncHelper.sendGraphQLNotification = async (api_key, msgData) => {
  const id = uuidv4();
  const agency_id = msgData.agency_id || msgData.agency_fk;
  msgData.contact_fk = msgData.contact_id;
  msgData.msg_body = msgData.message;
  if (!agency_id) {
    throw new Error('no agency id provided');
  }

  const generateQueryWithGraphqlTag = () => {
    return /* GraphQL */ gql`
      mutation CreateNotificationMessage(
        $input: CreateNotificationMessageInput!
      ) {
        createNotificationMessage(input: $input) {
          id
          agencyId
          type
          data
          createdAt
          updatedAt
        }
      }
    `;
  };

  const graphqlObject = {
    query: print(generateQueryWithGraphqlTag()),
    variables: {
      input: {
        id: id,
        agencyId: agency_id,
        type: 'WHATSAPP_MESSAGE_UPDATED',
        data: JSON.stringify(msgData),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  };

  await signedFetch(graphqlObject);
};
