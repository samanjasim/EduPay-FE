import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Receipt, Download, ShoppingBag } from 'lucide-react';
import {
  Card,
  CardContent,
  Spinner,
  Badge,
  Button,
  Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useParentProductOrders } from '@/features/products/api';
import { CancelOrderButton } from '@/features/products/components/CancelOrderButton';
import { ordersApi } from '@/features/orders/api';
import { ROUTES } from '@/config';
import type { OrderSummaryDto, OrderStatus } from '@/types';

const PAGE_SIZE = 15;

const STATUS_BADGE: Record<OrderStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  PartiallyPaid: 'warning',
  Cancelled: 'error',
};

export default function ParentProductOrdersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useParentProductOrders({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });
  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  // Group rows by child for the requested grouped view.
  const groupedByChild = useMemo(() => {
    const groups = new Map<string, OrderSummaryDto[]>();
    for (const o of orders) {
      const key = o.studentName || t('parentProducts.unknownChild');
      const list = groups.get(key) ?? [];
      list.push(o);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [orders, t]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('parentProducts.orders.title')}
        subtitle={t('parentProducts.orders.subtitle')}
        actions={
          <Link to={ROUTES.PARENT_PRODUCTS.CATALOG}>
            <Button variant="secondary">
              {t('parentProducts.orders.browseCatalog')}
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t('parentProducts.orders.emptyTitle')}
          description={t('parentProducts.orders.emptyDesc')}
          action={{
            label: t('parentProducts.orders.browseCatalog'),
            onClick: () => {
              window.location.assign(ROUTES.PARENT_PRODUCTS.CATALOG);
            },
          }}
        />
      ) : (
        <>
          {groupedByChild.map(([childName, list]) => (
            <Card key={childName}>
              <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <Receipt className="h-4 w-4 text-primary-600" />
                  <h2 className="font-semibold text-text-primary">{childName}</h2>
                  <span className="text-xs text-text-muted">
                    ({list.length} {t('parentProducts.orders.ordersCount')})
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('parentProducts.orders.colReceipt')}
                        </th>
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('parentProducts.orders.colTotal')}
                        </th>
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('parentProducts.orders.colStatus')}
                        </th>
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('parentProducts.orders.colCreatedAt')}
                        </th>
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('common.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {list.map((o) => (
                        <tr key={o.id} className="hover:bg-hover/50 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              to={ROUTES.ORDERS.getDetail(o.id)}
                              className="font-mono text-xs text-primary-600 hover:underline"
                            >
                              {o.receiptNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {o.totalAmount.toLocaleString()} {o.currency}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_BADGE[o.status]} size="sm">
                              {t(
                                `orders.${o.status.charAt(0).toLowerCase() + o.status.slice(1)}`
                              )}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                            {format(new Date(o.createdAt), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {o.status === 'Paid' && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Download className="h-4 w-4" />}
                                  onClick={() =>
                                    ordersApi.downloadReceipt(o.id, o.receiptNumber)
                                  }
                                >
                                  {t('parentProducts.orders.receipt')}
                                </Button>
                              )}
                              <CancelOrderButton order={o} parentScope />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
