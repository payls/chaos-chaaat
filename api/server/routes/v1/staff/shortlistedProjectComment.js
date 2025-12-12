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
   * @api {get} /v1/staff/shortlisted-project/comments Retrieve list of shortlisted project comments given agency user ID
   * @apiName StaffShortlistedProjectCommentGetComments
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedProjectComments
   * @apiUse ServerError
   *
   * @apiParam {string="buyer_has_responded","buyer_has_yet_to_respond"} [comment_view_type="buyer_has_responded"] Comment view type
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   */
  fastify.route({
    method: 'POST',
    url: '/staff/shortlisted-project/comments',
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
          status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.ACTIVE,
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
          //   model: models.shortlisted_project_comment_attachment,
          //   required: false,
          // },
          {
            model: models.shortlisted_project,
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
                model: models.project_project,
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
            model: models.shortlisted_project_comment,
            required: false,
            as: 'shortlisted_project_comment_reply',
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
                model: models.shortlisted_project_comment_attachment,
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
                model: models.shortlisted_project_comment_reaction,
                required: false,
              },
            ],
          },
          // {
          //   model: models.shortlisted_project_comment_reaction,
          //   required: false,
          // },
        ];

        let [shortlistedProjectComments, totalCount] = await Promise.all([
          c.shortListedProjectComment.findAll(where, {
            include,
            offset,
            limit,
            order: [['comment_date', 'DESC']],
          }),
          c.shortListedProjectComment.count(where),
        ]);
        const metadata = {
          pageCount: pageSize ? Math.ceil(totalCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount,
        };

        if (h.notEmpty(shortlistedProjectComments)) {
          shortlistedProjectComments = shortlistedProjectComments.map(
            (shortlistedProjectComment) => {
              return JSON.parse(JSON.stringify(shortlistedProjectComment));
            },
          );
        }

        h.api.createResponse(
          req,
          res,
          200,
          {
            shortlisted_project_comments: shortlistedProjectComments,
            metadata,
          },
          '1-shortlisted-project-comment-1621787533608',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to retrieve shortlisted project comments.`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-comment-1621787545586',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/shortlisted-project/:shortlisted_project_id/comment Staff user create new comment in shortlisted project
   * @apiName StaffShortlistedProjectCommentCreateComment
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedProjectComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_id Shortlisted project ID
   * @apiParam {string} parent_comment_fk Parent Comment ID
   * @apiParam {string} message Message
   * @apiParam {array} attachments Message attachments
   * @apiParam {object} contact Details of buyer contact
   * @apiParam {object} unit Unit details of shortlisted project
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   */
  fastify.route({
    method: 'POST',
    url: '/staff/shortlisted-project/:shortlisted_project_id/comment',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_id'],
        properties: {
          shortlisted_project_id: { type: 'string' },
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
            shortlisted_project_comment_id: { type: 'string' },
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
        const { shortlisted_project_id } = req.params;
        const { message, attachments, parent_comment_fk } = req.body;
        let { send_email } = req.body;
        if (h.isEmpty(send_email)) send_email = true;
        const { user_id } = h.user.getCurrentUser(req);
        const {
          shortlistedProjectCommentId,
          shortListedProjectCommentAttachmentIds,
        } = await h.database.transaction(async (transaction) => {
          // Retrieve agency_user_id from current user_id
          const { agency_user_id } = await c.agencyUser.findOne({
            user_fk: user_id,
          });
          // Create comment
          const shortlistedProjectCommentId =
            await c.shortlistedProjectComment.create(
              {
                shortlisted_project_fk: shortlisted_project_id,
                agency_user_fk: agency_user_id,
                parent_comment_fk: parent_comment_fk || undefined,
                message,
                comment_date: Sequelize.literal('NOW()'),
                status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.ACTIVE,
              },
              { transaction },
            );
          const shortListedProjectCommentAttachmentIds = [];
          if (h.notEmpty(attachments)) {
            for (let i = 0; i < attachments.length; i++) {
              const attachment = attachments[i];
              const attachmentId =
                await c.shortListedProjectCommentAttachment.create({
                  shortlisted_project_comment_fk: shortlistedProjectCommentId,
                  attachment_url: attachment.file_url,
                  file_name: attachment.file_name,
                });
              shortListedProjectCommentAttachmentIds.push(attachmentId);
            }
          }
          return {
            shortlistedProjectCommentId,
            shortListedProjectCommentAttachmentIds,
          };
        });
        const shortlistedProject = await c.shortlistedProject.findOne(
          { shortlisted_project_id },
          { include: [{ model: models.contact, required: true }] },
        );

        // if contact preference is true and the send_email flag is true
        if (shortlistedProject.contact.contact_email_preference && send_email) {
          // Send comment email to buyer contact
          await c.shortlistedProjectCommentEmail.constructCommentEmailToBuyer(
            req,
            user_id,
            shortlistedProject.contact.contact_id,
            // unit,
            message,
            shortlisted_project_id,
            shortlistedProjectCommentId,
          );
        }
        h.api.createResponse(
          req,
          res,
          200,
          {
            shortlisted_project_comment_id: shortlistedProjectCommentId,
            shortlisted_project_comment_attachment_ids:
              shortListedProjectCommentAttachmentIds,
          },
          '1-shortlisted-project-comment-1621785761283',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to create shortlisted project comment.`,
          err,
        );
        h.api.createResponse(
          res,
          500,
          {},
          '2-shortlisted-project-comment-1621785808783',
          { portal },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/shortlisted-project/comment/:comment_id Retrieve shortlisted project comment given comment ID
   * @apiName StaffShortlistedProjectCommentGetCommentByCommentId
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedProjectComments
   * @apiUse ServerError
   *
   * @apiParam {string} comment_id Comment ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   */
  fastify.route({
    method: 'GET',
    url: '/staff/shortlisted-project/comment/:comment_id',
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

        let shortlistedProjectComment;

        shortlistedProjectComment = await c.shortlistedProjectComment.findOne(
          {
            shortlisted_project_comment_id: comment_id,
            status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.ACTIVE,
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
                model: models.shortlisted_project_comment_attachment,
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
                model: models.shortlisted_project,
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
                    model: models.project,
                    required: false,
                  },
                ],
              },
              {
                model: models.shortlisted_project_comment,
                required: false,
                as: 'shortlisted_project_comment_reply',
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
                    model: models.shortlisted_project_comment_attachment,
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
                    model: models.shortlisted_project_comment_reaction,
                    required: false,
                  },
                ],
              },
              {
                model: models.shortlisted_project_comment_reaction,
                required: false,
              },
            ],
            order: [['comment_date', 'DESC']],
          },
        );

        shortlistedProjectComment = JSON.parse(
          JSON.stringify(shortlistedProjectComment),
        );
        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_project_comment: shortlistedProjectComment },
          '1-shortlisted-project-comment-1658735247891',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to retrieve shortlisted project comments.`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-comment-1658735254303',
          { portal },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/shortlisted-project/:shortlisted_project_comment_id/delete-comment Staff user delete a comment in shortlisted project
   * @apiName StaffShortlistedProjectCommentDeleteComment
   * @apiVersion 1.0.0
   * @apiGroup StaffShortlistedProjectComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_comment_id Shortlisted project comment ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/shortlisted-project/:shortlisted_project_comment_id/delete-comment',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_comment_id'],
        properties: {
          shortlisted_project_comment_id: { type: 'string' },
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
            shortlisted_project_comment_id: { type: 'string' },
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
        const { shortlisted_project_comment_id } = req.params;
        const { shortlistedProjectCommentId } = await h.database.transaction(
          async (transaction) => {
            // Update comment status to deleted
            const shortlistedProjectCommentId =
              await c.shortListedProjectComment.update(
                shortlisted_project_comment_id,
                {
                  status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.DELETED,
                },
                { transaction },
              );

            const child_comments = await c.shortListedProjectComment.findAll(
              {
                parent_comment_fk: shortlisted_project_comment_id,
              },
              { transaction },
            );

            if (child_comments.length > 0) {
              await Promise.all(
                child_comments.map(async (child) => {
                  await c.shortListedProjectComment.update(
                    child.shortlisted_project_comment_id,
                    {
                      status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.DELETED,
                    },
                    { transaction },
                  );
                }),
              );
            }
            return shortlistedProjectCommentId;
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_project_comment_id: shortlistedProjectCommentId },
          '1-shortlisted-project-comment-1641367796741',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: Staff user failed to delete shortlisted project comment.`,
          err,
        );
        h.api.createResponse(
          res,
          500,
          {},
          '2-shortlisted-project-comment-1641367861046',
          { portal },
        );
      }
    },
  });

  next();
};
