/**
 * Frontend mirror of EduPay.Shared.Constants.Permissions.
 *
 * Pattern: {Module}.{Action}
 *
 * Standard CRUD actions:
 *   View   → list / read-many & read single / detail
 *   Create → create resource
 *   Update → update resource
 *   Delete → delete resource
 *
 * Keep this file in sync with the backend Permissions.cs.
 */
export const PERMISSIONS = {
  Users: {
    View: 'Users.View',
    Create: 'Users.Create',
    Update: 'Users.Update',
    Delete: 'Users.Delete',
    ManageRoles: 'Users.ManageRoles',
  },
  Roles: {
    View: 'Roles.View',
    Create: 'Roles.Create',
    Update: 'Roles.Update',
    Delete: 'Roles.Delete',
    ManagePermissions: 'Roles.ManagePermissions',
  },
  Schools: {
    View: 'Schools.View',
    Create: 'Schools.Create',
    Update: 'Schools.Update',
    Delete: 'Schools.Delete',
    ManageSettings: 'Schools.ManageSettings',
    ManageAdmins: 'Schools.ManageAdmins',
  },
  Students: {
    View: 'Students.View',
    Create: 'Students.Create',
    Update: 'Students.Update',
    Delete: 'Students.Delete',
  },
  Fees: {
    View: 'Fees.View',
    Create: 'Fees.Create',
    Update: 'Fees.Update',
    Delete: 'Fees.Delete',
  },
  Payments: {
    View: 'Payments.View',
    Create: 'Payments.Create',
    Refund: 'Payments.Refund',
  },
  Wallets: {
    View: 'Wallets.View',
    TopUp: 'Wallets.TopUp',
    Manage: 'Wallets.Manage',
  },
  Products: {
    View: 'Products.View',
    Create: 'Products.Create',
    Update: 'Products.Update',
    Delete: 'Products.Delete',
  },
  Orders: {
    View: 'Orders.View',
    Create: 'Orders.Create',
    Cancel: 'Orders.Cancel',
  },
  FeeTypes: {
    View: 'FeeTypes.View',
    Create: 'FeeTypes.Create',
    Update: 'FeeTypes.Update',
    Delete: 'FeeTypes.Delete',
  },
  Notifications: {
    View: 'Notifications.View',
    Send: 'Notifications.Send',
    ManageTemplates: 'Notifications.ManageTemplates',
  },
  Files: {
    View: 'Files.View',
    Upload: 'Files.Upload',
    Download: 'Files.Download',
    Delete: 'Files.Delete',
  },
  System: {
    ViewAuditLogs: 'System.ViewAuditLogs',
    ManageSettings: 'System.ManageSettings',
    ViewDashboard: 'System.ViewDashboard',
  },
} as const;

type PermissionMap = typeof PERMISSIONS;
export type Permission = {
  [M in keyof PermissionMap]: PermissionMap[M][keyof PermissionMap[M]];
}[keyof PermissionMap];
