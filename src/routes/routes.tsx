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
const ParentsListPage = lazy(() => import('@/features/parents/pages/ParentsListPage'));
const ParentDetailPage = lazy(() => import('@/features/parents/pages/ParentDetailPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const NotificationDetailPage = lazy(() => import('@/features/notifications/pages/NotificationDetailPage'));
const SendNotificationPage = lazy(() => import('@/features/notifications/pages/SendNotificationPage'));
const PlansListPage = lazy(() => import('@/features/plans/pages/PlansListPage'));
const PlanCreatePage = lazy(() => import('@/features/plans/pages/PlanCreatePage'));
const PlanDetailPage = lazy(() => import('@/features/plans/pages/PlanDetailPage'));
const PlanEditPage = lazy(() => import('@/features/plans/pages/PlanEditPage'));
const FilesPage = lazy(() => import('@/features/files/pages/FilesPage'));
const FileCategoriesPage = lazy(() => import('@/features/files/pages/FileCategoriesPage'));
const ProductsListPage = lazy(() => import('@/features/products/pages/ProductsListPage'));
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage'));
const ProductCreatePage = lazy(() => import('@/features/products/pages/ProductCreatePage'));
const ProductEditPage = lazy(() => import('@/features/products/pages/ProductEditPage'));
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

          // Parents
          {
            element: <PermissionGuard permission={PERMISSIONS.Fees.View} />,
            children: [
              { path: ROUTES.PARENTS.LIST, element: <ParentsListPage /> },
              { path: ROUTES.PARENTS.DETAIL, element: <ParentDetailPage /> },
            ],
          },

          // Notifications
          {
            element: <PermissionGuard permission={PERMISSIONS.Notifications.View} />,
            children: [
              { path: ROUTES.NOTIFICATIONS.LIST, element: <NotificationsPage /> },
              { path: ROUTES.NOTIFICATIONS.DETAIL, element: <NotificationDetailPage /> },
            ],
          },
          {
            element: <PermissionGuard permission={PERMISSIONS.Notifications.Send} />,
            children: [
              { path: ROUTES.NOTIFICATIONS.SEND, element: <SendNotificationPage /> },
            ],
          },

          // Subscription Plans
          {
            element: <PermissionGuard permission={PERMISSIONS.System.ViewDashboard} />,
            children: [
              { path: ROUTES.PLANS.LIST, element: <PlansListPage /> },
              { path: ROUTES.PLANS.CREATE, element: <PlanCreatePage /> },
              { path: ROUTES.PLANS.DETAIL, element: <PlanDetailPage /> },
              { path: ROUTES.PLANS.EDIT, element: <PlanEditPage /> },
            ],
          },

          // Files
          {
            element: <PermissionGuard permission={PERMISSIONS.Files.View} />,
            children: [
              { path: ROUTES.FILES, element: <FilesPage /> },
              { path: ROUTES.FILE_CATEGORIES, element: <FileCategoriesPage /> },
            ],
          },

          // Products
          {
            element: <PermissionGuard permission={PERMISSIONS.Products.View} />,
            children: [
              { path: ROUTES.PRODUCTS.LIST, element: <ProductsListPage /> },
              { path: ROUTES.PRODUCTS.DETAIL, element: <ProductDetailPage /> },
            ],
          },
          {
            element: <PermissionGuard permission={PERMISSIONS.Products.Create} />,
            children: [
              { path: ROUTES.PRODUCTS.CREATE, element: <ProductCreatePage /> },
            ],
          },
          {
            element: <PermissionGuard permission={PERMISSIONS.Products.Update} />,
            children: [
              { path: ROUTES.PRODUCTS.EDIT, element: <ProductEditPage /> },
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
