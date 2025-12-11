const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const shortListedPropertyCommentReactionController =
  require('../../../controllers/shortlistedPropertyCommentReaction').makeShortListedPropertyCommentReactionController(
    models,
  );

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/comment/:shortlisted_property_comment_id/react Create new comment reaction
   * @apiName ShortlistedPropertyCommentCreateCommentReaction
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedPropertyCommentReaction
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_property_comment_id Shortlisted property's comment ID
   * @apiParam {string} contact_fk Contact ID
   * @apiParam {string} agency_user_fk Agency User ID
   * @apiParam {string} emoji Reaction emoji
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_property_comment_reaction_id Comment reaction id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_property_comment_reaction_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/shortlisted-property/comment/:shortlisted_property_comment_id/react',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_property_comment_id'],
        properties: {
          shortlisted_property_comment_id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['emoji'],
        properties: {
          contact_fk: { type: 'string' },
          agency_user_fk: { type: 'string' },
          emoji: {
            type: 'string',
            enum: Object.values(constant.SHORTLIST_PROPERTY.COMMENT.REACTION),
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
            shortlisted_property_comment_reaction_id: { type: 'string' },
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
        const { shortlisted_property_comment_id } = req.params;
        const { agency_user_fk = null, emoji } = req.body;
        const response = await h.database.transaction(async (transaction) => {
          const reactionRecord =
            await shortListedPropertyCommentReactionController.findOne({
              shortlisted_property_comment_fk: shortlisted_property_comment_id,
              agency_user_fk,
            });
          let shortlisted_property_comment_reaction_id = '';
          if (h.isEmpty(reactionRecord)) {
            shortlisted_property_comment_reaction_id =
              await shortListedPropertyCommentReactionController.create(
                {
                  shortlisted_property_comment_fk:
                    shortlisted_property_comment_id,
                  agency_user_fk,
                  emoji,
                  created_by: agency_user_fk,
                },
                { transaction },
              );
          } else {
            shortlisted_property_comment_reaction_id =
              reactionRecord.shortlisted_property_comment_reaction_id;
            await shortListedPropertyCommentReactionController.update(
              shortlisted_property_comment_reaction_id,
              {
                emoji,
                updated_by: agency_user_fk,
              },
              { transaction },
            );
          }
          return { shortlisted_property_comment_reaction_id };
        });
        h.api.createResponse(
          req,
          res,
          200,
          {
            shortlisted_property_comment_reaction_id:
              response.shortlisted_property_comment_reaction_id,
          },
          '1-shortlisted-property-comment-reaction-1623147669',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: failed to create shortlisted property comment reaction`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-property-comment-reaction-1623147688',
          { portal },
        );
      }
    },
  });

  next();
};
