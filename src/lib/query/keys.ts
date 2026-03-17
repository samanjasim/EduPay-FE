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
  },
} as const;
