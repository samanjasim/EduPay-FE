import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Banknote, Eye, Receipt, Search, AlertTriangle, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge, Button, Card, Input, Pagination, Select, Spinner } from '@/components/ui';
import { EmptyState, PageHeader } from '@/components/common';
import { PayWithCashModal } from '@/features/fees/components/PayWithCashModal';
import { useFeeInstances } from '@/features/fees/api';
import { useSchoolContext } from '../hooks/useSchoolContext';
import { ROUTES } from '@/config';
import { PERMISSIONS } from '@/constants';
import { useDebounce, usePermissions } from '@/hooks';
import { cn } from '@/utils';
import type { FeeInstanceListParams, FeeInstanceStatus, FeeInstanceSummaryDto } from '@/types';

const PAGE_SIZE = 12;

const STATUS_BADGE_VARIANT: Record<FeeInstanceStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'error',
  Waived: 'default',
  Cancelled: 'default',
};

export default function SchoolCashCollectionPage() {
  const { t } = useTranslation();
  const { schoolId } = useSchoolContext();
  const { hasPermission } = usePermissions();
  const [status, setStatus] = useState<Extract<FeeInstanceStatus, 'Pending' | 'Overdue'>>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedFee, setSelectedFee] = useState<FeeInstanceSummaryDto | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const canRecordCash = hasPermission(PERMISSIONS.CashCollections.Create);

  const params: FeeInstanceListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    status,
    searchTerm: debouncedSearch || undefined,
    sortBy: status === 'Overdue' ? 'dueDate' : undefined,
  };

  const { data, isLoading, isFetching } = useFeeInstances(params);
  const fees = data?.data ?? [];
  const pagination = data?.pagination;
  const queueCount = pagination?.totalCount ?? 0;
  const queueAmount = fees.reduce((sum, fee) => sum + fee.remainingAmount, 0);

  const statusOptions = [
    { value: 'Pending', label: t('schoolPortal.cashCollection.pending') },
    { value: 'Overdue', label: t('schoolPortal.cashCollection.overdue') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('schoolPortal.cashCollection.title')}
        subtitle={t('schoolPortal.cashCollection.subtitle')}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <QueueStat
          icon={status === 'Overdue' ? AlertTriangle : Clock}
          label={status === 'Overdue' ? t('schoolPortal.cashCollection.overdueQueue') : t('schoolPortal.cashCollection.pendingQueue')}
          value={queueCount.toLocaleString()}
          tone={status === 'Overdue' ? 'red' : 'amber'}
        />
        <QueueStat
          icon={Banknote}
          label={t('schoolPortal.cashCollection.visibleOutstanding')}
          value={queueAmount.toLocaleString()}
          tone="emerald"
        />
        <QueueStat
          icon={Receipt}
          label={t('schoolPortal.cashCollection.visibleFees')}
          value={fees.length.toLocaleString()}
          tone="blue"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted ltr:left-3 rtl:right-3" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder={t('schoolPortal.cashCollection.searchPlaceholder')}
              className="ltr:pl-9 rtl:pr-9"
            />
          </div>
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value as Extract<FeeInstanceStatus, 'Pending' | 'Overdue'>);
              setPage(1);
            }}
            options={statusOptions}
            className="w-full lg:w-44"
          />
          <Link to={ROUTES.SCHOOL.REPORTS}>
            <Button variant="secondary" className="w-full lg:w-auto">
              {t('schoolPortal.cashCollection.viewReport')}
            </Button>
          </Link>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : fees.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t('schoolPortal.cashCollection.emptyTitle')}
          description={t('schoolPortal.cashCollection.emptyDescription')}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.student')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.feeStructure')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.dueDate')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.remaining')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className={cn(isFetching && 'opacity-70')}>
                {fees.map((fee) => (
                  <tr key={fee.id} className="border-b border-border transition-colors last:border-0 hover:bg-hover">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{fee.studentName}</div>
                      <div className="text-xs text-text-muted">{fee.feeTypeName}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{fee.feeStructureName}</td>
                    <td className="px-4 py-3 text-text-secondary">{fee.dueDate}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {fee.remainingAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE_VARIANT[fee.status]} size="sm">
                        {t(`feeInstances.${fee.status.toLowerCase()}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {canRecordCash && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedFee(fee)}
                            leftIcon={<Banknote className="h-4 w-4" />}
                          >
                            {t('schoolPortal.cashCollection.collect')}
                          </Button>
                        )}
                        <Link to={ROUTES.SCHOOL.FEE_INSTANCES.getDetail(fee.id)}>
                          <Button variant="ghost" size="sm" title={t('common.view')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border p-4">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}

      {selectedFee && schoolId && (
        <PayWithCashModal
          isOpen={!!selectedFee}
          onClose={() => setSelectedFee(null)}
          feeInstanceId={selectedFee.id}
          schoolId={schoolId}
          feeTypeName={selectedFee.feeTypeName}
          remainingAmount={selectedFee.remainingAmount}
        />
      )}
    </div>
  );
}

function QueueStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: 'amber' | 'blue' | 'emerald' | 'red';
}) {
  const toneClasses = {
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  };

  return (
    <div className={cn('rounded-lg border p-4', toneClasses[tone])}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          <p className="mt-0.5 text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
