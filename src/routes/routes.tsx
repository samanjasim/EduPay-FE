import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTES } from '@/config';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthGuard, GuestGuard } from '@/components/guards';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const UsersListPage = lazy(() => import('@/features/users/pages/UsersListPage'));
const UserDetailPage = lazy(() => import('@/features/users/pages/UserDetailPage'));
const RolesListPage = lazy(() => import('@/features/roles/pages/RolesListPage'));
const RoleDetailPage = lazy(() => import('@/features/roles/pages/RoleDetailPage'));
const RoleCreatePage = lazy(() => import('@/features/roles/pages/RoleCreatePage'));
const SchoolsPage = lazy(() => import('@/features/schools/pages/SchoolsPage'));
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
          { path: ROUTES.USERS.LIST, element: <UsersListPage /> },
          { path: ROUTES.USERS.DETAIL, element: <UserDetailPage /> },

          // Roles
          { path: ROUTES.ROLES.LIST, element: <RolesListPage /> },
          { path: ROUTES.ROLES.CREATE, element: <RoleCreatePage /> },
          { path: ROUTES.ROLES.DETAIL, element: <RoleDetailPage /> },

          // Placeholder pages
          { path: ROUTES.SCHOOLS, element: <SchoolsPage /> },
          { path: ROUTES.PAYMENTS, element: <PaymentsPage /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <NotFoundPage /> },
];
