const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const sequelize = require('sequelize');
const { Op } = sequelize;
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');

const contactListController =
  require('../../../controllers/contactList').makeController(models);
const contactListUserController =
  require('../../../controllers/contactListUser').makeController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/contact-list Staff create contact list record
   * @apiName StaffContactListCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List
   * @apiUse ServerError
   *
   * @apiParam {string} list_name Contact List Name
   * @apiParam {string} agency_id Agency ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact-list',
    schema: {
      body: {
        type: 'object',
        required: ['list_name', 'agency_id'],
        properties: {
          list_name: { type: 'string' },
          agency_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contact_list_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { list_name, agency_id } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const contactListRecord = await contactListController.findOne({
          list_name,
          agency_fk: agency_id,
        });

        // Check if contact record already exist base on email
        if (h.general.isEmpty(contactListRecord)) {
          const { contact_list_id } = await h.database.transaction(
            async (transaction) => {
              // Create contact list record
              const contact_list_id = await contactListController.create(
                {
                  list_name,
                  agency_fk: agency_id,
                  status: constant.CONTACT_LIST.STATUS.DRAFT,
                  created_by: user_id,
                },
                { transaction },
              );
              return { contact_list_id };
            },
          );
          h.api.createResponse(
            request,
            reply,
            200,
            { contact_list_id },
            '1-contact-list-1620396460',
            { portal },
          );
        } else {
          // Contact record already exist
          console.log(`${request.url}: contact list name already exist.`, {
            contactListRecord,
          });
          h.api.createResponse(
            request,
            reply,
            409,
            {},
            '2-contact-list-1621771554',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create contact list.`, { err });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-list-1620396470',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/contact-list List available contact lists
   * @apiName ListContactList
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact-list',
    schema: {
      query: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
          search: { type: 'string' },
          skip: { type: 'integer' },
          limit: { type: 'integer', minimum: 1, maximum: 100 } // Limit per page
        },
        required: ['agency_id'],
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, is_whatsapp_opt_in, search, skip = 0, limit = 10 } = req.query;
      const showAll = !req.query.limit ? true : false

      try {
        const where = {
          agency_fk: agency_id,
          ...(search ? { list_name: { [Op.like]: `%${search}%` } } : {}),
        };

        console.log('Where clause:', where);

        const {rows: contact_list, count: totalRecords} = await contactListController.findAndCountAll(where, {
          // with opt in
          ...(h.general.notEmpty(is_whatsapp_opt_in)
            ? {
                include: [
                  {
                    model: models.contact_list_user,
                    required: true,
                    attributes: [],
                  },
                ],
              }
            : {}),

          order: [
            ['list_name', 'ASC'],
            ['created_date', 'ASC'],
          ],
          ...(showAll
            ? {}
            : {
                limit,
                offset: skip,
              }),
        });

        const contactListPromises = contact_list.map(async (list) => {
          const formList = { ...list.dataValues };
        
          const contact_list_user = await contactListUserController.count(
            { contact_list_id: list.contact_list_id },
            {
              include: [
                {
                  model: models.contact,
                  required: true,
                  where: {
                    opt_out_whatsapp: 0,
                    [Op.or]: [
                      { whatsapp_engagement: 'all' },
                      { whatsapp_engagement: { [Op.like]: `%campaign%` } },
                    ],
                  },
                  attributes: [],
                },
              ],
            },
          );
        
          formList.contact_count = { count: contact_list_user };
          return formList;
        });

        const newList = await Promise.all(contactListPromises);
        h.api.createResponse(
          req,
          res,
          200,
          { contact_list: newList, totalRecords },
          '1-contact-list-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/contact-list',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-contact-list-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/contact-list List available contact lists
   * @apiName ListContactList
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact-list/:contact_list_id',
    schema: {
      params: {
        contact_list_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { contact_list_id } = req.params;
      const { search, pageIndex, pageSize, sortColumn, sortOrder, totalCount } =
        req.query;
      const limit = pageSize ? parseInt(pageSize) : undefined;
      const offset = pageIndex * limit;
      try {
        const where = {
          contact_list_id: contact_list_id,
        };

        const order = [['created_date', 'DESC']];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }
        const contact_list = await contactListController.findOne(where, {});

        const include = [
          {
            model: models.contact,
            required: true,
            attributes: [
              'contact_id',
              'first_name',
              'last_name',
              'email',
              'mobile_number',
              'lead_score',
            ],
            ...(!h.isEmpty(search)
              ? {
                  where: {
                    [Op.and]: [
                      sequelize.where(
                        sequelize.fn(
                          'CONCAT',
                          sequelize.col('first_name'),
                          ' ',
                          sequelize.col('last_name'),
                        ),
                        {
                          [sequelize.Op.like]: `%${search}%`,
                        },
                      ),
                    ],
                  },
                }
              : {}),
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: false,
                  },
                ],
              },
            ],
          },
        ];

        let getCountFn;
        if (totalCount) {
          getCountFn = Promise.resolve(totalCount);
        } else {
          getCountFn = contactListUserController.count(where, {
            include,
            limit,
            offset,
          });
        }

        const [contact_list_users, contactListUserCount] = await Promise.all([
          contactListUserController.findAll(where, {
            include,
            order,
            limit,
            offset,
          }),
          getCountFn,
        ]);

        const metadata = {
          pageCount: pageSize
            ? Math.ceil(contactListUserCount / limit)
            : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: contactListUserCount,
        };

        h.api.createResponse(
          req,
          res,
          200,
          { contact_list, contact_list_users, metadata },
          '1-contact-list-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/contact-list:contact_list_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-contact-list-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/contact-list-user/:contact_list_id Staff delete contact list
   * @apiName StaffDeleteContactList
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
   *
   **/
  fastify.route({
    method: 'DELETE',
    url: '/staff/contact-list/:contact_list_id',
    schema: {
      params: {
        contact_list_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { contact_list_id } = req.params;

      try {
        const contact_list = await contactListController.findOne({
          contact_list_id: contact_list_id,
        });

        if (contact_list) {
          await contactListController.destroy({
            contact_list_id: contact_list_id,
          });
          await contactListUserController.destroyAll({
            contact_list_id: contact_list_id,
          });

          h.api.createResponse(
            req,
            res,
            200,
            {},
            '1-delete-contact-list-1663834299369',
            {
              portal,
            },
          );
        } else {
          throw new Error(`Contact list not found.`);
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/contact-list-/:contact_list_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-delete-contact-list-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });
  /**
   * @api {put} /v1/staff/contact-list Staff update contact list record
   * @apiName StaffContactListCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List
   * @apiUse ServerError
   *
   * @apiParam {string} list_name Contact List Name
   * @apiParam {string} contact_list_id Agency ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234"
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/contact-list',
    schema: {
      body: {
        type: 'object',
        required: ['list_name', 'contact_list_id'],
        properties: {
          list_name: { type: 'string' },
          contact_list_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { list_name, contact_list_id } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const contactListRecord = await contactListController.findOne({
          contact_list_id,
        });
        const agency_id = contactListRecord?.dataValues?.agency_fk;

        const existingContactList = await contactListController.findOne({
          agency_fk: agency_id,
          list_name,
          contact_list_id: {
            [Op.ne]: contact_list_id,
          },
        });

        // Check if contact record already exist base on email
        if (h.general.isEmpty(existingContactList)) {
          await contactListController.update(contact_list_id, {
            list_name: list_name,
          });
          h.api.createResponse(
            request,
            reply,
            200,
            { contactListRecord },
            '1-contact-list-update-1620396460',
            { portal },
          );
        } else {
          // Contact record already exist
          console.log(`${request.url}: contact list name already exist.`, {
            contactListRecord,
          });
          h.api.createResponse(
            request,
            reply,
            409,
            {},
            '2-contact-list-update-1621771554',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to save contact list.`, { err });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-list-update-1620396470',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /staff/contact-list/line List available contact lists for Line
   * @apiName ListLineContactList
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} templates UIB template list data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact-list/line',
    schema: {
      query: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
        },
        required: ['agency_id'],
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, channel, is_line_opt_in } = req.query;

      try {
        const where = {
          agency_fk: agency_id,
          source_type: 'LINE',
          source_value: channel,
        };
        const contact_list = await contactListController.findAll(where, {
          // with opt in
          ...(h.general.notEmpty(is_line_opt_in)
            ? {
                include: [
                  {
                    model: models.contact_list_user,
                    required: true,
                    attributes: [],
                  },
                ],
              }
            : {}),

          order: [
            ['list_name', 'ASC'],
            ['created_date', 'ASC'],
          ],
        });

        const newList = [];
        for (const list of contact_list) {
          const formList = { ...list.dataValues };
          const contact_list_user = await contactListUserController.count(
            { contact_list_id: list.contact_list_id },
            {
              include: [
                {
                  model: models.contact,
                  required: true,
                  where: {
                    [Op.and]: [
                      {
                        opt_out_line: 0,
                      },
                      // {
                      //   [Op.or]: [
                      //     {
                      //       whatsapp_engagement: 'all',
                      //     },
                      //     {
                      //       whatsapp_engagement: {
                      //         [Op.like]: `%campaign%`,
                      //       },
                      //     },
                      //   ],
                      // },
                    ],
                  },
                  attributes: [],
                },
              ],
            },
          );

          formList.contact_count = { count: contact_list_user };
          newList.push(formList);
        }

        h.api.createResponse(
          req,
          res,
          200,
          { contact_list: newList },
          '1-contact-list-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/contact-list',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-contact-list-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
