import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { useParentChildDetail } from '../api/parent-portal.queries';
import { CategoryIcon } from '../components/parent-portal/CategoryIcon';
import { PayFeeModal, type PayFeeModalFee } from '../components/parent-portal/PayFeeModal';
import { formatCurrency, formatDueDate } from '../utils/format';
import type { ParentChildFee, ParentFeeIconKey } from '../api/parent-portal.api';

const ICON_BY_CATEGORY: Record<string, ParentFeeIconKey> = {
  tuition: 'graduation',
  transport: 'bus',
  activities: 'clock',
  canteen: 'utensils',
};

const STATUS_TONE: Record<string, string> = {
  Pending: 'bg-warning/15 text-warning',
  Overdue: 'bg-error/15 text-error',
  Paid: 'bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300',
  Waived: 'bg-surface-200 text-text-secondary dark:bg-white/10',
  Cancelled: 'bg-surface-200 text-text-muted dark:bg-white/10',
};

export default function ParentChildDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const { data, isLoading, isError, refetch } = useParentChildDetail(id);

  const [payFee, setPayFee] = useState<PayFeeModalFee | null>(null);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) {
    return (
      <p className="mt-12 text-center text-sm text-text-secondary">{t('parent.dashboard.loadError')}</p>
    );
  }

  const filteredFees = categoryFilter
    ? data.fees.filter((f) => f.categoryKey === categoryFilter)
    : data.fees;

  const onPay = (fee: ParentChildFee) => {
    setPayFee({
      feeInstanceId: fee.feeInstanceId,
      title: fee.feeStructureName,
      schoolName: data.schoolName,
      amount: fee.remaining,
      currency: fee.currency,
      dueDate: fee.dueDate,
      schoolId: data.schoolId,
    });
  };

  return (
    <div className="space-y-6 pb-6">
      <Link
        to={ROUTES.PARENT.DASHBOARD}
        className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {t('parent.child.back')}
      </Link>

      {/* Summary header */}
      <header className="rounded-3xl bg-surface p-5 shadow-soft-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          {data.grade} · {data.schoolName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">{data.displayName}</h1>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat
            label={t('parent.child.outstanding')}
            value={`${data.currency} ${formatCurrency(data.totalOutstanding, i18n.resolvedLanguage)}`}
            tone="warn"
          />
          <Stat
            label={t('parent.child.paid')}
            value={`${data.currency} ${formatCurrency(data.totalPaid, i18n.resolvedLanguage)}`}
            tone="ok"
          />
          <Stat
            label={t('parent.child.overdue')}
            value={String(data.overdueCount)}
            tone={data.overdueCount > 0 ? 'bad' : 'mute'}
          />
        </dl>
      </header>

      {/* Fees */}
      <section aria-labelledby="fees-heading" className="space-y-2">
        <header className="flex items-center justify-between">
          <h2 id="fees-heading" className="text-base font-bold text-text-primary">
            {t('parent.child.feesTitle')}
          </h2>
          {categoryFilter ? (
            <Link
              to={ROUTES.PARENT.getChildDetail(data.id)}
              className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              {t('parent.child.clearFilter')}
            </Link>
          ) : null}
        </header>

        {filteredFees.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-muted">
            {t('parent.child.noFees')}
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredFees.map((fee) => {
              const icon = ICON_BY_CATEGORY[fee.categoryKey] ?? 'graduation';
              const canPay = fee.status === 'Pending' || fee.status === 'Overdue';
              return (
                <li
                  key={fee.feeInstanceId}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                    <CategoryIcon iconKey={icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{fee.feeStructureName}</p>
                    <p className="truncate text-xs text-text-muted">
                      {fee.feeTypeName} · {t('parent.upcoming.due', { date: formatDueDate(fee.dueDate, i18n.resolvedLanguage) })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                        STATUS_TONE[fee.status] ?? STATUS_TONE.Pending
                      )}
                    >
                      {t(`parent.child.status.${fee.status.toLowerCase()}`, fee.status)}
                    </span>
                    <p className="text-sm font-bold text-text-primary tabular-nums">
                      {formatCurrency(canPay ? fee.remaining : fee.amount, i18n.resolvedLanguage)}
                    </p>
                    {canPay ? (
                      <Button size="sm" variant="primary" onClick={() => onPay(fee)}>
                        {t('parent.upcoming.pay')}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent receipts */}
      {data.recentReceipts.length > 0 ? (
        <section aria-labelledby="receipts-heading" className="space-y-2">
          <h2 id="receipts-heading" className="text-base font-bold text-text-primary">
            {t('parent.child.receiptsTitle')}
          </h2>
          <ul className="space-y-2">
            {data.recentReceipts.map((r) => (
              <li
                key={r.orderId}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm"
              >
                <span className="flex flex-col">
                  <span className="font-semibold text-text-primary">{r.receiptNumber}</span>
                  <span className="text-xs text-text-muted">{formatDueDate(r.paidAt, i18n.resolvedLanguage)}</span>
                </span>
                <span className="font-bold tabular-nums text-text-primary">
                  {r.currency} {formatCurrency(r.amount, i18n.resolvedLanguage)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PayFeeModal
        fee={payFee}
        open={!!payFee}
        onClose={() => setPayFee(null)}
        onPaid={() => refetch()}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'warn' | 'bad' | 'mute' }) {
  const toneClass =
    tone === 'ok'
      ? 'text-accent-700 dark:text-accent-300'
      : tone === 'warn'
        ? 'text-warning'
        : tone === 'bad'
          ? 'text-error'
          : 'text-text-secondary';
  return (
    <div className="rounded-2xl bg-surface-200 px-2 py-3 dark:bg-white/5">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className={cn('mt-1 text-sm font-bold tabular-nums', toneClass)}>{value}</dd>
    </div>
  );
}
