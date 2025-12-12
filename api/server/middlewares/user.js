const Sentry = require('@sentry/node');
const jwt = require('jsonwebtoken');
const environment = process.env.NODE_ENV || 'development';
const constant = require('../constants/constant.json');
const config = require('../configs/config')(environment);
const models = require('../models');
const h = require('../helpers');
const c = require('../controllers');

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
const agencyUserController =
  require('../controllers/agencyUser').makeAgencyUserController(models);

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
    return handleAccessDenied(request, reply);
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
    Sentry.captureException(err);
    console.log(`${funcName}: failed to verify JWT`, { err });
    return handleAccessDenied(request, reply);
  }
  if (h.isEmpty(decodedJWT)) {
    console.log(`${funcName}: JWT failed verification`);
    return handleAccessDenied(request, reply);
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
    return handleAccessDenied(request, reply);
  }

  /**
   * Check that user is still active in database
   */
  const currentUser = h.user.getCurrentUser(request);
  if (!(await userController.isUserActive(currentUser.user_id))) {
    console.log(
      `${funcName}: user '${currentUser.user_id}' either does not exist or is not active.`,
    );
    return handleAccessDenied(request, reply);
  }
};

/**
 * Check if current user has staff_admin user role access
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */
userMiddleware.hasStaffAdminPermission = async (request, reply) => {
  const isSuperAdmin = await (
    await hasUserRolePermission(constant.USER.ROLE.SUPER_ADMIN)
  )(request, reply);
  const isStaffAdmin = await (
    await hasUserRolePermission(constant.USER.ROLE.STAFF_ADMIN)
  )(request, reply);
  console.log(isSuperAdmin, isStaffAdmin);
  if (isSuperAdmin || isStaffAdmin) {
    return true;
  }
  return false;
};

/**
 * Check if current user has agency_admin user role access
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */
userMiddleware.hasAgencyAdminPermission = async (request, reply) => {
  const isSuperAdmin = await (
    await hasUserRolePermission(constant.USER.ROLE.SUPER_ADMIN)
  )(request, reply);
  const isStaffAdmin = await (
    await hasUserRolePermission(constant.USER.ROLE.STAFF_ADMIN)
  )(request, reply);
  const isAgencyAdmin = await (
    await hasUserRolePermission(constant.USER.ROLE.AGENCY_ADMIN)
  )(request, reply);
  console.log(isSuperAdmin, isStaffAdmin);
  if (isSuperAdmin || isStaffAdmin || isAgencyAdmin) {
    return true;
  }
  return false;
};

/**
 * Check if current user has super_admin user role access
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */
userMiddleware.hasSuperAdminPermission = async (request, reply) => {
  await (
    await hasUserRolePermission(constant.USER.ROLE.SUPER_ADMIN)
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
    console.log('RECORD', user_role, userRoleRecord);
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
    return handleAccessDenied(request, reply);
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
    return handleAccessDenied(request, reply);
  }
  await userController.update(user_id, {
    last_seen: h.date.getSqlCurrentDate(),
  });
};

/**
 * Check whether user has access to Super Admin Portal
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
userMiddleware.hasAccessToSuperAdminPortal = async (request, reply) => {
  const funcName = 'userMiddleware.hasAccessToSuperAdminPortal';
  const { user_id } = h.user.getCurrentUser(request);
  const hasPermission = await authController.hasAccessToSuperAdminPortal(
    user_id,
  );
  if (!hasPermission) {
    console.log(`${funcName}: user does not have permission to access task`, {
      route: request.url,
      user_id,
    });
    return handleAccessDenied(request, reply, 401);
  }
  await userController.update(user_id, {
    last_seen: h.date.getSqlCurrentDate(),
  });
};

/**
 * Check whether user has admin access to Staff Portal
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
userMiddleware.hasAdminAccessToStaffPortal = async (request, reply) => {
  const funcName = 'userMiddleware.hasAdminAccessToStaffPortal';
  const { user_id } = h.user.getCurrentUser(request);
  const hasPermission = await authController.hasAdminAccessToStaffPortal(
    user_id,
  );
  if (!hasPermission) {
    console.log(`${funcName}: user does not have permission to access task`, {
      route: request.url,
      user_id,
    });
    return handleAccessDenied(request, reply);
  }
};

/**
 * Check whether user has admin access to Staff Portal
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {string[]} permissions list of permissions
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
userMiddleware.hasPermissionLevel = async (
  request,
  reply,
  permissions = [],
) => {
  const funcName = 'userMiddleware.hasAdminAccessToStaffPortal';
  const { user_id } = h.user.getCurrentUser(request);
  const hasPermission = await authController.hasPermissionLevel(
    user_id,
    permissions,
  );
  if (!hasPermission) {
    console.log(`${funcName}: user does not have permission to access task`, {
      route: request.url,
      user_id,
    });
    return handleAccessDenied(request, reply);
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
      return handleAccessDenied(request, reply);
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
      return handleAccessDenied(request, reply);
    }
  };
};

/**
 * Verifies if the agency of the agency_user has access to the shortlisted_property they are trying to access.
 * @param req
 * @param reply
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
userMiddleware.verifyAgencyMakingRequestHasAccessToProperty = async (
  req,
  reply,
) => {
  const { shortlisted_property_comment_id } = req.params;
  const { user_id } = h.user.getCurrentUser(req);

  // finding agency_fk from user
  const { agency_fk } = await agencyUserController.findOne({
    user_fk: user_id,
  });

  const shortlisted_property_details =
    await c.shortListedPropertyComment.findOne(
      { shortlisted_property_comment_id },
      {
        include: [
          {
            model: models.shortlisted_property,
            required: true,
            include: [
              {
                model: models.project_property,
                required: true,
                include: [
                  {
                    model: models.project,
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    );

  if (
    !h.cmpStr(
      agency_fk,
      shortlisted_property_details.shortlisted_property.project_property.project
        .agency_fk,
    )
  )
    return handleAccessDenied(req, reply);
};

/**
 * Check if the request came from authorized component
 * @param {*} request.headers['x-component-secret']
 * @returns {boolean}
 */
userMiddleware.isAuthorizedComponent = (request, reply, next) => {
  const funcName = 'userMiddleware.isAuthorizedComponent';
  const lineComponentSignature = request.headers['x-line-signature'];
  console.log(request.query);
  const messengerVerifyToken = request.query['hub.verify_token'];
  const metaSignature = request.headers['x-hub-signature-256'];
  console.log(metaSignature);
  if (!h.isEmpty(lineComponentSignature)) {
    next();
  } else if (!h.isEmpty(messengerVerifyToken)) {
    next();
  } else if (!h.isEmpty(metaSignature)) {
    next();
  } else {
    const componentSecret = request.headers['x-component-secret'];
    if (componentSecret !== config.component.secret) {
      request.log.warn({
        funcName,
        message: 'Unauthorized: Invalid Component Secret',
      });
      reply
        .status(403)
        .send({ message: h.general.getMessageByCode('2-generic-002') });
    } else {
      next();
    }
  }
};

/**
 * Generic handle access denied reply
 * @param {FastifyReply} reply
 * @returns {FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>}
 */
function handleAccessDenied(request, reply, errCode = 403) {
  return h.api.createResponse(request, reply, errCode, {}, '2-generic-002');
}
