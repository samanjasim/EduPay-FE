export const ROUTES = {
  // Public marketing
  LANDING: '/',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Parent self-service
  PARENT: {
    ONBOARDING: '/parent/onboarding',
    DASHBOARD: '/parent',
    CHILD_DETAIL: '/parent/children/:id',
    PROFILE: '/parent/profile',
    getChildDetail: (id: string) => `/parent/children/${id}`,
  },

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
    DETAIL: '/parents/:parentUserId',
    getDetail: (id: string) => `/parents/${id}`,
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

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: '/notifications/:id',
    SEND: '/notifications/send',
    getDetail: (id: string) => `/notifications/${id}`,
  },

  // Subscription Plans
  PLANS: {
    LIST: '/plans',
    CREATE: '/plans/new',
    DETAIL: '/plans/:id',
    EDIT: '/plans/:id/edit',
    getDetail: (id: string) => `/plans/${id}`,
    getEdit: (id: string) => `/plans/${id}/edit`,
  },

  // File Management
  FILES: '/files',
  FILE_CATEGORIES: '/files/categories',

  // Products
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products/new',
    DETAIL: '/products/:id',
    EDIT: '/products/:id/edit',
    getDetail: (id: string) => `/products/${id}`,
    getEdit: (id: string) => `/products/${id}/edit`,
  },

  // Wallets
  WALLETS: {
    LIST: '/wallets',
    DETAIL: '/wallets/:id',
    getDetail: (id: string) => `/wallets/${id}`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    DETAIL: '/orders/:id',
    getDetail: (id: string) => `/orders/${id}`,
  },

  // Placeholder pages
  PAYMENTS: '/payments',

  // School Admin Portal
  SCHOOL: {
    DASHBOARD: '/school',
    SETUP: '/school/setup',
    STUDENTS: {
      LIST: '/school/students',
      DETAIL: '/school/students/:id',
      getDetail: (id: string) => `/school/students/${id}`,
    },
    GRADES: {
      LIST: '/school/grades',
      DETAIL: '/school/grades/:id',
      getDetail: (id: string) => `/school/grades/${id}`,
    },
    FEES: '/school/fees',
    CASH_COLLECTION: '/school/cash-collection',
    FEE_STRUCTURES: {
      DETAIL: '/school/fees/structures/:id',
      getDetail: (id: string) => `/school/fees/structures/${id}`,
    },
    FEE_INSTANCES: {
      DETAIL: '/school/fees/instances/:id',
      getDetail: (id: string) => `/school/fees/instances/${id}`,
    },
    PAYMENTS: '/school/payments',
    REPORTS: '/school/reports',
    STAFF: '/school/staff',
    SETTINGS: '/school/settings',
  },
} as const;
