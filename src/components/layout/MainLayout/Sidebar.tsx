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
} from 'lucide-react';
import { cn } from '@/utils';
import { useUIStore, selectSidebarCollapsed } from '@/stores';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';

export function Sidebar() {
  const { t } = useTranslation();
  const isCollapsed = useUIStore(selectSidebarCollapsed);
  const toggleCollapse = useUIStore((state) => state.toggleSidebarCollapse);
  const { hasPermission } = usePermissions();

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
    ...(hasPermission(PERMISSIONS.Payments.View)
      ? [{ label: t('nav.payments'), icon: CreditCard, path: ROUTES.PAYMENTS }]
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
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
            <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-text-primary">EduPay</span>
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
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300'
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
