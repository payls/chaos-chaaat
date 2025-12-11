const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const Sequelize = require('sequelize');
const models = require('../../models');
const h = require('../../helpers');

const shortListedProjectCommentController =
  require('../../controllers/shortlistedProjectComment').makeShortListedProjectCommentController(
    models,
  );
const shortListedProjectCommentAttachmentController =
  require('../../controllers/shortlistedProjectCommentAttachment').makeShortListedProjectCommentAttachmentController(
    models,
  );

const shortlistedProjectCommentEmailController =
  require('../../controllers/shortlistedProjectCommentEmail').makeShortlistedProjectCommentEmailController(
    models,
  );

const emailNotificationSettingController =
  require('../../controllers/emailNotificationSetting').makeController(models);

const contactController =
  require('../../controllers/contact').makeContactController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/shortlisted-project/:shortlisted_project_id/comment Create new comment in shortlisted project
   * @apiName ShortlistedProjectCommentCreateComment
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProjectComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_id Shortlisted project ID
   * @apiParam {string} contact_id Contact ID
   * @apiParam {string} agency_user_fk Agency User ID
   * @apiParam {string} parent_comment_fk Parent Comment ID
   * @apiParam {string} message Message
   * @apiParam {array} attachments Message attachments
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_project_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/shortlisted-project/:shortlisted_project_id/comment',
    // onRequest: fastify.csrfProtection,
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_id'],
        properties: {
          shortlisted_project_id: { type: 'string' },
          // _csrf: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['contact_id', 'message'],
        properties: {
          contact_id: { type: 'string' },
          agency_user_fk: { type: 'string' },
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
    handler: async (req, res) => {
      try {
        const { shortlisted_project_id } = req.params;
        const {
          contact_id,
          attachments,
          message,
          agency_user_fk,
          parent_comment_fk,
        } = req.body;
        const {
          shortlistedProjectCommentId,
          shortListedProjectCommentAttachmentIds,
        } = await h.database.transaction(async (transaction) => {
          const shortlistedProjectCommentId =
            await shortListedProjectCommentController.create(
              {
                shortlisted_project_fk: shortlisted_project_id,
                contact_fk: contact_id,
                agency_user_fk: agency_user_fk || '',
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
                await shortListedProjectCommentAttachmentController.create(
                  {
                    shortlisted_project_comment_fk: shortlistedProjectCommentId,
                    attachment_url: attachment.file_url,
                    file_name: attachment.file_name,
                  },
                  { transaction },
                );
              shortListedProjectCommentAttachmentIds.push(attachmentId);
            }
          }
          return {
            shortlistedProjectCommentId,
            shortListedProjectCommentAttachmentIds,
          };
        });

        // Send comment email to agency user
        const contactDetails = await contactController.findOne({ contact_id });
        const email_comment_id = h.notEmpty(parent_comment_fk)
          ? parent_comment_fk
          : shortlistedProjectCommentId;

        const canSend = await emailNotificationSettingController.ifCanSendEmail(
          contactDetails.agency_user_fk,
          'proposal_comment',
        );

        if (canSend) {
          await shortlistedProjectCommentEmailController.constructCommentEmailToAgent(
            contact_id,
            message,
            shortlisted_project_id,
            email_comment_id,
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
          '1-shortlisted-project-comment-1658393152947',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: failed to create shortlisted project comment`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-comment-1658393196015',
        );
      }
    },
  });

  /**
   * @api {get} /v1/shortlisted-project/:shortlisted_project_id/comment Create new comment in shortlisted project
   * @apiName ShortlistedProjectCommentCreateComment
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProjectComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_id Shortlisted project ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_id Shortlisted project id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_project_comments": [
   *        {
   *          "created_date_seconds": 23000,
   *          "created_date_time_ago": "8 hours ago",
   *          "updated_date_seconds": 23000,
   *          "updated_date_time_ago": "8 hours ago",
   *          "shortlisted_project_comment_id": "cf28b7dc-d14d-45d5-9e8c-a07f6b6dacce",
   *          "shortlisted_project_fk": "29d4894c-baca-11eb-a9ef-741d33a7ad70",
   *          "contact_fk": null,
   *          "agency_user_fk": "7afb0288-bb15-11eb-a9ef-741d33a7ad70",
   *          "message": "hello world!",
   *          "parent_comment_fk": "32hf865r-baca-11eb-a9ef-741d33a7ad70",
   *          "comment_date": "23 May 2021 08:36 am",
   *          "status": "active",
   *          "created_by": null,
   *          "created_date": "23 May 2021 04:36 pm",
   *          "updated_by": null,
   *          "updated_date": "23 May 2021 04:36 pm",
   *          "agency_user": {
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
   *          },
   *          "comment_date_raw": "2021-05-23T08:36:41.000Z",
   *          "comment_date_seconds": 1621759001000,
   *          "comment_date_time_ago": "8 hours ago",
   *          "created_date_raw": "2021-05-23T16:36:41.000Z",
   *          "updated_date_raw": "2021-05-23T16:36:56.000Z",
   *          "shortlisted_project_comment_attachments": [
   *            {
   *              "created_date_seconds": 26000,
   *              "created_date_time_ago": "5 days ago",
   *              "updated_date_seconds": 26000,
   *              "updated_date_time_ago": "5 days ago",
   *              "shortlisted_project_comment_attachment_id": "886f6f69-5873-43d6-aa37-b863a6bf1e4f",
   *              "shortlisted_project_comment_fk": "ba8da6b8-d6e0-47e7-92c8-083b48ea9d50",
   *              "attachment_url": "https://cdn-staging.yourpave.com/user/profile/76421064c7d0990bbc238024d19ee795d986ee13f7163fdd81ec2e963fe54d3976d4f3b8579d7e8d8e1145d16074c34cb21dbcd8caa4d8f0b40b3778c804a8e3.jpeg",
   *              "attachment_title": null,
   *              "created_by": null,
   *              "created_date": "26 May 2021 04:59 pm",
   *              "updated_by": null,
   *              "updated_date": "26 May 2021 05:10 pm",
   *              "created_date_raw": "2021-05-26T16:59:27.000Z",
   *              "updated_date_raw": "2021-05-26T17:10:27.000Z"
   *            }
   *          ],
   *        }
   *      ],
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/shortlisted-project/:shortlisted_project_id/comment',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_id'],
        properties: {
          shortlisted_project_id: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const { shortlisted_project_id } = req.params;
        const shortlistedProjectComments =
          await shortListedProjectCommentController.findAll(
            {
              shortlisted_project_fk: shortlisted_project_id,
              status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.ACTIVE,
              [Sequelize.Op.or]: [
                { parent_comment_fk: null },
                { parent_comment_fk: '' },
              ],
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
        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_project_comments: shortlistedProjectComments },
          '1-shortlisted-project-comment-1658395150289',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: failed to retrieve shortlisted project comments`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-comment-1658395161503',
        );
      }
    },
  });

  next();
};
