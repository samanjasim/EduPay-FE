import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTES } from '@/config';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { SchoolLayout } from '@/components/layout/SchoolLayout';
import { AuthGuard, GuestGuard, PermissionGuard, SchoolAdminGuard } from '@/components/guards';
import { PERMISSIONS } from '@/constants';

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));
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
const AcademicYearsListPage = lazy(() => import('@/features/academic-years/pages/AcademicYearsListPage'));
const AcademicYearDetailPage = lazy(() => import('@/features/academic-years/pages/AcademicYearDetailPage'));
const GradesListPage = lazy(() => import('@/features/grades/pages/GradesListPage'));
const GradeDetailPage = lazy(() => import('@/features/grades/pages/GradeDetailPage'));
const StudentsListPage = lazy(() => import('@/features/students/pages/StudentsListPage'));
const StudentDetailPage = lazy(() => import('@/features/students/pages/StudentDetailPage'));
const ParentsListPage = lazy(() => import('@/features/parents/pages/ParentsListPage'));
const ParentDetailPage = lazy(() => import('@/features/parents/pages/ParentDetailPage'));
const FeeTypesListPage = lazy(() => import('@/features/fee-types/pages/FeeTypesListPage'));
const FeeStructuresListPage = lazy(() => import('@/features/fees/pages/FeeStructuresListPage'));
const FeeStructureDetailPage = lazy(() => import('@/features/fees/pages/FeeStructureDetailPage'));
const FeeInstancesListPage = lazy(() => import('@/features/fees/pages/FeeInstancesListPage'));
const FeeInstanceDetailPage = lazy(() => import('@/features/fees/pages/FeeInstanceDetailPage'));
const ParentFeeDashboardPage = lazy(() => import('@/features/parents/pages/ParentFeeDashboardPage'));
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
const ProductManualPurchasePage = lazy(
  () => import('@/features/products/pages/ProductManualPurchasePage')
);
const ProductPurchasesPage = lazy(
  () => import('@/features/products/pages/ProductPurchasesPage')
);
const ProductPurchaseStatsPage = lazy(
  () => import('@/features/products/pages/ProductPurchaseStatsPage')
);
const ParentProductCatalogPage = lazy(
  () => import('@/features/parents/pages/ParentProductCatalogPage')
);
const ParentProductDetailPage = lazy(
  () => import('@/features/parents/pages/ParentProductDetailPage')
);
const ParentProductOrdersPage = lazy(
  () => import('@/features/parents/pages/ParentProductOrdersPage')
);
const ParentPurchaseResultPage = lazy(
  () => import('@/features/parents/pages/ParentPurchaseResultPage')
);
const PaymentsPage = lazy(() => import('@/features/payments/pages/PaymentsPage'));
const WalletsListPage = lazy(() => import('@/features/wallets/pages/WalletsListPage'));
const WalletDetailPage = lazy(() => import('@/features/wallets/pages/WalletDetailPage'));
const OrdersListPage = lazy(() => import('@/features/orders/pages/OrdersListPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage'));
const ComingSoonPage = lazy(() => import('@/routes/ComingSoonPage'));

// School Portal pages (lazy-loaded)
const SchoolDashboardPage = lazy(() => import('@/features/school-portal/pages/SchoolDashboardPage'));
const SchoolPaymentsPage = lazy(() => import('@/features/school-portal/pages/SchoolPaymentsPage'));
const SchoolReportsPage = lazy(() => import('@/features/school-portal/pages/SchoolReportsPage'));
const SchoolCashCollectionPage = lazy(() => import('@/features/school-portal/pages/SchoolCashCollectionPage'));
const SchoolSettingsPage = lazy(() => import('@/features/school-portal/pages/SchoolSettingsPage'));
const SetupWizardPage = lazy(() => import('@/features/school-portal/pages/SetupWizardPage'));
const SchoolStudentsPage = lazy(() => import('@/features/students/pages/SchoolStudentsPage'));
const SchoolStudentDetailPage = lazy(() => import('@/features/students/pages/SchoolStudentDetailPage'));
const SchoolFeesPage = lazy(() => import('@/features/fees/pages/SchoolFeesPage'));
const SchoolGradesPage = lazy(() => import('@/features/school-portal/pages/SchoolGradesPage'));
const SchoolGradeDetailPage = lazy(() => import('@/features/school-portal/pages/SchoolGradeDetailPage'));
const SchoolStaffPage = lazy(() => import('@/features/school-portal/pages/SchoolStaffPage'));

