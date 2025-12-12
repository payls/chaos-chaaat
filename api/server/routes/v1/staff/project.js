const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const h = require('../../../helpers');
const c = require('../../../controllers');
const { Op } = require('sequelize');
const userMiddleware = require('../../../middlewares/user');
const projectController =
  require('../../../controllers/project').makeProjectController(models);

async function deleteCachedProject({
  redis,
  project_id,
  units_available_for_purchase = [],
  log,
}) {
  const project_property_ids = units_available_for_purchase.map(
    (u) => u.project_property_id,
  );

  try {
    await redis.del(`project-${project_id}`);
  } catch (err) {
    Sentry.captureException(err);
    log.warn({
      message: 'Redis delete error',
      key: `project-${project_id}`,
      err,
    });
  }

  for (const project_property_id of project_property_ids) {
    try {
      await redis.del(`project_property-${project_property_id}`);
    } catch (err) {
      Sentry.captureException(err);
      log.warn({
        message: 'Redis delete error',
        key: `project_property-${project_property_id}`,
        err,
      });
    }
  }
}

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/content/project Get projects
   * @apiName StaffProjectContentGetProjects
   * @apiVersion 1.0.0
   * @apiGroup Staff Project
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/content/project',
    schema: {
      queryString: {
        type: 'object',
        properties: {
          slim: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            projects: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const { slim } = request.query;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      const agencyUser = await c.agencyUser.findOne({
        user_fk: current_user_id,
      });
      const agency_id = agencyUser.agency_fk;
      try {
        let projects = await projectController.findAll(
          { agency_fk: agency_id, is_deleted: { [Op.eq]: 0 } },
          {
            include: slim
              ? []
              : [
                  {
                    model: models.project_property,
                    required: false,
                    where: { is_deleted: { [Op.eq]: 0 } },
                    include: [
                      {
                        model: models.project_media_property,
                        required: false,
                        attributes: ['project_media_property_id'],
                        include: [
                          {
                            model: models.project_media,
                            required: false,
                          },
                        ],
                      },
                    ],
                  },
                ],
          },
        );

        if (request.query.search && !h.general.isEmpty(request.query.search)) {
          // Search filtering
          projects = projects.filter(
            (obj) =>
              obj.location_address
                .toLowerCase()
                .includes(request.query.search.toLowerCase()) ||
              obj.title.rendered
                .toLowerCase()
                .includes(request.query.search.toLowerCase()) ||
              obj.team_behind
                .find(
                  (team_behind_obj) =>
                    team_behind_obj.project_team_behind_type === 'developer',
                )
                .post_title.toLowerCase()
                .includes(request.query.search.toLowerCase()),
          );
        }
        h.api.createResponse(
          request,
          response,
          200,
          { projects },
          '1-project-1622567760843',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to retrieve projects`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-project-1622567775252',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/content/project/:project_id/property',
    schema: {
      params: {
        type: 'object',
        properties: {
          project_id: { type: 'string', format: 'uuid' },
        },
        required: ['project_id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            properties: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const { project_id } = request.params;
      const { user_id: current_user_id } = h.user.getCurrentUser(request);
      try {
        // const agencyUser = await c.agencyUser.findOne({
        //   user_fk: current_user_id,
        // });
        // const agency_id = agencyUser.agency_fk;
        const properties = await models.project_property.findAll({
          where: { project_fk: project_id, is_deleted: false },
          include: [
            {
              model: models.project_media_property,
              required: false,
              attributes: ['project_media_property_id'],
              include: [
                {
                  model: models.project_media,
                  required: false,
                },
              ],
            },
          ],
        });

        h.api.createResponse(
          request,
          response,
          200,
          { properties },
          '1-project-1622567760843',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error(
          {
            url: request.url,
            err,
          },
          `${request.url}: user failed to retrieve projects`,
        );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-project-1622567775252',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/project',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            projects: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_fk } = await c.agencyUser.findOne({ user_fk: user_id });

        // Get all agency users from this agency and include their user data
        const agencyAgents = await c.agencyUser.findAll(
          {
            agency_fk: agency_fk,
          },
          {
            include: {
              model: models.user,
              required: true,
            },
          },
        );

        // Map user id to their names for frontend use
        const userIDToNameMapping = {};
        for (const indx in agencyAgents) {
          const user = agencyAgents[indx].dataValues.user;
          userIDToNameMapping[user.user_id] =
            h.user.formatFirstMiddleLastName(user);
        }

        let projects = [];

        // When query search is available
        if (
          (req.query.search && !h.general.isEmpty(req.query.search)) ||
          (req.query.city && !h.general.isEmpty(req.query.city)) ||
          (req.query.country && !h.general.isEmpty(req.query.country)) ||
          (req.query.project_type && !h.general.isEmpty(req.query.project_type))
        ) {
          const orCountry = [];
          const orCity = [];
          const orProjectType = [];

          if (
            req.query.project_type &&
            !h.general.isEmpty(req.query.project_type)
          ) {
            const andProjectArr = req.query.project_type.split(',');
            if (andProjectArr.length > 0) {
              for (let i = 0; i < andProjectArr.length; i++) {
                orProjectType.push({
                  [Op.like]: `%${andProjectArr[i]}%`,
                });
              }
            }
          }

          if (req.query.city && !h.general.isEmpty(req.query.city)) {
            const orCityArr = req.query.city.split(',');
            if (orCityArr.length > 0) {
              for (let i = 0; i < orCityArr.length; i++) {
                orCity.push({
                  location_google_place_raw: {
                    [Op.like]: `%${orCityArr[i]}%`,
                  },
                });
              }
            }
          }

          if (req.query.country && !h.general.isEmpty(req.query.country)) {
            const orCountryArr = req.query.country.split(',');
            if (orCountryArr.length > 0) {
              for (let i = 0; i < orCountryArr.length; i++) {
                orCountry.push({
                  location_google_place_raw: {
                    [Op.like]: `%${orCountryArr[i]}%`,
                  },
                });
              }
            }
          }

          projects = await c.project.findAll(
            {
              agency_fk,
              is_deleted: { [Op.eq]: 0 },
              project_type: { [Op.or]: orProjectType },

              // Inject name filter
              ...(req.query.search && req.query.search.length > 0
                ? {
                    [Op.or]: [
                      { name: { [Op.like]: `%${req.query.search}%` } },
                      {
                        '$project_team_behinds.name$': {
                          [Op.like]: `%${req.query.search}%`,
                        },
                      },
                    ],
                  }
                : {}),

              // Inject country filter
              ...(orCountry.length > 0
                ? {
                    [Op.and]: {
                      [Op.or]: orCountry,
                    },
                  }
                : {}),

              // Inject city filter
              ...(orCity.length > 0
                ? {
                    [Op.and]: {
                      [Op.or]: orCity,
                    },
                  }
                : {}),
              // [Op.or]: orCity,
            },
            {
              include: [
                {
                  model: models.project_team_behind,
                  required: false,
                  attributes: { include: ['type', 'name'] },
                },
                {
                  model: models.project_property,
                  required: false,
                  where: { is_deleted: { [Op.eq]: 0 } },
                },
              ],
              order: [['name', 'ASC']],
            },
          );
        } else {
          // Retrieve all active projects tied to agency_fk
          projects = await c.project.findAll(
            {
              agency_fk,
              is_deleted: { [Op.eq]: 0 },
            },
            {
              include: [
                {
                  model: models.project_team_behind,
                  required: false,
                  attributes: { include: ['type', 'name'] },
                },
                {
                  model: models.project_property,
                  required: false,
                  where: { is_deleted: { [Op.eq]: 0 } },
                },
              ],
              order: [['name', 'ASC']],
            },
          );
        }

        // Map each project's created_by with the name of the user
        for (const indx in projects) {
          const project = projects[indx];
          const createdByID = project.created_by;
          project.created_by = userIDToNameMapping[createdByID];
        }

        h.api.createResponse(
          req,
          res,
          200,
          { projects },
          '1-project-1622567760843',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(req, res, 500, {}, '2-project-1622567775252', {
          portal,
        });
      }
    },
  });

  /**
   * Staff - Generate project ID
   * @api {post} /v1/staff/project/generate-id
   * @apiName StaffProjectGenerateId
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Form
   * @apiUse ServerError
   *
   * @apiParam {string} step Project form step number
   *
   * @apiParam {string} user_fk User ID
   * @apiParam {string} name Project name
   * @apiParam {string} description Project description
   * @apiParam {string} key_stats Project key stats
   * @apiParam {string} project_highlights Project highlights
   * @apiParam {string} why_invest Project why invest
   * @apiParam {string} shopping Project shopping
   * @apiParam {string} transport Project transport
   * @apiParam {string} education Project education
   * @apiParam {string} project_type Project type
   * @apiParam {string} property_header_info_cover_picture_url Project cover picture url
   * @apiParam {object} team_behind Project team behind details
   * @apiParam {array} features Project features details
   * @apiParam {array} images Project media images detail
   * @apiParam {array} videos Project media video details
   * @apiParam {array} locations_nearby Project location nearby
   * @apiParam {array} units_available_for_purchase Project units available
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} project_id Project ID
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *		"project_id": "1234"
   */
  fastify.route({
    method: 'POST',
    url: '/staff/project/generate-id',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            project_id: { type: 'string' },
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
        const { user_id } = h.user.getCurrentUser(req);
        const agencyUser = await c.agencyUser.findOne(
          { user_fk: user_id },
          {
            include: [
              {
                model: models.agency,
                required: true,
              },
            ],
          },
        );
        const { project_id } = await h.database.transaction(
          async (transaction) => {
            const project_id = await c.project.create(
              {
                name: 'draft project',
                agency_fk: agencyUser.agency.agency_id,
                created_by: user_id,
              },
              { transaction },
            );
            // await c.projectTeamBehind.create({ project_fk: project_id, type: constant.PROJECT.TEAM_BEHIND.TYPE.DEVELOPER, created_by: user_id }, { transaction });
            // await c.projectTeamBehind.create({ project_fk: project_id, type: constant.PROJECT.TEAM_BEHIND.TYPE.ARCHITECT, created_by: user_id }, { transaction });
            // await c.projectTeamBehind.create({ project_fk: project_id, type: constant.PROJECT.TEAM_BEHIND.TYPE.BUILDER, created_by: user_id }, { transaction });
            // await c.projectTeamBehind.create({ project_fk: project_id, type: constant.PROJECT.TEAM_BEHIND.TYPE.LANDSCAPER, created_by: user_id }, { transaction });
            return { project_id };
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { project_id },
          '1-project-1626585007395',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: failed to generate new project ID`, { err });
        h.api.createResponse(req, res, 500, {}, '2-project-1626584979489', {
          portal,
        });
      }
    },
  });

  /** Staff to get project form details by project_id
   * @api {get} /v1/staff/project/:project_id/form/:step
   * @apiName StaffProjectGetForm
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Form
   * @apiUse ServerError
   *
   * @apiParam {string} step Project form step number
   * @apiParam {string} project_id Project ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} project Project form details
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *		"project": {
   *   		"name": "The Regent",
   *   		"description": "The Regent is an awesome project",
   *   		"property_header_info_cover_picture_url": "https://coverpic/url",
   *   	    "currency_code": "usd",
   *   	    "size_format": "sqm",
   *   	    "completion_date": "01/06/2020",
   *   	    location_google_map_url: "https://googlemaps/url"
   *			"team_behind": {
   *				"developer": {
   *					"project_team_behind_id": "2bc36585-d749-42c9-9f3b-064d42dc7e90",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *					"type": "developer",
   *					"name": "Regent Developer Best",
   *					"logo_url": "https://logo/url",
   *					"description": "developer desc",
   *				    "title": "file title",
   *				    "filename: "Filename.svg"
   *				},
   *				"architect": {
   *					"project_team_behind_id": "2b421fdf-e5b7-41e6-971b-454452a0018f",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *					"type": "architect",
   *					"name": "Regent Architect Best",
   *					"logo_url": "https://logo/url",
   *					"description": "architect desc",
   *				    "title": "file title",
   *				    "filename: "Filename.svg"
   *				},
   *				"builder": {
   *					"project_team_behind_id": "dc0e9228-3fef-485b-a461-34abb3ea6328",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *					"type": "builder",
   *					"name": "Regent builder Best",
   *					"logo_url": "https://logo/url",
   *					"description": "Builder desc",
   *				    "title": "file title",
   *				    "filename: "Filename.svg"
   *				},
   *				"landscaper": {
   *					"project_team_behind_id": "c5fab790-05c4-40f5-8d81-2155aa50a95b",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *					"type": "landscaper",
   *					"name": "Regent landscaper Best",
   *					"logo_url": "https://logo/url",
   *					"description": "landscaper desc",
   *				    "title": "file title",
   *				    "filename: "Filename.svg"
   *				}
   *  		},
   *			"features": [
   *				{
   *					"project_feature_id": "378d710b-e339-4b49-98f1-49a2472736a0",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *					"name": "Outdoor Pool",
   *					"type": "fitness"
   *				}
   *			],
   *			"images": [
   *				{
   *					"project_media_id": "640cf755-ed2a-4172-9261-df4833ec9b6b",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *				    "title": "Image title"
   *					"header_text": "Project image 1",
   *					"type": "image",
   *					"url": "https://property/image/1"
   *				    "media_tags: [];
   *				}
   *			],
   *			"videos": [
   *				{
   *					"project_media_id": "830a5c93-8cda-4db7-bbb2-a0802cabbdfd",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *				    "title": "Video title"
   *					"header_text": "Intro video 1",
   *					"type": "youtube",
   *					"url": "https://property/video/1"
   *				    "media_tags: [];
   *				}
   *			],
   *			"locations_nearby": [
   *				{
   *					"project_location_nearby_id": "191a1cd7-5210-48e6-816f-c3263ea1c433",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *					"type": "school"
   *				}
   *			],
   *			"units_available_for_purchase": [
   *				{
   *					"project_property_id": "854e59d1-7332-4196-b228-38148b5224ae",
   *					"project_fk": "57fa1a53-26e3-47e1-88ca-314e2b1ddad4",
   *					"unit_type": "2 bedrooms",
   *					"unit_number": "90",
   *					"floor": 27,
   *					"sqm": 1800,
   *					"number_of_bedroom": 2,
   *					"number_of_bathroom": 2,
   *					"number_of_parking_lots": 1,
   *					"direction_facing": "south",
   *					"currency_code": "USD",
   *					"starting_price": 1200000,
   *					"weekly_rent": 500,
   *					"rental_yield": 2.1,
   *					"status": "purchase_pending"
   *				}
   *  		]
   *		}
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/project/:project_id/step/:step',
    schema: {
      params: {
        type: 'object',
        required: ['project_id', 'step'],
        properties: {
          project_id: { type: 'string' },
          step: { type: 'number' },
        },
      },
      // response: {
      //     200: {
      //         type: 'object',
      //         properties: {
      //             status: { type: 'string' },
      //             message: { type: 'string' },
      //             message_code: { type: 'string' },
      //             project: {
      //             	type: 'object' ,
      // 				properties: {
      //                     name: { type: 'string' },
      //                     description: { type: 'string' },
      //                     property_header_info_cover_picture_url: { type: 'string' },
      //                     currency_code: { type: 'string' },
      //                     size_format: { type: 'string' },
      //                     completion_date: { type: 'string' },
      //                     location_address_1: { type: 'string' },
      //                     location_address_2: { type: 'string' },
      //                     location_address_3: { type: 'string' },
      //                     location_address_latitude: { type: 'string' },
      //                     location_address_longitude: { type: 'string' },
      //                     location_google_map_url: { type: 'string' },
      //                     location_google_place_id: { type: 'string' },
      //                     location_google_place_raw: { type: 'object' },
      //                     team_behind: {
      //                         type: 'object',
      //                         properties: {
      //                             developer: {
      //                                 type: 'object',
      //                                 properties: {
      //                                     project_team_behind_id: { type: 'string' },
      // 									project_fk: { type: 'string' },
      //                                     type: { type: 'string' },
      //                                     name: { type: 'string' },
      //                                     logo_url: { type: 'string' },
      //                                     logo_url_full: { type: 'string' },
      //                                     description: { type: 'string' },
      //                                     title: { type: 'string' },
      //                                     filename: { type: 'string' }
      //                                 }
      //                             },
      //                             architect: {
      //                                 type: 'object',
      //                                 properties: {
      //                                     project_team_behind_id: { type: 'string' },
      //                                     project_fk: { type: 'string' },
      //                                     type: { type: 'string' },
      //                                     name: { type: 'string' },
      //                                     logo_url: { type: 'string' },
      // 									logo_url_full: { type: 'string' },
      //                                     description: { type: 'string' },
      //                                     title: { type: 'string' },
      //                                     filename: { type: 'string' }
      //                                 }
      //                             },
      //                             builder: {
      //                                 type: 'object',
      //                                 properties: {
      //                                     project_team_behind_id: { type: 'string' },
      //                                     project_fk: { type: 'string' },
      //                                     type: { type: 'string' },
      //                                     name: { type: 'string' },
      //                                     logo_url: { type: 'string' },
      // 									logo_url_full: { type: 'string' },
      //                                     description: { type: 'string' },
      //                                     title: { type: 'string' },
      //                                     filename: { type: 'string' }
      //                                 }
      //                             },
      //                             landscaper: {
      //                                 type: 'object',
      //                                 properties: {
      //                                     project_team_behind_id: { type: 'string' },
      //                                     project_fk: { type: 'string' },
      //                                     type: { type: 'string' },
      //                                     name: { type: 'string' },
      //                                     logo_url: { type: 'string' },
      // 									logo_url_full: { type: 'string' },
      //                                     description: { type: 'string' },
      //                                     title: { type: 'string' },
      //                                     filename: { type: 'string' }
      //                                 }
      //                             }
      //                         }
      //                     },
      //                     features: {
      //                         type: 'array',
      //                         items: {
      //                             type: 'object',
      //                             properties: {
      //                                 project_feature_id: { type: 'string' },
      //                                 project_fk: { type: 'string' },
      //                                 name: { type: 'string' },
      //                                 type: { type: 'string' }
      //                             }
      //                         }
      //                     },
      //                     images: {
      //                         type: 'array',
      //                         items: {
      //                             type: 'object',
      //                             properties: {
      //                                 project_media_id: { type: 'string' },
      //                                 project_fk: { type: 'string' },
      //                                 title: { type: 'string' },
      //                                 header_text: { type: 'string' },
      //                                 type: { type: 'string' },
      //                                 url: { type: 'string' },
      //                                 media_tags: {
      //                                     type: 'array',
      //                                     items: {
      //                                         type: 'object',
      //                                         required: ['media_tag_id'],
      //                                         properties: {
      //                                             media_tag_id: { type: 'string' },
      //                                             tag_type: { type: 'string' }
      //                                         }
      //                                     }
      //                                 }
      //                             }
      //                         }
      //                     },
      //                     videos: {
      //                         type: 'array',
      //                         items: {
      //                             type: 'object',
      //                             properties: {
      //                                 project_media_id: { type: 'string' },
      //                                 project_fk: { type: 'string' },
      //                                 title: { type: 'string' },
      //                                 header_text: { type: 'string' },
      //                                 type: { type: 'string' },
      //                                 url: { type: 'string' },
      //                                 media_tags: {
      //                                     type: 'array',
      //                                     items: {
      //                                         type: 'object',
      //                                         required: ['media_tag_id'],
      //                                         properties: {
      //                                             media_tag_id: { type: 'string' },
      //                                             tag_type: { type: 'string' }
      //                                         }
      //                                     }
      //                                 }
      //                             }
      //                         }
      //                     },
      //                     locations_nearby: {
      //                         type: 'array',
      //                         items: {
      //                             type: 'object',
      //                             properties: {
      //                                 project_location_nearby_id: { type: 'string' },
      //                                 project_fk: { type: 'string' },
      //                                 type: { type: 'string' },
      //                             }
      //                         }
      //                     },
      //                     units_available_for_purchase: {
      //                         type: 'array',
      //                         items: {
      //                             type: 'object',
      //                             properties: {
      //                                 project_property_id: { type: 'string' },
      //                                 project_fk: { type: 'string' },
      //                                 unit_type: { type: 'string' },
      //                                 unit_number: { type: 'string' },
      //                                 floor: { type: 'number' },
      //                                 sqm: { type: 'number' },
      //                                 number_of_bedroom: { type: 'number' },
      //                                 number_of_bathroom: { type: 'number' },
      //                                 number_of_parking_lots: { type: 'number' },
      //                                 direction_facing: { type: 'string' },
      //                                 currency_code: { type: 'string' },
      //                                 starting_price: { type: 'number' },
      //                                 weekly_rent: { type: 'number' },
      //                                 rental_yield: { type: 'number' },
      //                                 status: { type: 'string' }
      //                             }
      //                         }
      //                     }
      //                 }
      //             }
      //         }
      //     }
      // }
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { step } = req.params;
        const projectForm = await h.database.transaction(
          async (transaction) => {
            switch (step) {
              case 1:
              case 2:
              case 3:
              case 4:
                // eslint-disable-next-line no-case-declarations
                const projectDetails = {};
                // Retrieve project details
                // eslint-disable-next-line no-case-declarations
                const {
                  project_id,
                  name,
                  description,
                  key_stats,
                  project_highlights,
                  why_invest,
                  shopping,
                  transport,
                  education,
                  project_type,
                  property_header_info_cover_picture_url,
                  property_header_info_cover_picture_title,
                  property_header_info_cover_picture_filename,
                  currency_code,
                  size_format,
                  completion_date,
                  location_address_1,
                  location_address_2,
                  location_address_3,
                  location_address_latitude,
                  location_address_longitude,
                  location_google_map_url,
                  location_google_place_id,
                  location_google_place_raw,
                } = await c.project.findOne({
                  project_id: req.params.project_id,
                });
                // Retrieve project form details
                // eslint-disable-next-line no-case-declarations
                const teamBehinds = await c.projectTeamBehind.findAll({
                  project_fk: project_id,
                });
                // eslint-disable-next-line no-case-declarations
                const getFeatures = await c.project.findOne(
                  { project_id: project_id },
                  {
                    include: [
                      {
                        model: models.feature,
                        as: 'features',
                      },
                    ],
                  },
                );
                // eslint-disable-next-line no-case-declarations
                const getMedia = await c.projectMedia.findAll(
                  { project_fk: project_id },
                  {
                    include: [
                      {
                        model: models.project_media_property,
                        require: false,
                      },
                      {
                        model: models.project_media_tag,
                        require: false,
                      },
                    ],
                  },
                );
                // eslint-disable-next-line no-case-declarations
                const getLocationNearby = await c.projectLocationNearby.findAll(
                  {
                    project_fk: project_id,
                  },
                );
                // eslint-disable-next-line no-case-declarations
                const getUnits = await c.projectProperty.findAll({
                  project_fk: project_id,
                  is_deleted: 0,
                });
                // Prepare project details form response
                projectDetails.name = name;
                projectDetails.description = description;
                projectDetails.key_stats = key_stats;
                projectDetails.project_highlights = project_highlights;
                projectDetails.why_invest = why_invest;
                projectDetails.shopping = shopping;
                projectDetails.transport = transport;
                projectDetails.education = education;
                projectDetails.project_type = project_type;
                projectDetails.property_header_info_cover_picture_url =
                  property_header_info_cover_picture_url;
                projectDetails.property_header_info_cover_picture_title =
                  property_header_info_cover_picture_title;
                projectDetails.property_header_info_cover_picture_filename =
                  property_header_info_cover_picture_filename;
                projectDetails.currency_code = currency_code;
                projectDetails.size_format = size_format;
                projectDetails.completion_date = completion_date;
                projectDetails.location_address_1 = location_address_1;
                projectDetails.location_address_2 = location_address_2;
                projectDetails.location_address_3 = location_address_3;
                projectDetails.location_address_latitude =
                  location_address_latitude;
                projectDetails.location_address_longitude =
                  location_address_longitude;
                projectDetails.location_google_map_url =
                  location_google_map_url;
                projectDetails.location_google_place_id =
                  location_google_place_id;
                projectDetails.location_google_place_raw =
                  location_google_place_raw;
                projectDetails.team_behind = {};
                for (let i = 0; i < teamBehinds.length; i++) {
                  const teamBehind = teamBehinds[i];
                  projectDetails.team_behind[teamBehind.type] =
                    teamBehind.dataValues;
                }
                projectDetails.features = getFeatures.features;
                projectDetails.medias = getMedia.sort((a, b) => {
                  return (
                    new Date(a.toJSON().created_date_raw) -
                    new Date(b.toJSON().created_date_raw)
                  );
                });
                projectDetails.images = getMedia
                  .map((media) => {
                    return media.dataValues;
                  })
                  .filter(
                    (media) =>
                      media.type ===
                      constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_IMAGE,
                  );
                projectDetails.videos = getMedia.filter(
                  (media) =>
                    media.type ===
                    constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_VIDEO,
                );
                projectDetails.ebrochures = getMedia.filter(
                  (media) =>
                    media.type === constant.UPLOAD.TYPE.PROJECT_BROCHURE,
                );
                projectDetails.render_3ds = getMedia.filter(
                  (media) =>
                    media.type === constant.UPLOAD.TYPE.PROJECT_RENDER_3D,
                );
                projectDetails.locations_nearby = getLocationNearby;
                projectDetails.units_available_for_purchase = getUnits;
                return projectDetails;

              default:
            }
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { project: projectForm },
          '1-project-1624940640',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to retrieve project form step`, {
          err,
        });
        h.api.createResponse(req, res, 500, {}, '2-project-1624940653', {
          portal,
        });
      }
    },
  });

  /** Staff to update project form details
   * @api {put} /v1/staff/project/:project_id/form/:step
   * @apiName StaffProjectUpdateForm
   * @apiVersion 1.0.0
   * @apiGroup Staff Project Form
   * @apiUse ServerError
   *
   * @apiParam {string} step Project form step number
   * @apiParam {string} project_id Project ID
   *
   * @apiParam {string} user_fk User ID
   * @apiParam {string} name Project name
   * @apiParam {string} description Project description
   * @apiParam {string} key_stats Project key stats
   * @apiParam {string} project_highlights Project highlights
   * @apiParam {string} why_invest Project why invest
   * @apiParam {string} shopping Project shopping
   * @apiParam {string} transport Project transport
   * @apiParam {string} education Project education
   * @apiParam {string} project_type Project type
   * @apiParam {string} property_header_info_cover_picture_url Project cover picture url
   * @apiParam {string} currency_code Project currency ode
   * @apiParam {string} size_format Project property size formatting
   * @apiParam {string} completion_date Project completion date
   * @apiParam {string} location_google_map_url Project googlemap location url
   * @apiParam {string} location_google_place_id Project Google place ID
   * @apiParam {string} location_google_place_raw Project Google place raw data
   * @apiParam {object} team_behind Project team behind details
   * @apiParam {array} features Project features details
   * @apiParam {array} images Project media images detail
   * @apiParam {array} videos Project media video details
   * @apiParam {array} locations_nearby Project location nearby
   * @apiParam {array} units_available_for_purchase Project units available
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} project_id Project ID
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *		"project_id": "1234
   *
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/project/:project_id/form/:step',
    schema: {
      params: {
        type: 'object',
        required: ['project_id', 'step'],
        properties: {
          project_id: { type: 'string' },
          step: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          key_stats: { type: 'string' },
          project_highlights: { type: 'string' },
          why_invest: { type: 'string' },
          shopping: { type: 'string' },
          transport: { type: 'string' },
          education: { type: 'string' },
          project_type: { type: 'string' },
          property_header_info_cover_picture_url: { type: 'string' },
          property_header_info_cover_picture_title: { type: 'string' },
          property_header_info_cover_picture_filename: { type: 'string' },
          currency_code: { type: 'string' },
          size_format: { type: 'string' },
          completion_date: { type: 'string' },
          location_address_1: { type: 'string' },
          location_address_2: { type: 'string' },
          location_address_3: { type: 'string' },
          location_latitude: { type: 'number' },
          location_longitude: { type: 'number' },
          location_google_map_url: { type: 'string' },
          location_google_place_id: { type: 'string' },
          location_google_place_raw: { type: 'object' },
          team_behind: {
            type: 'object',
            required: [
              constant.PROJECT.TEAM_BEHIND.TYPE.DEVELOPER,
              constant.PROJECT.TEAM_BEHIND.TYPE.ARCHITECT,
              constant.PROJECT.TEAM_BEHIND.TYPE.BUILDER,
              constant.PROJECT.TEAM_BEHIND.TYPE.LANDSCAPER,
            ],
            properties: {
              [constant.PROJECT.TEAM_BEHIND.TYPE.DEVELOPER]: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  name: { type: 'string' },
                  logo_url: { type: 'string' },
                  description: { type: 'string' },
                  title: { type: 'string' },
                  filename: { type: 'string' },
                },
              },
              [constant.PROJECT.TEAM_BEHIND.TYPE.ARCHITECT]: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  name: { type: 'string' },
                  logo_url: { type: 'string' },
                  description: { type: 'string' },
                  title: { type: 'string' },
                  filename: { type: 'string' },
                },
              },
              [constant.PROJECT.TEAM_BEHIND.TYPE.BUILDER]: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  name: { type: 'string' },
                  logo_url: { type: 'string' },
                  description: { type: 'string' },
                  title: { type: 'string' },
                  filename: { type: 'string' },
                },
              },
              [constant.PROJECT.TEAM_BEHIND.TYPE.LANDSCAPER]: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  name: { type: 'string' },
                  logo_url: { type: 'string' },
                  description: { type: 'string' },
                  title: { type: 'string' },
                  filename: { type: 'string' },
                },
              },
            },
          },
          features: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
          images: {
            type: 'array',
            items: {
              type: 'object',
              // required: ['project_media_id', 'type'],
              // properties: {
              //     project_media_id: { type: 'string' },
              //     title: { type: 'string' },
              //     header_text: { type: 'string' },
              //     type: { type: 'string' },
              //     url: { type: 'string' },
              //     media_tags: {
              //         type: 'array',
              //         items: {
              //             type: 'object',
              //             required: ['media_tag_id'],
              //             properties: {
              //                 media_tag_id: { type: 'string' },
              //                 tag_type: { type: 'string' }
              //             }
              //         }
              //     }
              // }
            },
          },
          videos: {
            type: 'array',
            items: {
              type: 'object',
              // required: ['type'],
              // properties: {
              //     project_media_id: { type: 'string' },
              //     title: { type: 'string' },
              //     header_text: { type: 'string' },
              //     type: { type: 'string' },
              //     url: { type: 'string' },
              //     media_tags: {
              //         type: 'array',
              //         items: {
              //             type: 'object',
              //             required: ['media_tag_id'],
              //             properties: {
              //                 media_tag_id: { type: 'string' },
              //                 tag_type: { type: 'string' }
              //             }
              //         }
              //     }
              // }
            },
          },
          youtubes: {
            type: 'array',
            items: {
              type: 'object',
              // required: ['type'],
              // properties: {
              //     project_media_id: { type: 'string' },
              //     title: { type: 'string' },
              //     header_text: { type: 'string' },
              //     type: { type: 'string' },
              //     url: { type: 'string' },
              //     media_tags: {
              //         type: 'array',
              //         items: {
              //             type: 'object',
              //             required: ['media_tag_id'],
              //             properties: {
              //                 media_tag_id: { type: 'string' },
              //                 tag_type: { type: 'string' }
              //             }
              //         }
              //     }
              // }
            },
          },
          render_3ds: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          ebrochures: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          delete_project_medias: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          locations_nearby: {
            type: 'array',
            items: {
              type: 'object',
              required: ['project_location_nearby_id'],
              properties: {
                project_location_nearby_id: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
          units_available_for_purchase: {
            type: 'array',
            items: {
              type: 'object',
              // required: ['project_property_id'],
              properties: {
                project_property_id: { type: 'string' },
                unit_type: { type: 'string' },
                unit_number: { type: 'string' },
                floor: { type: 'string' },
                sqm: { type: 'number' },
                number_of_bedroom: { type: 'number' },
                number_of_bathroom: { type: 'number' },
                number_of_parking_lots: { type: 'string' },
                direction_facing: { type: 'string' },
                currency_code: { type: 'string' },
                starting_price: { type: 'number' },
                weekly_rent: { type: 'number' },
                rental_yield: { type: 'number' },
                status: { type: 'string' },
                is_deleted: { type: 'string' },
              },
            },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            project_id: { type: 'string' },
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
          name,
          description,
          key_stats,
          project_highlights,
          why_invest,
          shopping,
          transport,
          education,
          project_type,
          property_header_info_cover_picture_url,
          property_header_info_cover_picture_title,
          property_header_info_cover_picture_filename,
          currency_code,
          size_format,
          completion_date,
          location_address_1,
          location_address_2,
          location_address_3,
          location_latitude,
          location_longitude,
          location_google_map_url,
          location_google_place_id,
          location_google_place_raw,
          team_behind,
          features,
          images,
          videos,
          youtubes,
          render_3ds,
          ebrochures,
          delete_project_medias: deleteProjectMedias,
          units_available_for_purchase,
        } = req.body;
        const { step, project_id } = req.params;
        const { user_id } = h.user.getCurrentUser(req);

        // delete cached projects and project_properties
        console.log(req.$redis);
        console.log({
          project_id,
          units_available_for_purchase,
        });
        //
        await h.database.transaction(async (transaction) => {
          // Toggle between project form steps
          switch (step) {
            case '1':
              // Update project
              await c.project.update(
                project_id,
                {
                  name,
                  description,
                  key_stats,
                  project_highlights,
                  why_invest,
                  shopping,
                  transport,
                  education,
                  project_type,
                  property_header_info_cover_picture_url,
                  property_header_info_cover_picture_title,
                  property_header_info_cover_picture_filename,
                  currency_code,
                  size_format,
                  completion_date,
                  location_address_1,
                  location_address_2,
                  location_address_3,
                  location_latitude,
                  location_longitude,
                  location_google_map_url,
                  location_google_place_id,
                  location_google_place_raw,
                  updated_by: user_id,
                },
                { transaction },
              );

              // Retrieve team behind list to update
              // eslint-disable-next-line no-case-declarations
              let teamBehinds = await c.projectTeamBehind.findAll(
                { project_fk: project_id },
                { transaction },
              );

              // Initialise team behind for project if it doens't exist yet
              if (h.isEmpty(teamBehinds)) {
                await c.projectTeamBehind.create(
                  {
                    project_fk: project_id,
                    type: constant.PROJECT.TEAM_BEHIND.TYPE.DEVELOPER,
                    name:
                      (team_behind &&
                        team_behind[
                          constant.PROJECT.TEAM_BEHIND.TYPE.DEVELOPER
                        ] &&
                        team_behind[constant.PROJECT.TEAM_BEHIND.TYPE.DEVELOPER]
                          .name) ||
                      null,
                    created_by: user_id,
                  },
                  { transaction },
                );
                await c.projectTeamBehind.create(
                  {
                    project_fk: project_id,
                    type: constant.PROJECT.TEAM_BEHIND.TYPE.ARCHITECT,
                    created_by: user_id,
                  },
                  { transaction },
                );
                await c.projectTeamBehind.create(
                  {
                    project_fk: project_id,
                    type: constant.PROJECT.TEAM_BEHIND.TYPE.BUILDER,
                    created_by: user_id,
                  },
                  { transaction },
                );
                await c.projectTeamBehind.create(
                  {
                    project_fk: project_id,
                    type: constant.PROJECT.TEAM_BEHIND.TYPE.LANDSCAPER,
                    created_by: user_id,
                  },
                  { transaction },
                );
                teamBehinds = await c.projectTeamBehind.findAll(
                  { project_fk: project_id },
                  { transaction },
                );
              }
              // Update project team behind
              if (h.notEmpty(teamBehinds)) {
                for (let i = 0; i < teamBehinds.length; i++) {
                  const teamBehind = teamBehinds[i].dataValues;
                  const teamTypeFields = team_behind[teamBehind.type];
                  // if (
                  //   h.notEmpty(teamTypeFields.name) ||
                  //   h.notEmpty(teamTypeFields.logo_url) ||
                  //   h.notEmpty(teamTypeFields.description)
                  // ) {
                  // Allowing project team behind to have empty string for now.
                  await c.projectTeamBehind.update(
                    teamBehind.project_team_behind_id,
                    {
                      name: h.notEmpty(teamTypeFields.name)
                        ? teamTypeFields.name
                        : null,
                      logo_url: h.notEmpty(teamTypeFields.logo_url)
                        ? teamTypeFields.logo_url
                        : undefined,
                      description: h.notEmpty(teamTypeFields.description)
                        ? teamTypeFields.description
                        : undefined,
                      title: h.notEmpty(teamTypeFields.title)
                        ? teamTypeFields.title
                        : undefined,
                      filename: h.notEmpty(teamTypeFields.filename)
                        ? teamTypeFields.filename
                        : undefined,
                      updated_by: user_id,
                    },
                    { transaction },
                  );
                  // }
                }
              }
              break;

            case '2':
              // Update project feature
              await c.project.updateFeature(project_id, features, user_id, {
                transaction,
              });
              break;

            case '3':
              // Update project units
              await c.projectProperty.saveUnits(
                project_id,
                units_available_for_purchase,
                { user_id, transaction },
              );
              break;

            case '4': {
              // Delete project medias that needs to be deleted
              await c.projectMedia.deleteMedias(
                project_id,
                deleteProjectMedias,
                { transaction },
              );

              // modify videos to include video tag
              const taggedVideos = videos.map((video) => ({
                ...video,
                tags: video.tags.includes(constant.PROPERTY.MEDIA.TAG.VIDEO)
                  ? video.tags
                  : [...video.tags, constant.PROPERTY.MEDIA.TAG.VIDEO],
              }));

              const taggedYoutubes = youtubes.map((video) => ({
                ...video,
                tags: video.tags.includes(constant.PROPERTY.MEDIA.TAG.VIDEO)
                  ? video.tags
                  : [...video.tags, constant.PROPERTY.MEDIA.TAG.VIDEO],
              }));

              const tagged3ds = render_3ds.map((render) => ({
                ...render,
                tags: render.tags.includes(
                  constant.PROPERTY.MEDIA.TAG.RENDER_3D,
                )
                  ? render.tags
                  : [...render.tags, constant.PROPERTY.MEDIA.TAG.RENDER_3D],
              }));

              // Update project media (all medias)
              await c.projectMedia.saveMedias(
                project_id,
                [
                  ...images,
                  ...taggedVideos,
                  ...taggedYoutubes,
                  ...ebrochures,
                  ...tagged3ds,
                ],
                { user_id, transaction },
              );
              break;
            }

            default:
          }
        });
        h.api.createResponse(
          req,
          res,
          200,
          { project_id },
          '1-project-1624941807',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to update project form step`, {
          err,
        });
        h.api.createResponse(req, res, 500, {}, '2-project-1624941870', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/project-list',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            projects: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                pageCount: { type: 'integer' },
                pageIndex: { type: 'integer' },
                totalCount: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { pageIndex, pageSize, sortColumn, sortOrder, totalCount } =
        req.query;
      const limit = pageSize ? parseInt(pageSize) : undefined;
      const offset = pageIndex * limit;

      const modelOptions = {
        limit,
        offset,
        include: [
          {
            model: models.project_team_behind,
            required: false,
            attributes: { include: ['type', 'name'] },
          },
          {
            model: models.project_property,
            required: false,
            where: { is_deleted: { [Op.eq]: 0 } },
          },
        ],
        order: [['name', 'ASC']],
      };

      let where = {};

      try {
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_fk } = await c.agencyUser.findOne({ user_fk: user_id });

        // Get all agency users from this agency and include their user data
        const agencyAgents = await c.agencyUser.findAll(
          {
            agency_fk: agency_fk,
          },
          {
            include: {
              model: models.user,
              required: true,
            },
          },
        );

        // Map user id to their names for frontend use
        const userIDToNameMapping = {};
        for (const indx in agencyAgents) {
          const user = agencyAgents[indx].dataValues.user;
          userIDToNameMapping[user.user_id] =
            h.user.formatFirstMiddleLastName(user);
        }

        let projects = [];

        // When query search is available
        if (
          (req.query.search && !h.general.isEmpty(req.query.search)) ||
          (req.query.city && !h.general.isEmpty(req.query.city)) ||
          (req.query.country && !h.general.isEmpty(req.query.country)) ||
          (req.query.project_type && !h.general.isEmpty(req.query.project_type))
        ) {
          const orCountry = [];
          const orCity = [];
          const orProjectType = [];

          if (
            req.query.project_type &&
            !h.general.isEmpty(req.query.project_type)
          ) {
            const andProjectArr = req.query.project_type.split(',');
            if (andProjectArr.length > 0) {
              for (let i = 0; i < andProjectArr.length; i++) {
                orProjectType.push({
                  [Op.like]: `%${andProjectArr[i]}%`,
                });
              }
            }
          }

          if (req.query.city && !h.general.isEmpty(req.query.city)) {
            const orCityArr = req.query.city.split(',');
            if (orCityArr.length > 0) {
              for (let i = 0; i < orCityArr.length; i++) {
                orCity.push({
                  location_google_place_raw: {
                    [Op.like]: `%${orCityArr[i]}%`,
                  },
                });
              }
            }
          }

          if (req.query.country && !h.general.isEmpty(req.query.country)) {
            const orCountryArr = req.query.country.split(',');
            if (orCountryArr.length > 0) {
              for (let i = 0; i < orCountryArr.length; i++) {
                orCountry.push({
                  location_google_place_raw: {
                    [Op.like]: `%${orCountryArr[i]}%`,
                  },
                });
              }
            }
          }

          where = {
            agency_fk,
            is_deleted: { [Op.eq]: 0 },
            project_type: { [Op.or]: orProjectType },

            // Inject name filter
            ...(req.query.search && req.query.search.length > 0
              ? {
                  [Op.or]: [
                    { name: { [Op.like]: `%${req.query.search}%` } },
                    // {
                    //   '$project_team_behinds.name$': {
                    //     [Op.like]: `%${req.query.search}%`,
                    //   },
                    // },
                  ],
                }
              : {}),

            // Inject country filter
            ...(orCountry.length > 0
              ? {
                  [Op.and]: {
                    [Op.or]: orCountry,
                  },
                }
              : {}),

            // Inject city filter
            ...(orCity.length > 0
              ? {
                  [Op.and]: {
                    [Op.or]: orCity,
                  },
                }
              : {}),
          };
        } else {
          where = {
            agency_fk,
            is_deleted: { [Op.eq]: 0 },
          };
        }

        let getCountFn;
        if (totalCount) {
          getCountFn = Promise.resolve(totalCount);
        } else {
          getCountFn = c.project.count(where, modelOptions);
        }

        const [projectsList, projectsCount] = await Promise.all([
          c.project.findAll(where, modelOptions),
          getCountFn,
        ]);

        projects = projectsList;

        // Map each project's created_by with the name of the user
        for (const indx in projects) {
          const project = projects[indx];
          const createdByID = project.created_by;
          project.created_by = userIDToNameMapping[createdByID];
        }

        const metadata = {
          pageCount: pageSize ? Math.ceil(projectsCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: projectsCount,
        };

        h.api.createResponse(
          req,
          res,
          200,
          {
            projects,
            metadata,
          },
          '1-project-1622567760843',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(req, res, 500, {}, '2-project-1622567775252', {
          portal,
        });
      }
    },
  });

  next();
};
