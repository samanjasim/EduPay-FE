import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  GraduationCap,
  BookOpen,
  UserCog,
  Banknote,
} from 'lucide-react';
import { cn } from '@/utils';
import { useUIStore, selectSidebarCollapsed } from '@/stores';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';

interface SchoolSidebarProps {
  schoolName?: string;
}

export function SchoolSidebar({ schoolName }: SchoolSidebarProps) {
  const { t } = useTranslation();
  const isCollapsed = useUIStore(selectSidebarCollapsed);
  const toggleCollapse = useUIStore((state) => state.toggleSidebarCollapse);
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const canRecordCash = hasPermission(PERMISSIONS.CashCollections.Create);
  const canViewCashCollection = hasAllPermissions([
    PERMISSIONS.CashCollections.View,
    PERMISSIONS.Fees.View,
  ]);
  const canManageFees = hasAnyPermission([
    PERMISSIONS.Fees.Create,
    PERMISSIONS.Fees.Update,
    PERMISSIONS.Fees.Delete,
  ]);

  const navItems = [
    { label: t('schoolPortal.nav.dashboard'), icon: LayoutDashboard, path: ROUTES.SCHOOL.DASHBOARD, show: hasPermission(PERMISSIONS.Schools.View) },
    { label: t('schoolPortal.nav.grades'), icon: BookOpen, path: ROUTES.SCHOOL.GRADES.LIST, show: hasPermission(PERMISSIONS.Grades.View) },
    { label: t('schoolPortal.nav.students'), icon: Users, path: ROUTES.SCHOOL.STUDENTS.LIST, show: hasPermission(PERMISSIONS.Students.View) },
    { label: t('schoolPortal.nav.cashCollection'), icon: Banknote, path: ROUTES.SCHOOL.CASH_COLLECTION, show: canViewCashCollection },
    { label: t('schoolPortal.nav.fees'), icon: Receipt, path: ROUTES.SCHOOL.FEES, show: hasPermission(PERMISSIONS.Fees.View) && (canManageFees || !canRecordCash) },
    { label: t('schoolPortal.nav.reports'), icon: BarChart3, path: ROUTES.SCHOOL.REPORTS, show: hasPermission(PERMISSIONS.CashCollections.View) },
    { label: t('schoolPortal.nav.staff'), icon: UserCog, path: ROUTES.SCHOOL.STAFF, show: hasPermission(PERMISSIONS.Schools.ManageAdmins) },
    { label: t('schoolPortal.nav.settings'), icon: Settings, path: ROUTES.SCHOOL.SETTINGS, show: hasPermission(PERMISSIONS.Schools.ManageSettings) },
  ].filter((item) => item.show);

  return (
    <aside
      className={cn(
        'fixed top-0 z-40 flex h-screen flex-col border-border bg-surface transition-all duration-300',
        'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* School branding */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
            <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold text-text-primary">
                {schoolName || t('schoolPortal.title')}
              </span>
              <span className="text-xs text-text-muted">{t('schoolPortal.subtitle')}</span>
            </div>
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
                end={item.path === ROUTES.SCHOOL.DASHBOARD}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
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
          {!isCollapsed && <span className="ltr:ml-2 rtl:mr-2">{t('nav.collapse')}</span>}
        </Button>
      </div>
    </aside>
  );
}
