const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const Sequelize = require('sequelize');
const models = require('../../models');
const h = require('../../helpers');
// const projectContentController =
//   require("../../controllers/content/project").makeController(models);
// const shortListedPropertyController =
//   require("../../controllers/shortListedProperty").makeShortListedPropertyController(
//     models
//   );
const shortListedPropertyCommentController =
  require('../../controllers/shortlistedPropertyComment').makeShortListedPropertyCommentController(
    models,
  );
const shortListedPropertyCommentAttachmentController =
  require('../../controllers/shortlistedPropertyCommentAttachment').makeShortListedPropertyCommentAttachmentController(
    models,
  );
const shortlistedPropertyCommentEmailController =
  require('../../controllers/shortlistedPropertyCommentEmail').makeShortlistedPropertyCommentEmailController(
    models,
  );
const contactController =
  require('../../controllers/contact').makeContactController(models);

const emailNotificationSettingController =
  require('../../controllers/emailNotificationSetting').makeController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/shortlisted-property/:shortlisted_property_id/comment Create new comment in shortlisted property
   * @apiName ShortlistedPropertyCommentCreateComment
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedPropertyComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_id Shortlisted property ID
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
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_property_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/shortlisted-property/:shortlisted_property_id/comment',
    onRequest: fastify.csrfProtection,
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_id'],
        properties: {
          shortlisted_property_id: { type: 'string' },
          _csrf: { type: 'string' },
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
          // project : { type: 'object' }
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
    handler: async (req, res) => {
      try {
        const { shortlisted_property_id } = req.params;
        const {
          contact_id,
          message,
          attachments,
          agency_user_fk,
          parent_comment_fk,
        } = req.body;
        const {
          shortlistedPropertyCommentId,
          shortListedPropertyCommentAttachmentIds,
        } = await h.database.transaction(async (transaction) => {
          const shortlistedPropertyCommentId =
            await shortListedPropertyCommentController.create(
              {
                shortlisted_property_fk: shortlisted_property_id,
                contact_fk: contact_id,
                agency_user_fk: agency_user_fk || '',
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
                await shortListedPropertyCommentAttachmentController.create(
                  {
                    shortlisted_property_comment_fk:
                      shortlistedPropertyCommentId,
                    attachment_url: attachment.file_url,
                    file_name: attachment.file_name,
                  },
                  { transaction },
                );
              shortListedPropertyCommentAttachmentIds.push(attachmentId);
            }
          }
          return {
            shortlistedPropertyCommentId,
            shortListedPropertyCommentAttachmentIds,
          };
        });

        // Send comment email to agency user
        const contactDetails = await contactController.findOne({ contact_id });
        const email_comment_id = h.notEmpty(parent_comment_fk)
          ? parent_comment_fk
          : shortlistedPropertyCommentId;

        const canSend = await emailNotificationSettingController.ifCanSendEmail(
          contactDetails.agency_user_fk,
          'proposal_comment',
        );

        if (canSend) {
          await shortlistedPropertyCommentEmailController.constructCommentEmailToAgent(
            contact_id,
            message,
            shortlisted_property_id,
            email_comment_id,
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
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: failed to create shortlisted property comment`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-comment-1621785808783',
        );
      }
    },
  });

  /**
   * @api {get} /v1/shortlisted-property/:shortlisted_property_id/comment Create new comment in shortlisted property
   * @apiName ShortlistedPropertyCommentCreateComment
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedPropertyComment
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_id Shortlisted property ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_id Shortlisted property id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_property_comments": [
   *        {
   *          "created_date_seconds": 23000,
   *          "created_date_time_ago": "8 hours ago",
   *          "updated_date_seconds": 23000,
   *          "updated_date_time_ago": "8 hours ago",
   *          "shortlisted_property_comment_id": "cf28b7dc-d14d-45d5-9e8c-a07f6b6dacce",
   *          "shortlisted_property_fk": "29d4894c-baca-11eb-a9ef-741d33a7ad70",
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
   *          "shortlisted_property_comment_attachments": [
   *            {
   *              "created_date_seconds": 26000,
   *              "created_date_time_ago": "5 days ago",
   *              "updated_date_seconds": 26000,
   *              "updated_date_time_ago": "5 days ago",
   *              "shortlisted_property_comment_attachment_id": "886f6f69-5873-43d6-aa37-b863a6bf1e4f",
   *              "shortlisted_property_comment_fk": "ba8da6b8-d6e0-47e7-92c8-083b48ea9d50",
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
    url: '/shortlisted-property/:shortlisted_property_id/comment',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_id'],
        properties: {
          shortlisted_property_id: { type: 'string' },
        },
      },
      // response: {
      // 	200: {
      // 		type: 'object',
      // 		properties: {
      // 			status: { type: 'string' },
      // 			message: { type: 'string' },
      // 			message_code: { type: 'string' },
      // 			shortlisted_property_comments: {
      // 				type: 'array',
      // 				items: {
      // 					type: 'object',
      // 					properties: {
      // 						created_date_seconds: { type: 'number' },
      // 						created_date_time_ago: { type: 'string' },
      // 						updated_date_seconds: { type: 'number' },
      // 						updated_date_time_ago: { type: 'string' },
      // 						shortlisted_property_comment_id: { type: 'string' },
      // 						shortlisted_property_fk: { type: 'string' },
      // 						contact_fk: { type: 'string' },
      // 						agency_user_fk: { type: 'string' },
      // 						message: { type: 'string' },
      // 						parent_comment_fk: { type: 'string' },
      // 						comment_date: { type: 'string' },
      // 						status: { type: 'string' },
      // 						created_by: { type: 'string' },
      // 						created_date: { type: 'string' },
      // 						updated_by: { type: 'string' },
      // 						updated_date: { type: 'string' },
      // 						comment_date_raw: { type: 'string' },
      // 						comment_date_seconds: { type: 'number' },
      // 						comment_date_time_ago: { type: 'string' },
      // 						created_date_raw: { type: 'string' },
      // 						updated_date_raw: { type: 'string' },
      // 						agency_user: {
      // 							type: ['object', 'null'],
      // 							properties: {
      // 								created_date_seconds: { type: 'number' },
      // 								created_date_time_ago: { type: 'string' },
      // 								updated_date_seconds: { type: 'number' },
      // 								updated_date_time_ago: { type: 'string' },
      // 								agency_user_id: { type: 'string' },
      // 								user_fk: { type: 'string' },
      // 								agency_fk: { type: 'string' },
      // 								created_by: { type: 'string' },
      // 								created_date: { type: 'string' },
      // 								updated_by: { type: 'string' },
      // 								updated_date: { type: 'string' },
      // 								created_date_raw: { type: 'string' },
      // 								updated_date_raw: { type: 'string' },
      // 								user: {
      // 									type: 'object',
      // 									properties: {
      // 										full_name: { type: 'string' },
      // 										profile_picture_url: { type: 'string' },
      // 										created_date_seconds: { type: 'number' },
      // 										created_date_time_ago: { type: 'string' },
      // 										updated_date_seconds: { type: 'number' },
      // 										updated_date_time_ago: { type: 'string' },
      // 										user_id: { type: 'string' },
      // 										first_name: { type: 'string' },
      // 										middle_name: { type: 'string' },
      // 										last_name: { type: 'string' },
      // 										email: { type: 'string' },
      // 										mobile_number: { type: 'string' },
      // 										date_of_birth: { type: 'string' },
      // 										gender: { type: 'string' },
      // 										nationality: { type: 'string' },
      // 										ordinarily_resident_location: { type: 'string' },
      // 										permanent_resident: { type: 'string' },
      // 										buyer_type: { type: 'string' },
      // 										status: { type: 'string' },
      // 										created_by: { type: 'string' },
      // 										created_date: { type: 'string' },
      // 										updated_by: { type: 'string' },
      // 										updated_date: { type: 'string' },
      // 										created_date_raw: { type: 'string' },
      // 										updated_date_raw: { type: 'string' },
      // 									}
      // 								},
      // 								agency: {
      // 									type: 'object',
      // 									properties: {
      // 										agency_id: { type: 'string' },
      // 										agency_name: { type: 'string' },
      // 										agency_logo_url: { type: 'string' }
      // 									}
      // 								}
      // 							}
      // 						},
      // 						shortlisted_property_comment_attachments: {
      // 							type: 'array',
      // 							items: {
      // 								type: 'object',
      // 								properties: {
      // 									created_date_seconds: { type: 'number' },
      // 									created_date_time_ago: { type: 'string' },
      // 									updated_date_seconds: { type: 'number' },
      // 									updated_date_time_ago: { type: 'string' },
      // 									shortlisted_property_comment_attachment_id: { type: 'string' },
      // 									shortlisted_property_comment_fk: { type: 'string' },
      // 									attachment_url: { type: 'string' },
      // 									attachment_title: { type: 'string' },
      // 									created_by: { type: 'string' },
      // 									created_date: { type: 'string' },
      // 									updated_by: { type: 'string' },
      // 									updated_date: { type: 'string' },
      // 									created_date_raw: { type: 'string' },
      // 									updated_date_raw: { type: 'string' },
      // 								}
      // 							}
      // 						},
      // 						contact: {
      // 							type: ['object', 'null'],
      // 							properties: {
      // 								contact_id: { type: 'string' },
      // 								first_name: { type: 'string' },
      // 								status: { type: 'string' }
      // 							}
      // 						}
      // 					}
      // 				}
      // 			}
      // 		}
      // 	}
      // }
    },
    handler: async (req, res) => {
      try {
        const { shortlisted_property_id } = req.params;
        const shortlistedPropertyComments =
          await shortListedPropertyCommentController.findAll(
            {
              shortlisted_property_fk: shortlisted_property_id,
              status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
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
        h.api.createResponse(
          req,
          res,
          200,
          { shortlisted_property_comments: shortlistedPropertyComments },
          '1-shortlisted-property-comment-1621787533608',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: failed to retrieve shortlisted property comments`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-comment-1621787545586',
        );
      }
    },
  });

  next();
};
