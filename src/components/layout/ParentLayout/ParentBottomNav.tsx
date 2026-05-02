import { NavLink } from 'react-router-dom';
import { Activity, Compass, Gift, Home, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { cn } from '@/utils';

/**
 * Sticky bottom navigation matching the supplied mock: Home / Discover / Rewards / Activity / Profile.
 * Discover, Rewards and Activity are wired to the dashboard for now — Phase 5 fills them in.
 */
export function ParentBottomNav() {
  const { t } = useTranslation();

  const tabs = [
    { to: ROUTES.PARENT.DASHBOARD, end: true, icon: Home, label: t('parent.nav.home') },
    { to: ROUTES.PARENT.DASHBOARD, end: true, icon: Compass, label: t('parent.nav.discover'), disabled: true },
    { to: ROUTES.PARENT.DASHBOARD, end: true, icon: Gift, label: t('parent.nav.rewards'), disabled: true },
    { to: ROUTES.PARENT.DASHBOARD, end: true, icon: Activity, label: t('parent.nav.activity'), disabled: true },
    { to: ROUTES.PARENT.PROFILE, end: false, icon: User, label: t('parent.nav.profile') },
  ];

  return (
    <nav
      aria-label={t('parent.nav.title')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around px-1 py-1">
        {tabs.map((tab, i) =>
          tab.disabled ? (
            <li key={`${tab.label}-${i}`} className="flex-1">
              <span
                aria-disabled
                className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] text-text-muted/60"
              >
                <tab.icon className="h-5 w-5" aria-hidden />
                {tab.label}
              </span>
            </li>
          ) : (
            <li key={`${tab.label}-${i}`} className="flex-1">
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors',
                    isActive
                      ? 'text-primary-600 dark:text-primary-300'
                      : 'text-text-muted hover:text-text-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-2xl transition-colors',
                        isActive && 'bg-primary-50 dark:bg-primary-500/15'
                      )}
                    >
                      <tab.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}
