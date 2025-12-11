const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP;
const models = require('../../models');
const c = require('../../controllers');
const h = require('../../helpers');
const config = require('../../configs/config')(process.env.NODE_ENV);
const agencyUserController =
  require('../../controllers/agencyUser').makeAgencyUserController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/agency-user/:agency_user_id/is_whatsapp_number
   * @apiName AgencyUserValidateWhatsAppNumber
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency User
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} agency_user_id Agency User ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {boolean} is_agent_whatsapp_mobile Is WhatsApp Mobile Number.
   * @apiSuccess {boolean} waba Is agent WABA and credentials available.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "is_agent_whatsapp_mobile": false,
   *       "waba": true,
   *       "status": "ok",
   *       "message": "Retrieved agency user whatsapp mobile status successfully.",
   *       "message_code": "1-agency-user-whatsapp-mobile-1622184418"
   *  }
   */
  fastify.route({
    method: 'GET',
    url: '/agency-user/:agency_user_id/is_whatsapp_number',
    schema: {
      params: {
        agency_user_id: { type: 'string' },
      },
    },
    handler: async (req, res) => {
      try {
        const { agency_user_id } = req.params;
        const agencyUser = await c.agencyUser.findOne({ agency_user_id });
        const agency = await c.agency.findOne({
          agency_id: agencyUser.agency_fk,
        });
        const user = await c.user.findOne({ user_id: agencyUser.user_fk });

        let agent_whatsapp_status = {};
        if (h.cmpBool(user.is_whatsapp, true))
          agent_whatsapp_status = {
            is_agent_whatsapp_mobile: true,
            waba: true,
          };
        else {
          if (!h.isEmpty(agency.agency_whatsapp_api_token)) {
            const agencyWhatsAppCredentials =
              agency.agency_whatsapp_api_token +
              ':' +
              agency.agency_whatsapp_api_secret;
            const agencyBufferedCredentials = Buffer.from(
              agencyWhatsAppCredentials,
              'utf8',
            ).toString('base64');
            agent_whatsapp_status = await c.user.validateIfWhatsAppMobile({
              user_id: agencyUser.user_fk,
              api_credentials: agencyBufferedCredentials,
            });
          } else {
            agent_whatsapp_status = {
              is_agent_whatsapp_mobile: false,
              waba: false,
            };
          }
        }

        await h.database.transaction(async (transaction) => {
          await c.user.update(
            agencyUser.user_fk,
            {
              is_whatsapp: h.cmpBool(
                agent_whatsapp_status.is_agent_whatsapp_mobile,
                true,
              ),
            },
            { transaction },
          );
        });

        h.api.createResponse(
          req,
          res,
          200,
          agent_whatsapp_status,
          '1-agency-user-whatsapp-mobile-1622184418',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-user-whatsapp-mobile-1622184497',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/agency/user/email-reinvite/:email_address',
    schema: {
      params: {
        email_address: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        const { email_address } = request.params;

        const user = await models.user.findOne({
          where: {
            email: email_address,
          },
        });

        const user_id = user?.dataValues.user_id;

        const agency_user = await models.agency_user.findOne({
          where: {
            user_fk: user_id,
          },
          include: [
            {
              model: models.agency,
              required: true,
            },
          ],
        });

        // agency name
        const agency_name = agency_user?.dataValues?.agency?.agency_name;

        const agent_first_name = user?.dataValues?.first_name;
        const agent_last_name = user?.dataValues?.last_name;

        console.log(
          'Activation Reinvitation',
          email_address,
          agent_first_name,
          agent_last_name,
        );

        await h.email.sendEmail(
          `Chaaat Team <registrations@chaaat.io>`,
          email_address,
          null,
          h.getMessageByCode(
            'template-resend-invite-user-subject-1632282919050',
            {
              AGENCY_NAME: agency_name,
            },
          ),
          h.getMessageByCode('template-resend-invite-user-body-1632283174576', {
            INVITED_USER_NAME: agent_first_name,
            AGENCY_NAME: agency_name,
            SIGNUP_URL: `https://app.chaaat.io/signup?invitee=${encodeURIComponent(
              user_id,
            )}&first_name=${encodeURIComponent(
              agent_first_name,
            )}&last_name=${encodeURIComponent(
              agent_last_name,
            )}&invited_email=${encodeURIComponent(email_address)}`,
          }),
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-resend-invite-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to resend account activation email`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-resend-invite-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/agency/user/resend-verification/:email_address',
    schema: {
      params: {
        email_address: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        const { email_address } = request.params;

        const user = await models.user.findOne({
          where: {
            email: email_address,
          },
        });

        const user_id = user?.dataValues.user_id;
        const userEmailVerification =
          await models.user_email_verification.findOne({
            where: {
              user_fk: user_id,
            },
          });

        const emailVerificationUrl = `${
          config.webUrl
        }/auth/verify-email?email=${encodeURIComponent(email_address)}&token=${
          userEmailVerification?.dataValues?.token
        }`;

        const agent_first_name = user?.dataValues?.first_name;

        await h.email.sendEmail(
          `Chaaat Team <registrations@${config?.email?.domain || 'chaaat.io'}>`,
          user.email,
          null,
          h.getMessageByCode(
            'template-emailVerification-subject-1601338955192',
          ),
          h.getMessageByCode('template-emailVerification-body-1601338955192', {
            FIRST_NAME: agent_first_name,
            EMAIL_VERIFICATION_URL: emailVerificationUrl,
          }),
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-resend-verification-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to resend verification email`, {
          err,
        });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-resend-verification-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
