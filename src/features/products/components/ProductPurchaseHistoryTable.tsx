import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  Download,
  X,
  Coins,
  Wallet as WalletIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Badge,
  Spinner,
  Input,
  Select,
  Pagination,
  Button,
} from '@/components/ui';
import { EmptyState } from '@/components/common';
import { useDebounce } from '@/hooks';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/config';
import { useOrders, ordersApi } from '@/features/orders/api';
import { CancelOrderButton } from './CancelOrderButton';
import type { OrderListParams, OrderStatus } from '@/types';

const PAGE_SIZE = 15;

const STATUS_BADGE: Record<OrderStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  PartiallyPaid: 'warning',
  Cancelled: 'error',
};

/**
 * Product purchase history table — Type=Purchase orders only.
 *
 * Filters live in a collapsible drawer; the search box and date range stay inline
 * so the common case (find a recent receipt) is one click. The table reuses the
 * shared orders endpoint with `type=Purchase` pinned.
 */
export function ProductPurchaseHistoryTable() {
  const { t } = useTranslation();
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const params: OrderListParams = useMemo(
    () => ({
      type: 'Purchase',
      pageNumber: page,
      pageSize: PAGE_SIZE,
      sortBy: 'paidAt',
      sortDescending: true,
      ...(activeSchoolId ? { schoolId: activeSchoolId } : {}),
      ...(debouncedSearch ? { searchTerm: debouncedSearch } : {}),
      ...(statusFilter ? { status: statusFilter as OrderStatus } : {}),
    }),
    [activeSchoolId, debouncedSearch, statusFilter, page]
  );

  const { data, isLoading } = useOrders(params);
  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const statusOptions = [
    { value: '', label: t('orders.allStatuses') },
    { value: 'Pending', label: t('orders.pending') },
    { value: 'Paid', label: t('orders.paid') },
    { value: 'Cancelled', label: t('orders.cancelled') },
  ];

  const filtersActive = !!(debouncedSearch || statusFilter);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                placeholder={t('productPurchases.history.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              className="sm:max-w-[180px]"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setDrawerOpen((p) => !p)}
            >
              {drawerOpen
                ? t('productPurchases.history.hideFilters')
                : t('productPurchases.history.moreFilters')}
            </Button>
            {filtersActive && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                leftIcon={<X className="h-4 w-4" />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPage(1);
                }}
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>

          {/* Collapsible advanced filters drawer.
              These filter keys aren't all wired server-side yet — the orders
              endpoint will accept them once the BE catches up; until then the
              fields are surfaced for visual parity with the spec and quietly
              ignored. */}
          {drawerOpen && (
            <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label={t('productPurchases.history.dateFrom')}
                type="date"
                disabled
                hint={t('productPurchases.history.filterComingSoon')}
              />
              <Input
                label={t('productPurchases.history.dateTo')}
                type="date"
                disabled
                hint={t('productPurchases.history.filterComingSoon')}
              />
              <Input
                label={t('productPurchases.history.studentNameLabel')}
                placeholder={t('productPurchases.history.studentNamePlaceholder')}
                disabled
                hint={t('productPurchases.history.filterComingSoon')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t('productPurchases.history.emptyTitle')}
          description={
            filtersActive
              ? t('productPurchases.history.emptyFilteredDesc')
              : t('productPurchases.history.emptyDesc')
          }
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <Th>{t('productPurchases.history.colReceipt')}</Th>
                      <Th>{t('productPurchases.history.colStudent')}</Th>
                      <Th>{t('productPurchases.history.colAmount')}</Th>
                      <Th>{t('productPurchases.history.colMethod')}</Th>
                      <Th>{t('productPurchases.history.colStatus')}</Th>
                      <Th>{t('productPurchases.history.colPaidAt')}</Th>
                      <Th>{t('common.actions')}</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <Link
                            to={ROUTES.ORDERS.getDetail(o.id)}
                            className="font-mono text-xs text-primary-600 hover:underline"
                          >
                            {o.receiptNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-text-primary">
                          {o.studentName}
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {o.totalAmount.toLocaleString()} {o.currency}
                        </td>
                        <td className="px-4 py-3.5">
                          <MethodIndicator order={o} />
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={STATUS_BADGE[o.status]} size="sm">
                            {t(
                              `orders.${o.status.charAt(0).toLowerCase() + o.status.slice(1)}`
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-text-muted text-xs whitespace-nowrap">
                          {o.paidAt
                            ? format(new Date(o.paidAt), 'MMM d, yyyy HH:mm')
                            : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              leftIcon={<Download className="h-4 w-4" />}
                              onClick={() =>
                                ordersApi.downloadReceipt(o.id, o.receiptNumber)
                              }
                            >
                              {t('productPurchases.history.receiptShort')}
                            </Button>
                            <CancelOrderButton order={o} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
      {children}
    </th>
  );
}

function MethodIndicator({
  order,
}: {
  order: { walletId: string | null };
}) {
  // We don't have payment method on the summary DTO — best-effort guess.
  // Wallet-linked orders surface the wallet id; otherwise default to cash icon
  // (gateway purchases get a "card" badge once BE plumbs the field).
  const { t } = useTranslation();
  if (order.walletId) {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-secondary">
        <WalletIcon className="h-4 w-4" />
        <span>{t('orders.methodWallet')}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-text-secondary">
      <Coins className="h-4 w-4" />
      <span>{t('orders.methodCash')}</span>
    </span>
  );
}

