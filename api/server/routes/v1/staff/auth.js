const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const authController = require('../../../controllers/auth').makeAuthController(
  models,
);
// const agencyUserController = require('../../../controllers/agencyUser').makeAgencyUserController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/auth/login/email Login by email
   * @apiName StaffAuthLoginEmail
   * @apiVersion 1.0.0
   * @apiGroup Staff Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} email User's email address
   * @apiParam {string} password User account's password
   */
  fastify.route({
    method: 'POST',
    url: '/staff/auth/login/email',
    onRequest: fastify.csrfProtection,
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          _csrf: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            access_token: { type: 'string' },
            agency_name: { type: 'string' },
            is_paid: { type: 'number' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body;
        const { user_id, access_token, error } = await c.auth.loginUserByEmail(
          email,
          password,
        );

        if (h.notEmpty(error)) {
          return h.api.createResponse(request, reply, 401, {}, error);
        }

        const hasAccessToStaffPortal = await c.auth.hasAccessToStaffPortal(
          user_id,
        );

        // find agency name
        const { agency_name, is_paid } = await c.agency.getAgencyByUserId(
          user_id,
        );

        // No access to staff portal
        if (!hasAccessToStaffPortal) {
          return h.api.createResponse(request, reply, 500, {}, '2-generic-002');
        }
        // Has access and valid user account found
        else if (access_token) {
          return h.api.createResponse(
            request,
            reply,
            200,
            { access_token, agency_name, is_paid },
            '1-auth-1608509359974',
            { portal },
          );
        }
        // No valid user account found
        else {
          throw new Error(`${request.url}: no valid user account found`);
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to login via email & password`, {
          err,
        });
        return h.api.createResponse(
          request,
          reply,
          400,
          {},
          '2-auth-1608510138480',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/auth/login/google Login by google signin
   * @apiName StaffAuthLoginGoogle
   * @apiVersion 1.0.0
   * @apiGroup Staff Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} social_payload Social payload from Google signin
   */
  fastify.route({
    method: 'POST',
    url: '/staff/auth/login/google',
    schema: {
      body: {
        type: 'object',
        required: ['social_payload'],
        properties: {
          social_payload: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            access_token: { type: 'string' },
            agency_name: { type: 'string' },
            is_paid: { type: 'boolean' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { social_payload } = request.body;
        const { user_id, access_token } = await c.auth.loginUserByGoogle(
          social_payload,
        );
        const { agency_name, is_paid } = await c.agency.getAgencyByUserId(
          user_id,
        );
        if (h.notEmpty(user_id) && h.notEmpty(agency_name)) {
          const hasAccessToStaffPortal = await c.auth.hasAccessToStaffPortal(
            user_id,
          );
          // No access to staff portal
          if (!hasAccessToStaffPortal) {
            return h.api.createResponse(
              request,
              reply,
              500,
              {},
              '2-generic-002',
              {
                portal,
              },
            );
          }
          // Has access and valid user account found
          else if (access_token) {
            return h.api.createResponse(
              request,
              reply,
              200,
              { access_token, agency_name, is_paid },
              '1-auth-1608509359974',
              { portal },
            );
          }
          // No valid user account found
          else {
            throw new Error(`${request.url}: no valid user account found`);
          }
        } else if (
          h.notEmpty(user_id) &&
          h.isEmpty(agency_name) &&
          h.notEmpty(access_token)
        ) {
          request.log.info(
            'Agency not yet created for this user. Proceed to creation',
          );
          h.api.createResponse(
            request,
            reply,
            200,
            { access_token },
            '1-auth-1608509359974',
          );
        } else {
          h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480');
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        request.log.error(`${request.url}: failed to login via Google`, {
          err,
        });
        h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/auth/login/facebook Login by facebook signin
   * @apiName StaffAuthLoginFacebook
   * @apiVersion 1.0.0
   * @apiGroup Staff Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} social_payload Social payload from Facebook signin
   */
  fastify.route({
    method: 'POST',
    url: '/staff/auth/login/facebook',
    schema: {
      body: {
        type: 'object',
        required: ['social_payload'],
        properties: {
          social_payload: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            access_token: { type: 'string' },
            agency_name: { type: 'string' },
            is_paid: { type: 'number' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { social_payload } = request.body;
      try {
        const { user_id, access_token } =
          await authController.loginUserByFacebook(social_payload);
        const hasAccessToStaffPortal = await c.auth.hasAccessToStaffPortal(
          user_id,
        );

        const { agency_name, is_paid } = await c.agency.getAgencyByUserId(
          user_id,
        );
        // No access to staff portal
        if (!hasAccessToStaffPortal) {
          h.api.createResponse(request, reply, 500, {}, '2-generic-002', {
            portal,
          });
        }
        // Has access and valid user account found
        else if (access_token) {
          h.api.createResponse(
            request,
            reply,
            200,
            { access_token, agency_name, is_paid },
            '1-auth-1608509359974',
            { portal },
          );
        }
        // No valid user account found
        else {
          throw new Error(`${request.url}: no valid user account found`);
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to login via Facebook`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-auth-1619409815992', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/auth/logout Logout
   * @apiName StaffAuthLogout
   * @apiVersion 1.0.0
   * @apiGroup Staff Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} access_token User session's access token
   */
  fastify.route({
    method: 'POST',
    url: '/staff/auth/logout',
    schema: {
      body: {
        access_token: { type: 'string' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { access_token } = request.body;
      await c.auth.logout(access_token);
      h.api.createResponse(request, reply, 200, {}, '1-generic-001', {
        portal,
      });
    },
  });

  /**
   * @api {post} /v1/staff/auth/session/verify Verify session access token
   * @apiName StaffAuthSessionVerify
   * @apiVersion 1.0.0
   * @apiGroup Staff Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} access_token User session's access token
   */
  fastify.route({
    method: 'POST',
    url: '/staff/auth/session/verify',
    schema: {
      body: {
        type: 'object',
        required: ['access_token'],
        properties: {
          access_token: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            access_token: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { access_token } = request.body;
        const { user_fk } = await c.userAccessToken.findOne({ access_token });
        const hasAccessToStaffPortal = await c.auth.hasAccessToStaffPortal(
          user_fk,
        );
        if (hasAccessToStaffPortal) {
          const { new_access_token } = await h.database.transaction(
            async (transaction) => {
              const new_access_token = await c.auth.verifySessionToken(
                access_token,
                { transaction },
              );
              return { new_access_token };
            },
          );
          h.api.createResponse(
            request,
            reply,
            200,
            { access_token: new_access_token },
            '1-auth-1609231224034',
            { portal },
          );
        } else {
          throw new Error(
            `${request.url}: no user account doesn not have access to Staff Portal`,
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to verify session access token`, {
          err,
        });
        h.api.createResponse(request, reply, 500, {}, '2-generic-002', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/auth/password/forgot Staff user Forgot password
   * @apiName StaffAuthForgotPassword
   * @apiVersion 1.0.0
   * @apiGroup StaffAuth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} access_token User session's access token
   */
  fastify.route({
    method: 'POST',
    url: '/staff/auth/password/forgot',
    onRequest: fastify.csrfProtection,
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string' },
          _csrf: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { email } = request.body;
      try {
        await authController.forgotPassword(email);
        h.api.createResponse(request, reply, 200, {}, '1-auth-1613802495917', {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: forgot password sequence failed`, { err });
        h.api.createResponse(request, reply, 200, {}, '1-auth-1613802495917', {
          portal,
        });
      }
    },
  });

  next();
};