export const routes: RouteObject[] = [
  // Public marketing landing page — open to everyone.
  // The page itself redirects authenticated users to ROUTES.DASHBOARD,
  // so guests see marketing while signed-in users go straight to the app.
  { path: ROUTES.LANDING, element: <LandingPage /> },

  // Public auth routes (guests only)
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
      // School Admin Portal
      {
        element: <SchoolAdminGuard />,
        children: [
          {
            element: <SchoolLayout />,
            children: [
              { path: ROUTES.SCHOOL.DASHBOARD, element: <SchoolDashboardPage /> },
              { path: ROUTES.SCHOOL.SETUP, element: <SetupWizardPage /> },
              { path: ROUTES.SCHOOL.GRADES.LIST, element: <SchoolGradesPage /> },
              { path: ROUTES.SCHOOL.GRADES.DETAIL, element: <SchoolGradeDetailPage /> },
              { path: ROUTES.SCHOOL.STUDENTS.LIST, element: <SchoolStudentsPage /> },
              { path: ROUTES.SCHOOL.STUDENTS.DETAIL, element: <SchoolStudentDetailPage /> },
              {
                element: (
                  <PermissionGuard
                    permissions={[PERMISSIONS.CashCollections.View, PERMISSIONS.Fees.View]}
                    mode="all"
                    redirectTo={ROUTES.SCHOOL.DASHBOARD}
                  />
                ),
                children: [
                  { path: ROUTES.SCHOOL.CASH_COLLECTION, element: <SchoolCashCollectionPage /> },
                ],
              },
              { path: ROUTES.SCHOOL.FEES, element: <SchoolFeesPage /> },
              { path: ROUTES.SCHOOL.FEE_STRUCTURES.DETAIL, element: <FeeStructureDetailPage /> },
              { path: ROUTES.SCHOOL.FEE_INSTANCES.DETAIL, element: <FeeInstanceDetailPage /> },
              { path: ROUTES.SCHOOL.PAYMENTS, element: <SchoolPaymentsPage /> },
              { path: ROUTES.SCHOOL.REPORTS, element: <SchoolReportsPage /> },
              { path: ROUTES.SCHOOL.STAFF, element: <SchoolStaffPage /> },
              { path: ROUTES.SCHOOL.SETTINGS, element: <SchoolSettingsPage /> },

              // School Products: catalog management (Task 9 builds the real pages)
              {
                element: <PermissionGuard permission={PERMISSIONS.Products.View} redirectTo={ROUTES.SCHOOL.DASHBOARD} />,
                children: [
                  {
                    path: ROUTES.SCHOOL.PRODUCTS.LIST,
                    element: <ComingSoonPage taskRef="Task 9 — catalog list" />,
                  },
                  {
                    path: ROUTES.SCHOOL.PRODUCTS.DETAIL,
                    element: <ComingSoonPage taskRef="Task 9 — catalog detail" />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission={PERMISSIONS.Products.Create} redirectTo={ROUTES.SCHOOL.DASHBOARD} />,
                children: [
                  {
                    path: ROUTES.SCHOOL.PRODUCTS.CREATE,
                    element: <ComingSoonPage taskRef="Task 9 — catalog create" />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission={PERMISSIONS.Products.Update} redirectTo={ROUTES.SCHOOL.DASHBOARD} />,
                children: [
                  {
                    path: ROUTES.SCHOOL.PRODUCTS.EDIT,
                    element: <ComingSoonPage taskRef="Task 9 — catalog edit" />,
                  },
                ],
              },

              // School Product Purchases: history, stats, manual sale (Task 10)
              {
                element: <PermissionGuard permission={PERMISSIONS.ProductPurchases.View} redirectTo={ROUTES.SCHOOL.DASHBOARD} />,
                children: [
                  {
                    path: ROUTES.SCHOOL.PRODUCTS.PURCHASES,
                    element: <ProductPurchasesPage />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission={PERMISSIONS.ProductPurchases.ViewStats} redirectTo={ROUTES.SCHOOL.DASHBOARD} />,
                children: [
                  {
                    path: ROUTES.SCHOOL.PRODUCTS.STATS,
                    element: <ProductPurchaseStatsPage />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission={PERMISSIONS.ProductPurchases.Create} redirectTo={ROUTES.SCHOOL.DASHBOARD} />,
                children: [
                  {
                    path: ROUTES.SCHOOL.PRODUCTS.MANUAL_PURCHASE,
                    element: <ProductManualPurchasePage />,
                  },
                ],
              },
            ],
          },
        ],
      },

      // Platform Admin routes
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

          // Academic Years
          {
            element: <PermissionGuard permission={PERMISSIONS.AcademicYears.View} />,
            children: [
              { path: ROUTES.ACADEMIC_YEARS.LIST, element: <AcademicYearsListPage /> },
              { path: ROUTES.ACADEMIC_YEARS.DETAIL, element: <AcademicYearDetailPage /> },
            ],
          },

          // Grades
          {
            element: <PermissionGuard permission={PERMISSIONS.Grades.View} />,
            children: [
              { path: ROUTES.GRADES.LIST, element: <GradesListPage /> },
              { path: ROUTES.GRADES.DETAIL, element: <GradeDetailPage /> },
            ],
          },

          // Students
          {
            element: <PermissionGuard permission={PERMISSIONS.Students.View} />,
            children: [
              { path: ROUTES.STUDENTS.LIST, element: <StudentsListPage /> },
              { path: ROUTES.STUDENTS.DETAIL, element: <StudentDetailPage /> },
            ],
          },

          // Parents
          {
            element: <PermissionGuard permission={PERMISSIONS.Students.ManageParents} />,
            children: [
              { path: ROUTES.PARENTS.LIST, element: <ParentsListPage /> },
              { path: ROUTES.PARENTS.DETAIL, element: <ParentDetailPage /> },
            ],
          },

          // Fee Types
          {
            element: <PermissionGuard permission={PERMISSIONS.FeeTypes.View} />,
            children: [
              { path: ROUTES.FEE_TYPES.LIST, element: <FeeTypesListPage /> },
            ],
          },

          // Parent Fees (self-service)
          { path: ROUTES.PARENT_FEES, element: <ParentFeeDashboardPage /> },

          // Parent Products (self-service catalog).
          // AuthGuard already wraps these via the parent <AuthGuard /> block.
          {
            path: ROUTES.PARENT_PRODUCTS.CATALOG,
            element: <ParentProductCatalogPage />,
          },
          {
            path: ROUTES.PARENT_PRODUCTS.DETAIL,
            element: <ParentProductDetailPage />,
          },
          {
            path: ROUTES.PARENT_PRODUCTS.ORDERS,
            element: <ParentProductOrdersPage />,
          },
          {
            path: ROUTES.PARENT_PRODUCTS.PURCHASE_RESULT,
            element: <ParentPurchaseResultPage />,
          },

          // Fee Structures
          {
            element: <PermissionGuard permission={PERMISSIONS.Fees.View} />,
            children: [
              { path: ROUTES.FEE_STRUCTURES.LIST, element: <FeeStructuresListPage /> },
              { path: ROUTES.FEE_STRUCTURES.DETAIL, element: <FeeStructureDetailPage /> },
              { path: ROUTES.FEE_INSTANCES.LIST, element: <FeeInstancesListPage /> },
              { path: ROUTES.FEE_INSTANCES.DETAIL, element: <FeeInstanceDetailPage /> },
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

          // Wallets
          {
            element: <PermissionGuard permission={PERMISSIONS.Wallets.View} />,
            children: [
              { path: ROUTES.WALLETS.LIST, element: <WalletsListPage /> },
              { path: ROUTES.WALLETS.DETAIL, element: <WalletDetailPage /> },
            ],
          },

          // Orders
          {
            element: <PermissionGuard permission={PERMISSIONS.Orders.View} />,
            children: [
              { path: ROUTES.ORDERS.LIST, element: <OrdersListPage /> },
              { path: ROUTES.ORDERS.DETAIL, element: <OrderDetailPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <NotFoundPage /> },
];
