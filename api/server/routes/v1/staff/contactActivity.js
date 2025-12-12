const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const c = require('../../../controllers');
const h = require('../../../helpers');
const models = require('../../../models');
const userMiddleware = require('../../../middlewares/user');
const sequelize = require('sequelize');
const { Op } = sequelize;
const geoip = require('geoip-lite');
const { shortlistedProject } = require('../../../controllers');
const uuid = require('uuid');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/contact-activity/overview Get current contact's activity overview
   * @apiName StaffContactActivityGetActivities
   * @apiVersion 1.0.0
   * @apiGroup StaffContactActivity
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} object with necessary data to display a contact's activity overview
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact-activity/overview:contact_id',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          contact_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        let contactActivityOverview = {};
        const { contact_id, hasAllActivities, hasMindBodyData } = request.query;
        const activitiesCount = await c.contactActivity.count(
          {
            contact_fk: contact_id,
            is_deleted: 0,
            activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
          },
          {
            include: [
              {
                model: models.contact,
                required: true,
                where: {
                  contact_id: contact_id,
                  status: constant.CONTACT.STATUS.ACTIVE,
                },
              },
            ],
          },
        );

        const limit = 1;
        const offset = 0;
        const order = [['activity_date', 'DESC']];
        const latestActivity = await c.contactActivity.findAll(
          { contact_fk: contact_id },
          {
            include: [
              {
                model: models.contact,
                required: true,
                where: {
                  contact_id: contact_id,
                  status: constant.CONTACT.STATUS.ACTIVE,
                },
              },
            ],
            limit: limit,
            offset: offset,
            order: order,
          },
        );

        const allActivity = hasAllActivities
          ? await c.contactActivity.findAll(
              {
                contact_fk: contact_id,
                is_deleted: 0,
                ...(latestActivity.length > 0
                  ? {
                      activity_date: {
                        [Op.gt]:
                          latestActivity[0].contact.dataValues
                            .permalink_sent_date_raw,
                      },
                    }
                  : {}),
              },

              {
                order: order,
              },
            )
          : null;

        contactActivityOverview = {
          count: activitiesCount,
        };

        if (h.notEmpty(latestActivity[0])) {
          let latestActivityLocation = '';
          const geo = await geoip.lookup(latestActivity[0].activity_ip);

          if (h.notEmpty(geo)) {
            latestActivityLocation = h.general.formateLocationStr(geo);
          } else {
            // To catch IPs that aren't recognised by the module
            console.log('-----------IP not recognised!!---------');
            console.log('IP : ' + latestActivity[0].activity_ip);
          }

          contactActivityOverview = {
            ...contactActivityOverview,
            latestActivity: latestActivity[0],
            location: latestActivityLocation,
            device: latestActivity[0].viewed_on_device,
            allActivity: allActivity,
          };
        }

        let contracts = null;
        let memberships = null;
        let visits = null;

        if (h.general.notEmpty(hasMindBodyData)) {
          const contract = await c.mindBodyClientContract.findAll({
            contact_fk: contact_id,
          });

          if (h.general.notEmpty(contract)) {
            contracts = contract.map((m) => JSON.parse(m.payload));
          }

          const membership = await c.mindBodyClientMembership.findAll({
            contact_fk: contact_id,
          });

          if (h.general.notEmpty(membership)) {
            memberships = membership.map((m) => JSON.parse(m.payload));
          }

          const visit = await c.mindBodyClientVisit.findAll({
            contact_fk: contact_id,
          });

          if (h.general.notEmpty(visit)) {
            visits = visit.map((m) => JSON.parse(m.payload));
          }
        }

        h.api.createResponse(
          request,
          response,
          200,
          { contactActivityOverview, contracts, memberships, visits },
          '1-contact-activity-1646194684401',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: user failed to retrieve contact activity overview`,
          {
            err,
          },
        );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contact-activity-1646194725783',
          {
            portal,
          },
        );
      }
    },
  });
  /**
   * @api {get} /v1/staff/contact-activity Retrieve list of contact activities by current user
   * @apiName StaffContactActivityGetActivities
   * @apiVersion 1.0.0
   * @apiGroup StaffContactActivity
   * @apiUse ServerError
   * @apiUse ServerSuccess
   *
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {array} contact_activities List of contacts with activities
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_activities": "[
   *          "{
   *              "0dbeae6b-9afe-4592-8631-f004edd8dc8c":
   *              "[
   *                  "buyer_link_opened", "carousel_thumbnail_clicked", "property_rated"
   *              ]"
   *          }"
   *      ]"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact-activity',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { user_id } = h.user.getCurrentUser(request);
        const { page, pageSize, sortColumn, sortOrder, totalCount } =
          request.query;
        const limit = pageSize ? parseInt(pageSize) : undefined;
        const offset = (page - 1) * limit;

        // Retrieve agency user from current user id
        const { agency_user_id, agency_fk } = await c.agencyUser.findOne({
          user_fk: user_id,
        });

        const { user_role } = await c.userRole.findOne({ user_fk: user_id });

        // instantiate the multiple where fields
        let contactWhere = {};
        const contactActivityWhere = {
          activity_meta: {
            [Op.ne]: null,
            [Op.not]: '',
          },
        };
        const agencyUserWhere = {};
        let userWhere = {};

        // add the filter and search queires for Contact
        // if a user has user_role sales, they should only see the activity related to their leads.
        contactWhere = h.cmpStr(user_role, constant.USER.ROLE.AGENCY_SALES)
          ? { agency_fk, agency_user_fk: agency_user_id }
          : { agency_fk };

        // to handle buyer filter
        if (
          request.query.buyerQuery &&
          !h.general.isEmpty(request.query.buyerQuery)
        ) {
          const buyerArray = request.query.buyerQuery.split(',');

          contactWhere.contact_id = {
            [Op.or]: buyerArray,
          };
        }

        // add the filter and search queires for Contact Activity
        if (
          request.query.activityQuery &&
          !h.general.isEmpty(request.query.activityQuery)
        ) {
          const activityQueryArray = request.query.activityQuery.split(',');
          contactActivityWhere.activity_type = { [Op.or]: activityQueryArray };
        }
        // to handle activity_time filter
        if (
          request.query.activityTimeQuery &&
          !h.general.isEmpty(request.query.activityTimeQuery)
        ) {
          const activityTimeArray = request.query.activityTimeQuery.split(',');
          const activityTimeOrClauses = [];

          for (const activityTime of activityTimeArray) {
            const threshold = new Date(h.date.getSqlCurrentDate());
            for (const dateFilter in constant.DATE_FILTER) {
              if (activityTime === constant.DATE_FILTER[dateFilter].VALUE) {
                threshold.setDate(
                  threshold.getDate() -
                    constant.DATE_FILTER[dateFilter].DAYS_THRESHOLD,
                );
              }
            }
            activityTimeOrClauses.push({ [Op.gt]: threshold });
          }

          contactActivityWhere.activity_date = {
            [Op.or]: activityTimeOrClauses,
          };
        }

        // Add the filter queries for Agency User
        // to handle agent_user filter
        if (
          request.query.agentQuery &&
          !h.general.isEmpty(request.query.agentQuery)
        ) {
          const agentUserArray = request.query.agentQuery.split(',');

          agencyUserWhere.agency_user_id = {
            [Op.or]: agentUserArray,
          };
        }

        // to handle search queires
        if (
          request.query.searchQuery &&
          !h.general.isEmpty(request.query.searchQuery)
        ) {
          const trimmedSearchQuery = request.query.searchQuery.trim();
          const splitedQuery = trimmedSearchQuery.split(' ');
          const firstNameQuery = splitedQuery[0];
          const lastNameQuery = splitedQuery[splitedQuery.length - 1];
          contactWhere = {
            ...contactWhere,
            [Op.or]: [
              { '$contact.first_name$': { [Op.like]: `%${firstNameQuery}%` } },
              { '$contact.last_name$': { [Op.like]: `%${lastNameQuery}%` } },
            ],
          };
          userWhere = {
            [Op.or]: [
              { '$contact.first_name$': { [Op.like]: `%${firstNameQuery}%` } },
              { '$contact.last_name$': { [Op.like]: `%${lastNameQuery}%` } },
            ],
          };
        }

        // Define the order of the returned data
        const order = [['activity_date', 'DESC']];

        // parses sort data from req
        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        // get total number of entries
        // Need to disable ONLY_FULL_GROUP_BY
        // by running SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
        const roundedOfTo5minLiteralQuery =
          'FROM_UNIXTIME(300 * FLOOR(UNIX_TIMESTAMP(contact_activity.created_date)/300 )) as created_5_minutes';
        let activities_count;
        if (totalCount) {
          activities_count = totalCount;
        } else {
          activities_count = await c.contactActivity.findAll(
            contactActivityWhere,
            {
              attributes: [sequelize.literal(roundedOfTo5minLiteralQuery)],
              group: ['created_5_minutes', 'contact_fk', 'activity_type'],
              include: [
                {
                  model: models.contact,
                  required: true,
                  attributes: [
                    'first_name',
                    'last_name',
                    'profile_picture_url',
                  ],
                  where: contactWhere,
                  include: [
                    {
                      model: models.agency_user,
                      required: true,
                      where: agencyUserWhere,
                      include: [
                        {
                          model: models.user,
                          required: true,
                          where: userWhere,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          );

          activities_count = activities_count.length;
        }

        const activities = await c.contactActivity.findAll(
          contactActivityWhere,
          {
            limit,
            offset,
            attributes: [
              'contact_activity_id',
              'contact_fk',
              'activity_type',
              'activity_meta',
              'activity_ip',
              'viewed_on_device',
              'activity_date',
              'created_date',
              'created_by',
              'updated_date',
              'updated_by',
              sequelize.literal(roundedOfTo5minLiteralQuery),
            ],
            group: ['created_5_minutes', 'contact_fk', 'activity_type'],
            include: [
              {
                model: models.contact,
                required: true,
                attributes: ['first_name', 'last_name', 'profile_picture_url'],
                where: contactWhere,
                include: [
                  {
                    model: models.agency_user,
                    required: true,
                    where: agencyUserWhere,
                    include: [
                      {
                        model: models.user,
                        required: true,
                        where: userWhere,
                      },
                    ],
                  },
                ],
              },
            ],
            order: order,
          },
        );

        const contact_activities = await Promise.all(
          activities.map(async (activity) => {
            const activityMeta = JSON.parse(activity.dataValues.activity_meta);
            const shortlistedPropertyId = activityMeta.shortlisted_property_id;
            const shortlistedProjectId = activityMeta.shortlisted_project_id;
            const shortlistedPropertyCommentId =
              activityMeta.shortlisted_property_comment_id;
            const shortlistedProjectCommentId =
              activityMeta.shortlisted_project_comment_id;

            let shortListedProperty;
            let shortListedProject;
            let shortlistedPropertyComment;
            let shortlistedProjectComment;

            if (shortlistedPropertyId && uuid.validate(shortlistedPropertyId)) {
              shortListedProperty = await c.shortListedProperty.findOne(
                {
                  shortlisted_property_id: shortlistedPropertyId,
                },
                {
                  include: [
                    {
                      model: models.project_property,
                      required: true,
                      include: [
                        {
                          model: models.project,
                          require: true,
                        },
                      ],
                    },
                  ],
                },
              );

              const unit =
                shortListedProperty &&
                shortListedProperty.project_property &&
                shortListedProperty.project_property.dataValues
                  ? shortListedProperty.project_property.dataValues
                  : undefined;
              const project =
                shortListedProperty &&
                shortListedProperty.project_property &&
                shortListedProperty.dataValues
                  ? shortListedProperty.project_property.dataValues
                  : undefined;
              shortListedProperty = { ...project, unit };
            }

            if (shortlistedProjectId && uuid.validate(shortlistedProjectId)) {
              shortListedProject = await c.shortlistedProject.findOne(
                {
                  shortlisted_project_id: shortlistedProjectId,
                },
                {
                  include: [
                    {
                      model: models.project,
                      require: true,
                    },
                  ],
                },
              );
              if (shortListedProject && shortListedProject.project) {
                shortListedProject = {
                  ...shortListedProject.project.dataValues,
                };
              }
            }

            if (
              shortlistedPropertyCommentId &&
              uuid.validate(shortlistedPropertyCommentId)
            ) {
              shortlistedPropertyComment =
                await c.shortListedPropertyComment.findOne({
                  shortlisted_property_comment_id: shortlistedPropertyCommentId,
                });
            }

            if (
              shortlistedProjectCommentId &&
              uuid.validate(shortlistedProjectCommentId)
            ) {
              shortlistedProjectComment =
                await c.shortlistedProjectComment.findOne({
                  shortlisted_project_comment_id: shortlistedProjectCommentId,
                });
            }

            return {
              ...activity.dataValues,
              project_level: shortListedProject !== undefined,
              project: shortListedProperty || shortListedProject || undefined,
              shortlistedPropertyComment,
              shortlistedProjectComment,
            };
          }),
        );

        const metadata = {
          total_pages: Math.ceil(activities_count / limit),
          page: page ? parseInt(page) : undefined,
          items: contact_activities.length,
          totalCount: activities_count,
        };

        h.api.createResponse(
          request,
          response,
          200,
          { contact_activities, metadata },
          '1-contact-activity-1623818234',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: user failed to retrieve contact activities`,
          { err },
        );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contact-activity-1623818245',
          { portal },
        );
      }
    },
  });

  next();
};
