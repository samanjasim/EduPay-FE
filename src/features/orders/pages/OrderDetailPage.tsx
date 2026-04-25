import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Wallet as WalletIcon,
  CreditCard,
  Coins,
  Receipt,
  Package,
  FileText,
} from 'lucide-react';
import { Card, CardContent, Badge, Spinner } from '@/components/ui';
import { PageHeader, InfoField } from '@/components/common';
import { useOrder } from '../api';
import { ROUTES } from '@/config';
import type {
  OrderStatus,
  OrderType,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderGatewayStatus,
} from '@/types';

const STATUS_BADGE: Record<OrderStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  PartiallyPaid: 'warning',
  Cancelled: 'error',
};

const TYPE_BADGE: Record<OrderType, 'default' | 'success' | 'warning' | 'error'> = {
  Purchase: 'default',
  WalletTopUp: 'success',
  FeePay: 'warning',
  Mixed: 'default',
};

const PAYMENT_STATUS_BADGE: Record<OrderPaymentStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Successful: 'success',
  Failed: 'error',
};

const GATEWAY_STATUS_BADGE: Record<OrderGatewayStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Initiated: 'default',
  Processing: 'warning',
  Successful: 'success',
  Failed: 'error',
  Timeout: 'error',
};

const METHOD_ICON: Record<OrderPaymentMethod, typeof Coins> = {
  Cash: Coins,
  Wallet: WalletIcon,
  Gateway: CreditCard,
};

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return <div className="py-12 text-center text-text-muted">{t('common.noResults')}</div>;
  }

  const isTopUp = order.type === 'WalletTopUp';
  const isFeePay = order.type === 'FeePay';
  const isPurchase = order.type === 'Purchase';

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.receiptNumber}
        subtitle={t('orders.detailSubtitle')}
        backTo={ROUTES.ORDERS.LIST}
        backLabel={t('orders.backToList')}
      />

      {/* Summary */}
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label={t('orders.type')}>
            <Badge variant={TYPE_BADGE[order.type]} size="sm">
              {t(`orders.type${order.type}`)}
            </Badge>
          </InfoField>
          <InfoField label={t('common.status')}>
            <Badge variant={STATUS_BADGE[order.status]} size="sm">
              {t(`orders.${order.status.charAt(0).toLowerCase() + order.status.slice(1)}`)}
            </Badge>
          </InfoField>
          <InfoField label={t('orders.total')}>
            <span className="text-lg font-semibold text-text-primary">
              {order.totalAmount.toLocaleString()} {order.currency}
            </span>
          </InfoField>
          <InfoField label={t('orders.student')}>
            {order.studentName || '—'}
          </InfoField>
          <InfoField label={t('orders.orderedBy')}>
            {order.orderedByUserName || '—'}
          </InfoField>
          <InfoField label={t('orders.createdAt')}>
            {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
          </InfoField>
          {order.paidAt && (
            <InfoField label={t('orders.paidAt')}>
              {format(new Date(order.paidAt), 'MMM d, yyyy HH:mm')}
            </InfoField>
          )}
          {order.expiresAt && (
            <InfoField label={t('orders.expiresAt')}>
              {format(new Date(order.expiresAt), 'MMM d, yyyy HH:mm')}
            </InfoField>
          )}
          <InfoField label={t('orders.idempotencyKey')}>
            <span className="font-mono text-xs">{order.idempotencyKey}</span>
          </InfoField>
        </CardContent>
      </Card>

      {/* Wallet context — shown for top-ups AND for any order that has a wallet linked */}
      {order.wallet && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <WalletIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-text-primary">
                {isTopUp ? t('orders.walletToppedUp') : t('orders.walletUsed')}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoField label={t('orders.walletId')}>
                <Link
                  to={ROUTES.WALLETS.getDetail(order.wallet.walletId)}
                  className="font-mono text-xs text-primary-600 hover:underline"
                >
                  {order.wallet.walletId.slice(0, 8)}…
                </Link>
              </InfoField>
              <InfoField label={t('orders.walletBalance')}>
                {order.wallet.currentBalance.toLocaleString()} {order.wallet.currency}
              </InfoField>
              <InfoField label={t('orders.walletStatus')}>
                <Badge variant="default" size="sm">{order.wallet.status}</Badge>
              </InfoField>
              <InfoField label={t('orders.walletOwner')}>
                <span className="font-mono text-xs">{order.wallet.userId.slice(0, 8)}…</span>
              </InfoField>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items — only meaningful for Purchase / FeePay / Mixed */}
      {!isTopUp && order.items.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              {isPurchase ? (
                <Package className="h-5 w-5 text-primary-600" />
              ) : (
                <FileText className="h-5 w-5 text-primary-600" />
              )}
              <h2 className="text-lg font-semibold text-text-primary">
                {t('orders.items')}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('orders.itemType')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('orders.itemName')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('orders.quantity')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('orders.unitPrice')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                      {t('orders.subtotal')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((it) => {
                    const name = it.itemType === 'Fee' ? it.feeTypeName : it.productName;
                    const targetId = it.itemType === 'Fee' ? it.feeInstanceId : it.productId;
                    const link =
                      it.itemType === 'Fee' && it.feeInstanceId
                        ? ROUTES.FEE_INSTANCES.getDetail(it.feeInstanceId)
                        : null;
                    return (
                      <tr key={it.id}>
                        <td className="px-4 py-3">
                          <Badge variant="default" size="sm">
                            {t(`orders.item${it.itemType}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-text-primary">
                          {link ? (
                            <Link to={link} className="text-primary-600 hover:underline">
                              {name || targetId?.slice(0, 8) + '…'}
                            </Link>
                          ) : (
                            name || <span className="font-mono text-xs">{targetId?.slice(0, 8)}…</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{it.quantity}</td>
                        <td className="px-4 py-3 text-text-secondary">
                          {it.unitPrice.toLocaleString()} {order.currency}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {it.subtotal.toLocaleString()} {order.currency}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments — for every order type */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-text-primary">
              {t('orders.payments')}
            </h2>
          </div>
          {order.payments.length === 0 ? (
            <p className="text-sm text-text-muted">{t('orders.noPayments')}</p>
          ) : (
            <div className="space-y-4">
              {order.payments.map((p) => {
                const Icon = METHOD_ICON[p.method];
                return (
                  <div
                    key={p.id}
                    className="rounded-lg border border-border bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-primary">
                              {t(`orders.method${p.method}`)}
                            </span>
                            <Badge variant={PAYMENT_STATUS_BADGE[p.status]} size="sm">
                              {t(`orders.payStatus${p.status}`)}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            {format(new Date(p.createdAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="text-lg font-semibold text-text-primary">
                          {p.amount.toLocaleString()} {p.currency}
                        </div>
                      </div>
                    </div>

                    {/* Cash-specific */}
                    {p.method === 'Cash' && p.cash && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm border-t border-border pt-3">
                        <InfoField label={t('orders.collectedBy')}>
                          {p.cash.collectedByUserName ||
                            `${p.cash.collectedByUserId.slice(0, 8)}…`}
                        </InfoField>
                        {p.cash.note && (
                          <InfoField label={t('orders.note')}>{p.cash.note}</InfoField>
                        )}
                      </div>
                    )}

                    {/* Gateway-specific */}
                    {p.method === 'Gateway' && p.gatewayAttempts.length > 0 && (
                      <div className="mt-3 border-t border-border pt-3">
                        <h4 className="text-sm font-medium text-text-primary mb-2">
                          {t('orders.gatewayAttempts')}
                        </h4>
                        <div className="space-y-2">
                          {p.gatewayAttempts.map((a) => (
                            <div
                              key={a.id}
                              className="rounded border border-border bg-hover/20 p-3 text-sm"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{a.gateway}</span>
                                  <Badge
                                    variant={GATEWAY_STATUS_BADGE[a.status]}
                                    size="sm"
                                  >
                                    {t(`orders.gwStatus${a.status}`)}
                                  </Badge>
                                </div>
                                <span className="text-xs text-text-muted">
                                  {format(new Date(a.createdAt), 'MMM d, yyyy HH:mm')}
                                </span>
                              </div>
                              {a.transactionRef && (
                                <p className="mt-1 text-xs text-text-secondary font-mono">
                                  {t('orders.txRef')}: {a.transactionRef}
                                </p>
                              )}
                              {a.failureReason && (
                                <p className="mt-1 text-xs text-red-500">
                                  {a.failureReason}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wallet-specific: deep-link to wallet (already surfaced above) */}
                    {p.method === 'Wallet' && order.wallet && (
                      <div className="mt-3 border-t border-border pt-3 text-sm text-text-muted">
                        {t('orders.walletPaymentHint')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hint for fee payments with no items but with fee references */}
      {isFeePay && order.items.length === 0 && (
        <p className="text-sm text-text-muted">{t('orders.noItems')}</p>
      )}
    </div>
  );
}
