import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingScreen } from '@/components/common';
import { ROUTES } from '@/config';
import { useParentHomeDashboard } from '../api/parent-portal.queries';
import { ChildrenChipStrip } from '../components/parent-portal/ChildrenChipStrip';
import { DueThisMonthCard } from '../components/parent-portal/DueThisMonthCard';
import { FeeCategoryStrip } from '../components/parent-portal/FeeCategoryStrip';
import { UpcomingPaymentRow } from '../components/parent-portal/UpcomingPaymentRow';
import { RewardsStrip } from '../components/parent-portal/RewardsStrip';
import { PayFeeModal, type PayFeeModalFee } from '../components/parent-portal/PayFeeModal';
import type { ParentHomeUpcomingPayment } from '../api/parent-portal.api';

export default function ParentDashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeChildIdParam = searchParams.get('activeChildId');

  const { data, isLoading, isError, refetch } = useParentHomeDashboard(activeChildIdParam);

  const [payFee, setPayFee] = useState<PayFeeModalFee | null>(null);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) {
    return (
      <p className="mt-12 text-center text-sm text-text-secondary">
        {t('parent.dashboard.loadError')}
      </p>
    );
  }

  const handleSelectChild = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('activeChildId', id);
      return next;
    });
  };

  const openPayForFee = (payment: ParentHomeUpcomingPayment) => {
    setPayFee({
      feeInstanceId: payment.feeInstanceId,
      title: payment.title,
      schoolName: payment.schoolName,
      amount: payment.amount,
      currency: payment.currency,
      dueDate: payment.dueDate,
    });
  };

  const onPayAll = () => {
    if (data.dueThisMonth.feeInstanceIds.length === 0) return;
    // Phase 3 wires the multi-fee checkout cart; for now, prefill with the first fee.
    const first = data.upcomingPayments.find((p) =>
      data.dueThisMonth.feeInstanceIds.includes(p.feeInstanceId)
    );
    if (first) openPayForFee(first);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Children selector */}
      <ChildrenChipStrip
        children={data.children}
        activeChildId={data.activeChildId}
        onSelect={handleSelectChild}
      />

      {/* Hero card */}
      <DueThisMonthCard data={data.dueThisMonth} onPayAll={onPayAll} />

      {/* Fee categories */}
      <FeeCategoryStrip
        categories={data.feeCategories}
        onSelect={(cat) => {
          if (data.activeChildId) {
            navigate(`${ROUTES.PARENT.getChildDetail(data.activeChildId)}?category=${cat.key}`);
          }
        }}
      />

      {/* Upcoming payments */}
      <section aria-labelledby="upcoming-heading" className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 id="upcoming-heading" className="text-base font-bold text-text-primary">
            {t('parent.upcoming.title')}
          </h2>
          {data.activeChildId ? (
            <Link
              to={ROUTES.PARENT.getChildDetail(data.activeChildId)}
              className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              {t('parent.upcoming.seeAll')}
            </Link>
          ) : null}
        </header>

        {data.upcomingPayments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-muted">
            {t('parent.upcoming.empty')}
          </p>
        ) : (
          <div className="space-y-2">
            {data.upcomingPayments.map((p) => (
              <UpcomingPaymentRow
                key={p.feeInstanceId}
                payment={p}
                onPay={openPayForFee}
                locale={i18n.resolvedLanguage}
              />
            ))}
          </div>
        )}
      </section>

      {/* Rewards (Phase 5 wires the redeem flow) */}
      <RewardsStrip rewards={data.rewards} />

      <PayFeeModal
        fee={payFee}
        open={!!payFee}
        onClose={() => setPayFee(null)}
        onPaid={() => refetch()}
      />
    </div>
  );
}
