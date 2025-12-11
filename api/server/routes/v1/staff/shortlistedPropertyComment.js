const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const { Sequelize, Op } = require('sequelize');
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const agencyUserController =
  require('../../../controllers/agencyUser').makeAgencyUserController(models);
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/shortlisted-property/comments Retrieve list of shortlisted property comments given agency user ID
   * @apiName StaffShortlistedPropertyCommentGetComments
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedPropertyComments
   * @apiUse ServerError
   *
   * @apiParam {string="buyer_has_responded","buyer_has_yet_to_respond"} [comment_view_type="buyer_has_responded"] Comment view type
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   */
  fastify.route({
    method: 'POST',
    url: '/staff/shortlisted-property/comments',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_fk, agency_user_id } =
          await agencyUserController.findOne({ user_fk: user_id });
        const userRoleRecord = await userRoleController.findOne({
          user_fk: user_id,
        });

        const { pageSize, pageIndex } = req.body.pagination;

        const offset = pageIndex
          ? parseInt(pageIndex) * parseInt(pageSize)
          : undefined;
        const limit = pageSize ? parseInt(pageSize) : undefined;

        const where = {
          status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
        };
        if (h.notEmpty(req.query.getReply) && req.query.getReply === 'false')
          where[Op.or] = [
            { parent_comment_fk: null },
            { parent_comment_fk: '' },
          ];

        if (
          h.notEmpty(req.query.hasContact) &&
          req.query.hasContact === 'true'
        ) {
          const contactList = await models.contact.findAll({
            where:
              userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES
                ? { agency_user_fk: agency_user_id, agency_fk }
                : { agency_fk },
            attributes: ['contact_id'],
          });

          let contactIds = contactList.map(
            ({ dataValues }) => dataValues.contact_id,
          );

          contactIds = [...new Set(contactIds)];

          where.contact_fk = { [Op.in]: contactIds };
        }

        const include = [
          {
            model: models.contact,
            required: false,
            attributes: {
              include: ['contact_id', 'first_name', 'last_name', 'status'],
            },
            where:
              userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES
                ? { agency_user_fk: agency_user_id, agency_fk }
                : { agency_fk },
          },
          {
            model: models.agency_user,
            required: false,
            include: [
              {
                model: models.user,
                required: false,
                attributes: { exclude: ['password', 'password_salt'] },
              },
              {
                model: models.agency,
                required: false,
                attributes: {
                  include: ['agency_id', 'agency_name', 'agency_logo_url'],
                },
              },
            ],
          },
          // {
          //   model: models.shortlisted_property_comment_attachment,
          //   required: false,
          // },
          {
            model: models.shortlisted_property,
            required: false,
            include: [
              {
                model: models.contact,
                required: false,
                attributes: {
                  include: ['contact_id', 'first_name', 'last_name', 'status'],
                },
                where: { agency_user_fk: agency_user_id },
              },
              {
                model: models.project_property,
                required: false,
                include: [
                  {
                    model: models.project,
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: models.shortlisted_property_comment,
            required: false,
            as: 'shortlisted_property_comment_reply',
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: false,
                    attributes: {
                      exclude: ['password', 'password_salt'],
                    },
                  },
                  {
                    model: models.agency,
                    required: false,
                    attributes: {
                      include: ['agency_id', 'agency_name', 'agency_logo_url'],
                    },
                  },
                ],
              },
              {
                model: models.shortlisted_property_comment_attachment,
                required: false,
              },
              {
                model: models.contact,
                required: false,
                attributes: {
                  include: ['contact_id', 'first_name', 'status'],
                },
              },
              {
                model: models.shortlisted_property_comment_reaction,
                required: false,
              },
            ],
          },
          // {
          //   model: models.shortlisted_property_comment_reaction,
          //   required: false,
          // },
        ];

        let [shortlistedPropertyComments, totalCount] = await Promise.all([
          c.shortListedPropertyComment.findAll(where, {
            include,
            offset,
            limit,
            order: [['comment_date', 'DESC']],
          }),
          c.shortListedPropertyComment.count(where),
        ]);
        const metadata = {
          pageCount: pageSize ? Math.ceil(totalCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount,
        };

        if (h.notEmpty(shortlistedPropertyComments)) {
          shortlistedPropertyComments = shortlistedPropertyComments.map(
            (shortlistedPropertyComment) => {
              return JSON.parse(JSON.stringify(shortlistedPropertyComment));
            },
          );
        }

        h.api.createResponse(
          req,
          res,
          200,
          {
            shortlisted_property_comments: shortlistedPropertyComments,
            metadata,
          },
          '1-shortlisted-property-comment-1621787533608',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to retrieve shortlisted property comments.`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-comment-1621787545586',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/shortlisted-property/:shortlisted_property_id/comment Staff user create new comment in shortlisted property
   * @apiName StaffShortlistedPropertyCommentCreateComment
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedPropertyComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_id Shortlisted property ID
   * @apiParam {string} parent_comment_fk Parent Comment ID
   * @apiParam {string} message Message
   * @apiParam {array} attachments Message attachments
   * @apiParam {object} contact Details of buyer contact
   * @apiParam {object} unit Unit details of shortlisted property
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   */
  fastify.route({
    method: 'POST',
    url: '/staff/shortlisted-property/:shortlisted_property_id/comment',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_id'],
        properties: {
          shortlisted_property_id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' },
          parent_comment_fk: { type: 'string' },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file_url: { type: 'string' },
                file_name: { type: 'string' },
              },
            },
          },
          contact_comment: { type: 'boolean' },
          send_email: { type: 'boolean' },
          // contact: {
          //     type: 'object',
          //     required: ['email', 'first_name'],
          //     properties: {
          //         email: { type: 'string' },
          //         first_name: { type: 'string' },
          //         last_name: { type: 'string' },
          //         permalink: { type: 'string' },
          //         mobile_number: { type: 'string' }
          //     }
          // },
          // unit: {
          //     type: 'object',
          //     properties: {
          //         project: {
          //             type: 'object',
          //             properties: {
          //                 project_name : { type: 'string' }
          //             }
          //         },
          //         unit: {
          //             type: 'object',
          //             properties: {
          //                 floor: { type: 'string' },
          //                 sqm: { type: 'string' },
          //                 direction_facing: { type: 'string' }
          //             }
          //         }
          //     }
          // }
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_property_comment_id: { type: 'string' },
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
        const { shortlisted_property_id } = req.params;
        const { message, attachments, parent_comment_fk } = req.body;
        let { send_email } = req.body;
        if (h.isEmpty(send_email)) send_email = true;
        const { user_id } = h.user.getCurrentUser(req);
        const {
          shortlistedPropertyCommentId,
          shortListedPropertyCommentAttachmentIds,
        } = await h.database.transaction(async (transaction) => {
          // Retrieve agency_user_id from current user_id
          const { agency_user_id } = await c.agencyUser.findOne({
            user_fk: user_id,
          });
          // Create comment
          const shortlistedPropertyCommentId =
            await c.shortListedPropertyComment.create(
              {
                shortlisted_property_fk: shortlisted_property_id,
                agency_user_fk: agency_user_id,
                parent_comment_fk: parent_comment_fk || undefined,
                message,
                comment_date: Sequelize.literal('NOW()'),
                status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
              },
              { transaction },
            );
          const shortListedPropertyCommentAttachmentIds = [];
          if (h.notEmpty(attachments)) {
            for (let i = 0; i < attachments.length; i++) {
              const attachment = attachments[i];
              const attachmentId =
                await c.shortListedPropertyCommentAttachment.create({
                  shortlisted_property_comment_fk: shortlistedPropertyCommentId,
                  attachment_url: attachment.file_url,
                  file_name: attachment.file_name,
                });
              shortListedPropertyCommentAttachmentIds.push(attachmentId);
            }
          }
          return {
            shortlistedPropertyCommentId,
            shortListedPropertyCommentAttachmentIds,
          };
        });
        const shortlistedProperty = await c.shortListedProperty.findOne(
          { shortlisted_property_id },
          { include: [{ model: models.contact, required: true }] },
        );

        // if contact preference is true and the send_email flag is true
        if (
          shortlistedProperty.contact.contact_email_preference &&
          send_email
        ) {
          // Send comment email to buyer contact
          await c.shortlistedPropertyCommentEmail.constructCommentEmailToBuyer(
            req,
            user_id,
            shortlistedProperty.contact.contact_id,
            // unit,
            message,
            shortlisted_property_id,
            shortlistedPropertyCommentId,
          );
        }
        h.api.createResponse(
          req,
          res,
          200,
          {
            shortlisted_property_comment_id: shortlistedPropertyCommentId,
            shortlisted_property_comment_attachment_ids:
              shortListedPropertyCommentAttachmentIds,
          },
          '1-shortlisted-property-comment-1621785761283',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to create shortlisted property comment.`,
          err,
        );
        h.api.createResponse(
          res,
          500,
          {},
          '2-shortlisted-property-comment-1621785808783',
          { portal },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/shortlisted-property/comment/:comment_id Retrieve shortlisted property comment given comment ID
   * @apiName StaffShortlistedPropertyCommentGetCommentByCommentId
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedPropertyComments
   * @apiUse ServerError
   *
   * @apiParam {string} comment_id Comment ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   */
  fastify.route({
    method: 'GET',
    url: '/staff/shortlisted-property/comment/:comment_id',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { comment_id } = req.params;
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_user_id } = await agencyUserController.findOne({
          user_fk: user_id,
        });
        await userRoleController.findOne({
          user_fk: user_id,
        });

        let shortlistedPropertyComment;

        shortlistedPropertyComment = await c.shortListedPropertyComment.findOne(
          {
            shortlisted_property_comment_id: comment_id,
            status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
          },
          {
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: true,
                    attributes: { exclude: ['password', 'password_salt'] },
                  },
                  {
                    model: models.agency,
                    required: true,
                    attributes: {
                      include: ['agency_id', 'agency_name', 'agency_logo_url'],
                    },
                  },
                ],
              },
              {
                model: models.shortlisted_property_comment_attachment,
                required: false,
              },
              {
                model: models.contact,
                required: false,
                attributes: {
                  include: ['contact_id', 'first_name', 'last_name', 'status'],
                },
              },
              {
                model: models.shortlisted_property,
                required: false,
                include: [
                  {
                    model: models.contact,
                    required: false,
                    attributes: {
                      include: [
                        'contact_id',
                        'first_name',
                        'last_name',
                        'status',
                      ],
                    },
                    where: { agency_user_fk: agency_user_id },
                  },
                  {
                    model: models.project_property,
                    required: false,
                    attributes: {
                      include: [
                        'floor',
                        'unit_number',
                        'unit_type',
                        'sqm',
                        'starting_price',
                        'number_of_bathroom',
                        'number_of_bedroom',
                        'number_of_parking_lots',
                      ],
                    },
                    include: [
                      {
                        model: models.project,
                        required: false,
                        attributes: {
                          include: ['name', 'currency_code'],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                model: models.shortlisted_property_comment,
                required: false,
                as: 'shortlisted_property_comment_reply',
                include: [
                  {
                    model: models.agency_user,
                    required: false,
                    include: [
                      {
                        model: models.user,
                        required: true,
                        attributes: {
                          exclude: ['password', 'password_salt'],
                        },
                      },
                      {
                        model: models.agency,
                        required: true,
                        attributes: {
                          include: [
                            'agency_id',
                            'agency_name',
                            'agency_logo_url',
                          ],
                        },
                      },
                    ],
                  },
                  {
                    model: models.shortlisted_property_comment_attachment,
                    required: false,
                  },
                  {
                    model: models.contact,
                    required: false,
                    attributes: {
                      include: ['contact_id', 'first_name', 'status'],
                    },
                  },
                  {
                    model: models.shortlisted_property_comment_reaction,
                    required: false,
                  },
                ],
              },
              {
                model: models.shortlisted_property_comment_reaction,
                required: false,
              },
            ],
            order: [['comment_date', 'DESC']],
          },
        );

        shortlistedPropertyComment = JSON.parse(
          JSON.stringify(shortlistedPropertyComment),
        );
        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_property_comment: shortlistedPropertyComment },
          '1-shortlisted-property-comment-1621787533608',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to retrieve shortlisted property comments.`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-comment-1621787545586',
          { portal },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/shortlisted-property/:shortlisted_property_comment_id/delete-comment Staff user delete a comment in shortlisted property
   * @apiName StaffShortlistedPropertyCommentDeleteComment
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedPropertyComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_comment_id Shortlisted property comment ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/shortlisted-property/:shortlisted_property_comment_id/delete-comment',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_comment_id'],
        properties: {
          shortlisted_property_comment_id: { type: 'string' },
        },
      },
      body: {},
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_property_comment_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
      await userMiddleware.verifyAgencyMakingRequestHasAccessToProperty(
        req,
        res,
      );
    },
    handler: async (req, res) => {
      try {
        const { shortlisted_property_comment_id } = req.params;
        const { shortlistedPropertyCommentId } = await h.database.transaction(
          async (transaction) => {
            // Update comment status to deleted
            const shortlistedPropertyCommentId =
              await c.shortListedPropertyComment.update(
                shortlisted_property_comment_id,
                {
                  status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.DELETED,
                },
                { transaction },
              );

            const child_comments = await c.shortListedPropertyComment.findAll(
              {
                parent_comment_fk: shortlisted_property_comment_id,
              },
              { transaction },
            );

            if (child_comments.length > 0) {
              await Promise.all(
                child_comments.map(async (child) => {
                  await c.shortListedPropertyComment.update(
                    child.shortlisted_property_comment_id,
                    {
                      status:
                        constant.SHORTLIST_PROPERTY.COMMENT.STATUS.DELETED,
                    },
                    { transaction },
                  );
                }),
              );
            }
            return shortlistedPropertyCommentId;
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_property_comment_id: shortlistedPropertyCommentId },
          '1-shortlisted-property-comment-1641367796741',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to delete shortlisted property comment.`,
          err,
        );
        h.api.createResponse(
          res,
          500,
          {},
          '2-shortlisted-property-comment-1641367861046',
          { portal },
        );
      }
    },
  });

  next();
};
