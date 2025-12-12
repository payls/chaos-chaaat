const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const c = require('../../controllers');
const AWS = require('aws-sdk');
const config = require('../../configs/config')(process.env.NODE_ENV);

module.exports = (fastify, opts, next) => {
  /** Get AppSync credentials */
  fastify.route({
    method: 'GET',
    url: '/appsync/new-key',
    handler: async (request, reply) => {
      try {
        AWS.config.update({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: 'ap-southeast-1',
        });
        const appsync = new AWS.AppSync();
        const apiId = config.graphql.api_id;
        const apiKeyName = 'AppSync Messaging Key';

        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 365);
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);

        const createApiKeyParams = {
          apiId,
          description: apiKeyName,
          expires: timestampInSeconds,
        };

        console.log({
          apiId,
          description: apiKeyName,
          expires: timestampInSeconds,
        });

        console.log({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: 'ap-southeast-1',
        });

        appsync.createApiKey(createApiKeyParams, async (err, data) => {
          if (err) {
            console.error('Error creating API key:', err);
          } else {
            console.log('New API key created:', data.apiKey);
            await models.appsync_credentials.update(
              {
                status: 'expired',
              },
              {
                where: { status: 'active' },
              },
            );
            const app_key = data.apiKey;
            const timestampInMilliseconds = app_key.expires * 1000;
            const expiration_date = new Date(timestampInMilliseconds);

            await c.appSyncCredentials.create({
              appsync_credentials_id: h.general.generateId(),
              api_key: app_key.id,
              expiration_date: expiration_date,
              created_by: null,
              status: 'active',
            });
          }
        });

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          'appsync-id-1689818819-generation-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'appsync-id-1689818819-generation-error',
        );
      }
    },
  });

  next();
};
