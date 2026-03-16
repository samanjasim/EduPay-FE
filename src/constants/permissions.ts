/**
 * Frontend mirror of EduPay.Shared.Constants.Permissions.
 *
 * Pattern: {Module}.{Action}
 *
 * Standard CRUD actions:
 *   View   → list / read-many
 *   Show   → read single / detail
 *   Create → create resource
 *   Update → update resource
 *   Delete → delete resource
 *
 * Keep this file in sync with the backend Permissions.cs.
 */
export const PERMISSIONS = {
  Users: {
    View: 'Users.View',
    Show: 'Users.Show',
    Create: 'Users.Create',
    Update: 'Users.Update',
    Delete: 'Users.Delete',
    ManageRoles: 'Users.ManageRoles',
  },
  Roles: {
    View: 'Roles.View',
    Show: 'Roles.Show',
    Create: 'Roles.Create',
    Update: 'Roles.Update',
    Delete: 'Roles.Delete',
    ManagePermissions: 'Roles.ManagePermissions',
  },
  Schools: {
    View: 'Schools.View',
    Show: 'Schools.Show',
    Create: 'Schools.Create',
    Update: 'Schools.Update',
    Delete: 'Schools.Delete',
    ManageSettings: 'Schools.ManageSettings',
    ManageAdmins: 'Schools.ManageAdmins',
  },
  AcademicYears: {
    View: 'AcademicYears.View',
    Show: 'AcademicYears.Show',
    Create: 'AcademicYears.Create',
    Update: 'AcademicYears.Update',
    Delete: 'AcademicYears.Delete',
  },
  Grades: {
    View: 'Grades.View',
    Show: 'Grades.Show',
    Create: 'Grades.Create',
    Update: 'Grades.Update',
    Delete: 'Grades.Delete',
  },
  Sections: {
    View: 'Sections.View',
    Show: 'Sections.Show',
    Create: 'Sections.Create',
    Update: 'Sections.Update',
    Delete: 'Sections.Delete',
  },
  Students: {
    View: 'Students.View',
    Show: 'Students.Show',
    Create: 'Students.Create',
    Update: 'Students.Update',
    Delete: 'Students.Delete',
    ManageParents: 'Students.ManageParents',
  },
  Fees: {
    View: 'Fees.View',
    Show: 'Fees.Show',
    Create: 'Fees.Create',
    Update: 'Fees.Update',
    Delete: 'Fees.Delete',
  },
  Payments: {
    View: 'Payments.View',
    Show: 'Payments.Show',
    Create: 'Payments.Create',
    Refund: 'Payments.Refund',
  },
  Wallets: {
    View: 'Wallets.View',
    Show: 'Wallets.Show',
    TopUp: 'Wallets.TopUp',
    Manage: 'Wallets.Manage',
  },
  Events: {
    View: 'Events.View',
    Show: 'Events.Show',
    Create: 'Events.Create',
    Update: 'Events.Update',
    Delete: 'Events.Delete',
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
