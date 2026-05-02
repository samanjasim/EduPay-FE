import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui';
import type {
  DailyRevenuePointDto,
  TopProductDto,
  TopVariantDto,
} from '@/types';

interface ProductPurchaseStatsChartsProps {
  revenueTrend: DailyRevenuePointDto[];
  topProducts: TopProductDto[];
  topVariants: TopVariantDto[];
  /** Currency hint used for labelling — multi-currency is handled by aggregating per day. */
  currency: string;
}

/**
 * Three side-by-side charts for the purchase stats screen:
 *  - Revenue trend (line, daily granularity).
 *  - Top products by revenue (horizontal bar).
 *  - Top variants by units sold (horizontal bar).
 *
 * Each chart degrades to an empty-state message when its dataset is empty so
 * the page never shows a hollow card. Recharts handles RTL well as long as we
 * don't try to flip the axes ourselves.
 */
export function ProductPurchaseStatsCharts({
  revenueTrend,
  topProducts,
  topVariants,
  currency,
}: ProductPurchaseStatsChartsProps) {
  const { t } = useTranslation();

  const trendData = useMemo(
    () =>
      revenueTrend.map((point) => ({
        day: point.day,
        label: format(new Date(point.day), 'MMM d'),
        revenue: point.revenue,
      })),
    [revenueTrend]
  );

  const topProductsData = useMemo(
    () =>
      [...topProducts]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((p) => ({ name: p.nameEn, revenue: p.revenue })),
    [topProducts]
  );

  const topVariantsData = useMemo(
    () =>
      [...topVariants]
        .sort((a, b) => b.units - a.units)
        .slice(0, 10)
        .map((v) => ({ name: v.labelEn, units: v.units })),
    [topVariants]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Revenue trend — full width */}
      <Card className="lg:col-span-2">
        <CardContent className="space-y-3 py-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-semibold text-text-primary">
              {t('productPurchases.charts.revenueTrendTitle')}
            </h3>
            <span className="text-xs text-text-muted">{currency}</span>
          </div>
          {trendData.length === 0 ? (
            <EmptyChart label={t('productPurchases.charts.noTrend')} />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                    tickFormatter={(v: number) => v.toLocaleString()}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: 'rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(v) => [
                      `${Number(v ?? 0).toLocaleString()} ${currency}`,
                      t('productPurchases.charts.revenue'),
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top products by revenue */}
      <Card>
        <CardContent className="space-y-3 py-4">
          <h3 className="text-base font-semibold text-text-primary">
            {t('productPurchases.charts.topProductsTitle')}
          </h3>
          {topProductsData.length === 0 ? (
            <EmptyChart label={t('productPurchases.charts.noProducts')} />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topProductsData}
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                    tickFormatter={(v: number) => v.toLocaleString()}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: 'rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(v) => [
                      `${Number(v ?? 0).toLocaleString()} ${currency}`,
                      t('productPurchases.charts.revenue'),
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top variants by units */}
      <Card>
        <CardContent className="space-y-3 py-4">
          <h3 className="text-base font-semibold text-text-primary">
            {t('productPurchases.charts.topVariantsTitle')}
          </h3>
          {topVariantsData.length === 0 ? (
            <EmptyChart label={t('productPurchases.charts.noVariants')} />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topVariantsData}
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                    tickFormatter={(v: number) => v.toLocaleString()}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: 'rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(v) => [
                      Number(v ?? 0).toLocaleString(),
                      t('productPurchases.charts.units'),
                    ]}
                  />
                  <Bar dataKey="units" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-text-muted">
      {label}
    </div>
  );
}
