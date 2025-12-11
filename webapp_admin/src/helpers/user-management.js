import { h } from './index';
import { api } from '../api';
import constant from '../constants/constant.json';
import { routes } from '../configs/routes';

/**
 * Redirects if a user doesn't have admin access
 * @returns {Promise<void>}
 */
export async function hasAdminAccessElseRedirect() {
  const checkAdminAccess = await hasAdminAccess();
  const error_message = 'You do not have access to this page';
  const redirectURL = `${h.getRoute(
    routes.dashboard.leads.all_leads,
  )}/?error_message=${encodeURIComponent(error_message)}`;
  if (!checkAdminAccess) {
    window.location.href = redirectURL;
  }
}

/**
 * Checks if a user has Admin level of access.
 * @returns {Promise<{type: boolean}>}
 */
export async function hasAdminAccess() {
  const result = await api.userManagement.hasAccess(
    {
      allowed_user_role: [
        constant.USER.ROLE.AGENCY_ADMIN,
        constant.USER.ROLE.STAFF_ADMIN,
        constant.USER.ROLE.AGENCY_MARKETING,
        constant.USER.ROLE.SUPER_ADMIN,
      ],
    },
    false,
  );
  return result.data.access_allowed;
}

/**
 * Checks if a user is Super level of access.
 * @returns {Promise<{type: boolean}>}
 */
export async function isSuperAdmin() {
  const result = await api.userManagement.hasAccess(
    {
      allowed_user_role: [constant.USER.ROLE.SUPER_ADMIN],
    },
    false,
  );
  return result.data.access_allowed;
}

/**
 * Redirects if a user doesn't have Marketing access
 * @returns {Promise<void>}
 */
export async function hasMarketingAccessElseRedirect() {
  const checkAdminAccess = await hasMarketingAccess();
  const error_message = 'You do not have access to this page';
  const redirectURL = `${h.getRoute(
    routes.dashboard.leads.all_leads,
  )}/?error_message=${encodeURIComponent(error_message)}`;
  if (!checkAdminAccess) {
    window.location.href = redirectURL;
  }
}

/**
 * Checks if a user has marketing level of access(includes admin access)
 * @returns {Promise<{boolean}>}
 */
export async function hasMarketingAccess() {
  const result = await api.userManagement.hasAccess(
    {
      allowed_user_role: [
        constant.USER.ROLE.AGENCY_MARKETING,
        constant.USER.ROLE.AGENCY_ADMIN,
        constant.USER.ROLE.STAFF_ADMIN,
        constant.USER.ROLE.SUPER_ADMIN,
      ],
    },
    false,
  );
  return result.data.access_allowed;
}
