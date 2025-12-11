const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const models = require('../../../models');
const { Op } = require('sequelize');
const _ = require('lodash');
const geoip = require('geoip-lite');
const sequelize = require('sequelize');

// Controllers
const projectController =
  require('../../../controllers/project').makeProjectController(models);
const projectPropertyController =
  require('../../../controllers/projectProperty').makeProjectPropertyController(
    models,
  );
const contactController =
  require('../../../controllers/contact').makeContactController(models);

const contactLeadScoreController =
  require('../../../controllers/contactLeadScore').makeContactLeadScoreController(
    models,
  );

const contactActivityController =
  require('../../../controllers/contactActivity').makeContactActivityController(
    models,
  );

const agencyUserController =
  require('../../../controllers/agencyUser').makeAgencyUserController(models);

const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);

const userController = require('../../../controllers/user').makeUserController(
  models,
);

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/dashboard/stats Retrieve dashboard statistics
   * @apiName StaffDashboardGetStatistics
   * @apiVersion 1.0.0
   * @apiGroup StaffDashboardStatistics
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} dashboard_stats Dashboard statistics
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "dashboard_stats": "{
   *          "projectCount": "5",
   *          "propertyCount": "79",
   *          "liveLeadCount": "40",
   *          "shortlistedPropertyCount": "20"
   *      }"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/stats',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const agencyUser = await c.agencyUser.findOne({
        user_fk: current_user_id,
      });
      const agency_id = agencyUser.agency_fk;
      const agencyUserId = agencyUser.agency_user_id;
      try {
        const dashboard_stats = {};
        // Retrieve all projects
        const projectRecords = await projectController.findAll(
          { agency_fk: agency_id, is_deleted: { [Op.eq]: 0 } },
          {
            include: [
              {
                model: models.project_property,
                required: false,
                where: { is_deleted: { [Op.eq]: 0 } },
              },
            ],
          },
        );

        // Temporary measure for three projects Crown Tower, Queen Tower 1, Queen Tower 2
        // if (
        //   ![
        //     "7c2787c0-d3f8-11eb-8182-065264a181d4", // Century21 agency in production
        //     "d142b4dd-bbec-11eb-8026-02b1ece053a6", // Pave sample agency in production
        //     "03885a2e-babc-11eb-a9ef-741d33a7ad70", // Sample agency in development
        //   ].includes(agency_id)
        // ) {
        //   projectRecords = projectRecords.filter((project) => {
        //     if (
        //       project.id === 257 // Yarra One
        //     )
        //       return project;
        //   });
        // }

        dashboard_stats.projectCount = projectRecords.length || 0;

        const projectIds = [];
        projectRecords.forEach((project) => {
          projectIds.push(project.project_id);
        });
        // Retrieve all property units across projects
        const projectProperties = await projectPropertyController.findAll({
          project_fk: projectIds,
          is_deleted: 0,
        });
        dashboard_stats.propertyCount = h.notEmpty(projectProperties)
          ? projectProperties.length
          : 0;

        // Retrieve all live lead urls created
        dashboard_stats.liveLeadCount = await c.contact.countPermaLinks({
          agency_user_fk: agencyUserId,
        });
        // Retrieve shortlisted property count with unique ID
        const columnName = 'property_fk';
        dashboard_stats.shortlistedPropertyCount =
          await c.shortListedProperty.countUnique(columnName);
        h.api.createResponse(
          response,
          200,
          { dashboard_stats },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: user failed to retrieve dashboard statistics`,
          { err },
        );
        h.api.createResponse(response, 500, {}, '2-dashboard-1622276249', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/dashboard/proposal-sent Retrieve proposal sent statistics
   * @apiName StaffDashboardGetProposalSentStatistics
   * @apiVersion 1.0.0
   * @apiGroup StaffDashboardGetProposalSentStatistics
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} proposal_sent Dashboard statistics
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "proposal_sent": "{
   *          "count": "5",
   
   *      }"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/proposal-sent',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      console.log('💥💥💥💥💥💥💥');

      const { agency_id, agent_user_id, from, to, project_id } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const { agency_user_id } = await agencyUserController.findOne({
        user_fk: current_user_id,
      });
      const userRoleRecord = await userRoleController.findOne({
        user_fk: current_user_id,
      });

      const where = {};
      let include = null;

      // filter by contact owner
      if (agent_user_id) {
        const ids = agent_user_id.split(',');
        where.agency_user_fk = { [Op.in]: ids };
      }

      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        where.agency_user_fk = agency_user_id;
      } else {
        // filter by contact owner
        if (agent_user_id) {
          const ids = agent_user_id.split(',');
          where.agency_user_fk = { [Op.in]: ids };
        }
      }

      const pave_agencies = [
        '0374204c-e60e-4e8c-bdac-0c161bb85556',
        '053196ee-154c-43db-85da-85d748f55842',
        '08012e63-a6ce-4cb1-abdf-89b592955729',
        '111cbf40-8bbb-4d92-ab7d-2e530dba87e5',
        '31db0ca9-c270-40a8-a177-5a4bf513d1fd',
        '3e1b488c-3c39-4338-93c3-a0e0c6dadeb9',
        '4beae7df-bfd6-4033-8e0b-1208fbead6d2',
        '65fad4ef-cc52-4eaf-83d6-8688ec78eb02',
        '89fc088e-b64e-496a-a7ca-2213d2065435',
        '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
        'e142b4dd-bbec-11eb-8026-02b1ece053a6',
      ];

      if (!pave_agencies.includes(agency_id)) {
        const paveUser = await agencyUserController.findOne(
          {
            agency_fk: agency_id,
          },
          {
            include: {
              model: models.user,
              required: true,
              where: {
                email: {
                  [Op.like]: '%yourpave.com%',
                },
                first_name: 'Pave',
              },
            },
          },
        );

        if (paveUser?.dataValues?.agency_user_id) {
          where.agency_user_fk = {
            [Op.ne]: paveUser?.dataValues?.agency_user_id,
          };
        }
      }

      // filter by date - permalink sent date
      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        where.permalink_sent_date = { [Op.between]: [startDate, endDate] };
      }

      // filter by project
      if (project_id) {
        const ids = project_id.split(',');
        include = [
          {
            model: models.shortlisted_project,
            required: true,
            where: { project_fk: { [Op.in]: ids } },
          },
        ];
      }

      try {
        const contacts = await contactController.count(
          {
            agency_fk: agency_id,
            ...where,
          },
          { include },
        );

        const proposal_sent = {
          count: contacts,
        };
        h.api.createResponse(
          request,
          response,
          200,
          { proposal_sent, filters: { where, include } },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
        console.log(err);
        console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');

        h.api.createResponse(
          request,
          response,
          500,
          { filters: { where, include } },
          '2-dashboard-1622276249',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/dashboard/proposal-opened Retrieve proposal oponed statistics
   * @apiName StaffDashboardGetProposalOpenedStatistics
   * @apiVersion 1.0.0
   * @apiGroup StaffDashboardGetProposalOpenedStatistics
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} proposal_opened Dashboard statistics
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "proposal_opened": "{
   *          "count": "5",
   
   *      }"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/proposal-opened',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      console.log('💥💥💥💥💥💥💥');

      const { agency_id, agent_user_id, from, to, project_id } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const { agency_user_id } = await agencyUserController.findOne({
        user_fk: current_user_id,
      });
      const userRoleRecord = await userRoleController.findOne({
        user_fk: current_user_id,
      });

      const where = {};
      let include = null;

      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        where.agency_user_fk = agency_user_id;
      } else {
        // filter by contact owner
        if (agent_user_id) {
          const ids = agent_user_id.split(',');
          where.agency_user_fk = { [Op.in]: ids };
        }
      }

      const pave_agencies = [
        '0374204c-e60e-4e8c-bdac-0c161bb85556',
        '053196ee-154c-43db-85da-85d748f55842',
        '08012e63-a6ce-4cb1-abdf-89b592955729',
        '111cbf40-8bbb-4d92-ab7d-2e530dba87e5',
        '31db0ca9-c270-40a8-a177-5a4bf513d1fd',
        '3e1b488c-3c39-4338-93c3-a0e0c6dadeb9',
        '4beae7df-bfd6-4033-8e0b-1208fbead6d2',
        '65fad4ef-cc52-4eaf-83d6-8688ec78eb02',
        '89fc088e-b64e-496a-a7ca-2213d2065435',
        '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
        'e142b4dd-bbec-11eb-8026-02b1ece053a6',
      ];

      if (!pave_agencies.includes(agency_id)) {
        const paveUser = await agencyUserController.findOne(
          {
            agency_fk: agency_id,
          },
          {
            include: {
              model: models.user,
              required: true,
              where: {
                email: {
                  [Op.like]: '%yourpave.com%',
                },
                first_name: 'Pave',
              },
            },
          },
        );

        if (paveUser?.dataValues?.agency_user_id) {
          where.agency_user_fk = {
            [Op.ne]: paveUser?.dataValues?.agency_user_id,
          };
        }
      }

      // filter by date - permalink sent date
      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        where.permalink_sent_date = { [Op.between]: [startDate, endDate] };
      }

      // filter by project
      if (project_id) {
        const ids = project_id.split(',');
        include = [
          {
            model: models.shortlisted_project,
            required: true,
            where: { project_fk: { [Op.in]: ids } },
          },
        ];
      }

      try {
        const contacts = await contactController.count(
          {
            agency_fk: agency_id,
            permalink_last_opened: {
              [Op.ne]: null,
            },
            ...where,
          },
          { include },
        );

        const proposal_opened = {
          count: contacts,
        };
        h.api.createResponse(
          request,
          response,
          200,
          { proposal_opened, filters: { where, include } },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
        console.log(err);
        console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');

        h.api.createResponse(
          request,
          response,
          500,
          { filters: { where, include } },
          '2-dashboard-1622276249',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/dashboard/engagement-score Retrieve engagement score statistics
   * @apiName StaffDashboardGetEngagementScoreStatistics
   * @apiVersion 1.0.0
   * @apiGroup StaffDashboardGetEngagementScoreStatistics
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} engagement_score Dashboard statistics
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "engagement_score": "{
   *         ...
   *      }"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/engagement-score',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      console.log('💥💥💥💥💥💥💥');

      const { agency_id, agent_user_id, from, to, project_id } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const { agency_user_id } = await agencyUserController.findOne({
        user_fk: current_user_id,
      });
      const userRoleRecord = await userRoleController.findOne({
        user_fk: current_user_id,
      });

      const where = {};
      const include = [];
      let contactInclude = {};

      const pave_agencies = [
        '0374204c-e60e-4e8c-bdac-0c161bb85556',
        '053196ee-154c-43db-85da-85d748f55842',
        '08012e63-a6ce-4cb1-abdf-89b592955729',
        '111cbf40-8bbb-4d92-ab7d-2e530dba87e5',
        '31db0ca9-c270-40a8-a177-5a4bf513d1fd',
        '3e1b488c-3c39-4338-93c3-a0e0c6dadeb9',
        '4beae7df-bfd6-4033-8e0b-1208fbead6d2',
        '65fad4ef-cc52-4eaf-83d6-8688ec78eb02',
        '89fc088e-b64e-496a-a7ca-2213d2065435',
        '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
        'e142b4dd-bbec-11eb-8026-02b1ece053a6',
      ];

      if (!pave_agencies.includes(agency_id)) {
        const paveUser = await agencyUserController.findOne(
          {
            agency_fk: agency_id,
          },
          {
            include: {
              model: models.user,
              required: true,
              where: {
                email: {
                  [Op.like]: '%yourpave.com%',
                },
                first_name: 'Pave',
              },
            },
          },
        );

        if (paveUser?.dataValues?.agency_user_id) {
          contactInclude = {
            model: models.contact,
            required: true,
            where: {
              agency_fk: agency_id,
              agency_user_fk: {
                [Op.ne]: paveUser?.dataValues?.agency_user_id,
              },
            },
            include: [],
            attributes: [],
          };
        } else {
          contactInclude = {
            model: models.contact,
            required: true,
            where: {
              agency_fk: agency_id,
            },
            include: [],
            attributes: [],
          };
        }
      } else {
        contactInclude = {
          model: models.contact,
          required: true,
          where: {
            agency_fk: agency_id,
          },
          include: [],
          attributes: [],
        };
      }

      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        contactInclude.where = {
          ...contactInclude.where,
          agency_user_fk: agency_user_id,
        };
      } else {
        // filter by contact owner
        if (agent_user_id) {
          const ids = agent_user_id.split(',');
          contactInclude.where = {
            ...contactInclude.where,
            agency_user_fk: { [Op.in]: ids },
          };
        }
      }

      // filter by date - activity date
      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        where.activity_date = { [Op.between]: [startDate, endDate] };
        // where.contact_fk = '41228449-6256-4e41-923b-c4f1b39ea856';
      }

      // filter by project
      if (project_id) {
        const ids = project_id.split(',');
        contactInclude.include = [
          {
            model: models.shortlisted_project,
            required: true,
            where: { project_fk: { [Op.in]: ids } },
            attributes: [],
          },
        ];
      }

      include.push(contactInclude);

      try {
        const contactActivitiesCount = await contactActivityController.findAll(
          { ...where, is_deleted: 0 },
          {
            include,
            attributes: ['activity_type', 'activity_meta', 'contact_fk'],
          },
        );

        // get values per activity type
        const parsedContactActivities = [];
        for (const type of contactActivitiesCount) {
          const value = await c.contactActivity.getActivityScore(
            type.activity_type,
            type.activity_meta,
            type.contact_fk,
          );

          if (value && value > 0) {
            parsedContactActivities.push({
              // activity_type: type.activity_type,
              value,
              contact_fk: type.contact_fk,
            });
          }
        }

        // Group and sum activity type scores
        const groupedData = _.groupBy(parsedContactActivities, 'contact_fk');
        const sumData = _.mapValues(groupedData, (group) =>
          _.sumBy(group, 'value'),
        );

        // (Ranges; 10, 11-40, 41-99, 100+)
        const ranges = {
          10: 0,
          '11-40': 0,
          '41-99': 0,
          '100+': 0,
        };

        for (const a in sumData) {
          if (sumData[a] <= 10) {
            ranges['10'] += 1;
          } else if (sumData[a] >= 10 && sumData[a] <= 40) {
            ranges['11-40'] += 1;
          } else if (sumData[a] >= 41 && sumData[a] <= 99) {
            ranges['41-99'] += 1;
          } else {
            ranges['100+'] += 1;
          }
        }

        const removedNoValueData = Object.fromEntries(
          Object.entries(ranges).filter(([key, value]) => value !== 0),
        );

        const engagement_score = {
          ...removedNoValueData,
        };
        h.api.createResponse(
          request,
          response,
          200,
          { engagement_score, filters: { where, include, contactInclude } },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);        
        console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
        console.log(err);
        console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');

        h.api.createResponse(
          request,
          response,
          500,
          { filters: { where, include } },
          '2-dashboard-1622276249',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/dashboard/device-type Retrieve device type statistics
   * @apiName StaffDashboardGetDeviceTypeStatistics
   * @apiVersion 1.0.0
   * @apiGroup StaffDashboardGetDeviceTypeStatistics
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} device_type Dashboard statistics
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "device_type": "{
   *          ....
   
   *      }"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/device-type',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      console.log('💥💥💥💥💥💥💥');

      const { agency_id, agent_user_id, from, to, project_id } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const { agency_user_id } = await agencyUserController.findOne({
        user_fk: current_user_id,
      });
      const userRoleRecord = await userRoleController.findOne({
        user_fk: current_user_id,
      });

      const where = {};
      const include = [];
      let contactInclude = {};

      const pave_agencies = [
        '0374204c-e60e-4e8c-bdac-0c161bb85556',
        '053196ee-154c-43db-85da-85d748f55842',
        '08012e63-a6ce-4cb1-abdf-89b592955729',
        '111cbf40-8bbb-4d92-ab7d-2e530dba87e5',
        '31db0ca9-c270-40a8-a177-5a4bf513d1fd',
        '3e1b488c-3c39-4338-93c3-a0e0c6dadeb9',
        '4beae7df-bfd6-4033-8e0b-1208fbead6d2',
        '65fad4ef-cc52-4eaf-83d6-8688ec78eb02',
        '89fc088e-b64e-496a-a7ca-2213d2065435',
        '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
        'e142b4dd-bbec-11eb-8026-02b1ece053a6',
      ];

      if (!pave_agencies.includes(agency_id)) {
        const paveUser = await agencyUserController.findOne(
          {
            agency_fk: agency_id,
          },
          {
            include: {
              model: models.user,
              required: true,
              where: {
                email: {
                  [Op.like]: '%yourpave.com%',
                },
                first_name: 'Pave',
              },
            },
          },
        );

        if (paveUser?.dataValues?.agency_user_id) {
          contactInclude = {
            model: models.contact,
            required: true,
            where: {
              agency_fk: agency_id,
              agency_user_fk: {
                [Op.ne]: paveUser?.dataValues?.agency_user_id,
              },
            },
            include: [],
            attributes: [],
          };
        } else {
          contactInclude = {
            model: models.contact,
            required: true,
            where: {
              agency_fk: agency_id,
            },
            include: [],
            attributes: [],
          };
        }
      } else {
        contactInclude = {
          model: models.contact,
          required: true,
          where: {
            agency_fk: agency_id,
          },
          include: [],
          attributes: [],
        };
      }

      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        contactInclude.where = {
          ...contactInclude.where,
          agency_user_fk: agency_user_id,
        };
      } else {
        // filter by contact owner
        if (agent_user_id) {
          const ids = agent_user_id.split(',');
          contactInclude.where = {
            ...contactInclude.where,
            agency_user_fk: { [Op.in]: ids },
          };
        }
      }

      // filter by date - activity date
      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        where.activity_date = { [Op.between]: [startDate, endDate] };
        // where.contact_fk = '41228449-6256-4e41-923b-c4f1b39ea856';
      }

      // filter by project
      if (project_id) {
        const ids = project_id.split(',');
        contactInclude.include = [
          {
            model: models.shortlisted_project,
            required: true,
            where: { project_fk: { [Op.in]: ids } },
            attributes: [],
          },
        ];
      }

      include.push(contactInclude);

      try {
        const contactActivitiesCount = await contactActivityController.findAll(
          { ...where, is_deleted: 0 },
          {
            include,
            attributes: ['viewed_on_device'],
            group: ['contact_activity.contact_fk', 'viewed_on_device'],
          },
        );

        // get values per activity type
        const parsedContactActivities = [];
        for (const type of contactActivitiesCount) {
          if (type.viewed_on_device) {
            const value = await h.contactActivity.prettifyViewOnDeviceString(
              type.viewed_on_device,
              true,
            );

            parsedContactActivities.push({
              device_type: value,
              value: 1,
            });
          }
        }

        // Group and sum device type
        const groupedData = _.groupBy(parsedContactActivities, 'device_type');
        const sumData = _.mapValues(groupedData, (group) =>
          _.sumBy(group, 'value'),
        );

        const device_type = {
          // count: 0,
          ...sumData,
        };
        h.api.createResponse(
          request,
          response,
          200,
          { device_type, filters: { where, include, contactInclude } },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
        console.log(err);
        console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');

        h.api.createResponse(
          request,
          response,
          500,
          { filters: { where, include } },
          '2-dashboard-1622276249',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/dashboard/activity-location Retrieve activity location statistics
   * @apiName StaffDashboardGetActivityLocationStatistics
   * @apiVersion 1.0.0
   * @apiGroup StaffDashboardGetActivityLocationStatistics
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} activity_locations Dashboard statistics
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "activity_locations": "{
   *          ....
   
   *      }"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/activity-location',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      console.log('💥💥💥💥💥💥💥');

      const { agency_id, agent_user_id, from, to, project_id } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const { agency_user_id } = await agencyUserController.findOne({
        user_fk: current_user_id,
      });
      const userRoleRecord = await userRoleController.findOne({
        user_fk: current_user_id,
      });

      const where = {};
      const include = [];
      let contactInclude = {};

      const pave_agencies = [
        '0374204c-e60e-4e8c-bdac-0c161bb85556',
        '053196ee-154c-43db-85da-85d748f55842',
        '08012e63-a6ce-4cb1-abdf-89b592955729',
        '111cbf40-8bbb-4d92-ab7d-2e530dba87e5',
        '31db0ca9-c270-40a8-a177-5a4bf513d1fd',
        '3e1b488c-3c39-4338-93c3-a0e0c6dadeb9',
        '4beae7df-bfd6-4033-8e0b-1208fbead6d2',
        '65fad4ef-cc52-4eaf-83d6-8688ec78eb02',
        '89fc088e-b64e-496a-a7ca-2213d2065435',
        '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
        'e142b4dd-bbec-11eb-8026-02b1ece053a6',
      ];

      if (!pave_agencies.includes(agency_id)) {
        const paveUser = await agencyUserController.findOne(
          {
            agency_fk: agency_id,
          },
          {
            include: {
              model: models.user,
              required: true,
              where: {
                email: {
                  [Op.like]: '%yourpave.com%',
                },
                first_name: 'Pave',
              },
            },
          },
        );

        if (paveUser?.dataValues?.agency_user_id) {
          contactInclude = {
            model: models.contact,
            required: true,
            where: {
              agency_fk: agency_id,
              agency_user_fk: {
                [Op.ne]: paveUser?.dataValues?.agency_user_id,
              },
            },
            include: [],
            attributes: [],
          };
        } else {
          contactInclude = {
            model: models.contact,
            required: true,
            where: {
              agency_fk: agency_id,
            },
            include: [],
            attributes: [],
          };
        }
      } else {
        contactInclude = {
          model: models.contact,
          required: true,
          where: {
            agency_fk: agency_id,
          },
          include: [],
          attributes: [],
        };
      }

      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        contactInclude.where = {
          ...contactInclude.where,
          agency_user_fk: agency_user_id,
        };
      } else {
        // filter by contact owner
        if (agent_user_id) {
          const ids = agent_user_id.split(',');
          contactInclude.where = {
            ...contactInclude.where,
            agency_user_fk: { [Op.in]: ids },
          };
        }
      }

      // filter by date - activity date
      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        where.activity_date = { [Op.between]: [startDate, endDate] };
        // where.contact_fk = '41228449-6256-4e41-923b-c4f1b39ea856';
      }

      // filter by project
      if (project_id) {
        const ids = project_id.split(',');
        contactInclude.include = [
          {
            model: models.shortlisted_project,
            required: true,
            where: { project_fk: { [Op.in]: ids } },
            attributes: [],
          },
        ];
      }

      include.push(contactInclude);

      try {
        const contactActivitiesCount = await contactActivityController.findAll(
          { ...where, is_deleted: 0 },
          {
            include,
            attributes: ['activity_ip'],
            group: ['activity_ip'],
          },
        );

        // get values per activity type
        const parsedContactActivities = [];
        for (const type of contactActivitiesCount) {
          let value = 'Unknown';
          const geo = await geoip.lookup(type.activity_ip);

          if (h.notEmpty(geo)) {
            value = geo.country;
          }

          parsedContactActivities.push({
            location: value,
            value: 1,
          });
        }

        // Group and sum device type
        const groupedData = _.groupBy(parsedContactActivities, 'location');
        const sumData = _.mapValues(groupedData, (group) =>
          _.sumBy(group, 'value'),
        );

        const activity_location = {
          ...sumData,
        };
        h.api.createResponse(
          request,
          response,
          200,
          { activity_location, filters: { where, include, contactInclude } },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
        console.log(err);
        console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');

        h.api.createResponse(
          request,
          response,
          500,
          { filters: { where, include } },
          '2-dashboard-1622276249',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/dashboard/sent-method Retrieve sent method statistics
   * @apiName StaffDashboardGetSentMethodStatistics
   * @apiVersion 1.0.0
   * @apiGroup StaffDashboardGetSentMethodStatistics
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} sent_method Dashboard statistics
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "sent_method": "{
   *          ....
   
   *      }"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/sent-method',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      console.log('💥💥💥💥💥💥💥');
      const { agency_id, agent_user_id, from, to, project_id } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const { agency_user_id } = await agencyUserController.findOne({
        user_fk: current_user_id,
      });
      const userRoleRecord = await userRoleController.findOne({
        user_fk: current_user_id,
      });

      const where = {};
      const include = [];

      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        where.agency_user_fk = agency_user_id;
      } else {
        // filter by contact owner
        if (agent_user_id) {
          const ids = agent_user_id.split(',');

          where.agency_user_fk = { [Op.in]: ids };
        }
      }

      const pave_agencies = [
        '0374204c-e60e-4e8c-bdac-0c161bb85556',
        '053196ee-154c-43db-85da-85d748f55842',
        '08012e63-a6ce-4cb1-abdf-89b592955729',
        '111cbf40-8bbb-4d92-ab7d-2e530dba87e5',
        '31db0ca9-c270-40a8-a177-5a4bf513d1fd',
        '3e1b488c-3c39-4338-93c3-a0e0c6dadeb9',
        '4beae7df-bfd6-4033-8e0b-1208fbead6d2',
        '65fad4ef-cc52-4eaf-83d6-8688ec78eb02',
        '89fc088e-b64e-496a-a7ca-2213d2065435',
        '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
        'e142b4dd-bbec-11eb-8026-02b1ece053a6',
      ];

      if (!pave_agencies.includes(agency_id)) {
        const paveUser = await agencyUserController.findOne(
          {
            agency_fk: agency_id,
          },
          {
            include: {
              model: models.user,
              required: true,
              where: {
                email: {
                  [Op.like]: '%yourpave.com%',
                },
                first_name: 'Pave',
              },
            },
          },
        );

        if (paveUser?.dataValues?.agency_user_id) {
          where.agency_user_fk = {
            [Op.ne]: paveUser?.dataValues?.agency_user_id,
          };
        }
      }

      // filter by date - permalink sent date
      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        where.permalink_sent_date = { [Op.between]: [startDate, endDate] };
      }

      // filter by project
      if (project_id) {
        const ids = project_id.split(',');

        include.push({
          model: models.shortlisted_project,
          required: true,
          where: { project_fk: { [Op.in]: ids } },
        });
      }

      // include whatsapp tracker
      include.push({
        model: models.whatsapp_message_tracker,
        required: false,
        attributes: ['whatsapp_message_tracker_id'],
      });

      // include sms tracker
      include.push({
        model: models.sms_message_tracker,
        required: false,
        attributes: ['sms_message_tracker_id'],
        where: {
          msg_trigger: 'proposal',
        },
      });

      try {
        const contacts = await contactController.findAll(
          {
            agency_fk: agency_id,
            ...where,
          },
          { include, attributes: ['contact_id'] },
        );

        const sent_method = {
          whatsApp: 0,
          manual: 0,
          SMS: 0,
        };
        for (const contact of contacts) {
          if (contact.whatsapp_message_trackers.length > 0) {
            sent_method.whatsApp += 1;
          }

          if (
            contact.whatsapp_message_trackers.length === 0 &&
            contact.sms_message_trackers.length === 0
          ) {
            sent_method.manual += 1;
          }

          if (contact.sms_message_trackers.length > 0) {
            sent_method.SMS += 1;
          }
        }

        const removedNoValueData = Object.fromEntries(
          Object.entries(sent_method).filter(([key, value]) => value !== 0),
        );

        h.api.createResponse(
          request,
          response,
          200,
          { sent_method: removedNoValueData, filters: { where, include } },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
        console.log(err);
        console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');

        h.api.createResponse(
          request,
          response,
          500,
          { filters: { where, include } },
          '2-dashboard-1622276249',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/dashboard/most-engaged-contacts Get most engaged contact list
   * @apiName StaffContactGetMostEngagedContacts
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/dashboard/most-engaged-contacts',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      console.log('💥💥💥💥💥💥💥');

      const { agency_id, agent_user_id, from, to, project_id } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const { agency_user_id } = await agencyUserController.findOne({
        user_fk: current_user_id,
      });
      const userRoleRecord = await userRoleController.findOne({
        user_fk: current_user_id,
      });

      const startDate = new Date(from);
      const endDate = new Date(to);

      const where = {};
      const include = [];
      const contactInclude = [];

      if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
        where.agency_user_id = agency_user_id;
      } else {
        // filter by contact owner
        if (agent_user_id) {
          const ids = agent_user_id.split(',');

          where.agency_user_id = { [Op.in]: ids };
        }
      }

      // filter by project
      if (project_id) {
        const ids = project_id.split(',');
        contactInclude.push({
          model: models.shortlisted_project,

          required: true,
          where: { project_fk: { [Op.in]: ids }, is_deleted: 0 },
          attributes: ['project_fk'],
        });
      } else {
        contactInclude.push({
          model: models.shortlisted_project,
          required: false,
          where: { is_deleted: 0 },
          attributes: ['project_fk'],
        });
      }

      const pave_agencies = [
        '0374204c-e60e-4e8c-bdac-0c161bb85556',
        '053196ee-154c-43db-85da-85d748f55842',
        '08012e63-a6ce-4cb1-abdf-89b592955729',
        '111cbf40-8bbb-4d92-ab7d-2e530dba87e5',
        '31db0ca9-c270-40a8-a177-5a4bf513d1fd',
        '3e1b488c-3c39-4338-93c3-a0e0c6dadeb9',
        '4beae7df-bfd6-4033-8e0b-1208fbead6d2',
        '65fad4ef-cc52-4eaf-83d6-8688ec78eb02',
        '89fc088e-b64e-496a-a7ca-2213d2065435',
        '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
        'e142b4dd-bbec-11eb-8026-02b1ece053a6',
      ];

      // Get contact owner
      if (!pave_agencies.includes(agency_id)) {
        contactInclude.push({
          model: models.agency_user,
          required: true,
          include: {
            model: models.user,
            where: {
              email: {
                [Op.notLike]: '%yourpave.com%',
              },
            },
            required: true,
          },
        });
      } else {
        contactInclude.push({
          model: models.agency_user,
          required: true,
          include: {
            model: models.user,
            required: true,
          },
        });
      }

      // Get contact activity
      contactInclude.push({
        model: models.contact_activity,
        required: false,
        where: {
          created_date: { [Op.between]: [startDate, endDate] },
        },
        order: [['activity_date', 'ASC']],
        attributes: ['activity_type', 'activity_date'],
      });

      try {
        const engagement_score = await contactLeadScoreController.findAll(
          {
            created_date: { [Op.between]: [startDate, endDate] },
          },
          {
            include: [
              {
                model: models.contact,
                where: {
                  agency_fk: agency_id,
                },
                required: true,
                include: [
                  {
                    model: models.agency_user,
                    where: {
                      ...where,
                    },
                  },
                  ...contactInclude,
                ],
              },
            ],
            attributes: [
              'contact_fk',
              [sequelize.fn('sum', sequelize.col('score')), 'cumulativeScore'],
            ],
            group: ['contact_fk'],
            order: [[sequelize.literal('cumulativeScore'), 'DESC']],
            limit: 10,
          },
        );

        h.api.createResponse(
          request,
          response,
          200,
          {
            engagement_score,
            filters: { where, include, contactInclude },
          },
          '1-dashboard-1622276213',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
        console.log(err);
        console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');

        h.api.createResponse(
          request,
          response,
          500,
          { filters: { where, include } },
          '2-dashboard-1622276249',
          {
            portal,
          },
        );
      }
    },
  });
  next();
};
