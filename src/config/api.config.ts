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
} as const;
