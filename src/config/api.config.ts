export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/login',
    REGISTER: '/Auth/register',
    REFRESH_TOKEN: '/Auth/refresh-token',
    ME: '/Auth/me',
    CHANGE_PASSWORD: '/Auth/change-password',
  },
  USERS: {
    LIST: '/Users',
    DETAIL: (id: string) => `/Users/${id}`,
  },
  ROLES: {
    LIST: '/Roles',
    DETAIL: (id: string) => `/Roles/${id}`,
    PERMISSIONS: (id: string) => `/Roles/${id}/permissions`,
    ASSIGN_USER: (roleId: string, userId: string) => `/Roles/${roleId}/users/${userId}`,
    REMOVE_USER: (roleId: string, userId: string) => `/Roles/${roleId}/users/${userId}`,
  },
  PERMISSIONS: {
    LIST: '/Permissions',
  },
  SCHOOLS: {
    LIST: '/Schools',
    DETAIL: (id: string) => `/Schools/${id}`,
    MY_SCHOOL: '/Schools/my-school',
    STATUS: (id: string) => `/Schools/${id}/status`,
    SETTINGS: (id: string) => `/Schools/${id}/settings`,
    ADMINS: (id: string) => `/Schools/${id}/admins`,
    REMOVE_ADMIN: (id: string, userId: string) => `/Schools/${id}/admins/${userId}`,
    SETUP_STATUS: (id: string) => `/Schools/${id}/setup-status`,
    DASHBOARD: (id: string) => `/Schools/${id}/dashboard`,
  },
  ACADEMIC_YEARS: {
    LIST: '/AcademicYears',
    DETAIL: (id: string) => `/AcademicYears/${id}`,
    ACTIVATE: (id: string) => `/AcademicYears/${id}/activate`,
    COMPLETE: (id: string) => `/AcademicYears/${id}/complete`,
    SET_CURRENT: (id: string) => `/AcademicYears/${id}/set-current`,
    LINK_SCHOOL: (id: string) => `/AcademicYears/${id}/link-school`,
  },
  GRADES: {
    LIST: '/Grades',
    DETAIL: (id: string) => `/Grades/${id}`,
    STATUS: (id: string) => `/Grades/${id}/status`,
    SECTIONS: (gradeId: string) => `/Grades/${gradeId}/sections`,
    SECTION: (gradeId: string, sectionId: string) => `/Grades/${gradeId}/sections/${sectionId}`,
    SECTION_STATUS: (gradeId: string, sectionId: string) => `/Grades/${gradeId}/sections/${sectionId}/status`,
  },
  STUDENTS: {
    LIST: '/Students',
    DETAIL: (id: string) => `/Students/${id}`,
    STATUS: (id: string) => `/Students/${id}/status`,
    ENROLL_PARENT: (studentId: string) => `/Students/${studentId}/parents/enroll`,
    PARENTS: (studentId: string) => `/Students/${studentId}/parents`,
    PARENT: (studentId: string, parentUserId: string) => `/Students/${studentId}/parents/${parentUserId}`,
  },
  PARENTS: {
    LIST: '/Parents',
    UPDATE: (parentUserId: string) => `/Parents/${parentUserId}`,
    MY_FEES: '/Parents/my-fees',
  },
  FEE_TYPES: {
    LIST: '/FeeTypes',
    DETAIL: (id: string) => `/FeeTypes/${id}`,
    STATUS: (id: string) => `/FeeTypes/${id}/status`,
  },
  FEE_STRUCTURES: {
    LIST: '/FeeStructures',
    DETAIL: (id: string) => `/FeeStructures/${id}`,
    STATUS: (id: string) => `/FeeStructures/${id}/status`,
  },
  FEE_INSTANCES: {
    LIST: '/FeeInstances',
    DETAIL: (id: string) => `/FeeInstances/${id}`,
    DISCOUNT: (id: string) => `/FeeInstances/${id}/discount`,
    WAIVE: (id: string) => `/FeeInstances/${id}/waive`,
    CANCEL: (id: string) => `/FeeInstances/${id}/cancel`,
    DETECT_OVERDUE: '/FeeInstances/detect-overdue',
  },
} as const;
