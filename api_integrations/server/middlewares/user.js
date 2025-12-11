const jwt = require('jsonwebtoken');
const constant = require('../constants/constant.json');
const models = require('../models');
const h = require('../helpers');
const authController = require('../controllers/auth').makeAuthController(
  models,
);
const userController = require('../controllers/user').makeUserController(
  models,
);
const userRoleController =
  require('../controllers/userRole').makeUserRoleController(models);
const userAccessTokenController =
  require('../controllers/userAccessToken').makeUserAccessTokenController(
    models,
  );
const contactController =
  require('../controllers/contact').makeContactController(models);
const taskPermissionController =
  require('../controllers/taskPermission').makeTaskPermissionController(models);
const userMiddleware = module.exports;

/**
 * Check whether user's access token is valid
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
userMiddleware.isLoggedIn = async (request, reply) => {
  const funcName = 'userMiddleware.isLoggedIn';
  const accessToken = h.general.getAccessToken(request);

  if (h.isEmpty(accessToken)) {
    console.log(`${funcName}: missing access token in request header`);
    return handleAccessDenied(reply);
  }

  /**
   * Verify that jsonwebtoken has not been tampered with
   */
  let decodedJWT = null;
  try {
    decodedJWT = await new Promise((resolve, reject) => {
      jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });
  } catch (err) {
    console.log(`${funcName}: failed to verify JWT`, { err });
    return handleAccessDenied(reply);
  }
  if (h.isEmpty(decodedJWT)) {
    console.log(`${funcName}: JWT failed verification`);
    return handleAccessDenied(reply);
  }

  /**
   * Check that access token is still active
   */
  const userAccessToken = await userAccessTokenController.findOne({
    access_token: accessToken,
    type: constant.USER.ACCESS_TOKEN.TYPE.SESSION,
    status: constant.USER.ACCESS_TOKEN.STATUS.ACTIVE,
  });
  if (h.isEmpty(userAccessToken)) {
    console.log(
      `${funcName}: access token not found in user_access_token table`,
    );
    return handleAccessDenied(reply);
  }

  /**
   * Check that user is still active in database
   */
  const currentUser = h.user.getCurrentUser(request);
  if (!(await userController.isUserActive(currentUser.user_id))) {
    console.log(
      `${funcName}: user '${currentUser.user_id}' either does not exist or is not active.`,
    );
    return handleAccessDenied(reply);
  }
};

/**
 * Check if current user has staff_admin user role access
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */
userMiddleware.hasSuperAdminPermission = async (request, reply) => {
  await (
    await hasUserRolePermission(constant.USER.ROLE.STAFF_ADMIN)
  )(request, reply);
};

/**
 * Generic function to handle user permission check
 * @param {string} user_role
 * @returns {Promise<function(*=, *): boolean>}
 */
async function hasUserRolePermission(user_role) {
  const funcName = 'userMiddleware.hasPermission';
  h.validation.requiredParams(funcName, { user_role });
  h.validation.validateConstantValue(
    funcName,
    { user_role: constant.USER.ROLE },
    { user_role },
  );
  return async function (request, reply) {
    const { user_id: current_user_id } = h.user.getCurrentUser(request);
    const userRoleRecord = await userRoleController.findOne({
      user_fk: current_user_id,
      user_role,
    });
    return h.notEmpty(userRoleRecord);
  };
}

/**
 * Check whether user has access to task
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
userMiddleware.hasAccessToTask = async (request, reply) => {
  const funcName = 'userMiddleware.hasAccessToTask';
  const { user_id } = h.user.getCurrentUser(request);
  const { params, query, body } = request;
  const task_id = params.task_id || query.task_id || body.task_id;
  const hasPermission = await taskPermissionController.canUserAccessTask(
    constant.OWNER.TYPE.CLIENT,
    user_id,
    task_id,
  );
  if (!hasPermission) {
    console.log(`${funcName}: user does not have permission to access task`, {
      route: request.url,
      user_id,
      task_id,
    });
    return handleAccessDenied(reply);
  }
};

/**
 * Check whether user has access to Staff Portal
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
userMiddleware.hasAccessToStaffPortal = async (request, reply) => {
  const funcName = 'userMiddleware.hasAccessToStaffPortal';
  const { user_id } = h.user.getCurrentUser(request);
  const hasPermission = await authController.hasAccessToStaffPortal(user_id);
  if (!hasPermission) {
    console.log(`${funcName}: user does not have permission to access task`, {
      route: request.url,
      user_id,
    });
    return handleAccessDenied(reply);
  }
};

/**
 * Check whether contact_id is a valid contact_id
 * @param {string} contact_id
 * @returns {Promise<(function(*, *=): Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>|undefined>)|*>}
 */
userMiddleware.isValidContact = async (contact_id) => {
  const funcName = 'userMiddleware.isValidContact';
  h.validation.requiredParams(funcName, { contact_id });
  return async function (request, reply) {
    const contactRecord = await contactController.findOne({ contact_id });
    if (h.isEmpty(contactRecord)) {
      console.log(`${funcName}: no contact found by contact ID provided`);
      return handleAccessDenied(reply);
    }
  };
};

/**
 * Check whether contact permalink is belongs to a valid contact
 * @param permalink
 * @returns {Promise<(function(*, *=): Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>|undefined>)|*>}
 */
userMiddleware.isValidContactPermalink = async (permalink) => {
  const funcName = 'userMiddleware.isValidContactPermalink';
  h.validation.requiredParams(funcName, { permalink });
  return async function (request, reply) {
    const contactRecord = await contactController.findOne({ permalink });
    if (h.isEmpty(contactRecord)) {
      console.log(`${funcName}: no contact found by permalink provided`);
      return handleAccessDenied(reply);
    }
  };
};

/**
 * Generic handle access denied reply
 * @param {FastifyReply} reply
 * @returns {FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>}
 */
function handleAccessDenied(reply) {
  return h.api.createResponse(reply, 403, {}, '2-generic-002');
}
