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
  parents: {
    all: ['parents'] as const,
    dashboard: () => [...queryKeys.parents.all, 'dashboard'] as const,
    children: () => [...queryKeys.parents.all, 'children'] as const,
    fees: <T extends object>(filters?: T) => [...queryKeys.parents.all, 'fees', filters] as const,
    orders: <T extends object>(filters?: T) => [...queryKeys.parents.all, 'orders', filters] as const,
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
  },
} as const;
