const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const h = require('../../helpers');
const models = require('../../models');
const userMiddleware = require('../../middlewares/user');
const userController = require('../../controllers/user').makeUserController(
  models,
);
const userEmailVerificationController =
  require('../../controllers/userEmailVerification').makeUserEmailVerificationController(
    models,
  );
const userResetPasswordController =
  require('../../controllers/userResetPassword').makeUserResetPasswordController(
    models,
  );
const authController = require('../../controllers/auth').makeAuthController(
  models,
);
// const userAccessTokenController = require('../../controllers/userAccessToken').makeUserAccessTokenController(models);
const userRoleController =
  require('../../controllers/userRole').makeUserRoleController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/auth/register Register user
   * @apiName AuthRegister
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} [first_name] First name
   * @apiParam {string} [last_name] Last name
   * @apiParam {string} [email] Email
   * @apiParam {string} auth_type Authentication type
   * @apiParam {string} [social_payload] Social payload from social account signin
   */

  fastify.route({
    method: 'POST',
    url: '/auth/register',
    onRequest: fastify.csrfProtection,
    schema: {
      body: {
        type: 'object',
        required: ['auth_type'],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          mobile_number: { type: 'string' },
          auth_type: {
            type: 'string',
            enum: Object.values(constant.USER.AUTH_TYPE),
          },
          social_payload: { type: 'object' },
          buyer_type: { type: 'string' },
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
            created: { type: 'boolean' },
            userId: { type: 'string' },
            auth_type: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      let {
        auth_type,
        first_name,
        last_name,
        email,
        password,
        mobile_number,
        social_payload,
        buyer_type,
        invitee,
      } = request.body;

      first_name = h.validation.removeUrlLinks(first_name);
      last_name = h.validation.removeUrlLinks(last_name);

      try {
        let { access_token, userId, created } = await h.database.transaction(
          async (transaction) => {
            let access_token = null;
            let userId = null;
            let created = false;
            // switch between different auth types
            switch (auth_type) {
              case constant.USER.AUTH_TYPE.GOOGLE:
                // eslint-disable-next-line no-case-declarations
                const googleAuthRes = await authController.registerUserByGoogle(
                  first_name,
                  last_name,
                  email,
                  social_payload,
                  { buyer_type, invitee, transaction },
                );
                access_token = googleAuthRes.access_token;
                created = googleAuthRes.created;
                break;
              // case constant.USER.AUTH_TYPE.FACEBOOK:
              //   access_token = await authController.registerUserByFacebook(
              //     first_name,
              //     last_name,
              //     email,
              //     social_payload,
              //     {
              //       buyer_type,
              //       invitee,
              //       transaction,
              //     },
              //   );
              //   break;
              case constant.USER.AUTH_TYPE.EMAIL:
                // eslint-disable-next-line no-case-declarations
                const emailAuthRes = await authController.registerUserByEmail(
                  first_name,
                  last_name,
                  mobile_number,
                  email,
                  {
                    buyer_type,
                    invitee,
                    transaction,
                  },
                );
                userId = emailAuthRes.record.user_id;
                created = emailAuthRes.created;
                break;
              default:
                // respond with unsupported auth_type
                h.api.createResponse(
                  request,
                  reply,
                  200,
                  {},
                  '1-auth-1609072638120',
                );
            }

            return { access_token, userId, created };
          },
        );

        // find the recently created user record.
        const user = await h.database.transaction(async (transaction) => {
          const new_user = await userController.findOne(
            { email },
            { transaction },
          );
          return new_user;
        });

        // if auth_type is email, update password
        if (h.cmpStr(auth_type, constant.USER.AUTH_TYPE.EMAIL)) {
          // ideally should be in the same transaction as above but user is not created
          // thus can't update password before the previous transaction ends.
          // if the user already has a password, don't update it here.
          if (h.isEmpty(user.password)) {
            await h.database.transaction(async (transaction) => {
              await userController.updatePassword(userId, password, undefined, {
                transaction,
              });
            });
          }

          // if the user has been invited, they should have an organisation setup, so log them in directly.
          if (h.notEmpty(invitee)) {
            access_token = await h.database.transaction(async (transaction) => {
              const emailLoginRes = await authController.loginUserByEmail(
                email,
                password,
                {
                  transaction,
                },
              );
              return emailLoginRes.access_token;
            });
          }
        }

        // find or create user_role for the user
        await h.database.transaction(async (transaction) => {
          await userRoleController.findOrCreate(
            { user_fk: user.user_id },
            {
              user_fk: user.user_id,
              user_role: constant.USER.ROLE.AGENCY_ADMIN,
            },
            { transaction },
          );
        });
        // respond with registration successful.
        h.api.createResponse(
          request,
          reply,
          200,
          { access_token, userId, created, auth_type },
          '1-auth-1609072620884',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to register user`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-auth-1637641570069');
      }
    },
  });

  /**
   * @api {get} /v1/auth/email/verify/:token Get email verification token
   * @apiName AuthEmailVerifyToken
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} token Email verification token
   */
  fastify.route({
    method: 'GET',
    url: '/auth/email/verify/:token',
    schema: {
      params: {
        token: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const { token } = request.params;
      const { user, verified_date } = await h.database.transaction(
        async (transaction) => {
          const { user_fk, verified_date } =
            await userEmailVerificationController.findOne(
              { token },
              { transaction },
            );
          const user = await userController.findOne(
            { user_id: user_fk },
            { transaction },
          );
          return { user, verified_date };
        },
      );
      h.api.createResponse(
        request,
        reply,
        200,
        {
          user,
          is_token_used: h.notEmpty(verified_date) ? 1 : 0,
        },
        '1-auth-1608395416607',
      );
    },
  });

  /**
   * @api {post} /v1/auth/email/verify Verify email
   * @apiName AuthEmailVerify
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} token Email verification token
   * @apiParam {string} email User's email address
   * @apiParam {string} auth_type User account authentication type
   * @apiParam {string} password User account's password
   */
  fastify.route({
    method: 'POST',
    url: '/auth/email/verify',
    schema: {
      body: {
        type: 'object',
        required: ['token', 'email', 'auth_type' /*, 'password' */],
        properties: {
          token: { type: 'string' },
          email: { type: 'string' },
          auth_type: {
            type: 'string',
            enum: Object.values(constant.USER.AUTH_TYPE),
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { token, auth_type } = request.body;
      let verifyStatus = null;
      let newAccessToken = null;
      switch (auth_type) {
        case constant.USER.AUTH_TYPE.EMAIL:
          verifyStatus = await h.database.transaction(async (transaction) => {
            verifyStatus = await userEmailVerificationController.verify(token, {
              transaction,
            });
            // Generate access token if email is verified
            if (verifyStatus) {
              const { user_fk: user_id } =
                await userEmailVerificationController.findOne(
                  { token },
                  { transaction },
                );
              const { access_token } = await authController.loginUserByUserId(
                user_id,
                { transaction },
              );
              newAccessToken = access_token;
            }
            return verifyStatus;
          });
          break;
      }
      if (verifyStatus) {
        h.api.createResponse(
          request,
          reply,
          200,
          {
            verification_status: verifyStatus,
            access_token: newAccessToken,
          },
          '1-auth-1608395416607',
        );
      } else {
        h.api.createResponse(
          request,
          reply,
          200,
          { verification_status: verifyStatus },
          '2-auth-1608484145842',
        );
      }
    },
  });

  /**
   * @api {post} /v1/auth/login/email Login by email
   * @apiName AuthLoginEmail
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} email User's email address
   * @apiParam {string} password User account's password
   */
  fastify.route({
    method: 'POST',
    url: '/auth/login/email',
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
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body;
      try {
        const { access_token } = await authController.loginUserByEmail(
          email,
          password,
        );
        if (access_token) {
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
        h.api.createResponse(request, reply, 500, {}, '2-auth-1608510138480');
      }
    },
  });

  /**
   * @api {post} /v1/auth/login/google Login by google signin
   * @apiName AuthLoginGoogle
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} social_payload Social payload from Google signin
   */
  fastify.route({
    method: 'POST',
    url: '/auth/login/google',
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
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { social_payload } = request.body;
      try {
        const { access_token } = await authController.loginUserByGoogle(
          social_payload,
        );
        if (access_token) {
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
        h.api.createResponse(request, reply, 500, {}, '2-auth-1619409641134');
      }
    },
  });

  /**
   * @api {post} /v1/auth/login/facebook Login by facebook signin
   * @apiName AuthLoginFacebook
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} social_payload Social payload from Facebook signin
   */
  fastify.route({
    method: 'POST',
    url: '/auth/login/facebook',
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
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { social_payload } = request.body;
      try {
        const { access_token } = await authController.loginUserByFacebook(
          social_payload,
        );
        if (access_token) {
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
        h.api.createResponse(request, reply, 500, {}, '2-auth-1619409815992');
      }
    },
  });

  /**
   * @api {post} /v1/auth/logout Logout
   * @apiName AuthLogout
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} access_token User session's access token
   */
  fastify.route({
    method: 'POST',
    url: '/auth/logout',
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
    },
    handler: async (request, reply) => {
      const { access_token } = request.body;
      await authController.logout(access_token);
      h.api.createResponse(request, reply, 200, {}, '1-generic-001');
    },
  });

  /**
   * @api {post} /v1/auth/session/verify Verify session access token
   * @apiName AuthSessionVerify
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} access_token User session's access token
   */
  fastify.route({
    method: 'POST',
    url: '/auth/session/verify',
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
      const { access_token } = request.body;
      try {
        const { new_access_token } = await h.database.transaction(
          async (transaction) => {
            const new_access_token = await authController.verifySessionToken(
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
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(request, reply, 500, {}, '2-generic-001');
      }
    },
  });

  /**
   * @api {post} /v1/auth/password/forgot Forgot password
   * @apiName AuthForgotPassword
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} access_token User session's access token
   */
  fastify.route({
    method: 'POST',
    url: '/auth/password/forgot',
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
        h.api.createResponse(request, reply, 200, {}, '1-auth-1613802495917');
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: forgot password sequence failed`, err);
        // h.api.createResponse( request, reply, 500, {}, '2-generic-001');
        h.api.createResponse(request, reply, 200, {}, '1-auth-1613802495917');
      }
    },
  });

  /**
   * @api {get} /v1/auth/password/reset/:token Get reset password record by token
   * @apiName AuthResetPasswordGet
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} token User reset password token
   */
  fastify.route({
    method: 'GET',
    url: '/auth/password/reset/:token',
    schema: {
      params: {
        token: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const { token } = request.params;
      try {
        const userResetPassword = await userResetPasswordController.findOne({
          token,
          status: constant.USER.RESET_PASSWORD.STATUS.ACTIVE,
        });
        h.api.createResponse(
          request,
          reply,
          200,
          {
            is_token_used: h.isEmpty(userResetPassword),
          },
          '1-auth-1613807356033',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to get reset password record by token`,
          err,
        );
        h.api.createResponse(request, reply, 500, {}, '2-generic-001');
      }
    },
  });

  /**
   * @api {post} /v1/auth/password/reset Reset password
   * @apiName AuthResetPassword
   * @apiVersion 1.0.0
   * @apiGroup Auth
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} token User reset password token
   */
  fastify.route({
    method: 'POST',
    url: '/auth/password/reset',
    onRequest: fastify.csrfProtection,
    schema: {
      body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string' },
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
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { token, password } = request.body;
      try {
        await h.database.transaction(async (transaction) => {
          await authController.confirmForgotPassword(token, password, {
            transaction,
          });
        });
        h.api.createResponse(request, reply, 200, {}, '1-auth-1613807437254');
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to reset password`, err);
        h.api.createResponse(request, reply, 500, {}, '2-generic-001');
      }
    },
  });

  next();
};
