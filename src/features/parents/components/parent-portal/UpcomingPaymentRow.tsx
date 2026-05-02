import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import { formatCurrency, formatDueDate } from '../../utils/format';
import type { ParentHomeUpcomingPayment } from '../../api/parent-portal.api';

interface Props {
  payment: ParentHomeUpcomingPayment;
  onPay: (payment: ParentHomeUpcomingPayment) => void;
  locale?: string;
}

const ACCENT_BY_CATEGORY: Record<string, string> = {
  tuition: 'bg-text-primary text-text-inverse',
  transport: 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300',
  activities: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  canteen: 'bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300',
};

export function UpcomingPaymentRow({ payment, onPay, locale }: Props) {
  const { t } = useTranslation();
  const initial = payment.title ? payment.title[0]!.toUpperCase() : '?';
  const accent = ACCENT_BY_CATEGORY[payment.categoryKey] ?? ACCENT_BY_CATEGORY.tuition;

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3 transition-colors hover:bg-hover">
      <span
        aria-hidden
        className={cn('inline-flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold', accent)}
      >
        {initial}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-text-primary">{payment.title}</p>
          {payment.paymentPlan ? (
            <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              {t('parent.upcoming.installment', {
                index: payment.paymentPlan.installmentIndex,
                total: payment.paymentPlan.installmentTotal,
              })}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-text-muted">
          {payment.schoolName} · {t('parent.upcoming.due', { date: formatDueDate(payment.dueDate, locale) })}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <p className="text-sm font-bold text-text-primary tabular-nums">
          {formatCurrency(payment.amount, locale)}
        </p>
        <Button type="button" size="sm" onClick={() => onPay(payment)}>
          {t('parent.upcoming.pay')}
        </Button>
      </div>
    </article>
  );
}
