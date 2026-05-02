import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import {
  Card, CardContent, Badge, Spinner,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useParentFees } from '../hooks/useParentFees';
import type { ParentFeeDashboardCategoryDto } from '../api/parentFees.api';

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'error',
  Waived: 'default',
  Cancelled: 'default',
};

export default function ParentFeeDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useParentFees();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-red-500">
        {t('parentFees.errorLoading')}
      </div>
    );
  }

  if (!data || data.children.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('parentFees.title')} subtitle={t('parentFees.subtitle')} />
        <EmptyState icon={Wallet} title={t('parentFees.noFees')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('parentFees.title')} subtitle={t('parentFees.subtitle')} />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label={t('parentFees.totalOutstanding')}
          value={data.totalOutstanding}
          currency={data.currency}
          variant="warning"
        />
        <SummaryCard
          label={t('parentFees.totalPaid')}
          value={data.totalPaid}
          currency={data.currency}
          variant="success"
        />
        <SummaryCard
          label={t('parentFees.totalOverdue')}
          value={data.totalOverdue}
          currency={data.currency}
          variant="error"
        />
      </div>

      {/* Per-fee-type rollup (NEW: backed by /Parents/my-fees → byCategory) */}
      {data.byCategory && data.byCategory.length > 0 && (
        <ByCategorySection categories={data.byCategory} currency={data.currency} />
      )}

      {/* Children Fee Cards */}
      {data.children.map((child) => (
        <ChildFeeCard key={child.studentId} child={child} />
      ))}
    </div>
  );
}

function ByCategorySection({
  categories,
  currency,
}: {
  categories: ParentFeeDashboardCategoryDto[];
  currency: string;
}) {
  const { t } = useTranslation();
  // Largest outstanding for relative bar widths
  const maxOutstanding = Math.max(...categories.map((c) => c.totalOutstanding), 1);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-text-muted" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            {t('parentFees.byCategory')}
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const pct = (cat.totalOutstanding / maxOutstanding) * 100;
            const fullyPaid = cat.totalOutstanding === 0 && cat.totalPaid > 0;
            return (
              <div
                key={cat.feeType}
                className="rounded-lg border border-border bg-card-bg p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text-primary">{cat.feeType}</span>
                  {fullyPaid ? (
                    <Badge variant="success" size="sm">
                      {t('parentFees.allPaid')}
                    </Badge>
                  ) : (
                    <Badge
                      variant={cat.totalOutstanding > 0 ? 'warning' : 'default'}
                      size="sm"
                    >
                      {cat.dueCount} {t('parentFees.due')}
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {cat.totalOutstanding.toLocaleString()} {currency}
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-text-muted">
                  <span>
                    {t('parentFees.totalDue')}: {cat.totalDue.toLocaleString()}
                  </span>
                  <span>
                    {t('parentFees.totalPaid')}: {cat.totalPaid.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  currency,
  variant,
}: {
  label: string;
  value: number;
  currency: string;
  variant: 'warning' | 'success' | 'error';
}) {
  const colorClasses = {
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-text-muted">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${colorClasses[variant]}`}>
          {value.toLocaleString()} {currency}
        </p>
      </CardContent>
    </Card>
  );
}

function ChildFeeCard({
  child,
}: {
  child: import('../api/parentFees.api').ParentChildFeeDto;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardContent className="p-0">
        {/* Child Header */}
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-4 text-start hover:bg-hover/50 transition-colors"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary">
              {child.studentName}
            </h3>
            <p className="text-sm text-text-secondary">
              {child.gradeName}
              {child.sectionName ? ` - ${child.sectionName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="text-amber-600 dark:text-amber-400">
                {t('parentFees.outstanding')}: {child.outstandingAmount.toLocaleString()}
              </span>
              <span className="text-green-600 dark:text-green-400">
                {t('parentFees.paid')}: {child.paidAmount.toLocaleString()}
              </span>
              <span className="text-red-600 dark:text-red-400">
                {t('parentFees.overdue')}: {child.overdueAmount.toLocaleString()}
              </span>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-text-muted" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-muted" />
            )}
          </div>
        </button>

        {/* Mini stats on mobile */}
        {expanded && (
          <div className="flex items-center gap-3 px-4 pb-2 text-xs sm:hidden">
            <span className="text-amber-600 dark:text-amber-400">
              {t('parentFees.outstanding')}: {child.outstandingAmount.toLocaleString()}
            </span>
            <span className="text-green-600 dark:text-green-400">
              {t('parentFees.paid')}: {child.paidAmount.toLocaleString()}
            </span>
            <span className="text-red-600 dark:text-red-400">
              {t('parentFees.overdue')}: {child.overdueAmount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Fees Table */}
        {expanded && child.fees.length > 0 && (
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                    {t('parentFees.feeType')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                    {t('parentFees.structureName')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                    {t('parentFees.amount')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                    {t('parentFees.discount')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                    {t('parentFees.remaining')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                    {t('parentFees.dueDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {child.fees.map((fee) => (
                  <tr key={fee.feeInstanceId} className="hover:bg-hover/50 transition-colors">
                    <td className="px-4 py-3.5 text-text-primary">{fee.feeTypeName}</td>
                    <td className="px-4 py-3.5 text-text-secondary">{fee.feeStructureName}</td>
                    <td className="px-4 py-3.5 text-text-secondary">
                      {fee.amount.toLocaleString()} {fee.currency}
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary">
                      {fee.discountAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary">
                      {fee.remainingAmount.toLocaleString()} {fee.currency}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={STATUS_BADGE_VARIANT[fee.status] ?? 'default'}
                        size="sm"
                      >
                        {t(`feeInstances.${fee.status.toLowerCase()}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">{fee.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {expanded && child.fees.length === 0 && (
          <div className="border-t border-border px-4 py-6 text-center text-sm text-text-muted">
            {t('parentFees.noFees')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
