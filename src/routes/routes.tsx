import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTES } from '@/config';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthGuard, GuestGuard, PermissionGuard } from '@/components/guards';
import { PERMISSIONS } from '@/constants';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const UsersListPage = lazy(() => import('@/features/users/pages/UsersListPage'));
const UserDetailPage = lazy(() => import('@/features/users/pages/UserDetailPage'));
const RolesListPage = lazy(() => import('@/features/roles/pages/RolesListPage'));
const RoleDetailPage = lazy(() => import('@/features/roles/pages/RoleDetailPage'));
const RoleCreatePage = lazy(() => import('@/features/roles/pages/RoleCreatePage'));
const RoleEditPage = lazy(() => import('@/features/roles/pages/RoleEditPage'));
const SchoolsListPage = lazy(() => import('@/features/schools/pages/SchoolsListPage'));
const SchoolDetailPage = lazy(() => import('@/features/schools/pages/SchoolDetailPage'));
const SchoolCreatePage = lazy(() => import('@/features/schools/pages/SchoolCreatePage'));
const PaymentsPage = lazy(() => import('@/features/payments/pages/PaymentsPage'));
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage'));

export const routes: RouteObject[] = [
  // Public routes (guest only)
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.REGISTER, element: <RegisterPage /> },
        ],
      },
    ],
  },

  // Protected routes (authenticated only)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },

          // Users
          {
            element: <PermissionGuard permission={PERMISSIONS.Users.View} />,
            children: [
              { path: ROUTES.USERS.LIST, element: <UsersListPage /> },
              { path: ROUTES.USERS.DETAIL, element: <UserDetailPage /> },
            ],
          },

          // Roles
          {
            element: <PermissionGuard permission={PERMISSIONS.Roles.View} />,
            children: [
              { path: ROUTES.ROLES.LIST, element: <RolesListPage /> },
              { path: ROUTES.ROLES.DETAIL, element: <RoleDetailPage /> },
            ],
          },
          {
            element: <PermissionGuard permission={PERMISSIONS.Roles.Create} />,
            children: [
              { path: ROUTES.ROLES.CREATE, element: <RoleCreatePage /> },
            ],
          },
          {
            element: (
              <PermissionGuard
                permissions={[PERMISSIONS.Roles.Update, PERMISSIONS.Roles.ManagePermissions]}
                mode="any"
              />
            ),
            children: [
              { path: ROUTES.ROLES.EDIT, element: <RoleEditPage /> },
            ],
          },

          // Schools
          {
            element: <PermissionGuard permission={PERMISSIONS.Schools.View} />,
            children: [
              { path: ROUTES.SCHOOLS.LIST, element: <SchoolsListPage /> },
              { path: ROUTES.SCHOOLS.DETAIL, element: <SchoolDetailPage /> },
            ],
          },
          {
            element: <PermissionGuard permission={PERMISSIONS.Schools.Create} />,
            children: [
              { path: ROUTES.SCHOOLS.CREATE, element: <SchoolCreatePage /> },
            ],
          },

          // Payments
          {
            element: <PermissionGuard permission={PERMISSIONS.Payments.View} />,
            children: [
              { path: ROUTES.PAYMENTS, element: <PaymentsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <NotFoundPage /> },
];
