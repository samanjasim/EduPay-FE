export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.roles.lists(), filters] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },

  permissions: {
    all: ['permissions'] as const,
    list: () => [...queryKeys.permissions.all, 'list'] as const,
  },

  schools: {
    all: ['schools'] as const,
    lists: () => [...queryKeys.schools.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.schools.lists(), filters] as const,
    details: () => [...queryKeys.schools.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.schools.details(), id] as const,
    mySchool: () => [...queryKeys.schools.all, 'my-school'] as const,
  },

  academicYears: {
    all: ['academicYears'] as const,
    lists: () => [...queryKeys.academicYears.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.academicYears.lists(), filters] as const,
    details: () => [...queryKeys.academicYears.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.academicYears.details(), id] as const,
  },

  grades: {
    all: ['grades'] as const,
    lists: () => [...queryKeys.grades.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.grades.lists(), filters] as const,
    details: () => [...queryKeys.grades.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.grades.details(), id] as const,
  },

  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },

  parents: {
    all: ['parents'] as const,
    lists: () => [...queryKeys.parents.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.parents.lists(), filters] as const,
    fees: () => [...queryKeys.parents.all, 'fees'] as const,
    dashboard: () => [...queryKeys.parents.all, 'dashboard'] as const,
    children: () => [...queryKeys.parents.all, 'children'] as const,
    orders: <T extends object>(filters?: T) => [...queryKeys.parents.all, 'orders', filters] as const,
  },

  feeTypes: {
    all: ['feeTypes'] as const,
    lists: () => [...queryKeys.feeTypes.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.feeTypes.lists(), filters] as const,
    details: () => [...queryKeys.feeTypes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.feeTypes.details(), id] as const,
  },

  feeStructures: {
    all: ['feeStructures'] as const,
    lists: () => [...queryKeys.feeStructures.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.feeStructures.lists(), filters] as const,
    details: () => [...queryKeys.feeStructures.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.feeStructures.details(), id] as const,
  },

  feeInstances: {
    all: ['feeInstances'] as const,
    lists: () => [...queryKeys.feeInstances.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.feeInstances.lists(), filters] as const,
    details: () => [...queryKeys.feeInstances.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.feeInstances.details(), id] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.notifications.lists(), filters] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  plans: {
    all: ['plans'] as const,
    lists: () => [...queryKeys.plans.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.plans.lists(), filters] as const,
    details: () => [...queryKeys.plans.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.plans.details(), id] as const,
  },

  files: {
    all: ['files'] as const,
    lists: () => [...queryKeys.files.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.files.lists(), filters] as const,
    details: () => [...queryKeys.files.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
    accessLogs: (id: string) => [...queryKeys.files.all, 'access-logs', id] as const,
  },

  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    parentCatalog: <T extends object>(childId: string, filters?: T) =>
      [...queryKeys.products.all, 'parent', childId, filters] as const,
    parentDetail: (childId: string, productId: string) =>
      [...queryKeys.products.all, 'parent', childId, productId] as const,
    parentOrders: <T extends object>(filters?: T) =>
      [...queryKeys.products.all, 'parent-orders', filters] as const,
    stats: <T extends object>(filters?: T) =>
      [...queryKeys.products.all, 'stats', filters] as const,
  },

  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  wallets: {
    all: ['wallets'] as const,
    lists: () => [...queryKeys.wallets.all, 'list'] as const,
    list: <T extends object>(filters?: T) => [...queryKeys.wallets.lists(), filters] as const,
    details: () => [...queryKeys.wallets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.wallets.details(), id] as const,
    transactions: <T extends object>(id: string, filters?: T) =>
      [...queryKeys.wallets.all, 'transactions', id, filters] as const,
  },
} as const;
