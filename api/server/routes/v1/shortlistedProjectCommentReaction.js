const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const models = require('../../models');
const h = require('../../helpers');
const shortListedProjectCommentReactionController =
  require('../../controllers/shortlistedProjectCommentReaction').makeShortListedProjectCommentReactionController(
    models,
  );

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/comment/:shortlisted_project_comment_id/react Create new comment reaction
   * @apiName ShortlistedProjectCommentCreateCommentReaction
   * @apiVersion 1.0.0
   * @apiGroup UserShortlistedProjectCommentReaction
   * @apiUse ServerError
   *
   * @apiParam {string} shortlisted_project_comment_id Shortlisted project's comment ID
   * @apiParam {string} contact_fk Contact ID
   * @apiParam {string} agency_user_fk Agency User ID
   * @apiParam {string} emoji Reaction emoji
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} shortlisted_project_comment_reaction_id Comment reaction id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "shortlisted_project_comment_reaction_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/shortlisted-project/comment/:shortlisted_project_comment_id/react',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_comment_id'],
        properties: {
          shortlisted_project_comment_id: { type: 'string' },
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
            enum: Object.values(constant.SHORTLIST_PROJECT.COMMENT.REACTION),
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
            shortlisted_project_comment_reaction_id: { type: 'string' },
          },
        },
      },
    },
    handler: async (req, res) => {
      try {
        const { shortlisted_project_comment_id } = req.params;
        const { contact_fk = null, agency_user_fk = null, emoji } = req.body;
        const response = await h.database.transaction(async (transaction) => {
          const reactionRecord =
            await shortListedProjectCommentReactionController.findOne({
              shortlisted_project_comment_fk: shortlisted_project_comment_id,
              contact_fk,
              agency_user_fk,
            });
          let shortlisted_project_comment_reaction_id = '';
          if (h.isEmpty(reactionRecord)) {
            shortlisted_project_comment_reaction_id =
              await shortListedProjectCommentReactionController.create(
                {
                  shortlisted_project_comment_fk:
                    shortlisted_project_comment_id,
                  contact_fk,
                  agency_user_fk,
                  emoji,
                  created_by: contact_fk || agency_user_fk,
                },
                { transaction },
              );
          } else {
            shortlisted_project_comment_reaction_id =
              reactionRecord.shortlisted_project_comment_reaction_id;
            await shortListedProjectCommentReactionController.update(
              shortlisted_project_comment_reaction_id,
              {
                emoji,
                updated_by: contact_fk || agency_user_fk,
              },
              { transaction },
            );
          }
          return { shortlisted_project_comment_reaction_id };
        });
        h.api.createResponse(
          req,
          res,
          200,
          {
            shortlisted_project_comment_reaction_id:
              response.shortlisted_project_comment_reaction_id,
          },
          '1-shortlisted-project-comment-reaction-1623147669',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: failed to create shortlisted project comment reaction`,
          err,
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-shortlisted-project-comment-reaction-1623147688',
        );
      }
    },
  });

  next();
};
