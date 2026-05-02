import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useOrder, ordersApi } from '@/features/orders/api';
import { ROUTES } from '@/config';

type ResultStatus = 'success' | 'cancelled' | 'failed' | 'pending' | 'unknown';

function readStatus(raw: string | null): ResultStatus {
  const v = raw?.toLowerCase() ?? '';
  if (v === 'success' || v === 'paid' || v === 'ok') return 'success';
  if (v === 'cancelled' || v === 'cancel') return 'cancelled';
  if (v === 'failed' || v === 'failure' || v === 'error') return 'failed';
  if (v === 'pending' || v === 'processing') return 'pending';
  return 'unknown';
}

/**
 * Gateway-return landing page.
 *
 * Lifecycle:
 *  1. Parent kicks off a Gateway purchase from the catalog.
 *  2. Gateway redirects back here with `?status=...` (and the order id in the URL).
 *  3. We render success/failure UX + a quick way back to the catalog or orders.
 *
 * The actual confirmation is handled by the gateway webhook, not the redirect —
 * so on `success` we show "We're confirming…" if the order isn't paid yet, and
 * upgrade the message once it flips to Paid (via react-query polling).
 */
export default function ParentPurchaseResultPage() {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const [params] = useSearchParams();
  const queryStatus = readStatus(params.get('status'));

  const { data: order } = useOrder(orderId ?? '');

  // Effective status: gateway redirect tells us the user's path; the order tells
  // us whether the webhook has confirmed the payment yet.
  const orderConfirmed = order?.status === 'Paid';
  const orderCancelled = order?.status === 'Cancelled';

  let resolved: ResultStatus = queryStatus;
  if (queryStatus === 'success' && !orderConfirmed && !orderCancelled) {
    resolved = 'pending';
  }
  if (orderCancelled) resolved = 'cancelled';
  if (orderConfirmed) resolved = 'success';

  const Icon =
    resolved === 'success'
      ? CheckCircle2
      : resolved === 'cancelled'
        ? XCircle
        : resolved === 'failed'
          ? XCircle
          : AlertTriangle;

  const iconColor =
    resolved === 'success'
      ? 'text-green-600'
      : resolved === 'cancelled' || resolved === 'failed'
        ? 'text-red-600'
        : 'text-amber-600';

  const titleKey =
    resolved === 'success'
      ? 'parentProducts.result.successTitle'
      : resolved === 'cancelled'
        ? 'parentProducts.result.cancelledTitle'
        : resolved === 'failed'
          ? 'parentProducts.result.failedTitle'
          : resolved === 'pending'
            ? 'parentProducts.result.pendingTitle'
            : 'parentProducts.result.unknownTitle';

  const descKey =
    resolved === 'success'
      ? 'parentProducts.result.successDesc'
      : resolved === 'cancelled'
        ? 'parentProducts.result.cancelledDesc'
        : resolved === 'failed'
          ? 'parentProducts.result.failedDesc'
          : resolved === 'pending'
            ? 'parentProducts.result.pendingDesc'
            : 'parentProducts.result.unknownDesc';

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <CardContent className="space-y-5 py-8 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-elevated ${iconColor}`}
          >
            <Icon className="h-10 w-10" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-text-primary">{t(titleKey)}</h1>
            <p className="mt-2 text-sm text-text-secondary">{t(descKey)}</p>
          </div>

          {order && (
            <div className="mx-auto inline-flex flex-col items-center gap-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
              <span className="text-text-muted">
                {t('parentProducts.result.receiptLabel')}
              </span>
              <Badge variant="primary" size="md">
                {order.receiptNumber}
              </Badge>
              <span className="mt-1 text-text-secondary">
                {order.totalAmount.toLocaleString()} {order.currency}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {resolved === 'success' && order && (
              <Button
                variant="secondary"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  ordersApi.downloadReceipt(order.id, order.receiptNumber)
                }
              >
                {t('parentProducts.result.downloadReceipt')}
              </Button>
            )}
            {(resolved === 'failed' ||
              resolved === 'cancelled' ||
              resolved === 'unknown') && (
              <Link to={ROUTES.PARENT_PRODUCTS.CATALOG}>
                <Button>{t('parentProducts.result.tryAgain')}</Button>
              </Link>
            )}
            <Link to={ROUTES.PARENT_PRODUCTS.ORDERS}>
              <Button variant={resolved === 'success' ? 'primary' : 'ghost'}>
                {t('parentProducts.result.backToOrders')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
