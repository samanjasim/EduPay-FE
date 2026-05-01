import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Banknote, ReceiptText, Users, Download } from 'lucide-react';
import { Card, CardContent, Spinner, Input, Badge, Button } from '@/components/ui';
import { PageHeader, EmptyState, InfoField } from '@/components/common';
import { useUIStore } from '@/stores/ui.store';
import { useCashReconciliationReport } from '../api';
import { ordersApi } from '@/features/orders/api';

function formatDateInput(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString()} ${currency}`;
}

export default function SchoolReportsPage() {
  const { t } = useTranslation();
  const activeSchoolId = useUIStore((state) => state.activeSchoolId);
  const today = formatDateInput(new Date());
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const { data: report, isLoading } = useCashReconciliationReport(activeSchoolId ?? undefined, {
    dateFrom,
    dateTo,
  });

  const primaryTotal = report?.totals[0];

  return (
    <div className="space-y-6">
      <PageHeader title={t('schoolPortal.nav.reports')} />

      <Card>
        <CardContent className="grid gap-4 md:grid-cols-[180px_180px_1fr]">
          <Input
            label={t('schoolPortal.reports.dateFrom')}
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
          <Input
            label={t('schoolPortal.reports.dateTo')}
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-3">
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
                    {report.payments.map((payment) => (
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
