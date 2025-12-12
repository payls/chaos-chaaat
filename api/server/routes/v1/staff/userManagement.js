const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const models = require('../../../models');
const h = require('../../../helpers');
const { Op } = require('sequelize');
const userMiddleware = require('../../../middlewares/user');
const agencyMiddleware = require('../../../middlewares/agency');
const agencyController =
  require('../../../controllers/agency').makeAgencyController(models);
const agencyUserController =
  require('../../../controllers/agencyUser').makeAgencyUserController(models);
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);
const userController = require('../../../controllers/user').makeUserController(
  models,
);
const authController = require('../../../controllers/auth').makeAuthController(
  models,
);
const config = require('../../../configs/config')(process.env.NODE_ENV);
const subscriptionController =
  require('../../../controllers/subscription').makeSubscriptionController(
    models,
  );
const UserManagementService = require('../../../services/staff/userManagement');
const { catchError } = require('../../../helpers/error');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/user-management/invite
   * @apiName InviteUser
   * @apiVersion 1.0.0
   * @apiGroup UserManagement
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} [first_name] First name
   * @apiParam {string} [last_name] Last name
   * @apiParam {string} [email] Email
   * @apiParam {string} [user_type] user type of the invitee
   */
  fastify.route({
    method: 'POST',
    url: '/staff/user-management/invite',
    schema: {
      body: {
        type: 'object',
        required: ['first_name', 'email', 'user_type'],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          user_type: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            method: { type: 'string' },
            message_code: { type: 'string' },
            invite_user_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
      await agencyMiddleware.canAddUser(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        // invited user details
        const { first_name, last_name, email, user_type } = request.body;

        // current user details
        const {
          user_id: current_user_id,
          first_name: user_first_name,
          last_name: user_last_name,
        } = h.user.getCurrentUser(request);

        // current user agency details
        const agency_user_details = await agencyUserController.findOne({
          user_fk: current_user_id,
        });
        const agency_details = await agencyController.findOne({
          agency_id: agency_user_details.agency_fk,
        });

        // check if agency limit is reached
        const subscription = await subscriptionController.findOne({
          subscription_id: agency_details.agency_subscription_fk,
        });
        const agency_user_list = await agencyUserController.findAll({
          agency_fk: agency_user_details.agency_fk,
        });
        if (subscription.subscription_max_users <= agency_user_list.length)
          h.api.createResponse(
            request,
            reply,
            500,
            {},
            '2-invite-1632350856723',
            {
              portal,
            },
          );

        // check if user already exists
        const invited_user = await userController.findOne({ email: email });
        let agency_invited_user;
        // if user exists, check if user is active or inactive
        if (h.notEmpty(invited_user)) {
          // if user exists, check if user is tied to an agency
          agency_invited_user = await agencyUserController.findOne({
            user_fk: invited_user.user_id,
          });
          if (
            h.notEmpty(agency_invited_user) &&
            !h.cmpStr(
              agency_invited_user.agency_fk,
              agency_user_details.agency_fk,
            )
          ) {
            h.api.createResponse(
              request,
              reply,
              500,
              {},
              '2-invite-1632352801443',
              {
                portal,
              },
            );
          } else if (
            h.notEmpty(agency_invited_user) &&
            h.cmpStr(
              agency_invited_user.agency_fk,
              agency_user_details.agency_fk,
            ) && // invited user and current user are in same agency
            h.cmpStr(invited_user.status, constant.USER.STATUS.INACTIVE)
          ) {
            // if user has already been invited by the same agency, do not send out another invite
            h.api.createResponse(
              request,
              reply,
              500,
              {},
              '2-invite-1632352801442',
              {
                portal,
              },
            );
          } else if (await userController.isUserActive(invited_user.user_id))
            // if user exists and is active
            h.api.createResponse(
              request,
              reply,
              500,
              {},
              '2-invite-1632188688485',
              {
                portal,
              },
            );
          // TODO: take care of deleted case
        } else {
          // invite user
          const invite_user_id = await h.database.transaction(
            async (transaction) => {
              let invite_user_id;
              if (h.isEmpty(invited_user)) {
                const invited_user = await authController.registerUserByEmail(
                  first_name,
                  last_name,
                  '',
                  email,
                  { send_email: false, transaction },
                );

                invite_user_id = invited_user.record.user_id;

                await userController.update(
                  invite_user_id,
                  {
                    status: constant.USER.STATUS.INACTIVE,
                    created_by: current_user_id,
                    updated_by: current_user_id,
                  },
                  { transaction },
                );
                await userRoleController.create(
                  {
                    user_fk: invite_user_id,
                    user_role: user_type,
                  },
                  { transaction },
                );
                await agencyUserController.create(
                  {
                    agency_fk: agency_user_details.agency_fk,
                    user_fk: invite_user_id,
                    created_by: current_user_id,
                  },
                  { transaction },
                );
              } else if (
                h.cmpStr(invited_user.status, constant.USER.STATUS.INACTIVE)
              ) {
                invite_user_id = invited_user.user_id;
                await agencyUserController.update(
                  agency_invited_user.agency_fk,
                  {
                    agency_fk: agency_user_details.agency_fk,
                    user_fk: invite_user_id,
                    created_by: current_user_id,
                  },
                  { transaction },
                );
              }

              await h.email.sendEmail(
                `Chaaat Team <registrations@${
                  config?.email?.domain || 'chaaat.io'
                }>`,
                email,
                null,
                h.getMessageByCode(
                  'template-invite-user-subject-1632282919050',
                  {
                    USER_WHO_IS_INVITING:
                      user_first_name + ' ' + user_last_name,
                    AGENCY_NAME: agency_details.agency_name,
                  },
                ),
                h.getMessageByCode('template-invite-user-body-1632283174576', {
                  INVITED_USER_NAME: first_name,
                  USER_WHO_IS_INVITING: user_first_name,
                  SIGNUP_URL: `${
                    config.webUrl
                  }/signup?invitee=${encodeURIComponent(
                    current_user_id,
                  )}&first_name=${encodeURIComponent(
                    first_name,
                  )}&last_name=${encodeURIComponent(
                    last_name,
                  )}&invited_email=${encodeURIComponent(email)}`,
                }),
              );
            },
          );
          h.api.createResponse(
            request,
            reply,
            200,
            { invite_user_id: invite_user_id },
            '2-invite-16194092',
            { portal },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to invite user`, { err });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-invite-1632202548228',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/user-management/check-access
   * @apiName check-access
   * @apiVersion 1.0.0
   * @apiGroup UserManagement
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} allowed_user_role user_role required for access
   */
  fastify.route({
    method: 'POST',
    url: '/staff/user-management/check-access',
    schema: {
      body: {
        type: 'object',
        required: ['allowed_user_role'],
        properties: {
          allowed_user_role: { type: 'array' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            method: { type: 'string' },
            message_code: { type: 'string' },
            access_allowed: { type: 'boolean' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);
      try {
        // invited user details
        const { allowed_user_role } = request.body;

        // current user details
        const { user_id } = h.user.getCurrentUser(request);

        const access_allowed = await authController.hasPermissionLevel(
          user_id,
          allowed_user_role,
        );

        h.api.createResponse(
          request,
          reply,
          200,
          { access_allowed },
          '1-auth-1635225686340',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to check access level`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-auth-1635225659042', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/user-management/fina-all
   * @apiName FindAllUsersInAnAgency
   * @apiVersion 1.0.0
   * @apiGroup UserManagement
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   **/

  fastify.route({
    method: 'GET',
    url: '/staff/user-management/find-all',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_users: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const portal = h.request.getPortal(request);
      try {
        const { user_id } = h.user.getCurrentUser(request);
        const { agency_fk } = await agencyUserController.findOne({
          user_fk: user_id,
        });
        const userRoleRecord = await userRoleController.findOne({
          user_fk: user_id,
        });

        const inCludeRoleOptions = [
          {
            model: models.user_role,
            required: true,
          },
        ];
        // if not super admin - don not show super admin users in list
        if (!h.cmpStr(userRoleRecord.user_role, 'super_admin')) {
          inCludeRoleOptions[0].where = {
            user_role: {
              [Op.ne]: 'super_admin',
            },
          };
        }

        const agency_users = await agencyUserController.findAll(
          { agency_fk },
          {
            include: [
              {
                model: models.user,
                required: false,
                include: inCludeRoleOptions,
              },
            ],
          },
        );

        h.api.createResponse(request, response, 200, { agency_users }, '', {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to retrieve agency users`, { err });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-invite-1632202462400',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/user-management/:user_id
   * @apiName DeleteUserById
   * @apiVersion 1.0.0
   * @apiGroup UserManagement
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   **/

  fastify.route({
    method: 'DELETE',
    url: '/staff/user-management/:user_id',
    schema: {
      params: {
        user_id: { type: 'string', format: 'uuid' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            user_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const portal = h.request.getPortal(request);
      try {
        const { user_id } = request.params;
        const currentUser = h.user.getCurrentUser(request);
        const { agency_fk } = await agencyUserController.findOne({
          user_fk: currentUser.user_id,
        });

        request.params.agency_fk = agency_fk;

        // Validate if the record is not self
        if (user_id === currentUser.user_id) {
          request.log.warn({
            url: request.url,
            message: 'User is trying to delete own record.',
          });
          return h.api.createResponse(
            request,
            response,
            400,
            { user_id },
            '2-user-management-delete-user-1652068512231',
            {
              portal,
            },
          );
        }
        const userManagementService = new UserManagementService();
        const [err, result] = await h.database.transaction(
          async (transaction) => {
            userManagementService.setDbTransaction(transaction);
            return catchError(userManagementService.deleteUser(request));
          },
        );
        if (err && err.message === 'INVALID_USER_ERROR') {
          request.log.warn({
            url: request.url,
            message: 'Invalid agency user records.',
          });
          return h.api.createResponse(
            request,
            response,
            400,
            { user_id },
            '2-user-management-delete-user-1652068512231',
            {
              portal,
            },
          );
        }
        if (err) {
          Sentry.captureException(err);
          return h.api.createResponse(
            request,
            response,
            500,
            {},
            '2-user-management-delete-user-1652068512231',
            { portal },
          );
        } else {
          return h.api.createResponse(
            request,
            response,
            200,
            {},
            '1-user-management-delete-user-1652068512231',
            { ...result },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          url: request.url,
          message: 'Failed to delete a user.',
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-user-management-delete-user-1652068512231',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/user-management/reinvite
   * @apiName ReInviteUser
   * @apiVersion 1.0.0
   * @apiGroup UserManagement
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} [agency_id] Agency ID
   * @apiParam {string} [user_ids] Agency user IDs
   */

  fastify.route({
    method: 'POST',
    url: '/staff/user-management/reinvite',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'user_ids'],
        properties: {
          agency_id: { type: 'string' },
          user_ids: { type: 'array' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        // agency id
        const { agency_id, user_ids } = request.body;

        // agency details
        const agency = await models.agency.findOne({
          where: {
            agency_id: agency_id,
          },
        });

        // agency name
        const agency_name = agency?.dataValues?.agency_name;

        // get agency users with inactive status
        const agency_users = await models.agency_user.findAll({
          where: {
            agency_user_id: {
              [Op.in]: user_ids,
            },
          },
          include: [
            {
              model: models.user,
              where: { status: 'inactive' },
              required: true,
            },
          ],
        });

        for (const record of agency_users) {
          const inactive_agent_user_id = record?.dataValues?.user_fk; // to be reinvited
          const inactive_agent_user_firstname =
            record?.dataValues?.user?.first_name;
          const inactive_agent_user_lastname =
            record?.dataValues?.user?.last_name;
          const inactive_agent_email = record?.dataValues?.user?.email;

          const agent_user_id = record?.dataValues?.created_by; // the one that will show as inviter
          const agent = await models.user.findOne({
            where: {
              user_id: agent_user_id,
            },
          });

          const agent_first_name = agent?.dataValues?.first_name;
          const agent_last_name = agent?.dataValues?.last_name;

          console.log(
            'Activation Reinvitation',
            inactive_agent_email,
            inactive_agent_user_firstname,
            inactive_agent_user_lastname,
          );

          await h.email.sendEmail(
            `Chaaat Team <registrations@chaaat.io>`,
            inactive_agent_email,
            null,
            h.getMessageByCode('template-invite-user-subject-1632282919050', {
              USER_WHO_IS_INVITING: agent_first_name + ' ' + agent_last_name,
              AGENCY_NAME: agency_name,
            }),
            h.getMessageByCode('template-invite-user-body-1632283174576', {
              INVITED_USER_NAME: inactive_agent_user_firstname,
              USER_WHO_IS_INVITING: agent_first_name,
              AGENCY_NAME: agency_name,
              SIGNUP_URL: `https://app.chaaat.io/signup?invitee=${encodeURIComponent(
                inactive_agent_user_id,
              )}&first_name=${encodeURIComponent(
                inactive_agent_user_firstname,
              )}&last_name=${encodeURIComponent(
                inactive_agent_user_lastname,
              )}&invited_email=${encodeURIComponent(inactive_agent_email)}`,
            }),
          );
        }

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-resend-invite-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to resend account activation email`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-resend-invite-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/agency/user/email-reinvite/:email_address',
    schema: {
      params: {
        email_address: { type: 'string' },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        const { email_address } = request.params;

        const user = await models.user.findOne({
          where: {
            email: email_address,
          },
        });

        const user_id = user?.dataValues.user_id;

        const agency_user = await models.agency_user.findOne({
          where: {
            user_fk: user_id,
          },
          include: [
            {
              model: models.agency,
              required: true,
            },
          ],
        });

        // agency name
        const agency_name = agency_user?.dataValues?.agency?.agency_name;

        const agent_first_name = user?.dataValues?.first_name;
        const agent_last_name = user?.dataValues?.last_name;

        console.log(
          'Activation Reinvitation',
          email_address,
          agent_first_name,
          agent_last_name,
        );

        await h.email.sendEmail(
          `Chaaat Team <registrations@chaaat.io>`,
          email_address,
          null,
          h.getMessageByCode(
            'template-resend-invite-user-subject-1632282919050',
            {
              AGENCY_NAME: agency_name,
            },
          ),
          h.getMessageByCode('template-resend-invite-user-body-1632283174576', {
            INVITED_USER_NAME: agent_first_name,
            SIGNUP_URL: `https://app.chaaat.io/signup?invitee=${encodeURIComponent(
              user_id,
            )}&first_name=${encodeURIComponent(
              agent_first_name,
            )}&last_name=${encodeURIComponent(
              agent_last_name,
            )}&invited_email=${encodeURIComponent(email_address)}`,
          }),
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-resend-invite-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to resend account activation email`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-resend-invite-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/agency/user/resend-verification/:email_address',
    schema: {
      params: {
        email_address: { type: 'string' },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        const { email_address } = request.params;

        const user = await models.user.findOne({
          where: {
            email: email_address,
          },
        });

        const user_id = user?.dataValues.user_id;
        const userEmailVerification =
          await models.user_email_verification.findOne({
            where: {
              user_fk: user_id,
            },
          });

        const emailVerificationUrl = `${
          config.webUrl
        }/auth/verify-email?email=${encodeURIComponent(email_address)}&token=${
          userEmailVerification?.dataValues?.token
        }`;

        const agent_first_name = user?.dataValues?.first_name;

        await h.email.sendEmail(
          `Chaaat Team <registrations@${config?.email?.domain || 'chaaat.io'}>`,
          user.email,
          null,
          h.getMessageByCode(
            'template-emailVerification-subject-1601338955192',
          ),
          h.getMessageByCode('template-emailVerification-body-1601338955192', {
            FIRST_NAME: agent_first_name,
            EMAIL_VERIFICATION_URL: emailVerificationUrl,
          }),
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-resend-verification-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to resend verification email`, {
          err,
        });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-resend-verification-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
