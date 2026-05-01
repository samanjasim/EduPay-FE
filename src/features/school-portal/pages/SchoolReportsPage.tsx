import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import { Banknote, ReceiptText, Users, Download, CalendarDays, RotateCcw } from 'lucide-react';
import { Card, CardContent, Spinner, Input, Badge, Button, Select, Pagination } from '@/components/ui';
import { PageHeader, EmptyState, InfoField } from '@/components/common';
import { useUIStore } from '@/stores/ui.store';
import { useCashReconciliationReport } from '../api';
import { ordersApi } from '@/features/orders/api';
import type { PaginationMeta } from '@/types';

function formatDateInput(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString()} ${currency}`;
}

const PAGE_SIZE = 10;

export default function SchoolReportsPage() {
  const { t } = useTranslation();
  const activeSchoolId = useUIStore((state) => state.activeSchoolId);
  const today = formatDateInput(new Date());
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [datePreset, setDatePreset] = useState('today');
  const [collectorId, setCollectorId] = useState('');
  const [page, setPage] = useState(1);
  const { data: report, isLoading } = useCashReconciliationReport(activeSchoolId ?? undefined, {
    dateFrom,
    dateTo,
    collectorId: collectorId || undefined,
  });

  const primaryTotal = report?.totals[0];
  const collectorOptions = useMemo(() => {
    const collectors = report?.collectorTotals ?? [];
    const uniqueCollectors = collectors.filter(
      (collector, index, list) =>
        list.findIndex((item) => item.collectedByUserId === collector.collectedByUserId) === index
    );

    return [
      { value: '', label: t('schoolPortal.reports.allCollectors') },
      ...uniqueCollectors.map((collector) => ({
        value: collector.collectedByUserId,
        label: collector.collectedByUserName || collector.collectedByUserId.slice(0, 8),
      })),
    ];
  }, [report?.collectorTotals, t]);
  const payments = report?.payments ?? [];
  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visiblePayments = payments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pagination: PaginationMeta = {
    pageNumber: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
    totalCount: payments.length,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };

  const applyPreset = (preset: string) => {
    setDatePreset(preset);
    setPage(1);
    if (preset === 'today') {
      setDateFrom(today);
      setDateTo(today);
    } else if (preset === 'last7') {
      setDateFrom(formatDateInput(subDays(new Date(), 6)));
      setDateTo(today);
    } else if (preset === 'last30') {
      setDateFrom(formatDateInput(subDays(new Date(), 29)));
      setDateTo(today);
    }
  };

  const resetFilters = () => {
    setCollectorId('');
    applyPreset('today');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('schoolPortal.nav.reports')}
        subtitle={t('schoolPortal.reports.subtitle')}
        actions={
          <Button variant="secondary" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t('schoolPortal.reports.resetFilters')}
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-2">
            <Select
              label={t('schoolPortal.reports.datePreset')}
              value={datePreset}
              onChange={applyPreset}
              options={[
                { value: 'today', label: t('schoolPortal.reports.today') },
                { value: 'last7', label: t('schoolPortal.reports.last7Days') },
                { value: 'last30', label: t('schoolPortal.reports.last30Days') },
                { value: 'custom', label: t('schoolPortal.reports.customRange') },
              ]}
            />
            <Select
              label={t('schoolPortal.reports.collector')}
              value={collectorId}
              onChange={(value) => {
                setCollectorId(value);
                setPage(1);
              }}
              options={collectorOptions}
            />
            <Input
              label={t('schoolPortal.reports.dateFrom')}
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDatePreset('custom');
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
            <Input
              label={t('schoolPortal.reports.dateTo')}
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDatePreset('custom');
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoField label={t('schoolPortal.reports.cashCollected')}>
              <span className="text-lg font-semibold text-text-primary">
                {primaryTotal ? formatMoney(primaryTotal.amount, primaryTotal.currency) : '0'}
              </span>
            </InfoField>
            <InfoField label={t('schoolPortal.reports.payments')}>
              {report?.payments.length ?? 0}
            </InfoField>
            <InfoField label={t('schoolPortal.reports.collectors')}>
              {report?.collectorTotals.length ?? 0}
            </InfoField>
            <InfoField label={t('schoolPortal.reports.range')}>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-text-muted" />
                {dateFrom === dateTo ? dateFrom : `${dateFrom} - ${dateTo}`}
              </span>
            </InfoField>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && report && report.payments.length === 0 && (
        <EmptyState
          icon={Banknote}
          title={t('schoolPortal.reports.noCashPayments')}
          description={t('schoolPortal.reports.noCashPaymentsDesc')}
        />
      )}

      {!isLoading && report && report.payments.length > 0 && (
        <>
          <Card>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-text-primary">
                  {t('schoolPortal.reports.collectorBreakdown')}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.collector')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.payments')}
                      </th>
                      <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.amount')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.collectorTotals.map((collector) => (
                      <tr key={`${collector.collectedByUserId}-${collector.currency}`}>
                        <td className="px-4 py-3 text-text-primary">
                          {collector.collectedByUserName || collector.collectedByUserId.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{collector.count}</td>
                        <td className="px-4 py-3 text-end font-medium text-text-primary">
                          {formatMoney(collector.amount, collector.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-text-primary">
                  {t('schoolPortal.reports.cashPayments')}
                </h2>
                <Badge variant="outline" size="sm">
                  {t('schoolPortal.reports.filteredPayments', { count: payments.length })}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.receipt')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.student')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.collector')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.collectedAt')}
                      </th>
                      <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('schoolPortal.reports.amount')}
                      </th>
                      <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visiblePayments.map((payment) => (
                      <tr key={payment.orderId}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-primary-600">
                            {payment.receiptNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-primary">{payment.studentName}</td>
                        <td className="px-4 py-3 text-text-secondary">
                          {payment.collectedByUserName || payment.collectedByUserId.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {format(new Date(payment.collectedAt), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Badge variant="success" size="sm">
                            {formatMoney(payment.amount, payment.currency)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={t('orders.downloadReceipt')}
                            onClick={() => ordersApi.downloadReceipt(payment.orderId, payment.receiptNumber)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="mt-4 border-t border-border pt-4">
                  <Pagination pagination={pagination} onPageChange={setPage} />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
