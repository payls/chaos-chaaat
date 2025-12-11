const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const agencyUserController =
  require('../../../controllers/agencyUser').makeAgencyUserController(models);
const agencySubscriptionController =
  require('../../../controllers/agencySubscription').makeController(models);
const moment = require('moment');
module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/agency-user Super admin staff to get list of all agency users
   * @apiName StaffAgencyUserGetAgencyUsers
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} agency_users List of agency users
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_users": [
   *          {
   *            "created_date_seconds": 22000,
   *            "created_date_time_ago": "a day ago",
   *            "updated_date_seconds": 22000,
   *            "updated_date_time_ago": "a day ago",
   *            "agency_user_id": "7afb0288-bb15-11eb-a9ef-741d33a7ad70",
   *            "user_fk": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *            "agency_fk": "03885a2e-babc-11eb-a9ef-741d33a7ad70",
   *            "created_by": null,
   *            "created_date": "22 May 2021 03:50 pm",
   *            "updated_by": null,
   *            "updated_date": "22 May 2021 03:50 pm",
   *            "user": {
   *              "full_name": "Mervin Tan",
   *              "profile_picture_url": "https://cdn-staging.yourpave.com/user/profile/f8c9fe08a407011740f824a3b92fadf6d19bd9e555fefc770a6a0f39d1ccb26057395ecf263ba8f953d397866a0377ac9a8a6235abbbbe67e8fc456a518e2136.jpeg",
   *              "created_date_seconds": 15000,
   *              "created_date_time_ago": "2 months ago",
   *              "updated_date_seconds": 15000,
   *              "updated_date_time_ago": "2 months ago",
   *              "user_id": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *              "first_name": "Mervin",
   *              "middle_name": null,
   *              "last_name": "Tan",
   *              "email": "mervin@adaptels.com",
   *              "mobile_number": null,
   *              "date_of_birth": null,
   *              "gender": null,
   *              "nationality": null,
   *              "ordinarily_resident_location": null,
   *              "permanent_resident": null,
   *              "buyer_type": "",
   *              "status": "active",
   *              "created_by": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *              "created_date": "15 Mar 2021 02:09 am",
   *              "updated_by": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *              "updated_date": "15 Mar 2021 02:09 am",
   *              "created_date_raw": "2021-03-15T02:09:08.000Z",
   *              "updated_date_raw": "2021-03-15T02:09:08.000Z"
   *            },
   *            "created_date_raw": "2021-05-22T15:50:40.000Z",
   *            "updated_date_raw": "2021-05-22T15:50:57.000Z"
   *          }
   *      ]
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency-user',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  created_date_seconds: { type: 'number' },
                  created_date_time_ago: { type: 'string' },
                  updated_date_seconds: { type: 'number' },
                  updated_date_time_ago: { type: 'string' },
                  agency_user_id: { type: 'string' },
                  user_fk: { type: 'string' },
                  agency_fk: { type: 'string' },
                  created_by: { type: 'string' },
                  created_date: { type: 'string' },
                  updated_by: { type: 'string' },
                  updated_date: { type: 'string' },
                  created_date_raw: { type: 'string' },
                  updated_date_raw: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      full_name: { type: 'string' },
                      profile_picture_url: { type: 'string' },
                      created_date_seconds: { type: 'number' },
                      created_date_time_ago: { type: 'string' },
                      updated_date_seconds: { type: 'number' },
                      updated_date_time_ago: { type: 'string' },
                      user_id: { type: 'string' },
                      first_name: { type: 'string' },
                      middle_name: { type: 'string' },
                      last_name: { type: 'string' },
                      email: { type: 'string' },
                      mobile_number: { type: 'string' },
                      date_of_birth: { type: 'string' },
                      gender: { type: 'string' },
                      nationality: { type: 'string' },
                      ordinarily_resident_location: { type: 'string' },
                      permanent_resident: { type: 'string' },
                      buyer_type: { type: 'string' },
                      status: { type: 'string' },
                      created_by: { type: 'string' },
                      created_date: { type: 'string' },
                      updated_by: { type: 'string' },
                      updated_date: { type: 'string' },
                      created_date_raw: { type: 'string' },
                      updated_date_raw: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_fk } = await agencyUserController.findOne({
          user_fk: user_id,
        });
        const [userRoleRecord, currentAgencyUser] = await Promise.all([
          c.userRole.findOne({
            user_fk: user_id,
          }),
          c.agencyUser.findOne({
            user_fk: user_id,
          }),
        ]);
        const where = { agency_fk };
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

        const isAgencySalesUser =
          userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES;

        if (isAgencySalesUser) {
          where.agency_user_id = currentAgencyUser.agency_user_id;
        }

        const agency_users = await c.agencyUser.findAll(where, {
          include: [
            {
              model: models.user,
              required: true,
              attributes: { exclude: ['password', 'password_salt'] },
              include: inCludeRoleOptions,
            },
          ],
        });
        h.api.createResponse(
          req,
          res,
          200,
          { agency_users },
          '1-agency-user-1622184342',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1622184349', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency-user/current-user Get agency user record of current user
   * @apiName StaffAgencyUserGetAgencyUserForCurrentUser
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency-user/current-user',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id: current_user_id } = h.user.getCurrentUser(req);
        const agencyUser = await c.agencyUser.findOne(
          { user_fk: current_user_id },
          {
            include: [
              {
                model: models.agency,
                required: true,
                include: [
                  {
                    model: models.agency_config,
                  },
                ],
              },
              {
                model: models.user,
                required: true,
                attributes: [
                  'first_name',
                  'middle_name',
                  'last_name',
                  'mobile_number',
                  'email',
                  'hubspot_bcc_id',
                  'profile_picture_url',
                ],
                include: [
                  {
                    model: models.user_role,
                    attributes: ['user_role'],
                  },
                ],
              },
            ],
          },
        );

        const subscription = await agencySubscriptionController.findOne(
          {
            agency_fk: agencyUser.agency_fk,
          },
          { order: [['created_date', 'DESC']] },
        );

        let is_current_subscription_active = false;
        const currentDate = moment();
        if (
          h.notEmpty(subscription?.subscription_end) &&
          currentDate.isBefore(moment(subscription?.subscription_end))
        ) {
          is_current_subscription_active = true;
        }

        h.api.createResponse(
          req,
          res,
          200,
          {
            agencyUser,
            has_subscription: h.notEmpty(subscription),
            subscription_status: subscription?.status ?? 'no-data',
            is_current_subscription_active,
          },
          '1-agency-user-1622184418',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1622184497', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency-user/:agency_user_id Super admin staff to get single agency user
   * @apiName StaffAgencyUserGetAgencyUser
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency-user/:agency_user_id',
    schema: {
      params: {
        agency_user_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_user_id } = req.params;
        const agencyUser = await c.agencyUser.findOne({ agency_user_id });
        h.api.createResponse(
          req,
          res,
          200,
          { agencyUser },
          '1-agency-user-1622184418',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1622184497', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/agency-user Super admin staff to create agency user
   * @apiName StaffAgencyUserCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerError
   *
   * @apiParam {string} agency_fk Agency ID
   * @apiParam {string} user_fk User ID
   * @apiParam {string} description Agency user's description
   * @apiParam {string} instagram Agency user Instagram url
   * @apiParam {string} linkedin Agency user Linkedin url
   * @apiParam {string} facebook Agency user Facebook url
   * @apiParam {string} website Agency user website url
   * @apiParam {number} year_started Agency user starting year
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} agency_user_id Agency User id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_user_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/agency-user',
    schema: {
      body: {
        type: 'object',
        required: ['agency_fk'],
        properties: {
          agency_fk: { type: 'string' },
          description: { type: 'string' },
          instagram: { type: 'string' },
          linkedin: { type: 'string' },
          facebook: { type: 'string' },
          website: { type: 'string' },
          year_started: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_user_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const {
          agency_fk,
          description,
          instagram,
          linkedin,
          facebook,
          website,
          year_started,
        } = req.body;
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_user_id } = h.database.transaction(
          async (transaction) => {
            const agency_user_id = await c.agencyUser.create(
              {
                agency_fk,
                user_fk: user_id,
                description,
                instagram,
                linkedin,
                facebook,
                website,
                year_started,
                created_by: user_id,
              },
              { transaction },
            );
            return { agency_user_id };
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { agency_user_id },
          '1-agency-user-1622184423',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to create agency user`, { err });
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1622184515', {
          portal,
        });
      }
    },
  });

  /**
   * @api {put} /v1/staff/agency-user Super admin staff to update agency user
   * @apiName StaffAgencyUserUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerError
   *
   * @apiParam {string} agency_user_id Agency User ID
   * @apiParam {string} agency_fk Agency ID
   * @apiParam {string} user_fk User ID
   * @apiParam {string} description Agency user's description
   * @apiParam {string} instagram Agency user Instagram url
   * @apiParam {string} linkedin Agency user Linkedin url
   * @apiParam {string} facebook Agency user Facebook url
   * @apiParam {string} website Agency user website url
   * @apiParam {number} year_started Agency user starting year
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} agency_user_id Agency User id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_user_id": "1234"
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/agency-user',
    schema: {
      body: {
        type: 'object',
        required: ['agency_user_id'],
        properties: {
          agency_user_id: { type: 'string' },
          agency_fk: { type: 'string' },
          user_fk: { type: 'string' },
          description: { type: 'string' },
          instagram: { type: 'string' },
          linkedin: { type: 'string' },
          facebook: { type: 'string' },
          website: { type: 'string' },
          year_started: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_user_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const {
          agency_user_id,
          agency_fk,
          user_fk,
          description,
          instagram,
          linkedin,
          facebook,
          website,
          year_started,
        } = req.body;
        const { user_id } = h.user.getCurrentUser(req);

        const updatedAgencyUserId = await h.database.transaction(
          async (transaction) => {
            const updatedAgencyUserId = await c.agencyUser.update(
              agency_user_id,
              {
                agency_fk,
                user_fk,
                description,
                instagram,
                linkedin,
                facebook,
                website,
                year_started,
                updated_by: user_id,
              },
              { transaction },
            );
            return updatedAgencyUserId;
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { agency_user_id: updatedAgencyUserId },
          '1-agency-user-1622184438',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to update agency user record`, {
          err,
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1622184520', {
          portal,
        });
      }
    },
  });

  /**
   * @api {put} /v1/staff/agency-user Agency user to update user profile
   * @apiName StaffAgencyUserProfileUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User Profile
   * @apiUse ServerError
   *
   * @apiParam {string} agency_user_id Agency User ID
   * @apiParam {string} agency_fk Agency ID
   * @apiParam {string} user_fk User ID
   * @apiParam {string} description Agency user's description
   * @apiParam {string} instagram Agency user Instagram url
   * @apiParam {string} linkedin Agency user Linkedin url
   * @apiParam {string} facebook Agency user Facebook url
   * @apiParam {string} website Agency user website url
   * @apiParam {string} profile_picture_url Agency user profile picture
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} agency_user_id Agency User id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_user_id": "1234",
   *      "user_fk": "5678"
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/agency-user/user-profile',
    schema: {
      body: {
        type: 'object',
        required: ['agency_user_id'],
        properties: {
          agency_user_id: { type: 'string' },
          user_fk: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          mobile_number: { type: 'string' },
          hubspot_bcc_id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          instagram: { type: 'string' },
          linkedin: { type: 'string' },
          facebook: { type: 'string' },
          website: { type: 'string' },
          profile_picture_url: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_user_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const {
          agency_user_id,
          user_fk,
          first_name,
          last_name,
          mobile_number,
          hubspot_bcc_id,
          title,
          description,
          instagram,
          linkedin,
          facebook,
          website,
          profile_picture_url,
        } = req.body;
        const user_id = user_fk || h.user.getCurrentUser(req).user_id;
        const { updatedAgencyUserId, updatedUserId } =
          await h.database.transaction(async (transaction) => {
            // Update agency user record
            const updatedAgencyUserId = await c.agencyUser.update(
              agency_user_id,
              {
                title,
                description,
                instagram,
                linkedin,
                facebook,
                website,
                updated_by: user_id,
              },
              { transaction },
            );
            // Update user record
            const updatedUserId = await c.user.update(
              user_id,
              {
                first_name,
                last_name,
                mobile_number,
                profile_picture_url,
                hubspot_bcc_id,
                updated_by: user_id,
              },
              { transaction },
            );
            return { updatedAgencyUserId, updatedUserId };
          });
        h.api.createResponse(
          req,
          res,
          200,
          { agency_user_id: updatedAgencyUserId, user_fk: updatedUserId },
          '1-agency-user-1623401085',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: user failed to update agency user profile record`,
          { err },
        );
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1623401116', {
          portal,
        });
      }
    },
  });

  /**
   * @api {delete} /v1/staff/agency-user Super admin staff to delete agency user record by agency user ID
   * @apiName StaffAgencyUserDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} agency_user_id Agency User ID
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/agency-user',
    schema: {
      querystring: {
        agency_user_id: { type: 'string' },
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
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_user_id } = req.query;
        await h.database.transaction(async (transaction) => {
          return await c.agencyUser.destroy(
            { agency_user_id },
            { transaction },
          );
        });
        h.api.createResponse(req, res, 200, {}, '1-agency-user-1622184454', {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to delete agency user record`, {
          err,
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1622184530', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency-user/:agency_user_id/is_whatsapp_number
   * @apiName StaffAgencyUserValidateWhatsAppNumber
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} agency_user_id Agency User ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {boolean} is_agent_whatsapp_mobile Is WhatsApp Mobile Number.
   * @apiSuccess {boolean} waba Is agent WABA and credentials available.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "is_agent_whatsapp_mobile": false,
   *       "waba": true,
   *       "status": "ok",
   *       "message": "Retrieved agency user whatsapp mobile status successfully.",
   *       "message_code": "1-agency-user-whatsapp-mobile-1622184418"
   *  }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency-user/:agency_user_id/is_whatsapp_number',
    schema: {
      params: {
        agency_user_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_user_id } = req.params;
        const agencyUser = await c.agencyUser.findOne({ agency_user_id });
        const agency = await c.agency.findOne({
          agency_id: agencyUser.agency_fk,
        });
        const user = await c.user.findOne({ user_id: agencyUser.user_fk });

        let agent_whatsapp_status = {};
        if (h.cmpBool(user.is_whatsapp, true))
          agent_whatsapp_status = {
            is_agent_whatsapp_mobile: true,
            waba: true,
          };
        else {
          if (!h.isEmpty(agency.agency_whatsapp_api_token)) {
            const agencyWhatsAppCredentials =
              agency.agency_whatsapp_api_token +
              ':' +
              agency.agency_whatsapp_api_secret;
            const agencyBufferedCredentials = Buffer.from(
              agencyWhatsAppCredentials,
              'utf8',
            ).toString('base64');
            agent_whatsapp_status = await c.user.validateIfWhatsAppMobile({
              user_id: agencyUser.user_fk,
              api_credentials: agencyBufferedCredentials,
            });
          } else {
            agent_whatsapp_status = {
              is_agent_whatsapp_mobile: false,
              waba: false,
            };
          }
        }

        await h.database.transaction(async (transaction) => {
          await c.user.update(
            agencyUser.user_fk,
            {
              is_whatsapp: h.cmpBool(
                agent_whatsapp_status.is_agent_whatsapp_mobile,
                true,
              ),
            },
            { transaction },
          );
        });

        h.api.createResponse(
          req,
          res,
          200,
          agent_whatsapp_status,
          '1-agency-user-whatsapp-mobile-1622184418',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-user-whatsapp-mobile-1622184497',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency-user/search-by-full-name Get agency user record by owner full name
   * @apiName StaffAgencyUserGetAgencyUserByFullName
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency-user/search-by-full-name/:contact_owner',
    schema: {
      params: {
        contact_owner: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      try {
        const { contact_owner } = req.params;
        const agencyUser = await c.agencyUser.findOne(
          {},
          {
            include: [
              {
                model: models.user,
                required: true,
                where: {
                  [Op.and]: Sequelize.where(
                    Sequelize.fn(
                      'CONCAT',
                      Sequelize.col('user.first_name'),
                      ' ',
                      Sequelize.col('user.last_name'),
                    ),
                    {
                      [Sequelize.Op.like]: `%${contact_owner.trim()}%`,
                    },
                  ),
                },
              },
            ],
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { agencyUser },
          '1-agency-user-1622184418',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-agency-user-1622184497', {
          portal,
        });
      }
    },
  });

  next();
};
