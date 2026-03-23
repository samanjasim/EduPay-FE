import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTES } from '@/config';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { SchoolLayout } from '@/components/layout/SchoolLayout';
import { AuthGuard, GuestGuard, PermissionGuard, SchoolAdminGuard } from '@/components/guards';
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
const AcademicYearsListPage = lazy(() => import('@/features/academic-years/pages/AcademicYearsListPage'));
const AcademicYearDetailPage = lazy(() => import('@/features/academic-years/pages/AcademicYearDetailPage'));
const GradesListPage = lazy(() => import('@/features/grades/pages/GradesListPage'));
const GradeDetailPage = lazy(() => import('@/features/grades/pages/GradeDetailPage'));
const StudentsListPage = lazy(() => import('@/features/students/pages/StudentsListPage'));
const StudentDetailPage = lazy(() => import('@/features/students/pages/StudentDetailPage'));
const ParentsListPage = lazy(() => import('@/features/parents/pages/ParentsListPage'));
const FeeTypesListPage = lazy(() => import('@/features/fee-types/pages/FeeTypesListPage'));
const FeeStructuresListPage = lazy(() => import('@/features/fees/pages/FeeStructuresListPage'));
const FeeStructureDetailPage = lazy(() => import('@/features/fees/pages/FeeStructureDetailPage'));
const FeeInstancesListPage = lazy(() => import('@/features/fees/pages/FeeInstancesListPage'));
const FeeInstanceDetailPage = lazy(() => import('@/features/fees/pages/FeeInstanceDetailPage'));
const ParentFeeDashboardPage = lazy(() => import('@/features/parents/pages/ParentFeeDashboardPage'));
const PaymentsPage = lazy(() => import('@/features/payments/pages/PaymentsPage'));
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage'));

// School Portal pages (lazy-loaded)
const SchoolDashboardPage = lazy(() => import('@/features/school-portal/pages/SchoolDashboardPage'));
const SchoolPaymentsPage = lazy(() => import('@/features/school-portal/pages/SchoolPaymentsPage'));
const SchoolReportsPage = lazy(() => import('@/features/school-portal/pages/SchoolReportsPage'));
const SchoolSettingsPage = lazy(() => import('@/features/school-portal/pages/SchoolSettingsPage'));
const SetupWizardPage = lazy(() => import('@/features/school-portal/pages/SetupWizardPage'));
const SchoolStudentsPage = lazy(() => import('@/features/students/pages/SchoolStudentsPage'));
const SchoolStudentDetailPage = lazy(() => import('@/features/students/pages/SchoolStudentDetailPage'));
const SchoolFeesPage = lazy(() => import('@/features/fees/pages/SchoolFeesPage'));

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
      // School Admin Portal
      {
        element: <SchoolAdminGuard />,
        children: [
          {
            element: <SchoolLayout />,
            children: [
              { path: ROUTES.SCHOOL.DASHBOARD, element: <SchoolDashboardPage /> },
              { path: ROUTES.SCHOOL.SETUP, element: <SetupWizardPage /> },
              { path: ROUTES.SCHOOL.STUDENTS.LIST, element: <SchoolStudentsPage /> },
              { path: ROUTES.SCHOOL.STUDENTS.DETAIL, element: <SchoolStudentDetailPage /> },
              { path: ROUTES.SCHOOL.FEES, element: <SchoolFeesPage /> },
              { path: ROUTES.SCHOOL.PAYMENTS, element: <SchoolPaymentsPage /> },
              { path: ROUTES.SCHOOL.REPORTS, element: <SchoolReportsPage /> },
              { path: ROUTES.SCHOOL.SETTINGS, element: <SchoolSettingsPage /> },
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
