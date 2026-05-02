import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Shield,
  GraduationCap,
  ChevronLeft,
  School,
  CreditCard,
  CalendarRange,
  BookOpen,
  UserRoundSearch,
  UsersRound,
  Tags,
  Receipt,
  ClipboardList,
  Wallet,
  WalletCards,
  Bell,
  Package,
  FileText,
  Layers,
  ShoppingCart,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/utils';
import { useUIStore, selectSidebarCollapsed } from '@/stores';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui';
import { usePermissions } from '@/hooks';
import { useAuthStore } from '@/stores';
import { PERMISSIONS } from '@/constants';

export function Sidebar() {
  const { t } = useTranslation();
  const isCollapsed = useUIStore(selectSidebarCollapsed);
  const toggleCollapse = useUIStore((state) => state.toggleSidebarCollapse);
  const { hasPermission } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const isParent = user?.roles?.includes('Parent');

  const navItems = [
    { label: t('nav.dashboard'), icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    ...(hasPermission(PERMISSIONS.Users.View)
      ? [{ label: t('nav.users'), icon: Users, path: ROUTES.USERS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Roles.View)
      ? [{ label: t('nav.roles'), icon: Shield, path: ROUTES.ROLES.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Schools.View)
      ? [{ label: t('nav.schools'), icon: School, path: ROUTES.SCHOOLS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.AcademicYears.View)
      ? [{ label: t('nav.academicYears'), icon: CalendarRange, path: ROUTES.ACADEMIC_YEARS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Grades.View)
      ? [{ label: t('nav.grades'), icon: BookOpen, path: ROUTES.GRADES.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Students.View)
      ? [{ label: t('nav.students'), icon: UserRoundSearch, path: ROUTES.STUDENTS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Students.ManageParents)
      ? [{ label: t('nav.parents'), icon: UsersRound, path: ROUTES.PARENTS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.FeeTypes.View)
      ? [{ label: t('nav.feeTypes'), icon: Tags, path: ROUTES.FEE_TYPES.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Fees.View)
      ? [
          { label: t('nav.feeStructures'), icon: Receipt, path: ROUTES.FEE_STRUCTURES.LIST },
          { label: t('nav.feeInstances'), icon: ClipboardList, path: ROUTES.FEE_INSTANCES.LIST },
        ]
      : []),
    ...((isParent || hasPermission(PERMISSIONS.Fees.View))
      ? [{ label: t('nav.myFees'), icon: Wallet, path: ROUTES.PARENT_FEES }]
      : []),
    ...(isParent
      ? [
          { label: t('nav.parentCatalog', 'Catalog'), icon: ShoppingCart, path: ROUTES.PARENT_PRODUCTS.CATALOG },
          { label: t('nav.parentOrders', 'My Orders'), icon: ScrollText, path: ROUTES.PARENT_PRODUCTS.ORDERS },
        ]
      : []),
    ...(hasPermission(PERMISSIONS.Products.View)
      ? [{ label: t('nav.products'), icon: Package, path: ROUTES.PRODUCTS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.System.ViewDashboard)
      ? [{ label: t('nav.plans'), icon: Layers, path: ROUTES.PLANS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Notifications.View)
      ? [{ label: t('nav.notifications'), icon: Bell, path: ROUTES.NOTIFICATIONS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Files.View)
      ? [{ label: t('nav.files'), icon: FileText, path: ROUTES.FILES }]
      : []),
    ...(hasPermission(PERMISSIONS.Payments.View)
      ? [{ label: t('nav.payments'), icon: CreditCard, path: ROUTES.PAYMENTS }]
      : []),
    ...(hasPermission(PERMISSIONS.Wallets.View)
      ? [{ label: t('nav.wallets'), icon: WalletCards, path: ROUTES.WALLETS.LIST }]
      : []),
    ...(hasPermission(PERMISSIONS.Orders.View)
      ? [{ label: t('nav.orders'), icon: Receipt, path: ROUTES.ORDERS.LIST }]
      : []),
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 z-40 flex h-screen flex-col border-border bg-surface transition-all duration-300',
        'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 min-w-0 items-center justify-between overflow-hidden border-b border-border px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
            <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          {!isCollapsed && (
            <span className="min-w-0 truncate text-lg font-bold text-text-primary">EduPay</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === ROUTES.DASHBOARD}
                className={({ isActive }) =>
                  cn(
                    'flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="min-w-0 truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn('w-full justify-center', !isCollapsed && 'justify-start')}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              isCollapsed && 'ltr:rotate-180 rtl:rotate-0',
              !isCollapsed && 'rtl:rotate-180'
            )}
          />
          {!isCollapsed && <span className="min-w-0 truncate ltr:ml-2 rtl:mr-2">{t('nav.collapse')}</span>}
        </Button>
      </div>
    </aside>
  );
}
