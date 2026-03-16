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
  },
  PARENTS: {
    // Self (authenticated parent)
    MY_DASHBOARD: '/Parents/me/dashboard',
    MY_CHILDREN: '/Parents/me/children',
    MY_FEES: '/Parents/me/fees',
    MY_ORDERS: '/Parents/me/orders',
    // By ID (admin)
    DASHBOARD: (id: string) => `/Parents/${id}/dashboard`,
    CHILDREN: (id: string) => `/Parents/${id}/children`,
    FEES: (id: string) => `/Parents/${id}/fees`,
    ORDERS: (id: string) => `/Parents/${id}/orders`,
  },
  NOTIFICATIONS: {
    LIST: '/Notifications',
    UNREAD_COUNT: '/Notifications/unread-count',
    MARK_READ: (id: string) => `/Notifications/${id}/read`,
    MARK_ALL_READ: '/Notifications/read-all',
    SEND: '/Notifications/send',
    BULK_SEND: '/Notifications/bulk-send',
    DETAIL: (id: string) => `/Notifications/${id}`,
    RECIPIENTS: (id: string) => `/Notifications/${id}/recipients`,
    SENT: '/Notifications/sent',
  },
  PLANS: {
    LIST: '/Plans',
    DETAIL: (id: string) => `/Plans/${id}`,
    TOGGLE_STATUS: (id: string) => `/Plans/${id}/toggle-status`,
    ASSIGN_SCHOOL: (planId: string, schoolId: string) => `/Plans/${planId}/schools/${schoolId}`,
    CANCEL_SUBSCRIPTION: (schoolId: string) => `/Plans/schools/${schoolId}/subscription`,
  },
  FILES: {
    LIST: '/Files',
    DETAIL: (id: string) => `/Files/${id}`,
    UPLOAD: '/Files/upload',
    DOWNLOAD: (id: string) => `/Files/${id}/download`,
    ACCESS_LOGS: (id: string) => `/Files/${id}/access-logs`,
    CATEGORIES: '/Files/categories',
    CATEGORY_DETAIL: (id: string) => `/Files/categories/${id}`,
  },
  PRODUCTS: {
    LIST: '/Products',
    DETAIL: (id: string) => `/Products/${id}`,
    STATUS: (id: string) => `/Products/${id}/status`,
  },
} as const;
