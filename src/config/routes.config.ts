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
    EDIT: '/roles/:id/edit',
    getDetail: (id: string) => `/roles/${id}`,
    getEdit: (id: string) => `/roles/${id}/edit`,
  },

  // Schools
  SCHOOLS: {
    LIST: '/schools',
    CREATE: '/schools/new',
    DETAIL: '/schools/:id',
    getDetail: (id: string) => `/schools/${id}`,
  },

  // Academic Years
  ACADEMIC_YEARS: {
    LIST: '/academic-years',
    DETAIL: '/academic-years/:id',
    getDetail: (id: string) => `/academic-years/${id}`,
  },

  // Grades
  GRADES: {
    LIST: '/grades',
    DETAIL: '/grades/:id',
    getDetail: (id: string) => `/grades/${id}`,
  },

  // Students
  STUDENTS: {
    LIST: '/students',
    DETAIL: '/students/:id',
    getDetail: (id: string) => `/students/${id}`,
  },

  // Parents
  PARENTS: {
    LIST: '/parents',
  },

  // Parent Fees (self-service)
  PARENT_FEES: '/parent/fees',

  // Fee Types
  FEE_TYPES: {
    LIST: '/fee-types',
  },

  // Fee Structures
  FEE_STRUCTURES: {
    LIST: '/fee-structures',
    DETAIL: '/fee-structures/:id',
    getDetail: (id: string) => `/fee-structures/${id}`,
  },

  // Fee Instances
  FEE_INSTANCES: {
    LIST: '/fee-instances',
    DETAIL: '/fee-instances/:id',
    getDetail: (id: string) => `/fee-instances/${id}`,
  },

  // Placeholder pages
  PAYMENTS: '/payments',
} as const;
