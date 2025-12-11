const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const c = require('../../../../controllers');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/integrations/tray/initiate-integration-request Initiate Tray Integration Request
   * @apiName StaffIntegrationsTrayInitiateTrayIntegrationRequest
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsTray
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/tray/initiate-integration-request',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { agency_user, integration } = req.body;
        const trayIntegrationURL = await c.tray.connectUserToTray(
          agency_user.agencyUser,
          integration,
        );
        h.api.createResponse(
          res,
          200,
          { url: trayIntegrationURL },
          '1-tray-integration-1636268343136',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-tray-integration-1636268343136',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/tray/tie-auth-to-tray-user-solution Tie HubSpot Authentication To Tray User Solution
   * @apiName StaffIntegrationsTrayTieAuthenticationToTrayUserSolution
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsTray
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/tray/tie-auth-to-tray-user-solution',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { agency_user, auth, integration } = req.body;

        // Step 1: Update tray solution with authValues
        await c.tray.tieAuthToTrayUser(agency_user, auth, integration);

        // Step 2: If Above success then update entries of solution to pave database
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-hubspot-contact-1634465128538',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-hubspot-contact-1634465128538',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/tray/delete-agency-user-from-tray-pave Delete Agency User From Tray and Pave Database
   * @apiName StaffIntegrationsTrayDeleteAgencyUserFromTrayPave
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsTray
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/integrations/tray/delete-agency-user-solution-from-tray-pave',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { agencyUser, tray_user_solution_source_type } = request.body;
        const { agency_user_id } = agencyUser;
        const is_deleted = await c.tray.deleteAgencyUserTraySolution(
          agency_user_id,
          tray_user_solution_source_type,
        );
        h.api.createResponse(
          response,
          200,
          { deleted: is_deleted, agency_user_id },
          '1-tray-integration-1634530418052',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          response,
          500,
          {},
          '2-tray-integration-1634530418052',
          { portal },
        );
      }
    },
  });

  /**
   * @api {GET} /v1/staff/integrations/tray/get-agency-user-active-integrations Get All Active Integrations for Agency User
   * @apiName StaffIntegrationsTrayGetAllIntegrations
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsTray
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/integrations/tray/get-agency-user-active-integrations',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { agency_user_id, agency_fk } = request.query;
        const active_integrations =
          await c.tray.getActiveAgencyUserIntegrations(
            agency_user_id,
            agency_fk,
          );
        h.api.createResponse(
          response,
          200,
          { active_integrations },
          '1-tray-integration-1634528025482',
          { portal },
        );
      } catch (err) {
        console.log(
          `${request.url}: failed to get agency user integration statuses`,
          { err },
        );
        h.api.createResponse(
          response,
          500,
          {},
          '2-tray-integration-1634528025482',
          { portal },
        );
      }
    },
  });

  next();
};
