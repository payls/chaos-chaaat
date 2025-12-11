const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const c = require('../../../../controllers');
const config = require('../../../../configs/config')(process.env.NODE_ENV);
const request = require('request');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/integrations/gmail/integrate Save authentication code
   * @apiName StaffIntegrationsGmailIntegrate
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsGmail
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/gmail/integrate',
    schema: {
      body: {
        type: 'object',
        properties: {
          agency_user_fk: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);

      try {
        const { agency_user_fk, code } = req.body;
        console.log('💥💥💥💥💥💥💥START LOG💥💥💥💥💥💥💥');

        const authOptions = {
          url: 'https://oauth2.googleapis.com/token',
          method: 'POST',
          form: {
            code,
            client_id: config.gmail.web.client_id,
            client_secret: config.gmail.web.client_secret,
            redirect_uri: config.gmail.web.javascript_origins,
            grant_type: 'authorization_code',
          },
          headers: {
            Accept: 'application/json',
            origin: config.gmail.web.javascript_origins,
          },
        };

        const googleResponse = await new Promise((resolve, reject) => {
          request(authOptions, function (error, response, body) {
            console.log({
              form: {
                code,
                client_id: config.gmail.web.client_id,
                client_secret: config.gmail.web.client_secret,
                redirect_uri: config.gmail.web.javascript_origins,
                grant_type: 'authorization_code',
              },
              headers: {
                Accept: 'application/json',
                origin: config.gmail.web.javascript_origins,
              },
              body,
            });
            console.log(body);
            if (!error && response.statusCode === 200) {
              resolve({
                access_token: JSON.parse(body).access_token,
                refresh_token: JSON.parse(body).refresh_token,
              });
            }
            reject(error);
          });
        });

        // Create Agent user oath2 entry
        if (h.notEmpty(googleResponse)) {
          await c.agencyUserEmailOauth.create({
            agency_user_fk,
            source: 'GMAIL',
            status: 'ACTIVE',
            access_info: JSON.stringify({ code, ...googleResponse }),
            created_by: user_id,
          });
        }

        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-gmail-oauth-create-1675399238',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-gmail-oauth-create-1675399238',
          { portal },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/integrations/gmail/active-integration Get active integration
   * @apiName StaffIntegrationsGmailGetActiveGmailIntegration
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsGmail
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/integrations/gmail/active-integration',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { agency_user_fk } = req.query;

        const oauth = await c.agencyUserEmailOauth.findOne(
          {
            agency_user_fk,
            status: 'ACTIVE',
            source: 'GMAIL',
          },
          {
            attributes: [
              'agency_user_fk',
              'agency_user_email_oauth_id',
              'status',
              'source',
            ],
          },
        );

        h.api.createResponse(
          res,
          200,
          { success: true, agency_oauth: oauth },
          '1-gmail-oauth-retrieve-1675399238',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-gmail-oauth-retrieve-1675399238',
          { portal },
        );
      }
    },
  });

  /**
   * @api {POST} /v1/staff/integrations/gmail/disconnect-integration disconnect active integration
   * @apiName StaffIntegrationsGmailDisconnectActiveGmailIntegration
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsGmail
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/gmail/disconnect-integration',
    schema: {
      body: {
        type: 'object',
        properties: {
          agency_user_fk: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);
      try {
        const { agency_user_fk } = req.body;

        const oauth = await c.agencyUserEmailOauth.findOne({
          agency_user_fk,
          status: 'ACTIVE',
          source: 'GMAIL',
        });

        if (oauth) {
          await c.agencyUserEmailOauth.update(
            oauth.dataValues.agency_user_email_oauth_id,
            {
              status: 'INACTIVE',
              updated_by: user_id,
            },
          );
        }

        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-gmail-oauth-retrieve-1675399238',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-gmail-oauth-retrieve-1675399238',
          { portal },
        );
      }
    },
  });

  next();
};
