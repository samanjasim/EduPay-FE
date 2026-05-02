import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ShoppingCart, Wallet, Package, Calendar, Filter, X } from 'lucide-react';
import { Card, CardContent, Spinner, Input, Select, Button } from '@/components/ui';
import { EmptyState } from '@/components/common';
import { useProductStats, useProductSummaries } from '../api';
import { useGrades } from '@/features/grades/api';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/config';
import { ProductPurchaseStatsCharts } from './ProductPurchaseStatsCharts';
import type { ProductStatsFilters } from '@/types';

/**
 * Stats dashboard powered by GET /ProductPurchases/stats.
 *
 * Layout:
 *  - Filter row (date range, product, grade, payment method).
 *  - Stat cards: revenue per currency (largest), paid orders, units sold.
 *  - Charts (revenue trend + top products + top variants).
 *  - Recent purchases table (last 20).
 */
export function ProductPurchaseStats() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [gradeId, setGradeId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const filters: ProductStatsFilters = useMemo(
    () => ({
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      ...(productId ? { productId } : {}),
      ...(gradeId ? { gradeId } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
    }),
    [dateFrom, dateTo, productId, gradeId, paymentMethod]
  );

  const { data: stats, isLoading, isError } = useProductStats(filters);

  const { data: productsData } = useProductSummaries({
    schoolId: activeSchoolId ?? '',
    pageSize: 200,
  });
  const productsList = productsData?.data ?? [];
  const productOptions = useMemo(
    () => [
      { value: '', label: t('productPurchases.stats.allProducts') },
      ...productsList.map((p) => ({
        value: p.id,
        label: p.nameEn,
      })),
    ],
    [productsList, t]
  );

  const { data: gradesData } = useGrades({ pageSize: 200 });
  const gradeOptions = useMemo(
    () => [
      { value: '', label: t('productPurchases.stats.allGrades') },
      ...((gradesData?.data ?? []).map((g) => ({
        value: g.id,
        label: g.name,
      })) ?? []),
    ],
    [gradesData, t]
  );

  const paymentMethodOptions = [
    { value: '', label: t('productPurchases.stats.allPaymentMethods') },
    { value: 'Cash', label: t('orders.methodCash') },
    { value: 'Wallet', label: t('orders.methodWallet') },
    { value: 'Gateway', label: t('orders.methodGateway') },
  ];

  const filtersActive = !!(
    dateFrom ||
    dateTo ||
    productId ||
    gradeId ||
    paymentMethod
  );

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setProductId('');
    setGradeId('');
    setPaymentMethod('');
  };

  // Revenue cards (one per currency).
  const revenueEntries = useMemo(
    () => Object.entries(stats?.revenueByCurrency ?? {}),
    [stats]
  );

  // Determine a "primary" currency to label the charts with — the highest-grossing
  // one. If everything is empty, fall back to 'IQD' for the placeholder chart axis.
  const chartCurrency = revenueEntries.length
    ? revenueEntries.reduce((acc, cur) => (cur[1] > acc[1] ? cur : acc))[0]
    : 'IQD';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label={t('productPurchases.stats.dateFrom')}
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="sm:max-w-[180px]"
            />
            <Input
              label={t('productPurchases.stats.dateTo')}
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="sm:max-w-[180px]"
            />
            <div className="min-w-[200px] flex-1">
              <p className="mb-1.5 text-sm font-medium text-text-primary">
                {t('productPurchases.stats.product')}
              </p>
              <Select
                options={productOptions}
                value={productId}
                onChange={setProductId}
              />
            </div>
            <div className="min-w-[160px]">
              <p className="mb-1.5 text-sm font-medium text-text-primary">
                {t('productPurchases.stats.grade')}
              </p>
              <Select
                options={gradeOptions}
                value={gradeId}
                onChange={setGradeId}
              />
            </div>
            <div className="min-w-[160px]">
              <p className="mb-1.5 text-sm font-medium text-text-primary">
                {t('productPurchases.stats.paymentMethod')}
              </p>
              <Select
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>
            {filtersActive && (
              <Button
                type="button"
                variant="ghost"
                leftIcon={<X className="h-4 w-4" />}
                onClick={clearFilters}
              >
                {t('productPurchases.stats.clearFilters')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Filter}
          title={t('productPurchases.stats.errorTitle')}
          description={t('productPurchases.stats.errorDesc')}
        />
      ) : !stats ? (
        <EmptyState icon={Package} title={t('productPurchases.stats.emptyTitle')} />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {revenueEntries.length === 0 ? (
              <Card>
                <CardContent className="py-5">
                  <p className="text-xs uppercase tracking-wide text-text-muted">
                    {t('productPurchases.stats.revenue')}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-text-muted">—</p>
                </CardContent>
              </Card>
            ) : (
              revenueEntries.map(([cur, value]) => (
                <Card key={cur}>
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-text-muted">
                          {t('productPurchases.stats.revenueIn', { currency: cur })}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-text-primary">
                          {value.toLocaleString(lang)}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">{cur}</p>
                      </div>
                      <div className="rounded-lg bg-primary-50 p-2 dark:bg-primary-500/10">
                        <Wallet className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            <Card>
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-muted">
                      {t('productPurchases.stats.paidOrders')}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-text-primary">
                      {stats.paidOrderCount.toLocaleString(lang)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-2 dark:bg-green-500/10">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-muted">
                      {t('productPurchases.stats.unitsSoldLabel')}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-text-primary">
                      {stats.unitsSold.toLocaleString(lang)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-500/10">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <ProductPurchaseStatsCharts
            revenueTrend={stats.revenueTrend}
            topProducts={stats.topProductsByRevenue}
            topVariants={stats.topVariantsByUnits}
            currency={chartCurrency}
          />

          {/* Recent purchases */}
          <Card>
            <CardContent className="py-5">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-text-muted" />
                <h3 className="text-base font-semibold text-text-primary">
                  {t('productPurchases.stats.recentPurchasesTitle')}
                </h3>
              </div>
              {stats.recentPurchases.length === 0 ? (
                <p className="py-4 text-center text-sm text-text-muted">
                  {t('productPurchases.noRecent')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                      <tr>
                        <th className="px-3 py-2 text-start">
                          {t('productPurchases.student')}
                        </th>
                        <th className="px-3 py-2 text-start">
                          {t('productPurchases.stats.product')}
                        </th>
                        <th className="px-3 py-2 text-start">
                          {t('productPurchases.amount')}
                        </th>
                        <th className="px-3 py-2 text-start">
                          {t('productPurchases.paidAt')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPurchases.slice(0, 20).map((p) => (
                        <tr key={p.orderId} className="border-b border-border/50">
                          <td className="px-3 py-2 text-text-primary">
                            <Link
                              to={ROUTES.ORDERS.getDetail(p.orderId)}
                              className="hover:underline"
                            >
                              {p.studentName}
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-text-primary">
                            {p.productName}
                          </td>
                          <td className="px-3 py-2 text-text-secondary">
                            {p.amount.toLocaleString(lang)}
                          </td>
                          <td className="px-3 py-2 text-text-secondary">
                            {format(new Date(p.paidAt), 'MMM d, yyyy HH:mm')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
