import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, selectUser } from '@/stores';
import { useParentHomeDashboard } from '@/features/parents/api/parent-portal.queries';
import { ROUTES } from '@/config';
import { cn } from '@/utils';

/**
 * Top bar matching the supplied mobile mock — date, "Hello, {name}" greeting,
 * notifications bell with unread badge, avatar with initial.
 */
export function ParentHeader() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore(selectUser);
  const { data: dashboard } = useParentHomeDashboard();

  const dateLabel = useMemo(() => {
    const d = new Date();
    try {
      return d
        .toLocaleDateString(i18n.resolvedLanguage ?? 'en', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
        .toUpperCase();
    } catch {
      return d.toDateString().toUpperCase();
    }
  }, [i18n.resolvedLanguage]);

  const firstName = user?.firstName ?? dashboard?.user.firstName ?? '';
  const initial = firstName ? firstName[0]!.toUpperCase() : '?';
  const unread = dashboard?.user.unreadNotificationCount ?? 0;

  return (
    <header className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{dateLabel}</p>

      <div className="mt-1 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold leading-tight text-text-primary">
          {t('parent.header.hello')},{' '}
          <span className="italic font-semibold gradient-text">{firstName || ' '}</span>
        </h1>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.PARENT.PROFILE}
            className={cn(
              'relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface',
              'text-text-primary transition-colors hover:bg-hover focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
            aria-label={t('parent.header.notifications')}
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unread > 0 ? (
              <span
                className="absolute end-1 top-1 h-2 w-2 rounded-full bg-error"
                aria-label={t('parent.header.unreadBadge', { count: unread })}
              />
            ) : null}
          </Link>

          <Link
            to={ROUTES.PARENT.PROFILE}
            aria-label={t('parent.header.profile')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-100 text-sm font-bold text-accent-700 dark:bg-accent-500/15 dark:text-accent-300"
          >
            {initial}
          </Link>
        </div>
      </div>
    </header>
  );
}
