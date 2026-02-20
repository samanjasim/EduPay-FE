export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Dashboard
  DASHBOARD: '/',

  // Users
  USERS: {
    LIST: '/users',
    DETAIL: '/users/:id',
    getDetail: (id: string) => `/users/${id}`,
  },

  // Roles
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles/new',
    DETAIL: '/roles/:id',
    getDetail: (id: string) => `/roles/${id}`,
  },

  // Schools
  SCHOOLS: {
    LIST: '/schools',
    CREATE: '/schools/new',
    DETAIL: '/schools/:id',
    getDetail: (id: string) => `/schools/${id}`,
  },

  // Placeholder pages
  PAYMENTS: '/payments',
} as const;
