import { useTranslation } from 'react-i18next';
import { Package, Image as ImageIcon, Download } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { InfoField } from '@/components/common';
import { CancelOrderButton } from '@/features/products/components/CancelOrderButton';
import { ordersApi } from '../api';
import type { OrderDetailDto } from '@/types';

interface OrderDetailPurchaseSectionProps {
  order: OrderDetailDto;
}

/**
 * Purchase-specific block on the order detail page.
 *
 * Renders:
 *  - Item snapshot (product name, variant label, qty, image if available).
 *  - Audit row from `order.purchase` (payer, recordedBy, source, note).
 *  - Receipt download button + smart cancel/void.
 *
 * Only invoked when `order.type === 'Purchase'`. Falls back gracefully when
 * `order.purchase` is null (e.g. legacy orders that pre-date the Purchase loop).
 */
export function OrderDetailPurchaseSection({ order }: OrderDetailPurchaseSectionProps) {
  const { t } = useTranslation();
  const purchase = order.purchase;

  // The first product item drives the snapshot — purchase orders today are
  // single-item by design, but the array is kept for forward compatibility.
  const item = order.items.find((i) => i.itemType === 'Product');

  return (
    <Card>
      <CardContent className="space-y-5 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-text-primary">
              {t('orderDetail.purchase.title')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => ordersApi.downloadReceipt(order.id, order.receiptNumber)}
            >
              {t('orderDetail.purchase.downloadReceipt')}
            </Button>
            <CancelOrderButton order={order} />
          </div>
        </div>

        {/* Item snapshot */}
        {item && (
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-elevated">
              {/* The receipt-snapshot doesn't carry an image URL today; we fall
                  back to a placeholder. When BE adds productImageFileId on the
                  OrderItem we'll swap this for a real <img>. */}
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-10 w-10 text-text-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-text-primary">
                {item.productName ?? '—'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <Badge variant="outline" size="sm">
                  {t('orderDetail.purchase.quantityShort')}: {item.quantity}
                </Badge>
                <Badge variant="outline" size="sm">
                  {t('orderDetail.purchase.unitPriceShort')}:{' '}
                  {item.unitPrice.toLocaleString()} {order.currency}
                </Badge>
                <Badge variant="primary" size="sm">
                  {t('orderDetail.purchase.subtotalShort')}:{' '}
                  {item.subtotal.toLocaleString()} {order.currency}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Audit row */}
        {purchase && (
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label={t('orderDetail.purchase.payer')}>
              <div className="space-y-0.5">
                <div className="font-medium text-text-primary">
                  {purchase.paidByUserName ||
                    (purchase.paidByUserId
                      ? `${purchase.paidByUserId.slice(0, 8)}…`
                      : '—')}
                </div>
                <Badge variant="outline" size="sm">
                  {t(`orderDetail.purchase.payer${purchase.paidByType}`, {
                    defaultValue: purchase.paidByType,
                  })}
                </Badge>
              </div>
            </InfoField>
            <InfoField label={t('orderDetail.purchase.recordedBy')}>
              {purchase.recordedByUserName ??
                `${purchase.recordedByUserId.slice(0, 8)}…`}
            </InfoField>
            <InfoField label={t('orderDetail.purchase.source')}>
              <Badge variant="outline" size="sm">
                {t(`orderDetail.purchase.source${purchase.purchaseSource}`, {
                  defaultValue: purchase.purchaseSource,
                })}
              </Badge>
            </InfoField>
            <InfoField label={t('orderDetail.purchase.paymentSource')}>
              <Badge variant="outline" size="sm">
                {t(`orderDetail.purchase.paymentSource${purchase.paymentSource}`, {
                  defaultValue: purchase.paymentSource,
                })}
              </Badge>
            </InfoField>
            {purchase.note && (
              <div className="sm:col-span-2 lg:col-span-3">
                <InfoField label={t('orderDetail.purchase.note')}>
                  <p className="whitespace-pre-wrap text-text-secondary">
                    {purchase.note}
                  </p>
                </InfoField>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
