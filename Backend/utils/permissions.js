// Backend/utils/permissions.js

const PERMISSIONS = {
  // Analysis permissions
  CREATE_ANALYSIS: 'create_analysis',
  VIEW_ANALYSIS: 'view_analysis',
  EDIT_ANALYSIS: 'edit_analysis',
  DELETE_ANALYSIS: 'delete_analysis',
  EXPORT_ANALYSIS: 'export_analysis',

  // User management permissions
  VIEW_USERS: 'view_users',
  INVITE_USERS: 'invite_users',
  MANAGE_USERS: 'manage_users',
  REMOVE_USERS: 'remove_users',

  // Organization permissions
  VIEW_ORGANIZATION: 'view_organization',
  EDIT_ORGANIZATION: 'edit_organization',
  VIEW_BILLING: 'view_billing',
  MANAGE_BILLING: 'manage_billing',

  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_ADVANCED_ANALYTICS: 'view_advanced_analytics',

  // Audit permissions
  VIEW_AUDIT_LOGS: 'view_audit_logs',
};

const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.CREATE_ANALYSIS,
    PERMISSIONS.VIEW_ANALYSIS,
    PERMISSIONS.EDIT_ANALYSIS,
    PERMISSIONS.DELETE_ANALYSIS,
    PERMISSIONS.EXPORT_ANALYSIS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.REMOVE_USERS,
    PERMISSIONS.VIEW_ORGANIZATION,
    PERMISSIONS.EDIT_ORGANIZATION,
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ADVANCED_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  manager: [
    PERMISSIONS.CREATE_ANALYSIS,
    PERMISSIONS.VIEW_ANALYSIS,
    PERMISSIONS.EDIT_ANALYSIS,
    PERMISSIONS.DELETE_ANALYSIS,
    PERMISSIONS.EXPORT_ANALYSIS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ORGANIZATION,
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ADVANCED_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  analyst: [
    PERMISSIONS.CREATE_ANALYSIS,
    PERMISSIONS.VIEW_ANALYSIS,
    PERMISSIONS.EDIT_ANALYSIS,
    PERMISSIONS.EXPORT_ANALYSIS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ORGANIZATION,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  viewer: [
    PERMISSIONS.VIEW_ANALYSIS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ORGANIZATION,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
};

const hasPermission = (userRole, permission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

const hasAnyPermission = (userRole, permissions) => permissions.some((permission) => hasPermission(userRole, permission));

const hasAllPermissions = (userRole, permissions) => permissions.every((permission) => hasPermission(userRole, permission));

const getUserPermissions = (userRole) => ROLE_PERMISSIONS[userRole] || [];

const canManageUser = (currentUserRole, targetUserRole) => {
  const roleHierarchy = ['viewer', 'analyst', 'manager', 'admin'];
  const currentLevel = roleHierarchy.indexOf(currentUserRole);
  const targetLevel = roleHierarchy.indexOf(targetUserRole);

  // Users can only manage users at or below their level
  // Admins can manage everyone, managers can manage analysts and viewers, etc.
  return currentLevel >= targetLevel && hasPermission(currentUserRole, PERMISSIONS.MANAGE_USERS);
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  canManageUser,
};
